# Chambalin

**A simple way to find help for small jobs.**

Chambalin is a web platform designed to connect people who need help with specific tasks with people who offer occasional services. It focuses on small jobs, everyday services, and volunteer opportunities in one simple and organized place.

## Project Goals

- Make it easier to find people who can help with specific tasks.
- Allow users to publish jobs and offer their services.
- Organize opportunities by category and location.
- Encourage clear agreements, responsible communication, and trust between users.
- Create opportunities for people to earn money, develop skills, and participate in their communities.

## Planned Features

The MVP (Minimum Viable Product) will focus on the essential features needed to make Chambalin work.

- **Job Listings:** Create, edit, and close job posts.
- **Search and Filters:** Find jobs by category, location, and other relevant criteria.
- **User Accounts:** Register, log in, and manage a basic profile.
- **Applications:** Apply for jobs and review interested users.
- **Responsive Design:** Use the platform on desktop computers, tablets, and mobile devices.
- **Safety and Reporting:** Validate user input, manage access permissions, and provide a way to report problematic listings.

These features will be implemented progressively as the project develops.

## Tech Stack

- **Next.js** — Web application framework.
- **React** — User interface.
- **JavaScript&#x20;**— JavaScript development.
- **Supabase** — Planned database, authentication, and data management.
- **Git** — Version control.
- **Vercel** — Planned deployment platform.

## Getting Started

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```bash
   cd <project-folder>
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

When Supabase integration is added, create a `.env.local` file in the project root and configure the required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the placeholder values with your Supabase project credentials. Never expose your Supabase service role key or other secret credentials in client-side code or public repositories.

## Safety and Privacy

Chambalin aims to promote responsible interactions between users. The project will consider data protection, appropriate access permissions, clear community rules, and reporting mechanisms.

Ratings, profiles, and verification features can help users make informed decisions, but they cannot guarantee that every person or service is trustworthy. Users should protect their personal information and follow applicable rules and safety recommendations.

## Future Development

Possible future improvements include:

- User ratings and reviews.
- Additional profile and verification features.
- Notifications and messaging.
- More categories and location-based options.
- Partnerships with local businesses and community organizations.
- Sustainable revenue models, such as service commissions and optional subscriptions.

These improvements will be evaluated based on user feedback, project priorities, and available resources.

## Project Status

**In development.**

Chambalin is currently focused on building its MVP, starting with the core user experience and gradually adding database integration, authentication, job management, and security features.