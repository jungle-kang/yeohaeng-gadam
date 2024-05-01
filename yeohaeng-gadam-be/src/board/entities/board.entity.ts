import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Room } from "../../room/entities/room.entity";

@Index("fk_board_room", ["roomId"], {})
@Entity("board", { schema: "yeohaeng_gadam" })
export class Board {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("bigint", { name: "room_id" })
  roomId: string;

  @ManyToOne(() => Room, (room) => room.boards, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "room_id", referencedColumnName: "id" }])
  room: Room;
}
