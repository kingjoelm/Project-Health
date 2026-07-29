let WORKOUTS={};const STORE="projectHealthV014";let prior=JSON.parse(localStorage.getItem("projectHealthV013")||localStorage.getItem("projectHealthV012")||localStorage.getItem("projectHealthV0111")||localStorage.getItem("projectHealthV011")||localStorage.getItem("projectHealthV0101")||localStorage.getItem("projectHealthV010")||localStorage.getItem("projectHealthV09")||localStorage.getItem("projectHealthV081")||localStorage.getItem("projectHealthV080")||localStorage.getItem("projectHealthV07")||localStorage.getItem("projectHealthV06")||localStorage.getItem("projectHealthV051")||localStorage.getItem("projectHealthV05")||localStorage.getItem("projectHealthV04")||"null");let profileDB=JSON.parse(localStorage.getItem("projectHealthProfilesV09")||"null")||null;let state=JSON.parse(localStorage.getItem(STORE)||"null")||prior||{profile:{name:"",goal:"Build consistency",days:"Monday–Friday",experience:"New to the gym",location:"Commercial gym",duration:"30–45 minutes",obstacle:"Staying consistent",foodStruggle:"Portions",limitations:"",tone:"Balanced",onboarded:false},daily:{},sessions:[],meals:[],weights:[],victories:[],measurements:[],reflections:[],adaptivePlans:[]};state.adaptivePlans=state.adaptivePlans||[];state.measurements=state.measurements||[];state.reflections=state.reflections||[];state.profile={experience:"New to the gym",location:"Commercial gym",duration:"30–45 minutes",obstacle:"Staying consistent",foodStruggle:"Portions",limitations:"",tone:"Balanced",onboarded:false,...state.profile};let weekOffset=0,foodOffset=0,selectedDate=null,activeMode="full",editingMealId=null,obStep=0,chosenTone=state.profile.tone||"Balanced",timerHandle=null,timerSeconds=0,guidedIndex=0,guidedItems=[],guidedEntries={},assessment={feel:"",time:"",effort:"",pain:""},activeAdaptivePlan=null,currentActivity=null,activityTimer=null,activeProfileId=localStorage.getItem("projectHealthActiveProfile")||"default",editingProgramId=null,programDraft=null,pickerTargetDay=null,deferredInstallPrompt=null,pendingLocationAction=null,waitingServiceWorker=null;
const iso=d=>{let x=new Date(d);x.setMinutes(x.getMinutes()-x.getTimezoneOffset());return x.toISOString().slice(0,10)},today=()=>iso(new Date());

Object.defineProperties(window,{
 state:{get:()=>state,set:v=>{state=normalizeProfileState(v)}},
 profileDB:{get:()=>profileDB,set:v=>{profileDB=v}},
 activeProfileId:{get:()=>activeProfileId,set:v=>{activeProfileId=v}}
});

function normalizeProfileState(s){s.profile=s.profile||{name:"User",goal:"General health",onboarded:true};s.daily=s.daily||{};s.sessions=s.sessions||[];s.meals=s.meals||[];s.weights=s.weights||[];s.victories=s.victories||[];s.measurements=s.measurements||[];s.reflections=s.reflections||[];s.adaptivePlans=s.adaptivePlans||[];s.activities=s.activities||[];s.programs=s.programs||[];s.programMode=s.programMode||"coach";s.activeProgramId=s.activeProgramId||null;s.places=s.places||[];s.mealPlans=s.mealPlans||[];s.tester=s.tester||{};s.lastBackup=s.lastBackup||null;return s}
function ensureProfiles(){if(!profileDB){profileDB={active:"default",profiles:{default:{id:"default",name:state.profile?.name||"Primary User",goal:state.profile?.goal||"General health",state:normalizeProfileState(state)}}};localStorage.setItem("projectHealthProfilesV09",JSON.stringify(profileDB))}if(!profileDB.profiles[activeProfileId])activeProfileId=profileDB.active&&profileDB.profiles[profileDB.active]?profileDB.active:Object.keys(profileDB.profiles)[0];state=normalizeProfileState(profileDB.profiles[activeProfileId].state)}
function save(){if(profileDB){profileDB.active=activeProfileId;profileDB.profiles[activeProfileId].state=state;localStorage.setItem("projectHealthProfilesV09",JSON.stringify(profileDB));localStorage.setItem("projectHealthActiveProfile",activeProfileId)}localStorage.setItem(STORE,JSON.stringify(state));window.ProjectHealthCloud?.scheduleSync?.()}
const dayKey=d=>["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][new Date(d+"T12:00:00").getDay()];
function daily(k=today()){state.daily[k] ||= {water:0};return state.daily[k]}
async function boot(){ensureProfiles();try{WORKOUTS=await fetch("data/workouts.json?build=130",{cache:"no-store"}).then(r=>r.json())}catch(e){alert("Workout data could not load.");return}init();bindProgramControls();initTesterBeta();window.ProjectHealthCloud?.initialize?.();if(!state.profile.onboarded)setTimeout(()=>onboardingModal.classList.add("show"),250)}
function greeting(){const h=new Date().getHours();return h<12?"Good morning":h<17?"Good afternoon":"Good evening"}
function showScreen(id){document.querySelectorAll(".screen").forEach(x=>x.classList.toggle("active",x.id===id));document.querySelectorAll("nav button,.side-links button").forEach(x=>x.classList.toggle("active",x.dataset.screen===id));if(id==="week")renderWeek();if(id==="food")renderFood();if(id==="progress")renderProgress();if(id==="programs")renderPrograms();if(id==="more")renderLibraryPreview();window.scrollTo(0,0)}
function init(){dateLabel.textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});greetingEl=document.getElementById("greeting");greetingEl.textContent=`${greeting()}${state.profile.name?", "+state.profile.name:""}`;let w=workoutForDate(today());todayWorkout.textContent=w.name;todayFocus.textContent=w.focus;todayMinutes.textContent=`${w.minutes} min`;let d=daily();sleep.value=d.sleep||"";energy.value=d.energy||"";pain.value=d.pain||"";victory.value=d.victory||"";reflectionHelped.value=d.reflection?.helped||"";reflectionObstacle.value=d.reflection?.obstacle||"";reflectionTomorrow.value=d.reflection?.tomorrow||"";waterCount.textContent=d.water||0;if(window.heroSleep)heroSleep.textContent=d.sleep||"—";if(window.heroEnergy)heroEnergy.textContent=d.energy||"—";if(window.heroWater)heroWater.textContent=d.water||0;profileName.value=state.profile.name||"";profileGoal.value=state.profile.goal||"Build consistency";profileDays.value=state.profile.days||"";coach();renderTodayMeals();renderTodayWeekPreview();renderLibraryPreview();updateMomentum();renderAdaptiveStatus();renderProfileSwitcher();renderHealthSummary()}


function activeCustomProgram(){return state.activeProgramId?state.programs.find(p=>p.id===state.activeProgramId):null}
function customDayForDate(dateKey){let p=activeCustomProgram();if(!p||!["custom","hybrid"].includes(state.programMode))return null;let weekday=new Date(dateKey+"T12:00:00").toLocaleDateString(undefined,{weekday:"long"});return p.days.find(d=>d.weekday===weekday)||null}
function customWorkoutForDate(dateKey){let d=customDayForDate(dateKey);if(!d)return null;let library=allExercises();return{name:d.name,focus:`${activeCustomProgram().name} • Custom program`,minutes:Math.max(25,d.exercises.length*10+20),warmup:{name:"5-Minute Incline Walk",minutes:5,incline:"3–6%",speed:"Comfortable pace",instructions:"Use the warm-up to raise body temperature without creating fatigue."},finisher:{name:"Optional Incline Finish",minutes:10,incline:"3–8%",speed:"Sustainable pace",instructions:"Finish only if recovery and time allow."},exercises:d.exercises.map(x=>{let base=library.find(e=>e.id===x.id)||{};return{...base,...x,muscles:base.muscles||"Custom selection",setup:base.setup||"Use a safe setup and controlled range.",steps:base.steps||["Use controlled form.","Stop if pain increases."],mistakes:base.mistakes||"Avoid rushing or sacrificing form.",alternative:base.alternative||"Choose a similar pain-free movement."}})}}
function workoutForDate(dateKey){return customWorkoutForDate(dateKey)||WORKOUTS[dayKey(dateKey)]}

