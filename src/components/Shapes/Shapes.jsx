import React from 'react';
import './Shapes.css';

const Shapes = () => {
  return (
    <div className="background-shapes">
      {/* Círculos difuminados grandes (Atmósfera) */}
      <div className="shape shape-blob-1"></div>
      <div className="shape shape-blob-2"></div>
      
      {/* Formas geométricas sólidas (Diversión) */}
      <div className="shape shape-triangle-1"></div>
      <div className="shape shape-triangle-2"></div>
      
      <div className="shape shape-circle-1"></div>
      <div className="shape shape-circle-2"></div>
      
      <div className="shape shape-square-1"></div>
      <div className="shape shape-square-2"></div>
      
      <div className="shape shape-cross-1">+</div>
      <div className="shape shape-cross-2">x</div>
    </div>
  );
};

export default Shapes;