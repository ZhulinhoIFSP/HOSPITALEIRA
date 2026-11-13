import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ITransactionManager } from '../../domain/transaction/transaction-manager.interface';

@Injectable()
export class PrismaTransactionManager implements ITransactionManager {
  constructor(private readonly prisma: PrismaService) {}

  async executarEmTransacao<T>(operacao: () => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(async () => {
      return await operacao();
    });
  }
}
