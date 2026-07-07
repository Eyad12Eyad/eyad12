/* ================================================================
   effects.js — Eyad_Eyad12
   تأثيرات بصرية احترافية وقوية
================================================================ */

/* ══════════════════════════════════════════════════
   1. CURSOR GLOW + TRAIL
══════════════════════════════════════════════════ */
(function initCursor(){
    const cursor = document.createElement('div');
    cursor.id = 'fx-cursor';
    cursor.style.cssText = `
        position:fixed;width:20px;height:20px;border-radius:50%;
        background:radial-gradient(circle,rgba(220,20,60,.9),rgba(220,20,60,0));
        pointer-events:none;z-index:99999;transform:translate(-50%,-50%);
        transition:width .15s,height .15s,opacity .2s;mix-blend-mode:screen;
    `;
    document.body.appendChild(cursor);

    const trail = Array.from({length:8},(_,i)=>{
        const d = document.createElement('div');
        d.style.cssText = `
            position:fixed;border-radius:50%;pointer-events:none;z-index:99998;
            transform:translate(-50%,-50%);mix-blend-mode:screen;
            background:rgba(220,20,60,${.06-i*.007});
            width:${10+i*4}px;height:${10+i*4}px;
        `;
        document.body.appendChild(d);
        return d;
    });

    let mx=0,my=0,positions=Array(8).fill({x:0,y:0});

    document.addEventListener('mousemove',e=>{
        mx=e.clientX; my=e.clientY;
        cursor.style.left=mx+'px'; cursor.style.top=my+'px';
    });

    document.addEventListener('mousedown',()=>{cursor.style.width='30px';cursor.style.height='30px';});
    document.addEventListener('mouseup',()=>{cursor.style.width='20px';cursor.style.height='20px';});

    /* Interactive elements — cursor scales up */
    document.addEventListener('mouseover',e=>{
        if(e.target.matches('button,a,.ps-card,.service-card,[onclick]')){
            cursor.style.width='40px';cursor.style.height='40px';
            cursor.style.background='radial-gradient(circle,rgba(220,20,60,.6),rgba(220,20,60,0))';
        }
    });
    document.addEventListener('mouseout',e=>{
        if(e.target.matches('button,a,.ps-card,.service-card,[onclick]')){
            cursor.style.width='20px';cursor.style.height='20px';
            cursor.style.background='radial-gradient(circle,rgba(220,20,60,.9),rgba(220,20,60,0))';
        }
    });

    (function animTrail(){
        positions = [{x:mx,y:my},...positions.slice(0,-1)];
        trail.forEach((d,i)=>{ d.style.left=positions[i].x+'px'; d.style.top=positions[i].y+'px'; });
        requestAnimationFrame(animTrail);
    })();
})();

/* ══════════════════════════════════════════════════
   2. 3D CARD TILT on paid service cards
══════════════════════════════════════════════════ */
function apply3DTilt(el){
    el.style.transition='transform .1s ease,box-shadow .2s ease';
    el.style.transformStyle='preserve-3d';

    el.addEventListener('mousemove',e=>{
        const r=el.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        const rotX=-y*18, rotY=x*18;
        const pc=el.style.getPropertyValue('--pc')||'#dc143c';
        el.style.transform=`perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.04,1.04,1.04)`;
        el.style.boxShadow=`${-rotY*2}px ${rotX*2}px 40px rgba(0,0,0,.5), 0 0 30px ${pc}33`;
    });
    el.addEventListener('mouseleave',()=>{
        el.style.transform='perspective(600px) rotateX(0) rotateY(0) scale3d(1,1,1)';
        el.style.boxShadow='';
    });
}

