# Social pay repository with Relayer and tests

The Social pay provide Nostr user to send token easily via Starknet.

### Alice sends tokens to Bob

```mermaid
sequenceDiagram
    actor Alice
    actor Bob
    participant SocialPay relay
    participant Starknet Node
    participant Alice Account
    participant STRK Token

    Alice->>SocialPay relay: @joyboy send 10 STRK to @bob
    activate SocialPay relay
    SocialPay relay->>Starknet Node: SocialPay transaction
    Starknet Node->>Alice Account: SocialPay handler
    Alice Account->>STRK Token: transfer
    Starknet Node->>SocialPay relay: SocialPay transaction complete
    SocialPay relay->>Bob: @bob you just recived 10 STRK from @alice
    SocialPay relay->>Alice: @alice transfer of 10 STRK to @bob is complete
    deactivate SocialPay relay
```


## How install and use it: 

### Locally
Install the packages
```bash 
    npm i
```

Run the Social relay in WIP
```bash 
    npm run relay:dev # with nodemon
    npm run relay
```

### Docker 

Work in progress

## Test the integration

Tests are script in Typescript. We are gonna use Chalk or Mochai after if needed.

Run the Social relay in WIP
```bash 
    npm run relay:dev # with nodemon
    npm run relay
```

### Tests the scripts

Run the integration test end to end
```bash 
    npm run test
```
