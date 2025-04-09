import { GeneratePostDto } from '@/dto';
import { JwtAuthGuard } from '@/guards';
import { GeneratePostService } from '@/services';
import { RequestWithUser } from '@/types';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller()
export class GeneratePostController {
    constructor(private readonly postService: GeneratePostService) {}

    @UseGuards(JwtAuthGuard, ThrottlerGuard)
    @Post('generate')
    async generatePost(
      @Req() req: RequestWithUser,
      @Body() generatePostDto: GeneratePostDto,
    ) {
      const userId = req.user.id
      const generatedPost = await this.postService.generatePost(userId, generatePostDto)
      return generatedPost
    }
}

