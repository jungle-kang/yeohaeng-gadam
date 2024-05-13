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
@Index("IDX_entry_user_id", ["user_id"], {}) // 유니크한 인덱스 이름 추가
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

  @ManyToOne(() => Room, (room) => room.entries, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "room_id", referencedColumnName: "id" }])
  room: Room;
}