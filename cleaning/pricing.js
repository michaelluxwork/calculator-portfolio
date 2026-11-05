/* Собственный демонстрационный прайс; не тариф реальной клининговой компании. */
(function(root){
  root.CleanPricing = {
    version: 'Прайс 01 · 02.11.2026',
    limits: { area: [20,300], windows: [0,20] },
    types: {
      regular: { name: 'Поддерживающая', rate: 65, minimum: 2500, includes: [] },
      deep: { name: 'Генеральная', rate: 115, minimum: 4500, includes: ['oven','fridge','cabinets'] }
    },
    windows: { label: 'Мытьё окон', rate: 450, unit: 'створка' },
    extras: {
      oven: { name: 'Духовка внутри', price: 700 },
      fridge: { name: 'Холодильник внутри', price: 600 },
      cabinets: { name: 'Кухонные шкафы внутри', price: 900 }
    }
  };
  if(typeof module!=='undefined'&&module.exports)module.exports=root.CleanPricing;
})(globalThis);
