import { useState } from "react"

const Switch = ({ isToggled, onToggle}) => {
    const [showInfo, setShowInfo] = useState(false)
    return (
        <div>
            <label
                className="switch"

            >
                <input type="checkbox" checked={isToggled} onChange={onToggle} />
                <span className="slider" />
            </label>
        </div>
    )
}

export default Switch
