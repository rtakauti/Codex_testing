# Poddata

Dashboard de analytics para podcast construido com React 19.2.0, Vite e D3.

## Stack

- React 19.2.0
- React DOM 19.2.0
- Vite 8
- D3 7

## Requisitos

- Node.js 20+
- npm

## Como rodar

```bash
npm install
npm run dev
```

Abra a URL local exibida pelo Vite no terminal.

## Scripts

- `npm run dev`: inicia o ambiente local com Vite
- `npm run build`: gera o build de producao
- `npm run watch`: recompila o build em modo watch
- `npm run preview`: sobe o preview do build gerado

## Como o app funciona

### Frontend

- `src/main.jsx` monta a aplicacao React.
- `src/App.jsx` renderiza o dashboard principal, cards de metricas, recomendacoes editoriais e os seis charts.
- `src/charts.jsx` desenha os graficos SVG com D3.

### Dados

- `data/data.csv` e a base local usada pela interface.
- `src/podcastData.js` faz o parse do CSV, calcula metricas derivadas e monta as recomendacoes.
- O app tenta buscar dados atualizados em `/api/podcast-data` e usa `localStorage` como cache por 30 minutos.

### Sincronizacao do CSV

- `vite.config.js` registra um middleware local em `/api/podcast-data`.
- `scripts/podcastCsvSync.js` verifica a idade de `data/data.csv`.
- Se o arquivo local estiver recente, ele responde com o CSV local.
- Se estiver antigo, tenta baixar o CSV remoto e atualizar `data/data.csv`.
- Se a chamada remota falhar, a aplicacao continua funcionando com o arquivo local.

## Git Flow

Fluxo recomendado para novas alteracoes:

1. Parta da branch de integracao do time.
2. Crie uma branch de feature para a tarefa.
3. Desenvolva, valide com `npm run build` e abra o merge de volta para a branch de integracao.

Exemplo de branch de feature:

```bash
git checkout -b codex/feature/react-19-2-0-docs
```

## Referencias

- [Documentacao oficial do React](https://react.dev/)
- [Documentacao oficial do Vite](https://vite.dev/)
