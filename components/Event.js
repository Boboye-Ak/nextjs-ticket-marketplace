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

    //Web2 Functions
    const updateUI = async () => {}

    //useEffects
    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled, chainIdHex, account, partyFactoryAddress])
    return (
        <div>
            {isLoading && <Loader />}
            Event with address {partyAddress}
        </div>
    )
}

export default Event
