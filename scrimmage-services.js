/* ================================================================
   scrimmage-services.js — Eyad_Eyad12
   6 خدمات سكرمات وروم ببجي موبايل احترافية
================================================================ */

const SCR_IDS = [
    'scr-manager',     /* مدير الروم المباشر */
    'scr-schedule',    /* منشئ جدول السكرم */
    'scr-stats',       /* محلل إحصائيات السكرم */
    'scr-announce',    /* منشئ إعلان الروم */
    'scr-dropzones',   /* مخطط مناطق الهبوط */
    'scr-rules',       /* منشئ قواعد البطولة */
];

/* ════ Patch openService ════ */
(function(){
    const prev = window.openService;
    window.openService = function(id, name){
        if(!SCR_IDS.includes(id)) return prev?.call(this, id, name);
        const modal = document.getElementById('serviceModal');
        const title = document.getElementById('serviceModalTitle');
        const cont  = document.getElementById('serviceModalContent');
        if(!modal||!title||!cont) return;
        title.textContent = name;
        cont.innerHTML = scrHTML(id);
        modal.classList.add('active');
        requestAnimationFrame(() => scrInit(id));
    };
})();

/* ════ Shared CSS ════ */
const SCR_CSS = `
<style>
.scr{padding:1rem;background:#030c1c;border-radius:14px;display:flex;flex-direction:column;gap:.85rem}
.scr-inp{width:100%;background:rgba(0,0,0,.45);border:1.5px solid rgba(255,165,0,.2);border-radius:10px;color:#fff;padding:.65rem .9rem;font-size:.84rem;font-family:inherit;transition:border-color .2s;box-sizing:border-box}
.scr-inp:focus{outline:none;border-color:#ff9800;box-shadow:0 0 10px rgba(255,152,0,.15)}
.scr-ta{min-height:90px;resize:vertical}
.scr-lbl{color:#889aaa;font-size:.73rem;font-weight:700;text-transform:uppercase;letter-spacing:.4px;margin-bottom:.25rem;display:flex;align-items:center;gap:5px}
.scr-chips{display:flex;flex-wrap:wrap;gap:.35rem}
.scr-chip{padding:4px 11px;border-radius:50px;border:1.5px solid rgba(255,152,0,.2);background:rgba(255,152,0,.07);cursor:pointer;font-size:.76rem;color:#aa8855;font-family:inherit;font-weight:600;transition:all .18s}
.scr-chip:hover,.scr-chip.act{background:rgba(255,152,0,.2);border-color:#ff9800;color:#ff9800}
.scr-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:.75rem 1.1rem;border:none;border-radius:10px;font-weight:800;font-size:.88rem;cursor:pointer;font-family:inherit;transition:all .25s}
.scr-btn-p{background:linear-gradient(135deg,#ff9800,#ff6600);color:#000}
.scr-btn-p:hover{background:linear-gradient(135deg,#ff6600,#ff9800);transform:translateY(-1px);box-shadow:0 5px 16px rgba(255,152,0,.35)}
.scr-btn-s{background:rgba(255,152,0,.12);border:1.5px solid rgba(255,152,0,.3);color:#ff9800}
.scr-btn-s:hover{background:rgba(255,152,0,.22)}
.scr-btn-w{width:100%}
.scr-btn:disabled{opacity:.45;cursor:not-allowed}
.scr-g2{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
.scr-g3{display:grid;grid-template-columns:repeat(3,1fr);gap:.55rem}
@media(max-width:480px){.scr-g2{grid-template-columns:1fr}.scr-g3{grid-template-columns:1fr 1fr}}
.scr-sec{background:rgba(255,152,0,.04);border:1px solid rgba(255,152,0,.15);border-radius:12px;padding:.85rem 1rem}
.scr-sec-title{color:#ff9800;font-size:.76rem;font-weight:800;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.65rem;display:flex;align-items:center;gap:5px}
.scr-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:.75rem .9rem}
/* Table */
.scr-table{width:100%;border-collapse:collapse;font-size:.82rem}
.scr-table th{background:#0a0f1e;color:#667788;padding:7px 8px;text-align:center;font-size:.7rem;font-weight:700;text-transform:uppercase;border-bottom:1px solid rgba(255,152,0,.18);position:sticky;top:0}
.scr-table td{padding:6px 8px;border-bottom:1px solid rgba(255,255,255,.04);text-align:center;color:#ccd;vertical-align:middle}
.scr-table tr:hover td{background:rgba(255,152,0,.04)}
.scr-rank{font-weight:800;color:#ff9800}
.scr-table .top1 td{background:rgba(255,215,0,.07)}.scr-table .top2 td{background:rgba(192,192,192,.05)}.scr-table .top3 td{background:rgba(205,127,50,.05)}
/* Canvas */
.scr-cv-box{background:repeating-conic-gradient(#1a1a2e 0% 25%,#0a0a1a 0% 50%) 0 0/14px 14px;border:1.5px solid rgba(255,152,0,.2);border-radius:12px;overflow:hidden;text-align:center}
.scr-cv-box canvas{max-width:100%;display:block}
/* Pill badge */
.scr-pill{display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:20px;font-size:.7rem;font-weight:700}
.scr-pill-green{background:rgba(68,238,85,.15);border:1px solid rgba(68,238,85,.3);color:#44ee55}
.scr-pill-red{background:rgba(255,68,68,.15);border:1px solid rgba(255,68,68,.3);color:#f88}
.scr-pill-orange{background:rgba(255,152,0,.15);border:1px solid rgba(255,152,0,.3);color:#ff9800}
/* Timer display */
.scr-timer{font-size:3rem;font-weight:900;font-family:monospace;color:#ff9800;text-align:center;text-shadow:0 0 20px rgba(255,152,0,.4);letter-spacing:3px}
.scr-timer.warn{color:#ff4444;animation:timerPulse .6s infinite}
@keyframes timerPulse{0%,100%{opacity:1}50%{opacity:.5}}
/* Drop zone map */
.scr-map-zones{display:grid;grid-template-columns:repeat(4,1fr);gap:.4rem;max-height:360px;overflow-y:auto}
.scr-zone{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:9px;padding:.5rem .6rem;cursor:pointer;transition:all .2s;position:relative}
.scr-zone:hover{border-color:rgba(255,152,0,.4)}
.scr-zone.assigned{border-color:rgba(68,238,85,.4);background:rgba(68,238,85,.07)}
.scr-zone.conflict{border-color:rgba(255,68,68,.4);background:rgba(255,68,68,.07)}
.scr-zone-name{color:#ccd;font-size:.78rem;font-weight:700}
.scr-zone-team{color:#44ee55;font-size:.7rem;margin-top:2px}
/* Announcement preview */
.scr-ann-cv{border-radius:12px;overflow:hidden;border:1.5px solid rgba(255,152,0,.2)}
.scr-ann-cv canvas{width:100%;display:block}
/* Rounds */
.scr-round-badge{display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#ff9800,#ff6600);color:#000;font-weight:900;font-size:.78rem;border-radius:50%;width:28px;height:28px;flex-shrink:0}
/* Team input row */
.scr-team-row{display:flex;gap:.4rem;align-items:center;margin-bottom:.4rem}
.scr-team-inp{flex:1;background:rgba(0,0,0,.4);border:1px solid rgba(255,152,0,.18);border-radius:7px;color:#fff;padding:5px 8px;font-size:.8rem;font-family:inherit}
.scr-del{background:rgba(255,68,68,.1);border:1px solid rgba(255,68,68,.2);color:#f44;border-radius:6px;padding:3px 8px;cursor:pointer;font-family:inherit;font-size:.78rem;flex-shrink:0}
.scr-del:hover{background:rgba(255,68,68,.25)}
.scr-add-btn{width:100%;padding:.5rem;background:rgba(255,152,0,.07);border:1px dashed rgba(255,152,0,.3);border-radius:9px;color:#ff9800;font-family:inherit;font-size:.8rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:all .2s;margin-top:.3rem}
.scr-add-btn:hover{background:rgba(255,152,0,.14)}
/* Download row */
.scr-dl{display:flex;gap:.45rem;margin-top:.4rem}
.scr-dl-btn{flex:1;padding:.6rem;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:50px;color:#aaa;font-weight:700;font-size:.8rem;cursor:pointer;font-family:inherit;transition:all .18s;display:flex;align-items:center;justify-content:center;gap:5px}
.scr-dl-btn:hover{background:rgba(255,152,0,.15);border-color:#ff9800;color:#ff9800}
</style>`;

