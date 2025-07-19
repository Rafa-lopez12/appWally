import { Module } from '@nestjs/common';
import { PromocionService } from './promocion.service';
import { PromocionController } from './promocion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promocion } from './entities/promocion.entity';

@Module({
  controllers: [PromocionController],
  providers: [PromocionService],
  imports: [TypeOrmModule.forFeature([Promocion])],
  exports: [TypeOrmModule, PromocionService]
})
export class PromocionModule {}
