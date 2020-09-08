# CHIMP BACKEND 🦧

Developed by the best team out there 🍊🧡

## Before You Start

⭐ All JS commands should be ran inside the `root` directory.

⭐ After every `pull` (or the initial `clone`) to this repo, please run `npm install` (just in case some new module has been added) this is to make sure you have everything installed.

⭐ Please edit the **database detail/config and other vars** by creating a new file in the root db called `.env`. Just copy the format from `.sample.env` and change the `xxx` to your own detail. Feel free to change the JWT secret to anything, as it will work just fine (this secret is not going to be used in prod).

⭐ Database file (.sql) `chimp_db.sql` is included in the root folder. Feel free to restore / import it to your own machine/server. If you feel more comfortable creating one yourself (instead of importing), check out the file `db.text` included in the root folder.

⭐ Please see how the authentication method works and the reccomended practice <a href="#authMethod">below</a>.

## Running The Server

Run `npm run nodemon` or `npm run start` (please note that with the latter you have to restart your server if you do make changes in the file(s) to see effect) to run the **REST API SERVER**.

Any of the command above will also automatically run the **FILE SEVER**.

Default hostname is `localhost`.

Default port is `5000` for **REST API SERVER**  
Default port is `7500` for **FILE SERVER**

**FILE SERVER** is used to serve/host static files (mostly images, documents, and other user uploads). It is in default located at `./user_uploads`

For example, to access a profile picture of a user from your application, make sure that the file server is running, and it should be located at `localhost:7500/user_uploads/somepath/profile_pic.jpg`.

Default host to the REST API SERVER is `localhost:5000/api/`.  
Default host to the FILE SERVER is `localhost:7500/` (the root directory of this repo).

**Possible Error:**

