import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const schemaMatch = connectionString?.match(/schema=([a-zA-Z0-9_-]+)/);
    const schema = schemaMatch ? schemaMatch[1] : 'cocao';

    const pool = new Pool({
      connectionString,
    });

    const adapter = new PrismaPg(pool, { schema });

    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      console.warn('PrismaService: Conexão com banco adiada (servidor iniciou em modo resiliente):', (error as Error).message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
