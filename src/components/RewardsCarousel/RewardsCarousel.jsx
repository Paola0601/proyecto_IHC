import React, { useState, useEffect } from 'react';
import './RewardsCarousel.css';

// Importamos assets
import gold from '../../assests/gold.png';
import silver from '../../assests/silver.png';
import league1 from '../../assests/logo.png'; // Fallback o iconos de ligas
// Nota: Usaremos rutas publicas para las ligas ya que asi estan definidas en el dashboard

const rewards = [
  { type: 'Liga', name: 'Liga Campeón', image: '/ligas/liga_tricer_3.svg', color: '#FF6B35' },
  { type: 'Insignia', name: 'Maestro de Señas', image: gold, color: '#FFD700' },
  { type: 'Liga', name: 'Liga Experto', image: '/ligas/liga_tricer_2.svg', color: '#FFB84D' },
  { type: 'Insignia', name: 'Velocista', image: silver, color: '#C0C0C0' },
  { type: 'Liga', name: 'Liga Aprendiz', image: '/ligas/liga_tricer_1.svg', color: '#FFDAB9' },
];

const RewardsCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % rewards.length);
    }, 3500); // Cambia cada 3.5 segundos (tiempo suficiente para leer pero dinámico)

    return () => clearInterval(interval);
  }, []);

  // Calculamos índices para efecto "infinito" visual
  const prevIndex = (activeIndex - 1 + rewards.length) % rewards.length;
  const nextIndex = (activeIndex + 1) % rewards.length;

  return (
    <div className="rewards-carousel-container">
      <div className="carousel-track">
        {rewards.map((item, index) => {
          let className = 'carousel-item';
          if (index === activeIndex) className += ' active';
          else if (index === prevIndex) className += ' prev';
          else if (index === nextIndex) className += ' next';
          else className += ' hidden';

          return (
            <div key={index} className={className} style={{ '--item-color': item.color }}>
              <div className="glow-effect"></div>
              <div className="content-wrapper">
                <span className="item-type">{item.type}</span>
                <img src={item.image} alt={item.name} />
                <h3>{item.name}</h3>
              </div>
            </div>
          );
        })}
      </div>
      <div className="carousel-message">
        <p>¡Únete para ganar estos premios!</p>
      </div>
    </div>
  );
};

export default RewardsCarousel;