function completionRate(days=10){const cutoff=new Date();cutoff.setDate(cutoff.getDate()-days);const recent=state.sessions.filter(s=>new Date(s.date+"T12:00:00")>=cutoff);if(!recent.length)return 1;let total=0,done=0;recent.forEach(s=>(s.entries||[]).forEach(e=>(e.sets||[]).forEach(set=>{total++;if(set.done)done++})));return total?done/total:1}
function calculateRecoveryScore(extra={}){let d=daily(),score=70,sleep=extra.sleep||d.sleep,energy=extra.energy||d.energy,pain=extra.pain??d.pain,feel=extra.feel;if(sleep==="8+ hours")score+=15;else if(sleep==="6–8 hours")score+=7;else if(sleep==="4–6 hours")score-=10;else if(sleep==="Under 4 hours")score-=25;if(energy==="Great"||feel==="great")score+=12;else if(energy==="Good"||feel==="good")score+=6;else if(energy==="Tired"||feel==="tired")score-=12;else if(energy==="Exhausted"||feel==="exhausted")score-=25;if(feel==="sore")score-=15;if(pain)score-=18;let rate=completionRate();if(rate<.5)score-=15;else if(rate<.75)score-=7;else if(rate>.9)score+=5;return Math.max(20,Math.min(100,Math.round(score)))}
function buildAdaptivePlan(opts={}){const w=workoutForDate(opts.date||today()),score=calculateRecoveryScore(opts),time=Number(opts.time||45),effort=opts.effort||"moderate",rate=completionRate();let mode="full",exerciseCount=w.exercises.length,setFactor=1,finisher=15,warmup=5,weightFactor=1,stress="Moderate",reason="Normal training day";if(score>=80&&effort==="push"&&time>=45){setFactor=1.15;weightFactor=1.03;stress="High";reason="Recovery and readiness are strong"}if(score<70||opts.feel==="tired"||rate<.75){mode="short";exerciseCount=Math.min(3,w.exercises.length);setFactor=.8;finisher=time>=45?10:0;weightFactor=.95;stress="Low to moderate";reason="Recent recovery or completion suggests lower volume"}if(score<50||opts.feel==="exhausted"||opts.feel==="sore"||opts.pain){mode="minimum";exerciseCount=Math.min(2,w.exercises.length);setFactor=.6;finisher=0;weightFactor=.8;stress="Low";reason="Coach PH is protecting recovery and technique"}if(time<=15){mode="minimum";exerciseCount=2;setFactor=.6;finisher=0;warmup=3;stress="Low";reason="Plan reduced to fit 15 minutes"}else if(time<=30){mode="short";exerciseCount=3;setFactor=.75;finisher=0;stress="Moderate";reason="Plan reduced to fit 30 minutes"}else if(time<=45){finisher=Math.min(finisher,10)}if(effort==="easy"){setFactor=Math.min(setFactor,.75);weightFactor=Math.min(weightFactor,.9);finisher=Math.min(finisher,5);stress="Low"}let exercises=w.exercises.slice(0,exerciseCount).map(e=>({...e,sets:Math.max(1,Math.round(e.sets*setFactor))}));return{date:opts.date||today(),score,time,effort,feel:opts.feel||"",pain:opts.pain||"",mode,warmup,finisher,weightFactor,setFactor,stress,reason,workout:w.name,exercises}}
function renderAdaptiveStatus(){let saved=state.adaptivePlans.find(p=>p.date===today()),plan=saved||buildAdaptivePlan({date:today()});recoveryScore.textContent=plan.score;recoveryRing.style.setProperty("--score",plan.score+"%");trainingStress.textContent=plan.stress;adaptiveRecommendation.textContent=plan.mode==="full"?"Full session":plan.mode==="short"?"Reduced session":"Minimum day";adaptiveHeadline.textContent=plan.score>=80?"You are ready to train":plan.score>=55?"Train, but stay flexible":"Lower the stress today";adaptiveSubtext.textContent=plan.reason;if(window.sidebarRecovery)sidebarRecovery.textContent=plan.score}
function openAdaptiveAssessment(){adaptiveModal.classList.add("show");assessment={feel:"",time:"",effort:"",pain:daily().pain||""};adaptivePain.value=assessment.pain;document.querySelectorAll("#adaptiveModal button[data-value]").forEach(b=>b.classList.remove("selected"));previewAssessment()}
function closeAdaptiveAssessment(){adaptiveModal.classList.remove("show")}
function selectAssessment(btn,type){assessment[type]=btn.dataset.value;btn.parentElement.querySelectorAll("button").forEach(b=>b.classList.toggle("selected",b===btn));previewAssessment()}
function previewAssessment(){assessment.pain=adaptivePain?.value.trim()||assessment.pain||"";if(!assessment.feel||!assessment.time||!assessment.effort){assessmentPreviewTitle.textContent="Choose your answers";assessmentPreviewText.textContent="Coach PH will adjust exercise count, sets, cardio, and suggested load.";return}let p=buildAdaptivePlan(assessment);assessmentPreviewTitle.textContent=`${p.mode==="full"?"Full":p.mode==="short"?"Reduced":"Minimum"} ${p.workout}`;assessmentPreviewText.textContent=`${p.exercises.length} exercises • ${p.warmup} min warm-up • ${p.finisher} min finisher • ${p.stress} stress. ${p.reason}.`}
function applyAdaptivePlan(){assessment.pain=adaptivePain.value.trim();if(!assessment.feel||!assessment.time||!assessment.effort)return alert("Choose how you feel, your available time, and effort level.");let p=buildAdaptivePlan(assessment);state.adaptivePlans=state.adaptivePlans.filter(x=>x.date!==today());state.adaptivePlans.push(p);activeAdaptivePlan=p;save();closeAdaptiveAssessment();renderAdaptiveStatus();openWorkout(today(),true)}


function renderProfileSwitcher(){if(!profileDB)return;profileSwitcher.innerHTML=Object.values(profileDB.profiles).map(p=>`<option value="${p.id}" ${p.id===activeProfileId?"selected":""}>${p.name}</option>`).join("")}
function switchProfile(id){if(!profileDB.profiles[id])return;activeProfileId=id;state=normalizeProfileState(profileDB.profiles[id].state);save();init();renderWeek();renderFood();renderProgress();renderPrograms();showToast(`Using ${profileDB.profiles[id].name}`)}
function openProfileManager(){renderProfileList();profileModal.classList.add("show")}
function closeProfileManager(){profileModal.classList.remove("show")}
function renderProfileList(){profileList.innerHTML=Object.values(profileDB.profiles).map(p=>`<div class="plan-row"><div><strong>${p.name}</strong><div class="muted small">${p.goal||p.state.profile?.goal||"General health"}</div></div><div><button class="secondary" style="width:auto" onclick="switchProfile('${p.id}');closeProfileManager()">Use</button>${Object.keys(profileDB.profiles).length>1?` <button class="danger" style="width:auto" onclick="deleteProfile('${p.id}')">Delete</button>`:""}</div></div>`).join("")}
function createProfile(){let name=newProfileName.value.trim();if(!name)return alert("Enter a name.");let id="p_"+Date.now(),base={profile:{name,goal:newProfileGoal.value,days:"Monday–Friday",experience:"New to the gym",location:"Commercial gym",duration:"30–45 minutes",obstacle:"Staying consistent",foodStruggle:"Portions",limitations:"",tone:"Balanced",onboarded:true},daily:{},sessions:[],meals:[],weights:[],victories:[],measurements:[],reflections:[],adaptivePlans:[],activities:[]};profileDB.profiles[id]={id,name,goal:newProfileGoal.value,state:base};activeProfileId=id;state=base;save();newProfileName.value="";renderProfileSwitcher();renderProfileList();init()}
function deleteProfile(id){if(id===activeProfileId)return alert("Switch profiles before deleting this one.");if(confirm("Delete this local profile and its data?")){delete profileDB.profiles[id];save();renderProfileList();renderProfileSwitcher()}}



