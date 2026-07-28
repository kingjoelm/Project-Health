const DEFAULT_WORKOUTS = {
monday:{name:"Push",focus:"Chest, shoulders, triceps",exercises:[
{name:"Machine Chest Press",sets:3,reps:"8–12",tip:"Keep shoulder blades back and lower the weight under control."},
{name:"Machine Shoulder Press",sets:3,reps:"8–12",tip:"Keep ribs down and do not force the handles too low."},
{name:"Pec Deck",sets:3,reps:"10–15",tip:"Lead with your elbows and avoid shrugging."},
{name:"Cable Triceps Pressdown",sets:3,reps:"10–15",tip:"Keep elbows close to your sides."}]},
tuesday:{name:"Pull",focus:"Back and biceps",exercises:[
{name:"Lat Pulldown",sets:3,reps:"8–12",tip:"Pull toward the upper chest without leaning far back."},
{name:"Seated Cable Row",sets:3,reps:"8–12",tip:"Finish with elbows back, not shoulders shrugged."},
{name:"Rear Delt Machine",sets:3,reps:"10–15",tip:"Use a light weight and move with control."},
{name:"Machine or Cable Curl",sets:3,reps:"10–15",tip:"Keep upper arms still."}]},
wednesday:{name:"Legs",focus:"Quads, hamstrings, glutes",exercises:[
{name:"Leg Press",sets:3,reps:"8–12",tip:"Keep your lower back supported and control the depth."},
{name:"Seated Leg Curl",sets:3,reps:"10–15",tip:"Pause briefly when the knees are bent."},
{name:"Leg Extension",sets:3,reps:"10–15",tip:"Do not swing the weight."},
{name:"Calf Raise",sets:3,reps:"12–20",tip:"Use a full comfortable range."}]},
thursday:{name:"Upper Body",focus:"Balanced upper-body training",exercises:[
{name:"Incline Machine Press",sets:3,reps:"8–12",tip:"Keep shoulder blades supported."},
{name:"Chest-Supported Row",sets:3,reps:"8–12",tip:"Pull elbows toward your back pockets."},
{name:"Lateral Raise",sets:3,reps:"10–15",tip:"Use light weight and stop around shoulder height."},
{name:"Cable Arms Superset",sets:3,reps:"10–15",tip:"Move slowly and keep the joints comfortable."}]},
friday:{name:"Full Body",focus:"Strength and conditioning",exercises:[
{name:"Goblet Squat or Leg Press",sets:3,reps:"8–12",tip:"Choose the option that feels best on your joints."},
{name:"Machine Chest Press",sets:3,reps:"8–12",tip:"Use the same setup each week."},
{name:"Lat Pulldown",sets:3,reps:"8–12",tip:"Keep the movement controlled."},
{name:"Treadmill Walk",sets:1,reps:"10 minutes",tip:"Use a pace you can maintain."}]},
saturday:{name:"Active Recovery",focus:"Walking and mobility",exercises:[
{name:"Easy Walk",sets:1,reps:"15–30 minutes",tip:"Use a conversational pace."},
{name:"Gentle Mobility",sets:1,reps:"5 minutes",tip:"Move only through comfortable ranges."}]},
sunday:{name:"Recovery",focus:"Rest and prepare",exercises:[
{name:"Optional Easy Walk",sets:1,reps:"5–20 minutes",tip:"Today is about recovery, not proving anything."}]}
};

