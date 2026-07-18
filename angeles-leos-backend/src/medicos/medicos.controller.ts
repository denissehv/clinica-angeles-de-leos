import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MedicosService } from './medicos.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('medicos')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.RECEPCION, Role.MEDICO) // Necesario para poblar selectores de Citas/Expedientes
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Get()
  findAll() {
    return this.medicosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicosService.findOne(id);
  }
}
