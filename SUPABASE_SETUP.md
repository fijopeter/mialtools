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

## 5. Restart the dev server

After saving `.env`, restart `npm run dev` so Vite picks up the new environment
variables.

## Done

Open the **Certificate Repository** tool from the Tools page:

- **Upload Certificate** — drag & drop or browse a PDF, optionally rename it, and upload.
- **Search & Download** — search by file name, download, or delete a certificate.

## Notes / future ideas

- Free plan limits: 1 GB total storage, 50 MB max file size per upload, 2 GB bandwidth/month.
- All uploaded PDFs are stored at the root of the `certificates` bucket using their file name.
- Deleting a certificate from the app permanently removes it from the bucket — there's no undo.
