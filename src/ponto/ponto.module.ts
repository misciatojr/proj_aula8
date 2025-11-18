import { Module } from '@nestjs/common';
import { PontoController } from './ponto.controller';
import { PontoService } from './ponto.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PontoSchema } from './ponto.model';

@Module({
  imports: [MongooseModule.forFeature([{name: 'Ponto', schema: PontoSchema}])],
  controllers: [PontoController],
  providers: [PontoService]
})
export class PontoModule {}
