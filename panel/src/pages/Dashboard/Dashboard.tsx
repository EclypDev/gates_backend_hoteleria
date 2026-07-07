import { useState, useEffect } from 'react';
import type { IDevice } from '../../core/interfaces';
import { iotApi } from '../../core/services/api-iot.service';
import DeviceControlCard from '../../components/DeviceControlCard/DeviceControlCard';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [devices, setDevices] = useState<IDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDevices = async () => {
    try {
      const data = await iotApi.getDevices();
      setDevices(data);
    } catch (err) {
      console.error('Error cargando dispositivos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDevices(); }, []);

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>📡 Dispositivos IoT</h1>
            <p className={styles.subtitle}>Control directo de ESP32</p>
          </div>
          <button className={styles.refresh} onClick={loadDevices}>↻ Recargar</button>
        </div>

        {loading ? (
          <p className={styles.empty}>Cargando dispositivos...</p>
        ) : devices.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>📡</p>
            <p className={styles.emptyText}>No hay dispositivos registrados</p>
            <p className={styles.emptyHint}>Conecta un ESP32 para que se registre automáticamente</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {devices.map((device) => (
              <DeviceControlCard key={device.id} device={device} onRefresh={loadDevices} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
