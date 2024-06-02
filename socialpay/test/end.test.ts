import {
  connectToStarknet,
  createStarknetWallet,
  provider,
} from "../utils/starknet";
import { expect } from "chai";
import { generateKeypair, sendEvent } from "../utils/nostr";
import {
  checkAndFilterSocialPayContent,
  getProfilesByNames,
} from "../utils/check";
import { logDev } from "../utils/log";
import {
  createSocialAccount,
  createSocialContract,
  prepareAndConnectContract,
} from "../utils/social_account";
import { createToken, getToken, transferToken } from "../utils/token";
import { Account, Call, CallData, cairo, ec, stark, uint256 } from "starknet";
import { SocialPayRequest } from "types";
import { ACCOUNT_TEST_PROFILE, TOKENS_ADDRESS } from "../src/constants";
import { nostrPubkeyToUint256 } from "../utils/format";
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
    // let { privateKey: pkAlice, publicKey: alicePublicKey } = generateKeypair();

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
    let { event, isValid, signature } = await sendEvent(pkBob, contentRequest);
    console.log("event", event);

    /** @TODO Look SocialAccount Starknet key*/

    /*** Starknet handle_transfer call for SocialPay request
     * @TODO We need to have an hard check for the pubkey before sending tx
     ***/

    /***
     * Get both account for Bob & Alice
     * Send request of account bob to alice
     */
    // const provider = new RpcProvider({ nodeUrl: STARKNET_URL });
    // const provider = new RpcProvider();

    const resp = await provider.getSpecVersion();
    console.log("rpc version =", resp);

    const privateKey0 = process.env.DEVNET_PK as string;
    const accountAddress0 = process.env.DEVNET_PUBLIC_KEY as string;
    const account = new Account(provider, accountAddress0, privateKey0, "1");

    // Interactions with the contract with meta-class
    // const bal1 = await token?.transfer(account?.address, cairo.uint256(1));
    // console.log("bal1", bal1);

    // let transfer = await token?.transfer(account?.address, cairo.uint256(2));
    // console.log("transfer erc20", transfer);

    // let uint = cairo.felt(100)
    // console.log("uint supply",uint.toString())
    // console.log("0x02a81245Cc288B79911E7a5C5B6D75F437fd602a3d9e0BC30d535283b5974658",cairo.felt("0x02a81245Cc288B79911E7a5C5B6D75F437fd602a3d9e0BC30d535283b5974658"))

    // Connect account with the contract

    // let token = await getToken(TOKENS_ADDRESS.SEPOLIA.ETH)
    // let token = await createToken();

    // await transferToken(
    //   account,
    //   account?.address,
    //   "0x49D36570D4E46F48E99674BD3FCC84644DDD6B96F7C741B1562B82F9E004DC7"
    //   // "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
    // );

    // let token = await getToken(
    //   // "0x00148a15f9fbf4c015b927bf88608fbafb6d149abdd5ef5b3e3b296e6ac999a4"
    //   "0x05c49bee556c6bb9d2f5e3e1a386e49ac29d3896e680bf96f37d993eb7fb1dad"
    // // );
    // let token = await getToken(TOKENS_ADDRESS.SEPOLIA.ETH);

    // token?.connect(account);
    // console.log("transfer ETH to AA Account");

    // token?.connect(account);

    // const name = await token?.name();
    // console.log("name", name);

    // console.log("transfer erc20");
    // // let transfer = await token?.transfer(AAcontractAddress, "0.003")
    // // let transfer = await token?.transfer(AAcontractAddress, cairo.uint256(1/10**18))
    // // let transfer = await token?.transfer(AAcontractAddress, cairo.uint256("1"))
    // const balanceInitial = await token?.balanceOf(account.address);
    // console.log("account0 has a balance of:", balanceInitial);

    // // Execute tx transfer of 1 tokens to account 1
    // console.log(`Invoke Tx - Transfer 1 tokens to erc20 contract...`);
    // const toTransferTk: Uint256 = cairo.uint256(1 * 10 ** 18);
    // const transferCall: Call | undefined = token?.populate("transfer", {
    //   // recipient: '0x78662e7352d062084b0010068b99288486c2d8b914f6e2a55ce945f8792c8b1',
    //   // recipient: account0?.address,
    //   recipient: AAstarkKeyPub,
    //   amount: toTransferTk,
    // });
    // if (transferCall) {
    //   let estimateFee = await account?.estimateInvokeFee(transferCall);
    //   console.log("estimateFee", estimateFee);
    //   const { transaction_hash: transferTxHash } = await account.execute(
    //     transferCall,
    //     undefined,
    //     {
    //       maxFee: estimateFee?.suggestedMaxFee * BigInt(3),
    //       skipValidate: true,
    //     }
    //   );
    //   console.log("transferTxHash", transferTxHash);
    //   let tx = await provider.waitForTransaction(transferTxHash);
    //   console.log("wait tx", tx);
    // }

    console.log("create social account");
    // Generate public and private key pair.
    const AAprivateKey = process.env.AA_PRIVATE_KEY ?? stark.randomAddress();
    console.log("New account:\nprivateKey=", AAprivateKey);
    const AAstarkKeyPub =
      process.env.AA_PUBKEY ?? ec.starkCurve.getStarkKey(AAprivateKey);
    console.log("publicKey=", AAstarkKeyPub);
    // const AAprivateKey =stark.randomAddress();
    // console.log("New account:\nprivateKey=", AAprivateKey);
    // const AAstarkKeyPub =ec.starkCurve.getStarkKey(AAprivateKey);
    // console.log("publicKey=", AAstarkKeyPub);

    // await deployOz();
    // await deployArgent()
    // await testDeployLocal()
    // let accountBob = await createSocialContract(
    //   bobPublicKey,
    //   AAprivateKey,
    //   AAstarkKeyPub
    // );
    let accountBob = {
      contract_address: undefined,
    };
    console.log("accountBob?.contract_address ", accountBob?.contract_address);
    let socialPayBob = await prepareAndConnectContract(
      accountBob?.contract_address ??
        "0x0538907b56f07ef4f90e6f2da26a099ccfbc64e1cc4d03ff1e627fa7c2eb78ac",
      account
    );

    let pkBobAccount = await socialPayBob?.get_public_key();
    console.log("pkBobAccount", pkBobAccount);

    /** Alice account */
    // const AAprivateKeyAlice = stark.randomAddress();
    // console.log("New account:\nprivateKey=", AAprivateKeyAlice);
    // const AAstarkKeyPubAlice = ec.starkCurve.getStarkKey(AAprivateKeyAlice);
    // console.log("publicKey=", AAstarkKeyPubAlice);
    // let accountAlice = await createSocialContract(
    //   alicePublicKey,
    //   AAprivateKeyAlice,
    //   AAstarkKeyPubAlice
    // );

    let socialAlice = await prepareAndConnectContract(
      ACCOUNT_TEST_PROFILE?.alice?.contract ??
        "0x261d2434b2583293b7dd2048cb9c0984e262ed0a3eb70a19ed4eac6defef8b1",
      account
    );

    let pkAliceAccount = await socialAlice?.get_public_key();
    console.log("pkAliceAccount", pkAliceAccount);

    // Create account

    // Check balance of alice

    /** @TODO prepare request  */

    let eventRequest = await getProfilesByNames(request, event);

    console.log("Event request handle transfer", eventRequest);

    /** @TODO NIP-05 */

    if (eventRequest) {
      eventRequest.receiver = alicePublicKey;
    }
    console.log("Event request handle transfer", eventRequest);

    if (event && eventRequest) {
      let socialTransfer: SocialPayRequest = {
        ...eventRequest,
        ...event,
        signature: signature,
        created_at: event?.created_at,
        contentTransfer: {
          amount: 1,
          token: "STRK",
          token_address: TOKENS_ADDRESS?.SEPOLIA?.STRK,
          joyboy: {
            public_key: bobPublicKey,
            relays: ["wss://relay.joyboy.community.com"],
          },
          recipient: {
            public_key: bobPublicKey,
            relays: ["wss://relay.joyboy.community.com"],
          },
          recipient_address:
            ACCOUNT_TEST_PROFILE?.alice?.contract ??
            "0x261d2434b2583293b7dd2048cb9c0984e262ed0a3eb70a19ed4eac6defef8b1",
        },
      };
      console.log("socialTransfer", socialTransfer);

      if (socialTransfer?.signature) {
        console.log("send handle_transfer");
        let nostPubkeyUint = nostrPubkeyToUint256(bobPublicKey?.toString());

        // let callData= CallData.compile({...socialTransfer})
        let callData= CallData.compile({
          // public_key:event?.pubkey ?? bobPublicKey,
          public_key:nostPubkeyUint ?? nostrPubkeyToUint256(bobPublicKey),

          // // created_at:event?.created_at,
          // // created_at:1,
          // // created_at:cairo.uint256(1),
          // // created_at:new Date()?.getTime() / 1000,
          // kind:"1",
          // // created_at:event?.created_at?.toString(),
          // tags:[],
          // content:{...socialTransfer?.contentTransfer},
          // sig:{...signature},
        })


        // const transferCall: Call | undefined = socialPayBob?.populate(
        //   "handle_transfer",
        //   callData
        //   // {
        //   //   request: {
        //   //     ...socialTransfer,
        //   //     content: socialTransfer?.contentTransfer,
        //   //   },
        //   // }
        // );
        // const transferCall: Call | undefined = socialPayBob?.populate(
        //   "handleTransfer",
        //   {
        //     request: {
        //       ...socialTransfer,
        //       content: socialTransfer?.contentTransfer,
        //     },
        //   }
        // );
        // console.log("transfer call", transferCall);
        // console.log("estimateFee", estimateFee);
        const { transaction_hash: transferTxHash } = await account.execute(
          {
            contractAddress:socialPayBob?.address,
            entrypoint:"handle_transfer",
            // calldata:{}
            calldata:callData
            // calldata:callData,
          },
          // undefined,
          // {
          //   // maxFee: estimateFee?.suggestedMaxFee * BigInt(3),
          //   // maxFee: estimateFee?.suggestedMaxFee * BigInt(0),
          //   // maxFee:estimateFee?.suggestedMaxFee,
          //   // skipValidate: true,
          // }
        );
        console.log("transferTxHash", transferTxHash);
        let tx = await provider.waitForTransaction(transferTxHash);
        // let tx = await socialPayBob?.handle_transfer(socialTransfer);
      }
    }

    // console.log("create social account alice");
    // // Generate public and private key pair.
    // // const AAprivateKey = process.env.AA_PRIVATE_KEY ?? stark.randomAddress();
    // // console.log("New account:\nprivateKey=", AAprivateKey);
    // // const AAstarkKeyPub =
    // //   process.env.AA_PUBKEY ?? ec.starkCurve.getStarkKey(AAprivateKey);
    // // console.log("publicKey=", AAstarkKeyPub);
    // const AAprivateKeyAlice = stark.randomAddress();
    // console.log("New account:\nprivateKey=", AAprivateKeyAlice);
    // const AAstarkKeyPubAlice = ec.starkCurve.getStarkKey(AAprivateKey);
    // console.log("publicKey=", AAstarkKeyPub);

    // let accountAlice = await createSocialAccount(
    //   alicePublicKey,
    //   AAprivateKeyAlice,
    //   AAstarkKeyPubAlice
    // );
  });

  // it("Use existing config: End to end test", async function () {
  //   this.timeout(0); // Disable timeout for this test
  //   /** Generate starknet account for Paymaster*/
  //   // const provider = await connectToStarknet();
  //   const privateKey = createStarknetWallet();
  //   /**  Generate keypair for both account*/
  //   // Bob nostr account
  //   let { privateKey: pkBob, publicKey: bobPublicKey } = generateKeypair();

  //   // Alice nostr account
  //   // let { privateKey: pkAlice, publicKey: alicePublicKey } = generateKeypair();

  //   let { privateKey: pkAlice, publicKey: alicePublicKey } = generateKeypair();

  //   /** Send a note */
  //   let contentRequest = "@joyboy send 10 STRK to @alice.xyz";
  //   let content = "a test";
  //   // Check request, need to be undefined
  //   let request = checkAndFilterSocialPayContent(content);
  //   logDev(`first request need to be undefined request ${request}`);
  //   expect(request).to.eq(undefined);

  //   // Check request, need to be defined with sender, amount, token, recipient
  //   request = checkAndFilterSocialPayContent(contentRequest);
  //   logDev(`second request = ${JSON.stringify(request)}`);
  //   expect(true).to.eq(true);
  //   console.log("request", request);
  //   expect(request).to.deep.eq({
  //     sender: "@joyboy",
  //     receiver: "@alice.xyz",
  //     currency: "STRK",
  //     amount: 10,
  //     isValidAddress: false,
  //   });

  //   // Send an event predefined sig for the onchain contract request
  //   let { event, isValid } = await sendEvent(pkBob, contentRequest);
  //   console.log("event", event);

  //   /** @TODO Look SocialAccount Starknet key*/

  //   /*** Starknet handle_transfer call for SocialPay request
  //    * @TODO We need to have an hard check for the pubkey before sending tx
  //    ***/

  //   /***
  //    * Get both account for Bob & Alice
  //    * Send request of account bob to alice
  //    */
  //   // const provider = new RpcProvider({ nodeUrl: STARKNET_URL });
  //   // const provider = new RpcProvider();

  //   const resp = await provider.getSpecVersion();
  //   console.log("rpc version =", resp);

  //   const privateKey0 = process.env.DEVNET_PK as string;
  //   const accountAddress0 = process.env.DEVNET_PUBLIC_KEY as string;
  //   const account = new Account(provider, accountAddress0, privateKey0, "1");

  //   // Interactions with the contract with meta-class
  //   // const bal1 = await token?.transfer(account?.address, cairo.uint256(1));
  //   // console.log("bal1", bal1);

  //   // let transfer = await token?.transfer(account?.address, cairo.uint256(2));
  //   // console.log("transfer erc20", transfer);

  //   // let uint = cairo.felt(100)
  //   // console.log("uint supply",uint.toString())
  //   // console.log("0x02a81245Cc288B79911E7a5C5B6D75F437fd602a3d9e0BC30d535283b5974658",cairo.felt("0x02a81245Cc288B79911E7a5C5B6D75F437fd602a3d9e0BC30d535283b5974658"))

  //   // Connect account with the contract

  //   // let token = await getToken(TOKENS_ADDRESS.SEPOLIA.ETH)
  //   // let token = await createToken();

  //   // await transferToken(
  //   //   account,
  //   //   account?.address,
  //   //   "0x49D36570D4E46F48E99674BD3FCC84644DDD6B96F7C741B1562B82F9E004DC7"
  //   //   // "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
  //   // );

  //   // let token = await getToken(
  //   //   // "0x00148a15f9fbf4c015b927bf88608fbafb6d149abdd5ef5b3e3b296e6ac999a4"
  //   //   "0x05c49bee556c6bb9d2f5e3e1a386e49ac29d3896e680bf96f37d993eb7fb1dad"
  //   // // );
  //   // let token = await getToken(TOKENS_ADDRESS.SEPOLIA.ETH);

  //   // token?.connect(account);
  //   // console.log("transfer ETH to AA Account");

  //   // token?.connect(account);

  //   // const name = await token?.name();
  //   // console.log("name", name);

  //   // console.log("transfer erc20");
  //   // // let transfer = await token?.transfer(AAcontractAddress, "0.003")
  //   // // let transfer = await token?.transfer(AAcontractAddress, cairo.uint256(1/10**18))
  //   // // let transfer = await token?.transfer(AAcontractAddress, cairo.uint256("1"))
  //   // const balanceInitial = await token?.balanceOf(account.address);
  //   // console.log("account0 has a balance of:", balanceInitial);

  //   // // Execute tx transfer of 1 tokens to account 1
  //   // console.log(`Invoke Tx - Transfer 1 tokens to erc20 contract...`);
  //   // const toTransferTk: Uint256 = cairo.uint256(1 * 10 ** 18);
  //   // const transferCall: Call | undefined = token?.populate("transfer", {
  //   //   // recipient: '0x78662e7352d062084b0010068b99288486c2d8b914f6e2a55ce945f8792c8b1',
  //   //   // recipient: account0?.address,
  //   //   recipient: AAstarkKeyPub,
  //   //   amount: toTransferTk,
  //   // });
  //   // if (transferCall) {
  //   //   let estimateFee = await account?.estimateInvokeFee(transferCall);
  //   //   console.log("estimateFee", estimateFee);
  //   //   const { transaction_hash: transferTxHash } = await account.execute(
  //   //     transferCall,
  //   //     undefined,
  //   //     {
  //   //       maxFee: estimateFee?.suggestedMaxFee * BigInt(3),
  //   //       skipValidate: true,
  //   //     }
  //   //   );
  //   //   console.log("transferTxHash", transferTxHash);
  //   //   let tx = await provider.waitForTransaction(transferTxHash);
  //   //   console.log("wait tx", tx);
  //   // }

  //   console.log("create social account");
  //   // Generate public and private key pair.
  //   const AAprivateKey = process.env.AA_PRIVATE_KEY ?? stark.randomAddress();
  //   console.log("New account:\nprivateKey=", AAprivateKey);
  //   const AAstarkKeyPub =
  //     process.env.AA_PUBKEY ?? ec.starkCurve.getStarkKey(AAprivateKey);
  //   console.log("publicKey=", AAstarkKeyPub);
  //   // const AAprivateKey =stark.randomAddress();
  //   // console.log("New account:\nprivateKey=", AAprivateKey);
  //   // const AAstarkKeyPub =ec.starkCurve.getStarkKey(AAprivateKey);
  //   // console.log("publicKey=", AAstarkKeyPub);

  //   // await deployOz();
  //   // await deployArgent()
  //   // await testDeployLocal()
  //   // let accountBob = await createSocialContract(
  //   //   bobPublicKey,
  //   //   AAprivateKey,
  //   //   AAstarkKeyPub
  //   // );
  //   let accountBob = {
  //     contract_address: undefined,
  //   };
  //   console.log("accountBob?.contract_address ", accountBob?.contract_address);
  //   let socialPayBob = await prepareAndConnectContract(
  //     accountBob?.contract_address ??
  //       "0x0538907b56f07ef4f90e6f2da26a099ccfbc64e1cc4d03ff1e627fa7c2eb78ac",
  //     account
  //   );

  //   let pkBobAccount = await socialPayBob?.get_public_key();
  //   console.log("pkBobAccount", pkBobAccount);

  //   /** Alice account */
  //   // const AAprivateKeyAlice = stark.randomAddress();
  //   // console.log("New account:\nprivateKey=", AAprivateKeyAlice);
  //   // const AAstarkKeyPubAlice = ec.starkCurve.getStarkKey(AAprivateKeyAlice);
  //   // console.log("publicKey=", AAstarkKeyPubAlice);
  //   // let accountAlice = await createSocialContract(
  //   //   alicePublicKey,
  //   //   AAprivateKeyAlice,
  //   //   AAstarkKeyPubAlice
  //   // );

  //   let socialAlice = await prepareAndConnectContract(
  //     "0x261d2434b2583293b7dd2048cb9c0984e262ed0a3eb70a19ed4eac6defef8b1",
  //     account
  //   );

  //   let pkAliceAccount = await socialAlice?.get_public_key();
  //   console.log("pkAliceAccount", pkAliceAccount);

  //   // Create account

  //   // Check balance of alice

  //   /** @TODO prepare request  */

  //   let eventRequest = await getProfilesByNames(request, event);

  //   console.log("Event request handle transfer", eventRequest);

  //   /** @TODO NIP-05 */

  //   if (eventRequest) {
  //     eventRequest.receiver = alicePublicKey;

  //   }
  //   console.log("Event request handle transfer", eventRequest);

  //   // console.log("create social account alice");
  //   // // Generate public and private key pair.
  //   // // const AAprivateKey = process.env.AA_PRIVATE_KEY ?? stark.randomAddress();
  //   // // console.log("New account:\nprivateKey=", AAprivateKey);
  //   // // const AAstarkKeyPub =
  //   // //   process.env.AA_PUBKEY ?? ec.starkCurve.getStarkKey(AAprivateKey);
  //   // // console.log("publicKey=", AAstarkKeyPub);
  //   // const AAprivateKeyAlice = stark.randomAddress();
  //   // console.log("New account:\nprivateKey=", AAprivateKeyAlice);
  //   // const AAstarkKeyPubAlice = ec.starkCurve.getStarkKey(AAprivateKey);
  //   // console.log("publicKey=", AAstarkKeyPub);

  //   // let accountAlice = await createSocialAccount(
  //   //   alicePublicKey,
  //   //   AAprivateKeyAlice,
  //   //   AAstarkKeyPubAlice
  //   // );
  // });
});
