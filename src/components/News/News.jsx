import React from 'react';
import './News.css';

const newsData = [
  {
    title: "¡Es Oficial en el Perú!",
    date: "Ley N° 29535",
    text: "¿Sabías que el Perú tiene una ley especial? La Ley 29535 reconoce oficialmente la Lengua de Señas Peruana. ¡Es un derecho importante!",
    link: "https://conadisperu.gob.pe/observatorio/leyes/ley-n-29535-ley-que-otorga-reconocimiento-oficial-a-la-lengua-de-senas-peruana/",
    color: "#FFE66D" // Amarillo
  },
  {
    title: "Aprendo en Casa",
    date: "Minedu",
    text: "El Ministerio de Educación tiene recursos divertidos para educación básica especial. ¡Aprender desde casa nunca fue tan fácil!",
    link: "https://www.minedu.gob.pe/educacionbasicaespecial/",
    color: "#4ECDC4" // Turquesa
  },
  {
    title: "Día Internacional",
    date: "23 de Septiembre",
    text: "¡Fiesta mundial! Cada 23 de septiembre celebramos el Día Internacional de las Lenguas de Señas. ¡Prepara tus manos para celebrar!",
    link: "https://www.un.org/es/observances/sign-languages-day",
    color: "#FF6B6B" // Rojo
  }
];

const News = () => {
  return (
    <div className="signlang__news section__margin" id="news">
      <div className="signlang__news-heading">
        <h1 className="gradient__text">Noticias y Curiosidades</h1>
        <p>Entérate de lo que pasa en el mundo de las señas</p>
      </div>

      <div className="signlang__news-container">
        {newsData.map((item, index) => (
          <div className="signlang__news-card" key={index} style={{borderTopColor: item.color}}>
            <div className="signlang__news-card-header">
              <p>{item.date}</p>
              <h3>{item.title}</h3>
            </div>
            <div className="signlang__news-card-body">
              <p>{item.text}</p>
            </div>
            <div className="signlang__news-card-footer">
              <a href={item.link} target="_blank" rel="noreferrer">Leer más &rarr;</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default News;
