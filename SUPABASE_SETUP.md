# Supabase Setup — Certificate Repository

The "Certificate Repository" tool lets users upload certificate/tag PDFs and later
search and download them by file name. It stores files in a single Supabase
Storage bucket and works fine on the **Supabase Free plan** (1 GB storage, 2 GB
bandwidth/month).

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project (free tier is fine).
2. Wait for the project to finish provisioning.

## 2. Get your API credentials

1. In your Supabase project, open **Project Settings > API**.
2. Copy the **Project URL** and the **anon public** key.
3. Copy `.env.example` to `.env` in the project root (if not already present) and fill in:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

`.env` is already in `.gitignore`, so these values stay local and are never committed.

## 3. Create the storage bucket

1. Go to **Storage** in the Supabase dashboard.
2. Click **New bucket**.
3. Name it exactly: `certificates`
4. Leave it **Private** (recommended — access is controlled by the policies below, not by making the bucket public).
5. Click **Create bucket**.

## 4. Add storage access policies

Since this app uses the public **anon** key (no login system), you need to grant
the `anon` role permission to upload and read files in the `certificates` bucket.

Go to **SQL Editor** in the Supabase dashboard, paste the SQL below, and run it:

```sql
-- Allow anyone with the anon key to upload certificates
create policy "certificates_anon_upload"
on storage.objects for insert
to anon
with check (bucket_id = 'certificates');

-- Allow anyone with the anon key to list and download certificates
create policy "certificates_anon_read"
on storage.objects for select
to anon
using (bucket_id = 'certificates');

-- Allow re-uploading a file with the same name (used by the "Replace existing file" option)
create policy "certificates_anon_update"
on storage.objects for update
to anon
using (bucket_id = 'certificates')
with check (bucket_id = 'certificates');

-- Allow deleting certificates from the repository
create policy "certificates_anon_delete"
on storage.objects for delete
to anon
using (bucket_id = 'certificates');
```

> These policies only apply to the `certificates` bucket, so other data in your
> project stays protected.

> **Already set up your project?** If you created the bucket and policies before
> the delete feature was added, just run the `certificates_anon_delete` policy
> above in the **SQL Editor** — the rest of your setup doesn't need to change.

## 5. Enable authentication & upload tracking

The app now requires users to sign in (Login / Register / Logout) before
using any tool, and the Certificate Repository records who uploaded each
file. Go to **SQL Editor** in the Supabase dashboard, paste the SQL below,
and run it:

```sql
-- Track who uploaded each certificate/tag
create table public.certificate_uploads (
  id uuid primary key default gen_random_uuid(),
  file_name text not null unique,
  uploaded_by uuid references auth.users(id) on delete set null,
  uploaded_by_name text,
  created_at timestamptz not null default now()
);

alter table public.certificate_uploads enable row level security;

create policy "certificate_uploads_select" on public.certificate_uploads
  for select to authenticated using (true);

create policy "certificate_uploads_upsert" on public.certificate_uploads
  for insert to authenticated with check (auth.uid() = uploaded_by);

create policy "certificate_uploads_update" on public.certificate_uploads
  for update to authenticated using (true) with check (auth.uid() = uploaded_by);

create policy "certificate_uploads_delete" on public.certificate_uploads
  for delete to authenticated using (true);

-- The bucket policies in step 4 above were written for the "anon" role.
-- Now that the app requires sign-in, add matching policies for "authenticated"
-- (the old anon ones can be dropped once everyone has an account):
create policy "certificates_authenticated_upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'certificates');
create policy "certificates_authenticated_read" on storage.objects
  for select to authenticated using (bucket_id = 'certificates');
create policy "certificates_authenticated_update" on storage.objects
  for update to authenticated using (bucket_id = 'certificates') with check (bucket_id = 'certificates');
create policy "certificates_authenticated_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'certificates');
```

Then, in **Authentication > Providers > Email**, decide whether new accounts
need to confirm their email before signing in:

- **Confirm email ON** (default) — after registering, users see a "check your
  email" message and must click the confirmation link before they can sign in.
- **Confirm email OFF** — users are signed in immediately after registering.

Either works with the app; pick whichever fits how your team will use it.

## 6. Restrict registration with admin approval

By default, anyone who registers gets an account but **can't use the app**
until you approve them. Go to **SQL Editor** and run:

