import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm'
import { User } from '@modules/users/infra/typeorm/entities/User.js'

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  token: string

  @Column({ type: 'varchar' })
  userId: string

  @Column({ type: 'timestamp' })
  expiresAt: Date

  @Column({ type: 'boolean', default: false })
  revoked: boolean

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User

  @CreateDateColumn()
  createdAt: Date
}