/* ════ HTML Builders ════ */
function scrHTML(id){
    switch(id){

    /* ──────── 1. ROOM MANAGER ──────── */
    case 'scr-manager': return SCR_CSS + `
<div class="scr">
  <!-- Header info -->
  <div class="scr-g2">
    <div>
      <div class="scr-lbl">🏠 اسم الروم</div>
      <input class="scr-inp" id="rm_name" placeholder="SCRIMMAGE #1 — Eyad_Eyad12">
    </div>
    <div>
      <div class="scr-lbl">🔑 كود الروم</div>
      <div style="display:flex;gap:.35rem">
        <input class="scr-inp" id="rm_code" placeholder="ABCD1234" style="flex:1">
        <button class="scr-btn scr-btn-s" onclick="rmGenCode()" style="padding:0 .7rem;font-size:.8rem">🎲</button>
        <button class="scr-btn scr-btn-s" onclick="rmCopyCode()" style="padding:0 .7rem;font-size:.8rem">📋</button>
      </div>
    </div>
  </div>

  <div class="scr-g3">
    <div>
      <div class="scr-lbl">عدد الجولات</div>
      <input class="scr-inp" id="rm_rounds" type="number" value="6" min="1" max="20">
    </div>
    <div>
      <div class="scr-lbl">الخريطة</div>
      <select class="scr-inp" id="rm_map">
        ${['Erangel','Miramar','Sanhok','Vikendi','Livik'].map(m=>`<option>${m}</option>`).join('')}
      </select>
    </div>
    <div>
      <div class="scr-lbl">وقت كل جولة</div>
      <input class="scr-inp" id="rm_time" type="number" value="30" min="5" max="60" placeholder="دقيقة">
    </div>
  </div>

  <!-- Teams list -->
  <div class="scr-sec">
    <div class="scr-sec-title"><i class="fas fa-users"></i> الفرق المشاركة</div>
    <div id="rm_teams_list"></div>
    <button class="scr-add-btn" onclick="rmAddTeam()"><i class="fas fa-plus"></i> إضافة فريق</button>
  </div>

  <!-- Timer + Round controls -->
  <div class="scr-sec" id="rm_ctrl_sec" style="display:none">
    <div class="scr-sec-title"><i class="fas fa-stopwatch"></i> التحكم المباشر</div>
    <div class="scr-timer" id="rm_timer">30:00</div>
    <div style="display:flex;gap:.5rem;margin-top:.8rem;flex-wrap:wrap">
      <button class="scr-btn scr-btn-p" onclick="rmTimerToggle()" id="rm_play_btn" style="flex:2"><i class="fas fa-play"></i> تشغيل</button>
      <button class="scr-btn scr-btn-s" onclick="rmTimerReset()" style="flex:1"><i class="fas fa-redo"></i> إعادة</button>
      <button class="scr-btn scr-btn-s" onclick="rmNextRound()" style="flex:1">التالية ⟶</button>
    </div>
    <div style="margin-top:.7rem;text-align:center;color:#ff9800;font-weight:700;font-size:.9rem" id="rm_round_lbl">الجولة 1 / 6</div>
  </div>

  <div style="display:flex;gap:.5rem">
    <button class="scr-btn scr-btn-p scr-btn-w" onclick="rmStart()"><i class="fas fa-play-circle"></i> بدء السكرم</button>
    <button class="scr-btn scr-btn-s" onclick="rmShare()"><i class="fas fa-share-alt"></i> مشاركة</button>
  </div>
</div>`;

    /* ──────── 2. SCHEDULE ──────── */
    case 'scr-schedule': return SCR_CSS + `
<div class="scr">
  <div class="scr-g2">
    <div>
      <div class="scr-lbl">اسم البطولة / السكرم</div>
      <input class="scr-inp" id="sch_title" placeholder="Friday Night Scrimmage">
    </div>
    <div>
      <div class="scr-lbl">التاريخ والوقت</div>
      <input class="scr-inp" type="datetime-local" id="sch_dt">
    </div>
  </div>
  <div class="scr-g3">
    <div>
      <div class="scr-lbl">عدد الجولات</div>
      <input class="scr-inp" type="number" id="sch_rounds" value="6" min="1" max="20">
    </div>
    <div>
      <div class="scr-lbl">وقت كل جولة (دقيقة)</div>
      <input class="scr-inp" type="number" id="sch_dur" value="30" min="10">
    </div>
    <div>
      <div class="scr-lbl">استراحة بين الجولات</div>
      <input class="scr-inp" type="number" id="sch_break" value="10" min="0">
    </div>
  </div>

  <div class="scr-sec">
    <div class="scr-sec-title"><i class="fas fa-users"></i> الفرق</div>
    <div id="sch_teams_list"></div>
    <button class="scr-add-btn" onclick="schAddTeam()"><i class="fas fa-plus"></i> فريق</button>
  </div>

  <button class="scr-btn scr-btn-p scr-btn-w" onclick="schGenerate()"><i class="fas fa-calendar-alt"></i> توليد الجدول</button>

  <div id="sch_out" style="display:none">
    <div class="scr-lbl"><i class="fas fa-table"></i> الجدول المُولَّد</div>
    <div style="overflow-x:auto;border-radius:10px;border:1px solid rgba(255,152,0,.15)">
      <table class="scr-table" id="sch_table"></table>
    </div>
    <div class="scr-dl">
      <button class="scr-dl-btn" onclick="schDlTxt()"><i class="fas fa-download"></i> TXT</button>
      <button class="scr-dl-btn" onclick="schDlImg()"><i class="fas fa-image"></i> صورة PNG</button>
    </div>
  </div>
</div>`;

    /* ──────── 3. STATS ANALYZER ──────── */
    case 'scr-stats': return SCR_CSS + `
<div class="scr">
  <div class="scr-g2">
    <div>
      <div class="scr-lbl">نظام النقاط</div>
      <div class="scr-chips" id="st_sys">
        ${[['PUBG Mobile','pubg'],['WWC 2024','wwc'],['مخصص','custom']].map(([n,v],i)=>`<button class="scr-chip${!i?' act':''}" onclick="scrChip(this,'st_sys');stShowCustom('${v}')" data-v="${v}">${n}</button>`).join('')}
      </div>
    </div>
    <div id="st_custom_sec" style="display:none">
      <div class="scr-lbl">نقاط المراكز (1-16 مفصولة بفاصلة)</div>
      <input class="scr-inp" id="st_custom_pts" placeholder="12,9,7,5,4,3,2,1,1,1,0,0,0,0,0,0">
    </div>
  </div>

  <div class="scr-sec">
    <div class="scr-sec-title"><i class="fas fa-gamepad"></i> إدخال نتائج الجولات</div>
    <div id="st_rounds_list"></div>
    <button class="scr-add-btn" onclick="stAddRound()"><i class="fas fa-plus"></i> إضافة جولة</button>
  </div>

  <button class="scr-btn scr-btn-p scr-btn-w" onclick="stCalc()"><i class="fas fa-calculator"></i> احتساب الترتيب النهائي</button>

  <div id="st_out" style="display:none">
    <div class="scr-lbl"><i class="fas fa-trophy"></i> الترتيب النهائي</div>
    <div style="overflow-x:auto;border-radius:10px;border:1px solid rgba(255,152,0,.15)">
      <table class="scr-table" id="st_table"></table>
    </div>
    <canvas id="st_cv" style="display:none"></canvas>
    <div class="scr-dl">
      <button class="scr-dl-btn" onclick="stDlImg()"><i class="fas fa-image"></i> PNG</button>
      <button class="scr-dl-btn" onclick="stDlTxt()"><i class="fas fa-download"></i> TXT</button>
    </div>
  </div>
</div>`;

    /* ──────── 4. ANNOUNCEMENT ──────── */
    case 'scr-announce': return SCR_CSS + `
<div class="scr">
  <div class="scr-g2">
    <div>
      <div class="scr-lbl">نوع الإعلان</div>
      <div class="scr-chips" id="an_type">
        ${[['🏆 فتح سكرم','open'],['🎮 نتيجة جولة','result'],['📅 جدول مباريات','schedule'],['🥇 الفائز','winner']].map(([n,v],i)=>`<button class="scr-chip${!i?' act':''}" onclick="scrChip(this,'an_type');anUpdatePreview()" data-v="${v}">${n}</button>`).join('')}
      </div>
    </div>
    <div>
      <div class="scr-lbl">ثيم الإعلان</div>
      <div class="scr-chips" id="an_theme">
        ${[['🔥 ناري','fire'],['🌙 ليلي','night'],['⚡ نيون','neon'],['👑 ذهبي','gold']].map(([n,v],i)=>`<button class="scr-chip${!i?' act':''}" onclick="scrChip(this,'an_theme');anUpdatePreview()" data-v="${v}">${n}</button>`).join('')}
      </div>
    </div>
  </div>

  <div class="scr-g2">
    <div>
      <div class="scr-lbl">العنوان الرئيسي</div>
      <input class="scr-inp" id="an_title" placeholder="Friday Night Scrim" oninput="anUpdatePreview()">
    </div>
    <div>
      <div class="scr-lbl">التفاصيل</div>
      <input class="scr-inp" id="an_details" placeholder="8 فرق • 6 جولات • Erangel" oninput="anUpdatePreview()">
    </div>
  </div>
  <div class="scr-g2">
    <div>
      <div class="scr-lbl">كود الروم</div>
      <input class="scr-inp" id="an_code" placeholder="ABCD1234" oninput="anUpdatePreview()">
    </div>
    <div>
      <div class="scr-lbl">كلمة السر</div>
      <input class="scr-inp" id="an_pass" placeholder="1234" oninput="anUpdatePreview()">
    </div>
  </div>
  <div>
    <div class="scr-lbl">النص الإضافي</div>
    <input class="scr-inp" id="an_extra" placeholder="منظم بواسطة: Eyad_Eyad12" oninput="anUpdatePreview()">
  </div>

  <div class="scr-cv-box scr-ann-cv"><canvas id="an_cv" width="1080" height="1080"></canvas></div>

  <div class="scr-dl">
    <button class="scr-dl-btn" onclick="anDl('1080x1080')"><i class="fas fa-download"></i> انستغرام 1:1</button>
    <button class="scr-dl-btn" onclick="anDl('1920x1080')"><i class="fas fa-download"></i> ستوري 16:9</button>
    <button class="scr-dl-btn" onclick="anDl('1080x1920')"><i class="fas fa-download"></i> ستوري 9:16</button>
  </div>
</div>`;

    /* ──────── 5. DROP ZONES ──────── */
    case 'scr-dropzones': return SCR_CSS + `
<div class="scr">
  <div class="scr-g2">
    <div>
      <div class="scr-lbl">الخريطة</div>
      <div class="scr-chips" id="dz_map">
        ${[['Erangel','er'],['Miramar','mi'],['Sanhok','sa'],['Vikendi','vi'],['Livik','li']].map(([n,v],i)=>`<button class="scr-chip${!i?' act':''}" onclick="scrChip(this,'dz_map');dzLoadMap('${v}')" data-v="${v}">${n}</button>`).join('')}
      </div>
    </div>
    <div>
      <div class="scr-lbl">طريقة التوزيع</div>
      <div class="scr-chips" id="dz_mode">
        ${[['🎲 عشوائي','random'],['✋ يدوي','manual']].map(([n,v],i)=>`<button class="scr-chip${!i?' act':''}" onclick="scrChip(this,'dz_mode')" data-v="${v}">${n}</button>`).join('')}
      </div>
    </div>
  </div>

  <div class="scr-sec">
    <div class="scr-sec-title"><i class="fas fa-users"></i> الفرق</div>
    <div id="dz_teams_list"></div>
    <button class="scr-add-btn" onclick="dzAddTeam()"><i class="fas fa-plus"></i> فريق</button>
  </div>

  <button class="scr-btn scr-btn-p scr-btn-w" onclick="dzAssign()"><i class="fas fa-map-marked-alt"></i> توزيع المناطق</button>

  <div id="dz_out" style="display:none">
    <div class="scr-lbl"><i class="fas fa-map"></i> توزيع مناطق الهبوط</div>
    <div class="scr-map-zones" id="dz_zones_grid"></div>
    <div class="scr-dl" style="margin-top:.6rem">
      <button class="scr-dl-btn" onclick="dzDlImg()"><i class="fas fa-image"></i> PNG</button>
      <button class="scr-dl-btn" onclick="dzDlTxt()"><i class="fas fa-download"></i> TXT</button>
      <button class="scr-dl-btn" onclick="dzAssign()"><i class="fas fa-random"></i> إعادة التوزيع</button>
    </div>
  </div>
</div>`;

    /* ──────── 6. RULES GENERATOR ──────── */
    case 'scr-rules': return SCR_CSS + `
<div class="scr">
  <div class="scr-g2">
    <div>
      <div class="scr-lbl">نوع المسابقة</div>
      <div class="scr-chips" id="rl_type">
        ${[['سكرم داخلي','scrim'],['بطولة','tournament'],['كوالز','quals']].map(([n,v],i)=>`<button class="scr-chip${!i?' act':''}" onclick="scrChip(this,'rl_type')" data-v="${v}">${n}</button>`).join('')}
      </div>
    </div>
    <div>
      <div class="scr-lbl">نظام النقاط</div>
      <div class="scr-chips" id="rl_pts">
        ${[['PUBG Mobile الرسمي','pubg'],['WWC 2024','wwc'],['مخصص','custom']].map(([n,v],i)=>`<button class="scr-chip${!i?' act':''}" onclick="scrChip(this,'rl_pts')" data-v="${v}">${n}</button>`).join('')}
      </div>
    </div>
  </div>
  <div class="scr-g2">
    <div>
      <div class="scr-lbl">اسم البطولة</div>
      <input class="scr-inp" id="rl_name" placeholder="Friday Night Scrimmage">
    </div>
    <div>
      <div class="scr-lbl">المنظم</div>
      <input class="scr-inp" id="rl_org" placeholder="Eyad_Eyad12">
    </div>
  </div>
  <div class="scr-g3">
    <div><div class="scr-lbl">عدد الفرق</div><input class="scr-inp" type="number" id="rl_teams_n" value="16"></div>
    <div><div class="scr-lbl">عدد الجولات</div><input class="scr-inp" type="number" id="rl_rounds" value="6"></div>
    <div><div class="scr-lbl">قتلات لكل جولة</div><input class="scr-inp" type="number" id="rl_kpp" value="1" placeholder="نقطة/قتلة"></div>
  </div>
  <div>
    <div class="scr-lbl">قواعد إضافية (اختياري)</div>
    <textarea class="scr-inp scr-ta" id="rl_extra" placeholder="مثال: ممنوع الـ stream sniping، يجب الالتزام بمواعيد الروم..."></textarea>
  </div>
  <button class="scr-btn scr-btn-p scr-btn-w" onclick="rlGenerate()"><i class="fas fa-file-contract"></i> توليد القواعد</button>
  <div id="rl_out" style="display:none">
    <div class="scr-lbl"><i class="fas fa-scroll"></i> القواعد الرسمية</div>
    <div style="background:rgba(0,0,0,.4);border:1.5px solid rgba(255,152,0,.2);border-radius:12px;padding:1rem;color:#ccd;font-size:.84rem;line-height:1.8;white-space:pre-wrap;max-height:300px;overflow-y:auto" id="rl_res"></div>
    <div class="scr-dl">
      <button class="scr-dl-btn" onclick="rlCopy()"><i class="fas fa-copy"></i> نسخ</button>
      <button class="scr-dl-btn" onclick="rlDl()"><i class="fas fa-download"></i> TXT</button>
      <button class="scr-dl-btn" onclick="rlDlImg()"><i class="fas fa-image"></i> PNG</button>
    </div>
  </div>
</div>`;
    default: return '<p style="color:#bbb;text-align:center;padding:2rem">غير متوفر</p>';
    }
}

