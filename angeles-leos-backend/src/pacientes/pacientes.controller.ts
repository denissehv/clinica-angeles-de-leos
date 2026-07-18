import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PacienteService } from './pacientes.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { AuthGuard } from '../auth/auth.guard'; // Asegúrate de verificar la ruta correcta a tu AuthGuard
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('pacientes')
@UseGuards(AuthGuard, RolesGuard) // 🔒 Protege todos los endpoints de pacientes con Auth + Roles
@Roles(Role.ADMIN, Role.RECEPCION, Role.MEDICO)
export class PacientesController {
  constructor(private readonly pacientesService: PacienteService) {}

  @Post()
  create(@Body() createPacienteDto: CreatePacienteDto) {
    return this.pacientesService.create(createPacienteDto);
  }

  @Get()
  findAll() {
    return this.pacientesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // 💡 Quitamos el '+' porque el ID es un String (UUID)
    return this.pacientesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePacienteDto: UpdatePacienteDto,
  ) {
    // 💡 Quitamos el '+' para enviar el string directamente
    return this.pacientesService.update(id, updatePacienteDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN) // Borrar un paciente es delicado: solo ADMIN
  remove(@Param('id') id: string) {
    // 💡 Quitamos el '+' para enviar el string directamente
    return this.pacientesService.remove(id);
  }
}
