import { Controller, Post, Get, Param, Delete, Patch, Body, Query } from '@nestjs/common';
import { DescarteService } from './descarte.service';
import * as descarteModel from './descarte.model';

@Controller('descarte')
export class DescarteController {
    constructor(private readonly descarteService: DescarteService) {}

    // CREATE
    @Post()
    async create(@Body() descarte: descarteModel.Descarte) {
        const id = await this.descarteService.createDescarte(descarte);
        return { id };
    }

    // READ ALL
    @Get()
    async getAll() {
        return await this.descarteService.getAllDescartes();
    }

    // READ - COM FILTRO
    // Consulta de histórico de descartes: Permite consultas filtradas
    // Exemplo: http://localhost:3000/descarte/filtrar?userName=Antonio
    @Get('filtrar')
    async filtrar(
        @Query('spotId') spotId?: string,
        @Query('wasteType') wasteType?: string,
        @Query('disposalDate') disposalDate?: string,
        @Query('userName') userName?: string,
    ) {
    return await this.descarteService.getDescartesFilter(
        spotId,
        wasteType,
        disposalDate,
        userName);
    }

    // DASHBOARD RESUMIDO: Retorna um resumo estatístico em JSON
    // Exemplo: http://localhost:3000/descarte/relatorio
    @Get('relatorio')
    async getDashboard() {
        return await this.descarteService.getDashboard();
    }

    // READ BY ID
    @Get(':id')
    async getById(@Param('id') id: string) {
        return await this.descarteService.getDescarteById(id);
    }

    // DELETE
    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.descarteService.deleteDescarte(id);
        return { message: 'Descarte removido com sucesso' };
    }

    // UPDATE
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() descarte: Partial<descarteModel.Descarte>,
    ) {
        return await this.descarteService.updateDescarte(id, descarte);
    }

}
