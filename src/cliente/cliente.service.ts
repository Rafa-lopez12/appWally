import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { validate as isuuid } from 'uuid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ClienteService {

  private readonly logger = new Logger('ClienteService');
  
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>
  ) {}
  
  async create(createClienteDto: CreateClienteDto) {
    try {
      const { password, ...clienteData } = createClienteDto;
      
      const cliente = this.clienteRepository.create({
        ...clienteData,
        password: bcrypt.hashSync(password, 10)
      });
      
      await this.clienteRepository.save(cliente);
      
      // No devolver la password
      delete cliente.password;
      return cliente;
      
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  findAll() {
    return this.clienteRepository.find();
  }

  async findOne(id: string) {
    let cliente: Cliente;
    
    if (isuuid(id)) {
      cliente = await this.clienteRepository.findOneBy({ id: id });
    } else {
      const queryBuilder = this.clienteRepository.createQueryBuilder('cliente'); 
      cliente = await queryBuilder
        .where('UPPER(nombre) =:nombre', {
          nombre: id.toUpperCase(),
        })
        .getOne();
    }

    if (!cliente) {
      throw new NotFoundException(`Cliente con id ${id} no existe`);
    }

    return cliente;
  }
  
  async update(id: string, updateClienteDto: UpdateClienteDto) {
    const { password, ...updateData } = updateClienteDto;
    
    const cliente = await this.clienteRepository.preload({
      id: id,
      ...updateData,
      ...(password && { password: bcrypt.hashSync(password, 10) })
    });
    
    if (!cliente) {
      throw new NotFoundException(`No existe cliente con el id: ${id}`);
    }
    
    try {
      await this.clienteRepository.save(cliente);
      delete cliente.password;
      return cliente;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const cliente = await this.clienteRepository.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con id ${id} no existe`);
    }
    await this.clienteRepository.remove(cliente);
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
