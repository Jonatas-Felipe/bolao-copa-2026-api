import { worldCupApi, GroupResponse } from '@config/worldCupApi.js'

export class ListGroupsService {
  async execute(): Promise<GroupResponse[]> {
    const { data } = await worldCupApi.get<{ groups: GroupResponse[] }>('/get/groups')
    return data.groups
  }
}
