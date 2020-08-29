# chimp_backend

Backend for CHIMP 🦧 🧡 🍊

## Before You Start

⭐ All JS commands should be ran inside the `root` directory.

⭐ After every `pull` (or the initial `clone`) to this repo, please run `npm install` (just in case some new module has been added) this is to make sure you have everything installed.

⭐ Please edit the **database detail/config and JWT secret** by creating a new file in the root db called `.env`. Just copy the format from `.sample.env` and change the `xxx` to your own detail. Feel free to change the JWT secret to anything, as it will work just fine (this secret is not going to be used in prod).

⭐ Database file (.sql) `chimp_db.sql` is included in the root folder. Feel free to restore / import it to your own machine/server. If you feel more comfortable creating one yourself (instead of importing), check out the file `db.text` included in the root folder.

## Running The Server

Run `npm run nodemon` or `npm run start` (please note that with the latter you have to restart your server if you do make changes in the file(s) to see effect).

Default hostname is `localhost`.

Default port is `5000`.

Default route to the REST API is `/api/`.

To make sure everything works normally, do a `GET` request to this endpoint `/api/dev` (full URL endpoint: `localhost:5000/api/dev`) - it should return JSON object `{msg: "Hello World!"}` with the http status of `200`.

## Available REST API Endpoints

There are two types of endpoint, private and public.  
**IMPORTANT: Private routes ALWAYS require JWT token to be sent as headers named `x-auth-token`.**  
**JWT token can be obtained by signing in or signing up** (JWT authentication method).

### /api/dev

1. `/` - `GET` **PUBLIC**  
   If everything works normally, it should return A JSON object of `{msg: "Hello World!"}` with the http status of `200`.

### /api/admin

1. `/all-users` - `GET` **PUBLIC** (most likely to change in the future)  
   **Upon successful request:** returns an **array** of (JSON) user objects `[userObject0, userObject1]` where `userObject` contains `{id: someid, user_uid: "some user_uid", email: "mail@ex.com" }` with the http status of `200`.

   **Upon failed request:** returns an error object (JSON) with the http status of `400`.

### /api/auth

1. `/sign-up` - `POST` **PUBLIC**  
   **Send from your application:** a JSON object like this: `{email: "email@mail.com", password: "password"}`.

   **Data validation:**

   1. `email` must be of correct format -> Error message: `email_fail`
   2. `password` must be at least 6 characters long -> Error message: `password_fail`

   **Upon successful request:** returns JSON object `{msg: "user registered", token: "randomJWTtoken"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. `{msg: "email_unavailable"}` - if email entered already exist in the db
   2. If data validation is violated: object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg`.

   You can then work with `msg` if somehow your frontend validation allowed these violation(s) still. Value of `msg` can be seen above on the sub-section **Data Validation**.

   The number of `errorObject` depends on how many data validation is violated.

2. `/sign-in` - `POST` **PUBLIC**  
   **Send from your application:** a JSON object like this: `{email: "email@mail.com", password: "password"}`

   **Data validation:**

   1. `email` must be of correct format -> Error message: `email_fail`

   **Upon successful request:** returns JSON object `{msg: "user logged in", token: "randomJWTtoken"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. `{msg: "email_unavailable"}` - if email entered already exist in the db
   2. If data validation is violated: object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg`.

   You can then work with `msg` if somehow your frontend validation allowed these violation(s) still. Value of `msg` can be seen above on the sub-section **Data Validation**.

   The number of `errorObject` depends on how many data validation is violated.

### /api/user

1. `/` - `GET` **PRIVATE**  
   **Upon successful request:** returns JSON object of `userObject` and a msg `{user: userObject, msg: "success"}` where `userObject` is `{user_uid: "some user_uid", email "email@mail.com"}` with the http status of `200`.

   **Upon failed request:** [Errors (#2)](#errors).

## General

Authentication method: JWT  
Database: PostgreSQL

## Errors

1. All non-invalid request errors (any error coming from the backend itself) such as: server error, query error, etc will result in http status of `500` with the msg of `Server Error`.
2. Upon failed request other than `Server Error`, ALL **PRIVATE** routes will return a JSON object `{msg: "Token is not valid"}` or `{msg: "unauthorised/no token found"}` (depending on the situation) with the http status of `401`.
