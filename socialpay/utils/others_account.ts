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
import { getToken, transferToken } from "./token";
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
export const deployOz = async () => {
  try {
    // new Open Zeppelin account v0.5.1
    // Generate public and private key pair.
    // const privateKey = stark.randomAddress();
    // console.log("New OZ account:\nprivateKey=", privateKey);
    // const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
    // console.log("publicKey=", starkKeyPub);

    // new account abstraction
    // Generate public and private key pair.
    // Generate public and private key pair.
    const privateKey = process.env.AA_PRIVATE_KEY ?? stark.randomAddress();
    console.log("New account:\nprivateKey=", privateKey);
    const starkKeyPub =
      process.env.AA_PUBKEY ?? ec.starkCurve.getStarkKey(privateKey);
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

    const { transaction_hash, contract_address } =
      await OZaccount.deployAccount({
        classHash: OZaccountClassHash,
        constructorCalldata: OZaccountConstructorCallData,
        addressSalt: starkKeyPub,
      });

    await provider.waitForTransaction(transaction_hash);
    console.log(
      "✅ New OpenZeppelin account created.\n   address =",
      contract_address
    );
  } catch (error) {
    console.log("Deploy OZ error", error);
  }
};
export const deployArgent = async () => {
  try {
    // connect provider

    //new Argent X account v0.2.3
    const argentXproxyClassHash =
      "0x25ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918";
    const argentXaccountClassHash =
      "0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2";

    // // Generate public and private key pair.
    // const privateKeyAX = stark.randomAddress();
    // console.log("AX_ACCOUNT_PRIVATE_KEY=", privateKeyAX);
    // const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);
    // console.log("AX_ACCOUNT_PUBLIC_KEY=", starkKeyPubAX);

    console.log("create social account");
    // Generate public and private key pair.
    const privateKeyAX = process.env.AA_PRIVATE_KEY ?? stark.randomAddress();
    console.log("New account:\nprivateKey=", privateKeyAX);
    const starkKeyPubAX =
      process.env.AA_PUBKEY ?? ec.starkCurve.getStarkKey(privateKeyAX);
    console.log("publicKey=", starkKeyPubAX);

    // Calculate future address of the ArgentX account
    const AXproxyConstructorCallData = CallData.compile({
      implementation: argentXaccountClassHash,
      selector: hash.getSelectorFromName("initialize"),
      calldata: CallData.compile({ signer: starkKeyPubAX, guardian: "0" }),
    });
    const AXcontractAddress = hash.calculateContractAddressFromHash(
      starkKeyPubAX,
      argentXproxyClassHash,
      AXproxyConstructorCallData,
      0
    );
    console.log("Precalculated account address=", AXcontractAddress);

    const accountAX = new Account(provider, AXcontractAddress, privateKeyAX);

    const deployAccountPayload = {
      classHash: argentXproxyClassHash,
      constructorCalldata: AXproxyConstructorCallData,
      contractAddress: AXcontractAddress,
      addressSalt: starkKeyPubAX,
    };

    const {
      transaction_hash: AXdAth,
      contract_address: AXcontractFinalAddress,
    } = await accountAX.deployAccount(deployAccountPayload);
    console.log("✅ ArgentX wallet deployed at:", AXcontractFinalAddress);
  } catch (error) {
    console.log("Deploy argent error", error);
  }
};

export const testDeployLocal = async () => {
  try {
    // connect provider

    // initialize existing predeployed account 0 of Devnet
    const privateKey0 = "0xe3e70682c2094cac629f6fbed82c07cd";
    const accountAddress0 =
      "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    const account0 = new Account(provider, accountAddress0, privateKey0);
    // add ,"1" after privateKey0 if this account is not a Cairo 0 contract

    // new account abstraction
    // Generate public and private key pair.
    const AAprivateKey = stark.randomAddress();
    console.log("New account:\nprivateKey=", AAprivateKey);
    const AAstarkKeyPub = ec.starkCurve.getStarkKey(AAprivateKey);
    console.log("publicKey=", AAstarkKeyPub);

    // declare the contract
    const sierraAccount = json.parse(
      fs
        // .readFileSync("./compiled_contracts/myAccountAbstraction.json")
        // .readFileSync(PATH_SOCIAL_ACCOUNT)
        .readFileSync(PATH_SOCIAL_ACCOUNT)
        .toString("ascii")
    );
    const compiledAAaccount = json.parse(
      fs
        // .readFileSync("./compiled_contracts/myAccountAbstraction.json")
        // .readFileSync(PATH_SOCIAL_ACCOUNT)
        .readFileSync(PATH_SOCIAL_ACCOUNT_COMPILED)
        .toString("ascii")
    );
    console.log("Try hash declare account");

    const ch = hash.computeSierraContractClassHash(sierraAccount);

    const compCH = hash.computeCompiledClassHash(compiledAAaccount);
    let decCH = compCH;
    let AAaccountClassHash = process.env.ACCOUNT_CLASS_HASH as string;

    decCH = AAaccountClassHash;

    // const { transaction_hash: declTH, class_hash: decCH } =
    //   await account0.declare({
    //     contract: compiledAAaccount,
    //     // contract: sierraAccount,
    //     casm:compiledAAaccount

    //   });
    // const { transaction_hash: declTH, class_hash: decCH } =
    // await account0.declare({
    //   contract: compiledAAaccount,
    //   // contract: sierraAccount,
    //   casm:compiledAAaccount

    // });
    // console.log("Customized account class hash =", decCH);
    // await provider.waitForTransaction(declTH);

    // Calculate future address of the account
    const AAaccountConstructorCallData = CallData.compile({
      // super_admin_address: account0.address,
      publicKey: AAstarkKeyPub,
    });
    const AAcontractAddress = hash.calculateContractAddressFromHash(
      AAstarkKeyPub,
      decCH,
      AAaccountConstructorCallData,
      0
    );
    console.log("Precalculated account address=", AAcontractAddress);

    // fund account address before account creation
    const { data: answer } = await axios.post(
      "http://127.0.0.1:5050/mint",
      {
        address: AAcontractAddress,
        amount: 50_000_000_000_000_000_000,
        lite: true,
      },
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("Answer mint =", answer);

    // deploy account
    const AAaccount = new Account(provider, AAcontractAddress, AAprivateKey);
    // add ,"1" after AAprivateKey if this account is not a Cairo 0 contract
    const { transaction_hash, contract_address } =
      await AAaccount.deployAccount({
        classHash: decCH,
        constructorCalldata: AAaccountConstructorCallData,
        addressSalt: AAstarkKeyPub,
      });
    await provider.waitForTransaction(transaction_hash);
    console.log(
      "✅ New customized account created.\n   address =",
      contract_address
    );
  } catch (error) {
    console.log("Error test deployLocal", error);
  }
};


export const deployBasicAccount = async () => {
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
