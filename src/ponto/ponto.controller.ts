import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { PontoService } from './ponto.service';
import * as PontoModel from './ponto.model';

@Controller('ponto')
export class PontoController {
    constructor(private readonly PontoService: PontoService) {}

    // CRUD - CREATE-READ-UPDATE-DELETE
    // CREATE
    @Post()
    async create(@Body() spot: PontoModel.Ponto) {
        const id = await this.PontoService.createPonto(spot);
        return { id };
    }

    // READ ALL
    @Get()
    async getAll() {
        return await this.PontoService.getAllPontos();
    }

    // READ BY ID
    @Get(':id')
    async getById(@Param('id') id: string) {
        return await this.PontoService.getPontoById(id);
    }

    // DELETE
    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.PontoService.deletePonto(id);
        return { message: 'Ponto de descarte removido com sucesso' };
    }

    // UPDATE
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() spot: Partial<PontoModel.Ponto>,
    ) {
        return await this.PontoService.updatePonto(id, spot);
    }
}



