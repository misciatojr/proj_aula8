import * as mongoose from 'mongoose';

// novo ponto de descarte
export const PontoSchema = new mongoose.Schema({
  name: { type: String, required: true }, //nome do local
  neighborhood: { type: String, required: true }, //bairro
  locationType: { type: String, required: true }, //tipo de local (público/privado)
  category: { type: String, required: true }, //categoria dos resíduos aceitos
  geo: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }} //geolocalização.
  },
  { timestamps: true }
);

export interface Ponto extends mongoose.Document {
  id: string;
  name: string;
  neighborhood: string;
  locationType: string;
  category: string;
    geo: {
    lat: number;
    lng: number;
  };
}