/* ================================================================
   study-services.js v2 — Eyad_Eyad12
   5 خدمات دراسية — مع حل مشكلة API Key
================================================================ */

const STUDY_IDS = ['study-summarizer','study-quiz','study-explainer','study-flashcards','study-mindmap'];

/* ════ Get API Key ════ */
function studyGetKey(){
    return localStorage.getItem('claude_api_key') || '';
}

/* ════ Patch openService ════ */
(function patchStudy(){
    const prev = window.openService;
    window.openService = function(id, name){
        if(!STUDY_IDS.includes(id)) return prev?.call(this, id, name);
        const modal = document.getElementById('serviceModal');
        const title = document.getElementById('serviceModalTitle');
        const cont  = document.getElementById('serviceModalContent');
        if(!modal||!title||!cont) return;
        title.textContent = name;
        cont.innerHTML = studyGetKey() ? studyHTML(id) : studyKeySetupHTML(id, name);
        modal.classList.add('active');
    };
})();

/* ════ API Key setup screen ════ */
function studyKeySetupHTML(id, name){
    return `<div style="padding:1.5rem;background:#030c1c;border-radius:14px;text-align:center">
        <div style="font-size:2.5rem;margin-bottom:1rem">🔑</div>
        <h3 style="color:#fff;font-size:1.1rem;margin-bottom:.5rem">إعداد مفتاح Claude API</h3>
        <p style="color:#667788;font-size:.85rem;line-height:1.7;margin-bottom:1.2rem">
            الخدمات الدراسية تعمل بواسطة Claude AI.<br>
            احصل على مفتاح مجاني من <a href="https://console.anthropic.com" target="_blank" style="color:#6496ff">console.anthropic.com</a>
        </p>
        <input id="studyKeyInp" type="password" placeholder="sk-ant-api03-..." 
            style="width:100%;background:rgba(0,0,0,.45);border:1.5px solid rgba(100,150,255,.3);border-radius:10px;color:#fff;padding:.7rem 1rem;font-size:.85rem;font-family:inherit;margin-bottom:.8rem;box-sizing:border-box">
        <button onclick="studySaveKey('${id}','${name}')" style="width:100%;padding:.8rem;background:linear-gradient(135deg,#6496ff,#4466dd);border:none;border-radius:10px;color:#fff;font-weight:800;font-size:.9rem;cursor:pointer;font-family:inherit">
            <i class="fas fa-key"></i> حفظ وفتح الخدمة
        </button>
        <p style="color:#445566;font-size:.72rem;margin-top:.8rem">🔒 يُحفظ المفتاح محلياً في متصفحك فقط</p>
    </div>`;
}

function studySaveKey(id, name){
    const key = document.getElementById('studyKeyInp')?.value?.trim();
    if(!key||!key.startsWith('sk-')){ alert('⚠️ أدخل مفتاح صحيح يبدأ بـ sk-'); return; }
    localStorage.setItem('claude_api_key', key);
    /* Reopen with key now set */
    const cont = document.getElementById('serviceModalContent');
    if(cont) cont.innerHTML = studyHTML(id);
}

