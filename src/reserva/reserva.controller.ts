import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { GetUser } from '../usuario/decorators/get-user.decorator';

@Controller('reserva')
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post()
  create(@Body() createReservaDto: CreateReservaDto) {
    return this.reservaService.create(createReservaDto);
  }

  @Get()
  findAll() {
    return this.reservaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReservaDto: UpdateReservaDto) {
    return this.reservaService.update(+id, updateReservaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservaService.remove(+id);
  }


  @Get('stats/daily/:date')
async getDailyStats(@Param('date') date: string, @GetUser() user: any) {
  // Solo usuarios pueden ver estadísticas
  if (!('rol' in user)) {
    throw new ForbiddenException('Solo los usuarios pueden acceder a las estadísticas');
  }
  return this.reservaService.getDailyStats(date);
}

// Estadísticas mensuales (solo para usuarios)
@Get('stats/monthly/:year/:month')
async getMonthlyStats(
  @Param('year') year: string, 
  @Param('month') month: string,
  @GetUser() user: any
) {
  // Solo usuarios pueden ver estadísticas
  if (!('rol' in user)) {
    throw new ForbiddenException('Solo los usuarios pueden acceder a las estadísticas');
  }
  return this.reservaService.getMonthlyStats(parseInt(year), parseInt(month));
}

// Estadísticas de cliente (usuarios pueden ver cualquier cliente, clientes solo sus propios datos)
@Get('stats/client/:clienteId')
async getClientStats(@Param('clienteId') clienteId: string, @GetUser() user: any) {
  // Si es cliente, solo puede ver sus propios datos
  if (!('rol' in user) && user.id !== clienteId) {
    throw new ForbiddenException('Solo puedes ver tus propias estadísticas');
  }
  return this.reservaService.getClientStats(clienteId);
}

// Reservas de un cliente específico
@Get('client/:clienteId/reservas')
async getClientReservas(@Param('clienteId') clienteId: string, @GetUser() user: any) {
  // Si es cliente, solo puede ver sus propias reservas
  if (!('rol' in user) && user.id !== clienteId) {
    throw new ForbiddenException('Solo puedes ver tus propias reservas');
  }
  return this.reservaService.getReservasByClient(clienteId);
}

// Endpoint para que los clientes vean sus propias estadísticas
@Get('my-stats')
async getMyStats(@GetUser() user: any) {
  // Si es usuario, no tiene sentido este endpoint
  if ('rol' in user) {
    throw new BadRequestException('Este endpoint es solo para clientes');
  }
  return this.reservaService.getClientStats(user.id);
}

// Endpoint para que los clientes vean sus propias reservas
@Get('my-reservas')
async getMyReservas(@GetUser() user: any) {
  // Si es usuario, no tiene sentido este endpoint
  if ('rol' in user) {
    throw new BadRequestException('Este endpoint es solo para clientes');
  }
  return this.reservaService.getReservasByClient(user.id);
}

}
