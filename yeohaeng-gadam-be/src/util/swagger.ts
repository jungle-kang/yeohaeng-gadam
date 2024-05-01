import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app) {
    const config = new DocumentBuilder()
        .setTitle('Swagger API List')
        .setDescription('Swagger API description')
        .setVersion('1.0')
        .addTag('swagger')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-doc', app, document);
}