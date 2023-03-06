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

  await deploy("CarboTokenv2", {
    from: deployer,
    log: true,
    args: [
      "0xc3a20F9D15cfD2224038EcCC8186C216366c4BFd",
      "0x5FF5763964aC663Ec6CDcCf9836306301AED64C0",
      "0xA7E8cB251033990cFFC3C10131f35BB122b321fB",
      "1677236400",
    ],
  });
};

func.tags = ["tokenv2"];
export default func;
