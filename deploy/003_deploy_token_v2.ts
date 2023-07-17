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
    "0xF78c6d6621cCA0E4f208e17f800495B2e399Ab1E", // owner
    "1693526400", //_latestUpdatedForTeamDev Monday, Sep 1, 2023 12:00:00 AM
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
