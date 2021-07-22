# unique-human-lib

## Confirming user score on-chain

## Contract 

If your DApp needs on-chain proof of score, check this [example](https://github.com/upala-digital-identity/upala/blob/master/contracts/mockups/dapp.sol)

## Front-end

#### Load uniqueness data 
- querry Graph to get user id (Graph: "Get user UpalaID by address")
- if no id, "Error: no UpalaID found for the address".
- querry Graph to get list of groups approved by dapp (Graph: "Get approved pool for the dapp address")
- query 3 best scores from DB for the user among approved groups (see GET request [here](https://github.com/upala-digital-identity/db)). Will return score, pool type and proof.
- constuct bytes proof depending on the pool type. As we are building SignedScoresPool first, just pass signature (see [db](https://github.com/upala-digital-identity/db)) as the proof argument. 

#### Call 
- call dapp contract function with appropriate proof. e.g. **claimUBI(address recipient, poolAddress address, address identityID, uint8 score, bytes proof)**