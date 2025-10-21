import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Alfabeto.css';

const Alfabeto = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Alfabeto completo A-Z + Ñ
  const alfabeto = [
    { letra: 'A', imagen: '/signs/A.png' },
    { letra: 'B', imagen: '/signs/B.png' },
    { letra: 'C', imagen: '/signs/C.png' },
    { letra: 'D', imagen: '/signs/D.png' },
    { letra: 'E', imagen: '/signs/E.png' },
    { letra: 'F', imagen: '/signs/F.png' },
    { letra: 'G', imagen: '/signs/G.png' },
    { letra: 'H', imagen: '/signs/H.png' },
    { letra: 'I', imagen: '/signs/I.png' },
    { letra: 'J', imagen: '/signs/J.png' },
    { letra: 'K', imagen: '/signs/K.png' },
    { letra: 'L', imagen: '/signs/L.png' },
    { letra: 'M', imagen: '/signs/M.png' },
    { letra: 'N', imagen: '/signs/N.png' },
    { letra: 'Ñ', imagen: '/signs/Ñ.png' },
    { letra: 'O', imagen: '/signs/O.png' },
    { letra: 'P', imagen: '/signs/P.png' },
    { letra: 'Q', imagen: '/signs/Q.png' },
    { letra: 'R', imagen: '/signs/R.png' },
    { letra: 'S', imagen: '/signs/S.png' },
    { letra: 'T', imagen: '/signs/T.png' },
    { letra: 'U', imagen: '/signs/U.png' },
    { letra: 'V', imagen: '/signs/V.png' },
    { letra: 'W', imagen: '/signs/W.png' },
    { letra: 'X', imagen: '/signs/X.png' },
    { letra: 'Y', imagen: '/signs/Y.png' },
    { letra: 'Z', imagen: '/signs/Z.png' },
  ];

  const currentCard = alfabeto[currentIndex];

  const handleNext = () => {
    if (currentIndex < alfabeto.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="alfabeto-container">
      <div className="alfabeto-header">
        <Link to="/aprende" className="back-button">← Volver a Módulos</Link>
        <h1>Alfabeto en Lenguaje de Señas</h1>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentIndex + 1) / alfabeto.length) * 100}%` }}
          ></div>
        </div>
        <p className="progress-text">{currentIndex + 1} / {alfabeto.length}</p>
      </div>

      <div className="flashcard-wrapper">
        <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
          <div className="flashcard-front">
            <div className="letter-display">
              <h2>Letra</h2>
              <div className="letter">{currentCard.letra}</div>
              <p className="hint">Click para ver la seña</p>
            </div>
          </div>
          <div className="flashcard-back">
            <div className="sign-display">
              <h2>Seña: {currentCard.letra}</h2>
              <div className="sign-image">
                <img 
                  src={currentCard.imagen} 
                  alt={`Seña de ${currentCard.letra}`}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23f0f0f0" width="200" height="200"/><text x="50%" y="50%" font-size="60" text-anchor="middle" dy=".3em" fill="%23999">?</text></svg>';
                  }}
                />
              </div>
              <p className="hint">Click para volver</p>
            </div>
          </div>
        </div>
      </div>

      <div className="controls">
        <button 
          className="control-btn" 
          onClick={handlePrevious} 
          disabled={currentIndex === 0}
        >
          ← Anterior
        </button>
        <button className="control-btn flip-btn" onClick={handleFlip}>
          {isFlipped ? ' Ver Letra' : ' Ver Seña'}
        </button>
        <button 
          className="control-btn" 
          onClick={handleNext} 
          disabled={currentIndex === alfabeto.length - 1}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
};

export default Alfabeto;
