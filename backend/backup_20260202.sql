--
-- PostgreSQL database dump
--

\restrict NKfVIvP9NNY5uUPFLBjVOwUjL6S91Vmitn26wEyAzAt6Jv4zuBxdmWw2Ko8mSYH

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: afriads_user
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO afriads_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ad_creatives; Type: TABLE; Schema: public; Owner: afriads_user
--

CREATE TABLE public.ad_creatives (
    id integer NOT NULL,
    campaign_id integer,
    name character varying(255) NOT NULL,
    ad_type character varying(20) NOT NULL,
    format character varying(50),
    title character varying(255),
    description text,
    image_url character varying(500),
    video_url character varying(500),
    destination_url character varying(500) NOT NULL,
    call_to_action character varying(50),
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ad_creatives_ad_type_check CHECK (((ad_type)::text = ANY ((ARRAY['display'::character varying, 'video'::character varying, 'native'::character varying, 'push'::character varying, 'interstitial'::character varying])::text[]))),
    CONSTRAINT ad_creatives_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'active'::character varying, 'paused'::character varying])::text[])))
);


ALTER TABLE public.ad_creatives OWNER TO afriads_user;

--
-- Name: ad_creatives_id_seq; Type: SEQUENCE; Schema: public; Owner: afriads_user
--

CREATE SEQUENCE public.ad_creatives_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ad_creatives_id_seq OWNER TO afriads_user;

--
-- Name: ad_creatives_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: afriads_user
--

ALTER SEQUENCE public.ad_creatives_id_seq OWNED BY public.ad_creatives.id;


--
-- Name: ad_zones; Type: TABLE; Schema: public; Owner: afriads_user
--

CREATE TABLE public.ad_zones (
    id integer NOT NULL,
    website_id integer,
    name character varying(255) NOT NULL,
    zone_type character varying(20) NOT NULL,
    dimensions character varying(50),
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ad_zones_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[]))),
    CONSTRAINT ad_zones_zone_type_check CHECK (((zone_type)::text = ANY ((ARRAY['display'::character varying, 'video'::character varying, 'native'::character varying, 'push'::character varying, 'interstitial'::character varying])::text[])))
);


ALTER TABLE public.ad_zones OWNER TO afriads_user;

--
-- Name: ad_zones_id_seq; Type: SEQUENCE; Schema: public; Owner: afriads_user
--

CREATE SEQUENCE public.ad_zones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ad_zones_id_seq OWNER TO afriads_user;

--
-- Name: ad_zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: afriads_user
--

ALTER SEQUENCE public.ad_zones_id_seq OWNED BY public.ad_zones.id;


--
-- Name: campaign_reports; Type: TABLE; Schema: public; Owner: afriads_user
--

CREATE TABLE public.campaign_reports (
    id integer NOT NULL,
    campaign_id integer,
    report_date date NOT NULL,
    impressions integer DEFAULT 0,
    clicks integer DEFAULT 0,
    conversions integer DEFAULT 0,
    spend numeric(10,2) DEFAULT 0.00,
    revenue numeric(10,2) DEFAULT 0.00,
    ctr numeric(5,4),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.campaign_reports OWNER TO afriads_user;

--
-- Name: campaign_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: afriads_user
--

CREATE SEQUENCE public.campaign_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaign_reports_id_seq OWNER TO afriads_user;

--
-- Name: campaign_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: afriads_user
--

ALTER SEQUENCE public.campaign_reports_id_seq OWNED BY public.campaign_reports.id;


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: afriads_user
--

CREATE TABLE public.campaigns (
    id integer NOT NULL,
    advertiser_id integer,
    name character varying(255) NOT NULL,
    daily_budget numeric(10,2),
    total_budget numeric(10,2),
    spent_amount numeric(10,2) DEFAULT 0.00,
    status character varying(20) DEFAULT 'draft'::character varying,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    bid_type character varying(20) DEFAULT 'cpm'::character varying,
    bid_amount numeric(10,4) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT campaigns_bid_type_check CHECK (((bid_type)::text = ANY ((ARRAY['cpm'::character varying, 'cpc'::character varying, 'cpa'::character varying])::text[]))),
    CONSTRAINT campaigns_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'active'::character varying, 'paused'::character varying, 'completed'::character varying, 'expired'::character varying])::text[])))
);


ALTER TABLE public.campaigns OWNER TO afriads_user;

