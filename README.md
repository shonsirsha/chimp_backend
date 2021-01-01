# CHIMP BACKEND 🦧

![node.js.yml Actions Status](https://github.com/shonsirsha/chimp_backend/workflows/Node.js%20CI/badge.svg)

## 🤔 What is this?

This is a repository for the whole backend system of [Chimp](https://chimp.berlin).

**Diagram of the Chimp Backend:** [here](https://drive.google.com/file/d/1DTqbxWoLerY3wOG5RXmyrOR1gd06YG-o/view?usp=sharing)  
**Diagram of our CI/CD pipeline:** [here](https://drive.google.com/file/d/124fjzCEZkCxMc6X7U7oWQ3R-TZtuQQ6d/view?usp=sharing)  
**ERD Diagram of the Database:** [here](https://drive.google.com/file/d/1nZlTAdcQeIXwiQLGmzmU3Oa9kpKnVMd_/view?usp=sharing)

**Table of content:**

[1. Technology Stack](#tech-stack)  
[2. Get Started](#get-started)  
[3. Authorisation & Authentication Method](#authmethod)  
[4. Available Endpoints](#endpoints)  
[5. Result types](#results)  
[6. General Knwoledge Board / Miscellaneous Infos](#general)  
[7. Possible Errors](#errors)

## Technology Stack <a id="tech-stack"></a>

This backend app is mainly built in Javascript.
These are the 'main' technologies that we are currently using:

[1. Node.JS](https://nodejs.org/en/) (API built using [ExpressJS](https://nodejs.org/en/))  
[2. PostgreSQL](https://www.postgresql.org/) (primary DB)  
[3. Redis](https://redis.io/) (mainly as a cache storage - [how we use redis](#how-redis))  
[4. pm2](https://nodejs.org/en/) (to monitor and manage our Node.JS apps - this is an optional module but we are using it in production)

## Get Started <a id="get-started"></a>

There are currently two possible ways to use our backend 'app':  
[1. Run it on your own machine / locally](#locally). If it's your first time doing this, it's recommended to [read this first.](#locally-before)

[2. Remotely from our server - basically using a live version of it.](#remotely)

## Before Running The App Locally <a id="locally-before"></a>

⭐ **To run and use the app locally**, please make sure to have everything on our tech stack installed.

⭐ The pm2 module is not compulsory. However, it would be best to have it installed (globally in your machine) to be able to run all the scripts available in `package.json` & really simulate what we have up and running in our server within your own machine.

⭐ All JS commands should be ran inside the `root` `(./)` directory.

⭐ After every `pull` (or the initial `clone`) to this repo, please run `npm install` (just in case some new module has been added) this is to make sure you have everything installed.

⭐ Please edit **ALL of the environment variables used in this app** by creating a new file in the root db called `.env`. Just copy the format from `.sample.env` and change the `xxx` to your own detail. Feel free to change the JWT secret to anything, as it will work just fine.

⭐ Database file (.sql) `chimp_db.sql` is included in the `root` directory. Feel free to restore / import it to your own machine/server.

⭐ To test our API using [Postman](https://www.postman.com/), a collection file (JSON) for all endpoints is available in the root directory.

## Running The App Locally <a id="locally"></a>

Assuming you are inside the root directory of this app and:

1. Have pm2 installed, execute the command: `npm run dev`
2. Don't have pm2 installed, execute the command: `npm run nodemon` or `npm run start`. Please note that with the latter you have to restart your server if you do any changess in the file(s) to see effect.

Any of the command above will also automatically run the **FILE SEVER**.

Default hostname is `localhost`.

Default port is `5000` for **RESOURCE SERVER**  
Default port is `4000` for **AUTH SERVER**  
Default port is `7500` for **FILE SERVER**

**FILE SERVER** is used to serve/host static files (mostly images, documents, and other user uploads).

For example, to access a profile picture of a user from your application, make sure that the file server is running, and it should be located at `localhost:7500/user_uploads/somepath/profile_pic.jpg`.

Default host to the RESOURCE SERVER is `localhost:5000/api/`.  
Default host to the FILE SERVER is `localhost:7500/` (the root directory of this repo).

**Possible Error:**

<a href="#err3">Here (#3)</a> is a possible error when running the server and how to fix it.

To make sure everything works normally, do a `GET` request to this endpoint `/api/dev` (full URL endpoint: `localhost:5000/api/dev`) - it should return JSON object `{"msg": "Hello World!"}` with the http status of `200`.

## Using the App Remotely <a id="remotely"></a>

⭐ To use the app remotely, you can simply visit http://167.99.136.248:PORT/api/ANY where `port` and `any` can be found on the [available endpoints section.](#endpoints)

⭐ To test our API using [Postman](https://www.postman.com/), a collection file (JSON) for all endpoints is available in the root directory. Just change `localhost` to our server IP addres `167.99.136.248`.

## Authentication & Authorisation <a id="authmethod"></a>

User signs up by hitting the `/api/auth/sign-up` endpoint. User is automatically authenticated and authorised (signed in) after this - OR - User signs in by hitting the `/api/auth/sign-in` endpoint. This returns (jwt) `token` and `user_uid`. Store these two in `Core Data` (in macOS/iOS).

The reason for still saving `user_uid` while we already have an (access) `token`is because `user_uid` is used on endpoints (very few, currently) that does not require a fresh (not-expired) `token`. Read more on <a href="#authFlow">authentication flow</a>.

Following the best practices of JWT authentication method, the access token (what is saved locally in the frontend) has a short expiration time (15 minutes).

For testing/development purposes you may modify this expiration time to a different value - for seconds just put integer. E.g: 30 (this is 30 seconds).

To modify it, you may edit `JWT_EXPR_TIME` in your `.env` file.

### <span id="authFlow">Authentication Flow</span> <a id="auth-flow"></a>

**When a token has expired** and an endpoint that requires a token (private endpoints), this token will no longer be valid and `{msg: token_expired}` will be returned.

What is reccomended is to check any error. If it is equal to `token_expired`, then hit the `/auth/new-access-token`. This will return the new `{token: "sometoken"}` (that will, again, in default expire in 15 minutes). Replace the old (expired) `token` on your frontend with this newly returned `token`.

After that, try to hit the endpoint that previously failed due to `token_expired`. This time it should succeed.

**On sign out**, you should hit the sign out endpoint `/auth/sign-out` and then remove the `user_uid` and `token` that was saved locally in your application / client's device. **On the backend, this would put the `token` (access token) to a token blacklist db in Redis**, and also removes this `token`'s data saved in the tokens table in our PostgreSQL db.

## Available Endpoints <a id="endpoints"></a>

There are 2 types of endpoint:

1. Private
2. Public

**IMPORTANT: Private routes ALWAYS require JWT token to be sent as headers named `x-auth-token`.**  
**JWT token can be obtained by signing in or signing up** (JWT authentication method).

### **Auth Server | PORT: 4000 (or 4999 on remote development environment)**

### 1. /api/auth

1. `/sign-up` - `POST` | **PUBLIC** | **USER SIGN UP**

   **Sample request (`Content-Type`: `application/JSON`):** `{email: "email@mail.com", password: "password"}`.

   <span id="signUpDV">**Data validation:**</span>

   1. `email` <kbd>**required**</kbd> & must be of correct format -> Error message: `email_fail`
   2. `password` <kbd>**required**</kbd> & must be at least 6 characters long -> Error message: `password_fail`

   **Upon successful request:** returns `{"msg": "user registered", token: "randomJWTtoken", user_uid: "some user_uid"}` with the http status of `200`.

   **Note:** Upon successful request - a new user profile is automatically created in the `user_profile` table with all columns empty (empty string - not null) except for `user_uid` column.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. `{"msg": "email_unavailable"}` - if email entered already exist in the db
   3. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#signUpDV">above</a> in the **Data Validation** sub-section..

      The number of `errorObject` depends on how many data validation is present & how many is violated.

2. `/sign-in` - `POST` | **PUBLIC** | **USER SIGN IN**

   **Sample request (`Content-Type`: `application/JSON`):** `{email: "email@mail.com", password: "password"}`

   <span id="signInDV">**Data validation:**</span>

   1. `email` <kbd>**required**</kbd> & must be of correct format -> Error message: `email_fail`

   **Upon successful request:** returns `{"msg": "user logged in", token: "randomJWTtoken", user_uid: "some user_uid"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. `{"msg": "invalid_credentials"}` - when credentials does not exist in the db
   3. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#signInDV">above</a> in the **Data Validation** sub-section..

      The number of `errorObject` depends on how many data validation is present & how many is violated.

3. `/new-access-token` - `POST` | **PRIVATE** | **GETTING NEW ACCESS TOKEN | This is the 'refresh token' endpoint**

   **Sample request (`Content-Type`: `application/JSON`):** `{user_uid: "some user_uid"}`

   <span id="newAccTDV">**Data validation:**</span>

   1. `user_uid` <kbd>**required**</kbd> & must not be empty -> Error message: `user_uid_fail`

   **Upon successful request:** returns `{"msg": "signed_out"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{"msg": "invalid_credentials"}` - when `user_uid` does not exist in the db
   4. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#newAccTDV">above</a> in the **Data Validation** sub-section..

      The number of `errorObject` depends on how many data validation is present & how many is violated.

4. `/sign-out` - `POST` | **PRIVATE** | **USER SIGN OUT**

   **Sample request (`Content-Type`: `application/JSON`):** `{user_uid: "some user_uid"}`

   <span id="signOutDV">**Data validation:**</span>

   1. `user_uid` <kbd>**required**</kbd> and must not be empty -> Error message: `user_uid_fail`

   **Upon successful request:** returns `{"msg": "signed_out"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{"msg": "invalid_credentials"}` - when `user_uid` does not exist in the db
   4. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#signOutDV">above</a> in the **Data Validation** sub-section.

      The number of `errorObject` depends on how many data validation is present & how many is violated.

### **Resource Server | PORT: 5000 (or 5999 on remote development environment)**

### 1. /api/dev

1. `/` - `GET` | **PUBLIC**
   If everything works normally, it should return A JSON object of `{"msg": "Hello World!"}` with the http status of `200`.

### 2. /api/user

1. `/` - `GET` | **PRIVATE** | **GET CURRENT USER DETAIL**

   **Sample request :** none

   **Upon successful request:** returns `{user: userObject, "msg": "success"}` with the http status of `200`.

   `userObject` is defined <a href="#userObjRes">here</a>

   **Upon failed request:**

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>

2. `/` - `PUT` | **PRIVATE** | **EDIT CURRENT USER DETAIL**

   **Sample request (`Content-Type`: `application/JSON`):** `{"first_name": "firstName", "last_name": "lastName"}`.

   **Very important:** For all `PUT` endpoints, please enter the data that you want to be updated and saved to the DB **ALONG WITH ALL** other required data. Read <a href="#putExplanation">here</a> (#1 General Knowledge Board) for further explanation.

   <span id="updateUserProfileDV">**Data validation:**</span>

   1. `first_name` <kbd>**required**</kbd>-> Error message: `first_name_fail`
   2. `last_name` <kbd>**required**</kbd>-> Error message: `last_name_fail`

   **Upon successful request:** returns `{ "msg": "profile_detail_updated"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#updateUserProfileDV">above</a> in the **Data Validation** sub-section..

      The number of `errorObject` depends on how many data validation is present & how many is violated.

3. `/profile-picture` - `PUT` | **PRIVATE** | **UPLOAD/UPDATE CURRENT USER'S PROFILE PICTURE**

   **Sample request (`Content-Type`: `multipart/form-data`):** with a key called `file` and a value of a **single image of type `jpg` / `.jpeg` or `.png`**

   **Upon successful request:** returns `{"msg": "profile_pic_updated","filePath": "localhost:7500/user_uploads/public/images/profile_pictures/some_user_uid/image.jpg"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{"msg": "file_error"}` - when `file` not found / `file` isn't properly formatted.

4. `/profile-picture` - `DELETE` | **PRIVATE** | **DELETE CURRENT USER'S PROFILE PICTURE**

   **Sample request :** none

   **Upon successful request:** returns `{"msg": "profile_pic_removed"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4) </a>
   2. <a href="#errors">Token Error (#2)</a>

### 3. /api/companies

1. `/` - `GET` | **PRIVATE** | **GET ALL COMPANIES**

   **Sample request :** none

   **Upon successful request:** returns `{companies: [companyObject0,companyObject1], "msg": "success"}` with the http status of `200`.

   `companyObject1` (as **`response`**) is defined <a href="#companyObjRes">here</a>

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>

### 4. /api/company

1. `/` - `GET` | **PRIVATE** | **GET A SINGLE COMPANY**

   **Sample request :** `{"company_uid": "someCompanyId"}`.

   <span id="getCompanyDV">**Data validation:**</span>

   1. `company_uid` <kbd>**required**</kbd>-> On error: `{"msg": "company_uid_fail"}`

   **Upon successful request:** returns `{company: companyObject, "msg": "success"}` with the http status of `200`.

   `companyObject` is defined <a href="#companyObjRes">here</a>

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{ msg: "company_not_found" }` - when `company_uid` does not exist in the db.
   4. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#getCompanyDV">above</a> in the **Data Validation** sub-section.

      The number of `errorObject` depends on how many data validation is present & how many is violated.

2. `/` - `POST` | **PRIVATE** | **CREATE A SINGLE COMPANY**

   **Sample request (`Content-Type`: `application/JSON`):**

   ```json
   {
   	"company_uid": "someCompanyUid",
   	"company_name": "someCompanyName",
   	"company_email": "mail@example.com",
   	"company_website": "https://somewebsite.de",
   	"company_phone": "+490000"
   }
   ```

   **You may leave any of the field as an empty string if you wish to not have anything for that field.**

   For example, company does not have a website, leave it empty like: `{"company_website": ""}`

   <span id="createCompanyDV">**Data validation:**</span>

   1. `company_uid` <kbd>**required**</kbd>-> Error message: `company_uid_fail`
   2. `company_name` <kbd>**required**</kbd>-> Error message: `company_name_fail`
   3. `company_email` <kbd>**required**</kbd>-> Error message: `company_email_fail`
   4. `company_website` <kbd>**required**</kbd>-> Error message: `company_website_fail`
   5. `company_phone` <kbd>**required**</kbd>-> Error message: `company_phone_fail`

   **Upon successful request:** returns `{ "msg": "company_created", company_uid: "someCompanyId"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#createCompanyDV">above</a> in the **Data Validation** sub-section.

   The number of `errorObject` depends on how many data validation is present & how many is violated.

3. `/` - `PUT` | **PRIVATE** | **EDIT A SINGLE COMPANY**

   **Sample request (`Content-Type`: `application/JSON`):**

   ```json
   {
   	"company_uid": "someCompanyId",
   	"company_name": "someCompanyName",
   	"company_email": "mail@example.com",
   	"company_website": "https://somewebsite.de",
   	"company_phone": "+490000"
   }
   ```

   **Very important:** For all `PUT` endpoints, please enter the data that you want to be updated and saved to the DB **ALONG WITH ALL** other required data. Read <a href="#putExplanation">here</a> (#1 General Knowledge Board) for further explanation.

   <span id="editCompanyDV">**Data validation:**</span>

   1. `company_uid` <kbd>**required**</kbd>-> Error message: `company_name_fail`
   2. `company_name` <kbd>**required**</kbd>-> Error message: `company_name_fail`
   3. `company_email` <kbd>**required**</kbd>-> Error message: `company_email_fail`
   4. `company_website` <kbd>**required**</kbd>-> Error message: `company_website_fail`
   5. `company_phone` <kbd>**required**</kbd>-> Error message: `company_phone_fail`

   **Upon successful request:** returns `{ "msg": "company_created", company_uid: "someCompanyId"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{ msg: "company_not_found" }` - when `company_uid` does not exist in the db.
   4. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#editCompanyDV">above</a> in the **Data Validation** sub-section.

      The number of `errorObject` depends on how many data validation is present & how many is violated.

4. `/image/someCompanyID` - `PUT` | **PRIVATE** | **UPDATE / ADD IMAGE OF A COMPANY**

   Related:

   1. <a href="#whyViaURL">**Why do some endpoints require passing id via URL and not JSON?**</a>
   2. <a href="#whyUpdateTwoEndpoints">**Why are some endpoints, such as this one separated from the 'main' edit/update endpoint?**</a>

   **Sample request (`Content-Type`: `multipart/form-data`):** with a key called `file` and a value of a **single image of type `jpg` / `.jpeg` or `.png`**

   **Upon successful request:** returns `{"msg": "picture_updated","filePath": "localhost:7500/user_uploads/public/images/company_image/someCompanyId/image.jpg"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{"msg": "file_error"}` - when `file` not found / `file` isn't properly formatted.
   4. `{"msg": "company_not_found"}` - when `company_uid` does not exist in the db.

5. `/image` - `DELETE` | **PRIVATE** | **DELETE AN IMAGE OF A COMPANY**

   **Sample request :** `{"company_uid": "someCompanyId"}`

   <span id="companyImageDeleteDV">**Data validation:**</span>

   1. `company_uid` <kbd>**required**</kbd>-> Error message: `company_uid_fail`

   **Upon successful request:** returns `{"msg": "picture_removed"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{"msg": "company_not_found"}` - when `company_uid` does not exist in the db.
   4. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#companyImageDeleteDV">above</a> in the **Data Validation** sub-section.

6. `/` - `DELETE` | **PRIVATE** | **DELETE A COMPANY**

   **Sample request :** `{"company_uid": "someCompanyId"}`

   <span id="companyDeleteDV">**Data validation:**</span>

   1. `company_uid` <kbd>**required**</kbd>-> Error message: `company_uid_fail`

   **Upon successful request:** returns `{"msg": "company_deleted"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. <a href="#errors">Caching Error (#5)</a>
   4. `{"msg": "company_not_found"}` - when `company_uid` does not exist in the db.
   5. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#companyDeleteDV">above</a> in the **Data Validation** sub-section.

### 5. /api/contacts

1. `/` - `GET` | **PRIVATE** | **GET ALL CONTACTS**

   **Sample request :** none

   **Upon successful request:** returns `{contacts: [contactObject0,contactObject1], "msg": "success"}` with the http status of `200`.

   `contactObject` (as **`response`**) is defined <a href="#contactObjRes">here</a>

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>

### 6. /api/contact

1. `/` - `GET` | **PRIVATE** | **GET A SINGLE CONTACT**

   **Sample request :** `{"contact_uid": "someContactUid"}`.

   <span id="getContactDV">**Data validation:**</span>

   1. `contact_uid` <kbd>**required**</kbd>-> On error: `{"msg": "contact_uid_fail"}`

   **Upon successful request:** returns `{contact: contactObject, "msg": "success"}` with the http status of `200`.

   `contactObject` is defined <a href="#contactObjRes">here</a>

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{"msg": "contact_not_found"}` - when `contact_uid` does not exist in the db.
   4. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#getContactDV">above</a> in the **Data Validation** sub-section.

      The number of `errorObject` depends on how many data validation is present & how many is violated.

2. `/` - `POST` | **PRIVATE** | **CREATE A SINGLE CONTACT**

   **Sample request (`Content-Type`: `application/JSON`):**

   ```json
   {
   	"contact_uid": "someContactUid",
   	"first_name": "firstName",
   	"last_name": "lastName",
   	"phone": "+49000",
   	"email": "mail@example.com",
   	"dob": 1603636742, // this is epoch (integer)
   	"note": "",
   	"company_uids": [],
   	"tag_uids": [],
   	"project_uids": []
   }
   ```

   **You may leave any of field empty if you wish to not have anything for that field EXCEPT `contact_uid`**

   For example, contact does not belong to any company, leave it as (an) empty (array - in this case) like: `{"company_uids": []}`

   <span id="createContactDV">**Data validation:**</span>

   1. `company_uid` <kbd>**required**</kbd>-> Error message: `company_uid_fail`
   2. `first_name` <kbd>**required**</kbd>-> Error message: `first_name_fail`
   3. `last_name` <kbd>**required**</kbd>-> Error message: `last_name_fail`
   4. `phone` <kbd>**required**</kbd>-> Error message: `phone_fail`
   5. `email` <kbd>**required**</kbd>-> Error message: `email_fail`
   6. `dob` <kbd>**required**</kbd>-> Error message: `dob_fail`
   7. `note` <kbd>**required**</kbd>-> Error message: `note_fail`
   8. `company_uids` <kbd>**required**</kbd>-> Error message: `company_uids_fail`
   9. `tag_uids` <kbd>**required**</kbd>-> Error message: `tag_uids_fail`
   10. `project_uids` <kbd>**required**</kbd>-> Error message: `project_uids_fail`

   **Upon successful request:** returns `{ "msg": "contact_created", contact_uid: "someContactUid"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. <a href="#errors">Caching Error (#5)</a>
   4. `{msg: "tag_uids_not_array"}` - when `tag_uids` is not of type array
   5. `{msg: "company_uids_not_array"}` - when `company_uids` is not of type array
   6. `{msg: "project_uids_not_array}` - when `project_uids` is not of type array
   7. `{msg: "one_or_more_invalid_tag_uid}` - when at least one `tag_uid` in the `tag_uids` array is invalid
   8. `{msg: "one_or_more_invalid_company_uid}` - when at least one `company_uid` in the `company_uids` array is invalid
   9. `{msg: "one_or_more_invalid_project_uid}` - when at least one `project_uid` in the `project_uids` array is invalid
   10. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#createContactDV">above</a> in the **Data Validation** sub-section.

   The number of `errorObject` depends on how many data validation is present & how many is violated.

3. `/` - `PUT` | **PRIVATE** | **EDIT A SINGLE CONTACT**

   **Sample request (`Content-Type`: `application/JSON`):**

   ```json
   {
   	"first_name": "firstName",
   	"last_name": "lastName",
   	"phone": "+49000",
   	"email": "mail@example.com",
   	"dob": 1603636742, // this is epoch (integer)
   	"note": "",
   	"company_uids": [],
   	"tag_uids": []
   }
   ```

   **Very important:** For all `PUT` endpoints, please enter the data that you want to be updated and saved to the DB **ALONG WITH ALL** other required data. Read <a href="#putExplanation">here</a> (#1 General Knowledge Board) for further explanation.

   <span id="updateSingleContactDV">**Data validation:**</span>

   1. `first_name` <kbd>**required**</kbd>-> Error message: `first_name_fail`
   2. `last_name` <kbd>**required**</kbd>-> Error message: `last_name_fail`
   3. `phone` <kbd>**required**</kbd>-> Error message: `phone_fail`
   4. `email` <kbd>**required**</kbd>-> Error message: `email_fail`
   5. `dob` <kbd>**required**</kbd>-> Error message: `dob_fail`
   6. `note` <kbd>**required**</kbd>-> Error message: `note_fail`
   7. `company_uids` <kbd>**required**</kbd>-> Error message: `company_uids_fail`
   8. `tag_uids` <kbd>**required**</kbd>-> Error message: `tag_uids_fail`

   **Upon successful request:** returns `{ "msg": "contact_updated", contact_uid: "someContactId"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Error (#2)</a>
   3. <a href="#errors">Caching Error (#5)</a>
   4. `{msg: "tag_uids_not_array"}` - when `tag_uids` is not of type array
   5. `{msg: "company_uids_not_array"}` - when `company_uids` is not of type array
   6. `{msg: "project_uids_not_array}` - when `project_uids` is not of type array
   7. `{msg: "one_or_more_invalid_tag_uid}` - when at least one `tag_uid` in the `tag_uids` array is invalid
   8. `{msg: "one_or_more_invalid_company_uid}` - when at least one `company_uid` in the `company_uids` array is invalid
   9. `{msg: "one_or_more_invalid_project_uid}` - when at least one `project_uid` in the `project_uids` array is invalid
   10. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#updateSingleContactDV">above</a> in the **Data Validation** sub-section.

4. `/image/someContactID` - `PUT` | **PRIVATE** | **UPDATE / ADD IMAGE OF A CONTACT**

   Related:

   1. <a href="#whyViaURL">**Why do some endpoints require passing id via URL and not JSON?**</a>
   2. <a href="#whyUpdateTwoEndpoints">**Why are some endpoints, such as this one separated from the 'main' edit/update endpoint?**</a>

   **Sample request (`Content-Type`: `multipart/form-data`):** with a key called `file` and a value of a **single image of type `jpg` / `.jpeg` or `.png`**

   **Upon successful request:** returns `{"msg": "picture_updated", "filePath": "localhost:7500/user_uploads/public/images/contact_image/someContactID/image.jpg"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. <a href="#errors">Caching Error (#5)</a>
   4. `{"msg": "file_error"}` - when `file` is not found / `file` is not properly formatted.
   5. `{"msg": "contact_not_found"}` - when `contact_uid` does not exist in the db.

5. `/image` - `DELETE` | **PRIVATE** | **DELETE AN IMAGE OF A CONTACT**

   **Sample request :** `{"contact_uid": "someCompanyId"}`

   <span id="contactImageDeleteDV">**Data validation:**</span>

   1. `contact_uid` <kbd>**required**</kbd>-> Error message: `contact_uid_failed`

   **Upon successful request:** returns `{"msg": "picture_removed"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. <a href="#errors">Caching Error (#5)</a>
   4. `{"msg": "contact_not_found"}` - when `contact_uid` does not exist in the db.
   5. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#contactImageDeleteDV">above</a> in the **Data Validation** sub-section.

6. `/` - `DELETE` | **PRIVATE** | **DELETE A CONTACT**

   **Sample request :** `{"contact_uid": "someContactUID"}`

   <span id="contactDeleteDV">**Data validation:**</span>

   1. `contact_uid` <kbd>**required**</kbd>-> Error message: `contact_uid_failed`

   **Upon successful request:** returns `{"msg": "contact_deleted"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. <a href="#errors">Caching Error (#5)</a>
   4. `{"msg": "contact_not_found"}` - when `contact_uid` does not exist in the db.
   5. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#contactDeleteDV">above</a> in the **Data Validation** sub-section.

### 7. /api/project

1. `/` - `GET` | **PRIVATE** | **GET A SINGLE PROJECT**

   **Sample request :** `{"project_uid": "someProjectUid"}`.

   <span id="getProjectDv">**Data validation:**</span>

   1. `project_uid` <kbd>**required**</kbd>-> On error: `{"msg": "project_uid_fail"}`

   **Upon successful request:** returns `{project: projectObject, "msg": "success"}` with the http status of `200`.

   `projectObject` is defined <a href="#projectObjectRes">here</a>

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{"msg": "project_not_found"}` - when `project_uid` does not exist in the db.
   4. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#getProjectDv">above</a> in the **Data Validation** sub-section.

      The number of `errorObject` depends on how many data validation is present & how many is violated.

2. `/` - `POST` | **PRIVATE** | **CREATE A SINGLE PROJECT**

   **Sample request (`Content-Type`: `application/JSON`):**

   ```json
   {
   	"project_uid": "someProjectUid",
   	"project_name": "someProjectName",
   	"project_note": "someProjectNote",
   	"project_status": "someProjectStatus",
   	"project_starts": 16000000000, // int
   	"project_ends": 16000000000, // int
   	"project_due": 16000000000, // int
   	"tag_uids": ["someTagUid1", "someTagUid2"]
   }
   ```

   **You may leave any of field empty if you wish to not have anything for that field EXCEPT `project_uid`**

   For example, a project does not have any tag, leave it as (an) empty (array - in this case) like: `{"tag_uids": []}`

   <span id="createProjectDV">**Data validation:**</span>

   1. `project_uid` <kbd>**required**</kbd>-> Error message: `project_uid_fail`
   2. `project_name` <kbd>**required**</kbd>-> Error message: `project_name_fail`
   3. `project_note` <kbd>**required**</kbd>-> Error message: `project_note_fail`
   4. `project_status` <kbd>**required**</kbd>-> Error message: `project_status_fail`
   5. `project_starts` <kbd>**required**</kbd>-> Error message: `project_starts_fail`
   6. `project_ends` <kbd>**required**</kbd>-> Error message: `project_ends_fail`
   7. `project_due` <kbd>**required**</kbd>-> Error message: `project_due_fail`
   8. `tag_uids` <kbd>**required**</kbd>-> Error message: `tag_uids_fail`

   **Upon successful request:** returns `{ "msg": "project_created", project_uid: "someProjectUid"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. <a href="#errors">Caching Error (#5)</a>
   4. `{msg: "tag_uids_not_array"}` - when `tag_uids` is not of type array
   5. `{msg: "one_or_more_invalid_tag_uid}` - when at least one `tag_uid` in the `tag_uids` array is invalid
   6. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#createProjectDV">above</a> in the **Data Validation** sub-section.

   The number of `errorObject` depends on how many data validation is present & how many is violated.

3. `/` - `PUT` | **PRIVATE** | **EDIT A SINGLE PROJECT**

   **Sample request (`Content-Type`: `application/JSON`):**

   ```json
   {
   	"project_name": "someProjectName",
   	"project_note": "someProjectNote",
   	"project_status": "someProjectStatus",
   	"project_starts": 16000000000, // int
   	"project_ends": 16000000000, // int
   	"project_due": 16000000000, // int
   	"tag_uids": ["someTagUid1", "someTagUid2"]
   }
   ```

   **Very important:** For all `PUT` endpoints, please enter the data that you want to be updated and saved to the DB **ALONG WITH ALL** other required data. Read <a href="#putExplanation">here</a> (#1 General Knowledge Board) for further explanation.

   <span id="updateSingleProjectDV">**Data validation:**</span>

   1. `project_name` <kbd>**required**</kbd>-> Error message: `project_name_fail`
   2. `project_note` <kbd>**required**</kbd>-> Error message: `project_note_fail`
   3. `project_status` <kbd>**required**</kbd>-> Error message: `project_status_fail`
   4. `project_starts` <kbd>**required**</kbd>-> Error message: `project_starts_fail`
   5. `project_ends` <kbd>**required**</kbd>-> Error message: `project_ends_fail`
   6. `project_due` <kbd>**required**</kbd>-> Error message: `project_due_fail`
   7. `tag_uids` <kbd>**required**</kbd>-> Error message: `tag_uids_fail`

   **Upon successful request:** returns `{ "msg": "project_updated", project_uid: "someProjectUid"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Error (#2)</a>
   3. <a href="#errors">Caching Error (#5)</a>
   4. `{msg: "tag_uids_not_array"}` - when `tag_uids` is not of type array
   5. `{msg: "one_or_more_invalid_tag_uid}` - when at least one `tag_uid` in the `tag_uids` array is invalid
   6. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#updateSingleProjectDV">above</a> in the **Data Validation** sub-section.

4. `/` - `DELETE` | **PRIVATE** | **DELETE A PROJECT**

   **Sample request :** `{"project_uid": "someProjectUid"}`

   <span id="projectDeleteDV">**Data validation:**</span>

   1. `project_uid` <kbd>**required**</kbd>-> Error message: `project_uid_failed`

   **Upon successful request:** returns `{"msg": "project_deleted"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. <a href="#errors">Caching Error (#5)</a>
   4. `{"msg": "contact_not_found"}` - when `contact_uid` does not exist in the db.
   5. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#projectDeleteDV">above</a> in the **Data Validation** sub-section.

### 8. /api/projects

1. `/` - `GET` | **PRIVATE** | **GET ALL PROJECTS**

   **Sample request :** none

   **Upon successful request:** returns `{projects: [projectObject0,projectObject1], "msg": "success"}` with the http status of `200`.

   `projectObject1` (as **`response`**) is defined <a href="#projectObjectRes">here</a>

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>

### 10. /api/tags

1. `/` - `GET` | **PRIVATE** | **GET ALL TAGS**

   **Sample request :** none

   **Upon successful request:** returns `{tags: [tagObject0,tagObject1], "msg": "success"}` with the http status of `200`.

   `tagObject` (as **`response`**) is defined <a href="#tagObjectRes">here</a>

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>

## Response objects

1. <span id="userObjRes">`userObject`:</span>

   ```json
   {
   	"user_uid": "someUserId",
   	"first_name": "firstName",
   	"last_name": "lastName",
   	"picture": "pathToPicture/img.jpg",
   	"email": "email@mail.com"
   }
   ```

2. <span id="companyObjRes">`companyObject`:</span>

   ```json
   {
   	"id": someId, // int
   	"user_uid": "someUserId",
   	"company_uid": "someCompanyId",
   	"company_name": "someCompanyName",
   	"company_email": "mail@example.com",
   	"company_website": "https://somewebsite.de",
   	"picture": "pathToPicture/img.jpg",
   	"company_phone": "+490000",
   	"created_at": "16000000000", // *This is EPOCH.
   	"updated_at": "16000000000", // *This is EPOCH.
   	"contact_uids": ["contactUid0", "contactUid1"]

   	//* What to do with EPOCH?
   	// Convert EPOCH to integer first,
   	// and then you can then convert it again
   	// to any date format you like.
   }
   ```

   Any of these might be an empty string except: `id`, `user_uid`, `company_uid`.

3. <span id="contactObjRes">`contactObject`:</span>

   ```json
   {
   	"id": someId, // int
   	"user_uid": "someUserId",
   	"contact_uid": "someContactId",
   	"first_name": "firstName",
   	"last_name": "lastName",
   	"phone": "+490000",
   	"email": "mail@example.com",
   	"dob": "16000000000", // *This is EPOCH.
   	"created_at": "16000000000", // *This is EPOCH.
   	"updated_at": "16000000000", // *This is EPOCH.
   	"picture": "pathToPicture/img.jpg",
   	"tag_uids": ["tagUid0", "tagUid1"],
   	"company_uids": ["companyUid0", "companyUid1"],
   	"project_uids": ["projectUid0", "projectUid1"]

   	//* What to do with EPOCH?
   	// Convert EPOCH to integer first,
   	// and then you can then convert it again
   	// to any date format you like.
   }
   ```

   Any of these might be an empty string except: `id`, `user_uid`, `contact_uid`.

4. <span id="projectObjectRes">`projectObject:`</span>

```json
{
	"id": someId, //int
	"user_uid": "someUserId",
	"project_uid": "someProjectId",
	"project_name": "someProjectName",
	"project_note": "someProjectNote",
	"project_status": "someProjectStatus",
	"project_starts": "16000000000", // *This is EPOCH
	"project_ends": "16000000000", // *This is EPOCH.
	"project_due": "16000000000", // *This is EPOCH.
	"created_at": "16000000000", // *This is EPOCH.
	"updated_at": "16000000000", // *This is EPOCH.
	"tag_uids": ["someTagUid0", "someTagUid1"]

	//* What to do with EPOCH?
	// Convert EPOCH to integer first,
	// and then you can then convert it again
	// to any date format you like.
}
```

5. <span id="tagObjectRes">`tagObject:`</span>

```json
{
	"msg": "success",
	"tags": [
		{
			"id": someId, // int
			"tag_uid": "someTagUid",
			"tag_name": "someTagName",
			"tag_name_lc": "sometagname",
			"user_uid": "someTagUserUid",
			"created_at": "16000000000", // *This is EPOCH.
			"updated_at": "16000000000" // *This is EPOCH.
		}
	]

	//* What to do with EPOCH?
	// Convert EPOCH to integer first,
	// and then you can then convert it again
	// to any date format you like.
}
```

## <span id="putExplanation">General Knwoledge Board</span> <a id="general"></a>

1.  For ALL `PUT` endpoints</span> please enter the data that you want to be updated and saved to the DB **ALONG WITH** other required data.

    **For example**, for `/api/user/`, if you want `lastName` to be renamed to `newLastName`, then send the full request (with all <kbd>**required**</kbd> and unchanged fields), such as (here, `first_name` is unchanged): `{"first_name": "oldFirstName", "last_name": "newLastName"}`.

    **Leaving `"first_name"` as empty string will result to updating its value to empty string in the DB, essentially removing it. So please be very careful.**

2.  **<span id="whyViaURL">Why do some endpoints require passing id via URL and not JSON?</span>**

    The reason is because the UID of the contact/company is needed and sending it via JSON is **simply not possible**, due to the nature of the request.

    On endpoints that upload a picture/file it is reccomended to use **multipart/form-data** (both for file size and security), and sending **multipart/form-data** simultaneously with **JSON** is not possible.

    However, this isn't the case with updaing/uploading **user's** picture/file because the user has an access token (JWT token) sent via `header` (called `x-access-token`) and when it's decoded it contains the UID needed (`user_uid`).

3.  **<span id="whyUpdateTwoEndpoints">Why are some endpoints, such as updating user's detail (string) and updating user's image (file) separated?</span>**

    While it seems logically correct to have one endpoint to do both as they are essentially "editing" the user, it is simply not possible due to the nature of the request.

    On endpoints that upload a picture/file it is reccomended to use **multipart/form-data** (both for file size and security), and sending **multipart/form-data** simultaneously with **JSON** is not possible.

    In the future, an enhacement may be possible - that is to have one general endpoint that expects the client to send both picture/file and JSON as **file (.json)** at the same time.

    However, this means the client (your app) has to somehow turn the JSON request into a file first (.json). The two (or more) then are going to be separated in the backend.

4.  **<span id="how-redis">How is Redis used in this app?</span>** <a id="how-redis"></a>
    Currently, we mainly use Redis for two "things":

    1. To store blacklisted tokens.
    2. To store data as cache.

    By using redis, it allows us to dramatically reduce the number of calls/queries to the database, that also results in a more stable response time from our backend.

    To see how redis is used for blacklisting access tokens, please see [authflow (on sign out)](#auth-flow)

    To be more technical on how exactly we use redis for caching, let's use a real endpoint as an example. At the moment, only one endpoint uses redis for caching. That is the `:5000/api/contacts` `GET` endpoint. This endpoint returns all contacts of a user.

    On each successful attempt of "writing" (creating, deleting, and editing/updating) a contact, a "last write time" (EPOCH) is stored in redis. Let's just call the write time as `lastWrite` time. To be clear, the act of saving this time to redis is done at their respective (create/delete/edit contact) endpoints. `lastWrite` is saved as hash with a key-value pair of `user_uid:time_in_epoch`

    At the `:5000/api/contacts` `GET` endpoint, the same data structure as `lastWrite` is saved in Redis, with a different name called `lastRead`. The act of saving `lastRead` is done after all contacts have been retrieved from the database.

    After saving last read, the whole contacts that just got retrieved from the database are also saved under a hash, and for simplicty's sake let's call it `contacts`. This hashmap contains many hashmaps with the a key-value pair as such `user_uid:contacts` where (as you might already know) `contacts` is the `contacts` from the database. **This is basically what we meant by caching**.

    In order for us to decide whether we should take the data from the DB or from cache (redis), we could compare the two times (`lastWrite` & `lastRead`) and with a simple algorithm we could decide either we should do the one or the other.

## Errors <a id="errors"></a>

1. All non-invalid request errors (any error coming from the backend itself) such as: server error, query error, etc will result in http status of `500` with the msg of `Server Error`.

2. Upon failed request other than `Server Error`, ALL **PRIVATE** routes will return a JSON object `{"msg": "token_invalid"}` (fake/wrong token) or `{"msg": "token_expired"}` (expired token) or `{"msg": "unauthorised"}` (no token sent / token is blacklisted) with the http status of `401`.

3. <span id="err3">Error:</span> **`listen EADDRINUSE: address already in use 0.0.0.0:7500`**

   This means that the port 7500 is being used. Please close any program that uses that port.</span>

   If no program is using it but error still persists, then please kill that port explicitly:

   `sudo lsof -i :7500` - then get the PID  
   `sudo kill -9 <PID>` - without the `<>`

4. <span id="err4">Error: Returns</span> an error object (JSON) - this error is due to failed DB query(ies) (very unlikely to happen).
5. <span id="err5">Error: Returns</span> an JSON object `{"msg": "caching_error"}` - this error is due to failed caching from redis (very unlikely to happen)
