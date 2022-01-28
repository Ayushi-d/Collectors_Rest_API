import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

// eslint-disable-next-line import/no-cycle
import User from './User';

const PaymentOptions = {
  STRIPE: 'STRIPE',
};

@Entity()
export default class PaymentMethod {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'default_payment',
    default: PaymentOptions.STRIPE,
    length: 50,
  })
  defaultPayment: string;

  @Exclude()
  @Column('varchar', {
    name: 'additional_information',
    nullable: true,
    length: 100,
  })
  additionalInformation: string;

  @Exclude()
  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    name: 'user_id',
    nullable: false,
  })
  public userId: number;

  @OneToOne(() => User, (user) => user.paymentMethod)
  @JoinColumn({ name: 'user_id' })
  public user: User;

}
