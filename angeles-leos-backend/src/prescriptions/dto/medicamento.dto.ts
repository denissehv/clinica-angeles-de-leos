import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class MedicamentoDto {
  @IsString({ message: 'El nombre del medicamento debe ser texto' })
  @IsNotEmpty({ message: 'El nombre del medicamento es obligatorio' })
  nombre!: string;

  @IsString({ message: 'La dosis debe ser texto' })
  @IsNotEmpty({ message: 'La dosis es obligatoria (Ej: 500mg)' })
  dosis!: string;

  @IsString({ message: 'La frecuencia debe ser texto' })
  @IsNotEmpty({ message: 'La frecuencia es obligatoria (Ej: Cada 8 horas)' })
  frecuencia!: string;

  @IsString({ message: 'La duración debe ser texto' })
  @IsOptional()
  duracion?: string;
}
