import { Global, Module } from '@nestjs/common';
import { CONSULTA_REPOSITORY } from '../../domain/repositories/consulta.repository.interface';
import { HISTORICO_CONSULTA_REPOSITORY } from '../../domain/repositories/historico-consulta.repository.interface';
import { MEDICO_REPOSITORY } from '../../domain/repositories/medico.repository.interface';
import { PACIENTE_REPOSITORY } from '../../domain/repositories/paciente.repository.interface';
import { TRANSACTION_MANAGER } from '../../domain/transaction/transaction-manager.interface';
import { InMemoryTransactionManager } from '../transaction/in-memory-transaction-manager';
import { InMemoryConsultaRepository } from './in-memory-consulta.repository';
import { InMemoryHistoricoConsultaRepository } from './in-memory-historico-consulta.repository';
import { InMemoryMedicoRepository } from './in-memory-medico.repository';
import { InMemoryPacienteRepository } from './in-memory-paciente.repository';

@Global()
@Module({
  providers: [
    InMemoryConsultaRepository,
    InMemoryHistoricoConsultaRepository,
    {
      provide: PACIENTE_REPOSITORY,
      useClass: InMemoryPacienteRepository,
    },
    {
      provide: MEDICO_REPOSITORY,
      useClass: InMemoryMedicoRepository,
    },
    {
      provide: CONSULTA_REPOSITORY,
      useExisting: InMemoryConsultaRepository,
    },
    {
      provide: HISTORICO_CONSULTA_REPOSITORY,
      useExisting: InMemoryHistoricoConsultaRepository,
    },
    {
      provide: TRANSACTION_MANAGER,
      useClass: InMemoryTransactionManager,
    },
  ],
  exports: [
    PACIENTE_REPOSITORY,
    MEDICO_REPOSITORY,
    CONSULTA_REPOSITORY,
    HISTORICO_CONSULTA_REPOSITORY,
    TRANSACTION_MANAGER,
  ],
})
export class RepositoriesModule {}
