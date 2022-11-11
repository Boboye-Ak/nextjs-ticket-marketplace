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
    const [fileImg, setFileImg] = useState("")
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

        costFromCall = convertToEth(costFromCall)
        let numTicketsFromCall = (await getNumTickets())?.toString()
        setNumTickets(numTicketsFromCall)
        setMaxAttendees(maxAttendeesFromCall)
        setTotalSold(totalSoldFromCall)
        setPartyName(partyNameFromCall)
        setIsLoading(false)
        setCost(costFromCall)
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
        let nameForPostRequest = partyName
        let venueForPostRequest = newVenue || venue
        let descriptionForPostRequest = newDescription || description
        let dateTimeForPostRequest = newDate || date
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
        console.log(res.data)
    }

    const undoChanges = () => {
        setNewDate(date)
        setNewVenue(venue)
        setNewDescription(description)
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
                    <div className="party-poster">POSTER</div>
                </div>
                <div className="date-and-venue">
                    <span>Date: {newDate}</span>
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
                                <div key={index} className="ticket-id">
                                    Ticket #{ticket}=&#62;
                                    {isCheckedIn[ticket] ? "Checked In" : "Not Checked In"}
                                </div>
                            )
                        })}
                    </div>
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