/* ══════════════════════════════════════════════════
   3. HOLOGRAPHIC SHIMMER on premium cards
══════════════════════════════════════════════════ */
function applyHolographic(el){
    const shimmer = document.createElement('div');
    shimmer.style.cssText=`
        position:absolute;inset:0;border-radius:inherit;opacity:0;pointer-events:none;
        background:linear-gradient(105deg,transparent 20%,rgba(255,255,255,.08) 30%,rgba(255,255,255,.18) 40%,rgba(255,255,255,.06) 50%,transparent 60%);
        transition:opacity .3s;
    `;
    el.style.position='relative';
    el.style.overflow='hidden';
    el.appendChild(shimmer);

    el.addEventListener('mousemove',e=>{
        const r=el.getBoundingClientRect();
        const x=((e.clientX-r.left)/r.width)*100;
        const y=((e.clientY-r.top)/r.height)*100;
        shimmer.style.opacity='1';
        shimmer.style.background=`
            radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,.15) 0%, transparent 60%),
            linear-gradient(${x+y}deg,transparent 20%,rgba(255,255,255,.08) 40%,rgba(255,255,255,.16) 50%,rgba(255,255,255,.04) 60%,transparent 80%)
        `;
    });
    el.addEventListener('mouseleave',()=>shimmer.style.opacity='0');
}

/* ══════════════════════════════════════════════════
   4. MAGNETIC BUTTON EFFECT
══════════════════════════════════════════════════ */
function applyMagnetic(btn){
    btn.addEventListener('mousemove',e=>{
        const r=btn.getBoundingClientRect();
        const cx=r.left+r.width/2, cy=r.top+r.height/2;
        const dx=(e.clientX-cx)*.35, dy=(e.clientY-cy)*.35;
        btn.style.transform=`translate(${dx}px,${dy}px) scale(1.06)`;
        btn.style.transition='transform .15s ease';
    });
    btn.addEventListener('mouseleave',()=>{
        btn.style.transform='translate(0,0) scale(1)';
        btn.style.transition='transform .4s cubic-bezier(.23,1,.32,1)';
    });
}

