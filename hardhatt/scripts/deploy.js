const {ethers} = require("hardhat")
require("dotenv").config({path:".env"});
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } = require("../constants");

async function main() {
  const whitelistContarct = WHITELIST_CONTRACT_ADDRESS;

  const metadataURL = METADATA_URL;

  const cryptoDevsContract = await ethers.getContractFactory("CryptoDevs");

  const deployedCryptoDevsContract = await cryptoDevsContract.deploy(
    metadataURL,
    whitelistContarct
  );

  console.log("Crypto Devs Contract Address is:",deployedCryptoDevsContract.address)
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});
