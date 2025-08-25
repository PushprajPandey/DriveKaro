# Rentyor - Car Rental System

Rentyor a modern, full-featured car rental system built with the MERN stack (MongoDB, Express.js, React.js, Node.js). This application provides a seamless experience for users to browse, search, and book rental cars.

## Features

-   **Modern UI**: Clean, responsive interface built with React and Bootstrap
-   **Authentication System**: User registration, email verification, and login functionality
-   **Car Browsing**: Browse available cars with filtering options
-   **Booking System**: Make bookings with date and time selection
-   **User Dashboard**: View and manage bookings
-   **User Profile**: Update personal information and profile picture
-   **Admin Panel**: Manage cars, users, and bookings (for administrators)
-   **Payment Integration**: Secure payment processing

## Technologies Used

### Frontend

-   React.js
-   Redux Toolkit for state management
-   React Router for navigation
-   React Bootstrap for UI components
-   SASS for styling
-   Axios for API requests
-   Day.js for date handling
-   React Spinners for loading animations

### Backend

-   Node.js
-   Express.js
-   MongoDB for database
-   JWT for authentication
-   Nodemailer for sending emails
-   Multer for file uploads
-   Mongoose for MongoDB object modeling

## Project Structure

The project is organized into two main directories:

-   **`/client`**: Contains the React frontend application
-   **`/server`**: Contains the Node.js/Express backend application

### Client Structure

```
client/
├── public/              # Public assets and HTML template
├── src/                 # Source code
│   ├── api/             # API utility functions and endpoints
│   ├── assets/          # Static assets (images, icons, etc.)
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── layout/          # Layout components
│   ├── pages/           # Page components
│   │   ├── auth/        # Authentication pages
│   │   └── misc/        # Miscellaneous pages
│   ├── sass/            # SASS style files
│   ├── store/           # Redux store configuration
│   ├── App.jsx          # Main App component
│   ├── App.sass         # App-level styles
│   ├── Routes.jsx       # Application routes
│   └── index.js         # Entry point
└── package.json         # Dependencies and scripts
```

### Backend Structure

```
server/
├── config/              # Configuration files
├── controllers/         # Request handlers
├── middleware/          # Custom middleware
├── models/              # Database models
├── routes/              # API routes
├── utils/               # Utility functions
└── server.js            # Entry point
```

## Getting Started

### Prerequisites

-   Node.js (v14.0.0 or later)
-   npm or yarn
-   MongoDB (local or Atlas)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/PushprajPandey/Rentyor.git
    cd Rentyor
    ```

2. Install backend dependencies:

    ```bash
    cd server
    npm install
    ```

3. Install frontend dependencies:

    ```bash
    cd ../client
    npm install
    ```

4. Create a `.env` file in the server directory with the following variables:

    ```
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    EMAIL_USERNAME=your_email_username
    EMAIL_PASSWORD=your_email_password
    CLIENT_URL=http://localhost:3000
    ```

5. Create a `.env` file in the client directory:
    ```
    REACT_APP_API_URL=http://localhost:5000/api
    ```

### Running the Application

1. Start the backend server:

    ```bash
    cd server
    npm run dev
    ```

2. Start the frontend development server:

    ```bash
    cd ../client
    npm start
    ```

3. Access the application at `http://localhost:3000`

## UI Improvements

The application features a modern and visually appealing UI with:

-   Clean, consistent color palette
-   Responsive design that works on mobile and desktop
-   Intuitive navigation and user flows
-   Animated components for better user experience
-   Form validation with clear error messaging
-   Loading states and spinners for asynchronous operations

## Authentication Flow

1. **Registration**: Users can register with their name and email
2. **Email Verification**: A verification link is sent to the user's email
3. **Set Password**: After verification, users can set their password
4. **Login**: Users can log in with their email and password
5. **Password Reset**: Users can request a password reset if forgotten

## Deployment

### Frontend Deployment

The React frontend can be deployed to services like Vercel, Netlify, or AWS Amplify.

```bash
cd client
npm run build
```

### Backend Deployment

The Node.js backend can be deployed to services like Heroku, AWS Elastic Beanstalk, or DigitalOcean.

### Option 1: Deploy to Render

1. **Create two services on Render:**

    - Web Service for the backend (server)
    - Static Site for the frontend (client)

2. **For the backend service:**

    - Use the repository URL
    - Build Command: `cd server && npm install`
    - Start Command: `cd server && npm start`
    - Add all environment variables from `.env`

3. **For the frontend service:**
    - Use the repository URL
    - Build Command: `cd client && npm install && npm run build`
    - Publish directory: `client/build`
    - Add Environment Variable: `REACT_APP_SERVER_BASE_URL=https://your-backend-url.render.com/`

### Option 2: Deploy to Heroku

1. **Create a Heroku app:**

    ```bash
    heroku create Rentyor-app
    ```

2. **Add environment variables:**

    ```bash
    heroku config:set NODE_ENV=production
    # Add all other environment variables from .env
    ```

3. **Deploy the application:**
    ```bash
    git push heroku main
    ```

### Option 3: Manual Deployment

1. **Build the client:**

    ```bash
    cd client
    npm install
    npm run build
    ```

2. **Set up the server:**

    ```bash
    cd server
    npm install
    ```

3. **Start the server in production mode:**
    ```bash
    NODE_ENV=production npm start
    ```

## Environment Variables

### Server (.env)

```
ACCESS_TOKEN=<your_jwt_access_token_secret>
CLIENT_URL=<your_frontend_url>
MAIL_EMAIL=<your_email_for_sending_notifications>
MAIL_PASS=<your_email_password_or_app_password>
MONGODB_URL=<your_mongodb_connection_string>
PASSWORD_SALT=10
PORT=7000
REFRESH_TOKEN=<your_jwt_refresh_token_secret>
STRIPE_KEY=<your_stripe_api_key>
VERIFICATION_TOKEN=<your_jwt_verification_token_secret>
VERIFICATION_URL=/authenticate/verifyEmail
PAYMENT_CONF_URL=/payments
```

### Client (.env.production)

```
REACT_APP_SERVER_BASE_URL=<your_backend_url>
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
