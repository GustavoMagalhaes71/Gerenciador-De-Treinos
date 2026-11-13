var KEY=document.body.dataset.key||"treinos-v1",S={lists:[],active:null},editing=false,openId=null,menuId=null,histId=null,lastG="",addMode=null,addMenu=false,addAt="",gmId=null,inList=false,addNew=false;
try{var r=localStorage.getItem(KEY);if(r){var p=JSON.parse(r);if(p&&Array.isArray(p.lists))S=p}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function cur(){return S.lists.find(function(l){return l.id===S.active})}
var GDEF=["Peito","Ombro","Tríceps","Costas","Bíceps","Quadríceps","Posterior","Glúteos","Panturrilha","Abdômen","Antebraço","Trapézio"];
function gk(i){return String(i.g||"").trim().toLowerCase()}
function gsync(l){var out=[],seen={};function add(g){g=String(g||"").trim();var k=g.toLowerCase();if(g&&!seen[k]){seen[k]=1;out.push(g)}}(Array.isArray(l.groups)?l.groups:[]).forEach(add);l.items.forEach(function(i){add(i.g)});l.groups=out;return out}
function ensureGroup(l,g){g=String(g||"").trim();if(!g)return "";var k=g.toLowerCase(),f=gsync(l).find(function(x){return x.toLowerCase()===k});if(f)return f;l.groups.push(g);return g}
function place(l,it){var k=gk(it),at=-1;l.items=l.items.filter(function(x){return x!==it});for(var n=l.items.length-1;n>=0;n--){if(gk(l.items[n])===k){at=n+1;break}}if(at<0)at=l.items.length;l.items.splice(at,0,it)}
function groupOpts(l){var k={};gsync(l).forEach(function(g){k[g.toLowerCase()]=1});return GDEF.filter(function(g){return !k[g.toLowerCase()]}).map(function(g){return '<option value="'+esc(g)+'">'}).join("")}
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
function liHtml(i){return '<li data-id="'+i.id+'" data-g="'+esc(gk(i))+'" class="'+(i.done?'done':'')+'"><span class="dg" aria-label="Arrastar para reordenar" title="Arrastar para reordenar">⠿</span><button class="ck" data-ck="'+i.id+'" aria-label="Concluir">'+(i.done?'✓':'')+'</button><span class="t">'+esc(i.text)+sum(i)+'</span><button class="x" data-mn="'+i.id+'" aria-label="Mais opções">⋯</button>'+(menuId===i.id?'<div class="mn"><button class="opt" data-pg="'+i.id+'">📈 Progressão</button><button class="opt" data-hs="'+i.id+'">📅 Histórico</button><button class="opt" data-gp="'+i.id+'">🏷 Grupo</button><button class="del" data-rm="'+i.id+'">🗑 Excluir</button></div>':'')+(openId===i.id?panel(i):'')+'</li>'}
function exForm(l,sel){var gs=gsync(l);return '<div class="af">'+(sel?'<select id="ngs" aria-label="Grupo"><option value="">Sem grupo</option>'+gs.map(function(g){return '<option value="'+esc(g)+'"'+(g.toLowerCase()===addAt?' selected':'')+'>'+esc(g)+'</option>'}).join("")+'</select>':'')+'<div class="row"'+(sel?' style="margin-top:8px"':'')+'><input id="ni" placeholder="Exercício (ex: Supino Reto 3x8-12)" maxlength="80"><button id="ai">+</button><button class="g" data-ac="1" aria-label="Fechar">✕</button></div></div>'}
function topHtml(l){
  if(addMode==="g")return '<div class="row"><input id="ngn" list="gl" placeholder="Nome do grupo (ex: Peito)" maxlength="30" autocomplete="off"><button id="gok">OK</button><button class="g" data-ac="1" aria-label="Cancelar">✕</button></div><datalist id="gl">'+groupOpts(l)+'</datalist>';
  if(addMode==="e")return exForm(l,true);
  return '<div class="row"><button id="plus" class="addb" aria-haspopup="true" aria-expanded="'+addMenu+'">+ Adicionar</button></div>'+(addMenu?'<div class="addm"><button class="opt" data-am="g">Adicionar grupo</button><button class="opt" data-am="e">Adicionar exercício</button></div>':'')
}
function listHtml(l){
  var gs=gsync(l);
  if(!l.items.length&&!gs.length)return '<div class="em">Nenhum exercício ainda.</div>';
  var h=l.items.filter(function(i){return !gk(i)}).map(liHtml).join("");
  gs.forEach(function(g){var k=g.toLowerCase();
    h+='<li class="gh"><span class="gt">'+esc(g)+'</span><button class="x gx" data-gm="'+esc(k)+'" aria-label="Opções do grupo">⋯</button>'+(gmId===k?'<div class="mn"><button class="opt" data-gr="'+esc(k)+'">✏️ Renomear</button><button class="del" data-gd="'+esc(k)+'">🗑 Excluir grupo</button></div>':'')+'</li>';
    if(addMode==="eg"&&addAt===k)h+='<li class="afl">'+exForm(l,false)+'</li>';
    h+=l.items.filter(function(i){return gk(i)===k}).map(liHtml).join("")});
  return h
}
function cardHtml(l){
  var d=l.items.filter(function(i){return i.done}).length,gs=gsync(l);
  return '<button class="tc" data-open="'+l.id+'"><span class="tcr"><span class="tn">'+esc(l.name)+'</span><span class="pg">'+d+'/'+l.items.length+' feitos</span></span>'+(gs.length?'<span class="tm">'+esc(gs.join(" · "))+'</span>':'')+'</button>'
}
function homeHtml(){
  var h=addNew
    ?'<div class="row"><input id="nl" placeholder="Nome do treino (ex: A | Push)" maxlength="40" autocomplete="off"><button id="al">Criar</button><button class="g" data-nc="1" aria-label="Cancelar">✕</button></div>'
    :'<div class="row"><button id="nt" class="addb">Cadastrar Treino</button></div>';
  if(!S.lists.length)return h+'<div class="em">Nenhum treino ainda. Toque em “Cadastrar Treino” para criar o primeiro, como “A | Push” ou “Costas”.</div>';
  return h+'<div class="cards">'+S.lists.map(cardHtml).join("")+'</div>'
}
function render0(){
  var hm=document.getElementById("home"),v=document.getElementById("view"),tt=document.getElementById("ttl"),l=cur();
  if(inList&&!l)inList=false;
  hm.hidden=inList;v.hidden=!inList;tt.hidden=inList;
  if(!inList){hm.innerHTML=homeHtml();v.innerHTML="";return}
  var d=l.items.filter(function(i){return i.done}).length;
  v.innerHTML='<button class="bk" data-home="1">← Treinos</button><div class="card"><div class="hd">'+(editing?'<input id="rn" value="'+esc(l.name)+'" maxlength="40"><button id="rok" style="margin-left:8px">OK</button>':'<h2>'+esc(l.name)+'</h2><span class="pg">'+d+'/'+l.items.length+' feitos</span>')+'</div>'
   +topHtml(l)
   +'<ul>'+listHtml(l)+'</ul>'
   +'<div class="row" style="margin-top:10px;justify-content:space-between"><button class="g" id="rs">Desmarcar todos</button><button class="g" id="rnb">Renomear</button><button class="g" id="dl">Excluir treino</button></div></div>';
}
function addList(){var i=document.getElementById("nl"),n=i?i.value.trim():"";if(!n)return;var l={id:uid(),name:n,items:[]};S.lists.push(l);S.active=l.id;addNew=false;lastG="";addMode=null;addMenu=false;addAt="";gmId=null;save();render()}
function addItem(){var l=cur(),i=document.getElementById("ni"),n=i?i.value.trim():"";if(!n||!l)return;var g="";if(addMode==="eg"){var f=gsync(l).find(function(x){return x.toLowerCase()===addAt});g=f||""}else{var sg=document.getElementById("ngs");g=ensureGroup(l,sg?sg.value:"")}lastG=g;if(addMode==="e")addAt=g.toLowerCase();place(l,{id:uid(),text:n,done:false,g:g});save();render();var ni=document.getElementById("ni");if(ni)ni.focus()}
function addGroup(){var l=cur(),i=document.getElementById("ngn"),n=i?i.value.trim():"";if(!l||!n)return;var g=ensureGroup(l,n);lastG=g;addMode="eg";addAt=g.toLowerCase();save();render();var ni=document.getElementById("ni");if(ni){ni.focus();if(ni.scrollIntoView)ni.scrollIntoView({block:"center"})}}
function rename(){var l=cur(),i=document.getElementById("rn");if(l&&i&&i.value.trim())l.name=i.value.trim();editing=false;save();render()}
var dg=null;
document.addEventListener("pointerdown",function(e){var h=e.target.closest&&e.target.closest(".dg");if(!h)return;var li=h.closest("li");if(!li)return;dg={el:li,id:li.dataset.id,g:li.dataset.g,y0:e.clientY,to:null,moved:false};li.classList.add("drag");document.body.classList.add("dragging");try{h.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault()});
document.addEventListener("pointermove",function(e){if(!dg)return;dg.moved=true;dg.el.style.transform="translateY("+(e.clientY-dg.y0)+"px)";var lis=[].slice.call(dg.el.parentNode.children).filter(function(c){return c!==dg.el&&c.tagName==="LI"&&c.dataset.id&&c.dataset.g===dg.g});lis.forEach(function(c){c.classList.remove("ov","ovb")});dg.to=null;for(var k=0;k<lis.length;k++){var r=lis[k].getBoundingClientRect();if(e.clientY<r.top+r.height/2){dg.to=lis[k];break}}if(dg.to)dg.to.classList.add("ov");else if(lis.length)lis[lis.length-1].classList.add("ovb")});
function endDrag(){if(!dg)return;var d=dg;dg=null;document.body.classList.remove("dragging");var l=cur();if(l&&d.moved){var it=l.items.find(function(x){return x.id===d.id});if(it){if(d.to){l.items.splice(l.items.indexOf(it),1);var ti=l.items.findIndex(function(x){return x.id===d.to.dataset.id});l.items.splice(ti<0?l.items.length:ti,0,it)}else{place(l,it)}save()}}render()}
document.addEventListener("pointerup",endDrag);
document.addEventListener("pointercancel",endDrag);
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&histId){histId=null;render()}});
document.addEventListener("visibilitychange",function(){if(!document.hidden&&rollWeek())render()});
window.addEventListener("popstate",function(){inList=false;editing=false;menuId=null;gmId=null;addMode=null;addMenu=false;addAt="";openId=null;histId=null;render()});
document.addEventListener("change",function(e){if(e.target&&e.target.id==="ngs")addAt=e.target.value.toLowerCase()});
document.addEventListener("click",function(e){
  var b=e.target.closest("button");if(!b){if(menuId||gmId||addMenu){menuId=null;gmId=null;addMenu=false;render()}return}var l=cur();if(!b.dataset.mn)menuId=null;if(!b.dataset.gm)gmId=null;if(b.id!=="plus")addMenu=false;
  if(b.dataset.open){S.active=b.dataset.open;inList=true;editing=false;lastG="";addMode=null;addMenu=false;addAt="";openId=null;histId=null;try{history.pushState({tr:1},"")}catch(x){}}
  else if(b.id==="nt"){addNew=true;render();var nl=document.getElementById("nl");if(nl)nl.focus();return}
  else if(b.dataset.nc){addNew=false;render();return}
  else if(b.id==="al"){return addList()}
  else if(b.dataset.home){if(history.state&&history.state.tr){history.back();return}inList=false;editing=false;addMode=null;addMenu=false;addAt="";openId=null;histId=null}
  else if(b.id==="ai"){return addItem()}
  else if(b.id==="plus"){addMenu=!addMenu;render();return}
  else if(b.dataset.am){addMenu=false;addMode=b.dataset.am;addAt=addMode==="e"?lastG.toLowerCase():"";render();var f1=document.getElementById(addMode==="g"?"ngn":"ni");if(f1)f1.focus();return}
  else if(b.dataset.ac){addMode=null;render();return}
  else if(b.id==="gok"){return addGroup()}
  else if(b.dataset.gm){gmId=gmId===b.dataset.gm?null:b.dataset.gm;render();return}
  else if(b.dataset.gr&&l){var gs1=gsync(l),k1=b.dataset.gr,ix=gs1.findIndex(function(x){return x.toLowerCase()===k1});if(ix<0){render();return}var nv=prompt("Novo nome do grupo",gs1[ix]);if(nv===null||!nv.trim()){render();return}nv=nv.trim();var nk=nv.toLowerCase();if(nk!==k1&&gs1.some(function(x){return x.toLowerCase()===nk})){alert("Já existe um grupo com esse nome.");render();return}l.groups[ix]=nv;l.items.forEach(function(x){if(gk(x)===k1)x.g=nv});if(addAt===k1)addAt=nk}
  else if(b.dataset.gd&&l){var k2=b.dataset.gd,gs2=gsync(l),f3=gs2.find(function(x){return x.toLowerCase()===k2}),its2=l.items.filter(function(x){return gk(x)===k2});if(!f3){render();return}if(!confirm(its2.length?'Excluir o grupo "'+f3+'"? Os '+its2.length+' exercício(s) ficam sem grupo.':'Excluir o grupo "'+f3+'"?')){render();return}l.groups=l.groups.filter(function(x){return x.toLowerCase()!==k2});its2.forEach(function(x){x.g=""});if(addAt===k2){addMode=null;addAt=""}}
  else if(b.dataset.ck&&l){var it=l.items.find(function(x){return x.id===b.dataset.ck});if(it)it.done=!it.done}
  else if(b.dataset.rm&&l){l.items=l.items.filter(function(x){return x.id!==b.dataset.rm})}
  else if(b.id==="rs"&&l){l.items.forEach(function(x){x.done=false})}
  else if(b.id==="rnb"&&l){editing=true;render();var r=document.getElementById("rn");if(r){r.focus();r.select()}return}
  else if(b.id==="rok"&&l){return rename()}
  else if(b.dataset.mn&&l){if(openId===b.dataset.mn){openId=null;menuId=null}else{menuId=menuId===b.dataset.mn?null:b.dataset.mn}}
  else if(b.dataset.gp&&l){var it3=l.items.find(function(x){return x.id===b.dataset.gp});if(!it3){render();return}var gv=prompt("Grupo do exercício (ex: Peito). Deixe vazio para tirar do grupo.",it3.g||"");if(gv===null){render();return}it3.g=ensureGroup(l,gv);place(l,it3)}
  else if(b.dataset.hs&&l){openId=null;histId=b.dataset.hs}
  else if(b.dataset.bk){histId=null}
  else if(b.dataset.pg&&l){histId=null;openId=openId===b.dataset.pg?null:b.dataset.pg}
  else if(b.dataset.rs&&l){var q=b.dataset.rs.split(":"),it2=l.items.find(function(x){return x.id===q[0]});if(it2&&it2.sets)it2.sets.splice(+q[1],1)}
  else if(b.dataset.as&&l){return addSet(b.dataset.as)}
  else if(b.dataset.cp&&l){copyLast(b.dataset.cp)}
  else if(b.id==="dl"&&l){if(!confirm("Excluir o treino "+l.name+"?"))return;S.lists=S.lists.filter(function(x){return x.id!==l.id});S.active=S.lists.length?S.lists[0].id:null;editing=false;inList=false;if(history.state&&history.state.tr){try{history.back()}catch(x){}}}
  else return;
  save();render();
});
document.addEventListener("keydown",function(e){if(e.key==="Enter"&&e.target.id==="nl")addList();if(e.key==="Escape"&&e.target.id==="nl"){addNew=false;render()}if(e.key==="Enter"&&e.target.id==="ngn")addGroup();if(e.key==="Escape"&&(e.target.id==="ngn"||e.target.id==="ni")){addMode=null;render()}if(e.key==="Enter"&&e.target.id==="ni")addItem();if(e.key==="Enter"&&e.target.id==="rn")rename();if(e.key==="Enter"&&(e.target.id==="kg"||e.target.id==="rp"))addSet(openId);if(e.key==="Escape"&&e.target.id==="rn"){editing=false;render()}});
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
    l.id=l.id||uid();l.name=String(l.name||"Treino");l.groups=Array.isArray(l.groups)?l.groups.map(String):[];
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
    editing=false;openId=null;menuId=null;histId=null;inList=false;addNew=false;
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
try{history.replaceState(null,"")}catch(e){}
rollWeek();
render();
initBackup();