<a href="#err3">Here (#3)</a> is a possible error when running the server and how to fix it.

To make sure everything works normally, do a `GET` request to this endpoint `/api/dev` (full URL endpoint: `localhost:5000/api/dev`) - it should return JSON object `{"msg": "Hello World!"}` with the http status of `200`.

## <span id="authMethod">Authentication</span>

User signs up by hitting the `/api/auth/sign-up` endpoint. User is automatically authenticated (signed in) after this - OR - User signs in by hitting the `/api/auth/sign-in` endpoint. This returns (jwt) `token` and `user_uid`. Store these two in `localStorage` (web app) or (maybe) `Core Data` (in iOS).

The reason for saving `user_uid` is because it is used on very few endpoints that does not require a fresh (not-expired) `token`. Read more on <a href="#authFlow">authentication flow</a>.

Following the best practices of JWT authentication method, the access token (what is saved locally in the frontend) has a short expiration time (15 minutes).

For testing/development purposes you may modify this expiration time to a different value - for seconds just put integer. E.g: 30 (this is 30 seconds).

To modify it, please modify the `expiresIn` property in `./routes/utilsgenerateAccessToken.js` file.

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

1. `/` - `GET` | **PUBLIC**  
   If everything works normally, it should return A JSON object of `{"msg": "Hello World!"}` with the http status of `200`.

### /api/auth

1. `/sign-up` - `POST` | **PUBLIC** | **USER SIGN UP**

   **Send from your application (`Content-Type`: `application/JSON`):** `{email: "email@mail.com", password: "password"}`.

   <span id="signUpDV">**Data validation:**</span>

   1. `email` must be of correct format -> Error message: `email_fail`
   2. `password` must be at least 6 characters long -> Error message: `password_fail`

   **Upon successful request:** returns `{"msg": "user registered", token: "randomJWTtoken", user_uid: "some user_uid"}` with the http status of `200`.

   **Note:** Upon successful request - a new user profile is automatically created in the `user_profile` table with all columns empty (empty string - not null) except for `user_uid` column.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. `{"msg": "email_unavailable"}` - if email entered already exist in the db
   3. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#signUpDV">above</a> in the **Data Validation** sub-section..

      The number of `errorObject` depends on how many data validation is present & how many is violated.

2. `/sign-in` - `POST` | **PUBLIC** | **USER SIGN IN**

   **Send from your application (`Content-Type`: `application/JSON`):** `{email: "email@mail.com", password: "password"}`

   <span id="signInDV">**Data validation:**</span>

   1. `email` must be of correct format -> Error message: `email_fail`

   **Upon successful request:** returns `{"msg": "user logged in", token: "randomJWTtoken", user_uid: "some user_uid"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. `{"msg": "invalid_credentials"}` - when credentials does not exist in the db
   3. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#signInDV">above</a> in the **Data Validation** sub-section..

      The number of `errorObject` depends on how many data validation is present & how many is violated.

3. `/new-access-token` - `POST` | **PRIVATE** | **GETTING NEW ACCESS TOKEN**

   **Send from your application (`Content-Type`: `application/JSON`):** `{user_uid: "some user_uid"}`

   <span id="newAccTDV">**Data validation:**</span>

   1. `user_uid` must not empty -> Error message: `user_uid_fail`

   **Upon successful request:** returns `{"msg": "signed_out"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{"msg": "invalid_credentials"}` - when `user_uid` does not exist in the db
   4. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#newAccTDV">above</a> in the **Data Validation** sub-section..

      The number of `errorObject` depends on how many data validation is present & how many is violated.

4. `/sign-out` - `POST` | **PRIVATE** | **USER SIGN OUT**

   **Send from your application (`Content-Type`: `application/JSON`):** `{user_uid: "some user_uid"}`

   <span id="signOutDV">**Data validation:**</span>

   1. `user_uid` must not be empty -> Error message: `user_uid_fail`

   **Upon successful request:** returns `{"msg": "signed_out"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{"msg": "invalid_credentials"}` - when `user_uid` does not exist in the db
   4. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#signOutDV">above</a> in the **Data Validation** sub-section..

      The number of `errorObject` depends on how many data validation is present & how many is violated.

### /api/user

1. `/` - `GET` | **PRIVATE** | **GET CURRENT USER DETAIL**

   **Send from your application :** none

   **Upon successful request:** returns `{user: userObject, "msg": "success"}` with the http status of `200`.

   `userObject` is defined <a href="#userObjRes">here</a>

   **Upon failed request:**

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>

2. `/` - `PUT` | **PRIVATE** | **EDIT CURRENT USER DETAIL**

   **Send from your application (`Content-Type`: `application/JSON`):** `{"first_name": "firstName", "last_name": "lastName"}`.

   **Very important:** For all `PUT` endpoints, please enter the data that you want to be updated and saved to the DB along with other required data. Read <a href="#putExplanation">here</a> (#1 General Knowledge Board) for further explanation.

   <span id="updateUserProfileDV">**Data validation:**</span>

   1. `first_name` must exists -> Error message: `first_name_fail`
   2. `last_name` must exists -> Error message: `last_name_fail`

   **Upon successful request:** returns `{ "msg": "profile_detail_updated"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#updateUserProfileDV">above</a> in the **Data Validation** sub-section..

      The number of `errorObject` depends on how many data validation is present & how many is violated.

3. `/profile-picture` - `PUT` | **PRIVATE** | **UPLOAD/UPDATE CURRENT USER'S PROFILE PICTURE**

   **Send from your application (`Content-Type`: `multipart/form-data`):** with a key called `file` and a value of a **single image of type `jpg` / `.jpeg` or `.png`**

   **Upon successful request:** returns `{"msg": "profile_pic_updated","filePath": "localhost:7500/user_uploads/public/images/profile_pictures/some_user_uid/image.jpg"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{"msg": "file_error"}` - when `file` not found / `file` isn't properly formatted.

4. `/profile-picture` - `DELETE` | **PRIVATE** | **DELETE CURRENT USER'S PROFILE PICTURE**

   **Send from your application :** none

   **Upon successful request:** returns `{"msg": "profile_pic_removed"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4) </a>
   2. <a href="#errors">Token Error (#2)</a>

### /api/companies

1. `/` - `GET` | **PRIVATE** | **GET ALL COMPANIES**

   **Send from your application :** none

   **Upon successful request:** returns `{companies: [companyObject0,companyObject1], "msg": "success"}` with the http status of `200`.

   `companyObject1` (as **`result`**) is defined <a href="#companyObjRes">here</a>

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>

### /api/company

1. `/` - `GET` | **PRIVATE** | **GET A SINGLE COMPANY**

   **Send from your application :** `{"company_uid": "someCompanyId"}`.

   <span id="getCompanyDV">**Data validation:**</span>

   1. `company_uid` must exists -> On error: `{"msg": "company_uid_fail"}`

   **Upon successful request:** returns `{company: companyObject, "msg": "success"}` with the http status of `200`.

   `companyObject` is defined <a href="#companyObjRes">here</a>

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{ msg: "company_not_found" }` - when `company_uid` does not exist in the db.
   4. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#getCompanyDV">above</a> in the **Data Validation** sub-section.

      The number of `errorObject` depends on how many data validation is present & how many is violated.

2. `/` - `POST` | **PRIVATE** | **CREATE A SINGLE COMPANY**

   **Send from your application (`Content-Type`: `application/JSON`):**

   ```json
   {
     "company_name": "someCompanyName",
     "company_email": "mail@example.com",
     "company_website": "https://somewebsite.de",
     "company_phone": "+490000"
   }
   ```

   **You may leave any of the field as an empty string if you wish to not have anything for that field.**

   For example, company does not have a website, leave it empty like: `{"company_website": ""}`

   <span id="updateUserProfileDV">**Data validation:**</span>

   1. `company_name` must exists -> Error message: `company_name_fail`
   2. `company_email` must exists -> Error message: `company_email_fail`
   3. `company_website` must exists -> Error message: `company_website_fail`
   4. `company_phone` must exists -> Error message: `company_phone_fail`

   **Upon successful request:** returns `{ "msg": "company_created", company_uid: "someCompanyId"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#getCompanyDV">above</a> in the **Data Validation** sub-section.

   The number of `errorObject` depends on how many data validation is present & how many is violated.

3. `/` - `PUT` | **PRIVATE** | **EDIT A SINGLE COMPANY**

   **Send from your application (`Content-Type`: `application/JSON`):**

   ```json
   {
     "company_uid": "someCompanyId",
     "company_name": "someCompanyName",
     "company_email": "mail@example.com",
     "company_website": "https://somewebsite.de",
     "company_phone": "+490000"
   }
   ```

   **Very important:** For all `PUT` endpoints, please enter the data that you want to be updated and saved to the DB along with other required data. Read <a href="#putExplanation">here</a> (#1 General Knowledge Board) for further explanation.

   <span id="updateUserProfileDV">**Data validation:**</span>

   1. `company_uid` must exists -> Error message: `company_name_fail`
   2. `company_name` must exists -> Error message: `company_name_fail`
   3. `company_email` must exists -> Error message: `company_email_fail`
   4. `company_website` must exists -> Error message: `company_website_fail`
   5. `company_phone` must exists -> Error message: `company_phone_fail`

   **Upon successful request:** returns `{ "msg": "company_created", company_uid: "someCompanyId"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{ msg: "company_not_found" }` - when `company_uid` does not exist in the db.
   4. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#getCompanyDV">above</a> in the **Data Validation** sub-section.

      The number of `errorObject` depends on how many data validation is present & how many is violated.

4. `/image/someCompanyID` - `PUT` | **PRIVATE** | **UPDATE / ADD IMAGE OF A COMPANY**

   Related:

   1. <a href="#whyViaURL">**Why do some endpoints require passing id via URL and not JSON?**</a>
   2. <a href="#whyUpdateTwoEndpoints">**Why are some endpoints, such as this one separated from the 'main' edit/update endpoint?**</a>

   **Send from your application (`Content-Type`: `multipart/form-data`):** with a key called `file` and a value of a **single image of type `jpg` / `.jpeg` or `.png`**

   **Upon successful request:** returns `{"msg": "picture_updated","filePath": "localhost:7500/user_uploads/public/images/company_image/someCompanyId/image.jpg"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{"msg": "file_error"}` - when `file` not found / `file` isn't properly formatted.
   4. `{"msg": "company_not_found"}` - when `company_uid` does not exist in the db.

5. `/image` - `DELETE` | **PRIVATE** | **DELETE AN IMAGE OF A COMPANY**

   **Send from your application :** `{"company_uid": "someCompanyId"}`

   <span id="companyImageDeleteDV">**Data validation:**</span>

   1. `company_uid` must exists -> Error message: `company_uid_fail`

   **Upon successful request:** returns `{"msg": "picture_removed"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{"msg": "company_not_found"}` - when `company_uid` does not exist in the db.
   4. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#companyImageDeleteDV">above</a> in the **Data Validation** sub-section.

6. `/` - `DELETE` | **PRIVATE** | **DELETE A COMPANY**

   **Send from your application :** `{"company_uid": "someCompanyId"}`

   <span id="companyDeleteDV">**Data validation:**</span>

   1. `company_uid` must exists -> Error message: `company_uid_fail`

   **Upon successful request:** returns `{"msg": "company_deleted"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{"msg": "company_not_found"}` - when `company_uid` does not exist in the db.
   4. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#companyDeleteDV">above</a> in the **Data Validation** sub-section.

### /api/contacts

1. `/` - `GET` | **PRIVATE** | **GET ALL CONTACTS**

   **Send from your application :** none

   **Upon successful request:** returns `{contacts: [contactObject0,contactObject1], "msg": "success"}` with the http status of `200`.

   `contactObject` (as **`result`**) is defined <a href="#contactObjRes">here</a>

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>

### /api/contact

1. `/` - `GET` | **PRIVATE** | **GET A SINGLE CONTACT**

   **Send from your application :** `{"contact_uid": "someContactUid"}`.

   <span id="getContactDV">**Data validation:**</span>

   1. `contact_uid` must exists -> On error: `{"msg": "contact_uid_fail"}`

   **Upon successful request:** returns `{company: contactObject, "msg": "success"}` with the http status of `200`.

   `contactObject` is defined <a href="#contactObjRes">here</a>

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{"msg": "contact_not_found"}` - when `contact_uid` does not exist in the db.
   4. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#getContactDV">above</a> in the **Data Validation** sub-section.

      The number of `errorObject` depends on how many data validation is present & how many is violated.

2. `/` - `POST` | **PRIVATE** | **CREATE A SINGLE CONTACT**

   **Send from your application (`Content-Type`: `application/JSON`):**

   ```json
   {
     "first_name": "firstName",
     "last_name": "lastName",
     "phone": "+49000",
     "email": "mail@example.com",
     "dob": "01.01.1990",
     "note": "",
     "company_uids": [],
     "tags": []
   }
   ```

   **You may leave any of field empty if you wish to not have anything for that field**

   For example, contact does not belong to any company, leave it empty like: `{"company_uid": ""}`

   Tags can be added as array of strings as such: `["tag0", "tag1"]`

   <span id="createContactDV">**Data validation:**</span>

   1. `first_name` must exists -> Error message: `first_name_fail`
   2. `last_name` must exists -> Error message: `last_name_fail`
   3. `phone` must exists -> Error message: `phone_fail`
   4. `email` must exists -> Error message: `email_fail`
   5. `dob` must exists -> Error message: `dob_fail`
   6. `note` must exists -> Error message: `note_fail`
   7. `company_uids` must exists -> Error message: `company_uids_fail`
   8. `tags` must exists -> Error message: `tags_fail`

   **Upon successful request:** returns `{ "msg": "contact_created", contact_uid: "someC/imagontactId"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{msg: "tags_not_array"}` - when `tags` is not of type array
   4. `{msg: "company_uids_not_array"}` - when `company_uids` is not of type array
   5. `{msg: "company_not_found", company_uid: "someCompanyId"}` - when one of the `company_uid` does not exist in the db.
   6. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#createContactDV">above</a> in the **Data Validation** sub-section.

   The number of `errorObject` depends on how many data validation is present & how many is violated.

3. `/` - `PUT` | **PRIVATE** | **EDIT A SINGLE CONTACT**

   **Send from your application (`Content-Type`: `application/JSON`):**

   ```json
   {
     "first_name": "firstName",
     "last_name": "lastName",
     "phone": "+49000",
     "email": "mail@example.com",
     "dob": "01.01.1990",
     "note": "",
     "company_uids": [],
     "tags": []
   }
   ```

   **Very important:** For all `PUT` endpoints, please enter the data that you want to be updated and saved to the DB along with other required data. Read <a href="#putExplanation">here</a> (#1 General Knowledge Board) for further explanation.

   <span id="updateSingleContactDV">**Data validation:**</span>

   1. `first_name` must exists -> Error message: `first_name_fail`
   2. `last_name` must exists -> Error message: `last_name_fail`
   3. `phone` must exists -> Error message: `phone_fail`
   4. `email` must exists -> Error message: `email_fail`
   5. `dob` must exists -> Error message: `dob_fail`
   6. `note` must exists -> Error message: `note_fail`
   7. `company_uids` must exists -> Error message: `company_uids_fail`
   8. `tags` must exists -> Error message: `tags_fail`

   **Upon successful request:** returns `{ "msg": "contact_updated", contact_uid: "someContactId"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Error (#2)</a>
   3. `{msg: "tags_not_array"}` - when `tags` is not of type array
   4. `{msg: "company_uids_not_array"}` - when `company_uids` is not of type array
   5. `{msg: "company_not_found"}` - when `company_uid` does not exist in the db.
   6. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#updateSingleContactDV">above</a> in the **Data Validation** sub-section.

4. `/image/someContactID` - `PUT` | **PRIVATE** | **UPDATE / ADD IMAGE OF A CONTACT**

   Related:

   1. <a href="#whyViaURL">**Why do some endpoints require passing id via URL and not JSON?**</a>
   2. <a href="#whyUpdateTwoEndpoints">**Why are some endpoints, such as this one separated from the 'main' edit/update endpoint?**</a>

   **Send from your application (`Content-Type`: `multipart/form-data`):** with a key called `file` and a value of a **single image of type `jpg` / `.jpeg` or `.png`**

   **Upon successful request:** returns `{"msg": "picture_updated", "filePath": "localhost:7500/user_uploads/public/images/contact_image/someContactID/image.jpg"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{"msg": "file_error"}` - when `file` not found / `file` isn't properly formatted.
   4. `{"msg": "contact_not_found"}` - when `contact_uid` does not exist in the db.

5. `/image` - `DELETE` | **PRIVATE** | **DELETE AN IMAGE OF A CONTACT**

   **Send from your application :** `{"contact_uid": "someCompanyId"}`

   <span id="contactImageDeleteDV">**Data validation:**</span>

   1. `contact_uid` must exists -> Error message: `contact_uid_failed`

   **Upon successful request:** returns `{"msg": "picture_removed"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{"msg": "contact_not_found"}` - when `contact_uid` does not exist in the db.
   4. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#contactImageDeleteDV">above</a> in the **Data Validation** sub-section.

6. `/` - `DELETE` | **PRIVATE** | **DELETE A COMPANY**

   **Send from your application :** `{"contact_uid": "someContactUID"}`

   <span id="contactDeleteDV">**Data validation:**</span>

   1. `contact_uid` must exists -> Error message: `contact_uid_failed`

   **Upon successful request:** returns `{"msg": "contact_deleted"}` with the http status of `200`.

   **Upon failed request:** returns one of the these with http status of `400`:

   1. <a href="#err4">Query Error (#4)</a>
   2. <a href="#errors">Token Error (#2)</a>
   3. `{"msg": "contact_not_found"}` - when `contact_uid` does not exist in the db.
   4. (if data validation is violated) Object containing array of error object(s) `{errors: [errorObject0, errorObject1]}` where `errorObject` has a property of `msg` defined <a href="#contactDeleteDV">above</a> in the **Data Validation** sub-section.

### /api/admin

1. `/all-users` - `GET` **PUBLIC** | DEPRECATED - PLEASE DON'T USE THIS ENDPOINT (Will change in the future - not usable / important for now)

   **Upon successful request:** returns an **array** of (JSON) user objects `[userObject0, userObject1]` with the http status of `200`.

   `userObject` is defined as `{id: someid, user_uid: "some user_uid", email: "mail@ex.com" }`

   **Upon failed request:** Returns an error object (JSON).

## Results

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
     "id": someId,
     "user_uid": "someUserId",
     "company_uid": "someCompanyId",
     "company_name": "someCompanyName",
     "company_email": "mail@example.com",
     "company_website": "https://somewebsite.de",
     "picture": "pathToPicture/img.jpg",
     "company_phone": "+490000",
     "people": ["contactUid0", "contactUid1"]
   }
   ```

   Any of these might be an empty string except: `id`, `user_uid`, `company_uid`.

3. <span id="contactObjRes">`contactObject`:</span>

   ```json
   {
     "id": someId,
     "user_uid": "someUserId",
     "contact_uid": "someContactId",
     "first_name": "firstName",
     "last_name": "lastName",
     "phone": "+490000",
     "email": "mail@example.com",
     "dob": "01.01.1990",
     "note": "someNote",
     "picture": "pathToPicture/img.jpg",
     "tags": ["tag0", "tag1"],
     "companies": ["companyUid0", "companyUid1"]
   }
   ```

   Any of these might be an empty string except: `id`, `user_uid`, `contact_uid`.

## <span id="putExplanation">General Knwoledge Board</span>

1.  For ALL `PUT` endpoints</span> please enter the data that you want to be updated and saved to the DB along with other required data.

    **For example**, for `/api/user/`, if you want `lastName` to be renamed to `newLastName`, then send the full request (with all **required** and unchanged fields), such as (here `first_name` is unchanged): `{"first_name": "firstName", "last_name": "newLastName"}`.

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

## Errors

1. All non-invalid request errors (any error coming from the backend itself) such as: server error, query error, etc will result in http status of `500` with the msg of `Server Error`.

2. Upon failed request other than `Server Error`, ALL **PRIVATE** routes will return a JSON object `{"msg": "token_invalid"}` (fake/wrong token) or `{"msg": "token_expired"}` (expired token) or `{"msg": "unauthorised"}` (no token sent) with the http status of `401`.

3. <span id="err3">Error:</span> **`listen EADDRINUSE: address already in use 0.0.0.0:7500<`**

   This means that the port 7500 is being used. Please close any program that uses that port.</span>

   If no program is using it but error still persists, then please kill that port explicitly:

   `sudo lsof -i :7500` - then get the PID  
   `sudo kill -9 <PID>` - without the `<>`

4. <span id="err4">Error: Returns</span> an error object (JSON) - this error comes from failed DB query(ies) (very unlikely).
