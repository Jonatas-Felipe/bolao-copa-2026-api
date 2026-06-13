# Documentação da API — Bolão Copa 2026

Base URL: `http://localhost:3002`

---

## Autenticação

Todos os endpoints (exceto registro, login, teams e groups) exigem o header:
```
Authorization: Bearer <token>
```

O token JWT expira em **6 meses** (180 dias) — cobre toda a duração da Copa.

---

## Endpoints

### 1. Registro de Usuário

```
POST /api/auth/register
```

**Body:**
```json
{
  "name": "Felipe",
  "pin": "1234"
}
```

**Resposta 201:**
```json
{
  "id": "uuid-do-usuario",
  "name": "Felipe",
  "points": 0,
  "createdAt": "2026-06-12T00:00:00.000Z"
}
```

**Erros:**
- `400` — PIN deve ter no mínimo 4 caracteres
- `409` — Nome de usuário já existe

---

### 2. Login

```
POST /api/auth/login
```

**Body:**
```json
{
  "name": "Felipe",
  "pin": "1234"
}
```

**Resposta 200:**
```json
{
  "user": {
    "id": "uuid-do-usuario",
    "name": "Felipe",
    "points": 10
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Erros:**
- `401` — Credenciais inválidas

---

### 3. Logout

```
POST /api/auth/logout
```

**Headers:** `Authorization: Bearer <token>`

**Resposta 200:**
```json
{
  "message": "Logout realizado com sucesso"
}
```

Revoga o token no banco — ele não poderá mais ser usado para autenticação.

---

### 4. Listar Jogos (com paginação)

```
GET /api/matches?page=1&limit=20&type=group&group=A&finished=false
```

**Headers:** `Authorization: Bearer <token>`

**Query params (todos opcionais):**
- `page` — página (default: 1)
- `limit` — itens por página (default: 20)
- `type` — filtrar por fase: `group`, `round_of_32`, `round_of_16`, `quarter`, `semi`, `final`
- `group` — filtrar por grupo: `A`, `B`, `C`, etc.
- `finished` — `true` para jogos finalizados, `false` para pendentes

**Resposta 200:**
```json
{
  "matches": [
    {
      "id": "1",
      "homeTeamName": "Mexico",
      "awayTeamName": "South Africa",
      "homeFlag": "https://flagcdn.com/w80/mx.png",
      "awayFlag": "https://flagcdn.com/w80/za.png",
      "homeScore": "2",
      "awayScore": "0",
      "group": "A",
      "matchday": "1",
      "date": "2026-06-11T13:00:00.000Z",
      "finished": true,
      "timeElapsed": "finished",
      "type": "group"
    }
  ],
  "total": 104,
  "page": 1,
  "totalPages": 6
}
```

**Campos importantes:**
- `id` — ID do jogo (usar no palpite como `matchId`)
- `homeTeamName` / `awayTeamName` — nomes dos times em **português** (ex: "Brasil", "Alemanha")
- `homeFlag` / `awayFlag` — URL da bandeira (imagem PNG 80px)
- `homeScore` / `awayScore` — placar (string ou `null` se não começou)
- `finished` — `true` ou `false` (boolean)
- `timeElapsed` — `"finished"`, `"notstarted"`, ou minuto atual (ex: `"45'"`)
- `date` — data/hora em ISO 8601 (UTC)
- `type` — `"group"`, `"round_of_32"`, `"round_of_16"`, `"quarter"`, `"semi"`, `"final"`, etc.
- `page` / `total` / `totalPages` — dados de paginação no objeto raiz

---

### 5. Listar Times

```
GET /api/teams
```

**Sem autenticação necessária.**

**Resposta 200:**
```json
[
  {
    "id": "2",
    "name_en": "South Africa",
    "name_fa": "آفریقای جنوبی",
    "flag": "https://flagcdn.com/w80/za.png",
    "fifa_code": "RSA",
    "iso2": "ZA",
    "groups": "A"
  }
]
```

**Campos importantes:**
- `id` — ID do time (referenciado em `home_team_id` / `away_team_id` dos jogos)
- `flag` — URL da bandeira do país (imagem PNG 80px)
- `fifa_code` — código FIFA (3 letras)
- `groups` — grupo na fase de grupos

---

### 6. Listar Grupos (Classificação)

```
GET /api/groups
```

**Sem autenticação necessária.**

**Resposta 200:**
```json
[
  {
    "name": "A",
    "teams": [
      {
        "team_id": "1",
        "mp": "1",
        "w": "1",
        "l": "0",
        "d": "0",
        "pts": "3",
        "gf": "2",
        "ga": "0",
        "gd": "2"
      }
    ]
  }
]
```

**Campos dos times no grupo:**
- `mp` — matches played
- `w` / `l` / `d` — wins / losses / draws
- `pts` — pontos
- `gf` / `ga` / `gd` — goals for / goals against / goal difference

---

### 7. Criar/Atualizar Palpite

```
POST /api/guesses
```

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "matchId": "1",
  "homeScore": 2,
  "awayScore": 1
}
```

**Resposta 201:**
```json
{
  "id": "uuid-do-palpite",
  "homeScore": 2,
  "awayScore": 1,
  "userId": "uuid-do-usuario",
  "matchId": "1"
}
```

**Erros:**
- `403` — Tempo esgotado (jogo começa em menos de 30 minutos) ou jogo já finalizado
- `404` — Jogo não encontrado

**Regra:** Se o usuário já tem palpite para aquele jogo, o palpite é **atualizado** (não duplica).

---

### 8. Meus Palpites

```
GET /api/guesses/me
```

**Headers:** `Authorization: Bearer <token>`

