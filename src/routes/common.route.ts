import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { authMiddleware } from '@middlewares/auth.middleware';
import CommonController from '@/controllers/common.controller';

class CommonRoute implements Routes {
  public path = '/common';
  public CommonController = new CommonController();
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/getCityStateOnPincode`, authMiddleware, this.CommonController.getCityStateOnPincode);
  }
}

export default CommonRoute;
