export const checkAndFilterSocialPayContent = (content: string) => {
  try {
    const regex =
      /^@([a-zA-Z0-9._-]+)\s+send\s+([0-9]+)\s+(\w+)\s+to\s+@([a-zA-Z0-9._-]+)$/;

    // Execute the regex on the input string
    const match = content?.match(regex);
    if (match) {
      const [, sender, amount, currency, receiver] = match;

      let object = {
        sender,
        amount: parseInt(amount, 10),
        currency,
        receiver,
      };
      return object;
    }

    return undefined;
  } catch (e) {
    console.log("Error checkAndFilterSocialPayContent", e);
    return undefined;
  }
};
