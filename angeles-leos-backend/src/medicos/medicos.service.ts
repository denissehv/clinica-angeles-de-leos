import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Selección segura: nunca exponer el password del usuario dueño de este perfil médico
const MEDICO_SELECT = {
  id: true,
  cedulaProfesional: true,
  especialidad: true,
  userId: true,
  user: {
    select: {
      nombre: true,
      apellido: true,
      email: true,
      activo: true,
    },
  },
};

@Injectable()
export class MedicosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.medico.findMany({
      select: MEDICO_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const medico = await this.prisma.medico.findUnique({
      where: { id },
      select: MEDICO_SELECT,
    });

    if (!medico) {
      throw new NotFoundException(`Médico con ID ${id} no encontrado`);
    }

    return medico;
  }
}
