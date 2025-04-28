

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


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_article_likes"("article_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql"
    AS $_$
BEGIN
  RETURN (SELECT COUNT(*) FROM article_likes WHERE article_likes.article_id = $1);
END;
$_$;


ALTER FUNCTION "public"."get_article_likes"("article_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  INSERT INTO public.profiles (user_id, username, created_at)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'username', new.email), now());
  RETURN new;
END;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."article_likes" (
    "article_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."article_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."article_tags" (
    "article_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL
);


ALTER TABLE "public"."article_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."articles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "url" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."articles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comment_likes" (
    "comment_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."comment_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "article_id" "uuid",
    "user_id" "uuid",
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "profile_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "username" character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "user_id" "uuid" NOT NULL,
    "is_curator" boolean DEFAULT false,
    "profile_id" "uuid" NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."article_likes"
    ADD CONSTRAINT "article_likes_pkey" PRIMARY KEY ("article_id", "user_id");



ALTER TABLE ONLY "public"."article_tags"
    ADD CONSTRAINT "article_tags_pkey" PRIMARY KEY ("article_id", "tag_id");



ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comment_likes"
    ADD CONSTRAINT "comment_likes_pkey" PRIMARY KEY ("comment_id", "user_id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id");



CREATE INDEX "likes_article_id_idx" ON "public"."article_likes" USING "btree" ("article_id");



ALTER TABLE ONLY "public"."article_likes"
    ADD CONSTRAINT "article_likes_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."article_likes"
    ADD CONSTRAINT "article_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."article_tags"
    ADD CONSTRAINT "article_tags_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."article_tags"
    ADD CONSTRAINT "article_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_created_by_fkey1" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."comment_likes"
    ADD CONSTRAINT "comment_likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comment_likes"
    ADD CONSTRAINT "comment_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow deleting comments if user is a curator" ON "public"."comments" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."is_curator" = true)))));



CREATE POLICY "Anyone can see likes" ON "public"."article_likes" FOR SELECT USING (true);



CREATE POLICY "Anyone can see likes" ON "public"."comment_likes" FOR SELECT USING (true);



CREATE POLICY "Anyone can view article_tags" ON "public"."article_tags" FOR SELECT USING (true);



CREATE POLICY "Anyone can view articles" ON "public"."articles" FOR SELECT USING (true);



CREATE POLICY "Anyone can view comments" ON "public"."comments" FOR SELECT USING (true);



CREATE POLICY "Anyone can view profiles" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Anyone can view tags" ON "public"."tags" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can insert comments" ON "public"."comments" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."article_likes" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."comment_likes" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."article_likes" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."comment_likes" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable read access for all users" ON "public"."user_roles" FOR SELECT USING (true);



CREATE POLICY "Only admins can delete articles" ON "public"."articles" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."is_curator" = true)))));



CREATE POLICY "Only admins can insert article_tags" ON "public"."article_tags" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."is_curator" = true)))));



CREATE POLICY "Only admins can insert articles" ON "public"."articles" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."is_curator" = true)))));



CREATE POLICY "Only admins can insert tags" ON "public"."tags" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."is_curator" = true)))));



CREATE POLICY "Users can delete their own comments" ON "public"."comments" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own comments" ON "public"."comments" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."article_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."article_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."articles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comment_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."get_article_likes"("article_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_article_likes"("article_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_article_likes"("article_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


















GRANT ALL ON TABLE "public"."article_likes" TO "anon";
GRANT ALL ON TABLE "public"."article_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."article_likes" TO "service_role";



GRANT ALL ON TABLE "public"."article_tags" TO "anon";
GRANT ALL ON TABLE "public"."article_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."article_tags" TO "service_role";



GRANT ALL ON TABLE "public"."articles" TO "anon";
GRANT ALL ON TABLE "public"."articles" TO "authenticated";
GRANT ALL ON TABLE "public"."articles" TO "service_role";



GRANT ALL ON TABLE "public"."comment_likes" TO "anon";
GRANT ALL ON TABLE "public"."comment_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."comment_likes" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
