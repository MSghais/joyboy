import { Uint256 } from "starknet";

export function pubkeyToUint256(pubkey: string): Uint8Array {
  // Ensure the public key is 64 hexadecimal characters (32 bytes)
  if (pubkey.length !== 64) {
    throw new Error("Invalid public key length");
  }

  // Convert the hex string to a Uint8Array
  const uint256 = new Uint8Array(Buffer.from(pubkey, "hex"));

  return uint256;
}

export function uint8ArrayToBigInt(uint8Array: Uint8Array): BigInt {
  let hexString = "0x";
  for (const byte of uint8Array) {
    hexString += byte.toString(16).padStart(2, "0");
  }
  return BigInt(hexString);
}

// Convert a Nostr public key (hex string) into a Uint256 for Cairo
export function nostrPubkeyToUint256(pubkey: string): Uint256 {
  // Ensure the public key is 64 hexadecimal characters (32 bytes)
  if (pubkey.length !== 64) {
    throw new Error("Invalid public key length");
  }

  // Convert the hex string to a Uint8Array
  const uint8Array = new Uint8Array(Buffer.from(pubkey, "hex"));

  // Split the Uint8Array into two 128-bit segments
  const lowBytes = uint8Array.slice(16); // Last 16 bytes
  const highBytes = uint8Array.slice(0, 16); // First 16 bytes

  // Convert the 128-bit segments into BigInt
  const low = BigInt("0x" + Buffer.from(lowBytes).toString("hex"));
  const high = BigInt("0x" + Buffer.from(highBytes).toString("hex"));

  return { low, high };
}


// Convert a hex string into a Uint256 for Cairo
export function hexStringToUint256(hexString: string): Uint256 {
  // Remove the leading '0x' if present
  if (hexString.startsWith('0x')) {
    hexString = hexString.slice(2);
  }

  // Ensure the hex string is 64 characters (32 bytes)
  if (hexString.length !== 64) {
    throw new Error('Invalid hex string length');
  }

  // Convert the hex string to a Uint8Array
  const uint8Array = new Uint8Array(Buffer.from(hexString, 'hex'));

  // Split the Uint8Array into two 128-bit segments
  const highBytes = uint8Array.slice(0, 16); // First 16 bytes
  const lowBytes = uint8Array.slice(16); // Last 16 bytes

  // Convert the 128-bit segments into BigInt
  const high = BigInt('0x' + Buffer.from(highBytes).toString('hex'));
  const low = BigInt('0x' + Buffer.from(lowBytes).toString('hex'));

  return { low, high };
}