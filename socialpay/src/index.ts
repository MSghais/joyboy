import express from "express";
import { SimplePool, Event } from "nostr-tools";
import dotenv from "dotenv";
import { checkAndFilterSocialPayContent } from "./utils/check";
import { ERROR_MESSAGES } from "./constants";
import { logDev } from "./utils/log";
dotenv.config();
const app = express();
const port = process.env.PORT_SOCIALPAY || 8080;
app.use(express.json());

/*** Endpoint to receive Nostr messages for Social pay
 * @TODO :  sanitize event
 * Receive event Nostr
 * Check SocialAccount created and linked
***/
app.post("/pay", (req, res) => {
  const { event: eventProps } = req.body;

  if (!eventProps) {
    res.status(500).json({ message: ERROR_MESSAGES?.EVENT_NOTE_INVALID?.label });
  }

  /** @TODO sanitize */
  const event: Event = eventProps;
  if (!event?.content && !event?.sig) {
    res.status(500).json({ message: ERROR_MESSAGES?.EVENT_NOTE_INVALID?.label });
  }

  // Check content if it use the format
  let requestSocial = checkAndFilterSocialPayContent(event?.content, event);
  logDev(`Request social ${JSON.stringify(requestSocial)}`)

  if (!requestSocial) {
    res.status(500).json({
      message: ERROR_MESSAGES.PAY_REQUEST_NOT_FOUND.label
    });
  }


  if (requestSocial?.receiver?.includes("@") || requestSocial?.sender?.includes("@")) {
    res.status(500).json({
      message: ERROR_MESSAGES.ADDRESS_INVALID?.label
    });

  }
  /** @TODO Look user nip-05 for both user*/
  logDev(`Request social ${JSON.stringify(requestSocial)}`)
  let sender = event?.pubkey ?? requestSocial?.sender;

  /** @TODO Look SocialAccount Starknet key*/

  /*** Starknet handle_transfer call for SocialPay request
  * @TODO We need to have an hard check for the pubkey before sending tx
  ***/


  /*Event done */
  res.status(200).json({
    message: "Pay request",
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
