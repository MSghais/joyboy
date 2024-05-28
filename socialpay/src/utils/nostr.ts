import {
  Event,
  SimplePool,
  generateSecretKey,
  getPublicKey,
} from "nostr-tools";
import { finalizeEvent, verifyEvent } from "nostr-tools";
import { Relay } from "nostr-tools";

export const generateKeypair = () => {
  let privateKey = generateSecretKey(); // `sk` is a Uint8Array
  let publicKey = getPublicKey(privateKey); // `pk` is a hex string

  return {
    privateKey,
    publicKey,
  };
};

/** Verify send event
 */
export const sendEvent = async (
  sk: Uint8Array,
  content: string = "@joyboy send 20 USDC to @alice.xyz"
) => {
  let eventRender: Event | undefined;
  try {
    let event = finalizeEvent(
      {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: content,
      },
      sk
    );
    let isGood = verifyEvent(event);
    eventRender = event;

    if (!isGood) {
      return { event: undefined, isValid: false };
    }

    // const pool = new SimplePool();
    // await pool.publish(
    //   [process.env.NOSTR_RELAYER_WEBSOCKET ?? "ws://localhost:3000"],
    //   event
    // );
    return { event, isValid: true };
  } catch (e) {
    console.log("Error send note", e);
    return {
      event: eventRender,
      isValid: false,
    };
  }
};
