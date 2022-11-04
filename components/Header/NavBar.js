import { Icon } from "@iconify/react"
import Link from "next/link"

const NavBar = ({ isHidden, toggleNavBar }) => {
    return (
        <div className={`nav-bar ${isHidden && "hidden"}`}>
            <div className="close-button-bar">
                <div
                    onClick={() => {
                        toggleNavBar()
                    }}
                >
                    <Icon icon="ant-design:close-circle-outlined" />
                </div>
            </div>
            <ul>
                <li>Create New Event</li>
                <li>
                    <Link href="/myevents">My Events</Link>
                </li>
                <li>Find Event</li>
            </ul>
        </div>
    )
}

export default NavBar
