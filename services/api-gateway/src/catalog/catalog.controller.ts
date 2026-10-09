import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { SearchProfessionalsDto } from './dto';

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('especialidades')
  especialidades() {
    return this.catalog.listarEspecialidades();
  }

  @Get('professionals')
  buscar(@Query() query: SearchProfessionalsDto) {
    return this.catalog.buscar(query);
  }

  @Get('professionals/:id')
  async detalhe(@Param('id') id: string) {
    const prof = await this.catalog.detalhe(id);
    if (!prof) {
      throw new NotFoundException('Profissional nao encontrado');
    }
    return prof;
  }
}
