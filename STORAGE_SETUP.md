# Supabase Storage Setup Guide

This guide explains how to set up Supabase Storage for the DevCanvas Blog application.

## Prerequisites

- Supabase project created
- Access to Supabase Dashboard
- `.env` file configured with Supabase credentials

## Storage Buckets

The application uses two storage buckets:

### 1. `avatars` Bucket
- **Purpose**: User profile pictures
- **Max File Size**: 500KB (0.5MB)
- **Allowed Types**: PNG, JPEG, JPG, GIF, WebP
- **Public**: Yes

### 2. `featured-images` Bucket
- **Purpose**: Blog post featured images
- **Max File Size**: 0.5MB
- **Allowed Types**: PNG, JPEG, JPG, GIF, WebP, SVG
- **Public**: Yes

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended)

1. **Navigate to Storage**
   - Go to your Supabase project dashboard
   - Click on "Storage" in the left sidebar

2. **Create Avatars Bucket**
   - Click "New bucket"
   - Name: `avatars`
   - Public: ✅ Enabled
   - File size limit: `512000` (500KB)
   - Allowed MIME types: `image/png,image/jpeg,image/jpg,image/gif,image/webp`
   - Click "Create bucket"

3. **Create Featured Images Bucket**
   - Click "New bucket"
   - Name: `featured-images`
   - Public: ✅ Enabled
   - File size limit: `512000` (0.5MB)
   - Allowed MIME types: `image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml`
   - Click "Create bucket"

4. **Set Up Storage Policies**
   - Click on the bucket name
   - Go to "Policies" tab
   - Add the policies from the SQL script below

### Option 2: Using SQL Editor

1. Go to "SQL Editor" in your Supabase dashboard
2. Create a new query
3. Copy and paste the following SQL:

\`\`\`sql
-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 512000, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']),
  ('featured-images', 'featured-images', true, 512000, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- AVATARS BUCKET POLICIES
-- ============================================

-- Allow anyone to view avatars (public read)
CREATE POLICY "Allow public to read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Allow users to upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatar
CREATE POLICY "Allow users to update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatar
CREATE POLICY "Allow users to delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- FEATURED IMAGES BUCKET POLICIES
-- ============================================

-- Allow anyone to view featured images (public read)
CREATE POLICY "Allow public to read featured images"
ON storage.objects FOR SELECT
USING (bucket_id = 'featured-images');

-- Allow authenticated users to upload featured images
CREATE POLICY "Allow authenticated users to upload featured images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'featured-images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own featured images
CREATE POLICY "Allow users to update their own featured images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'featured-images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own featured images
CREATE POLICY "Allow users to delete their own featured images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'featured-images' 
  AND auth.role() = 'authenticated'
);
\`\`\`

4. Click "Run" to execute the SQL

## Verification

After setup, verify the buckets are created:

1. Go to "Storage" in Supabase Dashboard
2. You should see:
   - ✅ `avatars` bucket (public)
   - ✅ `featured-images` bucket (public)

## Usage in Application

### File Upload Component

The `FileUpload` component is already configured to use these buckets:

\`\`\`tsx
// For avatars
<FileUpload
  bucket="avatars"
  path={userId}
  accept="image/*"
  maxSize={0.5}
/>

// For featured images
<FileUpload
  bucket="featured-images"
  accept="image/*"
  maxSize={0.5}
/>
\`\`\`

### File Organization

Files are organized as follows:

\`\`\`
avatars/
  └── {user_id}/
      └── {random_id}-{timestamp}.{ext}

featured-images/
  └── {random_id}-{timestamp}.{ext}
\`\`\`

## Security Notes

- ✅ Users can only upload/update/delete their own avatars
- ✅ All users can read public avatars and featured images
- ✅ File size limits are enforced at the bucket level
- ✅ MIME type restrictions prevent non-image uploads
- ✅ Authenticated users required for all uploads

## Troubleshooting

### Issue: "Bucket already exists" error
- **Solution**: The bucket already exists. You can skip bucket creation.

### Issue: Upload fails with permission error
- **Solution**: Check that storage policies are correctly set up.

### Issue: File too large error
- **Solution**: Ensure file is under the size limit (500KB for avatars, 0.5MB for featured images).

### Issue: Invalid file type error
- **Solution**: Only image files are allowed (PNG, JPEG, GIF, WebP).

## Related Files

- `src/components/ui/file-upload.tsx` - File upload component
- `src/features/profile/ProfilePage.tsx` - Profile page using file upload
- `src/lib/supabase.ts` - Supabase client configuration

## Next Steps

After setting up storage:

1. ✅ Test file upload in Profile Page
2. ✅ Add file upload to Create/Edit Post page for featured images
3. ✅ Implement image optimization (optional)
4. ✅ Add CDN integration (optional)
