# Database

We are using sequelize ORM for connecting to the database, so you can use any database supported by [sequelize] 

You can pass the database configuration in `src/sql-config.json` file under the `production` key
  
 [sequelize]: <https://sequelize.org/master/manual/getting-started.html>
 
# Api Key

Set the google api key in `src/key.json` file under the `key` property.

# Installation

This script requires Node.js v10+ to run.
Make sure `node` & `npm` are in the `path`

Install the dependencies and devDependencies.
```sh
$ npm i
```

# Running the code

### Location & Radius
location & radius can be provided to the `main` function near the end of `src/app.ts` script.
#### example:
code can be run using the command:

`main("-33.8670522,151.1957362", 1500)`

# Run the code
```sh
npx ts-node src/app.ts 
```
