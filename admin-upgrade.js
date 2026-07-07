/* ================================================================
   admin-upgrade.js — Eyad_Eyad12
   لوحة تحكم احترافية — Professional Admin Dashboard
================================================================ */

/* ════ Wait for admin dashboard to open then inject ════ */
(function(){
    const observer = new MutationObserver(() => {
        const modal = document.getElementById('adminDashboard');
        if (!modal) return;
        if (modal.classList.contains('active') && !modal.dataset.upgraded) {
            modal.dataset.upgraded = '1';
            admBuild();
        }
        if (!modal.classList.contains('active')) {
            modal.removeAttribute('data-upgraded');
        }
    });
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });
})();

/* ════ Build the new admin layout ════ */
function admBuild() {
    const modal  = document.getElementById('adminDashboard');
    const wrap   = modal.querySelector('.admin-dashboard-content');
    if (!wrap) return;

    /* Inject top bar */
    let topbar = wrap.querySelector('.adm-topbar');
    if (!topbar) {
        topbar = document.createElement('div');
        topbar.className = 'adm-topbar';
        topbar.innerHTML = `
            <div class="adm-topbar-logo">
                <i class="fas fa-shield-alt"></i>
                <span>لوحة التحكم</span>
            </div>
            <span class="adm-topbar-badge"><i class="fas fa-user-shield"></i> مالك</span>
            <div class="adm-topbar-sep"></div>
            <span class="adm-topbar-time" id="admClock">--:--:--</span>
            <button class="adm-topbar-logout" onclick="adminLogout()"><i class="fas fa-sign-out-alt"></i> خروج</button>
            <button class="adm-topbar-close" onclick="closeAdminDashboard()">×</button>`;
        wrap.prepend(topbar);
    }

    /* Build body shell */
    let body = wrap.querySelector('.adm-body');
    if (!body) {
        body = document.createElement('div');
        body.className = 'adm-body';
        wrap.appendChild(body);
    }

    /* Build sidebar */
    let sidebar = body.querySelector('.adm-sidebar');
    if (!sidebar) {
        sidebar = document.createElement('div');
        sidebar.className = 'adm-sidebar';
        body.appendChild(sidebar);
    }
    sidebar.innerHTML = admSidebarHTML();

    /* Build main */
    let main = body.querySelector('.adm-main');
    if (!main) {
        main = document.createElement('div');
        main.className = 'adm-main';
        body.appendChild(main);
    }

    /* Move existing tab contents into main */
    document.querySelectorAll('.admin-tab-content').forEach(el => {
        if (!main.contains(el)) main.appendChild(el);
    });

    /* Inject new tabs */
    admInjectNewTabs(main);

    /* Show dashboard by default */
    admActivateTab('adm-dashboard');

    /* Clock */
    admClock();
    setInterval(admClock, 1000);
}

function admClock() {
    const el = document.getElementById('admClock');
    if (el) el.textContent = new Date().toLocaleTimeString('ar');
}

/* ════ SIDEBAR HTML ════ */
function admSidebarHTML() {
    const navGroups = [
        { label: 'الرئيسية', items: [
            { icon:'fa-tachometer-alt', text:'الداشبورد', tab:'adm-dashboard', badge:'' },
        ]},
        { label: 'إدارة', items: [
            { icon:'fa-shopping-bag',  text:'الطلبات',    tab:'orders',       badge: admGetCount('orders') },
            { icon:'fa-envelope',      text:'الرسائل',    tab:'messages',     badge: admGetCount('messages') },
            { icon:'fa-users',         text:'المستخدمون', tab:'allusers',      badge:'' },
            { icon:'fa-star',          text:'الآراء',      tab:'reviews',      badge:'' },
        ]},
        { label: 'المحتوى', items: [
            { icon:'fa-gamepad',       text:'اليرتات',    tab:'alerts_admin',  badge:'' },
            { icon:'fa-tags',          text:'العروض',     tab:'offers',        badge:'' },
            { icon:'fa-clock',         text:'العدادات',   tab:'timers',        badge:'' },
            { icon:'fa-gem',           text:'الباقات',    tab:'packages',      badge:'' },
        ]},
        { label: 'التحليل', items: [
            { icon:'fa-chart-bar',     text:'الخدمات',    tab:'services',      badge:'' },
            { icon:'fa-chart-pie',     text:'الإحصائيات', tab:'stats',         badge:'' },
        ]},
        { label: 'الإعدادات', items: [
            { icon:'fa-sliders-h',     text:'تحكم الموقع',tab:'sitecontrol',   badge:'' },
            { icon:'fa-palette',       text:'المظهر',     tab:'adm-appearance',badge:'' },
            { icon:'fa-bullhorn',      text:'الإشعارات',  tab:'adm-notify',    badge:'' },
            { icon:'fa-tools',         text:'الأدوات',    tab:'adm-tools',     badge:'' },
            { icon:'fa-save',          text:'النسخ الاحتياطي',tab:'adm-backup',badge:'' },
        ]},
    ];

    return navGroups.map(g => `
        <div class="adm-nav-section">${g.label}</div>
        ${g.items.map(item => `
        <button class="adm-nav-item" onclick="admActivateTab('${item.tab}',this)" data-tab="${item.tab}">
            <i class="fas ${item.icon}"></i>
            <span>${item.text}</span>
            ${item.badge && item.badge !== '0' ? `<span class="adm-nav-badge">${item.badge}</span>` : ''}
        </button>`).join('')}
    `).join('');
}