/* ════ Shared CSS ════ */
const STUDY_CSS = `
<style>
.st{padding:1rem;background:#030c1c;border-radius:14px;display:flex;flex-direction:column;gap:.85rem}
.st-ta{background:rgba(0,0,0,.45);border:1.5px solid rgba(100,150,255,.2);border-radius:12px;padding:.75rem 1rem;color:#fff;font-size:.86rem;font-family:inherit;width:100%;resize:vertical;min-height:130px;line-height:1.75;transition:border-color .2s;box-sizing:border-box}
.st-ta:focus{outline:none;border-color:#6496ff;box-shadow:0 0 12px rgba(100,150,255,.15)}
.st-ta-sm{min-height:46px;resize:none}
.st-lbl{color:#889aaa;font-size:.74rem;font-weight:700;text-transform:uppercase;letter-spacing:.4px;margin-bottom:.25rem;display:flex;align-items:center;gap:5px}
.st-chips{display:flex;flex-wrap:wrap;gap:.38rem;margin-bottom:.15rem}
.st-chip{padding:4px 11px;border-radius:50px;border:1.5px solid rgba(100,150,255,.2);background:rgba(100,150,255,.07);cursor:pointer;font-size:.76rem;color:#889acc;font-family:inherit;font-weight:600;transition:all .18s}
.st-chip:hover,.st-chip.act{background:rgba(100,150,255,.2);border-color:#6496ff;color:#6496ff}
.st-run{width:100%;padding:.82rem;background:linear-gradient(135deg,#6496ff,#4466dd);border:none;border-radius:12px;color:#fff;font-weight:900;font-size:.9rem;cursor:pointer;font-family:inherit;transition:all .25s;display:flex;align-items:center;justify-content:center;gap:8px}
.st-run:hover:not(:disabled){background:linear-gradient(135deg,#4466dd,#6496ff);transform:translateY(-1px);box-shadow:0 5px 18px rgba(100,150,255,.35)}
.st-run:disabled{opacity:.5;cursor:not-allowed}
.st-res{background:rgba(100,150,255,.06);border:1.5px solid rgba(100,150,255,.2);border-radius:12px;padding:1rem 1.1rem;color:#ccd;font-size:.86rem;line-height:1.85;display:none;white-space:pre-wrap;word-break:break-word;max-height:320px;overflow-y:auto}
.st-res.on{display:block}
.st-dl{display:flex;gap:.45rem;margin-top:.4rem}
.st-dl-btn{flex:1;padding:.6rem;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:50px;color:#aaa;font-weight:700;font-size:.8rem;cursor:pointer;font-family:inherit;transition:all .18s;display:flex;align-items:center;justify-content:center;gap:5px}
.st-dl-btn:hover{background:rgba(100,150,255,.15);border-color:#6496ff;color:#6496ff}
.st-g2{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
@media(max-width:480px){.st-g2{grid-template-columns:1fr}}
.st-prog{height:4px;background:rgba(100,150,255,.15);border-radius:2px;overflow:hidden;margin:.2rem 0;display:none}
.st-prog-f{height:100%;background:linear-gradient(90deg,#6496ff,#44ddff);width:0%;transition:width .3s;border-radius:2px}
.st-err{background:rgba(255,68,68,.1);border:1px solid rgba(255,68,68,.25);border-radius:10px;padding:.6rem .9rem;color:#ff8888;font-size:.8rem;display:none}
.st-err.on{display:block}
/* Quiz */
.st-qi{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:11px;padding:.85rem 1rem;margin-bottom:.55rem}
.st-qq{color:#fff;font-size:.86rem;font-weight:700;margin-bottom:.55rem}
.st-qo{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:.5rem .85rem;cursor:pointer;color:#aaa;font-size:.82rem;font-family:inherit;transition:all .18s;text-align:right;width:100%;margin-bottom:.28rem;display:block}
.st-qo:hover{border-color:#6496ff;color:#fff}
.st-qo.ok{background:rgba(68,238,85,.15);border-color:#44ee55;color:#44ee55}
.st-qo.no{background:rgba(255,68,68,.15);border-color:#f44;color:#f88}
.st-qexp{font-size:.76rem;color:#889aaa;margin-top:.4rem;padding:.4rem .7rem;background:rgba(0,0,0,.3);border-radius:7px;display:none}
/* Flashcards */
.st-fc-wrap{perspective:1000px;margin-bottom:.5rem}
.st-fc{width:100%;min-height:155px;cursor:pointer;position:relative;transform-style:preserve-3d;transition:transform .5s}
.st-fc.flip{transform:rotateY(180deg)}
.st-fc-f,.st-fc-b{position:absolute;inset:0;border-radius:14px;display:flex;align-items:center;justify-content:center;padding:1.1rem;backface-visibility:hidden;font-size:.9rem;font-weight:700;text-align:center;line-height:1.65}
.st-fc-f{background:linear-gradient(135deg,rgba(100,150,255,.12),rgba(68,100,221,.08));border:1.5px solid rgba(100,150,255,.28);color:#fff}
.st-fc-b{background:linear-gradient(135deg,rgba(68,238,85,.08),rgba(34,170,51,.06));border:1.5px solid rgba(68,238,85,.28);color:#44ee55;transform:rotateY(180deg)}
.st-fc-nav{display:flex;align-items:center;justify-content:center;gap:1rem;margin-top:.5rem}
.st-fc-nb{background:rgba(100,150,255,.12);border:1px solid rgba(100,150,255,.25);border-radius:50%;width:34px;height:34px;color:#6496ff;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;font-family:inherit;transition:all .18s}
.st-fc-nb:hover{background:rgba(100,150,255,.25)}
.st-fc-cnt{color:#667788;font-size:.8rem;font-family:monospace}
/* Mindmap */
.st-svg{width:100%;border:1.5px solid rgba(100,150,255,.2);border-radius:12px;background:#050912}
/* Key reset */
.st-key-reset{background:none;border:none;color:#445566;font-size:.72rem;cursor:pointer;font-family:inherit;margin-top:.2rem;text-decoration:underline}
.st-key-reset:hover{color:#6496ff}
</style>`;

