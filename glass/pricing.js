(function(root){
  'use strict';
  const pricing={version:'Демо-прайс 01 · 02.11.2026',limits:{width:[1600,6000],height:[2200,3200],bays:[2,6],quantity:[1,20],discount:[0,15]},glass:{clear:{name:'Прозрачное',rate:800000},frosted:{name:'Матовое',rate:1100000},smoke:{name:'Дымчатое',rate:1250000}},profiles:{black:{name:'Чёрный',surcharge:12},silver:{name:'Серебристый',surcharge:0}},profileRate:450000,doorKit:2000000,installationPercent:15,delivery:250000,doorWidth:900,doorHeight:2100,minBayWidth:300};
  root.PartitionPricing=pricing;if(typeof module!=='undefined'&&module.exports)module.exports=pricing;
})(globalThis);
