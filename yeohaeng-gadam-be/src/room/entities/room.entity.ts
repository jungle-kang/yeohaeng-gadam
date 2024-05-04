import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Tag } from "./tag.entity";
import { Admission } from "./admission.entity";

@Entity("room", { schema: "yeohaeng_gadam" })
export class Room {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", comment: "방 기본키" })
  id: string;

  @Column("varchar", { name: "title", comment: "방 제목", length: 255 })
  title: string;

  @Column("varchar", { name: "location", comment: "목적지", length: 50 })
  location: string;

  @Column("int", { name: "state", nullable: true, comment: "상태" })
  state: number | null;
  
  @Column("int", { name: "hc_attend", nullable: true, comment: "참가 인원 수" })
  hcAttend: number | null;

  @Column("int", { name: "hc_max", nullable: true, comment: "최대 인원 수" })
  hcMax: number | null;

  @Column("date", {
    name: "start_date",
    nullable: true,
    comment: "여행 시작 날짜",
  })
  startDate: string | null;

  @Column("date", {
    name: "end_date",
    nullable: true,
    comment: "여행 종료 날짜",
  })
  endDate: string | null;

  @Column("datetime", {
    name: "reg_date",
    nullable: true,
    comment: "방 생성 날짜시간",
    default: () => "CURRENT_TIMESTAMP",
  })
  regDate: Date | null;

  @Column("datetime", {
    name: "mod_date",
    nullable: true,
    comment: "방 수정 날짜시간",
    default: () => "CURRENT_TIMESTAMP",
  })
  modDate: Date | null;

  @OneToMany(() => Admission, (admission) => admission.room)
  admissions: Admission[];

  @OneToMany(() => Tag, (tag) => tag.room)
  tags: Tag[];
}
