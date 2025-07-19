import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { Repository } from 'typeorm';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Cancha } from '../cancha/entities/cancha.entity';
import { Promocion } from '../promocion/entities/promocion.entity';
import { NotFoundError } from 'rxjs';

@Injectable()
export class ReservaService {

  private readonly logger = new Logger('SugerenciaService');

  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository:Repository<Reserva>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository:Repository<Usuario>,

    @InjectRepository(Cliente)
    private readonly clienteRepository:Repository<Cliente>,

    @InjectRepository(Cancha)
    private readonly canchaRepository:Repository<Cancha>,

    @InjectRepository(Promocion)
    private readonly promocionRepository:Repository<Promocion>,
  ){}

  async create(createReservaDto: CreateReservaDto) {
    try {
      const usuario = createReservaDto.usuario 
                ? await this.usuarioRepository.findOneBy({ nombre: createReservaDto.usuario }) 
                : null;
      const cliente=await this.clienteRepository.findOneBy({ nombre: createReservaDto.cliente })
      const cancha=await this.canchaRepository.findOneBy({cancha:createReservaDto.cancha})
      const promocion=await this.promocionRepository.findOneBy({id:createReservaDto.promocion})
      if (!cliente && !cancha && !promocion) {
        throw new BadRequestException('error')
      }

      return await this.reservaRepository.save({
        ...createReservaDto,
        usuario,
        cliente,
        cancha,
        promocion,
      })
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  findAll() {
    const reservas=this.reservaRepository.find()
    return reservas
  }

  findOne(id: number) {
    return `This action returns a #${id} reserva`;
  }

  async update(id: number, updateReservaDto: UpdateReservaDto) {
    const reserva=await this.reservaRepository.preload({
      id:id,
      monto:updateReservaDto.monto ?? 0 ,
      fecha_hora_inicio:updateReservaDto.fecha_hora_inicio,
      fecha_hora_fin:updateReservaDto.fecha_hora_fin,
      cliente: await this.clienteRepository.findOneBy({ nombre: updateReservaDto.cliente }),
      cancha: await this.canchaRepository.findOneBy({cancha: updateReservaDto.cancha})
    })

    if (!reserva) {
      throw new NotFoundException('No existe esa reserva')
    }
    try {
      await this.reservaRepository.save(reserva)
      return reserva
    } catch (error) {
      this.handleDBExceptions(error)
    }


  }

  async remove(id: number) {
    const reserva= await this.reservaRepository.findOne({where:{id}})
    if (!reserva) {
      throw new NotFoundException('No existe esa reserva')
    }

    await this.reservaRepository.remove(reserva)
  }

  private handleDBExceptions( error: any ) {

    if ( error.code === '23505' )
      throw new BadRequestException(error.detail);
    
    this.logger.error(error)
    // console.log(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');

  }
}