--
-- Name: campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: afriads_user
--

CREATE SEQUENCE public.campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaigns_id_seq OWNER TO afriads_user;

--
-- Name: campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: afriads_user
--

ALTER SEQUENCE public.campaigns_id_seq OWNED BY public.campaigns.id;


--
-- Name: clicks; Type: TABLE; Schema: public; Owner: afriads_user
--

CREATE TABLE public.clicks (
    id bigint NOT NULL,
    impression_id bigint,
    ad_creative_id integer,
    campaign_id integer,
    website_id integer,
    ad_zone_id integer,
    ip_address character varying(45),
    user_agent text,
    country character varying(100),
    city character varying(100),
    device_type character varying(20),
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cost numeric(10,4)
);


ALTER TABLE public.clicks OWNER TO afriads_user;

--
-- Name: clicks_id_seq; Type: SEQUENCE; Schema: public; Owner: afriads_user
--

CREATE SEQUENCE public.clicks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clicks_id_seq OWNER TO afriads_user;

--
-- Name: clicks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: afriads_user
--

ALTER SEQUENCE public.clicks_id_seq OWNED BY public.clicks.id;


--
-- Name: conversions; Type: TABLE; Schema: public; Owner: afriads_user
--

CREATE TABLE public.conversions (
    id bigint NOT NULL,
    click_id bigint,
    campaign_id integer,
    conversion_type character varying(50),
    conversion_value numeric(10,2),
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.conversions OWNER TO afriads_user;

--
-- Name: conversions_id_seq; Type: SEQUENCE; Schema: public; Owner: afriads_user
--

CREATE SEQUENCE public.conversions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conversions_id_seq OWNER TO afriads_user;

--
-- Name: conversions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: afriads_user
--

ALTER SEQUENCE public.conversions_id_seq OWNED BY public.conversions.id;


--
-- Name: impressions; Type: TABLE; Schema: public; Owner: afriads_user
--

CREATE TABLE public.impressions (
    id bigint NOT NULL,
    ad_creative_id integer,
    campaign_id integer,
    website_id integer,
    ad_zone_id integer,
    ip_address character varying(45),
    user_agent text,
    country character varying(100),
    city character varying(100),
    device_type character varying(20),
    os character varying(50),
    browser character varying(50),
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cost numeric(10,4)
);


ALTER TABLE public.impressions OWNER TO afriads_user;

--
-- Name: impressions_id_seq; Type: SEQUENCE; Schema: public; Owner: afriads_user
--

CREATE SEQUENCE public.impressions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.impressions_id_seq OWNER TO afriads_user;

--
-- Name: impressions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: afriads_user
--

ALTER SEQUENCE public.impressions_id_seq OWNED BY public.impressions.id;


--
-- Name: targeting_rules; Type: TABLE; Schema: public; Owner: afriads_user
--

CREATE TABLE public.targeting_rules (
    id integer NOT NULL,
    campaign_id integer,
    countries text[],
    cities text[],
    device_types text[],
    operating_systems text[],
    browsers text[],
    languages text[],
    age_min integer,
    age_max integer,
    gender character varying(10),
    interests text[],
    time_from time without time zone,
    time_to time without time zone,
    days_of_week text[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT targeting_rules_gender_check CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying, 'all'::character varying])::text[])))
);


ALTER TABLE public.targeting_rules OWNER TO afriads_user;

--
-- Name: targeting_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: afriads_user
--

CREATE SEQUENCE public.targeting_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.targeting_rules_id_seq OWNER TO afriads_user;

--
-- Name: targeting_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: afriads_user
--

ALTER SEQUENCE public.targeting_rules_id_seq OWNED BY public.targeting_rules.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: afriads_user
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    user_id integer,
    transaction_type character varying(20) NOT NULL,
    amount numeric(10,2) NOT NULL,
    balance_after numeric(10,2),
    description text,
    status character varying(20) DEFAULT 'completed'::character varying,
    reference_id character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT transactions_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'cancelled'::character varying])::text[]))),
    CONSTRAINT transactions_transaction_type_check CHECK (((transaction_type)::text = ANY ((ARRAY['deposit'::character varying, 'withdrawal'::character varying, 'ad_spend'::character varying, 'earnings'::character varying])::text[])))
);


