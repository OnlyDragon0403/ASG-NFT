const hre = require("hardhat");
const { run } = require("hardhat")
async function main() {
  const asg = await hre.ethers.getContractFactory("ASG");
  const ASG = await asg.deploy();
  await ASG.deployed();

  console.log("ASG deployed to:", ASG.address);
  
  const address = ASG.address

  const args = [];
  // Verify Contract
  await run("verify:verify", {
    address: address,
    constructorArguments: args,
    contract: "contracts/ASG.sol:ASG"
 });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


  