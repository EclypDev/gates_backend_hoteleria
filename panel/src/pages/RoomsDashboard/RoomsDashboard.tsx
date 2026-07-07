import { useState, useEffect } from 'react';
import type { IRoom, IBusiness } from '../../core/interfaces/room.interface';
import type { IDevice } from '../../core/interfaces/device.interface';
import { roomApi } from '../../core/services/api-room.service';
import { businessApi } from '../../core/services/api-business.service';
import { iotApi } from '../../core/services/api-iot.service';
import RoomCard from '../../components/RoomCard/RoomCard';
import styles from './RoomsDashboard.module.css';

export default function RoomsDashboard() {
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [businesses, setBusinesses] = useState<IBusiness[]>([]);
  const [devices, setDevices] = useState<IDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);

  // Form states
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newFloor, setNewFloor] = useState('');
  const [newBusinessId, setNewBusinessId] = useState('');
  const [newDoorPin, setNewDoorPin] = useState(2);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  // Business form
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newBusinessDesc, setNewBusinessDesc] = useState('');

  const loadData = async () => {
    try {
      const [roomsData, businessesData, devicesData] = await Promise.all([
        roomApi.getAll(),
        businessApi.getAll(),
        iotApi.getDevices(),
      ]);
      setRooms(roomsData);
      setBusinesses(businessesData);
      setDevices(devicesData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateRoom = async () => {
    if (!newRoomNumber || !newBusinessId) return;
    try {
      await roomApi.create({
        roomNumber: newRoomNumber,
        floor: newFloor || undefined,
        businessId: newBusinessId,
        doorPin: newDoorPin,
      });
      setShowCreateModal(false);
      setNewRoomNumber('');
      setNewFloor('');
      setNewBusinessId('');
      setNewDoorPin(2);
      loadData();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Error al crear habitación'}`);
    }
  };

  const handleCreateBusiness = async () => {
    if (!newBusinessName) return;
    try {
      await businessApi.create({
        name: newBusinessName,
        description: newBusinessDesc || undefined,
      });
      setShowBusinessModal(false);
      setNewBusinessName('');
      setNewBusinessDesc('');
      loadData();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Error al crear negocio'}`);
    }
  };

  const handleAssignDevice = async () => {
    if (!selectedRoom || !selectedDeviceId) return;
    try {
      await roomApi.assignDevice(selectedRoom.id, selectedDeviceId);
      setShowAssignModal(false);
      setSelectedRoom(null);
      setSelectedDeviceId('');
      loadData();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Error al asignar dispositivo'}`);
    }
  };

  const handleRemoveDevice = async (roomId: string) => {
    try {
      await roomApi.removeDevice(roomId);
      loadData();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Error al remover dispositivo'}`);
    }
  };

  const availableDevices = devices.filter(
    (d) => !rooms.some((r) => r.deviceId === d.id)
  );

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>🏨 Moteles</h1>
            <p className={styles.subtitle}>Gestión de Habitaciones y Dispositivos</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.btnSecondary} onClick={() => setShowBusinessModal(true)}>
              + Negocio
            </button>
            <button className={styles.btnPrimary} onClick={() => setShowCreateModal(true)}>
              + Habitación
            </button>
            <button className={styles.btnRefresh} onClick={loadData}>
              ↻ Recargar
            </button>
          </div>
        </div>

        {loading ? (
          <p className={styles.empty}>Cargando...</p>
        ) : rooms.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>🏗️</p>
            <p className={styles.emptyText}>No hay habitaciones registradas</p>
            <p className={styles.emptyHint}>Crea un negocio y luego agrega habitaciones</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {rooms.map((room) => (
              <div key={room.id} className={styles.cardWrapper}>
                <RoomCard room={room} />
                <div className={styles.cardActions}>
                  {!room.device && availableDevices.length > 0 && (
                    <button
                      className={styles.btnAssign}
                      onClick={() => {
                        setSelectedRoom(room);
                        setShowAssignModal(true);
                      }}
                    >
                      Asignar ESP32
                    </button>
                  )}
                  {room.device && (
                    <button
                      className={styles.btnRemove}
                      onClick={() => handleRemoveDevice(room.id)}
                    >
                      Quitar ESP32
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className={styles.modal} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Nueva Habitación</h2>
            <div className={styles.formGroup}>
              <label>Número de Habitación</label>
              <input
                type="text"
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                placeholder="Ej: 101, 202..."
              />
            </div>
            <div className={styles.formGroup}>
              <label>Piso (opcional)</label>
              <input
                type="text"
                value={newFloor}
                onChange={(e) => setNewFloor(e.target.value)}
                placeholder="Ej: 1, 2, PB..."
              />
            </div>
            <div className={styles.formGroup}>
              <label>Negocio</label>
              <select
                value={newBusinessId}
                onChange={(e) => setNewBusinessId(e.target.value)}
              >
                <option value="">Seleccionar negocio...</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Pin de Puerta (GPIO)</label>
              <input
                type="number"
                value={newDoorPin}
                onChange={(e) => setNewDoorPin(Number(e.target.value))}
                min={0}
                max={34}
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowCreateModal(false)}>
                Cancelar
              </button>
              <button className={styles.btnSubmit} onClick={handleCreateRoom}>
                Crear Habitación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Business Modal */}
      {showBusinessModal && (
        <div className={styles.modal} onClick={() => setShowBusinessModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Nuevo Negocio</h2>
            <div className={styles.formGroup}>
              <label>Nombre del Negocio</label>
              <input
                type="text"
                value={newBusinessName}
                onChange={(e) => setNewBusinessName(e.target.value)}
                placeholder="Ej: Hotel Central, Motel Luna..."
              />
            </div>
            <div className={styles.formGroup}>
              <label>Descripción (opcional)</label>
              <input
                type="text"
                value={newBusinessDesc}
                onChange={(e) => setNewBusinessDesc(e.target.value)}
                placeholder="Descripción breve..."
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowBusinessModal(false)}>
                Cancelar
              </button>
              <button className={styles.btnSubmit} onClick={handleCreateBusiness}>
                Crear Negocio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Device Modal */}
      {showAssignModal && selectedRoom && (
        <div className={styles.modal} onClick={() => setShowAssignModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              Asignar ESP32 a Habitación {selectedRoom.roomNumber}
            </h2>
            <div className={styles.formGroup}>
              <label>Dispositivo Disponible</label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
              >
                <option value="">Seleccionar dispositivo...</option>
                {availableDevices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.alias} ({d.macAddress}) {d.isOnline ? '🟢' : '🔴'}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowAssignModal(false)}>
                Cancelar
              </button>
              <button className={styles.btnSubmit} onClick={handleAssignDevice}>
                Asignar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
