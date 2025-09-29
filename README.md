# KadroKur: Amateur Football Match Organizer

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/tasdemir/generated-app-20250929-214954)

KadroKur is a minimalist, mobile-first web application designed to streamline the organization of amateur football matches. It connects players with coaches, allowing for easy match creation, player recruitment, and team management. The system features three distinct user roles: Admin, Coach, and Player, each with a tailored dashboard and specific permissions. Coaches can create match events, which generate a unique code for players to join. Players can search for matches and register their attendance status. Coaches then manage the roster, assign players to teams, and after the match, award points and performance tags. A dynamic scoreboard ranks players based on their performance, with filters for location, creating a competitive and engaging community platform.

## Key Features

-   **Role-Based Access Control:** Separate dashboards and permissions for Admins, Coaches, and Players.
-   **Match Management:** Coaches can create match events, set dates, times, and player counts.
-   **Unique Join Codes:** Each match generates a unique code for players to easily find and join games.
-   **Player Registration:** Players can search for matches and register with an attendance status (Going, Maybe, Can't Go).
-   **Live Roster Management:** Coaches can assign registered players to teams (A or B) or mark them as absent.
-   **Scoring & Performance Tracking:** After a match, coaches award points for wins/draws/losses and assign performance tags.
-   **Dynamic Scoreboard:** A global leaderboard ranks all players by points, with filtering by location.
-   **Admin Panel:** Admins can manage the list of football fields and promote players to the Coach role.

## Technology Stack

-   **Frontend:** React, Vite, React Router, Tailwind CSS
-   **UI Components:** shadcn/ui, Framer Motion, Lucide React
-   **State Management:** Zustand
-   **Forms:** React Hook Form with Zod for validation
-   **Backend:** Cloudflare Workers with Hono
-   **Storage:** Cloudflare Durable Objects
-   **Language:** TypeScript

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your machine.
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) for interacting with the Cloudflare platform.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/kadrokur.git
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd kadrokur
    ```
3.  **Install dependencies:**
    ```sh
    bun install
    ```

### Running Locally

To start the development server, which includes both the Vite frontend and the Wrangler backend, run:

```sh
bun run dev
```

The application will be available at `http://localhost:3000`.

## Usage

The application has three user roles:

-   **Admin:** The system has a default admin user.
    -   **Username:** `tasdemir`
    -   **Password:** `deneme.123`
-   **Player:** New users can register as a Player.
-   **Coach:** An Admin must promote an existing Player to the Coach role from the User List page in the Admin Dashboard.

## Development

The project is structured as a monorepo with a clear separation between the frontend and backend code.

-   `src/`: Contains the React frontend application, including pages, components, stores, and hooks.
-   `worker/`: Contains the Cloudflare Worker backend code, built with Hono. This is where API routes and business logic reside.
-   `shared/`: Contains TypeScript types that are shared between the frontend and backend to ensure type safety.

## Deployment

This project is designed for easy deployment to Cloudflare's global network.

1.  **Login to Wrangler:**
    Authenticate the Wrangler CLI with your Cloudflare account.
    ```sh
    wrangler login
    ```
2.  **Deploy the application:**
    Run the deploy script, which will build the application and deploy it to your Cloudflare account.
    ```sh
    bun run deploy
    ```

Alternatively, you can deploy directly from your GitHub repository with a single click.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/tasdemir/generated-app-20250929-214954)

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.