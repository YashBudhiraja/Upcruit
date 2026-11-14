# Upcruit 🚀
### Swipe. Match. Connect. Get Hired.

Upcruit is a modern, swipe-based recruitment platform that reimagines the traditional hiring process. It connects job seekers and recruiters through an interactive matching experience, making job discovery and candidate recruitment simpler and more engaging.

Instead of endless applications and manual screening, Upcruit allows candidates and recruiters to discover each other, express interest, and connect when there's a mutual match.

---

## ✨ Key Features

### 👤 Authentication & Profiles
- Secure user authentication using Supabase.
- Separate registration flows for candidates and recruiters.
- Dedicated candidate and recruiter profiles.
- Edit and update profile information.

### 💼 Job Management
- Recruiters can create and publish job listings.
- Manage existing job postings.
- Close, reopen, and delete job listings.
- Candidates can browse available opportunities.

### 🔥 Swipe-Based Discovery
- Candidates can discover and express interest in jobs.
- Recruiters can discover potential candidates.
- Interested and Pass actions.
- Interactive swipe experience on mobile.
- Button-based interaction on desktop.

### 🤝 Mutual Matching
- Matches are generated when both sides express interest.
- Candidates and recruiters can view their mutual matches.

### 💬 Real-Time Messaging
- Text-based messaging between matched users.
- Conversations are accessible only after a mutual match.
- Real-time message updates using Supabase Realtime.

### 🔔 Real-Time Notifications
- Notifications for new interests.
- Notifications when a mutual match is created.
- Notifications for incoming messages.
- Unread notification count and mark-as-read functionality.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack React framework |
| React | User interface |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Motion | UI animations |
| Supabase | Backend infrastructure |
| PostgreSQL | Database |
| Supabase Auth | Authentication |
| Supabase Realtime | Real-time messaging and notifications |
| Git & GitHub | Version control |

---

## 🏗️ Application Workflow

```text
              UPCRUIT
                 |
       ---------------------
       |                   |
    Candidate           Recruiter
       |                   |
   Create Profile      Create Profile
       |                   |
   Discover Jobs      Discover Candidates
       |                   |
   Express Interest   Express Interest
       |                   |
       ------ Matching -----
                 |
           Mutual Match
                 |
          Start Messaging
                 |
        Real-Time Notifications
```

---

## ⚙️ Getting Started

Follow these steps to run Upcruit locally.

### 1. Clone the Repository

```bash
git clone https://github.com/YashBudhiraja/Upcruit.git
```

### 2. Navigate to the Project

```bash
cd Upcruit
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory.

Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

Get these values from your Supabase project settings.

**Important:** Never commit your `.env.local` file or expose secret service-role keys in client-side code.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Backend & Database

Upcruit uses Supabase for backend infrastructure.

The database includes tables for:

- `profiles` – User accounts and roles.
- `candidate_profiles` – Candidate information.
- `recruiter_profiles` – Recruiter and company information.
- `jobs` – Job listings.
- `interests` – Candidate interest in jobs.
- `candidate_interests` – Recruiter interest in candidates.
- `matches` – Mutual matches.
- `messages` – Chat messages.
- `notifications` – User notifications.

Row Level Security (RLS) is enabled on the public database tables to control data access.

---

## 📱 Responsive Experience

Upcruit is designed for both desktop and mobile devices.

- **Mobile:** Swipe-based discovery experience.
- **Desktop:** Interested and Pass buttons for easy interaction.
- Responsive dashboards and profile interfaces.
- Real-time messaging and notifications.

---

## 🎯 Project Objective

The objective of Upcruit is to make recruitment more interactive and efficient by introducing a mutual-interest-based discovery system.

The platform aims to reduce friction between job seekers and recruiters while providing a more engaging alternative to traditional job portals.

---

## 🚀 Future Scope

Potential improvements include:

- Resume parsing and skill extraction.
- AI-powered candidate-job recommendations.
- Advanced search and filtering.
- Interview scheduling.
- Analytics for recruiters.
- Email and push notifications.

---

## 👨‍💻 Developer

**Yash Budhiraja**

BCA Student | Full-Stack Developer | AI/ML Enthusiast

- GitHub: [@YashBudhiraja](https://github.com/YashBudhiraja)

---

## 📄 License

This project is developed as a portfolio and hackathon project.

All rights reserved unless otherwise specified.
