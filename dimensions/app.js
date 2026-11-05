(function(){
  'use strict';
  const $=id=>document.getElementById(id),pricing=MerkaPricing,{calculate,toText,money,decimal}=Merka,form=$('panel-form');
  const keys=['length','width','thickness','quantity'];let result,generation=0;
  document.querySelectorAll('[data-rate]').forEach(el=>{el.textContent=`${decimal(pricing.materials[el.dataset.rate].rate)} ₽`;});
  for(const key of keys)$(`${key}-help`).textContent=pricing.limits[key].join('–')+(key==='quantity'?' шт.':' мм');
  $('price-version').textContent=pricing.version;
  const points=values=>values.map(p=>p.map(n=>n.toFixed(3)).join(',')).join(' ');
  // Illustrative grain follows the projected top face; it never changes panel geometry.
  const grain=$('panel-grain');
  for(let i=0;i<64;i++){
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    const y=6+i*9.2+Math.sin(i*1.7)*2,amplitude=5+(i%7)*3;
    path.setAttribute('d',`M 0 ${y} C 160 ${y-amplitude} 270 ${y+amplitude} 460 ${y+Math.sin(i*.4)*5} S 770 ${y-amplitude*.5} 1000 ${y}`);
    path.setAttribute('stroke-width',String(.5+(i%4)*.35));
    grain.appendChild(path);
  }
  function draw(r){
    const g=MerkaDrawing.project(r.length,r.width,r.thickness),m=pricing.materials[r.material];
    grain.setAttribute('transform',`matrix(${(g.b[0]-g.a[0])/1000} ${(g.b[1]-g.a[1])/1000} ${(g.d[0]-g.a[0])/600} ${(g.d[1]-g.a[1])/600} ${g.a[0]} ${g.a[1]})`);
    for(const face of ['top','front','side']){const el=$('panel-'+face);el.setAttribute('points',points(g[face]));el.setAttribute('fill',m[face]);}
    for(const key of ['length','width','thickness']){
      $(key+'-line').setAttribute('points',points(g[key+'Line']));
      $(key+'-letter').setAttribute('x',g[key+'Label'][0]);$(key+'-letter').setAttribute('y',g[key+'Label'][1]);
      document.querySelector(`[data-dimension="${key}"]`).textContent=`${decimal(r[key])} мм`;
    }
    $('thickness-leader').setAttribute('d',`M ${g.b[0]} ${g.b[1]} H ${g.b[0]+38}`);
    ['cx','cy','rx','ry'].forEach((attr,i)=>$('panel-shadow').setAttribute(attr,g.shadow[i]));
    $('drawing-description').textContent=`Схема одной панели: длина ${decimal(r.length)} мм, ширина ${decimal(r.width)} мм, толщина ${decimal(r.thickness)} мм. Единый масштаб осей изометрии.`;
    $('panel-diagram').dataset.scale=g.scale; $('diagram-material').textContent=r.materialName;
  }
  function update(){
    generation++;const material=form.elements.material.value;
    result=calculate({material,...Object.fromEntries(keys.map(key=>[key,$(key).value]))});
    for(const key of keys){$(key).setAttribute('aria-invalid',String(Boolean(result.errors[key])));$(`${key}-error`).textContent=result.errors[key]||'';}
    document.querySelectorAll('[data-length]').forEach(button=>button.setAttribute('aria-pressed',String(!result.errors.length&&!result.errors.width&&Number($('length').value)===Number(button.dataset.length)&&Number($('width').value)===Number(button.dataset.width))));
    const q=Number($('quantity').value),invalidQ=Boolean(result.errors.quantity);
    $('quantity-minus').disabled=invalidQ||q<=pricing.limits.quantity[0];$('quantity-plus').disabled=invalidQ||q>=pricing.limits.quantity[1];
    $('valid-result').hidden=!result.valid;$('invalid-result').hidden=result.valid;$('copy-result').disabled=$('print-result').disabled=!result.valid;
    $('panel-diagram').toggleAttribute('hidden',!result.valid);$('diagram-dimensions').hidden=!result.valid;$('diagram-error').hidden=result.valid;
    $('copy-fallback').hidden=true;$('copy-text').value='';$('action-status').textContent='';$('print-text').textContent='';
    if(!result.valid){$('diagram-material').textContent='Нет расчёта';$('live-summary').textContent='Проверьте параметры. Актуальный расчёт недоступен.';return;}
    draw(result);
    $('unit-volume').textContent=decimal(result.volume)+' м³';$('total-volume').textContent=decimal(result.totalVolume)+' м³';$('selected-rate').textContent=money(result.rate)+' / м³';
    $('unit-price').textContent=money(result.unitCents/100);$('total-label').textContent=`За ${result.quantity} шт.`;$('total-price').textContent=money(result.totalCents/100);
    $('live-summary').textContent=`Цена одной панели ${money(result.unitCents/100)}, за ${result.quantity} шт.: ${money(result.totalCents/100)}.`;$('print-text').textContent=toText(result);
  }
  form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('input',update);form.addEventListener('change',update);
  document.querySelectorAll('[data-length]').forEach(button=>button.addEventListener('click',()=>{$('length').value=button.dataset.length;$('width').value=button.dataset.width;update()}));
  for(const[id,delta]of[['quantity-minus',-1],['quantity-plus',1]])$(id).addEventListener('click',()=>{$('quantity').value=String(Number($('quantity').value)+delta);update()});
  $('copy-result').addEventListener('click',async()=>{if(!result.valid)return;const text=toText(result),current=generation;try{if(!navigator.clipboard?.writeText)throw new Error('unavailable');await navigator.clipboard.writeText(text);if(current===generation)$('action-status').textContent='Расчёт скопирован.';}catch{if(current!==generation)return;$('copy-fallback').hidden=false;$('copy-text').value=text;$('action-status').textContent='Автокопирование недоступно. Выделите и скопируйте текст ниже.';$('copy-text').focus();$('copy-text').select();}});
  $('select-text').addEventListener('click',()=>{$('copy-text').focus();$('copy-text').select()});$('print-result').addEventListener('click',()=>{if(result.valid)window.print()});
  window.addEventListener('beforeprint',()=>{$('print-text').textContent=result.valid?toText(result):'Расчёт недоступен. Исправьте параметры.'});
  update();
})();
