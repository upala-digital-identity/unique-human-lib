const { UpalaConstants, numConfirmations } = require('@upala/constants')
const { ethers } = require('ethers')
// newIdentityOwner - address of the new id owner
// wallet - ethersjs wallet object
// upalaConstants - upala constants object 

function loadUpalaconstants(chainId, upalaConstants) {
    if (upalaConstants) {
        // mainly needed for tests (test don't load constants from disk)
        return upalaConstants
    } else {
        // for all other clients of group-manager upConstants is built in
        return new UpalaConstants(chainId)
    }
}
async function newIdentity(newIdentityOwner, wallet, upalaConstants) {
    let upConsts = loadUpalaconstants(await wallet.getChainId(), upalaConstants)
    const upala = upConsts.getContract('Upala', wallet)
    const tx = await upala.connect(wallet).newIdentity(newIdentityOwner)
  
    // retrieve id (todo - is there an easier way?)
    const blockNumber = (await tx.wait(numConfirmations(await wallet.getChainId()))).blockNumber
    const eventFilter = upala.filters.NewIdentity()
    const events = await upala.queryFilter(eventFilter, blockNumber, blockNumber)
    const upalaID = events[0].args.upalaId
    return upalaID
}

// explosionCheque - pool address and pool-specific attack payload
async function explode(wallet, explosionCheque, upalaConstants) {
    // get pool factory by poolAddress
    // load abi and explosion instructions
    // check data
    // explode
    let { poolAddress, scoreAssignedTo, score, bundleId, proof } = explosionCheque
    let upConsts = loadUpalaconstants(await wallet.getChainId(), upalaConstants)
    // check if id already exists for the address and create one if doesn't
    const upala = upConsts.getContract('Upala', wallet)
    let upalaID = await upala.connect(wallet).myId()
    if (upalaID == ethers.constants.AddressZero) {
        upalaID = await newIdentity(wallet.address, wallet)
    }
    const poolType = 'SignedScoresPool'  // hard-coded for now
    const pool = upConsts.getContract(poolType, wallet, poolAddress)
    // attack
    return await pool.connect(wallet).attack(
        upalaID,
        scoreAssignedTo,
        score,
        bundleId,
        proof)
}

async function getDaiBalance(wallet, upalaConstants) {
    let upConsts = loadUpalaconstants(await wallet.getChainId(), upalaConstants)
    const dai = upConsts.getContract('DAI', wallet)
    return dai.connect(wallet).balanceOf(wallet.address)
}

module.exports = { newIdentity, explode, getDaiBalance }
