import swaggerJsdoc from 'swagger-jsdoc'

const swaggerOptions: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SMS Provider',
            version: '1.0.0',
        },
    },
    apis: ['./src/modules/**/*.route.ts'], // files containing annotations as above

};

export const swaggerSpec = swaggerJsdoc(swaggerOptions) as any;