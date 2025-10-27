# Sistema de Gestão de Igrejas

Um sistema completo para gestão de membros, famílias, grupos, ministérios e finanças de igrejas.

## Funcionalidades

### Gestão de Membros
- ✅ Cadastro completo de membros (nome, contato, data de nascimento, endereço, foto)
- ✅ Acompanhamento de batismos e consagrações
- ✅ Controle de status dos membros
- ✅ Histórico de participação

### Gestão de Famílias
- ✅ Organização de membros por famílias
- ✅ Definição de chefe de família
- ✅ Árvore genealógica (em desenvolvimento)

### Grupos e Ministérios
- ✅ Criação e gestão de grupos (células, pequenos grupos)
- ✅ Organização de ministérios
- ✅ Atribuição de líderes
- ✅ Controle de participação

### Gestão Financeira
- ✅ Registro de dízimos e ofertas
- ✅ Controle de despesas por categoria
- ✅ Relatórios financeiros
- ✅ Orçamentos por ministério
- ✅ Divisão de saldo por ministérios

### Comunicação
- ✅ Sistema de mensagens (Email, SMS, Notificações)
- ✅ Calendário de eventos da igreja
- ✅ Agendamento de mensagens
- ✅ Gestão de participantes em eventos
- ✅ Organização de eventos por ministério/grupo

### Eventos e Inscrições
- ✅ Sistema de inscrições para eventos
- ✅ Controle de vagas e pagamentos
- ✅ Check-in de membros e visitantes
- ✅ Registro de presença em tempo real
- ✅ Relatórios de participação
- ✅ Gestão de visitantes

### Gestão de Voluntários
- ✅ Cadastro de áreas de serviço (infantil, música, recepção)
- ✅ Sistema de disponibilidade de voluntários
- ✅ Controle de habilidades e competências
- ✅ Atribuição de tarefas e eventos
- ✅ Acompanhamento de participação
- ✅ Gestão de status dos voluntários

### Gerenciamento de Células/Pequenos Grupos
- ✅ Cadastro e gestão de células e pequenos grupos
- ✅ Sistema de reuniões com pautas e anotações
- ✅ Registro de presença individual por reunião
- ✅ Controle de frequência e participação
- ✅ Relatórios de comparecimento
- ✅ Atribuição de líderes aos grupos

### Controle de Estoque
- ✅ Cadastro de categorias de materiais
- ✅ Gestão de itens com controle de quantidade
- ✅ Sistema de movimentações (entrada/saída/ajuste)
- ✅ Controle de estoque mínimo e máximo
- ✅ Alertas de itens com estoque baixo
- ✅ Rastreamento de custos e valores
- ✅ Vinculação com eventos e ministérios

### Aplicativo Móvel (Extensão Futura)
- 📱 **App para membros**: Acompanhamento de agenda, leitura de comunicados
- 💰 **Doações digitais**: Sistema de doações via aplicativo
- 📅 **Inscrições em eventos**: Cadastro direto via mobile
- 🔔 **Notificações push**: Alertas de eventos e comunicados
- 👤 **Perfil pessoal**: Gestão do próprio cadastro
- 📊 **Relatórios pessoais**: Histórico de participação e doações

## Tecnologias Utilizadas

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Banco de Dados**: SQLite + Prisma ORM
- **Containerização**: Docker + Docker Compose

## Estrutura do Projeto

```
igrejas/
├── server/                 # Backend
│   ├── prisma/
│   │   └── schema.prisma   # Schema do banco de dados
│   ├── src/
│   │   ├── routes/         # Rotas da API
│   │   └── index.ts        # Servidor Express
│   └── package.json
├── src/                    # Frontend
│   ├── components/         # Componentes React
│   ├── pages/             # Páginas da aplicação
│   └── App.tsx            # App principal
├── docker-compose.yml      # Configuração Docker
└── package.json
```

## Como Executar

### Pré-requisitos
- Node.js 18+
- Docker (opcional)

### Instalação e Execução

1. **Instalar dependências do backend:**
   ```bash
   cd server
   npm install
   ```

2. **Gerar cliente Prisma:**
   ```bash
   npx prisma generate
   ```

3. **Executar migrações do banco:**
   ```bash
   npx prisma db push
   ```

4. **Iniciar servidor backend:**
   ```bash
   npm run dev
   ```

5. **Em outro terminal, instalar dependências do frontend:**
   ```bash
   cd ..
   npm install
   ```

6. **Iniciar aplicação frontend:**
   ```bash
   npm run dev
   ```

### Usando Docker (Recomendado)

```bash
docker-compose up --build
```

A aplicação estará disponível em:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## API Endpoints

