import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";

const func: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
): Promise<void> {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);

  const args = [
    "0xF78c6d6621cCA0E4f208e17f800495B2e399Ab1E",
    "0xa52262da176186105199a597ac8cf094ff71b0c5", // v1
    "0x91D1b8169bE718AC899d1A856C75819F5f62E991",  //v2
  ];

  const result = await deploy("AirdropCarbonv2", {
    from: deployer,
    log: true,
    args: args,
  });

  await hre.run("verify:verify", {
    address: result.address,
    constructorArguments: args,
  });
};

func.tags = ["airdrop-snapshot"];
export default func;
