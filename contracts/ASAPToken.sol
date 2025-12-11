// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ASAPToken is ERC20 {
    constructor() ERC20("ASAP Test Token", "ASAP") {
        // Mint 1,000,000 tokens to the deployer immediately
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    // Free money faucet for everyone to test
    function faucet() external {
        _mint(msg.sender, 1000 * 10 ** decimals());
    }
}