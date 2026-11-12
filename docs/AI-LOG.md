 ### Em quase todo CRUD que vejo na internet, as pessoas colocam um <select> com os status no formulário e salvam direto no banco via PUT ou PATCH. Por que em sistemas reais e críticos isso é considerado um erro grave de arquitetura?

  Resposta da IA: Em sistemas comuns de cadastro simples isso até funciona, mas em sistemas críticos (como hospitais, bancos ou e-commerces) deixar o campo status aberto no formulário permite alterações arbitrárias e fraude de fluxo. Um usuário mal-intencionado ou um erro de digitação na tela poderia mudar uma consulta diretamente de AGENDADA para REALIZADA, pulando a recepção, o pagamento ou a própria consulta médica. O status não é um simples dado cadastral; ele representa o estado do ciclo de vida de um processo de negócio.

  **Considerações do Estudante**: Percebi que no meu formulário anterior qualquer um podia inspecionar o elemento ou mandar um JSON no PATCH mudando o status para o que quisesse.

  ### Se eu retirar o select de status do formulário, onde exatamente no backend eu devo colocar a trava para garantir que ninguém consiga burlar via API enviando um { status: 'REALIZADA' } no PATCH?

  Resposta da IA: A validação deve residir no Caso de Uso da aplicação (UpdateConsultaUseCase). Mesmo que a rota receba a requisição, o caso de uso deve interceptar o envio do campo status e lançar expressamente um erro de regra de negócio (BusinessRuleError), mantendo o endpoint genérico restrito apenas a dados cadastrais (médico, paciente, data e horário).

  Considerações do Estudante: Isso garante que a regra seja agnóstica de interface: mesmo que usem Postman, Insomnia ou alterem o front-end, o caso de uso no servidor rejeitará a tentativa.

  ### Como proibir alterações arbitrárias de status no sistema hospitalar através do formulário de edição ou rota PATCH genérica? Quero que a entidade Consulta não aceite trocar de status diretamente.

  if (input.status !== undefined && input.status !== consulta.status) {
    throw new BusinessRuleError(
      'Alteração arbitrária de status via formulário direto é estritamente proibida. O ciclo de vida da consulta é gerenciado exclusivamente pela Máquina de Estados Finita através de ações explícitas.'
    );
  }

  ### Já que não posso mudar o status diretamente, como modelo o ciclo de vida real de um paciente no hospital? Quais estados fazem sentido para uma consulta médica?

  Resposta da IA: Uma consulta hospitalar passa por etapas bem delimitadas no mundo físico:

  AGENDADA: Paciente marcou a data;
  CONFIRMADA: Paciente confirmou que comparecerá;
  CHECK_IN: Paciente chegou presencialmente na recepção da clínica;
  EM_ATENDIMENTO: Médico chamou o paciente para o consultório;
  REALIZADA: Médico finalizou a consulta e emitiu o laudo;
  CANCELADA: Processo interrompido por desistência ou imprevisto.

  ### Como a API e o front-end devem se comunicar agora? Em vez de enviar o novo status, devo ter botões e rotas que representam as ações do mundo real?

  Resposta da IA: Exatamente. Em arquiteturas orientadas a eventos e FSM, criamos endpoints que representam comandos/ações imperativas:

  POST /consultas/:id/confirmar
  POST /consultas/:id/check-in
  POST /consultas/:id/iniciar-atendimento
  POST /consultas/:id/concluir
  POST /consultas/:id/cancelar

  Cada rota aciona um método que verifica se o estado atual permite aquela transição antes de executá-la.

  ### Como definir uma Máquina de Estados Finita (FSM) para a Consulta onde o status só muda através de ações/eventos específicos como confirmar(), checkIn(), iniciarAtendimento(), concluir() e cancelar()?

  Orquestrado centralmente pela classe ConsultaStateMachine e acionado pelo caso de uso ExecutarAcaoConsultaUseCase.
  Considerações do Estudante: A máquina de estados garante que não existam 'pulos mágicos' de estado. Uma consulta agendada não pode ir direto para realizada.




  # #############################################################################################################################
  # #############################################################################################################################





  ### Como proibir alterações arbitrárias de status no sistema hospitalar através do formulário de edição ou rota PATCH genérica? Quero que a entidade Consulta não aceite trocar de status diretamente.

  No caso de uso de edição cadastral (UpdateConsultaUseCase), removemos a permissão de alterar o status diretamente. Se a requisição contiver qualquer valor no campo status, o sistema lança expressamente um erro de domínio:

  if (input.status !== undefined && input.status !== consulta.status) {
    throw new BusinessRuleError(
      'Alteração arbitrária de status via formulário direto é estritamente proibida. O ciclo de vida da consulta é gerenciado exclusivamente pela Máquina de Estados Finita através de ações explícitas.'
    );
  }

  ### Como definir uma Máquina de Estados Finita (FSM) para a Consulta onde o status só muda através de ações/eventos específicos como confirmar(), checkIn(), iniciarAtendimento(), concluir() e cancelar()?

  AGENDADA --> CONFIRMAR --> CONFIRMADA 
  CONFIRMADA --> CHECK_IN --> CHECK_IN

  Foram disponibilizados endpoints dedicados na API (/consultas/:id/confirmar, /consultas/:id/check-in, /consultas/:id/concluir, etc.), garantindo que cada transição execute apenas se o estado de origem for válido.

  ### Como criar uma Matriz de Permissões (RBAC) por estado para controlar quem tem permissão de executar cada ação da consulta (Paciente, Recepcionista, Médico e Administrador)?

  Criamos o enum de perfis UserRole (PACIENTE, RECEPCIONISTA, MEDICO, ADMIN) e a guarda de permissão RbacGuard. Cada ação na máquina de estados define os perfis autorizados:

  CONFIRMAR: Paciente, Recepcionista, Admin.
  CHECK_IN: Recepcionista, Admin (Paciente e Médico não podem dar check-in).
  INICIAR_ATENDIMENTO: Médico, Admin (Exclusivo da equipe clínica).
  CONCLUIR: Médico, Admin (Apenas o médico pode finalizar a consulta).
  CANCELAR: Regras segmentadas por papel e estado.

  Caso um usuário tente disparar uma ação sem ter o perfil adequado, o sistema bloqueia lançando ForbiddenError (HTTP 403).

  ### Como criar Guardas de Transição (Transition Guards) com regras obrigatórias para mudar de estado, exigindo laudo/prontuário para concluir e justificativa para cancelar (análogo ao caso do RMA que exige laudo antes do reparo)?

  Criamos classes específicas de validação pré-transição que impedem a mudança caso os requisitos obrigatórios não sejam atendidos:

  ProntuarioObrigatorioGuard: Na ação CONCLUIR, valida se o texto do laudo/prontuário médico e o diagnóstico foram preenchidos. Se estiverem vazios, a consulta é impedida de ir para REALIZADA.
  JustificativaCancelamentoGuard: Na ação CANCELAR, exige uma justificativa formal com tamanho mínimo.
  PacienteCancelamentoGuard: Impede o paciente de cancelar a consulta se ela já estiver em estado de CHECK_IN ou EM_ATENDIMENTO (devendo passar pela recepção).

  ### Como estruturar essa Máquina de Estados e as guardas respeitando os princípios SOLID, em especial SRP (Responsabilidade Única), OCP (Aberto/Fechado) e LSP (Substituição de Liskov)?

  A arquitetura foi desenhada desacoplando as regras do motor da FSM:

  Single Responsibility Principle (SRP): Cada guarda (RbacGuard, ProntuarioObrigatorioGuard, JustificativaCancelamentoGuard) tem uma única responsabilidade de validação isolada em seu próprio arquivo.
  Open/Closed Principle (OCP): A ConsultaStateMachine gerencia a execução de um array de guardas por ação. Para criar uma nova regra (ex: validar convênio ou biometria), basta criar uma nova classe sem mexer no motor central.
  Liskov Substitution Principle (LSP): Todas as guardas implementam a interface comum ITransitionGuard com o método validate(acao, context). O motor trata qualquer guarda de forma polimórfica e uniforme.

  ### Como estruturar os testes automatizados para comprovar que a alteração arbitrária de status via formulário foi proibida e que as guardas e o RBAC estão funcionando corretamente?

  Expandimos a suíte de testes em ppw_server/src/use-cases.spec.ts totalizando 21 testes automatizados (100% de sucesso):

  Teste de rejeição de status direto via formulário (UpdateConsultaUseCase lançando erro de negócio);
  Teste do fluxo completo de ações 

  confirmar -> chekin -> iniciar atendimento -> concluir

  Testes de transição ilegal (tentar concluir a partir de AGENDADA);
  Testes de RBAC (Paciente tentando fazer check-in e Recepcionista tentando concluir consulta lançando ForbiddenError);
  Testes de Guardas (tentativa de conclusão sem prontuário e cancelamento sem justificativa sendo barrados);
  Testes unitários isolados das guardas confirmando SRP, OCP e LSP.





  # ###########################################################################################################################
  # ###########################################################################################################################





  ### No meu sistema hospitalar, como trato requisições concorrentes que tentam agendar o mesmo médico ou sala no mesmo horário simultaneamente, evitando duplo agendamento

  Implementamos um serviço de Mutex Assíncrono por chave de recurso (AsyncLockService). Ao agendar uma consulta no CreateConsultaUseCase, o sistema adquire uma trava exclusiva para a chave medico:${medicoId}:${data}:${horario}:

  return await this.asyncLockService.withLock(lockKey, async () => {
    const conflito = await this.consultaRepository.findByMedicoEHorario(medicoId, data, horario);
    if (conflito) throw new ConflictError('O médico já possui uma consulta agendada para esse horário.');
    return await this.consultaRepository.create(...);
  });

  Se duas requisições chegarem no mesmo milissegundo, a primeira executa a criação e a segunda, ao obter o lock, detecta que o horário acabou de ser preenchido e é rejeitada com ConflictError.

  ### Como evitar que dois usuários (ex: recepcionista e paciente) editem ou alterem a mesma consulta ao mesmo tempo e um sobrescreva as alterações do outro sem perceber?

  Resposta da IA: Implementamos o Controle de Concorrência Otimista (Optimistic Concurrency Control - OCC) utilizando uma coluna version na entidade Consulta. Toda vez que a consulta é recuperada para alteração, o cliente envia a versão que leu. Se outro usuário alterou a consulta no mesmo intervalo, o número de versão no banco já terá sido incrementado (version + 1), fazendo com que a operação concorrente seja rejeitada com ConcurrencyError ("Registro desatualizado: outro usuário modificou esta consulta"). Isso impede que uma alteração sobrescreva a outra silenciosamente (Lost Update).

