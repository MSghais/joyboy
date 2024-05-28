import express from "express";
import { SimplePool, Event } from "nostr-tools";
import dotenv from "dotenv";
import { checkAndFilterSocialPayContent } from "./utils/check";
dotenv.config();
const app = express();
const port = process.env.PORT_SOCIALPAY || 8080;
app.use(express.json());

// Endpoint to receive Nostr messages for Social pay
app.post("/pay", (req, res) => {
  const { event: eventProps } = req.body;
  if (!eventProps) {
    res.status(400).send("Invalid event");
  }

  const event: Event = eventProps;
  if (!event?.content && !event?.sig) {
    res.status(400).send("Invalid event");
  }

  // Check content if it use the format
  let requestSocial = checkAndFilterSocialPayContent(event?.content);
  if (!requestSocial) {
    res.status(400).send("Invalid event");
  }

  /** @TODO Look user nip-05 for both user*/
  console.log("requestSocial", requestSocial);
  let sender = requestSocial?.sender;

  /** @TODO Look SocialAccount */

  /*Event done */
  res.status(200).json({
    message: "Pay request",
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
