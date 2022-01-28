import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export default class Permission {

  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    name: 'key',
    nullable: false,
    length: 50,
  })
  key: string;

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


}
