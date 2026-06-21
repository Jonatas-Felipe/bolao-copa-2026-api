import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const baseInstance = axios.create({
  baseURL: 'https://worldcup26.ir',
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; BolaoCopa2026/1.0)',
  },
})

async function requestWithRetry<T>(
  instance: AxiosInstance,
  config: AxiosRequestConfig,
  retries = 3,
  delayMs = 2000,
): Promise<AxiosResponse<T>> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await instance.request<T>(config)
    } catch (err: any) {
      const isRetryable = ['ECONNRESET', 'ETIMEDOUT', 'ECONNABORTED', 'ERR_NETWORK'].includes(err?.code) ||
        err?.message?.includes('TLS') ||
        (err?.response?.status && err.response.status >= 500)
      if (!isRetryable || attempt === retries) throw err
      const wait = delayMs * Math.pow(2, attempt - 1)
      console.log(`[WorldCupAPI] Tentativa ${attempt} falhou (${err.code}). Retry em ${wait}ms...`)
      await new Promise((r) => setTimeout(r, wait))
    }
  }
  throw new Error('Unreachable')
}

export const worldCupApi = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return requestWithRetry<T>(baseInstance, { ...config, method: 'GET', url })
  },
}

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
