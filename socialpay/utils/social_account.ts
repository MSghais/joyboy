import {
  Account,
  ec,
  json,
  stark,
  Provider,
  hash,
  CallData,
  RpcProvider,
  Contract,
  constants,
  cairo,
  Uint256,
  shortString,
  Call,
  BigNumberish,
  uint256,
} from "starknet";
import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";
import { SocialPayRequest } from "types";
import {
  hexStringToUint256,
  nostrPubkeyToUint256,
  pubkeyToUint256,
} from "./format";
import { getToken } from "./token";
import { TOKENS_ADDRESS } from "../src/constants";
import { provider } from "./starknet";
dotenv.config();
const STARKNET_URL = process.env.RPC_ENDPOINT || "http://127.0.0.1:5050";
// const PATH_SOCIAL_ACCOUNT = "../abi/social_account.compiled_contract.json"
const PATH_SOCIAL_ACCOUNT = "./abi/social_account.contract_class.json";
const PATH_SOCIAL_ACCOUNT_COMPILED =
  "./abi/social_account.compiled_contract.json";

// Initialize RPC provider with a specified node URL (Goerli testnet in this case)
// const provider = new RpcProvider({ nodeUrl: STARKNET_URL });
// const provider = new RpcProvider();

/** @TODO spec need to be discuss. This function serve as an exemple */
export const createSocialAccount = async (
  nostrPublicKey: string,
  AAprivateKey: string,
  AAstarkKeyPub: string
) => {
  try {
    // initialize existing predeployed account 0 of Devnet
    const privateKey0 = process.env.DEVNET_PK as string;
    const accountAddress0 = process.env.DEVNET_PUBLIC_KEY as string;

    // Devnet account
    const account0 = new Account(provider, accountAddress0, privateKey0, "1");

    let AAaccountClassHash = process.env.ACCOUNT_CLASS_HASH as string;

    // declare the contract

    const compiledSierraAAaccount = json.parse(
      fs.readFileSync(PATH_SOCIAL_ACCOUNT).toString("ascii")
    );
    const compiledAACasm = json.parse(
      fs.readFileSync(PATH_SOCIAL_ACCOUNT_COMPILED).toString("ascii")
    );
    // console.log("compiledAAaccount =", compiledSierraAAaccount);
    /** Get class hash account */

    const ch = hash.computeSierraContractClassHash(compiledSierraAAaccount);

    const compCH = hash.computeCompiledClassHash(compiledAACasm);

    // AAaccountClassHash = compCH;
    // console.log("compiled class hash =", compCH);
    // if (!AAaccountClassHash) {
    //   const compCH = hash.computeCompiledClassHash(compiledAACasm);

    //   AAaccountClassHash = compCH;
    //   console.log("compiled class hash =", compCH);
    // }

    // console.log("declare account");
    // let chainId = await account0?.getChainId()

    // const { suggestedMaxFee: estimatedFee1 } = await account0.estimateDeclareFee({
    //   contract: compiledSierraAAaccount,
    //   classHash: AAaccountClassHash,
    // });
    // console.log("suggestedMaxFee =", estimatedFee1);

    // console.log("declare account");
    // const declareResponse = await account0.declare({
    //   contract: compiledSierraAAaccount,
    //   casm: compiledAACasm,
    // });
    // console.log("declareResponse", declareResponse);

    // const contractClassHash = declareResponse.class_hash;
    // const contractClassHash=AAaccountClassHash

    // // // Wait for the transaction to be confirmed and log the transaction receipt
    // const txR = await provider.waitForTransaction(
    //   declareResponse.transaction_hash
    // );
    // console.log("tx receipt =", txR);
    // console.log("Declare Sierra account =",);

    // const deployResponse = await account0.declareAndDeploy({
    //   contract: compiledSierraAAaccount,
    //   casm: compiledAACasm
    // });
    // console.log("deployResponse =", deployResponse);

    // const { transaction_hash: declTH, class_hash: decCH } =
    //   await account0.declare({
    //     contract: compiledSierraAAaccount,
    //   });
    // console.log("Customized account class hash =", decCH);
    // await provider.waitForTransaction(declTH);
    // Function to convert a Nostr public key to a Uint256

    // Example usage
    const pubkeyHex =
      "12ab34cd56ef78ab90cd12ef34ab56cd78ef90ab12cd34ef56ab78cd90ef12ab"; // Replace with actual hex string
    const uint256Pubkey = nostrPubkeyToUint256(pubkeyHex);
    console.log("uint256Pubkey", uint256Pubkey);

    let isUint = cairo.isTypeUint256(uint256Pubkey?.toString());

    console.log("isUint", isUint);

    // let pubkeyUint = uint8ArrayToBigInt(pubkeyToUint256(nostrPublicKey));
    let pubkeyUint = pubkeyToUint256(nostrPublicKey);

    console.log("pubkeyUint", pubkeyUint);

    //  let  nostPubkeyUint = nostrPubkeyToUint256(pubkeyUint?.toString());
    let nostPubkeyUint = nostrPubkeyToUint256(nostrPublicKey?.toString());

    isUint = cairo.isTypeUint256(pubkeyUint?.toString());
    console.log("isUint", isUint);

    const encStr: string[] = shortString.splitLongString(nostrPublicKey);
    console.log("encStr", encStr);

    const feltArray: BigNumberish[] = CallData.compile(
      shortString.splitLongString(nostrPublicKey)
    );

    // Example usage
    const hexString = nostrPublicKey; // Replace with actual hex string
    const uint256Value = hexStringToUint256(hexString);

    console.log("Uint256 Value:", uint256Value);

    // console.log("nostPubkeyUint", nostPubkeyUint);
    const AAaccountConstructorCallData = CallData.compile({
      //   super_admin_address: account0.address,
      //   publicKey: AAstarkKeyPub,
      // public_key: cairo.felt(pubkeyUint?.toString()),
      // public_key:cairo.uint256(pubkeyUint)
      // public_key: cairo.uint256(pubkeyUint),
      // public_key: cairo.uint256(nostrPublicKey) ,
      // public_key: cairo.uint256(pubkeyUint?.toString()),
      // public_key: pubkeyUint?.toString(0),
      // public_key: cairo.uint256(nostrPublicKey) ,
      // public_key: nostrPublicKey ,
      // public_key:cairo.felt(encStr)
      // public_key:cairo.uint256(nostrPublicKey),

      // public_key: uint256Value,
      public_key: 45,
      // public_key: feltArray,
      // public_key:nostPubkeyUint
      // public_key:uint256.bnToUint256(1)
      // public_key: uint256Value,
    });
    // Calculate future address of the account
    const AAcontractAddress = hash.calculateContractAddressFromHash(
      AAstarkKeyPub,
      AAaccountClassHash,
      AAaccountConstructorCallData,
      1
    );

    console.log("Precalculated account address=", AAcontractAddress);

    //Devnet
    // //  fund account address before account creation
    // const { data: answer } = await axios.post(
    //   "http://127.0.0.1:5050/mint",
    //   {
    //     address: AAcontractAddress,
    //     amount: 50_000_000_000_000_000_000,
    //     lite: true,
    //   },
    //   { headers: { "Content-Type": "application/json" } }
    // );
    // console.log("Answer mint =", answer);

    // deploy account

    // const AAaccount = new Account(provider, AAcontractAddress, AAprivateKey);
    const testClassHash = AAaccountClassHash;

    // // let token = await getToken(TOKENS_ADDRESS.SEPOLIA.ETH)
    // let token = await getToken(TOKENS_ADDRESS.SEPOLIA.TEST);

    // token?.connect(account0);
    // console.log("transfer ETH to AA Account");

    // // let transfer = await token?.transfer(AAcontractAddress, "0.003")
    // // let transfer = await token?.transfer(AAcontractAddress, cairo.uint256(1/10**18))
    // // let transfer = await token?.transfer(AAcontractAddress, cairo.uint256("1"))
    // const balanceInitial = await token?.balanceOf(account0.address);
    // console.log("account0 has a balance of:", balanceInitial);

    // // Execute tx transfer of 1 tokens to account 1
    // console.log(`Invoke Tx - Transfer 1 tokens to erc20 contract...`);
    // // const toTransferTk: Uint256 = cairo.uint256(1 * 10 / 18);
    // const toTransferTk: Uint256 = cairo.uint256(1 * 10 * 18);
    // let decimals = 18;
    // let total_amount_float = 0.01;
    // // let total_amount_float = 1;

    // let total_amount: Uint256 | undefined;
    // const total_amount_nb = total_amount_float * 10 ** Number(decimals);
    // // let total_amount;

    // if (Number.isInteger(total_amount_nb)) {
    //   total_amount = cairo.uint256(total_amount_nb);
    // } else if (!Number.isInteger(total_amount_nb)) {
    //   // total_amount=total_amount_nb
    //   total_amount = uint256.bnToUint256(BigInt(total_amount_nb));
    // }

    // const transferCall: Call | undefined = token?.populate("transfer", {
    //   // recipient: '0x78662e7352d062084b0010068b99288486c2d8b914f6e2a55ce945f8792c8b1',
    //   // recipient: account0?.address,
    //   recipient: AAcontractAddress,
    //   // amount: toTransferTk,
    //   amount: total_amount ?? toTransferTk,
    // });
    // if (transferCall) {
    //   // let estimateFee = await account0?.estimateInvokeFee(transferCall);
    //   let estimateFee = await account0?.estimateFee(transferCall);

    //   // let estimateFee = await provider.getInvokeEstimateFee(transferCall)
    //   // let estimateFee = await account0?.getSuggestedFee(transferCall);
    //   console.log("estimateFee", estimateFee);
    //   const { transaction_hash: transferTxHash } = await account0.execute(
    //     transferCall,
    //     undefined,
    //     {
    //       // maxFee: estimateFee?.suggestedMaxFee * BigInt(3),
    //       // maxFee: estimateFee?.suggestedMaxFee * BigInt(0),
    //       // maxFee:estimateFee?.suggestedMaxFee,
    //       // skipValidate: true,
    //     }
    //   );
    //   console.log("transferTxHash", transferTxHash);
    //   let tx = await provider.waitForTransaction(transferTxHash);
    //   console.log("wait tx", tx);
    // }
    // deploy account
    // // add ,"1" after AAprivateKey if this account is not a Cairo 0 contract
    // const { transaction_hash, contract_address } =
    //   await AAaccount.deployAccount({
    //     classHash: AAaccountClassHash,
    //     constructorCalldata: AAaccountConstructorCallData,
    //     addressSalt: AAstarkKeyPub,
    //   });
    // await provider.waitForTransaction(transaction_hash);
    // console.log(
    //   "✅ New customized account created.\n   address =",
    //   contract_address
    // );

    // // const deployResponse = await account0.deployAccount({
    // const deployResponse = await AAaccount.deployAccount({
    //   classHash: testClassHash,
    //   constructorCalldata: AAaccountConstructorCallData,
    // });
    // const deployResponse = await account0.deployContract({
    //   classHash: testClassHash,
    //   constructorCalldata: AAaccountConstructorCallData,
    // });
    // const deployResponse = await account0.deployAccount({
    //   classHash: testClassHash,
    //   constructorCalldata: AAaccountConstructorCallData,
    // });
    // console.log("deployResponse", deployResponse);

    // let res = await provider.waitForTransaction(
    //   deployResponse.transaction_hash
    // );
    // console.log("res deployResponse", res);

    // const { transaction_hash, contract_address } =
    // await AAaccount.deployAccount({
    //   classHash: AAaccountClassHash,
    //   constructorCalldata: AAaccountConstructorCallData,
    //   addressSalt: AAstarkKeyPub,
    // });

    // add ,"1" after AAprivateKey if this account is not a Cairo 0 contract
    // const { transaction_hash, contract_address } =
    //   await AAaccount.deployAccount({
    //     classHash: AAaccountClassHash,
    //     constructorCalldata: AAaccountConstructorCallData,
    //     addressSalt: AAstarkKeyPub,
    //   });

    // const { transaction_hash, contract_address } = await account0.deployContract(
    //   {
    //     classHash: AAaccountClassHash,
    //     constructorCalldata: AAaccountConstructorCallData,
    //     // constructorCalldata:[uint256Value],
    //     // addressSalt: AAstarkKeyPub,
    //   }
    // );
    const AAaccount = new Account(provider, AAcontractAddress, AAprivateKey);

    // const estimateDeployAccount = await account0?.estimateAccountDeployFee({
    //   classHash: AAaccountClassHash,
    //   // constructorCalldata: AAaccountConstructorCallData,
    //   // constructorCalldata:[uint256Value],
    //   addressSalt: AAstarkKeyPub,
    // });

    const estimateDeployAccount = await account0?.estimateDeployFee({
      classHash: AAaccountClassHash,
      // constructorCalldata: AAaccountConstructorCallData,
      // constructorCalldata:[uint256Value],
      // addressSalt: AAstarkKeyPub,
    });
    console.log("Account estimateDeploy fee", estimateDeployAccount);
    // const { transaction_hash, contract_address } =
    //   await account0.deployContract(
    //     {
    //       classHash: AAaccountClassHash,
    //       // constructorCalldata: AAaccountConstructorCallData,
    //       // constructorCalldata:[uint256Value],
    //       // addressSalt: AAstarkKeyPub,
    //     },
    //     {
    //       // maxFee: estimateDeployAccount?.suggestedMaxFee * BigInt(2),
    //       maxFee: estimateDeployAccount?.suggestedMaxFee,
    //     }
    //   );


    const nonce = await account0?.getNonce()

    const { transaction_hash, contract_address } =
    await AAaccount.deployAccount(
      {
        classHash: AAaccountClassHash,
        constructorCalldata: AAaccountConstructorCallData,
        // constructorCalldata:[uint256Value],
        addressSalt: AAstarkKeyPub,
      },
      {
        // maxFee: estimateDeployAccount?.suggestedMaxFee * BigInt(2),
        // maxFee: estimateDeployAccount?.suggestedMaxFee,
        // nonce:nonce
      }
    );

    // const { transaction_hash, contract_address } =
    // await account0.deployAccount(
    //   {
    //     classHash: AAaccountClassHash,
    //     // constructorCalldata: AAaccountConstructorCallData,
    //     // constructorCalldata:[uint256Value],
    //     // addressSalt: AAstarkKeyPub,
    //   },
    //   {
    //     // maxFee: estimateDeployAccount?.suggestedMaxFee * BigInt(2),
    //     maxFee: estimateDeployAccount?.suggestedMaxFee,
    //     // nonce:nonce
    //   }
    // );


    console.log("transaction_hash", transaction_hash);
    console.log("contract_address", contract_address);

    let tx = await account0?.waitForTransaction(transaction_hash);

    console.log("Tx deploy", tx);
    // const { transaction_hash, contract_address } = await AAaccount.deployAccount(
    // const { transaction_hash, contract_address } = await account0.deployAccount(

    //   {
    //     classHash: AAaccountClassHash,
    //     constructorCalldata: AAaccountConstructorCallData,
    //     // constructorCalldata:[uint256Value],
    //     addressSalt: AAstarkKeyPub,
    //   },
    //   {
    //     // maxFee: estimateDeployAccount?.suggestedMaxFee * BigInt(2),
    //     maxFee: estimateDeployAccount?.suggestedMaxFee,

    //   }
    // );
    // await provider.waitForTransaction(transaction_hash);
    // console.log(
    //   "✅ New customized account created.\n   address =",
    //   contract_address
    // );

    return {
      privateKey: AAprivateKey,
      // publicKey: contract_address,

      // contract_address,
      // transaction_hash,
    };
  } catch (error) {
    console.log("Error createSocialAccount= ", error);
  }
};

