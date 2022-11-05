import { Icon } from "@iconify/react"

const FullScreenPartyCard = ({ party, toggleFullScreenCard }) => {
    return (
        <div className="full-screen-party-card-container">
            <div className="full-screen-party-card">
                <div className="close-bar">
                    <div className="close-button" onClick={toggleFullScreenCard}>
                        <Icon icon="mdi:close" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FullScreenPartyCard
