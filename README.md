## Mangrove Kandel App

This project is a Next.js frontend application that provides an interface for creating and managing Kandel strategies on the Mangrove DEX. This is for testing and learning only!

**What is Mangrove and how is it different from conventional DEXs with AMMs?**

Mangrove is a decentralized, orderbook-based exchange, enabling dynamic, conditional trading functionality. Unlike conventional DEXs built on AMMs (like Uniswap), liquidity on Mangrove is provided as a series of individual offers in an orderbook, similar to what we see on centralized exchanges.

A key innovation is that Mangrove offers are a promise to trade and not a locked commitment, allowing funds to be used while in order. This allows users to for example to provide liquidity on other exchanges and use this LP'd liquidity at the same time to trade or run strategies.

**What are smart offers?**
Smart offers are limit orders that allow attaching custom smart contract logic. This gives users extra options when trading:

- Reactive liquidity -> with reactive liquidity, funds are not locked when placed as offers, allowing simultaneous use in other DeFi protocols like Aave.
- Last look -> before filling an order a smart contract runs and can act like a last check to see if all conditions match. For example to not take the order when volatility is high.
- Persistence -> smart offers can open up new offers or change existing offers. For example as a MM you want to place new sell orders when buy orders are hit.

Smart offers use two callback function that are triggered when an order is hit.

- `makerExecute` – runs when the offer is matched.
- `makerPostHook` – runs after the offer is executed.

**Ticks, ratios, and prices**
To prevent working with floats on chain and have faster and cheaper calculations Mangrove represents prices as ratios on a grid of ticks. So instead of having an infinite price space, Mangrove snaps prices to a grid. Each step is called a tick. A tick is an element of all integers.

Tick 0 = ratio =1
Tick 1 = ratio = 1.0001
Tick -1 = ratio = 1 / 1.0001 (=0.99999)

Ratio = want / gives

Ticks go from `-887,272` to `887,272`

Price = ratio = 1.0001^tick

Price = 1/ratio = 1.0001^-tick

Mangrove uses raw amounts on chain. So when working with these we need to always convert human price to raw (from ui to chain) and back (from chain to ui). We also need to watch the difference in decimals between quote and base.

**Asks vs Bids**

For a market (WETH/USDC), Mangrove keeps two separate offer lists. One for asks and one for bids. Offers are grouped by ticks. All offers for a tick are stored in FIFO order, and in a doubly linked list (each order links to the previous and next offer).

**In the ask list the users give base token and want quote token.**

`Ratio = wants / gives = quote/base = price`

**In the bids list the users want base token and give quote token**

`Ratio = wants / gives = base/quote = 1/price`

