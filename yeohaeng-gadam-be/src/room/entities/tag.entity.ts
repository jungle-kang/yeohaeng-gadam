import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Room } from "./room.entity";

@Index("room_id", ["roomId"], {})
@Entity("tag", { schema: "yeohaeng_gadam" })
export class Tag {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("bigint", { name: "room_id" })
  roomId: string;

  @Column("int", { name: "tag", comment: "테마 번호" })
  tag: number;

  @ManyToOne(() => Room, (room) => room.tags, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "room_id", referencedColumnName: "id" }])
  room: Room;
}
