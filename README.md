# Heroes Node API
- I did this project for the course "Imersão em desenvolvimento de APIs com Node.js" (*translation: Immersion in API development with Node.js*) By [#NodeBR](https://erickwendel.teachable.com/p/node-js-para-iniciantes-nodebr)

### Objectives
- Create an API in Node.js
- Develop the API with a TDD approache (Mocha)
- Develop a multi schema CRUD database (Postgres and MongoDB)
- Generate an API Documentation using Swagger
- Measure the tests code coverage using Istanbul
- Managing of environment variables

### Stack
- Node.js
- Mocha
- Docker
- MongoDB
- PostgreSQL
- Mongoose
- Swagger
- Hapi
- JWT
- Heroku
- PM2
- Istanbul Code Coverage

### To install docker for MongoDB and Postgres

```shell
docker run \
    --name postgres \
    -e POSTGRES_USER=username \
    -e POSTGRES_PASSWORD=mysecretpassword \
    -e POSTGRES_DB=heroes \
    -p 5432:5432 \
    -d \
    postgres

docker run \
    --name adminer \
    -p 8080:8080 \
    --link postgres:postgres \
    -d \
    adminer

## ---- MONGODB
docker run \
    --name mongodb \
    -p 27017:27017 \
    -e MONGO_INITDB_ROOT_USERNAME=admin \
    -e MONGO_INITDB_ROOT_PASSWORD=passwordadmin \
    -d \
    mongo:4

docker run \
    --name mongoclient \
    -p 3000:3000 \
    --link mongodb:mongodb \
    -d \
    mongoclient/mongoclient


sleep 5;

docker exec -it mongodb \
    mongo --host localhost -u admin -p passwordadmin --authenticationDatabase admin \
    --eval "db.getSiblingDB('herois').createUser({user: 'username', pwd: 'mysecretpassword', roles: [{role: 'readWrite', db: 'heroes'}]})"
```

### Setup environment variables

- To try out this API locally, you must create an .env file. You can duplicate the ```.env.example``` and name it ```.env.dev```. Then you should structure the folders this way for that to work:

```text
.
├── config
│   └── .env.dev
```

- Open a terminal and run:

```shell
npm run test:watch
``` 

- Finally, to try out the api or if you want to see the coverage metrics, you can open the following links on your browser:

[http://localhost:5000/documentation](http://localhost:5000/documentation)

[http://localhost:5000/coverage/](localhost:5000/coverage/)
