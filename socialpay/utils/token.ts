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
  Calldata,
  cairo,
} from "starknet";
import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";
import { SocialPayRequest } from "types";
dotenv.config();
const STARKNET_URL = process.env.RPC_ENDPOINT || "http://127.0.0.1:5050";
// const PATH_TOKEN = "../abi/social_account.compiled_contract.json"
// const PATH_TOKEN = "./abi/ERC20Upgradeable.contract_class.json";
const PATH_TOKEN = "./abi/erc20_test.contract_class.json";

// import {  ab} from "../abi/ERC20Upgradeable.compiled_contract_class.json"
import ABI from "../abi/ERC20Upgradeable.contract_class.json"
// import ABI from "../abi/ERC20Upgradeable.compiled_contract_class.json";
// import ABIMintable from "../abi/ERC20Upgradeable.compiled_contract_class.json";

const PATH_TOKEN_COMPILED =
  "./abi/erc20_test.compiled_contract_class.json";

// Initialize RPC provider with a specified node URL (Goerli testnet in this case)
const provider = new RpcProvider({ nodeUrl: STARKNET_URL });
/** @TODO spec need to be discuss. This function serve as an exemple */
export const createToken = async () => {
  try {
    const privateKey0 = process.env.DEVNET_PK as string;
    const accountAddress0 = process.env.DEVNET_PUBLIC_KEY as string;

    // Devnet account
    const account0 = new Account(provider, accountAddress0, privateKey0, "1");

    // declare the contract

    const compiledContract = json.parse(
      fs.readFileSync(PATH_TOKEN).toString("ascii")
    );
    const compiledCasm = json.parse(
      fs.readFileSync(PATH_TOKEN_COMPILED).toString("ascii")
    );
    // console.log("compiledAAaccount =", compiledSierraAAaccount);

    // const contractConstructor: Calldata = CallData.compile({
    //   text: 'niceToken',
    //   longText: 'http://addressOfMyERC721pictures/image1.jpg',
    //   array1: myArray1,
    // });
    console.log("declareIfNot");

    // const declareIfNot = await account0.declareIfNot({
    //   contract: compiledContract,
    //   casm: compiledCasm,
    // });

    // const contractConstructor: Calldata = CallData.compile({
    //   symbol: "JOY",
    //   name: "JOYBOY",
    //   total_supply: cairo.uint256(100),
    //   recipient: account0?.address,
    // });
    const contractConstructor: Calldata = CallData.compile({
      // symbol: "JOY",
      // name: "JOYBOY",
      // total_supply: cairo.uint256(100),
      recipient: account0?.address,
    });
 
    // const { suggestedMaxFee: estimatedFee1 } =
    //   await account0.estimateDeclareFee({
    //     contract: compiledContract,
    //     // classHash:
    //     //   "0x4656704e1eaf6121da84b205aa99862cb534a6f9a0eec530c97534dc64d043",
    //   });
    // console.log("estimatedFee1", estimatedFee1);
    const deployResponse = await account0.declareAndDeploy({
      contract: compiledContract,
      casm: compiledCasm,
      constructorCalldata: contractConstructor,
      // classHash:
      //   "0x4656704e1eaf6121da84b205aa99862cb534a6f9a0eec530c97534dc64d043",
      // constructorCalldata: [
      //   "JOY",
      //   "JOYBOY",
      //   cairo.uint256(100),
      //   account0?.address,
      // ],
    }, {
      
    });

    // const deployResponse = await account0.deployContract({
    //   // contract: compiledContract,
    //   // casm: compiledCasm,
    //   constructorCalldata: contractConstructor,
    //   classHash:
    //     "0x4656704e1eaf6121da84b205aa99862cb534a6f9a0eec530c97534dc64d043",
    //   // constructorCalldata: [
    //   //   "JOY",
    //   //   "JOYBOY",
    //   //   cairo.uint256(100),
    //   //   account0?.address,
    //   // ],
    // });
    // const deployResponse = await account0.deployContract({
    //   classHash: contractClassHash,
    //   constructorCalldata: ["JOY", "JOYBOY",cairo.uint256(100), account0?.address ],
    // });

    // const deployResponse = await account0.declareAndDeploy({
    //   contract: compiledContract,
    //   casm: compiledCasm,
    // });

    // // Connect the new contract instance:
    // const myTestContract = new Contract(
    //   compiledContract.abi,
    //   deployResponse.deploy.contract_address,
    //   provider
    // );
  } catch (error) {
    console.log("Error createToken= ", error);
  }
};

export const getToken = async (tokenAddress: string, classHash?: string) => {
  try {
    const privateKey0 = process.env.DEVNET_PK as string;
    const accountAddress0 = process.env.DEVNET_PUBLIC_KEY as string;
    // const { abi: testAbi } = await provider.getClassAt(tokenAddress);
    const { abi: testAbi } = await provider.getClassAt(tokenAddress);

    const account = new Account(provider, accountAddress0, privateKey0, "1");

    // const token = new Contract(ABI, tokenAddress, provider);
    const token = new Contract(testAbi, tokenAddress, provider);
    // const token = new Contract(ABI.abi, tokenAddress, provider);


    // Connect account with the contract
    token.connect(account);
    return token;
  } catch (error) {
    console.log("Error createToken= ", error);
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
