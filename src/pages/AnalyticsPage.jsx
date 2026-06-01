import React, { useState, useEffect } from 'react';
import { Scale, Warehouse, TrendingUp, Calendar, Info, RefreshCw, DollarSign, PiggyBank, ReceiptText, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function AnalyticsPage() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [activeTab, setActiveTab] = useState('growth'); // 'growth' or 'finance'
  
  // Growth State
  const [fcrData, setFcrData] = useState(null);
  const [adgData, setAdgData] = useState(null);
  
  // Finance State
  const [profitabilityData, setProfitabilityData] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Load available batches on mount
  useEffect(() => {
    async function fetchBatches() {
      try {
        const [weights, feeding] = await Promise.all([
          apiFetch('/api/weight_records'),
          apiFetch('/api/feeding_records')
        ]);
        
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
        const [fcr, adg, profit] = await Promise.all([
          apiFetch(`/api/analytics/fcr?batch=${encodeURIComponent(selectedBatch)}`),
          apiFetch(`/api/analytics/adg?batch=${encodeURIComponent(selectedBatch)}`),
          apiFetch(`/api/analytics/profitability?batch=${encodeURIComponent(selectedBatch)}`)
        ]);

        if (fcr.error || adg.error || profit.error) {
          setError(fcr.error || adg.error || profit.error || 'Failed to calculate analytics');
        } else {
          setFcrData(fcr);
          setAdgData(adg);
          setProfitabilityData(profit);
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

  // Render Custom SVG Growth Chart (from Phase 4)
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

    const history = [...adgData.history].sort((a, b) => new Date(a.date) - new Date(b.date));
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

    const timeSpan = maxDate - minDate || 1;
    const weightSpan = maxWeight - minWeight || 1;

    const points = history.map((item, index) => {
      const date = new Date(item.date);
      const weight = parseFloat(item.weight_kg);
      const x = paddingX + ((date - minDate) / timeSpan) * (width - 2 * paddingX);
      const y = height - paddingY - ((weight - minWeight) / weightSpan) * (height - 2 * paddingY);
      return { x, y, weight, date, stage: item.weighing_stage, original: item };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

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

          {gridY.map((g, i) => (
            <g key={i}>
              <line x1={paddingX} y1={g.y} x2={width - paddingX} y2={g.y} stroke="var(--border)" strokeWidth="1" strokeDasharray="4,4" />
              <text x={paddingX - 10} y={g.y + 4} textAnchor="end" fill="var(--text-secondary)" fontSize="11" fontFamily="inherit">{g.label}</text>
            </g>
          ))}

          {points.length > 0 && [points[0], points[points.length - 1]].map((p, i) => (
            <text key={i} x={p.x} y={height - paddingY + 20} textAnchor={i === 0 ? 'start' : 'end'} fill="var(--text-secondary)" fontSize="11" fontFamily="inherit">
              {p.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </text>
          ))}

          <path d={areaPath} fill="url(#growthGradient)" />
          <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((p, i) => (
            <circle 
              key={i} cx={p.x} cy={p.y} r={hoveredPoint && hoveredPoint.index === i ? 6 : 4} 
              fill="var(--surface)" stroke="var(--primary)" strokeWidth="2" 
              style={{ cursor: 'pointer', transition: 'r 0.1s ease' }}
              onMouseEnter={() => setHoveredPoint({ ...p, index: i })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {hoveredPoint && (
          <div style={{
            position: 'absolute', left: `${(hoveredPoint.x / width) * 100}%`, top: `${(hoveredPoint.y / height) * 100 - 65}%`,
            transform: 'translateX(-50%)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)',
            padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)', pointerEvents: 'none', fontSize: '0.75rem', whiteSpace: 'nowrap', zIndex: 10,
            display: 'flex', flexDirection: 'column', gap: '0.125rem'
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
      {/* Page Header with Batch Selector */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Farm Cohort Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Performance and financial metrics by cohort batch</p>
        </div>
        
        {batches.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
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
            To calculate Feed Conversion Ratios (FCR), growth metrics (ADG), and financial profitability, please record feeding logs, weights, and sales with batch IDs.
          </p>
        </div>
      ) : error ? (
        <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--danger)', fontWeight: '600' }}>{error}</p>
          <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => setSelectedBatch(selectedBatch)}>
            <RefreshCw size={16} /> Retry calculation
          </button>
        </div>
      ) : (
        <div>
          {/* Tab Switcher */}
          <div style={{
            display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', gap: '1.5rem'
          }}>
            <button
              onClick={() => setActiveTab('growth')}
              style={{
                background: 'none', border: 'none', borderBottom: activeTab === 'growth' ? '2px solid var(--primary)' : '2px solid transparent',
                padding: '0.75rem 0.5rem', color: activeTab === 'growth' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'growth' ? '600' : '400', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                transition: 'var(--transition)'
              }}
            >
              <Scale size={16} />
              Growth & FCR
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              style={{
                background: 'none', border: 'none', borderBottom: activeTab === 'finance' ? '2px solid var(--primary)' : '2px solid transparent',
                padding: '0.75rem 0.5rem', color: activeTab === 'finance' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'finance' ? '600' : '400', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                transition: 'var(--transition)'
              }}
            >
              <DollarSign size={16} />
              Finance & Profitability
            </button>
          </div>

          {/* Loading Indicator */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px' }}>
              <div className="spinner" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent', width: '28px', height: '28px' }}></div>
            </div>
          ) : activeTab === 'growth' ? (
            /* TAB 1: GROWTH & FCR VIEW */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="dashboard-grid">
                {/* FCR Card */}
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
                      {fcrData ? fcrData.fcr : 'N/A'}
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

                {/* ADG Card */}
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
                      {adgData && typeof adgData.adg === 'number' ? adgData.adg.toFixed(2) : 'N/A'}
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

              {/* Growth Curve Chart */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Weight Growth Trajectory</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Weight gain curve over historical check-ins</p>
                </div>
                <div style={{ marginTop: '1rem', width: '100%' }}>
                  {renderGrowthChart()}
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: FINANCE & PROFITABILITY VIEW */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                
                {/* Revenue Card */}
                <div className="card stat-card" style={{ gap: '1rem' }}>
                  <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <div className="stat-value" style={{ color: 'var(--success)' }}>
                      ${profitabilityData ? profitabilityData.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                    </div>
                    <div className="stat-label">Total Revenue</div>
                  </div>
                </div>

                {/* Total Cost Card */}
                <div className="card stat-card" style={{ gap: '1rem' }}>
                  <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                    <Warehouse size={20} />
                  </div>
                  <div>
                    <div className="stat-value" style={{ color: 'var(--danger)' }}>
                      ${profitabilityData ? profitabilityData.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                    </div>
                    <div className="stat-label">Total Cost</div>
                  </div>
                </div>

                {/* Profit/Loss Card */}
                <div className="card stat-card" style={{ gap: '1rem' }}>
                  <div 
                    className="stat-icon" 
                    style={{ 
                      backgroundColor: profitabilityData && profitabilityData.net_profit >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                      color: profitabilityData && profitabilityData.net_profit >= 0 ? 'var(--success)' : 'var(--danger)' 
                    }}
                  >
                    <PiggyBank size={20} />
                  </div>
                  <div>
                    <div 
                      className="stat-value"
                      style={{ color: profitabilityData && profitabilityData.net_profit >= 0 ? 'var(--success)' : 'var(--danger)' }}
                    >
                      ${profitabilityData ? profitabilityData.net_profit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                    </div>
                    <div className="stat-label">Net Profit / Loss</div>
                  </div>
                </div>

                {/* CoP per kg Card */}
                <div className="card stat-card" style={{ gap: '1rem' }}>
                  <div className="stat-icon" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>
                    <Scale size={20} />
                  </div>
                  <div>
                    <div className="stat-value">
                      {profitabilityData && typeof profitabilityData.cop_per_kg === 'number' ? `$${profitabilityData.cop_per_kg.toFixed(2)}` : 'N/A'}
                    </div>
                    <div className="stat-label">Cost of Production (COP/kg)</div>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown & Transaction Logs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                
                {/* Cost Category breakdown card */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3>Cost Category Breakdown</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Proportional distribution of batch expenses</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    {profitabilityData && profitabilityData.breakdown && profitabilityData.breakdown.length > 0 ? (
                      (() => {
                        const totalExpenses = profitabilityData.breakdown.reduce((sum, item) => sum + item.amount, 0);
                        return profitabilityData.breakdown.map((item, idx) => {
                          const pct = totalExpenses > 0 ? ((item.amount / totalExpenses) * 100).toFixed(1) : '0.0';
                          return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ fontWeight: '500' }}>{item.category}</span>
                                <span style={{ color: 'var(--text-secondary)' }}>${item.amount.toLocaleString()} ({pct}%)</span>
                              </div>
                              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                <div style={{
                                  width: `${pct}%`, height: '100%',
                                  backgroundColor: item.category === 'Feed' ? 'var(--warning)' : 'var(--primary)',
                                  borderRadius: 'var(--radius-full)'
                                }}></div>
                              </div>
                            </div>
                          );
                        });
                      })()
                    ) : (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No expenses logged for this batch</p>
                    )}
                  </div>
                </div>

                {/* Batch Transactions Ledger Card */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3>Batch Ledger</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Detailed ledger of sales revenue and expenses</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                    {profitabilityData && profitabilityData.transactions && profitabilityData.transactions.length > 0 ? (
                      profitabilityData.transactions.map((tx, idx) => (
                        <div 
                          key={idx} 
                          style={{ 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                            padding: '0.75rem', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              backgroundColor: tx.type === 'Sale' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: tx.type === 'Sale' ? 'var(--success)' : 'var(--danger)'
                            }}>
                              {tx.type === 'Sale' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            </div>
                            <div>
                              <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{tx.label}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {tx.type === 'Sale' ? `Sale (Invoice: ${tx.description})` : `Expense (${tx.description})`}
                              </div>
                            </div>
                          </div>
                          <div style={{ 
                            fontWeight: '600', fontSize: '0.875rem',
                            color: tx.type === 'Sale' ? 'var(--success)' : 'var(--danger)'
                          }}>
                            {tx.type === 'Sale' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No transaction history found</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
