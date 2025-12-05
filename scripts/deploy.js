
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting Deployment for Celo Alfajores...");

    // Check if we have a signer from config
    const accounts = await hre.ethers.getSigners();
    let deployer;

    if (accounts.length > 0) {
        deployer = accounts[0];
        console.log("✅ Using configured account:", deployer.address);
    } else {
        // Generate a random wallet if no config
        const wallet = ethers.Wallet.createRandom();
        const provider = new ethers.JsonRpcProvider("https://alfajores-forno.celo-testnet.org");
        deployer = wallet.connect(provider);

        console.log("\n⚠️  NO PRIVATE KEY FOUND IN CONFIG ⚠️");
        console.log("----------------------------------------------------");
        console.log("Generating temporary deployer wallet...");
        console.log("Address:", deployer.address);
        console.log("Private Key:", deployer.privateKey);
        console.log("----------------------------------------------------");
        console.log("\n👉 ACTION REQUIRED: Go to https://faucet.celo.org/alfajores");
        console.log(`👉 Paste this address: ${deployer.address}`);
        console.log("👉 Click 'Faucet'");
        console.log("\nWaiting 60 seconds for funds...");

        // Wait loop
        for (let i = 0; i < 12; i++) {
            await new Promise(r => setTimeout(r, 5000));
            process.stdout.write(".");
            const balance = await provider.getBalance(deployer.address);
            if (balance > 0) {
                console.log("\n\n💰 Funds received! Balance:", ethers.formatEther(balance), "CELO");
                break;
            }
        }

        const balance = await provider.getBalance(deployer.address);
        if (balance === 0n) {
            console.error("\n❌ No funds received after waiting. Please fund the wallet and run again with PRIVATE_KEY set.");
            process.exit(1);
        }
    }

    // Deploy
    console.log("\n📄 Deploying ReFiBadge...");
    const ReFiBadge = await hre.ethers.getContractFactory("ReFiBadge");
    // Connect the deployer explicitly
    const contract = await ReFiBadge.connect(deployer).deploy(deployer.address);

    await contract.waitForDeployment();

    const address = await contract.getAddress();

    console.log("----------------------------------------------------");
    console.log("🎉 CONTRACT DEPLOYED SUCCESSFULLY!");
    console.log("📍 Address:", address);
    console.log("----------------------------------------------------");
    console.log("👉 SAVE THIS ADDRESS for your Proof of Ship submission!");
    console.log("👉 Add this to your .env.local: NEXT_PUBLIC_CONTRACT_ADDRESS=" + address);
    if (!accounts.length) {
        console.log("👉 Add this to your .env.local: PRIVATE_KEY=" + deployer.privateKey);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
