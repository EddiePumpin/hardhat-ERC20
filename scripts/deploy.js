const { network } = require("hardhat")
const {
  developmentChains,
  networkConfig,
  INITIAL_SUPPLY,
} = require("../helper-hardhat-config")

module.exports = async function ({ getNamedAccounts, deployments }) {
  console.log("Here")
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  const MethERC20 = await deploy("OurToken", {
    from: deployer,
    args: [INITIAL_SUPPLY],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  console.log(`METH deployed at ${MethERC20.address}`)

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying.....")
    await verify(MethERC20.address, [INITIAL_SUPPLY])
  }
}

module.exports.tags = ["all", "MethERC20"]
