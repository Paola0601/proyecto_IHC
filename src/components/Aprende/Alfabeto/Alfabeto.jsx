import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Alfabeto.css';

const Alfabeto = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Alfabeto completo A-Z + Ñ
  const alfabeto = [
  { letra: 'A', imagen: '/signs/signoA.png' },
  { letra: 'B', imagen: '/signs/signoB.png' },
  { letra: 'C', imagen: '/signs/signoC.png' },
  { letra: 'D', imagen: '/signs/signoD.png' },
  { letra: 'E', imagen: '/signs/signoE.png' },
  { letra: 'F', imagen: '/signs/signoF.png' },
  { letra: 'G', imagen: '/signs/signoG.png' },
  { letra: 'H', imagen: '/signs/signoH.png' },
  { letra: 'I', imagen: '/signs/signoI.png' },
  { letra: 'J', imagen: '/signs/signoJ.png' },
  { letra: 'K', imagen: '/signs/signoK.png' },
  { letra: 'L', imagen: '/signs/signoL.png' },
  { letra: 'M', imagen: '/signs/signoM.png' },
  { letra: 'N', imagen: '/signs/signoN.png' },
  { letra: 'Ñ', imagen: '/signs/signoN_.png' },
  { letra: 'O', imagen: '/signs/signoO.png' },
  { letra: 'P', imagen: '/signs/signoP.png' },
  { letra: 'Q', imagen: '/signs/signoQ.png' },
  { letra: 'R', imagen: '/signs/signoR.png' },
  { letra: 'S', imagen: '/signs/signoS.png' },
  { letra: 'T', imagen: '/signs/signoT.png' },
  { letra: 'U', imagen: '/signs/signoU.png' },
  { letra: 'V', imagen: '/signs/signoV.png' },
  { letra: 'W', imagen: '/signs/signoW.png' },
  { letra: 'X', imagen: '/signs/signoX.png' },
  { letra: 'Y', imagen: '/signs/signoY.png' },
  { letra: 'Z', imagen: '/signs/signoZ.png' },
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
