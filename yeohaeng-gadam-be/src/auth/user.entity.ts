import { Board } from 'src/boards/board.entity';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Unique, OneToMany } from 'typeorm';

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