function admGetCount(key) {
    try {
        const d = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(d) ? String(d.length) : '0';
    } catch(_) { return '0'; }
}

/* ════ ACTIVATE TAB ════ */
function admActivateTab(tabName, btn) {
    /* deactivate all */
    document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.remove('adm-visible'));
    document.querySelectorAll('.adm-nav-item').forEach(b => b.classList.remove('active'));

    /* activate target */
    const tabEl = document.getElementById(tabName + 'Tab') ||
                  document.getElementById(tabName);
    if (tabEl) tabEl.classList.add('adm-visible');

    if (btn) btn.classList.add('active');
    else {
        const navBtn = document.querySelector(`.adm-nav-item[data-tab="${tabName}"]`);
        if (navBtn) navBtn.classList.add('active');
    }

    /* Load dynamic content */
    if (tabName === 'adm-dashboard') admLoadDashboard();
    if (tabName === 'adm-appearance') admLoadAppearance();
}

/* ════ INJECT NEW TABS ════ */
function admInjectNewTabs(main) {
    /* Dashboard Tab */
    if (!document.getElementById('adm-dashboardTab')) {
        const div = document.createElement('div');
        div.id = 'adm-dashboardTab';
        div.className = 'admin-tab-content';
        div.innerHTML = admDashboardHTML();
        main.prepend(div);
    }
    /* Appearance Tab */
    if (!document.getElementById('adm-appearanceTab')) {
        const div = document.createElement('div');
        div.id = 'adm-appearanceTab';
        div.className = 'admin-tab-content';
        div.innerHTML = admAppearanceHTML();
        main.appendChild(div);
    }
    /* Notify Tab */
    if (!document.getElementById('adm-notifyTab')) {
        const div = document.createElement('div');
        div.id = 'adm-notifyTab';
        div.className = 'admin-tab-content';
        div.innerHTML = admNotifyHTML();
        main.appendChild(div);
    }
    /* Tools Tab */
    if (!document.getElementById('adm-toolsTab')) {
        const div = document.createElement('div');
        div.id = 'adm-toolsTab';
        div.className = 'admin-tab-content';
        div.innerHTML = admToolsHTML();
        main.appendChild(div);
    }
    /* Backup Tab */
    if (!document.getElementById('adm-backupTab')) {
        const div = document.createElement('div');
        div.id = 'adm-backupTab';
        div.className = 'admin-tab-content';
        div.innerHTML = admBackupHTML();
        main.appendChild(div);
    }
}

/* ════ DASHBOARD TAB ════ */
function admDashboardHTML() {
    return `
    <div class="adm-page-title">
        <i class="fas fa-tachometer-alt"></i>
        <h2>الداشبورد</h2>
    </div>

    <!-- Stats -->
    <div class="adm-stats-grid" id="admStatsGrid"></div>

    <!-- Quick Actions -->
    <div class="adm-card">
        <div class="adm-card-title"><i class="fas fa-bolt"></i> إجراءات سريعة</div>
        <div class="adm-quick-grid">
            <button class="adm-quick-btn" onclick="admActivateTab('allusers')"><i class="fas fa-user-plus"></i><span>إضافة مستخدم</span></button>
            <button class="adm-quick-btn" onclick="admActivateTab('alerts_admin')"><i class="fas fa-gamepad"></i><span>إدارة اليرتات</span></button>
            <button class="adm-quick-btn" onclick="admActivateTab('offers')"><i class="fas fa-tags"></i><span>إضافة عرض</span></button>
            <button class="adm-quick-btn" onclick="admActivateTab('adm-notify')"><i class="fas fa-bell"></i><span>إرسال إشعار</span></button>
            <button class="adm-quick-btn" onclick="admActivateTab('sitecontrol')"><i class="fas fa-palette"></i><span>تحكم الموقع</span></button>
            <button class="adm-quick-btn" onclick="admActivateTab('adm-backup')"><i class="fas fa-save"></i><span>نسخ احتياطي</span></button>
            <button class="adm-quick-btn" onclick="exportOrders?.()"><i class="fas fa-file-excel"></i><span>تصدير الطلبات</span></button>
            <button class="adm-quick-btn" onclick="admActivateTab('stats')"><i class="fas fa-chart-line"></i><span>الإحصائيات</span></button>
        </div>
    </div>

    <!-- Recent Orders -->
    <div class="adm-card">
        <div class="adm-card-title">
            <i class="fas fa-shopping-bag"></i> آخر الطلبات
            <div class="adm-card-actions">
                <button class="adm-btn adm-btn-outline" style="padding:4px 12px;font-size:.78rem" onclick="admActivateTab('orders')">عرض الكل</button>
            </div>
        </div>
        <div class="adm-table-wrap"><table class="adm-table"><thead><tr><th>#</th><th>الاسم</th><th>الخدمة</th><th>الحالة</th><th>التاريخ</th></tr></thead>
        <tbody id="admRecentOrders"></tbody></table></div>
    </div>

    <!-- Recent Users -->
    <div class="adm-card">
        <div class="adm-card-title">
            <i class="fas fa-users"></i> آخر المستخدمين
            <div class="adm-card-actions">
                <button class="adm-btn adm-btn-outline" style="padding:4px 12px;font-size:.78rem" onclick="admActivateTab('allusers')">عرض الكل</button>
            </div>
        </div>
        <div id="admRecentUsers" style="display:flex;flex-wrap:wrap;gap:.6rem"></div>
    </div>`;
}

