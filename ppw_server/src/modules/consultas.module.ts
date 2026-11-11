import { Module } from '@nestjs/common';
import { CreateConsultaUseCase } from '../application/use-cases/consultas/create-consulta.use-case';
import { DeleteConsultaUseCase } from '../application/use-cases/consultas/delete-consulta.use-case';
import { ExecutarAcaoConsultaUseCase } from '../application/use-cases/consultas/executar-acao-consulta.use-case';
import { GetConsultaByIdUseCase } from '../application/use-cases/consultas/get-consulta-by-id.use-case';
import { ListConsultasUseCase } from '../application/use-cases/consultas/list-consultas.use-case';
import { SyncConsultasUseCase } from '../application/use-cases/consultas/sync-consultas.use-case';
import { UpdateConsultaUseCase } from '../application/use-cases/consultas/update-consulta.use-case';
import { ConsultasController } from '../presentation/controllers/consultas.controller';

@Module({
  controllers: [ConsultasController],
  providers: [
    ListConsultasUseCase,
    GetConsultaByIdUseCase,
    CreateConsultaUseCase,
    UpdateConsultaUseCase,
    DeleteConsultaUseCase,
    SyncConsultasUseCase,
    ExecutarAcaoConsultaUseCase,
  ],
  exports: [
    ListConsultasUseCase,
    GetConsultaByIdUseCase,
    CreateConsultaUseCase,
    UpdateConsultaUseCase,
    DeleteConsultaUseCase,
    SyncConsultasUseCase,
    ExecutarAcaoConsultaUseCase,
  ],
})
export class ConsultasModule {}
