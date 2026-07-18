import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class CreatePacienteDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  nombreCompleto!: string;

  @IsInt({ message: 'La edad debe ser un número entero' })
  @IsNotEmpty({ message: 'La edad es requerida' })
  edad!: number;

  @IsDateString(
    {},
    {
      message:
        'La fecha de nacimiento debe ser una fecha válida en formato ISO string (AAAA-MM-DD)',
    },
  )
  @IsNotEmpty({ message: 'La fecha de nacimiento es requerida' })
  fechaNacimiento!: string; // Viaja como texto en formato ISO y luego lo transformamos a Date en el servicio

  @IsString()
  @IsNotEmpty({ message: 'El género es requerido' })
  genero!: string;

  @IsString()
  @IsOptional()
  tipoSanguineo?: string;
}
