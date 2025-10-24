import React from 'react'
import "./ProgressBar.css"

const ProgressBar = ({progress}) => {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar" style={{ width: `${progress}%` }}>
        <span>{`${progress}%`}</span>
      </div>
    </div>
  );
}

export default ProgressBar