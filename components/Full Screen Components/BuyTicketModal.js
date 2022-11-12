import { Icon } from "@iconify/react"
import React, { useState } from "react"
import { convertToWei } from "../../utils/converter"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useRouter } from "next/router"
import NotificationBar from "../Notification-bar"
import Switch from "../Switch"
import { partyAbi, supportedChains, chains, partyFactoryAddresses } from "../../constants"
import Loader from "./Loader"

const BuyTicketModal = ({ ticketCost, partyAddress, partyName, toggleShowBuyTicketModal, updateUI }) => {
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

    //State Variables
    const [showAddress, setShowAddress] = useState(false)
    const [addressInput, setAddressInput] = useState()
    const [isLoading, setIsLoading] = useState(false)
    //Web3 Functions
    const { runContractFunction: buyTicket } = useWeb3Contract({
        abi: partyAbi,
        contractAddress: partyAddress,
        msgValue: convertToWei(ticketCost),
        functionName: "buyTicket",
        params: { ticketOwner: showAddress ? addressInput : account },
    })

    //Web2 Functions
    const handleBuyTicket = async () => {
        setIsLoading(true)
        console.log({ partyAddress, account })
        await buyTicket({
            onSuccess: async (tx) => {
                tx.wait(1)
                setIsLoading(false)
                updateUI()

            },
            onError: async () => {
                setIsLoading(false)
            },
        })
    }
    return (
        <div className="buy-ticket-modal-container">
            {isLoading && <Loader />}
            <NotificationBar />
            <div className="buy-ticket-modal">
                <div className="close-bar">
                    <div
                        className="close-button"
                        onClick={() => {
                            toggleShowBuyTicketModal()
                        }}
                    >
                        <Icon icon="mdi:close-circle-outline" />
                    </div>
                </div>
                <div className="buy-for-yourself">
                    <span>Are you buying this ticket for someone else?</span>
                    <span>
                        <Switch
                            isToggled={showAddress}
                            onToggle={() => {
                                setShowAddress(!showAddress)
                            }}
                        />
                    </span>
                </div>
                <div className={`address-text-wrap ${!showAddress && "hidden"}`}>
                    <input
                        type="text"
                        placeholder="Ticket Owner Address"
                        disabled={!showAddress}
                        value={addressInput}
                        onChange={(e) => {
                            setAddressInput(e.target.value)
                        }}
                    />
                </div>
                <div className="ticket-price">
                    Ticket Price: {ticketCost} <Icon icon="logos:ethereum" />
                </div>
                <div className="button-container">
                    <button
                        onClick={() => {
                            handleBuyTicket()
                        }}
                    >
                        Buy Ticket
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BuyTicketModal
