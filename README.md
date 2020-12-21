## My Vue App

## Build Setup

``` bash
# install dependencies
npm install || yarn install

# serve with hot reload at localhost:****
quasar dev

# build for production with minification
quasar build
```

## Absolute Paths

```
quasar: path.resolve(__dirname, '../node_modules/quasar-framework/'),
src: path.resolve(__dirname, '../src'),
assets: path.resolve(__dirname, '../src/assets'),
components: path.resolve(__dirname, '../src/components'),
app: path.resolve(__dirname, '../src/app')

e.g *import global components or quasar components

relative path
import gHeader from '../../../global/common/headers/header'

Absolute Path
import gHeader from 'src/global/common/headers/header'
```

## .env Setup (follow exactly)

* Rename `.env.example` to `.env`

* Change `APP_PORT` and `BACKEND_URL`

```
APP_PORT = 2122
HTTPS = true
BACKEND_URL = //backend/api/v1
STORAGE_PATH = public/storage/
APP_STORAGE_URL = //backend.com/
WEBSOCKET_URL = https://backend.com
INIT_FRESH_WIDGET = true
GIT_VERSION = v0.8
APP_VERSION = v0.9-STABLE
COMPANY_NAME = Anything
INVENTORY_APP_URL = http://inventoryapi.com/auth.php
PROCURMENT_APP_URL = http://inventoryapi.com/auth.php
WEBSOCKET = true
WEBSOCKET_LOGGER = false
LOG_SENTRY = false
SENTRY_DSN = URL
SENTRY_AUTH_TOKEN = TOKEN
SENTRY_URL = https://sentry.gitapps.xyz/
SENTRY_PROJECT=frontend-dev
ESHOP_URL= http://eshop.link

```
