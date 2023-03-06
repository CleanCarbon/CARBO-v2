import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { deployFixture } from "./utils/fixture";
import { expect } from "chai";
import Web3 from "web3";

import { increase, latest } from "./utils/time";

const ADMIN = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN"));

type StakingOption = {
  Gold: {};
  Platinum: {};
  Diamond: {};
};

describe("staking contract test", () => {
  let owner: any;
  let account1: any;
  let account2: any;
  let account3: any;
  let operator: any;
  let buybacks: any;
  let treasury: any;
  let admin: any;

  let carboTokenv1: any;
  let carboToken: any;
  let airdrop: any;
  let staking: any;

  beforeEach("Create fixture loader", async () => {
    ({
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
    } = await loadFixture(deployFixture));
  });

  describe("Create pool", async () => {
    let result: any;
    it("Should revert when add Pool by user acc", async () => {
      const account1Acc = account1.address.toLowerCase();

      const revertedReason = `AccessControl: account ${account1Acc} is missing role ${ADMIN}`;

      await expect(
        staking
          .connect(account1)
          .addStakingPayload(createStakingOpstionsPayload()[0])
      ).revertedWith(revertedReason);
    });

    it("Should success when addPool by admin", async () => {
      result = await staking
        .connect(admin)
        .addStakingPayload(createStakingOpstionsPayload()[0]);
    });

    it("should event correct event ", async function () {
      result = await staking
        .connect(admin)
        .addStakingPayload(createStakingOpstionsPayload()[0]);

      // console.log(await staking.stakingOptionsStorage(0));
      const eventFilter = staking.filters.AddPoolSuccessful();
      const events = await staking.queryFilter(
        eventFilter,
        result.blockNumber,
        result.blockNumber
      );
      expect(events[0].args?.poolId).to.equal(0);
      expect(events[0].args?.payload.name).to.equal("Package Gold");
      expect(events[0].args?.payload.lockDurations).to.equal(
        BigNumber.from("7776000")
      );
      expect(events[0].args?.payload.requiredToken).to.equal(
        BigNumber.from(ethers.utils.parseEther("30000"))
      );
      expect(events[0].args?.payload.isActive).to.equal(true);
    });

    it("Should have correct data", async () => {
      await staking
        .connect(admin)
        .addStakingPayload(createStakingOpstionsPayload()[0]);

      result = await staking.stakingOptionsStorage(0);

      expect(result.name).to.equal("Package Gold");
      expect(result.lockDurations).to.equal(BigNumber.from("7776000"));
      expect(result.requiredToken).to.equal(
        BigNumber.from(ethers.utils.parseEther("30000"))
      );
      expect(result.isActive).to.equal(true);
    });
  });

  describe("staking", async () => {
    beforeEach("create pool first", async () => {
      await staking
        .connect(admin)
        .addStakingPayload(createStakingOpstionsPayload()[0]);
      await staking
        .connect(admin)
        .addStakingPayload(createStakingOpstionsPayload()[1]);
      await staking
        .connect(admin)
        .addStakingPayload(createStakingOpstionsPayload()[2]);

      // acc1 -> 50k token

      await carboToken
        .connect(owner)
        .transfer(account1.address, ethers.utils.parseEther("100000"));

      // console.log(await staking.stakingOptionsStorage(0));
      // console.log(await staking.stakingOptionsStorage(1));
      // console.log(await staking.stakingOptionsStorage(2));
    });

    it("should revert when stake wrong package", async () => {
      const revertedReason = `Wrong package`;

      await expect(staking.connect(account1).stake(3)).revertedWith(
        revertedReason
      );
    });

    it("should revert when not approve token for staking contract", async () => {
      const revertedReason = `ERC20: insufficient allowance`;

      await expect(staking.connect(account1).stake(2)).revertedWith(
        revertedReason
      );
    });

    it("should stake successful", async () => {
      await carboToken
        .connect(account1)
        .approve(staking.address, ethers.utils.parseEther("30000"));

      // before stake
      expect(await carboToken.balanceOf(account1.address)).to.equal(
        BigNumber.from(ethers.utils.parseEther("100000"))
      );
      expect(await carboToken.balanceOf(staking.address)).to.equal(
        BigNumber.from(ethers.utils.parseEther("0"))
      );

      // stake
      expect(await staking.connect(account1).stake(0));

      // after stake
      expect(await carboToken.balanceOf(account1.address)).to.equal(
        BigNumber.from(ethers.utils.parseEther("70000"))
      );
      expect(await carboToken.balanceOf(staking.address)).to.equal(
        BigNumber.from(ethers.utils.parseEther("30000"))
      );
    });

    it("should stake and save data successful", async () => {
      await carboToken
        .connect(account1)
        .approve(staking.address, ethers.utils.parseEther("30000"));
      const stakeRes = await staking.connect(account1).stake(0);

      let block = await ethers.provider.getBlock(stakeRes.blockNumber);
      // console.log(block);
      const result = await staking.userStateStorage(account1.address);
      // console.log(result);
      expect(result.latestUpdate).to.equal(BigNumber.from(block.timestamp));

      expect(result.package).to.equal(0);
    });

    it("should stake and event correct event ", async () => {
      await carboToken
        .connect(account1)
        .approve(staking.address, ethers.utils.parseEther("30000"));
      const stakeRes = await staking.connect(account1).stake(0);

      const eventFilter = staking.filters.StakeSuccessful();
      const events = await staking.queryFilter(
        eventFilter,
        stakeRes.blockNumber,
        stakeRes.blockNumber
      );
      expect(events[0].args?.user).to.equal(account1.address);
      expect(events[0].args?.stakePackage).to.equal(BigNumber.from(0));

      let block = await ethers.provider.getBlock(stakeRes.blockNumber);
      // console.log(block);
      expect(events[0].args?.stakeStart).to.equal(
        BigNumber.from(block.timestamp)
      );
    });

    it("should revert when user try to stake, restake, unstake when not success yet", async () => {
      await carboToken
        .connect(account1)
        .approve(staking.address, ethers.utils.parseEther("30000"));
      const stakeRes = await staking.connect(account1).stake(0);

      let reason = "User already stake in pool";
      await expect(staking.connect(account1).stake(2)).revertedWith(reason);

      reason = "User have to pass lock duration";
      await expect(staking.connect(account1).restake()).revertedWith(reason);

      reason = "user did not stake yet or still in lock duration";
      await expect(staking.connect(account1).unstake()).revertedWith(reason);
    });
  });

  describe("restake", async () => {
    beforeEach("create pool first", async () => {
      await staking
        .connect(admin)
        .addStakingPayload(createStakingOpstionsPayload()[0]);
      await staking
        .connect(admin)
        .addStakingPayload(createStakingOpstionsPayload()[1]);
      await staking
        .connect(admin)
        .addStakingPayload(createStakingOpstionsPayload()[2]);

      // acc1 -> 50k token

      await carboToken
        .connect(owner)
        .transfer(account1.address, ethers.utils.parseEther("100000"));

      await carboToken
        .connect(account1)
        .approve(staking.address, ethers.utils.parseEther("30000"));

      await staking.connect(account1).stake(0);

      // console.log(await staking.stakingOptionsStorage(0));
      // console.log(await staking.stakingOptionsStorage(1));
      // console.log(await staking.stakingOptionsStorage(2));
    });

    it("Should success when time pass and restake successful ", async () => {
      await increase(
        BigNumber.from(createStakingOpstionsPayload()[0].lockDurations)
      );

      expect(await staking.connect(account1).restake());
    });
  });

  describe("unstake", async () => {
    beforeEach("create pool first", async () => {
      await staking
        .connect(admin)
        .addStakingPayload(createStakingOpstionsPayload()[0]);
      await staking
        .connect(admin)
        .addStakingPayload(createStakingOpstionsPayload()[1]);
      await staking
        .connect(admin)
        .addStakingPayload(createStakingOpstionsPayload()[2]);

      // acc1 -> 50k token

      await carboToken
        .connect(owner)
        .transfer(account1.address, ethers.utils.parseEther("100000"));

      await carboToken
        .connect(account1)
        .approve(staking.address, ethers.utils.parseEther("30000"));

      await staking.connect(account1).stake(0);

      // console.log(await staking.stakingOptionsStorage(0));
      // console.log(await staking.stakingOptionsStorage(1));
      // console.log(await staking.stakingOptionsStorage(2));
    });

    it("Should success when time pass and unstake successful ", async () => {
      await increase(
        BigNumber.from(createStakingOpstionsPayload()[0].lockDurations)
      );

      expect(await staking.connect(account1).unstake());
    });
  });
});

const createStakingOpstionsPayload: () => Array<any> = function (): Array<any> {
  return [
    {
      name: "Package Gold",
      lockDurations: "7776000",
      requiredToken: ethers.utils.parseEther("30000"),
      isActive: true,
    },
    {
      name: "Package Platinum",
      lockDurations: "15552000",
      requiredToken: ethers.utils.parseEther("75000"),
      isActive: true,
    },
    {
      name: "Package Diamond",
      lockDurations: "31104000",
      requiredToken: ethers.utils.parseEther("200000"),
      isActive: true,
    },
  ];
};
