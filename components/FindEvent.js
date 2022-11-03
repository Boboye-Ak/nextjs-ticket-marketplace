import { Icon } from "@iconify/react"

const FindEvent = () => {
    return (
        <div className="find-event">
            <div className="search-area">
                <div className="input-container">
                    <div className="input-icon">
                        <Icon icon="akar-icons:search" />
                    </div>
                    <input type="text" />
                </div>
                <div>
                    <button>Search</button>
                </div>
            </div>
        </div>
    )
}

export default FindEvent
