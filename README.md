# DIGIOFICINAS

Sistema web para gerenciamento de oficinas educacionais, inscricoes publicas, presencas e certificados.

O projeto foi construido com TanStack Start, React, Better Auth, Drizzle ORM, PostgreSQL, Tailwind CSS, TypeScript e Vitest. A aplicacao possui uma area publica para consulta e inscricao em oficinas e um painel administrativo restrito para gestao dos dados.

## Sumario

- [Visao geral](#visao-geral)
- [Planejamento](#planejamento)
- [Artefatos do projeto](#artefatos-do-projeto)
- [Arquitetura](#arquitetura)
- [Requisitos funcionais](#requisitos-funcionais)
- [Backlog e sprints](#backlog-e-sprints)
- [Estrategia de testes](#estrategia-de-testes)
- [Como executar](#como-executar)
- [Scripts disponiveis](#scripts-disponiveis)
- [Observacoes](#observacoes)

## Visao geral

O DIGIOFICINAS organiza o ciclo de vida de oficinas:

- publicacao de oficinas abertas ao publico;
- solicitacao publica de inscricao, sem login;
- analise de inscricoes pelo administrador responsavel;
- cadastro de alunos, professores e tutores;
- registro de presenca;
- emissao de certificados;
- isolamento dos dados por administrador autenticado.

Alunos, professores e tutores nao possuem login administrativo. O unico perfil autenticado previsto no painel e o administrador.

## Planejamento

### Arquitetura de Sistema definida

A arquitetura escolhida foi full-stack com TanStack Start:

- interface em React;
- rotas publicas e administrativas com TanStack Router;
- Server Functions para regras de negocio;
- validacao com Zod;
- persistencia com Drizzle ORM e PostgreSQL;
- autenticacao administrativa com Better Auth;
- testes automatizados com Vitest.

### Estrategia de automacao de testes

Foram definidos testes por camada funcional:

- testes de schema para validacao de entradas e regras de formulario;
- testes de servico para regras de negocio, filtros por administrador e persistencia;
- testes de geracao de certificado em PDF;
- execucao automatizada pelo script `pnpm test`.

### Tecnologias escolhidas

| Camada | Tecnologia |
|---|---|
| Full-stack | TanStack Start |
| Frontend | React 19, TanStack Router, TanStack Query, TanStack Form |
| Estilo | Tailwind CSS 4 e componentes locais |
| Autenticacao | Better Auth |
| Banco de dados | PostgreSQL |
| ORM e migracoes | Drizzle ORM e Drizzle Kit |
| Validacao | Zod |
| Qualidade | TypeScript, Biome e Vitest |

### Cronograma planejado

| Etapa | Entregas |
|---|---|
| Sprint 1 | Fundacao do projeto, autenticacao, banco de dados, seed, painel administrativo, oficinas, equipe, alunos e matriculas manuais. |
| Sprint 2 | Pagina publica, inscricoes, analise de solicitacoes, presenca, certificados, testes automatizados e documentacao final. |

## Artefatos do projeto

Este repositorio contem os artefatos iniciais e de desenvolvimento solicitados:

| Artefato | Local |
|---|---|
| README do projeto | `README.md` |
| Configuracao do ambiente | `package.json`, `vite.config.ts`, `tsconfig.json`, `biome.json`, `drizzle.config.ts` |
| Schema e migracao do banco | `src/db/schema/`, `drizzle/` |
| Seed demonstrativa | `src/db/seed/seed-admin.ts` |
| Definicao e scripts de testes | arquivos `*.test.ts` em `src/features/` e `src/routes/` |
| Diagrama de arquitetura | secao [Arquitetura](#arquitetura) |
| Requisitos funcionais desenvolvidos | secao [Requisitos funcionais](#requisitos-funcionais) |
| Backlog planejado | secao [Backlog e sprints](#backlog-e-sprints) |

## Arquitetura

![Arquitetura definida](/docs/digioficinas_architecture_diagram.svg)

### Modelo de dados

![Entidades](/docs/digioficinas_entities.png)

## Requisitos funcionais

| ID | Requisito | Status |
|---|---|---|
| RF01 | Administrador pode cadastrar oficinas. | Implementado |
| RF02 | Administrador pode editar e excluir apenas suas oficinas. | Implementado |
| RF03 | Sistema isola dados por `adminId`. | Implementado |
| RF04 | Oficina possui tema, periodo, carga horaria, vagas, status e imagem. | Implementado |
| RF05 | Administrador pode associar professores e tutores a oficinas. | Implementado |
| RF06 | Administrador pode cadastrar alunos manualmente. | Implementado |
| RF07 | Administrador pode matricular alunos em oficinas. | Implementado |
| RF08 | Visitante pode consultar oficinas publicas. | Implementado |
| RF09 | Visitante pode solicitar inscricao publica sem login. | Implementado |
| RF10 | Administrador pode aprovar ou recusar solicitacoes. | Implementado |
| RF11 | Sistema respeita limite de vagas ao aprovar inscricoes. | Implementado |
| RF12 | Administrador pode registrar presenca por aluno, oficina e data. | Implementado |
| RF13 | Administrador pode emitir certificado para aluno elegivel. | Implementado |
| RF14 | Sistema gera PDF do certificado. | Implementado |
| RF15 | Pagina publica exibe participantes apenas quando permitido. | Implementado |
| RF16 | Dados sensiveis de alunos nao sao expostos publicamente. | Implementado |

## Backlog e sprints

As funcionalidades planejadas podem ser documentadas como issues no GitHub. A tabela abaixo serve como modelo do backlog executado, mesmo com o projeto ja implementado.

| Issue | Sprint | Funcionalidade | Requisitos relacionados | Criterios de aceite | Testes esperados |
|---|---|---|---|---|---|
| `#1` | Sprint 1 | Configurar base do projeto | Base tecnica para `#RF01` a `#RF16` | Aplicacao inicia, build funciona e estrutura de pastas esta definida. | `pnpm build`, `pnpm test` |
| `#2` | Sprint 1 | Autenticacao administrativa e isolamento | `#RF03` | Admin faz login, acessa apenas `/app` e os dados ficam filtrados pelo administrador autenticado. | Testes de middleware/fluxos protegidos quando aplicavel. |
| `#3` | Sprint 1 | Schema do banco e seed | Base de dados para `#RF01` a `#RF16` | Tabelas principais existem e seed cria dados demonstrativos. | Validacao por Drizzle e seed local. |
| `#4` | Sprint 1 | CRUD de oficinas | `#RF01`, `#RF02`, `#RF04` | Admin cria, edita, lista e remove apenas suas oficinas, mantendo os campos obrigatorios da oficina. | `workshop.server.test.ts`, `workshop.schemas.test.ts` |
| `#5` | Sprint 1 | Gestao de equipe | `#RF05` | Admin cadastra professores/tutores e associa a oficinas. | `staff.server.test.ts`, `staff.schemas.test.ts` |
| `#6` | Sprint 1 | Gestao de alunos | `#RF06` | Admin cadastra alunos manualmente com validacao dos dados principais. | `student.server.test.ts`, `student.schemas.test.ts` |
| `#7` | Sprint 1 | Matriculas manuais | `#RF07` | Admin matricula alunos em oficinas sob sua gestao. | `student.server.test.ts`, `participation.server.test.ts` |
| `#8` | Sprint 2 | Pagina publica de oficinas | `#RF08`, `#RF15`, `#RF16` | Visitante visualiza oficinas publicadas e disponiveis, com participantes exibidos apenas quando permitido e sem dados sensiveis. | Testes de servico e validacao de dados publicos. |
| `#9` | Sprint 2 | Inscricao publica | `#RF09`, `#RF16` | Visitante envia solicitacao sem login e ela fica pendente, sem exposicao de dados sensiveis. | `participation.server.test.ts`, `participation.schemas.test.ts` |
| `#10` | Sprint 2 | Analise de inscricoes | `#RF10`, `#RF11`, `#RF03` | Admin aprova ou recusa solicitacoes das suas oficinas respeitando o limite de vagas. | `participation.server.test.ts` |
| `#11` | Sprint 2 | Controle de presenca | `#RF12`, `#RF03` | Admin registra presenca por aluno, oficina e data, sem duplicidade. | `attendance.server.test.ts`, `attendance.schemas.test.ts` |
| `#12` | Sprint 2 | Certificados | `#RF13` | Admin emite certificado para aluno elegivel. | `certificate.server.test.ts`, `certificate.schemas.test.ts` |
| `#13` | Sprint 2 | PDF de certificado | `#RF14` | Sistema gera PDF com dados do aluno e oficina. | `certificate-pdf.test.ts` |
| `#14` | Sprint 2 | Qualidade e documentacao | Evidencias de entrega para `#RF01` a `#RF16` | README, testes e scripts ficam prontos para entrega. | `pnpm lint`, `pnpm test`, `pnpm build` |

### Modelo de issue

```md
## Objetivo
Implementar [funcionalidade].

## Criterios de aceite
- [ ] Usuario consegue executar o fluxo principal.
- [ ] Sistema valida entradas invalidas.
- [ ] Dados sao filtrados pelo administrador autenticado, quando aplicavel.
- [ ] Testes automatizados cobrem a regra principal.

## Testes
- [ ] pnpm test
- [ ] pnpm build

## Commits relacionados
- hash-do-commit mensagem-do-commit
```

### Exemplo de rastreabilidade por commit

| Funcionalidade | Commits relacionados |
|---|---|
| Participacoes e inscricoes publicas | `21085a9`, `d6dcc72` |
| Painel administrativo | `758f9d6`, `270b4ab` |
| Presencas, certificados e matriculas | `45dbb36` |
| Organizacao e qualidade de codigo | `75562c1`, `c643aac`, `4e68334` |

## Estrategia de testes

Os testes automatizados foram organizados por dominio:

| Dominio | Arquivos principais |
|---|---|
| Oficinas | `src/features/workshop/*.test.ts` |
| Equipe | `src/features/staff/*.test.ts` |
| Alunos | `src/features/student/*.test.ts` |
| Inscricoes e participacoes | `src/features/participation/*.test.ts` |
| Presenca | `src/features/attendance/*.test.ts` |
| Certificados | `src/features/certificate/*.test.ts`, `src/routes/app/certificados/-components/certificate-pdf.test.ts` |
| Dashboard | `src/features/dashboard/dashboard.server.test.ts` |

Comandos de verificacao:

```bash
pnpm test
pnpm lint
pnpm build
```

## Como executar

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar variaveis de ambiente

Crie um arquivo `.env.local`:

```env
DATABASE_URL="postgres://usuario:senha@localhost:5432/digioficinas"
BETTER_AUTH_SECRET="troque-este-valor"
BETTER_AUTH_URL="http://localhost:3000"
```

### 3. Preparar o banco

```bash
pnpm db:push
pnpm db:seed
```

Opcionalmente, use migracoes:

```bash
pnpm db:migrate
```

### 4. Iniciar o projeto

```bash
pnpm dev
```

A aplicacao ficara disponivel no endereco exibido pelo Vite, normalmente `http://localhost:3000`.

### Credenciais da seed

```txt
E-mail: admin@digioficinas.local
Senha:  Admin123456
```

## Scripts disponiveis

| Script | Descricao |
|---|---|
| `pnpm dev` | Inicia o servidor de desenvolvimento. |
| `pnpm build` | Gera build de producao. |
| `pnpm preview` | Executa preview do build. |
| `pnpm test` | Executa testes com Vitest. |
| `pnpm format` | Formata arquivos com Biome. |
| `pnpm lint` | Executa lint com Biome. |
| `pnpm check` | Executa verificacoes do Biome. |
| `pnpm db:generate` | Gera migracoes Drizzle. |
| `pnpm db:migrate` | Aplica migracoes Drizzle. |
| `pnpm db:push` | Sincroniza schema com o banco. |
| `pnpm db:studio` | Abre o Drizzle Studio. |
| `pnpm db:seed` | Cria o administrador e dados demonstrativos. |
| `pnpm auth:generate` | Gera schema de autenticacao do Better Auth. |
