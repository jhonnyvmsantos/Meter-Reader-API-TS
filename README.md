
# Meter Reader API

Repositório usado para para armazenar uma API de leitura de imagem (medidores de gás ou água), integrada com o Google Gemini Api.

## Stack utilizada

**Back-End:** Typescript e NodeJs.

**Banco de Dados:** MySql.

**Outros:** Docker.

## Funcionalidades

- Análise de imagem/medidor
- Coleta de dados
- Validação/Filtragem dos dados
- Salvamento no danco de dados
- Resposta da análise/aedição

## FAQ

#### A API tende a travar/quebrar constantemente...

A api do Google Gemini, modelo "gemini-1.5-pro" trava constantemente e traz informações erradas... Enquanto o modelo "gemini-1.5-flash" é mais preciso e leve/rápido, normalmente sem travamentos, mas "quebra" ao tentar analizar o valor de um medidor do tipo "gas".

#### Não consigo iniciar a API...

O arquivo .env contendo a GEMINI_API_KEY é necessário para rodar a api, seja local ou através do docker. Propoitalmente, a api é quebrada na falta do arquivo/api_key.

#### Para que é necessário esperar 30 segundos para utilizar a API?

A estrutura do Banco de Dados MySql será construida de forma automática, após 30 segundos a partir da inicialização do projeto.

## Deploy

Para fazer o deploy desse projeto, rode...

```bash
  npm run dev
```

Comando para subir o projeto pro Docker, rode...

```bash
  docker compose --build -d
```
## 🔗 Links
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/jhonnysantosvm/)

## 🚀 Sobre mim
Eu sou um Desenvolvedor Full-Stack com formação técnica em Desenvolvimento de Sistemas, através da Etec de Embu. Além de outros cursos, como: Técnicas Administrativas (Básico), Programação com Arduino, Google Cloud Computing Foundations...

## 🛠 Habilidades
Javascript, TypeScript, Python & C# | ReactJs, React-Native & NodeJs | MySql, MongoDB & FireBase | Git & Github...
