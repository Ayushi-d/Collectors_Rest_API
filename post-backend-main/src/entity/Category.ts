import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import SubCategory from "./SubCategory";
import Uploads from "./Uploads";

@Entity()
export default class Category {

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

    @OneToMany(() => SubCategory, (subCategory) => subCategory.category)
    public subCategories: SubCategory[];

    @OneToMany(() => Uploads, (uploads) => uploads.category)
    public uploads: Uploads[];

}
