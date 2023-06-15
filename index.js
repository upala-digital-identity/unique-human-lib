const { UpalaConstants, numConfirmations } = require('@upala/constants')
const { ethers } = require('ethers')
// newIdentityOwner - address of the new id owner
// wallet - ethersjs wallet object
// upalaConstants - upala constants object (an override for tests)

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

// liquidationCheque - pool address and pool-specific attack payload
async function liquidate(wallet, liquidationCheque, upalaConstants) {
    // get pool factory by poolAddress
    // load abi and liquidation instructions
    // check data
    // liquidate
    let { poolAddress, scoreAssignedTo, score, bundleId, proof } = liquidationCheque
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

// TODO add function eth balance
// providerOrSigner - meaning we don't need to sign any txs. We are just reading the contract
// upalaConstants is optional. If omitted will retrieve constants from signer's chainID
async function isLiquidated(providerOrSigner, upalaID, upalaConstants) {
    let upConsts = loadUpalaconstants(await providerOrSigner.getChainId(), upalaConstants)
    const upala = upConsts.getContract('Upala', providerOrSigner)
    return await upala.connect(providerOrSigner).isLiquidated(upalaID) // try owner()
}

async function getUpalaID(wallet, upalaConstants) {
    let upConsts = loadUpalaconstants(await wallet.getChainId(), upalaConstants)
    const upala = upConsts.getContract('Upala', wallet)
    return await upala.connect(wallet).myId()
}

async function getDaiBalance(wallet, upalaConstants) {
    let upConsts = loadUpalaconstants(await wallet.getChainId(), upalaConstants)
    const dai = upConsts.getContract('DAI', wallet)
    return dai.connect(wallet).balanceOf(wallet.address)
}

module.exports = { 
    newIdentity,
    liquidate,
    getDaiBalance,
    isLiquidated,
    getUpalaID }
