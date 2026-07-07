/* ================================================================
   admin-prices.js — Eyad_Eyad12
   إدارة شاملة لجميع أسعار الموقع من لوحة التحكم
================================================================ */

/* ════ Price data structure ════ */
const PRICE_SCHEMA = {
    pubg: {
        label: '💎 أسعار شحن PUBG Mobile',
        items: [
            { id:'p30',   label:'30 شدة',    selector:'.pricing-card:nth-child(1) .pricing-price',    btnSelector:'.pricing-card:nth-child(1) .pricing-btn', btnArg:'30' },
            { id:'p60',   label:'60 شدة',    selector:'.pricing-card:nth-child(2) .pricing-price',    btnSelector:'.pricing-card:nth-child(2) .pricing-btn', btnArg:'60' },
            { id:'p120',  label:'120 شدة',   selector:'.pricing-card:nth-child(3) .pricing-price',    btnSelector:'.pricing-card:nth-child(3) .pricing-btn', btnArg:'120' },
            { id:'p180',  label:'180 شدة',   selector:'.pricing-card:nth-child(4) .pricing-price',    btnSelector:'.pricing-card:nth-child(4) .pricing-btn', btnArg:'180' },
            { id:'p300',  label:'300 شدة',   selector:'.pricing-card:nth-child(5) .pricing-price',    btnSelector:'.pricing-card:nth-child(5) .pricing-btn', btnArg:'300' },
            { id:'p625',  label:'625 شدة',   selector:'.pricing-card:nth-child(6) .pricing-price',    btnSelector:'.pricing-card:nth-child(6) .pricing-btn', btnArg:'625' },
            { id:'p1065', label:'1065 شدة',  selector:'.pricing-card:nth-child(7) .pricing-price',    btnSelector:'.pricing-card:nth-child(7) .pricing-btn', btnArg:'1065' },
        ]
    },
    subscriptions: {
        label: '👑 أسعار باقات الاشتراك',
        items: [
            { id:'s1', label:'الباقة الأساسية',  selector:'.subscription-card:nth-child(1) .sub-price' },
            { id:'s2', label:'الباقة المميزة',   selector:'.subscription-card:nth-child(2) .sub-price' },
            { id:'s3', label:'الباقة الاحترافية',selector:'.subscription-card:nth-child(3) .sub-price' },
        ]
    },
};

/* Load saved prices or defaults */
function priceLoad() {
    try { return JSON.parse(localStorage.getItem('site_prices') || '{}'); } catch(_) { return {}; }
}
function priceSave(data) {
    localStorage.setItem('site_prices', JSON.stringify(data));
}

/* Apply prices to all DOM elements */
function priceApplyAll() {
    const saved = priceLoad();
    Object.values(PRICE_SCHEMA).forEach(group => {
        group.items.forEach(item => {
            const val = saved[item.id];
            if (!val) return;
            /* Update price display */
            document.querySelectorAll(item.selector).forEach(el => {
                el.textContent = val + ' IQD';
            });
            /* Update button onclick if applicable */
            if (item.btnSelector && item.btnArg) {
                document.querySelectorAll(item.btnSelector).forEach(btn => {
                    btn.onclick = () => window.openPurchaseModal?.(item.btnArg, val);
                });
            }
        });
    });
}

/* Run on page load */
document.addEventListener('DOMContentLoaded', priceApplyAll);
window.addEventListener('load', priceApplyAll);

/* ════ Inject Prices Tab into Admin ════ */
(function(){
    const obs = new MutationObserver(() => {
        const sidebar = document.querySelector('.adm-sidebar');
        if (sidebar && !sidebar.querySelector('[data-tab="adm-prices"]')) {
            /* Add nav item */
            const btn = document.createElement('button');
            btn.className = 'adm-nav-item';
            btn.dataset.tab = 'adm-prices';
            btn.innerHTML = '<i class="fas fa-tag"></i><span>إدارة الأسعار</span>';
            btn.onclick = () => admActivateTab?.('adm-prices', btn);
            sidebar.appendChild(btn);

            /* Add tab content */
            const main = document.querySelector('.adm-main');
            if (main && !document.getElementById('adm-pricesTab')) {
                const div = document.createElement('div');
                div.id = 'adm-pricesTab';
                div.className = 'admin-tab-content';
                div.innerHTML = admPricesHTML();
                main.appendChild(div);
                /* Load current values */
                setTimeout(priceLoadIntoAdmin, 100);
            }
        }
    });
    obs.observe(document.body, { childList:true, subtree:true });
})();

