import type { IBusiness, ICreateBusinessDto, IUpdateBusinessDto } from '../interfaces/room.interface';

const API_BASE = '/api/businesses';

export class ApiBusinessService {
  async getAll(): Promise<IBusiness[]> {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Error al obtener negocios');
    return res.json();
  }

  async getById(id: string): Promise<IBusiness> {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error('Error al obtener negocio');
    return res.json();
  }

  async create(data: ICreateBusinessDto): Promise<IBusiness> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear negocio');
    return res.json();
  }

  async update(id: string, data: IUpdateBusinessDto): Promise<IBusiness> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar negocio');
    return res.json();
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar negocio');
  }
}

export const businessApi = new ApiBusinessService();
