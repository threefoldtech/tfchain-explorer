# TFChain Explorer

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20Explorer-blue)](https://threefoldtech.github.io/tfchain-explorer/)

A comprehensive blockchain explorer for TFChain, a Substrate-based blockchain that powers the ThreeFold Grid. This explorer provides real-time insights into TFChain-specific entities including grid statistics, farms, nodes, twins, contracts, and account transaction history.

![TFChain Explorer Screenshot](https://raw.githubusercontent.com/threefoldtech/tfchain-explorer/main/screenshot.png)

## Features

- **Live Grid Statistics**: Real-time overview of TFChain grid metrics (nodes, farms, twins, contracts)
- **Farm Explorer**: Browse and search TFChain farms with detailed information
- **Node Explorer**: Examine node details with filtering and sorting capabilities
- **Block Explorer**: View detailed block information including extrinsics and events
- **Account Transaction History**: Track account transactions with customizable block range selection
- **TFChain Pallets Documentation**: Reference for TFChain-specific pallets and types
- **Real-time Updates**: Live updates as new blocks are finalized

## Architecture

```
TFChain Explorer Architecture
┌─────────────────────┐     ┌─────────────────┐     ┌───────────────────┐
│                     │     │                 │     │                   │
│  React Components   │────▶│  Polkadot.js    │────▶│  TFChain Network  │
│  & Hooks            │     │  API            │     │  Endpoints        │
│                     │     │                 │     │                   │
└─────────────────────┘     └─────────────────┘     └───────────────────┘
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Chakra UI v2/v3
- **Blockchain Connectivity**: @polkadot/api
- **Build System**: Vite
- **Routing**: React Router v6
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/threefoldtech/tfchain-explorer.git
cd tfchain-explorer

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npm run dev
```

The application will be available at http://localhost:5173/

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production with TypeScript checking
- `npm run build-force` - Build the application without TypeScript checking
- `npm run preview` - Preview the production build locally
- `npm run deploy` - Deploy the application to GitHub Pages

## Connecting to TFChain Networks

The explorer is configured to connect to the following TFChain networks:

- **Development**: `wss://tfchain.dev.grid.tf`
- **QA**: `wss://tfchain.qa.grid.tf`
- **Test**: `wss://tfchain.test.grid.tf`
- **Production**: `wss://tfchain.grid.tf`

You can modify these endpoints in `src/api/substrate.ts`.

## Deployment

### Deploying to GitHub Pages

The project is configured for easy deployment to GitHub Pages:

```bash
# Deploy to GitHub Pages
npm run deploy
```

This will:
1. Build the application using the `build-force` script
2. Push the built files to the `gh-pages` branch
3. Make the site available at `https://threefoldtech.github.io/tfchain-explorer/`

### Custom Deployment

To deploy to a custom domain or hosting service:

1. Update the `homepage` field in `package.json`
2. Update the `base` path in `vite.config.ts`
3. Build the application: `npm run build-force`
4. Deploy the contents of the `dist` directory to your hosting service

## Project Structure

```
/src
├── api/                  # API connection and context
├── components/           # Reusable UI components
│   ├── TFChainStats.tsx  # Grid statistics component
│   ├── TFChainFarms.tsx  # Farms listing component
│   ├── TFChainNodes.tsx  # Nodes listing component
│   └── ...
├── hooks/                # Custom React hooks
│   ├── useBlocks.ts      # Block data fetching
│   └── ...
├── pages/                # Page components
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── App.tsx               # Main application component
└── main.tsx              # Application entry point
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Polkadot.js](https://polkadot.js.org/) - JavaScript API for Substrate-based blockchains
- [ThreeFold](https://threefold.io/) - For creating TFChain and the ThreeFold Grid
- [Substrate](https://substrate.io/) - Blockchain development framework
