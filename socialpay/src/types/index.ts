import { Event as EventNostr } from "nostr-tools"

export interface SocialPayRequest extends EventNostr {
    sender?: string;
    to?: string;
    addressToken?: string;
}


export interface ContentFormat {
    sender: string;
    amount: number;
    currency: string;
    receiver: string;
}

export { EventNostr }