var KEY=document.body.dataset.key||"treinos-v1",S={lists:[],active:null},editing=false,openId=null,menuId=null,histId=null;
try{var r=localStorage.getItem(KEY);if(r){var p=JSON.parse(r);if(p&&Array.isArray(p.lists))S=p}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function cur(){return S.lists.find(function(l){return l.id===S.active})}
function pad(n){return n<10?"0"+n:""+n}
function wkey(d){var x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-((x.getDay()+6)%7));return x.getFullYear()+"-"+pad(x.getMonth()+1)+"-"+pad(x.getDate())}
function wlabel(k){var p=k.split("-"),a=new Date(+p[0],+p[1]-1,+p[2]),b=new Date(a.getFullYear(),a.getMonth(),a.getDate()+6);return pad(a.getDate())+"/"+pad(a.getMonth()+1)+" a "+pad(b.getDate())+"/"+pad(b.getMonth()+1)}
function rollWeek(){var k=wkey(new Date());if(!S.week){S.week=k;save();return false}if(S.week>=k)return false;S.lists.forEach(function(l){if(l.test)return;l.items.forEach(function(i){if(i.sets&&i.sets.length){(i.hist=i.hist||[]).push({w:S.week,sets:i.sets})}i.sets=[];i.done=false})});S.week=k;save();return true}
function renderHs(){
  var o=document.getElementById("hs"),l=cur(),it=histId&&l&&l.items.find(function(x){return x.id===histId});
  if(!it){histId=null;o.hidden=true;o.innerHTML="";document.body.style.overflow="";return}
  function rows(sets){return sets.map(function(s,n){return '<div class="hr"><span class="hn">Série '+(n+1)+'</span><span>'+esc(s.kg)+' kg</span><span>'+(s.reps?esc(s.reps)+' repetições':'-')+'</span></div>'}).join("")}
  function mx(sets){var m=Math.max.apply(null,sets.map(function(s){return parseFloat(String(s.kg).replace(",","."))}));return isNaN(m)?"":"máx "+m+" kg"}
  var cards=[];
  if(it.sets&&it.sets.length)cards.push('<div class="card hc"><div class="hcw"><span>Semana atual · '+wlabel(l.test&&l.simWeek?l.simWeek:(S.week||wkey(new Date())))+'</span><small>'+mx(it.sets)+'</small></div>'+rows(it.sets)+'</div>');
  (it.hist||[]).slice().reverse().forEach(function(x){var st=x.sets||[];cards.push('<div class="card hc"><div class="hcw"><span>Semana '+wlabel(x.w)+'</span><small>'+mx(st)+'</small></div>'+rows(st)+'</div>')});
  o.hidden=false;document.body.style.overflow="hidden";
  o.innerHTML='<div class="hsw"><button class="bk" data-bk="1">← Voltar</button><h2 class="hst">'+esc(it.text)+'</h2><p class="hsb">'+esc(l.name)+' · Histórico de cargas</p>'+(cards.length?cards.join(""):'<div class="em">Sem histórico ainda. As séries da semana atual vão para cá quando a semana virar.</div>')+'</div>'
}
function sum(i){return i.sets&&i.sets.length?'<small class="sm">'+i.sets.map(function(s,n){return "S"+(n+1)+": "+esc(s.kg)+" kg"+(s.reps?" - "+esc(s.reps)+" rep":"")}).join(" | ")+'</small>':''}
function lastHist(i){return (i.hist||[]).slice().sort(function(a,b){return a.w<b.w?-1:1}).pop()}
function cpBtn(i){var h=lastHist(i);return h&&h.sets&&h.sets.length?'<button class="g cpb" data-cp="'+i.id+'">Copiar da última semana ('+wlabel(h.w)+')</button>':''}
function copyLast(id){
  var l=cur(),it=l&&l.items.find(function(x){return x.id===id}),h=it&&lastHist(it);
  if(!h||!h.sets||!h.sets.length)return;
  if(it.sets&&it.sets.length&&!confirm("Substituir as séries atuais pelas da semana "+wlabel(h.w)+"?"))return;
  it.sets=h.sets.map(function(s){return {kg:s.kg,reps:s.reps}});save()
}
function panel(i){var la=(i.sets||[]).slice(-1)[0]||{kg:"",reps:""};return '<div class="pr">'+cpBtn(i)+(i.sets||[]).map(function(x,n){return '<div class="sr"><span>Série '+(n+1)+' · <b>'+esc(x.kg)+' kg</b>'+(x.reps?' × '+esc(x.reps)+' reps':'')+'</span><button class="x" data-rs="'+i.id+':'+n+'" aria-label="Remover série">×</button></div>'}).join("")+'<div class="row"><input id="kg" type="number" inputmode="decimal" step="0.5" min="0" placeholder="Carga (kg)" value="'+esc(la.kg)+'"><input id="rp" type="number" inputmode="numeric" min="0" placeholder="Reps" value="'+esc(la.reps)+'"><button id="as" data-as="'+i.id+'">+</button></div></div>'}
function addSet(id){var l=cur(),it=l&&l.items.find(function(x){return x.id===id}),k=document.getElementById("kg"),r=document.getElementById("rp");if(!it||!k||!k.value)return;(it.sets=it.sets||[]).push({kg:k.value,reps:r?r.value:""});save();render();var n=document.getElementById("kg");if(n)n.focus()}
function render(){render0();renderHs()}
function render0(){
  var t=document.getElementById("tabs");
  t.innerHTML=S.lists.map(function(l){return '<button class="tab'+(l.id===S.active?' on':'')+'" data-tab="'+l.id+'">'+esc(l.name)+'</button>'}).join("");
  var v=document.getElementById("view"),l=cur();
  if(!l){v.innerHTML='<div class="em">Crie seu primeiro treino acima, como “Costas” ou “Peito”.</div>';return}
  var d=l.items.filter(function(i){return i.done}).length;
  v.innerHTML='<div class="card"><div class="hd">'+(editing?'<input id="rn" value="'+esc(l.name)+'" maxlength="40"><button id="rok" style="margin-left:8px">OK</button>':'<h2>'+esc(l.name)+'</h2><span class="pg">'+d+'/'+l.items.length+' feitos</span>')+'</div>'
   +'<div class="row"><input id="ni" placeholder="Adicionar exercício (ex: Remada 4x10)" maxlength="80"><button id="ai">+</button></div>'
   +'<ul>'+(l.items.length?l.items.map(function(i){return '<li data-id="'+i.id+'" class="'+(i.done?'done':'')+'"><span class="dg" aria-label="Arrastar para reordenar" title="Arrastar para reordenar">⠿</span><button class="ck" data-ck="'+i.id+'" aria-label="Concluir">'+(i.done?'✓':'')+'</button><span class="t">'+esc(i.text)+sum(i)+'</span><button class="x" data-mn="'+i.id+'" aria-label="Mais opções">⋯</button>'+(menuId===i.id?'<div class="mn"><button class="opt" data-pg="'+i.id+'">📈 Progressão</button><button class="opt" data-hs="'+i.id+'">📅 Histórico</button><button class="del" data-rm="'+i.id+'">🗑 Excluir</button></div>':'')+(openId===i.id?panel(i):'')+'</li>'}).join(""):'<div class="em">Nenhum exercício ainda.</div>')+'</ul>'
   +'<div class="row" style="margin-top:10px;justify-content:space-between"><button class="g" id="rs">Desmarcar todos</button><button class="g" id="rnb">Renomear</button><button class="g" id="dl">Excluir treino</button></div></div>';
}
function addList(){var i=document.getElementById("nl"),n=i.value.trim();if(!n)return;var l={id:uid(),name:n,items:[]};S.lists.push(l);S.active=l.id;i.value="";save();render()}
function addItem(){var i=document.getElementById("ni"),n=i.value.trim(),l=cur();if(!n||!l)return;l.items.push({id:uid(),text:n,done:false});save();render();document.getElementById("ni").focus()}
function rename(){var l=cur(),i=document.getElementById("rn");if(l&&i&&i.value.trim())l.name=i.value.trim();editing=false;save();render()}
var dg=null;
document.addEventListener("pointerdown",function(e){var h=e.target.closest&&e.target.closest(".dg");if(!h)return;var li=h.closest("li");if(!li)return;dg={el:li,id:li.dataset.id,y0:e.clientY,to:null,moved:false};li.classList.add("drag");document.body.classList.add("dragging");try{h.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault()});
document.addEventListener("pointermove",function(e){if(!dg)return;dg.moved=true;dg.el.style.transform="translateY("+(e.clientY-dg.y0)+"px)";var lis=[].slice.call(dg.el.parentNode.children).filter(function(c){return c!==dg.el&&c.tagName==="LI"});lis.forEach(function(c){c.classList.remove("ov","ovb")});dg.to=null;for(var k=0;k<lis.length;k++){var r=lis[k].getBoundingClientRect();if(e.clientY<r.top+r.height/2){dg.to=lis[k];break}}if(dg.to)dg.to.classList.add("ov");else if(lis.length)lis[lis.length-1].classList.add("ovb")});
function endDrag(){if(!dg)return;var d=dg;dg=null;document.body.classList.remove("dragging");var l=cur();if(l&&d.moved){var it=l.items.find(function(x){return x.id===d.id});if(it){l.items.splice(l.items.indexOf(it),1);var ti=d.to?l.items.findIndex(function(x){return x.id===d.to.dataset.id}):-1;l.items.splice(ti<0?l.items.length:ti,0,it);save()}}render()}
document.addEventListener("pointerup",endDrag);
document.addEventListener("pointercancel",endDrag);
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&histId){histId=null;render()}});
document.addEventListener("visibilitychange",function(){if(!document.hidden&&rollWeek())render()});
document.getElementById("al").onclick=addList;
document.getElementById("nl").onkeydown=function(e){if(e.key==="Enter")addList()};
document.addEventListener("click",function(e){
  var b=e.target.closest("button");if(!b){if(menuId){menuId=null;render()}return}var l=cur();if(!b.dataset.mn)menuId=null;
  if(b.dataset.tab){S.active=b.dataset.tab;editing=false}
  else if(b.id==="ai"){return addItem()}
  else if(b.dataset.ck&&l){var it=l.items.find(function(x){return x.id===b.dataset.ck});if(it)it.done=!it.done}
  else if(b.dataset.rm&&l){l.items=l.items.filter(function(x){return x.id!==b.dataset.rm})}
  else if(b.id==="rs"&&l){l.items.forEach(function(x){x.done=false})}
  else if(b.id==="rnb"&&l){editing=true;render();var r=document.getElementById("rn");if(r){r.focus();r.select()}return}
  else if(b.id==="rok"&&l){return rename()}
  else if(b.dataset.mn&&l){if(openId===b.dataset.mn){openId=null;menuId=null}else{menuId=menuId===b.dataset.mn?null:b.dataset.mn}}
  else if(b.dataset.hs&&l){openId=null;histId=b.dataset.hs}
  else if(b.dataset.bk){histId=null}
  else if(b.dataset.pg&&l){histId=null;openId=openId===b.dataset.pg?null:b.dataset.pg}
  else if(b.dataset.rs&&l){var q=b.dataset.rs.split(":"),it2=l.items.find(function(x){return x.id===q[0]});if(it2&&it2.sets)it2.sets.splice(+q[1],1)}
  else if(b.dataset.as&&l){return addSet(b.dataset.as)}
  else if(b.dataset.cp&&l){copyLast(b.dataset.cp)}
  else if(b.id==="dl"&&l){if(!confirm("Excluir o treino "+l.name+"?"))return;S.lists=S.lists.filter(function(x){return x.id!==l.id});S.active=S.lists.length?S.lists[0].id:null;editing=false}
  else return;
  save();render();
});
document.addEventListener("keydown",function(e){if(e.key==="Enter"&&e.target.id==="ni")addItem();if(e.key==="Enter"&&e.target.id==="rn")rename();if(e.key==="Enter"&&(e.target.id==="kg"||e.target.id==="rp"))addSet(openId);if(e.key==="Escape"&&e.target.id==="rn"){editing=false;render()}});
function fdate(iso){var d=new Date(iso);return pad(d.getDate())+"/"+pad(d.getMonth()+1)+"/"+d.getFullYear()}
function bmsg(t){var m=document.getElementById("bkm");if(m)m.textContent=t}
function bstat(){bmsg(S.lastBackup?"Último backup: "+fdate(S.lastBackup):"Nenhum backup exportado ainda.")}
function exportBackup(){
  var now=new Date(),nome="treinos-backup-"+now.getFullYear()+"-"+pad(now.getMonth()+1)+"-"+pad(now.getDate())+".json";
  S.lastBackup=now.toISOString();save();
  var pacote={app:"gerenciador-de-treinos",versao:1,exportadoEm:S.lastBackup,dados:S};
  var blob=new Blob([JSON.stringify(pacote,null,2)],{type:"application/json"}),a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download=nome;document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(a.href)},1000);
  bmsg("Backup exportado: "+nome)
}
function cleanData(d){
  if(!d||!Array.isArray(d.lists))return null;
  var lists=d.lists.filter(function(l){return l&&typeof l==="object"}).map(function(l){
    l.id=l.id||uid();l.name=String(l.name||"Treino");
    l.items=(Array.isArray(l.items)?l.items:[]).filter(function(i){return i&&typeof i==="object"}).map(function(i){
      i.id=i.id||uid();i.text=String(i.text||"");i.done=!!i.done;
      i.sets=Array.isArray(i.sets)?i.sets:[];if(i.hist&&!Array.isArray(i.hist))i.hist=[];
      return i});
    return l});
  return {lists:lists,week:typeof d.week==="string"?d.week:null,lastBackup:d.lastBackup||null,active:d.active}
}
function importBackup(file){
  var r=new FileReader();
  r.onload=function(){
    var obj;try{obj=JSON.parse(r.result)}catch(e){bmsg("Arquivo inválido: não é um backup do app.");return}
    var d=cleanData(obj&&obj.dados?obj.dados:obj);
    if(!d){bmsg("Arquivo inválido: não é um backup do app.");return}
    var nx=d.lists.reduce(function(a,l){return a+l.items.length},0);
    if(!confirm("Importar "+d.lists.length+" treino(s) e "+nx+" exercício(s)? Isso substitui os dados atuais deste navegador."))return;
    try{localStorage.setItem(KEY+"-anterior",localStorage.getItem(KEY)||"")}catch(e){}
    S.lists=d.lists;S.week=d.week||undefined;S.lastBackup=d.lastBackup||undefined;
    S.active=S.lists.some(function(l){return l.id===d.active})?d.active:(S.lists.length?S.lists[0].id:null);
    editing=false;openId=null;menuId=null;histId=null;
    rollWeek();save();render();
    bmsg("Backup importado: "+d.lists.length+" treino(s), "+nx+" exercício(s).")
  };
  r.readAsText(file)
}
function initBackup(){
  var x=document.getElementById("bkx"),i=document.getElementById("bki"),f=document.getElementById("bkf");
  if(!x||!i||!f)return;
  x.onclick=exportBackup;i.onclick=function(){f.click()};
  f.onchange=function(){if(f.files[0])importBackup(f.files[0]);f.value=""};
  bstat()
}
if(!cur()&&S.lists.length)S.active=S.lists[0].id;
rollWeek();
render();
initBackup();