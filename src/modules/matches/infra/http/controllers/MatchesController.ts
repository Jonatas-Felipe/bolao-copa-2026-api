import { Request, Response } from 'express'
import { ListMatchesService } from '@modules/matches/services/ListMatchesService.js'
import { ListTeamsService } from '@modules/matches/services/ListTeamsService.js'
import { ListGroupsService } from '@modules/matches/services/ListGroupsService.js'
import { SyncMatchesService } from '@modules/matches/services/SyncMatchesService.js'

export class MatchesController {
  async index(req: Request, res: Response): Promise<Response> {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const type = req.query.type as string | undefined
    const group = req.query.group as string | undefined
    const finished = req.query.finished !== undefined
      ? req.query.finished === 'true'
      : undefined

    const listMatches = new ListMatchesService()
    const result = await listMatches.execute({ page, limit, type, group, finished })

    return res.json(result)
  }

  async sync(req: Request, res: Response): Promise<Response> {
    const syncService = new SyncMatchesService()
    const result = await syncService.execute()
    return res.json(result)
  }

  async teams(req: Request, res: Response): Promise<Response> {
    const listTeams = new ListTeamsService()
    const teams = await listTeams.execute()
    return res.json(teams)
  }

  async groups(req: Request, res: Response): Promise<Response> {
    const listGroups = new ListGroupsService()
    const groups = await listGroups.execute()
    return res.json(groups)
  }
}
