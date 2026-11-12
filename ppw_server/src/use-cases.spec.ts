import { Test } from '@nestjs/testing';
import { AppModule } from './app/app.module';
import { ListPacientesUseCase } from './application/use-cases/pacientes/list-pacientes.use-case';
import { CreatePacienteUseCase } from './application/use-cases/pacientes/create-paciente.use-case';
import { UpdatePacienteUseCase } from './application/use-cases/pacientes/update-paciente.use-case';
import { DeletePacienteUseCase } from './application/use-cases/pacientes/delete-paciente.use-case';
import { ListMedicosUseCase } from './application/use-cases/medicos/list-medicos.use-case';
import { CreateMedicoUseCase } from './application/use-cases/medicos/create-medico.use-case';
import { UpdateMedicoUseCase } from './application/use-cases/medicos/update-medico.use-case';
import { DeleteMedicoUseCase } from './application/use-cases/medicos/delete-medico.use-case';
import { ListConsultasUseCase } from './application/use-cases/consultas/list-consultas.use-case';
import { CreateConsultaUseCase } from './application/use-cases/consultas/create-consulta.use-case';
import { UpdateConsultaUseCase } from './application/use-cases/consultas/update-consulta.use-case';
import { DeleteConsultaUseCase } from './application/use-cases/consultas/delete-consulta.use-case';
import { ExecutarAcaoConsultaUseCase } from './application/use-cases/consultas/executar-acao-consulta.use-case';
<<<<<<< HEAD
import { ProcessarSlaConsultasUseCase } from './application/use-cases/consultas/processar-sla-consultas.use-case';
import { GetHistoricoConsultaUseCase } from './application/use-cases/consultas/get-historico-consulta.use-case';
import { BusinessRuleError, ConflictError, ForbiddenError } from './core/errors/domain.error';
import { AsyncLockService } from './domain/concurrency/async-lock.service';
=======
import { BusinessRuleError, ForbiddenError } from './core/errors/domain.error';
>>>>>>> 4eaf2c7f60f6385bd2869ceb8c2bc137f6b9b9cf
import { ConsultaStateMachine } from './domain/fsm/consulta-state-machine';
import { RbacGuard } from './domain/fsm/guards/rbac.guard';
import { ProntuarioObrigatorioGuard } from './domain/fsm/guards/prontuario-obrigatorio.guard';
import { JustificativaCancelamentoGuard } from './domain/fsm/guards/justificativa-cancelamento.guard';
<<<<<<< HEAD
import { ConfirmacaoSlaPolicy } from './domain/sla/policies/confirmacao-sla.policy';
import { TempoEsperaCheckInSlaPolicy } from './domain/sla/policies/tempo-espera-sla.policy';
import { SlaManagerService } from './domain/sla/sla-manager.service';
import { LiberarAgendaRollbackHandler } from './domain/rollback/handlers/liberar-agenda.handler';
import { LiberarSalaRollbackHandler } from './domain/rollback/handlers/liberar-sala.handler';
import { RemoverFilaEsperaRollbackHandler } from './domain/rollback/handlers/remover-fila-espera.handler';
import { RollbackManagerService } from './domain/rollback/rollback-manager.service';
import { Consulta } from './domain/entities/consulta.entity';
import {
  HISTORICO_CONSULTA_REPOSITORY,
  IHistoricoConsultaRepository,
} from './domain/repositories/historico-consulta.repository.interface';
import {
  ITransactionManager,
  TRANSACTION_MANAGER,
} from './domain/transaction/transaction-manager.interface';
import {
  CONSULTA_REPOSITORY,
  IConsultaRepository,
} from './domain/repositories/consulta.repository.interface';

