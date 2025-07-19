import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Cancha } from './entities/cancha.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CanchaService {

  constructor(
    @InjectRepository(Cancha)
    private readonly canchaRepository:Repository<Cancha>
  ){}
 
  findAll() {
    const cancha=this.canchaRepository.find()
    return cancha
  }

}
