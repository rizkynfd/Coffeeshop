-- ============================================================
-- KopiKasir POS — Supabase Storage Setup
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Create a new storage bucket called 'products'
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- 2. Allow public access to read all product images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'products' );

-- 3. Allow authenticated users (cashier, supervisor, owner) to upload images
create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check (
    bucket_id = 'products' 
    and auth.role() = 'authenticated'
  );

-- 4. Allow authenticated users to update their uploaded images
create policy "Authenticated users can update images"
  on storage.objects for update
  using (
    bucket_id = 'products' 
    and auth.role() = 'authenticated'
  );

-- 5. Allow authenticated users to delete images
create policy "Authenticated users can delete images"
  on storage.objects for delete
  using (
    bucket_id = 'products' 
    and auth.role() = 'authenticated'
  );
