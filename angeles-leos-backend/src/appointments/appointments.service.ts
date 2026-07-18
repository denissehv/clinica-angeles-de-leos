import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Ajusta la ruta según tu proyecto
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

// Incluimos también al médico (con su nombre) para no tener que hacer una petición aparte en el frontend
const APPOINTMENT_INCLUDE = {
  paciente: true,
  medico: {
    select: {
      id: true,
      especialidad: true,
      user: { select: { nombre: true, apellido: true } },
    },
  },
};

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Agendar una nueva cita
  async create(createAppointmentDto: CreateAppointmentDto) {
    const { fechaHora, motivo, pacienteId, medicoId, estado } =
      createAppointmentDto;

    return this.prisma.appointment.create({
      data: {
        fechaHora: new Date(fechaHora), // Nos aseguramos de guardarlo como objeto Date
        motivo,
        estado,
        pacienteId,
        medicoId,
      },
      include: APPOINTMENT_INCLUDE,
    });
  }

  // 2. Obtener todas las citas (Ideal para administradores o agendas globales)
  async findAll() {
    return this.prisma.appointment.findMany({
      include: APPOINTMENT_INCLUDE,
      orderBy: {
        fechaHora: 'asc', // Ordenadas de la más cercana a la más lejana
      },
    });
  }

  // 3. Obtener una cita específica por ID
  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: APPOINTMENT_INCLUDE,
    });

    if (!appointment) {
      throw new NotFoundException(`La cita con ID ${id} no fue encontrada`);
    }

    return appointment;
  }

  // 4. Actualizar una cita (por ejemplo, cambiar su estado a COMPLETADA o CANCELADA)
  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    // Verificamos primero si existe
    await this.findOne(id);

    const { fechaHora, ...rest } = updateAppointmentDto;

    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...rest,
        ...(fechaHora && { fechaHora: new Date(fechaHora) }), // Solo convierte si viaja una nueva fecha
      },
    });
  }

  // 5. Cancelar/Eliminar físicamente una cita de la base de datos
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.appointment.delete({
      where: { id },
    });
  }
}
