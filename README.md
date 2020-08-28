# chimp_backend

Backend for CHIMP

## Before You Start

All JS commands should be ran inside the `root` directory.  
After every `pull` (or the initial `clone`) to this repo, please run `npm install` (just in case some new module has been added) this is to make sure you have everything installed.

Please edit the database detail/config in `db/pool.js` to match your own database config/detail.

## Running The Server

Run `npm run nodemon` or `npm run start` (please note that with the latter you have to restart your server if you do make changes in the file(s) to see effect).  
Default hostname is `localhost`.  
Default port is `5000`.  
Default route to the REST API is `/api/`.  
To make sure everything works normally, do a `GET` request to this endpoint `/api/dev` - it should return JSON object `{"message": "Hello World!"}` with the http status of `200`.

All non-invalid request errors (server error, query error, etc) will result in http status of `500` with the message of `Server Error`

## Available REST API Endpoints

### /api/dev

There are two types of endpoint, private and public.  
Private routes require JWT token to be sent as headers named `x-auth-token`. JWT token can be obtained by signing in or signing up.

Upon failed request other than server error, ALL **PRIVATE** routes will return a JSON object `{message: "Token is not valid"}` or `{message: "unauthorised/no token found"}` depending on the situation with the http status of `401`.<a name="priv_err"></a>

1. `/` - `GET` **PUBLIC**
   If everything works normally, it should return A JSON object of `{"message": "Hello World!"}` with the http status of `200`.

### /api/admin

1. `/sign-up` - `POST` **PUBLIC**
   Upon successful request: returns JSON object `{message: "user registered", token: "randomJWTtoken"}` with the http status of `200`.  
   Upon failed request: returns an error object (JSON) with the http status of `400`.

### /api/auth

1. `/sign-in` - `POST` **PUBLIC**
   Upon successful request: returns JSON object `{message: "user logged in", token: "randomJWTtoken"}` with the http status of `200`.  
   Upon failed request: returns JSON object `{message: "Invalid credentials"}` with the http status of `400`.

### /api/user

1. `/` - `POST` **PRIVATE**
   Upon successful request: returns JSON object of the current logged in user (containing `user_uid`, and `email`) and a message `{user: userObject, message: "success"}, user_uid: "randomJWTtoken"}` with the http status of `200`.  
   Upon failed request: [here](#priv_err).

## General

Authentication method: JWT  
Database: PostgreSQL
