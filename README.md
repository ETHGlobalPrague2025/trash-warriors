# Decycler

A decentralized recycling system that incentivizes community participation in waste management through tokenized rewards and gamification.

## Overview

Decycler is a Web3 platform that connects smart garbage cans with community members and waste collectors. It uses blockchain technology to create a transparent and rewarding recycling ecosystem.

## Features

### For Community Members

- 🗑️ Request new smart garbage cans for your area
- 💰 Stake USDC to support can deployment
- 🎮 Complete recycling quests for rewards
- 🏆 Earn NFTs and badges for achievements
- 📊 Track your recycling impact

### For Collectors

- 📍 Real-time fill level monitoring
- 💸 Purchase recyclable contents
- 🔄 Automated reward distribution
- 📱 Mobile-friendly collection interface
- 🗺️ Smart route optimization

### Security Features

- ✉️ Email verification with ZK proofs
- 👤 Face verification at device
- 🔐 Secure smart contracts
- 🔒 Privacy-preserving analytics

## Tech Stack

- **Frontend**: Next.js 13 (App Router)
- **Blockchain**: Flow EVM
- **Smart Contracts**: Solidity
- **Storage**: IPFS/Filecoin
- **Authentication**: Zero-Knowledge Proofs
- **Maps**: Mapbox
- **Device**: Custom IoT Protocol

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/your-username/decycler.git
cd decycler
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Start development server:

```bash
pnpm dev
```

## Environment Variables

Required environment variables:

```env
# Auth Config
AUTH_SECRET=           # Auth secret for session management
HMAC_SECRET_KEY=      # HMAC key for secure hashing
AUTH_URL=             # Authentication service URL

# Contract Addresses (Flow Testnet)
NEXT_PUBLIC_RECYCLING_SYSTEM_ADDRESS=
NEXT_PUBLIC_TEST_USDC_ADDRESS=
NEXT_PUBLIC_TRASH_TOKEN_ADDRESS=
NEXT_PUBLIC_TRASH_NFT_ADDRESS=
NEXT_PUBLIC_QUEST_SYSTEM_ADDRESS=

# Network Config
NEXT_PUBLIC_FLOW_TESTNET_CHAIN_ID=0x221
NEXT_PUBLIC_FLOW_TESTNET_RPC=https://testnet.evm.nodes.onflow.org

# API Keys
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
NEXT_PUBLIC_ZKP_API_URL=
```

## Smart Contract Addresses

All contracts are deployed on Flow Testnet:

- Recycling System: `0x6900384BA33f8C635DeE2C3BD7d46A0626FfB096`
- Test USDC: `0x02894D48c53Ad4AF56ab9624A07153C4fc379D9C`
- TRASH Token: `0x714c9202B3B5AF0C0Ad844c2a71803cebBFD3AF5`
- TRASH NFT: `0x9F23368ad875efF17836492Ebc8122254370685D`
- Quest System: `0x8dEedE5B8026E57e57a206D4236d36dBfE0B1526`

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details
