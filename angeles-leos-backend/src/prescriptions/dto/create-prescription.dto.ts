import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MedicamentoDto } from './medicamento.dto';

export class CreatePrescriptionDto {
  @IsString({ message: 'El código de la receta debe ser una cadena de texto' })
  @IsNotEmpty({
    message: 'El código de la receta es obligatorio (Ej: RX-2026-001)',
  })
  codigoReceta!: string;

  @IsUUID('4', {
    message: 'El ID del expediente debe ser un identificador UUID válido',
  })
  @IsNotEmpty({ message: 'El ID del expediente clínico es obligatorio' })
  medicalRecordId!: string;

  @IsUUID('4', {
    message: 'El ID del médico debe ser un identificador UUID válido',
  })
  @IsNotEmpty({ message: 'El ID del médico que firma la receta es obligatorio' })
  medicoId!: string;

  @IsArray({ message: 'Los medicamentos deben enviarse como una lista' })
  @ArrayMinSize(1, {
    message: 'La receta debe incluir al menos un medicamento',
  })
  @ValidateNested({ each: true })
  @Type(() => MedicamentoDto)
  medicamentos!: MedicamentoDto[];

  @IsString({ message: 'Las indicaciones generales deben ser texto' })
  @IsOptional()
  indicacionesGenerales?: string;

  @IsString({ message: 'La firma del médico debe ser texto (hash o url)' })
  @IsOptional()
  firmaMedico?: string;
}
