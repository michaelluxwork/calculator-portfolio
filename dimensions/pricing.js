/* Условные тарифы материала, не цены и не ассортимент поставщика. */
(function(root){
  root.MerkaPricing={
    version:'Прайс 01 · 02.11.2026',
    limits:{length:[100,3000],width:[100,1200],thickness:[5,80],quantity:[1,100]},
    materials:{
      pine:{name:'Сосна',rate:45000,top:'#e4c89c',front:'#cba675',side:'#b58b59'},
      birch:{name:'Берёза',rate:75000,top:'#ebdfc3',front:'#d4c3a0',side:'#baa57d'},
      oak:{name:'Дуб',rate:135000,top:'#c59a65',front:'#a67a48',side:'#896038'}
    }
  };
  if(typeof module!=='undefined'&&module.exports)module.exports=root.MerkaPricing;
})(globalThis);
