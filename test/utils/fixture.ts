import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";

export function getStartDay(): number {
  return Math.floor(Math.floor(Date.now() / 1000) / 2592000) * 2592000;
}

export async function deployFixture() {
  const signers: SignerWithAddress[] = await ethers.getSigners();

  const owner: SignerWithAddress = signers[0];
  const account1: SignerWithAddress = signers[1];
  const account2: SignerWithAddress = signers[2];
  const account3: SignerWithAddress = signers[3];
  const operator: SignerWithAddress = signers[4];
  const buybacks: SignerWithAddress = signers[5];
  const treasury: SignerWithAddress = signers[6];
  const admin: SignerWithAddress = signers[7];

  // Deploy  token

  const CarboTokenv1: ContractFactory = await ethers.getContractFactory(
    "CarboToken"
  );

  const carboTokenv1 = await CarboTokenv1.deploy();

  const testToken = await CarboTokenv1.deploy();

  const CarboTokenv2: ContractFactory = await ethers.getContractFactory(
    "CarboTokenv2"
  );

  const carboToken = await CarboTokenv2.deploy(
    owner.address,
    buybacks.address,
    treasury.address,
    getStartDay()
  );

  const AirdropCarbonv2: ContractFactory = await ethers.getContractFactory(
    "AirdropCarbonv2"
  );

  const airdrop = await AirdropCarbonv2.deploy(
    owner.address,
    carboTokenv1.address,
    carboToken.address
  );

  const StakingCarbon: ContractFactory = await ethers.getContractFactory(
    "StakingCarbon"
  );

  const staking = await StakingCarbon.deploy(owner.address, carboToken.address);

  //get token by snapshotting v1 for v2

  // -> Step 1 : grant role admin to admin address
  const ADMIN = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN"));

  await carboToken.connect(owner).grantRole(ADMIN, admin.address);

  // ->  Step 2: release token to airdrop contract use admin account .. only Admin can call

  await carboToken.connect(admin).releaseForAirdrop(airdrop.address);

  // -> Step 3: User should approve v1 for airdrop contract burn token
  await carboTokenv1
    .connect(owner)
    .approve(airdrop.address, ethers.utils.parseEther("10000000"));

  // -> Step 4: airdrop
  await airdrop.connect(owner).airdrop(ethers.utils.parseEther("10000000"));

  // grant Role admin for staking contract

  await staking.connect(owner).grantRole(ADMIN, admin.address);
  await testToken
    .connect(owner)
    .transfer(airdrop.address, ethers.utils.parseEther("10"));

  await testToken
    .connect(owner)
    .transfer(carboToken.address, ethers.utils.parseEther("10"));

  await testToken
    .connect(owner)
    .transfer(staking.address, ethers.utils.parseEther("10"));

  return {
    owner,
    account1,
    account2,
    account3,
    operator,
    buybacks,
    treasury,
    admin,

    carboTokenv1,
    carboToken,
    airdrop,
    staking,
    testToken,
  };
}
