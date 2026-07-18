import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { TipoTransaccion } from '@prisma/client';

export class CreateFinanceDto {
  @IsEnum(TipoTransaccion, { message: 'El tipo debe ser INGRESO o EGRESO' })
  @IsOptional()
  tipo?: TipoTransaccion;

  @IsString({ message: 'El concepto debe ser un texto válido' })
  @IsNotEmpty({ message: 'El concepto es obligatorio' })
  concepto!: string;

  @IsNumber({}, { message: 'El monto debe ser un número' })
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  @IsNotEmpty({ message: 'El monto es obligatorio' })
  monto!: number;

  @IsUUID('4', { message: 'El ID del paciente no es válido' })
  @IsOptional()
  pacienteId?: string;
}
