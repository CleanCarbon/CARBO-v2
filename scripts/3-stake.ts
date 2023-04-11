import Web3 from "web3";

import * as dotenv from "dotenv";
dotenv.config();

const ethUtil = require("ethereumjs-util");
import * as fs from "fs";

const web3 = new Web3(process.env.URL!);

const user_pk = process.env.PK;

const user = web3.eth.accounts.privateKeyToAccount(user_pk!).address;

const stakingCarbon = "0x47Be3aB7e798Ce0135E99798c485178bD13f1ab4";

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
    var txData = contractStaking.methods
      .stake(
        0
      )
      .encodeABI();
    var txObj = {
      nonce: txCount,
      gasLimit: web3.utils.toHex(1000000),
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