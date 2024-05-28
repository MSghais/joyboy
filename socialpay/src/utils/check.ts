import { ContentFormat, EventNostr } from "src/types";
import { getPublicKeyByHandle } from "./nostr";

export const checkAndFilterSocialPayContent = (content: string, event?:EventNostr): ContentFormat | undefined => {
  try {
    const regex =
      /^@([a-zA-Z0-9._-]+)\s+send\s+([0-9]+)\s+(\w+)\s+to\s+@([a-zA-Z0-9._-]+)$/;

    // Execute the regex on the input string
    const match = content?.match(regex);
    if (match) {
      const [, sender, amount, currency, receiver] = match;
      let receiverAddress = receiver
      let senderAddress = sender

      // @TODO Get address of the token to transfer
      let currencyAddress=currency
      
      /** @TODO get npub by NIP-05 or NIP-24 for sender and receiver
       * Use event pubkey at this moment
       * 
      */
      if (sender?.includes("@")) {
        receiverAddress=event?.pubkey ?? receiver
      }

      if (receiver?.includes("@")) {
      }



      let object = {
        sender: senderAddress,
        amount: parseInt(amount, 10),
        currency,
        receiver: receiverAddress,
      };
      return object;
    }

    return undefined;
  } catch (e) {
    console.log("Error checkAndFilterSocialPayContent", e);
    return undefined;
  }
};


export const getProfilesByNames = async (requestFormat: ContentFormat) => {
  try {

    const { sender, amount, currency, receiver } = requestFormat;
    let receiverAddress = receiver
    let senderAddress = sender
    /** @TODO get npub by NIP-05 or NIP-24 receiver
     * Sender pubkey can be get on the event directly
    */
    if (receiver?.includes("@")) {
      let receiverProfile = await getPublicKeyByHandle(receiver)
      if(receiverProfile) {
        receiverAddress=receiverProfile?.pubkey
      }

    }

    let object = {
      sender: senderAddress,
      amount:amount,
      currency,
      receiver: receiverAddress,
    };
    return object;


  } catch (e) {
    console.log("Error checkAndFilterSocialPayContent", e);
    return undefined;
  }
};
