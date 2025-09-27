# Transplant Chain Ledger

A blockchain-based solution for managing organ donations and transplant requests with transparent, immutable tracking of the entire transplant process.

## 🌟 Features

- **Transparent Tracking**: All organ donations and requests recorded on-chain
- **Role-Based Access Control**: Different user roles (Patient, Donor, Doctor, Admin) with appropriate permissions
- **Medical Verification**: Built-in verification system for medical professionals
- **Smart Matching**: Automated matching of compatible organs with patients
- **Immutable Records**: All transactions permanently recorded on the blockchain
- **Multi-Network Support**: Deployable on Ethereum, Polygon, BSC, and other EVM-compatible networks
- **Modern UI**: Beautiful React frontend with shadcn/ui components
- **Real-time Updates**: Live dashboard with real-time status updates

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Supabase** for backend database
- **React Router** for navigation
- **TanStack Query** for data fetching

### Smart Contract
- **Solidity ^0.8.19**
- **OpenZeppelin** contracts for security
- **Hardhat** for development and deployment
- **Ethers.js** for blockchain interaction

### Backend
- **Supabase** PostgreSQL database
- **Row Level Security** for data protection
- **Real-time subscriptions** for live updates

### Storage
- **IPFS** (Pinata) for document storage
- **Blockchain** for transaction records

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd transplant-chain-ledger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the migration file in `supabase/migrations/`
   - Update your `.env` with Supabase credentials

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📋 Environment Variables

Create a `.env` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Blockchain Configuration (optional for frontend)
VITE_CONTRACT_ADDRESS=your_contract_address
VITE_CHAIN_ID=your_chain_id

# Pinata Configuration (for IPFS)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key

# Hardhat Configuration (for smart contract development)
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## 🛠️ Development

### Frontend Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Smart Contract Development
```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to local network
npm run deploy

# Deploy to testnet
npm run deploy:sepolia

# Verify contract
npm run verify
```

### Documentation
```bash
# Generate documentation
npm run docs:generate

# Upload documentation to IPFS
npm run docs:upload
```

## 🏥 User Roles

### Patient
- Create organ requests
- View request status
- Update medical information
- Track transplant progress

### Donor
- Register organ donations
- View donation status
- Update medical history
- Track organ allocation

### Doctor
- Verify organ requests
- Approve medical clearances
- Update patient records
- Match organs with patients

### Admin
- Manage user roles
- Oversee system operations
- Handle emergency situations
- Access all system data

## 📊 Smart Contract Functions

### User Management
- `registerUser()` - Register new users
- `updateUser()` - Update user information
- `getUser()` - Get user details

### Organ Requests
- `createOrganRequest()` - Create new organ request
- `updateOrganRequestStatus()` - Update request status
- `getOrganRequest()` - Get request details

### Organ Donations
- `createOrganDonation()` - Register organ donation
- `updateOrganDonationStatus()` - Update donation status
- `getOrganDonation()` - Get donation details

### Matching System
- `matchOrganWithRequest()` - Match organ with patient
- `completeTransplant()` - Mark transplant as completed

### Verification
- `submitVerification()` - Submit verification documents
- `recordTransaction()` - Record blockchain transactions

## 🔒 Security Features

- **Role-Based Access Control**: Strict permissions for different user types
- **Input Validation**: All inputs validated before processing
- **Reentrancy Protection**: Using OpenZeppelin's ReentrancyGuard
- **Event Logging**: Comprehensive event logging for audit trails
- **Data Encryption**: Sensitive data encrypted before storage
- **Row Level Security**: Database-level security with Supabase RLS

## 🌐 Deployment

### Frontend Deployment
The frontend can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Smart Contract Deployment
Deploy to various networks:

```bash
# Ethereum Sepolia Testnet
npm run deploy:sepolia

# Polygon Mumbai Testnet
npm run deploy:polygon

# Ethereum Mainnet (production)
npm run deploy:mainnet
```

### Database Setup
1. Create Supabase project
2. Run migration: `supabase/migrations/20250924185111_af201372-eead-422b-b92a-20667a50ae69.sql`
3. Configure RLS policies
4. Set up real-time subscriptions

## 📱 Mobile Support

The application is fully responsive and works on:
- Desktop browsers
- Tablet devices
- Mobile phones
- Progressive Web App (PWA) support

## 🔧 Configuration

### Network Configuration
Update `hardhat.config.js` to add new networks:

```javascript
networks: {
  yourNetwork: {
    url: "YOUR_RPC_URL",
    accounts: [process.env.PRIVATE_KEY],
    chainId: YOUR_CHAIN_ID,
  }
}
```

### UI Configuration
Customize the UI in:
- `tailwind.config.ts` - Styling configuration
- `components.json` - shadcn/ui configuration
- `src/index.css` - Global styles

## 🧪 Testing

### Frontend Testing
```bash
# Run component tests
npm run test

# Run e2e tests
npm run test:e2e
```

### Smart Contract Testing
```bash
# Run contract tests
npm run test

# Run with gas reporting
REPORT_GAS=true npm run test
```

## 📈 Monitoring

### Analytics
- User activity tracking
- Contract interaction monitoring
- Performance metrics
- Error tracking

### Alerts
- Failed transactions
- System errors
- Security breaches
- Performance issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write comprehensive tests
- Document new features
- Follow semantic versioning

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Join our community Discord
- Email: support@transplantchain.com

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core smart contract functionality
- ✅ Basic frontend interface
- ✅ User registration and authentication
- ✅ Organ request and donation management

### Phase 2 (Next)
- 🔄 Advanced matching algorithms
- 🔄 Mobile application
- 🔄 API for third-party integrations
- 🔄 Advanced analytics dashboard

### Phase 3 (Future)
- 📋 Cross-chain interoperability
- 📋 AI-powered matching
- 📋 Integration with hospital systems
- 📋 Regulatory compliance tools

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Supabase for backend infrastructure
- shadcn/ui for beautiful UI components
- The Ethereum community for blockchain infrastructure

---

**Built with ❤️ for the healthcare community**

For more information, visit our [documentation](./docs/TransplantChainLedger-Documentation.md) or [website](https://transplantchain.com).