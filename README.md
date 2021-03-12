# Case SBF - Backend

## Preparação

Instalar as dependências do projeto.
Requer instalação prévia de [Node JS](https://nodejs.org/en/download/) (\~> v12.19.0) e
[Yarn](https://classic.yarnpkg.com/en/docs/install/) (\~> v1.22.5).

```shell
$ yarn install
```

Subir os serviços necessários de armazenamento de dados.
Requer instalação prévia de [Docker](https://docs.docker.com/engine/install/).

```shell
$ docker run -d -p 27017-27019:27017-27019 mongo
```

## Material adicional e recomendações

É possível verificar as rotas do sistema navegando diretamente pelo Browser de sua
preferência, desde que possua _plugins_ para formatação JSON. Todos os _endpoints_
seguem minimamente a [especificação HAL](http://stateless.co/hal_specification.html),
o que ajuda no uso mais dinâmico para navegar entre os serviços.

### Postman

Também está junto aos arquivos do projeto um arquivo Postman Collection com exemplos
de navegação nos serviços.

### Swagger

Também é possível verificar a documentação do projeto em Swagger, usando o arquivo
swagger.yaml no [Editor online](https://editor.swagger.io/).

## Conversor de Moedas

Incluí a integração com a API da [CurrencyLayer](https://currencylayer.com/), porém com
a informação em _cache_ no sistema. Para verificar as conversões atuais, só navegar pela
rota `/currencies`.

É possível forçar o _refresh_ das informações, bastando passar o parâmetro `token` com
um _access-key_ válido do CurrencyLayer.

```http
GET /currencies?token=xxx
```

> **Nota:** No material do Postman Collection existe um token de exemplo válido, porém há
> um limite do plano free (usar com moderação).
