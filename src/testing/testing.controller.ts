import { Controller, Delete, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('testing')
@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Delete('all-data')
  @ApiOperation({
    summary: 'Clear database: delete all data from all tables/collections',
  })
  @HttpCode(204)
  async deleteAll() {
    await this.dataSource.query(`DELETE FROM public.users;`);
  }
}
