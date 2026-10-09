import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health/health.controller';
import { NoShowModule } from './no-show/no-show.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { TeleconsultModule } from './teleconsult/teleconsult.module';
import { TriageModule } from './triage/triage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    CatalogModule,
    TriageModule,
    SchedulingModule,
    NoShowModule,
    TeleconsultModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
