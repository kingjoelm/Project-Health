let deferredPrompt;
const KEY='projectHealth_v02';
let state=JSON.parse(localStorage.getItem(KEY)||'{"workout":{},"food":{},"daily":{}}');

window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault(); deferredPrompt=e; installBtn.hidden=false;
});
installBtn.addEventListener('click',async()=>{
  if(!deferredPrompt)return;
  deferredPrompt.prompt(); await deferredPrompt.userChoice;
  deferredPrompt=null; installBtn.hidden=true;
});
if('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js');

document.querySelectorAll('.nav button').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active'); document.getElementById(btn.dataset.page).classList.add('active');
}));

const messages={
 full:"You are ready for the full workout. Aim for clean repetitions, not punishment.",
 short:"Fifteen focused minutes is a successful training day. Complete the first two exercises and one short walk.",
 minimum:"Today’s goal is only a five-minute walk. This keeps the habit alive without pretending your energy is high.",
 recovery:"Recovery is part of training. Take an easy walk, stretch gently, hydrate, and return tomorrow."
};
document.querySelectorAll('[data-energy]').forEach(btn=>btn.addEventListener('click',()=>{
 document.querySelectorAll('[data-energy]').forEach(x=>x.classList.remove('selected'));
 btn.classList.add('selected'); state.daily.energyChoice=btn.dataset.energy;
 coachMessage.textContent=messages[btn.dataset.energy]; localStorage.setItem(KEY,JSON.stringify(state));
 if(btn.dataset.energy==='minimum') walkTimerCard.classList.remove('hidden');
}));

startMinimum.addEventListener('click',()=>{walkTimerCard.classList.remove('hidden');walkTimerCard.scrollIntoView({behavior:'smooth'});});

let seconds=300,timerId=null;
function drawTimer(){timer.textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');}
timerToggle.addEventListener('click',()=>{
 if(timerId){clearInterval(timerId);timerId=null;timerToggle.textContent='Resume';return;}
 timerToggle.textContent='Pause';
 timerId=setInterval(()=>{
  seconds--;drawTimer();
  if(seconds<=0){clearInterval(timerId);timerId=null;timerToggle.textContent='Completed';state.daily.minimumWalkCompleted=true;localStorage.setItem(KEY,JSON.stringify(state));alert('Five minutes completed. That counts as a successful day.');}
 },1000);
});
timerReset.addEventListener('click',()=>{if(timerId)clearInterval(timerId);timerId=null;seconds=300;drawTimer();timerToggle.textContent='Start';});

fetch('./data/exercises.json').then(r=>r.json()).then(items=>{
 items.forEach(ex=>{
  let rows='';
  for(let i=0;i<ex.sets;i++){
   const s=((state.workout[ex.id]||{}).sets||[])[i]||{};
   rows+=`<div class="setrow"><strong>Set ${i+1}</strong>
   <input data-id="${ex.id}" data-set="${i}" data-field="weight" type="number" placeholder="lb" value="${s.weight||''}">
   <input data-id="${ex.id}" data-set="${i}" data-field="reps" type="number" placeholder="reps" value="${s.reps||''}">
   <input data-id="${ex.id}" data-set="${i}" data-field="done" type="checkbox" ${s.done?'checked':''}></div>`;
  }
  exerciseList.insertAdjacentHTML('beforeend',`<section class="card exercise"><img src="${ex.image}" alt="${ex.name} form illustration"><h2>${ex.name}</h2><div class="muted">${ex.target}</div><span class="badge">${ex.sets} sets × ${ex.reps}</span><details><summary>How to perform it</summary><h3>Steps</h3><ul>${ex.steps.map(x=>`<li>${x}</li>`).join('')}</ul><h3>Common mistakes</h3><ul>${ex.mistakes.map(x=>`<li>${x}</li>`).join('')}</ul></details>${rows}</section>`);
 });
 document.querySelectorAll('#workout input').forEach(x=>x.addEventListener('change',saveWorkout));
});
function saveWorkout(){
 document.querySelectorAll('#workout [data-id]').forEach(el=>{
  const id=el.dataset.id,i=+el.dataset.set,f=el.dataset.field;
  state.workout[id]=state.workout[id]||{sets:[]};state.workout[id].sets[i]=state.workout[id].sets[i]||{};
  state.workout[id].sets[i][f]=el.type==='checkbox'?el.checked:el.value;
 });
 localStorage.setItem(KEY,JSON.stringify(state));saveStatus.textContent='Saved on this device';
}

foodCoachBtn.addEventListener('click',()=>{
 const drinks=Number(drinkCount.value)||0,bread=Number(breadCount.value)||0,extras=Number(extraCount.value)||0;
 let advice;
 if(drinks>0) advice=`You had ${drinks} sugary drink${drinks===1?'':'s'}. Next time, aim for ${Math.max(0,drinks-1)}. Replace only one with water or unsweetened tea.`;
 else if(bread>1) advice=`You had ${bread} slices or tortillas. Next time, try ${bread-1}. Keep the meal the same and remove only one.`;
 else if(extras>0) advice=`You had ${extras} second serving${extras===1?'':'s'}. Next time, wait ten minutes before deciding. The goal is one fewer—not a perfect meal.`;
 else advice="Nothing needs a major correction. Keep logging honestly and focus on a normal portion at the next meal.";
 foodAdviceText.textContent=advice;foodAdvice.classList.remove('hidden');
 state.food={drinks,bread,extras,notes:foodNotes.value,advice};localStorage.setItem(KEY,JSON.stringify(state));
});
acceptGoal.addEventListener('change',()=>{state.food.goalAccepted=acceptGoal.checked;localStorage.setItem(KEY,JSON.stringify(state));});

saveBtn.addEventListener('click',()=>{saveWorkout();state.food.notes=foodNotes.value;localStorage.setItem(KEY,JSON.stringify(state));alert('Today is saved. Honest effort beats a perfect plan you cannot maintain.');});
drawTimer();