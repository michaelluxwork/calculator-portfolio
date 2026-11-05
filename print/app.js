(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const { calculate, toText, money, number } = PrintCalculator;
  const pricing = PrintPricing;
  const form = $('print-form');
  let result, previousMaterial = 'banner', copyGeneration = 0;
  const fields = ['width', 'height', 'quantity', 'eyelets'];

  function fitPreview() {
    if (!result?.valid) return;
    const stage = $('size-preview');
    const availableWidth = Math.max(1, stage.clientWidth - 102);
    const availableHeight = Math.max(1, stage.clientHeight - 62);
    const ratio = result.width / result.height;
    const width = Math.min(420, availableWidth, availableHeight * ratio);
    const frame = document.querySelector('.specimen-frame');
    frame.style.width = `${width}px`;
    frame.style.height = `${width / ratio}px`;
  }

  document.querySelectorAll('[data-rate]').forEach(el => { el.textContent = `${number(pricing.materials[el.dataset.rate].rate)} ₽ / м²`; });
  document.querySelectorAll('[data-finish-rate]').forEach(el => {
    const key = el.dataset.finishRate;
    el.textContent = `${number(pricing.finishing[key])} ₽ / ${key === 'edge' ? 'пог.м' : key === 'eyelets' ? 'шт.' : 'м²'}`;
  });
  const range = key => pricing.limits[key].join('–');
  $('size-help').textContent = `Пределы модели: ширина ${range('width')} см, высота ${range('height')} см. До 0,1 см.`;
  $('quantity-help').textContent = `От ${range('quantity')} одинаковых экземпляров. Без скидки за тираж.`;
  $('eyelets-help').textContent = `Целое число ${range('eyelets')} на экземпляр.`;
  $('price-version').textContent = pricing.version;

  function input() {
    return { material: form.elements.material.value, width: $('width').value, height: $('height').value, quantity: $('quantity').value, edge: $('edge').checked, lamination: $('lamination').checked, eyeletsEnabled: $('eyelets-toggle').checked, eyelets: $('eyelets').value };
  }

  function update() {
    copyGeneration++;
    const material = form.elements.material.value;
    const banner = material === 'banner';
    if (material !== previousMaterial) {
      const removed = banner ? $('lamination').checked : $('edge').checked || $('eyelets-toggle').checked;
      if (banner) $('lamination').checked = false;
      else { $('edge').checked = false; $('eyelets-toggle').checked = false; }
      $('change-notice').textContent = removed ? 'Обработка сброшена: недоступна для этого материала.' : '';
      previousMaterial = material;
    }
    $('banner-options').hidden = !banner;
    $('sheet-options').hidden = banner;
    $('eyelets-field').hidden = !banner || !$('eyelets-toggle').checked;
    result = calculate(input());
    document.querySelectorAll('[data-size]').forEach(button => {
      const [width, height] = button.dataset.size.split(',').map(Number);
      const selected = !result.errors.width && !result.errors.height &&
        Number($('width').value.trim().replace(',', '.')) === width &&
        Number($('height').value.trim().replace(',', '.')) === height;
      button.setAttribute('aria-pressed', String(selected));
    });
    fields.forEach(key => {
      const error = result.errors[key] || '';
      $(key).setAttribute('aria-invalid', String(Boolean(error)));
      $(`${key}-error`).textContent = error;
    });
    $('valid-result').hidden = !result.valid;
    $('invalid-result').hidden = result.valid;
    $('copy-button').disabled = $('print-button').disabled = !result.valid;
    $('copy-fallback').hidden = true;
    $('copy-text').value = '';
    $('action-status').textContent = '';
    $('print-text').textContent = '';
    $('preview-material').textContent = pricing.materials[material].name;
    if (!result.valid) {
      $('estimate-quantity').textContent = 'Нет расчёта';
      $('preview-area').textContent = 'Проверьте параметры';
      $('size-preview').hidden = true;
      $('live-summary').textContent = 'Расчёт недоступен. Проверьте параметры.';
      return;
    }
    $('size-preview').hidden = false;
    $('estimate-quantity').textContent = `${result.quantity} шт.`;
    $('estimate-spec').textContent = `${result.material} · ${number(result.width)} × ${number(result.height)} см · ${number(result.totalArea)} м² всего`;
    $('preview-area').textContent = `${number(result.area)} м² / шт.`;
    $('size-preview').setAttribute('aria-label', `Схема пропорций: ${number(result.width)} на ${number(result.height)} сантиметров.`);
    document.querySelector('[data-dimension="width"]').textContent = `${number(result.width)} см`;
    document.querySelector('[data-dimension="height"]').textContent = `${number(result.height)} см`;
    fitPreview();
    $('specimen').dataset.material = material;
    $('cost-lines').replaceChildren(...result.lines.map(line => {
      const row = document.createElement('div'); row.className = 'cost-line';
      const label = document.createElement('span'); label.textContent = line.label;
      const detail = document.createElement('small'); detail.textContent = `${number(line.amount)} ${line.unit} × ${money(line.rate)} / ${line.unit}`;
      const value = document.createElement('strong'); value.textContent = money(line.cents / 100);
      label.append(detail); row.append(label, value); return row;
    }));
    $('total-price').textContent = money(result.totalCents / 100);
    $('unit-price').textContent = money(result.unitCents / 100);
    $('live-summary').textContent = `Итого за ${result.quantity} шт.: ${money(result.totalCents / 100)}.`;
    $('print-text').textContent = toText(result);
  }

  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  document.querySelectorAll('[data-size]').forEach(button => button.addEventListener('click', () => {
    const [width, height] = button.dataset.size.split(',');
    $('width').value = width; $('height').value = height; update();
  }));
  $('copy-button').addEventListener('click', async () => {
    if (!result.valid) return;
    const text = toText(result), generation = copyGeneration;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(text);
      if (generation !== copyGeneration) return;
      $('action-status').textContent = 'Расчёт скопирован.';
    } catch {
      if (generation !== copyGeneration) return;
      $('copy-fallback').hidden = false;
      $('copy-text').value = text;
      $('action-status').textContent = 'Автокопирование недоступно. Выделите и скопируйте текст ниже.';
      $('copy-text').focus(); $('copy-text').select();
    }
  });
  $('select-text').addEventListener('click', () => { $('copy-text').focus(); $('copy-text').select(); });
  $('print-button').addEventListener('click', () => { if (result.valid) window.print(); });
  window.addEventListener('beforeprint', () => { $('print-text').textContent = result.valid ? toText(result) : 'Расчёт недоступен. Исправьте параметры в калькуляторе.'; });
  update();
  new ResizeObserver(fitPreview).observe($('size-preview'));
})();
