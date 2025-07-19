import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateSugerenciaDto } from './dto/create-sugerencia.dto';
import { UpdateSugerenciaDto } from './dto/update-sugerencia.dto';
import { Repository } from 'typeorm';
import { Sugerencia } from './entities/sugerencia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from '../cliente/entities/cliente.entity';

@Injectable()
export class SugerenciaService {

  private readonly logger = new Logger('SugerenciaService');

  constructor(

    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,

    @InjectRepository(Sugerencia)
    private readonly sugerenciaRepository:Repository<Sugerencia>

  ){}

  async create(createSugerenciaDto: CreateSugerenciaDto, cliente:Cliente) {
    try {
      // const cliente=await this.clienteRepository.findOneBy({nombre:createSugerenciaDto.clienteId})
      // if (!cliente) {
      //   throw new BadRequestException('cliente no existe')
      // }
      return await this.sugerenciaRepository.save({
        ...createSugerenciaDto,
        cliente
      })
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  findAll() {
    const sugerencias=this.sugerenciaRepository.find()
    return sugerencias
  }

  findOne(id: number) {
    return `This action returns a #${id} sugerencia`;
  }

  async update(id: number, updateSugerenciaDto: UpdateSugerenciaDto) {
    

    const sugerencia=await this.sugerenciaRepository.preload({
      id:id,
      ...updateSugerenciaDto
    })
    if (!sugerencia) {
      throw new NotFoundException(`no existe la sugerencia con el id: ${id}`)
    }

    try {
      await this.sugerenciaRepository.save(sugerencia)
      return sugerencia
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async remove(id: number) {
    const sugerencia=await this.sugerenciaRepository.findOne({where:{id}})
    if (!sugerencia) {
      throw new NotFoundException('No existe sugerencia')
    }
    await this.sugerenciaRepository.remove(sugerencia)
  }

  private handleDBExceptions( error: any ) {

    if ( error.code === '23505' )
      throw new BadRequestException(error.detail);
    
    this.logger.error(error)
    // console.log(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');

  }
}
