## Run the frontend

### Windows

1. Install node.js https://nodejs.org
2. Install yarn https://yarnpkg.com/

### All Systems

1. `$ yarn install`
2. `$ yarn run build`

## Setup

yarn add typescript awesome-typescript-loader source-map-loader --dev
yarn add style-loader css-loader less-loader --dev


## Ziele

1. `serve` aufsetzen, um lokal zu testen
2. `build` aufsetzen, um das Projekt auf dem Server zu releasen
3. `build` in Docker integrieren
3. Kein require.js mehr --> alles per typescript import

## Unklar

- `/dist/` einchecken oder nicht? Kann man das automatisiert bei GitHub haben?
  - pro: Gino könnte ohne irgendwas zu installieren das frontend ausführen
  - contra: Gino müsste eh demnächst mal Docker verwenden, und docker muss den ganzen Frontend build übernehmen