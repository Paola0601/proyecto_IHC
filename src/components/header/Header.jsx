import { Link } from "react-router-dom";
import SignHand from "../../assests/SignHand.png";
import "./Header.css";

const Header = () => {
    return (
        <div className="signlang__header" id="home">
            <div className="signlang__header-content">
                <h1 className="gradient__text">¡Tu Aventura en Señas Comienza Aquí!</h1>
                <p>
                    Descubre una nueva forma de comunicarte. Aprende el Lenguaje de Señas Peruano jugando, superando
                    retos y ganando premios increíbles.
                    <b>¿Estás listo/a para convertirte en un experto?</b>
                </p>
                <div className="signlang__header-content__input">
                    <Link to="/detect">
                        <button type="button" className="animated-button">¡Empieza a Practicar!</button>
                    </Link>

                    {/* Botón Secundario */}
                    <Link to="/dashboard">
                        <button type="button" className="secondary-btn animated-button">
                            O mira nuestros premios
                        </button>
                    </Link>
                </div>{" "}
            </div>

            <div className="signlang__header-image">
                <img src={SignHand} alt="Mano haciendo señas" />
            </div>
        </div>
    );
};

export default Header;
