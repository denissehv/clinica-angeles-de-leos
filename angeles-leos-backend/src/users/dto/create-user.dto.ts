import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo es requerido' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre!: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido paterno es requerido' })
  apellidoPaterno!: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido materno es requerido' })
  apellidoMaterno!: string;

  @IsEnum(Role, { message: 'El rol proporcionado no es válido' })
  @IsNotEmpty({ message: 'El rol es requerido' })
  role!: Role;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  // --- Solo aplica y es obligatorio si role = MEDICO ---
  @ValidateIf((dto: CreateUserDto) => dto.role === 'MEDICO')
  @IsString()
  @IsNotEmpty({ message: 'La cédula profesional es requerida para un Médico' })
  cedulaProfesional?: string;

  @ValidateIf((dto: CreateUserDto) => dto.role === 'MEDICO')
  @IsString()
  @IsOptional()
  especialidad?: string;

  // --- Solo aplica y es obligatorio si role = PACIENTE ---
  @ValidateIf((dto: CreateUserDto) => dto.role === 'PACIENTE')
  @IsDateString({}, { message: 'La fecha de nacimiento debe tener formato AAAA-MM-DD' })
  @IsNotEmpty({ message: 'La fecha de nacimiento es requerida para un Paciente' })
  fechaNacimiento?: string;

  @ValidateIf((dto: CreateUserDto) => dto.role === 'PACIENTE')
  @IsString()
  @IsNotEmpty({ message: 'El género es requerido para un Paciente' })
  genero?: string;

  @ValidateIf((dto: CreateUserDto) => dto.role === 'PACIENTE')
  @IsString()
  @IsOptional()
  tipoSanguineo?: string;
}
