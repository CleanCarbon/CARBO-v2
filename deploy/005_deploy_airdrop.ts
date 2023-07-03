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
    "0xc3a20F9D15cfD2224038EcCC8186C216366c4BFd",
    "0x21c2718a8e44c2ca224eec38124e3eb307c27bfa", // v1
    "0x81E57bB55d1D3fddA950A69c161270eb6c27C362",  //v2
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
