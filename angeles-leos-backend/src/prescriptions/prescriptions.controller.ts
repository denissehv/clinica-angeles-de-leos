import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { AuthGuard, JwtPayload } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

interface RequestWithUser extends Request {
  user: JwtPayload;
}

@Controller('prescriptions')
@UseGuards(AuthGuard, RolesGuard) // Protege todas las rutas de este controlador
@Roles(Role.ADMIN, Role.MEDICO) // Por defecto, solo personal clínico
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  create(@Body() createPrescriptionDto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(createPrescriptionDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MEDICO, Role.PACIENTE)
  findAll(
    @Req() req: RequestWithUser,
    @Query('medicalRecordId') medicalRecordId?: string,
  ) {
    // Permite filtrar recetas por expediente clínico: /prescriptions?medicalRecordId=xxx
    if (medicalRecordId) {
      return this.prescriptionsService.findByExpediente(
        medicalRecordId,
        req.user,
      );
    }

    // Un PACIENTE nunca puede listar TODAS las recetas, solo las de su propio expediente
    if (req.user.role === Role.PACIENTE) {
      throw new ForbiddenException(
        'Debes especificar tu expediente clínico (medicalRecordId) para consultar tus recetas',
      );
    }

    return this.prescriptionsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MEDICO, Role.PACIENTE)
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.prescriptionsService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
  ) {
    return this.prescriptionsService.update(id, updatePrescriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prescriptionsService.remove(id);
  }
}
