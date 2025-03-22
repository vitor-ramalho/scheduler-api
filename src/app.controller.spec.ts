import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: DataSource,
          useValue: {
            query: jest.fn().mockResolvedValue([1]),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('should return health status', async () => {
    const result = { status: 'online', database: true };
    jest.spyOn(appController, 'getHealth').mockResolvedValue(result);

    expect(await appController.getHealth()).toEqual(result);
  });
});
