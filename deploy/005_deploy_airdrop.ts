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
    "0x7156412dF929c3cdB82cCbf22716F7b1c84fB31A",
    "0xC61600a5880D146f3E825327D149cD0377a47Beb",
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
