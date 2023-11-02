const { network } = require("hardhat");
require("dotenv").config();
const { verify } = require("../utils/verify");

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  const chainId = network.config.chainId;

  log("Deploying contract........");
  const fractionalAsset = await deploy("AssetBloc", {
    from: deployer,
    args: [],
    log: true,
  });
  log(`Contract deployed at ${fractionalAsset.address}`);

  if (!(chainId == 31337) && process.env.ETHERSCAN_API_KEY) {
    await verify(fractionalAsset.address, []);
    log("verified........");
  }
};

module.exports.tags = ["all", "fractionalAsset"];
