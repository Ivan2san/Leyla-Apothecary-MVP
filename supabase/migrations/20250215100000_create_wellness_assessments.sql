create table if not exists public.wellness_assessments (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text not null,
  phone text,
  location text,
  ip_address text,
  q1_digestive_issues text,
  q2_sleep_quality text,
  q3_medications text,
  q4_processed_foods text,
  q5_energy_crashes text,
  q6_water_intake text,
  q7_toxic_exposure text,
  q8_symptoms text,
  q9_supplements text,
  q10_unresolved_issues text,
  current_situation text,
  primary_goal text,
  biggest_obstacle text,
  preferred_support text,
  additional_notes text,
  wellness_score integer,
  score_category text,
  qualification_level text,
  recommended_next_step jsonb,
  completed_at timestamp with time zone,
  result_viewed boolean default false,
  clicked_cta boolean default false,
  booking_made boolean default false,
  utm_source text,
  utm_medium text,
  utm_campaign text
);

comment on table public.wellness_assessments is $$Lead generation assessments captured from the Leyla's Apothecary wellness questionnaire$$;

create index if not exists wellness_assessments_created_at_idx on public.wellness_assessments (created_at);

alter table public.wellness_assessments enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'allow_anon_insert_wellness_assessments'
  ) then
    create policy allow_anon_insert_wellness_assessments on public.wellness_assessments
      for insert
      to anon
      with check (true);
  end if;
end $$;
