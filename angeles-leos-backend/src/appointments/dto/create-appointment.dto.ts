import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { EstadoCita } from '@prisma/client'; // Asegúrate de que este enum exista en tu esquema de Prisma

// Si el enum EstadoCita ya existe en @prisma/client, puedes importarlo.
// Por ahora validaremos las propiedades obligatorias de entrada:
export class CreateAppointmentDto {
  @IsDateString(
    {},
    {
      message: 'La fecha y hora debe ser un formato de fecha válido (ISO 8601)',
    },
  )
  @IsNotEmpty({ message: 'La fecha y hora de la cita es requerida' })
  fechaHora!: string;

  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsOptional()
  motivo?: string;

  @IsString({ message: 'El ID del paciente debe ser un texto válido' })
  @IsNotEmpty({ message: 'El ID del paciente es obligatorio' })
  pacienteId!: string;

  @IsString({ message: 'El ID del médico debe ser un texto válido' })
  @IsNotEmpty({ message: 'El ID del médico es obligatorio' })
  medicoId!: string;

  @IsEnum(EstadoCita, { message: 'El estado de la cita no es válido' })
  @IsOptional()
  estado?: EstadoCita;
}
