/* مؤسسة عاصفة الكيمياء - إشعارات مواعيد الصيانة */
self.addEventListener("install",e=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
function openDb(){return new Promise((res,rej)=>{const r=indexedDB.open("sct_meta",1);r.onupgradeneeded=()=>r.result.createObjectStore("m");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
async function readTasks(){try{const d=await openDb();return await new Promise(res=>{const q=d.transaction("m").objectStore("m").get("tasks");q.onsuccess=()=>res(q.result||[]);q.onerror=()=>res([]);});}catch(e){return[];}}
function daysLeft(t){if(!t.lastDone)return null;const n=new Date(t.lastDone+"T00:00:00");if(isNaN(n))return null;n.setDate(n.getDate()+t.intervalDays);const now=new Date();now.setHours(0,0,0,0);return Math.round((n-now)/864e5);}
async function checkDue(){
  const tasks=await readTasks();
  const due=tasks.filter(t=>{const d=daysLeft(t);return d!==null&&d<=(t.remind==null?1:t.remind);});
  if(!due.length)return;
  const names=due.map(t=>t.name);
  await self.registration.showNotification("🔧 مواعيد الصيانة",{body:names.slice(0,4).join("، ")+(names.length>4?" ...":""),tag:"sct-due",icon:"sct-icon-192.png",lang:"ar",dir:"rtl"});
}
self.addEventListener("periodicsync",e=>{if(e.tag==="sct-due")e.waitUntil(checkDue());});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:"window"}).then(cs=>{for(const c of cs){if("focus" in c)return c.focus();}return self.clients.openWindow("./inventory.html");}));});
