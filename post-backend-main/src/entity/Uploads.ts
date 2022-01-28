import {
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BaseEntity
} from 'typeorm';

// eslint-disable-next-line import/no-cycle
import User from './User';
import Category from "./Category";
import SubCategory from "./SubCategory";

@Entity()
export default class Uploads extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text', {
      nullable: true,
    })
    title?: string;

    @Column('text', {
      nullable: true,
    })
    description?: string;

    @Column('boolean', {
      name: 'active',
      default: true,
    })
    readStatus: boolean;

    @Column('text', {
      nullable: false,
      array: true
    })
    images: string[];

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

    @Column({
        name: 'category_id',
        nullable: true,
    })
    categoryId?: number;

    @Column({
        name: 'sub_category_id',
        nullable: true,
    })
    subCategoryId?: number;

    @ManyToOne(() => User, (user) => user.uploads)
    @JoinColumn({ name: 'user_id' })
    public user: User;

    @ManyToOne(() => Category, (category) => category.uploads)
    @JoinColumn({ name: 'category_id' })
    public category: Category;

    @ManyToOne(() => SubCategory, (subCategories) => subCategories.uploads)
    @JoinColumn({ name: 'sub_category_id' })
    public subCategory: SubCategory;

}
