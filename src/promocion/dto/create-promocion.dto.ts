import { IsPositive, IsString } from "class-validator"

export class CreatePromocionDto {

    @IsString()
    motivo:string

    @IsString()
    descripcion:string

    @IsPositive()
    descuento:number

    estado:number
}
