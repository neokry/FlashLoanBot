pragma solidity =0.6.6;

import './UniswapV2Library.sol';
import './interfaces/IUniswapV2Router02.sol';
import './interfaces/IUniswapV2Pair.sol';
import './interfaces/IERC20.sol';
import "hardhat/console.sol";

contract FlashLoaner {
  address public owner;
  address public dexFactory;
  IUniswapV2Router02 public dexRouter;

  uint constant deadline = 10 days;

  constructor(address _dexFactory, address _dexRouter) public {
    owner = msg.sender;
    setDEX(_dexFactory, _dexRouter);
  }

  function setOwner(address newOwner) public {
    require(msg.sender == owner, "Unathorized");
    owner = newOwner;
  }

  function setDEX(address _dexFactory, address _dexRouter) public {
    require(msg.sender == owner, "Unathorized");
    dexFactory = _dexFactory;  
    dexRouter = IUniswapV2Router02(_dexRouter);
  }

  function uniswapV2Call(address _sender, uint _amount0, uint _amount1, bytes calldata _data) external {
      address[] memory path = new address[](2);
      uint amountToken = _amount0 == 0 ? _amount1 : _amount0;
      
      address token0 = IUniswapV2Pair(msg.sender).token0();
      address token1 = IUniswapV2Pair(msg.sender).token1();

      console.log("Sender address", msg.sender);
      console.log("Pair address", UniswapV2Library.pairFor(dexFactory, token0, token1));
      console.log("token0", token0);
      console.log("token1", token1);

      require(msg.sender == UniswapV2Library.pairFor(dexFactory, token0, token1), "Unauthorized: address does not match token pair check your dex settings."); 
      require(_amount0 == 0 || _amount1 == 0);

      path[0] = _amount0 == 0 ? token1 : token0;
      path[1] = _amount0 == 0 ? token0 : token1;

      IERC20 token = IERC20(_amount0 == 0 ? token1 : token0);
      
      token.approve(address(dexRouter), amountToken);

      console.log("Router approved");

      // no need for require() check, if amount required is not sent sushiRouter will revert
      uint amountRequired = UniswapV2Library.getAmountsIn(dexFactory, amountToken, path)[0];

      console.log("amount required: ", amountRequired);
      console.log("amount token: ", amountToken);

      uint amountReceived = dexRouter.swapExactTokensForTokens(amountToken, amountRequired, path, msg.sender, deadline)[1];

      console.log("swap made");

      // YEAHH PROFIT
      token.transfer(_sender, amountReceived - amountRequired);

      console.log("profit transfered");
    
  }
}