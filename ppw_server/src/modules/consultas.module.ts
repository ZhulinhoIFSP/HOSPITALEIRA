import { Module } from '@nestjs/common';
import { CreateConsultaUseCase } from '../application/use-cases/consultas/create-consulta.use-case';
import { DeleteConsultaUseCase } from '../application/use-cases/consultas/delete-consulta.use-case';
import { ExecutarAcaoConsultaUseCase } from '../application/use-cases/consultas/executar-acao-consulta.use-case';
import { GetConsultaByIdUseCase } from '../application/use-cases/consultas/get-consulta-by-id.use-case';
import { GetHistoricoConsultaUseCase } from '../application/use-cases/consultas/get-historico-consulta.use-case';
import { ListConsultasUseCase } from '../application/use-cases/consultas/list-consultas.use-case';
import { ProcessarSlaConsultasUseCase } from '../application/use-cases/consultas/processar-sla-consultas.use-case';
import { SyncConsultasUseCase } from '../application/use-cases/consultas/sync-consultas.use-case';
import { UpdateConsultaUseCase } from '../application/use-cases/consultas/update-consulta.use-case';
import { AsyncLockService } from '../domain/concurrency/async-lock.service';
import { RollbackManagerService } from '../domain/rollback/rollback-manager.service';
import { SlaManagerService } from '../domain/sla/sla-manager.service';
import { ConsultasController } from '../presentation/controllers/consultas.controller';

@Module({
  controllers: [ConsultasController],
  providers: [
    AsyncLockService,
    SlaManagerService,
    RollbackManagerService,
    ListConsultasUseCase,
    GetConsultaByIdUseCase,
    GetHistoricoConsultaUseCase,
    CreateConsultaUseCase,
    UpdateConsultaUseCase,
    DeleteConsultaUseCase,
    SyncConsultasUseCase,
    ExecutarAcaoConsultaUseCase,
<<<<<<< HEAD
    ProcessarSlaConsultasUseCase,
=======
>>>>>>> 4eaf2c7f60f6385bd2869ceb8c2bc137f6b9b9cf
  ],
  exports: [
    AsyncLockService,
    SlaManagerService,
    RollbackManagerService,
    ListConsultasUseCase,
    GetConsultaByIdUseCase,
    GetHistoricoConsultaUseCase,
    CreateConsultaUseCase,
    UpdateConsultaUseCase,
    DeleteConsultaUseCase,
    SyncConsultasUseCase,
    ExecutarAcaoConsultaUseCase,
<<<<<<< HEAD
    ProcessarSlaConsultasUseCase,
=======
>>>>>>> 4eaf2c7f60f6385bd2869ceb8c2bc137f6b9b9cf
  ],
})
export class ConsultasModule {}
