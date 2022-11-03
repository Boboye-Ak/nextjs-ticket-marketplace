import { Icon } from "@iconify/react";
import { useState } from "react";
import { ConnectButton } from "web3uikit";
import NavBar from "./NavBar";

const Header = () => {
  const [showNavBar, setShowNavBar] = useState(false);

  const toggleNavBar = () => {
    setShowNavBar(!showNavBar);
  };
  return (
    <>
      <div className="pc-header">
        <div>Tick3t Booth</div>
        <ul>
          <li>Find Event</li>
          <li>My Events</li>
          <li>
            <ConnectButton moralisAuth={false} />
          </li>
        </ul>
      </div>
      <div className="mobile-header">
        <NavBar isHidden={!showNavBar} toggleNavBar={toggleNavBar} />
        <div
          className="menu-button"
          onClick={() => {
            toggleNavBar();
          }}
        >
          <Icon icon="bx:menu" />
        </div>
        <div>
          <ConnectButton moralisAuth={false} />
        </div>
      </div>
    </>
  );
};

export default Header;
