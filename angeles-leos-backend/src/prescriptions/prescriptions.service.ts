import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { Prisma, Role } from '@prisma/client';
import { JwtPayload } from '../auth/auth.guard';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  // Crear una nueva receta médica
  async create(createPrescriptionDto: CreatePrescriptionDto) {
    const { medicamentos, ...rest } = createPrescriptionDto;

    return this.prisma.prescription.create({
      data: {
        ...rest,
        medicamentos: medicamentos as unknown as Prisma.InputJsonValue,
      },
    });
  }

  // Obtener todas las recetas
  async findAll() {
    return this.prisma.prescription.findMany({
      include: {
        medico: true,
        medicalRecord: true,
      },
      orderBy: { fechaEmision: 'desc' },
    });
  }

  // Obtener todas las recetas de un expediente clínico en particular
  async findByExpediente(medicalRecordId: string, requestingUser?: JwtPayload) {
    if (requestingUser?.role === Role.PACIENTE) {
      const expediente = await this.prisma.medicalRecord.findUnique({
        where: { id: medicalRecordId },
        include: { paciente: true },
      });

      if (!expediente) {
        throw new NotFoundException(
          `Expediente con ID ${medicalRecordId} no encontrado`,
        );
      }

      if (expediente.paciente.userId !== requestingUser.sub) {
        throw new ForbiddenException(
          'No tienes permiso para ver las recetas de otro paciente',
        );
      }
    }

    return this.prisma.prescription.findMany({
      where: { medicalRecordId },
      include: { medico: true },
      orderBy: { fechaEmision: 'desc' },
    });
  }

  // Obtener una receta por ID
  async findOne(id: string, requestingUser?: JwtPayload) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        medico: true,
        medicalRecord: {
          include: { paciente: true },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException(`Receta con ID ${id} no encontrada`);
    }

    if (
      requestingUser?.role === Role.PACIENTE &&
      prescription.medicalRecord.paciente.userId !== requestingUser.sub
    ) {
      throw new ForbiddenException(
        'No tienes permiso para ver la receta de otro paciente',
      );
    }

    return prescription;
  }

  // Actualizar una receta
  async update(id: string, updatePrescriptionDto: UpdatePrescriptionDto) {
    await this.findOne(id);

    const { medicamentos, ...rest } = updatePrescriptionDto;

    return this.prisma.prescription.update({
      where: { id },
      data: {
        ...rest,
        ...(medicamentos
          ? { medicamentos: medicamentos as unknown as Prisma.InputJsonValue }
          : {}),
      },
    });
  }

  // Eliminar una receta
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.prescription.delete({
      where: { id },
    });
  }
}
