import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import * as bycript from 'bcrypt';
import { LoginUsuarioDto } from './dto/login-user.dto';
import { JwtPayload } from './interface/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/roles/entities/role.entity';


@Injectable()
export class UsuarioService {

  constructor(

    @InjectRepository(Usuario)
    private readonly userRepository: Repository<Usuario>,
    @InjectRepository(Role)
    private readonly rolRepository: Repository<Role>,
    

    private readonly jwtService: JwtService


  ){}
  async create(createUsuarioDto: CreateUsuarioDto) {
    try {
      const {password,...userData}=createUsuarioDto
      //const rol=await this.rolRepository.findOneBy()
      const rol={
        id:4,
        rol:'usuario'
      }
      const user=this.userRepository.create({
        ...userData,
        password: bycript.hashSync(password, 10),
        rol,

       // rol,
      })
    //  this.userRepository.save(user)
    //const user=this.userRepository.create(createUsuarioDto)
      await this.userRepository.save(user)
      return {
        ...user,
        token: this.getJwtToken({id: user.id})
      }

    } catch (error) {
      this.handleDBErrors(error)
    }
  }

  async login(loginUsuarioDto: LoginUsuarioDto){
    
    const {password, username}=loginUsuarioDto

    const user=await this.userRepository.findOne({
      where: {username},
      select: {username: true, password: true, nombre:true, id:true}
    })

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas')
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credenciales incorrectas')
    }
    delete user.password
    return {
      ...user,
      token: this.getJwtToken({id: user.id})
    }
    
    // try {
      
    // } catch (error) {
    //   this.handleDBErrors(error)
    // }
  }

  async checkStatus(user:Usuario){
    return {
      ...user,
      token: this.getJwtToken({id: user.id})
    }
  }

  findAll() {
    const user=this.userRepository.find()
    return user
  }

  findOne(id: number) {
    return `This action returns a #${id} usuario`;
  }

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuario`;
  }

  private getJwtToken(payload: JwtPayload){
    const token=this.jwtService.sign(payload)
    return token
  }

  private handleDBErrors( error: any ): never {


    if ( error.code === '23505' ) 
      throw new BadRequestException( error.detail );

    console.log(error)

    throw new InternalServerErrorException('Please check server logs');

  }
}
