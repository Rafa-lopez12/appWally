import { Cliente } from "../../cliente/entities/cliente.entity";
import { Usuario } from "../../usuario/entities/usuario.entity";
import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cancha } from '../../cancha/entities/cancha.entity';
import { Promocion } from '../../promocion/entities/promocion.entity';

@Entity()
export class Reserva {

    @PrimaryGeneratedColumn('increment')
    id:number

    @Column('numeric', {default:0})
    monto:number

    @Column('timestamp')
    fecha_hora_inicio: Date

    @Column('timestamp')
    fecha_hora_fin: Date

    @ManyToOne(
        ()=>Usuario,
        (usuario)=>usuario.id,
        {eager:true}
    )
    usuario?:Usuario

    @ManyToOne(
        ()=>Cliente,
        (cliente)=>cliente.id,
        {eager:true}
    )
    cliente:Cliente

    @ManyToOne(
        ()=>Cancha,
        (cancha)=>cancha.id,
        {eager:true}
    )
    cancha:Cancha

    @ManyToOne(
        ()=>Promocion,
        (promocion)=>promocion.id,
        {eager:true}
    )
    promocion:Promocion


}
