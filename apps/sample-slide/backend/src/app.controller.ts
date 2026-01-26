import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { SubmissionRequest } from '@aha/backend-utils';

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

  @Post()
  @HttpCode(HttpStatus.OK)
  submitAnswer(@Body() payload: SubmissionRequest) {
    console.log('Answer received', payload);
    return this.appService.processSubmission(payload);
  }
}
