import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PacientesService } from './pacientes.service';
@Controller('pacientes')
export class PacientesController { constructor(private readonly pacientesService: PacientesService) {} @Get() findAll() { return this.pacientesService.findAll(); } @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.pacientesService.findOne(id); } }
