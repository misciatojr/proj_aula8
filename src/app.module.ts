/*
  Configuração da conexão com o MongoDB.

  Instruções:
    Substitua 'SUA_CONNECTION_STRING_AQUI' pela sua string de conexão do MongoDB em:
    MongooseModule.forRoot('SUA_CONNECTION_STRING_AQUI')
*/

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';  
 
import { DescarteModule } from './descarte/descarte.module';
import { PontoModule } from './ponto/ponto.module';

@Module({
  imports: [
    MongooseModule.forRoot('SUA_CONNECTION_STRING_AQUI'),
    DescarteModule,
    PontoModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