function makeTesterId(){return "PH-"+Math.random().toString(36).slice(2,6).toUpperCase()+"-"+Date.now().toString().slice(-5)}
function initTesterBeta(){
 state.tester=state.tester||{};
 if(!state.tester.id)state.tester.id=makeTesterId();
 testerIdDisplay.textContent=state.tester.id;testerIdBadge.textContent=state.tester.name||state.tester.id;
 lastBackupStatus.textContent=state.lastBackup?new Date(state.lastBackup).toLocaleDateString():"Never";
 if(window.exportSupportText){
   let supportsShare=!!(navigator.share&&navigator.canShare);
   exportSupportText.textContent=supportsShare?"This device can share the tester file directly.":"This browser will download a JSON tester file.";
 }
 renderSavedPlaces();
 if(!state.tester.consentAccepted)setTimeout(()=>testerConsentModal.classList.add("show"),250);
 setupInstallPrompt();setupUpdateDetection();
}
function acceptTesterConsent(){
 if(!consentBeta.checked||!consentHealth.checked||!consentStorage.checked||!consentFeedback.checked)return alert("Please acknowledge all tester statements.");
 let name=testerDisplayName.value.trim();if(!name)return alert("Enter a tester name or nickname.");
 state.tester={...state.tester,name,consentAccepted:true,consentDate:new Date().toISOString()};save();testerConsentModal.classList.remove("show");testerIdBadge.textContent=name;showToast("Tester profile activated")
}
function setupInstallPrompt(){
 window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstallPrompt=e;installHelp.textContent="Installation is available on this device."});
 window.addEventListener("appinstalled",()=>{installHelp.textContent="Project Health is installed.";deferredInstallPrompt=null});
 if(window.matchMedia("(display-mode: standalone)").matches)installHelp.textContent="Project Health is already running as an installed app.";
 else if(/iPhone|iPad|iPod/i.test(navigator.userAgent))installHelp.textContent="On iPhone: tap Share, then Add to Home Screen.";
 else installHelp.textContent="On supported browsers, use Install or Add to Home Screen."
}
async function installApp(){
 if(deferredInstallPrompt){deferredInstallPrompt.prompt();let result=await deferredInstallPrompt.userChoice;installHelp.textContent=result.outcome==="accepted"?"Installation accepted.":"Installation dismissed.";deferredInstallPrompt=null}
 else if(/iPhone|iPad|iPod/i.test(navigator.userAgent))alert("Tap the Share button in Safari, then choose Add to Home Screen.");
 else alert("Use your browser menu and choose Install App or Add to Home Screen.")
}
function setupUpdateDetection(){
 if(!("serviceWorker"in navigator))return;
 navigator.serviceWorker.addEventListener("controllerchange",()=>{
  if(sessionStorage.getItem("projectHealthApplyingUpdate")!=="1")return;
  if(sessionStorage.getItem("projectHealthUpdateReloaded")==="1")return;
  sessionStorage.setItem("projectHealthUpdateReloaded","1");
  sessionStorage.removeItem("projectHealthApplyingUpdate");
  location.reload();
 });
 navigator.serviceWorker.getRegistration().then(reg=>{
  if(!reg)return;
  if(reg.waiting){
   waitingServiceWorker=reg.waiting;
   updateBanner.classList.add("show");
  }
  reg.addEventListener("updatefound",()=>{
   const worker=reg.installing;
   if(!worker)return;
   worker.addEventListener("statechange",()=>{
    if(worker.state==="installed"&&navigator.serviceWorker.controller){
     waitingServiceWorker=worker;
     updateBanner.classList.add("show");
    }
   });
  });
 });
}
function applyAppUpdate(){
 if(!waitingServiceWorker)return;
 sessionStorage.removeItem("projectHealthUpdateReloaded");
 sessionStorage.setItem("projectHealthApplyingUpdate","1");
 waitingServiceWorker.postMessage({type:"SKIP_WAITING"});
}
function askForLocation(action){pendingLocationAction=action;locationPermissionModal.classList.add("show")}
function requestLocationPermission(){if(!navigator.geolocation)return alert("Location is not supported in this browser.");navigator.geolocation.getCurrentPosition(pos=>{locationPermissionModal.classList.remove("show");let action=pendingLocationAction;pendingLocationAction=null;if(action)action(pos.coords)},err=>{locationPermissionModal.classList.remove("show");alert("Location was not available: "+err.message)},{enableHighAccuracy:true,timeout:12000,maximumAge:30000})}
function saveCurrentPlace(type){askForLocation(coords=>{let label=prompt("Name this workout place",type==="gym"?"My Gym":"Home Gym");if(!label)return;state.places=state.places||[];state.places.push({id:crypto.randomUUID(),type,label,latitude:coords.latitude,longitude:coords.longitude,radiusMeters:250,createdAt:new Date().toISOString()});save();renderSavedPlaces();showToast(`${label} saved`)})}
function renderSavedPlaces(){if(!window.savedPlaces)return;let places=state.places||[];savedPlaces.innerHTML=places.length?places.map(p=>`<div class="place-row"><div><strong>${p.label}</strong><div class="muted small">${p.type} • ${p.radiusMeters} m check radius</div></div><button class="danger" style="width:auto" onclick="deletePlace('${p.id}')">Delete</button></div>`).join(""):`<p class="muted">No workout places saved yet.</p>`}
function deletePlace(id){state.places=state.places.filter(p=>p.id!==id);save();renderSavedPlaces()}
function distanceMeters(a,b){const R=6371000,toRad=x=>x*Math.PI/180,dLat=toRad(b.latitude-a.latitude),dLon=toRad(b.longitude-a.longitude),lat1=toRad(a.latitude),lat2=toRad(b.latitude);const h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
function checkWorkoutPlace(){if(!(state.places||[]).length)return alert("Save a gym or home-gym location first.");askForLocation(coords=>{let current={latitude:coords.latitude,longitude:coords.longitude},nearest=state.places.map(p=>({...p,distance:distanceMeters(current,p)})).sort((a,b)=>a.distance-b.distance)[0];if(nearest.distance<=nearest.radiusMeters){placeCheckResult.innerHTML=`You appear to be near <strong>${nearest.label}</strong> (${Math.round(nearest.distance)} m away). Ready to start? <button style="margin-top:8px" onclick="openAdaptiveAssessment()">Build My Workout</button>`}else placeCheckResult.textContent=`Nearest workout place: ${nearest.label}, about ${Math.round(nearest.distance)} m away.`})}
async function copyDiagnostics(){let data={version:"0.15.0",testerId:state.tester?.id,profile:state.profile?.name,userAgent:navigator.userAgent,standalone:window.matchMedia("(display-mode: standalone)").matches,profiles:Object.keys(profileDB?.profiles||{}).length,activities:(state.activities||[]).length,sessions:(state.sessions||[]).length,programs:(state.programs||[]).length,lastBackup:state.lastBackup};let text=JSON.stringify(data,null,2);try{await navigator.clipboard.writeText(text);showToast("Diagnostics copied")}catch{alert(text)}}
function buildTesterPackage(){
 state.lastBackup=new Date().toISOString();save();
 if(window.lastBackupStatus)lastBackupStatus.textContent=new Date(state.lastBackup).toLocaleDateString();
 return {
   app:"Project Health",
   version:"0.15.0",
   tester:state.tester,
   profile:state.profile,
   diagnostics:{
     userAgent:navigator.userAgent,
     platform:navigator.platform||"",
     language:navigator.language||"",
     standalone:window.matchMedia("(display-mode: standalone)").matches,
     exportedAt:new Date().toISOString()
   },
   data:state
 };
}
function setExportStatus(message,type=""){
 if(window.testerExportStatus){testerExportStatus.textContent=message;testerExportStatus.className=`muted small ${type?`export-${type}`:""}`}
 if(window.exportSupportText){exportSupportText.textContent=message;exportSupportText.className=`muted small ${type?`export-${type}`:""}`}
}
async function exportTesterPackage(){
 try{
   setExportStatus("Preparing tester package...");
   const payload=buildTesterPackage();
   const json=JSON.stringify(payload,null,2);
   const filename=`project-health-tester-${state.tester?.id||"unknown"}-${today()}.json`;
   const file=new File([json],filename,{type:"application/json"});
   if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
     try{
       await navigator.share({title:"Project Health Tester Package",text:"Project Health beta tester export",files:[file]});
       setExportStatus("Tester package shared successfully.","success");
       showToast("Tester package shared");
       return;
     }catch(err){
       if(err?.name==="AbortError"){setExportStatus("Share canceled. You can try again or use Copy Tester Package.","warning");return}
     }
   }
   const blob=new Blob([json],{type:"application/json;charset=utf-8"});
   const url=URL.createObjectURL(blob);
   const a=document.createElement("a");
   a.href=url;
   a.download=filename;
   a.style.display="none";
   document.body.appendChild(a);
   a.click();
   setTimeout(()=>{URL.revokeObjectURL(url);a.remove()},2500);
   setExportStatus(`Download started: ${filename}`,"success");
   showToast("Tester package download started");
 }catch(err){
   console.error("Tester export failed",err);
   setExportStatus("Export failed. Use Copy Tester Package below, then paste it into a message or text file.","error");
   alert("Tester export failed: "+(err?.message||"Unknown error"));
 }
}
async function copyTesterPackage(){
 try{
   const json=JSON.stringify(buildTesterPackage(),null,2);
   await navigator.clipboard.writeText(json);
   setExportStatus("Tester package copied to clipboard.","success");
   showToast("Tester package copied");
 }catch(err){
   console.error("Copy tester package failed",err);
   const json=JSON.stringify(buildTesterPackage(),null,2);
   const w=window.open();
   if(w){w.document.write(`<pre style="white-space:pre-wrap;font-family:monospace">${json.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</pre>`);setExportStatus("Package opened in a new tab. Select all and copy it.","warning")}
   else{setExportStatus("Clipboard access was blocked. Try the download again in Chrome, Edge, or Safari.","error")}
 }
}