Considerações do Estudante: Isso resolve o clássico problema de dois recepcionistas abrirem a mesma tela ao mesmo tempo; quem salvar primeiro grava com sucesso, e o segundo é avisado que os dados mudaram.

  O formulário comum agora serve estritamente para alterar dados cadastrais (médico, paciente, data e horário).

  ### Como implementar regras de SLA e temporalidade para expirar automaticamente consultas que estão 'AGENDADA' há muito tempo sem que o paciente confirme presença?

  Criamos a interface ISlaPolicy e a política ConfirmacaoSlaPolicy. Toda consulta agendada recebe um atributo limiteConfirmacaoAt (ex: 24 horas antes do horário). Ao rodar a avaliação de SLA, se o horário atual ultrapassar o limite, a consulta tem seu status alterado automaticamente para CANCELADA com motivo "Cancelamento automático: prazo de confirmação expirado (SLA)", liberando a vaga para outro paciente.

  ### Como criar um gatilho de escalonamento para pacientes que fizeram check-in na recepção e estão esperando há mais de 30 minutos na sala de espera sem serem atendidos?

  Implementamos a TempoEsperaCheckInSlaPolicy. Quando o paciente faz check-in, registramos o timestamp dataCheckIn. A política calcula a diferença entre o horário atual e o check-in:

  if (minutosDecorridos >= 30) {
    return {
    violou: true,
    acao: 'ESCALONAR',
    descricao: `Paciente aguardando há ${minutosDecorridos} minutos na recepção.`
    };
  }

  O gatilho atualiza a consulta marcando slaEstourado = true, define prioridade = 'URGENTE' e gera um alerta para a equipe médica e coordenação de enfermagem.



  ### O que deve acontecer se uma consulta for cancelada no meio do fluxo, Como fazer o rollback parcial dos recursos reservados?

  Criamos o **RollbackManagerService** e handlers dedicados que executam ações compensatórias:

  LiberarAgendaRollbackHandler: Libera o slot da agenda do médico, permitindo novo agendamento no mesmo horário;

  LiberarSalaRollbackHandler: Desaloca o consultório físico (salaId) e o devolve ao pool de salas disponíveis;

  RemoverFilaEsperaRollbackHandler: Se a consulta estava em CHECK_IN, retira o paciente da fila de presença ativa da recepção;

  Todas as compensações executadas são salvas no array compensacoesExecutadas da consulta para fins de rastreabilidade.


  ### Como os princípios SOLID foram aplicados nessa camada de Concorrência, SLA e Rollback?

  Single Responsibility Principle (SRP): Cada política (ConfirmacaoSlaPolicy, TempoEsperaCheckInSlaPolicy) e cada handler de compensação (LiberarAgendaRollbackHandler, LiberarSalaRollbackHandler) possui uma única e exclusiva responsabilidade.

  Open/Closed Principle (OCP): Tanto o SlaManagerService quanto o RollbackManagerService possuem métodos de registro (registrarPolitica, registrarHandler). Para adicionar uma nova regra (ex: estorno de pagamento de coparticipação), criamos uma nova classe sem modificar o código existente.

  Liskov Substitution Principle (LSP): O motor consome as interfaces ISlaPolicy e IRollbackHandler, aceitando qualquer implementação sem quebras de comportamento.







  ### #########################################################################################################################
  ### #########################################################################################################################







  ### Como estruturar uma tabela vinculada de histórico (Audit Log) para as consultas hospitalares, contendo obrigatoriamente (id_registro, estado_anterior, novo_estado, autor_id, justificativa, timestamp), garantindo que nenhuma alteração crítica sobrescreva dados sem histórico?

  Criamos a entidade de domínio HistoricoConsulta com modelagem imutável (append-only):

  export class HistoricoConsulta {
    constructor(
      public readonly id: number,
      public readonly consultaId: number,       // id_registro
      public readonly estadoAnterior: string,     // estado_anterior
      public readonly novoEstado: string,         // novo_estado
      public readonly autorId: number,           // autor_id
      public readonly autorRole: string,         // perfil do autor (RBAC)
      public readonly justificativa: string,     // justificativa
      public readonly timestamp: string,         // timestamp (ISO 8601)
      public readonly versao: number,            // versao da entidade
      public readonly detalhes?: Record<string, unknown>,
    ) {}
  }

  Nenhuma operação de atualização na tabela de consultas pode sobrescrever registros anteriores; cada transição de estado gera uma nova linha permanente com o registro fiel de quem fez a ação, quando fez e a respectiva justificativa.

  ### Como garantir que a alteração de status da consulta e a criação do registro de auditoria ocorram sob uma transação ACID de banco de dados, de modo que se a gravação do log falhar, o status não seja alterado?

  Implementamos o padrão de gerenciador de transações (ITransactionManager / InMemoryTransactionManager). No caso de uso ExecutarAcaoConsultaUseCase, a operação é envolvida em um bloco atômico:

  return await this.transactionManager.executarEmTransacao(async () => {
    // 1. Atualiza o status da consulta
    const atualizada = await this.consultaRepository.update(id, dadosAtualizacao);
    
    // 2. Cria o registro na tabela de auditoria vinculada
    await this.historicoRepository.create({
      consultaId: atualizada.id,
      estadoAnterior: consulta.status,
      novoEstado: atualizada.status,
      autorId: input.actorId,
      autorRole: input.actorRole,
      justificativa: input.payload?.justificativa || `Ação ${input.acao} executada.`,
      versao: atualizada.version,
    });

    return atualizada;
  });

  Caso ocorra qualquer erro na gravação do histórico ou do banco, o mecanismo dispara um Rollback integral restaurando o estado anterior, satisfazendo a propriedade de Atomicidade (ou ambas as gravações acontecem, ou nenhuma acontece).

  ### Quando uma consulta for cancelada no meio do fluxo, como registrar no histórico de auditoria não apenas o motivo, mas também quais recursos foram estornados (como a liberação da agenda do médico e a desalocação da sala)

  Ao executar o cancelamento, o RollbackManagerService executa a cadeia compensatória e o resultado é gravado no campo detalhes do log de auditoria:

  if (input.acao === 'CANCELAR') {
    const compensacoes = await this.rollbackManagerService.executarRollback({
      consulta,
      motivo: input.payload?.justificativa,
      actorId: input.actorId,
      actorRole: input.actorRole,
    });
    dadosAtualizacao.compensacoesExecutadas = compensacoes;
  }

  O registro de histórico armazena tanto a justificativa enviada pelo autor quanto o relatório dos estornos realizados (SLOT_AGENDA_LIBERADO, SALA_DESALOCADA, FILA_ESPERA_ESTORNADA).

  ### Como disponibilizar o acesso ao histórico completo da consulta para que auditores, recepcionistas ou médicos possam visualizar a ordem cronológica de eventos?

  Criamos o caso de uso GetHistoricoConsultaUseCase e os endpoints correspondentes no ConsultasController:

  GET /consultas/:id/historico: Busca todos os registros vinculados àquela consulta ordenados cronologicamente (do mais recente para o mais antigo);
  GET /consultas/auditoria/geral: Retorna o relatório completo de auditoria do hospital.

  O repositório implementa o método findByConsultaId(consultaId) que retorna as instâncias imutáveis de HistoricoConsulta.

  ### Como testar de forma automatizada se a trilha de auditoria está acumulando registros corretamente e se o Rollback ACID realmente funciona em caso de erro?

  Criamos testes específicos na suíte use-cases.spec.ts (elevando o total para 31 testes aprovados):

  Teste de Histórico Vinculado: Valida se a transição de AGENDADA para CONFIRMADA cria uma linha no repositório de histórico com todos os campos preenchidos;

  Teste de Não-Sobrescrita: Executa 4 transições consecutivas e comprova que os 4 registros foram preservados em sequência cronológica;

  Teste de Rollback ACID: Simula uma falha forçada no meio da transação; o teste comprova que o status da consulta é revertido ao estado anterior e nenhum registro parcial é salvo no banco de histórico;

  Teste de Cancelamento: Comprova que o log contém a justificativa formal e as compensações de recursos.






  ## ###########################################################################################################################
  ## ###########################################################################################################################


  ### Interação 1: Conceito e Exemplo de Máquina de Estados Finitos (FSM)

  **1. O Prompt Utilizado:**
  > Resumo sobre Máquina de estado finita (FSM), com exemplo em código e exemplo real.

  **2. A Resposta Bruta da IA (Versão Encurtada):**
  > Uma Máquina de Estados Finita (FSM) é um padrão onde um objeto existe em apenas um estado por vez, controlado por eventos específicos. 
  > 
  > Exemplo Real: Catraca de Metrô (Estados: TRAVADA e DESTRAVADA).
  > 
  > EXEMPLO DE CÓDIGO (JAVA):
  > ```java 
  > public enum EstadoCatraca {
  >     TRAVADA, DESTRAVADA;
  > 
  >     public EstadoCatraca aproximarBilhete() {
  >         return (this == TRAVADA) ? DESTRAVADA : this;
  >     }
  > 
  >     public EstadoCatraca girarRoleta() {
  >         return (this == DESTRAVADA) ? TRAVADA : this;
  >     }
  > }
  > ```

  **3. Considerações do Estudante:**
  > Já conhecia o assunto devido ao trabalho de POO; no projeto da academia, usamos para definir o estado da matrícula do usuário.

  ### Interação 2: Transições Restritas em Máquinas de Estado 

  **1. O Prompt Utilizado:**
  > Agora que já entendi sobre máquina de estado quero que me explique sobre as Transições Restritas, de uma breve explicação e utilize o mesmo exemplo que você deu na máquina de estado.

  **2. A Resposta Bruta da IA (Versão Resumida):**
  > As Transições Restritas são as "regras de trânsito" dentro da sua Máquina de Estados, definindo os caminhos permitidos e impedindo movimentos ilegais.
  > 
  > Exemplo no Mundo Real: Catraca de Metrô. Se está TRAVADA, tentar forçar a roleta não muda o estado para DESTRAVADA.
  > 
  > EXEMPLO DE CÓDIGO (JAVA):
  > ```java
  > public class Catraca {
  >     private EstadoCatraca estado = EstadoCatraca.TRAVADA; 
  > 
  >     public void aproximarBilhete() {
  >         if (estado == EstadoCatraca.DESTRAVADA) throw new IllegalStateException("Já destravada."); 
  >         estado = EstadoCatraca.DESTRAVADA;
  >     }
  > 
  >     public void girarRoleta() {
  >         if (estado == EstadoCatraca.TRAVADA) throw new IllegalStateException("Acesso negado.");
  >         estado = EstadoCatraca.TRAVADA;
  >     }
  > }
  > ```

  **3. Considerações do Estudante:**
  > Durante o desenvolvimento do trabalho de POO utilizei de diversos if criando exceções e estruturando exceções para impedir que o estado de MATRICULA (estado), fosse alterada de CANCELADA para TRANCADA então utilizei essas restrições na prática impedindo que minhas regras de negócio fossem violadas.


  ### Interação 3: Regras de Negócio na Prática

  **1. O Prompt Utilizado:**
  > Me dê um breve resumo sobre Regras de Negócio e utilizando o mesmo exemplo da catraca me de um código com regras de negócio.

  **2. A Resposta Bruta da IA (Versão Resumida):**
  > Regras de Negócio são as políticas, restrições e lógicas que definem como uma organização funciona. No software, representam as validações operacionais ou financeiras exigidas pela empresa. 
  > 
  > Exemplo na Catraca: "A catraca só pode destravar se o bilhete tiver saldo igual ou superior a R$ 5,00".
  > 
  > EXEMPLO DE CÓDIGO (JAVA):
  > ```java
  > public class Catraca {
  >     private EstadoCatraca estado = EstadoCatraca.TRAVADA;
  > 
  >     public void aproximarBilhete(double saldoUsuario) {
  >         if (estado == EstadoCatraca.DESTRAVADA) throw new IllegalStateException("Já destravada.");
  >         if (saldoUsuario < 5.00) throw new IllegalArgumentException("Saldo insuficiente (R$ 5,00).");
  >         
  >         estado = EstadoCatraca.DESTRAVADA; 
  >     }
  > }
  > ```

  **3. Considerações do Estudante:**
  > Regras de negócio são exigências que a empresa determina.

  ### Interação 4: Conflitos Assíncronos e Máquina de Estados

  **1. Os Prompts Utilizados:**
  > **Pergunta 1:** Conflitos Assíncronos tem relação com o estado?
  > 
  > **Pergunta 2 (4.1):** Conflitos assíncronos são quando diversas condições são realizadas e o estado sofre alterações simultâneas?

  **2. A Resposta Bruta da IA (Versão Resumida):**
  > Sim, total relação! Conflitos assíncronos (condições de corrida) ocorrem quando múltiplas requisições ou processos leem o mesmo estado ao mesmo tempo e tentam alterá-lo antes que a primeira operação seja concluída.
  > 
  > Exemplo na Catraca: Se por falha de rede o evento "Aproximar Bilhete" for enviado duas vezes no mesmo milissegundo:
  > * [Thread A] verifica: "Está TRAVADA?" -> Sim.
  > * [Thread B] verifica (antes da Thread A terminar): "Está TRAVADA?" -> Sim.
  > * [Thread A] cobra R$5,00 e salva o estado DESTRAVADA.
  > * [Thread B] cobra mais R$5,00 (pois já passou pela verificação) e salva DESTRAVADA novamente. (Gerando uma dupla cobrança).

  **3. Considerações do Estudante:**
  > Fazendo um paralelo com o meu projeto da academia em POO, percebi que se dois recepcionistas tentarem alterar o estado de uma mesma matrícula simultaneamente no sistema, podemos ter um conflito assíncrono.

