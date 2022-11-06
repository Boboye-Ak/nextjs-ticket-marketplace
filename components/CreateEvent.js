import { useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { partyFactoryAddresses, partyFactoryAbi, chains } from "../constants"
import { convertToWei } from "../utils/converter"
import { useRouter } from "next/router"
import Loader from "./Full Screen Components/Loader"

const CreateEvent = () => {
    const router = useRouter()
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

    const [eventName, setEventName] = useState("")
    const [numTickets, setNumTickets] = useState("")
    const [ticketCost, setTicketCost] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    //Web3 Functions
    const {
        runContractFunction: createParty,
        isFetching: createPartyIsFetching,
        isLoading: createPartyIsLoading,
    } = useWeb3Contract({
        abi: partyFactoryAbi,
        contractAddress: partyFactoryAddress,
        functionName: "createParty",
        params: {
            name: eventName,
            symbol: eventName.slice(0, 3),
            maxAttendees: numTickets,
            ticketCost: convertToWei(ticketCost),
        },
    })
    const {
        runContractFunction: getParties,
        isFetching: getPartiesIsFetching,
        isLoading: getPartiesIsLoading,
    } = useWeb3Contract({
        abi: partyFactoryAbi,
        contractAddress: partyFactoryAddress,
        functionName: "getParties",
        params: { host: account },
    })

    //Web2 Functions

    const handleSubmit = async () => {
        setIsLoading(true)
        await createParty({
            onSuccess: async (tx) => {
                tx.wait(1)
                setIsLoading(false)
                const eventsFromCall = await getParties()
                const eventAddress = eventsFromCall[eventsFromCall.length - 1]
                router.push(`/event/${eventAddress}`)
            },
            onError: async (tx) => {
                setIsLoading(false)
                //Send Notification
            },
        })
    }
    return (
        <div className="create-event">
            {isLoading && <Loader />}
            <h2 className="new-event-header">New Event</h2>
            <form>
                <div className="input-wrap">
                    <input
                        type="text"
                        placeholder="Event Name"
                        maxLength={50}
                        value={eventName}
                        onChange={(e) => {
                            setEventName(e.target.value)
                        }}
                    />
                    <div>{eventName.length}/50</div>
                </div>

                <div className="input-wrap">
                    <input
                        type="number"
                        placeholder="Number of Available Tickets"
                        value={numTickets}
                        onChange={(e) => {
                            if (e.target.value != "") {
                                setNumTickets(parseInt(e.target.value))
                            } else {
                                setNumTickets("")
                            }
                        }}
                    />
                </div>
                <div className="input-wrap">
                    <input
                        type="number"
                        placeholder="Ticket Cost(ETH)"
                        value={ticketCost}
                        onChange={(e) => {
                            if (e.target.value != "") {
                                setTicketCost(e.target.value)
                            } else {
                                setTicketCost("")
                            }
                        }}
                    />
                </div>
                <div>
                    <button
                        disabled={
                            !eventName ||
                            !numTickets ||
                            createPartyIsFetching ||
                            createPartyIsLoading
                        }
                        onClick={(e) => {
                            e.preventDefault()
                            handleSubmit()
                        }}
                    >
                        Create Event
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CreateEvent
