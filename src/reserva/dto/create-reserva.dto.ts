import { IsDateString, IsOptional, IsPositive, IsString,} from "class-validator";

export class CreateReservaDto {

    @IsPositive()
    monto:number;

    @IsDateString()
    fecha_hora_inicio:Date;

    @IsDateString()
    fecha_hora_fin:Date;

    @IsString()
    @IsOptional()
    usuario?:string;

    @IsString()
    cliente:string;

    @IsString()
    cancha:string;

    @IsPositive()
    promocion:number;
}
