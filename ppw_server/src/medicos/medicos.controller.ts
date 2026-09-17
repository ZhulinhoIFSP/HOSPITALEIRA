import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MedicosService } from './medicos.service';
@Controller('medicos')
export class MedicosController { constructor(private readonly medicosService: MedicosService) {} @Get() findAll() { return this.medicosService.findAll(); } @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.medicosService.findOne(id); } }
