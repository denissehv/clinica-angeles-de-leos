import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CreateMedicalRecordDto {
  @IsString({
    message: 'El código del expediente debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'El código del expediente es obligatorio (Ej: EXP-2024-001)',
  })
  codigoExpediente!: string;

  @IsUUID('4', {
    message: 'El ID del paciente debe ser un identificador UUID válido',
  })
  @IsNotEmpty({ message: 'El ID del paciente es obligatorio' })
  pacienteId!: string;

  @IsUUID('4', {
    message:
      'El ID del médico responsable debe ser un identificador UUID válido',
  })
  @IsNotEmpty({ message: 'El ID del médico es obligatorio' })
  medicoResponsableId!: string;

  @IsString({ message: 'El diagnóstico principal debe ser texto' })
  @IsNotEmpty({ message: 'El diagnóstico principal es obligatorio' })
  diagnosticoPrincipal!: string;

  @IsString({ message: 'El tratamiento debe ser texto' })
  @IsNotEmpty({ message: 'El tratamiento detallado es obligatorio' })
  tratamiento!: string;

  @IsString({ message: 'Las notas médicas deben ser texto' })
  @IsOptional()
  notasMedicas?: string;

  @IsArray({
    message: 'Los archivos adjuntos deben enviarse como una lista (arreglo)',
  })
  @IsString({
    each: true,
    message: 'Cada archivo debe ser un enlace de texto válido',
  })
  @IsOptional()
  archivosAdjuntos?: string[];
}
