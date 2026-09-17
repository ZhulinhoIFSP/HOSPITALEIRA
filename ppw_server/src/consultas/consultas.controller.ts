import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { Consulta } from './consulta.interface';
import { ConsultasService } from './consultas.service';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { UpdateConsultaDto } from './dto/update-consulta.dto';
@Controller('consultas')
export class ConsultasController { constructor(private readonly consultasService: ConsultasService) {} @Get() findAll() { return this.consultasService.findAll(); } @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.consultasService.findOne(id); } @Post() create(@Body() dto: CreateConsultaDto) { return this.consultasService.create(dto); } @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateConsultaDto) { return this.consultasService.update(id, dto); } @Put('sincronizar') sincronizar(@Body() consultas: Consulta[]) { return this.consultasService.sincronizar(consultas); } }
