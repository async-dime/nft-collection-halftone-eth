const { ethers } = require('hardhat');
require('dotenv').config({ path: '.env' });
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } = require('../constants');

const main = async () => {
  // Address of the whitelist contract that you deployed in the previous module
  const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
  // URL from where we can extract the metadata for a Halftone Eth NFT
  const metadataURL = METADATA_URL;
  /*
    A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
    so halftoneEthContract here is a factory for instances of our HalftoneEth contract.
    */
  const halftoneEthContract = await ethers.getContractFactory('HalftoneEth');

  // deploy the contract
  const deployedHalftoneEthContract = await halftoneEthContract.deploy(
    metadataURL,
    whitelistContract
  );

  // print the address of the deployed contract
  console.log(
    'Halftone Eth Contract Address:',
    deployedHalftoneEthContract.address
  );
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (err) {
    console.error('Error deploying the Halftone Eth contract', err);
    process.exit(1);
  }
};

runMain();
