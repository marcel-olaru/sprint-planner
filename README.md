# Sprint Planner

A lightweight application for sprint planning that helps teams calculate sprint capacity, track team member availability, and determine recommended story points based on historical velocity.

![Sprint Planner Dashboard](https://placeholder.svg?height=400&width=800)

## Features

- 📊 Calculate team capacity based on member availability
- 👥 Manage team members and their time off
- 📈 Track sprint history and performance
- 🧮 Automatically calculate recommended points for upcoming sprints
- 📁 Simple CSV-based storage with no database required
- 📱 Responsive design that works on all devices

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
  - [GitHub Pages Setup](#github-pages-setup)
  - [Continuous Integration/Deployment](#continuous-integrationdeployment)
- [Data Storage](#data-storage)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/sprint-planner.git
cd sprint-planner
...
```

2. Install dependencies:


```bash
npm install
# or
yarn install
```

### Running Locally

1. Start the development server:


```bash
npm run dev
# or
yarn dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.


## Project Structure

```plaintext
sprint-planner/
├── app/                  # Next.js app directory
│   ├── api/              # API routes for data operations
│   ├── history/          # Sprint history page
│   ├── new-sprint/       # New sprint creation page
│   ├── settings/         # Settings page
│   ├── team/             # Team management page
│   ├── layout.tsx        # Root layout component
│   └── page.tsx          # Homepage/dashboard
├── components/           # UI components
│   └── ui/               # shadcn/ui components
├── data/                 # CSV data storage (created at runtime)
├── lib/                  # Utility functions
│   ├── csv-storage.ts    # CSV file operations
│   └── sprint-calculator.ts # Sprint calculation logic
├── public/               # Static assets
├── .github/              # GitHub Actions workflows
├── next.config.mjs       # Next.js configuration
└── package.json          # Project dependencies
```

## Deployment

### GitHub Pages Setup

This application can be deployed to GitHub Pages using Next.js's static export feature.

1. Update `next.config.mjs` to support GitHub Pages:


```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // If your repository name is different from 'sprint-planner',
  // update the basePath to match your repository name
  basePath: process.env.NODE_ENV === 'production' ? '/sprint-planner' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

2. Add a `.nojekyll` file to the public directory to prevent GitHub Pages from ignoring files that start with an underscore:


```shellscript
touch public/.nojekyll
```

3. Update the `package.json` scripts to include a build command for GitHub Pages:


```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "export": "next build && next export",
  "deploy": "npm run export && touch out/.nojekyll && gh-pages -d out"
}
```

4. Install the `gh-pages` package:


```shellscript
npm install --save-dev gh-pages
# or
yarn add --dev gh-pages
```

5. Deploy manually:


```shellscript
npm run deploy
# or
yarn deploy
```

### Continuous Integration/Deployment

You can set up GitHub Actions to automatically deploy your application to GitHub Pages whenever you push changes to the main branch.

1. Create a `.github/workflows/deploy.yml` file:


```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Add .nojekyll file
        run: touch out/.nojekyll

      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: out
          branch: gh-pages
```

2. Push your changes to GitHub:


```shellscript
git add .
git commit -m "Set up GitHub Pages deployment"
git push
```

3. Enable GitHub Pages in your repository settings:
1. Go to your repository on GitHub
2. Click on "Settings"
3. Scroll down to the "GitHub Pages" section
4. Select the `gh-pages` branch as the source
5. Click "Save"



4. Your application will be available at `https://yourusername.github.io/sprint-planner/`


## Data Storage

This application uses CSV files for data storage, which are stored in the `/data` directory. When deployed to GitHub Pages (which is a static hosting service), the data storage works differently:

### Local Storage Fallback

When running on GitHub Pages, the application automatically falls back to using the browser's localStorage for data persistence, since GitHub Pages doesn't allow server-side file operations.

### Data Import/Export

To preserve your data:

- Use the "Export Data" feature in the Settings page to download your data as a JSON file
- Use the "Import Data" feature to restore your data after clearing your browser or using a different device


### For Production Use

If you need more robust data storage for a production environment:

1. Deploy to a service that supports server-side operations (Vercel, Netlify, etc.)
2. Consider upgrading to a lightweight database like SQLite or a serverless database service


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## License

This project is licensed under the MIT License - see the LICENSE file for details.