import React, { useState } from 'react';
import Map from './components/map';
import Sidebar from './components/sidebar';
import TimelineSlider from './components/timeline-slider';
import WelcomeModal from './components/modal';
import './App.css';

function App() {
  const [showModal, setShowModal] = useState(true);
  const [sidebarState, setSidebarState] = useState(null);
  const [yearRange, setYearRange] = useState([1000, 2000]);

  const handleBattleClick = (battle) => {
    setSidebarState({ mode: 'battle', battle });
  };

  const handleClusterClick = (battles) => {
    setSidebarState({ mode: 'cluster', battles });
  };

  const handleClose = () => setSidebarState(null);

  return (
    <div className="App">
      <div className='map-div'>
        {showModal && <WelcomeModal onClose={() => setShowModal(false)} />}
        <Map
          onSelectedBattleClick={handleBattleClick}
          onSelectedClusterClick={handleClusterClick}
          yearRange={yearRange}
        />
        <Sidebar
          state={sidebarState}
          onBattleSelect={(battle) => setSidebarState({ mode: 'battle', battle })}
          onClose={handleClose}
        />
        <TimelineSlider
          yearRange={yearRange}
          onRangeChange={setYearRange}
        />
      </div>
    </div>
  );
}

export default App;