import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToMany,
  ManyToMany,
  JoinTable, getRepository,
  BaseEntity
} from 'typeorm';

import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

import Role from './Role';
// eslint-disable-next-line import/no-cycle
import PaymentMethod from './PaymentMethod';
// eslint-disable-next-line import/no-cycle
import Notification from './Notification';
import Uploads from './Uploads';

const saltRounds = 10;

@Entity()
export default class User extends BaseEntity {

  public static hashPassword(password: string | undefined): Promise<string> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line consistent-return
      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
          return reject(err);
        }
        resolve(hash);
      });
    });
  }

  public static comparePassword(user: User, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (user.password != null) {
        // eslint-disable-next-line consistent-return
        bcrypt.compare(password, user.password, (err, res) => {
          resolve(res);
          if (err) {
            return reject(err);
          }
        });
      }
    });
  }

  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @Column('varchar', {
    nullable: false,
    length: 100,
  })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @Column('varchar', {
    nullable: false,
    length: 100,
    unique: true,
  })
  email?: string;

  @IsNotEmpty()
  @Column('varchar', {
    nullable: false,
    length: 100,
    unique: true,
  })
  username?: string;

  @IsNotEmpty()
  @Exclude()
  @Column('varchar', {
    nullable: false,
  })
  password?: string;

  @Column('varchar', {
    nullable: true,
  })
  address?: string;

  @Column('varchar', {
    nullable: true,
  })
  city?: string;

  @Column('varchar', {
    name: 'zip_code',
    nullable: true,
  })
  zipCode?: string;

  @Column('varchar', {
    nullable: true,
  })
  country?: string;

  @Column('bigint', {
    name: 'phone_number',
    nullable: true,
  })
  phoneNumber?: bigint;

  @Column('varchar', {
    name: 'referral_code',
    nullable: false,
    length: 100,
  })
  referralCode?: string;

  @Column('varchar', {
    name: 'paypal_email',
    nullable: true,
  })
  paypalEmail: string;

  @Column('text', {
    nullable: true,
  })
  token: string;

  @Column('text', {
    nullable: true,
  })
  refreshToken: string;

  @Column('text', {
    nullable: true,
  })
  userBio: string;

  @Column('boolean', {
    name: 'notification_enable',
    default: true,
  })
  notificationEnable: boolean;

  @Column('varchar', {
    name: 'facebook_id',
    nullable: true,
  })
  facebookId: string;

  @Column('varchar', {
    name: 'google_id',
    nullable: true,
  })
  googleId: string;

  @Column('varchar', {
    name: 'latitude',
    nullable: true,
  })
  latitude: string;

  @Column('varchar', {
    name: 'longitude',
    nullable: true,
  })
  longitude: string;

  @Column('varchar', {
    name: 'profile_image',
    nullable: true,
    default: 'user-profile.png',
  })
  profileImage?: string;

  @Column('varchar', {
    name: 'is_social_auth',
    default: false,
  })
  isSocialAuth: boolean;

  @Column('boolean', {
    default: true,
  })
  enabled: boolean;

  @Column('boolean', {
    name: 'email_verified',
    default: false,
  })
  emailVerified: boolean;

  @Column('int', {
    name: 'total_referrals',
    default: 0,
  })
  totalReferrals: number;

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

  @ManyToMany(() => Role, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumns: [
      { name: 'user_id' },
    ],
    inverseJoinColumns: [
      { name: 'role_id' },
    ],
  })
  roles: Role[];

  @OneToMany(() => PaymentMethod, (paymentMethod) => paymentMethod.user)
  public paymentMethod: PaymentMethod;

  @OneToMany(() => Notification, (notification) => notification.user)
  public notifications: Notification[];

  @OneToMany(() => Uploads, (uploads) => uploads.user)
  public uploads: Uploads[];

  public toString(): string {
    return `${this.name} (${this.email})`;
  }

  @BeforeInsert()
  public async hashPassword(): Promise<void> {
    this.password = await User.hashPassword(this.password);
  }

}
