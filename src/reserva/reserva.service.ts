import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { Between, MoreThan, Repository } from 'typeorm';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Cancha } from '../cancha/entities/cancha.entity';
import { Promocion } from '../promocion/entities/promocion.entity';
import { NotFoundError } from 'rxjs';

@Injectable()
export class ReservaService {

  private readonly logger = new Logger('SugerenciaService');

  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository:Repository<Reserva>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository:Repository<Usuario>,

    @InjectRepository(Cliente)
    private readonly clienteRepository:Repository<Cliente>,

    @InjectRepository(Cancha)
    private readonly canchaRepository:Repository<Cancha>,

    @InjectRepository(Promocion)
    private readonly promocionRepository:Repository<Promocion>,
  ){}

  async create(createReservaDto: CreateReservaDto) {
    try {
      const usuario = createReservaDto.usuario 
                ? await this.usuarioRepository.findOneBy({ nombre: createReservaDto.usuario }) 
                : null;
      const cliente = await this.clienteRepository.findOneBy({ nombre: createReservaDto.cliente });
      const cancha = await this.canchaRepository.findOneBy({cancha: createReservaDto.cancha});
      const promocion = await this.promocionRepository.findOneBy({id: createReservaDto.promocion});
      
      if (!cliente || !cancha || !promocion) {
        throw new BadRequestException('Datos inválidos para la reserva');
      }
  
      // Verificar si esta reserva es gratis por fidelización
      const loyaltyInfo = await this.checkLoyaltyDiscount(cliente.id);
      let finalAmount = createReservaDto.monto;
  
      if (loyaltyInfo.proximaEsGratis) {
        // Esta reserva es gratis por fidelización
        finalAmount = 0;
      } else if (promocion.estado === 1 && promocion.descuento > 0) {
        // Aplicar descuento de promoción si no es gratis por fidelización
        finalAmount = createReservaDto.monto - (createReservaDto.monto * promocion.descuento / 100);
      }
  
      const nuevaReserva = await this.reservaRepository.save({
        monto: Number(finalAmount.toFixed(2)),
        fecha_hora_inicio: createReservaDto.fecha_hora_inicio,
        fecha_hora_fin: createReservaDto.fecha_hora_fin,
        usuario,
        cliente,
        cancha,
        promocion,
      });
  
      // Retornar información adicional sobre la fidelización
      return {
        ...nuevaReserva,
        loyaltyInfo: {
          eraGratisPorFidelizacion: loyaltyInfo.proximaEsGratis,
          reservasRestantesParaProximaGratis: loyaltyInfo.proximaEsGratis ? 9 : loyaltyInfo.reservasRestantesParaGratis,
          montoOriginal: createReservaDto.monto,
          descuentoAplicado: finalAmount < createReservaDto.monto
        }
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  findAll() {
    const reservas=this.reservaRepository.find()
    return reservas
  }

  findOne(id: number) {
    return `This action returns a #${id} reserva`;
  }

  async update(id: number, updateReservaDto: UpdateReservaDto) {
    const reserva=await this.reservaRepository.preload({
      id:id,
      monto:updateReservaDto.monto ?? 0 ,
      fecha_hora_inicio:updateReservaDto.fecha_hora_inicio,
      fecha_hora_fin:updateReservaDto.fecha_hora_fin,
      cliente: await this.clienteRepository.findOneBy({ nombre: updateReservaDto.cliente }),
      cancha: await this.canchaRepository.findOneBy({cancha: updateReservaDto.cancha})
    })

    if (!reserva) {
      throw new NotFoundException('No existe esa reserva')
    }
    try {
      await this.reservaRepository.save(reserva)
      return reserva
    } catch (error) {
      this.handleDBExceptions(error)
    }


  }

  async remove(id: number) {
    const reserva= await this.reservaRepository.findOne({where:{id}})
    if (!reserva) {
      throw new NotFoundException('No existe esa reserva')
    }

    await this.reservaRepository.remove(reserva)
  }

  async getDailyStats(date: string) {
    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
  
      const reservas = await this.reservaRepository.find({
        where: {
          fecha_hora_inicio: Between(startDate, endDate)
        },
        relations: ['cliente', 'cancha']
      });
  
      const totalReservations = reservas.length;
      const totalRevenue = reservas.reduce((sum, reserva) => sum + Number(reserva.monto), 0);
      
      // Reservas por cancha
      const reservasPorCancha = reservas.reduce((acc, reserva) => {
        const canchaName = reserva.cancha.cancha;
        acc[canchaName] = (acc[canchaName] || 0) + 1;
        return acc;
      }, {});
  
      // Reservas por cliente
      const reservasPorCliente = reservas.reduce((acc, reserva) => {
        const clienteName = reserva.cliente.nombre;
        acc[clienteName] = (acc[clienteName] || 0) + 1;
        return acc;
      }, {});
  
      return {
        date,
        totalReservations,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        reservasPorCancha,
        reservasPorCliente,
        reservas: reservas.map(r => ({
          id: r.id,
          monto: r.monto,
          cliente: r.cliente.nombre,
          cancha: r.cancha.cancha,
          hora_inicio: r.fecha_hora_inicio,
          hora_fin: r.fecha_hora_fin
        }))
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
  
  async getMonthlyStats(year: number, month: number) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  
      const reservas = await this.reservaRepository.find({
        where: {
          fecha_hora_inicio: Between(startDate, endDate)
        },
        relations: ['cliente', 'cancha']
      });
  
      const totalReservations = reservas.length;
      const totalRevenue = reservas.reduce((sum, reserva) => sum + Number(reserva.monto), 0);
  
      // Ingresos por día del mes
      const dailyRevenue = {};
      const dailyReservations = {};
      
      reservas.forEach(reserva => {
        const day = reserva.fecha_hora_inicio.getDate();
        dailyRevenue[day] = (dailyRevenue[day] || 0) + Number(reserva.monto);
        dailyReservations[day] = (dailyReservations[day] || 0) + 1;
      });
  
      return {
        year,
        month,
        totalReservations,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        dailyRevenue,
        dailyReservations,
        averageDailyRevenue: Number((totalRevenue / new Date(year, month, 0).getDate()).toFixed(2))
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
  
  async getClientStats(clienteId: string) {
    try {
      const cliente = await this.clienteRepository.findOneBy({ id: clienteId });
      if (!cliente) {
        throw new NotFoundException('Cliente no encontrado');
      }
  
      const reservas = await this.reservaRepository.find({
        where: { cliente: { id: clienteId } },
        relations: ['cancha', 'promocion'],
        order: { fecha_hora_inicio: 'DESC' }
      });
  
      const totalReservations = reservas.length;
      const totalSpent = reservas.reduce((sum, reserva) => sum + Number(reserva.monto), 0);
      
      // Calcular reservas gratis (política de fidelización)
      const reservasPagadas = reservas.filter(r => Number(r.monto) > 0).length;
      const reservasGratis = totalReservations - reservasPagadas;
      const proximaGratis = reservasPagadas > 0 ? 10 - (reservasPagadas % 10) : 10;
  
      return {
        cliente: {
          id: cliente.id,
          nombre: cliente.nombre,
          username: cliente.username,
          telefono: cliente.telefono
        },
        totalReservations,
        reservasPagadas,
        reservasGratis,
        proximaGratis: proximaGratis === 10 ? 0 : proximaGratis,
        totalSpent: Number(totalSpent.toFixed(2)),
        averageSpent: totalReservations > 0 ? Number((totalSpent / totalReservations).toFixed(2)) : 0,
        lastReservation: reservas.length > 0 ? reservas[0].fecha_hora_inicio : null
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
  
  async getReservasByClient(clienteId: string) {
    try {
      const reservas = await this.reservaRepository.find({
        where: { cliente: { id: clienteId } },
        relations: ['cliente', 'cancha', 'promocion', 'usuario'],
        order: { fecha_hora_inicio: 'DESC' }
      });
  
      return reservas.map(reserva => ({
        id: reserva.id,
        monto: reserva.monto,
        fecha_hora_inicio: reserva.fecha_hora_inicio,
        fecha_hora_fin: reserva.fecha_hora_fin,
        cancha: reserva.cancha.cancha,
        promocion: {
          id: reserva.promocion.id,
          motivo: reserva.promocion.motivo,
          descuento: reserva.promocion.descuento
        },
        usuario: reserva.usuario ? reserva.usuario.nombre : null,
        estado: this.getReservaStatus(reserva.fecha_hora_inicio, reserva.fecha_hora_fin)
      }));
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
  
  private getReservaStatus(inicio: Date, fin: Date): string {
    const now = new Date();
    if (now < inicio) return 'pendiente';
    if (now >= inicio && now <= fin) return 'en_progreso';
    return 'completada';
  }


  async checkLoyaltyDiscount(clienteId: string) {
    try {
      // Contar todas las reservas pagadas del cliente (monto > 0)
      const reservasPagadas = await this.reservaRepository.count({
        where: { 
          cliente: { id: clienteId },
          monto: MoreThan(0) // Solo reservas que se pagaron
        }
      });
  
      // Cada 10 reservas pagadas, la siguiente es gratis
      const proximaGratis = reservasPagadas % 10 === 9; // Si ha pagado 9, 19, 29, etc., la siguiente es gratis
      const reservasParaGratis = proximaGratis ? 0 : 9 - (reservasPagadas % 10);
  
      return {
        clienteId,
        totalReservasPagadas: reservasPagadas,
        proximaEsGratis: proximaGratis,
        reservasRestantesParaGratis: reservasParaGratis,
        ciclosCompletados: Math.floor(reservasPagadas / 10)
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }


  private handleDBExceptions( error: any ) {

    if ( error.code === '23505' )
      throw new BadRequestException(error.detail);
    
    this.logger.error(error)
    // console.log(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');

  }


}
