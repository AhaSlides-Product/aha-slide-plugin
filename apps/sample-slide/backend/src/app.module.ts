import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RankingSlideModule } from './ranking-slide/ranking-slide.module';

@Module({
  imports: [RankingSlideModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
