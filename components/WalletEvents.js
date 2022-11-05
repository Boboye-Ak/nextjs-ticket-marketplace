import axios from "axios"
import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { chains, partyFactoryAddresses, partyFactoryAbi, partyAbi } from "../constants"
const WalletEvents = ({ wallet }) => {
    const { chainId: chainIdHex, isWeb3Enabled, account } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const partyFactoryAddress =
        chainId in partyFactoryAddresses ? partyFactoryAddresses[chainId][0] : null
    let activeChain = chains.filter((chain) => {
        if (chain.chainId == chainId) {
            return chain
        }
    })
    activeChain = activeChain[0]

    //State variables
    const [eventAddresses, setEventAddresses] = useState([])
    const [events, setEvents] = useState([])

    //Web3 Functions
    const {
        runContractFunction: getParties,
        isFetching: getPartiesIsFetching,
        isLoading: getPartiesIsLoading,
    } = useWeb3Contract({
        abi: partyFactoryAbi,
        contractAddress: partyFactoryAddress,
        functionName: "getParties",
        params: { host: wallet },
    })
    const { runContractFunction: getCost } = useWeb3Contract()
    const { runContractFunction: getPoster } = useWeb3Contract()
    const { runContractFunction: getName } = useWeb3Contract()
    const { runContractFunction: getTotalSold } = useWeb3Contract()
    const { runContractFunction: getMaxAttendees } = useWeb3Contract()

    //Web2 Functions
    const updateUI = async () => {
        const partiesFromCall = await getParties()
        if (partiesFromCall?.length > 0) {
            setEventAddresses(partiesFromCall)
        }
    }

    const createEventsArray = async () => {
        let eventsArray = []
        let getpartyDataOptions = {
            abi: partyAbi,
            contractAddress: null,
            functionName: "",
            params: {},
        }
        for (let n = 0; n < eventAddresses?.length; n++) {
            let partyAddress = eventAddresses[n]
            getpartyDataOptions.contractAddress = eventAddresses[n]
            getpartyDataOptions.functionName = "name"
            let partyName = (await getName({ params: getpartyDataOptions }))?.toString()
            getpartyDataOptions.functionName = "getCost"
            let partyCost = (await getCost({ params: getpartyDataOptions }))?.toString()
            getpartyDataOptions.functionName = "getPoster"
            let partyDataUri = (await getPoster({ params: getpartyDataOptions }))?.toString()
            let partyImage, partyDescription
            if (partyDataUri) {
                partyDataUri = partyDataUri.replace("ipfs://", "https://ipfs.io/ipfs/")
                let res = await axios.get(partyDataUri)
                partyImage = res.data.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                partyDescription = res.data.description
            }
            getpartyDataOptions.functionName = "getTotalSold"
            let totalSold = (await getTotalSold({ params: getpartyDataOptions }))?.toString()
            getpartyDataOptions.functionName = "getMaxAttendees"
            let maxAttendees = (await getMaxAttendees({ params: getpartyDataOptions }))?.toString()
            let newParty = {
                partyAddress,
                partyName,
                partyCost,
                partyImage,
                partyDescription,
                totalSold,
                maxAttendees,
            }
            eventsArray.push(newParty)
        }
        setEvents(eventsArray)
    }

    //useEffects
    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled, wallet, chainId])
    useEffect(() => {
        if (eventAddresses?.length > 0) {
            createEventsArray()
        }
    }, [eventAddresses])
    return (
        <div>
            {wallet}'s Events:
            {events.map((event, index) => {
                return (
                    <div key={index}>
                        Event number {index}, Event Name:{event.partyName}, Event Address:
                        {event.partyAddress}, Event Cost:{event.partyCost}, Party Poster:
                        {event.partyPoster}, tickets sold: {event.totalSold}/{event.maxAttendees}
                    </div>
                )
            })}
        </div>
    )
}

export default WalletEvents