ALTER TABLE public.transactions OWNER TO afriads_user;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: afriads_user
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_id_seq OWNER TO afriads_user;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: afriads_user
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: afriads_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    user_type character varying(20) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    company_name character varying(255),
    phone character varying(20),
    country character varying(100),
    balance numeric(10,2) DEFAULT 0.00,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'suspended'::character varying, 'pending'::character varying])::text[]))),
    CONSTRAINT users_user_type_check CHECK (((user_type)::text = ANY ((ARRAY['advertiser'::character varying, 'publisher'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO afriads_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: afriads_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO afriads_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: afriads_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: website_reports; Type: TABLE; Schema: public; Owner: afriads_user
--

CREATE TABLE public.website_reports (
    id integer NOT NULL,
    website_id integer,
    report_date date NOT NULL,
    impressions integer DEFAULT 0,
    clicks integer DEFAULT 0,
    earnings numeric(10,2) DEFAULT 0.00,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.website_reports OWNER TO afriads_user;

--
-- Name: website_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: afriads_user
--

CREATE SEQUENCE public.website_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.website_reports_id_seq OWNER TO afriads_user;

--
-- Name: website_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: afriads_user
--

ALTER SEQUENCE public.website_reports_id_seq OWNED BY public.website_reports.id;


--
-- Name: websites; Type: TABLE; Schema: public; Owner: afriads_user
--

CREATE TABLE public.websites (
    id integer NOT NULL,
    publisher_id integer,
    name character varying(255) NOT NULL,
    url character varying(500) NOT NULL,
    category character varying(100),
    monthly_visitors integer,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT websites_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'active'::character varying, 'suspended'::character varying])::text[])))
);


ALTER TABLE public.websites OWNER TO afriads_user;

--
-- Name: websites_id_seq; Type: SEQUENCE; Schema: public; Owner: afriads_user
--

CREATE SEQUENCE public.websites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.websites_id_seq OWNER TO afriads_user;

--
-- Name: websites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: afriads_user
--

ALTER SEQUENCE public.websites_id_seq OWNED BY public.websites.id;


--
-- Name: ad_creatives id; Type: DEFAULT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.ad_creatives ALTER COLUMN id SET DEFAULT nextval('public.ad_creatives_id_seq'::regclass);


--
-- Name: ad_zones id; Type: DEFAULT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.ad_zones ALTER COLUMN id SET DEFAULT nextval('public.ad_zones_id_seq'::regclass);


--
-- Name: campaign_reports id; Type: DEFAULT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.campaign_reports ALTER COLUMN id SET DEFAULT nextval('public.campaign_reports_id_seq'::regclass);


--
-- Name: campaigns id; Type: DEFAULT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.campaigns ALTER COLUMN id SET DEFAULT nextval('public.campaigns_id_seq'::regclass);


--
-- Name: clicks id; Type: DEFAULT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.clicks ALTER COLUMN id SET DEFAULT nextval('public.clicks_id_seq'::regclass);


--
-- Name: conversions id; Type: DEFAULT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.conversions ALTER COLUMN id SET DEFAULT nextval('public.conversions_id_seq'::regclass);


--
-- Name: impressions id; Type: DEFAULT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.impressions ALTER COLUMN id SET DEFAULT nextval('public.impressions_id_seq'::regclass);


--
-- Name: targeting_rules id; Type: DEFAULT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.targeting_rules ALTER COLUMN id SET DEFAULT nextval('public.targeting_rules_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: website_reports id; Type: DEFAULT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.website_reports ALTER COLUMN id SET DEFAULT nextval('public.website_reports_id_seq'::regclass);


--
-- Name: websites id; Type: DEFAULT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.websites ALTER COLUMN id SET DEFAULT nextval('public.websites_id_seq'::regclass);


--
-- Data for Name: ad_creatives; Type: TABLE DATA; Schema: public; Owner: afriads_user
--

COPY public.ad_creatives (id, campaign_id, name, ad_type, format, title, description, image_url, video_url, destination_url, call_to_action, status, created_at, updated_at) FROM stdin;
1	1	Summer Sale Ad	display	728x90	Amazing Summer Sale!	Get 50% off on all products	https://via.placeholder.com/728x90	\N	https://example.com/summer-sale	Shop Now	active	2025-11-15 10:56:21.495845	2025-11-17 09:56:53.595096
2	2	Jemsa Media services	display	728x90	Explore JemsaMedia	We are here to give you the best marketing for your business	http://localhost:5000/uploads/ads/ad-1763358598360-652244074.png	\N	https://jemsamediatech.africa/	Learn More	active	2025-11-17 08:49:58.399498	2025-11-17 09:56:53.595096
\.


--
-- Data for Name: ad_zones; Type: TABLE DATA; Schema: public; Owner: afriads_user
--

COPY public.ad_zones (id, website_id, name, zone_type, dimensions, status, created_at) FROM stdin;
1	1	Homepage Banner	display	728x90	active	2025-11-15 10:56:21.491321
2	2	Homepage	display	728x90	active	2025-11-18 11:32:59.867872
\.


--
-- Data for Name: campaign_reports; Type: TABLE DATA; Schema: public; Owner: afriads_user
--

COPY public.campaign_reports (id, campaign_id, report_date, impressions, clicks, conversions, spend, revenue, ctr, created_at) FROM stdin;
\.


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: afriads_user
--

COPY public.campaigns (id, advertiser_id, name, daily_budget, total_budget, spent_amount, status, start_date, end_date, bid_type, bid_amount, created_at, updated_at) FROM stdin;
2	2	Maimoon	10.00	2000.00	0.00	active	2025-11-16 00:00:00	2025-12-16 00:00:00	cpm	3.0000	2025-11-16 15:11:12.430716	2025-11-21 21:11:26.163821
1	2	Summer Sale Campaign	500.00	5000.00	0.00	active	2025-11-01 00:00:00	2025-12-31 00:00:00	cpm	2.5000	2025-11-15 10:25:34.434034	2025-11-17 10:18:13.778054
\.


--
-- Data for Name: clicks; Type: TABLE DATA; Schema: public; Owner: afriads_user
--

COPY public.clicks (id, impression_id, ad_creative_id, campaign_id, website_id, ad_zone_id, ip_address, user_agent, country, city, device_type, "timestamp", cost) FROM stdin;
1	1	1	1	1	1	::1	curl/8.5.0	Kenya	Nairobi	desktop	2025-11-15 11:23:07.701035	0.0000
2	23	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-17 09:58:22.492378	0.0000
3	23	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-17 09:58:43.862609	0.0000
4	33	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-17 09:59:02.639911	0.0000
5	38	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-17 10:00:01.294714	0.0000
6	38	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-17 10:04:11.628872	0.0000
7	44	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-17 10:04:46.931311	0.0000
8	69	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-17 10:18:00.644271	0.0000
9	93	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-17 10:25:34.589589	0.0000
10	93	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-17 10:25:50.160426	0.0000
11	94	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-17 10:25:59.325643	0.0000
12	95	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-17 10:26:09.528685	0.0000
13	95	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-17 10:26:14.576755	0.0000
14	103	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-17 15:03:10.674436	0.0000
15	104	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-17 15:03:19.443155	0.0000
16	108	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-18 11:57:38.732734	0.0000
17	107	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-18 11:58:31.346443	0.0000
18	105	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-18 11:58:38.876164	0.0000
19	108	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-18 12:03:10.530504	0.0000
20	107	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-18 12:03:25.170367	0.0000
21	109	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-19 11:20:28.173903	0.0000
22	109	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-19 11:44:02.767284	0.0000
23	109	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-19 11:44:05.328949	0.0000
24	113	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-20 09:40:12.722821	0.0000
25	114	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-20 09:43:38.874014	0.0000
26	114	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-20 09:43:49.968255	0.0000
27	117	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-21 09:02:34.971888	0.0000
28	120	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-21 09:11:18.264762	0.0000
29	121	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-21 21:11:27.744207	0.0000
30	123	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-21 21:11:38.559326	0.0000
31	124	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-21 21:11:49.524084	0.0000
32	124	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-21 21:13:00.161408	0.0000
33	124	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	2025-11-21 21:13:23.039379	0.0000
\.


--
-- Data for Name: conversions; Type: TABLE DATA; Schema: public; Owner: afriads_user
--

COPY public.conversions (id, click_id, campaign_id, conversion_type, conversion_value, "timestamp") FROM stdin;
\.


--
-- Data for Name: impressions; Type: TABLE DATA; Schema: public; Owner: afriads_user
--

COPY public.impressions (id, ad_creative_id, campaign_id, website_id, ad_zone_id, ip_address, user_agent, country, city, device_type, os, browser, "timestamp", cost) FROM stdin;
1	1	1	1	1	::1	curl/8.5.0	Kenya	Nairobi	desktop	unknown	unknown	2025-11-15 11:22:03.175234	0.0025
2	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-16 13:06:50.613013	0.0025
3	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-16 13:07:28.231333	0.0025
4	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-16 13:08:18.786047	0.0025
5	1	1	1	1	::1	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	Kenya	Nairobi	mobile	macos	safari	2025-11-16 13:11:54.301963	0.0025
6	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-16 13:12:09.173771	0.0025
7	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-16 13:12:13.135755	0.0025
8	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-16 13:13:04.265329	0.0025
9	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-16 13:13:07.273386	0.0025
10	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-16 13:13:10.489064	0.0025
11	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-16 13:13:11.212201	0.0025
12	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-16 13:13:11.541423	0.0025
13	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-16 13:13:11.884313	0.0025
14	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-16 13:13:12.191491	0.0025
15	1	1	1	1	::1	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	Kenya	Nairobi	mobile	macos	safari	2025-11-16 13:18:33.0537	0.0025
16	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-16 13:18:43.991376	0.0025
17	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-16 13:32:25.060387	0.0025
18	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-16 13:32:25.962955	0.0025
19	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-16 13:32:26.826916	0.0025
20	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-16 13:32:27.033095	0.0025
21	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-16 13:32:27.296768	0.0025
22	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-16 13:32:44.206235	0.0025
23	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 09:58:20.766852	0.0025
24	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 09:58:53.54786	0.0025
25	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 09:58:55.745397	0.0025
26	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 09:58:56.346752	0.0025
27	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 09:58:56.897658	0.0025
28	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 09:58:57.613861	0.0025
29	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 09:58:59.899951	0.0025
30	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 09:59:00.494195	0.0025
31	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 09:59:00.689187	0.0025
32	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 09:59:00.844237	0.0025
33	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 09:59:01.024443	0.0025
34	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 09:59:53.133522	0.0025
35	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 09:59:54.62412	0.0025
36	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 09:59:55.948695	0.0025
37	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 09:59:58.044092	0.0025
38	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 09:59:59.454074	0.0025
39	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:04:15.649166	0.0025
40	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:04:25.666908	0.0025
41	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:04:26.718667	0.0025
42	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:04:27.524699	0.0025
43	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:04:28.283955	0.0025
44	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:04:28.973168	0.0025
45	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:06:08.826144	0.0025
46	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:06:09.807733	0.0025
47	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:06:10.453439	0.0025
48	1	1	1	1	::1	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	Kenya	Nairobi	mobile	macos	safari	2025-11-17 10:14:04.634585	0.0025
49	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:16:54.943596	0.0025
50	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:16:55.508763	0.0025
51	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:16:56.877023	0.0025
52	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:16:58.735441	0.0025
53	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:16:59.939534	0.0025
54	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:17:01.255837	0.0025
55	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:17:02.040106	0.0025
56	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:17:48.461496	0.0025
57	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:17:48.67481	0.0025
58	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:17:48.894473	0.0025
59	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:17:49.208814	0.0025
60	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:17:49.429017	0.0025
61	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:17:50.1083	0.0025
62	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:17:50.64572	0.0025
63	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:17:50.886018	0.0025
64	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:17:56.387045	0.0025
65	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:17:57.728425	0.0025
66	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:17:58.718365	0.0025
67	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:17:59.164275	0.0025
68	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:17:59.404224	0.0025
69	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:17:59.62049	0.0025
70	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:18:10.1541	0.0025
71	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:18:10.46234	0.0025
72	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:18:10.869994	0.0025
73	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:18:11.13236	0.0025
74	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:18:11.338706	0.0025
75	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:18:11.498558	0.0025
76	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:18:11.681367	0.0025
77	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:18:12.011852	0.0025
78	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:18:12.445479	0.0025
79	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:18:12.85657	0.0025
80	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:18:13.078469	0.0025
81	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:18:13.318023	0.0025
82	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:18:13.568334	0.0025
83	1	1	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:18:13.775312	0.0025
84	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:24:33.552395	0.0030
85	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:24:36.485014	0.0030
86	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:24:37.34846	0.0030
87	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:24:38.494197	0.0030
88	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:24:39.31177	0.0030
89	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:24:40.580375	0.0030
90	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:25:30.708643	0.0030
91	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:25:32.042545	0.0030
92	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:25:32.669447	0.0030
93	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:25:33.229566	0.0030
94	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:25:57.457499	0.0030
95	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 10:26:07.542206	0.0030
96	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 15:02:55.244212	0.0030
97	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 15:03:05.925856	0.0030
98	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 15:03:06.333179	0.0030
99	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 15:03:06.54949	0.0030
100	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 15:03:06.744954	0.0030
101	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 15:03:06.9218	0.0030
102	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 15:03:07.101363	0.0030
103	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 15:03:07.266121	0.0030
104	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-17 15:03:17.025269	0.0030
105	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-18 11:57:30.199955	0.0030
106	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-18 11:57:30.211606	0.0030
107	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-18 11:57:30.217298	0.0030
108	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-18 11:57:30.225661	0.0030
109	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-19 11:18:35.549787	0.0030
110	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-19 11:18:35.568263	0.0030
111	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-19 11:18:35.577572	0.0030
112	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-19 11:18:35.586182	0.0030
113	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-20 09:40:11.249062	0.0030
114	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-20 09:40:11.278902	0.0030
115	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-20 09:40:11.291521	0.0030
116	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-20 09:40:11.303327	0.0030
117	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-21 09:02:30.856495	0.0030
118	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-21 09:02:30.901605	0.0030
119	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-21 09:02:30.916643	0.0030
120	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-21 09:02:30.931446	0.0030
121	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-21 21:11:26.121942	0.0030
122	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-21 21:11:26.142837	0.0030
123	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-21 21:11:26.152283	0.0030
124	2	2	1	1	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	Kenya	Nairobi	desktop	linux	chrome	2025-11-21 21:11:26.161489	0.0030
\.


--
-- Data for Name: targeting_rules; Type: TABLE DATA; Schema: public; Owner: afriads_user
--

COPY public.targeting_rules (id, campaign_id, countries, cities, device_types, operating_systems, browsers, languages, age_min, age_max, gender, interests, time_from, time_to, days_of_week, created_at) FROM stdin;
1	1	{Kenya,Uganda,Tanzania}	\N	{mobile,desktop,tablet}	{windows,macos,linux,android,ios}	{chrome,firefox,safari,edge}	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-15 10:56:21.502549
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: afriads_user
--

COPY public.transactions (id, user_id, transaction_type, amount, balance_after, description, status, reference_id, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: afriads_user
--

COPY public.users (id, email, password_hash, user_type, first_name, last_name, company_name, phone, country, balance, status, created_at, updated_at) FROM stdin;
1	admin@afriads.com	$2a$10$xVQGKvZ5aPqGLhLfUjJ9s.HHNLXqQ8yZE1zWNp8rGgfZJ9sXZXqPO	admin	Admin	User	\N	\N	\N	0.00	active	2025-11-15 09:52:11.970757	2025-11-15 09:52:11.970757
2	advertiser@test.com	$2b$10$cM1zF/3awm1iBQstM7eRkuWTF1P9EbL.zmGJzsBDnpyjqjWXxAl8K	advertiser	John	Doe	Test Company	\N	Kenya	10000.00	active	2025-11-15 10:07:10.937169	2025-11-15 10:15:39.381357
3	publisher@test.com	$2a$10$xVQGKvZ5aPqGLhLfUjJ9s.HHNLXqQ8yZE1zWNp8rGgfZJ9sXZXqPO	publisher	Jane	Publisher	\N	\N	\N	0.00	active	2025-11-15 10:56:21.478839	2025-11-15 10:56:21.478839
4	jemsa@test.com	$2b$10$kNWIAmOgRijNpiPoIBpaaO3Z2x5z/ixG4o2iB2.7HN/BRVwAvB3mK	advertiser	Japheth	Samuel	JemsaMediaTech Digital Agency	\N	Kenya	0.00	active	2025-11-16 14:20:39.473018	2025-11-16 14:20:39.473018
5	safcom@test.com	$2b$10$RMTKSsONXt.hhVrWHUzT5.9ydGCcpvAOr6xxfLkqFWQRuagM.6CtG	publisher	Safaricom	ke	safcom	\N	Kenya	0.00	active	2025-11-16 14:25:28.621278	2025-11-16 14:25:28.621278
6	fentech@test.com	$2b$10$EcAICCs6wu5YQraQ220kcuHPgIQAV0rAxtuTS2Nhq/NbnLXGn8vQS	publisher	Felix	Ngitari	Fentech group	\N	Kenya	0.00	active	2025-11-18 11:18:10.930696	2025-11-18 11:18:10.930696
\.


--
-- Data for Name: website_reports; Type: TABLE DATA; Schema: public; Owner: afriads_user
--

COPY public.website_reports (id, website_id, report_date, impressions, clicks, earnings, created_at) FROM stdin;
\.


--
-- Data for Name: websites; Type: TABLE DATA; Schema: public; Owner: afriads_user
--

COPY public.websites (id, publisher_id, name, url, category, monthly_visitors, status, created_at, updated_at) FROM stdin;
1	3	Test News Site	https://testnews.com	News	\N	active	2025-11-15 10:56:21.487272	2025-11-15 10:56:21.487272
2	6	Jemsa Media services	https://jemsamediatech.africa/	Technology	2300	approved	2025-11-18 11:18:57.255625	2025-11-18 11:22:43.515923
\.


--
-- Name: ad_creatives_id_seq; Type: SEQUENCE SET; Schema: public; Owner: afriads_user
--

SELECT pg_catalog.setval('public.ad_creatives_id_seq', 2, true);


--
-- Name: ad_zones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: afriads_user
--

SELECT pg_catalog.setval('public.ad_zones_id_seq', 2, true);


--
-- Name: campaign_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: afriads_user
--

SELECT pg_catalog.setval('public.campaign_reports_id_seq', 1, false);


--
-- Name: campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: afriads_user
--

SELECT pg_catalog.setval('public.campaigns_id_seq', 2, true);


--
-- Name: clicks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: afriads_user
--

SELECT pg_catalog.setval('public.clicks_id_seq', 33, true);


--
-- Name: conversions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: afriads_user
--

SELECT pg_catalog.setval('public.conversions_id_seq', 1, false);


--
-- Name: impressions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: afriads_user
--

SELECT pg_catalog.setval('public.impressions_id_seq', 124, true);


--
-- Name: targeting_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: afriads_user
--

SELECT pg_catalog.setval('public.targeting_rules_id_seq', 1, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: afriads_user
--

SELECT pg_catalog.setval('public.transactions_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: afriads_user
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- Name: website_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: afriads_user
--

SELECT pg_catalog.setval('public.website_reports_id_seq', 1, false);


--
-- Name: websites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: afriads_user
--

SELECT pg_catalog.setval('public.websites_id_seq', 2, true);


--
-- Name: ad_creatives ad_creatives_pkey; Type: CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.ad_creatives
    ADD CONSTRAINT ad_creatives_pkey PRIMARY KEY (id);


--
-- Name: ad_zones ad_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.ad_zones
    ADD CONSTRAINT ad_zones_pkey PRIMARY KEY (id);


--
-- Name: campaign_reports campaign_reports_campaign_id_report_date_key; Type: CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.campaign_reports
    ADD CONSTRAINT campaign_reports_campaign_id_report_date_key UNIQUE (campaign_id, report_date);


--
-- Name: campaign_reports campaign_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.campaign_reports
    ADD CONSTRAINT campaign_reports_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: clicks clicks_pkey; Type: CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.clicks
    ADD CONSTRAINT clicks_pkey PRIMARY KEY (id);


--
-- Name: conversions conversions_pkey; Type: CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.conversions
    ADD CONSTRAINT conversions_pkey PRIMARY KEY (id);


--
-- Name: impressions impressions_pkey; Type: CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.impressions
    ADD CONSTRAINT impressions_pkey PRIMARY KEY (id);


--
-- Name: targeting_rules targeting_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.targeting_rules
    ADD CONSTRAINT targeting_rules_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: website_reports website_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.website_reports
    ADD CONSTRAINT website_reports_pkey PRIMARY KEY (id);


--
-- Name: website_reports website_reports_website_id_report_date_key; Type: CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.website_reports
    ADD CONSTRAINT website_reports_website_id_report_date_key UNIQUE (website_id, report_date);


--
-- Name: websites websites_pkey; Type: CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.websites
    ADD CONSTRAINT websites_pkey PRIMARY KEY (id);


--
-- Name: idx_clicks_campaign; Type: INDEX; Schema: public; Owner: afriads_user
--

CREATE INDEX idx_clicks_campaign ON public.clicks USING btree (campaign_id);


--
-- Name: idx_clicks_timestamp; Type: INDEX; Schema: public; Owner: afriads_user
--

CREATE INDEX idx_clicks_timestamp ON public.clicks USING btree ("timestamp");


--
-- Name: idx_impressions_campaign; Type: INDEX; Schema: public; Owner: afriads_user
--

CREATE INDEX idx_impressions_campaign ON public.impressions USING btree (campaign_id);


--
-- Name: idx_impressions_timestamp; Type: INDEX; Schema: public; Owner: afriads_user
--

CREATE INDEX idx_impressions_timestamp ON public.impressions USING btree ("timestamp");


--
-- Name: idx_impressions_website; Type: INDEX; Schema: public; Owner: afriads_user
--

CREATE INDEX idx_impressions_website ON public.impressions USING btree (website_id);


--
-- Name: ad_creatives update_ad_creatives_updated_at; Type: TRIGGER; Schema: public; Owner: afriads_user
--

CREATE TRIGGER update_ad_creatives_updated_at BEFORE UPDATE ON public.ad_creatives FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: campaigns update_campaigns_updated_at; Type: TRIGGER; Schema: public; Owner: afriads_user
--

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: afriads_user
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: websites update_websites_updated_at; Type: TRIGGER; Schema: public; Owner: afriads_user
--

CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON public.websites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ad_creatives ad_creatives_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.ad_creatives
    ADD CONSTRAINT ad_creatives_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: ad_zones ad_zones_website_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.ad_zones
    ADD CONSTRAINT ad_zones_website_id_fkey FOREIGN KEY (website_id) REFERENCES public.websites(id) ON DELETE CASCADE;


--
-- Name: campaign_reports campaign_reports_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.campaign_reports
    ADD CONSTRAINT campaign_reports_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: campaigns campaigns_advertiser_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_advertiser_id_fkey FOREIGN KEY (advertiser_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: clicks clicks_ad_creative_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.clicks
    ADD CONSTRAINT clicks_ad_creative_id_fkey FOREIGN KEY (ad_creative_id) REFERENCES public.ad_creatives(id);


--
-- Name: clicks clicks_ad_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.clicks
    ADD CONSTRAINT clicks_ad_zone_id_fkey FOREIGN KEY (ad_zone_id) REFERENCES public.ad_zones(id);


--
-- Name: clicks clicks_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.clicks
    ADD CONSTRAINT clicks_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: clicks clicks_impression_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.clicks
    ADD CONSTRAINT clicks_impression_id_fkey FOREIGN KEY (impression_id) REFERENCES public.impressions(id);


--
-- Name: clicks clicks_website_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.clicks
    ADD CONSTRAINT clicks_website_id_fkey FOREIGN KEY (website_id) REFERENCES public.websites(id);


--
-- Name: conversions conversions_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.conversions
    ADD CONSTRAINT conversions_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: conversions conversions_click_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.conversions
    ADD CONSTRAINT conversions_click_id_fkey FOREIGN KEY (click_id) REFERENCES public.clicks(id);


--
-- Name: impressions impressions_ad_creative_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.impressions
    ADD CONSTRAINT impressions_ad_creative_id_fkey FOREIGN KEY (ad_creative_id) REFERENCES public.ad_creatives(id);


--
-- Name: impressions impressions_ad_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.impressions
    ADD CONSTRAINT impressions_ad_zone_id_fkey FOREIGN KEY (ad_zone_id) REFERENCES public.ad_zones(id);


--
-- Name: impressions impressions_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.impressions
    ADD CONSTRAINT impressions_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: impressions impressions_website_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.impressions
    ADD CONSTRAINT impressions_website_id_fkey FOREIGN KEY (website_id) REFERENCES public.websites(id);


--
-- Name: targeting_rules targeting_rules_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.targeting_rules
    ADD CONSTRAINT targeting_rules_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: website_reports website_reports_website_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.website_reports
    ADD CONSTRAINT website_reports_website_id_fkey FOREIGN KEY (website_id) REFERENCES public.websites(id);


--
-- Name: websites websites_publisher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: afriads_user
--

ALTER TABLE ONLY public.websites
    ADD CONSTRAINT websites_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO afriads_user;


--
-- PostgreSQL database dump complete
--

\unrestrict NKfVIvP9NNY5uUPFLBjVOwUjL6S91Vmitn26wEyAzAt6Jv4zuBxdmWw2Ko8mSYH

