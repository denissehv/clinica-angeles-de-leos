import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { Role } from '@prisma/client';
import { JwtPayload } from '../auth/auth.guard';
import { MulterFile } from '../common/interfaces/multer-file.interface';

@Injectable()
export class MedicalRecordsService {
  constructor(
    private prisma: PrismaService,
    private supabaseService: SupabaseService,
  ) {}

  // Crear un nuevo expediente
  async create(createMedicalRecordDto: CreateMedicalRecordDto) {
    return this.prisma.medicalRecord.create({
      data: {
        ...createMedicalRecordDto,
      },
    });
  }

  // Obtener todos los expedientes
  async findAll() {
    return this.prisma.medicalRecord.findMany({
      include: {
        paciente: true, // Incluye la información del paciente
      },
    });
  }

  // Obtener un expediente por ID
  async findOne(id: string, requestingUser?: JwtPayload) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        paciente: true,
      },
    });

    if (!record) {
      throw new NotFoundException(`Expediente con ID ${id} no encontrado`);
    }

    // Si quien pregunta es un PACIENTE, solo puede ver su propio expediente
    if (
      requestingUser?.role === Role.PACIENTE &&
      record.paciente.userId !== requestingUser.sub
    ) {
      throw new ForbiddenException(
        'No tienes permiso para ver el expediente de otro paciente',
      );
    }

    return record;
  }

  // Actualizar un expediente
  async update(id: string, updateMedicalRecordDto: UpdateMedicalRecordDto) {
    return this.prisma.medicalRecord.update({
      where: { id },
      data: updateMedicalRecordDto,
    });
  }

  // Eliminar un expediente
  async remove(id: string) {
    return this.prisma.medicalRecord.delete({
      where: { id },
    });
  }

  // Subir un archivo (radiografía, análisis, PDF) y ligarlo al expediente
  async addFile(id: string, file: MulterFile) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`Expediente con ID ${id} no encontrado`);
    }

    const extension = file.originalname.split('.').pop();
    const path = `expedientes/${id}/${Date.now()}-${randomUUID()}.${extension}`;

    const publicUrl = await this.supabaseService.uploadFile(path, file);

    return this.prisma.medicalRecord.update({
      where: { id },
      data: {
        archivosAdjuntos: { push: publicUrl },
      },
    });
  }

  // Eliminar un archivo adjunto del expediente (y del bucket de Supabase)
  async removeFile(id: string, url: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`Expediente con ID ${id} no encontrado`);
    }

    if (!record.archivosAdjuntos.includes(url)) {
      throw new NotFoundException('Ese archivo no pertenece a este expediente');
    }

    const path = this.supabaseService.extractPathFromUrl(url);
    await this.supabaseService.deleteFile(path);

    return this.prisma.medicalRecord.update({
      where: { id },
      data: {
        archivosAdjuntos: record.archivosAdjuntos.filter((u) => u !== url),
      },
    });
  }
}
