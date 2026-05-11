import React, { useState, useEffect } from 'react';
import { 
  CloudSun, Users, MapPin, TrendingUp, ExternalLink, 
  Timer, Thermometer, Wind, Droplets 
} from 'lucide-react';
import { THEME } from '../constants/theme';

const Dashboard = ({
  cardStyle, projectData, setProjectData,
  grandTotal, phases, projectStatus, setProjectStatus,
  overrunDays, setOverrunDays, onSave
}) => {
  const [city, setCity] = useState('Milan');
  const [weather, setWeather] = useState({ 
    temp: "22", condition: "Sunny", wind: "10km/h", humidity: "45%", forecast: "Clear Skies" 
  });

  useEffect(() => {
    const lombardiaWeatherData = {
      'Milan': { temp: "22", wind: "8km/h", humidity: "48%", forecast: "Clear Skies" },
      'Bergamo': { temp: "19", wind: "14km/h", humidity: "55%", forecast: "Mountain Breeze" },
      'Brescia': { temp: "21", wind: "11km/h", humidity: "52%", forecast: "Partly Cloudy" },
      'Como': { temp: "18", wind: "18km/h", humidity: "65%", forecast: "Lake Mist" },
      'Monza': { temp: "23", wind: "9km/h", humidity: "46%", forecast: "Sunny" },
      'Varese': { temp: "17", wind: "20km/h", humidity: "60%", forecast: "Gusty Winds" }
    };
    if (lombardiaWeatherData[city]) setWeather(prev => ({ ...prev, ...lombardiaWeatherData[city] }));
  }, [city]);

  const burnPerDay = grandTotal * 0.0008;
  const riskExposure = overrunDays > 0 ? (overrunDays * burnPerDay) : 0;
  
  const craneRisk = parseInt(weather.wind) > 15 ? 'CAUTION' : 'LOW';
  const curingRisk = parseInt(weather.temp) > 30 ? 'CRITICAL' : 'OPTIMAL';
  const evapRate = parseInt(weather.humidity) < 30 ? 'High' : 'Normal';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', animation: 'fadeIn 0.6s ease-out' }}>
      
      {/* --- FINANCIAL OVERVIEW --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr', gap: '20px' }}>
        <div style={{ ...cardStyle, background: `linear-gradient(135deg, ${THEME.sidebar} 0%, #1e1b4b 100%)`, color: 'white', padding: '30px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.7, fontSize: '11px', fontWeight: '900', letterSpacing: '2px' }}><Timer size={14} /> LIVE PROJECT VALUATION</div>
            <h1 style={{ fontSize: '52px', fontWeight: '950', margin: '10px 0', letterSpacing: '-2px' }}>€{(grandTotal + riskExposure).toLocaleString()}</h1>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '700' }}>● BASE: €{grandTotal.toLocaleString()}</div>
              {overrunDays > 0 && <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700' }}>● RISK: +€{riskExposure.toLocaleString()}</div>}
            </div>
          </div>
          <TrendingUp size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, color: 'white' }} />
        </div>

        <div style={{ ...cardStyle, background: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ color: THEME.muted, fontSize: '10px', fontWeight: '900' }}>SCHEDULE VARIANCE</div>
          <div style={{ fontSize: '38px', fontWeight: '950', color: overrunDays > 0 ? '#ef4444' : '#10b981', margin: '5px 0' }}>{overrunDays > 0 ? `+${overrunDays}` : Math.abs(overrunDays)}</div>
          <div style={{ fontSize: '11px', fontWeight: '700' }}>{overrunDays > 0 ? 'DAYS DELAYED' : 'DAYS SAVED'}</div>
        </div>

        <div style={{ ...cardStyle, background: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
          <div style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '900', textAlign: 'center', backgroundColor: projectStatus === 'Active' ? '#dcfce7' : '#fee2e2', color: projectStatus === 'Active' ? '#166534' : '#991b1b' }}>{projectStatus.toUpperCase()}</div>
          <button onClick={() => setProjectStatus(projectStatus === 'Active' ? 'Delayed' : 'Active')} style={{ border: `1px solid ${THEME.border}`, padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>Toggle State</button>
        </div>
      </div>

      {/* --- ENVIRONMENTAL & RISK REPORT (image_4fe9e0.png integration) --- */}
      <div style={{ ...cardStyle, background: '#f8fafc', padding: '25px', border: `1px solid ${THEME.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CloudSun color={THEME.primary} /> Site Environmental Report
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fff', border: `1px solid ${THEME.border}`, padding: '4px 10px', borderRadius: '8px' }}>
              <MapPin size={14} color={THEME.muted} />
              <select value={city} onChange={(e) => setCity(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '12px', fontWeight: '700', outline: 'none', cursor: 'pointer' }}>
                {['Milan', 'Bergamo', 'Brescia', 'Como', 'Monza', 'Varese'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <a href={`https://openweathermap.org/find?q=${city},IT`} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: THEME.primary, textDecoration: 'none', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
            Full Forecast <ExternalLink size={12}/>
          </a>
        </div>

        {/* Dynamic Risk Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
          <div style={{ background: 'white', padding: '15px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: THEME.muted, fontSize: '11px', fontWeight: '800' }}><Thermometer size={14}/> AIR TEMP</div>
            <div style={{ fontSize: '22px', fontWeight: '900', marginTop: '5px' }}>{weather.temp}°C</div>
            <div style={{ fontSize: '10px', color: curingRisk === 'OPTIMAL' ? '#10b981' : '#ef4444', fontWeight: '700', marginTop: '4px' }}>CONCRETE: {curingRisk}</div>
          </div>
          <div style={{ background: 'white', padding: '15px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: THEME.muted, fontSize: '11px', fontWeight: '800' }}><Wind size={14}/> WIND SPEED</div>
            <div style={{ fontSize: '22px', fontWeight: '900', marginTop: '5px' }}>{weather.wind}</div>
            <div style={{ fontSize: '10px', color: craneRisk === 'LOW' ? '#10b981' : '#ef4444', fontWeight: '700', marginTop: '4px' }}>CRANE RISK: {craneRisk}</div>
          </div>
          <div style={{ background: 'white', padding: '15px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: THEME.muted, fontSize: '11px', fontWeight: '800' }}><Droplets size={14}/> HUMIDITY</div>
            <div style={{ fontSize: '22px', fontWeight: '900', marginTop: '5px' }}>{weather.humidity}</div>
            <div style={{ fontSize: '10px', color: THEME.muted, marginTop: '4px' }}>Evaporation Rate: {evapRate}</div>
          </div>
          <div style={{ background: THEME.sidebar, color: 'white', padding: '15px', borderRadius: '15px', position: 'relative' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', opacity: 0.6 }}>LOMBARDIA FORECAST</div>
            <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '5px' }}>{weather.forecast}</div>
            <div style={{ fontSize: '10px', color: '#fbbf24', fontWeight: '700', marginTop: '4px' }}>PRO-TIP: Seal Partition Openings</div>
          </div>
        </div>
      </div>

      {/* --- GEOMETRY & SYNC --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px' }}>
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Capital Allocation</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {phases.map(phase => (
              <div key={phase.id} style={{ padding: '10px', borderRadius: '12px', background: '#fcfbf8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>
                  <span>{phase.name}</span>
                  <span>€{phase.totalCost.toLocaleString()}</span>
                </div>
                <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${(phase.totalCost / grandTotal) * 100}%`, height: '100%', background: THEME.primary, borderRadius: '10px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ ...cardStyle, padding: '20px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '15px' }}>Geometry Drivers</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {[{ label: 'GIA (m²)', key: 'gia' }, { label: 'FLOORS', key: 'storeys' }, { label: 'WALLS (m²)', key: 'wallArea' }, { label: 'GLAZE (m²)', key: 'windowArea' }].map(spec => (
                <div key={spec.key} style={{ background: '#f1f5f9', padding: '10px', borderRadius: '10px' }}>
                  <label style={{ fontSize: '9px', fontWeight: '900', color: THEME.muted }}>{spec.label}</label>
                  <input type="number" value={projectData[spec.key]} onChange={(e) => setProjectData({...projectData, [spec.key]: parseFloat(e.target.value) || 0})} style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: '800', outline: 'none' }} />
                </div>
              ))}
            </div>
          </div>
          <button onClick={onSave} style={{ background: THEME.primary, color: 'white', padding: '20px', borderRadius: '15px', border: 'none', fontWeight: '900', cursor: 'pointer', boxShadow: `0 8px 20px ${THEME.primary}44` }}>SYNC PROJECT & WEATHER DATA</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;