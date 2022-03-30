const { UpalaConstants } = require('@upala/constants')
// newIdentityOwner - address of the new id owner
// wallet - ethersjs wallet object
// upalaConstants - upala constants object 

async function loadUpalaconstants(upalaConstants) {
    if (upalaConstants) {
        // mainly needed for tests (test don't load constants from disk)
        return upalaConstants
    } else {
        // for all other clients of group-manager upConstants is built in
        return new UpalaConstants(await wallet.getChainId())
    }
}
async function newIdentity(newIdentityOwner, wallet, upalaConstants) {
    let upConsts = loadUpalaconstants(upalaConstants)
    const upala = upConsts.getContract('Upala', wallet)
    const tx = await upala.connect(wallet).newIdentity(newIdentityOwner)
  
    // retrieve id (todo - is there an easier way?)
    const blockNumber = (await tx.wait(1)).blockNumber
    const eventFilter = upala.filters.NewIdentity()
    const events = await upala.queryFilter(eventFilter, blockNumber, blockNumber)
    const upalaID = events[0].args.upalaId
    return upalaID
}
// attackPayload - pool-specific attack payload
async function explode(wallet, poolAddress, attackPayload, upalaConstants) {
    // get pool factory by poolAddress
    // load abi and explosion instructions
    // check data
    // explode
    let upConsts = loadUpalaconstants(upalaConstants)
    let { score, bundleId, proof } = attackPayload
    // todo check if id already exists for the address
    const upalaID = await newIdentity(wallet.address, wallet)
    // const upala = upConsts.getContract('Upala', wallet)
    const poolType = 'SignedScoresPool'  // hard-coded for now
    const pool = upConsts.getContract(poolType, wallet, poolAddress)
    return await pool.connect(wallet).attack(
        upalaID, 
        wallet.address,  // scoreAssignedTo
        score,
        bundleId,
        proof)
}
module.exports = { newIdentity, explode }
