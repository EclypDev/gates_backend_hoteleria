import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { BusinessService } from '../services/business.service';
import type { CreateBusinessDto, UpdateBusinessDto } from '../dto/business.dto';
import type { Business } from '../entities/business.entity';

@Controller('businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get()
  async findAll(): Promise<Business[]> {
    return this.businessService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Business> {
    const business = await this.businessService.findById(id);
    if (!business) {
      throw new Error(`Business with ID ${id} not found`);
    }
    return business;
  }

  @Post()
  async create(@Body() dto: CreateBusinessDto): Promise<Business> {
    return this.businessService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBusinessDto): Promise<Business> {
    return this.businessService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.businessService.delete(id);
  }
}
