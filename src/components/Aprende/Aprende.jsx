import React from "react";
import "./Aprende.css";
import { useNavigate } from "react-router-dom";
import { FaHandPaper, FaSmile, FaSortAlphaDown } from "react-icons/fa";

// Datos de los "Módulos" (Aventuras)
const modules = [
  {
    id: 1,
    title: "El Alfabeto Mágico",
    desc: "Descubre las letras secretas de la A a la Z.",
    path: "/aprende/alfabeto",
    icon: <FaSortAlphaDown />,
    color: "var(--color-primary)", // Turquesa
    active: true,
  },
  {
    id: 2,
    title: "Saludos Divertidos",
    desc: "Aprende a decir Hola, Gracias y más.",
    path: "/aprende/saludos",
    icon: <FaHandPaper />,
    color: "var(--color-accent)", // Rojo/Naranja
    active: false,
  },
  {
    id: 3,
    title: "Emociones y Caras",
    desc: "¿Estás feliz o triste? ¡Dilo con señas!",
    path: "/aprende/emociones",
    icon: <FaSmile />,
    color: "var(--color-yellow)", // Amarillo
    active: false,
  },
];

const Aprende = () => {
  const navigate = useNavigate();

  return (
    <div className="aprende-container">
      <div className="aprende-header">
        <h1>¡Elige tu Aventura!</h1>
        <p>Escoge una misión y empieza a ganar superpoderes.</p>
      </div>

      <div className="modules-grid">
        {modules.map((mod) => (
          <div 
            key={mod.id} 
            className={`module-card ${!mod.active ? 'disabled' : ''}`}
            onClick={() => mod.active && navigate(mod.path)}
            style={{ borderTopColor: mod.color }}
          >
            <div className="module-icon" style={{ color: mod.color, background: `${mod.color}20` }}>
                {mod.icon}
            </div>
            <h2>{mod.title}</h2>
            <p>{mod.desc}</p>
            
            {!mod.active && (
               <span className="coming-soon" style={{ backgroundColor: mod.color }}>¡Próximamente!</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Aprende;