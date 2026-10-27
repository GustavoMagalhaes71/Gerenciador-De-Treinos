// Modo teste: carrega dados de exemplo e simula a virada de semana.
// Usado apenas pelo indexteste.html (depois do app.js).
function dayAdd(k,n){var p=k.split("-"),d=new Date(+p[0],+p[1]-1,+p[2]+n);return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
function loadDemo(){
  S.lists=S.lists.filter(function(l){return !l.test});
  var W=wkey(new Date()),ex=[["Supino reto",20],["Puxada alta",40],["Rosca direta",10]];
  var items=ex.map(function(e){
    var hist=[];
    for(var k=4;k>=1;k--){var g=e[1]+(4-k)*2;hist.push({w:dayAdd(W,-7*k),sets:[{kg:String(g),reps:"12"},{kg:String(g),reps:"12"},{kg:String(g+2),reps:"10"}]})}
    var c=e[1]+8;
    return {id:uid(),text:e[0],done:false,sets:[{kg:String(c),reps:"12"},{kg:String(c),reps:"12"}],hist:hist}
  });
  var l={id:uid(),name:"Teste (simulação)",test:true,simWeek:W,items:items};
  S.lists.push(l);S.active=l.id;save();render()
}
function simWeek(){
  var l=S.lists.find(function(x){return x.test});if(!l)return false;
  var k=l.simWeek||wkey(new Date());
  l.items.forEach(function(i){if(i.sets&&i.sets.length){(i.hist=i.hist||[]).push({w:k,sets:i.sets})}i.sets=[];i.done=false});
  l.simWeek=dayAdd(k,7);S.active=l.id;save();render();return true
}
function clearDemo(){S.lists=S.lists.filter(function(l){return !l.test});if(!cur())S.active=S.lists.length?S.lists[0].id:null;save();render()}
function initDev(){
  var d=document.getElementById("dev");
    d.innerHTML='<h2 style="margin:0 0 6px;font-size:18px">🧪 Modo teste</h2><p class="pg">Este arquivo usa dados próprios, separados do app principal. Nada aqui afeta seus treinos reais.</p><div class="row" style="flex-wrap:wrap"><button id="dv1">Recarregar exemplo</button><button id="dv2">Simular virada de semana</button><button id="dv3" class="g">Apagar teste</button></div><p class="pg" id="dvm"></p>';
  function m(t){document.getElementById("dvm").textContent=t}
  document.getElementById("dv1").onclick=function(){loadDemo();m("Lista de exemplo criada, com 4 semanas de histórico.")};
  document.getElementById("dv2").onclick=function(){m(simWeek()?"Semana arquivada. Abra o Histórico de um exercício para ver.":"Carregue o exemplo primeiro.")};
  document.getElementById("dv3").onclick=function(){clearDemo();m("Lista de teste apagada.")}
}

initDev();
if(!S.lists.some(function(l){return l.test}))loadDemo();
