import { Router } from 'express';
import UsersController from '@controllers/users.controller';
import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { authMiddleware } from '@/middlewares/auth.middleware';
import permissionsMiddleware from '@/middlewares/permissions.middleware';
import { config } from '@/config.server';

class UsersRoute implements Routes {
  public path = '/users';
  public router = Router();
  public usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/list`, authMiddleware, this.usersController.getUsers);
    this.router.post(`${this.path}/add`, this.usersController.createUpdateUser);
    this.router.post(`${this.path}/update`, authMiddleware, this.usersController.createUpdateUser);
    this.router.post(`${this.path}/deactivate`, authMiddleware, this.usersController.deactivateUser);
    this.router.post(`${this.path}/login`, this.usersController.userLogin);
  }
}

export default UsersRoute;
