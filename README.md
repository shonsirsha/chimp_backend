# chimp_backend

Backend for CHIMP 🦧 🧡 🍊

## Before You Start

⭐ All JS commands should be ran inside the `root` directory.

⭐ After every `pull` (or the initial `clone`) to this repo, please run `npm install` (just in case some new module has been added) this is to make sure you have everything installed.

⭐ Please edit the **database detail/config and JWT secret** by creating a new file in the root db called `.env`. Just copy the format from `.sample.env` and change the `xxx` to your own detail. Feel free to change the JWT secret to anything, as it will work just fine (this secret is not going to be used in prod).

⭐ Database file (.sql) `chimp_db.sql` is included in the root folder. Feel free to restore / import it to your own machine/server. If you feel more comfortable creating one yourself (instead of importing), check out the file `db.text` included in the root folder.

⭐ Please see how the authentication method works and the reccomended practice <a href="#authMethod">below</a>.

## Running The Server

Run `npm run nodemon` or `npm run start` (please note that with the latter you have to restart your server if you do make changes in the file(s) to see effect) to run the **REST API SERVER**.

The command above will also automatically run the **FILE SEVER**.

Default hostname is `localhost`.

Default port is `5000` for **REST API SERVER**  
Default port is `7500` for **FILE SERVER**

Default route to the REST API SERVER is `/api/`.
Default route to the FILE SERVER is `/` (the root dir of `chimp backend`).

**Possible Error:**

<a href="#err3">Here (#3)</a> is a possible error when running the server and how to fix it.

To make sure everything works normally, do a `GET` request to this endpoint `/api/dev` (full URL endpoint: `localhost:5000/api/dev`) - it should return JSON object `{"msg": "Hello World!"}` with the http status of `200`.

## <span id="authMethod">Authentication</span>

User signs up by hitting the `/api/auth/sign-up` endpoint. User is automatically authenticated (signed in) after this - OR - User signs in by hitting the `/api/auth/sign-in` endpoint. This returns (jwt) `token` and `user_uid`. Store these two in `localStorage` (web app) or (maybe) `Core Data` (in iOS).

The reason for saving `user_uid` is because it is used on very few endpoints that does not require a fresh (not-expired) `token`. Read more on <a href="#authFlow">authentication flow</a>.

Following the best practices of JWT authentication method, the access token (what is saved locally in the frontend) has a short expiration time (15 minutes).

For testing/development purposes you may modify this expiration time to a different value - for seconds just put integer. E.g: 30 (this is 30 seconds).

Modify the `expiresIn` property in `./routes/utilsgenerateAccessToken.js` file.

### <span id="authFlow">Authentication Flow</span>

When a token has expired and an endpoint that requires a token (private endpoints), this token will no longer be valid and `{msg: token_expired}` will be returned.

What is reccomended is to check any error. If it is equal to `token_expired`, then hit the `/auth/new-access-token`. This will return the new `{token: "sometoken"}` (that will, again, in default expire in 15 minutes). Replace the old (expired) `token` on your frontend with this newly returned `token`.

After that, try to hit the endpoint that previously failed due to `token_expired`. This time it should succeed.

On sign out, you should hit the sign out endpoint `/auth/sign-out` and then remove the `user_uid` and `token` that was saved locally in your application / client's device.

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

   1. `user_uid` must not empty -> Error message: `user_uid_fail`

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

   1. `user_uid` must not be empty -> Error message: `user_uid_fail`

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

2. Upon failed request other than `Server Error`, ALL **PRIVATE** routes will return a JSON object `{"msg": "token_invalid"}` (fake/wrong token) or `{"msg": "token_expired"}` (expired token) or `{"msg": "unauthorised"}` (no token sent) with the http status of `401`.

3. <span id="err3">Error:</span> **`listen EADDRINUSE: address already in use 0.0.0.0:7500<`**

   This means that the port 7500 is being used. Please close any program that uses that port.</span>

   If no program is using it but error still persists, then please kill that port explicitly:

   `sudo lsof -i :7500` - then get the PID  
   `sudo kill -9 <PID>` - without the `<>`
