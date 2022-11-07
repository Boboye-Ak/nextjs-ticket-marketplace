import { Icon } from "@iconify/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { chains, partyFactoryAddresses, partyFactoryAbi, partyAbi } from "../constants"
import { convertToEth } from "../utils/converter"
import Loader from "./Full Screen Components/Loader"
import NotificationBar from "./Notification-bar"

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
    const [isHost, setIsHost] = useState(false)
    const [isCheckedIn, setIsCheckedIn] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [showNotificationBar, setShowNotificationBar] = useState(false)
    const [notificationText, setNotificationText] = useState("")
    const [notificationType, setNotificationType] = useState("")

    //Web3 Functions
    const { runContractFunction: getHost } = useWeb3Contract({
        abi: partyAbi,
        contractAddress: partyAddress,
        functionName: "getHost",
        params: {},
    })
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
    const { runContractFunction: getIsCheckedIn } = useWeb3Contract()

    //Web2 Functions
    const showNotification = (text, notificationType = "success") => {
        setNotificationText(text)
        setNotificationType(notificationType)
        setShowNotificationBar(true)
        setTimeout(() => {
            setShowNotificationBar(false)
            setNotificationText("")
        }, 5000)
    }
    const updateUI = async () => {
        setIsLoading(true)
        const partyNameFromCall = await getName()
        const totalSoldFromCall = (await getTotalSold())?.toString()
        const maxAttendeesFromCall = (await getMaxAttendees())?.toString()
        let costFromCall = (await getCost())?.toString()
        const hostFromCall = await getHost()
        console.log(costFromCall)
        costFromCall = convertToEth(costFromCall)
        let numTicketsFromCall = (await getNumTickets())?.toString()
        setNumTickets(numTicketsFromCall)
        setMaxAttendees(maxAttendeesFromCall)
        setTotalSold(totalSoldFromCall)
        setPartyName(partyNameFromCall)
        setIsLoading(false)
        setCost(costFromCall)
        setIsHost(account.toLowerCase() == hostFromCall?.toLowerCase())
        setMyTickets([])
    }

    const listMyTokens = async () => {
        setIsLoading(true)
        let myTicketsArray = []
        let isCheckedInObject = {}
        let getOwnerOfOptions = {
            abi: partyAbi,
            contractAddress: partyAddress,
            functionName: "ownerOf",
            params: { tokenId: null },
        }
        let getIsCheckedInOptions = {
            abi: partyAbi,
            contractAddress: partyAddress,
            functionName: "getIsCheckedIn",
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
        setMyTickets(myTicketsArray)
        if (myTicketsArray.length) {
            for (let n = 0; n < myTicketsArray.length; n++) {
                let id = myTicketsArray[n]
                getIsCheckedInOptions.params.tokenId = id
                let checkedInStatus = await getIsCheckedIn({ params: getIsCheckedInOptions })
                isCheckedInObject[id] = checkedInStatus
            }
            setIsCheckedIn(isCheckedInObject)
            console.log(isCheckedInObject)
        }
        setIsLoading(false)
    }

    //useEffects
    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled, chainId, account])
    return (
        <div className="event-page">
            {isLoading && <Loader />}
            <NotificationBar
                isShown={showNotificationBar}
                notificationText={notificationText}
                notificationType={notificationType}
            />
            <div className="event-page-head">
                <div className="pc-only party-address">
                    {partyAddress}
                    <span
                        onClick={() => {
                            navigator.clipboard.writeText(partyAddress)
                            showNotification("Event Address copied to clipboard!")
                        }}
                    >
                        <Icon icon="clarity:copy-to-clipboard-line" />
                    </span>
                </div>
                <div className="mobile-only party-address">
                    {partyAddress?.slice(0, 10)}...
                    {partyAddress?.slice(partyAddress.length - 5, partyAddress.length - 1)}
                    <span
                        onClick={() => {
                            navigator.clipboard.writeText(partyAddress)
                            showNotification("Event Address copied to clipboard!")
                        }}
                    >
                        <Icon icon="clarity:copy-to-clipboard-line" />
                    </span>
                </div>
                <div className="tickets-left">
                    {parseInt(maxAttendees) - parseInt(totalSold) ? (
                        <>{parseInt(maxAttendees) - parseInt(totalSold)} Tickets Left</>
                    ) : (
                        "Sold Out"
                    )}
                </div>
            </div>
            <div className="event-page-body">
                <div className="party-poster-container">
                    <div className="party-poster">POSTER</div>
                </div>
                <div className="date-and-venue">
                    <span>Date: 13/10/1999</span>
                    <span>Venue: Royal Birds Hotel Alagbaka</span>
                </div>
                <div className="party-description">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec quis aliquam dui,
                    at accumsan leo. Phasellus malesuada sem sed sollicitudin facilisis. Proin
                    tristique ultricies mi id elementum. Donec vel posuere lectus. Aenean facilisis
                    justo non dolor volutpat, at ornare leo imperdiet. Donec sit amet turpis nisl.
                    Morbi sapien ipsum, semper a dui ullamcorper, hendrerit ultrices eros. Aliquam
                    luctus sed ipsum sed hendrerit. Cras consequat, mi nec dictum posuere, quam enim
                    aliquam nibh, non dictum elit enim et lorem. Donec condimentum mattis diam,
                    pharetra lacinia mi mattis nec. Ut ultrices lobortis urna, sed dictum mauris
                    vulputate eget. Duis nec elit eget massa ultrices sagittis vel tincidunt ante.
                    Duis imperdiet tempus purus non semper. Nullam tempor ante leo, sit amet sodales
                    felis efficitur eget. Quisque eu sapien sodales, sollicitudin odio eu, viverra
                    eros. In vitae quam auctor, maximus dui auctor, feugiat sem. Sed vestibulum ex
                    eget urna eleifend, ac interdum magna mattis. Vivamus lobortis convallis
                    ultrices. Integer porttitor lectus eget orci dignissim hendrerit. Duis dapibus
                    lorem in libero lacinia, ut blandit ex cursus. Nunc sed laoreet ipsum. Proin
                    mattis mi at erat iaculis, ac semper erat egestas. Maecenas gravida lacinia
                    lorem at iaculis.
                </div>
                <div className="num-tickets-container">
                    <div className="num-tickets-text">You Have</div>
                    <div className="num-tickets">{numTickets}</div>
                    <div className="num-tickets-text">Tickets To This Event</div>
                    <div>
                        <button
                            className="show-ticket-id-button"
                            onClick={() => {
                                listMyTokens()
                            }}
                            disabled={numTickets == 0 || numTickets == "0"}
                        >
                            Show Ticket IDs
                        </button>
                    </div>
                    <div className={`ticket-ids ${!myTickets.length && "hidden"}`}>
                        {myTickets?.map((ticket, index) => {
                            return (
                                <div>
                                    {ticket}=&#62;
                                    {isCheckedIn[ticket] ? "Checked In" : "Not Checked In"}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Event
