import { Icon } from "@iconify/react"
import axios from "axios"
import { toImgObject, fileToBlob } from "../utils/nft-storage"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { chains, partyFactoryAddresses, partyFactoryAbi, partyAbi } from "../constants"
import { convertToEth } from "../utils/converter"
import Loader from "./Full Screen Components/Loader"
import NotificationBar from "./Notification-bar"
import BuyTicketModal from "./Full Screen Components/BuyTicketModal"

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
    const [numTickets, setNumTickets] = useState("0")
    const [myTickets, setMyTickets] = useState([])
    const [description, setDescription] = useState("")
    const [venue, setVenue] = useState("")
    const [date, setDate] = useState()
    const [imgUri, setImgUri] = useState("")
    const [newDescription, setNewDescription] = useState("")
    const [newVenue, setNewVenue] = useState("")
    const [newDate, setNewDate] = useState("")
    const [newPoster, setNewPoster] = useState("")
    const [fileImg, setFileImg] = useState("")
    const [isHost, setIsHost] = useState(false)
    const [isCheckedIn, setIsCheckedIn] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [showNotificationBar, setShowNotificationBar] = useState(false)
    const [notificationText, setNotificationText] = useState("")
    const [notificationType, setNotificationType] = useState("")
    const [showBuyTicketModal, setShowBuyTicketModal] = useState(false)

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
    const { runContractFunction: setPoster } = useWeb3Contract({
        abi: partyAbi,
        contractAddress: partyAddress,
        functionName: "setPoster",
        params: { newPoster: newPoster },
    })

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
        let posterFromCall = await getPoster()
        posterFromCall = posterFromCall?.replace("ipfs://", "https://ipfs.io/ipfs/")
        let res = await axios.get(posterFromCall)
        const {
            name: nameFromCall,
            description: descriptionFromCall,
            venue: venueFromCall,
            date: dateFromCall,
            image: imageFromCall,
        } = res.data
        console.log(res.data)

        costFromCall = convertToEth(costFromCall)
        let numTicketsFromCall = (await getNumTickets())?.toString()
        setNumTickets(numTicketsFromCall)
        setMaxAttendees(maxAttendeesFromCall)
        setTotalSold(totalSoldFromCall)
        setPartyName(partyNameFromCall)
        setIsLoading(false)
        setCost(costFromCall)
        setImgUri(imageFromCall?.replace("ipfs://", "https://ipfs.io/ipfs/"))
        setVenue(venueFromCall)
        setNewVenue(venueFromCall)
        setShowBuyTicketModal(false)
        setDate(dateFromCall)
        setDescription(descriptionFromCall)
        setNewDescription(descriptionFromCall)
        const isHostFromCall = account.toLowerCase() == hostFromCall?.toLowerCase()
        setIsHost(isHostFromCall)
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
        }
        setIsLoading(false)
    }

    const editEvent = async () => {
        let now = new Date().getTime()
        let nextDay = new Date(now + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
        let nameForPostRequest = partyName
        let venueForPostRequest = newVenue || venue
        let descriptionForPostRequest = newDescription || description
        let dateTimeForPostRequest = newDate
            ? newDate
            : date && date != "undefined"
            ? date
            : nextDay
        let fileImg1, fileImg2, fileImg3
        fileImg1 = fileImg ? await fileToBlob(fileImg) : ""
        fileImg3 = await toImgObject(
            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
        )
        fileImg2 = await toImgObject(imgUri)
        let fileImgForPostRequest = fileImg ? fileImg1 : fileImg2 ? fileImg2 : fileImg3
        console.log(fileImgForPostRequest)
        let formData = new FormData()
        formData.append("name", nameForPostRequest)
        formData.append("venue", venueForPostRequest)
        formData.append("description", descriptionForPostRequest)
        formData.append("date", dateTimeForPostRequest)
        formData.append("image", fileImgForPostRequest)

        let res = await axios.post("/api/editevent", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        let url = res.data.url
        setNewPoster(url)
        console.log(url)
    }

    const undoChanges = () => {
        setNewDate(date)
        setNewVenue(venue)
        setNewDescription(description)
    }

    const updatePoster = async () => {
        setIsLoading(true)
        await setPoster({
            onSuccess: async (tx) => {
                await tx.wait(1)
                setIsLoading(false)
                updateUI()
                setNewPoster("")
            },
        })
        setIsLoading(false)
    }

    const toggleShowBuyTicketModal = () => {
        setShowBuyTicketModal(!showBuyTicketModal)
    }

    //useEffects
    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled, chainId, account])
    useEffect(() => {
        if (newPoster) {
            updatePoster()
        }
    }, [newPoster])
    return (
        <div className="event-page">
            {isLoading && <Loader />}
            <NotificationBar
                isShown={showNotificationBar}
                notificationText={notificationText}
                notificationType={notificationType}
            />
            {showBuyTicketModal && (
                <BuyTicketModal
                    partyName={partyName}
                    partyAddress={partyAddress}
                    ticketCost={cost}
                    toggleShowBuyTicketModal={toggleShowBuyTicketModal}
                />
            )}
            <div className="event-page-head">
                <div className="pc-only party-address">
                    <div className="actual-party-address">{partyAddress}</div>
                    <span
                        onClick={() => {
                            navigator.clipboard.writeText(partyAddress)
                            showNotification("Event Contract Address copied to clipboard!")
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
                    <div
                        className="party-poster"
                        style={{
                            backgroundImage: `url("${imgUri}")`,
                        }}
                    ></div>
                </div>
                <div className="date-and-venue">
                    <span>Date: {date?.replace("T", " @ ")}</span>
                    <span>Venue: {venue}</span>
                </div>
                <div className="party-description">{description}</div>
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
                                <div key={index} className="ticket-id">
                                    Ticket #{ticket}=&#62;
                                    {isCheckedIn[ticket] ? "Checked In" : "Not Checked In"}
                                </div>
                            )
                        })}
                    </div>
                    <button
                        className="show-ticket-id-button"
                        onClick={() => {
                            setShowBuyTicketModal(!showBuyTicketModal)
                        }}
                    >
                        Buy Ticket
                    </button>
                </div>
            </div>
            {isHost && (
                <div className="edit-modal-container">
                    <div className="edit-modal">
                        <h2>Change Event Details</h2>
                        <label htmlFor="new-venue">Venue:</label>
                        <div className="input-container">
                            <span>
                                <Icon icon="material-symbols:house" />
                            </span>
                            <input
                                id="new-venue"
                                type="text"
                                value={newVenue}
                                onChange={(e) => {
                                    setNewVenue(e.target.value)
                                }}
                            />
                        </div>
                        <label htmlFor="new-date">Date:</label>
                        <div className="date-time-container">
                            <input
                                id="new-date"
                                type="datetime-local"
                                value={newDate}
                                onChange={(e) => {
                                    let currentTime = new Date().getTime()
                                    let eventTime = e.target.value
                                    eventTime = new Date(eventTime).getTime()
                                    if (eventTime - currentTime < 24 * 60 * 60 * 1000) {
                                        let nextDayMilliseconds = currentTime + 24 * 60 * 60 * 1000
                                        let nextDay = new Date(nextDayMilliseconds)
                                            .toISOString()
                                            .slice(0, 16)
                                        console.log({ nextDayMilliseconds, currentTime })
                                        setNewDate(nextDay)
                                    } else {
                                        console.log(e.target.value)
                                        setNewDate(e.target.value)
                                    }
                                    console.log(newDate)
                                }}
                            />
                        </div>
                        <label htmlFor="new-description">Description:</label>
                        <div className="text-area-container">
                            <textarea
                                id="new-descritpion"
                                value={newDescription}
                                onChange={(e) => {
                                    if (newDescription.length < 300) {
                                        setNewDescription(e.target.value)
                                    }
                                }}
                            />
                            <div className="letter-count-container">
                                <div className="letter-count">{newDescription.length}/300</div>
                            </div>
                        </div>
                        <label htmlFor="event-image" style={{ color: "black" }}>
                            {!fileImg ? (
                                <>
                                    Upload New Event Poster
                                    <Icon icon="bi:cloud-upload" />
                                </>
                            ) : (
                                <>
                                    Change New Event Poster <Icon icon="bi:cloud-upload" />
                                </>
                            )}
                        </label>
                        <input
                            type="file"
                            accept="image/png, image/gif, image/jpeg"
                            onChange={(e) => {
                                setFileImg(e.target.files[0])
                            }}
                            id="event-image"
                            hidden
                        ></input>
                        <div>
                            <button
                                onClick={() => {
                                    undoChanges()
                                }}
                            >
                                Undo Changes
                            </button>
                        </div>
                        <div>
                            <button
                                onClick={() => {
                                    editEvent()
                                }}
                            >
                                Submit Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Event
