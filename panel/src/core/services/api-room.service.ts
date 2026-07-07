import type { IRoom, ICreateRoomDto, IUpdateRoomDto } from '../interfaces/room.interface';

const API_BASE = '/api/rooms';

export class ApiRoomService {
  async getAll(): Promise<IRoom[]> {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Error al obtener habitaciones');
    return res.json();
  }

  async getById(id: string): Promise<IRoom> {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error('Error al obtener habitación');
    return res.json();
  }

  async getByBusiness(businessId: string): Promise<IRoom[]> {
    const res = await fetch(`${API_BASE}/business/${businessId}`);
    if (!res.ok) throw new Error('Error al obtener habitaciones del negocio');
    return res.json();
  }

  async create(data: ICreateRoomDto): Promise<IRoom> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear habitación');
    return res.json();
  }

  async update(id: string, data: IUpdateRoomDto): Promise<IRoom> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar habitación');
    return res.json();
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar habitación');
  }

  async assignDevice(roomId: string, deviceId: string): Promise<IRoom> {
    const res = await fetch(`${API_BASE}/${roomId}/device`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    });
    if (!res.ok) throw new Error('Error al asignar dispositivo');
    return res.json();
  }

  async removeDevice(roomId: string): Promise<IRoom> {
    const res = await fetch(`${API_BASE}/${roomId}/device`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al remover dispositivo');
    return res.json();
  }

  async openDoor(roomId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${roomId}/open`, { method: 'POST' });
    if (!res.ok) throw new Error('Error al abrir puerta');
  }

  async closeDoor(roomId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${roomId}/close`, { method: 'POST' });
    if (!res.ok) throw new Error('Error al cerrar puerta');
  }
}

export const roomApi = new ApiRoomService();
