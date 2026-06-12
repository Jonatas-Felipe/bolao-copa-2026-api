import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm'
import { Guess } from '@modules/guesses/infra/typeorm/entities/Guess.js'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', unique: true })
  name: string

  @Column({ type: 'varchar' })
  pin: string // bcrypt hash

  @Column({ type: 'int', default: 0 })
  points: number

  @OneToMany(() => Guess, (guess) => guess.user)
  guesses: Guess[]

  @CreateDateColumn()
  createdAt: Date
}
