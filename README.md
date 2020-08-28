# chimp_backend

Backend for CHIMP

## Before You Start

All commands should be ran inside the `root` directory.  
After every `pull` to this repo, please run `npm install` (just in case some new module has been added) this is to make sure you have everything installed.

## Running The Server

Run `npm start`  
Default hostname is `localhost`.  
Default port is `5000`.  
Default route to the REST API is `/api/`.  
To make sure everything works normally, hit this route `/api/dev` - it should return a JSON message of `{"message": "Hello World!"}` with the http status of `200`.
