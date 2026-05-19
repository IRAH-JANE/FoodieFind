\# FoodieFind



FoodieFind is a full-stack food discovery web app that helps users find real nearby food places, save favorites, write reviews, and manage imported restaurant data.



The app uses the user's browser location to discover nearby restaurants through Geoapify/OpenStreetMap, then allows users to save those places into FoodieFind for reviews, ratings, favorites, and admin cleanup.



\## Features



\- User registration and login

\- JWT authentication

\- Browser location detection

\- Real nearby food place search

\- Geoapify/OpenStreetMap restaurant discovery

\- Save nearby places into FoodieFind

\- Favorites system

\- Restaurant details page

\- User reviews and ratings

\- User profile page

\- Admin restaurant management

\- Admin edit/delete restaurant records

\- Toast notifications

\- Responsive dark UI



\## Tech Stack



\### Frontend



\- React

\- TypeScript

\- Vite

\- Tailwind CSS

\- Lucide React

\- React Router



\### Backend



\- Node.js

\- Express

\- TypeScript

\- Prisma

\- PostgreSQL

\- JWT authentication

\- Geoapify API



\## Project Structure



```text

FoodieFind/

├── client/                 # React frontend

│   ├── src/

│   │   ├── components/

│   │   ├── context/

│   │   ├── pages/

│   │   ├── services/

│   │   ├── types/

│   │   └── utils/

│   └── package.json

│

├── server/                 # Express backend

│   ├── prisma/

│   │   ├── migrations/

│   │   ├── schema.prisma

│   │   └── seed.ts

│   ├── src/

│   │   ├── config/

│   │   ├── controllers/

│   │   ├── middleware/

│   │   ├── routes/

│   │   └── utils/

│   └── package.json

│

├── docker-compose.yml

├── .gitignore

└── README.md

```



\## Environment Variables



Create a `.env` file inside the `server` folder.



Use this format:



```env

DATABASE\_URL="postgresql://USER:PASSWORD@localhost:5432/foodiefind\_db?schema=public"

PORT=5000

CLIENT\_URL=http://localhost:5173

JWT\_ACCESS\_SECRET=change\_this\_access\_secret

JWT\_REFRESH\_SECRET=change\_this\_refresh\_secret

GEOAPIFY\_API\_KEY=your\_geoapify\_api\_key

```



Do not upload your real `.env` file to GitHub.



The project should include a safe example file:



```text

server/.env.example

```



\## How to Run Locally



\### 1. Clone the repository



```bash

git clone https://github.com/IRAH-JANE/FoodieFind.git

cd FoodieFind

```



\### 2. Start PostgreSQL with Docker



```bash

docker compose up -d

```



\### 3. Install backend dependencies



```bash

cd server

npm install

```



\### 4. Set up the backend environment



Create a `.env` file inside the `server` folder and add your local database URL, JWT secrets, and Geoapify API key.



\### 5. Run Prisma migrations



```bash

npx prisma migrate dev

```



\### 6. Seed demo data



```bash

npx prisma db seed

```



\### 7. Start the backend server



```bash

npm run dev

```



The backend runs on:



```text

http://localhost:5000

```



\### 8. Install frontend dependencies



Open another terminal:



```bash

cd client

npm install

```



\### 9. Start the frontend



```bash

npm run dev

```



The frontend runs on:



```text

http://localhost:5173

```



\## Demo Accounts



Demo accounts are created by the seed file for local testing.



These accounts are only for development and should not be used in production.



\## Main Pages



\- Home page

\- Nearby food discovery page

\- Favorites page

\- Profile page

\- Restaurant details page

\- Admin restaurant management page

\- Login and registration pages



\## Important Notes



FoodieFind uses Geoapify/OpenStreetMap to discover real nearby food places.



Geoapify/OpenStreetMap can provide restaurant names, categories, addresses, coordinates, and sometimes phone numbers or opening hours.



Customer reviews and ratings are created inside FoodieFind by users. The app does not automatically copy reviews from Google Maps, Yelp, Facebook, or other platforms.



\## Future Improvements



\- Review-based recommendation system

\- Top-rated nearby restaurants

\- Most reviewed food spots

\- Affordable food recommendations

\- Open-now filter

\- Better restaurant image handling

\- Admin data quality dashboard

\- User profile editing

\- Password reset

\- Restaurant owner claiming system



\## Author



Created by IRAH-JANE.



\## License



This project is for educational and portfolio purposes.

