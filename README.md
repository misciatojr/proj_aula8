# Projeto Aula 8 – Integração Front-End e Back-End (Web Mobile)

Projeto desenvolvido para a disciplina Web Mobile – Aula 8  
Integração entre Back-End em NestJS (API REST com MongoDB) e Front-End puro (HTML, CSS e JS).


## Configuração da conexão com o MongoDB.

&nbsp;&nbsp;Instruções:

- Substitua 'SUA_CONNECTION_STRING_AQUI' pela sua string de conexão do MongoDB em:  
- <arquivo src/app.module.ts> MongooseModule.forRoot('SUA_CONNECTION_STRING_AQUI')

## Tecnologias
- NestJS
- Node.js
- MongoDB (Mongoose)
- HTML / CSS
- JavaScript (fetch API)
- Live Server (para front-end)

## Estrutura do Projeto
- `src/` – Código-fonte (ponto, descarte, controllers, services, modules)
- `test/` – Estrutura padrão do Nest para testes
- `public/` – Front-end (HTML, CSS, JS)

## Como executar o Back-End
```bash
npm install
npm run start:dev
```

## Initial project setup for Aula 8 integration (NestJS + Front-End)

Includes:
- Backend from Aula 7 (ponto e descarte) migrated into new structure
- Front-end integration created under src/descarte/public
- API endpoints connected via fetch()
- CSS, JS, and HTML organized according to project requirements
- Environment-ready structure for future enhancements and testing
