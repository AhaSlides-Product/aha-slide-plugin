import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RankingSlideService } from './ranking-slide.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Controller('ranking')
export class RankingSlideController {
  constructor(private readonly rankingSlideService: RankingSlideService) { }

  @Post()
  @HttpCode(HttpStatus.OK)
  submitAnswer(@Body() payload: SubmitAnswerDto) {
    console.log('Answer received', payload);
    return this.rankingSlideService.processAnswer(payload);
  }
}

