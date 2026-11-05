(function(root){
  'use strict';
  const money=value=>new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',minimumFractionDigits:0,maximumFractionDigits:2}).format(value);
  const number=value=>new Intl.NumberFormat('ru-RU').format(value);
  function calculate(input,pricing=root.CleanPricing){
    const errors={};
    if(!Object.hasOwn(pricing.types,input.type))errors.type='Выберите вид уборки.';
    function read(key){
      const raw=String(input[key]??'').trim(); const value=Number(raw); const [min,max]=pricing.limits[key];
      if(!/^\d+$/.test(raw)||!Number.isSafeInteger(value)||value<min||value>max)errors[key]=`Введите целое число от ${min} до ${max}.`;
      return value;
    }
    const area=read('area'),windows=read('windows');
    if(Object.keys(errors).length)return {valid:false,errors};
    const type=pricing.types[input.type]; const lines=[];
    const cents=value=>Math.round(value*100);
    const baseCents=cents(area*type.rate),minimumCents=cents(type.minimum);
    lines.push({kind:'base',label:type.name+' уборка',detail:`${number(area)} м² × ${money(type.rate)} / м²`,cents:baseCents});
    if(baseCents<minimumCents)lines.push({kind:'minimum',label:'До минимальной стоимости',detail:`База не ниже ${money(type.minimum)}`,cents:minimumCents-baseCents});
    if(windows)lines.push({kind:'windows',label:pricing.windows.label,detail:`${windows} × ${money(pricing.windows.rate)} / створка`,cents:cents(windows*pricing.windows.rate)});
    for(const [key,extra] of Object.entries(pricing.extras)){
      if(!type.includes.includes(key)&&input.extras?.[key]===true)lines.push({kind:key,label:extra.name,detail:'Фиксированная доплата',cents:cents(extra.price)});
    }
    const included=type.includes.map(key=>pricing.extras[key].name);
    return {valid:true,errors,type:input.type,typeName:type.name,area,windows,rate:type.rate,minimum:type.minimum,included,lines,totalCents:lines.reduce((sum,line)=>sum+line.cents,0),version:pricing.version};
  }
  function toText(r){
    if(!r.valid)return '';
    return ['ДОМА ЛЕГКО — расчёт уборки',`${r.typeName} уборка · ${r.area} м²`,`Количество створок: ${r.windows}`, '',...r.lines.map(l=>`${l.label}: ${l.detail} = ${money(l.cents/100)}`),...(r.included.length?['','В пакет включены без доплаты: '+r.included.join(', ')+'.']:[]),'',`Итого: ${money(r.totalCents/100)}`,'База: одна кухня и один санузел. Полы, доступные поверхности, кухня снаружи и сантехника.','Окна: обычные доступные створки, с двух сторон, без балконного, панорамного и высотного остекления.','Внутренняя уборка холодильника/шкафов — после освобождения; холодильник разморожен.',`${r.version}. Расчёт по демонстрационному прайсу. Цены условные.`,'Расчёт не оформляет заказ. После ремонта, сложные загрязнения и дополнительные помещения требуют отдельного согласования.'].join('\n');
  }
  const api={calculate,toText,money,number};root.CleanCalculator=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
