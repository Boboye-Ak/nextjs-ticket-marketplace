import { Icon } from "@iconify/react"
import { useRouter } from "next/router"

const FullScreenPartyCard = ({ party, toggleFullScreenCard }) => {
    const router = useRouter()
    return (
        <div className="full-screen-party-card-container">
            <div
                className="full-screen-party-card"
                style={{
                    backgroundImage: `url("${party.partyImage}")`,
                }}
            >
                <div className="close-bar">
                    <div className="close-button" onClick={toggleFullScreenCard}>
                        <Icon icon="mdi:close" />
                    </div>
                </div>
                <div className="party-info">
                    <div className="party-name">{party.partyName}</div>
                    <div className="party-description">
                        {party.partyDescription?.slice(0, 300)}...
                    </div>
                </div>
                <div className="button-container">
                    <button
                        onClick={() => {
                            router.push(`/event/${party.partyAddress}`)
                        }}
                    >
                        Check It Out
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FullScreenPartyCard
