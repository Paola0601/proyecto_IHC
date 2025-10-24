import React from 'react'
import "./Footer.css"
import logo from "../../assests/logo.png"

const Footer = () => {
  return (
    <div className="signlang__footer section__padding">
      <div className="signlang__footer-logo">
        <img src={logo} alt="signlang_logo" />
      </div>

      <div className="signlang__footer-copy">
        <h3 className="footer-title">
          <span className="footer-copy-symbol">©</span>&nbsp;2025&nbsp;
          <span className="footer-brand">SIGNA</span>
          &nbsp;—&nbsp;
          <span className="footer-rights">Todos los derechos reservados.</span>
        </h3>
        <p className="footer-authors">
          Desarrollado por: 
          <span>Ayque Puraca Tania Luz</span> · 
          <span>Aliaga Chaiña Sandra Gabriela</span> · 
          <span>Camargo Hilachoque Romina Giuliana</span> · 
          <span>Mayta Quispe Paola Adamari</span>
        </p>
      </div>
    </div>
  )
}

export default Footer