function showToast(message){if(!window.actionToast)return;actionToast.textContent=message;actionToast.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>actionToast.classList.remove("show"),2200)}
function bindProgramControls(){
 document.getElementById("newProgramButton")?.addEventListener("click",e=>{e.preventDefault();openProgramBuilder()});
 document.getElementById("createProgramButton")?.addEventListener("click",e=>{e.preventDefault();openProgramBuilder()});
 document.getElementById("programModeCards")?.addEventListener("click",e=>{let card=e.target.closest("[data-mode]");if(card)setProgramMode(card.dataset.mode)});
}
function setProgramMode(mode){state.programMode=mode;save();renderPrograms();coach();showToast(`${mode==="coach"?"Coach":mode==="custom"?"My Program":mode==="hybrid"?"Hybrid":"Activity First"} mode selected`)}
function renderPrograms(){
 state=normalizeProfileState(state);
 document.querySelectorAll("[data-mode]").forEach(x=>x.classList.toggle("selected",x.dataset.mode===state.programMode));
 if(window.programStatus)programStatus.textContent=`Current mode: ${state.programMode==="coach"?"Coach Mode":state.programMode==="custom"?"My Program":state.programMode==="hybrid"?"Hybrid Mode":"Activity First"}${state.activeProgramId?" • Active program selected":""}`;
 if(!state.programs.length){programList.innerHTML=`<div class="empty-state"><strong>No custom programs yet</strong><div class="muted">Use New Program or install a starter template below.</div><button style="margin-top:12px" onclick="openProgramBuilder()">Build My First Program</button></div>`;return}
 programList.innerHTML=state.programs.map(p=>`<div class="program-card ${p.id===state.activeProgramId?"active":""}"><div class="top" style="margin:0"><div><div class="eyebrow">${p.id===state.activeProgramId?"ACTIVE PROGRAM":"CUSTOM PROGRAM"}</div><h3>${p.name}</h3><div class="muted small">${p.days.length} workout days • ${p.goal}</div></div><span class="pill">${p.mode||"custom"}</span></div><div class="meal-actions"><button class="secondary" onclick="activateProgram('${p.id}')">${p.id===state.activeProgramId?"Active":"Use Program"}</button><button class="ghost" onclick="editProgram('${p.id}')">Edit</button><button class="ghost" onclick="duplicateProgram('${p.id}')">Duplicate</button><button class="danger" onclick="deleteProgram('${p.id}')">Delete</button></div></div>`).join("")
}
function openProgramBuilder(programId=null){
 state=normalizeProfileState(state);editingProgramId=programId;
 let existing=state.programs.find(p=>p.id===programId);
 programDraft=existing?JSON.parse(JSON.stringify(existing)):{id:"prog_"+Date.now(),name:"",goal:"General strength",mode:state.programMode==="coach"?"custom":state.programMode,days:[]};
 programModalTitle.textContent=existing?"Edit Program":"Create Program";
 programName.value=programDraft.name;programGoal.value=programDraft.goal;
 renderProgramDays();reviewProgramDraft();programModal.classList.add("show");showToast(existing?"Editing program":"Program builder opened")
}
function closeProgramBuilder(){programModal.classList.remove("show");programDraft=null;editingProgramId=null}
function addProgramDay(){programDraft.days.push({id:"day_"+Date.now(),name:`Day ${programDraft.days.length+1}`,weekday:"Unscheduled",exercises:[]});renderProgramDays();reviewProgramDraft()}
function removeProgramDay(id){programDraft.days=programDraft.days.filter(d=>d.id!==id);renderProgramDays();reviewProgramDraft()}
function updateProgramDay(id,key,val){let d=programDraft.days.find(x=>x.id===id);if(d)d[key]=val;reviewProgramDraft()}
function renderProgramDays(){
 if(!programDraft.days.length){programDays.innerHTML=`<div class="empty-state"><strong>Add your first workout day</strong><div class="muted">Example: Push, Pull, Legs, Upper, Lower, or Full Body.</div></div>`;return}
 programDays.innerHTML=programDraft.days.map((d,di)=>`<div class="builder-day"><div class="builder-row"><div class="wide"><label>Day name</label><input value="${d.name}" oninput="updateProgramDay('${d.id}','name',this.value)"></div><div><label>Schedule</label><select onchange="updateProgramDay('${d.id}','weekday',this.value)">${["Unscheduled","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(x=>`<option ${x===d.weekday?"selected":""}>${x}</option>`).join("")}</select></div><div><label>Exercises</label><input value="${d.exercises.length}" disabled></div><button class="danger" onclick="removeProgramDay('${d.id}')">Remove</button></div><div>${d.exercises.map((e,ei)=>`<div class="builder-exercise"><img src="assets/exercises/${e.id}.jpg"><div><strong>${e.name}</strong><div class="muted small">${e.sets} sets × ${e.reps} • Rest ${e.rest}s</div></div><div><button class="ghost" style="width:auto" onclick="editProgramExercise('${d.id}',${ei})">Edit</button> <button class="danger" style="width:auto" onclick="removeProgramExercise('${d.id}',${ei})">×</button></div></div>`).join("")||`<div class="muted small" style="padding:8px 0">No exercises added.</div>`}</div><button class="secondary" onclick="openExercisePicker('${d.id}')">+ Add Exercise</button></div>`).join("")
}
function openExercisePicker(dayId){pickerTargetDay=dayId;pickerSearch.value="";renderExercisePicker();exercisePickerModal.classList.add("show")}
function closeExercisePicker(){exercisePickerModal.classList.remove("show");pickerTargetDay=null}
function renderExercisePicker(){let q=(pickerSearch.value||"").toLowerCase();let list=allExercises().filter(e=>(e.name+" "+e.muscles).toLowerCase().includes(q));exercisePickerGrid.innerHTML=list.map(e=>`<div class="library-card" onclick="addExerciseToProgram('${e.id}')"><img src="assets/exercises/${e.id}.jpg"><div><strong>${e.name}</strong><span class="muted small">${e.muscles}</span></div></div>`).join("")}
function addExerciseToProgram(id){let src=allExercises().find(e=>e.id===id),day=programDraft.days.find(d=>d.id===pickerTargetDay);if(!src||!day)return;day.exercises.push({id:src.id,name:src.name,sets:src.sets||3,reps:src.reps||"8–12",rest:60,notes:""});closeExercisePicker();renderProgramDays();reviewProgramDraft()}
function editProgramExercise(dayId,index){let day=programDraft.days.find(d=>d.id===dayId),e=day.exercises[index];let sets=prompt("Sets",e.sets);if(sets===null)return;let reps=prompt("Rep range",e.reps);if(reps===null)return;let rest=prompt("Rest seconds",e.rest);if(rest===null)return;e.sets=Math.max(1,Number(sets)||e.sets);e.reps=reps;e.rest=Math.max(15,Number(rest)||60);renderProgramDays();reviewProgramDraft()}
function removeProgramExercise(dayId,index){let day=programDraft.days.find(d=>d.id===dayId);day.exercises.splice(index,1);renderProgramDays();reviewProgramDraft()}
function reviewProgramDraft(){
 if(!programDraft){return}
 let days=programDraft.days,totalExercises=days.reduce((a,d)=>a+d.exercises.length,0),totalSets=days.reduce((a,d)=>a+d.exercises.reduce((s,e)=>s+Number(e.sets||0),0),0),notes=[];
 if(days.length===0)notes.push("Add at least one workout day.");
 if(days.length>0&&days.length<2)notes.push("One day can work, but two or more days usually make progression easier.");
 if(totalExercises>0&&totalSets/days.length>24)notes.push("Average session volume is high. Consider fewer sets or splitting the work.");
 let names=days.flatMap(d=>d.exercises.map(e=>e.name.toLowerCase()));
 if(names.length&&!names.some(n=>n.includes("row")||n.includes("pulldown")))notes.push("No clear pulling movement found.");
 if(names.length&&!names.some(n=>n.includes("press")))notes.push("No clear pressing movement found.");
 if(names.length&&!names.some(n=>n.includes("leg")||n.includes("squat")))notes.push("No clear lower-body movement found.");
 if(!notes.length)notes.push("The structure looks balanced enough to begin testing. Coach PH will refine it from actual performance.");
 programCoachReview.textContent=`${days.length} days • ${totalExercises} exercises • ${totalSets} weekly sets. ${notes.join(" ")}`
}
function saveProgram(){
 programDraft.name=programName.value.trim();programDraft.goal=programGoal.value;
 if(!programDraft.name)return alert("Name the program.");
 if(!programDraft.days.length)return alert("Add at least one workout day.");
 if(editingProgramId)state.programs=state.programs.map(p=>p.id===editingProgramId?programDraft:p);else state.programs.push(programDraft);
 if(!state.activeProgramId)state.activeProgramId=programDraft.id;
 save();closeProgramBuilder();renderPrograms();showToast("Program saved")
}
function editProgram(id){openProgramBuilder(id)}
function activateProgram(id){state.activeProgramId=id;state.programMode=state.programMode==="coach"?"custom":state.programMode;save();renderPrograms();showToast("Program activated")}
function duplicateProgram(id){let p=state.programs.find(x=>x.id===id);if(!p)return;let c=JSON.parse(JSON.stringify(p));c.id="prog_"+Date.now();c.name=p.name+" Copy";state.programs.push(c);save();renderPrograms()}
function deleteProgram(id){if(!confirm("Delete this program?"))return;state.programs=state.programs.filter(p=>p.id!==id);if(state.activeProgramId===id)state.activeProgramId=null;save();renderPrograms()}
function installTemplate(type){
 let templates={
 ppl:{name:"Push / Pull / Legs",goal:"Muscle gain",days:[
 {name:"Push",weekday:"Monday",ids:["chest-press","shoulder-press","pec-deck","triceps-pressdown"]},
 {name:"Pull",weekday:"Wednesday",ids:["lat-pulldown","seated-row","rear-delt","cable-curl"]},
 {name:"Legs",weekday:"Friday",ids:["leg-press","leg-curl","leg-extension","calf-raise"]}]},
 upperlower:{name:"Upper / Lower",goal:"General strength",days:[
 {name:"Upper A",weekday:"Monday",ids:["chest-press","seated-row","shoulder-press","cable-curl"]},
 {name:"Lower A",weekday:"Tuesday",ids:["leg-press","leg-curl","calf-raise"]},
 {name:"Upper B",weekday:"Thursday",ids:["incline-press","lat-pulldown","lateral-raise","triceps-pressdown"]},
 {name:"Lower B",weekday:"Friday",ids:["goblet-squat","leg-extension","leg-curl"]}]},
 fullbody:{name:"3-Day Full Body",goal:"General health",days:[
 {name:"Full Body A",weekday:"Monday",ids:["goblet-squat","chest-press","lat-pulldown"]},
 {name:"Full Body B",weekday:"Wednesday",ids:["leg-press","shoulder-press","seated-row"]},
 {name:"Full Body C",weekday:"Friday",ids:["leg-curl","incline-press","chest-supported-row"]}]},
 planet:{name:"Planet Fitness Machines",goal:"General health",days:[
 {name:"Machine Day A",weekday:"Monday",ids:["chest-press","lat-pulldown","leg-press","cable-curl"]},
 {name:"Machine Day B",weekday:"Thursday",ids:["shoulder-press","seated-row","leg-curl","triceps-pressdown"]}]},
 beginner:{name:"Beginner Strength",goal:"General strength",days:[
 {name:"Strength A",weekday:"Monday",ids:["goblet-squat","chest-press","seated-row"]},
 {name:"Strength B",weekday:"Thursday",ids:["leg-press","shoulder-press","lat-pulldown"]}]}
 };
 let t=templates[type],all=allExercises(),program={id:"prog_"+Date.now(),name:t.name,goal:t.goal,mode:"hybrid",days:t.days.map((d,i)=>({id:"day_"+Date.now()+"_"+i,name:d.name,weekday:d.weekday,exercises:d.ids.map(id=>{let e=all.find(x=>x.id===id);return{id:e.id,name:e.name,sets:e.sets||3,reps:e.reps||"8–12",rest:60,notes:""}})}))};
 state.programs.push(program);if(!state.activeProgramId)state.activeProgramId=program.id;save();renderPrograms();showToast(`${t.name} installed`)
}

const activityTypes={
 walk:{title:"Walk",subtypes:["Outdoor walk","Treadmill walk","Easy walk","Brisk walk","Incline walk"]},
 run:{title:"Run",subtypes:["Easy run","Tempo run","Intervals","Long run","Race or time trial"]},
 stretch:{title:"Stretch & Mobility",subtypes:["Full-body mobility","Lower-body mobility","Upper-body mobility","Gentle stretch"]},
 bike:{title:"Bike",subtypes:["Outdoor ride","Stationary bike","Easy ride","Intervals"]},
 recovery:{title:"Recovery",subtypes:["Easy walk","Mobility","Breathing and stretch","Complete recovery"]}
};

function profileWeightKg(){
 const latest=(state.weights||[]).slice().sort((a,b)=>(b.date||"").localeCompare(a.date||""))[0];
 const pounds=Number(latest?.weight||latest?.value||180);
 return Math.max(35,pounds*0.453592);
}
function activityMet(type,subtype){
 const text=(subtype||"").toLowerCase();
 if(type==="run") return text.includes("interval")?11.0:text.includes("tempo")?9.8:8.3;
 if(type==="walk") return text.includes("brisk")||text.includes("incline")?4.8:3.5;
 if(type==="bike") return text.includes("hard")||text.includes("interval")?8.5:6.0;
 if(type==="stretch") return 2.3;
 if(type==="recovery") return 2.0;
 return 4.5;
}
function estimateActivityCalories(){
 if(!currentActivity)return 0;
 const met=activityMet(currentActivity.type,currentActivity.subtype);
 return Math.max(0,Math.round(met*3.5*profileWeightKg()/200*(currentActivity.elapsed/60)));
}

