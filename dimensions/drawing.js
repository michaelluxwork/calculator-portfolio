(function(root){
  'use strict';
  function project(length,width,thickness){
    if(![length,width,thickness].every(v=>Number.isFinite(v)&&v>0))throw new RangeError('Positive dimensions required');
    const cosine=Math.sqrt(3)/2,spanX=(length+width)*cosine,spanY=(length+width)/2+thickness;
    const scale=Math.min(560/spanX,320/spanY);
    const left=(760-spanX*scale)/2,top=(420-spanY*scale)/2+5;
    const a=[left+width*cosine*scale,top];
    const b=[a[0]+length*cosine*scale,a[1]+length*.5*scale];
    const c=[b[0]-width*cosine*scale,b[1]+width*.5*scale];
    const d=[a[0]-width*cosine*scale,a[1]+width*.5*scale];
    const down=p=>[p[0],p[1]+thickness*scale],bb=down(b),cb=down(c),db=down(d);
    const shift=(p,x,y)=>[p[0]+x,p[1]+y];
    return {scale,a,b,c,d,bb,cb,db,top:[a,b,c,d],front:[b,c,cb,bb],side:[d,c,cb,db],
      lengthLine:[shift(d,-16,29),shift(c,-16,29)],widthLine:[shift(b,18,29),shift(c,18,29)],
      thicknessLine:[shift(b,27,0),shift(bb,27,0)],
      lengthLabel:[(d[0]+c[0])/2-25,(d[1]+c[1])/2+52],
      widthLabel:[(b[0]+c[0])/2+40,(b[1]+c[1])/2+45],
      thicknessLabel:[b[0]+49,b[1]+9],
      shadow:[380,cb[1]+13,spanX*scale*.43,13]};
  }
  root.MerkaDrawing={project};if(typeof module!=='undefined'&&module.exports)module.exports=root.MerkaDrawing;
})(globalThis);