const deployBasicAccount = async () => {
  // const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });

  // new Open Zeppelin account v0.5.1
  // Generate public and private key pair.
  const privateKey = stark.randomAddress();
  console.log("New OZ account:\nprivateKey=", privateKey);
  const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
  console.log("publicKey=", starkKeyPub);

  const OZaccountClassHash =
    "0x2794ce20e5f2ff0d40e632cb53845b9f4e526ebd8471983f7dbd355b721d5a";
  // Calculate future address of the account
  const OZaccountConstructorCallData = CallData.compile({
    publicKey: starkKeyPub,
  });
  const OZcontractAddress = hash.calculateContractAddressFromHash(
    starkKeyPub,
    OZaccountClassHash,
    OZaccountConstructorCallData,
    0
  );
  console.log("Precalculated account address=", OZcontractAddress);

  const OZaccount = new Account(provider, OZcontractAddress, privateKey);

  const { transaction_hash, contract_address } = await OZaccount.deployAccount({
    classHash: OZaccountClassHash,
    constructorCalldata: OZaccountConstructorCallData,
    addressSalt: starkKeyPub,
  });

  await provider.waitForTransaction(transaction_hash);
  console.log(
    "✅ New OpenZeppelin account created.\n   address =",
    contract_address
  );
};

/** @TODO determine paymaster master specs to send the TX */
export const prepareAndConnectContract = async (
  addressUser: string,
  privateKeyProps: string
) => {
  // Create a wallet account (example uses a random private key, for real use, securely store and use your private key)
  const accountAddress =
    addressUser ?? process.env.DEVNET_PUBLIC_KEY ?? "0xYOUR_ACCOUNT_ADDRESS";

  const privateKey =
    privateKeyProps ?? process?.env?.DEVNET_PK ?? "0xYOUR_PRIVATE_KEY";
  const account = new Account(provider, accountAddress, privateKey);

  // read abi of Test contract
  const { abi: testAbi } = await provider.getClassAt(addressUser);

  const socialPay = new Contract(testAbi, addressUser, provider);
  // Connect account with the contract
  socialPay.connect(account);
  return socialPay;
};

export const handleTransferRequest = async (
  socialPay: Contract,
  socialRequest: SocialPayRequest
) => {
  const provider = new RpcProvider({ nodeUrl: STARKNET_URL });
  const myCall = socialPay.populate("handle_transfer", [socialRequest]);
  const res = await socialPay.handle_transfer(myCall.calldata);
  await provider.waitForTransaction(res.transaction_hash);
  const bal2 = await socialPay.get_balance();
  console.log("Final balance =", bal2.res.toString());
};
