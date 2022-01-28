import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import User from './User';

@Entity()
export default class Otp {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    length: 50,
  })
  code: string;

  @Column('varchar', {
    nullable: false,
    length: 50,
  })
  type: string;

  @Column('boolean', {
    default: true,
  })
  enabled: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    name: 'user_id',
    nullable: true,
  })
  public userId: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  public user: User;

}