function openActivity(type){currentActivity={type,elapsed:0,distance:0,running:false,startedAt:null};let cfg=activityTypes[type];activityEyebrow.textContent=type.toUpperCase();activityTitle.textContent=cfg.title;activitySubtype.innerHTML=cfg.subtypes.map(x=>`<option>${x}</option>`).join("");activitySetup.classList.remove("hide");activityTracker.classList.add("hide");activityModal.classList.add("show")}
function closeActivity(){if(currentActivity?.running&&!confirm("Close without saving this activity?"))return;clearInterval(activityTimer);activityModal.classList.remove("show")}
function startActivity(){currentActivity.subtype=activitySubtype.value;currentActivity.goal=activityGoal.value==="custom"?30:Number(activityGoal.value);currentActivity.distanceGoal=Number(activityDistanceGoal.value||0);currentActivity.running=true;currentActivity.startedAt=Date.now();activitySetup.classList.add("hide");activityTracker.classList.remove("hide");activityGoalDisplay.textContent=currentActivity.goal;if(window.activityCalories)activityCalories.textContent="0";activityCoachText.textContent=currentActivity.type==="run"?"Start easier than you think you need to.":"The hardest part is starting. Keep the pace sustainable.";activityTimer=setInterval(tickActivity,1000)}
function tickActivity(){if(window.activityCalories)activityCalories.textContent=estimateActivityCalories();if(!currentActivity?.running)return;currentActivity.elapsed++;let m=Math.floor(currentActivity.elapsed/60),s=currentActivity.elapsed%60;activityTime.textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;if(m>=currentActivity.goal)activityCoachText.textContent="Goal reached. Finish when you are ready—more is optional."}
function pauseActivity(){currentActivity.running=!currentActivity.running;activityPause.textContent=currentActivity.running?"Pause":"Resume"}
function updateActivityDistance(v){currentActivity.distance=Number(v||0);activityDistance.textContent=currentActivity.distance.toFixed(2);let mins=currentActivity.elapsed/60;if(currentActivity.distance>0&&mins>0)activityPace.textContent=(mins/currentActivity.distance).toFixed(1)}
function finishActivity(){clearInterval(activityTimer);let minutes=Math.max(1,Math.round(currentActivity.elapsed/60));let record={id:crypto.randomUUID(),date:today(),type:currentActivity.type,subtype:currentActivity.subtype,minutes,distance:Number(currentActivity.distance||0),calories:estimateActivityCalories(),goal:currentActivity.goal,completedAt:new Date().toISOString()};state.activities=state.activities||[];state.activities.push(record);save();activityModal.classList.remove("show");renderHealthSummary();updateMomentum();alert(`${activityTypes[currentActivity.type].title} saved: ${minutes} minutes.`);currentActivity=null}
function renderHealthSummary(){let acts=(state.activities||[]).filter(a=>a.date===today()),mins=acts.reduce((a,x)=>a+x.minutes,0),d=daily();if(window.healthMovement)healthMovement.textContent=mins+" min";if(window.healthWater)healthWater.textContent=d.water||0;if(window.healthMeals)healthMeals.textContent=state.meals.filter(m=>m.date===today()).length;let p=state.adaptivePlans.find(x=>x.date===today())||buildAdaptivePlan({date:today()});if(window.healthRecovery)healthRecovery.textContent=p.score}

