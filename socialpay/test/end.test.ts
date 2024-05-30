import { connectToStarknet, createStarknetWallet } from "../utils/starknet";
import { expect } from "chai";
import { generateKeypair, sendEvent } from "../utils/nostr";
import { checkAndFilterSocialPayContent } from "../utils/check";
import { logDev } from "../utils/log";
import { createSocialAccount } from "../utils/social_account";
import { createToken } from "../utils/token";

describe("End to end function", () => {
  // it("Pay End to end test", async () => {
  it("Pay End to end test", async function () {
    this.timeout(0); // Disable timeout for this test
    /** Generate starknet account for Paymaster*/
    const provider = await connectToStarknet();
    const privateKey = createStarknetWallet();

    /**  Generate keypair for both account*/
    // Bob nostr account
    let { privateKey: pkBob, publicKey: bobPublicKey } = generateKeypair();

    // Alice nostr account
    let { privateKey: pkAlice, publicKey: alicePublicKey } = generateKeypair();

    /** Send a note */
    let contentRequest = "@joyboy send 10 STRK to @alice.xyz";
    let content = "a test";
    // Check request, need to be undefined
    let request = checkAndFilterSocialPayContent(content);
    logDev(`first request need to be undefined request ${request}`);
    expect(request).to.eq(undefined);

    // Check request, need to be defined with sender, amount, token, recipient
    request = checkAndFilterSocialPayContent(contentRequest);
    logDev(`second request = ${JSON.stringify(request)}`);
    expect(true).to.eq(true);
    console.log("request", request);
    expect(request).to.deep.eq({
      sender: "@joyboy",
      receiver: "@alice.xyz",
      currency: "STRK",
      amount: 10,
      isValidAddress: false,
    });

    // Send an event predefined sig for the onchain contract request
    let { event, isValid } = await sendEvent(pkBob, contentRequest);
    console.log("event", event);

    /** @TODO Look SocialAccount Starknet key*/

    /*** Starknet handle_transfer call for SocialPay request
     * @TODO We need to have an hard check for the pubkey before sending tx
     ***/

    /***
     * Get both account for Bob & Alice
     * Send request of account bob to alice
     */

    let tokenA = await createToken();

    // let accountBob = await createSocialAccount(bobPublicKey);

    // let accountAlice = await createSocialAccount(bobPublicKey);
  });
});