describe('Clean Architecture, FSM, Concorrência, SLA, Rollback e Audit Log (Hospital - 1.A, 1.B & 1.C)', () => {
=======
import { Consulta } from './domain/entities/consulta.entity';

describe('Clean Architecture & FSM (Hospital - Item 1.A)', () => {
>>>>>>> 4eaf2c7f60f6385bd2869ceb8c2bc137f6b9b9cf
  let listPacientes: ListPacientesUseCase;
  let createPaciente: CreatePacienteUseCase;
  let updatePaciente: UpdatePacienteUseCase;
  let deletePaciente: DeletePacienteUseCase;

  let listMedicos: ListMedicosUseCase;
  let createMedico: CreateMedicoUseCase;
  let updateMedico: UpdateMedicoUseCase;
  let deleteMedico: DeleteMedicoUseCase;

  let listConsultas: ListConsultasUseCase;
  let createConsulta: CreateConsultaUseCase;
  let updateConsulta: UpdateConsultaUseCase;
  let deleteConsulta: DeleteConsultaUseCase;
  let executarAcaoConsulta: ExecutarAcaoConsultaUseCase;
<<<<<<< HEAD
  let processarSlaConsultas: ProcessarSlaConsultasUseCase;
  let getHistoricoConsulta: GetHistoricoConsultaUseCase;

  let asyncLockService: AsyncLockService;
  let slaManagerService: SlaManagerService;
  let rollbackManagerService: RollbackManagerService;
  let historicoRepository: IHistoricoConsultaRepository;
  let transactionManager: ITransactionManager;
  let consultaRepository: IConsultaRepository;
=======
>>>>>>> 4eaf2c7f60f6385bd2869ceb8c2bc137f6b9b9cf

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    listPacientes = module.get(ListPacientesUseCase);
    createPaciente = module.get(CreatePacienteUseCase);
    updatePaciente = module.get(UpdatePacienteUseCase);
    deletePaciente = module.get(DeletePacienteUseCase);

    listMedicos = module.get(ListMedicosUseCase);
    createMedico = module.get(CreateMedicoUseCase);
    updateMedico = module.get(UpdateMedicoUseCase);
    deleteMedico = module.get(DeleteMedicoUseCase);

    listConsultas = module.get(ListConsultasUseCase);
    createConsulta = module.get(CreateConsultaUseCase);
    updateConsulta = module.get(UpdateConsultaUseCase);
    deleteConsulta = module.get(DeleteConsultaUseCase);
    executarAcaoConsulta = module.get(ExecutarAcaoConsultaUseCase);
<<<<<<< HEAD
    processarSlaConsultas = module.get(ProcessarSlaConsultasUseCase);
    getHistoricoConsulta = module.get(GetHistoricoConsultaUseCase);

    asyncLockService = module.get(AsyncLockService);
    slaManagerService = module.get(SlaManagerService);
    rollbackManagerService = module.get(RollbackManagerService);
    historicoRepository = module.get(HISTORICO_CONSULTA_REPOSITORY);
    transactionManager = module.get(TRANSACTION_MANAGER);
    consultaRepository = module.get(CONSULTA_REPOSITORY);
=======
>>>>>>> 4eaf2c7f60f6385bd2869ceb8c2bc137f6b9b9cf
  });

  describe('Pacientes CRUD', () => {
    it('deve listar pacientes', async () => {
      const pacientes = await listPacientes.execute();
      expect(pacientes.length).toBeGreaterThan(0);
    });

    it('deve criar, atualizar e excluir paciente', async () => {
      const novo = await createPaciente.execute({
        nome: 'Carlos Drummond',
        email: 'carlos@teste.com',
      });
      expect(novo.id).toBeDefined();
      expect(novo.nome).toBe('Carlos Drummond');

      const atualizado = await updatePaciente.execute(novo.id, {
        nome: 'Carlos Drummond de Andrade',
      });
      expect(atualizado.nome).toBe('Carlos Drummond de Andrade');

      const excluido = await deletePaciente.execute(novo.id);
      expect(excluido).toBe(true);
    });
  });

  describe('Medicos CRUD', () => {
    it('deve listar médicos', async () => {
      const medicos = await listMedicos.execute();
      expect(medicos.length).toBeGreaterThan(0);
    });

    it('deve criar, atualizar e excluir médico', async () => {
      const novo = await createMedico.execute({
        nome: 'Dra. Roberta Freitas',
        especialidade: 'Ortopedia',
      });
      expect(novo.id).toBeDefined();
      expect(novo.especialidade).toBe('Ortopedia');

      const atualizado = await updateMedico.execute(novo.id, {
        especialidade: 'Ortopedia e Traumatologia',
      });
      expect(atualizado.especialidade).toBe('Ortopedia e Traumatologia');

      const excluido = await deleteMedico.execute(novo.id);
      expect(excluido).toBe(true);
    });
  });

  describe('Consultas CRUD e Proibição de Alteração Arbitrária de Status', () => {
    it('deve listar consultas', async () => {
      const consultas = await listConsultas.execute();
      expect(consultas.length).toBeGreaterThan(0);
    });

    it('deve criar uma nova consulta agendada', async () => {
      const consulta = await createConsulta.execute({
        pacienteId: 1,
        medicoId: 4,
        data: '2026-10-01',
        horario: '09:00',
      });
      expect(consulta.status).toBe('AGENDADA');
    });

    it('deve rejeitar horário ocupado para o mesmo médico', async () => {
      await expect(
        createConsulta.execute({
          pacienteId: 3,
          medicoId: 1,
          data: '2026-09-20',
          horario: '08:00',
        }),
      ).rejects.toThrow('O médico já possui uma consulta agendada para esse horário.');
    });

    it('PROIBIÇÃO DE ALTERAÇÃO ARBITRÁRIA: deve rejeitar alteração de status via formulário direto / update', async () => {
      await expect(
        updateConsulta.execute(1, {
          status: 'CONFIRMADA',
        }),
      ).rejects.toThrow(
        'Alteração arbitrária de status via formulário direto é estritamente proibida',
      );
    });

    it('deve permitir atualizar dados cadastrais (ex: data/horário) de consulta ativa', async () => {
      const atualizada = await updateConsulta.execute(1, {
        horario: '08:30',
      });
      expect(atualizada.horario).toBe('08:30');
    });

    it('deve excluir uma consulta', async () => {
      const consulta = await createConsulta.execute({
        pacienteId: 2,
        medicoId: 3,
        data: '2026-11-15',
        horario: '16:00',
      });
      const removida = await deleteConsulta.execute(consulta.id);
      expect(removida).toBe(true);
    });
  });

  describe('1.A - Máquina de Estados Finita e Transições Restritas', () => {
    it('deve realizar o fluxo de transição completo por ações explícitas (confirmar -> check-in -> iniciar atendimento -> concluir)', async () => {
<<<<<<< HEAD
=======
      // 1. Cria uma nova consulta (status inicial: AGENDADA)
>>>>>>> 4eaf2c7f60f6385bd2869ceb8c2bc137f6b9b9cf
      const nova = await createConsulta.execute({
        pacienteId: 2,
        medicoId: 2,
        data: '2026-12-01',
        horario: '10:00',
      });
      expect(nova.status).toBe('AGENDADA');

<<<<<<< HEAD
=======
      // 2. Ação confirmar() pelo PACIENTE
>>>>>>> 4eaf2c7f60f6385bd2869ceb8c2bc137f6b9b9cf
      const confirmada = await executarAcaoConsulta.execute(nova.id, {
        acao: 'CONFIRMAR',
        actorId: 2,
        actorRole: 'PACIENTE',
      });
      expect(confirmada.status).toBe('CONFIRMADA');

<<<<<<< HEAD
=======
      // 3. Ação checkIn() pela RECEPCIONISTA
>>>>>>> 4eaf2c7f60f6385bd2869ceb8c2bc137f6b9b9cf
      const emCheckIn = await executarAcaoConsulta.execute(nova.id, {
        acao: 'CHECK_IN',
        actorId: 99,
        actorRole: 'RECEPCIONISTA',
      });
      expect(emCheckIn.status).toBe('CHECK_IN');
<<<<<<< HEAD
      expect(emCheckIn.dataCheckIn).toBeDefined();

=======

      // 4. Ação iniciarAtendimento() pelo MÉDICO
>>>>>>> 4eaf2c7f60f6385bd2869ceb8c2bc137f6b9b9cf
      const emAtendimento = await executarAcaoConsulta.execute(nova.id, {
        acao: 'INICIAR_ATENDIMENTO',
        actorId: 2,
        actorRole: 'MEDICO',
      });
      expect(emAtendimento.status).toBe('EM_ATENDIMENTO');

<<<<<<< HEAD
=======
      // 5. Ação concluir() pelo MÉDICO com laudo/prontuário e diagnóstico
>>>>>>> 4eaf2c7f60f6385bd2869ceb8c2bc137f6b9b9cf
      const realizada = await executarAcaoConsulta.execute(nova.id, {
        acao: 'CONCLUIR',
        actorId: 2,
        actorRole: 'MEDICO',
        payload: {
          prontuario: 'Paciente avaliado clinicamente. Ausência de sintomas agudos.',
          diagnostico: 'Exame de rotina dentro dos parâmetros normais.',
          prescricao: 'Manter hábitos saudáveis e retorno em 6 meses.',
        },
      });
      expect(realizada.status).toBe('REALIZADA');
      expect(realizada.prontuario).toContain('Paciente avaliado clinicamente');
      expect(realizada.diagnostico).toContain('Exame de rotina');
    });

    it('deve rejeitar transições ilegais de estado na FSM (ex: tentar concluir a partir de AGENDADA)', async () => {
      const nova = await createConsulta.execute({
        pacienteId: 1,
        medicoId: 3,
        data: '2026-12-02',
        horario: '11:00',
      });

      await expect(
        executarAcaoConsulta.execute(nova.id, {
          acao: 'CONCLUIR',
          actorId: 3,
          actorRole: 'MEDICO',
          payload: {
            prontuario: 'Laudo válido',
            diagnostico: 'Diagnóstico válido',
          },
        }),
      ).rejects.toThrow('Transição inválida');
    });

    describe('Matriz de Permissões (RBAC) por Estado e Ação', () => {
      it('deve impedir que PACIENTE execute check-in ou inicie atendimento', async () => {
        await expect(
          executarAcaoConsulta.execute(2, {
            acao: 'CHECK_IN',
            actorId: 2,
            actorRole: 'PACIENTE',
          }),
        ).rejects.toThrow(ForbiddenError);
      });

      it('deve impedir que RECEPCIONISTA conclua a consulta médica', async () => {
<<<<<<< HEAD
=======
        // Consulta #3 está em CHECK_IN
        // Primeiro inicia atendimento com médico
>>>>>>> 4eaf2c7f60f6385bd2869ceb8c2bc137f6b9b9cf
        const emAtendimento = await executarAcaoConsulta.execute(3, {
          acao: 'INICIAR_ATENDIMENTO',
          actorId: 3,
          actorRole: 'MEDICO',
        });
        expect(emAtendimento.status).toBe('EM_ATENDIMENTO');

<<<<<<< HEAD
=======
        // Recepcionista tenta concluir
>>>>>>> 4eaf2c7f60f6385bd2869ceb8c2bc137f6b9b9cf
        await expect(
          executarAcaoConsulta.execute(3, {
            acao: 'CONCLUIR',
            actorId: 99,
            actorRole: 'RECEPCIONISTA',
            payload: {
              prontuario: 'Prontuário preenchido',
              diagnostico: 'Diagnóstico preenchido',
            },
          }),
        ).rejects.toThrow(ForbiddenError);
      });

      it('deve impedir que MÉDICO faça check-in (papel exclusivo de recepção/admin)', async () => {
        await expect(
          executarAcaoConsulta.execute(2, {
            acao: 'CHECK_IN',
            actorId: 2,
            actorRole: 'MEDICO',
          }),
        ).rejects.toThrow(ForbiddenError);
      });
    });

    describe('Guardas de Transição (Transition Guards)', () => {
      it('GUARDA DE LAUDO/PRONTUÁRIO: deve impedir conclusão se laudo/prontuário não estiver preenchido', async () => {
<<<<<<< HEAD
=======
        // Cria consulta e avança até EM_ATENDIMENTO
>>>>>>> 4eaf2c7f60f6385bd2869ceb8c2bc137f6b9b9cf
        const c = await createConsulta.execute({
          pacienteId: 1,
          medicoId: 1,
          data: '2026-12-05',
          horario: '14:00',
        });
        await executarAcaoConsulta.execute(c.id, {
          acao: 'CONFIRMAR',
          actorId: 1,
          actorRole: 'PACIENTE',
        });
        await executarAcaoConsulta.execute(c.id, {
          acao: 'CHECK_IN',
          actorId: 50,
          actorRole: 'RECEPCIONISTA',
        });
        await executarAcaoConsulta.execute(c.id, {
          acao: 'INICIAR_ATENDIMENTO',
          actorId: 1,
          actorRole: 'MEDICO',
        });

<<<<<<< HEAD
=======
        // Tentativa de concluir SEM prontuário
>>>>>>> 4eaf2c7f60f6385bd2869ceb8c2bc137f6b9b9cf
        await expect(
          executarAcaoConsulta.execute(c.id, {
            acao: 'CONCLUIR',
            actorId: 1,
            actorRole: 'MEDICO',
            payload: {
              prontuario: '',
              diagnostico: 'Gripe sazonal',
            },
          }),
        ).rejects.toThrow(
          'Guarda de Transição violada: É obrigatório o preenchimento detalhado do laudo/prontuário médico',
        );
<<<<<<< HEAD
=======

        // Tentativa de concluir SEM diagnóstico
        await expect(
          executarAcaoConsulta.execute(c.id, {
            acao: 'CONCLUIR',
            actorId: 1,
            actorRole: 'MEDICO',
            payload: {
              prontuario: 'Exame clínico geral realizado.',
              diagnostico: '',
            },
          }),
        ).rejects.toThrow(
          'Guarda de Transição violada: É obrigatório informar o diagnóstico clínico',
        );
>>>>>>> 4eaf2c7f60f6385bd2869ceb8c2bc137f6b9b9cf
      });

      it('GUARDA DE JUSTIFICATIVA: deve impedir cancelamento sem justificativa formal', async () => {
        await expect(
          executarAcaoConsulta.execute(6, {
            acao: 'CANCELAR',
            actorId: 1,
            actorRole: 'RECEPCIONISTA',
            payload: {
              justificativa: '  ',
            },
          }),
        ).rejects.toThrow(
          'Guarda de Transição violada: O cancelamento da consulta exige uma justificativa formal',
        );
      });
<<<<<<< HEAD
    });
  });

  describe('1.B - Regras de Negócio e Conflitos Assíncronos', () => {
    describe('Concorrência e Locks (Async Mutex & OCC)', () => {
      it('LOCK DE RECURSO: deve tratar agendamento concorrente do mesmo médico/horário garantindo exclusão mútua', async () => {
        const agendamento1 = createConsulta.execute({
          pacienteId: 1,
          medicoId: 3,
          data: '2026-12-25',
          horario: '15:00',
        });

        const agendamento2 = createConsulta.execute({
          pacienteId: 2,
          medicoId: 3,
          data: '2026-12-25',
          horario: '15:00',
        });

        const resultados = await Promise.allSettled([agendamento1, agendamento2]);
        const sucessos = resultados.filter((r) => r.status === 'fulfilled');
        const rejeicoes = resultados.filter((r) => r.status === 'rejected');

        expect(sucessos.length).toBe(1);
        expect(rejeicoes.length).toBe(1);
        if (rejeicoes[0].status === 'rejected') {
          expect(rejeicoes[0].reason.message).toContain(
            'O médico já possui uma consulta agendada para esse horário.',
          );
        }
      });

      it('CONTROLE DE CONCORRÊNCIA OTIMISTA (OCC): deve barrar atualização se a versão enviada estiver defasada', async () => {
        const consultaInicial = await listConsultas.execute();
        const c1 = consultaInicial.find((c) => c.id === 1)!;
        expect(c1.version).toBe(1);

        const atualizadaA = await updateConsulta.execute(1, {
          horario: '08:45',
          version: 1,
        });
        expect(atualizadaA.version).toBe(2);

        await expect(
          updateConsulta.execute(1, {
            horario: '08:50',
            version: 1,
          }),
        ).rejects.toThrow(ConflictError);
      });

      it('CONTROLE DE CONCORRÊNCIA OTIMISTA (OCC): deve barrar transição de ação se a versão estiver defasada', async () => {
        await expect(
          executarAcaoConsulta.execute(2, {
            acao: 'CHECK_IN',
            actorId: 1,
            actorRole: 'RECEPCIONISTA',
            version: 99,
          }),
        ).rejects.toThrow('Conflito de concorrência detectado (OCC)');
      });
    });

    describe('SLA e Temporalidade (Expiração e Escalonamento)', () => {
      it('SLA DE CONFIRMAÇÃO: deve expirar automaticamente consulta AGENDADA cujo prazo venceu', () => {
        const policy = new ConfirmacaoSlaPolicy();
        const consultaExpirada = new Consulta(
          10,
          1,
          1,
          '2026-09-01',
          '08:00',
          'AGENDADA',
          '2026-08-20T10:00:00Z',
          '2026-08-20T10:00:00Z',
          undefined,
          undefined,
          undefined,
          undefined,
          1,
          101,
          undefined,
          '2026-08-31T08:00:00Z',
        );

        const agora = new Date('2026-09-01T07:00:00Z');
        const resultado = policy.avaliar(consultaExpirada, agora);

        expect(resultado.violou).toBe(true);
        expect(resultado.acao).toBe('EXPIRAR');

        const patch = policy.aplicar(consultaExpirada, resultado);
        expect(patch.status).toBe('CANCELADA');
        expect(patch.motivoCancelamento).toContain('prazo de confirmação expirado');
      });

      it('SLA DE TEMPO DE ESPERA EM RECEPÇÃO: deve escalonar para URGENTE se paciente aguardar mais de 30 min em CHECK_IN', () => {
        const policy = new TempoEsperaCheckInSlaPolicy(30);
        const consultaEmEspera = new Consulta(
          11,
          1,
          1,
          '2026-10-10',
          '10:00',
          'CHECK_IN',
          '2026-10-10T09:00:00Z',
          '2026-10-10T09:00:00Z',
          undefined,
          undefined,
          undefined,
          undefined,
          1,
          101,
          '2026-10-10T09:00:00Z',
        );

        const agora = new Date('2026-10-10T09:45:00Z');
        const resultado = policy.avaliar(consultaEmEspera, agora);

        expect(resultado.violou).toBe(true);
        expect(resultado.acao).toBe('ESCALONAR');

        const patch = policy.aplicar(consultaEmEspera, resultado);
        expect(patch.slaEstourado).toBe(true);
        expect(patch.prioridade).toBe('URGENTE');
        expect(patch.alertaEscalonamento).toContain('Paciente aguardando há 45 minutos');
      });

      it('PROCESSAMENTO EM LOTE DE SLA: deve varrer as consultas, expirar vencidas e escalonar atrasadas', async () => {
        const consultaVencida = await createConsulta.execute({
          pacienteId: 1,
          medicoId: 4,
          data: '2026-08-01',
          horario: '10:00',
          limiteConfirmacaoAt: '2026-07-31T10:00:00Z',
        });

        const relatorio = await processarSlaConsultas.execute(new Date('2026-08-01T09:00:00Z'));
        expect(relatorio.totalAvaliado).toBeGreaterThan(0);
        expect(relatorio.expiradas.some((e) => e.id === consultaVencida.id)).toBe(true);
      });
    });

    describe('Rollback / Cancelamento Parcial', () => {
      it('AÇÕES COMPENSATÓRIAS: deve executar rollback liberando agenda, sala e estornando fila ao cancelar consulta em CHECK_IN', async () => {
        const cancelada = await executarAcaoConsulta.execute(3, {
=======

      it('deve permitir cancelamento válido com justificativa', async () => {
        const cancelada = await executarAcaoConsulta.execute(6, {
>>>>>>> 4eaf2c7f60f6385bd2869ceb8c2bc137f6b9b9cf
          acao: 'CANCELAR',
          actorId: 1,
          actorRole: 'RECEPCIONISTA',
          payload: {
<<<<<<< HEAD
            justificativa: 'Paciente precisou ir embora devido a emergência familiar.',
          },
        });

        expect(cancelada.status).toBe('CANCELADA');
        expect(cancelada.compensacoesExecutadas).toBeDefined();
        expect(cancelada.compensacoesExecutadas?.length).toBe(3);

        expect(
          cancelada.compensacoesExecutadas?.some((c) => c.includes('SLOT_AGENDA_LIBERADO')),
        ).toBe(true);
        expect(
          cancelada.compensacoesExecutadas?.some((c) => c.includes('SALA_DESALOCADA')),
        ).toBe(true);
        expect(
          cancelada.compensacoesExecutadas?.some((c) => c.includes('FILA_ESPERA_ESTORNADA')),
        ).toBe(true);
      });

      it('DISPONIBILIDADE RESTAURADA: após o cancelamento com rollback, o mesmo horário deve ficar livre para novo agendamento', async () => {
        const c = await createConsulta.execute({
          pacienteId: 1,
          medicoId: 2,
          data: '2026-11-20',
          horario: '17:00',
        });

        await executarAcaoConsulta.execute(c.id, {
          acao: 'CANCELAR',
          actorId: 1,
          actorRole: 'RECEPCIONISTA',
          payload: {
            justificativa: 'Desistência formal do paciente.',
          },
        });

        const novoAgendamento = await createConsulta.execute({
          pacienteId: 3,
          medicoId: 2,
          data: '2026-11-20',
          horario: '17:00',
        });

        expect(novoAgendamento.id).toBeDefined();
        expect(novoAgendamento.status).toBe('AGENDADA');
      });
    });

    describe('Princípios SOLID em Concorrência, SLA e Rollback', () => {
      it('SRP: Cada política de SLA e handler de Rollback tem responsabilidade única', () => {
        const liberarAgenda = new LiberarAgendaRollbackHandler();
        const liberarSala = new LiberarSalaRollbackHandler();
        const removerFila = new RemoverFilaEsperaRollbackHandler();

        const consultaMock = new Consulta(
          50,
          1,
          1,
          '2026-10-10',
          '08:00',
          'CHECK_IN',
          '',
          '',
          undefined,
          undefined,
          undefined,
          undefined,
          1,
          101,
        );

        const resAgenda = liberarAgenda.executar({
          consulta: consultaMock,
          motivo: 'Teste',
          actorId: 1,
          actorRole: 'ADMIN',
        });
        const resSala = liberarSala.executar({
          consulta: consultaMock,
          motivo: 'Teste',
          actorId: 1,
          actorRole: 'ADMIN',
        });
        const resFila = removerFila.executar({
          consulta: consultaMock,
          motivo: 'Teste',
          actorId: 1,
          actorRole: 'ADMIN',
        });

        expect(resAgenda).toContain('SLOT_AGENDA_LIBERADO');
        expect(resSala).toContain('SALA_DESALOCADA');
        expect(resFila).toContain('FILA_ESPERA_ESTORNADA');
      });

      it('OCP & LSP: Permite adicionar novas políticas de SLA e handlers de Rollback sem alterar os orquestradores', async () => {
        rollbackManagerService.registrarHandler({
          nome: 'EstornoCoparticipacaoRollbackHandler',
          executar: (ctx) => `COPARTICIPACAO_ESTORNADA: R$ 50,00 devolvidos ao Paciente #${ctx.consulta.pacienteId}.`,
        });

        const consultaMock = new Consulta(
          99,
          5,
          2,
          '2026-10-10',
          '09:00',
          'CONFIRMADA',
          '',
          '',
        );
        const compensacoes = await rollbackManagerService.executarRollback({
          consulta: consultaMock,
          motivo: 'Cancelamento com reembolso',
          actorId: 1,
          actorRole: 'ADMIN',
        });

        expect(compensacoes.length).toBe(4);
        expect(compensacoes.some((c) => c.includes('COPARTICIPACAO_ESTORNADA'))).toBe(true);
      });
    });
  });

  describe('1.C - Rastreabilidade e Trilha de Auditoria (Audit Log & ACID Transactions)', () => {
    it('HISTÓRICO VINCULADO: toda alteração crítica de estado deve alimentar a tabela de auditoria', async () => {
      // 1. Cria nova consulta
      const c = await createConsulta.execute({
        pacienteId: 1,
        medicoId: 1,
        data: '2026-12-10',
        horario: '08:00',
      });

      // 2. Transiciona para CONFIRMADA
      await executarAcaoConsulta.execute(c.id, {
        acao: 'CONFIRMAR',
        actorId: 1,
        actorRole: 'PACIENTE',
      });

      // 3. Consulta histórico
      const historicos = await getHistoricoConsulta.execute(c.id);
      expect(historicos.length).toBeGreaterThan(0);

      const ultimoRegistro = historicos[0];
      expect(ultimoRegistro.consultaId).toBe(c.id);
      expect(ultimoRegistro.estadoAnterior).toBe('AGENDADA');
      expect(ultimoRegistro.novoEstado).toBe('CONFIRMADA');
      expect(ultimoRegistro.autorId).toBe(1);
      expect(ultimoRegistro.autorRole).toBe('PACIENTE');
      expect(ultimoRegistro.timestamp).toBeDefined();
      expect(ultimoRegistro.justificativa).toBeDefined();
    });

    it('HISTÓRICO CRONOLÓGICO: múltiplas ações devem acumular histórico sequencial sem sobrescrita', async () => {
      const c = await createConsulta.execute({
        pacienteId: 2,
        medicoId: 2,
        data: '2026-12-11',
        horario: '09:00',
      });

      // Confirmar
      await executarAcaoConsulta.execute(c.id, {
        acao: 'CONFIRMAR',
        actorId: 2,
        actorRole: 'PACIENTE',
      });

      // Check-in
      await executarAcaoConsulta.execute(c.id, {
        acao: 'CHECK_IN',
        actorId: 10,
        actorRole: 'RECEPCIONISTA',
      });

      // Iniciar Atendimento
      await executarAcaoConsulta.execute(c.id, {
        acao: 'INICIAR_ATENDIMENTO',
        actorId: 2,
        actorRole: 'MEDICO',
      });

      // Concluir
      await executarAcaoConsulta.execute(c.id, {
        acao: 'CONCLUIR',
        actorId: 2,
        actorRole: 'MEDICO',
        payload: {
          prontuario: 'Exame de rotina concluído.',
          diagnostico: 'Paciente apto e saudável.',
        },
      });

      const historicoCompleto = await getHistoricoConsulta.execute(c.id);
      // Devem existir 4 registros de histórico para as 4 ações executadas
      expect(historicoCompleto.length).toBe(4);

      // Verificação da ordem e dos estados
      const estados = historicoCompleto.map((h) => `${h.estadoAnterior}->${h.novoEstado}`);
      expect(estados).toContain('AGENDADA->CONFIRMADA');
      expect(estados).toContain('CONFIRMADA->CHECK_IN');
      expect(estados).toContain('CHECK_IN->EM_ATENDIMENTO');
      expect(estados).toContain('EM_ATENDIMENTO->REALIZADA');
    });

    it('TRANSAÇÃO ACID: se houver falha durante a gravação na transação, tudo deve sofrer rollback sem persistir dados parciais', async () => {
      const c = await createConsulta.execute({
        pacienteId: 3,
        medicoId: 1,
        data: '2026-12-12',
        horario: '10:00',
      });

      // Salva snapshot inicial
      const historicosAntes = await getHistoricoConsulta.execute(c.id);
      const totalHistoricosAntes = historicosAntes.length;

      // Força erro dentro de uma transação ACID simulando falha de banco no meio do processo
      await expect(
        transactionManager.executarEmTransacao(async () => {
          // Modifica a consulta
          await consultaRepository.update(c.id, { status: 'CANCELADA' });

          // Lança erro antes de consolidar a transação
          throw new Error('Falha simulada de I/O de banco de dados');
        }),
      ).rejects.toThrow('Falha simulada de I/O de banco de dados');

      // Verifica que a consulta sofreu ROLLBACK e voltou para AGENDADA
      const consultaAposErro = await consultaRepository.findById(c.id);
      expect(consultaAposErro?.status).toBe('AGENDADA');

      // Verifica que nenhum histórico corrompido foi gravado
      const historicosDepois = await getHistoricoConsulta.execute(c.id);
      expect(historicosDepois.length).toBe(totalHistoricosAntes);
    });

    it('AUDITORIA DE CANCELAMENTO COM COMPENSAÇÕES: o log de auditoria deve conter justificativa e o registro das compensações', async () => {
      const c = await createConsulta.execute({
        pacienteId: 1,
        medicoId: 3,
        data: '2026-12-15',
        horario: '14:00',
      });

      await executarAcaoConsulta.execute(c.id, {
        acao: 'CANCELAR',
        actorId: 99,
        actorRole: 'RECEPCIONISTA',
        payload: {
          justificativa: 'Paciente informou motivo de força maior para o cancelamento.',
        },
      });

      const historicos = await getHistoricoConsulta.execute(c.id);
      const logCancelamento = historicos.find((h) => h.novoEstado === 'CANCELADA');
      expect(logCancelamento).toBeDefined();
      expect(logCancelamento?.justificativa).toContain('motivo de força maior');
      expect(logCancelamento?.detalhes?.compensacoes).toBeDefined();
    });
  });
=======
            justificativa: 'Paciente informou imprevisto de trabalho e pediu cancelamento.',
          },
        });
        expect(cancelada.status).toBe('CANCELADA');
        expect(cancelada.motivoCancelamento).toContain('Paciente informou imprevisto');
      });

      it('GUARDA DE CANCELAMENTO POR PACIENTE: paciente não pode cancelar consulta após o check-in', async () => {
        // Consulta #3 está em CHECK_IN
        await expect(
          executarAcaoConsulta.execute(3, {
            acao: 'CANCELAR',
            actorId: 3,
            actorRole: 'PACIENTE',
            payload: {
              justificativa: 'Desisti de esperar na sala de espera.',
            },
          }),
        ).rejects.toThrow(
          'O paciente só pode cancelar consultas com status \'AGENDADA\' ou \'CONFIRMADA\'',
        );
      });
    });

    describe('Validação dos Princípios SOLID', () => {
      it('SRP: Cada guarda deve validar exclusivamente sua responsabilidade', () => {
        const rbacGuard = new RbacGuard(['MEDICO']);
        const mockContext = {
          consulta: new Consulta(1, 1, 1, '2026-09-20', '08:00', 'EM_ATENDIMENTO', '', ''),
          actorId: 10,
          actorRole: 'PACIENTE' as const,
        };

        expect(() => rbacGuard.validate('CONCLUIR', mockContext)).toThrow(ForbiddenError);

        const prontuarioGuard = new ProntuarioObrigatorioGuard();
        expect(() =>
          prontuarioGuard.validate('CONCLUIR', {
            ...mockContext,
            actorRole: 'MEDICO',
            payload: { prontuario: '' },
          }),
        ).toThrow(BusinessRuleError);

        const justificativaGuard = new JustificativaCancelamentoGuard();
        expect(() =>
          justificativaGuard.validate('CANCELAR', {
            ...mockContext,
            payload: { justificativa: 'ab' },
          }),
        ).toThrow(BusinessRuleError);
      });

      it('OCP & LSP: Máquina de estados deve expor regras e permitir consulta de ações disponíveis', () => {
        const regras = ConsultaStateMachine.getRegras();
        expect(regras.CONFIRMAR).toBeDefined();
        expect(regras.CHECK_IN).toBeDefined();
        expect(regras.INICIAR_ATENDIMENTO).toBeDefined();
        expect(regras.CONCLUIR).toBeDefined();
        expect(regras.CANCELAR).toBeDefined();

        const acoesParaPacienteEmAgendada = ConsultaStateMachine.getAcoesDisponiveis(
          'AGENDADA',
          'PACIENTE',
        );
        expect(acoesParaPacienteEmAgendada).toEqual(['CONFIRMAR', 'CANCELAR']);

        const acoesParaMedicoEmAtendimento = ConsultaStateMachine.getAcoesDisponiveis(
          'EM_ATENDIMENTO',
          'MEDICO',
        );
        expect(acoesParaMedicoEmAtendimento).toEqual(['CONCLUIR', 'CANCELAR']);
      });
    });
  });
>>>>>>> 4eaf2c7f60f6385bd2869ceb8c2bc137f6b9b9cf
});
