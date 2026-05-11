import React, { useState, useMemo } from 'react';
import { 
  Zap, Maximize, Layers, Warehouse, Box, 
  Building2, HardHat, Calendar, Clock, 
  ArrowRight, ShieldCheck, Construction, 
  Ruler, Home, Edit3, RefreshCw, Info,
  Users, TrendingDown, AlertTriangle, Save, Plus,
  Target, BarChart3, ChevronRight
} from 'lucide-react';
import { THEME } from '../constants/theme';
import libraryData from '../constants/master_dataset.json';
import { getInitialQuantities } from '../constants/projectemplate';

const QuickEstimator = ({ cardStyle }) => {
  // --- 1. EXISTING UNIFIED STATE (UNCHANGED) ---
  const [params, setParams] = useState({
    gia: 2500,
    storeys: 2,
    wallArea: 1200,
    windowArea: 350,
    height: 7,
    units: 20,
    type: 'Residential',
    complexity: 'Medium',
    material: 'Concrete',
    startDate: new Date().toISOString().split('T')[0]
  });

  // --- 2. EXISTING CALCULATION ENGINE (UNCHANGED) ---
  const results = useMemo(() => {
    const quantities = getInitialQuantities({
      gia: params.gia,
      storeys: params.storeys,
      wallArea: params.wallArea,
      windowArea: params.windowArea
    });

    const materialProfiles = {
      'Concrete': { cost: 1.0, labor: 1.0, speed: 1.0 },
      'Steel':    { cost: 1.15, labor: 0.85, speed: 1.2 },
      'Timber':   { cost: 1.05, labor: 0.75, speed: 1.3 }
    };

    const profile = materialProfiles[params.material];
    
    const baseCost = libraryData.reduce((acc, item) => {
      const qty = quantities[item.Code] || 0;
      return acc + (qty * (item['Price (€)'] || 0));
    }, 0);

    const complexityMult = params.complexity === 'High' ? 1.25 : params.complexity === 'Low' ? 0.9 : 1.0;
    const finalBudget = baseCost * complexityMult * profile.cost;
    const estHours = params.gia * 1.8 * complexityMult * profile.labor;

    const baseWeeks = Math.ceil((params.gia / 100) * (1 + (params.storeys * 0.02)) * complexityMult);
    const totalWeeks = Math.ceil(baseWeeks / profile.speed);
    
    const start = new Date(params.startDate);
    const handoverDate = new Date(start);
    handoverDate.setDate(start.getDate() + (totalWeeks * 7));

    const schedulePhases = [
      { name: 'Concept / Pre-design', pct: 0.10, color: '#6366f1' },
      { name: 'Design Development', pct: 0.15, color: '#8b5cf6' },
      { name: 'Permitting / Approvals', pct: 0.15, color: '#ec4899' },
      { name: 'Procurement', pct: params.material === 'Steel' ? 0.20 : 0.10, color: '#f59e0b' },
      { name: 'Construction', pct: params.material === 'Timber' ? 0.35 : 0.45, color: THEME.primary },
      { name: 'Handover / Snagging', pct: 0.05, color: THEME.success }
    ].map(phase => ({
      ...phase,
      weeks: Math.max(1, Math.round(totalWeeks * phase.pct))
    }));

    return { finalBudget, estHours, totalWeeks, schedulePhases, handoverDate };
  }, [params]);

  const updateParam = (key, value) => {
    setParams(prev => {
      const newParams = { ...prev, [key]: value };
      if (key === 'gia' || key === 'storeys') {
        newParams.height = newParams.storeys * 3.5;
        newParams.units = Math.floor(newParams.gia / 110);
      }
      return newParams;
    });
  };

  // --- 3. LABOR FORCE OPTIMIZER STATE ---
  const [optimizer, setOptimizer] = useState({
    task: libraryData.filter(i => i.Category === 'Labor')[0]?.Task || '',
    role: libraryData.filter(i => i.Category === 'Labor')[0]?.Identifier || '',
    workerCount: 4
  });

  const optRes = useMemo(() => {
    const selectedItem = libraryData.find(i => i.Identifier === optimizer.role);
    const baseRate = selectedItem?.['Price (€)'] || 55;
    const minRequired = 2; 
    const baseDays = 12; 
    const currentDays = Math.max(1.5, baseDays / (optimizer.workerCount / minRequired));
    const totalCost = optimizer.workerCount * currentDays * 8 * baseRate;
    const timeSaved = Math.max(0, baseDays - currentDays);
    
    // Dynamic Status Logic
    let statusColor = '#ef4444'; // Red (Not enough)
    let statusLabel = 'INSUFFICIENT';
    if (optimizer.workerCount >= minRequired) {
      statusColor = '#f59e0b'; // Orange (Optimal/Baseline)
      statusLabel = 'OPTIMAL';
    }
    if (timeSaved > 4) {
      statusColor = '#10b981'; // Green (Accelerated)
      statusLabel = 'ACCELERATED';
    }

    return { 
      minRequired, currentDays, totalCost, timeSaved,
      isUnderstaffed: optimizer.workerCount < minRequired,
      statusColor,
      statusLabel
    };
  }, [optimizer]);

  // STYLES
  const labelStyle = { fontSize: '10px', fontWeight: '800', color: THEME.muted, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' };
  const helperStyle = { fontSize: '9.5px', color: '#64748b', marginTop: '4px', fontStyle: 'italic', lineHeight: '1.2' };
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${THEME.border}`, fontWeight: '700', outline: 'none', background: '#fff', fontSize: '13px', transition: 'all 0.2s' };
  const editableMetricStyle = { ...inputStyle, background: '#f0f9ff', borderColor: '#bae6fd' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', paddingBottom: '40px' }}>
      
      {/* --- SECTION 1: QUICK ESTIMATOR HEADER (UNCHANGED) --- */}
      <div style={{ ...cardStyle, background: THEME.sidebar, color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
              <Zap color={THEME.success} fill={THEME.success} size={28} /> Quick Estimator
            </h2>
            <p style={{ opacity: 0.7, margin: '8px 0 0 0' }}>Interactive Parametric Sandbox: Modify fields to update cost and timeline.</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 15px', borderRadius: '8px', textAlign: 'right' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', opacity: 0.6 }}>LOGIC MODE</div>
            <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}><RefreshCw size={14} /> Real-time Calculation Sync</div>
          </div>
        </div>
      </div>

      {/* PARAMETERS GRID (UNCHANGED) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '25px' }}>
        <div style={cardStyle}>
          <h3 style={{ fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ruler size={16} color={THEME.primary} /> PHYSICAL SCALE & OVERRIDES
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div><label style={labelStyle}><Maximize size={12}/> GIA (m²)</label><input type="number" value={params.gia} onChange={(e) => updateParam('gia', parseFloat(e.target.value))} style={inputStyle} /></div>
            <div><label style={labelStyle}><Layers size={12}/> Storeys</label><input type="number" value={params.storeys} onChange={(e) => updateParam('storeys', parseInt(e.target.value))} style={inputStyle} /></div>
            <div><label style={labelStyle}><Warehouse size={12}/> Wall Area (m²)</label><input type="number" value={params.wallArea} onChange={(e) => updateParam('wallArea', parseFloat(e.target.value))} style={inputStyle} /></div>
            <div><label style={labelStyle}><Box size={12}/> Window Area (m²)</label><input type="number" value={params.windowArea} onChange={(e) => updateParam('windowArea', parseFloat(e.target.value))} style={inputStyle} /></div>
            <div style={{ gridColumn: 'span 2', height: '1px', background: THEME.border, margin: '5px 0' }} />
            <div><label style={labelStyle}><Edit3 size={12}/> Bldg Height (m)</label><input type="number" value={params.height} onChange={(e) => updateParam('height', parseFloat(e.target.value))} style={editableMetricStyle} /></div>
            <div><label style={labelStyle}><Home size={12}/> Apartment Count</label><input type="number" value={params.units} onChange={(e) => updateParam('units', parseInt(e.target.value))} style={editableMetricStyle} /></div>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{ fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Construction size={16} color={THEME.primary} /> SETUP & DATE CONTROL
          </h3>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Structural Material</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              {['Concrete', 'Steel', 'Timber'].map(mat => (
                <button key={mat} onClick={() => updateParam('material', mat)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${params.material === mat ? THEME.primary : THEME.border}`, background: params.material === mat ? THEME.primary : 'white', color: params.material === mat ? 'white' : THEME.sidebar, fontWeight: '700', fontSize: '10px', cursor: 'pointer' }}>{mat}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}><label style={labelStyle}><Calendar size={12}/> Projected Start Date</label><input type="date" value={params.startDate} onChange={(e) => updateParam('startDate', e.target.value)} style={inputStyle} /></div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Complexity Level</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              {['Low', 'Medium', 'High'].map(lvl => (
                <button key={lvl} onClick={() => updateParam('complexity', lvl)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${params.complexity === lvl ? THEME.primary : THEME.border}`, background: params.complexity === lvl ? THEME.primary : 'white', color: params.complexity === lvl ? 'white' : THEME.sidebar, fontWeight: '700', fontSize: '10px', cursor: 'pointer' }}>{lvl}</button>
              ))}
            </div>
          </div>
          <div style={{ padding: '15px', background: THEME.sidebar, borderRadius: '12px', color: 'white', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', opacity: 0.6, marginBottom: '5px' }}>PROJECTED HANDOVER</div>
            <div style={{ fontSize: '20px', fontWeight: '800' }}>{results.handoverDate.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>

        <div style={{ ...cardStyle, background: THEME.background, textAlign: 'center', border: `2px solid ${THEME.primary}20` }}>
          <div style={{ color: THEME.muted, fontSize: '12px', fontWeight: '800', letterSpacing: '1px' }}>ESTIMATED TOTAL BUDGET</div>
          <div style={{ fontSize: '46px', fontWeight: '950', color: THEME.primary, margin: '15px 0' }}>€{results.finalBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}><ShieldCheck size={16} /> DATA SYNCED</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '40px', borderTop: `1px solid ${THEME.border}`, paddingTop: '30px' }}>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', border: `1px solid ${THEME.border}` }}>
              <div style={labelStyle}><HardHat size={12}/> Labor Force</div>
              <div style={{ fontSize: '20px', fontWeight: '900' }}>{Math.round(results.estHours).toLocaleString()} <span style={{fontSize: '12px'}}>Hrs</span></div>
            </div>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', border: `1px solid ${THEME.border}` }}>
              <div style={labelStyle}><Clock size={12}/> Schedule</div>
              <div style={{ fontSize: '20px', fontWeight: '900' }}>{results.totalWeeks} <span style={{fontSize: '12px'}}>Wks</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 2: CALCULATED PROJECT TIMELINE (UNCHANGED) --- */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h3 style={{ fontSize: '14px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={18} color={THEME.primary} /> CALCULATED PROJECT TIMELINE</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px' }}>
          {results.schedulePhases.map((phase, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              <div style={{ height: '8px', background: phase.color, borderRadius: '10px', marginBottom: '15px' }} />
              <div style={{ fontSize: '10px', fontWeight: '900', color: THEME.sidebar, marginBottom: '5px', height: '24px' }}>{phase.name}</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: THEME.primary }}>{phase.weeks} <span style={{ fontSize: '10px', color: THEME.muted }}>WKS</span></div>
              {idx < 5 && <div style={{ position: 'absolute', right: '-15px', top: '-4px', color: THEME.border }}><ArrowRight size={16} /></div>}
            </div>
          ))}
        </div>
      </div>

      {/* --- SECTION 3: AESTHETIC LABOR OPTIMIZER --- */}
      <div style={{ ...cardStyle, background: '#fff', border: `1px solid ${THEME.border}`, padding: '0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: `1px solid ${THEME.border}` }}>
          
          {/* Left Control Panel */}
          <div style={{ width: '380px', borderRight: `1px solid ${THEME.border}`, padding: '24px', background: '#F8FAFC' }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <Target size={20} color={THEME.primary} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '900' }}>LABOR FORCE OPTIMIZER</h3>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: THEME.muted }}>Simulate workforce vs. completion speed for specific tasks.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Phase Selection</label>
                <select style={inputStyle} value={optimizer.task} onChange={(e) => setOptimizer({...optimizer, task: e.target.value})}>
                  {[...new Set(libraryData.filter(i => i.Category === 'Labor').map(i => i.Task))].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Primary Trade Role</label>
                <select style={inputStyle} value={optimizer.role} onChange={(e) => setOptimizer({...optimizer, role: e.target.value})}>
                  {libraryData.filter(i => i.Category === 'Labor' && i.Task === optimizer.task).map(i => (
                    <option key={i.Identifier} value={i.Identifier}>{i.Identifier}</option>
                  ))}
                </select>
              </div>

              <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: `1px solid ${THEME.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Deployment Size</label>
                  <span style={{ fontSize: '14px', fontWeight: '900', color: optRes.statusColor }}>{optimizer.workerCount} Men</span>
                </div>
                <input 
                  type="range" min="1" max="15" step="1" 
                  value={optimizer.workerCount} 
                  onChange={(e) => setOptimizer({...optimizer, workerCount: parseInt(e.target.value)})}
                  style={{ width: '100%', accentColor: optRes.statusColor, cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', fontWeight: '700', color: THEME.muted }}>
                  <span>1 Person</span>
                  <span>15 Max</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Metrics */}
          <div style={{ flex: 1, padding: '30px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
             
             {/* Background Decoration */}
             <div style={{ position: 'absolute', top: '20px', right: '20px', opacity: 0.05 }}><BarChart3 size={120} /></div>

             {/* GRAPHIC ACCELERATION MODULE */}
             <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '15px' }}>
                  {[...Array(15)].map((_, i) => (
                    <Users 
                      key={i} 
                      size={20} 
                      style={{ 
                        color: i < optimizer.workerCount ? optRes.statusColor : '#e2e8f0',
                        filter: i < optimizer.workerCount ? `drop-shadow(0 0 5px ${optRes.statusColor}44)` : 'none',
                        transition: 'all 0.3s ease'
                      }} 
                    />
                  ))}
                </div>
                <div style={{ position: 'relative', width: '90%', margin: '0 auto', height: '12px', background: '#f1f5f9', borderRadius: '6px' }}>
                  <div 
                    style={{ 
                      width: `${(optimizer.workerCount / 15) * 100}%`, 
                      height: '100%', 
                      background: optRes.statusColor,
                      borderRadius: '6px',
                      transition: 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }} 
                  />
                  {/* Floating Label */}
                  <div style={{
                    position: 'absolute', left: `${(optimizer.workerCount / 15) * 100}%`, transform: 'translateX(-50%)',
                    top: '-25px', background: optRes.statusColor, color: 'white', padding: '3px 10px', borderRadius: '4px',
                    fontSize: '9px', fontWeight: '900', boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    {optRes.statusLabel}
                  </div>
                </div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {/* Duration Card */}
                <div style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                   <div style={{ background: '#f8fafc', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                     <Clock size={18} color={THEME.muted} />
                   </div>
                   <div style={{ fontSize: '10px', fontWeight: '800', color: THEME.muted, marginBottom: '4px' }}>EST. DURATION</div>
                   <div style={{ fontSize: '24px', fontWeight: '950', color: THEME.sidebar }}>{optRes.currentDays.toFixed(1)} <span style={{fontSize: '12px'}}>Days</span></div>
                </div>

                {/* Efficiency Card */}
                <div style={{ background: `${optRes.statusColor}10`, border: `1px solid ${optRes.statusColor}33`, borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                   <div style={{ background: `${optRes.statusColor}22`, width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                     <TrendingDown size={18} color={optRes.statusColor} />
                   </div>
                   <div style={{ fontSize: '10px', fontWeight: '800', color: optRes.statusColor, marginBottom: '4px' }}>TIME SAVED</div>
                   <div style={{ fontSize: '24px', fontWeight: '950', color: optRes.statusColor }}>{optRes.timeSaved.toFixed(1)} <span style={{fontSize: '12px'}}>Days</span></div>
                </div>

                {/* Cost Card */}
                <div style={{ background: THEME.sidebar, borderRadius: '16px', padding: '20px', textAlign: 'center', color: 'white' }}>
                   <div style={{ background: 'rgba(255,255,255,0.1)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                     <HardHat size={18} color={THEME.success} />
                   </div>
                   <div style={{ fontSize: '10px', fontWeight: '800', opacity: 0.6, marginBottom: '4px' }}>SIMULATED COST</div>
                   <div style={{ fontSize: '24px', fontWeight: '950', color: 'white' }}>€{optRes.totalCost.toLocaleString()}</div>
                </div>
             </div>

             <div style={{ marginTop: '30px', padding: '20px', borderRadius: '12px', background: optRes.isUnderstaffed ? '#FFF7ED' : '#F8FAFC', border: `1px dashed ${optRes.isUnderstaffed ? '#ef4444' : THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${optRes.statusColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {optRes.isUnderstaffed ? <AlertTriangle color="#ef4444" size={20}/> : <ShieldCheck color={optRes.statusColor} size={20}/>}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: optRes.isUnderstaffed ? '#ef4444' : THEME.sidebar }}>
                      {optRes.isUnderstaffed ? "Staffing Alert: Below minimum safety threshold" : `Deployment: ${optRes.statusLabel}`}
                    </div>
                    <div style={{ fontSize: '11px', color: THEME.muted }}>Required Crew: {optRes.minRequired} Persons</div>
                  </div>
                </div>
                <button style={{ background: THEME.sidebar, color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <Save size={16} color={THEME.success}/> APPLY TO PROJECT TIMELINE
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickEstimator;