import {
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';

// eslint-disable-next-line import/no-cycle
import User from './User';

@Entity()
export default class Notification {

  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', {
    nullable: true,
  })
  title?: string;

  @Column('text', {
    nullable: true,
  })
  message?: string;

  @Column('boolean', {
    name: 'read_status',
    default: false,
  })
  readStatus: boolean;

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

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'user_id' })
  public user: User;

}
