import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from './entities/business.entity';
import type { IBusinessService, CreateBusinessDto, UpdateBusinessDto } from '../interfaces/room-service.interface';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class BusinessService implements IBusinessService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  async findAll(): Promise<Business[]> {
    return this.businessRepository.find({
      relations: ['rooms'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Business | null> {
    return this.businessRepository.findOne({
      where: { id },
      relations: ['rooms', 'rooms.device'],
    });
  }

  async create(data: CreateBusinessDto): Promise<Business> {
    const business = this.businessRepository.create(data);
    return this.businessRepository.save(business);
  }

  async update(id: string, data: UpdateBusinessDto): Promise<Business> {
    const business = await this.findById(id);
    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }
    Object.assign(business, data);
    return this.businessRepository.save(business);
  }

  async delete(id: string): Promise<void> {
    const result = await this.businessRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }
  }
}