### O que é audit log e pra que eu uso ele em um projeto?

Resposta Bruta da IA (Versão Resumida):

O Audit Log (Trilha de Auditoria) é a "caixa-preta" ou o "livro-caixa" do seu sistema. É um registro cronológico e seguro de todas as ações e alterações críticas no banco de dados, respondendo a quatro perguntas fundamentais: quem fez, o que fez, quando fez e por que fez.

EXEMPLO DE CÓDIGO (JAVA/JPA):

@Entity
@Table(name = "historico_consulta")
public class HistoricoConsulta {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long consultaId;
    private String estadoAnterior;
    private String novoEstado;
    private Long autorId; // Quem fez a ação
    private String justificativa; // Por que fez
    private LocalDateTime dataHora = LocalDateTime.now(); // Quando fez
}

Audit Log garante rastreabilidade total. Se uma consulta ou matrícula for cancelada ou sofrer alteração crítica, saberemos exatamente o autor, o momento e a justificativa, impedindo fraudes ou perdas de histórico.
=======
## 1. Diretrizes Globais de Interação com a IA

Para otimizar o fluxo de trabalho e o aprendizado durante o desenvolvimento da atividade, as seguintes regras de sistema foram predefinidas nas configurações do Gemini:

* **Diretriz de Entrega Fracionada**
  * **Prompt Configurado:** "Sempre me mande uma fração do conteúdo não mande todos de uma vez."
  * **Justificativa:** Garantir que as explicações e códigos sejam entregues em blocos menores e mais digeríveis. Isso evita a sobrecarga de informações e facilita o acompanhamento e a assimilação do conteúdo passo a passo.
  
