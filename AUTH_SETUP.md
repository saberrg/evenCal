# Supabase OTP Authentication Setup

This project now uses Supabase for passwordless authentication with One-Time Password (OTP) verification.

## Features Implemented

### 1. OTP Authentication Flow
- **Sign Up**: Users can create an account by entering their name, email, and date of birth
- **Sign In**: Users can sign in with just their email address
- **OTP Verification**: 6-digit codes are sent to the user's email for verification
- **Automatic User Creation**: New users are automatically created when they first sign in

### 2. User Interface
- Clean, modern authentication forms
- Loading states and error handling
- Toast notifications for user feedback
- Responsive design for mobile and desktop

### 3. Authentication Context
- Global authentication state management
- Automatic session persistence
- Real-time auth state updates

### 4. Navigation Updates
- Dynamic header based on authentication status
- Sign out functionality
- User welcome message

## Setup Requirements

### Environment Variables
Make sure you have the following environment variables set in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Configuration
1. **Email Templates**: Configure your email templates in the Supabase dashboard
   - Go to Authentication > Email Templates
   - Modify the "Magic Link" template to include `{{ .Token }}` for OTP codes
   - Example template:
   ```
   <h2>One time login code</h2>
   <p>Please enter this code: {{ .Token }}</p>
   ```

2. **Site URL**: Set your site URL in the Supabase dashboard
   - Go to Authentication > URL Configuration
   - Set the Site URL to your application URL

## How It Works

### Sign Up Process
1. User fills out the sign-up form (name, email, date of birth)
2. OTP is sent to the user's email
3. User enters the 6-digit code
4. Account is created and user is signed in

### Sign In Process
1. User enters their email address
2. OTP is sent to the user's email
3. User enters the 6-digit code
4. User is signed in

### Security Features
- OTP codes expire after 1 hour
- Rate limiting prevents abuse
- Secure session management
- Automatic sign-out on session expiry

## Components

### `app/account/page.tsx`
Main authentication page with forms for sign up, sign in, and OTP verification.

### `app/context/AuthContext.tsx`
Authentication context provider that manages user state and session.

### `app/cutom-components/Header.tsx`
Updated header component that shows different navigation based on auth status.

### `lib/supabase.ts`
Supabase client configuration.

## Usage

### Using the Auth Context
```tsx
import { useAuth } from '@/app/context/AuthContext'

function MyComponent() {
  const { user, loading, signOut } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return user ? (
    <div>Welcome, {user.email}</div>
  ) : (
    <div>Please sign in</div>
  )
}
```

### Protected Routes
You can create protected routes by checking the user's authentication status:

```tsx
'use client'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/account')
    }
  }, [user, loading, router])

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return <div>Protected content here</div>
}
```

## Dependencies Added
- `@supabase/supabase-js`: Supabase client library
- `sonner`: Toast notifications (via shadcn/ui)

## Next Steps
1. Set up your Supabase project and add environment variables
2. Configure email templates in the Supabase dashboard
3. Test the authentication flow
4. Add any additional user profile fields as needed
5. Implement protected routes for your application 