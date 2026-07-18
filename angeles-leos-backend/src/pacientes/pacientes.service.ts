import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { PrismaService } from '../prisma/prisma.service'; // Ajusta la ruta según dónde tengas tu PrismaService

@Injectable()
export class PacienteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPacienteDto: CreatePacienteDto) {
    return await this.prisma.paciente.create({
      data: createPacienteDto,
    });
  }

  async findAll() {
    return await this.prisma.paciente.findMany({
      // Puedes incluir relaciones si lo deseas, por ejemplo:
      // include: { user: true }
    });
  }

  async findOne(id: string) {
    const paciente = await this.prisma.paciente.findUnique({
      where: { id },
    });
    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
    }

    return paciente;
  }

  async update(id: string, updatePacienteDto: UpdatePacienteDto) {
    // Validamos primero que exista
    await this.findOne(id);

    return await this.prisma.paciente.update({
      where: { id },
      data: updatePacienteDto,
    });
  }

  async remove(id: string) {
    // Validamos primero que exista
    await this.findOne(id);

    return await this.prisma.paciente.delete({
      where: { id },
    });
  }
}
