const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const {
  developmentChains,
  INITIAL_SUPPLY,
} = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("MegaEth Unit Test", function () {
      //Multipler is used to make reading the math easier because of the 18 decimal points
      const multiplier = 10 ** 18
      let methERC20, deployer, accDeployer
      beforeEach(async function () {
        const accounts = await ethers.getSigners()
        accDeployer = accounts[0]

        await deployments.fixture("all")
        // Get the deployed FundMe contract
        const fundMeDeployment = await deployments.get("MegaEth")
        // Getting the contract address
        deployer = fundMeDeployment.address
        methERC20 = await ethers.getContractAt("MegaEth", deployer)
        console.log({
          contractaddress: methERC20,
          totalSupply: methERC20.totalSupply,
        })
      })

      it("was deployed", async () => {
        assert(methERC20.target)
      })

      describe("constructor", () => {
        it("Should have correct INITIAL_SUPPLY of token", async () => {
          const totalSupply = await methERC20.totalSupply()
          assert.equal(totalSupply.toString(), INITIAL_SUPPLY)
        })
        it("initializes the token with the correct name and symbol", async () => {
          const name = (await methERC20.name()).toString()
          assert.equal(name, "MegaETH")

          const symbol = (await methERC20.symbol()).toString()
          assert.equal("METH", symbol)
        })
      })

      describe("transfers", () => {
        it("Should be able to transfer tokens successfully to an address", async () => {
          const tokensToSend = ethers.utils.parseEther("0.02")
          await methERC20.transfer(deployer, tokensToSend)
          expect(await methERC20.balanceOf(deployer)).to.equal(tokensToSend)
        })
        it("emits an transfer event, when an transfer occurs", async () => {
          await expect(
            methERC20.transfer(accDeployer, (10 * multiplier).toString()),
          ).to.emit(methERC20, "Transfer")
        })
      })

      describe("allowances", () => {
        const amount = (20 * multiplier).toString()
        beforeEach(async () => {
          playerToken = await ethers.getContractAt("MegaEth", deployer)
        })
        it("Should approve other address to spend token", async () => {
          const tokensToSpend = ethers.utils.parseEther("0.01")
          await methERC20.approve(accDeployer, tokensToSpend)
          await playerToken.transferFrom(accDeployer, deployer, tokensToSpend)
          expect(await playerToken.balanceOf(deployer)).to.equal(tokensToSpend)
        })
        it("doesn't allow an unnaproved member to do transfers", async () => {
          //   await expect(
          //     playerToken.transferFrom(accDeployer, deployer, amount)
          //   ).to.be.revertedWith("ERC20: insufficient allowance");
          await expect(playerToken.transferFrom(accDeployer, deployer, amount))
            .to.be.reverted
        })
        it("emits an approval event, when an approval occurs", async () => {
          await expect(methERC20.approve(accDeployer, amount)).to.emit(
            methERC20,
            "Approval",
          )
        })
        it("the allowance being set is accurate", async () => {
          await methERC20.approve(deployer, amount)
          const allowance = await methERC20.allowance(accDeployer, deployer)
          assert.equal(allowance.toString(), amount)
        })
        it("won't allow a user to go over the allowance", async () => {
          await methERC20.approve(deployer, amount)
          // await expect(
          //   playerToken
          //     .transferFrom(accDeployer, deployer, amount)
          //     .to.be.revertedWith("ERC20: insufficient allowance")
          // );
          // Attempt to transfer more than allowed
          await expect(
            methERC20
              .connect(accDeployer)
              .transferFrom(accDeployer, deployer, amount),
          ).to.be.reverted
        })
      })
    })
