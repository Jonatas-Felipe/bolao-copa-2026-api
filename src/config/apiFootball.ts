import axios from 'axios'

export const apiFootball = axios.create({
  baseURL: process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io',
  headers: {
    'x-apisports-key': process.env.API_FOOTBALL_KEY || '',
  },
})

export const API_FOOTBALL_LEAGUE_ID = 1 // FIFA World Cup
export const API_FOOTBALL_SEASON = 2026
