const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const {
  developmentChains,
  INITIAL_SUPPLY,
} = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("OurToken Unit Test", function () {
      //Multipler is used to make reading the math easier because of the 18 decimal points
      const multiplier = 10 ** 18
      let ourToken, deployer, accDeployer
      beforeEach(async function () {
        const accounts = await ethers.getSigners()
        accDeployer = accounts[0]

        await deployments.fixture("all")
        // Get the deployed FundMe contract
        const fundMeDeployment = await deployments.get("OurToken")
        // Getting the contract address
        deployer = fundMeDeployment.address
        ourToken = await ethers.getContractAt("OurToken", deployer)
        console.log({
          contractaddress: ourToken,
          totalSupply: ourToken.totalSupply,
        })
      })

      it("was deployed", async () => {
        assert(ourToken.target)
      })

      describe("constructor", () => {
        it("Should have correct INITIAL_SUPPLY of token", async () => {
          const totalSupply = await ourToken.totalSupply()
          assert.equal(totalSupply.toString(), INITIAL_SUPPLY)
        })
        it("initializes the token with the correct name and symbol", async () => {
          const name = (await ourToken.name()).toString()
          assert.equal(name, "OurToken")

          const symbol = (await ourToken.symbol()).toString()
          assert.equal("OT", symbol)
        })
      })

      describe("transfers", () => {
        it("Should be able to transfer tokens successfully to an address", async () => {
          const tokensToSend = ethers.parseEther("10")
          await ourToken.transfer(deployer, tokensToSend)
          expect(await ourToken.balanceOf(deployer)).to.equal(tokensToSend)
        })
        it("emits an transfer event, when an transfer occurs", async () => {
          await expect(
            ourToken.transfer(accDeployer, (10 * multiplier).toString()),
          ).to.emit(ourToken, "Transfer")
        })
      })

      describe("allowances", () => {
        const amount = (20 * multiplier).toString()
        beforeEach(async () => {
          playerToken = await ethers.getContractAt("OurToken", deployer)
        })
        it("Should approve other address to spend token", async () => {
          const tokensToSpend = ethers.parseEther("5")
          //Deployer is approving that user1 can spend 5 of their precious OT's
          await ourToken.approve(accDeployer, tokensToSpend)
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
          await expect(ourToken.approve(accDeployer, amount)).to.emit(
            ourToken,
            "Approval",
          )
        })
        it("the allowance being set is accurate", async () => {
          await ourToken.approve(deployer, amount)
          const allowance = await ourToken.allowance(accDeployer, deployer)
          assert.equal(allowance.toString(), amount)
        })
        it("won't allow a user to go over the allowance", async () => {
          await ourToken.approve(deployer, amount)
          // await expect(
          //   playerToken
          //     .transferFrom(accDeployer, deployer, amount)
          //     .to.be.revertedWith("ERC20: insufficient allowance")
          // );
          // Attempt to transfer more than allowed
          await expect(
            ourToken
              .connect(accDeployer)
              .transferFrom(accDeployer, deployer, amount),
          ).to.be.reverted
        })
      })
    })
