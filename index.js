// newIdentityOwner - address of the new id owner
// wallet - ethersjs wallet object
// upalaConstants - upala constants object 
async function newIdentity(newIdentityOwner, wallet, upalaConstants) {

    const upala = upalaConstants.getContract('Upala', wallet)
    const tx = await upala.connect(wallet).newIdentity(newIdentityOwner)
  
    // retrieve id (todo - is there an easier way?)
    const blockNumber = (await tx.wait(1)).blockNumber
    const eventFilter = upala.filters.NewIdentity()
    const events = await upala.queryFilter(eventFilter, blockNumber, blockNumber)
    const upalaID = events[0].args.upalaId
    return upalaID
  }

  module.exports = { newIdentity }
