import { Router } from "express";
import { charityController } from "../controllers/charity.controller";

export const charitiesRouter = Router();

charitiesRouter.get("/", charityController.list);
charitiesRouter.get("/:charityId", charityController.getById);

