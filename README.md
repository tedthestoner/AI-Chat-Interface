# AI Chat Interface with Supabase Authentication

A modern, full-featured AI chat application built with Next.js, Supabase for authentication, and Google Gemini AI for intelligent conversations.

## Features

- 🔐 **Secure Authentication**: User signup/login with Supabase
- 💬 **AI-Powered Chat**: Intelligent conversations using Google Gemini AI
- 📊 **User Dashboard**: Personal dashboard with conversation statistics
- 💾 **Conversation History**: Store and retrieve past conversations (Supabase integration ready)
- 📥 **Download Conversations**: Export chat history as text files
- 🎨 **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- 🌓 **Theme Support**: Built-in support for light/dark themes

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Supabase account and project
- A Google Cloud account with Gemini API access

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-chat-interface
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   The `.env.local` file should contain:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://bfovmkmjerccvoynunnx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmb3Zta21qZXJjY3ZveW51bm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3OTA3MDcsImV4cCI6MjA3NTM2NjcwN30.HPzBGRTsvqXyMppEC4eCN4g0Nq29ZMc16Rj3ZGDhMa8
   
   # Google AI API Key
   GOOGLE_API_KEY=AIzaSyBfDZ7AJfdDuvq8VDTQD_C_IP91M87EII0
   ```

4. **Set up Supabase Database (Optional - for conversation history)**
   
   If you want to enable conversation history storage:
   
   a. Go to your Supabase project dashboard
   b. Navigate to the SQL Editor
   c. Run the SQL commands from `supabase/schema.sql` to create the necessary tables

## Running the Application

1. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

2. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ai-chat-interface/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts        # Google Gemini AI integration
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   └── signup/
│   │       └── page.tsx        # Signup page
│   ├── chat/
│   │   └── page.tsx            # Main chat interface
│   ├── dashboard/
│   │   └── page.tsx            # User dashboard
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page (redirects)
├── components/                  # Reusable UI components
├── lib/
│   └── supabase/
│       ├── client.ts           # Supabase client configuration
│       └── server.ts           # Supabase server configuration
├── middleware.ts               # Authentication middleware
└── supabase/
    └── schema.sql              # Database schema for conversations
```

## Usage Guide

### 1. Sign Up / Login
- Navigate to the application
- Create a new account or login with existing credentials
- Email verification may be required based on your Supabase settings

### 2. Dashboard
- View your conversation statistics
- Access recent conversations (when database integration is enabled)
- Start a new chat session

### 3. Chat Interface
- Type your message in the input field
- Press Enter to send (Shift+Enter for new line)
- Use the suggested prompts for quick starts
- Copy AI responses to clipboard
- Download entire conversation as a text file

## API Integration

### Google Gemini AI
The application uses Google's Gemini AI for generating responses. The API key is configured in the environment variables.

### Supabase Authentication
- Handles user registration and login
- Provides secure session management
- Supports email/password authentication

## Security Features

- **Row Level Security (RLS)**: Database queries are secured at the row level
- **Authentication Middleware**: Protected routes require valid authentication
- **Environment Variables**: Sensitive keys are stored securely
- **HTTPS Support**: Ready for production deployment with HTTPS

## Customization

### Changing AI Model
To change the AI model, edit `/app/api/chat/route.ts`:
```typescript
const model = genAI.getGenerativeModel({ model: "gemini-pro" })
```

### UI Theming
The application uses Tailwind CSS for styling. Customize the theme in:
- `tailwind.config.js`
- `app/globals.css`

## Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Docker containers

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**
   - Run `npm install` to ensure all dependencies are installed
   - Delete `node_modules` and reinstall if needed

2. **Authentication not working**
   - Verify your Supabase URL and Anon Key are correct
   - Check that the `.env.local` file exists and is properly formatted

3. **AI responses not working**
   - Verify your Google API key is valid
   - Check API quotas in Google Cloud Console

4. **Database operations failing**
   - Ensure the database schema is properly set up
   - Check RLS policies in Supabase dashboard

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue in the repository.

---

Built with ❤️ using Next.js, Supabase, and Google Gemini AI
