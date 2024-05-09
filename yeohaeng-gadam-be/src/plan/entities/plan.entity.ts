import { Room } from "src/room-tag/entities/room.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Plan extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    day: number;

    @ManyToOne(() => Room, room => room.plans)
    @JoinColumn([{ name: "room_id", referencedColumnName: "id" }])
    room_id: Room;

    @Column()
    plans: string;
}
