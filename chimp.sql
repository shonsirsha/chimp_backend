CREATE SCHEMA IF NOT EXISTS public
AUTHORIZATION postgres;
SET SEARCH_PATH TO public;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL NOT NULL,
    user_uid VARCHAR (256) NOT NULL,
    email VARCHAR (256) NOT NULL,
    password VARCHAR(256) NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT user_user_uid_unique UNIQUE (user_uid)
);

CREATE TABLE IF NOT EXISTS user_profile (
    id SERIAL NOT NULL,
    user_uid VARCHAR (256) UNIQUE NOT NULL,
    first_name VARCHAR (256) NOT NULL,
    last_name VARCHAR(256) NOT NULL,
    picture VARCHAR(256) NOT NULL,
    CONSTRAINT user_profile_pkey PRIMARY KEY (id),
    CONSTRAINT user_profile_user_uid_fkey FOREIGN KEY (user_uid) REFERENCES users(user_uid),
    CONSTRAINT user_profile_user_uid_unique UNIQUE (user_uid)
);

CREATE TABLE IF NOT EXISTS tokens (
    id SERIAL NOT NULL,
    user_uid VARCHAR (256) NOT NULL,
    access_token VARCHAR(256) NOT NULL,
    refresh_token VARCHAR (256) NOT NULL,
    CONSTRAINT tokens_pkey PRIMARY KEY (id),
    CONSTRAINT tokens_user_uid_fkey FOREIGN KEY (user_uid) REFERENCES users(user_uid),
    CONSTRAINT tokens_access_token_unique UNIQUE (access_token),
    CONSTRAINT tokens_refresh_token_unique UNIQUE (refresh_token)
);

CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL NOT NULL,
    user_uid VARCHAR (256) NOT NULL,
    contact_uid VARCHAR(256) NOT NULL,
    first_name VARCHAR (256) NOT NULL,
    last_name VARCHAR (256) NOT NULL,
    phone VARCHAR (256) NOT NULL,
    email VARCHAR (256) NOT NULL,
    note VARCHAR (256) NOT NULL,
    picture VARCHAR (256) NOT NULL,
    dob bigint,
    created_at bigint,
    CONSTRAINT contacts_pkey PRIMARY KEY (id),
    CONSTRAINT contacts_user_uid_fkey FOREIGN KEY (user_uid) REFERENCES users (user_uid), 
    CONSTRAINT contacts_contact_uid_unique UNIQUE (contact_uid)
);

CREATE TABLE IF NOT EXISTS companies (
    id SERIAL NOT NULL,
    user_uid VARCHAR (256) NOT NULL,
    company_uid VARCHAR(256) NOT NULL,
    company_name VARCHAR (256) NOT NULL,
    company_email VARCHAR (256) NOT NULL,
    company_website VARCHAR (256) NOT NULL,
    picture VARCHAR (256) NOT NULL,
    company_phone VARCHAR (256) NOT NULL,
    created_at bigint,
    CONSTRAINT companies_pkey PRIMARY KEY (id),
    CONSTRAINT companies_user_uid_fkey FOREIGN KEY (user_uid) REFERENCES users (user_uid),
    CONSTRAINT companies_company_uid_unique UNIQUE (company_uid)
);

CREATE TABLE IF NOT EXISTS tags (
    id SERIAL NOT NULL,
    tag_uid VARCHAR(256) NOT NULL,
    tag_name VARCHAR(256) NOT NULL,
    tag_name_lc VARCHAR (256) NOT NULL,
    user_uid VARCHAR (256) NOT NULL,
    created_at bigint,
    CONSTRAINT tags_pkey PRIMARY KEY (id),
    CONSTRAINT tags_tag_uid_unique UNIQUE (tag_uid),
    CONSTRAINT tags_tag_name_unique UNIQUE (tag_name),
    CONSTRAINT tags_user_uid_fkey FOREIGN KEY (user_uid) REFERENCES users(user_uid)
);

CREATE TABLE IF NOT EXISTS tag_contact (
    id SERIAL NOT NULL,
    user_uid VARCHAR (256) NOT NULL,
    contact_uid VARCHAR(256) NOT NULL,
    tag VARCHAR (256) NOT NULL,
    CONSTRAINT tag_contact_pkey PRIMARY KEY (id),
    CONSTRAINT tag_contact_user_uid_fkey FOREIGN KEY (user_uid) REFERENCES users (user_uid)
);

CREATE TABLE IF NOT EXISTS tag_contact_x (
    id SERIAL NOT NULL,
    user_uid VARCHAR (256) NOT NULL,
    contact_uid VARCHAR(256) NOT NULL,
    tag_uid VARCHAR (256) NOT NULL,
    CONSTRAINT tag_contact_x_pkey PRIMARY KEY (id),
    CONSTRAINT tag_contact_x_user_uid_fkey FOREIGN KEY (user_uid) REFERENCES users (user_uid),
    CONSTRAINT tag_contact_x_contact_uid_fkey FOREIGN KEY (contact_uid) REFERENCES contacts (contact_uid),
    CONSTRAINT tag_contact_x_tag_uid_fkey FOREIGN KEY (tag_uid) REFERENCES tags (tag_uid)
);

CREATE TABLE IF NOT EXISTS company_contact (
    id SERIAL NOT NULL,
    contact_uid VARCHAR (256) NOT NULL,
    company_uid VARCHAR(256) NOT NULL,
    CONSTRAINT company_contact_pkey PRIMARY KEY (id),
    CONSTRAINT company_contact_contact_uid_fkey FOREIGN KEY (contact_uid) REFERENCES contacts(contact_uid),
    CONSTRAINT company_contact_company_uid_fkey FOREIGN KEY (company_uid) REFERENCES companies(company_uid)
);


--Indexes for table `users`
CREATE INDEX users_user_uid_idx ON users(user_uid);

--Indexes for table `user_profile`
CREATE INDEX user_profile_user_uid_idx ON user_profile(user_uid);

--Indexes for table `tokens`
CREATE INDEX tokens_user_uid_access_token_idx ON tokens(user_uid,access_token);

--Indexes for table `contacts`
CREATE INDEX contacts_user_uid_idx ON contacts(user_uid);

--Indexes for table `tag-contact`
CREATE INDEX tag_contact_contact_uid_idx ON tag_contact(contact_uid);

--Indexes for table `companies`
CREATE INDEX companies_company_uid_idx ON companies(company_uid);
CREATE INDEX companies_user_uid_idx  ON companies(user_uid);

--Indexes for table `company_contact`
CREATE INDEX company_contact_contact_uid_idx ON company_contact(contact_uid);
CREATE INDEX company_contact_company_uid_idx ON company_contact(company_uid);
