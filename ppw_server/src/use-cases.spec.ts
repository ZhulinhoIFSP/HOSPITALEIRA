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
import { BusinessRuleError, ForbiddenError } from './core/errors/domain.error';
import { ConsultaStateMachine } from './domain/fsm/consulta-state-machine';
import { RbacGuard } from './domain/fsm/guards/rbac.guard';
import { ProntuarioObrigatorioGuard } from './domain/fsm/guards/prontuario-obrigatorio.guard';
import { JustificativaCancelamentoGuard } from './domain/fsm/guards/justificativa-cancelamento.guard';
import { Consulta } from './domain/entities/consulta.entity';

describe('Clean Architecture & FSM (Hospital - Item 1.A)', () => {
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
      // 1. Cria uma nova consulta (status inicial: AGENDADA)
      const nova = await createConsulta.execute({
        pacienteId: 2,
        medicoId: 2,
        data: '2026-12-01',
        horario: '10:00',
      });
      expect(nova.status).toBe('AGENDADA');

      // 2. Ação confirmar() pelo PACIENTE
      const confirmada = await executarAcaoConsulta.execute(nova.id, {
        acao: 'CONFIRMAR',
        actorId: 2,
        actorRole: 'PACIENTE',
      });
      expect(confirmada.status).toBe('CONFIRMADA');

      // 3. Ação checkIn() pela RECEPCIONISTA
      const emCheckIn = await executarAcaoConsulta.execute(nova.id, {
        acao: 'CHECK_IN',
        actorId: 99,
        actorRole: 'RECEPCIONISTA',
      });
      expect(emCheckIn.status).toBe('CHECK_IN');

      // 4. Ação iniciarAtendimento() pelo MÉDICO
      const emAtendimento = await executarAcaoConsulta.execute(nova.id, {
        acao: 'INICIAR_ATENDIMENTO',
        actorId: 2,
        actorRole: 'MEDICO',
      });
      expect(emAtendimento.status).toBe('EM_ATENDIMENTO');

      // 5. Ação concluir() pelo MÉDICO com laudo/prontuário e diagnóstico
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
        // Consulta #3 está em CHECK_IN
        // Primeiro inicia atendimento com médico
        const emAtendimento = await executarAcaoConsulta.execute(3, {
          acao: 'INICIAR_ATENDIMENTO',
          actorId: 3,
          actorRole: 'MEDICO',
        });
        expect(emAtendimento.status).toBe('EM_ATENDIMENTO');

        // Recepcionista tenta concluir
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
        // Cria consulta e avança até EM_ATENDIMENTO
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

        // Tentativa de concluir SEM prontuário
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

      it('deve permitir cancelamento válido com justificativa', async () => {
        const cancelada = await executarAcaoConsulta.execute(6, {
          acao: 'CANCELAR',
          actorId: 1,
          actorRole: 'RECEPCIONISTA',
          payload: {
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
});
