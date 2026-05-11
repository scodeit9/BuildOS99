import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/sidebar';
import Header from './components/header';
import Dashboard from './pages/dashboard';
import ProjectHub from './pages/projecthub';
import EquipmentPortal from './pages/equipment';
import ResourceManager from './pages/resourcemanager';
import QuickEstimator from './pages/QuickEstimator';
import Metrics from './pages/riskmetric';
import Login from './components/login';
import Welcome from './pages/Welcome'; // NEW IMPORT
import libraryData from './constants/master_dataset.json';
import { getInitialQuantities, BASE_PROJECT_TEMPLATE } from './constants/projectemplate';
import { THEME } from './constants/theme';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // UPDATED: Initial state set to 'Welcome'
  const [activeTab, setActiveTab] = useState('Welcome');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [notifications, setNotifications] = useState([]);

  const PROJECT_MAP = {
    "Substructure": ["Excavation", "Piling & Shoring", "Foundations", "Water Proofing", "Retaining Wall"],
    "Superstructure": ["Columns & Beams", "Floor Slab", "Core Construction", "Roof structure"],
    "Building Envelope": ["External Wall", "Roofing", "Glazing", "Windows & Doors"],
    "First Install": ["Fire-Stopping", "Internal Partitioning", "MEP Rough-in", "Fire Sprinklers", "Elevators"],
    "Second Install": ["Internal Plastering", "Ceiling Installation", "Bathroom Installation", "Kitchen & Appliances", "Second Fix MEP", "Joinery", "Flooring", "Electrical Installation", "Internal Finishes"],
    "External Works": ["Landscaping"],
    "Testing, Commissioning & Handover": ["Testing & Balancing", "Electrical Certification", "Snagging", "Final Inspection", "Practical Completion"]
  };

  const STORAGE_KEY = 'CONCRETE_BUILD_PRO_STATE';
  
  const savedState = useMemo(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }, []);

  const [currentProject, setCurrentProject] = useState(savedState.currentProject || "City Tower Block A");
  const [projectStatus, setProjectStatus] = useState(savedState.projectStatus || 'Active');
  const [projectData, setProjectData] = useState(savedState.projectData || { 
    gia: 2500, 
    storeys: 12, 
    wallArea: 4500, 
    windowArea: 1800 
  });
  
  const [quantities, setQuantities] = useState(savedState.quantities || getInitialQuantities(projectData));
  const [delayMetrics, setDelayMetrics] = useState(savedState.delayMetrics || []);
  const [overrunDays, setOverrunDays] = useState(savedState.overrunDays || 0);

  const triggerNotification = (text) => {
    const newNote = { 
      id: Date.now(), 
      text, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    setNotifications(prev => [newNote, ...prev].slice(0, 10));
  };

  const handleGlobalSave = () => {
    const stateToSave = { currentProject, projectStatus, projectData, quantities, delayMetrics, overrunDays };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    triggerNotification(`Project saved: ${currentProject}`);
  };

  const labourItems = useMemo(() => libraryData.filter(item => item.Category === 'Labor'), []);

  // Preserved Phase Logic: Calculates totals for the summary cards in Resource Manager
  const phasesWithCosts = useMemo(() => {
    return Object.entries(PROJECT_MAP).map(([phaseName, tasks]) => {
      let phaseTotal = 0;
      tasks.forEach(task => {
        const items = libraryData.filter(i => i.Task === task);
        items.forEach(item => {
          const qty = quantities[item.Code] || 0;
          phaseTotal += qty * (item['Price (€)'] || 0);
        });
      });
      return { id: phaseName, name: phaseName, totalCost: phaseTotal, tasks };
    });
  }, [quantities]);

  const dailyRiskExposure = delayMetrics.reduce((sum, m) => sum + (parseFloat(m.dailyCost) || 0), 0);
  const totalRiskImpact = overrunDays > 0 ? overrunDays * dailyRiskExposure : 0;
  const grandTotal = phasesWithCosts.reduce((sum, p) => sum + p.totalCost, 0) + totalRiskImpact;

  if (!isLoggedIn) {
    return (
      <Login 
        username={username} 
        setUsername={setUsername} 
        password={password} 
        setPassword={setPassword} 
        handleLogin={() => setIsLoggedIn(true)} 
      />
    );
  }

  const cardStyle = { 
    backgroundColor: 'white', 
    borderRadius: '24px', 
    padding: '32px', 
    border: `1px solid ${THEME.border}`, 
    position: 'relative', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
  };

  const inputStyle = { 
    width: '100%', 
    boxSizing: 'border-box', 
    padding: '12px', 
    borderRadius: '8px', 
    border: `1px solid ${THEME.border}`, 
    backgroundColor: '#fafafa', 
    fontWeight: '600', 
    color: THEME.sidebar, 
    outline: 'none' 
  };

  const activeTabName = typeof activeTab === 'object' ? activeTab.tab : activeTab;

  return (
    <div style={{ display: 'flex', backgroundColor: THEME.background, minHeight: '100vh' }}>
      <Sidebar 
        isExpanded={isSidebarExpanded} 
        setIsExpanded={setIsSidebarExpanded} 
        activeTab={activeTabName} 
        setActiveTab={setActiveTab} 
        setViewMode={setViewMode} 
      />
      
      <div style={{ 
        flexGrow: 1, 
        marginLeft: isSidebarExpanded ? '240px' : '80px', 
        transition: 'margin-left 0.3s ease' 
      }}>
        <Header 
          activeTab={activeTabName} 
          currentProject={currentProject} 
          username={username} 
          notifications={notifications} 
        />
        
        <div style={{ padding: '30px' }}>
          {/* NEW WELCOME PAGE ADDITION */}
          {activeTabName === 'Welcome' && (
            <Welcome setActiveTab={setActiveTab} />
          )}

          {activeTabName === 'Dashboard' && (
            <Dashboard 
              cardStyle={cardStyle} 
              inputStyle={inputStyle} 
              projectData={projectData} 
              setProjectData={setProjectData}
              grandTotal={grandTotal} 
              projectStatus={projectStatus} 
              setProjectStatus={setProjectStatus}
              overrunDays={overrunDays} 
              setOverrunDays={setOverrunDays} 
              onSave={handleGlobalSave}
              labourItems={labourItems} 
              phases={phasesWithCosts} 
              setActiveTab={setActiveTab}
            />
          )}

          {activeTabName === 'Project Hub' && (
            <ProjectHub 
              cardStyle={cardStyle} 
              currentProject={currentProject} 
              setCurrentProject={setCurrentProject}
              projectData={projectData} 
              quantities={quantities} 
              setQuantities={setQuantities}
              grandTotal={grandTotal} 
              setActiveTab={setActiveTab} 
              viewMode={viewMode} 
              setViewMode={setViewMode}
            />
          )}

          {activeTabName === 'Resources' && (
            <ResourceManager 
              cardStyle={cardStyle} 
              filterTask={typeof activeTab === 'object' ? activeTab.task : null}
              phases={phasesWithCosts}
              currentPhase={
                phasesWithCosts.find(p => p.id === (activeTab.phaseId || 'Substructure')) || phasesWithCosts[0]
              }
              setSelectedPhaseId={(id) => setActiveTab({ tab: 'Resources', phaseId: id })}
              labourItems={labourItems}
              onSave={handleGlobalSave}
            />
          )}

          {activeTabName === 'Estimator' && (
            <QuickEstimator cardStyle={cardStyle} />
          )}

          {activeTabName === 'Equipment' && (
            <EquipmentPortal cardStyle={cardStyle} />
          )}

          {activeTabName === 'Metrics' && (
            <Metrics 
              delayMetrics={delayMetrics} 
              setDelayMetrics={setDelayMetrics} 
              overrunDays={overrunDays} 
              cardStyle={cardStyle} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;