/* ════ HTML builders ════ */
function studyHTML(id){
    const keyBtn = `<button class="st-key-reset" onclick="localStorage.removeItem('claude_api_key');location.reload()">🔑 تغيير API Key</button>`;
    switch(id){

    case 'study-summarizer': return STUDY_CSS+`
<div class="st">
  <div>
    <div class="st-lbl"><i class="fas fa-align-left"></i> النص المراد تلخيصه</div>
    <textarea class="st-ta" id="sumT" placeholder="الصق النص — مقال، درس، فصل كتاب..."></textarea>
  </div>
  <div>
    <div class="st-lbl">نوع الملخص</div>
    <div class="st-chips" id="sumType">
      ${[['📋 نقاط','bullets'],['📄 فقرة','paragraph'],['🔢 حقائق وأرقام','facts'],['🧠 مراجعة سريعة','review'],['👶 بسيط جداً','simple']].map(([n,v],i)=>`<button class="st-chip${!i?' act':''}" onclick="stChip(this,'sumType')" data-v="${v}">${n}</button>`).join('')}
    </div>
  </div>
  <div>
    <div class="st-lbl">مستوى التفصيل</div>
    <div class="st-chips" id="sumLvl">
      ${[['⚡ مختصر','1'],['📝 متوسط','2'],['📚 تفصيلي','3']].map(([n,v],i)=>`<button class="st-chip${i===1?' act':''}" onclick="stChip(this,'sumLvl')" data-v="${v}">${n}</button>`).join('')}
    </div>
  </div>
  <div class="st-prog" id="sumProg"><div class="st-prog-f" id="sumProgF"></div></div>
  <div class="st-err" id="sumErr"></div>
  <button class="st-run" id="sumBtn" onclick="sumRun()"><i class="fas fa-magic"></i> تلخيص بالذكاء الاصطناعي</button>
  <div id="sumOut" style="display:none">
    <div class="st-lbl"><i class="fas fa-file-alt"></i> الملخص</div>
    <div class="st-res on" id="sumRes"></div>
    <div class="st-dl">
      <button class="st-dl-btn" onclick="stCopy('sumRes')"><i class="fas fa-copy"></i> نسخ</button>
      <button class="st-dl-btn" onclick="stDlEl('sumRes','ملخص')"><i class="fas fa-download"></i> TXT</button>
    </div>
  </div>
  ${keyBtn}
</div>`;

    case 'study-quiz': return STUDY_CSS+`
<div class="st">
  <div>
    <div class="st-lbl"><i class="fas fa-book-open"></i> المادة الدراسية</div>
    <textarea class="st-ta" id="qzT" placeholder="الصق المادة التي تريد اختباراً عليها..."></textarea>
  </div>
  <div class="st-g2">
    <div>
      <div class="st-lbl">عدد الأسئلة</div>
      <div class="st-chips" id="qzCount">
        ${[['5','5'],['10','10'],['15','15'],['20','20']].map(([n,v],i)=>`<button class="st-chip${i===1?' act':''}" onclick="stChip(this,'qzCount')" data-v="${v}">${n}</button>`).join('')}
      </div>
    </div>
    <div>
      <div class="st-lbl">نوع الأسئلة</div>
      <div class="st-chips" id="qzType">
        ${[['اختيار متعدد','mcq'],['صح/خطأ','tf'],['مختلط','mixed']].map(([n,v],i)=>`<button class="st-chip${!i?' act':''}" onclick="stChip(this,'qzType')" data-v="${v}">${n}</button>`).join('')}
      </div>
    </div>
  </div>
  <div class="st-prog" id="qzProg"><div class="st-prog-f" id="qzProgF"></div></div>
  <div class="st-err" id="qzErr"></div>
  <button class="st-run" id="qzBtn" onclick="qzRun()"><i class="fas fa-question-circle"></i> توليد الاختبار</button>
  <div id="qzArea"></div>
  <div id="qzDl" style="display:none" class="st-dl">
    <button class="st-dl-btn" onclick="qzDl()"><i class="fas fa-download"></i> تنزيل TXT</button>
    <button class="st-dl-btn" onclick="qzReset()"><i class="fas fa-redo"></i> اختبار جديد</button>
  </div>
  ${keyBtn}
</div>`;

    case 'study-explainer': return STUDY_CSS+`
<div class="st">
  <div>
    <div class="st-lbl"><i class="fas fa-lightbulb"></i> المفهوم أو السؤال</div>
    <textarea class="st-ta st-ta-sm" id="exT" placeholder="مثال: ما هو التفاضل والتكامل؟  أو: اشرح نظرية الكم..."></textarea>
  </div>
  <div class="st-g2">
    <div>
      <div class="st-lbl">المستوى</div>
      <div class="st-chips" id="exLvl">
        ${[['🏫 ابتدائي','primary'],['📗 متوسط','middle'],['📘 ثانوي','high'],['🎓 جامعي','university'],['🔬 متقدم','advanced']].map(([n,v],i)=>`<button class="st-chip${i===2?' act':''}" onclick="stChip(this,'exLvl')" data-v="${v}">${n}</button>`).join('')}
      </div>
    </div>
    <div>
      <div class="st-lbl">أسلوب الشرح</div>
      <div class="st-chips" id="exSt">
        ${[['📖 عادي','normal'],['🌍 أمثلة واقعية','examples'],['📊 خطوة بخطوة','steps'],['🎯 مبسّط','eli5'],['🔬 علمي','scientific']].map(([n,v],i)=>`<button class="st-chip${!i?' act':''}" onclick="stChip(this,'exSt')" data-v="${v}">${n}</button>`).join('')}
      </div>
    </div>
  </div>
  <div class="st-prog" id="exProg"><div class="st-prog-f" id="exProgF"></div></div>
  <div class="st-err" id="exErr"></div>
  <button class="st-run" id="exBtn" onclick="exRun()"><i class="fas fa-brain"></i> اشرح لي</button>
  <div id="exOut" style="display:none">
    <div class="st-lbl"><i class="fas fa-lightbulb"></i> الشرح</div>
    <div class="st-res on" id="exRes"></div>
    <div class="st-dl">
      <button class="st-dl-btn" onclick="stCopy('exRes')"><i class="fas fa-copy"></i> نسخ</button>
      <button class="st-dl-btn" onclick="stDlEl('exRes','شرح')"><i class="fas fa-download"></i> TXT</button>
    </div>
  </div>
  ${keyBtn}
</div>`;

    case 'study-flashcards': return STUDY_CSS+`
<div class="st">
  <div>
    <div class="st-lbl"><i class="fas fa-layer-group"></i> المادة الدراسية</div>
    <textarea class="st-ta" id="fcT" placeholder="الصق النص أو المصطلحات..."></textarea>
  </div>
  <div class="st-g2">
    <div>
      <div class="st-lbl">عدد البطاقات</div>
      <div class="st-chips" id="fcCount">
        ${[['5','5'],['10','10'],['15','15'],['20','20']].map(([n,v],i)=>`<button class="st-chip${i===1?' act':''}" onclick="stChip(this,'fcCount')" data-v="${v}">${n}</button>`).join('')}
      </div>
    </div>
    <div>
      <div class="st-lbl">نوع البطاقات</div>
      <div class="st-chips" id="fcType">
        ${[['مصطلح/تعريف','term'],['سؤال/جواب','qa'],['مفهوم/مثال','example']].map(([n,v],i)=>`<button class="st-chip${!i?' act':''}" onclick="stChip(this,'fcType')" data-v="${v}">${n}</button>`).join('')}
      </div>
    </div>
  </div>
  <div class="st-prog" id="fcProg"><div class="st-prog-f" id="fcProgF"></div></div>
  <div class="st-err" id="fcErr"></div>
  <button class="st-run" id="fcBtn" onclick="fcRun()"><i class="fas fa-clone"></i> توليد البطاقات</button>
  <div id="fcArea" style="display:none">
    <div class="st-fc-wrap">
      <div class="st-fc" id="fcCard" onclick="document.getElementById('fcCard').classList.toggle('flip')">
        <div class="st-fc-f" id="fcFront"></div>
        <div class="st-fc-b" id="fcBack"></div>
      </div>
    </div>
    <div class="st-fc-nav">
      <button class="st-fc-nb" onclick="fcNav(-1)">‹</button>
      <span class="st-fc-cnt" id="fcCnt">1 / 1</span>
      <button class="st-fc-nb" onclick="fcNav(1)">›</button>
    </div>
    <div class="st-dl">
      <button class="st-dl-btn" onclick="fcDl()"><i class="fas fa-download"></i> TXT</button>
      <button class="st-dl-btn" onclick="fcShuffle()"><i class="fas fa-random"></i> خلط</button>
    </div>
  </div>
  ${keyBtn}
</div>`;

    case 'study-mindmap': return STUDY_CSS+`
<div class="st">
  <div>
    <div class="st-lbl"><i class="fas fa-project-diagram"></i> الموضوع أو النص</div>
    <textarea class="st-ta" id="mmT" placeholder="مثال: الحرب العالمية الثانية  أو الصق نصاً كاملاً..." style="min-height:90px"></textarea>
  </div>
  <div>
    <div class="st-lbl">مستوى التفصيل</div>
    <div class="st-chips" id="mmLvl">
      ${[['بسيط (2)','2'],['متوسط (3)','3'],['تفصيلي (4)','4']].map(([n,v],i)=>`<button class="st-chip${i===1?' act':''}" onclick="stChip(this,'mmLvl')" data-v="${v}">${n}</button>`).join('')}
    </div>
  </div>
  <div class="st-prog" id="mmProg"><div class="st-prog-f" id="mmProgF"></div></div>
  <div class="st-err" id="mmErr"></div>
  <button class="st-run" id="mmBtn" onclick="mmRun()"><i class="fas fa-sitemap"></i> توليد الخريطة الذهنية</button>
  <div id="mmArea" style="display:none">
    <svg id="mmSvg" class="st-svg" viewBox="0 0 900 500"></svg>
    <div class="st-dl">
      <button class="st-dl-btn" onclick="mmDlSvg()"><i class="fas fa-download"></i> SVG</button>
      <button class="st-dl-btn" onclick="mmDlTxt()"><i class="fas fa-file-alt"></i> نص</button>
    </div>
  </div>
  ${keyBtn}
</div>`;
    default: return '<p style="color:#bbb;text-align:center;padding:2rem">غير متوفر</p>';
    }
}