So we see that for the asks list the price is normal but for bids we need to divide 1 by the price (because it's base/quote)

Here an example how we can calculate tick values for asks an bids from human prices.

```ts
const currentPrice = 3000;
// lets create the ask tick for the current price
// tick for asks is in how much USDC / WETH
// the raw price is humanPrice × 10^(quoteDecimals - baseDecimals)
const rawPrice = humanPriceToRawPrice(currentPrice, 6, 18);
const centerTick = tickFromPrice(rawPrice, 1n, true);

// to create the tick for a bid, we first need to inverse the price
// because bid ticks represent how much WETH / USDC.
const inversePrice = 1 / currentPrice;
// We can now convert the price to raw.
const bidRawPrice = humanPriceToRawPrice(inversePrice, 18, 6);
const bidCenterTick = tickFromPrice(bidRawPrice, 1n, true);
```

**What is an offer and how does it work?**

Market orders on mangrove are not like traditional market orders. Because it's on-chain, users could take advantage of real market orders (MEV). Market orders on Mangrove are really "fill as much as possible up to a price ceiling," rather than true market orders. The price of an order does not exceed the specified tick. A user sets the max tick and either the max outbound or inbound tokens.

**Rounding Strategy**

- **Takers** (taking orders): Round down ticks → get better or equal price
- **Makers** (creating orders): Round up ticks → ensure you get at least your desired price

**What is a provision and why are native tokens required?**

A provision is an amount of native tokens (like ETH on Base) that compensates takers when offers fail to execute properly. When creating an offer, a provision in the native token is locked as a guarantee. If the offer executes successfully, the provision is returned to the maker. If the offer fails, part or all of the provision is given as a bounty to the taker.

**What are bounties?**
To prevent makers from creating a lot of orders (spamming) that are never meant to be filled, every order must leave a native token provision (the bounty). When an order is hit, but the smart contract prevents the order to be filled the taker is compensated with the bounty.

**Makers, Takers, and Keepers**
Makers provide liquidity by placing limit orders with a defined price, quantity, and optional smart conditions.

Takers are the people that take trades from makers. They can use limit and market orders. When using market order mangrove tries to fill for the best price by checking all smart contracts. If a contract fails the taker is compensate with the bounty and the order fill continues with the next best price.

Keepers are unique to Mangrove. Keepers are automated bots that check the orderbook for outdated or irrelevant orders.

Once a failing order is detected, keepers take the order off the orderbook. They receive the bounty of this order for this task, but have to pay a gas fee so they need to check that the gas price is not higher than the bounty.
Keepers are also tasked with keeping the gas price up to date. This is crucial for determining the compensation takers get when they remove a failing offer from the list.

## Kandel Strategy

Manually maintaining offers on a moving market is inefficient. Kandel is a smart contract strategy that automates the placements of buy and sell orders around a mid-price.

We can create a new Kandel instance by using the KandelSeeder, a factory kind of contract. This creates a new Kandel strategy contract for us that we can later populate with our parameters.

It takes some parameters when setting up. like price range (min, max), number of offers and step size. The grid is calculated using a geometric progression from the min and max. The volume is evenly distributed over the offers (based on the volume provided in base and quote).

It then places the offers in the grid on the orderbook. When an ask is taken, Kandel uses the received quote tokens to place a new bid offer at (current_price - step_size), and vice versa for bids. For example when an ask is taken (so sell ETH for USD) it uses this USD to place a new buy offer at price - step size (not over stepping the min-max boundaries) with the full amount.

Kandel uses Mangrove smart offers to place new bids and asks. Like mentioned before Mangrove smart offers have callback functions:

- makerExecute (it's called when an offer is matched)
- makerPostHook (it's called after the offer execution)

Kandel uses the makerPostHook to place new offers at step size after an offer is successfully executed.

A Kandel strategy needs to have access to the users funds (base and quote token for placing offers). Mangrove uses a client proxy for this, but in our example we allow the contract to spend tokens from us. The strategy also needs provision which is an amount of base tokens the strategy needs to potentially pay in case offers fail as bounty.

## APR Calculation (annual percentage rate)

So how can we think in terms of profit from our Kandel strategy?

Profit is made from capturing the spread between our buys and sells. (we basically want to sell high and buy low ;p)

Our profit is the difference between our buy and sell prices (minus fees of course)

Let's say after one day of trading we went from 10 ETH and 30,000 USD to 9.5 ETH and 31500USD. The question is did we actually make any money?

The problem is how can you measure profit when you have two different tokens. We still don't know if we gained money from smart trading or just holding ETH.

So how can we solve this?

Instead of measuring the profit in price terms, we can measure how much tokens the strategy accumulates through spread capture. The spread we measure in tokens gained or lost over the elapsed time (raw spread = net token growth from trading only) in base and quote tokens. We can then convert the rates to annual rates. We can then show the APRs for both tokens to see if we accumulated more base and quote tokens. This token-based APR isolates strategy performance from general market movements, showing pure spread capture efficiency:

```
Your Kandel position:
- 12% APR in ETH (you're accumulating more ETH)
- 8% APR in USDC (you're accumulating more USDC)
```
