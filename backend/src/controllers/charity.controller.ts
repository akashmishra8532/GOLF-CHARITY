import type { Request, Response } from "express";
import { charityService } from "../services/charity.service";

export const charityController = {
  async list(_req: Request, res: Response) {
    const charities = await charityService.listCharities();
    res.json({ charities });
  },

  async getById(req: Request, res: Response) {
    const { charityId } = req.params as { charityId: string };
    const charity = await charityService.getCharityById(charityId);
    res.json({ charity: { id: String(charity._id), name: charity.name, slug: charity.slug, description: charity.description ?? "", imageUrl: charity.imageUrl ?? "" } });
  },
};

