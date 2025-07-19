import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SugerenciaService } from './sugerencia.service';
import { CreateSugerenciaDto } from './dto/create-sugerencia.dto';
import { UpdateSugerenciaDto } from './dto/update-sugerencia.dto';
import { GetUser } from '../usuario/decorators/get-user.decorator';
import { Cliente } from '../cliente/entities/cliente.entity';

@Controller('sugerencia')
export class SugerenciaController {
  constructor(private readonly sugerenciaService: SugerenciaService) {}

  @Post()
  create(@Body() createSugerenciaDto: CreateSugerenciaDto, @GetUser() client:Cliente) {
    return this.sugerenciaService.create(createSugerenciaDto, client);
  }

  @Get()
  findAll() {
    return this.sugerenciaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sugerenciaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateSugerenciaDto: UpdateSugerenciaDto) {
    return this.sugerenciaService.update(id, updateSugerenciaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.sugerenciaService.remove(id);
  }
}
