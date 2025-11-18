import * as mongoose from 'mongoose';

// Registro de descartes por usuario
export const DescarteSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },  //nome do usuário
    spotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ponto', required: true },  //ID do ponto de descarte
    wasteType: { type: String, required: true }, //tipo de resíduo (plástico, papel, orgânico, eletrônico, vidro)
    disposalDate: { type: Date, required: true }  //data
  },
  { timestamps: true }
);

export interface Descarte extends mongoose.Document {
  id: string;
  userName: string;
  spotId: string;
  wasteType: string;
  disposalDate: Date;
}
