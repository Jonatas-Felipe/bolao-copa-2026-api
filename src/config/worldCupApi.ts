import axios from 'axios'

export const worldCupApi = axios.create({
  baseURL: 'https://worldcup26.ir',
  timeout: 30000,
})

export interface GameResponse {
  id: string
  home_team_id: string
  away_team_id: string
  home_score: string
  away_score: string
  home_scorers: string
  away_scorers: string
  group: string
  matchday: string
  local_date: string
  stadium_id: string
  finished: string
  time_elapsed: string
  type: string
  home_team_name_en: string
  home_team_name_fa: string
  away_team_name_en: string
  away_team_name_fa: string
}

export interface TeamResponse {
  id: string
  name_en: string
  name_fa: string
  flag: string
  fifa_code: string
  iso2: string
  groups: string
}

export interface StadiumResponse {
  id: string
  name_en: string
  city_en: string
  country_en: string
}

export interface GroupTeam {
  team_id: string
  mp: string
  w: string
  l: string
  d: string
  pts: string
  gf: string
  ga: string
  gd: string
}

export interface GroupResponse {
  name: string
  teams: GroupTeam[]
}
