// Datos de insignias compartidos
import gold from '../assests/gold.png';
import silver from '../assests/silver.png';
import bronze from '../assests/bronze.png';

export const badgesData = [
  { id: 1, title: 'Primeros Pasos', image: bronze, locked: false, desc: 'Completa tu primera lección.' },
  { id: 2, title: 'Velocista', image: silver, locked: false, desc: 'Termina una lección en tiempo récord.' },
  { id: 3, title: 'Maestro de Señas', image: gold, locked: true, desc: 'Completa todo el alfabeto.' },
  { id: 4, title: 'Racha de 3 días', image: silver, locked: true, desc: 'Practica 3 días seguidos.' },
  { id: 5, title: 'Imparable', image: gold, locked: true, desc: 'Alcanza 1000 puntos.' },
  { id: 6, title: 'Explorador', image: bronze, locked: true, desc: 'Visita todas las secciones.' },
];
