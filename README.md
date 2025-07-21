# React TypeScript Chatbot Application

A modern, responsive chatbot application built with React, TypeScript, and Tailwind CSS.

## Features

- Clean, modern UI with Tailwind CSS
- Bot icon in header using Lucide React icons
- Scrollable message display area
- Session persistence using UUID v4 stored in localStorage
- Webhook integration with message and sessionId query parameters
- Loading states and error handling
- Responsive design

## Technical Stack

- **React** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **UUID v4** for session management

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Update the webhook URL:
   - Open `src/App.tsx`
   - Replace `'YOUR_WEBHOOK_URL_HERE'` on line 67 with your actual webhook URL

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Configuration

The application sends GET requests to your webhook with the following query parameters:
- `message`: The user's message
- `sessionId`: A persistent UUID v4 session identifier

## Session Management

- Sessions are automatically created and stored in localStorage
- Each user gets a unique session ID that persists across browser sessions
- Session IDs are generated using UUID v4

## Error Handling

The application includes comprehensive error handling:
- Network errors are displayed to the user
- Loading states prevent multiple simultaneous requests
- Errors can be dismissed by clicking the × button

## Responsive Design

The interface is fully responsive and works well on:
- Desktop computers
- Tablets
- Mobile devices

## Note

**Important:** Replace `YOUR_WEBHOOK_URL_HERE` in `src/App.tsx` line 67 with your actual webhook URL before using the application.

The application expects your webhook to return plain text responses. If your webhook returns JSON, you may need to modify the response handling in the `sendMessage` function.

## Node.js Compatibility

This project uses Vite 7.x which requires Node.js ^20.19.0 || >=22.12.0. If you're using an older version of Node.js, consider upgrading or using a Node version manager like nvm.
