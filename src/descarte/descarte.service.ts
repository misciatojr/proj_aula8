import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Descarte } from './descarte.model';
import { Ponto } from '../ponto/ponto.model';

@Injectable()
export class DescarteService {
    constructor(
        @InjectModel('Descarte')
        private readonly descarteModel: Model<Descarte>,

        @InjectModel('Ponto')
        private readonly pontoModel: Model<Ponto>,
    ) {}

    // CREATE
    async createDescarte(descarte: Descarte) {
        const newDescarte = new this.descarteModel({
        userName: descarte.userName,
        spotId: descarte.spotId,           // deve ser o _id de um Ponto
        wasteType: descarte.wasteType,
        disposalDate: descarte.disposalDate,
        });

        const result = await newDescarte.save();
        return result.id as string;
    }

    // READ ALL
    async getAllDescartes() {
        const descartes = await this.descarteModel
        .find()
        // .populate('spotId') //  trazer informações do Ponto de descarte
        .exec();

        return descartes;
    }

    // READ BY ID
    async getDescarteById(id: string) {
        const descarte = await this.descarteModel
        .findById(id)
        // .populate('spotId') //  trazer informações do Ponto de descarte

        if (!descarte) {
        throw new NotFoundException('Descarte não encontrado');
        }

        return descarte;
    }

    // DELETE
    async deleteDescarte(id: string) {
        const result = await this.descarteModel.deleteOne({ _id: id }).exec();

        if (result.deletedCount === 0) {
        throw new NotFoundException('Não foi possível deletar o descarte');
        }
    }

    // UPDATE
    async updateDescarte(id: string, data: Partial<Descarte>) {
        const descarte = await this.descarteModel.findById(id).exec();
        if (!descarte) {
        throw new NotFoundException('Descarte não encontrado');
        }

        if (data.userName !== undefined) {
        descarte.userName = data.userName;
        }
        if (data.spotId !== undefined) {
        descarte.spotId = data.spotId;
        }
        if (data.wasteType !== undefined) {
        descarte.wasteType = data.wasteType;
        }
        if (data.disposalDate !== undefined) {
        descarte.disposalDate = data.disposalDate;
        }

        await descarte.save();
        return descarte;
    }

    // Consulta de histórico de descartes:
    // Permite consultas filtradas por ponto de descarte, tipo de resíduo,
    // data ou nome do usuário;
    async getDescartesFilter(
        spotId?: string,
        wasteType?: string,
        disposalDate?: string,
        userName?: string,
    ) {
        const filtros: any = {};

        if (spotId) {
            filtros.spotId = spotId;
        }

        if (wasteType) {
            filtros.wasteType = wasteType;
        }

        if (userName) {
            filtros.userName = userName;
        }

        if (disposalDate) {
            // Filtra pela data EXATA (yyyy-mm-dd)
            const date = new Date(disposalDate);
            const nextDay = new Date(disposalDate);
            nextDay.setDate(date.getDate() + 1);

            filtros.disposalDate = {
            $gte: date,
            $lt: nextDay,
            };
        }

        return await this.descarteModel
            .find(filtros)
            // .populate('spotId')   // facilitar relatórios, trazendo informacoes do Ponto de descarte
            .exec();
    }
    
    // Dashboard resumido:
    // Retorna um resumo estatístico em JSON
    async getDashboard() {
    const now = new Date();

    const startLast30 = new Date();
    startLast30.setDate(now.getDate() - 30);

    const startPrev30 = new Date();
    startPrev30.setDate(now.getDate() - 60);

    // Média de descartes por dia no período dos últimos 30 dias
    const totalLast30 = await this.descarteModel.countDocuments({
        disposalDate: { $gte: startLast30, $lte: now },
    }).exec();

    const mediaPorDiaUltimos30 = totalLast30 / 30;

    // Percentual de crescimento/redução comparado ao mês (30 dias) anterior
    const totalPrev30 = await this.descarteModel.countDocuments({
        disposalDate: { $gte: startPrev30, $lt: startLast30 },
    }).exec();

    let percentualCrescimentoReducao = 0;
    if (totalPrev30 > 0) {
        percentualCrescimentoReducao =
        ((totalLast30 - totalPrev30) / totalPrev30) * 100;
    } else {
        // Se não há período anterior, mantemos 0% como referência neutra
        percentualCrescimentoReducao = 0;
    }

    // Local de descarte com maior número de registros (considerando TODOS os registros)
    const topPontoAgg = await this.descarteModel.aggregate([
        { $group: { _id: '$spotId', total: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 1 },
    ]).exec();

    let localComMaiorNumeroRegistros: any = null;

    if (topPontoAgg.length > 0 && topPontoAgg[0]._id) {
        const ponto = await this.pontoModel.findById(topPontoAgg[0]._id).exec();
        if (ponto) {
        localComMaiorNumeroRegistros = {
            id: ponto.id,
            name: ponto.name,
            neighborhood: ponto.neighborhood,
            category: ponto.category,
            totalRegistros: topPontoAgg[0].total,
        };
        }
    }

    // Tipo de resíduo mais frequentemente descartado (em todos os registros)
    const topResiduoAgg = await this.descarteModel.aggregate([
        { $group: { _id: '$wasteType', total: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 1 },
    ]).exec();

    let tipoResiduoMaisFrequente: any = null;

    if (topResiduoAgg.length > 0) {
        tipoResiduoMaisFrequente = {
        wasteType: topResiduoAgg[0]._id,
        totalRegistros: topResiduoAgg[0].total,
        };
    }

    // Número total de usuários no sistema (distintos por userName)
    const distinctUsers = await this.descarteModel.distinct('userName').exec();
    const numeroTotalUsuarios = distinctUsers.length;

    // Total de pontos de descarte cadastrados
    const totalPontosDescarte = await this.pontoModel.countDocuments().exec();
    
    return {
        localComMaiorNumeroRegistros,    
        tipoResiduoMaisFrequente,        
        mediaDescartesPorDiaUltimos30Dias: mediaPorDiaUltimos30, 
        numeroTotalUsuarios,             
        totalPontosDescarte,              
        percentualCrescimentoReducao,     
    };
    }
}