**Resposta 200:**
```json
[
  {
    "id": "uuid-do-palpite",
    "homeScore": 2,
    "awayScore": 1,
    "userId": "uuid-do-usuario",
    "matchId": "1"
  }
]
```

> **Nota:** Os dados do jogo (nome dos times, placar real, etc.) devem ser buscados via `GET /api/matches` e cruzados pelo `matchId` no frontend.

---

### 9. Palpites dos Participantes por Jogo

```
GET /api/guesses/match/:matchId
```

**Headers:** `Authorization: Bearer <token>`

**Resposta 200:**
```json
[
  {
    "id": "uuid-do-palpite",
    "userName": "Ana",
    "homeScore": 2,
    "awayScore": 1,
    "points": 7
  },
  {
    "id": "uuid-do-palpite",
    "userName": "Carlos",
    "homeScore": 1,
    "awayScore": 0,
    "points": 1
  }
]
```

**Campos:**
- `userName` — nome do participante
- `homeScore` / `awayScore` — palpite do participante
- `points` — pontos que o participante fez neste palpite (0 se o jogo não acabou)

**Erros:**
- `403` — Os palpites só ficam visíveis após o início do jogo
- `404` — Jogo não encontrado

**Regra:** Retorna apenas os palpites dos **outros** participantes (exclui o palpite do usuário autenticado). Ordenado por pontos decrescente. Útil para exibir um modal quando o jogo está rolando ou já passou.

---

### 10. Ranking

```
GET /api/ranking
```

**Headers:** `Authorization: Bearer <token>`

**Resposta 200:**
```json
[
  { "id": "uuid-1", "name": "Felipe", "points": 15 },
  { "id": "uuid-2", "name": "Ana", "points": 12 },
  { "id": "uuid-3", "name": "Carlos", "points": 8 }
]
```

Ordenado por pontos decrescente. Pontos são calculados comparando palpites com resultados sincronizados no banco.

---

### 11. Sincronizar Jogos

```
POST /api/matches/sync
```

**Sem autenticação necessária.**

Puxa todos os jogos da API worldcup26.ir e atualiza o banco local.

**Resposta 200:**
```json
{ "created": 104, "updated": 0 }
```

> **Nota:** Também roda automaticamente via cron a cada 5 minutos (junto com o recálculo de pontuação).

---

## Sistema de Pontuação

| Acerto | Pontos |
|--------|--------|
| Placar exato (ex: apostou 2x1 e deu 2x1) | **7** |
| Acertou o vencedor e o saldo de gols (ex: apostou 2x1, deu 3x2) | **5** |
| Acertou o empate com saldo de gol errado (ex: apostou 1x1, deu 2x2) | **3** |
| Acertou o placar do perdedor (ex: apostou 2x1, deu 3x1) | **2** |
| Acertou apenas quem venceu a partida (ex: apostou 3x0, deu 1x0) | **1** |
| Errou tudo | **0** |

---

## Fluxo de Uso Sugerido para o Frontend

1. **Tela de Login/Registro** — Usuário informa nome + PIN (4 dígitos). Salvar o `token` retornado (localStorage ou secure storage).
2. **Tela de Jogos** — `GET /api/matches?page=1&limit=20` → mostrar lista paginada. Bandeiras já vêm como URL no campo `homeFlag`/`awayFlag`. Nomes dos times vêm em **português**. Para cada jogo com `finished === false`, permitir input de placar.
3. **Filtros** — Usar query params: `?type=group&group=A` para fase de grupos do grupo A, `?finished=true` para jogos encerrados.
4. **Enviar Palpite** — `POST /api/guesses` ao confirmar. Desabilitar input se o jogo começa em menos de 30min.
5. **Tela Meus Palpites** — `GET /api/guesses/me` → palpites do usuário. Cruzar `matchId` com dados de matches para exibir info do jogo.
6. **Modal Palpites dos Outros** — `GET /api/guesses/match/:matchId` → exibir palpites dos outros participantes quando o jogo está rolando ou já acabou. Mostra nome, palpite e pontuação.
7. **Tela Ranking** — `GET /api/ranking` → tabela com posição, nome e pontos.
8. **Tela Grupos** — `GET /api/groups` + `GET /api/teams` → montar tabela de classificação por grupo.
9. **Sync inicial** — Na primeira vez, chamar `POST /api/matches/sync` para popular o banco. Depois o cron mantém atualizado.

---

## Tratamento de Erros

Todas as respostas de erro seguem o formato:
```json
{
  "message": "Descrição do erro"
}
```

| Status | Significado |
|--------|-------------|
| `400` | Dados inválidos |
| `401` | Token ausente/inválido ou credenciais erradas |
| `403` | Ação não permitida (ex: tempo esgotado para palpite) |
| `404` | Recurso não encontrado |
| `409` | Conflito (nome já existe) |
| `500` | Erro interno |

---

## Notas Técnicas

- **Fonte dos dados:** API aberta [worldcup26.ir](https://worldcup26.ir) — sem necessidade de API key
- **Sync automático:** Os jogos são sincronizados para o banco local a cada 5 minutos via cron. A pontuação também é recalculada no mesmo intervalo. Respostas de `/api/matches` vêm do banco (rápido + paginação)
- **Base URL de produção:** configurar via variável de ambiente no app
- **Token:** JWT com expiração de 6 meses — armazenar de forma segura
- **Datas:** formato ISO 8601 (UTC) — converter para timezone local no frontend
- **Bandeiras:** campos `homeFlag`/`awayFlag` retornam URL de imagem PNG (ex: `https://flagcdn.com/w80/br.png`)
- **IDs:** os `matchId` são strings numéricas (ex: `"1"`, `"32"`)
- **Nomes dos times:** retornados em português (ex: "Brasil", "Alemanha", "França"). A tradução é feita no sync.
