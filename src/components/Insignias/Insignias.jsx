import React from 'react';
import './Insignias.css';
import { useSelector } from 'react-redux';
import { badgesData } from '../../data/BadgesData'; // Importar datos compartidos

const Insignias = () => {
  const { accessToken } = useSelector((state) => state.auth);

  return (
        <div className="insignias-container section__padding">
            <div className="insignias-header">
                <h1>Mis Insignias</h1>
                <p>¡Colecciónalas todas demostrando tus habilidades!</p>
            </div>

            <div className="insignias-grid">
                {badgesData.map(badge => {
                    // Si no hay sesión, forzar bloqueo
                    const isLocked = !accessToken ? true : badge.locked;

                    return (
                        <div key={badge.id} className={`badge-card ${isLocked ? "locked" : "unlocked"}`}>
                            <div className="badge-image-wrapper">
                                <img src={badge.image} alt={badge.title} />
                                {isLocked && <div className="lock-overlay">🔒</div>}
                            </div>
                            <h3>{badge.title}</h3>
                            <p>{badge.desc}</p>
                        </div>
                    );
                })}
            </div>

            {!accessToken && (
                <div className="login-prompt" style={{ marginTop: "2rem", color: "var(--color-text-light)" }}>
                    <p>
                        <b>Inicia sesión para desbloquear tus logros</b>
                    </p>
                </div>
            )}
        </div>
    );
};

export default Insignias;
