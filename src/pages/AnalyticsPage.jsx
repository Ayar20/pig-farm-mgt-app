import React, { useState, useEffect } from 'react';
import { Scale, Warehouse, TrendingUp, Calendar, Info, RefreshCw } from 'lucide-react';

export default function AnalyticsPage() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [fcrData, setFcrData] = useState(null);
  const [adgData, setAdgData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Load available batches on mount
  useEffect(() => {
    async function fetchBatches() {
      try {
        const [weightsRes, feedingRes] = await Promise.all([
          fetch('/api/weight_records'),
          fetch('/api/feeding_records')
        ]);
        const weights = await weightsRes.json();
        const feeding = await feedingRes.json();
        
        // Extract unique batch IDs
        const batchSet = new Set();
        if (Array.isArray(weights)) weights.forEach(w => w.batch && batchSet.add(w.batch));
        if (Array.isArray(feeding)) feeding.forEach(f => f.batch && batchSet.add(f.batch));
        
        const sortedBatches = Array.from(batchSet).sort();
        setBatches(sortedBatches);
        if (sortedBatches.length > 0) {
          setSelectedBatch(sortedBatches[0]);
        }
      } catch (err) {
        console.error('Error fetching batches:', err);
        setError('Failed to load batch list');
      }
    }
    fetchBatches();
  }, []);

  // Fetch analytics when selected batch changes
  useEffect(() => {
    if (!selectedBatch) return;

    async function fetchAnalytics() {
      setLoading(true);
      setError('');
      try {
        const [fcrRes, adgRes] = await Promise.all([
          fetch(`/api/analytics/fcr?batch=${encodeURIComponent(selectedBatch)}`),
          fetch(`/api/analytics/adg?batch=${encodeURIComponent(selectedBatch)}`)
        ]);
        const fcr = await fcrRes.json();
        const adg = await adgRes.json();

        if (fcr.error || adg.error) {
          setError(fcr.error || adg.error || 'Failed to calculate analytics');
        } else {
          setFcrData(fcr);
          setAdgData(adg);
        }
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [selectedBatch]);

  // Helper to get badge style for interpretations
  const getBadgeStyle = (interpretation) => {
    switch (interpretation) {
      case 'Excellent':
        return { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' };
      case 'Good':
        return { backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', border: '1px solid rgba(79, 70, 229, 0.2)' };
      case 'Poor':
      case 'Slow Growth':
        return { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' };
      default:
        return { backgroundColor: 'var(--surface-hover)', color: 'var(--text-muted)' };
    }
  };

  // Render Custom SVG Growth Chart
  const renderGrowthChart = () => {
    if (!adgData || !adgData.history || adgData.history.length < 2) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '240px', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border)', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem'
        }}>
          <Info size={32} style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
          <p style={{ fontSize: '0.875rem' }}>Insufficient history data to plot chart</p>
          <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Seed 2 or more weight logs on different days for batch "{selectedBatch}" to display the growth curve.</p>
        </div>
      );
    }

    // Process and sort history by date
    const history = [...adgData.history].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Dimension config
    const width = 600;
    const height = 280;
    const paddingX = 60;
    const paddingY = 40;

    const weights = history.map(h => parseFloat(h.weight_kg));
    const dates = history.map(h => new Date(h.date));

    const minWeight = Math.max(0, Math.min(...weights) - 5);
    const maxWeight = Math.max(...weights) + 5;
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];

    const timeSpan = maxDate - minDate || 1; // prevent divide by zero
    const weightSpan = maxWeight - minWeight || 1;

    // Project points into SVG viewport
    const points = history.map((item, index) => {
      const date = new Date(item.date);
      const weight = parseFloat(item.weight_kg);
      
      const x = paddingX + ((date - minDate) / timeSpan) * (width - 2 * paddingX);
      const y = height - paddingY - ((weight - minWeight) / weightSpan) * (height - 2 * paddingY);

      return { x, y, weight, date, stage: item.weighing_stage, original: item };
    });

    // Create SVG Path
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    // Create fill path for Area Under Curve gradient
    const areaPath = `
      ${linePath} 
      L ${points[points.length - 1].x} ${height - paddingY} 
      L ${points[0].x} ${height - paddingY} 
      Z
    `;

    // Horizontal gridlines (y axis divisions)
    const gridDivisions = 4;
    const gridY = Array.from({ length: gridDivisions + 1 }).map((_, i) => {
      const val = minWeight + (weightSpan / gridDivisions) * i;
      const y = height - paddingY - (i / gridDivisions) * (height - 2 * paddingY);
      return { y, label: `${val.toFixed(0)} kg` };
    });

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y Axis Labels */}
          {gridY.map((g, i) => (
            <g key={i}>
              <line 
                x1={paddingX} 
                y1={g.y} 
                x2={width - paddingX} 
                y2={g.y} 
                stroke="var(--border)" 
                strokeWidth="1" 
                strokeDasharray="4,4" 
              />
              <text 
                x={paddingX - 10} 
                y={g.y + 4} 
                textAnchor="end" 
                fill="var(--text-secondary)" 
                fontSize="11" 
                fontFamily="inherit"
              >
                {g.label}
              </text>
            </g>
          ))}

          {/* X Axis Date Labels */}
          {points.length > 0 && [points[0], points[points.length - 1]].map((p, i) => (
            <text 
              key={i}
              x={p.x} 
              y={height - paddingY + 20} 
              textAnchor={i === 0 ? 'start' : 'end'} 
              fill="var(--text-secondary)" 
              fontSize="11" 
              fontFamily="inherit"
            >
              {p.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </text>
          ))}

          {/* Area Under Curve Fill */}
          <path d={areaPath} fill="url(#growthGradient)" />

          {/* Line Chart */}
          <path 
            d={linePath} 
            fill="none" 
            stroke="var(--primary)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Data Points */}
          {points.map((p, i) => (
            <circle 
              key={i}
              cx={p.x} 
              cy={p.y} 
              r={hoveredPoint && hoveredPoint.index === i ? 6 : 4} 
              fill="var(--surface)" 
              stroke="var(--primary)" 
              strokeWidth="2" 
              style={{ cursor: 'pointer', transition: 'r 0.1s ease' }}
              onMouseEnter={() => setHoveredPoint({ ...p, index: i })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {/* Hover Tooltip overlay */}
        {hoveredPoint && (
          <div style={{
            position: 'absolute',
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${(hoveredPoint.y / height) * 100 - 65}%`,
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--surface)',
            color: 'var(--text-primary)',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)',
            pointerEvents: 'none',
            fontSize: '0.75rem',
            whiteSpace: 'nowrap',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.125rem'
          }}>
            <div style={{ fontWeight: '600' }}>Weight: {hoveredPoint.weight} kg</div>
            <div style={{ color: 'var(--text-muted)' }}>Date: {hoveredPoint.date.toLocaleDateString()}</div>
            <div style={{ color: 'var(--primary)', fontWeight: '500' }}>Stage: {hoveredPoint.stage || 'N/A'}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Performance Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>FCR & Growth rate tracking by cohort batch</p>
        </div>
        
        {batches.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label htmlFor="batch-select" style={{ margin: 0, whiteSpace: 'nowrap', fontWeight: '600' }}>Active Batch:</label>
            <select
              id="batch-select"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              style={{ width: 'auto', minWidth: '150px', padding: '0.5rem' }}
            >
              {batches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {batches.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <TrendingUp size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
          <h2>No Cohorts Available</h2>
          <p style={{ maxWidth: '450px', margin: '0 auto' }}>
            To calculate Feed Conversion Ratios (FCR) and Average Daily Gain (ADG), please log feeding activities and weights associated with batch IDs in the Feed Stock and Weights tables.
          </p>
        </div>
      ) : error ? (
        <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--danger)', fontWeight: '600' }}>{error}</p>
          <button 
            className="btn btn-outline" 
            style={{ marginTop: '1rem' }} 
            onClick={() => setSelectedBatch(selectedBatch)}
          >
            <RefreshCw size={16} /> Retry calculation
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Stat Summary Cards */}
          <div className="dashboard-grid">
            {/* Feed Conversion Ratio Card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                    <Warehouse size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>FCR</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Feed Conversion Ratio</p>
                  </div>
                </div>
                {fcrData && (
                  <span className="badge" style={getBadgeStyle(fcrData.fcr_interpretation)}>
                    {fcrData.fcr_interpretation}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.5rem 0' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.05em' }}>
                  {loading ? '...' : (fcrData ? fcrData.fcr : 'N/A')}
                </span>
                {fcrData && typeof fcrData.fcr === 'number' && (
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>kg feed/kg gain</span>
                )}
              </div>

              {fcrData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Feed Consumed:</span>
                    <span style={{ fontWeight: '600' }}>{fcrData.total_feed_kg} kg</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Weight Gained:</span>
                    <span style={{ fontWeight: '600' }}>{fcrData.weight_gained_kg} kg</span>
                  </div>
                </div>
              )}
            </div>

            {/* Average Daily Gain Card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                    <Scale size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>ADG</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Average Daily Gain</p>
                  </div>
                </div>
                {adgData && (
                  <span className="badge" style={getBadgeStyle(adgData.adg_interpretation)}>
                    {adgData.adg_interpretation}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.5rem 0' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.05em' }}>
                  {loading ? '...' : (adgData && typeof adgData.adg === 'number' ? adgData.adg.toFixed(2) : 'N/A')}
                </span>
                {adgData && typeof adgData.adg === 'number' && (
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>kg / day</span>
                )}
              </div>

              {adgData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Weight Growth Span:</span>
                    <span style={{ fontWeight: '600' }}>{adgData.start_weight_kg} kg → {adgData.end_weight_kg} kg</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Days Elapsed:</span>
                    <span style={{ fontWeight: '600' }}>{adgData.days_elapsed} days</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Growth Curve Chart Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Weight Growth Trajectory</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Weight gain curve over historical check-ins</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <Calendar size={14} />
                <span>Timeline View</span>
              </div>
            </div>

            <div style={{ marginTop: '1rem', width: '100%' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px' }}>
                  <div className="spinner" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent', width: '28px', height: '28px' }}></div>
                </div>
              ) : (
                renderGrowthChart()
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