function coach(){if(state.programMode==="custom"&&state.activeProgramId){let p=state.programs.find(x=>x.id===state.activeProgramId);if(p&&window.coachContext)coachContext.textContent=`Following ${p.name} • Coach PH guidance`; }
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
function updateMomentum(){let d=daily(),s=0;if(d.sleep||d.energy)s+=20;if((d.water||0)>=4)s+=20;if(state.meals.some(m=>m.date===today()))s+=20;if(state.sessions.some(x=>x.date===today())||(state.activities||[]).some(x=>x.date===today()))s+=25;if(d.victory)s+=15;momentum.textContent=s+"%";momentumBar.style.width=s+"%";if(window.heroMomentum)heroMomentum.textContent=s+"%"}
function mondayOf(date){let d=new Date(date);let n=d.getDay()||7;d.setDate(d.getDate()-n+1);d.setHours(12,0,0,0);return d}
function changeWeek(n){weekOffset+=n;renderWeek()}
function renderWeek(){let start=mondayOf(new Date());start.setDate(start.getDate()+weekOffset*7);let end=new Date(start);end.setDate(end.getDate()+6);weekRange.textContent=`${start.toLocaleDateString(undefined,{month:"short",day:"numeric"})} – ${end.toLocaleDateString(undefined,{month:"short",day:"numeric"})}`;weekLabel.textContent=weekOffset===0?"This week":weekOffset<0?"Past week":"Upcoming week";weekList.innerHTML="";for(let i=0;i<7;i++){let d=new Date(start);d.setDate(start.getDate()+i);let k=iso(d),w=workoutForDate(k),session=state.sessions.find(s=>s.date===k),isToday=k===today(),past=k<today();let status=session?`<span class="status done">Completed</span>`:isToday?`<span class="status" style="color:var(--blue)">Today</span>`:past?`<span class="status missed">Not logged</span>`:`<span class="status upcoming">Upcoming</span>`;weekList.innerHTML+=`<div class="dayrow" onclick="openWorkout('${k}')"><div class="daynum ${isToday?"todaydot":""}">${d.toLocaleDateString(undefined,{day:"numeric"})}</div><div><strong>${d.toLocaleDateString(undefined,{weekday:"long"})} — ${w.name}</strong><div class="muted small">${w.focus} • ${w.minutes} min</div></div>${status}</div>`}}

function renderTodayWeekPreview(){let start=mondayOf(new Date());todayWeekPreview.innerHTML="";for(let i=0;i<7;i++){let d=new Date(start);d.setDate(start.getDate()+i);let k=iso(d),w=workoutForDate(k),done=state.sessions.some(s=>s.date===k);todayWeekPreview.innerHTML+=`<div class="chip" onclick="openWorkout('${k}')"><span class="muted small">${d.toLocaleDateString(undefined,{weekday:"short"})}</span><strong>${w.name}</strong><span class="small ${done?"done":"muted"}">${done?"Done":k===today()?"Today":k<today()?"Past":"Next"}</span></div>`}}

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
function openWorkout(k=today(),useAdaptive=false){selectedDate=k;activeAdaptivePlan=useAdaptive?state.adaptivePlans.find(p=>p.date===k):state.adaptivePlans.find(p=>p.date===k)||null;activeMode=activeAdaptivePlan?.mode||"full";renderWorkoutModal();workoutModal.classList.add("show")}
function closeWorkout(){workoutModal.classList.remove("show")}
function setMode(m){activeMode=m;activeAdaptivePlan=null;renderWorkoutModal()}
function previousEntry(name){for(let i=state.sessions.length-1;i>=0;i--){let e=state.sessions[i].entries?.find(x=>x.name===name);if(e)return e}return null}
function progressionSuggestion(workout,plan={weightFactor:1}){
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
 if(plan.weightFactor<1)return `<strong>Coach PH:</strong> Reduce load and/or sets today. Finishing less with good form is better than forcing the full plan.`;if(!tips.length)return `<strong>Coach PH:</strong> Log today's sets clearly. Your next progression suggestion will come from this workout.`;
 return `<strong>Coach PH progression:</strong><div>${tips.slice(0,2).join("<br>")}</div>`;
}
function phaseCard(phase,type){
 if(!phase)return "";
 let isWarm=type==="warmup";
 return `<div class="phase-card"><div class="phase-head"><div><div class="muted small">${isWarm?"BEFORE LIFTING":"AFTER LIFTING"}</div><h2>${phase.name}</h2><div class="muted">${phase.minutes} minutes • Incline ${phase.incline}</div></div><span class="phase-badge">${isWarm?"Warm-up":"Finisher"}</span></div><img class="phase-image" src="assets/exercises/treadmill-walk.jpg" alt="${phase.name}"><p>${phase.instructions}</p><div class="pill">Speed: ${phase.speed}</div><div class="phase-controls"><button class="secondary" onclick="startPhaseTimer(${phase.minutes},'${phase.name.replace(/'/g,"")}')">Start ${phase.minutes}:00 Timer</button><button class="ghost" onclick="markPhaseDone(this,'${type}')">Mark Done</button></div></div>`
}
function renderWorkoutModal(){
 let w=workoutForDate(selectedDate),plan=activeAdaptivePlan||buildAdaptivePlan({date:selectedDate,time:activeMode==="full"?60:activeMode==="short"?30:15,effort:"moderate"});
 modalDate.textContent=new Date(selectedDate+"T12:00:00").toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
 modalWorkoutTitle.textContent=`${w.name} — ${activeMode}`;
 workoutSuggestion.innerHTML=progressionSuggestion(w,plan);
 adaptivePlanSummary.innerHTML=`<div class="top" style="margin:0"><div><div class="muted small">COACH PH PLAN</div><h3>${plan.exercises.length} exercises • ${plan.stress} stress</h3><div class="muted">${plan.reason}</div></div><div class="score-ring" style="--score:${plan.score}%"><strong>${plan.score}</strong></div></div><div class="grid"><div><span class="muted small">LOAD GUIDE</span><strong>${Math.round(plan.weightFactor*100)}%</strong></div><div><span class="muted small">CARDIO</span><strong>${plan.warmup}+${plan.finisher} min</strong></div></div>`;
 let ex=plan.exercises.map(e=>({...e}));
 if(activeMode==="recovery")ex=[WORKOUTS.sunday.exercises[0]];
 guidedItems=[];
 if(plan.warmup>0&&activeMode!=="recovery")guidedItems.push({type:"warmup",name:`${plan.warmup}-Minute Incline Warm-Up`,minutes:plan.warmup,phase:w.warmup});
 ex.forEach((e,i)=>guidedItems.push({type:"exercise",name:e.name,exercise:e,index:i,plan}));
 if(plan.finisher>0&&activeMode!=="recovery")guidedItems.push({type:"finisher",name:`${plan.finisher}-Minute Incline Finisher`,minutes:plan.finisher,phase:w.finisher});
 guidedItems.push({type:"summary",name:"Workout Summary",plan});
 guidedIndex=0;guidedEntries={};renderGuidedStep();
}
function renderGuidedStep(){
 guidedSteps.innerHTML=guidedItems.map((item,i)=>`<div class="guided-step ${i===guidedIndex?"active":""} ${item.done?"done":""}" onclick="goGuidedStep(${i})"><div class="step-number">${item.done?"✓":i+1}</div><div><strong>${item.name}</strong><div class="small muted">${item.type==="exercise"?`${item.exercise.sets} sets × ${item.exercise.reps}`:item.type==="summary"?"Review and save":`${item.minutes} minutes`}</div></div></div>`).join("");
 let item=guidedItems[guidedIndex],pct=guidedItems.length>1?(guidedIndex/(guidedItems.length-1))*100:0;guidedProgressBar.style.width=pct+"%";
 guidedNextButton.textContent=item.type==="summary"?"Save Workout":"Next →";
 if(item.type==="warmup"||item.type==="finisher"){let p=item.phase||{};exerciseList.innerHTML=`<div class="phase-card"><div class="phase-head"><div><div class="eyebrow">${item.type==="warmup"?"PREPARE":"FINISH"}</div><h1>${item.name}</h1><div class="muted">Incline ${p.incline||"comfortable"} • ${p.speed||"steady pace"}</div></div><span class="phase-badge">${item.type==="warmup"?"Warm-up":"Finisher"}</span></div><img class="phase-image" src="assets/exercises/treadmill-walk.jpg"><p>${p.instructions||"Walk at a sustainable pace with controlled posture."}</p><button onclick="startPhaseTimer(${item.minutes},'${item.name.replace(/'/g,"")}')">Start ${item.minutes}:00 Timer</button><button class="ghost" style="margin-top:8px" onclick="markGuidedDone()">Mark Complete</button></div>`;return}
 if(item.type==="summary"){let completed=guidedItems.filter(x=>x.done).length,total=guidedItems.length-1;exerciseList.innerHTML=`<div class="card"><div class="eyebrow">WORKOUT COMPLETE</div><h1>Review today’s session</h1><div class="guided-summary-grid"><div class="metric"><strong>${completed}</strong><span class="muted small">steps completed</span></div><div class="metric"><strong>${Object.keys(guidedEntries).length}</strong><span class="muted small">exercises logged</span></div><div class="metric"><strong>${activeMode}</strong><span class="muted small">workout mode</span></div></div><label>How did it feel?</label><select id="guidedFeeling"><option>Great</option><option>Good</option><option>Okay</option><option>Hard</option><option>Painful</option></select><label>Workout note</label><textarea id="guidedWorkoutNote" placeholder="Optional"></textarea><div class="suggestion"><strong>Coach PH:</strong> Saving an honest partial workout is better than pretending it did not happen.</div></div>`;return}
 let e=item.exercise,last=previousEntry(e.name),entry=guidedEntries[e.name]||{sets:Array.from({length:e.sets},()=>({weight:"",reps:"",done:false})),note:""};
 let loadNote=item.plan.weightFactor<1?`Use about ${Math.round(item.plan.weightFactor*100)}% of your normal load.`:item.plan.weightFactor>1?"A small increase is optional if form stays solid.":"Use your normal working weight.";
 exerciseList.innerHTML=`<div class="card exercise-card"><img src="assets/exercises/${e.id}.jpg" alt="${e.name} demonstration"><div class="exercise-body"><div class="eyebrow">EXERCISE ${guidedIndex} OF ${guidedItems.length-1}</div><h1>${e.name}</h1><div class="muted">${e.muscles}</div><div class="pill" style="margin:10px 0">${last?`Previous: ${last.sets.map(s=>`${s.weight||0}×${s.reps||0}`).join(", ")}`:"First logged session"}</div><div class="suggestion"><strong>Coach PH load:</strong> ${loadNote}</div><div class="instructions"><strong>Setup</strong><div>${e.setup}</div><ol>${e.steps.map(s=>`<li>${s}</li>`).join("")}</ol></div><details><summary>Common mistakes & alternative</summary><p><strong>Avoid:</strong> ${e.mistakes}</p><p><strong>Alternative:</strong> ${e.alternative}</p></details><div class="small muted" style="margin-top:12px">Log each working set</div>${entry.sets.map((s,j)=>`<div class="setrow"><strong>${j+1}</strong><input value="${s.weight}" oninput="updateGuidedSet('${e.name}',${j},'weight',this.value)" placeholder="lb"><input value="${s.reps}" oninput="updateGuidedSet('${e.name}',${j},'reps',this.value)" placeholder="reps"><button onclick="toggleGuidedSet('${e.name}',${j},this)">${s.done?"✓":"○"}</button></div>`).join("")}<label>Pain or note</label><input value="${entry.note||""}" oninput="updateGuidedNote('${e.name}',this.value)" placeholder="Optional"></div></div>`;
}
function updateGuidedSet(name,i,key,value){if(!guidedEntries[name]){let e=guidedItems.find(x=>x.exercise?.name===name).exercise;guidedEntries[name]={sets:Array.from({length:e.sets},()=>({weight:"",reps:"",done:false})),note:""}}guidedEntries[name].sets[i][key]=value}
function toggleGuidedSet(name,i,btn){updateGuidedSet(name,i,"done",btn.textContent!=="✓");btn.textContent=guidedEntries[name].sets[i].done?"✓":"○";if(guidedEntries[name].sets[i].done)startTimer(60)}
function updateGuidedNote(name,value){if(!guidedEntries[name]){let e=guidedItems.find(x=>x.exercise?.name===name).exercise;guidedEntries[name]={sets:Array.from({length:e.sets},()=>({weight:"",reps:"",done:false})),note:""}}guidedEntries[name].note=value}
function markGuidedDone(){guidedItems[guidedIndex].done=true;nextGuidedStep()}
function goGuidedStep(i){guidedIndex=Math.max(0,Math.min(guidedItems.length-1,i));renderGuidedStep()}
function previousGuidedStep(){goGuidedStep(guidedIndex-1)}
function nextGuidedStep(){if(guidedItems[guidedIndex].type==="summary"){completeGuidedWorkout();return}if(guidedItems[guidedIndex].type==="exercise"){let e=guidedItems[guidedIndex].exercise,entry=guidedEntries[e.name];guidedItems[guidedIndex].done=!!entry&&entry.sets.some(s=>s.done)}else guidedItems[guidedIndex].done=true;goGuidedStep(guidedIndex+1)}
function completeGuidedWorkout(){let w=workoutForDate(selectedDate),entries=guidedItems.filter(x=>x.type==="exercise").map(x=>({name:x.exercise.name,...(guidedEntries[x.exercise.name]||{sets:Array.from({length:x.exercise.sets},()=>({weight:"",reps:"",done:false})),note:""})}));let phases=guidedItems.filter(x=>x.type==="warmup"||x.type==="finisher").map(x=>({type:x.type,done:!!x.done}));let completedSets=entries.flatMap(e=>e.sets).filter(s=>s.done).length,totalSets=entries.flatMap(e=>e.sets).length,completion=totalSets?completedSets/totalSets:0;state.sessions=state.sessions.filter(s=>s.date!==selectedDate);state.sessions.push({date:selectedDate,mode:activeMode,workout:w.name,entries,phases,completion,feeling:document.getElementById("guidedFeeling")?.value||"",note:document.getElementById("guidedWorkoutNote")?.value||"",adaptivePlan:activeAdaptivePlan||null,completedAt:new Date().toISOString()});if(completion<.7){let tomorrow=new Date(selectedDate+"T12:00:00");tomorrow.setDate(tomorrow.getDate()+1);let tk=iso(tomorrow),next=buildAdaptivePlan({date:tk,time:30,effort:"easy",feel:"tired"});next.reason="Previous workout was not fully completed, so volume and load were reduced.";state.adaptivePlans=state.adaptivePlans.filter(x=>x.date!==tk);state.adaptivePlans.push(next)}save();closeWorkout();renderWeek();renderProgress();updateMomentum();renderAdaptiveStatus();alert(completion<.7?"Workout saved. Coach PH reduced the next session to help you recover and rebuild momentum.":"Workout saved. Coach PH will use this performance for your next plan.")}
function startPhaseTimer(minutes,label){timerSeconds=minutes*60;stopTimer(false);restTimer.classList.add("show");restTimer.querySelector("strong").textContent=label;drawTimer();timerHandle=setInterval(()=>{timerSeconds--;drawTimer();if(timerSeconds<=0){stopTimer();if(navigator.vibrate)navigator.vibrate([200,100,200])}},1000)}
function markPhaseDone(btn,type){btn.textContent="✓ Completed";btn.disabled=true;btn.dataset.done="true";btn.closest(".phase-card").dataset.phase=type}
function toggleSet(btn){let done=btn.textContent!=="✓";btn.textContent=done?"✓":"○";if(done)startTimer(60)}
function startTimer(seconds){stopTimer();timerSeconds=seconds;restTimer.classList.add("show");drawTimer();timerHandle=setInterval(()=>{timerSeconds--;drawTimer();if(timerSeconds<=0){stopTimer();if(navigator.vibrate)navigator.vibrate([180,80,180])}},1000)}
function drawTimer(){timerText.textContent=`${String(Math.floor(timerSeconds/60)).padStart(2,"0")}:${String(timerSeconds%60).padStart(2,"0")}`}
function addTimer(n){timerSeconds+=n;drawTimer()}
function stopTimer(reset=true){if(timerHandle)clearInterval(timerHandle);timerHandle=null;restTimer.classList.remove("show");if(reset){let s=restTimer.querySelector("strong");if(s)s.textContent="Rest timer"}}
function completeWorkout(){let w=WORKOUTS[dayKey(selectedDate)],cards=[...document.querySelectorAll("#exerciseList .exercise-card")];let entries=cards.map((c,i)=>({name:c.querySelector("h2").textContent,sets:[...c.querySelectorAll(".setrow")].map(r=>({weight:r.querySelector(".set-weight").value,reps:r.querySelector(".set-reps").value,done:r.querySelector("button").textContent==="✓"})),note:c.querySelector(".exercise-note").value}));state.sessions=state.sessions.filter(s=>s.date!==selectedDate);let phases=[...document.querySelectorAll("#exerciseList .phase-card")].map(p=>({type:p.dataset.phase||"",done:!!p.querySelector("[data-done='true']")}));let completedSets=entries.flatMap(e=>e.sets).filter(s=>s.done).length,totalSets=entries.flatMap(e=>e.sets).length,completion=totalSets?completedSets/totalSets:0;state.sessions.push({date:selectedDate,mode:activeMode,workout:w.name,entries,phases,completion,adaptivePlan:activeAdaptivePlan||null,completedAt:new Date().toISOString()});if(completion<.7){let tomorrow=new Date(selectedDate+"T12:00:00");tomorrow.setDate(tomorrow.getDate()+1);let tk=iso(tomorrow),next=buildAdaptivePlan({date:tk,time:30,effort:"easy",feel:"tired"});next.reason="Previous workout was not fully completed, so volume and load were reduced.";state.adaptivePlans=state.adaptivePlans.filter(x=>x.date!==tk);state.adaptivePlans.push(next)}save();closeWorkout();renderWeek();renderProgress();updateMomentum();alert(completion<.7?"Workout saved. Coach PH reduced the next session to help you recover and rebuild momentum.":"Workout saved. Coach PH will use this performance for your next plan.")}
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
async function copyFeedback(){let report=`Project Health Beta v0.15.0\nCategory: ${feedbackCategory.value}\nDevice: ${navigator.userAgent}\nDate: ${new Date().toLocaleString()}\nFeedback: ${feedbackText.value.trim()}`;if(!feedbackText.value.trim())return alert("Enter feedback first.");try{await navigator.clipboard.writeText(report);feedbackResult.textContent="Feedback copied. Paste it into a text or email to Joel.";feedbackResult.classList.remove("hide")}catch(e){feedbackResult.textContent=report;feedbackResult.classList.remove("hide")}}
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
function exportData(){state.lastBackup=new Date().toISOString();save();if(window.lastBackupStatus)lastBackupStatus.textContent=new Date(state.lastBackup).toLocaleDateString();let b=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`project-health-v015-${today()}.json`;a.click();URL.revokeObjectURL(a.href)}
function importData(e){let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{state=JSON.parse(r.result);save();init();alert("Data imported.")}catch{alert("Import failed.")}};r.readAsText(f)}
if("serviceWorker"in navigator)navigator.serviceWorker.register("service-worker.js?build=130").then(r=>setTimeout(()=>r.update().catch(()=>{}),3000)).catch(()=>{});boot();

