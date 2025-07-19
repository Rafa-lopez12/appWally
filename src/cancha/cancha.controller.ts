import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CanchaService } from './cancha.service';


@Controller('cancha')
export class CanchaController {
  constructor(private readonly canchaService: CanchaService) {}


  @Get()
  findAll() {
    return this.canchaService.findAll();
  }

}
