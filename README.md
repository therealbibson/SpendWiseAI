# SpendWise AI

**An autonomous DeFAI financial agent on Celo Mainnet.** SpendWise AI monitors your
budgets, warns you about overspending, and executes real payments, recurring
transfers, and savings rules on-chain — automatically, even while you are logged
off.

Built for the **Celo Agentic Payments & DeFAI Hackathon**.

- **Attribution tag:** `celo_25db5a84f655`
- **Network:** Celo Mainnet (chainId `42220`)
- **Tracks:** `most-revenue-generated`, `most-x402-payments`, `track-4-tba`, `askbots`

---

## What it does

SpendWise AI is a personal finance agent that does not just analyze your money —
it acts on it. Users talk to the agent in natural language ("save $10 into my
Laptop Vacation goal", "lower my dining budget to $200"), and the agent executes
the corresponding on-chain action on Celo.

- **Conversational agent** — a Gemini-powered chat interface that understands
  budget questions and payment intents, then carries them out.
- **Autonomous audit loop** — a background job runs every 10 minutes, re-reads
  each user's on-chain balance and spending, evaluates their active rules, and
  triggers payments/alerts without any user action.
- **Real on-chain payments** — transfers of CELO, USDm, EURm, USDC, and USDT on
  Celo Mainnet, every one carrying the hackathon attribution tag so volume is
  credited on the Celo leaderboard.
- **x402 micropayments** — a self-hosted x402 facilitator meters agent usage:
  beyond a free daily quota, each chat message is paid for in USDC via the HTTP
  402 flow, settled on Celo with EIP-3009 `transferWithAuthorization`.
- **On-chain vault** — `SpendWiseVault`, a multi-user, multi-token spending vault
  with authorized-agent spending, time-locked savings goals, and recurring
  payment schedules.

---

## Architecture

```
SpendWise AI
├── SpendWise-Frontend/   React 19 + Vite + Tailwind v4 dashboard & agent chat UI
├── SpendWise-Backend/    Node/Express API, Gemini agent, x402 facilitator, agent loop
└── SpendWise-Contract/   Hardhat project — SpendWiseVault.sol (Celo Mainnet)
```

### Frontend
- React 19, Vite 8, Tailwind CSS v4, Framer Motion, React Router 7.
- Dashboard, chat, budgets, transactions, subscriptions, savings, insights, and
  settings — fully responsive down to mobile.

### Backend
- Express 5 API with JWT auth (`bcryptjs` + `jsonwebtoken`).
- **AI:** Google Gemini (`gemini-2.5-flash` by default) via `@google/generative-ai`.
  Falls back to a rule-based simulation mode when no API key is set.
- **Blockchain:** `ethers` v6 against Celo Mainnet (`https://forno.celo.org`).
  The RPC's chainId is verified at boot so a misconfigured network fails loudly.
- **Attribution:** every ERC-20 transfer and every x402 settlement appends the
  tag via `@celo/attribution-tags` `toDataSuffix('celo_25db5a84f655')`.
- **x402 facilitator:** self-hosted because the stock Coinbase x402 packages
  don't list Celo. Speaks the x402 HTTP shape (`402` + `X-PAYMENT`) and settles
  USDC on Celo with EIP-3009.
- **Autonomous loop:** `runAgentAuditLoop` runs on an interval, syncing balances
  and evaluating active `AgentRule`s per user.
- **Storage:** MongoDB via Mongoose. Wallet private keys are encrypted at rest.

### Smart contract
- `SpendWiseVault.sol` (Solidity `0.8.24`, OpenZeppelin) — deposits/withdrawals
  per user and token, agent-authorized spending, time-locked savings goals, and
  recurring transfer schedules. Uses `ReentrancyGuard`, `SafeERC20`, `Ownable`.
- Deployed to Celo Mainnet via Hardhat (`scripts/deploy.js`).

---

## Celo & agentic-payments integration

| Feature | Where |
| :--- | :--- |
| Attribution tag on ERC-20 transfers | `SpendWise-Backend/services/blockchainService.js` |
| Attribution tag on x402 settlements | `SpendWise-Backend/services/x402Service.js` |
| x402 402 / `X-PAYMENT` flow + EIP-3009 settlement | `SpendWise-Backend/services/x402Service.js`, `middleware/x402.js` |
| Autonomous agent audit loop | `SpendWise-Backend/services/agentService.js` |
| On-chain vault | `SpendWise-Contract/contracts/SpendWiseVault.sol` |

> **ERC-8004:** agent identity registration is tracked separately (see the
> hackathon submission checklist). Add the resulting agent ID here before final
> submission.

---

## Running locally

### Prerequisites
- Node.js 18+
- A MongoDB connection string
- A funded Celo Mainnet wallet (for deploying the contract and for the agent /
  x402 facilitator to sign transactions)
- A Google Gemini API key (optional — the agent runs in simulation mode without it)

### 1. Smart contract
```bash
cd SpendWise-Contract
npm install
# set DEPLOYER_PRIVATE_KEY (and optional AGENT_ADDRESS, CELOSCAN_API_KEY) in .env
npx hardhat run scripts/deploy.js --network celo
# note the printed SPENDWISE_VAULT_ADDRESS
```

### 2. Backend
```bash
cd SpendWise-Backend
npm install
# configure .env (see below), then:
npm start
```

Backend environment variables:

| Variable | Purpose |
| :--- | :--- |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Auth token signing secret |
| `PORT` | API port (default `3000`) |
| `CELO_RPC_URL` | Celo RPC (default `https://forno.celo.org`) |
| `GEMINI_API_KEY` | Google Gemini key (optional) |
| `GEMINI_MODEL` | Gemini model (default `gemini-2.5-flash`) |
| `SPENDWISE_VAULT_ADDRESS` | Deployed vault address |
| `X402_PAY_TO` | Address that receives x402 payments |
| `WALLET_ENCRYPTION_KEY` | Key used to encrypt stored wallet private keys |

> Never commit `.env` files or private keys. See `.gitignore`.

### 3. Frontend
```bash
cd SpendWise-Frontend
npm install
npm run dev      # dev server
npm run build    # production build
```

---

## Security notes
- Wallet private keys are encrypted at rest; the encryption key comes from the
  environment.
- The vault restricts agent spending to explicitly authorized agent addresses.
- The Celo RPC network is verified at startup to prevent silent broadcasts to
  the wrong chain.
- Authentication is JWT-based. Do not expose the API publicly without TLS and
  appropriate rate limiting.

---

## Links
- **GitHub:** https://github.com/therealbibson/SpendWiseAI
- **Celo x402 docs:** https://docs.celo.org/build-on-celo/build-with-ai/x402
- **Celo ERC-8004 docs:** https://docs.celo.org/build-on-celo/build-with-ai/8004
