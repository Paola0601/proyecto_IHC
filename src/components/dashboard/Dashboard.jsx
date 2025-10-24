/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import "./Dashboard.css";
import { useDispatch, useSelector } from "react-redux";
import { getSignData, getTopUsers } from "../../redux/actions/signdataaction";
import ChartComp from "./Chart/ChartComp";

import GoldTrophy from "../../assests/gold.png";
import SilverTrophy from "../../assests/silver.png";
import BronzeTrophy from "../../assests/bronze.png";
import NoData from "../../assests/No-data.svg";

import { quote } from "../../data/quotes";
import Spinner from "../Spinner/Spinner";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const dispatch = useDispatch();
 
  const navigate = useNavigate();

  const { loading: authLoader, accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!authLoader && !accessToken) {
      navigate("/");
    }
    dispatch(getSignData());
    dispatch(getTopUsers());
  }, [accessToken, authLoader, navigate,dispatch]);

  useEffect(() => {
    dispatch(getSignData());
    dispatch(getTopUsers());
  }, [dispatch]);

  const { signDataList, loading } = useSelector((state) => state.signData);

  const { topUsers } = useSelector((state) => state.topUsers);

  //create a new object array which contains only signs performed array
  const list = signDataList
    .map((data) => data.signsPerformed)
    .reduce((acc, val) => acc.concat(val), []);

  //add the counts of same sign values
  const newData = [];
  for (let i = 0; i < list.length; i++) {
    const foundIndex = newData.findIndex(
      (d) => d.SignDetected === list[i].SignDetected
    );
    if (foundIndex === -1) {
      newData.push({ ...list[i] });
    } else {
      newData[foundIndex].count += list[i].count;
    }
  }

  const TopFiveSignsObject = newData
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calcular total de señas practicadas
  const totalSignsPracticed = newData.reduce((acc, sign) => acc + sign.count, 0);

  // Sistema de ligas
  const leagues = [
    { name: "Principiante", min: 0, max: 19, icon: "🌱", color: "#FFE5CC" },
    { name: "Aprendiz", min: 20, max: 49, icon: "⭐", color: "#FFDAB9" },
    { name: "Experto", min: 50, max: 99, icon: "🏆", color: "#FFB84D" },
    { name: "Maestro", min: 100, max: 199, icon: "👑", color: "#FF8C42" },
    { name: "Campeón", min: 200, max: Infinity, icon: "💎", color: "#FF6B35" }
  ];

  const currentLeague = leagues.find(
    league => totalSignsPracticed >= league.min && totalSignsPracticed <= league.max
  );

  const nextLeague = leagues.find(league => league.min > totalSignsPracticed);
  const progressToNextLeague = nextLeague 
    ? ((totalSignsPracticed - currentLeague.min) / (nextLeague.min - currentLeague.min)) * 100
    : 100;

  return (
    <div className="signlang_dashboard-container">
      {!(loading || authLoader) ? (
        signDataList.length > 0 ? (
          <>
            {/* Sistema de Ligas */}
            <div className="league-system">
              <div className="current-league-card">
                <div className="league-icon" style={{ background: currentLeague.color }}>
                  <span className="icon-large">{currentLeague.icon}</span>
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
                    <span>Progreso a {nextLeague.name} {nextLeague.icon}</span>
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
                      className={`league-badge ${totalSignsPracticed >= league.min ? 'unlocked' : 'locked'}`}
                      style={{ borderColor: league.color }}
                    >
                      <span className="badge-icon">{league.icon}</span>
                      <span className="badge-name">{league.name}</span>
                      <span className="badge-requirement">
                        {league.min === 0 ? '0+' : `${league.min}+`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="signlang_header-data">
              <ChartComp signDataList={signDataList} />

              <div className="signlang_leader-board">
                <h2 className="gradient__text title">Our Top Users</h2>
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
                <h2 className="gradient__text">Your Most Practiced Signs</h2>

                <table>
                  <tr>
                    <th className="table-heading">Sr.No</th>
                    <th className="table-heading">Signs</th>
                    <th className="table-heading">Frequency</th>
                  </tr>

                  {TopFiveSignsObject.map((data, i) => (
                    <tr key={i * 111} className="sign-row">
                      <td>{i + 1}</td>
                      <td>{data.SignDetected}</td>
                      <td>{data.count} times</td>
                    </tr>
                  ))}
                </table>
              </div>

              <div className="signlang_quotes-box">
                <h2 className="gradient__text">Quote of the Day</h2>
                <div>
                  <blockquote>{quote.quote}</blockquote>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Sistema de Ligas - Estado Inicial */}
            <div className="league-system">
              <div className="current-league-card">
                <div className="league-icon" style={{ background: "white" }}>
                  <span className="icon-large">🌱</span>
                </div>
                <div className="league-info">
                  <h3>Tu Liga Actual</h3>
                  <h2 className="gradient__text">Principiante</h2>
                  <p className="total-signs">0 señas practicadas</p>
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-header">
                  <span>Progreso a Aprendiz ⭐</span>
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
                  <div className="league-badge unlocked" style={{ borderColor: "#FFE5CC" }}>
                    <span className="badge-icon">🌱</span>
                    <span className="badge-name">Principiante</span>
                    <span className="badge-requirement">0+</span>
                  </div>
                  <div className="league-badge locked" style={{ borderColor: "#FFDAB9" }}>
                    <span className="badge-icon">⭐</span>
                    <span className="badge-name">Aprendiz</span>
                    <span className="badge-requirement">20+</span>
                  </div>
                  <div className="league-badge locked" style={{ borderColor: "#FFB84D" }}>
                    <span className="badge-icon">🏆</span>
                    <span className="badge-name">Experto</span>
                    <span className="badge-requirement">50+</span>
                  </div>
                  <div className="league-badge locked" style={{ borderColor: "#FF8C42" }}>
                    <span className="badge-icon">👑</span>
                    <span className="badge-name">Maestro</span>
                    <span className="badge-requirement">100+</span>
                  </div>
                  <div className="league-badge locked" style={{ borderColor: "#FF6B35" }}>
                    <span className="badge-icon">💎</span>
                    <span className="badge-name">Campeón</span>
                    <span className="badge-requirement">200+</span>
                  </div>
                </div>
              </div>
              <div className="button-container">
                <button 
                  className="start-practice-btn" 
                  onClick={() => navigate("/detect")}
                >
                  Ir a Practicar
                </button>
              </div>
            </div>
          </>
        )
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default Dashboard;
