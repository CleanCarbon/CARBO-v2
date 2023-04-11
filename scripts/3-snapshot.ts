import Web3 from "web3";

import * as dotenv from "dotenv";
dotenv.config();

const ethUtil = require("ethereumjs-util");
import * as fs from "fs";

const web3 = new Web3(process.env.URL!);

const user_pk = process.env.PK;

const user = web3.eth.accounts.privateKeyToAccount(user_pk!).address;

const airdrop = "0xeC332940F404dfE6Fa71508E8D13C6b4B246C356";
const amount = "100000000000000000000000"

async function main() {
  const AirdropCarbonv2 = JSON.parse(
    fs.readFileSync(
      "./artifacts/contracts/AirdropCarbonv2.sol/AirdropCarbonv2.json",
      "utf-8"
    )
  ).abi;
  const contractStaking = new web3.eth.Contract(AirdropCarbonv2, airdrop);

  {
    
    var txCount = await web3.eth.getTransactionCount(user);
    var txData = contractStaking.methods
      .airdrop(
        amount
      )
      .encodeABI();
    var txObj = {
      nonce: txCount,
      gasLimit: web3.utils.toHex(1000000),
      data: txData,
      to: airdrop,
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