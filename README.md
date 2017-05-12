## Transitlinks — Worldwide transit planner

### Installation
```
npm install
cp .env .env.dev
cp .env .env.test
```
- Edit environment variables in .env.dev to reflect local development environment
- Edit environment variables in .env.test to reflect local test environment

### Starting up background systems
```
sudo ./deploy-postgress.sh
sudo ./deploy-image-server.sh
```

### Running (development mode)
```
source .env.dev
npm start
```

### Test automation
```
source .env.test
npm start -- --release --test
npm run test
npm run e2e
```
E2E testing environment is graciously provided by 
<br>
[<img src="https://www.browserstack.com/images/layout/browserstack-logo-600x315.png" height="100">](http://www.browserstack.com)

### How to Contribute


### Support


### License

Copyright © 2016-2017, Transitlinks. This source code is licensed under the MIT
license found in the [LICENSE.txt](./LICENSE.txt)
file. The documentation to the project is licensed under the
[CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/) license.

---
...
