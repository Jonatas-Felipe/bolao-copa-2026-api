import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  type Relation,
} from 'typeorm'
import { Match } from '@modules/matches/infra/typeorm/entities/Match.js'

@Entity('guesses')
@Unique(['userId', 'matchId'])
export class Guess {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'int' })
  homeScore: number

  @Column({ type: 'int' })
  awayScore: number

  @Column({ type: 'varchar' })
  userId: string

  @Column({ type: 'int' })
  matchId: number

  @ManyToOne('User', 'guesses')
  @JoinColumn({ name: 'userId' })
  user: Relation<import('@modules/users/infra/typeorm/entities/User.js').User>

  @ManyToOne(() => Match)
  @JoinColumn({ name: 'matchId' })
  match: Relation<Match>
}
