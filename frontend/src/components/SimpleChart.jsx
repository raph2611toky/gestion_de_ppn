'use client';

import React, { useMemo } from 'react'
import '../styles/simple-chart.css'

function SimpleChart({ data, title }) {
  const maxValue = useMemo(() => {
    if (!data || data.length === 0) return 0
    return Math.max(...data.map((item) => Math.max(item.min, item.max)))
  }, [data])

  const getBarHeight = (value) => {
    if (maxValue === 0) return 0
    return (value / maxValue) * 100
  }

  return (
    <div className="simple-chart">
      <p className="chart-title">{title}</p>
      <div className="chart-container">
        {data.map((item, idx) => (
          <div key={idx} className="chart-item">
            <div className="chart-bars">
              <div className="bar-wrapper min-bar">
                <div
                  className="bar"
                  style={{ height: `${getBarHeight(item.min)}%` }}
                  title={`Min: ${item.min}`}
                >
                  {item.min}
                </div>
              </div>
              <div className="bar-wrapper max-bar">
                <div
                  className="bar"
                  style={{ height: `${getBarHeight(item.max)}%` }}
                  title={`Max: ${item.max}`}
                >
                  {item.max}
                </div>
              </div>
            </div>
            <p className="chart-label">{item.name}</p>
          </div>
        ))}
      </div>
      <div className="chart-legend">
        <span className="legend-item">
          <span className="legend-color min-color" />
          Prix min
        </span>
        <span className="legend-item">
          <span className="legend-color max-color" />
          Prix max
        </span>
      </div>
    </div>
  )
}

export default SimpleChart
