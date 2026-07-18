import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { AuthGuard, JwtPayload } from '../auth/auth.guard'; // Asegúrate de que la ruta sea correcta
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import type { MulterFile } from '../common/interfaces/multer-file.interface';
interface RequestWithUser extends Request {
  user: JwtPayload;
}

@Controller('medical-records')
@UseGuards(AuthGuard, RolesGuard) // Protege todas las rutas de este controlador
@Roles(Role.ADMIN, Role.MEDICO) // Por defecto, solo personal clínico
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  create(@Body() createMedicalRecordDto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(createMedicalRecordDto);
  }

  @Get()
  findAll() {
    return this.medicalRecordsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MEDICO, Role.PACIENTE) // Un paciente puede consultar (solo el suyo, validado en el service)
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.medicalRecordsService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
  ) {
    // Eliminamos el '+' para tratar el id como string
    return this.medicalRecordsService.update(id, updateMedicalRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // Eliminamos el '+' para tratar el id como string
    return this.medicalRecordsService.remove(id);
  }

  // Subir un archivo (radiografía, análisis, PDF) y ligarlo al expediente
  @Post(':id/files')
  @Roles(Role.ADMIN, Role.MEDICO) // Un paciente NO puede subir archivos a su propio expediente
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/ })
        .addMaxSizeValidator({ maxSize: 10 * 1024 * 1024 }) // 10 MB
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: MulterFile,
  ) {
    return this.medicalRecordsService.addFile(id, file);
  }

  // Eliminar un archivo adjunto del expediente
  @Delete(':id/files')
  @Roles(Role.ADMIN, Role.MEDICO)
  removeFile(@Param('id') id: string, @Body('url') url: string) {
    return this.medicalRecordsService.removeFile(id, url);
  }
}
