how to run the app
* npm init

* npm add -D typescript ts-node @types/node @types/express nodemon

* ./node_modules/.bin/tsc --init

* in tsconfig.json file uncomment 

"outDir": "./build"
"experimentalDecorators": true,
"emitDecoratorMetadata": true,

* in package.json file add this properties to script

  "build": "tsc",
    "dev": "nodemon ./build/index.js",
    "start-dev": "tsc && npm dev",

* npm install
* npm run dev2