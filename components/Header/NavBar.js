import { Icon } from "@iconify/react";

const NavBar = ({ isHidden, toggleNavBar }) => {
  return (
    <div className={`nav-bar ${isHidden && "hidden"}`}>
      <div className="close-button-bar">
        <div onClick={() => {toggleNavBar}}>
          <Icon icon="ant-design:close-circle-outlined" />
        </div>
      </div>
    </div>
  );
};

export default NavBar;
