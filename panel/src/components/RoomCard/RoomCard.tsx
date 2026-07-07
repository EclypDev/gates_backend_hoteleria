import type { IRoom } from '../../core/interfaces/room.interface';
import { roomApi } from '../../core/services/api-room.service';
import styles from './RoomCard.module.css';

interface Props {
  room: IRoom;
  onRefresh: () => void;
}

export default function RoomCard({ room, onRefresh }: Props) {
  const handleOpen = async () => {
    try {
      await roomApi.openDoor(room.id);
      alert(`Puerta de habitación ${room.roomNumber} abierta`);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Error al abrir puerta'}`);
    }
  };

  const handleClose = async () => {
    try {
      await roomApi.closeDoor(room.id);
      alert(`Puerta de habitación ${room.roomNumber} cerrada`);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Error al cerrar puerta'}`);
    }
  };

  const isDeviceOnline = room.device?.isOnline ?? false;
  const hasDevice = !!room.device;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.roomInfo}>
          <h3 className={styles.roomNumber}>Habitación {room.roomNumber}</h3>
          {room.floor && <span className={styles.floor}>Piso {room.floor}</span>}
        </div>
        <span className={`${styles.badge} ${room.isActive ? styles.active : styles.inactive}`}>
          {room.isActive ? 'Activa' : 'Inactiva'}
        </span>
      </div>

      <div className={styles.business}>
        <span className={styles.businessLabel}>Negocio:</span>
        <span className={styles.businessName}>{room.business?.name ?? 'Sin asignar'}</span>
      </div>

      <div className={styles.deviceSection}>
        {hasDevice ? (
          <>
            <div className={styles.deviceInfo}>
              <span className={styles.deviceLabel}>ESP32:</span>
              <span className={styles.deviceAlias}>{room.device!.alias}</span>
              <span className={`${styles.deviceStatus} ${isDeviceOnline ? styles.online : styles.offline}`}>
                {isDeviceOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className={styles.pinInfo}>
              <span className={styles.pinLabel}>Pin puerta:</span>
              <span className={styles.pinValue}>GPIO {room.doorPin}</span>
            </div>
          </>
        ) : (
          <div className={styles.noDevice}>
            <span>Sin dispositivo asignado</span>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button
          className={styles.btnOpen}
          onClick={handleOpen}
          disabled={!hasDevice || !isDeviceOnline}
        >
          Abrir Puerta
        </button>
        <button
          className={styles.btnClose}
          onClick={handleClose}
          disabled={!hasDevice || !isDeviceOnline}
        >
          Cerrar Puerta
        </button>
      </div>
    </div>
  );
}
