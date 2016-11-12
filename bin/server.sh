#!/bin/sh

set -e
npm install
npm run build

exec node_modules/.bin/forever --name "sushiversus" dist/server/index.js
