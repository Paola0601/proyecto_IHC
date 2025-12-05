import React from 'react'
import "./Features.css"
import { featuresData } from '../../data/FeaturesData'
import Feature from './feature/Feature'

const Features = () => {
    return (
        <div className='signlang_features section__padding'>
            <div className="signlang_feature-heading">
                {/* Título actualizado: Más amigable y en español */}
                <h1 className="gradient__text">¡Aprender nunca fue tan divertido!</h1>
                <p>Explora nuestras funciones mágicas</p>
            </div>

             <div className="singlang_features-container">
                {featuresData.map((data,i)=> (
                    <Feature title={data.title} text={data.text} index={i} key={i*124569}/>
                ))}
             </div>

        </div>
    )
}

export default Features
