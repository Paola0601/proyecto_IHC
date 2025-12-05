import React, { useEffect, useState } from "react";
import "./Navbar.css";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assests/logo2.png";
import { RiMenu3Line, RiCloseLine, RiUser3Line } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../../redux/actions/authaction";
import confetti from "canvas-confetti";
import { toast } from "react-toastify"; // Importar toast directamente

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
      // ¡CONFETI EXPLOSIVO!
      const duration = 3000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#4ECDC4', '#FF6B6B', '#FFE66D']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#4ECDC4', '#FF6B6B', '#FFE66D']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());

      // Mensaje en la parte superior izquierda e Impactante
      toast.success(`¡Bienvenido a la familia SIGNA, ${user?.name}!`, {
        position: "top-left", // Volvemos a top-left
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        style: { 
          fontSize: '18px', 
          fontWeight: 'bold', 
          textAlign: 'center', 
          padding: '20px',
          backgroundColor: 'var(--color-yellow)', // Fondo Amarillo
          color: 'var(--color-primary-dark)' // Texto Azul Oscuro
        },
        progressStyle: { backgroundColor: 'var(--color-primary-dark)' } // Barra de progreso Azul Oscuro
      });
    }
  }, [isLoggedIn, user]); // Quitamos notifyMsg de dependencias ya que usamos toast directo

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
          <div className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${isActiveRoute('/') ? 'active' : ''}`}
            >
              <span className="nav-label">INICIO</span>
            </Link>
          </div>

          <div className="nav-item">
            <Link 
              to="/detect" 
              className={`nav-link ${isActiveRoute('/detect') ? 'active' : ''}`}
            >
              <span className="nav-label">PRÁCTICA</span>
            </Link>
          </div>

          <div className="nav-item">
            <Link 
              to="/aprende" 
              className={`nav-link ${isActiveRoute('/aprende') ? 'active' : ''}`}
            >
              <span className="nav-label">APRENDE</span>
            </Link>
          </div>

          {accessToken && (
            <div className="nav-item">
              <Link 
                to="/insignias" 
                className={`nav-link ${isActiveRoute('/insignias') ? 'active' : ''}`}
              >
                <span className="nav-label">INSIGNIAS</span>
              </Link>
            </div>
          )}
          
          {/* Enlace a Dashboard siempre visible, cambia de nombre */}
          <div className="nav-item">
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
            >
              <span className="nav-label">{accessToken ? "MI AVANCE" : "PREMIOS"}</span>
            </Link>
          </div>
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
      
        {/* Mobile Menu - Ahora dentro de singlang_navlinks */}
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
                <div className="mobile-nav-item">
                  <Link 
                    to="/"
                    className={`mobile-nav-link ${isActiveRoute('/') ? 'active' : ''}`}
                    onClick={() => setToggle(false)}
                  >
                    <span className="nav-label">INICIO</span>
                  </Link>
                </div>

                <div className="mobile-nav-item">
                  <Link 
                    to="/detect"
                    className={`mobile-nav-link ${isActiveRoute('/detect') ? 'active' : ''}`}
                    onClick={() => setToggle(false)}
                  >
                    <span className="nav-label">PRÁCTICA</span>
                  </Link>
                </div>

                <div className="mobile-nav-item">
                  <Link 
                    to="/aprende"
                    className={`mobile-nav-link ${isActiveRoute('/aprende') ? 'active' : ''}`}
                    onClick={() => setToggle(false)}
                  >
                    <span className="nav-label">APRENDE</span>
                  </Link>
                </div>

                {accessToken && (
                  <div className="mobile-nav-item">
                    <Link 
                      to="/insignias"
                      className={`mobile-nav-link ${isActiveRoute('/insignias') ? 'active' : ''}`}
                      onClick={() => setToggle(false)}
                    >
                      <span className="nav-label">INSIGNIAS</span>
                    </Link>
                  </div>
                )}

                {/* Enlace Dashboard Móvil */}
                <div className="mobile-nav-item">
                  <Link 
                    to="/dashboard"
                    className={`mobile-nav-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
                    onClick={() => setToggle(false)}
                  >
                    <span className="nav-label">{accessToken ? "MI AVANCE" : "PREMIOS"}</span>
                  </Link>
                </div>
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
      </div>
    </nav>
  );
};

export default Navbar;
