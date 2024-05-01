import { Unique, BaseEntity, Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";

@Unique(['username'])
@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;
}