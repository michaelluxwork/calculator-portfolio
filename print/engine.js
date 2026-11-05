(function (root) {
  'use strict';
  const money = value => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 }).format(value);
  const number = value => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 6 }).format(value);

  function calculate(input, pricing = root.PrintPricing) {
    const errors = {};
    if (!Object.hasOwn(pricing.materials, input.material)) errors.material = 'Выберите материал.';
    function read(key, integer) {
      const raw = String(input[key] ?? '').trim();
      const valid = (integer ? /^\d+$/ : /^\d+(?:[.,]\d)?$/).test(raw);
      const value = Number(raw.replace(',', '.'));
      const [min, max] = pricing.limits[key];
      if (!valid || !Number.isFinite(value) || value < min || value > max) {
        errors[key] = integer ? `Введите целое число от ${min} до ${max}.` : `От ${min} до ${max} см, не более одного знака после запятой.`;
      }
      return value;
    }
    const width = read('width', false);
    const height = read('height', false);
    const quantity = read('quantity', true);
    const banner = input.material === 'banner';
    const eyelets = banner && (input.eyeletsEnabled ?? Boolean(input.eyelets)) ? read('eyelets', true) : 0;
    if (Object.keys(errors).length) return { valid: false, errors };

    const w = Math.round(width * 10), h = Math.round(height * 10);
    const area = w * h / 1000000;
    const totalArea = area * quantity;
    const perimeter = 2 * (w + h) / 1000;
    const material = pricing.materials[input.material];
    const lines = [];
    function add(label, amount, rate, unit) {
      const cents = Math.round((amount * rate * 100) + 1e-7);
      lines.push({ label, amount, rate, unit, cents });
    }
    add('Печать', totalArea, material.rate, 'м²');
    if (banner && input.edge) add('Усиление края', perimeter * quantity, pricing.finishing.edge, 'пог.м');
    if (eyelets) add('Люверсы', eyelets * quantity, pricing.finishing.eyelets, 'шт.');
    if (!banner && input.lamination) add('Ламинация', totalArea, pricing.finishing.lamination, 'м²');
    const totalCents = lines.reduce((sum, line) => sum + line.cents, 0);
    return { valid: true, errors, material: material.name, materialKey: input.material, width, height, quantity, area, totalArea, perimeter, eyelets, lines, totalCents, unitCents: Math.round(totalCents / quantity), version: pricing.version };
  }

  function toText(result) {
    if (!result.valid) return '';
    return [
      'ФОРМАТ — расчёт печати',
      `${result.material} · ${number(result.width)} × ${number(result.height)} см · ${result.quantity} шт.`,
      `Площадь: ${number(result.area)} м²/шт.; тираж: ${number(result.totalArea)} м²`,
      ...(result.eyelets ? [`Люверсы: ${result.eyelets} шт. на экземпляр`] : []),
      '',
      ...result.lines.map(line => `${line.label}: ${number(line.amount)} ${line.unit} × ${money(line.rate)}/${line.unit} = ${money(line.cents / 100)}`),
      '',
      `Итого за тираж: ${money(result.totalCents / 100)}`,
      `За экземпляр, в среднем: ${money(result.unitCents / 100)}`,
      'Итог — сумма округлённых до копеек строк. Средняя цена экземпляра округлена отдельно.',
      `${result.version}. Расчёт по демонстрационному прайсу. Цены условные.`,
      'Без доставки, раскладки на рулоне и производственных припусков. Не подтверждает изготовимость.'
    ].join('\n');
  }
  const api = { calculate, toText, money, number };
  root.PrintCalculator = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
