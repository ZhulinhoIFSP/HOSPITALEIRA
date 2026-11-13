import { Global, Module } from '@nestjs/common';
import { CONSULTA_REPOSITORY } from '../../domain/repositories/consulta.repository.interface';
import { HISTORICO_CONSULTA_REPOSITORY } from '../../domain/repositories/historico-consulta.repository.interface';
import { MEDICO_REPOSITORY } from '../../domain/repositories/medico.repository.interface';
import { PACIENTE_REPOSITORY } from '../../domain/repositories/paciente.repository.interface';
import { TRANSACTION_MANAGER } from '../../domain/transaction/transaction-manager.interface';
import { InMemoryTransactionManager } from '../transaction/in-memory-transaction-manager';
import { PrismaTransactionManager } from '../transaction/prisma-transaction-manager';
import { InMemoryConsultaRepository } from './in-memory-consulta.repository';
import { InMemoryHistoricoConsultaRepository } from './in-memory-historico-consulta.repository';
import { InMemoryMedicoRepository } from './in-memory-medico.repository';
import { InMemoryPacienteRepository } from './in-memory-paciente.repository';
import { PrismaConsultaRepository } from './prisma/prisma-consulta.repository';
import { PrismaHistoricoConsultaRepository } from './prisma/prisma-historico-consulta.repository';
import { PrismaMedicoRepository } from './prisma/prisma-medico.repository';
import { PrismaPacienteRepository } from './prisma/prisma-paciente.repository';

const usePrisma = process.env.USE_PRISMA === 'true';

@Global()
@Module({
  providers: [
    // Repositórios em memória
    InMemoryConsultaRepository,
    InMemoryHistoricoConsultaRepository,
    InMemoryMedicoRepository,
    InMemoryPacienteRepository,
    InMemoryTransactionManager,

    // Repositórios Prisma PostgreSQL
    PrismaConsultaRepository,
    PrismaHistoricoConsultaRepository,
    PrismaMedicoRepository,
    PrismaPacienteRepository,
    PrismaTransactionManager,

    // Associação dinâmica por Token de Injeção de Dependência
    {
      provide: PACIENTE_REPOSITORY,
      useClass: usePrisma ? PrismaPacienteRepository : InMemoryPacienteRepository,
    },
    {
      provide: MEDICO_REPOSITORY,
      useClass: usePrisma ? PrismaMedicoRepository : InMemoryMedicoRepository,
    },
    {
      provide: CONSULTA_REPOSITORY,
      useClass: usePrisma ? PrismaConsultaRepository : InMemoryConsultaRepository,
    },
    {
      provide: HISTORICO_CONSULTA_REPOSITORY,
      useClass: usePrisma ? PrismaHistoricoConsultaRepository : InMemoryHistoricoConsultaRepository,
    },
    {
      provide: TRANSACTION_MANAGER,
      useClass: usePrisma ? PrismaTransactionManager : InMemoryTransactionManager,
    },
  ],
  exports: [
    PACIENTE_REPOSITORY,
    MEDICO_REPOSITORY,
    CONSULTA_REPOSITORY,
    HISTORICO_CONSULTA_REPOSITORY,
    TRANSACTION_MANAGER,
    PrismaConsultaRepository,
    PrismaHistoricoConsultaRepository,
    PrismaMedicoRepository,
    PrismaPacienteRepository,
    PrismaTransactionManager,
  ],
})
export class RepositoriesModule {}
