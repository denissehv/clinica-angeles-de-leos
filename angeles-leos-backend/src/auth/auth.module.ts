import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UsersModule, // Mantenemos tu importación para usar el UsersService [cite: 32]
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET, // Usamos la clave secreta del .env [cite: 6, 12]
      signOptions: { expiresIn: '1d' }, // El token expirará en 1 día (puedes cambiarlo)
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