/* ════ Init per service ════ */
function scrInit(id){
    if(id==='scr-manager'){ rmTeams=[{n:'Team Alpha'},{n:'Team Beta'},{n:'Team Gamma'},{n:'Team Delta'}]; rmRenderTeams(); }
    if(id==='scr-schedule'){ schTeams=[{n:'Team 1'},{n:'Team 2'},{n:'Team 3'},{n:'Team 4'}]; schRenderTeams(); document.getElementById('sch_dt').value=new Date(Date.now()+3600000).toISOString().slice(0,16); }
    if(id==='scr-stats'){ stRounds=[]; stAddRound(); stAddRound(); }
    if(id==='scr-dropzones'){ dzTeams=[{n:'Team Alpha'},{n:'Team Beta'},{n:'Team Gamma'},{n:'Team Delta'}]; dzRenderTeams(); }
    if(id==='scr-announce'){ anUpdatePreview(); }
    if(id==='scr-rules'){}
}

/* ════ Shared helpers ════ */
function scrChip(btn,gid){ document.getElementById(gid)?.querySelectorAll('.st-chip,.scr-chip').forEach(b=>b.classList.remove('act')); btn.classList.add('act'); }
function scrGetChip(gid){ return document.getElementById(gid)?.querySelector('.act')?.dataset?.v||''; }
function scrDl(txt,name){ const b=new Blob([txt],{type:'text/plain;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name+'.txt';a.click();URL.revokeObjectURL(u); }
function scrDlCanvas(id,name){ const cv=document.getElementById(id);if(!cv)return;const a=document.createElement('a');a.href=cv.toDataURL('image/png');a.download=name+'.png';a.click(); }
function scrToast(msg){ const t=document.createElement('div');t.style.cssText='position:fixed;top:20px;right:50%;transform:translateX(50%);background:#ff9800;color:#000;padding:9px 22px;border-radius:50px;font-weight:800;font-size:.88rem;z-index:99999;box-shadow:0 6px 18px rgba(255,152,0,.4)';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2500); }

/* ══════════════════════════════════════════════
   1. ROOM MANAGER
══════════════════════════════════════════════ */
let rmTeams=[], rmTimerInterval=null, rmCurrentRound=1, rmTotalRounds=6, rmRemaining=0, rmRunning=false;

function rmRenderTeams(){
    const el=document.getElementById('rm_teams_list');if(!el)return;
    el.innerHTML=rmTeams.map((t,i)=>`
        <div class="scr-team-row">
            <div class="scr-round-badge">${i+1}</div>
            <input class="scr-team-inp" value="${t.n}" oninput="rmTeams[${i}].n=this.value">
            <button class="scr-del" onclick="rmTeams.splice(${i},1);rmRenderTeams()">✕</button>
        </div>`).join('');
}
function rmAddTeam(){
    if(rmTeams.length>=20)return;
    rmTeams.push({n:`Team ${rmTeams.length+1}`});
    rmRenderTeams();
}
function rmGenCode(){
    const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    document.getElementById('rm_code').value=Array.from({length:8},()=>chars[Math.floor(Math.random()*chars.length)]).join('');
}
function rmCopyCode(){
    const code=document.getElementById('rm_code')?.value;
    if(code) navigator.clipboard?.writeText(code).then(()=>scrToast('✅ تم نسخ الكود: '+code));
}
function rmStart(){
    rmTotalRounds=parseInt(document.getElementById('rm_rounds')?.value||6);
    rmCurrentRound=1;
    const mins=parseInt(document.getElementById('rm_time')?.value||30);
    rmRemaining=mins*60;
    document.getElementById('rm_ctrl_sec').style.display='';
    rmUpdateDisplay();
    scrToast('🎮 بدأ السكرم!');
}
function rmUpdateDisplay(){
    const m=Math.floor(rmRemaining/60),s=rmRemaining%60;
    const el=document.getElementById('rm_timer');
    if(el){ el.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; el.classList.toggle('warn',rmRemaining<=60); }
    const lbl=document.getElementById('rm_round_lbl');
    if(lbl) lbl.textContent=`الجولة ${rmCurrentRound} / ${rmTotalRounds}`;
}
function rmTimerToggle(){
    const btn=document.getElementById('rm_play_btn');
    if(rmRunning){
        clearInterval(rmTimerInterval);rmRunning=false;
        if(btn) btn.innerHTML='<i class="fas fa-play"></i> متابعة';
    } else {
        rmRunning=true;
        if(btn) btn.innerHTML='<i class="fas fa-pause"></i> إيقاف مؤقت';
        rmTimerInterval=setInterval(()=>{
            if(rmRemaining<=0){ clearInterval(rmTimerInterval);rmRunning=false; scrToast(`⏱️ انتهت الجولة ${rmCurrentRound}!`); if(btn) btn.innerHTML='<i class="fas fa-play"></i> تشغيل'; return; }
            rmRemaining--; rmUpdateDisplay();
        },1000);
    }
}
function rmTimerReset(){
    clearInterval(rmTimerInterval);rmRunning=false;
    rmRemaining=parseInt(document.getElementById('rm_time')?.value||30)*60;
    rmUpdateDisplay();
    document.getElementById('rm_play_btn').innerHTML='<i class="fas fa-play"></i> تشغيل';
}
function rmNextRound(){
    if(rmCurrentRound<rmTotalRounds){ rmCurrentRound++; rmTimerReset(); scrToast(`⟶ الجولة ${rmCurrentRound}`); }
    else scrToast('🏁 انتهى السكرم!');
}
function rmShare(){
    const name=document.getElementById('rm_name')?.value||'SCRIMMAGE';
    const code=document.getElementById('rm_code')?.value||'—';
    const map=document.getElementById('rm_map')?.value||'Erangel';
    const rounds=document.getElementById('rm_rounds')?.value||'6';
    const teams=rmTeams.map(t=>t.n).join(' | ');
    const txt=`🎮 ${name}\n🔑 الكود: ${code}\n🗺️ الخريطة: ${map}\n🏆 الجولات: ${rounds}\n👥 الفرق: ${teams}\n\n📌 منظم بواسطة: Eyad_Eyad12`;
    navigator.clipboard?.writeText(txt).then(()=>scrToast('✅ تم نسخ معلومات الروم'));
}

/* ══════════════════════════════════════════════
   2. SCHEDULE GENERATOR
══════════════════════════════════════════════ */
let schTeams=[];
function schRenderTeams(){
    const el=document.getElementById('sch_teams_list');if(!el)return;
    el.innerHTML=schTeams.map((t,i)=>`
        <div class="scr-team-row">
            <div class="scr-round-badge">${i+1}</div>
            <input class="scr-team-inp" value="${t.n}" oninput="schTeams[${i}].n=this.value">
            <button class="scr-del" onclick="schTeams.splice(${i},1);schRenderTeams()">✕</button>
        </div>`).join('');
}
function schAddTeam(){ schTeams.push({n:`Team ${schTeams.length+1}`}); schRenderTeams(); }
function schGenerate(){
    const rounds=parseInt(document.getElementById('sch_rounds')?.value||6);
    const dur=parseInt(document.getElementById('sch_dur')?.value||30);
    const brk=parseInt(document.getElementById('sch_break')?.value||10);
    const dt=document.getElementById('sch_dt')?.value;
    const title=document.getElementById('sch_title')?.value||'SCRIMMAGE';
    const teams=schTeams.map(t=>t.n);
    let start=dt?new Date(dt):new Date();
    const rows=[];
    for(let r=1;r<=rounds;r++){
        const end=new Date(start.getTime()+dur*60000);
        rows.push({r,map:['Erangel','Miramar','Sanhok','Vikendi','Livik'][(r-1)%5],start:schFmtTime(start),end:schFmtTime(end)});
        start=new Date(end.getTime()+brk*60000);
    }
    const table=document.getElementById('sch_table');
    if(!table)return;
    table.innerHTML=`<thead><tr><th>جولة</th><th>الخريطة</th><th>البداية</th><th>النهاية</th><th>الحالة</th></tr></thead>
    <tbody>${rows.map(row=>`<tr><td class="scr-rank">#${row.r}</td><td>${row.map}</td><td style="font-family:monospace">${row.start}</td><td style="font-family:monospace">${row.end}</td><td><span class="scr-pill ${row.r===1?'scr-pill-orange':'scr-pill-green'}">${row.r===1?'قادمة':'مجدولة'}</span></td></tr>`).join('')}</tbody>`;
    document.getElementById('sch_out').style.display='';
    window._schRows=rows; window._schTitle=title; window._schTeams=teams;
}
function schFmtTime(d){ return d.toLocaleTimeString('ar',{hour:'2-digit',minute:'2-digit'}); }
function schDlTxt(){
    if(!window._schRows)return;
    const txt=`${window._schTitle}\n${'═'.repeat(30)}\n\n${window._schRows.map(r=>`جولة ${r.r} — ${r.map}\n⏰ ${r.start} ← ${r.end}`).join('\n\n')}\n\n👥 الفرق: ${(window._schTeams||[]).join(', ')}\n📌 Eyad_Eyad12`;
    scrDl(txt,'جدول_السكرم');
}
function schDlImg(){
    const W=900,H=80+((window._schRows?.length||6)+1)*50+60;
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;
    const ctx=cv.getContext('2d');
    ctx.fillStyle='#030c1c';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#ff9800';ctx.font='bold 22px "Segoe UI",Arial';ctx.textAlign='center';
    ctx.shadowColor='#ff9800';ctx.shadowBlur=14;
    ctx.fillText(window._schTitle||'SCHEDULE',W/2,45);ctx.shadowBlur=0;
    const rows=window._schRows||[];
    rows.forEach((row,i)=>{
        const y=75+i*50+(i>0?10:0);
        ctx.fillStyle=i%2===0?'rgba(255,152,0,.07)':'rgba(255,255,255,.03)';ctx.fillRect(10,y,W-20,44);
        ctx.fillStyle='#ff9800';ctx.font='bold 14px "Segoe UI"';ctx.textAlign='left';ctx.fillText(`#${row.r}`,30,y+27);
        ctx.fillStyle='#fff';ctx.fillText(row.map,80,y+27);
        ctx.fillStyle='#aaa';ctx.font='13px monospace';ctx.textAlign='right';
        ctx.fillText(`${row.start} — ${row.end}`,W-25,y+27);
    });
    ctx.fillStyle='rgba(255,152,0,.4)';ctx.font='12px "Segoe UI"';ctx.textAlign='center';
    ctx.fillText('Eyad_Eyad12',W/2,H-15);
    const a=document.createElement('a');a.href=cv.toDataURL();a.download='schedule.png';a.click();
}

/* ══════════════════════════════════════════════
   3. STATS ANALYZER
══════════════════════════════════════════════ */
const PTS_SYSTEMS={
    pubg:[12,9,7,5,4,3,2,1,1,1,0,0,0,0,0,0],
    wwc:[15,12,10,8,6,5,4,3,2,1,0,0,0,0,0,0],
};
let stRounds=[];
function stAddRound(){
    stRounds.push({n:`جولة ${stRounds.length+1}`,teams:[]});
    stRenderRounds();
}
function stRenderRounds(){
    const el=document.getElementById('st_rounds_list');if(!el)return;
    el.innerHTML=stRounds.map((rnd,ri)=>`
        <div class="scr-card" style="margin-bottom:.5rem">
            <div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.5rem">
                <div class="scr-round-badge">${ri+1}</div>
                <input class="scr-team-inp" style="flex:1" value="${rnd.n}" oninput="stRounds[${ri}].n=this.value">
                <button class="scr-del" onclick="stRounds.splice(${ri},1);stRenderRounds()">✕</button>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.4rem;font-size:.7rem;color:#667788;margin-bottom:.3rem;text-align:center"><span>الفريق</span><span>المركز</span><span>القتلات</span></div>
            <div id="st_r${ri}_teams"></div>
            <button class="scr-add-btn" onclick="stAddTeamToRound(${ri})" style="font-size:.75rem;padding:.35rem"><i class="fas fa-plus"></i></button>
        </div>`).join('');
    stRounds.forEach((rnd,ri)=>{
        const el2=document.getElementById(`st_r${ri}_teams`);
        if(!el2)return;
        if(!rnd.teams.length) rnd.teams.push({n:'Team 1',place:1,kills:0},{n:'Team 2',place:2,kills:0});
        el2.innerHTML=rnd.teams.map((t,ti)=>`
            <div style="display:grid;grid-template-columns:1fr 50px 50px;gap:.3rem;margin-bottom:.28rem">
                <input class="scr-team-inp" value="${t.n}" oninput="stRounds[${ri}].teams[${ti}].n=this.value">
                <input class="scr-team-inp" type="number" value="${t.place}" min="1" max="16" style="text-align:center" oninput="stRounds[${ri}].teams[${ti}].place=+this.value">
                <input class="scr-team-inp" type="number" value="${t.kills}" min="0" style="text-align:center" oninput="stRounds[${ri}].teams[${ti}].kills=+this.value">
            </div>`).join('');
    });
}
function stAddTeamToRound(ri){ stRounds[ri].teams.push({n:`Team ${stRounds[ri].teams.length+1}`,place:stRounds[ri].teams.length+1,kills:0}); stRenderRounds(); }
function stShowCustom(v){ document.getElementById('st_custom_sec').style.display=v==='custom'?'':'none'; }
function stCalc(){
    const sys=scrGetChip('st_sys')||'pubg';
    const ptsList=sys==='custom'
        ?(document.getElementById('st_custom_pts')?.value||'').split(',').map(Number)
        :PTS_SYSTEMS[sys]||PTS_SYSTEMS.pubg;
    const totals={};
    stRounds.forEach(rnd=>{
        rnd.teams.forEach(t=>{
            if(!totals[t.n]) totals[t.n]={name:t.n,kills:0,placement:0,total:0,rounds:0};
            const pp=ptsList[(t.place||1)-1]||0;
            totals[t.n].kills+=t.kills||0;
            totals[t.n].placement+=pp;
            totals[t.n].total+=pp+(t.kills||0);
            totals[t.n].rounds++;
        });
    });
    const sorted=Object.values(totals).sort((a,b)=>b.total-a.total);
    const medals=['🥇','🥈','🥉'];
    const tbl=document.getElementById('st_table');
    if(!tbl)return;
    tbl.innerHTML=`<thead><tr><th>#</th><th>الفريق</th><th>قتلات</th><th>نقاط مركز</th><th>المجموع</th><th>الجولات</th></tr></thead>
    <tbody>${sorted.map((t,i)=>`<tr class="${i<3?['top1','top2','top3'][i]:''}"><td>${medals[i]||i+1}</td><td style="font-weight:700;text-align:right">${t.name}</td><td style="color:#ff8855">${t.kills}</td><td style="color:#ffd700">${t.placement}</td><td style="font-weight:900;color:${i===0?'#ffd700':i<3?'#00e5ff':'#fff'}">${t.total}</td><td style="color:#667">${t.rounds}</td></tr>`).join('')}</tbody>`;
    document.getElementById('st_out').style.display='';
    window._stSorted=sorted;
}
function stDlTxt(){
    if(!window._stSorted)return;
    scrDl(['🏆 الترتيب النهائي','═'.repeat(28),...window._stSorted.map((t,i)=>`${i+1}. ${t.name} — قتلات:${t.kills} | مراكز:${t.placement} | مجموع:${t.total}`),'','📌 Eyad_Eyad12'].join('\n'),'ترتيب_السكرم');
}
function stDlImg(){
    const sorted=window._stSorted||[];
    const W=700,H=80+sorted.length*45+50;
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;
    const ctx=cv.getContext('2d');
    ctx.fillStyle='#030c1c';ctx.fillRect(0,0,W,H);
    const g=ctx.createLinearGradient(0,0,W,0);g.addColorStop(0,'#ff9800');g.addColorStop(1,'#ff6600');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,8);
    ctx.shadowColor='#ff9800';ctx.shadowBlur=15;
    ctx.fillStyle='#ff9800';ctx.font='bold 20px "Segoe UI"';ctx.textAlign='center';ctx.fillText('🏆 الترتيب النهائي',W/2,42);
    ctx.shadowBlur=0;
    sorted.forEach((t,i)=>{
        const y=62+i*45;
        const rc=i===0?'rgba(255,215,0,.12)':i===1?'rgba(192,192,192,.08)':i===2?'rgba(205,127,50,.08)':'rgba(255,255,255,.03)';
        ctx.fillStyle=rc;ctx.fillRect(8,y,W-16,38);
        ctx.fillStyle=i===0?'#ffd700':i===1?'#c0c0c0':i===2?'#cd7f32':'#667788';
        ctx.font='bold 15px "Segoe UI"';ctx.textAlign='left';ctx.fillText(['🥇','🥈','🥉'][i]||`#${i+1}`,20,y+25);
        ctx.fillStyle='#fff';ctx.font=`${i<3?'bold ':''} 14px "Segoe UI"`;ctx.fillText(t.name,55,y+25);
        ctx.fillStyle='#ff8855';ctx.textAlign='right';ctx.font='13px "Segoe UI"';ctx.fillText(`⚔️ ${t.kills}`,W-180,y+25);
        ctx.fillStyle=i===0?'#ffd700':i<3?'#00e5ff':'#ccc';ctx.font='bold 16px "Segoe UI"';ctx.fillText(`${t.total} pts`,W-25,y+25);
    });
    ctx.fillStyle='rgba(255,152,0,.4)';ctx.font='11px "Segoe UI"';ctx.textAlign='center';ctx.fillText('Eyad_Eyad12',W/2,H-12);
    const a=document.createElement('a');a.href=cv.toDataURL();a.download='scrimmage_results.png';a.click();
}

/* ══════════════════════════════════════════════
   4. ANNOUNCEMENT CANVAS
══════════════════════════════════════════════ */
function anUpdatePreview(){
    const cv=document.getElementById('an_cv');if(!cv)return;
    const W=1080,H=1080;cv.width=W;cv.height=H;
    const ctx=cv.getContext('2d');
    const type=scrGetChip('an_type')||'open';
    const theme=scrGetChip('an_theme')||'fire';
    const title=document.getElementById('an_title')?.value||'SCRIMMAGE';
    const details=document.getElementById('an_details')?.value||'';
    const code=document.getElementById('an_code')?.value||'';
    const pass=document.getElementById('an_pass')?.value||'';
    const extra=document.getElementById('an_extra')?.value||'';
    const THEMES={
        fire:{b1:'#0a0000',b2:'#1a0500',c1:'#ff6600',c2:'#ff9800',c3:'#ffcc00'},
        night:{b1:'#000814',b2:'#001427',c1:'#00b4d8',c2:'#0077b6',c3:'#90e0ef'},
        neon:{b1:'#000000',b2:'#0a000a',c1:'#ff00ff',c2:'#00ffff',c3:'#ff00aa'},
        gold:{b1:'#0a0800',b2:'#150f00',c1:'#ffd700',c2:'#ff9800',c3:'#fff'},
    };
    const T=THEMES[theme]||THEMES.fire;
    const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,T.b1);grad.addColorStop(1,T.b2);
    ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
    // Diagonal lines
    ctx.strokeStyle=T.c1+'22';ctx.lineWidth=1;
    for(let i=-H;i<W+H;i+=80){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+H,H);ctx.stroke();}
    // Vignette
    const vig=ctx.createRadialGradient(W/2,H/2,H*.1,W/2,H/2,H*.72);
    vig.addColorStop(0,'transparent');vig.addColorStop(1,'rgba(0,0,0,.55)');
    ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);
    // Top glow bar
    const topG=ctx.createLinearGradient(0,0,W,0);topG.addColorStop(0,T.c1+'00');topG.addColorStop(.5,T.c1+'55');topG.addColorStop(1,T.c1+'00');
    ctx.fillStyle=topG;ctx.fillRect(0,0,W,H*.04);
    ctx.strokeStyle=T.c1;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,H*.04);ctx.lineTo(W,H*.04);ctx.stroke();
    // PUBG MOBILE text
    ctx.shadowColor=T.c1;ctx.shadowBlur=20;ctx.fillStyle=T.c1;ctx.font=`bold ${H*.045}px "Segoe UI",Arial`;ctx.textAlign='center';
    ctx.fillText('🎮 PUBG MOBILE',W/2,H*.13);ctx.shadowBlur=0;
    // Type label
    const typeLabels={open:'فتح سكرم',result:'نتائج الجولة',schedule:'جدول المباريات',winner:'الفائز'};
    ctx.fillStyle=T.c2+'99';ctx.font=`${H*.035}px "Segoe UI"`;ctx.fillText(typeLabels[type]||'',W/2,H*.19);
    // Main title
    ctx.shadowColor=T.c3;ctx.shadowBlur=30;ctx.fillStyle=T.c3;
    const fs=Math.min(H*.1,W*.08);
    ctx.font=`bold ${fs}px "Segoe UI",Arial`;ctx.fillText(title,W/2,H*.37);ctx.shadowBlur=0;
    // Divider lines
    ['l','r'].forEach(dir=>{
        const g2=ctx.createLinearGradient(W/2,0,dir==='l'?0:W,0);
        g2.addColorStop(0,T.c1);g2.addColorStop(1,'transparent');
        ctx.strokeStyle=g2;ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(W/2,H*.42);ctx.lineTo(dir==='l'?W/2-W*.35:W/2+W*.35,H*.42);ctx.stroke();
    });
    // Details
    if(details){ctx.fillStyle=T.c2;ctx.font=`${H*.038}px "Segoe UI"`;ctx.fillText(details,W/2,H*.5);}
    // Code box
    if(code){
        const bx=W*.15,bw=W*.7,bh=H*.12,by=H*.57;
        ctx.fillStyle='rgba(0,0,0,.55)';ctx.strokeStyle=T.c1+'88';ctx.lineWidth=2;
        ctx.beginPath();ctx.roundRect(bx,by,bw,bh,16);ctx.fill();ctx.stroke();
        ctx.fillStyle=T.c2+'99';ctx.font=`${H*.028}px "Segoe UI"`;ctx.fillText('كود الروم',W/2,by+H*.036);
        ctx.shadowColor=T.c1;ctx.shadowBlur=18;ctx.fillStyle=T.c1;ctx.font=`bold ${H*.055}px monospace`;
        ctx.fillText(code,W/2,by+H*.09);ctx.shadowBlur=0;
        if(pass){ctx.fillStyle='rgba(255,255,255,.45)';ctx.font=`${H*.026}px "Segoe UI"`;ctx.fillText(`كلمة السر: ${pass}`,W/2,by+H*.126);}
    }
    // Extra
    if(extra){ctx.fillStyle='rgba(255,255,255,.55)';ctx.font=`${H*.026}px "Segoe UI"`;ctx.fillText(extra,W/2,H*.84);}
    // Footer
    ctx.fillStyle=T.c1+'88';ctx.font=`${H*.023}px "Segoe UI"`;ctx.fillText('منظم بواسطة: Eyad_Eyad12 • eyad-eyad12.com',W/2,H*.95);
    ctx.strokeStyle=T.c1;ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(0,H*.97);ctx.lineTo(W,H*.97);ctx.stroke();
}
function anDl(size){
    const cv=document.getElementById('an_cv');if(!cv)return;
    const[w,h]=size.split('x').map(Number);
    if(w===cv.width&&h===cv.height){scrDlCanvas('an_cv','scrimmage_announcement');return;}
    const tmp=document.createElement('canvas');tmp.width=w;tmp.height=h;
    tmp.getContext('2d').drawImage(cv,0,0,w,h);
    const a=document.createElement('a');a.href=tmp.toDataURL();a.download=`scrimmage_${size}.png`;a.click();
}