const COACH_RECIPES={
 fish:{
  title:"Lemon Garlic Fish with Rice & Vegetables",emoji:"🐟",calories:590,protein:42,carbs:66,fat:16,
  ingredients:["white fish fillets","rice","broccoli or mixed vegetables","lemon","garlic","olive oil","salt and pepper"],
  steps:["Start the rice according to the package directions.","Season the fish with garlic, lemon, salt, and pepper.","Cook the fish in a lightly oiled pan for 3–5 minutes per side, until it flakes easily.","Steam or sauté the vegetables until tender-crisp.","Serve the fish over rice with vegetables and fresh lemon."]
 },
 chicken:{
  title:"High-Protein Chicken Rice Bowl",emoji:"🍗",calories:610,protein:49,carbs:68,fat:15,
  ingredients:["chicken breast","rice","bell pepper","onion","spinach","olive oil","garlic seasoning"],
  steps:["Cook the rice.","Slice and season the chicken.","Cook chicken in a skillet until fully done.","Sauté the vegetables in the same pan.","Build the bowl with rice, chicken, and vegetables."]
 },
 beef:{
  title:"Lean Beef & Vegetable Bowl",emoji:"🥩",calories:640,protein:45,carbs:58,fat:23,
  ingredients:["lean ground beef","rice or potatoes","mixed vegetables","onion","garlic","low-sodium seasoning"],
  steps:["Cook the rice or potatoes.","Brown the beef with onion and garlic.","Drain excess fat if needed.","Add vegetables and cook until tender.","Serve together and portion evenly."]
 },
 vegetarian:{
  title:"Protein-Packed Chickpea Rice Bowl",emoji:"🥗",calories:560,protein:22,carbs:88,fat:14,
  ingredients:["chickpeas","rice or quinoa","mixed vegetables","spinach","lemon","olive oil","seasoning"],
  steps:["Cook the rice or quinoa.","Rinse and season the chickpeas.","Roast or sauté chickpeas and vegetables.","Add spinach until wilted.","Finish with lemon and divide into servings."]
 },
 breakfast:{
  title:"Egg & Oat Power Breakfast",emoji:"🍳",calories:510,protein:31,carbs:52,fat:20,
  ingredients:["eggs","oats","berries or banana","Greek yogurt","cinnamon"],
  steps:["Cook the oats with water or milk.","Scramble or boil the eggs.","Top oats with fruit and cinnamon.","Serve with Greek yogurt and eggs."]
 }
};
function selectCoachRecipe(prompt){
 const p=(prompt||"").toLowerCase();
 if(/fish|salmon|tilapia|cod|seafood/.test(p))return COACH_RECIPES.fish;
 if(/chicken|turkey/.test(p))return COACH_RECIPES.chicken;
 if(/beef|steak|burger/.test(p))return COACH_RECIPES.beef;
 if(/breakfast|egg|oat/.test(p))return COACH_RECIPES.breakfast;
 if(/vegetarian|meatless|chickpea|beans|tofu/.test(p))return COACH_RECIPES.vegetarian;
 return COACH_RECIPES.chicken;
}
function generateCoachMealPlan(){
 const prompt=(window.mealPlanPrompt?.value||"").trim();
 if(!prompt)return alert("Tell Coach PH what you want to make.");
 const base=selectCoachRecipe(prompt),servings=Number(mealPlanServings.value||2),time=Number(mealPlanTime.value||30);
 const recipe={...base,id:crypto.randomUUID(),prompt,servings,time,createdAt:new Date().toISOString()};
 state.mealPlans=state.mealPlans||[];state.mealPlans.unshift(recipe);save();
 const totalCalories=base.calories*servings;
 coachMealResult.innerHTML=`<div class="recipe-card">
  <div class="top" style="margin:0"><div><div class="eyebrow">${base.emoji} COACH PH RECIPE</div><h3>${base.title}</h3></div><span class="pill">${time} min</span></div>
  <div class="recipe-meta"><span>${base.calories} cal/serving</span><span>${base.protein}g protein</span><span>${base.carbs}g carbs</span><span>${base.fat}g fat</span><span>${servings} servings</span></div>
  <h3>Ingredients</h3><div class="grocery-list">${base.ingredients.map(x=>`<div class="grocery-item">✓ ${x}</div>`).join("")}</div>
  <h3 style="margin-top:14px">Directions</h3><ol class="recipe-steps">${base.steps.map(x=>`<li>${x}</li>`).join("")}</ol>
  <div class="grid"><button onclick="addCoachRecipeToMeals('${recipe.id}')">Add to Today's Meals</button><button class="secondary" onclick="copyCoachGroceryList('${recipe.id}')">Copy Grocery List</button></div>
  <div class="muted small" style="margin-top:9px">Nutrition is an estimate. Adjust portions and ingredients for allergies, medical needs, and personal goals.</div>
 </div>`;
}
function addCoachRecipeToMeals(id){
 const r=(state.mealPlans||[]).find(x=>x.id===id);if(!r)return;
 state.meals.push({id:crypto.randomUUID(),date:today(),type:"Dinner",description:r.title,plan:"Planned with Coach PH",time:new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}),calories:r.calories,protein:r.protein,recipeId:r.id});
 save();renderTodayMeals();renderFood();updateMomentum();alert("Recipe added to today's meals.");
}
function copyCoachGroceryList(id){
 const r=(state.mealPlans||[]).find(x=>x.id===id);if(!r)return;
 const text=`${r.title}\n\nGrocery list (${r.servings} servings):\n- ${r.ingredients.join("\n- ")}`;
 navigator.clipboard?.writeText(text).then(()=>alert("Grocery list copied.")).catch(()=>prompt("Copy this grocery list:",text));
}



/* Project Health v0.15.0 — AI Coach Experience
   Additive migration: retains projectHealthV014 and projectHealthProfilesV09. */
