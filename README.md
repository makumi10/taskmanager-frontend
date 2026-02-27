# Task Manager — Frontend

The frontend for the Task Management System. Built with plain HTML, CSS, and Vanilla JavaScript — no frameworks, no build step required.

---

## Live Demo

**Frontend:** https://taskmanager-frontend-26.vercel.app  
**API:** http://taskmanagerapp26.runasp.net/api/tasks  
**Backend Repository:** https://github.com/makumi10/taskmanager-backend.git

---

## Tech Stack

| Layer      | Technology                |
|------------|---------------------------|
| Markup     | HTML5                     |
| Styling    | CSS3                      |
| Logic      | Vanilla JavaScript (ES6+) |
| Hosting    | Vercel                    |

---

## Project Structure

```
frontend/
├── index.html        
├── style.css         
├── script.js         
└── vercel.json       
```

### File Descriptions

- **`index.html`** — Clean, minimal table-based interface. Linked to `style.css` and `script.js`.
- **`style.css`** — All styles for the simple UI.
- **`script.js`** — All JavaScript logic for the simple UI — API calls, rendering, modals, toasts.
- **`vercel.json`** — Vercel configuration that proxies API requests through Vercel to avoid mixed content issues between HTTPS (frontend) and HTTP (backend).

---

## Running Locally

No installation or build step required. Simply:

1. Clone the repository:
```bash
git clone https://github.com/makumi10/taskmanager-frontend.git
cd taskmanager-frontend
```

2. Open the frontend file directly in your browser:
```
index.html
```

> **Note:** When running locally, the frontend communicates directly with the live hosted API. If you want to run it against a local API instead, update the `API_BASE` variable in `script.js`:
> ```js
> const API_BASE = 'http://localhost:{port}/api/tasks';
> ```

---

## API Proxy — How It Works

The backend API is hosted on HTTP while the frontend is served over HTTPS on Vercel. Browsers block HTTP requests from HTTPS pages. To solve this without needing an SSL certificate on the backend, a Vercel reverse proxy is used.

The `vercel.json` file configures Vercel to forward any request made to `/api/*` on the frontend domain to the backend API server-side:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "http://taskmanagerapp26.runasp.net/api/:path*"
    }
  ]
}
```

```
Browser (HTTPS)
    ↓ calls /api/tasks over HTTPS
Vercel (HTTPS)
    ↓ forwards to MonsterASP over HTTP server-side
MonsterASP API (HTTP)
    ↓ returns response
Vercel
    ↓ returns response to browser over HTTPS
Browser ✅
```

The browser only ever communicates with Vercel over HTTPS — it never sees the HTTP backend directly.

---

## Features

- View all tasks in a table layout
- Color-coded status indicators — Pending, In Progress, Completed
- Filter tasks by status
- Create a new task via a modal form with validation
- Edit an existing task
- Delete a task with a confirmation dialog
- Live task count stats in the header
- Loading states and error handling
- Toast notifications for all actions
- Fully responsive layout

---

## API Integration

The frontend communicates with the backend via REST API calls using the browser's native `fetch()`. All requests are handled asynchronously with proper loading states and error handling.

When running on Vercel, API calls go through the Vercel proxy (`/api/tasks`). When running locally, they go directly to the live hosted API.

The backend API repository can be found here:  
https://github.com/makumi10/taskmanager-backend.git

---

## Screenshots

### Dashboard
![Dashboard Screenshot](screenshots/Dashboard.png)

### Create Task Modal
![Create Task Screenshot](screenshots/CreateTask.png)

### Edit Task Modal
![Edit Task Screenshot](screenshots/EditTask.png)

### Delete Task Modal
![Delete Task Screenshot](screenshots/DeleteTask.png)

---

## Author

**Brian Makumi**

Practical Assignment — Health Tech Solutions  
February 2026

https://www.brianmakumi.com
