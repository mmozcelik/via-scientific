# Via Scientific Code Challenges

This project provides the code to requested endpoints


# Assumptions

1. TSV file contains transcript column, I assumed that this is the so called samplenames
2. I built expressionValues with the TSV data starting with exper_ and control_, each of them is a separate field of expressionValues object

# Development

Just run `yarn dev` and you're off to the races!

## Building

As you'd expect, `yarn build` will fill out the `dist` folder.

**Hot tip 🔥 - there's also `yarn build:clean` that'll wipe out the whole `dist` folder before a new build happens**

## Initializing MongoDB

In case you are using non-docker solution, we would like to initialize mongodb data

`scripts:fill-mongodb-with-tsv`

## Running

Running compiled code is as easy as `yarn start`... Assuming you've built 😜

# Dockerized usage

Dockerized version runs a mongoDB as well as node environment. At docker setup, it creates necessary mongodb database and collection and fills it with provided sample TSV file.

To build container:

`docker compose build`

To run container with mongodb, at the root folder run

`docker compose up`

For the first time(or in case your data is truncated), to install Omics data on embedded mongodb, run:

`docker exec app npm run scripts:fill-mongodb-with-tsv`


# Backend API Docs

You may access all the details of the api docs here

    http://localhost:9999/api-docs

