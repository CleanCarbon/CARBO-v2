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
    "0x5B11C48a39dc86d3D9801102aa762f968f2d3A2D",
  ];

  const result = await deploy("StakingCarbon", {
    from: deployer,
    log: true,
    args: args,
  });

  await hre.run("verify:verify", {
    address: result.address,
    constructorArguments: args,
  });
};

func.tags = ["staking-score"];
export default func;
