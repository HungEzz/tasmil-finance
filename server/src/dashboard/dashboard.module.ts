import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './service/dashboard.service';
import { FmpApiService } from './api/fmp';
import { RedisModule } from 'src/redis/redis.module';
import { RedisCacheService } from 'src/redis/services/redisCacheService';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
    }),
    RedisModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, FmpApiService, RedisCacheService],
})
export class DashboardModule {}
