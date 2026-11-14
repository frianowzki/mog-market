// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * MOG MARKET — paper reputational trading, settled onchain.
 *
 * Every Motion-leaderboard creator is a tradable share class. Price is
 * 1000 / rank (in wei-scaled units), so a rank move *is* a price move —
 * no order book, no AMM, no slippage curve to reason about.
 *
 * Design notes:
 *  - Shares are integer units. `buy` spends the whole msg.value at the
 *    current price; leftover dust is refunded rather than kept.
 *  - `syncBoard` is owner-only and idempotent: it writes the latest rank
 *    for each creator. Price is always derived from rank, never stored,
 *    so a stale price cannot exist.
 *  - Sell returns (units * currentPrice) — the game is long-only on rank.
 *  - The contract holds no protocol fee. Treasury is just the owner.
 *  - Reverts instead of silently no-ops so the UI can show a real error.
 */
contract MogMarket {
    struct Creator {
        string name;
        uint16 rank;        // 1-based, 0 = not registered
        int16 delta;        // rank change over the last snapshot window
        bool exists;
    }

    address public owner;
    uint256 public constant START_CASH = 1000 ether;
    uint256 public constant BASE_PRICE = 1000 ether;

    mapping(bytes32 => Creator) private _creators;        // keccak(name) => creator
    bytes32[] private _creatorIds;
    mapping(address => mapping(bytes32 => uint256)) private _units;   // holder => id => units
    mapping(address => uint256) public cash;              // remaining paper cash
    mapping(address => bool) public enrolled;

    uint256 public snapshotCount;
    uint256 public lastSnapshotAt;

    event Enrolled(address indexed account, uint256 grant);
    event BoardSynced(uint256 indexed snapshot, uint256 creators);
    event Bought(address indexed account, bytes32 indexed id, uint256 units, uint256 cost);
    event Sold(address indexed account, bytes32 indexed id, uint256 units, uint256 proceeds);
    event CreatorRegistered(bytes32 indexed id, string name, uint16 rank);

    error NotOwner();
    error NotEnrolled();
    error UnknownCreator();
    error InsufficientCash(uint256 have, uint256 need);
    error InsufficientUnits(uint256 have, uint256 want);
    error AlreadyEnrolled();
    error BadRank();
    error EmptyBoard();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /* ------------------------------------------------------------------ admin */

    /// @notice Register or update one creator. rank must be >= 1.
    function registerCreator(string calldata name, uint16 rank, int16 delta) external onlyOwner {
        if (rank == 0) revert BadRank();
        bytes32 id = keccak256(bytes(name));
        if (!_creators[id].exists) {
            _creatorIds.push(id);
            emit CreatorRegistered(id, name, rank);
        }
        _creators[id] = Creator({name: name, rank: rank, delta: delta, exists: true});
    }

    /// @notice Bulk-sync a whole board snapshot in one tx. Cheap because rank is
    /// the only moving part and we never touch per-holder storage here.
    function syncBoard(bytes32[] calldata ids, uint16[] calldata ranks, int16[] calldata deltas)
        external
        onlyOwner
    {
        uint256 n = ids.length;
        if (n == 0) revert EmptyBoard();
        require(ranks.length == n && deltas.length == n, "length mismatch");
        for (uint256 i; i < n; ++i) {
            if (ranks[i] == 0) revert BadRank();
            Creator storage c = _creators[ids[i]];
            c.rank = ranks[i];
            c.delta = deltas[i];
            if (!c.exists) {
                c.exists = true;
                _creatorIds.push(ids[i]);
            }
        }
        unchecked { ++snapshotCount; }
        lastSnapshotAt = block.timestamp;
        emit BoardSynced(snapshotCount, n);
    }

    /* --------------------------------------------------------------- players */

    /// @notice One-time enrolment that hands out the 1000-paper-dollar stack.
    function enroll() external {
        if (enrolled[msg.sender]) revert AlreadyEnrolled();
        enrolled[msg.sender] = true;
        cash[msg.sender] = START_CASH;
        emit Enrolled(msg.sender, START_CASH);
    }

    /// @notice Buy whole units of a creator at the current rank price.
    /// @dev msg.value must cover the cost; excess is refunded in the same tx.
    function buy(bytes32 id, uint256 units) external payable {
        if (!enrolled[msg.sender]) revert NotEnrolled();
        Creator storage c = _creators[id];
        if (!c.exists) revert UnknownCreator();
        if (units == 0) revert InsufficientUnits(0, 1);

        uint256 cost = units * priceOf(id);
        if (cash[msg.sender] < cost) revert InsufficientCash(cash[msg.sender], cost);
        if (msg.value < cost) revert InsufficientCash(msg.value, cost);

        cash[msg.sender] -= cost;
        _units[msg.sender][id] += units;

        uint256 refund = msg.value - cost;
        if (refund > 0) {
            (bool ok, ) = msg.sender.call{value: refund}("");
            require(ok, "refund failed");
        }
        emit Bought(msg.sender, id, units, cost);
    }

    /// @notice Sell units back at the current rank price.
    function sell(bytes32 id, uint256 units) external {
        if (!enrolled[msg.sender]) revert NotEnrolled();
        uint256 held = _units[msg.sender][id];
        if (units == 0 || held < units) revert InsufficientUnits(held, units);

        uint256 proceeds = units * priceOf(id);
        _units[msg.sender][id] = held - units;
        cash[msg.sender] += proceeds;
        emit Sold(msg.sender, id, units, proceeds);
    }

    /// @notice Withdraw the paper balance as real testnet ETH held by the contract.
    /// @dev Only works if the contract was funded; otherwise it's a real revert,
    /// which is the honest behaviour for a testnet game.
    function withdraw(uint256 amount) external {
        if (!enrolled[msg.sender]) revert NotEnrolled();
        if (cash[msg.sender] < amount) revert InsufficientCash(cash[msg.sender], amount);
        cash[msg.sender] -= amount;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "withdraw failed");
    }

    /* ----------------------------------------------------------------- views */

    function priceOf(bytes32 id) public view returns (uint256) {
        Creator storage c = _creators[id];
        if (!c.exists) revert UnknownCreator();
        return BASE_PRICE / c.rank;
    }

    function creatorOf(bytes32 id) external view returns (Creator memory) {
        return _creators[id];
    }

    function unitsOf(address account, bytes32 id) external view returns (uint256) {
        return _units[account][id];
    }

    /// @notice Equity = cash + sum(units * price). Single call so the UI never
    /// has to fan out N requests just to render the nav bar.
    function equityOf(address account) external view returns (uint256) {
        uint256 total = cash[account];
        uint256 n = _creatorIds.length;
        for (uint256 i; i < n; ++i) {
            bytes32 id = _creatorIds[i];
            uint256 u = _units[account][id];
            if (u == 0) continue;
            Creator storage c = _creators[id];
            if (c.exists) total += u * (BASE_PRICE / c.rank);
        }
        return total;
    }

    function creatorCount() external view returns (uint256) {
        return _creatorIds.length;
    }

    function creatorIdAt(uint256 index) external view returns (bytes32) {
        return _creatorIds[index];
    }
}
