(function(root){
  'use strict';
  function project(r){
    const scale=Math.min(620/r.width,420/r.height),width=r.width*scale,height=r.height*scale,x=(780-width)/2,bottom=475,y=bottom-height;
    const widths=r.door?[r.doorWidth,...Array(r.bays-1).fill(r.fixedBayWidth)]:Array(r.bays).fill(r.fixedBayWidth);
    let cursor=x;const bays=widths.map((w,i)=>{const bay={x:cursor,y,width:w*scale,height,index:i};cursor+=bay.width;return bay;});
    return {scale,x,y,width,height,bottom,bays,doorWidth:r.door?r.doorWidth*scale:0,doorHeight:r.door?r.doorHeight*scale:0};
  }
  root.PartitionDrawing={project};if(typeof module!=='undefined'&&module.exports)module.exports=root.PartitionDrawing;
})(globalThis);
