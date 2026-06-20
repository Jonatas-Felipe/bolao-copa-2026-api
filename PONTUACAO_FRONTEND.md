# Nova Pontuação + Peso — Mudanças no Frontend

## O que mudou no backend

### 1. Nova tabela de pontos base

| Acerto | Pontos |
|--------|--------|
| Placar exato (ex: apostou 2x1 e deu 2x1) | **25** |
| Acertou o placar do vencedor (ex: apostou 2x1, deu 2x0) | **18** |
| Acertou o vencedor e o saldo de gols (ex: apostou 2x1, deu 3x2) | **15** |
| Acertou o placar do perdedor (ex: apostou 2x1, deu 3x1) | **12** |
| Acertou o empate com saldo errado (ex: apostou 1x1, deu 2x2) | **11** |
| Acertou apenas quem venceu a partida | **10** |
| Colocou empate no palpite | **4** |
| Errou tudo | **0** |

### 2. Novo campo `weight` nos jogos (multiplicador)

Cada jogo agora possui um campo **`weight`** (número inteiro) que funciona como **multiplicador** da pontuação.

- O peso começa em **10** no primeiro dia da Copa (11/06/2026)
- Sobe **+1 a cada dia** do torneio
- Jogos de fases mais avançadas valem mais por estarem em dias posteriores

**Fórmula:** `pontos_finais = pontos_base × weight`

### 3. Exemplos práticos

| Situação | Pontos base | Peso | Total |
|----------|------------|------|-------|
| Placar exato em 11/06 | 25 | 10 | **250** |
| Placar exato em 20/06 | 25 | 19 | **475** |
| Placar exato na final (19/07) | 25 | 48 | **1200** |
| Só acertou vencedor em 11/06 | 10 | 10 | **100** |
| Só acertou vencedor na final | 10 | 48 | **480** |
| Errou tudo | 0 | qualquer | **0** |

---

## O que muda na API

### `GET /api/matches` — novo campo

O objeto de cada jogo agora inclui o campo `weight`:

```json
{
  "id": "1",
  "homeTeamName": "México",
  "awayTeamName": "África do Sul",
  "homeScore": "2",
  "awayScore": "0",
  "finished": true,
  "date": "2026-06-11T13:00:00.000Z",
  "weight": 10,
  "..."
}
```

### `GET /api/guesses/match/:matchId` — pontos já multiplicados

Os pontos retornados já vêm com o peso aplicado:

```json
[
  {
    "userName": "Ana",
    "homeScore": 2,
    "awayScore": 0,
    "points": 250
  }
]
```

### `GET /api/ranking` — pontos já multiplicados

O ranking já retorna os totais com peso aplicado:

```json
[
  { "name": "Felipe", "points": 1580 },
  { "name": "Ana", "points": 1230 }
]
```

---

## O que precisa mudar no frontend

### 1. Exibir o peso do jogo (obrigatório)

Na tela de jogos, mostrar o peso de cada partida para o usuário entender o multiplicador:

```tsx
// Exemplo: badge ao lado do jogo
<span className="weight-badge">×{match.weight}</span>
```

### 2. Atualizar tela de regras/pontuação (obrigatório)

Se existir uma tela ou modal com as regras do bolão, atualizar com a nova tabela (25, 18, 15, 12, 11, 10, 4) e explicar o multiplicador.

### 3. Ranking — nenhuma mudança de código necessária

Os pontos já vêm calculados do backend (base × peso). Apenas exibir normalmente.

### 4. Palpites por jogo — nenhuma mudança de código necessária

Os pontos por palpite já vêm multiplicados pelo peso. Apenas exibir normalmente.

### 5. Sugestão visual (opcional)

Mostrar breakdown na UI do palpite:

```
Placar exato: 25 pts × 19 (peso) = 475 pts
```

Para isso, basta fazer `pontos_exibidos / match.weight` para obter os pontos base, ou hardcodar os valores base no frontend.

---

## Checklist

- [ ] Exibir campo `weight` na tela de jogos (badge, tooltip, etc.)
- [ ] Atualizar regras do bolão com nova tabela de pontos
- [ ] Verificar que os números maiores não quebram o layout do ranking
- [ ] (Opcional) Mostrar breakdown: pontos base × peso = total
- [ ] (Opcional) Destacar visualmente jogos com peso alto (knockout stages)

---

## Notas

- **Nenhuma mudança nos endpoints** — mesmos URLs, mesmos métodos
- **Nenhuma mudança na autenticação** — tudo igual
- **Os pontos de todos os jogos anteriores serão recalculados** — chamar `POST /api/ranking/recalculate` após o deploy
- **O peso é calculado automaticamente** com base na data do jogo vs dia 1 da Copa (11/06)
