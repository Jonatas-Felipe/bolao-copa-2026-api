import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  type Relation,
} from 'typeorm'

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

  @Column({ type: 'varchar' })
  matchId: string

  @ManyToOne('User', 'guesses')
  @JoinColumn({ name: 'userId' })
  user: Relation<import('@modules/users/infra/typeorm/entities/User.js').User>
}