function admLoadDashboard() {
    /* Stats */
    const stats = [
        { icon:'fa-shopping-bag', label:'الطلبات',      val: admGetCount('orders'),    color:'rgba(220,20,60,.15)',  icolor:'#dc143c' },
        { icon:'fa-envelope',     label:'الرسائل',       val: admGetCount('messages'),  color:'rgba(0,229,255,.12)',  icolor:'#00e5ff' },
        { icon:'fa-users',        label:'المستخدمون',    val: admGetUsersCount(),        color:'rgba(68,238,85,.12)', icolor:'#44ee55' },
        { icon:'fa-star',         label:'الآراء',        val: admGetCount('reviews'),    color:'rgba(255,215,0,.12)', icolor:'#ffd700' },
        { icon:'fa-gamepad',      label:'اليرتات',       val: admGetCount('alerts'),     color:'rgba(168,85,247,.12)',icolor:'#a855f7' },
        { icon:'fa-chart-bar',    label:'استخدام الخدمات',val: admGetServiceUsage(),    color:'rgba(255,107,53,.12)',icolor:'#ff6b35' },
    ];

    const grid = document.getElementById('admStatsGrid');
    if (grid) {
        grid.innerHTML = stats.map(s => `
            <div class="adm-stat-card" style="--sc:${s.color};--si:${s.icolor}">
                <div class="adm-stat-icon"><i class="fas ${s.icon}"></i></div>
                <div class="adm-stat-val">${s.val}</div>
                <div class="adm-stat-lbl">${s.label}</div>
            </div>`).join('');
    }

    /* Recent orders */
    const ordEl = document.getElementById('admRecentOrders');
    if (ordEl) {
        try {
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            ordEl.innerHTML = orders.slice(-5).reverse().map((o, i) => `
                <tr>
                    <td>${i+1}</td>
                    <td>${o.name || '—'}</td>
                    <td>${o.amount || o.service || '—'}</td>
                    <td><span class="adm-badge ${o.status==='completed'?'ok':o.status==='pending'?'warn':'info'}">${o.status||'جديد'}</span></td>
                    <td style="font-size:.78rem;color:#667">${(o.date||'').slice(0,10)}</td>
                </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:#556">لا توجد طلبات</td></tr>';
        } catch(_) { ordEl.innerHTML = '<tr><td colspan="5" style="color:#556;text-align:center">لا يوجد</td></tr>'; }
    }

    /* Recent users */
    const usrEl = document.getElementById('admRecentUsers');
    if (usrEl) {
        try {
            const users = JSON.parse(localStorage.getItem('siteUsers') || '[]');
            usrEl.innerHTML = users.slice(-8).map(u => `
                <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:.5rem .8rem;display:flex;align-items:center;gap:.5rem">
                    <span style="font-size:1rem">👤</span>
                    <div>
                        <div style="color:#fff;font-size:.82rem;font-weight:700">${u.username||'—'}</div>
                        <div style="color:#667;font-size:.7rem">${u.subscriptionType||'مستخدم'}</div>
                    </div>
                </div>`).join('') || '<div style="color:#556">لا توجد مستخدمون</div>';
        } catch(_) { usrEl.innerHTML = '<div style="color:#556">لا يوجد</div>'; }
    }
}

function admGetUsersCount() {
    try { return String(JSON.parse(localStorage.getItem('siteUsers')||'[]').length); }
    catch(_) { return '0'; }
}
function admGetServiceUsage() {
    try {
        const logs = JSON.parse(localStorage.getItem('serviceLogs') || '[]');
        return String(logs.length);
    } catch(_) { return '0'; }
}

/* ════ APPEARANCE TAB ════ */
function admAppearanceHTML() {
    return `
    <div class="adm-page-title"><i class="fas fa-palette"></i><h2>المظهر والثيم</h2></div>

    <!-- Theme Colors -->
    <div class="adm-card">
        <div class="adm-card-title"><i class="fas fa-circle"></i> الألوان السريعة</div>
        <p style="color:#667788;font-size:.82rem;margin-bottom:.8rem">اضغط على لون لتطبيقه فوراً</p>
        <div class="adm-theme-presets" id="admThemePresets">
            ${[['#dc143c','أحمر'],['#e91e63','زهري'],['#9c27b0','بنفسجي'],['#673ab7','ليلكي'],
               ['#2196f3','أزرق'],['#00bcd4','سماوي'],['#009688','فيروزي'],['#4caf50','أخضر'],
               ['#ff9800','برتقالي'],['#ff5722','برتقالي داكن'],['#ffd700','ذهبي'],['#ffffff','أبيض']
            ].map(([c,n]) => `<div class="adm-theme-swatch" style="background:${c}" title="${n}" onclick="admApplyTheme('${c}',this)"></div>`).join('')}
        </div>
        <div class="adm-form-grid" style="margin-top:.8rem">
            <div class="adm-form-group">
                <label>لون مخصص</label>
                <input type="color" class="adm-color-inp" id="admCustomColor" value="#dc143c" oninput="admApplyTheme(this.value,null)">
            </div>
            <div class="adm-form-group">
                <label>شدة التوهج</label>
                <input type="range" min="0" max="100" value="60" style="width:100%;accent-color:#dc143c" id="admGlowIntensity" oninput="admApplyGlow(this.value)">
            </div>
        </div>
    </div>

    <!-- Background -->
    <div class="adm-card">
        <div class="adm-card-title"><i class="fas fa-star"></i> الخلفية والتأثيرات</div>
        <div class="adm-form-grid">
            <div class="adm-form-group">
                <label>لون الخلفية الرئيسي</label>
                <input type="color" class="adm-color-inp" id="admBgColor" value="#050510" oninput="admApplyBg(this.value)">
            </div>
            <div class="adm-form-group">
                <label>كثافة النجوم</label>
                <select class="adm-select" onchange="admSetStars(this.value)">
                    <option value="200">كثير جداً (200)</option>
                    <option value="100" selected>كثير (100)</option>
                    <option value="50">متوسط (50)</option>
                    <option value="0">إيقاف</option>
                </select>
            </div>
        </div>
        <div class="adm-btn-row">
            <button class="adm-btn adm-btn-primary" onclick="admSaveAppearance()"><i class="fas fa-save"></i> حفظ التغييرات</button>
            <button class="adm-btn adm-btn-outline" onclick="admResetAppearance()"><i class="fas fa-undo"></i> استعادة الافتراضي</button>
        </div>
    </div>

    <!-- Typography -->
    <div class="adm-card">
        <div class="adm-card-title"><i class="fas fa-font"></i> الخط والنصوص</div>
        <div class="adm-form-grid">
            <div class="adm-form-group">
                <label>حجم الخط الأساسي</label>
                <input type="range" min="12" max="20" value="16" style="width:100%;accent-color:#dc143c" id="admFontSize" oninput="admApplyFont(this.value)">
            </div>
            <div class="adm-form-group">
                <label>نوع الخط</label>
                <select class="adm-select" id="admFontFamily" onchange="admApplyFontFamily(this.value)">
                    <option value="'Segoe UI', sans-serif">Segoe UI (افتراضي)</option>
                    <option value="'Cairo', sans-serif">Cairo (عربي)</option>
                    <option value="'Tajawal', sans-serif">Tajawal</option>
                    <option value="'IBM Plex Sans Arabic', sans-serif">IBM Plex Arabic</option>
                </select>
            </div>
        </div>
    </div>`;
}

function admLoadAppearance() {
    const saved = JSON.parse(localStorage.getItem('admAppearance') || '{}');
    if (saved.color) {
        document.getElementById('admCustomColor').value = saved.color;
        document.querySelector(`.adm-theme-swatch[style*="${saved.color}"]`)?.classList.add('active');
    }
    if (saved.bgColor) document.getElementById('admBgColor').value = saved.bgColor;
}

function admApplyTheme(color, swatchEl) {
    document.querySelectorAll('.adm-theme-swatch').forEach(s => s.classList.remove('active'));
    if (swatchEl) swatchEl.classList.add('active');
    document.getElementById('admCustomColor').value = color;
    /* Apply to site CSS vars */
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--secondary', color + 'cc');
    /* Apply to text primary-color */
    document.querySelectorAll('[style*="color: var(--primary)"]').forEach(el => {
        el.style.color = color;
    });
    try { window.applyPrimaryColor?.(color); } catch(_) {}
}

function admApplyGlow(v) {
    document.documentElement.style.setProperty('--glow-intensity', (v/100).toFixed(2));
}

function admApplyBg(color) {
    document.body.style.background = color;
}

function admApplyFont(size) {
    document.documentElement.style.fontSize = size + 'px';
}

function admApplyFontFamily(family) {
    document.documentElement.style.fontFamily = family;
}

function admSetStars(count) {
    const stars = document.getElementById('stars');
    if (!stars) return;
    stars.innerHTML = '';
    for (let i = 0; i < +count; i++) {
        const s = document.createElement('div');
        s.className = 'star';
        s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*3}s;animation-duration:${2+Math.random()*3}s`;
        stars.appendChild(s);
    }
}

function admSaveAppearance() {
    const data = {
        color   : document.getElementById('admCustomColor').value,
        bgColor : document.getElementById('admBgColor').value,
        fontSize: document.getElementById('admFontSize')?.value,
        font    : document.getElementById('admFontFamily')?.value,
    };
    localStorage.setItem('admAppearance', JSON.stringify(data));
    /* Also save to sitecontrol */
    const sc = JSON.parse(localStorage.getItem('siteControl') || '{}');
    sc.primaryColor = data.color;
    localStorage.setItem('siteControl', JSON.stringify(sc));
    admToast('✅ تم حفظ المظهر!', 'ok');
}

function admResetAppearance() {
    admApplyTheme('#dc143c', null);
    admToast('↩️ تم الاستعادة', 'warn');
}

/* ════ NOTIFY TAB ════ */
function admNotifyHTML() {
    return `
    <div class="adm-page-title"><i class="fas fa-bullhorn"></i><h2>الإشعارات والإعلانات</h2></div>

    <!-- Popup Notification -->
    <div class="adm-card">
        <div class="adm-card-title"><i class="fas fa-bell"></i> إشعار منبثق للمستخدمين</div>
        <div class="adm-form-grid">
            <div class="adm-form-group">
                <label>عنوان الإشعار</label>
                <input class="adm-inp" id="notif_title" placeholder="مثال: عرض جديد!">
            </div>
            <div class="adm-form-group">
                <label>نوع الإشعار</label>
                <select class="adm-select" id="notif_type">
                    <option value="info">معلومات 💙</option>
                    <option value="success">نجاح 💚</option>
                    <option value="warning">تحذير 🟡</option>
                    <option value="error">خطأ ❤️</option>
                </select>
            </div>
            <div class="adm-form-group" style="grid-column:1/-1">
                <label>نص الإشعار</label>
                <input class="adm-inp" id="notif_text" placeholder="نص الإشعار...">
            </div>
        </div>
        <div class="adm-notif-preview">
            <div class="adm-notif-preview-icon">🔔</div>
            <div>
                <h5 id="notif_preview_title">عنوان الإشعار</h5>
                <p id="notif_preview_text">نص الإشعار سيظهر هنا...</p>
            </div>
        </div>
        <div class="adm-btn-row">
            <button class="adm-btn adm-btn-primary" onclick="admSendNotif()"><i class="fas fa-paper-plane"></i> إرسال الإشعار الآن</button>
        </div>
        <script>
        document.getElementById('notif_title')?.addEventListener('input',e=>{ const el=document.getElementById('notif_preview_title'); if(el)el.textContent=e.target.value||'عنوان الإشعار'; });
        document.getElementById('notif_text')?.addEventListener('input',e=>{ const el=document.getElementById('notif_preview_text'); if(el)el.textContent=e.target.value||'النص...'; });
        </script>
    </div>

    <!-- Announcement Bar -->
    <div class="adm-card">
        <div class="adm-card-title"><i class="fas fa-marquee"></i> شريط الإعلانات العلوي</div>
        <div class="adm-form-group" style="margin-bottom:.8rem">
            <label>نص الإعلان (يمكن إضافة عدة بـ | للفصل)</label>
            <input class="adm-inp" id="ticker_text" value="🔥 عروض حصرية! احصل على أفضل خدمات المحتوى | ✅ تقطيع وتحويل وتحرير فيديو احترافي" oninput="admUpdateTickerPreview()">
        </div>
        <div class="adm-announce-preview" id="tickerPreview">🔥 عروض حصرية! احصل على أفضل خدمات المحتوى</div>
        <div class="adm-btn-row">
            <button class="adm-btn adm-btn-primary" onclick="admSaveTicker()"><i class="fas fa-save"></i> تطبيق الإعلان</button>
            <button class="adm-btn adm-btn-outline" onclick="admToggleTicker()"><i class="fas fa-eye"></i> إخفاء / إظهار</button>
        </div>
    </div>

    <!-- Site Message -->
    <div class="adm-card">
        <div class="adm-card-title"><i class="fas fa-comment-dots"></i> رسالة الموقع العالمية</div>
        <div class="adm-form-group" style="margin-bottom:.8rem">
            <label>نص الرسالة</label>
            <input class="adm-inp" id="global_msg" placeholder="رسالة تظهر لجميع المستخدمين...">
        </div>
        <div class="adm-form-grid">
            <div class="adm-form-group">
                <label>لون الرسالة</label>
                <select class="adm-select" id="global_msg_type">
                    <option value="info">معلومات</option><option value="success">نجاح</option>
                    <option value="warning">تحذير</option>
                </select>
            </div>
            <div class="adm-form-group">
                <label>مدة العرض (ثانية)</label>
                <input class="adm-inp" id="global_msg_dur" type="number" value="5">
            </div>
        </div>
        <div class="adm-btn-row">
            <button class="adm-btn adm-btn-primary" onclick="admSendGlobalMsg()"><i class="fas fa-broadcast-tower"></i> بث الرسالة</button>
        </div>
    </div>`;
}

function admSendNotif() {
    const title = document.getElementById('notif_title')?.value;
    const text  = document.getElementById('notif_text')?.value;
    const type  = document.getElementById('notif_type')?.value;
    if (!title || !text) { admToast('⚠️ أدخل العنوان والنص', 'warn'); return; }
    /* Store in localStorage so users see it */
    localStorage.setItem('pendingNotif', JSON.stringify({ title, text, type, ts: Date.now() }));
    admToast('✅ تم بث الإشعار!', 'ok');
    admShowSiteNotif(title, text, type);
}

function admShowSiteNotif(title, text, type) {
    const colors = { info:'#00e5ff', success:'#44ee55', warning:'#ffd700', error:'#ff4444' };
    const n = document.createElement('div');
    n.style.cssText = `position:fixed;top:20px;right:20px;background:linear-gradient(135deg,#0a1628,#0f1f3c);border:1.5px solid ${colors[type]||'#00e5ff'};border-radius:14px;padding:14px 18px;z-index:99999;max-width:320px;box-shadow:0 10px 30px rgba(0,0,0,.6);animation:admFadeIn .3s ease`;
    n.innerHTML = `<div style="color:${colors[type]};font-weight:800;margin-bottom:4px">${title}</div><div style="color:#aaa;font-size:.85rem">${text}</div>`;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 4000);
}

function admUpdateTickerPreview() {
    const el = document.getElementById('tickerPreview');
    if (el) el.textContent = document.getElementById('ticker_text')?.value || '';
}

function admSaveTicker() {
    const text = document.getElementById('ticker_text')?.value;
    const ticker = document.querySelector('.ticker-text, .notification-bar, [class*="ticker"]');
    if (ticker) ticker.textContent = text;
    localStorage.setItem('admTickerText', text);
    admToast('✅ تم تحديث شريط الإعلانات', 'ok');
}

function admToggleTicker() {
    const ticker = document.querySelector('.ticker-text, .notification-bar, [class*="ticker"], [class*="scroll"]');
    if (ticker) {
        ticker.closest('section,div')?.style.setProperty('display',
            ticker.closest('section,div')?.style.display === 'none' ? '' : 'none');
    }
}

function admSendGlobalMsg() {
    const text = document.getElementById('global_msg')?.value;
    const dur  = parseInt(document.getElementById('global_msg_dur')?.value || 5);
    if (!text) { admToast('⚠️ أدخل نص الرسالة', 'warn'); return; }
    admShowSiteNotif('📢 رسالة من الإدارة', text, 'info');
    admToast('✅ تم بث الرسالة', 'ok');
}

/* ════ TOOLS TAB ════ */
function admToolsHTML() {
    return `
    <div class="adm-page-title"><i class="fas fa-tools"></i><h2>أدوات المدير</h2></div>

    <!-- Search users -->
    <div class="adm-card">
        <div class="adm-card-title"><i class="fas fa-search"></i> بحث سريع عن مستخدم</div>
        <div class="adm-search">
            <input class="adm-search-inp" id="admUserSearch" placeholder="ابحث باسم المستخدم...">
            <button class="adm-search-btn" onclick="admSearchUser()"><i class="fas fa-search"></i> بحث</button>
        </div>
        <div id="admUserSearchResult"></div>
    </div>

    <!-- System Info -->
    <div class="adm-card">
        <div class="adm-card-title"><i class="fas fa-server"></i> معلومات النظام</div>
        <div class="adm-form-grid" id="admSysInfo"></div>
    </div>

    <!-- Storage usage -->
    <div class="adm-card">
        <div class="adm-card-title"><i class="fas fa-hdd"></i> استخدام التخزين المحلي</div>
        <div id="admStorageInfo"></div>
        <div class="adm-btn-row" style="margin-top:.8rem">
            <button class="adm-btn adm-btn-danger" onclick="admClearCache()"><i class="fas fa-trash"></i> مسح البيانات المؤقتة</button>
        </div>
    </div>

    <!-- Quick Links -->
    <div class="adm-card">
        <div class="adm-card-title"><i class="fas fa-link"></i> روابط سريعة</div>
        <div class="adm-quick-grid">
            <button class="adm-quick-btn" onclick="window.open('https://console.firebase.google.com','_blank')"><i class="fas fa-database" style="color:#ffa000"></i><span>Firebase</span></button>
            <button class="adm-quick-btn" onclick="window.open('https://analytics.google.com','_blank')"><i class="fas fa-chart-line" style="color:#4285f4"></i><span>Analytics</span></button>
            <button class="adm-quick-btn" onclick="window.open('https://api.anthropic.com','_blank')"><i class="fas fa-robot" style="color:#a855f7"></i><span>Claude API</span></button>
            <button class="adm-quick-btn" onclick="admRefreshPage()"><i class="fas fa-sync" style="color:#44ee55"></i><span>تحديث الصفحة</span></button>
        </div>
    </div>`;
}

function admSearchUser() {
    const q   = document.getElementById('admUserSearch')?.value?.toLowerCase();
    const res = document.getElementById('admUserSearchResult');
    if (!q || !res) return;
    try {
        const users = JSON.parse(localStorage.getItem('siteUsers') || '[]');
        const found = users.filter(u => u.username?.toLowerCase().includes(q));
        if (!found.length) { res.innerHTML = '<p style="color:#667;font-size:.85rem">لا نتائج</p>'; return; }
        res.innerHTML = found.map(u => `
            <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:.7rem 1rem;margin-top:.5rem;display:flex;align-items:center;gap:1rem">
                <span style="font-size:1.4rem">👤</span>
                <div style="flex:1">
                    <div style="color:#fff;font-weight:700">${u.username}</div>
                    <div style="color:#667;font-size:.78rem">${u.subscriptionType||'—'} • ينتهي: ${u.expiryDate||'—'}</div>
                </div>
                <span class="adm-badge ${u.isActive?'ok':'danger'}">${u.isActive?'نشط':'منتهي'}</span>
            </div>`).join('');
    } catch(_) { res.innerHTML = '<p style="color:#667">خطأ</p>'; }
}

function admRefreshPage() {
    if (confirm('هل تريد تحديث الصفحة؟')) location.reload();
}

function admClearCache() {
    if (!confirm('مسح البيانات المؤقتة؟ (الطلبات والمستخدمين ستبقى)')) return;
    ['serviceLogs','admAppearance','pendingNotif','admTickerText'].forEach(k => localStorage.removeItem(k));
    admToast('✅ تم المسح', 'ok');
}

/* ════ BACKUP TAB ════ */
function admBackupHTML() {
    return `
    <div class="adm-page-title"><i class="fas fa-save"></i><h2>النسخ الاحتياطي</h2></div>

    <div class="adm-backup-grid">
        <div class="adm-card">
            <div class="adm-card-title"><i class="fas fa-download"></i> تصدير</div>
            <div class="adm-backup-card">
                <i class="fas fa-file-archive" style="color:#ffd700"></i>
                <h4>تصدير كل البيانات</h4>
                <p>تصدير الطلبات والمستخدمين واليرتات والإعدادات كملف JSON</p>
                <button class="adm-btn adm-btn-primary" onclick="admExportAll()"><i class="fas fa-download"></i> تصدير JSON</button>
            </div>
            <div style="height:.6rem"></div>
            <div class="adm-backup-card">
                <i class="fas fa-file-csv" style="color:#44ee55"></i>
                <h4>تصدير الطلبات CSV</h4>
                <p>تصدير الطلبات فقط بصيغة Excel</p>
                <button class="adm-btn adm-btn-success" onclick="exportOrders?.()"><i class="fas fa-file-excel"></i> تصدير CSV</button>
            </div>
        </div>
        <div class="adm-card">
            <div class="adm-card-title"><i class="fas fa-upload"></i> استيراد</div>
            <div class="adm-backup-card">
                <i class="fas fa-file-import" style="color:#00e5ff"></i>
                <h4>استيراد نسخة احتياطية</h4>
                <p>استعادة البيانات من ملف JSON تم تصديره مسبقاً</p>
                <input type="file" id="admImportFile" accept=".json" style="display:none" onchange="admImportBackup(this)">
                <button class="adm-btn adm-btn-outline" onclick="document.getElementById('admImportFile').click()"><i class="fas fa-upload"></i> اختر ملف JSON</button>
            </div>
            <div style="height:.6rem"></div>
            <div class="adm-backup-card">
                <i class="fas fa-trash-alt" style="color:#ff4444"></i>
                <h4>حذف جميع البيانات</h4>
                <p>⚠️ خطير — يحذف كل شيء نهائياً</p>
                <button class="adm-btn adm-btn-danger" onclick="admNukeAll()"><i class="fas fa-skull-crossbones"></i> حذف الكل</button>
            </div>
        </div>
    </div>

    <!-- Backup Status -->
    <div class="adm-card">
        <div class="adm-card-title"><i class="fas fa-info-circle"></i> حالة البيانات</div>
        <div id="admBackupStatus" class="adm-form-grid"></div>
    </div>`;
}

function admExportAll() {
    const keys = ['orders','messages','reviews','siteUsers','alerts','packages','offers','siteControl','admAppearance','serviceLogs'];
    const data = {};
    keys.forEach(k => {
        try { data[k] = JSON.parse(localStorage.getItem(k) || 'null'); } catch(_) {}
    });
    data._exported = new Date().toISOString();
    data._version  = '2.0';

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `malti-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    admToast('✅ تم تصدير النسخة الاحتياطية', 'ok');
}

function admImportBackup(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            if (!data._version) { admToast('⚠️ ملف غير صالح', 'warn'); return; }
            if (!confirm(`هل تريد استيراد النسخة الاحتياطية من ${data._exported?.slice(0,10)}؟`)) return;
            Object.entries(data).forEach(([k, v]) => {
                if (k.startsWith('_')) return;
                localStorage.setItem(k, JSON.stringify(v));
            });
            admToast('✅ تم الاستيراد! جارٍ التحديث...', 'ok');
            setTimeout(() => location.reload(), 1500);
        } catch(_) { admToast('❌ ملف تالف', 'danger'); }
    };
    reader.readAsText(file);
}

function admNukeAll() {
    const confirm1 = confirm('⚠️ هذا الإجراء خطير جداً! هل أنت متأكد من حذف كل البيانات؟');
    if (!confirm1) return;
    const confirm2 = prompt('اكتب "احذف كل شيء" للتأكيد:');
    if (confirm2 !== 'احذف كل شيء') { admToast('تم الإلغاء', 'ok'); return; }
    localStorage.clear();
    admToast('🗑️ تم حذف كل البيانات', 'warn');
    setTimeout(() => location.reload(), 1500);
}

/* ════ TOAST NOTIFICATION ════ */
function admToast(msg, type) {
    const colors = { ok:'#44ee55', warn:'#ffd700', danger:'#ff4444', info:'#00e5ff' };
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:linear-gradient(135deg,#0a1628,#0f1f3c);border:1.5px solid ${colors[type]||'#00e5ff'};border-radius:50px;padding:10px 24px;z-index:999999;color:${colors[type]||'#fff'};font-weight:700;font-size:.88rem;box-shadow:0 8px 24px rgba(0,0,0,.6);transition:all .3s;opacity:0`;
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2800);
}

