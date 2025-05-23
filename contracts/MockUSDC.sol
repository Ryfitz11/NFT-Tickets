// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// A simple mock ERC20 token for testing purposes
contract MockUSDC is ERC20 {
    uint8 private _customDecimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20(name, symbol) {
        _customDecimals = decimals_;
    }

    // Override decimals to allow setting a custom value (like 6 for USDC)
    function decimals() public view virtual override returns (uint8) {
        return _customDecimals;
    }

    // Public mint function for test setup
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
