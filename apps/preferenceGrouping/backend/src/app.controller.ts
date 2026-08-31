import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post, ValidationPipe } from '@nestjs/common';
import { SubmissionRequest } from '@aha/backend-utils';
import { AppService } from './app.service';
import { FormGroupsRequestDto, FormGroupsResponseDto } from './dto';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get('/health-check')
  index() {
    return 'OK';
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  submitPicks(@Body() payload: SubmissionRequest) {
    this.logger.log('Pick submission received', { senderId: payload.senderId });
    return this.appService.processSubmission(payload);
  }

  /**
   * Form balanced groups from every collected pick. Mounted at
   * `/api/plugins/preferenceGrouping/external/form-groups`; the presenter posts
   * the roster + private picks here and gets the computed groups back.
   */
  @Post('/external/form-groups')
  @HttpCode(HttpStatus.OK)
  formGroups(
    @Body(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
    body: FormGroupsRequestDto,
  ): FormGroupsResponseDto {
    this.logger.log('Forming groups', {
      participants: body.participantIds?.length ?? 0,
    });
    return this.appService.computeGroups(body);
  }
}