* **Diretriz de Isolamento de Contexto**
  * **Prompt Configurado:** "Sempre que eu começar uma nova conversa esqueça totalmente a anterior."
  * **Justificativa:** Assegurar a organização do ambiente de estudo. Essa regra garante que cada sessão com a IA seja dedicada exclusivamente a um único escopo, evitando que informações e contextos de conversas anteriores interfiram nas análises e soluções atuais.

### Interação 1: Conceito e Exemplo de Máquina de Estados Finitos (FSM)

**1. O Prompt Utilizado:**
> Resumo sobre Máquina de estado finita (FSM), com exemplo em código e exemplo real.

**2. A Resposta Bruta da IA (Versão Encurtada):**
> Uma Máquina de Estados Finita (FSM) é um padrão onde um objeto existe em apenas um estado por vez, controlado por eventos específicos. 
> 
> Exemplo Real: Catraca de Metrô (Estados: TRAVADA e DESTRAVADA).
> 
> EXEMPLO DE CÓDIGO (JAVA):
> ```java 
> public enum EstadoCatraca {
>     TRAVADA, DESTRAVADA;
> 
>     public EstadoCatraca aproximarBilhete() {
>         return (this == TRAVADA) ? DESTRAVADA : this;
>     }
> 
>     public EstadoCatraca girarRoleta() {
>         return (this == DESTRAVADA) ? TRAVADA : this;
>     }
> }
> ```

