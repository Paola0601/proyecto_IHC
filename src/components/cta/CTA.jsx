import React from 'react'
import "./CTA.css"
import { Link } from 'react-router-dom'

const CTA = () => {
    return (
        <div className='signlang_cta'>
            <div className="signlang_cta-content">
                <h3>
                    ¿Listo para comenzar tu aventura?
                </h3>
            </div>

            <div className="signlang_cta-button">
                <button>
                    <Link to="/detect">
                      ¡Empieza Ahora!
                    </Link>
                </button>
            </div>
        </div>
    )
}

export default CTA
