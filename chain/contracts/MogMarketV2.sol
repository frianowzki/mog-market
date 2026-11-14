// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IFluentToken {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * MogMarketV2 — reputational trading, settled in FLUENT.
 *
 * Same board as v1 (price = 1000 / rank), different money: the trade currency
 * is the FLUENT ERC20 handed out by MogFaucet instead of a paper ledger.
 * Native ETH is only ever used by the player to pay gas.
 *
 * Money model:
 *  - `buy` pulls FLUENT straight from the player's wallet via allowance; the
 *    player must approve first. Nothing is deposited or custodied.
 *  - `sell` pays FLUENT back in the same tx.
 *  - The contract keeps zero FLUENT between transactions, so there is no
 *    solvency question to reason about.
 */
contract MogMarketV2 {
    struct Creator {
        string name;
        uint16 rank;        // 1-based, 0 = not registered
        int16 delta;        // rank change over the last snapshot window
        bool exists;
    }

    address public owner;
    IFluentToken public immutable fluent;
    uint256 public constant BASE_PRICE = 1000 ether;

    mapping(bytes32 => Creator) private _creators;        // keccak(name) => creator
    bytes32[] private _creatorIds;
    mapping(address => mapping(bytes32 => uint256)) private _units;   // holder => id => units
    mapping(address => bool) public traded;

    uint256 public snapshotCount;
    uint256 public lastSnapshotAt;

    event BoardSynced(uint256 indexed snapshot, uint256 creators);
    event Bought(address indexed account, bytes32 indexed id, uint256 units, uint256 cost);
    event Sold(address indexed account, bytes32 indexed id, uint256 units, uint256 proceeds);
    event CreatorRegistered(bytes32 indexed id, string name, uint16 rank);

    error NotOwner();
    error UnknownCreator();
    error InsufficientUnits(uint256 have, uint256 want);
    error InsufficientFluent(uint256 have, uint256 need);
    error BadRank();
    error EmptyBoard();
    error FluentTransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address fluent_) {
        require(fluent_ != address(0), "zero token");
        owner = msg.sender;
        fluent = IFluentToken(fluent_);
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

    /// @notice Bulk-sync a whole board snapshot in one tx. Rank is the only
    /// moving part and no per-holder storage is touched, so this stays cheap.
    /// @dev names come along so a seed can register creators in one pass —
    /// without them the board would render blank tickers.
    function syncBoard(
        bytes32[] calldata ids,
        string[] calldata names,
        uint16[] calldata ranks,
        int16[] calldata deltas
    ) external onlyOwner {
        uint256 n = ids.length;
        if (n == 0) revert EmptyBoard();
        require(names.length == n && ranks.length == n && deltas.length == n, "length mismatch");
        for (uint256 i; i < n; ++i) {
            if (ranks[i] == 0) revert BadRank();
            Creator storage c = _creators[ids[i]];
            bool fresh = !c.exists;
            c.name = names[i];
            c.rank = ranks[i];
            c.delta = deltas[i];
            if (fresh) {
                c.exists = true;
                _creatorIds.push(ids[i]);
                emit CreatorRegistered(ids[i], names[i], ranks[i]);
            }
        }
        unchecked { ++snapshotCount; }
        lastSnapshotAt = block.timestamp;
        emit BoardSynced(snapshotCount, n);
    }

    /* --------------------------------------------------------------- players */

    /// @notice Buy whole units of a creator at the current rank price.
    /// @dev Requires a FLUENT allowance >= units * priceOf(id). Money moves
    /// player -> contract in the same tx; nothing is held afterwards.
    function buy(bytes32 id, uint256 units) external {
        Creator storage c = _creators[id];
        if (!c.exists) revert UnknownCreator();
        if (units == 0) revert InsufficientUnits(0, 1);

        uint256 cost = units * (BASE_PRICE / c.rank);
        uint256 bal = fluent.balanceOf(msg.sender);
        if (bal < cost) revert InsufficientFluent(bal, cost);

        traded[msg.sender] = true;
        _units[msg.sender][id] += units;

        if (!fluent.transferFrom(msg.sender, address(this), cost)) revert FluentTransferFailed();
        emit Bought(msg.sender, id, units, cost);
    }

    /// @notice Sell units back at the current rank price; FLUENT lands instantly.
    function sell(bytes32 id, uint256 units) external {
        uint256 held = _units[msg.sender][id];
        if (units == 0 || held < units) revert InsufficientUnits(held, units);

        uint256 proceeds = units * priceOf(id);
        _units[msg.sender][id] = held - units;

        if (!fluent.transfer(msg.sender, proceeds)) revert FluentTransferFailed();
        emit Sold(msg.sender, id, units, proceeds);
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

    /// @notice Equity = FLUENT balance + sum(units * price). Single call so the
    /// UI never has to fan out N requests just to render the nav bar.
    function equityOf(address account) external view returns (uint256) {
        uint256 total = fluent.balanceOf(account);
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
