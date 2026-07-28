let WORKOUTS={};const STORE="projectHealthV06";let prior=JSON.parse(localStorage.getItem("projectHealthV051")||localStorage.getItem("projectHealthV05")||localStorage.getItem("projectHealthV04")||"null");let state=JSON.parse(localStorage.getItem(STORE)||"null")||prior||{profile:{name:"",goal:"Build consistency",days:"Monday–Friday",experience:"New to the gym",location:"Commercial gym",duration:"30–45 minutes",obstacle:"Staying consistent",foodStruggle:"Portions",limitations:"",tone:"Balanced",onboarded:false},daily:{},sessions:[],meals:[],weights:[],victories:[],measurements:[],reflections:[]};state.measurements=state.measurements||[];state.reflections=state.reflections||[];state.profile={experience:"New to the gym",location:"Commercial gym",duration:"30–45 minutes",obstacle:"Staying consistent",foodStruggle:"Portions",limitations:"",tone:"Balanced",onboarded:false,...state.profile};let weekOffset=0,foodOffset=0,selectedDate=null,activeMode="full",editingMealId=null,obStep=0,chosenTone=state.profile.tone||"Balanced",timerHandle=null,timerSeconds=0;
const iso=d=>{let x=new Date(d);x.setMinutes(x.getMinutes()-x.getTimezoneOffset());return x.toISOString().slice(0,10)},today=()=>iso(new Date()),save=()=>localStorage.setItem(STORE,JSON.stringify(state));
const dayKey=d=>["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][new Date(d+"T12:00:00").getDay()];
function daily(k=today()){state.daily[k] ||= {water:0};return state.daily[k]}
async function boot(){try{WORKOUTS=await fetch("data/workouts.json?build=60",{cache:"no-store"}).then(r=>r.json())}catch(e){alert("Workout data could not load.");return}init();if(!state.profile.onboarded)setTimeout(()=>onboardingModal.classList.add("show"),250)}
function greeting(){const h=new Date().getHours();return h<12?"Good morning":h<17?"Good afternoon":"Good evening"}
function showScreen(id){document.querySelectorAll(".screen").forEach(x=>x.classList.toggle("active",x.id===id));document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("active",x.dataset.screen===id));if(id==="week")renderWeek();if(id==="food")renderFood();if(id==="progress")renderProgress();if(id==="more")renderLibraryPreview();window.scrollTo(0,0)}
function init(){dateLabel.textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});greetingEl=document.getElementById("greeting");greetingEl.textContent=`${greeting()}${state.profile.name?", "+state.profile.name:""}`;let w=WORKOUTS[dayKey(today())];todayWorkout.textContent=w.name;todayFocus.textContent=w.focus;todayMinutes.textContent=`${w.minutes} min`;let d=daily();sleep.value=d.sleep||"";energy.value=d.energy||"";pain.value=d.pain||"";victory.value=d.victory||"";reflectionHelped.value=d.reflection?.helped||"";reflectionObstacle.value=d.reflection?.obstacle||"";reflectionTomorrow.value=d.reflection?.tomorrow||"";waterCount.textContent=d.water||0;profileName.value=state.profile.name||"";profileGoal.value=state.profile.goal||"Build consistency";profileDays.value=state.profile.days||"";coach();renderTodayMeals();renderTodayWeekPreview();renderLibraryPreview();updateMomentum()}
function coach(){
 let d=daily(),hasWorkout=state.sessions.some(x=>x.date===today()),mealCountToday=state.meals.filter(m=>m.date===today()).length,water=d.water||0;
 let msg=`You do not need a perfect day. Complete the version of today that fits your real life.`,focus="Protect the habit",focusText="Start with the next useful action, not the whole day.",action="workout",badges=[];
 if(d.life){msg="Life happened. The goal now is not to catch up—it is to keep the connection with your plan.";focus="Minimum-day win";focusText="Five minutes of movement, one honest meal log, or water can protect momentum.";action="minimum";badges.push("Life happened")}
 else if(d.energy==="Exhausted"||d.sleep==="Under 4 hours"){msg="Recovery is low. Training harder is not automatically better today.";focus="Recover without disappearing";focusText="Choose Recovery or Minimum mode and keep the promise small.";action="recovery";badges.push("Low recovery")}
 else if(d.pain){msg=`You noted ${d.pain}. Avoid forcing painful movement and use the listed alternatives.`;focus="Train around discomfort";focusText="Open today's workout and replace anything that increases pain.";action="workout";badges.push("Modify safely")}
 else if(hasWorkout){msg="Workout complete. Do not turn one win into pressure to be perfect. Keep the next meal and hydration normal.";focus="Finish the day steady";focusText="Log your next meal honestly and add water.";action="meal";badges.push("Workout complete")}
 else if(mealCountToday===0 && new Date().getHours()>=12){msg="Nothing is ruined. Start tracking from the next thing you eat or drink.";focus="Log the next meal";focusText="No backfilling required. Begin with what happens next.";action="meal";badges.push("Honesty first")}
 else if(water<3 && new Date().getHours()>=14){msg="Your easiest useful move right now is hydration.";focus="Add water";focusText="Drink one bottle or glass now, then continue your day.";action="water";badges.push("Simple win")}
 if(state.profile.obstacle==="Not knowing what to do")badges.push("Instructions ready");
 if(state.profile.tone==="Direct")msg="Here is the truth: waiting to feel fully ready usually keeps the habit stuck. Start the smallest acceptable version now.";
 if(state.profile.tone==="High accountability")msg="You chose accountability. Do not negotiate with the entire day—complete one concrete action now and log it.";
 coachMessage.textContent=msg;coachContext.textContent=`${state.profile.goal} • ${state.profile.tone} coaching`;coachBadges.innerHTML=badges.slice(0,3).map(x=>`<span class="soft-badge">${x}</span>`).join("");
 dailyFocusTitle.textContent=focus;dailyFocusText.textContent=focusText;focusAction.dataset.action=action;focusAction.textContent=action==="meal"?"Log the next meal":action==="water"?"Add water":action==="recovery"?"Start recovery session":action==="minimum"?"Start minimum day":"Open today's workout";
}
function runFocusAction(){let a=focusAction.dataset.action;if(a==="meal")openMeal();else if(a==="water")addWater();else if(a==="recovery"){openWorkout();setMode("recovery")}else if(a==="minimum"){openWorkout();setMode("minimum")}else openWorkout()}
function markLifeHappened(){let d=daily();d.life=!d.life;save();coach();updateMomentum();alert(d.life?"Coach PH adjusted today. A smaller win still counts.":"Life Happened mode removed.")}
function saveCheckin(){let d=daily();d.sleep=sleep.value;d.energy=energy.value;d.pain=pain.value.trim();save();coach();updateMomentum();alert("Check-in saved.")}
function addWater(){daily().water=Math.min(20,(daily().water||0)+1);save();waterCount.textContent=daily().water;updateMomentum()}
function restaurantSuggestion(){
 const t=restaurantType.value;
 const map={
 "Burger or sandwich":"Keep the meal, but choose either fries or a sugary drink—not both.",
 "Mexican":"Choose either chips before the meal or tortillas with the meal, then add protein and beans.",
 "Pizza":"Start with two slices and water. Wait ten minutes before deciding on more.",
 "Steakhouse":"Keep the steak. Choose one starch and add a vegetable or salad.",
 "Fast food":"Order the main item you want, then make the drink or side the lighter choice.",
 "Breakfast":"Keep the protein. Choose either pancakes/biscuits or hash browns—not both.",
 "Other":"Keep the meal recognizable and change only one thing: drink, side, portion, or dessert."
 };
 restaurantResult.innerHTML=`<div class="suggestion"><strong>One change:</strong><div>${map[t]}</div></div>`;
}
function saveReflection(){
 let d=daily();d.reflection={helped:reflectionHelped.value.trim(),obstacle:reflectionObstacle.value.trim(),tomorrow:reflectionTomorrow.value.trim()};
 state.reflections=state.reflections.filter(x=>x.date!==today());state.reflections.unshift({date:today(),...d.reflection});save();coach();alert("Reflection saved. Tomorrow's plan is clearer.");
}
function saveVictory(){let v=victory.value.trim();if(!v)return alert("Write one victory.");daily().victory=v;state.victories=state.victories.filter(x=>x.date!==today());state.victories.unshift({date:today(),text:v});save();updateMomentum();alert("Victory saved.")}
function updateMomentum(){let d=daily(),s=0;if(d.sleep||d.energy)s+=20;if((d.water||0)>=4)s+=20;if(state.meals.some(m=>m.date===today()))s+=20;if(state.sessions.some(x=>x.date===today()))s+=25;if(d.victory)s+=15;momentum.textContent=s+"%";momentumBar.style.width=s+"%"}
function mondayOf(date){let d=new Date(date);let n=d.getDay()||7;d.setDate(d.getDate()-n+1);d.setHours(12,0,0,0);return d}
function changeWeek(n){weekOffset+=n;renderWeek()}
function renderWeek(){let start=mondayOf(new Date());start.setDate(start.getDate()+weekOffset*7);let end=new Date(start);end.setDate(end.getDate()+6);weekRange.textContent=`${start.toLocaleDateString(undefined,{month:"short",day:"numeric"})} – ${end.toLocaleDateString(undefined,{month:"short",day:"numeric"})}`;weekLabel.textContent=weekOffset===0?"This week":weekOffset<0?"Past week":"Upcoming week";weekList.innerHTML="";for(let i=0;i<7;i++){let d=new Date(start);d.setDate(start.getDate()+i);let k=iso(d),w=WORKOUTS[dayKey(k)],session=state.sessions.find(s=>s.date===k),isToday=k===today(),past=k<today();let status=session?`<span class="status done">Completed</span>`:isToday?`<span class="status" style="color:var(--blue)">Today</span>`:past?`<span class="status missed">Not logged</span>`:`<span class="status upcoming">Upcoming</span>`;weekList.innerHTML+=`<div class="dayrow" onclick="openWorkout('${k}')"><div class="daynum ${isToday?"todaydot":""}">${d.toLocaleDateString(undefined,{day:"numeric"})}</div><div><strong>${d.toLocaleDateString(undefined,{weekday:"long"})} — ${w.name}</strong><div class="muted small">${w.focus} • ${w.minutes} min</div></div>${status}</div>`}}

