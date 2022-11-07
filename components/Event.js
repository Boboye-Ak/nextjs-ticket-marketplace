import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { chains, partyFactoryAddresses, partyFactoryAbi, partyAbi } from "../constants"
import Loader from "./Full Screen Components/Loader"

const Event = ({ partyAddress }) => {
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

    const [partyName, setPartyName] = useState("")
    const [cost, setCost] = useState("")
    const [totalSold, setTotalSold] = useState("")
    const [maxAttendees, setMaxAttendees] = useState("")
    const [numTickets, setNumTickets] = useState("")
    const [myTickets, setMyTickets] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [timeTaken, setTimeTaken] = useState(0)

    //Web3 Functions
    const { runContractFunction: getCost } = useWeb3Contract({
        abi: partyAbi,
        contractAddress: partyAddress,
        functionName: "getCost",
        params: {},
    })
    const { runContractFunction: getPoster } = useWeb3Contract({
        abi: partyAbi,
        contractAddress: partyAddress,
        functionName: "getPoster",
        params: {},
    })
    const { runContractFunction: getName } = useWeb3Contract({
        abi: partyAbi,
        contractAddress: partyAddress,
        functionName: "name",
        params: {},
    })
    const { runContractFunction: getTotalSold } = useWeb3Contract({
        abi: partyAbi,
        contractAddress: partyAddress,
        functionName: "getTotalSold",
        params: {},
    })
    const { runContractFunction: getMaxAttendees } = useWeb3Contract({
        abi: partyAbi,
        contractAddress: partyAddress,
        functionName: "getMaxAttendees",
        params: {},
    })
    const { runContractFunction: getNumTickets } = useWeb3Contract({
        abi: partyAbi,
        contractAddress: partyAddress,
        functionName: "balanceOf",
        params: { owner: account },
    })
    const { runContractFunction: getOwnerOf } = useWeb3Contract()

    //Web2 Functions
    const updateUI = async () => {
        setIsLoading(true)
        const partyNameFromCall = await getName()
        const totalSoldFromCall = (await getTotalSold())?.toString()
        const maxAttendeesFromCall = (await getMaxAttendees())?.toString()
        let numTicketsFromCall = (await getNumTickets())?.toString()
        setNumTickets(numTicketsFromCall)
        setMaxAttendees(maxAttendeesFromCall)
        setTotalSold(totalSoldFromCall)
        setPartyName(partyNameFromCall)
        setIsLoading(false)
        setMyTickets([])
    }

    const listMyTokens = async () => {
        const startTime = new Date().getTime()
        setIsLoading(true)
        let myTicketsArray = []
        let getOwnerOfOptions = {
            abi: partyAbi,
            contractAddress: partyAddress,
            functionName: "ownerOf",
            params: { tokenId: null },
        }
        let numTicketsFromCall = numTickets
        let totalSoldFromCall = totalSold
        if (
            typeof numTicketsFromCall != "undefined" &&
            parseInt(numTicketsFromCall?.toString()) > 0 &&
            parseInt(totalSoldFromCall) > 0
        ) {
            numTicketsFromCall = parseInt(numTicketsFromCall)
            for (let n = 1; n <= parseInt(totalSoldFromCall); n++) {
                getOwnerOfOptions.params.tokenId = n
                let owner = await getOwnerOf({ params: getOwnerOfOptions })
                if (owner?.toLowerCase() == account?.toLowerCase()) {
                    myTicketsArray.push(n)
                }
                if (myTicketsArray.length >= parseInt(numTicketsFromCall)) {
                    break
                }
            }
        } else {
            numTicketsFromCall = 0
        }
        const endTime = new Date().getTime()
        setTimeTaken(endTime - startTime)
        setMyTickets(myTicketsArray)
        setIsLoading(false)
    }

    //useEffects
    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled, chainId, account])
    return (
        <div>
            {isLoading && <Loader />}
            Event with address {partyAddress}. You have {numTickets} tickets to {partyName}.{" "}
            {totalSold} out of the total {maxAttendees} have been sold.
            <br />
            <button
                onClick={() => {
                    listMyTokens()
                }}
            >
                Get My Ticket ID Numbers
            </button>
            You own tickets with IDs:
            <div>
                {myTickets.map((ticket, index) => {
                    return <div key={index}>{ticket}</div>
                })}
            </div>
            <div>time taken:{timeTaken}</div>
        </div>
    )
}

export default Event
