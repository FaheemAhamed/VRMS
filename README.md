# Vehicle Rental Management System

A full-stack web application designed to seamlessly connect vehicle owners with customers looking to rent vehicles. Vehicle owners can list their vehicles, manage bookings, and view earnings, while customers can browse available vehicles, make booking requests, and leave reviews. 

The application utilizes a modern tech stack to provide an intuitive user experience with a responsive design, along with a secure and robust backend system.

---

## 🚀 Features

### Customer
- **Discover Vehicles**: Search for vehicles by name or type with real-time filtering.
- **Book Vehicles**: Request to book a vehicle for a specified date range. Conflict prevention ensures a vehicle cannot be double-booked.
- **Manage Rentals**: View current, pending, and past rentals from the dashboard. Ability to cancel pending or approved bookings.
- **Review System**: Rate and review vehicles after a rental is completed.

### Vehicle Owner
- **Manage Fleet**: Add, edit, or remove vehicles from their fleet. Includes setting daily rental prices and locations.
- **Manage Bookings**: View incoming booking requests, and choose to accept or reject them. 
- **Start/Complete Rentals**: Change booking statuses to 'Active' when the rental starts and 'Completed' when the vehicle is returned.
- **Notifications**: Receive instant in-app notifications whenever a customer cancels an eligible booking.

---

## 🛠 Technology Stack Details

### Frontend
* **React (v19.2.x)**: UI Library.
* **Vite (v8.3.x)**: Fast frontend build tool.
* **Tailwind CSS (v4.3.x)**: Utility-first CSS framework for rapid styling.
* **React Router DOM (v7.18.x)**: Client-side routing.
* **Axios (v1.20.x)**: HTTP client for API requests.
* **Lucide React**: Beautiful scalable vector icons.

### Backend
* **Node.js**: Runtime environment.
* **Express.js (v5.2.x)**: Web application framework for building RESTful APIs.
* **MongoDB & Mongoose (v9.11.x)**: NoSQL database and Object Data Modeling (ODM).
* **JWT (jsonwebtoken v9.0.x)**: Secure authentication and route protection.
* **Bcryptjs (v3.0.x)**: Password hashing.

---

## ⚙️ Environment Requirements

To run this project, you will need the following installed on your machine:
* **Node.js** (v18 or higher recommended)
* **npm** (comes with Node.js)
* **MongoDB** (Local instance or MongoDB Atlas cluster)

---

## 📦 Step-by-Step Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd VEHICAL-RENTAL-MANAGEMENT-SYSTEM
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory (see [Database Setup & .env](#-database-setup--env-variables) below).
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server should now be running on `http://localhost:5000`.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application should now be accessible at the localhost URL provided by Vite (e.g., `http://localhost:5173`).*

---

## 🗄 Database Setup & .env Variables

### MongoDB Setup
You can use a local MongoDB instance or a cloud-based cluster like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- **Local**: Your connection string will look like `mongodb://localhost:27017/vehicle-rental`.
- **Atlas**: Create a cluster, set up a database user, allow network access, and retrieve your connection string.

### Backend `.env` File
Create a `.env` file in the root of the `backend` folder and add the following variables:

```env
# The port the backend server will run on
PORT=5000

# Your MongoDB Connection String
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/vehicle-rental?retryWrites=true&w=majority

# A strong secret key used for signing JSON Web Tokens
JWT_SECRET=your_super_secret_jwt_key_here
```

---

## 📖 API Documentation

The backend provides a RESTful API. All protected routes require a valid JWT token sent in the `Authorization` header as a Bearer token.

### Authentication (`/api/auth`)
* `POST /register`: Register a new user (Customer or Owner).
* `POST /login`: Authenticate user and receive token.
* `GET /me`: Get current logged-in user profile (Protected).

### Vehicles (`/api/vehicles`)
* `GET /`: Get all listed vehicles (Supports query filters like `startDate`, `endDate`, `query`, `type`).
* `GET /:id`: Get single vehicle details.
* `POST /`: Create a new vehicle listing (Protected, Owner only).
* `PATCH /:id`: Update a vehicle (Protected, Owner only).
* `DELETE /:id`: Delete a vehicle (Protected, Owner only).

### Bookings (`/api/bookings`)
* `POST /`: Create a new booking request (Protected, Customer only).
* `GET /my-rentals`: Get rentals for the logged-in customer (Protected, Customer only).
* `GET /manage`: Get bookings for vehicles owned by the logged-in owner (Protected, Owner only).
* `PATCH /:id/status`: Update booking status (e.g., Approved, Rejected, Cancelled, Active, Completed) (Protected).

### Reviews (`/api/reviews`)
* `GET /:vehicleId`: Get all reviews for a specific vehicle.
* `POST /`: Submit a new review for a completed booking (Protected, Customer only).
* `PUT /:id`: Update an existing review (Protected, Customer only).

### Notifications (`/api/notifications`)
* `GET /`: Retrieve all notifications for the logged-in user (Protected).
* `PATCH /:id/read`: Mark a specific notification as read (Protected).

---

## 🔑 Sample Credentials

There is no automated seed script included, but you can easily create dummy accounts through the frontend Register page. 

**To test the full flow:**
1. Go to the Sign Up page and register an account with the role **Owner**.
2. Add a few vehicles to your fleet.
3. Open an Incognito window or use a different browser, and register a new account with the role **Customer**.
4. Browse the available vehicles and book one.
5. Log back in as the Owner to accept/reject the booking!

---

## 🧠 Assumptions Made During Development

1. **Image Handling**: The system assumes vehicle images are provided as direct public URLs (strings) rather than uploaded binary files. A cloud storage service (like AWS S3 or Cloudinary) or direct links should be used.
2. **Payment Gateway**: Payments are assumed to be handled outside the application or in-person. The system tracks the *Total Cost* based on the daily rental price and date range, but does not process transactions.
3. **Roles**: Users are strictly divided into either 'Customer' or 'Owner' upon registration. 
4. **Timezones**: Dates for bookings are stored in standard UTC formats, with the assumption that the front-end localized time handles day transitions properly without edge cases.
