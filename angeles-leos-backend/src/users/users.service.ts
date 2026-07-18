import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, User } from '@prisma/client';

// Selección segura: nunca regresamos el hash de la contraseña al frontend
const SAFE_USER_SELECT = {
  id: true,
  email: true,
  nombre: true,
  apellido: true,
  role: true,
  telefono: true,
  activo: true,
  createdAt: true,
  updatedAt: true,
  medicoPerfil: true,
  pacientePerfil: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Método usado internamente por AuthService (login)
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // Listado completo de usuarios para el panel de administración
  async findAll() {
    return this.prisma.user.findMany({
      select: SAFE_USER_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: SAFE_USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  // Crea el usuario y, según el rol, su perfil de Médico o Paciente vinculado
  async createFull(dto: CreateUserDto) {
    const existing = await this.findOneByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('El correo electrónico ya está registrado');
    }

    if (dto.role === 'MEDICO' && !dto.cedulaProfesional) {
      throw new BadRequestException(
        'La cédula profesional es requerida para un Médico',
      );
    }
    if (dto.role === 'PACIENTE' && (!dto.fechaNacimiento || !dto.genero)) {
      throw new BadRequestException(
        'La fecha de nacimiento y el género son requeridos para un Paciente',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const apellido = `${dto.apellidoPaterno} ${dto.apellidoMaterno}`.trim();

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          nombre: dto.nombre,
          apellido,
          role: dto.role,
          telefono: dto.telefono,
          activo: dto.activo ?? true,
        },
      });

      if (dto.role === 'MEDICO') {
        await tx.medico.create({
          data: {
            userId: user.id,
            cedulaProfesional: dto.cedulaProfesional!,
            especialidad: dto.especialidad || 'Medicina General',
          },
        });
      }

      if (dto.role === 'PACIENTE') {
        const fechaNacimiento = new Date(dto.fechaNacimiento!);
        const edad = calcularEdad(fechaNacimiento);

        await tx.paciente.create({
          data: {
            userId: user.id,
            nombreCompleto: `${dto.nombre} ${apellido}`.trim(),
            edad,
            fechaNacimiento,
            genero: dto.genero!,
            tipoSanguineo: dto.tipoSanguineo,
          },
        });
      }

      return tx.user.findUnique({
        where: { id: user.id },
        select: SAFE_USER_SELECT,
      });
    });
  }

  // Actualiza los datos base del usuario (y su contraseña si se envía una nueva)
  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    const data: Prisma.UserUpdateInput = {};

    if (dto.email) data.email = dto.email;
    if (dto.nombre) data.nombre = dto.nombre;
    if (dto.apellidoPaterno || dto.apellidoMaterno) {
      data.apellido =
        `${dto.apellidoPaterno ?? ''} ${dto.apellidoMaterno ?? ''}`.trim();
    }
    if (dto.role) data.role = dto.role;
    if (dto.telefono !== undefined) data.telefono = dto.telefono;
    if (dto.activo !== undefined) data.activo = dto.activo;
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.update({
      where: { id },
      data,
      select: SAFE_USER_SELECT,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }
}

function calcularEdad(fechaNacimiento: Date): number {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mesActual = hoy.getMonth() - fechaNacimiento.getMonth();
  if (
    mesActual < 0 ||
    (mesActual === 0 && hoy.getDate() < fechaNacimiento.getDate())
  ) {
    edad--;
  }
  return edad;
}
