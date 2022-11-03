import { ConnectButton } from "web3uikit";

const Header = () => {
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
      <div className="mobile-header">Mobile Header</div>
    </>
  );
};

export default Header;
