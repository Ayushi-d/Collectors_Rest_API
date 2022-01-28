import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne,  JoinColumn, OneToMany,
} from 'typeorm';

import Category from './Category';
import Uploads from "./Uploads";

@Entity()
export default class SubCategory {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text', {
        nullable: true,
    })
    title?: string;

    @Column('boolean', {
        name: 'enable',
        default: true,
    })
    enable: boolean;

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
        name: 'category_id',
        nullable: true,
    })
    public categoryId: number;

    @ManyToOne(() => Category, (category) => category.subCategories)
    @JoinColumn({ name: 'category_id' })
    public category: Category;

    @OneToMany(() => Uploads, (uploads) => uploads.subCategory)
    public uploads: Uploads[];
}
