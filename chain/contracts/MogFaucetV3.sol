// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IMogToken {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transferOwnership(address next) external;
}

/**
 * MogFaucetV3 — ETH top-up + FLUENT drip with a per-wallet cooldown.
 *
 * Why a contract instead of the official Fluent faucet: the official one is
 * gated behind a builder-portal login, so an in-app player can't use it. This
 * pool is funded once by the deployer and drips to any connected address.
 *
 * Funds model:
 *  - the token's entire 1B supply is minted once at deploy, then held here, so
 *    the faucet pays FLUENT out of its own balance (no mint rights needed and
 *    no way to exceed the cap).
 *
 * Abuse model:
 *  - ETH half: one claim per address, ever (the scarce resource).
 *  - FLUENT half: repeatable every `cooldown` seconds (12 h by default), so a
 *    player who lost their balance can come back without a new wallet.
 *  - owner can pause, top up, resize the drip/cooldown, or withdraw ETH.
 */
contract MogFaucetV3 {
    address public owner;
    uint256 public dripAmount;          // wei of ETH per first claim
    uint256 public tokenDripAmount;     // FLUENT units per request
    uint256 public cooldown;            // seconds between FLUENT requests
    bool public paused;

    IMogToken public token;

    mapping(address => bool) public claimed;
    mapping(address => uint256) public lastRequestAt;   // 0 = never
    uint256 public claimCount;

    event Claimed(address indexed account, uint256 ethAmount, uint256 tokenAmount);
    event TokensRefilled(address indexed account, uint256 tokenAmount, uint256 nextAt);
    event Funded(address indexed from, uint256 amount);
    event DripUpdated(uint256 ethAmount, uint256 tokenAmount, uint256 cooldown);
    event PausedSet(bool paused);
    event OwnerWithdraw(address indexed to, uint256 amount);
    event OwnershipTransferred(address indexed from, address indexed to);

    error NotOwner();
    error IsPaused();
    error AlreadyClaimed();
    error EmptyPool();
    error NotClaimedYet();
    error TransferFailed();
    error CooldownActive(uint256 nextAt);
    error TokenPoolEmpty(uint256 have, uint256 want);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    function _payTokens(address to) private {
        if (tokenDripAmount == 0) return;
        uint256 have = token.balanceOf(address(this));
        if (have < tokenDripAmount) revert TokenPoolEmpty(have, tokenDripAmount);
        if (!token.transfer(to, tokenDripAmount)) revert TransferFailed();
    }

    constructor(address token_, uint256 dripAmount_, uint256 tokenDripAmount_, uint256 cooldown_) {
        owner = msg.sender;
        token = IMogToken(token_);
        dripAmount = dripAmount_;
        tokenDripAmount = tokenDripAmount_;
        cooldown = cooldown_;
    }

    /// @notice First-time onboard: testnet ETH once + the first FLUENT request.
    function claim() external {
        if (paused) revert IsPaused();
        if (claimed[msg.sender]) revert AlreadyClaimed();
        if (address(this).balance < dripAmount) revert EmptyPool();

        claimed[msg.sender] = true;
        lastRequestAt[msg.sender] = block.timestamp;
        claimCount += 1;

        uint256 ethOut = dripAmount;
        _payTokens(msg.sender);

        (bool ok, ) = msg.sender.call{value: ethOut}("");
        if (!ok) revert TransferFailed();

        emit Claimed(msg.sender, ethOut, tokenDripAmount);
    }

    /// @notice Owner pays the gas so a brand-new wallet with zero ETH can still
    /// be onboarded, and gets the same first-claim rules.
    function claimFor(address payable account) external onlyOwner {
        if (paused) revert IsPaused();
        if (account == address(0)) revert TransferFailed();
        if (claimed[account]) revert AlreadyClaimed();
        if (address(this).balance < dripAmount) revert EmptyPool();

        claimed[account] = true;
        lastRequestAt[account] = block.timestamp;
        claimCount += 1;

        uint256 ethOut = dripAmount;
        _payTokens(account);

        (bool ok, ) = account.call{value: ethOut}("");
        if (!ok) revert TransferFailed();

        emit Claimed(account, ethOut, tokenDripAmount);
    }

    /// @notice Repeatable FLUENT-only request, gated by `cooldown`.
    /// @dev ETH is never re-issued — only the trade balance.
    function refillTokens() external {
        if (paused) revert IsPaused();
        if (!claimed[msg.sender]) revert NotClaimedYet();
        if (tokenDripAmount == 0) revert EmptyPool();

        uint256 last = lastRequestAt[msg.sender];
        uint256 nextAt = last + cooldown;
        if (last != 0 && block.timestamp < nextAt) revert CooldownActive(nextAt);

        lastRequestAt[msg.sender] = block.timestamp;
        _payTokens(msg.sender);

        emit TokensRefilled(msg.sender, tokenDripAmount, block.timestamp + cooldown);
    }

    /* ---------------------------------------------------------------- views */

    function canClaim(address account) external view returns (bool) {
        return !paused && !claimed[account] && address(this).balance >= dripAmount;
    }

    /// @notice Seconds until `account` may request FLUENT again (0 = ready).
    function cooldownRemaining(address account) external view returns (uint256) {
        uint256 last = lastRequestAt[account];
        if (last == 0) return 0;
        uint256 nextAt = last + cooldown;
        if (block.timestamp >= nextAt) return 0;
        return nextAt - block.timestamp;
    }

    function canRefill(address account) external view returns (bool) {
        if (paused || tokenDripAmount == 0 || !claimed[account]) return false;
        if (token.balanceOf(address(this)) < tokenDripAmount) return false;
        uint256 last = lastRequestAt[account];
        return last == 0 || block.timestamp >= last + cooldown;
    }

    function tokenPoolBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function poolBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /* ---------------------------------------------------------------- admin */

    function fund() external payable {
        emit Funded(msg.sender, msg.value);
    }

    receive() external payable {
        emit Funded(msg.sender, msg.value);
    }

    function setDrip(uint256 ethAmount, uint256 tokenAmount, uint256 cooldownSeconds) external onlyOwner {
        dripAmount = ethAmount;
        tokenDripAmount = tokenAmount;
        cooldown = cooldownSeconds;
        emit DripUpdated(ethAmount, tokenAmount, cooldownSeconds);
    }

    function setPaused(bool value) external onlyOwner {
        paused = value;
        emit PausedSet(value);
    }

    function withdrawAll(address payable to) external onlyOwner {
        uint256 bal = address(this).balance;
        (bool ok, ) = to.call{value: bal}("");
        if (!ok) revert TransferFailed();
        emit OwnerWithdraw(to, bal);
    }

    function transferOwnership(address next) external onlyOwner {
        require(next != address(0), "zero owner");
        emit OwnershipTransferred(owner, next);
        owner = next;
    }
}
