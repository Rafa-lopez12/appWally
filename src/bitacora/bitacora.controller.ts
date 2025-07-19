import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BitacoraService } from './bitacora.service';
import { Auth } from '../usuario/decorators/auth.decorator';
import { ValidRoles } from '../usuario/interface/validRoles';


@Controller('bitacora')
@Auth(ValidRoles.administrador, ValidRoles.administrador_general)
export class BitacoraController {
  constructor(private readonly logService: BitacoraService) {}

  @Get()
  @Auth(ValidRoles.administrador, ValidRoles.administrador_general)
  async findAll() {
    return this.logService.findAll();
  }

}
