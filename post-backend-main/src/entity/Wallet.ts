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

const Currency = {
  USD: 'USD',
  EURO: 'EURO',
  CAD: 'CAD',
  AUD: 'AUD',
};

@Entity()
export default class Wallet {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: Currency.USD,
    length: 50,
  })
  currency: string;

  @Column({
    type: 'bigint',
    name: 'wallet_balance',
  })
  walletBalance: number;

  @Column({
    type: 'bigint',
    name: 'locked_balance',
  })
  lockedBalance: number;

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
