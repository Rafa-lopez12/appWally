import { Module } from '@nestjs/common';
import { SugerenciaService } from './sugerencia.service';
import { SugerenciaController } from './sugerencia.controller';
import { ClienteModule } from 'src/cliente/cliente.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sugerencia } from './entities/sugerencia.entity';
import { ClienteService } from 'src/cliente/cliente.service';

@Module({
  controllers: [SugerenciaController],
  providers: [SugerenciaService, ClienteService],
  imports:[TypeOrmModule.forFeature([Sugerencia]),ClienteModule]
})
export class SugerenciaModule {}