/* ════ Shared chip toggle ════ */
function stChip(btn, groupId){
    document.getElementById(groupId)?.querySelectorAll('.st-chip').forEach(b=>b.classList.remove('act'));
    btn.classList.add('act');
}
function stGetChip(groupId){ return document.getElementById(groupId)?.querySelector('.st-chip.act')?.dataset.v || ''; }

/* ════ Claude API call ════ */
async function stAI(system, user, pid){
    const key = studyGetKey();
    if(!key){ throw new Error('API Key غير موجود — اضغط "تغيير API Key" وأدخل مفتاحك'); }

    const prog = document.getElementById(pid+'Prog');
    const fill = document.getElementById(pid+'ProgF');
    if(prog) prog.style.display='block';
    let p=0;
    const t = setInterval(()=>{ p=Math.min(p+2,85); if(fill) fill.style.width=p+'%'; },180);

    const res = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{
            'Content-Type':'application/json',
            'x-api-key': key,
            'anthropic-version':'2023-06-01',
            'anthropic-dangerous-direct-browser-access':'true'
        },
        body: JSON.stringify({
            model:'claude-sonnet-4-6',
            max_tokens:1000,
            system,
            messages:[{role:'user',content:user}]
        })
    });

    clearInterval(t);
    if(fill) fill.style.width='100%';
    setTimeout(()=>{ if(prog) prog.style.display='none'; if(fill) fill.style.width='0%'; },400);

    if(!res.ok){
        const err = await res.json().catch(()=>({}));
        const msg = err?.error?.message || `خطأ ${res.status}`;
        if(res.status===401) throw new Error('API Key غير صحيح — تحقق من المفتاح');
        if(res.status===429) throw new Error('تجاوزت الحد — انتظر دقيقة وأعد المحاولة');
        throw new Error(msg);
    }
    const data = await res.json();
    return data.content?.[0]?.text || '';
}

