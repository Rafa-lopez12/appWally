import { IsString, IsUUID } from "class-validator";

export class CreateSugerenciaDto {

    @IsString()
    descripcion:string
    
    // @IsString()
    // clienteId:string
}
