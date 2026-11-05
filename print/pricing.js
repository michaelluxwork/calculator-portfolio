/* Условные ставки в рублях. После правки проверьте контрольные расчёты. */
(function (root) {
  root.PrintPricing = {
    version: 'Прайс 01 · 02.11.2026',
    materials: {
      banner: { name: 'Баннер', rate: 650 },
      film: { name: 'Плёнка', rate: 850 },
      paper: { name: 'Бумага', rate: 450 }
    },
    finishing: { lamination: 180, edge: 80, eyelets: 35 },
    limits: { width: [10, 150], height: [10, 500], quantity: [1, 1000], eyelets: [1, 100] }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.PrintPricing;
})(globalThis);