function stShowErr(id, msg){ const el=document.getElementById(id+'Err'); if(el){el.textContent='❌ '+msg; el.classList.add('on');} }
function stHideErr(id){ const el=document.getElementById(id+'Err'); if(el) el.classList.remove('on'); }

/* ════ 1. SUMMARIZER ════ */
async function sumRun(){
    const text = document.getElementById('sumT')?.value?.trim();
    if(!text){ stShowErr('sum','الصق نصاً'); return; }
    stHideErr('sum');
    const type  = stGetChip('sumType') || 'bullets';
    const level = stGetChip('sumLvl')  || '2';
    const btn   = document.getElementById('sumBtn');
    btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري التلخيص...';
    const typeGuide={bullets:'قدّم الملخص كنقاط مرتبة باستخدام • لكل نقطة',paragraph:'قدّم الملخص كفقرة واحدة متماسكة',facts:'استخرج الأرقام والحقائق والإحصاءات كقائمة مرقمة',review:'ملخص مراجعة سريعة مع تمييز المفاهيم الأساسية',simple:'اشرح بلغة بسيطة جداً كأنك تشرح لطفل'};
    const detail=level==='1'?'مختصر جداً (3-5 نقاط)':level==='3'?'تفصيلي وشامل (10-15 نقطة)':'متوسط التفصيل (6-8 نقاط)';
    try{
        const r = await stAI(`أنت مساعد أكاديمي. ${typeGuide[type]}. التفصيل: ${detail}. أجب بالعربية.`,`لخّص:\n\n${text.slice(0,8000)}`,'sum');
        document.getElementById('sumRes').textContent=r;
        document.getElementById('sumOut').style.display='';
    }catch(e){ stShowErr('sum',e.message); }
    btn.disabled=false; btn.innerHTML='<i class="fas fa-magic"></i> تلخيص بالذكاء الاصطناعي';
}

