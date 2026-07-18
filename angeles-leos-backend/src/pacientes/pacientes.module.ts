import { Module } from '@nestjs/common';
import { PacienteService } from './pacientes.service';
import { PacientesController } from './pacientes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PacientesController],
  providers: [PacienteService],
})
export class PacientesModule {}
