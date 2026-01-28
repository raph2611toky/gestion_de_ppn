import React from 'react'
import '../styles/simple-chart.css'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function BarChart({ data, title }) {
  const maxValue = Math.max(...data.map(d => d.value), 1)

  return (
    <div className="chart-card">
      <h3 className="chart-title">
        <span>📊</span>
        {title}
      </h3>
      <div className="chart-area">
        <div className="bar-chart-container">
          {data.map((item, index) => (
            <div key={index} className="bar-chart-item">
              <div
                className="bar-chart-bar"
                style={{
                  height: `${(item.value / maxValue) * 220}px`,
                  backgroundColor: item.color || COLORS[index % COLORS.length],
                }}
                title={`${item.label}: ${item.value.toLocaleString()} Ar`}
              />
              <span className="bar-chart-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function LineChart({ data, title }) {
  const maxValue = Math.max(...data.map(d => d.value), 1)
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * 100
    const y = 100 - ((item.value - minValue) / range) * 80
    return { x, y, ...item }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <div className="chart-card">
      <h3 className="chart-title">
        <span>📈</span>
        {title}
      </h3>
      <div className="chart-area line-chart-container">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="line-chart-svg">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line 
              key={y} 
              x1="0" 
              y1={y} 
              x2="100" 
              y2={y} 
              className="line-chart-grid-line" 
            />
          ))}
          
          {/* Area fill */}
          <path
            d={`${pathD} L 100 100 L 0 100 Z`}
            fill="url(#gradient)"
            className="line-chart-area"
          />
          
          {/* Line */}
          <path
            d={pathD}
            className="line-chart-path"
          />
          
          {/* Points */}
          {points.map((p, i) => (
            <circle 
              key={i} 
              cx={p.x} 
              cy={p.y} 
              r="2" 
              className="line-chart-point"
            />
          ))}
          
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="line-chart-labels">
        {data.map((item, i) => (
          <span key={i}>{item.label}</span>
        ))}
      </div>
    </div>
  )
}
