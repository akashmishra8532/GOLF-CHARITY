import mongoose from "mongoose";

export interface ICharity extends mongoose.Document {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CharitySchema = new mongoose.Schema<ICharity>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, default: "" },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export const Charity = mongoose.model<ICharity>("Charity", CharitySchema);

