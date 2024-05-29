import { Account, ec, json, stark, Provider, hash, CallData, RpcProvider, Contract } from 'starknet';
import fs from 'fs';
import axios from 'axios';
import dotenv from "dotenv"
import { SocialPayRequest } from 'types';
dotenv.config()
const STARKNET_URL = process.env.RPC_ENDPOINT || 'http://127.0.0.1:5050'
const PATH_SOCIAL_ACCOUNT = "../abi/social_account.json"
const provider = new RpcProvider({ nodeUrl: STARKNET_URL });

/** @TODO spec need to be discuss. This function serve as an exemple */
export const createSocialAccount = async (nostrPublicKey?: string) => {
    try {
        // initialize existing predeployed account 0 of Devnet
        const privateKey0 = process.env.DEVNET_PK as string;
        const accountAddress0 = process.env.DEVNET_PUBLIC_KEY as string;
        const account0 = new Account(provider, accountAddress0, privateKey0, "1");

        const AAaccountClassHash = process.env.ACCOUNT_CLASS_HASH as string
        // add ,"1" after privateKey0 if this account is not a Cairo 0 contract

        // new account abstraction
        // Generate public and private key pair.
        const AAprivateKey = stark.randomAddress();
        console.log('New account:\nprivateKey=', AAprivateKey);
        const AAstarkKeyPub = ec.starkCurve.getStarkKey(AAprivateKey);
        console.log('publicKey=', AAstarkKeyPub);

        // declare the contract
        const compiledAAaccount = json.parse(
            fs.readFileSync(PATH_SOCIAL_ACCOUNT).toString('ascii')
        );
        const { transaction_hash: declTH, class_hash: decCH } = await account0.declare({
            contract: compiledAAaccount,
        });
        console.log('Customized account class hash =', decCH);
        await provider.waitForTransaction(declTH);

        // Calculate future address of the account
        const AAaccountConstructorCallData = CallData.compile({
            super_admin_address: account0.address,
            publicKey: AAstarkKeyPub,
        });
        const AAcontractAddress = hash.calculateContractAddressFromHash(
            AAstarkKeyPub,
            AAaccountClassHash,
            AAaccountConstructorCallData,
            0
        );
        console.log('Precalculated account address=', AAcontractAddress);

        // fund account address before account creation
        const { data: answer } = await axios.post(
            'http://127.0.0.1:5050/mint',
            { address: AAcontractAddress, amount: 50_000_000_000_000_000_000, lite: true },
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('Answer mint =', answer);

        // deploy account
        const AAaccount = new Account(provider, AAcontractAddress, AAprivateKey);
        // add ,"1" after AAprivateKey if this account is not a Cairo 0 contract
        const { transaction_hash, contract_address } = await AAaccount.deployAccount({
            classHash: AAaccountClassHash,
            constructorCalldata: AAaccountConstructorCallData,
            addressSalt: AAstarkKeyPub,
        });
        await provider.waitForTransaction(transaction_hash);
        console.log('✅ New customized account created.\n   address =', contract_address);

        return {
            contract_address,
            transaction_hash,
            privateKey: AAprivateKey,
            publicKey: contract_address
        }
    } catch (error) {
        console.log("Error createSocialAccount= ", error)
    }
}

/** @TODO determine paymaster master specs to send the TX */
export const prepareAndConnectContract = async (
    addressUser: string,
    privateKeyProps: string,

) => {

    // Create a wallet account (example uses a random private key, for real use, securely store and use your private key)
    const accountAddress = addressUser ?? process.env.DEVNET_PUBLIC_KEY ?? '0xYOUR_ACCOUNT_ADDRESS';

    const privateKey = privateKeyProps ?? process?.env?.DEVNET_PK ?? '0xYOUR_PRIVATE_KEY';
    const account = new Account(provider, accountAddress, privateKey);

    // read abi of Test contract
    const { abi: testAbi } = await provider.getClassAt(addressUser);

    const socialPay = new Contract(testAbi, addressUser, provider);
    // Connect account with the contract
    socialPay.connect(account);
    return socialPay


}

export const handleTransferRequest = async (
    socialPay: Contract,
    socialRequest: SocialPayRequest,
) => {
    const provider = new RpcProvider({ nodeUrl: STARKNET_URL });
    const myCall = socialPay.populate('handle_transfer', [socialRequest]);
    const res = await socialPay.handle_transfer(myCall.calldata);
    await provider.waitForTransaction(res.transaction_hash);
    const bal2 = await socialPay.get_balance();
    console.log('Final balance =', bal2.res.toString());

}