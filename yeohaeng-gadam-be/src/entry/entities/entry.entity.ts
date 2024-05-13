import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Room } from "../../room-tag/entities/room.entity";

@Index("room_id", ["room_id"], {})
@Entity("entry", { schema: "yeohaeng_gadam" })
export class Entry {
  @PrimaryGeneratedColumn({
    type: "bigint",
    name: "id",
    comment: "참가자 기본키",
  })
  id: string;

  @Column("bigint", { name: "room_id", comment: "방 기본키 참조" })
  room_id: string;

  @Column("varchar", {
    name: "user_id",
    comment: "사용자 기본키 참조",
    length: 255,
  })
  user_id: string;

  @Column("int", { name: "color", comment: "커서 색상" })
  color: number;

  @ManyToOne(() => Room, (room) => room.entries, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "room_id", referencedColumnName: "id" }])
  room: Room;
}
