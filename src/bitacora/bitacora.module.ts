import { Module } from '@nestjs/common';
import { BitacoraService } from './bitacora.service';
import { BitacoraController } from './bitacora.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioModule } from '../usuario/usuario.module';
import { Log } from './entities/bitacora.entity';

@Module({
  controllers: [BitacoraController],
  providers: [BitacoraService],
  imports:[TypeOrmModule.forFeature([Log]), UsuarioModule],
  exports:[BitacoraService]
})
export class BitacoraModule {}
