# Alphabit Abstraction Layer

## Overview
Alphabit gamifies complex DeFi Options Trading by abstracting "The Greeks" and Order Book mechanics into a simple "Arcade" interface. This document explains the translation layer between Game Logic and Financial Logic.

## The Translation Pattern

### 1. Greeks -> Game Stats
We map complex risk metrics (Greeks) into understandable RPG-style stats.

| Financial Metric | Game Stat | Description |
| :--- | :--- | :--- |
| **Delta** | **Power Level** | Probability of ITM. Higher delta = "Stronger" signal. |
| **Theta** | **Decay Timer** | Time value decay, authorized as a countdown clock. |
| **Gamma** | **Volatility** | "Critical Hit" chance. |
| **Strike Price** | **Target** | The specific price level to hit. |
| **Premium** | **Entry Cost** | The cost to play the round. |

### 2. Execution Matcher (The Logic Mapper)
Instead of asking users to pick a specific Strike Price from an Option Chain, we use an intent-based matcher.

**User Input:**
- Direction: UP (Call) or DOWN (Put)
- Duration: Blitz (6h), Rush (12h), Core (24h)

**Matcher Logic:**
The `bestOrder` selector (`useThetanutsOrders.ts`) scans the order book for the "Best Fit":
1.  **Filter**: Matches Asset (ETH/BTC) and Type (Call/Put).
2.  **Duration Match**: Finds expiry closest to the user's selected duration (e.g., closest to 6h).
3.  **Liquidity Check**: Ensures the option has enough liquidity for the "Max Trade Size".
4.  **Optimality**: Selects the strike that offers the best balance of Probability (Delta ~0.3-0.5) and Payout (ROI).

### 3. Blitz Mode (Optimistic UI)
DeFi settlement times (1-2 mins) kill the "Arcade" vibe.
- **Problem**: Users want instant feedback.
- **Solution**: "Blitz Mode" updates the UI state *optimistically* upon transaction submission.
- **Implementation**: The UI shows "Trade Active" as soon as the hash is generated, while a background poller waits for on-chain confirmation to solidify the state (or revert if failed).

## Architecture
```mermaid
graph TD
    User[User: "I think ETH goes UP"] --> UI[Pro Terminal]
    UI --> Matcher[Execution Matcher]
    Matcher --> API[Thetanuts v3/v4 API]
    API --> Chain[Option Chain]
    Chain --> BestOption[Strike: $3200, Exp: 6H]
    BestOption --> UI
    UI --> User[Display: "TARGET MOON / ROI +50%"]
```