**3. Considerações do Estudante:**
> Já conhecia o assunto devido ao trabalho de POO; no projeto da academia, usamos para definir o estado da matrícula do usuário.

### Como proibir alterações arbitrárias de status no sistema hospitalar através do formulário de edição ou rota PATCH genérica? Quero que a entidade Consulta não aceite trocar de status diretamente.

No caso de uso de edição cadastral (UpdateConsultaUseCase), removemos a permissão de alterar o status diretamente. Se a requisição contiver qualquer valor no campo status, o sistema lança expressamente um erro de domínio:

if (input.status !== undefined && input.status !== consulta.status) {
  throw new BusinessRuleError(
    'Alteração arbitrária de status via formulário direto é estritamente proibida. O ciclo de vida da consulta é gerenciado exclusivamente pela Máquina de Estados Finita através de ações explícitas.'
  );
}

### Como definir uma Máquina de Estados Finita (FSM) para a Consulta onde o status só muda através de ações/eventos específicos como confirmar(), checkIn(), iniciarAtendimento(), concluir() e cancelar()?

AGENDADA --> CONFIRMAR --> CONFIRMADA 
CONFIRMADA --> CHECK_IN --> CHECK_IN

Foram disponibilizados endpoints dedicados na API (/consultas/:id/confirmar, /consultas/:id/check-in, /consultas/:id/concluir, etc.), garantindo que cada transição execute apenas se o estado de origem for válido.

