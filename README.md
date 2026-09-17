# Agenda Clínica

MVP acadêmico para entender o fluxo de uma consulta: **agendamento → confirmação pelo paciente → check-in → realização**, com cancelamento quando necessário. O foco é demonstrar Next.js, React, NestJS, REST e `localStorage` de forma simples e organizada.

## Tecnologias e estrutura

- `ppw_client/`: Next.js, React, TypeScript, Tailwind CSS e a interface em `http://localhost:3000`.
- `ppw_server/`: NestJS, TypeScript e API REST em `http://localhost:8000`.
- `iniciar-ambiente.bat`: referência de inicialização dos dois projetos em Windows.

## Execução

Em dois terminais:

```bash
cd ppw_server
npm install
npm run start:dev
```

```bash
cd ppw_client
npm install
npm run dev
```

Abra `http://localhost:3000`. A rota `GET http://localhost:8000` confirma que a API está online.

## Persistência e sincronização

Não existe banco de dados neste projeto. O `localStorage` do navegador é a persistência permanente das consultas, na chave `agenda-clinica-consultas`. O NestJS mantém apenas uma lista temporária em memória.

No primeiro acesso, o frontend chama `GET /consultas` e salva os dados iniciais. Nos acessos seguintes, carrega os dados locais e envia a lista para `PUT /consultas/sincronizar`. Assim, se o backend reiniciar, ele recupera a lista atual antes de uma edição ou mudança de status.

```text
Frontend → api.ts → NestJS → Service → resposta → React → storage.ts → localStorage
localStorage → PUT /consultas/sincronizar → memória do NestJS
```

## Fluxo e regras

```text
AGENDADA → CONFIRMADA → CHECK_IN → REALIZADA
AGENDADA ou CONFIRMADA → CANCELADA
```

- Consultas não são excluídas: cancelar altera o status para `CANCELADA`.
- O mesmo médico não pode ter duas consultas na mesma data e horário; a API responde `409 Conflict`.
- Consultas canceladas não bloqueiam um horário.
- Transições inválidas de status recebem `400 Bad Request`.

## Arquivos principais

### Backend

- `ppw_server/src/main.ts`: inicia o NestJS, ativa CORS, `ValidationPipe` e porta 8000.
- `ppw_server/src/app/app.module.ts`: reúne os módulos da aplicação.
- `ppw_server/src/consultas/consultas.controller.ts`: recebe as requisições HTTP de consultas.
- `ppw_server/src/consultas/consultas.service.ts`: contém as regras, os dados temporários e a sincronização.
- `ppw_server/src/consultas/dto/`: define os dados recebidos pela API.
- `ppw_server/src/pacientes/` e `ppw_server/src/medicos/`: fornecem catálogos fictícios.

### Frontend

- `ppw_client/src/app/`: páginas do Next.js.
- `ppw_client/src/components/`: provider, navegação e componentes reutilizáveis.
- `ppw_client/src/lib/api.ts`: centraliza a comunicação HTTP.
- `ppw_client/src/lib/storage.ts`: centraliza o acesso ao `localStorage`.
- `ppw_client/src/types/`: tipos TypeScript usados na interface.

## API REST

| Método | Rota | Função |
| --- | --- | --- |
| GET | `/consultas` | Lista consultas |
| GET | `/consultas/:id` | Busca consulta |
| POST | `/consultas` | Cria consulta |
| PATCH | `/consultas/:id` | Edita consulta ou status |
| PUT | `/consultas/sincronizar` | Sincroniza consultas com localStorage |
| GET | `/pacientes` | Lista pacientes |
| GET | `/pacientes/:id` | Busca paciente |
| GET | `/medicos` | Lista médicos |
| GET | `/medicos/:id` | Busca médico |
