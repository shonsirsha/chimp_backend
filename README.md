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

To make sure everything works normally, do a `GET` request to this endpoint `/api/dev` (full URL endpoint: `localhost:5000/api/dev`) - it should return JSON object `{"msg": "Hello World!"}` with the http status of `200`.

## Available REST API Endpoints

There are two types of endpoint, private and public.  
**IMPORTANT: Private routes ALWAYS require JWT token to be sent as headers named `x-auth-token`.**  
**JWT token can be obtained by signing in or signing up** (JWT authentication method).

### /api/dev

1. `/` - `GET` **PUBLIC**  
   If everything works normally, it should return A JSON object of `{"msg": "Hello World!"}` with the http status of `200`.

### /api/admin

1. `/all-users` - `GET` **PUBLIC** (most likely to change in the future)  
   **Upon successful request:** returns an **array** of (JSON) user objects `[userObject0, userObject1]` where `userObject` contains `{id: someid, user_uid: "some user_uid", email: "mail@ex.com" }` with the http status of `200`.

   **Upon failed request:** returns an error object (JSON) with the http status of `400`.

### /api/auth

1. `/sign-up` - `POST` **PUBLIC**  
   **Send from your application (`Content-Type`: `application/JSON`):** a JSON object like this: `{email: "email@mail.com", password: "password"}`.

   <span id="signUpDV">**Data validation:**</span>

   1. `email` must be of correct format -> Error message: `email_fail`
   2. `password` must be at least 6 characters long -> Error message: `password_fail`

   **Upon successful request:** returns JSON object `{"msg": "user registered", token: "randomJWTtoken", user_uid: "some user_uid"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. `{"msg": "email_unavailable"}` - if email entered already exist in the db
   2. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg`.

   You can then work with `msg` if somehow your frontend validation still allows this violation(s).  
   The value of `msg` can be seen above on the sub-section <a href="#signUpDV">**Data Validation**</a>.

   The number of `errorObject` depends on how many data validation is violated.

2. `/sign-in` - `POST` **PUBLIC**  
   **Send from your application (`Content-Type`: `application/JSON`):** a JSON object like this: `{email: "email@mail.com", password: "password"}`

   <span id="signInDV">**Data validation:**</span>

   1. `email` must be of correct format -> Error message: `email_fail`

   **Upon successful request:** returns JSON object `{"msg": "user logged in", token: "randomJWTtoken", user_uid: "some user_uid"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. `{"msg": "invalid_credentials"}` - when credentials does not exist in the db
   2. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg`.

   You can then work with `msg` if somehow your frontend validation still allows this violation(s).  
   The value of `msg` can be seen above on the sub-section <a href="#signInDV">**Data Validation**</a>.

   The number of `errorObject` depends on how many data validation is violated.

3. `/new-access-token` - `POST` **PRIVATE**  
   **Send from your application (`Content-Type`: `application/JSON`):** a JSON object like this: `{user_uid: "some user_uid"}`

   <span id="newAccTDV">**Data validation:**</span>

   1. `user_uid` must exists -> Error message: `user_uid_fail`

   **Upon successful request:** returns JSON object `{"msg": "signed_out"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. `{"msg": "invalid_credentials"}` - when `user_uid` does not exist in the db
   2. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg`.

   You can then work with `msg` if somehow your frontend validation still allows this violation(s).  
   The value of `msg` can be seen above on the sub-section <a href="#newAccTDV">**Data Validation**</a>.

   The number of `errorObject` depends on how many data validation is violated.

4. `/sign-out` - `POST` **PRIVATE**  
   **Send from your application (`Content-Type`: `application/JSON`):** a JSON object like this: `{user_uid: "some user_uid"}`

   <span id="signOutDV">**Data validation:**</span>

   1. `user_uid` must not empty -> Error message: `user_uid_fail`

   **Upon successful request:** returns JSON object `{"msg": "signed_out"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. Returns an error object (JSON) with the http status of `400` - this error comes from DB (very unlikely).
   2. `{"msg": "invalid_credentials"}` - when `user_uid` does not exist in the db
   3. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg`.

   You can then work with `msg` if somehow your frontend validation still allows this violation(s).  
   The value of `msg` can be seen above on the sub-section <a href="#signOutDV">**Data Validation**</a>.

   The number of `errorObject` depends on how many data validation is violated.

### /api/user

1. `/` - `GET` **PRIVATE**  
   **Upon successful request:** returns JSON object of `userObject` and a msg `{user: userObject, "msg": "success"}` where `userObject` is `{user_uid: "some user_uid", email "email@mail.com"}` with the http status of `200`.

   **Upon failed request:** [Errors (#2)](#errors).

2. `/` - `PUT` **PRIVATE**  
   **Send from your application (`Content-Type`: `application/JSON`):** a JSON object like this: `{user_uid: "some user_uid"}`

   <span id="updateUserProfileDV">**Data validation:**</span>

   1. `first_name` must exists -> Error message: `first_name_fail`
   1. `last_name` must exists -> Error message: `last_name_fail`

   **Upon successful request:** returns JSON object `{ "msg": "profile_detail_updated"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. Returns an error object (JSON) with the http status of `400` - this error comes from DB (very unlikely).
   2. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg`.

   You can then work with `msg` if somehow your frontend validation still allows this violation(s).  
   The value of `msg` can be seen above on the sub-section <a href="#updateUserProfileDV">**Data Validation**</a>.

   The number of `errorObject` depends on how many data validation is violated.

3. `/profile-picture` - `PUT` **PRIVATE**  
   **Send from your application (`Content-Type`: `multipart/form-data`):** with a key called `file` and a value of a **single image of type `jpg` / `.jpeg` or `.png`**

   **Upon successful request:** returns JSON object `{"msg": "profile_pic_updated","filePath": "user_uploads/public/images/profile_pictures/some_user_uid/image.png"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. `{"msg": "file_error"}` - when `file` not found / `file` isn't properly formatted.

4. `/profile-picture` - `DELETE` **PRIVATE**  
   **Send from your application :** none

   **Upon successful request:** returns JSON object `{"msg": "profile_pic_removed"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. Returns an error object (JSON) with the http status of `400` - this error comes from DB (very unlikely).

## General

Authentication method: JWT  
Database: PostgreSQL

## Errors

1. All non-invalid request errors (any error coming from the backend itself) such as: server error, query error, etc will result in http status of `500` with the msg of `Server Error`.
2. Upon failed request other than `Server Error`, ALL **PRIVATE** routes will return a JSON object `{"msg": "token_invalid"}` (fake/wrong token) or `${"msg": "token_expired"}` (expired token) or `{"msg": "unauthorised"}` (no token sent) with the http status of `401`.
