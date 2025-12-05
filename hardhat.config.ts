
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config({ path: ".env.local" });

const config: HardhatUserConfig = {
    solidity: "0.8.20",
    networks: {
        alfajores: {
            url: "https://alfajores-forno.celo-testnet.org",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 44787,
        },
        celo: {
            url: "https://forno.celo.org",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 42220,
        },
    },
};

export default config;