/* ══════════════════════════════════════════════
   5. DROP ZONES
══════════════════════════════════════════════ */
const DZ_MAPS={
    er:['Pochinki','School','Mylta Power','Georgopol','Rozhok','Yasnaya','Mil Base','Hospital','Novorepnoye','Lipovka','Primorsk','Sosnovka','Ferry Pier','Quarry','Zharki','Gatka'],
    mi:['Los Leones','El Pozo','San Martin','Pecado','Hacienda','Monte Nuevo','Chumacera','Crater Fields','Impala','La Catedral','Valle del Mar','Graveyard','Ruins','Junkyard','El Azahar','Oasis'],
    sa:['Bootcamp','Ruins','Pai Nan','Paradise Resort','Quarry','Docks','Cave','Mountain','Khao','Camp Alpha','Camp Bravo','Camp Charlie'],
    vi:['Dobro Mesto','Goroka','Castle','Coal Mine','Krichas','Tovar','Zabava','Movatra','Pillar','Cantra','Cosmodrome'],
    li:['Power Plant','Midstein','Aqueduct','Factory','Lake Town','Coconut','Northern Port','Southern Port','Farm','Ruins'],
};
let dzTeams=[];
function dzRenderTeams(){
    const el=document.getElementById('dz_teams_list');if(!el)return;
    el.innerHTML=dzTeams.map((t,i)=>`
        <div class="scr-team-row">
            <div class="scr-round-badge">${i+1}</div>
            <input class="scr-team-inp" value="${t.n}" oninput="dzTeams[${i}].n=this.value">
            <button class="scr-del" onclick="dzTeams.splice(${i},1);dzRenderTeams()">✕</button>
        </div>`).join('');
}
function dzAddTeam(){ dzTeams.push({n:`Team ${dzTeams.length+1}`}); dzRenderTeams(); }
function dzLoadMap(v){ window._dzCurrentMap=v; }
function dzAssign(){
    const mapKey=scrGetChip('dz_map')||'er';
    const zones=[...(DZ_MAPS[mapKey]||[])];
    const teams=[...dzTeams];
    if(!teams.length){scrToast('⚠️ أضف فرقاً');return;}
    // Shuffle zones
    for(let i=zones.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[zones[i],zones[j]]=[zones[j],zones[i]];}
    const assigned={};
    teams.forEach((t,i)=>{ assigned[zones[i]]=t.n; });
    const grid=document.getElementById('dz_zones_grid');if(!grid)return;
    grid.innerHTML=(DZ_MAPS[mapKey]||[]).map(zone=>`
        <div class="scr-zone ${assigned[zone]?'assigned':''}">
            <div class="scr-zone-name">📍 ${zone}</div>
            ${assigned[zone]?`<div class="scr-zone-team">✅ ${assigned[zone]}</div>`:'<div style="color:#334455;font-size:.68rem">متاحة</div>'}
        </div>`).join('');
    document.getElementById('dz_out').style.display='';
    window._dzAssigned=assigned;
    window._dzMap=mapKey;
}
function dzDlTxt(){
    if(!window._dzAssigned)return;
    const lines=['🗺️ توزيع مناطق الهبوط','═'.repeat(28),...Object.entries(window._dzAssigned).map(([z,t])=>`📍 ${z} → ${t}`),'','📌 Eyad_Eyad12'];
    scrDl(lines.join('\n'),'مناطق_الهبوط');
}
function dzDlImg(){
    const asgn=window._dzAssigned||{};
    const entries=Object.entries(asgn);
    const W=700,H=80+entries.length*40+50;
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;
    const ctx=cv.getContext('2d');
    ctx.fillStyle='#030c1c';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#ff9800';ctx.font='bold 20px "Segoe UI"';ctx.textAlign='center';ctx.shadowColor='#ff9800';ctx.shadowBlur=12;
    ctx.fillText('🗺️ مناطق الهبوط',W/2,42);ctx.shadowBlur=0;
    entries.forEach(([zone,team],i)=>{
        const y=62+i*40;
        ctx.fillStyle=i%2===0?'rgba(255,152,0,.07)':'rgba(255,255,255,.03)';ctx.fillRect(10,y,W-20,34);
        ctx.fillStyle='#ff9800';ctx.font='13px "Segoe UI"';ctx.textAlign='left';ctx.fillText('📍 '+zone,20,y+22);
        ctx.fillStyle='#44ee55';ctx.textAlign='right';ctx.font='bold 13px "Segoe UI"';ctx.fillText('✅ '+team,W-15,y+22);
    });
    ctx.fillStyle='rgba(255,152,0,.4)';ctx.font='11px "Segoe UI"';ctx.textAlign='center';ctx.fillText('Eyad_Eyad12',W/2,H-12);
    const a=document.createElement('a');a.href=cv.toDataURL();a.download='drop_zones.png';a.click();
}