/* ══════════════════════════════════════════════════
   5. PARTICLE CANVAS BACKGROUND for paid section
══════════════════════════════════════════════════ */
function initParticlesBg(container){
    const canvas=document.createElement('canvas');
    canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:.5';
    container.style.position='relative';
    container.style.overflow='hidden';
    container.prepend(canvas);

    const ctx=canvas.getContext('2d');
    let W,H,particles=[];

    function resize(){ W=canvas.width=container.offsetWidth; H=canvas.height=container.offsetHeight; }
    resize();
    new ResizeObserver(resize).observe(container);

    function rand(min,max){ return min+Math.random()*(max-min); }

    class Particle {
        constructor(){this.reset();}
        reset(){
            this.x=rand(0,W); this.y=rand(0,H);
            this.vx=rand(-.4,.4); this.vy=rand(-.8,-.2);
            this.size=rand(1,3); this.alpha=rand(.2,.7);
            this.color=Math.random()<.6?'220,20,60':'255,215,0';
            this.life=0; this.maxLife=rand(120,300);
        }
        update(){
            this.x+=this.vx; this.y+=this.vy; this.life++;
            if(this.x<0||this.x>W||this.y<0||this.life>this.maxLife) this.reset();
        }
        draw(){
            const t=this.life/this.maxLife;
            const a=this.alpha*(t<.2?t*5:t>.8?(1-t)*5:1);
            ctx.beginPath();
            ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
            ctx.fillStyle=`rgba(${this.color},${a})`;
            ctx.fill();
        }
    }

    particles=Array.from({length:80},()=>new Particle());

    /* Connection lines */
    function drawConnections(){
        for(let i=0;i<particles.length;i++){
            for(let j=i+1;j<particles.length;j++){
                const dx=particles[i].x-particles[j].x;
                const dy=particles[i].y-particles[j].y;
                const dist=Math.sqrt(dx*dx+dy*dy);
                if(dist<80){
                    ctx.strokeStyle=`rgba(220,20,60,${.15*(1-dist/80)})`;
                    ctx.lineWidth=.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x,particles[i].y);
                    ctx.lineTo(particles[j].x,particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    (function loop(){
        ctx.clearRect(0,0,W,H);
        drawConnections();
        particles.forEach(p=>{p.update();p.draw();});
        requestAnimationFrame(loop);
    })();
}

/* ══════════════════════════════════════════════════
   6. NEON PULSE BORDER on service cards
══════════════════════════════════════════════════ */
function applyNeonPulse(el,color='#dc143c'){
    el.style.animation='';
    const style=document.getElementById('fx-neon-style')||document.createElement('style');
    style.id='fx-neon-style';
    if(!document.getElementById('fx-neon-style')) document.head.appendChild(style);
    const keyName='neonPulse_'+color.replace('#','');
    if(!style.textContent.includes(keyName)){
        style.textContent+=`
        @keyframes ${keyName} {
            0%,100%{box-shadow:0 0 5px ${color}44,0 0 15px ${color}22,inset 0 0 5px ${color}11}
            50%{box-shadow:0 0 15px ${color}88,0 0 35px ${color}44,inset 0 0 10px ${color}22}
        }`;
    }
    el.style.animation=`${keyName} 2.5s ease-in-out infinite`;
}

/* ══════════════════════════════════════════════════
   7. SCROLL REVEAL
══════════════════════════════════════════════════ */
function initScrollReveal(){
    const style=document.createElement('style');
    style.textContent=`
    .fx-reveal{opacity:0;transform:translateY(30px);transition:opacity .6s ease,transform .6s ease}
    .fx-reveal.visible{opacity:1;transform:translateY(0)}
    .fx-reveal-left{opacity:0;transform:translateX(-30px);transition:opacity .6s ease,transform .6s ease}
    .fx-reveal-left.visible{opacity:1;transform:translateX(0)}
    .fx-reveal-scale{opacity:0;transform:scale(.92);transition:opacity .5s ease,transform .5s ease}
    .fx-reveal-scale.visible{opacity:1;transform:scale(1)}
    `;
    document.head.appendChild(style);

    const obs=new IntersectionObserver((entries)=>{
        entries.forEach((entry,i)=>{
            if(entry.isIntersecting){
                setTimeout(()=>entry.target.classList.add('visible'), i*60);
            }
        });
    },{threshold:.15});

    document.querySelectorAll('.service-card,.ps-card,.adm-stat-card,.adm-quick-btn,.website-card').forEach((el,i)=>{
        el.classList.add('fx-reveal-scale');
        el.style.transitionDelay=(i%4)*60+'ms';
        obs.observe(el);
    });
}

/* ══════════════════════════════════════════════════
   8. CONFETTI EXPLOSION on request submit success
══════════════════════════════════════════════════ */
window.fxConfetti=function(x,y){
    const colors=['#dc143c','#ffd700','#00e5ff','#44ee55','#ff9800','#aa66ff','#fff'];
    const canvas=document.createElement('canvas');
    canvas.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99999';
    canvas.width=window.innerWidth; canvas.height=window.innerHeight;
    document.body.appendChild(canvas);
    const ctx=canvas.getContext('2d');

    const pieces=Array.from({length:120},()=>({
        x:x||canvas.width/2, y:y||canvas.height*.4,
        vx:(Math.random()-0.5)*18,
        vy:(Math.random()-1)*14,
        size:Math.random()*10+5,
        color:colors[Math.floor(Math.random()*colors.length)],
        rotation:Math.random()*360,
        rotSpeed:(Math.random()-0.5)*8,
        gravity:.45, alpha:1,
        shape:Math.random()<.5?'rect':'circle',
    }));

    let frame=0;
    (function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        let alive=false;
        pieces.forEach(p=>{
            p.vy+=p.gravity; p.x+=p.vx; p.y+=p.vy; p.rotation+=p.rotSpeed;
            p.alpha=Math.max(0,p.alpha-.008);
            if(p.alpha>0) alive=true;
            ctx.save();
            ctx.globalAlpha=p.alpha;
            ctx.translate(p.x,p.y);
            ctx.rotate(p.rotation*Math.PI/180);
            ctx.fillStyle=p.color;
            if(p.shape==='circle'){ctx.beginPath();ctx.arc(0,0,p.size/2,0,Math.PI*2);ctx.fill();}
            else ctx.fillRect(-p.size/2,-p.size/4,p.size,p.size/2);
            ctx.restore();
        });
        if(alive&&frame++<200) requestAnimationFrame(draw);
        else canvas.remove();
    })();
};

/* ══════════════════════════════════════════════════
   9. RIPPLE EFFECT on buttons
══════════════════════════════════════════════════ */
function applyRipple(btn){
    btn.style.overflow='hidden';
    btn.style.position='relative';
    btn.addEventListener('click',e=>{
        const r=btn.getBoundingClientRect();
        const ripple=document.createElement('span');
        const size=Math.max(r.width,r.height)*2.5;
        ripple.style.cssText=`
            position:absolute;width:${size}px;height:${size}px;border-radius:50%;
            background:rgba(255,255,255,.2);transform:scale(0);
            left:${e.clientX-r.left-size/2}px;top:${e.clientY-r.top-size/2}px;
            animation:rippleAnim .6s ease-out forwards;pointer-events:none;
        `;
        btn.appendChild(ripple);
        setTimeout(()=>ripple.remove(),700);
    });
}

const ripStyle=document.createElement('style');
ripStyle.textContent='@keyframes rippleAnim{to{transform:scale(1);opacity:0}}';
document.head.appendChild(ripStyle);

/* ══════════════════════════════════════════════════
   10. TYPING TEXT ANIMATION for section subtitles
══════════════════════════════════════════════════ */
function applyTypewriter(el,texts,speed=60){
    let ti=0,ci=0,deleting=false;
    const blink=document.createElement('span');
    blink.style.cssText='border-left:2px solid currentColor;margin-right:2px;animation:blink .7s step-end infinite';
    const blinkStyle=document.createElement('style');
    blinkStyle.textContent='@keyframes blink{50%{opacity:0}}';
    document.head.appendChild(blinkStyle);
    el.appendChild(blink);

    function type(){
        const t=texts[ti];
        if(!deleting){
            el.childNodes[0]&&el.childNodes[0].remove();
            el.prepend(document.createTextNode(t.slice(0,ci)));
            if(ci<t.length){ci++;setTimeout(type,speed);}
            else{setTimeout(()=>{deleting=true;type();},2000);}
        } else {
            el.childNodes[0]&&el.childNodes[0].nodeType===3&&el.childNodes[0].remove();
            el.prepend(document.createTextNode(t.slice(0,ci)));
            if(ci>0){ci--;setTimeout(type,speed/2);}
            else{deleting=false;ti=(ti+1)%texts.length;setTimeout(type,500);}
        }
    }
    type();
}

/* ══════════════════════════════════════════════════
   11. GLOWING STATS COUNTER
══════════════════════════════════════════════════ */
function animateCounter(el,target,suffix=''){
    let current=0;
    const step=Math.max(1,Math.round(target/60));
    const t=setInterval(()=>{
        current=Math.min(current+step,target);
        el.textContent=current.toLocaleString('ar')+suffix;
        if(current>=target)clearInterval(t);
    },25);
}

/* ══════════════════════════════════════════════════
   12. REQUEST BOX SPECIAL EFFECTS
══════════════════════════════════════════════════ */
function enhanceRequestModal(){
    /* اعتراض إنشاء المودال */
    const origPsOpenOrder = window.psOpenOrder;
    window.psOpenOrder = function(serviceId){
        origPsOpenOrder?.(serviceId);
        setTimeout(()=>{
            const modal=document.getElementById('ps_order_modal');
            if(!modal) return;
            const box=modal.querySelector('.psm');
            if(!box) return;

            /* Entrance animation */
            box.style.opacity='0';
            box.style.transform='scale(.85) translateY(30px)';
            box.style.transition='opacity .4s cubic-bezier(.34,1.56,.64,1),transform .4s cubic-bezier(.34,1.56,.64,1)';
            requestAnimationFrame(()=>{
                box.style.opacity='1';
                box.style.transform='scale(1) translateY(0)';
            });

            /* Apply holographic to box */
            applyHolographic(box);

            /* Apply ripple to submit btn */
            const submitBtn=box.querySelector('.psm-submit');
            if(submitBtn){
                applyRipple(submitBtn);
                applyMagnetic(submitBtn);
                applyNeonPulse(submitBtn,'#dc143c');
            }

            /* Input focus glow */
            box.querySelectorAll('.psm-inp').forEach(inp=>{
                inp.addEventListener('focus',()=>{
                    inp.style.boxShadow='0 0 0 2px rgba(220,20,60,.25),0 0 15px rgba(220,20,60,.1)';
                });
                inp.addEventListener('blur',()=>{inp.style.boxShadow='';});
            });

            /* Floating particles inside modal */
            const particles=Array.from({length:4},()=>{
                const p=document.createElement('div');
                p.style.cssText=`
                    position:absolute;width:2px;height:2px;border-radius:50%;
                    background:rgba(220,20,60,.15);pointer-events:none;z-index:0;
                    left:${Math.random()*100}%;top:${Math.random()*100}%;
                    animation:floatUp${Math.floor(Math.random()*3)} ${3+Math.random()*3}s ease-in-out infinite;
                    animation-delay:${Math.random()*2}s;
                `;
                box.appendChild(p);
                return p;
            });
            const fStyle=document.createElement('style');
            fStyle.textContent=`
                @keyframes floatUp0{0%,100%{transform:translate(0,0)}50%{transform:translate(5px,-15px)}}
                @keyframes floatUp1{0%,100%{transform:translate(0,0)}50%{transform:translate(-8px,-12px)}}
                @keyframes floatUp2{0%,100%{transform:translate(0,0)}50%{transform:translate(6px,-20px)}}
            `;
            document.head.appendChild(fStyle);

            /* Patch submit to fire confetti */
            const origSubmit=window.psSubmitOrder;
            window.psSubmitOrder=async function(sid){
                await origSubmit?.(sid);
                fxConfetti(window.innerWidth/2, window.innerHeight/3);
            };
        },50);
    };
}

/* ══════════════════════════════════════════════════
   13. SECTION HEADER GLOW LINE
══════════════════════════════════════════════════ */
function enhanceSectionHeaders(){
    document.querySelectorAll('.section-title').forEach(el=>{
        const line=document.createElement('div');
        line.style.cssText=`
            height:2px;background:linear-gradient(90deg,transparent,#dc143c,transparent);
            margin:.5rem auto 0;width:0;transition:width 1s ease;border-radius:1px;
        `;
        el.after(line);
        const obs=new IntersectionObserver(entries=>{
            if(entries[0].isIntersecting){ line.style.width='200px'; obs.disconnect(); }
        },{threshold:.5});
        obs.observe(el);
    });
}

/* ══════════════════════════════════════════════════
   14. HERO ANIMATED GRADIENT BG TEXT
══════════════════════════════════════════════════ */
function enhanceHero(){
    const h1=document.querySelector('.hero-title, h1.title, .profile-name, .hero h1');
    if(!h1) return;
    const s=document.createElement('style');
    s.textContent=`
    .fx-gradient-text{
        background:linear-gradient(90deg,#dc143c,#ff9800,#ffd700,#dc143c);
        background-size:300% auto;
        -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        animation:gradientMove 4s linear infinite;
    }
    @keyframes gradientMove{to{background-position:300% center}}
    `;
    document.head.appendChild(s);
    h1.classList.add('fx-gradient-text');
}

/* ══════════════════════════════════════════════════
   15. STATS SECTION — Live counters
══════════════════════════════════════════════════ */
function injectStats(){
    const srv=document.getElementById('services');
    if(!srv) return;
    const statsEl=document.createElement('div');
    statsEl.style.cssText=`
        display:flex;justify-content:center;gap:3rem;flex-wrap:wrap;
        padding:1.5rem 0;margin-bottom:1rem;
    `;
    const stats=[
        {val:25,label:'خدمة مجانية',suffix:''},
        {val:0,label:'طلب منجز',suffix:'+',id:'stat_done'},
        {val:100,label:'جودة',suffix:'%'},
        {val:24,label:'دعم فني',suffix:'/7'},
    ];
    statsEl.innerHTML=stats.map(s=>`
        <div style="text-align:center">
            <div id="${s.id||'stat_'+Math.random()}" style="font-size:2.2rem;font-weight:900;color:#dc143c;font-family:monospace;text-shadow:0 0 20px rgba(220,20,60,.4)">${s.val}${s.suffix}</div>
            <div style="color:#667788;font-size:.8rem;font-weight:600">${s.label}</div>
        </div>`).join('');
    srv.querySelector('.container')?.prepend(statsEl);

    /* Animate counters on scroll */
    const obs=new IntersectionObserver(entries=>{
        if(entries[0].isIntersecting){
            stats.forEach((s,i)=>{
                const el=statsEl.children[i]?.querySelector('div');
                if(el) setTimeout(()=>animateCounter(el,s.val,s.suffix),i*150);
            });
            obs.disconnect();
        }
    },{threshold:.3});
    obs.observe(statsEl);

    /* Update done counter from localStorage */
    const done=(window.psLoadRequests?.()|| []).filter(r=>r.status==='delivered'||r.status==='completed').length;
    const doneEl=document.getElementById('stat_done');
    if(doneEl&&done>0) animateCounter(doneEl,done,'+');
}

/* ══════════════════════════════════════════════════
   16. INIT ALL EFFECTS
══════════════════════════════════════════════════ */
function fxInit(){
    /* 3D tilt + holographic on service cards */
    document.querySelectorAll('.service-card,.ps-card').forEach(el=>{
        apply3DTilt(el);
        applyHolographic(el);
    });

    /* Magnetic effect on primary buttons */
    document.querySelectorAll('.service-btn,.ps-order-btn,.adm-btn-primary').forEach(applyMagnetic);

    /* Ripple on all buttons */
    document.querySelectorAll('button:not([style*="pointer-events:none"])').forEach(btn=>{
        if(btn.id!=='fx-cursor') applyRipple(btn);
    });

    /* Neon pulse on esports cards */
    document.querySelectorAll('.esports-card').forEach(el=>applyNeonPulse(el,'#ff9800'));

    /* Particles in paid section */
    const paidSec=document.getElementById('paid-services');
    if(paidSec) initParticlesBg(paidSec);

    /* Also particles in services section */
    const freeSec=document.getElementById('services');
    if(freeSec){ const cvDiv=document.createElement('div');cvDiv.style.cssText='position:absolute;inset:0;pointer-events:none';freeSec.style.position='relative';freeSec.style.overflow='hidden';initParticlesBg(cvDiv);freeSec.prepend(cvDiv); }

    /* Scroll reveal */
    initScrollReveal();

    /* Section headers glow */
    enhanceSectionHeaders();

    /* Hero text */
    enhanceHero();

    /* Stats */
    injectStats();

    /* Request modal effects */
    enhanceRequestModal();

    /* Typewriter on page subtitle if exists */
    const sub=document.querySelector('.hero-subtitle,.subtitle,.profile-bio');
    if(sub&&sub.textContent.trim().length>0){
        const original=sub.textContent.trim();
        sub.textContent='';
        applyTypewriter(sub,[original,'خدمات مجانية 100% 🆓','سكرمات ببجي احترافية 🎮','جودة عالية بدون تسجيل ✅']);
    }

    /* Observe DOM for dynamically added cards */
    new MutationObserver(mutations=>{
        mutations.forEach(m=>{
            m.addedNodes.forEach(n=>{
                if(n.nodeType===1){
                    n.querySelectorAll?.('.ps-card,.service-card').forEach(el=>{
                        if(!el.dataset.fxApplied){
                            el.dataset.fxApplied='1';
                            apply3DTilt(el);applyHolographic(el);
                        }
                    });
                    n.querySelectorAll?.('button').forEach(btn=>{
                        if(!btn.dataset.ripple){btn.dataset.ripple='1';applyRipple(btn);}
                    });
                }
            });
        });
    }).observe(document.body,{childList:true,subtree:true});

    console.log('%c✨ Effects.js — Fully Loaded','color:#ffd700;font-weight:900;background:#0a0000;padding:4px 10px;border-radius:4px');
}

/* Run after DOM is ready */
if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', ()=>setTimeout(fxInit,300));
} else {
    setTimeout(fxInit,300);
}