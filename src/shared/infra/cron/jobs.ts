import cron from 'node-cron'
import { SyncMatchesService } from '@modules/matches/services/SyncMatchesService.js'
import { RecalculateAllPointsService } from '@modules/ranking/services/RecalculateAllPointsService.js'
import { getIO } from '@shared/infra/http/socket.js'

export function startCronJobs(): void {
  const syncService = new SyncMatchesService()
  const recalcService = new RecalculateAllPointsService()

  // Sync de jogos e recálculo de pontuação a cada 5 minutos
  cron.schedule('*/5 * * * *', async () => {
    try {
      const result = await syncService.execute()
      if (result.created > 0 || result.updated > 0) {
        console.log(`[CRON] Sync: ${result.created} criados, ${result.updated} atualizados`)
        getIO().emit('matches:updated', result)
      }
    } catch (err) {
      console.error('[CRON] Erro na sincronização:', err)
    }

    try {
      const count = await recalcService.execute()
      console.log(`[CRON] Pontuação recalculada para ${count} usuários`)
      getIO().emit('ranking:updated', { recalculated: count })
    } catch (err) {
      console.error('[CRON] Erro no recálculo de pontos:', err)
    }
  })

  console.log('[CRON] Jobs agendados: sync + pontuação (5min)')
}
