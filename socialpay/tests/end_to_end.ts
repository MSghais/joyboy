import { connectToStarknet, createStarknetWallet } from "../src/utils/starknet";
import { generateKeypair, sendEvent } from "../src/utils/nostr";
import { checkAndFilterSocialPayContent } from "../src/utils/check";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

/** Requirements
 * Run in local: SocialPay relayer, Nostr relayer, Starknet dev
 *
 * Create a Starknet account
 * Create two keypair for nostr
 */
export const endToEndTest = async () => {
  /** Generate starknet account */

  const provider = await connectToStarknet();

  const privateKey = createStarknetWallet()

  /**  Generate keypair for both account*/
  // Bob nostr account

  let { privateKey: pkBob, publicKey: bobPublicKey } = generateKeypair();

  // Alice nostr account
  let { privateKey: pkAlice, publicKey: alicePublicKey } = generateKeypair();

  /** Send a note */
  let contentRequest = "@joyboy send 10 USDC to @alice.xyz";
  let content = "a test";
  let request = checkAndFilterSocialPayContent(content);

  console.log("request", request);
  let { event, isValid } = await sendEvent(pkBob, contentRequest);
  console.log("event", event);

  /** Add the backend call */

  // let res = await axios.post("http://localhost:8080/pay", {event:note})

  let res = await axios.post("http://localhost:8080/pay", { event: event });
  console.log("res", res?.data);

  return;
};
