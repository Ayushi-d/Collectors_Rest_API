import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import Permission from './Permission';

@Entity()
export default class Role {

  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    name: 'name',
    nullable: false,
    length: 50,
  })
  name: string;

  @Exclude()
  @Column('varchar', {
    name: 'description',
    nullable: false,
    length: 100,
  })
  description: string;

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

  @ManyToMany(() => Permission, { eager: true })
  @JoinTable({
    name: 'roles_permissions',
    joinColumns: [
      { name: 'role_id' },
    ],
    inverseJoinColumns: [
      { name: 'permission_id' },
    ],
  })
  permissions: Permission[];

}
