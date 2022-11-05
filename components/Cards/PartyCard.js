import { useState } from "react"
import FullScreenPartyCard from "./FullScreenPartyCard"

const PartyCard = ({ party }) => {
    const [showFullScreenCard, setShowFullScreenCard] = useState(false)

    const toggleFullScreenCard = () => {
        setShowFullScreenCard(!showFullScreenCard)
    }
    return (
        <>
            <div className="party-card" onClick={toggleFullScreenCard}>
                <div className="party-name">{party.partyName}</div>
                <div className="img-wrap">
                    <img src={party.partyImage} />
                </div>
            </div>

            {showFullScreenCard && (
                <FullScreenPartyCard party={party} toggleFullScreenCard={toggleFullScreenCard} />
            )}
        </>
    )
}

export default PartyCard
