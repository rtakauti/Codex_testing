# Poddata

Documentação em português. Versão em inglês: [README.md](./README.md)

Dashboard de analytics para podcast construído com React 19.2.0, Vite e D3.

## Stack

- React 19.2.0
- React DOM 19.2.0
- Vite 8
- D3 7

## Requisitos

- Node.js 20+
- npm

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra a URL local exibida pelo Vite no terminal.

## Scripts

- `npm run dev`: inicia o servidor local com Vite
- `npm run build`: gera o build de produção
- `npm run watch`: recompila em modo watch
- `npm run preview`: sobe o preview local do build

## Idiomas da aplicação

- Inglês continua sendo o idioma padrão da aplicação.
- A interface agora inclui um switcher para `pt-BR`.
- O idioma selecionado é persistido em `localStorage`.

## Como o app funciona

### Frontend

- `src/main.jsx` monta a aplicação React.
- `src/App.jsx` renderiza o layout do dashboard, cards de métricas, recomendações, áreas de gráficos e o switcher de idioma.
- `src/charts.jsx` desenha os gráficos SVG com D3 e recebe os rótulos localizados da camada da aplicação.
- `src/i18n.js` centraliza os textos da UI em inglês e português do Brasil.

### Dados

- `data/data.csv` é a base local embutida usada pela interface.
- `src/podcastData.js` faz o parse do CSV, calcula métricas derivadas e prepara os insights usados no dashboard.
- O app tenta buscar dados mais recentes em `/api/podcast-data` e guarda respostas remotas bem-sucedidas em `localStorage` por 30 minutos.

### Sincronização do CSV

- `vite.config.js` registra uma rota de middleware local em `/api/podcast-data`.
- `scripts/podcastCsvSync.js` verifica a idade de `data/data.csv`.
- Se o arquivo local estiver recente, o middleware responde com o CSV local.
- Se o arquivo estiver antigo, ele tenta baixar o CSV remoto e atualizar `data/data.csv`.
- Se a chamada remota falhar, a aplicação continua funcionando com o arquivo local.

## Git Flow

Fluxo recomendado para novas alterações:

1. Parta de `develop`.
2. Crie uma branch de feature para a tarefa.
3. Implemente e valide com `npm run build`.
4. Faça o merge da feature de volta em `develop`.

Exemplo:

```bash
git checkout develop
git checkout -b feature/i18n-pt-br
```

## Referências

- [Documentação do React](https://react.dev/)
- [Documentação do Vite](https://vite.dev/)
