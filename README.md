
# Mindful Oasis: Virtual Therapy Assistant

A complete, full-stack web application for a Virtual Therapy Assistant using React (frontend) with a beautiful UI/UX design that provides mental health support.

## Features

- **Beautiful UI/UX Design**: Calming color palette with smooth animations and responsive layout
- **User Authentication**: Secure signup/login functionality 
- **AI-Powered Chat**: Smart virtual assistant with sentiment analysis for personalized support
- **Mood Tracking**: Interactive mood logging with visual analytics and insights
- **Resource Library**: Curated articles, videos, and exercises for mental wellness
- **Dark/Light Mode**: Toggle between themes based on user preference

## Technologies Used

### Frontend
- React with TypeScript
- TailwindCSS + ShadcN UI for styling
- React Router for navigation
- React Query for data fetching
- Recharts for data visualization

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/mindful-oasis.git
cd mindful-oasis
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:8080`

## Project Structure

```
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── layout/         # Layout components (NavBar, Footer, etc.)
│   │   ├── ui/             # UI components from ShadcN
│   │   └── ThemeProvider.tsx  # Theme context provider
│   ├── pages/              # Application pages
│   │   ├── Index.tsx       # Landing page
│   │   ├── Login.tsx       # Authentication
│   │   ├── SignUp.tsx      # User registration
│   │   ├── Chat.tsx        # AI assistant interface
│   │   ├── MoodTracker.tsx # Mood tracking and analytics
│   │   └── Resources.tsx   # Resource library
│   ├── App.tsx             # Main application component with routes
│   └── main.tsx            # Application entry point
```

## Future Enhancements

- Backend integration with Node.js + Express
- MongoDB database for user data
- JWT-based authentication
- Appointment booking system with calendar
- Advanced analytics dashboard
- Admin panel for content management
- Voice-to-text and text-to-speech for accessibility

## Design Approach

The application was built with a design-thinking approach focusing on:

- **Empathy for Users**: Understanding the needs of people seeking mental health support
- **Calming Aesthetics**: Using colors and spacing that create a sense of tranquility
- **Intuitive Interactions**: Creating simple, predictable user flows
- **Accessibility**: Ensuring the application is usable by people with different abilities
- **Responsiveness**: Providing a consistent experience across all device sizes

## License

This project is licensed under the MIT License - see the LICENSE file for details.
