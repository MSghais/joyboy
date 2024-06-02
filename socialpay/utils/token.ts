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
  Uint256,
  uint256,
  Call,
} from "starknet";
import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";
import { SocialPayRequest } from "types";
dotenv.config();
const STARKNET_URL = process.env.RPC_ENDPOINT || "http://127.0.0.1:5050";
// const PATH_TOKEN = "../abi/social_account.compiled_contract.json"
const PATH_TOKEN = "./abi/ERC20Upgradeable.contract_class.json";
// const PATH_TOKEN = "./abi/erc20_test.contract_class.json";

// import {  ab} from "../abi/ERC20Upgradeable.compiled_contract_class.json"
import ABI from "../abi/ERC20Upgradeable.contract_class.json";
import { TOKENS_ADDRESS } from "../src/constants";
import { provider } from "./starknet";
// import ABI from "../abi/ERC20Upgradeable.compiled_contract_class.json";
// import ABIMintable from "../abi/ERC20Upgradeable.compiled_contract_class.json";

// const PATH_TOKEN_COMPILED =
//   "./abi/erc20_test.compiled_contract_class.json";
const PATH_TOKEN_COMPILED =
  "./abi/ERC20Upgradeable.compiled_contract_class.json";

// Initialize RPC provider with a specified node URL (Goerli testnet in this case)
// const provider = new RpcProvider({ nodeUrl: STARKNET_URL });
// const provider = new RpcProvider();

// const provider = new Provider({ rpc:  {nodeUrl:STARKNET_URL}  });

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

    const declareIfNot = await account0.declareIfNot({
      contract: compiledContract,
      casm: compiledCasm,
    });
    console.log("declareIfNot", declareIfNot);

    const contractConstructor: Calldata = CallData.compile({
      symbol: cairo.felt("JOY"),
      name: cairo.felt("JOYBOY"),
      total_supply: cairo.uint256(100),
      // total_supply:"1",
      recipient: account0?.address,
    });
    // const contractConstructor: Calldata = CallData.compile({
    //   // symbol: "JOY",
    //   // name: "JOYBOY",
    //   // total_supply: cairo.uint256(100),
    //   recipient: account0?.address,
    // });

    // const { suggestedMaxFee: estimatedFee1 } =
    //   await account0.estimateDeclareFee({
    //     contract: compiledContract,
    //     // classHash:
    //     //   "0x4656704e1eaf6121da84b205aa99862cb534a6f9a0eec530c97534dc64d043",
    //   });
    // // console.log("estimatedFee1", estimatedFee1);
    // const deployResponse = await account0.declareAndDeploy({
    //   contract: compiledContract,
    //   casm: compiledCasm,
    //   constructorCalldata: contractConstructor,
    //   // classHash:
    //   //   "0x4656704e1eaf6121da84b205aa99862cb534a6f9a0eec530c97534dc64d043",
    //   // constructorCalldata: [
    //   //   "JOY",
    //   //   "JOYBOY",
    //   //   cairo.uint256(100),
    //   //   account0?.address,
    //   // ],
    // });

    let ERC20_HASH =
      declareIfNot?.class_hash ?? (process.env.TOKEN_CLASS_HASH as string);
    const deployResponse = await account0.deployContract({
      // contract: compiledContract,
      // casm: compiledCasm,
      // constructorCalldata: contractConstructor,
      classHash: ERC20_HASH,
      constructorCalldata: [
        cairo.felt("JOY"),
        cairo.felt("JOY"),
        cairo.uint256(100),
        account0?.address,
      ],
    });

    let tx = await account0?.waitForTransaction(
      deployResponse?.transaction_hash
    );
    console.log("tx create contract", tx);

    // console.log("deploy erc20", deployResponse.deploy.contract_address);
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
    const myToken = new Contract(
      compiledContract.abi,
      deployResponse.contract_address,
      // deployResponse
      provider
    );
    return myToken;
  } catch (error) {
    console.log("Error createToken= ", error);
  }
};

export const transferToken = async (
  account: Account,
  recipient: string,
  tokenAddress?: string
) => {
  try {
    let token = await getToken(tokenAddress ?? TOKENS_ADDRESS.SEPOLIA.TEST);

    token?.connect(account);
    console.log("transfer token");
    // let transfer = await token?.transfer(AAcontractAddress, "0.003")
    // let transfer = await token?.transfer(AAcontractAddress, cairo.uint256(1/10**18))
    // let transfer = await token?.transfer(AAcontractAddress, cairo.uint256("1"))
    let balanceInitial = await token?.balanceOf(account.address);
    console.log("account0 has a balance of:", balanceInitial);

    // Execute tx transfer of 1 tokens to account 1
    console.log(`Invoke Tx - Transfer 1 tokens to erc20 contract...`);
    // const toTransferTk: Uint256 = cairo.uint256(1 * 10 / 18);
    const toTransferTk: Uint256 = cairo.uint256(1 * 10 * 18);
    let decimals = 18;
    let total_amount_float = 0.01;
    // let total_amount_float = 1;

    let total_amount: Uint256 | undefined;
    const total_amount_nb = total_amount_float * 10 ** Number(decimals);
    // let total_amount;

    if (Number.isInteger(total_amount_nb)) {
      total_amount = cairo.uint256(total_amount_nb);
    } else if (!Number.isInteger(total_amount_nb)) {
      // total_amount=total_amount_nb
      total_amount = uint256.bnToUint256(BigInt(total_amount_nb));
    }

    const transferCall: Call | undefined = token?.populate("transfer", {
      // recipient: '0x78662e7352d062084b0010068b99288486c2d8b914f6e2a55ce945f8792c8b1',
      // recipient: account0?.address,
      recipient: recipient,
      // amount: toTransferTk,
      amount: total_amount ?? toTransferTk,
    });
    console.log("transfer call",transferCall)
    if (transferCall) {
      // let estimateFee = await account0?.estimateInvokeFee(transferCall);
      let estimateFee = await account?.estimateFee(transferCall);

      // let estimateFee = await provider.getInvokeEstimateFee(transferCall)
      // let estimateFee = await account0?.getSuggestedFee(transferCall);
      console.log("estimateFee", estimateFee);
      const { transaction_hash: transferTxHash } = await account.execute(
        transferCall,
        undefined,
        {
          // maxFee: estimateFee?.suggestedMaxFee * BigInt(3),
          // maxFee: estimateFee?.suggestedMaxFee * BigInt(0),
          // maxFee:estimateFee?.suggestedMaxFee,
          // skipValidate: true,
        }
      );
      console.log("transferTxHash", transferTxHash);
      let tx = await provider.waitForTransaction(transferTxHash);
      console.log("wait tx", tx);
      console.log("transfer done");
      console.log("account0 has a balance of:", balanceInitial);
      balanceInitial = await token?.balanceOf(account.address);
    }
  } catch (e) {
    console.log("transferToken Error: ", e);
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
    // token.connect(account);
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
