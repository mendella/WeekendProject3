import { mnemonicToEntropy } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { MyToken__factory } from "../typechain-types";

const MINT_VALUE = ethers.utils.parseEther("10");


async function main() {
    const accounts = await ethers.getSigners();
    //deploy the contract
    const contractFactory = new MyToken__factory(accounts[0]);
    const contract = await contractFactory.deploy();
    await contract.deployed();
    console.log(`Token Contract deployed at ${contract.address}`);

    //mint some tokens
    const mintTx = await contract.mint(accounts[1].address, MINT_VALUE);
    await mintTx.wait();
    console.log(`Minted ${MINT_VALUE.toString()} decimal units to account ${ accounts[1].address}\n`);

    const balanceBN = await contract.balanceOf(accounts[1].address);
    console.log(`Account ${accounts[1].address} has ${balanceBN.toString()} decimals units of MyToken\n`);
    
    // check the voting power
    const votes = await contract.getVotes(accounts[1].address);
    console.log(`Account ${accounts[1].address} has ${votes.toString()} units of voting power before self delegating\n`);
    
    // self delegate
    const delegateTx = await contract.connect(accounts[1]).delegate(accounts[1].address);
    //console.log(`Account ${accounts[1].address} has ${delegateTx.toString()} units of voting power after self delegating\n`);
    
    //check the voting power
    const votesAfter = await contract.getVotes(accounts[1].address);
    console.log(`Account ${accounts[1].address} has ${votesAfter.toString()} units of voting power after self delegating\n`);
    
    // transfer tokens
    const transferTx = await contract.connect(accounts[1]).transfer(accounts[2].address, MINT_VALUE.div(2));
    await transferTx.wait();
     //check the voting power
     const votes1AfterTransfer = await contract.getVotes(accounts[1].address);
     console.log(`Account ${accounts[1].address} has ${votes1AfterTransfer.toString()} units of voting power after transfering\n`);
        
     const votes2AfterTransfer = await contract.getVotes(accounts[2].address);
     console.log(`Account ${accounts[2].address} has ${votes2AfterTransfer.toString()} units of voting power after receiving a transfer\n`);
     
    //check past voting power
    const lastBlock = await ethers.provider.getBlock("latest");
    console.log(`Current block number is  ${lastBlock.number}\n`);
    const pastVotes = await contract.getPastVotes(accounts[1].address, lastBlock.number - 1);

    console.log(`Account ${accounts[1].address} has ${pastVotes.toString()} units of voting power at previous block\n`);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});