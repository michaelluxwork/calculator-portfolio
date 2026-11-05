(function(){
  'use strict';
  const $=id=>document.getElementById(id),pricing=CleanPricing;
  const {calculate,toText,money}=CleanCalculator;
  const form=$('cleaning-form'); const keys=Object.keys(pricing.extras);
  let result,previousType='regular',generation=0;
  $('area-help').textContent=`От ${pricing.limits.area[0]} до ${pricing.limits.area[1]} м² · целое число.`;
  $('windows-help').textContent=`${pricing.limits.windows.join('–')} створок · мытьё с двух сторон.`;
  $('windows-price').textContent=`${money(pricing.windows.rate)} / створка`;
  $('price-version').textContent=pricing.version;
  function update(){
    generation++;
    const typeKey=form.elements.type.value,type=pricing.types[typeKey];
    if(typeKey!==previousType){
      keys.forEach(key=>{$(key).checked=false});
      $('change-notice').textContent=type.includes.length?'Техника и шкафы внутри входят в генеральную уборку без доплаты.':'Платные дополнения сброшены. Выберите нужные заново.';
      previousType=typeKey;
    }
    keys.forEach(key=>{
      const included=type.includes.includes(key),checkbox=$(key);
      checkbox.disabled=included;if(included)checkbox.checked=true;
      const row=document.querySelector(`[data-extra-row="${key}"]`),price=document.querySelector(`[data-extra-price="${key}"]`);
      row.classList.toggle('included-state',included);price.textContent=included?'Включено':`+ ${money(pricing.extras[key].price)}`;
    });
    $('type-description').textContent=typeKey==='regular'?'Полы, доступные поверхности, кухня снаружи и сантехника.':'Базовая уборка и внутренние поверхности духовки, холодильника и кухонных шкафов.';
    $('scope-included').textContent=type.includes.length?'В генеральную дополнительно включены духовка, холодильник и кухонные шкафы внутри. Холодильник и шкафы нужно освободить; холодильник разморозить.':'Внутренние поверхности техники и шкафов добавляются отдельно. Окна не входят в базовую стоимость.';
    $('rate-note').textContent=`${money(type.rate)} / м² · минимальная стоимость ${money(type.minimum)}.`;
    result=calculate({type:typeKey,area:$('area').value,windows:$('windows').value,extras:Object.fromEntries(keys.map(key=>[key,$(key).checked]))});
    for(const key of ['area','windows']){$(key).setAttribute('aria-invalid',String(Boolean(result.errors[key])));$(`${key}-error`).textContent=result.errors[key]||'';}
    document.querySelectorAll('[data-area]').forEach(button=>button.setAttribute('aria-pressed',String(!result.errors.area&&Number($('area').value)===Number(button.dataset.area))));
    const windowsValue=Number($('windows').value),invalidWindows=Boolean(result.errors.windows);
    $('windows-minus').disabled=invalidWindows||windowsValue<=pricing.limits.windows[0];$('windows-plus').disabled=invalidWindows||windowsValue>=pricing.limits.windows[1];
    $('valid-result').hidden=!result.valid;$('invalid-result').hidden=result.valid;
    $('copy-button').disabled=$('print-button').disabled=!result.valid;
    $('copy-fallback').hidden=true;$('copy-text').value='';$('action-status').textContent='';$('print-text').textContent='';
    $('estimate-type').textContent=type.name+' уборка';
    if(!result.valid){$('estimate-area').textContent='Нет расчёта';$('live-summary').textContent='Проверьте параметры. Актуальный расчёт недоступен.';return;}
    $('estimate-area').textContent=`${result.area} м²`;
    $('cost-lines').replaceChildren(...result.lines.map(line=>{const row=document.createElement('div');row.className='cost-line';row.dataset.kind=line.kind;const label=document.createElement('span'),detail=document.createElement('small'),value=document.createElement('strong');label.textContent=line.label;detail.textContent=line.detail;value.textContent=money(line.cents/100);label.append(detail);row.append(label,value);return row}));
    $('included-summary').hidden=!result.included.length;
    $('included-summary').textContent=result.included.length?'Без доплаты: '+result.included.join(', ').toLowerCase()+'.':'';
    $('total-price').textContent=money(result.totalCents/100);$('live-summary').textContent=`Итого: ${money(result.totalCents/100)}.`;$('print-text').textContent=toText(result);
  }
  form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('input',update);form.addEventListener('change',update);
  document.querySelectorAll('[data-area]').forEach(button=>button.addEventListener('click',()=>{$('area').value=button.dataset.area;update()}));
  for(const [id,delta] of [['windows-minus',-1],['windows-plus',1]])$(id).addEventListener('click',()=>{$('windows').value=String(Number($('windows').value)+delta);update()});
  $('copy-button').addEventListener('click',async()=>{if(!result.valid)return;const text=toText(result),captured=generation;try{if(!navigator.clipboard?.writeText)throw new Error('unavailable');await navigator.clipboard.writeText(text);if(captured===generation)$('action-status').textContent='Расчёт скопирован.';}catch{if(captured!==generation)return;$('copy-text').value=text;$('copy-fallback').hidden=false;$('action-status').textContent='Автокопирование недоступно. Скопируйте текст ниже.';$('copy-text').focus();$('copy-text').select();}});
  $('select-text').addEventListener('click',()=>{$('copy-text').focus();$('copy-text').select()});
  $('print-button').addEventListener('click',()=>{if(result.valid)window.print()});
  window.addEventListener('beforeprint',()=>{$('print-text').textContent=result.valid?toText(result):'Расчёт недоступен. Исправьте параметры.'});
  update();
})();
