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
    "0xc3a20F9D15cfD2224038EcCC8186C216366c4BFd", // owner
    "1681084800", //_latestUpdatedForTeamDev Monday, April 10, 2023 12:00:00 AM
  ];

  const result = await deploy("CarboTokenv2", {
    from: deployer,
    log: true,
    args: args,
  });

  await hre.run("verify:verify", {
    address: result.address,
    constructorArguments: args,
  });
};

func.tags = ["tokenv2"];
export default func;
