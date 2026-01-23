import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { SubmitAnswerDto } from '@aha/backend-utils';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('/health-check')
  index() {
    return 'OK';
  }

  @Get('/external/example')
  getExternalExample() {
    return { message: 'external api get' };
  }

  @Post('ranking')
  @HttpCode(HttpStatus.OK)
  submitAnswer(@Body() payload: SubmitAnswerDto) {
    console.log('Answer received', payload);
    return this.appService.processAnswer(payload);
  }
}