const key="projectHealthV03";
let state=JSON.parse(localStorage.getItem(key)||"null")||{
profile:{name:"Joel",goal:"Build consistency",obstacle:"Work schedule",days:"Monday–Friday"},
daily:{},workouts:[],weights:[],victories:[]
};
let activeMode="full";
const todayKey=()=>new Date().toISOString().slice(0,10);
const dayName=()=>["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][new Date().getDay()];
const save=()=>localStorage.setItem(key,JSON.stringify(state));

function daily(){const d=todayKey();state.daily[d] ||= {water:0,sodas:0};return state.daily[d]}

function showScreen(id){
 document.querySelectorAll(".screen").forEach(x=>x.classList.toggle("active",x.id===id));
 document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("active",x.dataset.screen===id));
 if(id==="workout") renderWorkout();
 if(id==="progress") renderProgress();
 window.scrollTo({top:0,behavior:"smooth"});
}
function coachMessage(){
 const d=daily(), name=state.profile.name||"";
 let msg=`Good morning${name?", "+name:""}. You do not need a perfect day. Choose the next useful step.`;
 if(d.lifeReason) msg=`Life happened today. Protect the habit with something manageable. Five minutes still counts.`;
 else if(d.energy==="Exhausted"||d.sleep==="Under 4 hours") msg="Recovery is low today. Choose the short workout, a five-minute minimum, or recovery. All three are valid.";
 else if(d.victory) msg=`Yesterday's mindset continues today: ${d.victory}`;
 document.getElementById("coachMessage").textContent=msg;
}
function init(){
 const n=new Date();
 document.getElementById("dateLabel").textContent=n.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
 document.getElementById("greeting").textContent=`Good morning${state.profile.name?", "+state.profile.name:""}`;
 const w=DEFAULT_WORKOUTS[dayName()];
 document.getElementById("todayWorkout").textContent=w.name;
 document.getElementById("todayFocus").textContent=w.focus;
 const d=daily();
 ["sleep","energy","pain","sodas","mealNote","victory"].forEach(id=>{if(document.getElementById(id)&&d[id]!=null)document.getElementById(id).value=d[id]});
 document.getElementById("waterCount").textContent=d.water||0;
 document.getElementById("profileName").value=state.profile.name||"";
 document.getElementById("profileGoal").value=state.profile.goal||"Build consistency";
 document.getElementById("profileObstacle").value=state.profile.obstacle||"Work schedule";
 document.getElementById("profileDays").value=state.profile.days||"";
 coachMessage();updateMomentum();renderWorkout();
}
function saveCheckin(){
 const d=daily();d.sleep=sleep.value;d.energy=energy.value;d.pain=pain.value.trim();save();coachMessage();
 alert("Check-in saved. Coach PH adjusted today's recommendation.");
}
function addWater(){const d=daily();d.water=Math.min(20,(d.water||0)+1);save();waterCount.textContent=d.water;updateMomentum()}
function saveFood(){
 const d=daily();d.sodas=Number(sodas.value||0);d.mealNote=mealNote.value.trim();
 foodSuggestion.textContent=d.sodas>0?`Thanks for logging honestly. Tomorrow, aim for ${Math.max(0,d.sodas-1)} sugary drink${Math.max(0,d.sodas-1)===1?"":"s"}.`:"Nice work. Keep the focus simple and repeatable.";
 save();updateMomentum();
}
function saveVictory(){
 const v=victory.value.trim();if(!v)return alert("Write one thing you are proud of.");
 daily().victory=v;
 state.victories=state.victories.filter(x=>x.date!==todayKey());
 state.victories.unshift({date:todayKey(),text:v});
 save();updateMomentum();alert("Victory saved. It counts.");
}
function startMode(mode){activeMode=mode;showScreen("workout")}
function renderWorkout(){
 const w=DEFAULT_WORKOUTS[dayName()];
 workoutTitle.textContent=`${w.name} — ${activeMode[0].toUpperCase()+activeMode.slice(1)}`;
 let ex=[...w.exercises];
 if(activeMode==="short") ex=ex.slice(0,Math.min(3,ex.length));
 if(activeMode==="minimum") ex=[{name:"Five-Minute Walk",sets:1,reps:"5 minutes",tip:"The goal is to protect the habit, not exhaust yourself."}];
 if(activeMode==="recovery") ex=[{name:"Easy Walk or Mobility",sets:1,reps:"5–15 minutes",tip:"Move gently and stop if anything hurts."}];
 const hist=state.workouts.slice().reverse();
 exerciseList.innerHTML=ex.map((e,i)=>{
   const last=[...hist].reverse().find(s=>s.entries&&s.entries.some(x=>x.name===e.name));
   const lastEntry=last?.entries?.find(x=>x.name===e.name);
   return `<div class="exercise">
    <div class="exercise-head"><div><h3>${i+1}. ${e.name}</h3><div class="muted">${e.sets} set${e.sets>1?"s":""} × ${e.reps}</div></div><div class="pill">${lastEntry?.weight?`Last: ${lastEntry.weight}`:"New"}</div></div>
    <div class="small" style="margin:8px 0">${e.tip}</div>
    <div class="setline"><div><label>Weight</label><input data-name="${e.name}" class="weight" placeholder="lb"></div><div><label>Completed sets</label><input data-name="${e.name}" class="sets" type="number" min="0" max="${e.sets}" value="${e.sets}"></div></div>
   </div>`;
 }).join("");
 workoutCoach.textContent=activeMode==="minimum"?"Five minutes is enough to keep the promise you made to yourself.":activeMode==="recovery"?"Recovery is training when it is chosen on purpose.":"Use a weight you can control. Leave one or two good repetitions in reserve.";
}
function completeWorkout(){
 const entries=[...document.querySelectorAll(".exercise")].map((el,i)=>({
   name:el.querySelector(".weight")?.dataset.name||el.querySelector("h3").textContent,
   weight:el.querySelector(".weight")?.value||"",
   completedSets:Number(el.querySelector(".sets")?.value||0)
 }));
 state.workouts.push({date:todayKey(),mode:activeMode,day:dayName(),entries});
 daily().workoutCompleted=true;daily().workoutMode=activeMode;save();updateMomentum();
 alert("Workout saved. You completed what you chose today.");
 showScreen("today");
}
function updateMomentum(){
 const d=daily();let score=0;
 if(d.sleep||d.energy)score+=20;
 if((d.water||0)>=4)score+=20;
 if(d.mealNote||d.sodas===0)score+=20;
 if(d.workoutCompleted||d.lifeReason)score+=25;
 if(d.victory)score+=15;
 momentum.textContent=score+"%";momentumBar.style.width=score+"%";
}
function renderProgress(){
 workoutCount.textContent=state.workouts.length;
 victoryCount.textContent=state.victories.length;
 victoryHistory.innerHTML=state.victories.slice(0,8).map(v=>`<div class="success"><strong>${v.date}</strong><br>${v.text}</div>`).join("")||"No victories logged yet.";
 weightHistory.textContent=state.weights.slice(0,5).map(x=>`${x.date}: ${x.value} lb`).join(" • ")||"No weights saved yet.";
}
function saveWeight(){
 const value=Number(weightInput.value);if(!value)return alert("Enter a valid weight.");
 state.weights.unshift({date:todayKey(),value});save();weightInput.value="";renderProgress();
}
function saveProfile(){
 state.profile={...state.profile,name:profileName.value.trim(),goal:profileGoal.value,obstacle:profileObstacle.value,days:profileDays.value.trim()};
 save();init();alert("Profile saved.");
}
function saveLifeHappened(){
 if(!lifeReason.value)return alert("Choose a reason.");
 daily().lifeReason=lifeReason.value;save();coachMessage();updateMomentum();
 alert("Checked in. Today still counts.");
 showScreen("today");
}
function exportData(){
 const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`project-health-backup-${todayKey()}.json`;a.click();URL.revokeObjectURL(a.href);
}
function importData(event){
 const f=event.target.files[0];if(!f)return;
 const r=new FileReader();r.onload=()=>{try{state=JSON.parse(r.result);save();init();alert("Backup imported.");}catch(e){alert("That file could not be imported.");}};r.readAsText(f);
}
if("serviceWorker" in navigator) navigator.serviceWorker.register("service-worker.js").catch(()=>{});
init();
