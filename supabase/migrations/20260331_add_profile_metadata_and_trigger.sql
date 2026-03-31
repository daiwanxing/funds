-- 1. Add fields to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS nickname TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Create the trigger function to populate user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, nickname, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    -- Try to get nickname/name from metadata, or fallback to User_XXXX
    COALESCE(
      NEW.raw_user_meta_data->>'nickname', 
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      NEW.raw_user_meta_data->>'user_name',
      'User_' || upper(substr(md5(random()::text), 1, 4))
    ),
    -- Try to get avatar_url from metadata, fallback to UI-Avatars with #1D4ED8 background
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url', 
      NEW.raw_user_meta_data->>'picture',
      'https://ui-avatars.com/api/?name=' || left(COALESCE(NEW.raw_user_meta_data->>'nickname', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'user_name', 'U'), 1) || '&background=1D4ED8&color=fff'
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    nickname = EXCLUDED.nickname,
    avatar_url = EXCLUDED.avatar_url;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Backfill existing user_profiles
-- We update existing profiles by extracting data from auth.users (if any), otherwise generating defaults
UPDATE public.user_profiles up
SET 
  nickname = COALESCE(
    up.nickname,
    au.raw_user_meta_data->>'nickname', 
    au.raw_user_meta_data->>'full_name', 
    au.raw_user_meta_data->>'name', 
    au.raw_user_meta_data->>'user_name',
    'User_' || upper(substr(md5(up.id::text), 1, 4))
  ),
  avatar_url = COALESCE(
    up.avatar_url,
    au.raw_user_meta_data->>'avatar_url', 
    au.raw_user_meta_data->>'picture',
    'https://ui-avatars.com/api/?name=' || left(COALESCE(au.raw_user_meta_data->>'nickname', au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', au.raw_user_meta_data->>'user_name', 'U'), 1) || '&background=1D4ED8&color=fff'
  )
FROM auth.users au
WHERE up.id = au.id;

-- 5. Insert any missing user_profiles
INSERT INTO public.user_profiles (id, email, nickname, avatar_url)
SELECT 
  id, 
  email,
  COALESCE(
    raw_user_meta_data->>'nickname', 
    raw_user_meta_data->>'full_name', 
    raw_user_meta_data->>'name', 
    raw_user_meta_data->>'user_name',
    'User_' || upper(substr(md5(id::text), 1, 4))
  ),
  COALESCE(
    raw_user_meta_data->>'avatar_url', 
    raw_user_meta_data->>'picture',
    'https://ui-avatars.com/api/?name=' || left(COALESCE(raw_user_meta_data->>'nickname', raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', raw_user_meta_data->>'user_name', 'U'), 1) || '&background=1D4ED8&color=fff'
  )
FROM auth.users
ON CONFLICT (id) DO NOTHING;
