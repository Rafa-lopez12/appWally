import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Reserva } from '../../reserva/entities/reserva.entity';

@Entity()
export class Promocion {

    @PrimaryGeneratedColumn('increment')
    id:number

    @Column('text')
    motivo:string

    @Column('text')
    descripcion:string

    @Column('numeric')
    descuento:number

    @Column('numeric')
    estado:number

    @OneToMany(
        ()=>Reserva,
        (reserva)=>reserva.promocion
    )
    reserva:Reserva[]
    
}
