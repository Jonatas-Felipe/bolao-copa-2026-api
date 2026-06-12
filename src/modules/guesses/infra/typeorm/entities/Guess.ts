import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm'
import { User } from '@modules/users/infra/typeorm/entities/User.js'

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

  @ManyToOne(() => User, (user) => user.guesses)
  @JoinColumn({ name: 'userId' })
  user: User
}