```sql
-- One row per signed-up user, with an admin-controlled approval flag
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill profiles for anyone who registered before this trigger existed
insert into public.profiles (id, email, full_name)
select id, email, raw_user_meta_data->>'full_name' from auth.users
on conflict (id) do nothing;

-- Helper used by RLS policies to check the current user's approval status
create function public.is_approved()
returns boolean
language sql
security definer
stable
as $$
  select coalesce((select approved from public.profiles where id = auth.uid()), false);
$$;

-- Re-create the policies from step 5 so they also require an approved account
drop policy if exists "certificate_uploads_select" on public.certificate_uploads;
create policy "certificate_uploads_select" on public.certificate_uploads
  for select to authenticated using (public.is_approved());

drop policy if exists "certificate_uploads_upsert" on public.certificate_uploads;
create policy "certificate_uploads_upsert" on public.certificate_uploads
  for insert to authenticated with check (auth.uid() = uploaded_by and public.is_approved());

drop policy if exists "certificate_uploads_update" on public.certificate_uploads;
create policy "certificate_uploads_update" on public.certificate_uploads
  for update to authenticated using (public.is_approved()) with check (auth.uid() = uploaded_by and public.is_approved());

drop policy if exists "certificate_uploads_delete" on public.certificate_uploads;
create policy "certificate_uploads_delete" on public.certificate_uploads
  for delete to authenticated using (public.is_approved());

drop policy if exists "certificates_authenticated_upload" on storage.objects;
create policy "certificates_authenticated_upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'certificates' and public.is_approved());

drop policy if exists "certificates_authenticated_read" on storage.objects;
create policy "certificates_authenticated_read" on storage.objects
  for select to authenticated using (bucket_id = 'certificates' and public.is_approved());

drop policy if exists "certificates_authenticated_update" on storage.objects;
create policy "certificates_authenticated_update" on storage.objects
  for update to authenticated using (bucket_id = 'certificates' and public.is_approved()) with check (bucket_id = 'certificates' and public.is_approved());

drop policy if exists "certificates_authenticated_delete" on storage.objects;
create policy "certificates_authenticated_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'certificates' and public.is_approved());
```

**To approve someone:** open **Table Editor > profiles**, find the row by
their `email`, and toggle `approved` to `true` (or run
`update public.profiles set approved = true where email = 'person@example.com';`
in the SQL Editor). Next time they sign in (or refresh the page), they get
full access. Until then, signed-in users see a "pending approval" screen.

## 7. Restrict which tools each user can see

By default every approved user sees **all** tools on the Tools page. To limit
a specific person to a subset, add an `allowed_tools` column to `profiles`:

```sql
alter table public.profiles add column allowed_tools text[];
```

- `allowed_tools is null` (the default) → full access, nothing changes for
  existing users.
- Set it to an array of tool IDs to restrict that user to only those tools.

Current tool IDs (from `src/config/toolsCatalog.js`):

| Tool ID             | Name                        |
| ------------------- | --------------------------- |
| `both-gen`          | Generate Certificate & Tag   |
| `certificate-gen`   | Certificate Generator        |
| `tag-gen`           | Tag Generator                |
| `certificate-vault` | Certificate Repository       |
| `datalog-converter` | Datalog to Excel Converter   |

**To restrict someone**, e.g. give a user access to only the certificate
generator:

```sql
update public.profiles
set allowed_tools = array['certificate-gen']
where email = 'person@example.com';
```

**To restore full access:**

```sql
update public.profiles set allowed_tools = null where email = 'person@example.com';
```

Restricted tools are hidden from the Tools page and the sidebar, and direct
navigation to them is blocked — so this is just a `profiles` table edit, no
app changes required. The user sees the change next time they sign in or
refresh the page.

## 8. Enable field-value suggestions (autocomplete)

While filling out a certificate/tag form, typing a double space after some
text (e.g. `24 vd  `) shows a dropdown of matching values entered previously
in that field (e.g. `24 VDC`) — click one to use it. To enable this, go to
**SQL Editor** and run:

```sql
-- Remember distinct values entered per form field for autocomplete suggestions
create table public.field_suggestions (
  id uuid primary key default gen_random_uuid(),
  field_key text not null,
  value text not null,
  last_used_at timestamptz not null default now(),
  unique (field_key, value)
);

alter table public.field_suggestions enable row level security;

create policy "field_suggestions_select" on public.field_suggestions
  for select to authenticated using (public.is_approved());

create policy "field_suggestions_upsert" on public.field_suggestions
  for insert to authenticated with check (public.is_approved());

create policy "field_suggestions_update" on public.field_suggestions
  for update to authenticated using (public.is_approved()) with check (public.is_approved());
```

> This table only stores short text values (e.g. `"24 VDC"`), so it stays
> tiny — a non-issue on the free plan's 500 MB database limit.

## 9. Restart the dev server

After saving `.env`, restart `npm run dev` so Vite picks up the new environment
variables.

## Done

The app now opens on a **Sign In / Create Account** page — register an
account (or sign in) to access Home, Tools, and the Certificate Repository.

Open the **Certificate Repository** tool from the Tools page:

- **Upload Certificate** — drag & drop or browse a PDF, optionally rename it, and upload.
  The signed-in user's name is recorded as the uploader.
- **Search & Download** — search by file name, download, or delete a certificate.
  Each file shows who uploaded it.

## Notes / future ideas

- Free plan limits: 1 GB total storage, 50 MB max file size per upload, 2 GB bandwidth/month.
- All uploaded PDFs are stored at the root of the `certificates` bucket using their file name.
- Deleting a certificate from the app permanently removes it from the bucket — there's no undo.
