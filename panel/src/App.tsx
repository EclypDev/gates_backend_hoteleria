import { useState } from 'react';
import RoomsDashboard from './pages/RoomsDashboard/RoomsDashboard';
import Dashboard from './pages/Dashboard/Dashboard';
import styles from './App.module.css';

type View = 'rooms' | 'devices';

function App() {
  const [currentView, setCurrentView] = useState<View>('rooms');

  return (
    <div className={styles.app}>
      <nav className={styles.nav}>
        <div className={styles.navBrand}>🏨 Moteles</div>
        <div className={styles.navLinks}>
          <button
            className={`${styles.navLink} ${currentView === 'rooms' ? styles.active : ''}`}
            onClick={() => setCurrentView('rooms')}
          >
            Habitaciones
          </button>
          <button
            className={`${styles.navLink} ${currentView === 'devices' ? styles.active : ''}`}
            onClick={() => setCurrentView('devices')}
          >
            Dispositivos
          </button>
        </div>
      </nav>
      <main className={styles.main}>
        {currentView === 'rooms' ? <RoomsDashboard /> : <Dashboard />}
      </main>
    </div>
  );
}

export default App;