/* Load system info when tools tab shown */
document.addEventListener('click', e => {
    if (e.target?.closest?.('[data-tab="adm-tools"]')) {
        setTimeout(() => {
            const sys = document.getElementById('admSysInfo');
            if (sys) sys.innerHTML = [
                ['المتصفح', navigator.userAgent.split(')')[0].split('(')[0].trim()],
                ['الدقة', `${screen.width}×${screen.height}`],
                ['اللغة', navigator.language],
                ['الذاكرة', navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'غير متوفر'],
                ['الاتصال', navigator.onLine ? '✅ متصل' : '❌ غير متصل'],
                ['التخزين', Object.keys(localStorage).length + ' مفتاح'],
            ].map(([k,v]) => `
                <div class="adm-form-group">
                    <label>${k}</label>
                    <div style="background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:7px 10px;color:#ccc;font-size:.82rem">${v}</div>
                </div>`).join('');

            const sto = document.getElementById('admStorageInfo');
            if (sto) {
                let total = 0;
                const items = Object.keys(localStorage).map(k => {
                    const sz = (localStorage.getItem(k)||'').length;
                    total += sz;
                    return { key: k, sz };
                }).sort((a,b) => b.sz - a.sz).slice(0, 8);
                sto.innerHTML = items.map(it => `
                    <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.4rem">
                        <span style="color:#aaa;font-size:.8rem;flex:1;font-family:monospace">${it.key}</span>
                        <div style="width:100px;height:6px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden">
                            <div style="height:100%;background:#dc143c;border-radius:3px;width:${Math.min(100,(it.sz/total)*100)}%"></div>
                        </div>
                        <span style="color:#667;font-size:.72rem;min-width:45px;text-align:left">${(it.sz/1024).toFixed(1)}KB</span>
                    </div>`).join('') +
                    `<div style="color:#667;font-size:.78rem;margin-top:.5rem">المجموع: ${(total/1024).toFixed(1)} KB</div>`;
            }
        }, 100);
    }
});

console.log('%c🛡️ Admin Upgrade Loaded', 'color:#dc143c;font-weight:900;background:#08080f;padding:4px 12px;border-radius:4px');
