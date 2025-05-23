// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// A simple mock ERC20 token for testing purposes
contract MockUSDC is ERC20 {
    uint8 private _customDecimals;
    bool public transferShouldFail; // Flag to simulate transfer failures

    // Event to log when transferShouldFail is set
    event TransferFailureSimulationSet(bool shouldFail);

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20(name, symbol) {
        _customDecimals = decimals_;
        transferShouldFail = false; // Default to normal behavior
    }

    // Override decimals to allow setting a custom value (like 6 for USDC)
    function decimals() public view virtual override returns (uint8) {
        return _customDecimals;
    }

    // Public mint function for test setup
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    // Function to control transfer failure simulation
    function setTransferToFail(bool _shouldFail) public {
        transferShouldFail = _shouldFail;
        emit TransferFailureSimulationSet(_shouldFail);
    }

    // Override _transfer to simulate failures
    // Note: OpenZeppelin's ERC20._transfer is internal.
    // To inject failure, we override the public-facing transfer and transferFrom.

    function transfer(
        address to,
        uint256 value
    ) public virtual override returns (bool) {
        if (transferShouldFail) {
            return false; // Simulate failure
        }
        return super.transfer(to, value);
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public virtual override returns (bool) {
        if (transferShouldFail) {
            return false; // Simulate failure
        }
        return super.transferFrom(from, to, value);
    }
}