/* ════ 2. QUIZ ════ */
let _qz=[];
async function qzRun(){
    const text=document.getElementById('qzT')?.value?.trim();
    if(!text){stShowErr('qz','الصق المادة');return;}
    stHideErr('qz');
    const count=stGetChip('qzCount')||'10';
    const type=stGetChip('qzType')||'mcq';
    const btn=document.getElementById('qzBtn');
    btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري توليد الاختبار...';
    const qt={mcq:'اختيار متعدد 4 خيارات',tf:'صح وخطأ',mixed:'مزيج من الاثنين'};
    try{
        const raw=await stAI(`أنت أستاذ يصنع اختبارات. أعد JSON صالح فقط:
{"questions":[{"q":"نص السؤال","type":"mcq","options":["أ","ب","ج","د"],"answer":0,"explanation":"شرح"},{"q":"نص","type":"tf","answer":true,"explanation":"شرح"}]}
answer للـ mcq = رقم الخيار الصحيح (0-3). كل الأسئلة بالعربية.`,
`أنشئ ${count} سؤال (${qt[type]}) من هذه المادة:\n\n${text.slice(0,6000)}`,'qz');
        let p={};
        try{p=JSON.parse(raw.replace(/```json?|```/g,'').trim());}catch(_){throw new Error('خطأ في تحليل الأسئلة');}
        _qz=p.questions||[];
        if(!_qz.length) throw new Error('لم يتم توليد أسئلة');
        qzRender();
        document.getElementById('qzDl').style.display='';
    }catch(e){stShowErr('qz',e.message);}
    btn.disabled=false; btn.innerHTML='<i class="fas fa-question-circle"></i> توليد الاختبار';
}
function qzRender(){
    const a=document.getElementById('qzArea');
    a.innerHTML=_qz.map((q,i)=>{
        const opts=q.type==='tf'
            ?`<button class="st-qo" onclick="qzCheck(this,${i},'true')">✅ صح</button><button class="st-qo" onclick="qzCheck(this,${i},'false')">❌ خطأ</button>`
            :(q.options||[]).map((o,oi)=>`<button class="st-qo" onclick="qzCheck(this,${i},${oi})">${['أ','ب','ج','د'][oi]}) ${o}</button>`).join('');
        return `<div class="st-qi"><div class="st-qq">${i+1}. ${q.q}</div><div>${opts}</div><div class="st-qexp" id="qe${i}">💡 ${q.explanation||''}</div></div>`;
    }).join('');
}
function qzCheck(btn,qi,ans){
    const q=_qz[qi];if(!q)return;
    btn.closest('.st-qi')?.querySelectorAll('.st-qo').forEach(b=>{b.disabled=true;b.style.pointerEvents='none';});
    const ok=q.type==='tf'?String(q.answer)===String(ans):parseInt(ans)===parseInt(q.answer);
    btn.classList.add(ok?'ok':'no');
    if(!ok&&q.type!=='tf'){const opts=btn.closest('.st-qi')?.querySelectorAll('.st-qo');if(opts?.[q.answer])opts[q.answer].classList.add('ok');}
    const ex=document.getElementById('qe'+qi);if(ex)ex.style.display='block';
}
function qzReset(){document.getElementById('qzArea').innerHTML='';document.getElementById('qzDl').style.display='none';_qz=[];}
function qzDl(){stDl(_qz.map((q,i)=>`${i+1}. ${q.q}\n${q.type==='tf'?'   صح / خطأ — الجواب: '+(q.answer?'صح':'خطأ'):(q.options||[]).map((o,oi)=>`   ${['أ','ب','ج','د'][oi]}) ${o}${oi===q.answer?' ✓':''}`).join('\n')}\n   💡 ${q.explanation||''}`).join('\n\n'),'اختبار');}

