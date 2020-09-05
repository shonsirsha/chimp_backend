PGDMP     (    $                x            chimp_db    12.3    12.2     �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16390    chimp_db    DATABASE     z   CREATE DATABASE chimp_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8';
    DROP DATABASE chimp_db;
                postgres    false            �            1259    16582    tokens    TABLE     �   CREATE TABLE public.tokens (
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
          public          sean    false    206            �            1259    16452    user_profile    TABLE     �   CREATE TABLE public.user_profile (
    id integer NOT NULL,
    user_uid character varying(256) NOT NULL,
    first_name character varying(256) NOT NULL,
    last_name character varying(256) NOT NULL,
    profile_pic_name character varying NOT NULL
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
          public          sean    false    204                       2604    16585 	   tokens id    DEFAULT     n   ALTER TABLE ONLY public.tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);
 8   ALTER TABLE public.tokens ALTER COLUMN id DROP DEFAULT;
       public          sean    false    206    207    207                       2604    16455    user_profile id    DEFAULT     s   ALTER TABLE ONLY public.user_profile ALTER COLUMN id SET DEFAULT nextval('public.users_profile_id_seq'::regclass);
 >   ALTER TABLE public.user_profile ALTER COLUMN id DROP DEFAULT;
       public          sean    false    204    205    205                       2604    16396    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    203    202    203            �          0    16582    tokens 
   TABLE DATA           K   COPY public.tokens (id, user_uid, refresh_token, access_token) FROM stdin;
    public          sean    false    207   �       �          0    16452    user_profile 
   TABLE DATA           ]   COPY public.user_profile (id, user_uid, first_name, last_name, profile_pic_name) FROM stdin;
    public          sean    false    205   W       �          0    16393    users 
   TABLE DATA           >   COPY public.users (id, user_uid, email, password) FROM stdin;
    public          postgres    false    203   �       �           0    0    refresh_tokens_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 10, true);
          public          sean    false    206            �           0    0    users_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.users_id_seq', 30, true);
          public          postgres    false    202            �           0    0    users_profile_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.users_profile_id_seq', 20, true);
          public          sean    false    204                       2606    16590    tokens refresh_tokens_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.tokens DROP CONSTRAINT refresh_tokens_pkey;
       public            sean    false    207                       2606    16462    users user_uid 
   CONSTRAINT     M   ALTER TABLE ONLY public.users
    ADD CONSTRAINT user_uid UNIQUE (user_uid);
 8   ALTER TABLE ONLY public.users DROP CONSTRAINT user_uid;
       public            postgres    false    203                       2606    16401    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    203            
           2606    16460    user_profile users_profile_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT users_profile_pkey PRIMARY KEY (id);
 I   ALTER TABLE ONLY public.user_profile DROP CONSTRAINT users_profile_pkey;
       public            sean    false    205                       2606    16463    user_profile user_uid    FK CONSTRAINT     {   ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_uid FOREIGN KEY (user_uid) REFERENCES public.users(user_uid);
 ?   ALTER TABLE ONLY public.user_profile DROP CONSTRAINT user_uid;
       public          sean    false    205    203    3078            �   g  x���َ�0���]0,-˥�H[+f#�Rp���s;/�\�s���g~�0+RC2�=Pud�h"4U�Pu#U��G>�U:�X�|��H&��9���4�\�����X��xO�A��miToO`�|$t�� I	O�-e\'B�Nx�pM�:��r�qۏ�u)a��b5IWU�'y��K�mJ;��9r��}�Xb�O�h��\Fo��v���7eA��m�������ĕ�N��ڰ�ڽV���)[��N��խ�br�=Ă,�g>���pT^{�|3�c�g:�=W"�@�&*�Y��p�[�u�R�ۍ�G��Z���x�S�2;�e��1q\E��X2M��<��f�Z �{"�Y5      �   d   x��;�  ������67jC���O|��\ǾY6��dS*��m�j�+,�3�~|���1N��>�E�2�+c��֤��cA��,��;>S����k      �   �   x����   �3<�W�'��J,��A/�.@`�T��[O��Q<w�J,�a4G�	�$'��@si	��͛y�~��RN��J�2���$�I_����s�ú�m�Qj�ٺ~���q�rƾէo����[
!���$�     