import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { GetUser } from 'src/usuario/decorators/get-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';


@Controller('cliente')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Post('register')
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clienteService.create(createClienteDto);
  }

  @Get()
  findAll() {
    return this.clienteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clienteService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateClienteDto: UpdateClienteDto) {
    return this.clienteService.update(id, updateClienteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clienteService.remove(id);
  }

  @Patch('change-my-password')
async changeMyPassword(
  @Body() changePasswordDto: ChangePasswordDto,
  @GetUser() user: any
) {
  // Solo clientes pueden usar este endpoint
  if ('rol' in user) {
    throw new BadRequestException('Este endpoint es solo para clientes');
  }
  
  return this.clienteService.changePassword(user.id, changePasswordDto);
}
}

