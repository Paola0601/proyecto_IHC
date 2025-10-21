import React from 'react'
import "./Header.css"
import SignHand from "../../assests/SignHand.png";

const Header = () => {
  return (
    <div className="signlang__header section__padding gradient__bg" id="home">

    <div className="signlang__header-content">
      <h1 className="gradient__text">¡Bienvenido a SIGNA!</h1>
      <p>
      Aprende el Lenguaje de Señas Peruano paso a paso, con actividades divertidas, recompensas y niveles que harán tu aprendizaje más inclusivo y emocionante.
      </p>

    </div>
    <div className="signlang__header-image">
      <img src={SignHand} alt='SIGN-HAND'/>
    </div>
  </div>
  )
}

export default Header