import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ponto } from './ponto.model';

@Injectable()
export class PontoService {

    constructor(@InjectModel('Ponto') private readonly PontoModel: Model<Ponto>) {}
    
    // CRUD - CREATE-READ-UPDATE-DELETE

    // CREATE
    async createPonto(spot: Ponto) {
        const newSpot = new this.PontoModel({
        name: spot.name,
        neighborhood: spot.neighborhood,
        locationType: spot.locationType,
        category: spot.category,
        geo: {
            lat: spot.geo.lat,
            lng: spot.geo.lng,
        },
        });

        const result = await newSpot.save();
        return result.id as string;
    }

    // READ ALL
    async getAllPontos() {
        const spots = await this.PontoModel.find().exec();
        return spots;
    }

    // READ BY ID
    async getPontoById(id: string) {
        const spot = await this.PontoModel.findById(id).exec();
        if (!spot) {
        throw new NotFoundException('Ponto de descarte não encontrado');
        }
        return spot;
    }

    // DELETE
    async deletePonto(id: string) {
        const result = await this.PontoModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
        throw new NotFoundException('Não foi possível deletar o ponto de descarte');
        }
    }

    // UPDATE
    async updatePonto(id: string, spot: Partial<Ponto>) {
        const existing = await this.PontoModel.findById(id).exec();
        if (!existing) {
        throw new NotFoundException('Ponto de descarte não encontrado');
        }

        if (spot.name !== undefined) existing.name = spot.name;
        if (spot.neighborhood !== undefined) existing.neighborhood = spot.neighborhood;
        if (spot.locationType !== undefined) existing.locationType = spot.locationType;
        if (spot.category !== undefined) existing.category = spot.category;
        if (spot.geo?.lat !== undefined) existing.geo.lat = spot.geo.lat;
        if (spot.geo?.lng !== undefined) existing.geo.lng = spot.geo.lng;

        await existing.save();
        return existing;
    }
}
