/**
 * TradeTab.jsx
 *
 * Buy/sell goods at market. Prices fluctuate each season.
 */

import { RESOURCE_CONFIG, BASE_SELL_PRICES, BASE_BUY_PRICES } from "../data/economy.js";

function SellPanel({ inventory, marketPrices, onSell }) {
  const sellableResources = Object.entries(inventory).filter(([res, qty]) => {
    return qty > 0 && marketPrices.sell?.[res];
  });

  return (
    <div>
      <h4
        className="font-heading text-base font-bold uppercase tracking-wider mb-2"
        style={{ color: "#2d5a27" }}
      >
        Sell Goods
      </h4>
      {sellableResources.length === 0 ? (
        <p className="text-sm italic" style={{ color: "#8b6914" }}>
          Your stores are empty. Build production facilities on the Estate tab to generate goods for trade.
        </p>
      ) : (
        <div className="space-y-2">
          {sellableResources.map(([resource, qty]) => {
            const cfg = RESOURCE_CONFIG[resource];
            const price = marketPrices.sell[resource];
            return (
              <div
                key={resource}
                className="flex items-center justify-between p-2.5 rounded-md border"
                style={{ borderColor: "#c4a45a", backgroundColor: "#f4e4c1" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cfg?.icon}</span>
                  <div>
                    <span className="text-base font-semibold" style={{ color: "#2c1810" }}>
                      {cfg?.label || resource}
                    </span>
                    <span className="text-sm ml-2" style={{ color: "#5a3a28" }}>
                      ({qty} in stock)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: "#2d5a27" }}>
                    {price}d each
                  </span>
                  <div className="flex gap-1">
                    {[1, 5].map((amount) => (
                      <button
                        key={amount}
                        disabled={qty < amount}
                        onClick={() => onSell(resource, amount)}
                        className="min-w-[44px] min-h-[44px] px-3 py-2 rounded border text-sm font-heading font-semibold uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                        style={{
                          backgroundColor: "#8b6914",
                          borderColor: "#5a3a28",
                          color: "#faf3e3",
                        }}
                        aria-label={`Sell ${amount} ${cfg?.label || resource}`}
                      >
                        {amount}
                      </button>
                    ))}
                    <button
                      disabled={qty <= 0}
                      onClick={() => onSell(resource, qty)}
                      className="min-w-[44px] min-h-[44px] px-3 py-2 rounded border text-sm font-heading font-semibold uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                      style={{
                        backgroundColor: "#8b6914",
                        borderColor: "#5a3a28",
                        color: "#faf3e3",
                      }}
                      aria-label={`Sell all ${cfg?.label || resource}`}
                    >
                      All
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const BUYABLE_HINTS = {
  salt: "Preserves food \u2014 boosts People each season (consumed on use)",
  tools: "Improves efficiency \u2014 boosts Treasury each season (consumed on use)",
  spices: "Church ceremonies \u2014 boosts Faith each season (consumed on use)",
};

function BuyPanel({ denarii, marketPrices, onBuy }) {
  const buyableResources = Object.entries(marketPrices.buy || {}).filter(([, price]) => price > 0);

  return (
    <div>
      <h4
        className="font-heading text-base font-bold uppercase tracking-wider mb-2"
        style={{ color: "#8b1a1a" }}
      >
        Buy Goods
      </h4>
      <div className="space-y-2">
        {buyableResources.map(([resource, price]) => {
          const cfg = RESOURCE_CONFIG[resource];
          const canAfford1 = denarii >= price;
          const canAfford5 = denarii >= price * 5;
          return (
            <div
              key={resource}
              className="flex items-center justify-between p-2.5 rounded-md border"
              style={{ borderColor: "#c4a45a", backgroundColor: "#f4e4c1" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{cfg?.icon}</span>
                <span className="text-base font-semibold" style={{ color: "#2c1810" }}>
                  {cfg?.label || resource}
                </span>
                {BUYABLE_HINTS[resource] && (
                  <div className="text-xs" style={{ color: "#8b6914" }}>
                    {BUYABLE_HINTS[resource]}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: "#8b1a1a" }}>
                  {price}d each
                </span>
                <div className="flex gap-1">
                  <button
                    disabled={!canAfford1}
                    onClick={() => onBuy(resource, 1)}
                    className="min-w-[44px] min-h-[44px] px-3 py-2 rounded border text-sm font-heading font-semibold uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                    style={{
                      backgroundColor: "#5a3a28",
                      borderColor: "#2c1810",
                      color: "#faf3e3",
                    }}
                    aria-label={`Buy 1 ${cfg?.label || resource} for ${price}d`}
                  >
                    1
                  </button>
                  <button
                    disabled={!canAfford5}
                    onClick={() => onBuy(resource, 5)}
                    className="min-w-[44px] min-h-[44px] px-3 py-2 rounded border text-sm font-heading font-semibold uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                    style={{
                      backgroundColor: "#5a3a28",
                      borderColor: "#2c1810",
                      color: "#faf3e3",
                    }}
                    aria-label={`Buy 5 ${cfg?.label || resource} for ${price * 5}d`}
                  >
                    5
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TradeTab({ state, onSell, onBuy }) {
  const { inventory, denarii, marketPrices } = state;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Denarii display */}
      <div
        className="rounded-lg border-2 p-3 mb-4 text-center"
        style={{ backgroundColor: "#faf3e3", borderColor: "#c4a45a" }}
      >
        <span className="text-lg font-heading font-bold" style={{ color: "#8b6914" }}>
          {"\u{1FA99}"} Treasury: {denarii}d
        </span>
        <p className="text-sm mt-1" style={{ color: "#8b6914" }}>
          Prices fluctuate each season. Buy low, sell high.
        </p>
      </div>

      <div className="space-y-6">
        <SellPanel inventory={inventory} marketPrices={marketPrices} onSell={onSell} />
        <BuyPanel denarii={denarii} marketPrices={marketPrices} onBuy={onBuy} />
      </div>
    </div>
  );
}
