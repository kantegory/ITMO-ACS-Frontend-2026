const PRICE_SYMBOLS = ["$", "$$", "$$$", "$$$$"];

export function useRestaurantDisplay() {
  function priceSymbols(level) {
    return PRICE_SYMBOLS[level - 1] || "$";
  }

  function starsArray(rating) {
    const full = Math.round(rating);
    return Array.from({ length: 5 }, (_, i) => i < full);
  }

  return { priceSymbols, starsArray };
}
