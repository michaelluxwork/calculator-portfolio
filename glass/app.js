(function(){
  'use strict';
  const $=id=>document.getElementById(id),{calculate,toText,money,number}=PartitionCalc,form=$('partition-form'),numeric=['width','height','bays','quantity','discount'];let result,generation=0,mediaMode='interior';
  function applyMedia(){
    const interior=mediaMode==='interior';
    $('interior-view').hidden=!interior;$('scheme-view').hidden=interior;
    $('interior-button').setAttribute('aria-pressed',String(interior));$('scheme-button').setAttribute('aria-pressed',String(!interior));
    document.querySelector('.product-media').dataset.view=mediaMode;
    $('interior-note').hidden=!interior;$('scheme-note').hidden=interior;$('scene-finish').hidden=interior;
    document.querySelector('.scene-readout').hidden=interior||!result?.valid;
  }
  const svg=(tag,attrs={})=>{const node=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value]of Object.entries(attrs))node.setAttribute(key,String(value));return node;};
  const line=(parent,x1,y1,x2,y2,extra={})=>parent.appendChild(svg('line',{x1,y1,x2,y2,...extra}));
  function drawInterior(){
    const layers=$('interior-layers'),defs=$('partition-diagram').querySelector('defs').cloneNode(true);
    for(const node of defs.querySelectorAll('[id]'))node.id='interior-'+node.id;
    const subject=svg('g',{transform:'matrix(1.026 0 0 1.095 6.8 -9.125)'});
    // A fixed photographic registration is illustrative; the separate scheme keeps exact proportions.
    for(const id of ['panel-shadow','glass-panels','glass-reflections','frame-lines','door-hardware']){
      const group=$(id).cloneNode(true);group.removeAttribute('id');group.dataset.layer=id;
      for(const node of [group,...group.querySelectorAll('*')]){
        node.removeAttribute('id');
        for(const key of ['fill','filter']){const value=node.getAttribute(key);if(value?.startsWith('url(#'))node.setAttribute(key,value.replace('url(#','url(#interior-'));}
      }
      if(id==='glass-reflections')group.setAttribute('opacity','.035');
      subject.appendChild(group);
    }
    layers.replaceChildren(defs,subject);
    $('interior-svg-description').textContent='Интерьерный фон условный. '+$('scene-svg-description').textContent;
  }
  function draw(r){
    const g=PartitionDrawing.project(r),glass=$('glass-panels'),frames=$('frame-lines'),reflections=$('glass-reflections'),hardware=$('door-hardware'),dimensions=$('dimension-lines'),labels=$('dimension-labels'),shadow=$('panel-shadow');
    for(const group of [glass,frames,reflections,hardware,dimensions,labels,shadow])group.replaceChildren();
    const color=r.profile==='black'?'#252925':'#9da49c';frames.setAttribute('stroke',color);frames.setAttribute('stroke-width','4.5');
    for(const bay of g.bays){glass.appendChild(svg('rect',{x:bay.x,y:g.y,width:bay.width,height:g.height,fill:`url(#glass-${r.glass})`}));reflections.appendChild(svg('path',{d:`M ${bay.x+bay.width*.15} ${g.y} H ${bay.x+bay.width*.25} L ${bay.x+bay.width*.7} ${g.bottom} H ${bay.x+bay.width*.6} Z`}));if(bay.index)line(frames,bay.x,g.y,bay.x,g.bottom);}
    line(frames,g.x,g.y,g.x+g.width,g.y);line(frames,g.x,g.y,g.x,g.bottom);line(frames,g.x+g.width,g.y,g.x+g.width,g.bottom);line(frames,g.x+g.doorWidth,g.bottom,g.x+g.width,g.bottom);
    if(r.door){const head=g.bottom-g.doorHeight;line(frames,g.x,head,g.x+g.doorWidth,head);line(hardware,g.x+g.doorWidth-12,g.bottom-1050*g.scale,g.x+g.doorWidth-12,g.bottom-850*g.scale,{stroke:color,'stroke-width':4});for(const h of [.2,.8])hardware.appendChild(svg('rect',{x:g.x-3,y:head+(g.doorHeight-12)*h,width:6,height:12,fill:color}));}
    shadow.appendChild(svg('path',{d:`M ${g.x} ${g.bottom+3} H ${g.x+g.width} L ${g.x+g.width+34} ${g.bottom+22} H ${g.x+25} Z`,fill:'#202a22'}));
    const label=(x,y,text,rotate)=>{const node=svg('text',{x,y,'text-anchor':'middle',...(rotate?{transform:`rotate(${rotate} ${x} ${y})`}:{})});node.textContent=text;labels.appendChild(node);};
    line(dimensions,g.x,520,g.x+g.width,520);for(const x of[g.x,g.x+g.width]){line(dimensions,x,511,x,529);line(dimensions,x,g.bottom+10,x,530)}label(g.x+g.width/2,546,number(r.width)+' мм');
    line(dimensions,g.x-28,g.y,g.x-28,g.bottom);for(const y of[g.y,g.bottom])line(dimensions,g.x-35,y,g.x-19,y);label(g.x-40,g.y+g.height/2,number(r.height)+' мм',-90);
    $('scene-svg-description').textContent=`Один прямой сегмент ${number(r.width)} на ${number(r.height)} мм, ${r.bays} секции. ${r.door?'Дверь 900 на 2100 мм, фрамуга сверху.':'Без двери.'} ${r.glassName} стекло, ${r.profileName.toLowerCase()} профиль. Условная схема, не рабочий чертёж.`;
    $('partition-diagram').dataset.scale=g.scale;$('scene-finish').textContent=r.glassName+' / '+r.profileName.toLowerCase();$('scene-width').textContent=number(r.width)+' мм';$('scene-height').textContent=number(r.height)+' мм';$('scene-bays').textContent=r.bays;
    drawInterior();
  }
  function renderLines(r){$('cost-lines').replaceChildren();for(const item of r.lines){const row=document.createElement('tr');row.dataset.kind=item.id;for(const [index,text]of [item.label,number(item.quantity)+' '+item.unit,item.rateCents!==undefined?money(item.rateCents):number(item.quantity)+'% от '+money(item.basisCents),money(item.amountCents)].entries()){const cell=document.createElement(index===0?'th':'td');if(index===0)cell.scope='row';cell.dataset.label=['Позиция','Количество','Тариф / база','Сумма'][index];cell.textContent=text;if(index===0){const note=document.createElement('small');note.textContent=item.note;cell.appendChild(note);}row.appendChild(cell);}$('cost-lines').appendChild(row);}}
  function update(){
    generation++;result=calculate({...Object.fromEntries(numeric.map(key=>[key,$(key).value])),glass:form.elements.glass.value,profile:form.elements.profile.value,...Object.fromEntries(['door','installation','delivery'].map(key=>[key,$(key).checked]))});
    for(const key of numeric){$(key).setAttribute('aria-invalid',String(Boolean(result.errors[key])));$(key+'-error').textContent=result.errors[key]||'';}
    $('valid-estimate').hidden=!result.valid;$('invalid-estimate').hidden=result.valid;$('valid-specification').hidden=!result.valid;$('specification-error').hidden=result.valid;$('partition-diagram').toggleAttribute('hidden',!result.valid);document.querySelector('.scene-readout').hidden=!result.valid;$('scene-error').hidden=result.valid;$('copy-result').disabled=$('print-result').disabled=!result.valid;
    $('copy-fallback').hidden=true;$('copy-text').value='';$('action-status').textContent='';$('print-text').textContent='';$('interior-overlay').toggleAttribute('hidden',!result.valid);$('interior-error').hidden=result.valid;applyMedia();
    $('mobile-total-price').textContent=result.valid?money(result.totalCents):'Проверьте параметры';
    $('mobile-total-link').href=result.valid?'#estimate':'#dimensions';
    if(!result.valid){$('scene-finish').textContent='Нет расчёта';$('cost-lines').replaceChildren();$('live-summary').textContent='Проверьте параметры. Актуальный расчёт недоступен.';return;}
    draw(result);renderLines(result);$('total-price').textContent=$('spec-total').textContent=money(result.totalCents);$('estimate-quantity').textContent=`За ${result.quantity} шт. · ${number(result.area)} м² стекла · ${number(result.profileLength)} пог. м профиля`;$('glass-area').textContent=number(result.area)+' м²';$('door-area').textContent=result.door?'В том числе '+number(result.doorArea)+' м² дверного стекла':'Без дверного стекла';$('profile-length').textContent=number(result.profileLength)+' пог. м';$('materials-price').textContent=money(result.materialsCents);$('print-text').textContent=toText(result);$('live-summary').textContent=`Предварительная стоимость за ${result.quantity} шт.: ${money(result.totalCents)}. Тарифы условные.`;
  }
  form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('input',update);form.addEventListener('change',update);$('price-version').textContent=PartitionPricing.version;
  for(const[button,mode]of[['interior-button','interior'],['scheme-button','scheme']])$(button).addEventListener('click',()=>{mediaMode=mode;applyMedia()});
  document.querySelectorAll('a[href="#specification"]').forEach(link=>link.addEventListener('click',()=>{$('specification').open=true}));
  $('copy-result').addEventListener('click',async()=>{if(!result.valid)return;const text=toText(result),current=generation;try{if(!navigator.clipboard?.writeText)throw new Error('unavailable');await navigator.clipboard.writeText(text);if(generation===current)$('action-status').textContent='Расчёт скопирован.';}catch{if(generation!==current)return;$('action-status').textContent='Автокопирование недоступно. Скопируйте текст ниже.';$('copy-fallback').hidden=false;$('copy-text').value=text;$('copy-text').focus();$('copy-text').select();}});
  $('select-text').addEventListener('click',()=>{$('copy-text').focus();$('copy-text').select()});$('print-result').addEventListener('click',()=>{if(result.valid)window.print()});window.addEventListener('beforeprint',()=>{$('print-text').textContent=result.valid?toText(result):'Расчёт недоступен. Исправьте параметры.'});update();
})();
