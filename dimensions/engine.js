(function(root){
  'use strict';
  const money=value=>new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',minimumFractionDigits:0,maximumFractionDigits:2}).format(value);
  const decimal=value=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:10}).format(value);
  function calculate(input,pricing=root.MerkaPricing){
    const errors={};if(!Object.hasOwn(pricing.materials,input.material))errors.material='Выберите материал.';
    function read(key,fraction=false){
      const raw=String(input[key]??'').trim(),value=Number(raw.replace(',','.')),[min,max]=pricing.limits[key];
      if(!(fraction?/^\d+(?:[.,]\d)?$/:/^\d+$/).test(raw)||!Number.isFinite(value)||value<min||value>max)errors[key]=fraction?`От ${min} до ${max} мм, до одного знака после запятой.`:`Введите целое число от ${min} до ${max}.`;
      return value;
    }
    const length=read('length'),width=read('width'),thickness=read('thickness',true),quantity=read('quantity');
    if(Object.keys(errors).length)return {valid:false,errors};
    const material=pricing.materials[input.material];
    const numerator=length*width*Math.round(thickness*10);
    // Exact positive half-up rounding: dimensions are integer tenths of mm, rate is kopecks/m³.
    const denominator=10000000000n;
    const unitCents=Number((BigInt(numerator)*BigInt(Math.round(material.rate*100))+denominator/2n)/denominator);
    const volume=numerator/Number(denominator);
    return {valid:true,errors,material:input.material,materialName:material.name,length,width,thickness,quantity,volume,totalVolume:volume*quantity,rate:material.rate,unitCents,totalCents:unitCents*quantity,version:pricing.version};
  }
  function toText(r){
    if(!r.valid)return '';
    return ['МЕРКА — стоимость материала панели',`Материал: ${r.materialName}`,`Длина: ${decimal(r.length)} мм`,`Ширина: ${decimal(r.width)} мм`,`Толщина: ${decimal(r.thickness)} мм`,`Количество: ${r.quantity} шт.`,'',`Объём одной панели: ${decimal(r.volume)} м³`,`Общий объём: ${decimal(r.totalVolume)} м³`,`Тариф: ${money(r.rate)} / м³`,`За одну панель: ${money(r.unitCents/100)}`,`Итого: ${money(r.unitCents/100)} × ${r.quantity} = ${money(r.totalCents/100)}`,'','Цена одной панели округляется до копейки, затем умножается на количество. Объём перед расчётом не округляется.',`${r.version}. Расчёт по демонстрационному прайсу. Цены условные.`,'Только стоимость материала. Резка, отделка, отходы, доставка и прочие работы не включены.','Пределы ввода — границы модели, не наличие или производственный допуск. Схема не является производственным чертежом. Расчёт не оформляет заказ.'].join('\n');
  }
  const api={calculate,toText,money,decimal};root.Merka=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
