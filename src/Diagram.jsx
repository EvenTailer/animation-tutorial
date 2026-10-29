import React,{useId} from 'react';
export const motionFrames={run:['Контакт · правая','Сжатие','Толчок','Полёт','Контакт · левая','Сжатие','Толчок','Полёт'],jump:['Стойка','Приседание','Толчок','Вершина','Посадка','Восстановление'],hit:['Стойка','Замах','Разгон','Контакт','Возврат'],ball:['Ожидание','Сжатие','Отрыв','Подъём','Вершина','Падение','Контакт','Восстановление'],idle:['Вдох','Подъём груди','Выдох','Возврат']};
export function getDiagramType(l){return {'w7-l1':'ball','w7-l2':'ball','w7-l3':'idle','w2-l3':'light','w2-l1':'turn','w2-l2':'cylinders','w1-l3':'simpleduck','w3-l2':'silhouette','w4-l3':'turn'}[l.id]||l.diagram}
const ink='#39473d',green='#64825b',muted='#87947e';
function Label({x,y,children}){return <text x={x} y={y} fill={ink} fontSize="12" fontFamily="Arial,sans-serif">{children}</text>}
function Limb({points,color,width=14}){return <polyline points={points.map(p=>p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"/>}
// Keep the floor fixed while varying hips, knees and shoulders independently.
function pose(type,frame){
 const base={hip:[230,197],lean:0,legs:[[[215,197],[208,244],[200,288]],[[245,197],[250,244],[260,288]]],arms:[[[205,133],[182,164],[178,196]],[[251,133],[274,163],[280,193]]]};
 if(type==='run'){
  const n=frame%8,side=n<4?1:-1,k=n%4,hip=[230,[192,204,185,175][k]];
  const paths=[[[[285,236],[306,288]],[[190,237],[168,270]]],[[[259,250],[267,288]],[[188,216],[211,234]]],[[[209,244],[181,288]],[[265,207],[280,245]]],[[[185,215],[208,242]],[[270,220],[303,253]]]][k];
  const reflect=p=>[230+(p[0]-230)*side,p[1]];
  return {...base,hip,lean:10,legs:paths.map((p,i)=>[[230+(i?12:-12),hip[1]],...p.map(reflect)]),arms:[[[218,hip[1]-64],reflect([185,150]),reflect([177,174])],[[255,hip[1]-64],reflect([280,153]),reflect([268,123])]]};
 }
 if(type==='jump')return [base,
  {...base,hip:[230,225],lean:14,legs:[[[215,225],[185,251],[200,288]],[[245,225],[270,252],[260,288]]],arms:[[[218,161],[185,189],[159,180]],[[260,161],[287,185],[307,177]]]},
  {...base,hip:[230,178],lean:3,legs:[[[215,178],[211,229],[204,282]],[[245,178],[250,230],[259,282]]],arms:[[[206,114],[190,80],[200,59]],[[252,114],[273,81],[264,56]]]},
  {...base,hip:[230,157],lean:-4,legs:[[[215,157],[184,189],[202,224]],[[245,157],[277,187],[258,223]]],arms:[[[201,93],[178,76],[162,93]],[[247,93],[272,76],[287,93]]]},
  {...base,hip:[230,228],lean:18,legs:[[[215,228],[184,254],[200,288]],[[245,228],[274,254],[260,288]]],arms:[[[223,164],[184,181],[166,206]],[[265,164],[294,180],[307,206]]]},
  {...base,hip:[230,207],lean:4,legs:[[[215,207],[202,248],[200,288]],[[245,207],[260,248],[260,288]]]}][frame%6];
 if(type==='hit'){
  const n=frame%5,hip=[[224,202],[211,207],[234,202],[248,205],[232,202]][n],lean=[0,-12,13,22,5][n];
  const near=[[[247,138],[269,159],[263,131]],[[230,143],[194,153],[191,120]],[[270,138],[309,128],[337,120]],[[289,141],[338,136],[379,131]],[[260,138],[294,156],[281,135]]][n];
  return {...base,hip,lean,legs:[[[hip[0]-15,hip[1]],[197,248],[176,288]],[[hip[0]+15,hip[1]],[272,247],[291,288]]],arms:[[[hip[0]-23+lean,hip[1]-64],[hip[0]-36,174],[hip[0]-13,149]],near]};
 }
 if(type==='idle'){const d=[0,-4,-1,2][frame%4];return {...base,hip:[230,197+d],lean:[0,-1,0,1][frame%4],arms:base.arms.map(a=>a.map(p=>[p[0],p[1]+d]))}}
 return base;
}
function Duck({stage=2,type='body',frame=0,ghost=false,silhouette=false}){
 const p=pose(type,frame),[hx,hy]=p.hip,colored=stage>=2,solid=silhouette?'#35483b':null,tx=hx+p.lean,ty=hy-65,headY=ty-42,arm=solid||(colored?'#c8aa90':green),leg=solid||(colored?'#363b49':green);
 return <g opacity={ghost?.13:1} stroke={solid||ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
  {stage===0&&!silhouette&&<g stroke={muted} strokeWidth="1.4" strokeDasharray="5 5"><path d={`M${tx} ${headY-36}L${hx} ${hy}M${hx-60} ${hy}H${hx+60}`}/><ellipse cx={tx} cy={headY} rx="28" ry="31"/><ellipse cx={tx} cy={ty+28} rx="30" ry="37"/></g>}
  {p.legs.map((pts,i)=><g key={i}><Limb points={pts} color={leg} width={stage===0?4:20}/><Limb points={[[pts[2][0]-8,pts[2][1]+3],[pts[2][0]+14,pts[2][1]+3]]} color={solid||'#596257'} width={stage===0?4:11}/></g>)}
  <Limb points={p.arms[0]} color={arm} width={stage===0?4:12}/>
  <path d={`M${tx-25} ${ty}Q${tx} ${ty+10} ${tx+24} ${ty}L${hx+27} ${hy}Q${hx} ${hy+7} ${hx-29} ${hy}Z`} fill={solid||(colored?'#cbc5a4':'none')}/>
  {stage>=1&&<path d={`M${tx-11} ${headY+24}L${tx-12} ${ty+2}M${tx+12} ${headY+24}L${tx+13} ${ty+2}`}/>}
  <g transform={`translate(${tx} ${headY}) rotate(${p.lean/3})`}><path d={stage===0?'M-28 0A28 31 0 1 1 28 0A28 31 0 1 1 -28 0':'M-27 5Q-35 -20 -18 -28L-24 -39L-6 -31L2 -43L12 -30L25 -35L23 -24Q37 -12 27 12L15 28L-15 27Z'} fill={solid||(colored?'#d4b9a3':'none')}/><path d="M-21 7Q-7 0 11 8L30 15Q11 27 -19 20L-28 15Z" fill={solid||(colored?'#c89540':'none')}/>{stage>=1&&!silhouette&&<><path d="M-20 -7L-8 -5M7 -10L23 -8"/><circle cx="-13" cy="1" r="3" fill={ink}/><circle cx="15" cy="0" r="7" fill={colored?'#67b7bd':'none'}/><circle cx="15" cy="0" r="2" fill={ink}/></>}</g>
  <Limb points={p.arms[1]} color={arm} width={stage===0?4:13}/>
  {colored&&!silhouette&&<><path d={`M${hx-28} ${hy-5}H${hx+27}`} stroke="#655d49" strokeWidth="7"/><path d={`M${tx-8} ${ty+18}l-5 16m22 0l6 13`} stroke="#925e55"/><circle cx={p.arms[1][2][0]} cy={p.arms[1][2][1]} r="7" fill="#657c7a"/></>}
 </g>;
}
function Forms({stage,type}){
 if(type==='turn')return <g stroke={green} strokeWidth="2.5" fill="none">{[0,1,2].slice(0,stage+1).map(n=><g key={n} transform={`translate(${100+n*130} 155)`}><circle r="46"/><ellipse rx="46" ry="14" strokeDasharray="5 4"/><path d={`M${n===0?0:n===1?16:-16} -45Q${n===0?0:n===1?43:-43} 0 ${n===0?0:n===1?16:-16} 45`} strokeDasharray="5 4"/><path d={`M${n===2?-30:12} 8l${n===2?-42:42} 10l${n===2?20:-20} 15l${n===2?32:-32} -5Z`} fill="#d5b979"/><Label x="-38" y="86">{['Прямо','Поворот','Обратно'][n]}</Label></g>)}</g>;
 if(type==='simpleduck')return <g stroke={green} strokeWidth="3" fill="none">{[0,1,2].slice(0,stage+1).map(n=><g key={n} transform={`translate(${92+n*135} 164)`}><ellipse cy="22" rx={n===2?37:30} ry={n===2?35:47}/><circle cy="-45" r={n===2?36:28}/><path d="M20 -44L58 -30L22 -21ZM-15 66V96H-33M15 66V96H33"/>{n>0&&<><circle cx="9" cy="-48" r="3" fill={ink}/><path d="M-7 -71l10 -13l11 11"/></>}<Label x="-35" y="119">{['Формы','Собираем','Пропорции'][n]}</Label></g>)}</g>;
 return <g stroke={green} strokeWidth="2.5" fill="none"><g opacity={type==='cylinders'?.45:1}><ellipse cx="85" cy="117" rx="43" ry="47"/><ellipse cx="85" cy="117" rx="43" ry="13" strokeDasharray="5 4"/><path d="M85 70V164" strokeDasharray="5 4"/><Label x="64" y="185">Шар</Label></g>{(stage>=1||type==='cylinders')&&<g><path d="M162 84L208 65L251 86L208 107ZM162 84V155L208 179L251 156V86M208 107V179"/><Label x="178" y="202">Коробка</Label></g>}{(stage>=2||type==='cylinders')&&<g transform="translate(330 95)"><g transform="rotate(-27)"><ellipse rx="18" ry="8"/><path d="M-18 0V74M18 0V74"/><ellipse cy="74" rx="18" ry="8"/></g>{stage>=1&&<><circle cx="34" cy="67" r="17"/><g transform="translate(43 77) rotate(25)"><ellipse rx="15" ry="7"/><path d="M-15 0V69M15 0V69"/><ellipse cy="69" rx="15" ry="7"/></g></>}{stage>=2&&<path d="M0 -10L38 69L9 150" stroke="#bf9655" strokeDasharray="5 5"/>}<Label x="-24" y="183">{stage===0?'Цилиндр':stage===1?'Сустав':'Ось изгиба'}</Label></g>}</g>;
}
function Light({stage,id}){return <g><defs><clipPath id={id}><circle cx="136" cy="161" r="53"/></clipPath></defs><path d="M62 58L99 100M88 94L99 100L96 87" stroke="#b4964f" strokeWidth="3" fill="none"/><Label x="32" y="43">Свет сверху слева</Label><path d="M45 226H414" stroke="#c1c9b8"/>{stage>=2&&<><ellipse cx="169" cy="222" rx="75" ry="12" fill="#9aa28f"/><path d="M280 226L403 216L377 239L288 240Z" fill="#9aa28f"/></>}<circle cx="136" cy="161" r="53" fill="#dedfd4" stroke={ink} strokeWidth="2"/>{stage>=1&&<path d="M130 108Q91 177 148 216L205 215V102Z" clipPath={`url(#${id})`} fill="#8c9985"/>}<path d="M266 125L313 103L365 125L315 151Z" fill="#e8e7da" stroke={ink}/><path d="M266 125V210L315 236V151Z" fill={stage>=1?'#b4bdab':'#dedfd4'} stroke={ink}/><path d="M315 151L365 125V210L315 236Z" fill={stage>=1?'#7f8e79':'#dedfd4'} stroke={ink}/><Label x="85" y="275">{stage===0?'Большие формы':stage===1?'Собственная тень':'Падающая тень вправо'}</Label></g>}
function Ball({frame,stage}){const n=frame%8,ys=[245,263,226,151,95,169,265,251],scales=[[1,1],[1.35,1/1.35],[.8,1.25],[.95,1/.95],[1,1],[.82,1/.82],[1.4,1/1.4],[1.1,1/1.1]],s=scales[n];return <g><path d="M51 291H409" stroke={muted} strokeWidth="2"/><path d="M230 55V285" stroke="#b7bfac" strokeDasharray="5 6"/>{[95,151,226].map(y=><circle key={y} cx="230" cy={y} r="3" fill={muted}/>)}<ellipse cx="230" cy="291" rx={46-(291-ys[n])*.1} ry="7" fill="#c5cbb9"/><ellipse cx="230" cy={ys[n]} rx={36*s[0]} ry={36*s[1]} fill="#d4e7a1" stroke={ink} strokeWidth="3"/><path d={`M${230-20*s[0]} ${ys[n]-8*s[1]}Q230 ${ys[n]-19*s[1]} ${230+20*s[0]} ${ys[n]-8*s[1]}`} stroke={green} fill="none" strokeWidth="2"/><Label x="25" y="31">{stage===0?'Расстояние между позами меняет скорость':'При сжатии сохраняй площадь формы'}</Label><Label x="25" y="53">{motionFrames.ball[n]}</Label></g>}
function Head({stage}){return <g transform="translate(229 157) scale(1.8)" stroke={ink} strokeWidth="1.6" fill="none"><circle r="48" stroke={muted}/><path d="M0 -48Q18 0 0 48M-47 3Q0 21 47 3" stroke={green} strokeDasharray="4 4"/><path d="M-19 14L40 12L65 28L23 39L-25 29Z" fill={stage>=2?'#c89540':'none'}/>{stage>=1&&<><path d="M-32 -5L-11 -3M9 -7L32 -5"/><circle cx="-20" cy="4" r="4"/><circle cx="22" cy="3" r="11" fill={stage>=2?'#75b6bc':'none'}/><circle cx="22" cy="3" r="4"/></>}{stage>=2&&<path d="M-43 -21L-50 -36L-30 -32L-31 -52L-13 -41L-5 -61L8 -43L24 -57L25 -38L42 -46L38 -25" fill="#d4b9a3"/>}</g>}
export default function Diagram({type='body',stage=0,frame=0}){
 const id=useId().replace(/:/g,''),motion=!!motionFrames[type],count=motionFrames[type]?.length||1,f=((frame%count)+count)%count;
 let art;
 if(type==='lines')art=<g fill="none" strokeLinecap="round" strokeWidth="3">{Array.from({length:3},(_,i)=><g key={i} stroke={i<=stage?green:'#cbd0c3'}><circle cx="54" cy={90+i*70} r="3" fill={green}/><circle cx="198" cy={90+i*70} r="3" fill={green}/><path d={i===0?'M54 90H198':i===1?'M54 160L198 138':'M54 230Q126 164 198 230'}/><path d={`M258 ${90+i*70}q25 -35 50 0t50 0t50 0`}/></g>)}</g>;
 else if(['forms','cylinders','turn','simpleduck'].includes(type))art=<Forms stage={stage} type={type}/>;
 else if(type==='light')art=<Light stage={stage} id={`sphere-${id}`}/>;
 else if(type==='ball')art=<Ball stage={stage} frame={f}/>;
 else if(type==='head')art=<Head stage={stage}/>;
 else if(type==='color')art=<><Duck stage={stage>=1?2:1}/>{stage>=1&&['#d4b9a3','#c89540','#363b49','#67b7bd','#a54c75'].map((c,i)=><rect key={c} x={46+i*28} y="48" width="20" height="20" rx="3" fill={c}/>)}{stage>=2&&<><path d="M263 137L256 186L246 188L251 148Z" fill="#7f856d" opacity=".8"/><path d="M47 98L83 128" stroke="#b4964f" strokeWidth="3"/><Label x="37" y="88">Один свет</Label><Label x="290" y="210">Тень справа</Label></>}</>;
 else if(type==='rig'||type==='layers')art=<><Duck stage={2}/>{['head','torso','arm_L','leg_L'].slice(0,stage+1).map((n,i)=><g key={n} transform={`translate(24 ${53+i*43})`}><rect width="112" height="33" rx="5" fill="#e0e6d3" stroke="#a5b793"/><Label x="10" y="21">{n}</Label></g>)}{stage>=2&&<><circle cx="254" cy="134" r="17" fill="none" stroke="#b98d48" strokeDasharray="4 4"/><Label x="287" y="128">Запас под</Label><Label x="287" y="144">суставом</Label></>}</>;
 else art=<><path d="M82 297H406" stroke="#b7c0aa" strokeWidth="2"/>{motion&&<Duck stage={2} type={type} frame={(f+count-1)%count} ghost/>}<Duck stage={motion?2:stage} type={type} frame={f} silhouette={type==='silhouette'}/>{type==='hit'&&f===3&&<path d="M398 114l-8 10l13 5l-10 8" stroke="#b98d48" strokeWidth="3" fill="none"/>}{motion&&<Label x="26" y="35">{motionFrames[type][f]}</Label>}</>;
 return <svg viewBox="0 0 460 340" role="img" aria-label={`Учебная схема, ${motion?motionFrames[type][f]:`этап ${stage+1}`}`}><defs><pattern id={`grid-${id}`} width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#c1c8b8"/></pattern></defs><rect width="460" height="340" fill="#f1f2e9"/><rect width="460" height="340" fill={`url(#grid-${id})`}/>{art}<text x="18" y="326" fill="#68765e" fontSize="9" letterSpacing="1.4">УЧЕБНАЯ СХЕМА · ПОВТОРИ НА ПЛАНШЕТЕ</text></svg>;
}