function renderTodayWeekPreview(){let start=mondayOf(new Date());todayWeekPreview.innerHTML="";for(let i=0;i<7;i++){let d=new Date(start);d.setDate(start.getDate()+i);let k=iso(d),w=WORKOUTS[dayKey(k)],done=state.sessions.some(s=>s.date===k);todayWeekPreview.innerHTML+=`<div class="chip" onclick="openWorkout('${k}')"><span class="muted small">${d.toLocaleDateString(undefined,{weekday:"short"})}</span><strong>${w.name}</strong><span class="small ${done?"done":"muted"}">${done?"Done":k===today()?"Today":k<today()?"Past":"Next"}</span></div>`}}

function changeFoodDay(n){foodOffset+=n;renderFood()}
function foodDateKey(){let d=new Date();d.setDate(d.getDate()+foodOffset);return iso(d)}
function renderFood(){let k=foodDateKey();foodDate.textContent=new Date(k+"T12:00:00").toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"});renderMealsInto(foodEntries,k)}
function renderTodayMeals(){renderMealsInto(todayMeals,today(),true)}
function renderMealsInto(el,k,compact=false){let list=state.meals.filter(m=>m.date===k).sort((a,b)=>a.time.localeCompare(b.time));if(!list.length){el.innerHTML=`<p class="muted">No meals or snacks logged yet.</p>`;return}el.innerHTML=list.map(m=>`<div class="meal-card"><div class="top" style="margin:0"><div><strong>${m.type}</strong><div class="muted small">${m.time}</div></div><span class="pill">${m.plan}</span></div><div>${m.description}</div>${compact?"":`<div class="muted small">Hunger: ${m.hunger||"—"} • Fullness: ${m.fullness||"—"}</div><div class="meal-actions"><button class="secondary" onclick="editMeal('${m.id}')">Edit</button><button class="danger" onclick="deleteMeal('${m.id}')">Delete</button></div>`}</div>`).join("")}
function openMeal(){editingMealId=null;mealModalTitle.textContent="Add Meal or Snack";mealDescription.value="";mealHunger.value="";mealFullness.value="";mealPlan.value="About as planned";mealModal.classList.add("show")}
function closeMeal(){mealModal.classList.remove("show")}
function saveMeal(){let desc=mealDescription.value.trim();if(!desc)return alert("Describe what you had.");let date=foodOffset===0?today():foodDateKey();let item={id:editingMealId||crypto.randomUUID(),date,type:mealType.value,description:desc,hunger:mealHunger.value,fullness:mealFullness.value,plan:mealPlan.value,time:new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})};if(editingMealId)state.meals=state.meals.map(m=>m.id===editingMealId?{...m,...item}:m);else state.meals.push(item);save();closeMeal();renderTodayMeals();renderFood();updateMomentum();foodCoach.textContent=item.plan.includes("more")||item.plan.includes("Unplanned")?"Thanks for logging it honestly. Keep the next meal normal and improve one part—drink, portion, or side.":"Good. Repeat what worked without trying to make the whole day perfect."}
function editMeal(id){let m=state.meals.find(x=>x.id===id);if(!m)return;editingMealId=id;mealModalTitle.textContent="Edit Entry";mealType.value=m.type;mealDescription.value=m.description;mealHunger.value=m.hunger;mealFullness.value=m.fullness;mealPlan.value=m.plan;mealModal.classList.add("show")}
function deleteMeal(id){if(confirm("Delete this entry?")){state.meals=state.meals.filter(x=>x.id!==id);save();renderFood();renderTodayMeals();updateMomentum()}}
function openWorkout(k=today()){selectedDate=k;activeMode="full";renderWorkoutModal();workoutModal.classList.add("show")}
function closeWorkout(){workoutModal.classList.remove("show")}
function setMode(m){activeMode=m;renderWorkoutModal()}
function previousEntry(name){for(let i=state.sessions.length-1;i>=0;i--){let e=state.sessions[i].entries?.find(x=>x.name===name);if(e)return e}return null}
function progressionSuggestion(workout){
 let tips=[];
 workout.exercises.forEach(e=>{
   let prior=null;
   for(let i=state.sessions.length-1;i>=0&&!prior;i--){prior=state.sessions[i].entries?.find(x=>x.name===e.name)}
   if(prior){
     let completed=(prior.sets||[]).filter(s=>s.done&&Number(s.reps)>0);
     if(completed.length){
       let avg=completed.reduce((a,s)=>a+Number(s.reps||0),0)/completed.length;
       let maxW=Math.max(...completed.map(s=>Number(s.weight||0)));
       if(avg>=12&&maxW>0)tips.push(`${e.name}: consider ${maxW+5} lb if form felt solid.`);
       else if(avg>=8&&maxW>0)tips.push(`${e.name}: repeat ${maxW} lb and try to add one total rep.`);
     }
   }
 });
 if(!tips.length)return `<strong>Coach PH:</strong> Log today's sets clearly. Your next progression suggestion will come from this workout.`;
 return `<strong>Coach PH progression:</strong><div>${tips.slice(0,2).join("<br>")}</div>`;
}
function phaseCard(phase,type){
 if(!phase)return "";
 let isWarm=type==="warmup";
 return `<div class="phase-card"><div class="phase-head"><div><div class="muted small">${isWarm?"BEFORE LIFTING":"AFTER LIFTING"}</div><h2>${phase.name}</h2><div class="muted">${phase.minutes} minutes • Incline ${phase.incline}</div></div><span class="phase-badge">${isWarm?"Warm-up":"Finisher"}</span></div><img class="phase-image" src="assets/exercises/treadmill-walk.jpg" alt="${phase.name}"><p>${phase.instructions}</p><div class="pill">Speed: ${phase.speed}</div><div class="phase-controls"><button class="secondary" onclick="startPhaseTimer(${phase.minutes},'${phase.name.replace(/'/g,"")}')">Start ${phase.minutes}:00 Timer</button><button class="ghost" onclick="markPhaseDone(this,'${type}')">Mark Done</button></div></div>`
}
function renderWorkoutModal(){
 let w=WORKOUTS[dayKey(selectedDate)];modalDate.textContent=new Date(selectedDate+"T12:00:00").toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});modalWorkoutTitle.textContent=`${w.name} — ${activeMode}`;workoutSuggestion.innerHTML=progressionSuggestion(w);
 let ex=[...w.exercises],showWarm=!!w.warmup,showFinish=!!w.finisher;
 if(activeMode==="short"){ex=ex.slice(0,3);showFinish=false}
 if(activeMode==="minimum"){ex=[WORKOUTS.saturday.exercises[0]];showWarm=false;showFinish=false}
 if(activeMode==="recovery"){ex=[WORKOUTS.sunday.exercises[0]];showWarm=false;showFinish=false}
 let exerciseHtml=ex.map((e,i)=>{let last=previousEntry(e.name);return `<div class="card exercise-card"><div class="exercise-top"><img src="assets/exercises/${e.id}.jpg" alt="${e.name} demonstration"><div><div class="muted small">EXERCISE ${i+1}</div><h2>${e.name}</h2><div class="muted">${e.sets} sets × ${e.reps}</div><div class="pill" style="margin-top:8px">${last?`Last: ${last.sets.map(s=>`${s.weight||0}×${s.reps||0}`).join(", ")}`:"First time"}</div></div></div><div class="exercise-body"><div><strong>Muscles:</strong> ${e.muscles}</div><div class="instructions"><strong>Setup</strong><div>${e.setup}</div><ol>${e.steps.map(s=>`<li>${s}</li>`).join("")}</ol></div><details><summary>Common mistakes & alternative</summary><p><strong>Avoid:</strong> ${e.mistakes}</p><p><strong>Alternative:</strong> ${e.alternative}</p></details><div class="small muted" style="margin-top:10px">Log each working set</div>${Array.from({length:e.sets},(_,j)=>`<div class="setrow"><strong>${j+1}</strong><input class="set-weight" data-ex="${i}" data-set="${j}" placeholder="lb" inputmode="decimal"><input class="set-reps" data-ex="${i}" data-set="${j}" placeholder="reps" inputmode="numeric"><button onclick="toggleSet(this)">○</button></div>`).join("")}<label>Pain or note</label><input class="exercise-note" data-ex="${i}" placeholder="Optional"></div></div>`}).join("");
 exerciseList.innerHTML=(showWarm?phaseCard(w.warmup,"warmup"):"")+exerciseHtml+(showFinish?phaseCard(w.finisher,"finisher"):"");
}
function startPhaseTimer(minutes,label){timerSeconds=minutes*60;stopTimer(false);restTimer.classList.add("show");restTimer.querySelector("strong").textContent=label;drawTimer();timerHandle=setInterval(()=>{timerSeconds--;drawTimer();if(timerSeconds<=0){stopTimer();if(navigator.vibrate)navigator.vibrate([200,100,200])}},1000)}
function markPhaseDone(btn,type){btn.textContent="✓ Completed";btn.disabled=true;btn.dataset.done="true";btn.closest(".phase-card").dataset.phase=type}
function toggleSet(btn){let done=btn.textContent!=="✓";btn.textContent=done?"✓":"○";if(done)startTimer(60)}
function startTimer(seconds){stopTimer();timerSeconds=seconds;restTimer.classList.add("show");drawTimer();timerHandle=setInterval(()=>{timerSeconds--;drawTimer();if(timerSeconds<=0){stopTimer();if(navigator.vibrate)navigator.vibrate([180,80,180])}},1000)}
function drawTimer(){timerText.textContent=`${String(Math.floor(timerSeconds/60)).padStart(2,"0")}:${String(timerSeconds%60).padStart(2,"0")}`}
function addTimer(n){timerSeconds+=n;drawTimer()}
function stopTimer(reset=true){if(timerHandle)clearInterval(timerHandle);timerHandle=null;restTimer.classList.remove("show");if(reset){let s=restTimer.querySelector("strong");if(s)s.textContent="Rest timer"}}
function completeWorkout(){let w=WORKOUTS[dayKey(selectedDate)],cards=[...document.querySelectorAll("#exerciseList .exercise-card")];let entries=cards.map((c,i)=>({name:c.querySelector("h2").textContent,sets:[...c.querySelectorAll(".setrow")].map(r=>({weight:r.querySelector(".set-weight").value,reps:r.querySelector(".set-reps").value,done:r.querySelector("button").textContent==="✓"})),note:c.querySelector(".exercise-note").value}));state.sessions=state.sessions.filter(s=>s.date!==selectedDate);let phases=[...document.querySelectorAll("#exerciseList .phase-card")].map(p=>({type:p.dataset.phase||"",done:!!p.querySelector("[data-done='true']")}));state.sessions.push({date:selectedDate,mode:activeMode,workout:w.name,entries,phases,completedAt:new Date().toISOString()});save();closeWorkout();renderWeek();renderProgress();updateMomentum();alert("Workout saved. You completed what you chose.")}
function renderProgress(){
 workoutCount.textContent=state.sessions.length;mealCount.textContent=state.meals.length;victoryCount.textContent=state.victories.length;
 weightHistory.textContent=state.weights.slice(0,6).map(x=>`${x.date}: ${x.value} lb`).join(" • ")||"No weights saved yet.";
 victoryHistory.innerHTML=state.victories.slice(0,8).map(v=>`<div class="meal-card"><strong>${v.date}</strong><div>${v.text}</div></div>`).join("")||"No victories yet.";
 let recent=state.sessions.slice().sort((a,b)=>b.date.localeCompare(a.date)), insights=[];
 if(recent.length>=2)insights.push({icon:"↗",title:"You are returning",text:`You have logged ${recent.length} workouts. Showing up repeatedly matters more than any single session.`});
 let completedSets=recent.flatMap(s=>s.entries||[]).flatMap(e=>e.sets||[]).filter(s=>s.done).length;
 if(completedSets)insights.push({icon:"✓",title:"Work is accumulating",text:`You have completed ${completedSets} logged working sets.`});
 let honest=state.meals.filter(m=>m.plan.includes("more")||m.plan.includes("Unplanned")).length;
 if(honest)insights.push({icon:"◎",title:"Honesty is improving",text:`You logged ${honest} imperfect food moments instead of hiding them. That creates usable awareness.`});
 if(state.victories.length)insights.push({icon:"★",title:"You are noticing wins",text:`You have recorded ${state.victories.length} daily victories.`});
 if(!insights.length)insights.push({icon:"→",title:"Your first pattern starts now",text:"Log one workout, meal, water entry, or victory. Coach PH will turn it into useful feedback."});
 progressInsights.innerHTML=insights.slice(0,4).map(x=>`<div class="insight"><div class="insight-icon">${x.icon}</div><div><strong>${x.title}</strong><div class="muted">${x.text}</div></div></div>`).join("");
 let start=mondayOf(new Date()),startKey=iso(start),end=new Date(start);end.setDate(end.getDate()+6);let endKey=iso(end);
 let ws=state.sessions.filter(s=>s.date>=startKey&&s.date<=endKey).length,ms=state.meals.filter(m=>m.date>=startKey&&m.date<=endKey).length,vs=state.victories.filter(v=>v.date>=startKey&&v.date<=endKey).length,waterDays=Object.entries(state.daily).filter(([k,v])=>k>=startKey&&k<=endKey&&(v.water||0)>=4).length;
 let score=Math.min(100,ws*18+Math.min(ms,14)*3+vs*5+waterDays*4);weeklyScore.textContent=score;
 weeklyReview.innerHTML=`<div class="card"><strong>${ws}</strong><div class="muted small">workouts</div></div><div class="card"><strong>${ms}</strong><div class="muted small">meals logged</div></div><div class="card"><strong>${waterDays}</strong><div class="muted small">hydration days</div></div><div class="card"><strong>${vs}</strong><div class="muted small">victories</div></div>`;
 weeklyCoachNote.textContent=score>=70?"Strong week. Keep the system simple enough to repeat.":score>=35?"Momentum is forming. Improve one category next week, not all four.":"This is not a failure score. Pick one small behavior to repeat before adding more.";
 drawWeightChart();drawConsistencyChart();measurementHistory.textContent=state.measurements.slice(0,5).map(m=>`${m.date}: waist ${m.waist||"—"}, chest ${m.chest||"—"}, arms ${m.arms||"—"}, thigh ${m.thigh||"—"}`).join(" • ")||"No measurements saved yet.";
}
function lineChart(canvas,values,labels){
 const c=canvas.getContext("2d"),w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h);c.strokeStyle="#dce3ed";c.lineWidth=1;
 for(let i=1;i<5;i++){let y=i*h/5;c.beginPath();c.moveTo(40,y);c.lineTo(w-15,y);c.stroke()}
 if(!values.length){c.fillStyle="#687386";c.font="16px sans-serif";c.fillText("Not enough data yet",40,105);return}
 let min=Math.min(...values),max=Math.max(...values);if(min===max){min-=1;max+=1}
 let pts=values.map((v,i)=>({x:40+(w-60)*(values.length===1?.5:i/(values.length-1)),y:15+(h-45)*(1-(v-min)/(max-min))}));
 c.strokeStyle="#2d6fce";c.lineWidth=4;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();
 c.fillStyle="#173b6c";pts.forEach(p=>{c.beginPath();c.arc(p.x,p.y,5,0,Math.PI*2);c.fill()});
 c.fillStyle="#687386";c.font="12px sans-serif";labels.forEach((l,i)=>{if(i===0||i===labels.length-1)c.fillText(l,pts[i].x-16,h-8)});
}
function drawWeightChart(){let arr=state.weights.slice().reverse().slice(-12);lineChart(weightChart,arr.map(x=>Number(x.value)),arr.map(x=>x.date.slice(5)))}
function drawConsistencyChart(){
 let vals=[],labs=[],now=new Date();
 for(let i=7;i>=0;i--){let end=new Date(now);end.setDate(end.getDate()-i*7);let start=mondayOf(end),finish=new Date(start);finish.setDate(finish.getDate()+6);let a=iso(start),b=iso(finish);vals.push(state.sessions.filter(s=>s.date>=a&&s.date<=b).length);labs.push(a.slice(5))}
 lineChart(consistencyChart,vals,labs)
}
function saveMeasurements(){
 let m={date:today(),waist:measureWaist.value,chest:measureChest.value,arms:measureArms.value,thigh:measureThigh.value};
 if(!m.waist&&!m.chest&&!m.arms&&!m.thigh)return alert("Enter at least one measurement.");
 state.measurements.unshift(m);save();measureWaist.value=measureChest.value=measureArms.value=measureThigh.value="";renderProgress();
}
function saveWeight(){let value=Number(weightInput.value);if(!value)return alert("Enter a valid weight.");state.weights.unshift({date:today(),value});save();weightInput.value="";renderProgress()}
function saveProfile(){state.profile={...state.profile,name:profileName.value.trim(),goal:profileGoal.value,days:profileDays.value.trim(),onboarded:true};save();init();alert("Profile saved.")}
async function copyFeedback(){let report=`Project Health Beta v0.4\nCategory: ${feedbackCategory.value}\nDevice: ${navigator.userAgent}\nDate: ${new Date().toLocaleString()}\nFeedback: ${feedbackText.value.trim()}`;if(!feedbackText.value.trim())return alert("Enter feedback first.");try{await navigator.clipboard.writeText(report);feedbackResult.textContent="Feedback copied. Paste it into a text or email to Joel.";feedbackResult.classList.remove("hide")}catch(e){feedbackResult.textContent=report;feedbackResult.classList.remove("hide")}}
function allExercises(){let seen=new Map();Object.values(WORKOUTS).forEach(w=>w.exercises.forEach(e=>{if(!seen.has(e.id))seen.set(e.id,e)}));return [...seen.values()]}
function renderLibraryPreview(){let el=document.getElementById("libraryPreview");if(!el||!Object.keys(WORKOUTS).length)return;el.innerHTML=allExercises().slice(0,4).map(e=>`<div class="library-card" onclick="openExercise('${e.id}')"><img src="assets/exercises/${e.id}.jpg" alt="${e.name}"><div><strong>${e.name}</strong><span class="muted small">${e.muscles}</span></div></div>`).join("")}
function openLibrary(){renderLibrary();libraryModal.classList.add("show")}
function closeLibrary(){libraryModal.classList.remove("show")}
function renderLibrary(){let q=(librarySearch?.value||"").toLowerCase(),list=allExercises().filter(e=>(e.name+" "+e.muscles).toLowerCase().includes(q));libraryGrid.innerHTML=list.map(e=>`<div class="library-card" onclick="openExercise('${e.id}')"><img src="assets/exercises/${e.id}.jpg" alt="${e.name}"><div><strong>${e.name}</strong><span class="muted small">${e.muscles}</span></div></div>`).join("")}
function openExercise(id){let e=allExercises().find(x=>x.id===id);if(!e)return;libraryGrid.innerHTML=`<div style="grid-column:1/-1"><button class="ghost" onclick="renderLibrary()">← Back to library</button><div class="card exercise-card"><div class="exercise-top"><img src="assets/exercises/${e.id}.jpg"><div><h2>${e.name}</h2><div class="muted">${e.muscles}</div><span class="pill">${e.sets} sets × ${e.reps}</span></div></div><div class="exercise-body"><div class="instructions"><strong>Setup</strong><div>${e.setup}</div><ol>${e.steps.map(s=>`<li>${s}</li>`).join("")}</ol></div><p><strong>Common mistake:</strong> ${e.mistakes}</p><p><strong>Alternative:</strong> ${e.alternative}</p></div></div></div>`}
function pickTone(btn){document.querySelectorAll("[data-tone]").forEach(x=>x.classList.remove("selected"));btn.classList.add("selected");chosenTone=btn.dataset.tone}
function showObStep(){document.querySelectorAll(".onboarding-step").forEach(x=>x.classList.toggle("active",Number(x.dataset.step)===obStep));obBack.style.visibility=obStep===0?"hidden":"visible";obNext.textContent=obStep===3?"Start Project Health":"Continue"}
function onboardingBack(){if(obStep>0){obStep--;showObStep()}}
function onboardingNext(){if(obStep===0&&!obName.value.trim())return alert("Enter your name.");if(obStep<3){obStep++;showObStep();return}state.profile={...state.profile,name:obName.value.trim(),goal:obGoal.value,experience:obExperience.value,location:obLocation.value,duration:obDuration.value,obstacle:obObstacle.value,foodStruggle:obFood.value,limitations:obLimitations.value.trim(),tone:chosenTone,onboarded:true};save();onboardingModal.classList.remove("show");init()}
function exportData(){let b=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`project-health-v04-${today()}.json`;a.click();URL.revokeObjectURL(a.href)}
function importData(e){let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{state=JSON.parse(r.result);save();init();alert("Data imported.")}catch{alert("Import failed.")}};r.readAsText(f)}
if("serviceWorker"in navigator)navigator.serviceWorker.register("service-worker.js?build=60").then(r=>r.update()).catch(()=>{});boot();