/* ════ Admin Prices HTML ════ */
function admPricesHTML(){
    return `
<div class="adm-page-title">
    <i class="fas fa-tag"></i>
    <h2>إدارة الأسعار</h2>
    <div style="margin-right:auto;display:flex;gap:.5rem">
        <button class="adm-btn adm-btn-primary" onclick="admPriceSaveAll()"><i class="fas fa-save"></i> حفظ الكل</button>
        <button class="adm-btn adm-btn-outline" onclick="admPriceReset()"><i class="fas fa-undo"></i> استعادة الافتراضي</button>
    </div>
</div>

<!-- Live preview bar -->
<div style="background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.25);border-radius:12px;padding:.7rem 1rem;margin-bottom:1.2rem;display:flex;align-items:center;gap:.6rem">
    <i class="fas fa-eye" style="color:#ffd700"></i>
    <span style="color:#ffd700;font-size:.82rem;font-weight:700">التعديلات تُطبَّق فوراً على الصفحة</span>
    <span style="color:#667788;font-size:.78rem;margin-right:auto">التغييرات تُحفظ تلقائياً</span>
</div>

<!-- PUBG Prices -->
<div class="adm-card">
    <div class="adm-card-title"><i class="fas fa-gem"></i> أسعار شحن PUBG Mobile</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.8rem" id="admPubgPriceGrid">
        ${PRICE_SCHEMA.pubg.items.map(item=>`
        <div style="background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:.8rem">
            <div style="color:#ffd700;font-weight:800;font-size:.85rem;margin-bottom:.4rem">💎 ${item.label}</div>
            <div style="display:flex;align-items:center;gap:.4rem">
                <input id="price_${item.id}" type="text" class="adm-inp" placeholder="مثال: 6,500"
                    oninput="admPricePreview('${item.id}','${item.selector}',this.value)"
                    style="flex:1">
                <span style="color:#667;font-size:.8rem;white-space:nowrap">IQD</span>
            </div>
            <div id="preview_${item.id}" style="color:#44ee55;font-size:.72rem;margin-top:.3rem;opacity:0;transition:opacity .3s"></div>
        </div>`).join('')}
    </div>
</div>

<!-- Subscription Prices -->
<div class="adm-card">
    <div class="adm-card-title"><i class="fas fa-crown"></i> أسعار باقات الاشتراك</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.8rem">
        ${PRICE_SCHEMA.subscriptions.items.map((item,i)=>`
        <div style="background:rgba(0,0,0,.3);border:1px solid rgba(220,20,60,.15);border-radius:12px;padding:.8rem">
            <div style="color:#dc143c;font-weight:800;font-size:.85rem;margin-bottom:.4rem">👑 ${item.label}</div>
            <div style="display:flex;align-items:center;gap:.4rem">
                <input id="price_${item.id}" type="text" class="adm-inp" placeholder="مثال: 25,000"
                    oninput="admPricePreview('${item.id}','${item.selector}',this.value)"
                    style="flex:1">
                <span style="color:#667;font-size:.8rem;white-space:nowrap">IQD</span>
            </div>
            <div id="preview_${item.id}" style="color:#44ee55;font-size:.72rem;margin-top:.3rem;opacity:0;transition:opacity .3s"></div>
        </div>`).join('')}
    </div>
</div>

<!-- Currency settings -->
<div class="adm-card">
    <div class="adm-card-title"><i class="fas fa-coins"></i> إعدادات العملة</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.8rem">
        <div>
            <label class="adm-label">رمز العملة</label>
            <input class="adm-inp" id="admCurrency" placeholder="IQD" value="IQD" oninput="admUpdateCurrency(this.value)">
        </div>
        <div>
            <label class="adm-label">تنسيق العرض</label>
            <select class="adm-select" id="admCurrencyPos" onchange="admUpdateCurrency()">
                <option value="after">السعر + العملة (مثال: 6,500 IQD)</option>
                <option value="before">العملة + السعر (مثال: IQD 6,500)</option>
            </select>
        </div>
    </div>
    <div class="adm-btn-row" style="margin-top:.8rem">
        <button class="adm-btn adm-btn-primary" onclick="admPriceSaveAll()"><i class="fas fa-save"></i> حفظ جميع التغييرات</button>
    </div>
</div>`;
}

function priceLoadIntoAdmin(){
    const saved = priceLoad();
    /* Set defaults if no saved data */
    const defaults = {
        p30:'6,500', p60:'12,500', p120:'24,000', p180:'35,000',
        p300:'56,000', p625:'112,000', p1065:'180,000',
        s1:'5,000', s2:'25,000', s3:'80,000'
    };
    const data = { ...defaults, ...saved };
    Object.entries(data).forEach(([id, val]) => {
        const inp = document.getElementById('price_' + id);
        if (inp) inp.value = val;
    });
}

function admPricePreview(id, selector, val){
    /* Live update on site */
    const cleanVal = val.trim();
    if (cleanVal) {
        document.querySelectorAll(selector).forEach(el => {
            el.textContent = cleanVal + ' IQD';
        });
        const prv = document.getElementById('preview_' + id);
        if (prv) {
            prv.textContent = '✓ معاينة: ' + cleanVal + ' IQD';
            prv.style.opacity = '1';
            setTimeout(() => { prv.style.opacity = '0'; }, 1800);
        }
    }
    /* Auto-save after 800ms */
    clearTimeout(admPricePreview._t);
    admPricePreview._t = setTimeout(admPriceSaveAll, 800);
}

function admPriceSaveAll(){
    const data = {};
    const allItems = [...PRICE_SCHEMA.pubg.items, ...PRICE_SCHEMA.subscriptions.items];
    allItems.forEach(item => {
        const inp = document.getElementById('price_' + item.id);
        if (inp?.value) data[item.id] = inp.value.trim();
    });
    priceSave(data);
    priceApplyAll();
    /* Toast */
    const t = document.createElement('div');
    t.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#dc143c;color:#fff;padding:9px 22px;border-radius:50px;font-weight:800;font-size:.88rem;z-index:99999;box-shadow:0 6px 20px rgba(220,20,60,.4)';
    t.textContent = '✅ تم حفظ جميع الأسعار وتطبيقها!';
    document.body.appendChild(t);
    setTimeout(()=>t.remove(), 2500);
}

function admPriceReset(){
    if (!confirm('استعادة الأسعار الافتراضية؟')) return;
    localStorage.removeItem('site_prices');
    priceLoadIntoAdmin();
    priceApplyAll();
}

function admUpdateCurrency(val){
    const cur = document.getElementById('admCurrency')?.value || 'IQD';
    document.querySelectorAll('.pricing-price, .sub-price').forEach(el => {
        const num = el.textContent.replace(/[^0-9,]/g,'').trim();
        if (num) el.textContent = num + ' ' + cur;
    });
}
