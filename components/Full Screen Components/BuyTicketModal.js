import { Icon } from "@iconify/react"
import React, { useState } from "react"
import NotificationBar from "../Notification-bar"
import Switch from "../Switch"
import {partyAbi} from "../../constants"

const BuyTicketModal = ({ ticketCost, partyAddress, partyName, toggleShowBuyTicketModal }) => {
    const [showAddress, setShowAddress] = useState(false)
    const [addressInput, setAddressInput] = useState()
    return (
        <div className="buy-ticket-modal-container">
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
                <div>
                    Ticket Price: {ticketCost} <Icon icon="logos:ethereum" />
                </div>
            </div>
        </div>
    )
}

export default BuyTicketModal
