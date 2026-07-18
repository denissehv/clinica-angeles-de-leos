import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
// Forzamos el tipado como any o importación directa para evitar el error de ESLint "Unsafe call"
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const { email, password, nombre, apellido, role } = registerDto;

    // 1. Verificar si el usuario ya existe por su correo
    const userExists = await this.usersService.findOneByEmail(email);
    if (userExists) {
      throw new BadRequestException('El correo electrónico ya está registrado');
    }

    // 2. Encriptar la contraseña (sal de 10 rondas)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Guardar el nuevo usuario en la base de datos usando el servicio de usuarios
    return this.usersService.create({
      email,
      password: hashedPassword,
      nombre,
      apellido,
      role,
    });
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Buscar al usuario por correo usando tu UsersService
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Verificar si la cuenta está activa (asumiendo que tu tabla tiene la columna 'activo')
    if ('activo' in user && !user.activo) {
      throw new UnauthorizedException('El usuario se encuentra inactivo');
    }

    // 3. Comparar la contraseña ingresada con el hash guardado
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 4. Generar el JWT Payload
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        role: user.role,
      },
    };
  }
}
