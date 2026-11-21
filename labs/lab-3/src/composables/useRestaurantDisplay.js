const PRICE_SYMBOLS = ["$", "$$", "$$$", "$$$$"];
const PRICE_LABELS = ["Бюджетно", "Средне", "Дорого", "Премиум"];

export function useRestaurantDisplay() {
  function priceSymbols(level) {
    return PRICE_SYMBOLS[level - 1] || "$";
  }

  function priceLabel(level) {
    return PRICE_LABELS[level - 1] || "Бюджетно";
  }

  function starsArray(rating) {
    const full = Math.round(rating);
    return Array.from({ length: 5 }, (_, i) => i < full);
  }

  return { priceSymbols, priceLabel, starsArray };
}
