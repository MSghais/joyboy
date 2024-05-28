import { RpcProvider, ec, stark } from "starknet";

export const createStarknetWallet = () => {
  try {
    const privateKey = stark.randomAddress();
    console.log("New privateKey=", privateKey);
    const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
    console.log("publicKey=", starkKeyPub);
    return privateKey;
  } catch (e) {
    return undefined;
  }
};
export function connectToStarknet(nodeUrl?: string) {
  try {
    return new RpcProvider({
      nodeUrl: nodeUrl ?? (process.env.RPC_ENDPOINT as string),
    });
  } catch (e) {}
}
