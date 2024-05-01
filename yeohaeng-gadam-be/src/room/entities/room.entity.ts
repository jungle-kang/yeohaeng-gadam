import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Board } from "../../board/entities/board.entity";
import { Tag } from "./tag.entity";

@Entity("room", { schema: "yeohaeng_gadam" })
export class Room {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: number;

  @Column("varchar", { name: "title", comment: "방 제목", length: 64 })
  title: string;

  @Column("varchar", { name: "location", comment: "목적지", length: 20 })
  location: string;

  @Column("int", { name: "hc_max", nullable: true, comment: "최대 인원 수" })
  hcMax: number | null;

  @Column("date", { name: "start_date", nullable: true })
  startDate: string | null;

  @Column("date", { name: "end_date", nullable: true })
  endDate: string | null;

  @Column("datetime", {
    name: "reg_date",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  regDate: Date | null;

  @Column("datetime", {
    name: "mod_date",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  modDate: Date | null;

  @OneToMany(() => Board, (board) => board.room)
  boards: Board[];

  @OneToMany(() => Tag, (tag) => tag.room)
  tags: Tag[];
}
