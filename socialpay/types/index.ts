import { Event as EventNostr } from "nostr-tools"

export interface SocialPayRequest extends EventNostr {
    sender?: string;
    to?: string;
    addressToken?: string;
    signature: {
        r:string,
        x:string
    }
}


export interface ContentFormat {
    sender?: string;
    amount?: number;
    currency?: string;
    receiver?: string;
    isValidAddress?:boolean;
}

export { EventNostr }