/* ════ 3. EXPLAINER ════ */
async function exRun(){
    const topic=document.getElementById('exT')?.value?.trim();
    if(!topic){stShowErr('ex','أدخل المفهوم');return;}
    stHideErr('ex');
    const lv=stGetChip('exLvl')||'high';
    const st=stGetChip('exSt')||'normal';
    const btn=document.getElementById('exBtn');
    btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري الشرح...';
    const lMap={primary:'طالب ابتدائي',middle:'متوسط',high:'ثانوي',university:'جامعي',advanced:'متخصص'};
    const sMap={normal:'شرح واضح منظم',examples:'مع أمثلة من الواقع',steps:'خطوة بخطوة',eli5:'بسيط جداً كلغة طفل',scientific:'دقة علمية'};
    try{
        const r=await stAI(`أنت أستاذ خبير. اشرح ${sMap[st]} لمستوى ${lMap[lv]}. أجب بالعربية.`,`اشرح: ${topic}`,'ex');
        document.getElementById('exRes').textContent=r;
        document.getElementById('exOut').style.display='';
    }catch(e){stShowErr('ex',e.message);}
    btn.disabled=false; btn.innerHTML='<i class="fas fa-brain"></i> اشرح لي';
}

/* ════ 4. FLASHCARDS ════ */
let _fc=[],_fi=0;
async function fcRun(){
    const text=document.getElementById('fcT')?.value?.trim();
    if(!text){stShowErr('fc','الصق المادة');return;}
    stHideErr('fc');
    const count=stGetChip('fcCount')||'10';
    const type=stGetChip('fcType')||'term';
    const btn=document.getElementById('fcBtn');
    btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري التوليد...';
    const tMap={term:'المصطلح على الأمام والتعريف على الخلف',qa:'السؤال على الأمام والجواب على الخلف',example:'المفهوم أمام مثال خلف'};
    try{
        const raw=await stAI(`أنت متخصص في البطاقات التعليمية. أعد JSON صالح فقط: {"cards":[{"front":"الأمام","back":"الخلف"},...]}. ${tMap[type]}.`,`أنشئ ${count} بطاقة من:\n\n${text.slice(0,5000)}`,'fc');
        let p={};
        try{p=JSON.parse(raw.replace(/```json?|```/g,'').trim());}catch(_){throw new Error('خطأ في التحليل');}
        _fc=p.cards||[];_fi=0;
        if(!_fc.length) throw new Error('لم يتم توليد بطاقات');
        fcShow();
        document.getElementById('fcArea').style.display='';
    }catch(e){stShowErr('fc',e.message);}
    btn.disabled=false; btn.innerHTML='<i class="fas fa-clone"></i> توليد البطاقات';
}
function fcShow(){const c=_fc[_fi];document.getElementById('fcFront').textContent=c?.front||'';document.getElementById('fcBack').textContent=c?.back||'';document.getElementById('fcCard').classList.remove('flip');document.getElementById('fcCnt').textContent=`${_fi+1} / ${_fc.length}`;}
function fcNav(d){_fi=(_fi+d+_fc.length)%_fc.length;fcShow();}
function fcShuffle(){_fc=_fc.sort(()=>Math.random()-.5);_fi=0;fcShow();}
function fcDl(){stDl(_fc.map((c,i)=>`البطاقة ${i+1}\nأمام: ${c.front}\nخلف:  ${c.back}`).join('\n\n---\n\n'),'بطاقات_تعليمية');}

/* ════ 5. MIND MAP ════ */
let _mmData=null;
async function mmRun(){
    const text=document.getElementById('mmT')?.value?.trim();
    if(!text){stShowErr('mm','أدخل الموضوع');return;}
    stHideErr('mm');
    const depth=stGetChip('mmLvl')||'3';
    const btn=document.getElementById('mmBtn');
    btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري التوليد...';
    try{
        const raw=await stAI(`أنت خبير في الخرائط الذهنية. أعد JSON صالح فقط:
{"center":"الموضوع الرئيسي","branches":[{"label":"فرع","children":[{"label":"فرع فرعي","children":[]}]}]}
عمق ${depth} مستويات. أجب بالعربية. لا تضف نصاً خارج JSON.`,`خريطة ذهنية عن: ${text.slice(0,3000)}`,'mm');
        let p={};
        try{p=JSON.parse(raw.replace(/```json?|```/g,'').trim());}catch(_){throw new Error('خطأ في التحليل');}
        _mmData=p;
        mmDraw(p);
        document.getElementById('mmArea').style.display='';
    }catch(e){stShowErr('mm',e.message);}
    btn.disabled=false; btn.innerHTML='<i class="fas fa-sitemap"></i> توليد الخريطة الذهنية';
}

