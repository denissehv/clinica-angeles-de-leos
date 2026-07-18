import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { FinancesModule } from './finances/finances.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { SupabaseModule } from './supabase/supabase.module';
import { MedicosModule } from './medicos/medicos.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    PacientesModule,
    AppointmentsModule,
    MedicalRecordsModule,
    FinancesModule,
    PrescriptionsModule,
    SupabaseModule,
    MedicosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
