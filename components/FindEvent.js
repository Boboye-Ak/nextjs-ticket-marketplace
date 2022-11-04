import { Icon } from "@iconify/react"
import { useState } from "react"

const FindEvent = () => {
    const [searchText, setSearchText] = useState("")
    return (
        <div className="find-event">
            <div className="search-area">
                <div className="input-container">
                    <div className="input-icon">
                        <Icon icon="akar-icons:search" />
                    </div>
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value)
                        }}
                        placeholder="Enter party contract address"
                    />
                    <div
                        className="input-icon"
                        onClick={() => {
                            setSearchText("")
                        }}
                        style={{
                            cursor: "pointer",
                        }}
                    >
                        {searchText && <Icon icon="ep:close-bold" />}
                    </div>
                </div>
                <div className="search-button">
                    <button>Search</button>
                </div>
            </div>
        </div>
    )
}

export default FindEvent