### Como criar uma Matriz de Permissões (RBAC) por estado para controlar quem tem permissão de executar cada ação da consulta (Paciente, Recepcionista, Médico e Administrador)?

Criamos o enum de perfis UserRole (PACIENTE, RECEPCIONISTA, MEDICO, ADMIN) e a guarda de permissão RbacGuard. Cada ação na máquina de estados define os perfis autorizados:

CONFIRMAR: Paciente, Recepcionista, Admin.
CHECK_IN: Recepcionista, Admin (Paciente e Médico não podem dar check-in).
INICIAR_ATENDIMENTO: Médico, Admin (Exclusivo da equipe clínica).
CONCLUIR: Médico, Admin (Apenas o médico pode finalizar a consulta).
CANCELAR: Regras segmentadas por papel e estado.

Caso um usuário tente disparar uma ação sem ter o perfil adequado, o sistema bloqueia lançando ForbiddenError (HTTP 403).

### Como criar Guardas de Transição (Transition Guards) com regras obrigatórias para mudar de estado, exigindo laudo/prontuário para concluir e justificativa para cancelar (análogo ao caso do RMA que exige laudo antes do reparo)?

Criamos classes específicas de validação pré-transição que impedem a mudança caso os requisitos obrigatórios não sejam atendidos:

ProntuarioObrigatorioGuard: Na ação CONCLUIR, valida se o texto do laudo/prontuário médico e o diagnóstico foram preenchidos. Se estiverem vazios, a consulta é impedida de ir para REALIZADA.
JustificativaCancelamentoGuard: Na ação CANCELAR, exige uma justificativa formal com tamanho mínimo.
PacienteCancelamentoGuard: Impede o paciente de cancelar a consulta se ela já estiver em estado de CHECK_IN ou EM_ATENDIMENTO (devendo passar pela recepção).

### Como estruturar essa Máquina de Estados e as guardas respeitando os princípios SOLID, em especial SRP (Responsabilidade Única), OCP (Aberto/Fechado) e LSP (Substituição de Liskov)?

A arquitetura foi desenhada desacoplando as regras do motor da FSM:

Single Responsibility Principle (SRP): Cada guarda (RbacGuard, ProntuarioObrigatorioGuard, JustificativaCancelamentoGuard) tem uma única responsabilidade de validação isolada em seu próprio arquivo.
Open/Closed Principle (OCP): A ConsultaStateMachine gerencia a execução de um array de guardas por ação. Para criar uma nova regra (ex: validar convênio ou biometria), basta criar uma nova classe sem mexer no motor central.
Liskov Substitution Principle (LSP): Todas as guardas implementam a interface comum ITransitionGuard com o método validate(acao, context). O motor trata qualquer guarda de forma polimórfica e uniforme.

### Como estruturar os testes automatizados para comprovar que a alteração arbitrária de status via formulário foi proibida e que as guardas e o RBAC estão funcionando corretamente?

Expandimos a suíte de testes em ppw_server/src/use-cases.spec.ts totalizando 21 testes automatizados (100% de sucesso):

Teste de rejeição de status direto via formulário (UpdateConsultaUseCase lançando erro de negócio);
Teste do fluxo completo de ações 

confirmar -> chekin -> iniciar atendimento -> concluir

