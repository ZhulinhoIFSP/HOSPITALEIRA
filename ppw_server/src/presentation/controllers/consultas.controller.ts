import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateConsultaUseCase } from '../../application/use-cases/consultas/create-consulta.use-case';
import { DeleteConsultaUseCase } from '../../application/use-cases/consultas/delete-consulta.use-case';
import { ExecutarAcaoConsultaUseCase } from '../../application/use-cases/consultas/executar-acao-consulta.use-case';
import { GetConsultaByIdUseCase } from '../../application/use-cases/consultas/get-consulta-by-id.use-case';
import { ListConsultasUseCase } from '../../application/use-cases/consultas/list-consultas.use-case';
import { SyncConsultasUseCase } from '../../application/use-cases/consultas/sync-consultas.use-case';
import { UpdateConsultaUseCase } from '../../application/use-cases/consultas/update-consulta.use-case';
import { Consulta } from '../../domain/entities/consulta.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { ConsultaStateMachine } from '../../domain/fsm/consulta-state-machine';
import { CreateConsultaDto } from '../dtos/create-consulta.dto';
import {
  BaseAcaoDto,
  CancelarAcaoDto,
  ConcluirAcaoDto,
  ExecutarAcaoConsultaDto,
} from '../dtos/executar-acao-consulta.dto';
import { UpdateConsultaDto } from '../dtos/update-consulta.dto';

@Controller('consultas')
export class ConsultasController {
  constructor(
    private readonly listConsultasUseCase: ListConsultasUseCase,
    private readonly getConsultaByIdUseCase: GetConsultaByIdUseCase,
    private readonly createConsultaUseCase: CreateConsultaUseCase,
    private readonly updateConsultaUseCase: UpdateConsultaUseCase,
    private readonly deleteConsultaUseCase: DeleteConsultaUseCase,
    private readonly syncConsultasUseCase: SyncConsultasUseCase,
    private readonly executarAcaoConsultaUseCase: ExecutarAcaoConsultaUseCase,
  ) {}

  @Get()
  async findAll() {
    return this.listConsultasUseCase.execute();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.getConsultaByIdUseCase.execute(id);
  }

  @Get(':id/acoes-disponiveis')
  async findAcoesDisponiveis(
    @Param('id', ParseIntPipe) id: number,
    @Query('role') role?: UserRole,
  ) {
    const consulta = await this.getConsultaByIdUseCase.execute(id);
    const acoes = ConsultaStateMachine.getAcoesDisponiveis(consulta.status, role);
    return {
      consultaId: id,
      statusAtual: consulta.status,
      roleConsultada: role ?? 'TODOS',
      acoesDisponiveis: acoes,
    };
  }

  @Post()
  async create(@Body() dto: CreateConsultaDto) {
    return this.createConsultaUseCase.execute(dto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConsultaDto,
  ) {
    return this.updateConsultaUseCase.execute(id, dto);
  }

  @Put(':id')
  async replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConsultaDto,
  ) {
    return this.updateConsultaUseCase.execute(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.deleteConsultaUseCase.execute(id);
    return { success: deleted, message: `Consulta #${id} excluída com sucesso.` };
  }

  @Put('sincronizar')
  async sincronizar(@Body() consultas: Consulta[]) {
    return this.syncConsultasUseCase.execute(consultas);
  }

  // ==========================================
  // ROTAS DA MÁQUINA DE ESTADOS FINITA (FSM)
  // Transições orientadas a eventos/ações específicas
  // ==========================================

  @Post(':id/acoes')
  async executarAcao(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ExecutarAcaoConsultaDto,
  ) {
    return this.executarAcaoConsultaUseCase.execute(id, {
      acao: dto.acao,
      actorId: dto.actorId,
      actorRole: dto.actorRole,
      payload: dto.payload,
    });
  }

  @Post(':id/confirmar')
  async confirmar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BaseAcaoDto,
  ) {
    return this.executarAcaoConsultaUseCase.execute(id, {
      acao: 'CONFIRMAR',
      actorId: dto.actorId,
      actorRole: dto.actorRole,
    });
  }

  @Post(':id/check-in')
  async checkIn(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BaseAcaoDto,
  ) {
    return this.executarAcaoConsultaUseCase.execute(id, {
      acao: 'CHECK_IN',
      actorId: dto.actorId,
      actorRole: dto.actorRole,
    });
  }

  @Post(':id/iniciar-atendimento')
  async iniciarAtendimento(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BaseAcaoDto,
  ) {
    return this.executarAcaoConsultaUseCase.execute(id, {
      acao: 'INICIAR_ATENDIMENTO',
      actorId: dto.actorId,
      actorRole: dto.actorRole,
    });
  }

  @Post(':id/concluir')
  async concluir(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ConcluirAcaoDto,
  ) {
    return this.executarAcaoConsultaUseCase.execute(id, {
      acao: 'CONCLUIR',
      actorId: dto.actorId,
      actorRole: dto.actorRole,
      payload: {
        prontuario: dto.prontuario,
        diagnostico: dto.diagnostico,
        prescricao: dto.prescricao,
      },
    });
  }

  @Post(':id/cancelar')
  async cancelar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelarAcaoDto,
  ) {
    return this.executarAcaoConsultaUseCase.execute(id, {
      acao: 'CANCELAR',
      actorId: dto.actorId,
      actorRole: dto.actorRole,
      payload: {
        justificativa: dto.justificativa,
      },
    });
  }
}
