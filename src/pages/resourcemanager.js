import React, { useState, useEffect, useMemo } from 'react';
import { Save, X, RotateCcw, TrendingDown, TrendingUp, Plus, AlertCircle, Lock } from 'lucide-react';
import { THEME } from '../constants/theme';
import libraryData from '../constants/master_dataset.json';

const ResourceManager = ({
  cardStyle,
  phases = [],
  currentPhase,
  setSelectedPhaseId,
  labourItems = [],
  onSave,
  filterTask
}) => {
  // --- 1. EXTRACT BACKEND RATES ---
  // This maps the actual price from your JSON to the Role Identifier
  const masterRates = useMemo(() => {
    return libraryData
      .filter(i => i.Category === 'Labor')
      .reduce((acc, i) => {
        acc[i.Identifier] = i['Price (€)'];
        return acc;
      }, {});
  }, []);

  // --- 2. STATE MANAGEMENT ---
  const [laborRates, setLaborRates] = useState(() => {
    const saved = localStorage.getItem('CONCRETE_BUILD_PRO_LABOR_RATES');
    // If no saved data, or if we want to force restore backend values, use masterRates
    return saved ? JSON.parse(saved) : { ...masterRates };
  });

  const [resourceRows, setResourceRows] = useState([]);
  const [variationInput, setVariationInput] = useState({ 
    task: '', type: '', days: 1, number: 1, hoursPerDay: 8 
  });

  const currentPhaseTasks = useMemo(() => currentPhase?.tasks || [], [currentPhase]);
  const allRoles = useMemo(() => Object.keys(masterRates), [masterRates]);

  const getRolesForTask = (taskName) => {
    const roles = libraryData.filter(i => i.Category === 'Labor' && i.Task === taskName).map(i => i.Identifier);
    return roles.length > 0 ? roles : allRoles;
  };

  // --- 3. LOGIC & CALCULATIONS ---
  const calculateRowTotal = (row) => {
    const rate = laborRates[row.type] || masterRates[row.type] || 0;
    return (row.number || 0) * (row.days || 0) * (row.hoursPerDay || 0) * rate;
  };

  const totalLabourActual = resourceRows.reduce((sum, row) => sum + calculateRowTotal(row), 0);
  const baseline = currentPhase?.totalCost || 0; 
  const variance = baseline - totalLabourActual;

  // Function to reset everything to backend defaults
  const resetToBackendDefaults = () => {
    setLaborRates({ ...masterRates });
    localStorage.setItem('CONCRETE_BUILD_PRO_LABOR_RATES', JSON.stringify(masterRates));
    loadInitialTasks();
  };

  const loadInitialTasks = () => {
    const rows = libraryData
      .filter(item => item.Category === 'Labor' && currentPhaseTasks.includes(item.Task))
      .map(i => ({ task: i.Task, type: i.Identifier, days: 1, number: 1, hoursPerDay: 8 }));
    setResourceRows(rows);
  };

  useEffect(() => {
    loadInitialTasks();
    if (currentPhaseTasks.length > 0) {
      const task = currentPhaseTasks[0];
      setVariationInput(prev => ({ ...prev, task, type: getRolesForTask(task)[0] }));
    }
  }, [currentPhase?.id]);

  const handleRateChange = (role, newRate) => {
    const val = parseFloat(newRate) || 0;
    // Ensure the rate cannot be lower than the backend value
    const validatedRate = Math.max(val, masterRates[role] || 0);
    const updated = { ...laborRates, [role]: validatedRate };
    setLaborRates(updated);
    localStorage.setItem('CONCRETE_BUILD_PRO_LABOR_RATES', JSON.stringify(updated));
  };

  const GRID_LAYOUT = {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1.5fr 0.5fr 0.5fr 0.5fr 1.2fr 1.2fr 40px',
    gap: '12px', alignItems: 'center', padding: '14px 24px'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* STATS HEADER */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ ...cardStyle, flex: 1.5, borderLeft: `6px solid ${THEME.primary}` }}>
          <label style={{ fontSize: '10px', fontWeight: '800', color: THEME.muted }}>ACTIVE PHASE</label>
          <select 
            value={currentPhase?.id} 
            onChange={(e) => setSelectedPhaseId(e.target.value)}
            style={{ width: '100%', border: 'none', fontSize: '18px', fontWeight: '900', marginTop: '4px', background: 'transparent' }}
          >
            {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div style={{ ...cardStyle, flex: 1 }}>
          <label style={{ fontSize: '10px', fontWeight: '800', color: THEME.muted }}>BACKEND BASELINE</label>
          <div style={{ fontSize: '22px', fontWeight: '900', marginTop: '4px' }}>€{baseline.toLocaleString()}</div>
        </div>
        <div style={{ ...cardStyle, flex: 1, borderTop: `4px solid ${variance < 0 ? THEME.danger : THEME.success}` }}>
          <label style={{ fontSize: '10px', fontWeight: '800', color: THEME.muted }}>VARIANCES</label>
          <div style={{ fontSize: '22px', fontWeight: '900', color: variance < 0 ? THEME.danger : THEME.success, marginTop: '4px' }}>
            €{Math.abs(variance).toLocaleString()}
          </div>
        </div>
      </div>

      {/* RESOURCE TABLE */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: '900' }}>Workforce Manager</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: THEME.muted }}>Rates restored from Master Dataset. Minimums are locked.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={resetToBackendDefaults} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', border: `1px solid ${THEME.border}`, background: '#fff', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
              <RotateCcw size={14}/> Force Restore Rates
            </button>
            <button onClick={onSave} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', borderRadius: '10px', background: THEME.primary, color: '#fff', border: 'none', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>
              <Save size={14}/> Save Layout
            </button>
          </div>
        </div>

        {/* HEADERS */}
        <div style={{ ...GRID_LAYOUT, background: '#F9FAFB', borderTop: `1px solid ${THEME.border}`, borderBottom: `1px solid ${THEME.border}` }}>
          {['Task', 'Resource Role', 'Days', 'Staff', 'Hrs', 'Hourly Rate', 'Total Cost', ''].map((h, i) => (
            <span key={i} style={{ fontSize: '10px', fontWeight: '800', color: THEME.muted, textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>

        {/* ADD ROW */}
        <div style={{ ...GRID_LAYOUT, background: '#F5F3FF', borderBottom: `2px solid #C4B5FD` }}>
          <select value={variationInput.task} onChange={e => setVariationInput({...variationInput, task: e.target.value, type: getRolesForTask(e.target.value)[0]})} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #C4B5FD', fontSize: '13px', fontWeight: '600' }}>
            {currentPhaseTasks.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={variationInput.type} onChange={e => setVariationInput({...variationInput, type: e.target.value})} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #C4B5FD', fontSize: '13px', fontWeight: '600' }}>
            {getRolesForTask(variationInput.task).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <input type="number" value={variationInput.days} onChange={e => setVariationInput({...variationInput, days: e.target.value})} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #C4B5FD', fontSize: '13px', width: '100%' }} />
          <input type="number" value={variationInput.number} onChange={e => setVariationInput({...variationInput, number: e.target.value})} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #C4B5FD', fontSize: '13px', width: '100%' }} />
          <input type="number" value={variationInput.hoursPerDay} onChange={e => setVariationInput({...variationInput, hoursPerDay: e.target.value})} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #C4B5FD', fontSize: '13px', width: '100%' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '8px', border: '1px solid #C4B5FD', padding: '4px 8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: THEME.primary, marginRight: '4px' }}>€</span>
            <input 
              type="number" 
              value={laborRates[variationInput.type]} 
              onChange={(e) => handleRateChange(variationInput.type, e.target.value)}
              style={{ border: 'none', width: '100%', fontWeight: '800', outline: 'none', fontSize: '13px', color: THEME.primary }}
            />
          </div>
          <div style={{ textAlign: 'center', color: THEME.muted }}><Plus size={16}/></div>
          <button onClick={() => setResourceRows([{...variationInput}, ...resourceRows])} style={{ background: THEME.primary, color: '#fff', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', fontWeight: 'bold' }}>ADD</button>
        </div>

        {/* LISTING */}
        <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
          {resourceRows.map((row, idx) => (
            <div key={idx} style={{ ...GRID_LAYOUT, borderBottom: `1px solid ${THEME.border}`, backgroundColor: filterTask === row.task ? '#FFFBEB' : 'transparent' }}>
              <div style={{ fontSize: '13px', fontWeight: '700' }}>{row.task}</div>
              <div style={{ fontSize: '13px', color: THEME.muted }}>{row.type}</div>
              <input type="number" value={row.days} onChange={e => { const updated = [...resourceRows]; updated[idx].days = e.target.value; setResourceRows(updated); }} style={{ border: 'none', background: 'transparent', width: '100%', textAlign: 'center' }} />
              <input type="number" value={row.number} onChange={e => { const updated = [...resourceRows]; updated[idx].number = e.target.value; setResourceRows(updated); }} style={{ border: 'none', background: 'transparent', width: '100%', textAlign: 'center' }} />
              <input type="number" value={row.hoursPerDay} onChange={e => { const updated = [...resourceRows]; updated[idx].hoursPerDay = e.target.value; setResourceRows(updated); }} style={{ border: 'none', background: 'transparent', width: '100%', textAlign: 'center' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', background: '#F5F3FF', padding: '6px 12px', borderRadius: '10px', border: '1px solid #DDD6FE' }}>
                <Lock size={10} style={{marginRight: '5px', opacity: 0.5}}/>
                <span style={{ fontSize: '11px', fontWeight: '800', marginRight: '4px' }}>€</span>
                <input 
                  type="number" 
                  value={laborRates[row.type]} 
                  onChange={(e) => handleRateChange(row.type, e.target.value)}
                  style={{ background: 'none', border: 'none', width: '100%', outline: 'none', fontWeight: '800', fontSize: '12px', color: '#5B21B6' }}
                />
              </div>

              <div style={{ background: '#F5F3FF', padding: '8px', borderRadius: '10px', textAlign: 'center', fontSize: '13px', fontWeight: '900', color: '#5B21B6', border: '1px solid #DDD6FE' }}>
                €{calculateRowTotal(row).toLocaleString()}
              </div>
              
              <button onClick={() => setResourceRows(resourceRows.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer' }}><X size={18}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourceManager;