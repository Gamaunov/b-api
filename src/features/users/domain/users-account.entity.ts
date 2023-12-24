import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying', unique: true })
  login: string;

  @Column({ type: 'character varying' })
  passwordHash: string;

  @Column({ type: 'character varying', unique: true })
  email: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'boolean' })
  isMembership: boolean;

  @Column({ type: 'boolean' })
  isConfirmed: boolean;
}
