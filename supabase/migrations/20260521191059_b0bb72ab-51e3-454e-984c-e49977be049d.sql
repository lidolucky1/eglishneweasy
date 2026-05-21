
-- Enums
create type public.cefr_level as enum ('A1','A2','B1','B2','C1','C2');
create type public.lesson_category as enum (
  'grammar','vocabulary','pronunciation','listening','speaking',
  'reading','writing','business','news','ielts'
);
create type public.quiz_type as enum ('mcq','fill','listening','drag');
create type public.app_role as enum ('admin','user');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar_url text,
  level public.cefr_level not null default 'A1',
  xp integer not null default 0,
  streak integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

-- User roles (separate table)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists(select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "user_roles_select_own" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Courses (public catalog)
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  level public.cefr_level not null,
  category public.lesson_category not null,
  thumbnail_url text,
  hero_color text default '#58CC02',
  lessons_count integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.courses enable row level security;
create policy "courses_public_read" on public.courses for select using (true);

-- Lessons
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  slug text not null,
  video_url text,
  audio_url text,
  transcript text,
  content text,
  vocabulary jsonb default '[]'::jsonb,
  order_index integer not null default 0,
  duration_min integer not null default 5,
  created_at timestamptz not null default now(),
  unique(course_id, slug)
);
alter table public.lessons enable row level security;
create policy "lessons_public_read" on public.lessons for select using (true);

create index lessons_course_idx on public.lessons(course_id, order_index);

-- Quizzes
create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  question text not null,
  type public.quiz_type not null default 'mcq',
  options jsonb not null default '[]'::jsonb,
  answer text not null,
  explanation text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.quizzes enable row level security;
create policy "quizzes_public_read" on public.quizzes for select using (true);

create index quizzes_lesson_idx on public.quizzes(lesson_id, order_index);

-- Progress
create table public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  score integer,
  time_spent_sec integer not null default 0,
  last_seen_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);
alter table public.progress enable row level security;
create policy "progress_select_own" on public.progress for select to authenticated using (auth.uid() = user_id);
create policy "progress_insert_own" on public.progress for insert to authenticated with check (auth.uid() = user_id);
create policy "progress_update_own" on public.progress for update to authenticated using (auth.uid() = user_id);
create policy "progress_delete_own" on public.progress for delete to authenticated using (auth.uid() = user_id);

-- Favorites
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);
alter table public.favorites enable row level security;
create policy "favorites_select_own" on public.favorites for select to authenticated using (auth.uid() = user_id);
create policy "favorites_insert_own" on public.favorites for insert to authenticated with check (auth.uid() = user_id);
create policy "favorites_delete_own" on public.favorites for delete to authenticated using (auth.uid() = user_id);

-- Maintain lessons_count
create or replace function public.refresh_lessons_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.courses set lessons_count = lessons_count + 1 where id = new.course_id;
  elsif tg_op = 'DELETE' then
    update public.courses set lessons_count = greatest(lessons_count - 1, 0) where id = old.course_id;
  end if;
  return null;
end;
$$;
create trigger lessons_count_trg
  after insert or delete on public.lessons
  for each row execute function public.refresh_lessons_count();
