import Web3 from "web3";

import * as dotenv from "dotenv";
dotenv.config();

const ethUtil = require("ethereumjs-util");
import * as fs from "fs";

const web3 = new Web3(process.env.URL!);

const user_pk = process.env.PK;

const user = web3.eth.accounts.privateKeyToAccount(user_pk!).address;

const token = "0x21c2718a8e44c2ca224eec38124e3eb307c27bfa";
const approve_to = "0x383A03e0592b7dA73B44F5c898b24176980E372d"
async function main() {
  const CarboTokenv2 = JSON.parse(
    fs.readFileSync(
      "./artifacts/contracts/CarboTokenv2.sol/CarboTokenv2.json",
      "utf-8"
    )
  ).abi;
  const contractToken = new web3.eth.Contract(CarboTokenv2, token);

  {
    
    var txCount = await web3.eth.getTransactionCount(user);
    var txData = contractToken.methods
      .approve(
        approve_to,
        "10000000000100000000001000000000010000000000"
      )
      .encodeABI();
    var txObj = {
      nonce: txCount,
      gasLimit: web3.utils.toHex(1000000),
      data: txData,
      to: token,
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