function ensureV15State(){
 state.profile=state.profile||{};
 if(!state.profile.coachMode)state.profile.coachMode=({"Lose weight":"Weight Loss","Gain strength":"Muscle Building"}[state.profile.goal]||"General Wellness");
 if(typeof state.profile.coachMemoryEnabled!=="boolean")state.profile.coachMemoryEnabled=true;
 if(typeof state.profile.coachMemory!=="string")state.profile.coachMemory="";
 state.coachChat=Array.isArray(state.coachChat)?state.coachChat:[];
 state.coachBriefings=Array.isArray(state.coachBriefings)?state.coachBriefings:[];
}
function v15TodayActivities(){return (state.activities||[]).filter(x=>x.date===today())}
function v15TodayMeals(){return (state.meals||[]).filter(x=>x.date===today())}
function v15HealthScore(){
 let d=daily(),water=Math.min(1,(Number(d.water)||0)/8),meals=Math.min(1,v15TodayMeals().length/3),move=Math.min(1,v15TodayActivities().reduce((a,x)=>a+(Number(x.minutes)||0),0)/30),check=(d.energy||d.sleep)?1:.45;
 return Math.round(42+((water+meals+move+check)/4)*53)
}
function v15LatestWeight(){let w=(state.weights||[])[0];return w?`${w.value} lb`:"—"}
function v15CoachModePlan(){
 const plans={
  "Weight Loss":["Build one filling meal around protein and vegetables.","A 20-minute walk is enough to protect momentum."],
  "Muscle Building":["Prioritize protein and complete the repeatable version of strength training.","Recovery is part of the program, not time away from it."],
  "Heart Health":["Choose steady movement and a fiber-rich meal today.","Keep intensity comfortable unless a clinician has cleared harder work."],
  "Mental Wellness":["Use daylight, gentle movement, and one honest check-in.","The goal is to feel more capable, not punished."],
  "Diabetes Support":["Pair carbohydrates with protein and fiber, and consider gentle movement after meals.","Follow your clinician's plan for medication and glucose decisions."],
  "General Wellness":["Start with water, plan the next meal, and move for 20 minutes.","Consistency beats an intense day you cannot repeat."]};
 return plans[state.profile.coachMode]||plans["General Wellness"]
}
function renderV15Briefing(){
 ensureV15State();let d=daily(),acts=v15TodayActivities(),mins=acts.reduce((a,x)=>a+(Number(x.minutes)||0),0),plan=v15CoachModePlan();
 if(window.v15HealthScore)v15HealthScore.textContent=v15HealthScore();
 if(window.v15BriefGreeting)v15BriefGreeting.textContent=`${greeting()}${state.profile.name?", "+state.profile.name:""}.`;
 if(window.v15BriefMessage)v15BriefMessage.textContent=plan[0];
 if(window.v15BriefWater)v15BriefWater.textContent=`${Number(d.water)||0}/8`;
 if(window.v15BriefMeals)v15BriefMeals.textContent=v15TodayMeals().length;
 if(window.v15BriefMovement)v15BriefMovement.textContent=`${mins} min`;
 if(window.v15BriefWeight)v15BriefWeight.textContent=v15LatestWeight();
 if(window.v15CoachCorner)v15CoachCorner.textContent=mins?"Movement logged. Support that win with water and a useful meal.":plan[1];
}
function loadCoachPreferences(){
 ensureV15State();if(window.coachModeSetting)coachModeSetting.value=state.profile.coachMode;if(window.coachMemorySetting)coachMemorySetting.value=state.profile.coachMemory||"";if(window.coachMemoryEnabled)coachMemoryEnabled.checked=!!state.profile.coachMemoryEnabled;
}
function saveCoachPreferences(){
 ensureV15State();state.profile.coachMode=coachModeSetting.value;state.profile.coachMemory=coachMemorySetting.value.trim();state.profile.coachMemoryEnabled=coachMemoryEnabled.checked;save();renderV15Experience();showToast("Coach preferences saved")
}
function clearCoachMemory(){ensureV15State();if(!confirm("Clear saved Coach PH preferences and conversation history?"))return;state.profile.coachMemory="";state.coachChat=[];save();renderV15Experience();showToast("Coach memory cleared")}
function v15CoachMemory(){return state.profile.coachMemoryEnabled&&state.profile.coachMemory?`\n\nSaved preference considered: ${state.profile.coachMemory}`:""}
function v15CoachAnswer(q){
 ensureV15State();const t=(q||"").toLowerCase(),plan=v15CoachModePlan(),mode=state.profile.coachMode,mem=v15CoachMemory(),d=daily(),mins=v15TodayActivities().reduce((a,x)=>a+(Number(x.minutes)||0),0);
 if(/brief|start my day|priorit/.test(t))return `${greeting()}${state.profile.name?", "+state.profile.name:""}.\n\nToday's health score is ${v15HealthScore()}.\n• Water: ${Number(d.water)||0}/8 bottles\n• Meals logged: ${v15TodayMeals().length}\n• Movement: ${mins} minutes\n• Coach mode: ${mode}\n\nYour next useful action: ${plan[0]}${mem}`;
 if(/eat|meal|recipe|food|grocery/.test(t)){let r=selectCoachRecipe(q);return `Try ${r.title}.\n\nA practical serving is built around protein, a controlled portion of carbohydrate, and vegetables. The recipe tool below can create the ingredients, directions, estimated macros, and grocery list.\n\nEstimated per serving: ${r.calories} calories and ${r.protein}g protein.${mem}`}
 if(/workout|exercise|train|walk|run/.test(t)){let p=buildAdaptivePlan({date:today(),feel:(d.energy||"").toLowerCase().includes("tired")?"tired":"good",time:30,effort:"moderate",pain:d.pain||""});return `For ${mode}, I recommend the ${p.mode} version of ${p.workout}.\n\n${p.exercises.length} exercises, ${p.warmup}-minute warm-up, and ${p.finisher}-minute finisher. Reason: ${p.reason}.\n\nUse the Adjust Today's Plan tool before starting if pain, time, or energy changed.${mem}`}
 if(/reflect|journal/.test(t))return `Answer these three questions:\n\n1. What did you do well today?\n2. What made the healthy choice harder?\n3. What can you make easier tomorrow?${mem}`;
 if(/week|review|progress/.test(t)){let start=mondayOf(new Date()),sessions=(state.sessions||[]).filter(x=>new Date(x.date+"T12:00:00")>=start).length,acts=(state.activities||[]).filter(x=>new Date(x.date+"T12:00:00")>=start).length;return `This week's review:\n\n• Strength sessions: ${sessions}\n• Other activities: ${acts}\n• Total records saved: ${(state.sessions||[]).length+(state.activities||[]).length+(state.meals||[]).length}\n\nThe strongest next target is one action small enough to repeat next week.${mem}`}
 if(/motivat|give up|behind/.test(t))return `You are not behind. The next decision still counts. Do one useful thing now—water, a short walk, or planning your next meal—and let that action restart momentum.${mem}`;
 return `I can help turn that into a practical next step. In ${mode} mode, I would begin with: ${plan[0]} Tell me whether you want help with nutrition, movement, recovery, reflection, or planning.${mem}`
}
function renderCoachChat(){
 ensureV15State();if(window.v15CoachWelcome)v15CoachWelcome.textContent=`How can I help${state.profile.name?", "+state.profile.name:""}?`;if(window.v15CoachModeLabel)v15CoachModeLabel.textContent=`${state.profile.coachMode} mode`;
 if(!state.coachChat.length)state.coachChat.push({role:"coach",text:`${greeting()}${state.profile.name?", "+state.profile.name:""}. How can I help today?`,at:new Date().toISOString()});
 if(window.coachChatThread){coachChatThread.innerHTML=state.coachChat.slice(-50).map(m=>`<div class="coach-chat-message ${m.role}">${String(m.text).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]))}</div>`).join("");coachChatThread.scrollTop=coachChatThread.scrollHeight}
}
function sendCoachPrompt(text){if(window.coachChatInput)coachChatInput.value=text;sendCoachMessage()}
function sendCoachMessage(){ensureV15State();let q=(window.coachChatInput?.value||"").trim();if(!q)return;state.coachChat.push({role:"user",text:q,at:new Date().toISOString()});coachChatInput.value="";renderCoachChat();setTimeout(()=>{state.coachChat.push({role:"coach",text:v15CoachAnswer(q),at:new Date().toISOString()});save();renderCoachChat()},220)}
function renderV15Experience(){ensureV15State();renderV15Briefing();loadCoachPreferences();renderCoachChat()}
const showScreenV14=showScreen;showScreen=function(id){showScreenV14(id);if(id==="today")renderV15Briefing();if(id==="programs")renderCoachChat();if(id==="more")loadCoachPreferences()};
const initV14=init;init=function(){ensureV15State();initV14();renderV15Experience()};
ensureV15State();save();setTimeout(renderV15Experience,0);

/* Phase 16: conversation-first daily coaching. Additive only; existing storage and cloud schema remain unchanged. */
let ph16Step=0, ph16Answers={};
function ph16DateKey(){return new Date().toISOString().slice(0,10)}
function ph16Profile(){state.profile=state.profile||{};return state.profile}
function ph16Daily(){state.daily=state.daily||{};state.daily[ph16DateKey()]=state.daily[ph16DateKey()]||{};return state.daily[ph16DateKey()]}
function ph16Open(force=false){
 ph16Step=0;ph16Answers={};document.querySelectorAll('.ph16-step').forEach((x,i)=>x.classList.toggle('active',i===0));
 let name=ph16Profile().name||'';let hour=new Date().getHours(),g=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
 if(window.ph16Hello)ph16Hello.textContent=`${g}${name?', '+name:''}. Ready to build today?`;
 ph16UpdateProgress();ph16Launch.classList.add('show');
}
function ph16Close(){ph16Launch.classList.remove('show');renderPh16Today()}
function ph16Next(){ph16Step=Math.min(5,ph16Step+1);ph16ShowStep()}
function ph16ShowStep(){document.querySelectorAll('.ph16-step').forEach(x=>x.classList.toggle('active',Number(x.dataset.step)===ph16Step));ph16UpdateProgress();if(ph16Step===5)ph16BuildPlan()}
function ph16UpdateProgress(){document.querySelectorAll('#ph16Progress i').forEach((x,i)=>x.classList.toggle('on',i<Math.max(1,ph16Step)))}
function ph16Pick(key,value,button){ph16Answers[key]=value;button.parentElement.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));button.classList.add('selected');setTimeout(()=>{ph16Step++;ph16ShowStep()},120)}
function ph16EstimateCalories(minutes,intensity){let kg=profileWeightKg?profileWeightKg():80;let met=intensity==='Recovery'?2.8:intensity==='Light'?4:intensity==='High'?7:5.5;return Math.max(40,Math.round(met*kg*(minutes/60)))}
function ph16BuildPlan(){
 let a=ph16Answers,d=ph16Daily(),low=['Poor','Okay'].includes(a.sleep)||['Exhausted','Low'].includes(a.energy),pain=a.soreness==='Pain',mins=Number(a.time||30),intensity=pain?'Recovery':low?'Light':a.energy==='High'?'High':'Moderate';
 let title=pain?'Recovery & mobility':a.soreness==='Lower body'?'Upper-body strength':a.soreness==='Upper body'?'Lower-body strength':low?'Low-impact full body':'Personalized strength + conditioning';
 let text=pain?'Today protects consistency without training through pain. Choose gentle walking and mobility, and stop if symptoms worsen.':low?`I shortened the session and reduced volume so you can finish strong instead of forcing a perfect workout.`:`Your recovery and available time support a ${mins}-minute session with controlled strength work and a short finish.`;
 let cal=ph16EstimateCalories(mins,intensity);Object.assign(d,{sleep:a.sleep,energy:a.energy,pain:a.soreness,ph16CheckIn:{...a,date:ph16DateKey(),title,intensity,calories:cal}});save();
 ph16PlanTitle.textContent=title;ph16PlanText.textContent=text;ph16PlanTime.textContent=`${mins} min`;ph16PlanIntensity.textContent=intensity;ph16PlanCalories.textContent=`~${cal} cal`;
 let reasons=[`Sleep: ${a.sleep}`,`Energy: ${a.energy}`,`Soreness: ${a.soreness}`,`Available time: ${mins} minutes`, `Primary goal: ${ph16Profile().goal||ph16Profile().coachMode||'General wellness'}`];ph16Reasons.innerHTML=reasons.map(x=>`<li>✓ ${x}</li>`).join('');renderPh16Today();
}
function ph16StartWorkout(){ph16Close();if(typeof openAdaptiveAssessment==='function'){openAdaptiveAssessment();setTimeout(()=>{assessment.feel=['Exhausted','Low'].includes(ph16Answers.energy)?'tired':'good';assessment.time=String(ph16Answers.time||30);assessment.pain=ph16Answers.soreness==='Pain'?'Reported pain/limitation':ph16Answers.soreness||'';if(window.adaptivePain)adaptivePain.value=assessment.pain;previewAssessment?.()},80)}else if(typeof openWorkout==='function')openWorkout()}
function ph16Nutrition(){ph16Close();showScreen('food');setTimeout(()=>{if(typeof openCoachRecipe==='function')openCoachRecipe()},100)}
function renderPh16Today(){
 if(!window.ph16TodayCard)return;let c=ph16Daily().ph16CheckIn;if(!c){ph16TodayHeadline.textContent="Check in to build today's plan";ph16TodayMessage.textContent='Tell Coach PH how your body and schedule feel today.';ph16TodaySleep.textContent='—';ph16TodayEnergy.textContent='—';ph16TodayTime.textContent='—';return}
 ph16TodayHeadline.textContent=c.title;ph16TodayMessage.textContent=`Coach PH adjusted today to ${c.intensity.toLowerCase()} intensity. Estimated burn: about ${c.calories} calories.`;ph16TodaySleep.textContent=c.sleep;ph16TodayEnergy.textContent=c.energy;ph16TodayTime.textContent=`${c.time} min`;let b=ph16TodayCard.querySelector('button');if(b)b.textContent='Update today’s check-in';
}
function ph16ShouldLaunch(){let d=ph16Daily();return !d.ph16CheckIn&&!sessionStorage.getItem('ph16Skipped:'+ph16DateKey())}
const ph16CloseOriginal=ph16Close;ph16Close=function(){if(!ph16Daily().ph16CheckIn)sessionStorage.setItem('ph16Skipped:'+ph16DateKey(),'1');ph16CloseOriginal()}
const initPrePh16=init;init=function(){initPrePh16();renderPh16Today();setTimeout(()=>{if(ph16ShouldLaunch())ph16Open()},350)};
