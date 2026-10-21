const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const Vault = await hre.ethers.getContractFactory("blockapp");
  const vault = await Vault.deploy();
  await vault.waitForDeployment();

  const address = await vault.getAddress();
  const receipt = await vault.deploymentTransaction().wait();
  const { chainId } = await hre.ethers.provider.getNetwork();
  const artifact = await hre.artifacts.readArtifact("blockapp");

  const dir = path.join(__dirname, "..", "..", "web", "src", "contracts");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "blockapp.json"),
    JSON.stringify({ address, chainId: Number(chainId), block: receipt.blockNumber, abi: artifact.abi }, null, 2)
  );

  console.log("blockapp deployed to:", address);
  console.log("Admin (deployer):      ", deployer.address);
  console.log("Deployed in block:     ", receipt.blockNumber);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });