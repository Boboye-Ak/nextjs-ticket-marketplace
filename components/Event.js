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
        let myTicketsArray = []
        let getOwnerOfOptions = {
            abi: partyAbi,
            contractAddress: partyAddress,
            functionName: "ownerOf",
            params: { tokenId: null },
        }
        const partyNameFromCall = await getName()
        const totalSoldFromCall = (await getTotalSold())?.toString()
        const maxAttendeesFromCall = (await getMaxAttendees())?.toString()
        let numTicketsFromCall = (await getNumTickets())?.toString()
        if (
            typeof numTicketsFromCall != "undefined" &&
            parseInt(numTicketsFromCall?.toString()) > 0 &&
            parseInt(totalSoldFromCall) > 0
        ) {
            numTicketsFromCall = parseInt(numTicketsFromCall)
            for (let n = 1; n <= parseInt(totalSoldFromCall); n++) {
                console.log(`checking token ID ${n}`)
                getOwnerOfOptions.params.tokenId = n
                let owner = await getOwnerOf({ params: getOwnerOfOptions })
                if (owner?.toLowerCase() == account?.toLowerCase()) {
                    console.log(`token ID ${n} is yours`)
                    myTicketsArray.push(n)
                    console.log(myTicketsArray)
                } else {
                    console.log(`token ID ${n} is not yours`)
                }
                if (myTicketsArray.length >= parseInt(numTicketsFromCall)) {
                    break
                }
            }
        } else {
            numTicketsFromCall = 0
        }
        console.log(myTicketsArray)
        setNumTickets(numTicketsFromCall)
        setMaxAttendees(maxAttendeesFromCall)
        setTotalSold(totalSoldFromCall)
        setPartyName(partyNameFromCall)
        setMyTickets(myTicketsArray)
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
            You own tickets with IDs:
            <div>
                {myTickets.map((ticket, index) => {
                    return <div key={index}>{ticket}</div>
                })}
            </div>
        </div>
    )
}

export default Event
