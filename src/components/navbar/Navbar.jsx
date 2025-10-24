import React, { useEffect, useState } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import logo from "../../assests/logo2.png";
import { RiMenu3Line, RiCloseLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../../redux/actions/authaction";

const Navbar = ({ notifyMsg }) => {
  const [toggle, setToggle] = useState(false);

  const user = useSelector((state) => state.auth?.user);

  const { accessToken } = useSelector((state) => state.auth);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (isLoggedIn && user) {
      notifyMsg(
        "success",
        `Welcome! ${user?.name}, You Logged in Successfully`
      );
    }
  }, [isLoggedIn, user, notifyMsg]);

  const handleLogin = () => {
    dispatch(login());
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    dispatch(logout());
    notifyMsg("success", "Logged Out Successfully !");
  };

  return (
    <div className="signlang_navbar  gradient__bg">
      <div className="singlang_navlinks">
        <div className="signlang_navlinks_logo">
          <a href="/">
            <img className="logo" src={logo} alt="logo" />
          </a>
        </div>

        <div className="signlang_navlinks_container">
          <p>
            <Link to="/">INICIO</Link>
          </p>

          <p>
            <Link to="/detect">PRACTICA</Link>
          </p>

          <p>
            <Link to="/aprende">APRENDE</Link>
          </p>

          <p>
            <Link to="/insignias">INSIGNIAS</Link>
          </p>

          {accessToken && (
            <p>
              <Link to="/dashboard">MI AVANCE</Link>
            </p>
          )}
        </div>

        <div className="signlang_auth-data">
          {accessToken ? (
            <>
              <div className="user-info">
                <img src={user?.photoURL} alt="user-icon" />
                <span className="user-name">{user?.name}</span>
              </div>
              <button type="button" onClick={handleLogout}>
                SALIR
              </button>
            </>
          ) : (
            <button type="button" onClick={handleLogin}>
              INGRESAR
            </button>
          )}
        </div>
      </div>

      <div className="signlang__navbar-menu">
        {toggle ? (
          <RiCloseLine
            color="#333333"
            size={27}
            onClick={() => setToggle(false)}
          />
        ) : (
          <RiMenu3Line color="#333333" size={27} onClick={() => setToggle(true)} />
        )}
        {toggle && (
          <div className="signlang__navbar-menu_container scale-up-center">
            <div className="signlang__navbar-menu_container-links">
              <p>
                <Link to="/">INICIO</Link>
              </p>

              <p>
                <Link to="/detect">PRACTICA</Link>
              </p>

              <p>
                <Link to="/aprende">APRENDE</Link>
              </p>

              <p>
                <Link to="/insignias">INSIGNIAS</Link>
              </p>

              {accessToken && (
                <p>
                  <Link to="/dashboard">MI AVANCE</Link>
                </p>
              )}
            </div>

            <div className="signlang__navbar-menu_container-links-authdata">
              {accessToken ? (
                <>
                  <div className="user-info">
                    <img src={user?.photoURL} alt="user-icon" />
                    <span className="user-name">{user?.name}</span>
                  </div>
                  <button type="button" onClick={handleLogout}>
                    SALIR
                  </button>
                </>
              ) : (
                <button type="button" onClick={handleLogin}>
                  INGRESAR
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
