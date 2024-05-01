import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("conversion", { schema: "yeohaeng_gadam" })
export class Conversion {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("int", { name: "tag" })
  tag: number;

  @Column("varchar", { name: "theme", comment: "테마명", length: 20 })
  theme: string;
}
