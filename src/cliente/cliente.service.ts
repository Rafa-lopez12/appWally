import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {validate as isuuid} from 'uuid'
import { throwDeprecation } from 'process';

@Injectable()
export class ClienteService {

  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository:Repository<Cliente>
  ){}
  
  async create(createClienteDto: CreateClienteDto) {
    try {
      const cliente=this.clienteRepository.create(createClienteDto)
      await this.clienteRepository.save(cliente)
      return cliente
    } catch (error) {
      console.log(error)
    }
    
  }

  findAll() {
    const cliente=this.clienteRepository.find()
    return cliente
  }

  async findOne(id: string) {
    let cliente:Cliente
    if (isuuid(id)) {
      cliente=await this.clienteRepository.findOneBy({id:id})
    }else{
      const queryBuilder = this.clienteRepository.createQueryBuilder('prod'); 
      cliente = await queryBuilder
        .where('UPPER(nombre) =:nombre', {
          nombre: id.toUpperCase(),
        })
        .getOne();
    }

    if (!cliente) {
      throw new NotFoundException(`Cliente con id ${id} no existe`)
    }

    return cliente
  }
  

  async update(id: string, updateClienteDto: UpdateClienteDto) {
    const cliente= await this.clienteRepository.preload({
      id:id,
      ...updateClienteDto
    })
    if (!cliente) {
      throw new NotFoundException(`No existe cliente con el id: ${ id } `)
    }
    try {
      await this.clienteRepository.save(cliente)
      return cliente
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async remove(id: string) {
    const cliente= await this.clienteRepository.findOne({where: { id } })
    await this.clienteRepository.remove(cliente)
  }

  private handleDBExceptions( error: any ) {

    if ( error.code === '23505' )
      throw new BadRequestException(error.detail);
    
    this.logger.error(error)
    // console.log(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
