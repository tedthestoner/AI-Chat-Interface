# Deployment Guide

## Quick Deploy to Vercel

### Prerequisites
1. Supabase account and project
2. Google Cloud account with Gemini API access
3. GitHub account
4. Vercel account

### Step 1: Set Up Supabase

1. Go to https://supabase.com/dashboard
2. Create a new project or select existing one
3. Go to **Settings → API**
4. Copy:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
5. Go to **SQL Editor**
6. Run the SQL from `supabase/schema.sql` to create tables

### Step 2: Get Google Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Select your Google Cloud project
4. Copy the API key (GOOGLE_API_KEY)

### Step 3: Deploy to Vercel

1. **Push code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to Vercel Dashboard**: https://vercel.com/dashboard

3. **Import Project**:
   - Click "Add New" → "Project"
   - Select your GitHub repository: `tedthestoner/AI-Chat-Interface`
   - Click "Import"

4. **Configure Environment Variables**:
   
   In the "Configure Project" section, add these environment variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   GOOGLE_API_KEY=your-google-api-key
   ```

   ⚠️ **Important**: Make sure to paste the actual values, not placeholders!

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Your app will be live! 🎉

### Step 4: Post-Deployment

1. **Set up authentication redirect URLs** in Supabase:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel deployment URL to "Site URL"
   - Add `https://your-app.vercel.app/**` to "Redirect URLs"

2. **Test the deployment**:
   - Visit your deployment URL
   - Try signing up/logging in
   - Send a chat message
   - Check if conversations are saved

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` |
| `GOOGLE_API_KEY` | Google Gemini API key | `AIzaSy...` |

## Troubleshooting

### Build Errors

**Error: Missing environment variables**
- Solution: Add all environment variables in Vercel dashboard
- Make sure no variables are empty or have placeholder values

**Error: Supabase connection failed**
- Solution: Verify your Supabase URL and key are correct
- Check if your Supabase project is active

**Error: Google API not working**
- Solution: Enable "Generative Language API" in Google Cloud Console
- Verify API key has proper permissions

### Runtime Errors

**Auth not working**
- Check Supabase redirect URLs are configured
- Verify environment variables are deployed

**Chat not responding**
- Check Google API key is valid
- Verify API quotas in Google Cloud Console

**Conversations not saving**
- Run the SQL schema in Supabase
- Check RLS policies are enabled

## Re-deploying After Changes

1. **Make changes locally**
2. **Test locally**: `npm run dev`
3. **Commit changes**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
4. **Vercel auto-deploys** from GitHub!

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase redirect URLs with new domain

---

**Need help?** Open an issue on GitHub!
