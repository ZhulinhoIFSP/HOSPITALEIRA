import { Module } from '@nestjs/common';
import { MedicosModule } from '../medicos/medicos.module';
import { PacientesModule } from '../pacientes/pacientes.module';
import { ConsultasController } from './consultas.controller';
import { ConsultasService } from './consultas.service';
@Module({ imports: [PacientesModule, MedicosModule], controllers: [ConsultasController], providers: [ConsultasService] }) export class ConsultasModule {}
