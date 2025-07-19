import { Cliente } from "src/cliente/entities/cliente.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Sugerencia {


    @PrimaryGeneratedColumn('identity')
    id:number

    @Column()
    descripcion:string

    @ManyToOne(
        ()=>Cliente,
        (cliente)=>cliente.id,
        {eager:true,},
    )
    cliente:Cliente


}
