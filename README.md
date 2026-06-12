# Bolão Copa 2026 API

Backend RESTful para o Bolão da Copa do Mundo 2026 — Node.js + Express + TypeORM + PostgreSQL.

## Setup

```bash
# Instalar dependências
yarn

# Copiar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Rodar em desenvolvimento (Vite HMR)
yarn dev

# Build de produção
yarn build
yarn start
```

## Endpoints

### Auth
- `POST /api/auth/register` — `{ name, pin }`
- `POST /api/auth/login` — `{ name, pin }` → retorna JWT

### Matches (autenticado)
- `GET /api/matches` — Lista jogos importados
- `POST /api/matches/sync` — Trigger manual de sync com API-Football
- `POST /api/matches/sync-live` — Sync de jogos ao vivo

### Guesses (autenticado)
- `POST /api/guesses` — `{ matchId, homeScore, awayScore }`
- `GET /api/guesses/me` — Palpites do usuário logado

### Ranking (autenticado)
- `GET /api/ranking` — Classificação geral

## Sistema de Pontos

| Acerto | Pontos |
|--------|--------|
| Placar exato | 5 |
| Empate (não exato) | 3 |
| Vencedor + 1 gol certo | 2 |
| Apenas vencedor | 1 |
| Errou tudo | 0 |
