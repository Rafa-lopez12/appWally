import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Usuario } from "../entities/usuario.entity";
import { JwtPayload } from "../interface/jwt-payload.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){

    constructor(

        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
        configService: ConfigService
    ){

        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        })
    }

    async validate(payload:JwtPayload): Promise<Usuario> {

        const {id} =payload

        const user=await this.usuarioRepository.findOneBy({id})

        if (!user) {
            throw new UnauthorizedException('Token not valid')
        }

        // if (!user.activo) {
        //     throw new UnauthorizedException('User inactivo')
        // }

        return user
    }

}