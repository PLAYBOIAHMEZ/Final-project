import logo from "../images/logo-small.png";

const Nav = () => {
  return (
    <nav>
      <div className="logo-container">
        <img className="logo" src={logo} alt="HeartHub Logo" />
      </div>
    </nav>
  );
};

export default Nav;
