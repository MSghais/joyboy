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
} from "starknet";
import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";
import { SocialPayRequest } from "types";
dotenv.config();
const STARKNET_URL = process.env.RPC_ENDPOINT || "http://127.0.0.1:5050";
// const PATH_SOCIAL_ACCOUNT = "../abi/social_account.compiled_contract.json"
const PATH_SOCIAL_ACCOUNT = "./abi/social_account.contract_class.json";
const PATH_SOCIAL_ACCOUNT_COMPILED =
  "./abi/social_account.compiled_contract.json";

// Initialize RPC provider with a specified node URL (Goerli testnet in this case)
// const provider = new RpcProvider({ nodeUrl: STARKNET_URL });
const provider = new RpcProvider({ nodeUrl: STARKNET_URL });

/** @TODO spec need to be discuss. This function serve as an exemple */
export const createSocialAccount = async (nostrPublicKey: string) => {
  try {
    // initialize existing predeployed account 0 of Devnet
    const privateKey0 = process.env.DEVNET_PK as string;
    const accountAddress0 = process.env.DEVNET_PUBLIC_KEY as string;

    // Devnet account
    const account0 = new Account(provider, accountAddress0, privateKey0, "1");

    let AAaccountClassHash = process.env.ACCOUNT_CLASS_HASH as string;
    // Generate public and private key pair.
    const AAprivateKey = stark.randomAddress();
    console.log("New account:\nprivateKey=", AAprivateKey);
    const AAstarkKeyPub = ec.starkCurve.getStarkKey(AAprivateKey);
    console.log("publicKey=", AAstarkKeyPub);

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

    AAaccountClassHash = compCH;
    console.log("compiled class hash =", compCH);
    if (!AAaccountClassHash) {
      const compCH = hash.computeCompiledClassHash(compiledAACasm);

      AAaccountClassHash = compCH;
      console.log("compiled class hash =", compCH);
    }

    // const { data: config } = await axios.get(
    //     "http://127.0.0.1:5050/config",
    //     { headers: { "Content-Type": "application/json" } }
    //   );
    //   console.log("Answer config =", config);
    // fund account address before account creation
    // const { data: answerFund } = await axios.post(
    //   "http://127.0.0.1:5050/mint",
    //   {
    //     address: account0?.address,
    //     amount: 50_000_000_000_000_000_000,
    //     lite: true,
    //   },
    //   { headers: { "Content-Type": "application/json" } }
    // );
    // console.log("Answer mint =", answerFund);
    console.log("declare account");
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
    // // console.log("declareResponse", declareResponse);

    // const contractClassHash = declareResponse.class_hash;
    const contractClassHash=AAaccountClassHash

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

    

    const { transaction_hash: declTH, class_hash: decCH } =
      await account0.declare({
        contract: compiledSierraAAaccount,
      });
    console.log("Customized account class hash =", decCH);
    // await provider.waitForTransaction(declTH);

    const AAaccountConstructorCallData = CallData.compile({
      //   super_admin_address: account0.address,
      //   publicKey: AAstarkKeyPub,
      public_key: nostrPublicKey,
    });
    // Calculate future address of the account
    const AAcontractAddress = hash.calculateContractAddressFromHash(
      AAstarkKeyPub,
      AAaccountClassHash,
      AAaccountConstructorCallData,
      0
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
    
    const { suggestedMaxFee: estimateAccoutDeployFee } = await account0.estimateAccountDeployFee({
      classHash: contractClassHash,
      constructorCalldata: AAaccountConstructorCallData,
      contractAddress: AAcontractAddress,
    });
    console.log("estimateAccoutDeployFee",estimateAccoutDeployFee)
    const AAaccount = new Account(provider, AAcontractAddress, AAprivateKey);
    const { suggestedMaxFee: estimatedFeeDeploy } = await account0.estimateDeployFee({
      classHash: AAaccountClassHash,
      // constructorCalldata is not necessary if the contract to deploy has no constructor
      constructorCalldata: AAaccountConstructorCallData,
    })


    console.log("estimatedFeeDeploy",estimatedFeeDeploy)


    const { transaction_hash, contract_address } =
    await account0.deployAccount({
      classHash: contractClassHash,
      constructorCalldata: AAaccountConstructorCallData,
      addressSalt: AAstarkKeyPub,
    });
    // add ,"1" after AAprivateKey if this account is not a Cairo 0 contract
    // const { transaction_hash, contract_address } =
    //   await AAaccount.deployAccount({
    //     classHash: AAaccountClassHash,
    //     constructorCalldata: AAaccountConstructorCallData,
    //     addressSalt: AAstarkKeyPub,
    //   });
    await provider.waitForTransaction(transaction_hash);
    console.log(
      "✅ New customized account created.\n   address =",
      contract_address
    );

    return {
      contract_address,
      transaction_hash,
      privateKey: AAprivateKey,
      publicKey: contract_address,
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
  }

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
