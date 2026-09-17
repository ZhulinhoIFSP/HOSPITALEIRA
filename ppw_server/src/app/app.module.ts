import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConsultasModule } from '../consultas/consultas.module';
import { PacientesModule } from '../pacientes/pacientes.module';
import { MedicosModule } from '../medicos/medicos.module';

@Module({ imports: [ConsultasModule, PacientesModule, MedicosModule], controllers: [AppController] })
export class AppModule {}
