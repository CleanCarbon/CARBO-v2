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

  await deploy("AirdropCarbonv2", {
    from: deployer,
    log: true,
    args: [
      "0xc3a20F9D15cfD2224038EcCC8186C216366c4BFd",
      "0x7156412dF929c3cdB82cCbf22716F7b1c84fB31A",
      "0xe8e2e445648564F9B57d7e4177aC327e57e3bD54",
    ],
  });
};

func.tags = ["airdrop-snapshot"];
export default func;
