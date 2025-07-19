import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity()
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => Usuario, 
    (usuario) => usuario.logs,
    {eager:true}
  )
  usuario: Usuario;

  @Column('text')
  action: string;

  @CreateDateColumn()
  createdAt: Date;
}
