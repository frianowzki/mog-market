// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * MogToken — the in-game ERC20 that MOG MARKET trades against.
 *
 * Symbol follows the chain's own gas token (ETH on Fluent) so traders never
 * have to translate between two unit systems: what the faucet drips and what
 * the market quotes are the same thing.
 *
 * Only the owner (the game contract, or the deployer during bootstrap) can
 * mint. That keeps supply under the game's control without a full-blown
 * tokenomics contract.
 */
contract MogToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed holder, address indexed spender, uint256 value);
    event OwnershipTransferred(address indexed from, address indexed to);

    error NotOwner();
    error InsufficientBalance(uint256 have, uint256 want);
    error InsufficientAllowance(uint256 have, uint256 want);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(string memory name_, string memory symbol_) {
        name = name_;
        symbol = symbol_;
        owner = msg.sender;
    }

    function transferOwnership(address next) external onlyOwner {
        require(next != address(0), "zero owner");
        emit OwnershipTransferred(owner, next);
        owner = next;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "zero to");
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

    function transfer(address to, uint256 amount) external returns (bool) {
        _move(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type(uint256).max) {
            if (allowed < amount) revert InsufficientAllowance(allowed, amount);
            allowance[from][msg.sender] = allowed - amount;
        }
        _move(from, to, amount);
        return true;
    }

    function _move(address from, address to, uint256 amount) private {
        require(to != address(0), "zero to");
        uint256 bal = balanceOf[from];
        if (bal < amount) revert InsufficientBalance(bal, amount);
        balanceOf[from] = bal - amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }
}
