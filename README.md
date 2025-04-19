# Ice Cream Machine Temperature Tracker

This application helps track and monitor temperatures for ice cream machines. It supports 7 machines, each with 2 hoppers (A and B).

## Features

- Record temperatures for any machine and hopper
- Search temperature records by:
  - Machine ID (1-7)
  - Hopper (A or B)
  - Date range
- View all temperature records in a table format

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```

## Running the Application

1. Start MongoDB (make sure it's running on the default port 27017)
2. Start the backend server:
   ```bash
   npm run dev
   ```
3. In a new terminal, start the frontend:
   ```bash
   cd client
   npm start
   ```

The application will be available at http://localhost:3000

## Usage

1. To record a new temperature:
   - Select the machine ID (1-7)
   - Choose the hopper (A or B)
   - Enter the temperature in Fahrenheit (°F)
   - Click Submit

2. To search for temperature records:
   - Use the search filters to specify:
     - Machine ID
     - Hopper
     - Date range
   - Results will automatically update as you change the filters

## API Endpoints

- POST /api/temperatures - Record a new temperature
- GET /api/temperatures - Retrieve temperature records with optional filters 