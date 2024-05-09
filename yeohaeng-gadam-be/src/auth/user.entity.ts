// user.entity.ts
import { Board } from 'src/boards/board.entity';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Unique, OneToMany, Index } from 'typeorm';

@Index("IDX_e12875dfb3b1d92d7d7c5377e2", ["email"], { unique: true })
@Entity()
@Unique(['email'])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ nullable: true })
    picture: string;

    @OneToMany(type => Board, board => board.user, { eager: true })
    boards: Board[];
}
