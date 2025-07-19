import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Repository } from 'typeorm';
import { Log } from './entities/bitacora.entity';

@Injectable()
export class BitacoraService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  async create(usuario: Usuario, action: string) {
    const log = this.logRepository.create({ usuario, action });
    await this.logRepository.save(log);
    return log;
  }

  async findAll() {
    return this.logRepository.find({ relations: ['usuario'] });
  }
}

