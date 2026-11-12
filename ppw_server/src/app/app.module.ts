import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../database/prisma.module';
import { RepositoriesModule } from '../infrastructure/repositories/repositories.module';
import { ConsultasModule } from '../modules/consultas.module';
import { MedicosModule } from '../modules/medicos.module';
import { PacientesModule } from '../modules/pacientes.module';
import { AppController } from '../presentation/controllers/app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RepositoriesModule,
    PacientesModule,
    MedicosModule,
    ConsultasModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
