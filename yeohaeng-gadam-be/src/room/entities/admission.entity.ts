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
@Entity("admission", { schema: "yeohaeng_gadam" })
export class Admission {
  @PrimaryGeneratedColumn({
    type: "bigint",
    name: "id",
    comment: "가입 기본키",
  })
  id: string;

  @Column("bigint", { name: "room_id", comment: "방 기본키 참조" })
  roomId: string;

  @Column("varchar", {
    name: "user_id",
    comment: "사용자 기본키 참조",
    length: 255,
  })
  userId: string;

  @ManyToOne(() => Room, (room) => room.admissions, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "room_id", referencedColumnName: "id" }])
  room: Room;
}
