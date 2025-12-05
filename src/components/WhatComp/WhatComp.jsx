import "./WhatComp.css";

const WhatComp = () => {
    return (
        <div className="signlang__whatsignlang" id="whatsignlang">
            {/* Título de la sección */}
            <div className="signlang__whatsignlang-heading">
                <h1 className="gradient__text">¿Cómo funciona SIGNA?</h1>
                <p>Aprender es tan fácil como 1, 2, 3</p>
            </div>
            {/* Contenedor de Tarjetas */}d
            <div className="signlang__whatsignlang-container">
                {/* Tarjeta 1 */}
                <div className="whatsignlang-card">
                    <div className="card-image-placeholder">
                        {/* TODO: Reemplazar con foto de niño viendo la lección */}
                        <img src="/inicio/niño_haciendo_señas.jpg" alt="Niño aprendiendo" style={{ opacity: 0.8 }} />
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
                        <img src="/inicio/iaDetection.png" alt="Niño aprendiendo" style={{ opacity: 0.8 }} />
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
                        <img src="/inicio/medallas_ganadas.png" alt="Niño aprendiendo" style={{ opacity: 0.8 }} />
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