function mmDraw(data){
    const svg=document.getElementById('mmSvg');if(!svg||!data)return;
    const W=900,H=500,cx=W/2,cy=H/2;
    const C=['#6496ff','#44ddff','#44ee88','#ffaa44','#ff6699','#aa66ff','#44ccaa','#ff8844'];
    let h='';
    h+=`<ellipse cx="${cx}" cy="${cy}" rx="82" ry="34" fill="#0d1a3a" stroke="#6496ff" stroke-width="2.5"/>
        <text x="${cx}" y="${cy+5}" text-anchor="middle" fill="#6496ff" font-size="13" font-weight="bold" font-family="Arial,sans-serif">${mmE(data.center||'')}</text>`;
    const br=data.branches||[],n=br.length;
    br.forEach((b,i)=>{
        const a=(i/n)*Math.PI*2-Math.PI/2,c=C[i%C.length];
        const bx=cx+Math.cos(a)*128,by=cy+Math.sin(a)*128;
        h+=`<line x1="${cx}" y1="${cy}" x2="${bx}" y2="${by}" stroke="${c}" stroke-width="2.2" opacity=".6"/>
            <ellipse cx="${bx}" cy="${by}" rx="50" ry="20" fill="#0a0f1e" stroke="${c}" stroke-width="1.8"/>
            <text x="${bx}" y="${by+5}" text-anchor="middle" fill="${c}" font-size="10.5" font-weight="bold" font-family="Arial,sans-serif">${mmE((b.label||'').slice(0,18))}</text>`;
        (b.children||[]).slice(0,5).forEach((ch,j)=>{
            const sp=0.44,ca=a+(j-(b.children.length-1)/2)*sp;
            const chx=cx+Math.cos(ca)*225,chy=cy+Math.sin(ca)*225;
            h+=`<line x1="${bx}" y1="${by}" x2="${chx}" y2="${chy}" stroke="${c}" stroke-width="1.5" opacity=".45"/>
                <rect x="${chx-38}" y="${chy-13}" width="76" height="26" rx="7" fill="#080e1e" stroke="${c}" stroke-width="1.2"/>
                <text x="${chx}" y="${chy+4}" text-anchor="middle" fill="#ccd" font-size="9.5" font-family="Arial,sans-serif">${mmE((ch.label||'').slice(0,15))}</text>`;
            (ch.children||[]).slice(0,3).forEach((gc,k)=>{
                const ga=ca+(k-(ch.children.length-1)/2)*0.28;
                const gcx=cx+Math.cos(ga)*310,gcy=cy+Math.sin(ga)*310;
                h+=`<line x1="${chx}" y1="${chy}" x2="${gcx}" y2="${gcy}" stroke="${c}" stroke-width="1" opacity=".3"/>
                    <text x="${gcx}" y="${gcy+3}" text-anchor="middle" fill="#7788aa" font-size="9" font-family="Arial,sans-serif">${mmE((gc.label||'').slice(0,13))}</text>`;
            });
        });
    });
    svg.innerHTML=h;
}

function mmE(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function mmDlSvg(){
    const svg=document.getElementById('mmSvg');if(!svg)return;
    const blob=new Blob([`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" style="background:#050912">${svg.innerHTML}</svg>`],{type:'image/svg+xml'});
    const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='mindmap.svg';a.click();URL.revokeObjectURL(u);
}
function mmDlTxt(){
    if(!_mmData)return;
    const lines=[_mmData.center];
    (_mmData.branches||[]).forEach(b=>{lines.push('• '+b.label);(b.children||[]).forEach(c=>{lines.push('  ◦ '+c.label);(c.children||[]).forEach(g=>lines.push('    · '+g.label));});});
    stDl(lines.join('\n'),'خريطة_ذهنية');
}

/* ════ Shared helpers ════ */
function stCopy(id){
    const el=document.getElementById(id);if(!el)return;
    navigator.clipboard?.writeText(el.textContent).then(()=>{
        const t=document.createElement('div');
        t.style.cssText='position:fixed;top:20px;right:50%;transform:translateX(50%);background:#6496ff;color:#fff;padding:8px 20px;border-radius:50px;font-weight:800;z-index:9999';
        t.textContent='✅ تم النسخ';document.body.appendChild(t);setTimeout(()=>t.remove(),1800);
    });
}
function stDlEl(id,name){const el=document.getElementById(id);if(el)stDl(el.textContent,name);}
function stDl(text,name){const b=new Blob([text],{type:'text/plain;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name+'_'+Date.now()+'.txt';a.click();URL.revokeObjectURL(u);}

console.log('%c📚 Study Services v2 — Ready','color:#6496ff;font-weight:900;background:#030c1c;padding:4px 10px;border-radius:4px');