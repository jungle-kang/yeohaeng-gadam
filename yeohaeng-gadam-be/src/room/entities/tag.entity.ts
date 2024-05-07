import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Room } from "./room.entity";

@Index("room_id", ["room_id"], {})
@Entity("tag", { schema: "yeohaeng_gadam" })
export class Tag {
  @PrimaryGeneratedColumn({
    type: "bigint",
    name: "id",
    comment: "태그 기본키",
  })
  id: string;

  @Column("bigint", { name: "room_id", comment: "방 기본키 참조" })
  room_id: string;

  @Column("varchar", { name: "tag", comment: "테마명", length: 50 })
  tag: string;

  @ManyToOne(() => Room, (room) => room.tags, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "room_id", referencedColumnName: "id" }])
  room: Room;
}
