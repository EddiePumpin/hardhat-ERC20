// SPDX-Lincense-Identifier: MIT
pragma solidity ^0.8.7;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MethERC20 is ERC20 {
  // State variable
  constructor(uint256 initialSupply) ERC20("MegaETH", "METH") {
    _mint(msg.sender, initialSupply);
  }

  // The mint function allows us to create tokens
}
