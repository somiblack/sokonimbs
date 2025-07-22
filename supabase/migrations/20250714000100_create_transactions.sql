create table transactions (
  id serial primary key,
  phone text not null,
  offer_name text,
  amount numeric,
  status text,
  created_at timestamp with time zone default timezone('utc'::text, now())
); 