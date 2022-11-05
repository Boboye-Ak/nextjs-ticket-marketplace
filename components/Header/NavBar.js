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
                <li>
                    <Link href="/createevent">Create New Event</Link>
                </li>
                <li>
                    <Link href="/myevents">My Events</Link>
                </li>
                <li><Link href="/">Find Event</Link></li>
            </ul>
        </div>
    )
}

export default NavBar
