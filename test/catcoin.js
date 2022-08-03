const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, waffle} = require("hardhat");
const provider = waffle.provider;

// deadline
const deadline = 100;      //7 * 24 * 60 * 60
const MINIMUM_LIQUIDITY = BigNumber.from("1000");
//

let router;
let factory;
let WETH;
let WETHPartner;
let pair;
let WETHPair;

const overrides = {
  gasLimit: 9999999
}

// signers
let owner, user, withdrawcontract, multisig, devwallet, charitywallet, operationwallet;

describe('Pancake Dex', () => {
    beforeEach(async function() {
        [owner , user, withdrawcontract, multisig, devwallet, charitywallet, operationwallet] = await ethers.getSigners();
        // Pancake Dex Deply
        // ERC token contract deploy
        const WETH9 = await ethers.getContractFactory("WETH9");
        WETH = await WETH9.deploy();
        // Pancake Factory contract deploy
        const Factory = await ethers.getContractFactory("TuitionFactory");
        factory = await Factory.deploy( owner.address );
        
        // Pancake Router contract deploy
        const Router = await ethers.getContractFactory("TuitionRouter");
        router = await Router.deploy( factory.address, WETH.address );

        
        /*********  ERC20 Token  ********/ 
        // const ethPartner = await ethers.getContractFactory("ERC20");
        // WETHPartner = await ethPartner.deploy( ethers.utils.parseEther("10000") );

        /*********  Catcoin Token  ********/ 
        const ethPartner = await ethers.getContractFactory("Catcoin");
        Catcoin = await ethPartner.deploy(router.address, multisig.address, devwallet.address, charitywallet.address, operationwallet.address);                  //////////////////////  Catcoin = await ethPartner.deploy();
        await Catcoin.approve(router.address, ethers.constants.MaxUint256);

        // create pair contract with WETH and Catcoin
        const eth_pair_addr = await factory.getPair(WETH.address , Catcoin.address);
        // const eth_pair_addr = await factory.createPair(WETH.address , Catcoin.address);
        const ETHPair = await ethers.getContractFactory("TuitionPair");
        WETHPair = await ETHPair.attach(eth_pair_addr);

        /// initial config
        await Catcoin.connect(multisig).excludeFromReward(router.address);          //    _isExcluded[router.address] == true
        await Catcoin.connect(multisig).excludeFromFee(router.address);
        await Catcoin.connect(owner).openTrading(withdrawcontract.address);
        console.log("------------------ wallet address list------------------")
        console.log("Owner wallet" , owner.address);
        console.log("User wallet" , user.address);
        console.log("withdrawcontract address" , withdrawcontract.address);
        console.log("Multisig walllet" , multisig.address);
        console.log("DevTeam walllet" , devwallet.address);
        console.log("Charity wallet" , charitywallet.address);
        console.log("Operation wallet" , operationwallet.address);
        console.log("------------------ Deployed contract address list------------------")
        console.log("catcoin contract address" , Catcoin.address);
        console.log("router address" , router.address);
        console.log("eth_CCW_pair address" ,eth_pair_addr);
    })

    describe('UniswapV2Router', () => {
        it('factory WETH', async () => {
            expect(await router.factory()).to.eq(factory.address)
            expect(await router.WETH()).to.eq(WETH.address)

            console.log("factory hash code", await factory.INIT_CODE_PAIR_HASH());
            console.log("____________________ factory WETH END ______________________");
        })

        it('addLiquidityETH', async () => {
            const CatcoinAmount = ethers.utils.parseEther("4");
            const ETHAmount = ethers.utils.parseEther("1");
            
            const expectedLiquidity = ethers.utils.parseEther("2");
            
            // get current block timestamp 
            curBlockNum = await ethers.provider.getBlockNumber();
            block = await ethers.provider.getBlock(curBlockNum);
            curTime = block.timestamp;
            
            await expect(
                router.addLiquidityETH(
                    Catcoin.address,
                    CatcoinAmount,
                    CatcoinAmount,
                    ETHAmount,
                    owner.address,
                    curTime + deadline,
                    {
                        value: ETHAmount,
                    }
                )
            )
            .to.emit(WETHPair, 'Transfer')
            .withArgs(ethers.constants.AddressZero, ethers.constants.AddressZero, MINIMUM_LIQUIDITY)
            .to.emit(WETHPair, 'Transfer')
            .withArgs(ethers.constants.AddressZero, owner.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
        })

        // it('removeLiquiidtyETH', async () => {
        //     const CatcoinAmount = ethers.utils.parseEther('1');
        //     const ETHAmount = ethers.utils.parseEther('4');
        //     const expectedLiquidity = ethers.utils.parseEther('2');

        //     // add Liquidity ETH
        //     // get current block timestamp 
        //     curBlockNum = await ethers.provider.getBlockNumber();
        //     block = await ethers.provider.getBlock(curBlockNum);
        //     curTime = block.timestamp;
            
        //     await expect(
        //         router.addLiquidityETH(
        //             Catcoin.address,
        //             CatcoinAmount,
        //             CatcoinAmount,
        //             ETHAmount,
        //             owner.address,
        //             curTime + deadline,
        //             {
        //                 value: ETHAmount,
        //             }
        //         )
        //     )
        //     .to.emit(WETHPair, 'Transfer')
        //     .withArgs(ethers.constants.AddressZero, ethers.constants.AddressZero, MINIMUM_LIQUIDITY)
        //     .to.emit(WETHPair, 'Transfer')
        //     .withArgs(ethers.constants.AddressZero, owner.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
            
        //     console.log('------------------------   addLiquidity ETH END  --------------------');
        //     console.log("pair balance of catcoin" , await Catcoin.balanceOf(WETHPair.address));
        //     console.log("owner tBalance of catcoin " , await Catcoin.balanceOf(owner.address));
        //     console.log("router tBalance of router " , await Catcoin.balanceOf(router.address));
        //     console.log("owner rBalance of catcoin " , await Catcoin.rBalanceOf(owner.address));
        //     console.log("router rBalance of router " , await Catcoin.rBalanceOf(router.address));
        //     console.log("router rBalance of withdrawcontract " , await Catcoin.rBalanceOf(withdrawcontract.address));
        //     console.log("router rBalance of devTeam " , await Catcoin.rBalanceOf(devwallet.address));
        //     console.log("router rBalance of operation " , await Catcoin.rBalanceOf(operationwallet.address));
        //     console.log("router rBalance of charity " , await Catcoin.rBalanceOf(charitywallet.address));
        //     console.log("router balance of pair liquidity " , await WETHPair.balanceOf(owner.address));
        //     // remove liquidity ETH
        //     await WETHPair.approve(router.address, ethers.constants.MaxUint256)
            
        //     await expect(
        //         router.removeLiquidityETH(
        //             Catcoin.address,
        //             expectedLiquidity.sub(MINIMUM_LIQUIDITY),
        //             0,
        //             0,
        //             owner.address,
        //             ethers.constants.MaxUint256
        //         )
        //     )
        //     .to.emit(WETHPair, 'Transfer')
        //     .withArgs(owner.address, WETHPair.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
        //     .to.emit(WETHPair, 'Transfer')
        //     .withArgs(WETHPair.address, ethers.constants.AddressZero, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
        //     .to.emit(WETH, 'Transfer')
        //     .withArgs(WETHPair.address, router.address, ETHAmount.sub(2000))
        //     .to.emit(Catcoin, 'Transfer')
        //     .withArgs(WETHPair.address, router.address, CatcoinAmount.sub(500))
        //     .to.emit(Catcoin, 'Transfer')
        //     .withArgs(router.address, owner.address, CatcoinAmount.sub(500))

        //     console.log('------------------------   removeLiquidity ETH END  --------------------');
        //     console.log("pair balance of catcoin" , await Catcoin.balanceOf(WETHPair.address));
        //     console.log("owner tBalance of catcoin " , await Catcoin.balanceOf(owner.address));
        //     console.log("router tBalance of router " , await Catcoin.balanceOf(router.address));
        //     console.log("owner rBalance of catcoin " , await Catcoin.rBalanceOf(owner.address));
        //     console.log("router rBalance of router " , await Catcoin.rBalanceOf(router.address));
        //     console.log("router rBalance of withdrawcontract " , await Catcoin.rBalanceOf(withdrawcontract.address));
        //     console.log("router rBalance of devTeam " , await Catcoin.rBalanceOf(devwallet.address));
        //     console.log("router rBalance of operation " , await Catcoin.rBalanceOf(operationwallet.address));
        //     console.log("router rBalance of charity " , await Catcoin.rBalanceOf(charitywallet.address));
        //     console.log("router balance of pair liquidity " , await WETHPair.balanceOf(owner.address));
        // })

        describe('swapExactETHForTokens', () => {
          let CatcoinAmount = ethers.utils.parseEther("10");
          let ETHAmount = ethers.utils.parseEther("5");
          let expectedLiquidity = BigNumber.from("7071067811865475244");
          
          const swapAmount = ethers.utils.parseEther('1')
          let expectedOutputAmount = BigNumber.from("1564054684894964991")
          
          it('happy path', async () => {
              
            console.log("---------- add Liquidity ETH and token to pair ----------")
            // get current block timestamp 
            curBlockNum = await ethers.provider.getBlockNumber();
            block = await ethers.provider.getBlock(curBlockNum);
            curTime = block.timestamp;
            
            await expect(
                router.addLiquidityETH(
                    Catcoin.address,
                    CatcoinAmount,
                    CatcoinAmount,
                    ETHAmount,
                    owner.address,
                    curTime + deadline,
                    {
                        value: ETHAmount,
                    }
                )
            )
            .to.emit(WETHPair, 'Transfer')
            .withArgs(ethers.constants.AddressZero, ethers.constants.AddressZero, MINIMUM_LIQUIDITY)
            .to.emit(WETHPair, 'Transfer')
            .withArgs(ethers.constants.AddressZero, owner.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
            
            console.log('******************************   addLiquidity ETH END  ******************************');
            console.log("pair balance of catcoin" , await Catcoin.balanceOf(WETHPair.address));
            console.log("pair balance of ETH" , await provider.getBalance(owner.address));
            console.log("owner tBalance of catcoin " , await Catcoin.balanceOf(owner.address));
            console.log("router tBalance of router " , await Catcoin.balanceOf(router.address));
            console.log("owner rBalance of catcoin " , await Catcoin.rBalanceOf(owner.address));
            console.log("router rBalance of router " , await Catcoin.rBalanceOf(router.address));
            console.log("router rBalance of withdrawcontract " , await Catcoin.rBalanceOf(withdrawcontract.address));
            console.log("router rBalance of devTeam " , await Catcoin.rBalanceOf(devwallet.address));
            console.log("router rBalance of operation " , await Catcoin.rBalanceOf(operationwallet.address));
            console.log("router rBalance of charity " , await Catcoin.rBalanceOf(charitywallet.address));
            console.log("router balance of pair liquidity " , await WETHPair.balanceOf(owner.address));
            // swap for token and ETH
            await Catcoin.connect(user).approve(router.address , ethers.constants.MaxUint256);
            await expect(
              router.connect(user).swapExactETHForTokensSupportingFeeOnTransferTokens(
                  0, 
                  [WETH.address, Catcoin.address], 
                  user.address, 
                  ethers.constants.MaxUint256, 
                  {
                      value: swapAmount
                    }
              )
            )
            .to.emit(WETH, 'Transfer')
            .withArgs(router.address, WETHPair.address, swapAmount)
            .to.emit(Catcoin, 'Transfer')
            .withArgs(WETHPair.address, user.address, expectedOutputAmount)
            
            console.log('******************************   swapExactETHForTokens ETH END  ******************************')
            console.log("pair balance of catcoin" , await Catcoin.balanceOf(WETHPair.address));
            console.log("catcoin balance of catcoin" , await Catcoin.balanceOf(Catcoin.address));
            console.log("owner tBalance of catcoin " , await Catcoin.balanceOf(owner.address));
            console.log("user tBalance of catcoin " , await Catcoin.balanceOf(user.address));
            console.log("router tBalance of router " , await Catcoin.balanceOf(router.address));
            console.log("user rBalance of catcoin " , await Catcoin.rBalanceOf(user.address));
            console.log("router rBalance of router " , await Catcoin.rBalanceOf(router.address));
            console.log("router rBalance of withdrawcontract " , await Catcoin.rBalanceOf(withdrawcontract.address));
            console.log("router rBalance of devTeam " , await Catcoin.rBalanceOf(devwallet.address));
            console.log("router rBalance of operation " , await Catcoin.rBalanceOf(operationwallet.address));
            console.log("router rBalance of charity " , await Catcoin.rBalanceOf(charitywallet.address));
            console.log("router balance of pair liquidity " , await WETHPair.balanceOf(user.address));
            
            console.log('****************************** swapExactTokensForETH Start ******************************')
            
            // 
            // await Catcoin.connect(owner).transfer(user.address , ethers.utils.parseEther("1"));
            expectedOutputAmount = BigNumber.from("641517905082134456")
            // get current block timestamp 
            curBlockNum = await ethers.provider.getBlockNumber();
            block = await ethers.provider.getBlock(curBlockNum);
            curTime = block.timestamp;
            
            // swapTokensForExactETH
            await expect(
                router.connect(user).swapExactTokensForETHSupportingFeeOnTransferTokens(
                    swapAmount,
                    0,
                    [Catcoin.address, WETH.address],
                    user.address,
                    ethers.constants.MaxUint256
                )
            )
            .to.emit(Catcoin, 'Transfer')
            .withArgs(user.address, WETHPair.address, swapAmount)
            .to.emit(WETH, 'Transfer')
            .withArgs(WETHPair.address, router.address, expectedOutputAmount)
            console.log('******************************   swapExactTokensForETH ETH END  ******************************')
            console.log("pair balance of catcoin" , await Catcoin.balanceOf(WETHPair.address));
            console.log("catcoin balance of catcoin" , await Catcoin.balanceOf(Catcoin.address));
            console.log("owner tBalance of catcoin " , await Catcoin.balanceOf(owner.address));
            console.log("router tBalance of router " , await Catcoin.balanceOf(router.address));
            console.log("owner rBalance of catcoin " , await Catcoin.rBalanceOf(owner.address));
            
            //remove liquidity ETH
            ETHAmount = BigNumber.from("5358482094917864786");
            await WETHPair.approve(router.address, ethers.constants.MaxUint256)
            
            await expect(
                router.removeLiquidityETH(
                    Catcoin.address,
                    expectedLiquidity.sub(MINIMUM_LIQUIDITY),
                    0,
                    0,
                    owner.address,
                    ethers.constants.MaxUint256
                )
            )
            .to.emit(WETHPair, 'Transfer')
            .withArgs(owner.address, WETHPair.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
            .to.emit(WETHPair, 'Transfer')
            .withArgs(WETHPair.address, ethers.constants.AddressZero, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
            .to.emit(WETH, 'Transfer')
            .withArgs(WETHPair.address, router.address, ETHAmount)
            
            console.log('------------------------   removeLiquidity ETH END  --------------------');
            console.log("pair balance of catcoin" , await Catcoin.balanceOf(WETHPair.address));
            console.log("owner tBalance of catcoin " , await Catcoin.balanceOf(owner.address));
            console.log("router tBalance of router " , await Catcoin.balanceOf(router.address));
            console.log("owner rBalance of catcoin " , await Catcoin.rBalanceOf(owner.address));
            console.log("router rBalance of router " , await Catcoin.rBalanceOf(router.address));
            console.log("router rBalance of withdrawcontract " , await Catcoin.rBalanceOf(withdrawcontract.address));
            console.log("router rBalance of devTeam " , await Catcoin.rBalanceOf(devwallet.address));
            console.log("router rBalance of operation " , await Catcoin.rBalanceOf(operationwallet.address));
            console.log("router rBalance of charity " , await Catcoin.rBalanceOf(charitywallet.address));
            console.log("router balance of pair liquidity " , await WETHPair.balanceOf(owner.address));
          })
        })
  
        // describe('swapTokensForExactETH', () => {
        //   const CatcoinAmount = ethers.utils.parseEther("5")
        //   const ETHAmount = ethers.utils.parseEther("10")
        //   const expectedLiquidity = BigNumber.from("7071067811865475244");
        //   const expectedSwapAmount = BigNumber.from('557227237267357629')
        //   const outputAmount = ethers.utils.parseEther("1")
  
        //   it('happy path', async () => {

        //     // add Liquidity for ETH and token
        //     // get current block timestamp 
        //     curBlockNum = await ethers.provider.getBlockNumber();
        //     block = await ethers.provider.getBlock(curBlockNum);
        //     curTime = block.timestamp;
            
        //     await expect(
        //         router.addLiquidityETH(
        //             Catcoin.address,
        //             CatcoinAmount,
        //             CatcoinAmount,
        //             ETHAmount,
        //             owner.address,
        //             curTime + deadline,
        //             {
        //                 value: ETHAmount,
        //             }
        //         )
        //     )
        //     .to.emit(WETHPair, 'Transfer')
        //     .withArgs(ethers.constants.AddressZero, ethers.constants.AddressZero, MINIMUM_LIQUIDITY)
        //     .to.emit(WETHPair, 'Transfer')
        //     .withArgs(ethers.constants.AddressZero, owner.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
            
        //     console.log('------------------------   addLiquidity ETH END  --------------------');
        //     console.log("pair balance of catcoin" , await Catcoin.balanceOf(WETHPair.address));
        //     console.log("pair balance of ETH" , await provider.getBalance(owner.address));
        //     console.log("owner tBalance of catcoin " , await Catcoin.balanceOf(owner.address));
        //     console.log("router tBalance of router " , await Catcoin.balanceOf(router.address));
        //     console.log("owner rBalance of catcoin " , await Catcoin.rBalanceOf(owner.address));
        //     console.log("router rBalance of router " , await Catcoin.rBalanceOf(router.address));
        //     console.log("router rBalance of withdrawcontract " , await Catcoin.rBalanceOf(withdrawcontract.address));
        //     console.log("router rBalance of devTeam " , await Catcoin.rBalanceOf(devwallet.address));
        //     console.log("router rBalance of operation " , await Catcoin.rBalanceOf(operationwallet.address));
        //     console.log("router rBalance of charity " , await Catcoin.rBalanceOf(charitywallet.address));
        //     console.log("router balance of pair liquidity " , await WETHPair.balanceOf(owner.address));

        //     // swapTokensForExactETH
        //     await expect(
        //       router.swapTokensForExactETH(
        //         outputAmount,
        //         ethers.constants.MaxUint256,
        //         [Catcoin.address, WETH.address],
        //         owner.address,
        //         ethers.constants.MaxUint256,
        //         overrides
        //       )
        //     )
        //       .to.emit(Catcoin, 'Transfer')
        //       .withArgs(owner.address, WETHPair.address, expectedSwapAmount)
        //       .to.emit(WETH, 'Transfer')
        //       .withArgs(WETHPair.address, router.address, outputAmount)

        //       console.log('------------------------   swapTokensForExactETH ETH END  --------------------');
        //       console.log("pair balance of catcoin" , await Catcoin.balanceOf(WETHPair.address));
        //       console.log("catcoin balance of catcoin" , await Catcoin.balanceOf(Catcoin.address));
        //       console.log("owner tBalance of catcoin " , await Catcoin.balanceOf(owner.address));
        //       console.log("user tBalance of catcoin " , await Catcoin.balanceOf(user.address));
        //       console.log("router tBalance of router " , await Catcoin.balanceOf(router.address));
        //       console.log("user rBalance of catcoin " , await Catcoin.rBalanceOf(user.address));
        //       console.log("router rBalance of router " , await Catcoin.rBalanceOf(router.address));
        //       console.log("router rBalance of withdrawcontract " , await Catcoin.rBalanceOf(withdrawcontract.address));
        //       console.log("router rBalance of devTeam " , await Catcoin.rBalanceOf(devwallet.address));
        //       console.log("router rBalance of operation " , await Catcoin.rBalanceOf(operationwallet.address));
        //       console.log("router rBalance of charity " , await Catcoin.rBalanceOf(charitywallet.address));
        //       console.log("router balance of pair liquidity " , await WETHPair.balanceOf(user.address));
        //   })
  
        // })
  
        // describe('swapExactTokensForETH', () => {
        //   const CatcoinAmount = ethers.utils.parseEther("5")
        //   const ETHAmount = ethers.utils.parseEther("10")
        //   const expectedLiquidity = BigNumber.from("7071067811865475244");
        //   const swapAmount = ethers.utils.parseEther("1")
        //   const expectedOutputAmount = BigNumber.from('1663887962654218072')
  
  
        //   it('happy path', async () => {

        //     // add Liquidity for ETH and token
        //     // get current block timestamp 
        //     curBlockNum = await ethers.provider.getBlockNumber();
        //     block = await ethers.provider.getBlock(curBlockNum);
        //     curTime = block.timestamp;
            
        //     await expect(
        //         router.addLiquidityETH(
        //             Catcoin.address,
        //             CatcoinAmount,
        //             CatcoinAmount,
        //             ETHAmount,
        //             owner.address,
        //             curTime + deadline,
        //             {
        //                 value: ETHAmount,
        //             }
        //         )
        //     )
        //     .to.emit(WETHPair, 'Transfer')
        //     .withArgs(ethers.constants.AddressZero, ethers.constants.AddressZero, MINIMUM_LIQUIDITY)
        //     .to.emit(WETHPair, 'Transfer')
        //     .withArgs(ethers.constants.AddressZero, owner.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
            
        //     // swapTokensForExactETH
        //     await expect(
        //       router.swapExactTokensForETH(
        //         swapAmount,
        //         0,
        //         [Catcoin.address, WETH.address],
        //         owner.address,
        //         ethers.constants.MaxUint256,
        //         overrides
        //       )
        //     )
        //     .to.emit(Catcoin, 'Transfer')
        //     .withArgs(owner.address, WETHPair.address, swapAmount)
        //     .to.emit(WETH, 'Transfer')
        //     .withArgs(WETHPair.address, router.address, expectedOutputAmount)
        //   })
        // })
  
        // describe('swapETHForExactTokens', () => {
        //   const CatcoinAmount = ethers.utils.parseEther("10")
        //   const ETHAmount = ethers.utils.parseEther("5")
        //   const expectedLiquidity = BigNumber.from("7071067811865475244");
        //   const expectedSwapAmount = BigNumber.from('557227237267357629')
        //   const outputAmount = ethers.utils.parseEther("1")
  
        //   it('happy path', async () => {

        //     // add Liquidity for ETH and token
        //     // get current block timestamp 
        //     curBlockNum = await ethers.provider.getBlockNumber();
        //     block = await ethers.provider.getBlock(curBlockNum);
        //     curTime = block.timestamp;
            
        //     await expect(
        //         router.addLiquidityETH(
        //             Catcoin.address,
        //             CatcoinAmount,
        //             CatcoinAmount,
        //             ETHAmount,
        //             owner.address,
        //             curTime + deadline,
        //             {
        //                 value: ETHAmount,
        //             }
        //         )
        //     )
        //     .to.emit(WETHPair, 'Transfer')
        //     .withArgs(ethers.constants.AddressZero, ethers.constants.AddressZero, MINIMUM_LIQUIDITY)
        //     .to.emit(WETHPair, 'Transfer')
        //     .withArgs(ethers.constants.AddressZero, owner.address, expectedLiquidity.sub(MINIMUM_LIQUIDITY))
            
        //     // swapTokensForExactETH
        //     await expect(
        //       router.swapETHForExactTokens(
        //         outputAmount,
        //         [WETH.address, Catcoin.address],
        //         owner.address,
        //         ethers.constants.MaxUint256,
        //         {
        //           ...overrides,
        //           value: expectedSwapAmount
        //         }
        //       )
        //     )
        //       .to.emit(WETH, 'Transfer')
        //       .withArgs(router.address, WETHPair.address, expectedSwapAmount)
        //       .to.emit(Catcoin, 'Transfer')
        //       .withArgs(WETHPair.address, owner.address, outputAmount)
        //   })
        // })
    })
})