### Membros
- `GET /api/members` - Listar todos os membros
- `POST /api/members` - Criar novo membro
- `PUT /api/members/:id` - Atualizar membro
- `DELETE /api/members/:id` - Excluir membro

### Famílias
- `GET /api/families` - Listar todas as famílias
- `POST /api/families` - Criar nova família

### Grupos
- `GET /api/groups` - Listar todos os grupos
- `POST /api/groups` - Criar novo grupo

### Ministérios
- `GET /api/ministries` - Listar todos os ministérios
- `POST /api/ministries` - Criar novo ministério

### Finanças
- `GET /api/finances/donations` - Listar doações
- `POST /api/finances/donations` - Registrar doação
- `GET /api/finances/expenses` - Listar despesas
- `POST /api/finances/expenses` - Registrar despesa
- `GET /api/finances/reports/summary` - Relatório financeiro

### Comunicação
- `GET /api/communication/messages` - Listar mensagens
- `POST /api/communication/messages` - Criar mensagem
- `POST /api/communication/messages/:id/send` - Enviar mensagem
- `GET /api/communication/events` - Listar eventos
- `POST /api/communication/events` - Criar evento
- `GET /api/communication/calendar` - Eventos do calendário

### Eventos e Inscrições
- `POST /api/communication/events/:id/register` - Inscrever-se em evento
- `GET /api/communication/events/:id/registrations` - Ver inscrições
- `PUT /api/communication/events/:id/registrations/:regId` - Atualizar inscrição
- `POST /api/communication/events/:id/checkin` - Fazer check-in
- `PUT /api/communication/events/:id/checkin/:checkInId/checkout` - Check-out
- `GET /api/communication/events/:id/checkins` - Ver check-ins
- `GET /api/communication/events/:id/stats` - Estatísticas do evento

### Gestão de Voluntários
- `GET /api/volunteers/service-areas` - Listar áreas de serviço
- `POST /api/volunteers/service-areas` - Criar área de serviço
- `GET /api/volunteers` - Listar voluntários
- `POST /api/volunteers` - Registrar voluntário
- `PUT /api/volunteers/:id` - Atualizar voluntário
- `POST /api/volunteers/:id/assignments` - Criar atribuição
- `GET /api/volunteers/stats/overview` - Estatísticas de voluntários

### Gerenciamento de Grupos
- `GET /api/groups/meetings` - Listar reuniões
- `POST /api/groups/:groupId/meetings` - Criar reunião
- `PUT /api/groups/meetings/:meetingId` - Atualizar reunião
- `POST /api/groups/meetings/:meetingId/attendance` - Registrar presença
- `POST /api/groups/meetings/:meetingId/quick-attendance` - Presença rápida
- `GET /api/groups/stats/overview` - Estatísticas de grupos

### Controle de Estoque
- `GET /api/inventory/categories` - Listar categorias
- `POST /api/inventory/categories` - Criar categoria
- `GET /api/inventory/items` - Listar itens
- `POST /api/inventory/items` - Criar item
- `POST /api/inventory/items/:id/movements` - Registrar movimentação
- `GET /api/inventory/movements` - Listar movimentações
- `GET /api/inventory/alerts/low-stock` - Alertas de estoque baixo
- `GET /api/inventory/stats/overview` - Estatísticas de estoque

## Funcionalidades Implementadas

### ✅ Implementado
- Estrutura completa do backend com Express
- Schema do banco de dados com Prisma
- API REST completa para todas as entidades
- Frontend com React e TypeScript
- Interface responsiva com Tailwind CSS
- Sistema de rotas com React Router
- Gestão completa de membros
- Gestão financeira (dízimos, ofertas, despesas)
- Relatórios financeiros
- Sistema de comunicação (mensagens e eventos)
- Sistema de inscrições para eventos
- Check-in de membros e visitantes
- Controle de vagas e pagamentos
- Gestão de voluntários e áreas de serviço
- Sistema de disponibilidade de voluntários
- Gerenciamento de células e pequenos grupos
- Sistema de reuniões com controle de presença
- Controle de estoque e materiais
- Alertas de estoque baixo
- Dashboard com estatísticas

### 🚧 Em Desenvolvimento
- Página de famílias
- Página de grupos
- Página de ministérios
- Árvore genealógica
- Funcionalidades avançadas de relatórios

## Próximos Passos

1. **Corrigir schema do Prisma** - Resolver conflitos de relações
2. **Completar páginas restantes** - Famílias, Grupos, Ministérios
3. **Implementar árvore genealógica** - Visualização interativa
4. **Adicionar autenticação** - Sistema de login
5. **Relatórios avançados** - Gráficos e análises
6. **Backup e recuperação** - Sistema de backup
7. **Testes** - Testes unitários e de integração

## Contribuição

Para contribuir com o projeto:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
