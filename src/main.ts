/* Основной файл, стартует все модули, сервисы и т.д согласно конфигурации */

import { NestFactory } from '@nestjs/core'; // Импортируем ядро nestjs
import { AppModule } from './app.module'; // Импортируем основной модуль AppModule
import { MicroserviceOptions, Transport } from '@nestjs/microservices'; // Импортируем пакет microservices из офф. репозитория nestjs
import { ConfigService } from '@nestjs/config'; // Импортируем пакет config из офф. репозитория nestjs

async function bootstrap() {
  const app = await NestFactory.create(AppModule); // Подключаем основной модуль AppModule
  const configService = app.get(ConfigService); // Подключаем конфиги, которые берутся из файла .env или .env.dev в зависимости от типа запуска

  /* Создаем микросервис и подключаемся к KAFKA */
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA, // Транспорт KAFKA
    options: {
      client: {
        brokers: [configService.get('KAFKA_BROKER')], // Берем из .env файла переменную KAFKA_BROKER (Смотреть файл .env в корневой папке проекта)
      },
      consumer: {
        groupId: configService.get('KAFKA_GROUP_ID'), // Берем из .env файла переменную KAFKA_GROUP_ID (Смотреть файл .env в корневой папке проекта)
        allowAutoTopicCreation: true, // Ставим опцию автоматического создания тем (если они не существует)
      },
    },
  });
  /* -------------------------------------------- */

  app.startAllMicroservices(); // Стартуем микросервисы (В нашем случае созданный выше KAFKA)
  app.init(); // Инициализация приложения. Если есть необходимость чтобы наше приложение отвечало по HTTP, добавляем строку //app.listen(4000); с указанием необходимого порта
}
bootstrap();
