import { worldCupApi, TeamResponse } from '@config/worldCupApi.js'

export class ListTeamsService {
  async execute(): Promise<TeamResponse[]> {
    const { data } = await worldCupApi.get<{ teams: TeamResponse[] }>('/get/teams')
    return data.teams
  }
}
