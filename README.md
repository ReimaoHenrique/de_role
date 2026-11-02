# Frontend — De Role

Frontend Next.js 15 (App Router, TypeScript, Tailwind e Shadcn UI) da plataforma
de eventos. Consome exclusivamente o **API Gateway** do monorepo.

## Rodando localmente

O backend precisa estar no ar (na raiz do monorepo):

```bash
npm run dev          # sobe events, tickets, admin e gateway
```

Depois:

```bash
cd de_role
npm install
API_GATEWAY_URL=http://localhost:4000 npm run dev
```

Acesse `http://localhost:3000`.

## Integração com o gateway

As rotas em `src/app/api/*` rodam no servidor Next e fazem proxy para
`API_GATEWAY_URL`:

| Rota Next | Gateway | Descrição |
| --- | --- | --- |
| `GET /api/eventos` | `GET /api/eventos` | Lista de eventos |
| `GET /api/eventos/[id]` | `GET /api/eventos/:id` | Detalhe do evento |
| `POST /api/eventos` | `POST /api/eventos` | Cria convidado/ingresso |
| `POST /api/verificar-convidado` | `POST /api/verificar-convidado` | Consulta por e-mail/CPF |
| `POST /api/admin/festas` | `POST /api/admin/festas` | Login administrativo |
| `GET /api/admin/festas` | `GET /api/admin/festas` | Dashboard (Bearer JWT) |

## Fluxo de inscrição

1. O usuário preenche nome, e-mail e CPF opcional.
2. `TicketForm` envia `POST /api/eventos` com `eventoId`.
3. O gateway cria o convidado no `tickets-service` e reserva a vaga no
   `events-service`.
4. A tela exibe o `ticketHash` retornado.

Não há redirecionamento para gateway de pagamento. O Mercado Pago foi removido
do projeto.

## Admin

O login envia o hash de acesso para `POST /api/admin/festas`. O token JWT
retornado é salvo em `localStorage` (`admin_token`) e enviado como
`Authorization: Bearer <token>` nas chamadas seguintes. O logout remove o token
local.

## Scripts

```bash
npm run dev      # desenvolvimento (Turbopack)
npm run build    # build de produção
npm run start    # executa o build
npm run lint     # lint
```

## Variáveis

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `API_GATEWAY_URL` | `http://localhost:4000` | URL do API Gateway |

## Deploy

O frontend pode ser hospedado na Vercel ou em outro serviço. Configure
`API_GATEWAY_URL` com a URL pública do gateway. Como as rotas de API do Next
rodam no servidor, o browser não precisa de CORS para falar com o backend.
