const partyFactoryAddresses = require("./partyFactoryAddresses.json")
const partyFactoryAbi = require("./partyFactoryAbi.json").abi
const partyAbi = require("./partyAbi.json").abi
const chains = require("./chains.json").chains

const supportedChains = chains.filter((chain) => {
    if (safelockFactoryAddresses[chain.chainId]) {
        return chain
    }
})

module.exports = { partyFactoryAddresses, partyFactoryAbi, partyAbi, supportedChains, chains }
