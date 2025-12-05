import React from "react";
import "./WhatComp.css";
import { Feature } from "../../components"; // Mantenemos la importación por si acaso, pero usaremos custom cards
import workingImg from "../../assests/Working.png"; // Reutilizamos una imagen existente como placeholder

const WhatComp = () => {
  return (
    <div className="signlang__whatsignlang" id="whatsignlang">
      
      {/* Título de la sección */}
      <div className="signlang__whatsignlang-heading">
        <h1 className="gradient__text">¿Cómo funciona SIGNA?</h1>
        <p>Aprender es tan fácil como 1, 2, 3</p>
      </div>

      {/* Contenedor de Tarjetas */}
      <div className="signlang__whatsignlang-container">
        
        {/* Tarjeta 1 */}
        <div className="whatsignlang-card">
          <div className="card-image-placeholder">
             {/* TODO: Reemplazar con foto de niño viendo la lección */}
             <img src={workingImg} alt="Niño aprendiendo" style={{opacity: 0.8}}/>
          </div>
          <div className="card-content">
            <div className="card-step">1</div>
            <h3>Mira y Aprende</h3>
            <p>Observa las lecciones interactivas para conocer nuevas señas y palabras.</p>
          </div>
        </div>

        {/* Tarjeta 2 */}
        <div className="whatsignlang-card">
          <div className="card-image-placeholder">
             {/* TODO: Reemplazar con captura de la cámara detectando mano */}
             <div className="placeholder-box" style={{background: '#81AFDD'}}>FOTO: Cámara detectando</div>
          </div>
          <div className="card-content">
            <div className="card-step">2</div>
            <h3>Practica con IA</h3>
            <p>Usa tu cámara. Nuestra Inteligencia Artificial te dirá si lo estás haciendo bien.</p>
          </div>
        </div>

        {/* Tarjeta 3 */}
        <div className="whatsignlang-card">
          <div className="card-image-placeholder">
             {/* TODO: Reemplazar con imagen de medallas */}
             <div className="placeholder-box" style={{background: '#F49867'}}>FOTO: Medallas ganadas</div>
          </div>
          <div className="card-content">
            <div className="card-step">3</div>
            <h3>Gana Premios</h3>
            <p>¡Completa retos para desbloquear insignias brillantes y subir de nivel!</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WhatComp;