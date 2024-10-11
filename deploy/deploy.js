const { network } = require("hardhat")
const {
  developmentChains,
  networkConfig,
  INITIAL_SUPPLY,
} = require("../helper-hardhat-config")
const { verify } = require("../helper-functions")
require("dotenv").config()

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  const methERC20 = await deploy("MegaEth", {
    from: deployer,
    args: [INITIAL_SUPPLY],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  log(`METH deployed at ${methERC20.address}`)

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying.....")
    await verify(methERC20.address, [INITIAL_SUPPLY])
  }
}

module.exports.tags = ["all", "methERC20"]
