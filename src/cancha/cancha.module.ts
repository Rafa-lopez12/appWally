import { Module } from '@nestjs/common';
import { CanchaService } from './cancha.service';
import { CanchaController } from './cancha.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cancha } from './entities/cancha.entity';

@Module({
  controllers: [CanchaController],
  providers: [CanchaService],
  imports: [TypeOrmModule.forFeature([Cancha])],
  exports: [CanchaService, TypeOrmModule]
})
export class CanchaModule {}
