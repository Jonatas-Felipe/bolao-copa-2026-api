import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  type Relation,
} from 'typeorm'

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

  @OneToMany('Guess', 'user')
  guesses: Relation<import('@modules/guesses/infra/typeorm/entities/Guess.js').Guess[]>

  @CreateDateColumn()
  createdAt: Date
}
