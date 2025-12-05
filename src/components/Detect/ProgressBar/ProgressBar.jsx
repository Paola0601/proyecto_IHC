import React from 'react'
import "./ProgressBar.css"

const ProgressBar = ({progress}) => {
  return (
    <div className="progress-display-wrapper">
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
      <span className="progress-text">{`${progress}%`}</span>
    </div>
  );
}

export default ProgressBar