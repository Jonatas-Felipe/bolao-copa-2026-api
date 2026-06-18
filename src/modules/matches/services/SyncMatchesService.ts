import { AppDataSource } from '@shared/infra/typeorm/data-source.js'
import { Match } from '@modules/matches/infra/typeorm/entities/Match.js'
import { worldCupApi, GameResponse, TeamResponse, StadiumResponse } from '@config/worldCupApi.js'
import { getTeamNamePtBr } from '@modules/matches/utils/countryFlags.js'

// UTC offsets during June/July (DST) for World Cup 2026 host cities
const cityUtcOffset: Record<string, number> = {
  'Miami (Miami Gardens)': -4,
  'New York/New Jersey (East Rutherford)': -4,
  'Philadelphia': -4,
  'Boston (Foxborough)': -4,
  'Atlanta': -4,
  'Toronto': -4,
  'Houston': -5,
  'Dallas (Arlington, Texas)': -5,
  'Kansas City': -5,
  'Mexico City': -6,
  'Guadalajara (Zapopan)': -6,
  'Monterrey (Guadalupe)': -6,
  'Seattle': -7,
  'San Francisco Bay Area (Santa Clara)': -7,
  'Los Angeles (Inglewood)': -7,
  'Vancouver': -7,
}

function localDateToUtc(dateStr: string, cityName: string | undefined): Date {
  // Parse "MM/DD/YYYY HH:mm"
  const [datePart, timePart] = dateStr.split(' ')
  const [month, day, year] = datePart.split('/')
  const offset = cityName ? (cityUtcOffset[cityName] ?? -5) : -5
  // Build ISO string with offset
  const sign = offset <= 0 ? '-' : '+'
  const absOffset = Math.abs(offset)
  const offsetStr = `${sign}${String(absOffset).padStart(2, '0')}:00`
  return new Date(`${year}-${month}-${day}T${timePart}:00${offsetStr}`)
}

export class SyncMatchesService {
  async execute(): Promise<{ created: number; updated: number }> {
    const matchRepo = AppDataSource.getRepository(Match)

    const [gamesRes, teamsRes, stadiumsRes] = await Promise.all([
      worldCupApi.get<{ games: GameResponse[] }>('/get/games'),
      worldCupApi.get<{ teams: TeamResponse[] }>('/get/teams'),
      worldCupApi.get<{ stadiums: StadiumResponse[] }>('/get/stadiums'),
    ])

    const teamsMap = new Map(teamsRes.data.teams.map((t) => [t.id, t]))
    const stadiumsMap = new Map(stadiumsRes.data.stadiums.map((s) => [s.id, s]))

    let created = 0
    let updated = 0

    for (const game of gamesRes.data.games) {
      const homeTeam = teamsMap.get(game.home_team_id)
      const awayTeam = teamsMap.get(game.away_team_id)
      const stadium = stadiumsMap.get(game.stadium_id)

      const date = localDateToUtc(game.local_date, stadium?.city_en)

      const homeScore = game.home_score === 'null' || !game.home_score ? null : game.home_score
      const awayScore = game.away_score === 'null' || !game.away_score ? null : game.away_score
      const isFinished = game.finished?.toUpperCase() === 'TRUE' ||
        game.time_elapsed === 'finished' ||
        (homeScore !== null && awayScore !== null && game.time_elapsed !== 'notstarted')

      const matchData: Partial<Match> = {
        id: game.id,
        homeTeamName: getTeamNamePtBr(game.home_team_name_en) || null,
        awayTeamName: getTeamNamePtBr(game.away_team_name_en) || null,
        homeFlag: homeTeam?.flag || null,
        awayFlag: awayTeam?.flag || null,
        homeScore: homeScore,
        awayScore: awayScore,
        group: game.group || null,
        matchday: game.matchday,
        date,
        finished: isFinished,
        timeElapsed: game.time_elapsed || 'notstarted',
        type: game.type,
        venue: stadium ? `${stadium.name_en}, ${stadium.city_en}, ${stadium.country_en}` : null,
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
