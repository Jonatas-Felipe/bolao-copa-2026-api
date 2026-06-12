import { AppDataSource } from '@shared/infra/typeorm/data-source.js'
import { Match } from '@modules/matches/infra/typeorm/entities/Match.js'
import { worldCupApi, GameResponse, TeamResponse } from '@config/worldCupApi.js'

export class SyncMatchesService {
  async execute(): Promise<{ created: number; updated: number }> {
    const matchRepo = AppDataSource.getRepository(Match)

    const [gamesRes, teamsRes] = await Promise.all([
      worldCupApi.get<{ games: GameResponse[] }>('/get/games'),
      worldCupApi.get<{ teams: TeamResponse[] }>('/get/teams'),
    ])

    const teamsMap = new Map(teamsRes.data.teams.map((t) => [t.id, t]))

    let created = 0
    let updated = 0

    for (const game of gamesRes.data.games) {
      const homeTeam = teamsMap.get(game.home_team_id)
      const awayTeam = teamsMap.get(game.away_team_id)

      // Parse date: "MM/DD/YYYY HH:mm"
      const [datePart, timePart] = game.local_date.split(' ')
      const [month, day, year] = datePart.split('/')
      const date = new Date(`${year}-${month}-${day}T${timePart}:00`)

      const matchData: Partial<Match> = {
        id: game.id,
        homeTeamName: game.home_team_name_en || null,
        awayTeamName: game.away_team_name_en || null,
        homeFlag: homeTeam?.flag || null,
        awayFlag: awayTeam?.flag || null,
        homeScore: game.home_score === 'null' ? null : game.home_score,
        awayScore: game.away_score === 'null' ? null : game.away_score,
        group: game.group || null,
        matchday: game.matchday,
        date,
        finished: game.finished === 'TRUE',
        timeElapsed: game.time_elapsed || 'notstarted',
        type: game.type,
      }

      const existing = await matchRepo.findOneBy({ id: game.id })

      if (!existing) {
        await matchRepo.save(matchRepo.create(matchData))
        created++
      } else {
        await matchRepo.update(game.id, matchData)
        updated++
      }
    }

    return { created, updated }
  }
}
