const { Account, Ed25519Account } = require('@aptos-labs/ts-sdk');
const nacl = require('tweetnacl');

async function run() {
  try {
    const account = Account.generate();
    const message = "Sign in to SafeSwap securely.";
    
    // Simulate what the wallet adapter does
    const fullMessage = `APTOS\nmessage: ${message}\nnonce: 12345`;
    
    // Sign the full message
    const signature = account.sign(Buffer.from(fullMessage, 'utf8'));
    
    // Convert to hex (simulating what the frontend sends)
    const sigHex = signature.toString(); // in TS SDK this returns HexString
    const pubKeyHex = account.publicKey.toString();
    
    // Backend verification logic
    const cleanHex = (hex) => hex.startsWith('0x') ? hex.slice(2) : hex;
    
    const msgBytes = Buffer.from(fullMessage, 'utf8');
    const sigBytes = Buffer.from(cleanHex(sigHex), 'hex');
    const pubKeyBytes = Buffer.from(cleanHex(pubKeyHex), 'hex');
    
    const isValid = nacl.sign.detached.verify(msgBytes, sigBytes, pubKeyBytes);
    console.log("Verification result:", isValid);
  } catch (err) {
    console.error("Test failed:", err);
  }
}
run();
