# ecommerce-backend

This is the backend server for the E-Commerce Web Application built for CENG495 Cloud Computing Assignment 1 at METU.

## Technologies Used

- **Node.js** (Express)
- **MongoDB Atlas** (NoSQL Database)
- **Render** (Backend hosting)
- **SHA256** for password hashing
- **CORS**, **Body-Parser**

## Backend Deployment

Live API URL: [https://ecommerce-backend-x6ce.onrender.com](https://ecommerce-backend-x6ce.onrender.com)

---
## Project Structure

- `server.js`: Entry point for Express server
- `routes.js`: Contains all API endpoints for items, users, login, rating
- `connect.js`: Handles MongoDB connection
- `.env`: Stores MongoDB Atlas URI
---

## API Endpoints

### Authentication
- `POST /api/login` – Logs in a user (admin or regular)

### Users
- `POST /api/users` – Admin creates a new user
- `GET /api/users` – View all users
- `DELETE /api/users/:id` – Delete a user

### Items
- `POST /api/items` – Admin creates a new item
- `GET /api/items` – Get all items
- `DELETE /api/items/:id` – Delete an item

### Ratings / Reviews
- `POST /api/rate` – Authenticated user rates/reviews an item

---

## Database: MongoDB Atlas

### Collections Used
- `items`: stores item information, ratings, reviews
- `users`: stores usernames, SHA256 hashed passwords, and role (admin/user)

---

## Authentication

- All users must log in
- Admin and regular users are differentiated by the `role` field in DB
- Passwords are hashed using `crypto` + `sha256`
- Client stores login info in `localStorage`

---


