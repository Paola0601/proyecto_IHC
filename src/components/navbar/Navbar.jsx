import React, { useEffect, useState } from "react";
import "./Navbar.css";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assests/logo2.png";
import { RiMenu3Line, RiCloseLine, RiUser3Line } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../../redux/actions/authaction";

const Navbar = ({ notifyMsg }) => {
  const [toggle, setToggle] = useState(false);
  const location = useLocation();

  const user = useSelector((state) => state.auth?.user);
  const { accessToken } = useSelector((state) => state.auth);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const dispatch = useDispatch();

  // Navigation items
  const navItems = [
    { path: "/", label: "INICIO" },
    { path: "/detect", label: "PRÁCTICA" },
    { path: "/aprende", label: "APRENDE" },
    { path: "/insignias", label: "INSIGNIAS" },
  ];

  useEffect(() => {
    if (isLoggedIn && user) {
      notifyMsg(
        "success",
        `¡Bienvenido! ${user?.name}, Has iniciado sesión exitosamente`
      );
    }
  }, [isLoggedIn, user, notifyMsg]);

  const handleLogin = () => {
    dispatch(login());
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    dispatch(logout());
    notifyMsg("success", "¡Sesión cerrada exitosamente!");
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="signlang_navbar">
      <div className="singlang_navlinks">
        {/* Logo */}
        <div className="signlang_navlinks_logo">
          <Link to="/" className="logo-link">
            <img className="logo" src={logo} alt="Sign Language App Logo" />
            <span className="logo-text">Signa</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="signlang_navlinks_container">
          {navItems.map((item) => (
            <div key={item.path} className="nav-item">
              <Link 
                to={item.path} 
                className={`nav-link ${isActiveRoute(item.path) ? 'active' : ''}`}
              >
                <span className="nav-label">{item.label}</span>
              </Link>
            </div>
          ))}
          
          {accessToken && (
            <div className="nav-item">
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
              >
                <span className="nav-label">MI AVANCE</span>
              </Link>
            </div>
          )}
        </div>

        {/* User Authentication */}
        <div className="signlang_auth-data">
          {accessToken ? (
            <div className="user-profile">
              <img 
                src={user?.photoURL} 
                alt="Avatar del usuario" 
                className="user-avatar"
              />
              <span className="user-name">{user?.name}</span>
              <button 
                type="button" 
                onClick={handleLogout}
                className="auth-button logout-btn"
              >
                SALIR
              </button>
            </div>
          ) : (
            <button 
              type="button" 
              onClick={handleLogin}
              className="auth-button login-btn"
            >
              <RiUser3Line className="button-icon" />
              INGRESAR
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="signlang__navbar-menu">
        <button 
          className="menu-toggle"
          onClick={() => setToggle(!toggle)}
          aria-label="Toggle menu"
        >
          {toggle ? (
            <RiCloseLine size={27} />
          ) : (
            <RiMenu3Line size={27} />
          )}
        </button>
        
        {toggle && (
          <div className="signlang__navbar-menu_container scale-up-center">
            <div className="signlang__navbar-menu_container-links">
              {navItems.map((item) => (
                <div key={item.path} className="mobile-nav-item">
                  <Link 
                    to={item.path}
                    className={`mobile-nav-link ${isActiveRoute(item.path) ? 'active' : ''}`}
                    onClick={() => setToggle(false)}
                  >
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </div>
              ))}

              {accessToken && (
                <div className="mobile-nav-item">
                  <Link 
                    to="/dashboard"
                    className={`mobile-nav-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
                    onClick={() => setToggle(false)}
                  >
                    <span className="nav-label">MI AVANCE</span>
                  </Link>
                </div>
              )}
            </div>

            <div className="signlang__navbar-menu_container-links-authdata">
              {accessToken ? (
                <div className="mobile-user-profile">
                  <img 
                    src={user?.photoURL} 
                    alt="Avatar del usuario" 
                    className="user-avatar"
                  />
                  <span className="user-name">{user?.name}</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      handleLogout();
                      setToggle(false);
                    }}
                    className="auth-button logout-btn"
                  >
                    SALIR
                  </button>
                </div>
              ) : (
                <button 
                  type="button" 
                  onClick={() => {
                    handleLogin();
                    setToggle(false);
                  }}
                  className="auth-button login-btn"
                >
                  <RiUser3Line className="button-icon" />
                  INGRESAR
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