/* ══════════════════════════════════════════════
   6. RULES GENERATOR
══════════════════════════════════════════════ */
function rlGenerate(){
    const type=scrGetChip('rl_type')||'scrim';
    const pts=scrGetChip('rl_pts')||'pubg';
    const name=document.getElementById('rl_name')?.value||'SCRIMMAGE';
    const org=document.getElementById('rl_org')?.value||'Eyad_Eyad12';
    const teams=document.getElementById('rl_teams_n')?.value||'16';
    const rounds=document.getElementById('rl_rounds')?.value||'6';
    const kpp=document.getElementById('rl_kpp')?.value||'1';
    const extra=document.getElementById('rl_extra')?.value||'';
    const ptsSystem=pts==='wwc'?'WWC 2024: #1=15، #2=12، #3=10، #4=8، #5=6، #6=5، #7=4، #8=3، #9=2، #10=1':pts==='custom'?'مخصص — حسب إعدادات البطولة':'PUBG Mobile: #1=12، #2=9، #3=7، #4=5، #5=4، #6=3، #7=2، #8-10=1';
    const typeNames={scrim:'السكرم الداخلي',tournament:'البطولة',quals:'التصفيات'};
    const rules=`
═══════════════════════════════════════════
🏆 قواعد ${typeNames[type]||''} — ${name}
═══════════════════════════════════════════

📋 معلومات عامة:
• المنظم: ${org}
• عدد الفرق: ${teams} فريق
• عدد الجولات: ${rounds} جولة
• نقاط كل قتلة: ${kpp} نقطة

📊 نظام النقاط:
${ptsSystem}
• كل قتلة = ${kpp} نقطة تُضاف للمجموع

⚔️ قواعد اللعب:
1. يجب الانضمام للروم قبل 10 دقائق من البدء.
2. في حال التأخر أكثر من 5 دقائق عن الجولة يُعتبر الفريق منسحباً.
3. ممنوع مهاجمة فريق ملتقى في نزاع مع فريق آخر (Third Party) إلا بعد انتهاء النزاع.
4. يُحتسب المركز بناءً على وقت آخر لاعب ماتا في الفريق.
5. القتلات تُحتسب بعدد المقعدين (eliminated) وليس المطروحين (knocked).
6. الفريق الفائز هو الأعلى نقاطاً في نهاية جميع الجولات.
7. في حالة التعادل يُرجَّح الفريق الأعلى في إجمالي القتلات.

🤝 قواعد الاحترام:
• ممنوع الإساءة اللفظية أو التنمر داخل الروم.
• ممنوع الـ Stream Sniping بأي شكل.
• أي خلاف يُرفع للمنظم والقرار يكون نهائياً.
• الالتزام بقواعد البث في حالة البث المباشر.

${extra?`📌 قواعد إضافية:\n${extra}\n`:''}
✅ بالمشاركة في ${typeNames[type]||''} تُقرّ بالموافقة على جميع القواعد أعلاه.

═══════════════════════════════════════════
📌 منظم بواسطة: ${org} | eyad-eyad12.com
═══════════════════════════════════════════
`.trim();
    document.getElementById('rl_res').textContent=rules;
    document.getElementById('rl_out').style.display='';
    window._rlRules=rules;
}
function rlCopy(){ if(window._rlRules) navigator.clipboard?.writeText(window._rlRules).then(()=>scrToast('✅ تم نسخ القواعد!')); }
function rlDl(){ if(window._rlRules) scrDl(window._rlRules,'قواعد_البطولة'); }
function rlDlImg(){
    if(!window._rlRules)return;
    const lines=window._rlRules.split('\n').filter(l=>l.trim());
    const W=800,H=Math.min(1200,80+lines.length*28+60);
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;
    const ctx=cv.getContext('2d');
    ctx.fillStyle='#030c1c';ctx.fillRect(0,0,W,H);
    const g=ctx.createLinearGradient(0,0,W,0);g.addColorStop(0,'#ff9800');g.addColorStop(1,'#ff6600');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,7);
    let y=45;
    lines.forEach(line=>{
        const isTitle=line.includes('═');
        const isSection=line.match(/^[📋📊⚔️🤝✅]/);
        ctx.fillStyle=isTitle?'rgba(255,152,0,.25)':isSection?'rgba(255,152,0,.08)':'transparent';
        if(isTitle||isSection) ctx.fillRect(0,y-18,W,24);
        ctx.fillStyle=isTitle?'#ff9800':isSection?'#ffaa44':line.startsWith('•')||line.match(/^\d+\./)?'#ccd':'#aaa';
        ctx.font=isTitle?'bold 13px monospace':isSection?'bold 14px "Segoe UI"':'12px "Segoe UI"';
        ctx.textAlign='right';
        ctx.fillText(line.slice(0,90),W-15,y);
        y+=24;
    });
    ctx.fillStyle='rgba(255,152,0,.4)';ctx.font='11px "Segoe UI"';ctx.textAlign='center';ctx.fillText('Eyad_Eyad12',W/2,H-14);
    const a=document.createElement('a');a.href=cv.toDataURL();a.download='tournament_rules.png';a.click();
}

console.log('%c🎮 Scrimmage Services — 6 خدمات سكرم ببجي جاهزة','color:#ff9800;font-weight:900;background:#030c1c;padding:4px 10px;border-radius:4px');
