PGDMP                         x            chimp_db    12.3    12.2 >    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16390    chimp_db    DATABASE     z   CREATE DATABASE chimp_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8';
    DROP DATABASE chimp_db;
                postgres    false            �            1259    16782 	   companies    TABLE     �  CREATE TABLE public.companies (
    id integer NOT NULL,
    user_uid character varying(256) NOT NULL,
    company_uid character varying(256) NOT NULL,
    company_name character varying(256) NOT NULL,
    company_email character varying(256) NOT NULL,
    company_website character varying(256) NOT NULL,
    picture character varying(256) NOT NULL,
    company_phone character varying(256) NOT NULL
);
    DROP TABLE public.companies;
       public         heap    sean    false            �            1259    16780    companies_id_seq    SEQUENCE     �   CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.companies_id_seq;
       public          sean    false    213            �           0    0    companies_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;
          public          sean    false    212            �            1259    16897    company_contact    TABLE     �   CREATE TABLE public.company_contact (
    id integer NOT NULL,
    contact_uid character varying(256) NOT NULL,
    company_uid character varying(256) NOT NULL
);
 #   DROP TABLE public.company_contact;
       public         heap    sean    false            �            1259    16895    company_contact_id_seq    SEQUENCE     �   CREATE SEQUENCE public.company_contact_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.company_contact_id_seq;
       public          sean    false    215            �           0    0    company_contact_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.company_contact_id_seq OWNED BY public.company_contact.id;
          public          sean    false    214            �            1259    16663    contacts    TABLE     �  CREATE TABLE public.contacts (
    id integer NOT NULL,
    user_uid character varying(256) NOT NULL,
    contact_uid character varying(256) NOT NULL,
    first_name character varying(256) NOT NULL,
    last_name character varying(256) NOT NULL,
    phone character varying(256) NOT NULL,
    email character varying(256) NOT NULL,
    dob date NOT NULL,
    note character varying(256) NOT NULL,
    picture character varying(256) NOT NULL
);
    DROP TABLE public.contacts;
       public         heap    sean    false            �            1259    16661    contacts_id_seq    SEQUENCE     �   CREATE SEQUENCE public.contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.contacts_id_seq;
       public          sean    false    209            �           0    0    contacts_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.contacts_id_seq OWNED BY public.contacts.id;
          public          sean    false    208            �            1259    16582    tokens    TABLE     �   CREATE TABLE public.tokens (
    id integer NOT NULL,
    user_uid character varying(256) NOT NULL,
    refresh_token character varying(256) NOT NULL,
    access_token character varying(256) NOT NULL
);
    DROP TABLE public.tokens;
       public         heap    sean    false            �            1259    16580    refresh_tokens_id_seq    SEQUENCE     �   CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.refresh_tokens_id_seq;
       public          sean    false    207            �           0    0    refresh_tokens_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.tokens.id;
          public          sean    false    206            �            1259    16749    tag_contact    TABLE     �   CREATE TABLE public.tag_contact (
    id integer NOT NULL,
    user_uid character varying(256) NOT NULL,
    contact_uid character varying(256) NOT NULL,
    tag character varying(256) NOT NULL
);
    DROP TABLE public.tag_contact;
       public         heap    sean    false            �            1259    16747    tag_contact_id_seq    SEQUENCE     �   CREATE SEQUENCE public.tag_contact_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.tag_contact_id_seq;
       public          sean    false    211            �           0    0    tag_contact_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.tag_contact_id_seq OWNED BY public.tag_contact.id;
          public          sean    false    210            �            1259    16452    user_profile    TABLE     �   CREATE TABLE public.user_profile (
    id integer NOT NULL,
    user_uid character varying(256) NOT NULL,
    first_name character varying(256) NOT NULL,
    last_name character varying(256) NOT NULL,
    picture character varying NOT NULL
);
     DROP TABLE public.user_profile;
       public         heap    sean    false            �            1259    16393    users    TABLE     �   CREATE TABLE public.users (
    id integer NOT NULL,
    user_uid character varying(256) NOT NULL,
    email character varying(256) NOT NULL,
    password character varying(256) NOT NULL
);
    DROP TABLE public.users;
       public         heap    postgres    false            �            1259    16391    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          postgres    false    203            �           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public          postgres    false    202            �            1259    16450    users_profile_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_profile_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.users_profile_id_seq;
       public          sean    false    205            �           0    0    users_profile_id_seq    SEQUENCE OWNED BY     L   ALTER SEQUENCE public.users_profile_id_seq OWNED BY public.user_profile.id;
          public          sean    false    204            #           2604    16785    companies id    DEFAULT     l   ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);
 ;   ALTER TABLE public.companies ALTER COLUMN id DROP DEFAULT;
       public          sean    false    213    212    213            $           2604    16900    company_contact id    DEFAULT     x   ALTER TABLE ONLY public.company_contact ALTER COLUMN id SET DEFAULT nextval('public.company_contact_id_seq'::regclass);
 A   ALTER TABLE public.company_contact ALTER COLUMN id DROP DEFAULT;
       public          sean    false    215    214    215            !           2604    16666    contacts id    DEFAULT     j   ALTER TABLE ONLY public.contacts ALTER COLUMN id SET DEFAULT nextval('public.contacts_id_seq'::regclass);
 :   ALTER TABLE public.contacts ALTER COLUMN id DROP DEFAULT;
       public          sean    false    209    208    209            "           2604    16752    tag_contact id    DEFAULT     p   ALTER TABLE ONLY public.tag_contact ALTER COLUMN id SET DEFAULT nextval('public.tag_contact_id_seq'::regclass);
 =   ALTER TABLE public.tag_contact ALTER COLUMN id DROP DEFAULT;
       public          sean    false    211    210    211                        2604    16585 	   tokens id    DEFAULT     n   ALTER TABLE ONLY public.tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);
 8   ALTER TABLE public.tokens ALTER COLUMN id DROP DEFAULT;
       public          sean    false    207    206    207                       2604    16455    user_profile id    DEFAULT     s   ALTER TABLE ONLY public.user_profile ALTER COLUMN id SET DEFAULT nextval('public.users_profile_id_seq'::regclass);
 >   ALTER TABLE public.user_profile ALTER COLUMN id DROP DEFAULT;
       public          sean    false    205    204    205                       2604    16396    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    202    203    203            �          0    16782 	   companies 
   TABLE DATA           �   COPY public.companies (id, user_uid, company_uid, company_name, company_email, company_website, picture, company_phone) FROM stdin;
    public          sean    false    213   �G       �          0    16897    company_contact 
   TABLE DATA           G   COPY public.company_contact (id, contact_uid, company_uid) FROM stdin;
    public          sean    false    215   �G       �          0    16663    contacts 
   TABLE DATA           v   COPY public.contacts (id, user_uid, contact_uid, first_name, last_name, phone, email, dob, note, picture) FROM stdin;
    public          sean    false    209   �G       �          0    16749    tag_contact 
   TABLE DATA           E   COPY public.tag_contact (id, user_uid, contact_uid, tag) FROM stdin;
    public          sean    false    211   H       �          0    16582    tokens 
   TABLE DATA           K   COPY public.tokens (id, user_uid, refresh_token, access_token) FROM stdin;
    public          sean    false    207   7H       �          0    16452    user_profile 
   TABLE DATA           T   COPY public.user_profile (id, user_uid, first_name, last_name, picture) FROM stdin;
    public          sean    false    205   TH       �          0    16393    users 
   TABLE DATA           >   COPY public.users (id, user_uid, email, password) FROM stdin;
    public          postgres    false    203   qH       �           0    0    companies_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.companies_id_seq', 1, false);
          public          sean    false    212            �           0    0    company_contact_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.company_contact_id_seq', 1, false);
          public          sean    false    214            �           0    0    contacts_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.contacts_id_seq', 1, false);
          public          sean    false    208            �           0    0    refresh_tokens_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 1, false);
          public          sean    false    206            �           0    0    tag_contact_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.tag_contact_id_seq', 1, false);
          public          sean    false    210            �           0    0    users_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.users_id_seq', 1, false);
          public          postgres    false    202            �           0    0    users_profile_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.users_profile_id_seq', 1, false);
          public          sean    false    204            5           2606    16790    companies companies_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.companies DROP CONSTRAINT companies_pkey;
       public            sean    false    213            7           2606    16905 $   company_contact company_contact_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.company_contact
    ADD CONSTRAINT company_contact_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.company_contact DROP CONSTRAINT company_contact_pkey;
       public            sean    false    215            .           2606    16774 !   contacts contacts_contact_uid_key 
   CONSTRAINT     c   ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_contact_uid_key UNIQUE (contact_uid);
 K   ALTER TABLE ONLY public.contacts DROP CONSTRAINT contacts_contact_uid_key;
       public            sean    false    209            0           2606    16671    contacts contacts_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.contacts DROP CONSTRAINT contacts_pkey;
       public            sean    false    209            ,           2606    16590    tokens refresh_tokens_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.tokens DROP CONSTRAINT refresh_tokens_pkey;
       public            sean    false    207            3           2606    16757    tag_contact tag_contact_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.tag_contact
    ADD CONSTRAINT tag_contact_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.tag_contact DROP CONSTRAINT tag_contact_pkey;
       public            sean    false    211            &           2606    16462    users user_uid 
   CONSTRAINT     M   ALTER TABLE ONLY public.users
    ADD CONSTRAINT user_uid UNIQUE (user_uid);
 8   ALTER TABLE ONLY public.users DROP CONSTRAINT user_uid;
       public            postgres    false    203            (           2606    16401    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    203            *           2606    16460    user_profile users_profile_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT users_profile_pkey PRIMARY KEY (id);
 I   ALTER TABLE ONLY public.user_profile DROP CONSTRAINT users_profile_pkey;
       public            sean    false    205            1           1259    16709    fki_user_uid_fkey    INDEX     J   CREATE INDEX fki_user_uid_fkey ON public.contacts USING btree (user_uid);
 %   DROP INDEX public.fki_user_uid_fkey;
       public            sean    false    209            =           2606    16791 !   companies companies_user_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_user_uid_fkey FOREIGN KEY (user_uid) REFERENCES public.users(user_uid);
 K   ALTER TABLE ONLY public.companies DROP CONSTRAINT companies_user_uid_fkey;
       public          sean    false    213    3110    203            :           2606    16715    contacts contacts_user_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_user_uid_fkey FOREIGN KEY (user_uid) REFERENCES public.users(user_uid);
 I   ALTER TABLE ONLY public.contacts DROP CONSTRAINT contacts_user_uid_fkey;
       public          sean    false    203    3110    209            <           2606    16775 (   tag_contact tag_contact_contact_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.tag_contact
    ADD CONSTRAINT tag_contact_contact_uid_fkey FOREIGN KEY (contact_uid) REFERENCES public.contacts(contact_uid);
 R   ALTER TABLE ONLY public.tag_contact DROP CONSTRAINT tag_contact_contact_uid_fkey;
       public          sean    false    211    209    3118            ;           2606    16768 %   tag_contact tag_contact_user_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.tag_contact
    ADD CONSTRAINT tag_contact_user_uid_fkey FOREIGN KEY (user_uid) REFERENCES public.users(user_uid);
 O   ALTER TABLE ONLY public.tag_contact DROP CONSTRAINT tag_contact_user_uid_fkey;
       public          sean    false    211    203    3110            9           2606    16720    tokens tokens_user_uid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_user_uid_fkey FOREIGN KEY (user_uid) REFERENCES public.users(user_uid);
 E   ALTER TABLE ONLY public.tokens DROP CONSTRAINT tokens_user_uid_fkey;
       public          sean    false    207    203    3110            8           2606    16463    user_profile user_uid    FK CONSTRAINT     {   ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_uid FOREIGN KEY (user_uid) REFERENCES public.users(user_uid);
 ?   ALTER TABLE ONLY public.user_profile DROP CONSTRAINT user_uid;
       public          sean    false    3110    203    205            �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �     