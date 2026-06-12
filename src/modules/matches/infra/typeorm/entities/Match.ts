import {
  Entity,
  PrimaryColumn,
  Column,
} from 'typeorm'

@Entity('matches')
export class Match {
  @PrimaryColumn({ type: 'varchar' })
  id: string

  @Column({ type: 'varchar', nullable: true })
  homeTeamName: string | null

  @Column({ type: 'varchar', nullable: true })
  awayTeamName: string | null

  @Column({ type: 'varchar', nullable: true })
  homeFlag: string | null

  @Column({ type: 'varchar', nullable: true })
  awayFlag: string | null

  @Column({ type: 'varchar', nullable: true })
  homeScore: string | null

  @Column({ type: 'varchar', nullable: true })
  awayScore: string | null

  @Column({ type: 'varchar', nullable: true })
  group: string | null

  @Column({ type: 'varchar' })
  matchday: string

  @Column({ type: 'timestamp' })
  date: Date

  @Column({ type: 'boolean', default: false })
  finished: boolean

  @Column({ type: 'varchar', default: 'notstarted' })
  timeElapsed: string

  @Column({ type: 'varchar' })
  type: string

  @Column({ type: 'varchar', nullable: true })
  venue: string | null
}
