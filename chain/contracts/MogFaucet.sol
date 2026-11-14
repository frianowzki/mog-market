// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IMogToken {
    function mint(address to, uint256 amount) external;
    function transferOwnership(address next) external;
}

/**
 * MogFaucet — one shared pool that hands out testnet ETH plus game tokens.
 *
 * Why a contract instead of the official Fluent faucet: the official one is
 * gated behind a builder-portal login, so an in-app player can't use it. This
 * pool is funded once by the deployer and drips to any connected address.
 *
 * Against abuse:
 *  - one claim per address, ever (not per-hour, per-address)
 *  - per-claim cap and pool balance are the only real limits, so a sweeper
 *    claiming thousands of throwaway addresses can still drain it — that's
 *    acceptable on testnet and explicitly documented rather than hidden.
 *  - owner can pause, top up, resize the drip, or withdraw the remainder.
 */
contract MogFaucet {
    address public owner;
    uint256 public dripAmount;          // wei of ETH per claim
    uint256 public tokenDripAmount;     // game-token units per claim
    bool public paused;

    IMogToken public token;

    mapping(address => bool) public claimed;
    uint256 public claimCount;

    event Claimed(address indexed account, uint256 ethAmount, uint256 tokenAmount);
    event TokensRefilled(address indexed account, uint256 tokenAmount);
    event Funded(address indexed from, uint256 amount);
    event DripUpdated(uint256 ethAmount, uint256 tokenAmount);
    event PausedSet(bool paused);
    event OwnerWithdraw(address indexed to, uint256 amount);
    event OwnershipTransferred(address indexed from, address indexed to);

    error NotOwner();
    error IsPaused();
    error AlreadyClaimed();
    error EmptyPool();
    error NotClaimedYet();
    error TransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address token_, uint256 dripAmount_, uint256 tokenDripAmount_) {
        owner = msg.sender;
        token = IMogToken(token_);
        dripAmount = dripAmount_;
        tokenDripAmount = tokenDripAmount_;
    }

    /// @notice Claim testnet ETH + game tokens. One per address, forever.
    function claim() external {
        if (paused) revert IsPaused();
        if (claimed[msg.sender]) revert AlreadyClaimed();
        if (address(this).balance < dripAmount) revert EmptyPool();

        claimed[msg.sender] = true;
        claimCount += 1;

        uint256 ethOut = dripAmount;
        if (tokenDripAmount > 0) {
            token.mint(msg.sender, tokenDripAmount);
        }

        (bool ok, ) = msg.sender.call{value: ethOut}("");
        if (!ok) revert TransferFailed();

        emit Claimed(msg.sender, ethOut, tokenDripAmount);
    }

    /// @notice Owner pays the gas so a brand-new wallet with zero ETH can still
    /// be onboarded. Without this the faucet is useless to exactly the people
    /// it exists for — an empty address cannot send a transaction.
    /// @dev Same one-claim-per-address rule; `account` is the beneficiary.
    function claimFor(address payable account) external onlyOwner {
        if (paused) revert IsPaused();
        if (account == address(0)) revert TransferFailed();
        if (claimed[account]) revert AlreadyClaimed();
        if (address(this).balance < dripAmount) revert EmptyPool();

        claimed[account] = true;
        claimCount += 1;

        uint256 ethOut = dripAmount;
        if (tokenDripAmount > 0) {
            token.mint(account, tokenDripAmount);
        }

        (bool ok, ) = account.call{value: ethOut}("");
        if (!ok) revert TransferFailed();

        emit Claimed(account, ethOut, tokenDripAmount);
    }

    /// @notice Re-issue the token half of the onboard kit only.
    /// @dev The ETH half is one-shot (that pool is the scarce resource), but the
    /// trade balance is virtual paper — a player who spent it on units, or whose
    /// earlier claim minted a token with the wrong ticker, would otherwise be
    /// stranded with nothing to trade.
    function refillTokens() external {
        if (paused) revert IsPaused();
        if (!claimed[msg.sender]) revert NotClaimedYet();
        if (tokenDripAmount == 0) revert EmptyPool();
        token.mint(msg.sender, tokenDripAmount);
        emit TokensRefilled(msg.sender, tokenDripAmount);
    }

    function canClaim(address account) external view returns (bool) {
        return !paused && !claimed[account] && address(this).balance >= dripAmount;
    }

    function poolBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /* ------------------------------------------------------------------ admin */

    function fund() external payable {
        emit Funded(msg.sender, msg.value);
    }

    receive() external payable {
        emit Funded(msg.sender, msg.value);
    }

    function setDrip(uint256 ethAmount, uint256 tokenAmount) external onlyOwner {
        dripAmount = ethAmount;
        tokenDripAmount = tokenAmount;
        emit DripUpdated(ethAmount, tokenAmount);
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
