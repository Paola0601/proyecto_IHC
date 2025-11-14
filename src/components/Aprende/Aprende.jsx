import React from 'react';
import { Link } from 'react-router-dom';
import './Aprende.css';

const Aprende = () => {
  const modules = [
    {
      id: 1,
      title: 'Alfabeto',
      description: '27 letras del abecedario en LSP',
      // use public SVGs (place files in public/aprende/1.svg etc.)
      imagePath: '/aprende/1.svg',
      path: '/aprende/alfabeto',
      color: 'var(--color-accent)'
    },
    {
      id: 2,
      title: 'Números',
      description: 'Números del 0 al 10',
      imagePath: '/aprende/2.svg',
      path: '/aprende/numeros',
      color: 'var(--color-accent)',
      disabled: true
    },
    {
      id: 3,
      title: 'Saludos Comunes',
      description: 'Frases básicas de cortesía',
      imagePath: '/aprende/3.svg',
      path: '/aprende/saludos',
      color: 'var(--color-accent)',
      disabled: true
    }
  ];

  return (
    <div className="aprende-container">
      <div className="aprende-header">
        <h1>Módulos de Aprendizaje</h1>
        <p>Selecciona un módulo para comenzar a aprender Lenguaje de Señas Peruano</p>
      </div>

      <div className="modules-grid">
        {modules.map((module) => (
          <Link 
            to={module.disabled ? '#' : module.path} 
            key={module.id}
            className={`module-card ${module.disabled ? 'disabled' : ''}`}
            style={{ borderColor: module.color }}
          >
            <div className="module-icon" style={{ background: module.color }}>
              {module.imagePath ? (
                <img src={module.imagePath} alt={`${module.title} icon`} />
              ) : (
                module.icon || module.title.charAt(0)
              )}
            </div>
            <h2>{module.title}</h2>
            <p>{module.description}</p>
            {module.disabled && <span className="coming-soon">Próximamente</span>}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Aprende;
