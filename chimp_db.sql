PGDMP                         x            chimp_db    12.3    12.2     y           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            z           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            {           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            |           1262    16390    chimp_db    DATABASE     z   CREATE DATABASE chimp_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8';
    DROP DATABASE chimp_db;
                postgres    false            �            1259    16393    users    TABLE     �   CREATE TABLE public.users (
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
       public          postgres    false    203            }           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public          postgres    false    202            �           2604    16396    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    202    203    203            v          0    16393    users 
   TABLE DATA           >   COPY public.users (id, user_uid, email, password) FROM stdin;
    public          postgres    false    203   �
       ~           0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 6, true);
          public          postgres    false    202            �           2606    16401    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    203            v   �   x���
�0 ����Nܚs��D��]~�F���`o��i���i.�\I�R{���s)��
�:���!��0���b L)�n{c�
��+��b?QA��~�X�{�ѥu�}Y�c|�罹��3����(     