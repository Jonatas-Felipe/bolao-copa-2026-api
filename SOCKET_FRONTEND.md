# Integração Socket.IO — Frontend

## O que é

O backend agora emite eventos em tempo real via Socket.IO. O frontend deve escutar esses eventos para atualizar a UI automaticamente (ranking, placares, palpites) sem precisar de pull manual ou refresh.

---

## 1. Instalar dependência

```bash
npm install socket.io-client
# ou
yarn add socket.io-client
```

---

## 2. Criar hook/serviço de conexão

```typescript
// src/services/socket.ts (ou src/hooks/useSocket.ts)
import { io, Socket } from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'

export const socket: Socket = io(API_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
})
```

> A conexão Socket.IO usa a **mesma URL** da API REST — não precisa de porta ou path diferente.

---

## 3. Eventos disponíveis

| Evento | Payload | Quando é emitido |
|--------|---------|------------------|
| `matches:updated` | `{ created: number, updated: number }` | Jogos atualizados (a cada 5 min via cron) |
| `ranking:updated` | `{ recalculated: number }` | Pontuação recalculada (cron ou manual) |
| `guess:created` | `{ matchId: string, userId: string }` | Alguém criou/atualizou um palpite |

---

## 4. Implementação sugerida (React)

### Provider global (inicializa uma vez)

```tsx
// src/contexts/SocketContext.tsx
import { createContext, useContext, useEffect } from 'react'
import { socket } from '../services/socket'

const SocketContext = createContext(socket)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    socket.connect()
    return () => { socket.disconnect() }
  }, [])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
```

```tsx
// main.tsx ou App.tsx
import { SocketProvider } from './contexts/SocketContext'

function App() {
  return (
    <SocketProvider>
      {/* resto do app */}
    </SocketProvider>
  )
}
```

### Hook para escutar eventos

```tsx
// src/hooks/useSocketEvent.ts
import { useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'

export function useSocketEvent(event: string, handler: (data: any) => void) {
  const socket = useSocket()

  useEffect(() => {
    socket.on(event, handler)
    return () => { socket.off(event, handler) }
  }, [socket, event, handler])
}
```

---

## 5. Onde usar cada evento

### Tela de Jogos (`matches:updated`)

```tsx
import { useSocketEvent } from '../hooks/useSocketEvent'
import { useCallback } from 'react'

function MatchesList() {
  const refetchMatches = useCallback(() => {
    // chamar sua função que faz GET /api/matches
    fetchMatches()
  }, [])

  useSocketEvent('matches:updated', refetchMatches)

  // ... render
}
```

### Tela de Ranking (`ranking:updated`)

```tsx
function RankingPage() {
  const refetchRanking = useCallback(() => {
    fetchRanking() // GET /api/ranking
  }, [])

  useSocketEvent('ranking:updated', refetchRanking)

  // ... render
}
```

### Tela/Modal de Palpites de um Jogo (`guess:created`)

```tsx
function MatchGuessesModal({ matchId }: { matchId: string }) {
  const handleNewGuess = useCallback((data: { matchId: string }) => {
    if (data.matchId === matchId) {
      fetchMatchGuesses(matchId) // GET /api/guesses/match/:matchId
    }
  }, [matchId])

  useSocketEvent('guess:created', handleNewGuess)

  // ... render
}
```

---

## 6. Com React Query / TanStack Query

Se estiver usando React Query, basta invalidar a query no evento:

```tsx
import { useQueryClient } from '@tanstack/react-query'

function useRealtimeSync() {
  const queryClient = useQueryClient()

  useSocketEvent('matches:updated', () => {
    queryClient.invalidateQueries({ queryKey: ['matches'] })
  })

  useSocketEvent('ranking:updated', () => {
    queryClient.invalidateQueries({ queryKey: ['ranking'] })
  })

  useSocketEvent('guess:created', ({ matchId }) => {
    queryClient.invalidateQueries({ queryKey: ['guesses', matchId] })
  })
}
```

Chamar `useRealtimeSync()` uma vez no componente raiz ou no layout.

---

## 7. Checklist

- [ ] Instalar `socket.io-client`
- [ ] Criar serviço de conexão apontando para a URL da API
- [ ] Montar provider/hook para escutar eventos
- [ ] Tela de **Jogos** → escutar `matches:updated` → re-fetch jogos
- [ ] Tela de **Ranking** → escutar `ranking:updated` → re-fetch ranking
- [ ] Modal/Tela de **Palpites por jogo** → escutar `guess:created` → re-fetch palpites do jogo
- [ ] (Opcional) Indicador visual de "conexão ativa" (ícone verde/vermelho)

---

## Notas importantes

- **Sem autenticação no socket** — a conexão é aberta, só recebe dados
- **Não emitir nada** — o frontend apenas escuta, nunca manda eventos
- **Padrão re-fetch** — usar os eventos como trigger para re-buscar via REST (não trafega dados sensíveis pelo socket)
- **Reconexão automática** — o `socket.io-client` reconecta sozinho se cair
- **Mesma porta** — Socket.IO roda na mesma porta da API (3002), sem config extra
