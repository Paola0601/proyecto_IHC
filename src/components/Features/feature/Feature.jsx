import "./Feature.css";

const Feature = ({ title, text, index }) => {
    // Determinar la forma basada en el índice (cíclico)
    const shapeType = index % 4; // 0: Círculo, 1: Cuadrado, 2: Triángulo, 3: Blob

    return (
        <div className="signlang__features-container__feature">
            {/* Shape Izquierda */}
            <div className="signlang__features-container__feature-title">
                <div className={`feature-shape shape-type-${shapeType}`}></div>
            </div>

            <div className="feature-content">
                <div className="signlang__features-container__feature-title">
                    <h1>{title}</h1>
                </div>
                <div className="signlang__features-container_feature-text">
                    <p>{text}</p>
                </div>
            </div>
        </div>
    );
};

export default Feature;
