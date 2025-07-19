import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Reserva } from '../../reserva/entities/reserva.entity';
import { Role } from "src/roles/entities/role.entity";
import { Log } from "../../bitacora/entities/bitacora.entity";

@Entity()
export class Usuario {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column('text')
    nombre: string

    @Column('text')
    username: string

    @Column('text', {
        select: false
    })
    password: string

    @Column('text')
    telefono: string

    @ManyToOne(
        ()=>Role,
        (role)=>role.id,
        {eager:true}
    )
    rol:Role

    @OneToMany(
        ()=>Reserva,
        (reserva)=>reserva.usuario
    )
    reserva:Reserva[]



    @OneToMany(
        () => Log, 
        (log) => log.usuario
    )
    logs: Log[];


    @BeforeInsert()
    checkFieldsBeforeInsert(){
        this.username=this.username.toLocaleLowerCase().trim()
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate(){
        this.checkFieldsBeforeInsert()
    }
}
