import { Module } from '@nestjs/common';
import { RankingSlideController } from './ranking-slide.controller';
import { RankingSlideService } from './ranking-slide.service';

@Module({
  controllers: [RankingSlideController],
  providers: [RankingSlideService],
})
export class RankingSlideModule {}

