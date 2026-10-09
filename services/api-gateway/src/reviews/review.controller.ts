import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard, UsuarioPayload } from '../auth/jwt.guard';
import { CreateReviewDto } from './dto';
import { ReviewService } from './review.service';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private readonly reviews: ReviewService) {}

  @Post()
  criar(@CurrentUser() usuario: UsuarioPayload, @Body() dto: CreateReviewDto) {
    return this.reviews.criar(usuario, dto);
  }

  @Get('professional/:profissionalId')
  listar(@Param('profissionalId') profissionalId: string) {
    return this.reviews.listarPorProfissional(profissionalId);
  }
}
