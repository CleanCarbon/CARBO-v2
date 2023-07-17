import Web3 from "web3";

import * as dotenv from "dotenv";
dotenv.config();

const ethUtil = require("ethereumjs-util");
import * as fs from "fs";

const web3 = new Web3(process.env.URL!);

const user_pk = process.env.PK;

const user = web3.eth.accounts.privateKeyToAccount(user_pk!).address;

const stakingCarbon = "0xF1c6f4ef06bc1C2cD6B2517DE5F26C1a4EaD614B";
const owner = "0x1425234cc5F42D2aAa2db1E2088CeC81E6caaF9E";

async function main() {
  const StakingCarbon = JSON.parse(
    fs.readFileSync(
      "./artifacts/contracts/StakingCarbon.sol/StakingCarbon.json",
      "utf-8"
    )
  ).abi;
  const contractStaking = new web3.eth.Contract(StakingCarbon, stakingCarbon);

  {
    var txCount = await web3.eth.getTransactionCount(user);
    // var txData = contractStaking.methods
    //   .grantRole(
    //     "0x0000000000000000000000000000000000000000000000000000000000000000",
    //     owner
    //   )
    //   .encodeABI();

    var txData = contractStaking.methods
      .grantRole(
        "0xdf8b4c520ffe197c5343c6f5aec59570151ef9a492f2c624fd45ddde6135ec42",
        owner
      )
      .encodeABI();
    var txObj = {
      nonce: txCount,
      gasLimit: web3.utils.toHex(50000),
      data: txData,
      to: stakingCarbon,
      from: user,
    };

    var signedTx = await web3.eth.accounts.signTransaction(txObj, user_pk!);
    var result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction!);
    console.log(result);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
