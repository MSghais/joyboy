import { connectToStarknet, createStarknetWallet } from "../utils/starknet";
import { generateKeypair, sendEvent } from "../utils/nostr";
import { checkAndFilterSocialPayContent } from "../utils/check";
import dotenv from "dotenv";
import axios from "axios";
import { logDev } from "../utils/log";
dotenv.config();

/** Requirements
 * Run in local: SocialPay relayer, Nostr relayer, Starknet dev
 *
 * Create a Starknet account
 * Create two keypair for nostr
 * Send a note with a content format for Social Pay request
 * Call the Social relayer
 */
export const endToEndTest = async () => {
  try {
    /** Generate starknet account for Paymaster*/
    const provider = await connectToStarknet();
    const privateKey = createStarknetWallet();

    /**  Generate keypair for both account*/
    // Bob nostr account
    let { privateKey: pkBob, publicKey: bobPublicKey } = generateKeypair();

    // Alice nostr account
    let { privateKey: pkAlice, publicKey: alicePublicKey } = generateKeypair();

    /** Send a note */
    let contentRequest = "@joyboy send 10 USDC to @alice.xyz";
    let content = "a test";
    // Check request, need to be undefined
    let request = checkAndFilterSocialPayContent(content);
    logDev(`first request need to be undefined request ${request}`);

    // Check request, need to be defined with sender, amount, token, recipient
    request = checkAndFilterSocialPayContent(contentRequest);
    logDev(`second request = ${JSON.stringify(request)}`);

    let { event, isValid } = await sendEvent(pkBob, contentRequest);
    console.log("event", event);


    /** @TODO init all account for users */

    /**@TODO Finish the relayer callback */
    let res = await axios.post("http://localhost:8080/pay", { event: event });
    console.log("res", res?.data);

    return;
  } catch (e:any) {
    console.log("endToEndTest", e);
  }
};
