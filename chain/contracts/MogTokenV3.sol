// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * MogTokenV3 — testnet FLUENT, 1,000,000,000 total supply.
 *
 * The constructor mints the whole 1B to the deployer, then ownership is handed
 * to the faucet so the faucet can mint the in-game drips out of that cap. Every
 * mint (constructor included) is bounded by MAX_SUPPLY so the 1B figure is a
 * hard ceiling rather than a launch-time number.
 *
 * Priced against the real mainnet FLUENT (`BLEND`, ~$0.047) — see the app's
 * price feed — so the in-game numbers read like the live token.
 */
contract MogTokenV3 {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 1e18;
    uint256 public totalSupply;

    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event OwnershipTransferred(address indexed from, address indexed to);

    error NotOwner();
    error InsufficientBalance(uint256 have, uint256 want);
    error InsufficientAllowance(uint256 have, uint256 want);
    error CapExceeded(uint256 supply, uint256 amount);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(string memory name_, string memory symbol_, address recipient_, uint256 initialSupply_) {
        name = name_;
        symbol = symbol_;
        owner = msg.sender;
        if (initialSupply_ > MAX_SUPPLY) revert CapExceeded(0, initialSupply_);
        if (initialSupply_ > 0) {
            totalSupply = initialSupply_;
            balanceOf[recipient_] = initialSupply_;
            emit Transfer(address(0), recipient_, initialSupply_);
        }
    }

    function transferOwnership(address next) external onlyOwner {
        require(next != address(0), "zero owner");
        emit OwnershipTransferred(owner, next);
        owner = next;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "zero to");
        if (totalSupply + amount > MAX_SUPPLY) revert CapExceeded(totalSupply, amount);
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function burn(uint256 amount) external {
        uint256 bal = balanceOf[msg.sender];
        if (bal < amount) revert InsufficientBalance(bal, amount);
        balanceOf[msg.sender] = bal - amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        return _transfer(msg.sender, to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed < amount) revert InsufficientAllowance(allowed, amount);
        if (allowed != type(uint256).max) allowance[from][msg.sender] = allowed - amount;
        return _transfer(from, to, amount);
    }

    function _transfer(address from, address to, uint256 amount) private returns (bool) {
        require(to != address(0), "zero to");
        uint256 bal = balanceOf[from];
        if (bal < amount) revert InsufficientBalance(bal, amount);
        balanceOf[from] = bal - amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}