Testes de transição ilegal (tentar concluir a partir de AGENDADA);
Testes de RBAC (Paciente tentando fazer check-in e Recepcionista tentando concluir consulta lançando ForbiddenError);
Testes de Guardas (tentativa de conclusão sem prontuário e cancelamento sem justificativa sendo barrados);
Testes unitários isolados das guardas confirmando SRP, OCP e LSP.





# ###########################################################################################################################
# ###########################################################################################################################






### Interação 2: Transições Restritas em Máquinas de Estado 

**1. O Prompt Utilizado:**
> Agora que já entendi sobre máquina de estado quero que me explique sobre as Transições Restritas, de uma breve explicação e utilize o mesmo exemplo que você deu na máquina de estado.

**2. A Resposta Bruta da IA (Versão Resumida):**
> As Transições Restritas são as "regras de trânsito" dentro da sua Máquina de Estados, definindo os caminhos permitidos e impedindo movimentos ilegais.
> 
> Exemplo no Mundo Real: Catraca de Metrô. Se está TRAVADA, tentar forçar a roleta não muda o estado para DESTRAVADA.
> 
> EXEMPLO DE CÓDIGO (JAVA):
> ```java
> public class Catraca {
>     private EstadoCatraca estado = EstadoCatraca.TRAVADA; 
> 
>     public void aproximarBilhete() {
>         if (estado == EstadoCatraca.DESTRAVADA) throw new IllegalStateException("Já destravada."); 
>         estado = EstadoCatraca.DESTRAVADA;
>     }
> 
>     public void girarRoleta() {
>         if (estado == EstadoCatraca.TRAVADA) throw new IllegalStateException("Acesso negado.");
>         estado = EstadoCatraca.TRAVADA;
>     }
> }
> ```

**3. Considerações do Estudante:**
> Durante o desenvolvimento do trabalho de POO utilizei de diversos if criando exceções e estruturando exceções para impedir que o estado de MATRICULA (estado), fosse alterada de CANCELADA para TRANCADA então utilizei essas restrições na prática impedindo que minhas regras de negócio fossem violadas.

### No meu sistema hospitalar, como trato requisições concorrentes que tentam agendar o mesmo médico ou sala no mesmo horário simultaneamente, evitando duplo agendamento

Implementamos um serviço de Mutex Assíncrono por chave de recurso (AsyncLockService). Ao agendar uma consulta no CreateConsultaUseCase, o sistema adquire uma trava exclusiva para a chave medico:${medicoId}:${data}:${horario}:

return await this.asyncLockService.withLock(lockKey, async () => {
  const conflito = await this.consultaRepository.findByMedicoEHorario(medicoId, data, horario);
  if (conflito) throw new ConflictError('O médico já possui uma consulta agendada para esse horário.');
  return await this.consultaRepository.create(...);
});

Se duas requisições chegarem no mesmo milissegundo, a primeira executa a criação e a segunda, ao obter o lock, detecta que o horário acabou de ser preenchido e é rejeitada com ConflictError.

### Como evitar que dois usuários (ex: recepcionista e paciente) editem ou alterem a mesma consulta ao mesmo tempo e um sobrescreva as alterações do outro sem perceber?

No caso de uso de edição cadastral (UpdateConsultaUseCase), removemos a permissão de alterar o status diretamente. Se a requisição contiver qualquer valor no campo status, o sistema lança expressamente um erro de domínio:

if (input.status !== undefined && input.status !== consulta.status) {
  throw new BusinessRuleError(
    'Alteração arbitrária de status via formulário direto é estritamente proibida. O ciclo de vida da consulta é gerenciado exclusivamente pela Máquina de Estados Finita através de ações explícitas.'
  );
}

O formulário comum agora serve estritamente para alterar dados cadastrais (médico, paciente, data e horário).

### Como implementar regras de SLA e temporalidade para expirar automaticamente consultas que estão 'AGENDADA' há muito tempo sem que o paciente confirme presença?

Criamos a interface ISlaPolicy e a política ConfirmacaoSlaPolicy. Toda consulta agendada recebe um atributo limiteConfirmacaoAt (ex: 24 horas antes do horário). Ao rodar a avaliação de SLA, se o horário atual ultrapassar o limite, a consulta tem seu status alterado automaticamente para CANCELADA com motivo "Cancelamento automático: prazo de confirmação expirado (SLA)", liberando a vaga para outro paciente.

### Como criar um gatilho de escalonamento para pacientes que fizeram check-in na recepção e estão esperando há mais de 30 minutos na sala de espera sem serem atendidos?

Implementamos a TempoEsperaCheckInSlaPolicy. Quando o paciente faz check-in, registramos o timestamp dataCheckIn. A política calcula a diferença entre o horário atual e o check-in:

if (minutosDecorridos >= 30) {
  return {
  violou: true,
  acao: 'ESCALONAR',
  descricao: `Paciente aguardando há ${minutosDecorridos} minutos na recepção.`
  };
}

O gatilho atualiza a consulta marcando slaEstourado = true, define prioridade = 'URGENTE' e gera um alerta para a equipe médica e coordenação de enfermagem.



### O que deve acontecer se uma consulta for cancelada no meio do fluxo, Como fazer o rollback parcial dos recursos reservados?

Criamos o **RollbackManagerService** e handlers dedicados que executam ações compensatórias:

LiberarAgendaRollbackHandler: Libera o slot da agenda do médico, permitindo novo agendamento no mesmo horário;

LiberarSalaRollbackHandler: Desaloca o consultório físico (salaId) e o devolve ao pool de salas disponíveis;

