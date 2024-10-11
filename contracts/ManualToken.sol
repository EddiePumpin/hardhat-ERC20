// SPDX-License-identifir: MIT
pragma solidity ^0.8.7;

interface tokenRecipient {
  function receiveApproval(
    address _from,
    uint256 _value,
    address _token,
    bytes calldata _extraData
  ) external;
}

contract MethERC20 {
  // State variables
  string public name;
  string public symbol;
  uint8 public constant TOKEN_DECIMALS = 18; // This is the smallest unit that can be sent
  uint256 public totalSupply; // totalSupply of 50000000000 is ideal
  mapping(address => uint256) public balanceOf; // The key is going to be every single address on the planet while uint256 is how much they have
  mapping(address => mapping(address => uint256)) public allowance; // This means the first address will allow the second address to use some tokens(uint256)

  // Events
  event Transfer(address indexed from, address indexed to, uint256 amount);
  event Approval(address indexed owner, address indexed _spender);
  event Burn(address indexed from, uint256 amount);

  // transfer tokens
  // substract from address amount and add to the address

  constructor(
    string memory tokenName,
    string memory tokenSymbol,
    uint256 initialSupply
  ) {
    totalSupply = initialSupply * 10 ** uint256(TOKEN_DECIMALS); // It is ideal to update the total suppply with the decimal amount
    balanceOf[msg.sender] = totalSupply; // All tokens are given to the creator
    name = tokenName;
    symbol = tokenSymbol;
  }

  // Returns the account balance of another account with address _owner
  // function balanceOf(address _owner) public view returns (uint256 balance) {
  //     return balances[_owner]
  // }

  // Internal transfer
  function _transfer(address _from, address _to, uint256 amount) internal {
    require(_to != address(0x0));
    require(balanceOf[_from] >= amount);
    require(balanceOf[_to] + amount >= balanceOf[_to]);
    balanceOf[_from] -= amount; // This line is the same has balanceOf[from] = balaneceOf[from] - amount
    balanceOf[_to] += amount; // This line also means balanceOf[to] = balanceOf[from] + amount
    emit Transfer(_from, _to, amount); // For transparency.
  }

  // Transfer from A to B
  function transfer(
    address _to,
    uint256 _amount
  ) public returns (bool success) {
    _transfer(msg.sender, _to, _amount);
    return true;
  }

  // This function allows the token to intract with another smart contract(protocol) like depositing into a protocol, that is why we need an approve function
  function transferFrom(
    address _from,
    address _to,
    uint256 _amount
  ) public returns (bool success) {
    // allowance[_from][msg.sender] -- Approved allowance
    require(_amount <= allowance[_from][msg.sender]); // Check allowance. This line checks whether the amount of tokens the caller is trying to transfer is less than or equal to the approved allowance.
    allowance[_from][msg.sender] -= _amount; // update the allowance. The line reduces the allowance by the _amount that has just been spent by msg.sender. This line is also the same has allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value
    // allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value
    _transfer(_from, _to, _amount); // transfer the tokens
    return true; //functions like transferFrom return a boolean value
  }

  // Set allowance for other address
  function approve(
    address _spender,
    uint256 _amount
  ) public returns (bool success) {
    allowance[msg.sender][_spender] = _amount;
    emit Approval(msg.sender, _spender);
    return true;
  }

  // Set allowance for other address and notify
  // Suppose Alice wants to approve a DeFi contract to spend her tokens and immediately invest those tokens in a yield farming strategy
  function approveAndCall(
    address _spender,
    uint256 _amount,
    bytes memory _extraData
  ) public returns (bool success) {
    tokenRecipient spender = tokenRecipient(_spender); // Ensures that _spender is treated as a contract that implements the required functions, such as receiveApproval.
    if (approve(_spender, _amount)) {
      spender.receiveApproval(msg.sender, _amount, address(this), _extraData);
      return true;
    }
  }

  function burn(uint256 _amount) public returns (bool success) {
    require(balanceOf[msg.sender] >= _amount);
    // balanceOf[msg.sender] = balanceOf[msg.sender] - _amount
    balanceOf[msg.sender] -= _amount;
    // totalSupply = totalSupply - _amount
    totalSupply -= _amount;
    emit Burn(msg.sender, _amount);
    return true;
  }

  // msg.sender = spender
  function burnFrom(
    address _from,
    uint256 _amount
  ) public returns (bool success) {
    require(balanceOf[_from] >= _amount);
    require(_amount <= allowance[_from][msg.sender]); // Check allowance if the amount to be burnt is less tham or equal to approved amount.
    balanceOf[msg.sender] -= _amount;
    allowance[_from][msg.sender] -= _amount; //This reduces the allowance that msg.sender has to spend on behalf of _from. This step ensures that the allowance accurately reflects the tokens that can still be spent after the burn operation.
    totalSupply -= _amount;
    emit Burn(_from, _amount);
    return true;
  }
}
