/* eslint-disable no-unused-vars */
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSignData, getTopUsers } from "../../redux/actions/signdataaction";
import ChartComp from "./Chart/ChartComp";
import "./Dashboard.css";

import BronzeTrophy from "../../assests/bronze.png";
import GoldTrophy from "../../assests/gold.png";
import SilverTrophy from "../../assests/silver.png";

import { useNavigate } from "react-router-dom";
import { RewardsCarousel } from ".."; // Importar Carrusel
import { badgesData } from "../../data/BadgesData"; // Importar insignias
import { quote } from "../../data/quotes";
import Spinner from "../Spinner/Spinner";

const Dashboard = () => {
    const dispatch = useDispatch();

    const navigate = useNavigate();

    const { loading: authLoader, accessToken } = useSelector(state => state.auth);

    // Efecto solo para cargar datos si hay token, NO para redirigir
    useEffect(() => {
        if (accessToken) {
            dispatch(getSignData());
            dispatch(getTopUsers());
        }
    }, [accessToken, dispatch]);

    const { signDataList, loading } = useSelector(state => state.signData);

    const { topUsers } = useSelector(state => state.topUsers);

    // --- LÓGICA DE DATOS (Solo si hay usuario) ---
    //create a new object array which contains only signs performed array
    const list = signDataList.map(data => data.signsPerformed).reduce((acc, val) => acc.concat(val), []);

    //add the counts of same sign values
    const newData = [];
    for (let i = 0; i < list.length; i++) {
        const foundIndex = newData.findIndex(d => d.SignDetected === list[i].SignDetected);
        if (foundIndex === -1) {
            newData.push({ ...list[i] });
        } else {
            newData[foundIndex].count += list[i].count;
        }
    }

    const TopFiveSignsObject = newData.sort((a, b) => b.count - a.count).slice(0, 5);

    // Calcular total de señas practicadas
    const totalSignsPracticed = newData.reduce((acc, sign) => acc + sign.count, 0);

    // Sistema de ligas con colores del tema
    const leagues = [
        {
            name: "Principiante",
            min: 0,
            max: 19,
            icon: "/ligas/liga_huevo.svg",
            color: "var(--color-surface)",
            borderColor: "var(--color-border)",
        },
        {
            name: "Aprendiz",
            min: 20,
            max: 49,
            icon: "/ligas/liga_tricer_1.svg",
            color: "var(--color-primary-light)",
            borderColor: "var(--color-primary)",
        },
        {
            name: "Experto",
            min: 50,
            max: 99,
            icon: "/ligas/liga_tricer_2.svg",
            color: "var(--color-yellow)",
            borderColor: "var(--color-yellow-dark)",
        },
        {
            name: "Maestro",
            min: 100,
            max: 199,
            icon: "/ligas/liga_tricer_3.svg",
            color: "var(--color-accent-light)",
            borderColor: "var(--color-accent)",
        },
        {
            name: "Campeón",
            min: 200,
            max: Infinity,
            icon: "/ligas/liga_tricer_3.svg",
            color: "var(--color-accent)",
            borderColor: "var(--color-accent-hover)",
        },
    ];

    const currentLeague =
        leagues.find(league => totalSignsPracticed >= league.min && totalSignsPracticed <= league.max) || leagues[0]; // Fallback a principiante si no hay datos

    const nextLeague = leagues.find(league => league.min > totalSignsPracticed);
    const progressToNextLeague = nextLeague
        ? ((totalSignsPracticed - currentLeague.min) / (nextLeague.min - currentLeague.min)) * 100
        : 100;

    // --- RENDERIZADO ---

    return (
        <div className="signlang_dashboard-container">
            {/* SI EL USUARIO NO ESTÁ LOGUEADO: VISTA PROMOCIONAL */}
            {!accessToken ? (
                <div className="dashboard-promo-view">
                    <div className="promo-header">
                        <h1 className="gradient__text">¡Tu Camino a la Cima!</h1>
                        <p>Practica, gana puntos y colecciona recompensas exclusivas.</p>
                    </div>

                    {/* CARRUSEL MÁGICO */}
                    <RewardsCarousel />

                    <div className="button-container">
                        <button className="start-practice-btn animated-button" onClick={() => navigate("/detect")}>
                            ¡Empezar Aventura!
                        </button>
                    </div>

                    {/* VISTA PREVIA DE LIGAS (BLOQUEADA) */}
                    <div className="league-system promo-mode">
                        <h3 className="promo-subtitle">Sistema de Ligas</h3>
                        <div className="leagues-grid">
                            {leagues.map((league, index) => (
                                <div
                                    key={index}
                                    className={`league-badge ${league.min === 0 ? "unlocked" : "locked"}`} // Principiante siempre desbloqueado
                                    style={{ borderColor: league.borderColor }}
                                >
                                    <img className="badge-icon" src={league.icon} alt={league.name} />
                                    <span className="badge-name">{league.name}</span>
                                    <span className="badge-requirement">{league.min}+</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* VISTA PREVIA DE INSIGNIAS (BLOQUEADA) */}
                    <div className="league-system promo-mode" style={{ marginTop: "2rem" }}>
                        <h3 className="promo-subtitle">Insignias por Desbloquear</h3>
                        <div className="leagues-grid">
                            {badgesData.map(badge => (
                                <div
                                    key={badge.id}
                                    className="league-badge locked"
                                    style={{ borderColor: "var(--color-border)" }}
                                >
                                    <div
                                        className="badge-image-wrapper"
                                        style={{
                                            width: "80px",
                                            height: "80px",
                                            marginBottom: "1rem",
                                            position: "relative",
                                        }}
                                    >
                                        <img
                                            src={badge.image}
                                            alt={badge.title}
                                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                        />
                                        <div
                                            className="lock-overlay"
                                            style={{
                                                position: "absolute",
                                                top: "50%",
                                                left: "50%",
                                                transform: "translate(-50%, -50%)",
                                                fontSize: "2rem",
                                            }}
                                        >
                                            🔒
                                        </div>
                                    </div>
                                    <span className="badge-name">{badge.title}</span>
                                    <span className="badge-requirement" style={{ fontSize: "0.8rem" }}>
                                        Logro Secreto
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : /* SI EL USUARIO ESTÁ LOGUEADO: DASHBOARD REAL */
            !(loading || authLoader) ? (
                signDataList.length > 0 ? (
                    <>
                        {/* Sistema de Ligas */}
                        <div className="league-system">
                            <div className="current-league-card">
                                <div className="league-icon" style={{ borderColor: currentLeague.borderColor }}>
                                    <img className="icon-large" src={currentLeague.icon} alt={currentLeague.name} />
                                </div>
                                <div className="league-info">
                                    <h3>Tu Liga Actual</h3>
                                    <h2 className="gradient__text">{currentLeague.name}</h2>
                                    <p className="total-signs">{totalSignsPracticed} señas practicadas</p>
                                </div>
                            </div>

                            {nextLeague && (
                                <div className="progress-section">
                                    <div className="progress-header">
                                        <span>
                                            Progreso a {nextLeague.name}{" "}
                                            <img
                                                src={nextLeague.icon}
                                                alt={nextLeague.name}
                                                style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                            />
                                        </span>
                                        <span className="progress-count">
                                            {totalSignsPracticed}/{nextLeague.min}
                                        </span>
                                    </div>
                                    <div className="progress-bar-container">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${progressToNextLeague}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="all-leagues">
                                <h3>Todas las Ligas</h3>
                                <div className="leagues-grid">
                                    {leagues.map((league, index) => (
                                        <div
                                            key={index}
                                            className={`league-badge ${
                                                totalSignsPracticed >= league.min ? "unlocked" : "locked"
                                            }`}
                                            style={{
                                                borderColor:
                                                    totalSignsPracticed >= league.min ? league.borderColor : undefined,
                                            }}
                                        >
                                            <img className="badge-icon" src={league.icon} alt={league.name} />
                                            <span className="badge-name">{league.name}</span>
                                            <span className="badge-requirement">
                                                {league.min === 0 ? "0+" : `${league.min}+`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Resto del Dashboard (Gráficos, Top Users, etc.) */}
                        <div className="signlang_header-data">
                            <ChartComp signDataList={signDataList} />

                            <div className="signlang_leader-board">
                                <h2 className="gradient__text title">Top Usuarios</h2>
                                <div className="signlang_toprank-box">
                                    {topUsers.map((user, index) => (
                                        <div className="signlang_tank-row" key={index * 786}>
                                            <h2 className="gradient__text">{user.rank}</h2>
                                            <h3>{user.username}</h3>
                                            <img
                                                src={
                                                    user.rank === 1
                                                        ? GoldTrophy
                                                        : user.rank === 2
                                                        ? SilverTrophy
                                                        : user.rank === 3
                                                        ? BronzeTrophy
                                                        : ""
                                                }
                                                alt="trophy"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="signlang_dashboard-midsection">
                            <div className="signlang_sign-table">
                                <h2 className="gradient__text">Tus Señas Favoritas</h2>

                                <table>
                                    <tr>
                                        <th className="table-heading">#</th>
                                        <th className="table-heading">Seña</th>
                                        <th className="table-heading">Veces</th>
                                    </tr>

                                    {TopFiveSignsObject.map((data, i) => (
                                        <tr key={i * 111} className="sign-row">
                                            <td>{i + 1}</td>
                                            <td>{data.SignDetected}</td>
                                            <td>{data.count}</td>
                                        </tr>
                                    ))}
                                </table>
                            </div>

                            <div className="signlang_quotes-box">
                                <h2 className="gradient__text">Frase del Día</h2>
                                <div>
                                    <blockquote>{quote.quote}</blockquote>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Dashboard Vacío (Usuario nuevo sin datos) */
                    <div className="league-system">
                        <div className="current-league-card">
                            <div
                                className="league-icon"
                                style={{ background: "white", borderColor: "var(--color-border)" }}
                            >
                                <img className="icon-large" src="/ligas/liga_huevo.svg" alt="Principiante" />
                            </div>
                            <div className="league-info">
                                <h3>Tu Liga Actual</h3>
                                <h2 className="gradient__text">Principiante</h2>
                                <p className="total-signs">0 señas practicadas</p>
                            </div>
                        </div>

                        <div className="progress-section">
                            <div className="progress-header">
                                <span>
                                    Progreso a Aprendiz{" "}
                                    <img
                                        src="/ligas/liga_tricer_1.svg"
                                        alt="Aprendiz"
                                        style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                    />
                                </span>
                                <span className="progress-count">0/20</span>
                            </div>
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: "0%" }} />
                            </div>
                            <p style={{ marginTop: "1rem", color: "#666", textAlign: "center" }}>
                                ¡Practica 20 señas para subir de liga!
                            </p>
                        </div>

                        <div className="all-leagues">
                            <h3>Desbloquea Todas las Ligas</h3>
                            <div className="leagues-grid">
                                {leagues.map((league, index) => (
                                    <div
                                        key={index}
                                        className="league-badge locked"
                                        style={{ borderColor: league.borderColor }}
                                    >
                                        <img className="badge-icon" src={league.icon} alt={league.name} />
                                        <span className="badge-name">{league.name}</span>
                                        <span className="badge-requirement">{league.min}+</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="button-container">
                            <button className="start-practice-btn" onClick={() => navigate("/detect")}>
                                Ir a Practicar
                            </button>
                        </div>
                    </div>
                )
            ) : (
                <Spinner />
            )}
        </div>
    );
};

export default Dashboard;