RemoverFilaEsperaRollbackHandler: Se a consulta estava em CHECK_IN, retira o paciente da fila de presença ativa da recepção;

Todas as compensações executadas são salvas no array compensacoesExecutadas da consulta para fins de rastreabilidade.


### Como os princípios SOLID foram aplicados nessa camada de Concorrência, SLA e Rollback?

Single Responsibility Principle (SRP): Cada política (ConfirmacaoSlaPolicy, TempoEsperaCheckInSlaPolicy) e cada handler de compensação (LiberarAgendaRollbackHandler, LiberarSalaRollbackHandler) possui uma única e exclusiva responsabilidade.

Open/Closed Principle (OCP): Tanto o SlaManagerService quanto o RollbackManagerService possuem métodos de registro (registrarPolitica, registrarHandler). Para adicionar uma nova regra (ex: estorno de pagamento de coparticipação), criamos uma nova classe sem modificar o código existente.

Liskov Substitution Principle (LSP): O motor consome as interfaces ISlaPolicy e IRollbackHandler, aceitando qualquer implementação sem quebras de comportamento.

### Interação 3: Regras de Negócio na Prática

**1. O Prompt Utilizado:**
> Me dê um breve resumo sobre Regras de Negócio e utilizando o mesmo exemplo da catraca me de um código com regras de negócio.

**2. A Resposta Bruta da IA (Versão Resumida):**
> Regras de Negócio são as políticas, restrições e lógicas que definem como uma organização funciona. No software, representam as validações operacionais ou financeiras exigidas pela empresa. 
> 
> Exemplo na Catraca: "A catraca só pode destravar se o bilhete tiver saldo igual ou superior a R$ 5,00".
> 
> EXEMPLO DE CÓDIGO (JAVA):
> ```java
> public class Catraca {
>     private EstadoCatraca estado = EstadoCatraca.TRAVADA;
> 
>     public void aproximarBilhete(double saldoUsuario) {
>         if (estado == EstadoCatraca.DESTRAVADA) throw new IllegalStateException("Já destravada.");
>         if (saldoUsuario < 5.00) throw new IllegalArgumentException("Saldo insuficiente (R$ 5,00).");
>         
>         estado = EstadoCatraca.DESTRAVADA; 
>     }
> }
> ```

**3. Considerações do Estudante:**
> Regras de negócio são exigências que a empresa determina.

### Interação 4: Conflitos Assíncronos e Máquina de Estados

**1. Os Prompts Utilizados:**
> **Pergunta 1:** Conflitos Assíncronos tem relação com o estado?
> 
> **Pergunta 2 (4.1):** Conflitos assíncronos são quando diversas condições são realizadas e o estado sofre alterações simultâneas?

**2. A Resposta Bruta da IA (Versão Resumida):**
> Sim, total relação! Conflitos assíncronos (condições de corrida) ocorrem quando múltiplas requisições ou processos leem o mesmo estado ao mesmo tempo e tentam alterá-lo antes que a primeira operação seja concluída.
> 
> Exemplo na Catraca: Se por falha de rede o evento "Aproximar Bilhete" for enviado duas vezes no mesmo milissegundo:
> * [Thread A] verifica: "Está TRAVADA?" -> Sim.
> * [Thread B] verifica (antes da Thread A terminar): "Está TRAVADA?" -> Sim.
> * [Thread A] cobra R$5,00 e salva o estado DESTRAVADA.
> * [Thread B] cobra mais R$5,00 (pois já passou pela verificação) e salva DESTRAVADA novamente. (Gerando uma dupla cobrança).

**3. Considerações do Estudante:**
> Fazendo um paralelo com o meu projeto da academia em POO, percebi que se dois recepcionistas tentarem alterar o estado de uma mesma matrícula simultaneamente no sistema, podemos ter um conflito assíncrono.

### Interação 5: Conceito e Uso de Audit Log (Trilha de Auditoria)

**1. O Prompt Utilizado:**
> O que é audit log e pra que eu uso ele em um projeto?

**2. A Resposta Bruta da IA (Versão Resumida):**
> O Audit Log (Trilha de Auditoria) é a "caixa-preta" ou o "livro-caixa" do seu sistema. É um registro cronológico e seguro de todas as ações e alterações críticas no banco de dados, respondendo a quatro perguntas fundamentais: quem fez, o que fez, quando fez e por que fez.
> 
> EXEMPLO DE CÓDIGO (JAVA/JPA):
> ```java
> @Entity
> @Table(name = "historico_consulta")
> public class HistoricoConsulta {
>     @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
>     private Long id;
>     
>     private Long consultaId;
>     private String estadoAnterior;
>     private String novoEstado;
>     private Long autorId; // Quem fez a ação
>     private String justificativa; // Por que fez
>     private LocalDateTime dataHora = LocalDateTime.now(); // Quando fez
> }
> ```

**3. Considerações do Estudante:**
> Pensando no sistema da academia que estou desenvolvendo, implementar um Audit Log seria a solução perfeita para ter um controle de segurança e auditoria sobre as matrículas. Se uma matrícula for cancelada de forma indevida, o Audit Log nos dirá exatamente qual usuário (recepcionista ou administrador) realizou a ação, em que momento e qual foi a justificativa registrada, garantindo a rastreabilidade total das operações.
>>>>>>> 4eaf2c7f60f6385bd2869ceb8c2bc137f6b9b9cf
