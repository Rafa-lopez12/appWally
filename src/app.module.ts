import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioModule } from './usuario/usuario.module';
import { ClienteModule } from './cliente/cliente.module';
import { CanchaModule } from './cancha/cancha.module';
import { CommonModule } from './common/common.module';
import { PromocionModule } from './promocion/promocion.module';
import { SugerenciaModule } from './sugerencia/sugerencia.module';
import { ReservaModule } from './reserva/reserva.module';
import { RolesModule } from './roles/roles.module';
import { BitacoraModule } from './bitacora/bitacora.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'WallyReservas',
      username: 'postgres',
      password: 'leyendas13',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsuarioModule,
    ClienteModule,
    CanchaModule,
    CommonModule,
    PromocionModule,
    SugerenciaModule,
    ReservaModule,
    RolesModule,
    BitacoraModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
