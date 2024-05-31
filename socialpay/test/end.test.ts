import { connectToStarknet, createStarknetWallet } from "../utils/starknet";
import { expect } from "chai";
import { generateKeypair, sendEvent } from "../utils/nostr";
import { checkAndFilterSocialPayContent } from "../utils/check";
import { logDev } from "../utils/log";
import { createSocialAccount } from "../utils/social_account";
import { createToken, getToken } from "../utils/token";
import { Account, RpcProvider, cairo, stark } from "starknet";
const STARKNET_URL = process.env.RPC_ENDPOINT || "http://127.0.0.1:5050";

describe("End to end function", () => {
  // it("Pay End to end test", async () => {
  it("Pay End to end test", async function () {
    this.timeout(0); // Disable timeout for this test
    /** Generate starknet account for Paymaster*/
    // const provider = await connectToStarknet();
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
    // console.log("token", token);

    // let tokenA = await createToken();
    const privateKey0 = process.env.DEVNET_PK as string;
    const accountAddress0 = process.env.DEVNET_PUBLIC_KEY as string;
    const provider = new RpcProvider({ nodeUrl: STARKNET_URL });

    const account = new Account(provider, accountAddress0, privateKey0, "1");

    // let uint = cairo.felt(100)
    // console.log("uint supply",uint.toString())
    // console.log("0x02a81245Cc288B79911E7a5C5B6D75F437fd602a3d9e0BC30d535283b5974658",cairo.felt("0x02a81245Cc288B79911E7a5C5B6D75F437fd602a3d9e0BC30d535283b5974658"))
    // let token = await getToken(
    //   // "0x00148a15f9fbf4c015b927bf88608fbafb6d149abdd5ef5b3e3b296e6ac999a4"
    //   "0x05c49bee556c6bb9d2f5e3e1a386e49ac29d3896e680bf96f37d993eb7fb1dad"
    // );
    console.log("transfer erc20");
    // Connect account with the contract
    // token?.connect(account);
    // Interactions with the contract with meta-class
    // const bal1 = await token?.functions.transfer(account?.address, 1);
    // let transfer = await token?.transfer(account?.address, 1);
    // console.log("transfer erc20", transfer);

    console.log("create social account")
    let accountBob = await createSocialAccount(bobPublicKey);

    // let accountAlice = await createSocialAccount(bobPublicKey);
  });
});
