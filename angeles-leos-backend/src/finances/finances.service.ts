import { Injectable } from '@nestjs/common';
import { CreateFinanceDto } from './dto/create-finance.dto';
import { UpdateFinanceDto } from './dto/update-finance.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinancesService {
  constructor(private prisma: PrismaService) {}

  create(createFinanceDto: CreateFinanceDto) {
    return this.prisma.finance.create({ data: createFinanceDto });
  }

  findAll() {
    return this.prisma.finance.findMany({
      include: { paciente: true },
      orderBy: { fecha: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.finance.findUnique({ where: { id } });
  }

  update(id: string, updateFinanceDto: UpdateFinanceDto) {
    return this.prisma.finance.update({
      where: { id },
      data: updateFinanceDto,
    });
  }

  remove(id: string) {
    return this.prisma.finance.delete({ where: { id } });
  }
}
