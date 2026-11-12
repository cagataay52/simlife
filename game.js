/* ============================================================================
   1 IN 8 BILLION ULTIMATE — ANA OYUN VE DİNAMİK TEMA MOTORU (game.js)
   ============================================================================ */

let soundEnabled = true;
let audioCtx = null;
let startConfig = { countryId: 'TR', gender: 'M', portraitIdx: 0 };
let activeFinanceTab = 'bank';
let activeGarageTab = 'dealer';
let selectedChartAsset = 'stock';
let inspectedCarIndex = 0;
let G = null;

/* ---------------- 1. SES MOTORU & PWA KURULUMU ---------------- */
function playSfx(type = 'click') {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.04);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now); osc.stop(now + 0.04);
    } else if (type === 'age') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.11);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      osc.start(now); osc.stop(now + 0.11);
    } else if (type === 'coin') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1174, now + 0.06);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.start(now); osc.stop(now + 0.16);
    } else if (type === 'bad') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(210, now);
      osc.frequency.linearRampToValueAtTime(120, now + 0.18);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now); osc.stop(now + 0.18);
    } else if (type === 'trophy') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.setValueAtTime(659, now + 0.08);
      osc.frequency.setValueAtTime(1046, now + 0.16);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.start(now); osc.stop(now + 0.32);
    }
  } catch (e) {}
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('soundToggleBtn');
  if (btn) btn.textContent = soundEnabled ? '🔊' : '🔇';
  if (soundEnabled) playSfx('coin');
}

(function preventZoomAndSetupPWA() {
  let lastTouchEnd = 0;
  document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
  document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(ev =>
    document.addEventListener(ev, e => e.preventDefault(), { passive: false })
  );

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#059669'); grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.roundRect(0, 0, 512, 512, 110); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 190px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('8B', 256, 230);
    ctx.fillStyle = '#34d399'; ctx.font = 'bold 60px sans-serif';
    ctx.fillText('ULTIMATE', 256, 390);
    const iconUrl = canvas.toDataURL('image/png');

    const appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon'; appleIcon.href = iconUrl;
    document.head.appendChild(appleIcon);

    const manifest = {
      name: '1 in 8 Billion Ultimate — Yaşam Simülasyonu',
      short_name: '8B Ultimate',
      start_url: '.',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#090d16',
      theme_color: '#090d16',
      icons: [
        { src: iconUrl, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
        { src: iconUrl, sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
      ]
    };
    const blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
    const link = document.createElement('link');
    link.rel = 'manifest'; link.href = URL.createObjectURL(blob);
    document.head.appendChild(link);
  } catch (e) {}
})();

/* ---------------- 2. YARDIMCI FONKSİYONLAR & DURUM ONARICI ---------------- */
function getCountry(id = (G ? G.countryId : startConfig.countryId)) {
  return COUNTRIES.find(c => c.id === id) || COUNTRIES[0];
}
function fmtMoney(amount, countryId) {
  const c = getCountry(countryId);
  return Math.round(amount || 0).toLocaleString('tr-TR') + ' ' + c.currency;
}
function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(v || 0)));
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function uid() {
  return 'id_' + Math.random().toString(36).substring(2, 9);
}
function formatCompactNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'B';
  return String(n || 0);
}

function normalizeState() {
  if (!G) return;
  G.generation = G.generation || 1;
  G.stress = typeof G.stress === 'number' ? G.stress : 10;
  G.dirtyMoney = G.dirtyMoney || 0;
  G.monthlyAlimony = G.monthlyAlimony || 0;
  G.creditScore = G.creditScore || 1150;
  G.investments = Object.assign({ gold: 0, forex: 0, stock: 0, crypto: 0 }, G.investments || {});
  G.licenses = Object.assign({ B: false, CE: false }, G.licenses || {});
  G.politics = Object.assign({ inParty: false, officeId: null, approval: 20, taxModifier: 0 }, G.politics || {});
  G.sports = Object.assign({ branchId: null, tierIndex: 0, skill: 55, injured: false }, G.sports || {});
  G.syndicate = Object.assign({ joined: false, rankLevel: 0, respect: 10 }, G.syndicate || {});
  G.diseases = Array.isArray(G.diseases) ? G.diseases : [];
  G.achievements = Array.isArray(G.achievements) ? G.achievements : [];
  G.social = Object.assign({ activePlatforms: [], followers: 0, verified: false, postsThisYear: 0, annualAdIncome: 0 }, G.social || {});
  G.cars = Array.isArray(G.cars) ? G.cars : [];
  G.houses = Array.isArray(G.houses) ? G.houses : [];
  G.businesses = Array.isArray(G.businesses) ? G.businesses : [];
  G.children = Array.isArray(G.children) ? G.children : [];
  G.relations = Array.isArray(G.relations) ? G.relations : [];
  G.logs = Array.isArray(G.logs) ? G.logs : [];
  if (!Array.isArray(G.visas) || G.visas.length === 0) {
    G.visas = [{ code: G.countryId || 'TR', age: 0, type: 'DOĞUM / VATANDAŞ' }];
  }

  if (!G.market) {
    G.market = {
      tradesThisYear: 0,
      costBasis: { gold: 0, forex: 0, stock: 0, crypto: 0 },
      lastPct: { gold: 4.2, forex: 3.1, stock: 11.4, crypto: 18.5 },
      history: {
        gold: [1800, 1920, 2050, 2180, 2310, 2450, 2590, 2720, 2850],
        forex: [24.0, 25.5, 27.1, 28.8, 30.2, 31.9, 33.4, 34.9, 36.5],
        stock: [6200, 6550, 6300, 7100, 7650, 7400, 8200, 8900, 9400],
        crypto: [38000, 44000, 35000, 52000, 48000, 61000, 54000, 63000, 68500]
      }
    };
  }

  G.children.forEach(ch => {
    if (typeof ch.smart !== 'number') ch.smart = randInt(65, 88);
    if (typeof ch.happy !== 'number') ch.happy = randInt(75, 95);
    if (typeof ch.love !== 'number') ch.love = randInt(78, 96);
    if (typeof ch.obp !== 'number') ch.obp = randInt(70, 90);
    if (typeof ch.privateSchool !== 'boolean') ch.privateSchool = false;
    if (typeof ch.trustFund !== 'number') ch.trustFund = 0;
  });
}

function renderHeroBannerHTML(key) {
  const b = typeof SHEET_BANNERS !== 'undefined' ? SHEET_BANNERS[key] : null;
  if (!b) return '';
  return `
    <div class="sheet-hero-banner" style="background-image:url('${b.img}')">
      <div class="sheet-hero-overlay">
        <div class="text-[9px] font-extrabold tracking-widest text-emerald-400 uppercase">${b.tag}</div>
        <div class="text-xs font-extrabold text-white">${b.title}</div>
      </div>
    </div>
  `;
}

function getCharacterPlate(idx = 0) {
  if (!G) return { country: 'TR', text: '34 KLC 01' };
  const cityCode = G.countryId === 'TR' ? '34' : G.countryId;
  const letters = ((G.lastName || 'KLC').replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ]/g, '').toUpperCase() + 'X').slice(0, 3);
  const num = String((idx + 1) * 11).padStart(2, '0');
  return { country: G.countryId, text: `${cityCode} ${letters} ${num}` };
}

function getCharacterIBAN() {
  if (!G) return 'TR48 0006 2000 1940 0008 4192 01';
  const code = (G.firstName.charCodeAt(0) || 65) + (G.lastName.charCodeAt(0) || 75);
  return `${G.countryId}48 0006 2000 ${1000 + code} 0008 4192 0${G.generation || 1}`;
}

function getCharacterNationalId() {
  if (!G) return '10482941028';
  const seed = (G.firstName.length * 17 + G.lastName.length * 31 + (G.generation || 1) * 13);
  return `429${String(seed).padStart(4, '8')}104${(seed % 4) * 2}`;
}

function getCarClassifiedSpecs(car) {
  const specs = {
    scooter: { km: '14.200 km', fuel: 'Benzin • Otomatik', body: 'Motosiklet' },
    tofas: { km: '248.000 km', fuel: 'LPG & Benzin • Düz', body: 'Sedan' },
    doblo: { km: '162.000 km', fuel: '1.6 Multijet Dizel', body: 'Camlı Van' },
    egea: { km: '0 km / Sıfır', fuel: '1.6 Multijet DCT', body: 'Sedan' },
    egea_cross: { km: '0 km / Sıfır', fuel: '1.6 Multijet Lounge', body: 'Crossover' },
    corolla: { km: '0 km / Sıfır', fuel: '1.8 Hybrid e-CVT', body: 'Sedan' },
    togg: { km: '0 km / Sıfır', fuel: '100% Elektrik 523km', body: 'C-SUV' },
    transporter: { km: '45.000 km', fuel: '2.0 TDI VIP Dizel', body: 'VIP Panelvan' },
    passat: { km: '32.000 km', fuel: '2.0 TDI DSG Elegance', body: 'Makam Sedan' },
    bmw320: { km: '0 km / Sıfır', fuel: 'TwinPower Otomatik', body: 'M Sport Sedan' },
    volvo_fh16: { km: '0 km / Sıfır', fuel: '750 HP Euro 6 Dizel', body: 'Çekici Tır' },
    scania_s730: { km: '0 km / Sıfır', fuel: 'V8 730 HP Retarder', body: 'Uzun Yol Çekici' },
    g63: { km: '0 km / Sıfır', fuel: '4.0 V8 Biturbo', body: '4x4 Lüks SUV' },
    porsche911: { km: '0 km / Sıfır', fuel: '3.8 Boxer PDK', body: 'Süper Spor' },
    ferrari_f8: { km: '0 km / Sıfır', fuel: '3.9 V8 Twin-Turbo', body: 'Coupe' },
    maybach: { km: '0 km / Sıfır', fuel: '6.0 V12 4MATIC', body: 'Zırhlı Makam' }
  };
  return specs[car.id] || { km: '15.000 km', fuel: 'Hibrit / Otomatik', body: 'Sedan' };
}

function getHouseClassifiedSpecs(h) {
  const specs = {
    ogrenci_apart: { m2: '45 m²', rooms: '1+0 Stüdyo', floor: '2. Kat' },
    studio: { m2: '65 m²', rooms: '1+1 Rezidans', floor: '8. Kat' },
    apt31: { m2: '145 m²', rooms: '3+1 Site İçi', floor: '5. Kat' },
    lojistik_depo: { m2: '1.850 m²', rooms: 'Tır Rampalı Antrepo', floor: 'Müstakil' },
    villa: { m2: '380 m²', rooms: '5+2 Özel Havuzlu', floor: 'Dublex' },
    penthouse: { m2: '460 m²', rooms: '6+2 Panoramik', floor: '40. Kat' },
    mansion: { m2: '950 m²', rooms: '10+3 Özel İskeleli', floor: 'Triplex Yalı' }
  };
  return specs[h.id] || { m2: '120 m²', rooms: '3+1', floor: 'Ara Kat' };
}

function unlockAchievement(achId) {
  if (!G || !G.achievements || G.achievements.includes(achId)) return;
  const ach = ACHIEVEMENTS_DB.find(x => x.id === achId);
  if (!ach) return;
  G.achievements.push(achId);
  playSfx('trophy');
  addLog(G.age, `🏆 **BAŞARIM AÇILDI: ${ach.icon} ${ach.title}** — ${ach.desc}`, 'fame');
  showToast(`🏆 Başarım: ${ach.title}!`);
}

function checkAllAchievements() {
  if (!G) return;
  const c = getCountry();
  if (getNetWorth() >= c.monthlyMinWage * 100) unlockAchievement('millionaire');
  if (getTotalPortfolioValue() >= c.monthlyMinWage * 40) unlockAchievement('wolf_of_borsa');
  if (G.jobId === 'kaptan_pilot') unlockAchievement('captain_sky');
  if (G.jobId === 'gemi_kaptan' || G.businesses.some(b => b.typeId === 'deniz_acente')) unlockAchievement('sea_wolf');
  if (G.houses.length >= 5) unlockAchievement('real_estate_mogul');
  if (G.children.some(ch => ch.smart >= 90 && ch.happy >= 90)) unlockAchievement('super_parent');
}

/* ---------------- 3. BAŞLANGIÇ EKRANI & KAYIT ---------------- */
function initStartScreen() {
  const saved = localStorage.getItem('8b_life_save_v6');
  const btn = document.getElementById('continueSavedBtn');
  if (saved && btn) btn.classList.remove('hidden');
  updateCountryButtonUI();
  fillRandomIdentity();
  renderCountryList();
}

function selectGender(g) {
  startConfig.gender = g;
  const btnM = document.getElementById('genderBtnM');
  const btnF = document.getElementById('genderBtnF');
  const activeCls = 'p-3 rounded-2xl border border-emerald-500 bg-emerald-500/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition';
  const idleCls = 'p-3 rounded-2xl border border-slate-800 bg-slate-900/80 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition';
  btnM.className = g === 'M' ? activeCls : idleCls;
  btnF.className = g === 'F' ? activeCls : idleCls;
  fillRandomIdentity();
}

function fillRandomIdentity() {
  const c = getCountry(startConfig.countryId);
  document.getElementById('inputFirstName').value = pickRandom(startConfig.gender === 'M' ? c.namesM : c.namesF);
  document.getElementById('inputLastName').value = pickRandom(c.lastNames);
  updateStartPreview();
}

function rerollStartPortrait() {
  startConfig.portraitIdx = (startConfig.portraitIdx + 1) % 3;
  updateStartPreview();
}

function randomizeAllStart() {
  startConfig.countryId = pickRandom(COUNTRIES).id;
  selectGender(Math.random() < 0.5 ? 'M' : 'F');
  updateCountryButtonUI();
  fillRandomIdentity();
}

function updateCountryButtonUI() {
  const c = getCountry(startConfig.countryId);
  document.getElementById('selectedCountryFlag').textContent = c.flag;
  document.getElementById('selectedCountryName').textContent = c.name;
  document.getElementById('selectedCountrySub').textContent =
    `Para Birimi: ${c.currency} ${c.code} • Enflasyon: %${Math.round(c.inflation * 100)} • Asgari: ${c.monthlyMinWage.toLocaleString('tr-TR')} ${c.currency}`;
}

function updateStartPreview() {
  const c = getCountry(startConfig.countryId);
  const fn = document.getElementById('inputFirstName').value.trim() || 'İsimsiz';
  const ln = document.getElementById('inputLastName').value.trim() || '';
  const list = PORTRAITS[startConfig.gender].young;
  document.getElementById('startPreviewImg').src = list[startConfig.portraitIdx % list.length];
  document.getElementById('startPreviewCountryTag').textContent = `${c.flag} ${c.name} • ${c.currency} ${c.code}`;
  document.getElementById('startPreviewName').textContent = `${fn} ${ln}`;
  document.getElementById('startPreviewDesc').textContent = c.desc;
}

function openCountryModal() {
  document.getElementById('countryModal').classList.remove('hidden');
  document.getElementById('countrySearchInput').value = '';
  renderCountryList();
}

function closeCountryModal() {
  document.getElementById('countryModal').classList.add('hidden');
}

function renderCountryList() {
  const q = (document.getElementById('countrySearchInput')?.value || '').toLowerCase();
  const container = document.getElementById('countryListContainer');
  const filtered = COUNTRIES.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  container.innerHTML = filtered.map(c => {
    const active = c.id === startConfig.countryId;
    return `
      <button type="button" onclick="chooseCountry('${c.id}')" class="w-full p-3 rounded-2xl border ${active ? 'border-emerald-500 bg-emerald-500/15' : 'border-slate-800 bg-slate-900/80'} flex items-center justify-between text-left transition active:scale-[0.99]">
        <div class="flex items-center gap-3 min-w-0">
          <span class="text-2xl shrink-0">${c.flag}</span>
          <div class="min-w-0">
            <div class="text-xs font-extrabold text-white">${c.name} <span class="text-emerald-400 font-mono-num">(${c.currency} ${c.code})</span></div>
            <div class="text-[10px] text-slate-400 truncate">${c.desc}</div>
            <div class="text-[10px] text-slate-300 mt-0.5 font-mono-num">Asgari: ${c.monthlyMinWage.toLocaleString('tr-TR')} ${c.currency} • Vergi: %${Math.round(c.taxRate * 100)} • Enf: %${Math.round(c.inflation * 100)}</div>
          </div>
        </div>
        ${active ? '<span class="text-emerald-400 text-xs font-bold shrink-0 ml-2">✓ Seçili</span>' : ''}
      </button>
    `;
  }).join('');
}

function chooseCountry(id) {
  startConfig.countryId = id;
  updateCountryButtonUI();
  fillRandomIdentity();
  closeCountryModal();
}

function startNewLife() {
  const c = getCountry(startConfig.countryId);
  const firstName = document.getElementById('inputFirstName').value.trim() || pickRandom(c.namesM);
  const lastName = document.getElementById('inputLastName').value.trim() || pickRandom(c.lastNames);
  const fatherName = pickRandom(c.namesM) + ' ' + lastName;
  const motherName = pickRandom(c.namesF) + ' ' + lastName;

  G = {
    generation: 1, firstName, lastName, gender: startConfig.gender, countryId: c.id, portraitIdx: startConfig.portraitIdx,
    age: 0, alive: true,
    health: randInt(84, 100), happy: randInt(82, 100), smart: randInt(55, 92), looks: randInt(55, 92), fame: 0, stress: 5,
    money: 0, dirtyMoney: 0, bankSavings: 0, loanDebt: 0, monthlyAlimony: 0, creditScore: 1150,
    investments: { gold: 0, forex: 0, stock: 0, crypto: 0 },
    eduStage: 'Bebek', obpScore: randInt(68, 88), examPrepBonus: 0, lastExamScore: 0, lastExamRank: 0,
    highSchoolGrad: false, uniGrad: false, currentMajor: null, uniYearsLeft: 0, graduatedMajor: null,
    uniLiving: 'kyk', kykSupport: 'none', partTimeJobId: null,
    jobId: null, jobExp: 0, licenses: { B: false, CE: false }, militaryDone: false, criminalRecord: false, inPrison: false, prisonYearsLeft: 0,
    politics: { inParty: false, officeId: null, approval: 20, taxModifier: 0 },
    sports: { branchId: null, tierIndex: 0, skill: randInt(45, 70), injured: false },
    syndicate: { joined: false, rankLevel: 0, respect: 10 },
    diseases: [], achievements: [],
    visas: [{ code: c.id, age: 0, type: 'DOĞUM / VATANDAŞ' }],
    social: { activePlatforms: [], followers: 0, verified: false, postsThisYear: 0, annualAdIncome: 0 },
    cars: [], houses: [], businesses: [],
    relations: [
      { id: 'father', name: fatherName, role: 'Baba', age: randInt(25, 38), love: randInt(75, 98), alive: true },
      { id: 'mother', name: motherName, role: 'Anne', age: randInt(23, 35), love: randInt(80, 100), alive: true }
    ],
    partner: null, children: [], willChildIndex: 0, logs: []
  };

  normalizeState();
  playSfx('coin');
  addLog(0, `${c.flag} **${c.name}** sınırları içinde **${firstName} ${lastName}** (1. Kuşak) olarak dünyaya geldin. Babası ${fatherName}, annesi ${motherName}.`, 'milestone');
  document.getElementById('startScreen').classList.add('hidden');
  saveGame();
  renderAll();
}

function saveGame() {
  if (!G) return;
  try { localStorage.setItem('8b_life_save_v6', JSON.stringify(G)); } catch (e) {}
}

function loadSavedGame() {
  try {
    const raw = localStorage.getItem('8b_life_save_v6');
    if (!raw) return;
    G = JSON.parse(raw);
    normalizeState();
    document.getElementById('startScreen').classList.add('hidden');
    renderAll();
    showToast('Kayıtlı oyunun yüklendi!');
  } catch (e) {
    showToast('Kayıt okunamadı.');
  }
}

/* ---------------- 4. EKONOMİ, PORTFÖY VE GELİR/GİDER MOTORU ---------------- */
function getEffectiveTaxRate() {
  const c = getCountry();
  const mod = (G && G.politics && G.politics.officeId === 'president') ? (G.politics.taxModifier || 0) : 0;
  return Math.max(0, Math.min(0.55, c.taxRate + mod));
}

function getJobMonthlyGross(job) {
  const c = getCountry();
  return Math.round(c.monthlyMinWage * job.mult * (1 + (G.jobExp || 0) * 0.06));
}

function getTotalPortfolioValue() {
  if (!G || !G.investments) return 0;
  return Math.round((G.investments.gold || 0) + (G.investments.forex || 0) + (G.investments.stock || 0) + (G.investments.crypto || 0));
}

function getNetWorth() {
  if (!G) return 0;
  const carVal = G.cars.reduce((acc, x) => acc + (x.value || 0), 0);
  const houseVal = G.houses.reduce((acc, x) => acc + (x.value || 0), 0);
  return Math.round(G.money + G.bankSavings + getTotalPortfolioValue() + carVal + houseVal - G.loanDebt);
}

function calculateFinances() {
  const c = getCountry();
  let monthlyGrossSalary = 0;

  if (!G.inPrison) {
    if (G.jobId) {
      const job = JOBS.find(j => j.id === G.jobId);
      if (job) monthlyGrossSalary += getJobMonthlyGross(job);
    }
    if (G.politics && G.politics.officeId) {
      const off = POLITICS_OFFICES.find(o => o.id === G.politics.officeId);
      if (off) monthlyGrossSalary += Math.round(c.monthlyMinWage * off.salaryMult);
    }
    if (G.sports && G.sports.branchId) {
      const br = SPORTS_BRANCHES.find(b => b.id === G.sports.branchId);
      if (br) monthlyGrossSalary += Math.round(c.monthlyMinWage * br.mults[G.sports.tierIndex || 0]);
    }
  }

  let monthlyStudentIncome = 0;
  if (!G.inPrison && G.eduStage === 'Üniversite') {
    if (G.partTimeJobId) {
      const pt = PART_TIME_JOBS.find(p => p.id === G.partTimeJobId);
      if (pt) monthlyStudentIncome += Math.round(c.monthlyMinWage * pt.mult);
    }
    if (G.kykSupport === 'burs' || G.kykSupport === 'kredi') {
      monthlyStudentIncome += Math.round(c.monthlyMinWage * 0.22);
    }
  }

  const sgkCut = Math.round(monthlyGrossSalary * 0.14);
  const incomeTaxCut = Math.round(monthlyGrossSalary * getEffectiveTaxRate());
  const monthlyTax = sgkCut + incomeTaxCut;
  const monthlyNetSalary = Math.max(0, monthlyGrossSalary - monthlyTax) + monthlyStudentIncome;

  let monthlyBizRevenue = 0;
  let monthlyBizOperatingCost = 0;
  let monthlyBizTax = 0;
  let monthlyBizProfit = 0;

  G.businesses.forEach(b => {
    const bType = BUSINESS_TYPES.find(t => t.id === b.typeId);
    if (bType) {
      const fleetMult = 1 + (b.fleet - 1) * 0.42 + (b.employees - 2) * 0.15;
      const stratMult = b.strategy === 'premium' ? 1.22 : (b.strategy === 'cheap' ? 0.88 : 1.0);
      const net = Math.round(c.monthlyMinWage * bType.baseProfitMult * fleetMult * stratMult);
      const grossRev = Math.round(net * 1.85);
      const opEx = Math.round(grossRev * 0.35);
      const corpTax = Math.max(0, grossRev - opEx - net);
      monthlyBizRevenue += grossRev;
      monthlyBizOperatingCost += opEx;
      monthlyBizTax += corpTax;
      monthlyBizProfit += net;
    }
  });

  let monthlyRentIncome = 0;
  let hasOwnHomeToLive = false;
  G.houses.forEach(h => {
    if (h.isRented) {
      if (h.tenantOk) monthlyRentIncome += h.monthlyRent;
    } else {
      hasOwnHomeToLive = true;
    }
  });

  let monthlySocialIncome = 0;
  if (!G.inPrison && G.social.followers >= 1000) {
    monthlySocialIncome = Math.round((G.social.followers / 10000) * (c.monthlyMinWage * 0.18));
    if (G.social.verified) monthlySocialIncome = Math.round(monthlySocialIncome * 1.35);
  }
  G.social.annualAdIncome = monthlySocialIncome * 12;

  let monthlyLivingExpense = 0;
  if (!G.inPrison && G.age >= 18) {
    if (G.eduStage === 'Üniversite') {
      monthlyLivingExpense = G.uniLiving === 'kyk' ? Math.round(c.monthlyMinWage * 0.25) : Math.round(c.monthlyMinWage * 0.68);
    } else {
      monthlyLivingExpense = hasOwnHomeToLive ? Math.round(c.monthlyLivingCost * 0.45) : c.monthlyLivingCost;
    }
    monthlyLivingExpense += G.children.length * Math.round(c.monthlyMinWage * 0.18);
    monthlyLivingExpense += (G.monthlyAlimony || 0);
  }

  let monthlyCarExpense = 0;
  G.cars.forEach(car => {
    let rate = 0.08 + (car.trafficIns ? 0.025 : 0) + (car.kasko ? 0.055 : 0);
    monthlyCarExpense += Math.round(c.monthlyMinWage * rate);
  });

  let monthlyLoanPayment = 0;
  if (G.loanDebt > 0) {
    monthlyLoanPayment = Math.min(G.loanDebt, Math.round(G.loanDebt * 0.035) + Math.round(c.monthlyMinWage * 0.12));
  }

  const totalExpenses = monthlyLivingExpense + monthlyCarExpense + monthlyLoanPayment;
  const monthlyNetCashflow = monthlyNetSalary + monthlyBizProfit + monthlyRentIncome + monthlySocialIncome - totalExpenses;

  return {
    monthlyGrossSalary, sgkCut, incomeTaxCut, monthlyTax, monthlyNetSalary,
    monthlyBizRevenue, monthlyBizOperatingCost, monthlyBizTax, monthlyBizProfit,
    monthlyRentIncome, monthlySocialIncome, monthlyLivingExpense, monthlyCarExpense,
    monthlyLoanPayment, monthlyNetCashflow, annualNetCashflow: monthlyNetCashflow * 12
  };
}

/* ---------------- 5. DİNAMİK TEMA, BLOOMBERG BANT & KÜRESEL SIRALAMA ---------------- */
function getGlobalWealthRankInfo() {
  const c = getCountry();
  const nwInMinWages = Math.max(0, getNetWorth() / Math.max(1, c.monthlyMinWage));
  // Dünya ve ülke yüzdelik dilim hesabı
  let globalBetterThan = 18 + Math.log10(1 + nwInMinWages) * 36;
  if (G.age < 18 && nwInMinWages < 1) globalBetterThan = 22;
  globalBetterThan = Math.max(1.0, Math.min(99.99, Number(globalBetterThan.toFixed(2))));

  const topNatPct = Math.max(0.01, Math.min(99.0, Number((100 - globalBetterThan * 0.96).toFixed(2))));
  const worldRank = Math.max(1450, Math.round(((100 - globalBetterThan) / 100) * 8000000000));

  return { globalBetterThan, topNatPct, worldRank };
}

function updateDynamicThemeAndTicker() {
  if (!G) return;
  const shell = document.getElementById('appShell');
  const header = document.querySelector('#appShell > header');
  const avatar = document.getElementById('charAvatar');
  const hpBar = document.getElementById('statHealthBar');
  const c = getCountry();
  const netWorth = getNetWorth();

  // 1) Statü ve Servete Duyarlı Dinamik Tema
  shell.classList.remove('theme-vip', 'theme-prison', 'theme-crisis');
  let modeLabel = 'STANDART';
  if (G.inPrison || (G.syndicate.joined && G.syndicate.rankLevel >= 3)) {
    shell.classList.add('theme-prison');
    modeLabel = G.inPrison ? 'CEZAEVİ REJİMİ' : 'YERALTI BARONU';
  } else if (G.money < 0 || G.creditScore < 700) {
    shell.classList.add('theme-crisis');
    modeLabel = 'FİNANSAL DARBOĞAZ';
  } else if (netWorth >= c.monthlyMinWage * 50 || G.politics.officeId === 'president') {
    shell.classList.add('theme-vip');
    modeLabel = 'OBSIDIAN VIP STATÜSÜ';
  }

  // 2) Klinik Portre & EKG Nabzı ve Şöhret Spot Işıkları
  const isSickOrStressed = G.diseases.length > 0 || G.stress >= 80 || G.health <= 30;
  if (avatar) avatar.classList.toggle('avatar-sick-stress', isSickOrStressed);
  if (hpBar) hpBar.classList.toggle('ecg-pulse', isSickOrStressed);
  if (header) header.classList.toggle('header-fame-spotlight', Boolean(G.social.verified || G.fame >= 60));

  // 3) Bloomberg Ekonomi Bandı ve 1 in 8 Billion Küresel Sıralama Barı Enjeksiyonu
  let subHeader = document.getElementById('dynamicSubHeader');
  if (!subHeader && header) {
    subHeader = document.createElement('div');
    subHeader.id = 'dynamicSubHeader';
    subHeader.className = 'shrink-0';
    header.insertAdjacentElement('afterend', subHeader);
  }
  if (!subHeader) return;

  const pGold = G.market.lastPct.gold || 0;
  const pFx = G.market.lastPct.forex || 0;
  const pStock = G.market.lastPct.stock || 0;
  const pCry = G.market.lastPct.crypto || 0;
  const rankInfo = getGlobalWealthRankInfo();

  const fmtTick = (lbl, val) =>
    `<span class="mx-2.5 text-[10px] font-mono-num"><strong class="text-slate-300">${lbl}:</strong> <span class="${val >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${val >= 0 ? '▲+' : '▼'}${val}%</span></span>`;

  const tickerContent = `
    <span class="mx-2.5 text-[10px] font-mono-num text-amber-400 font-bold">● ${c.flag} ${c.name.toUpperCase()} ENFLASYON: %${Math.round(c.inflation * 100)}</span>
    ${fmtTick('XAU/ALTIN', pGold)}
    ${fmtTick('FX/DÖVİZ', pFx)}
    ${fmtTick('TECH100', pStock)}
    ${fmtTick('BTC/AI', pCry)}
    <span class="mx-2.5 text-[10px] font-mono-num text-sky-400">● TEMA: ${modeLabel}</span>
  `;

  subHeader.innerHTML = `
    <div class="ticker-wrap">
      <div class="ticker-move">${tickerContent}${tickerContent}</div>
    </div>
    <div class="percentile-strip flex items-center justify-between gap-2">
      <div class="flex items-center gap-1.5 min-w-0">
        <span class="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-extrabold text-emerald-400 shrink-0">1 IN 8 BILLION</span>
        <span class="text-[10px] text-slate-300 truncate">${c.flag} En Üst <strong class="text-white font-mono-num">%${rankInfo.topNatPct}</strong> &bull; 🌍 Dünya <strong class="text-emerald-400 font-mono-num">#${rankInfo.worldRank.toLocaleString('tr-TR')}</strong></span>
      </div>
      <div class="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden shrink-0">
        <div class="h-full bg-gradient-to-r from-emerald-500 to-amber-400" style="width:${rankInfo.globalBetterThan}%"></div>
      </div>
    </div>
  `;
}

/* ---------------- 6. ANA EKRAN & ZAMAN TÜNELİ RENDER MOTORU ---------------- */
function getCurrentPortrait() {
  const gSet = PORTRAITS[G.gender] || PORTRAITS.M;
  if (G.age <= 3) return gSet.baby[0];
  if (G.age <= 13) return gSet.child[0];
  if (G.age <= 34) return gSet.young[G.portraitIdx % gSet.young.length];
  if (G.age <= 64) return gSet.adult[G.portraitIdx % gSet.adult.length];
  return gSet.old[0];
}

function updateStatBar(name, val) {
  const clamped = clamp(val);
  document.getElementById(`stat${name}Val`).textContent = `${clamped}`;
  document.getElementById(`stat${name}Bar`).style.width = `${clamped}%`;
}

function renderAll() {
  if (!G) return;
  normalizeState();
  checkAllAchievements();

  const c = getCountry();
  const fin = calculateFinances();

  document.getElementById('charAvatar').src = getCurrentPortrait();
  document.getElementById('charCountryFlag').textContent = c.flag;
  document.getElementById('charName').textContent = `${G.firstName} ${G.lastName}`;
  document.getElementById('verifiedBadge').classList.toggle('hidden', !G.social.verified);
  document.getElementById('prisonBadge').classList.toggle('hidden', !G.inPrison);
  document.getElementById('sickBadge').classList.toggle('hidden', G.diseases.length === 0);
  document.getElementById('genBadge').textContent = `Kuşak #${G.generation}`;

  let roleLabel = G.eduStage;
  if (G.inPrison) roleLabel = `Mahkum (${G.prisonYearsLeft} Yıl Kaldı)`;
  else if (G.politics.officeId) {
    const off = POLITICS_OFFICES.find(o => o.id === G.politics.officeId);
    if (off) roleLabel = `${off.icon} ${off.title}`;
  } else if (G.sports.branchId) {
    const br = SPORTS_BRANCHES.find(b => b.id === G.sports.branchId);
    if (br) roleLabel = `${br.icon} ${br.name} (${br.tiers[G.sports.tierIndex]})`;
  } else if (G.jobId) {
    const j = JOBS.find(x => x.id === G.jobId);
    if (j) roleLabel = j.title;
  }
  document.getElementById('charRoleText').textContent = `${roleLabel} • ${G.age} Yaş`;

  const dirtyTag = G.dirtyMoney > 0 ? ` • 🕶️ Kara: ${fmtMoney(G.dirtyMoney)}` : '';
  document.getElementById('charLocationText').textContent = `${c.name} • Findeks: ${G.creditScore}${dirtyTag}`;

  document.getElementById('charBalance').textContent = fmtMoney(G.money);
  document.getElementById('charBalance').className = `text-sm font-extrabold font-mono-num ${G.money >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;

  const sign = fin.monthlyNetCashflow >= 0 ? '+' : '';
  document.getElementById('charCashflow').textContent = `Aylık: ${sign}${fmtMoney(fin.monthlyNetCashflow)}`;
  document.getElementById('charCashflow').className = `text-[10px] font-mono-num ${fin.monthlyNetCashflow >= 0 ? 'text-emerald-400/90' : 'text-rose-400'}`;

  updateStatBar('Health', G.health);
  updateStatBar('Happy', G.happy);
  updateStatBar('Smart', G.smart);
  updateStatBar('Looks', G.looks);
  updateStatBar('Fame', G.fame);
  updateStatBar('Stress', G.stress);

  const navIcon = document.getElementById('navCareerIcon');
  const navLabel = document.getElementById('navCareerLabel');
  if (G.inPrison) { navIcon.textContent = '⛓️'; navLabel.textContent = 'Cezaevi'; }
  else if (G.age < 18 || G.eduStage === 'Üniversite') { navIcon.textContent = '🎓'; navLabel.textContent = 'Okul / İş'; }
  else { navIcon.textContent = '💼'; navLabel.textContent = 'Kariyer'; }

  updateDynamicThemeAndTicker();
  renderLogs();
}

function addLog(age, text, type = 'normal') {
  let ageGroup = G.logs.find(g => g.age === age);
  if (!ageGroup) {
    ageGroup = { age, items: [] };
    G.logs.push(ageGroup);
  }
  ageGroup.items.push({ text, type });
}

function renderLogs() {
  const container = document.getElementById('logContainer');
  if (!container || !G) return;

  container.innerHTML = G.logs.map(group => {
    const itemsHtml = group.items.map((item, i) => {
      const raw = item.text || '';
      const formatted = raw.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');

      const isBank = /💳|🏦|📈|📉|📊|mevduat|kredi|maaş|nakit akış|enflasyon|portföy/i.test(raw);
      const isTebligat = /🚨|⛓️|⚖️|🚓|🪖|💔|⚰️|MAHKEME|İCRA|MASAK|ceza|tahliye|askerlik|boşan/i.test(raw);
      const isSocial = /🎬|🔥|☑️|📱|takipçi|viral|yayın|Mavi Tik/i.test(raw);
      const isManset = /🗳️|🏆|👑|✈️|🎓|🏢|💍|BAŞARIM|SEÇİM|TRANSFER|mezun|şirket/i.test(raw);

      if (isTebligat) {
        return `
          <div class="p-3 rounded-xl log-card-tebligat space-y-1">
            <div class="flex items-center justify-between border-b border-rose-500/20 pb-1">
              <span class="text-[9px] font-extrabold tracking-wider uppercase text-rose-400">📩 RESMİ TEBLİGAT &bull; EVRAK NO: #${group.age}0${i + 1}</span>
              <span class="text-[9px] font-mono-num text-slate-400">GİZLİ / İVEDİ</span>
            </div>
            <div class="text-xs text-slate-200 leading-relaxed">${formatted}</div>
          </div>`;
      }
      if (isManset) {
        return `
          <div class="p-3 rounded-xl log-card-manset space-y-1">
            <div class="flex items-center justify-between border-b border-amber-500/20 pb-1">
              <span class="text-[9px] font-extrabold tracking-wider uppercase text-amber-400">📰 GÜNDEM &amp; RESMİ BÜLTEN</span>
              <span class="text-[9px] font-mono-num text-amber-200/80">YAŞ ${group.age}</span>
            </div>
            <div class="text-xs text-slate-100 leading-relaxed">${formatted}</div>
          </div>`;
      }
      if (isSocial) {
        const handle = `@${(G.firstName + G.lastName).toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        return `
          <div class="p-3 rounded-xl log-card-social space-y-1">
            <div class="flex items-center justify-between border-b border-fuchsia-500/20 pb-1">
              <span class="text-[10px] font-extrabold text-fuchsia-300">${handle} ${G.social.verified ? '☑️' : ''}</span>
              <span class="text-[9px] font-mono-num text-slate-400">📱 Sosyal Akış</span>
            </div>
            <div class="text-xs text-slate-200 leading-relaxed">${formatted}</div>
          </div>`;
      }
      if (isBank) {
        return `
          <div class="p-2.5 rounded-xl log-card-bank space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-[9px] font-extrabold tracking-wider uppercase text-emerald-400">🏦 MOBİL BANKACILIK &bull; HESAP ÖZETİ</span>
              <span class="text-[9px] font-mono-num text-slate-400">ONAYLI</span>
            </div>
            <div class="text-xs text-slate-200 leading-relaxed font-mono-num">${formatted}</div>
          </div>`;
      }
      return `<div class="p-2.5 rounded-xl border border-slate-800/90 bg-slate-900/70 text-xs text-slate-300 leading-relaxed">${formatted}</div>`;
    }).join('');

    return `
      <div class="timeline-age-block space-y-2 pb-1">
        <div class="timeline-age-dot"></div>
        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
          <span>YAŞ ${group.age}</span><span class="text-slate-500">&bull;</span><span class="text-slate-300 font-mono-num">${2026 + group.age} YILI</span>
        </div>
        <div class="space-y-2">${itemsHtml}</div>
      </div>`;
  }).join('');
  container.scrollTop = container.scrollHeight;
}

/* ---------------- 7. +1 YAŞ İLERLEME MOTORU ---------------- */
function advanceAge() {
  if (!G || !G.alive) { openDeathModal(); return; }
  normalizeState();

  G.age += 1;
  G.social.postsThisYear = 0;
  G.market.tradesThisYear = 0;
  const c = getCountry();

  Object.keys(MARKET_ASSETS_META).forEach(key => {
    const meta = MARKET_ASSETS_META[key];
    const infBoost = (key === 'gold' || key === 'forex') ? (c.inflation * 55) : (c.inflation * 25);
    const pct = Number((randInt(meta.minChange, meta.maxChange) + infBoost * 0.25).toFixed(1));
    G.market.lastPct[key] = pct;
    const series = G.market.history[key];
    const nextP = Math.max(1, Number((series[series.length - 1] * (1 + pct / 100)).toFixed(1)));
    series.push(nextP);
    if (series.length > 12) series.shift();
  });

  if (G.inPrison) {
    G.prisonYearsLeft -= 1;
    G.happy = clamp(G.happy - 6);
    if (G.prisonYearsLeft <= 0) {
      G.inPrison = false; G.prisonYearsLeft = 0;
      addLog(G.age, `🔓 Cezanı tamamlayıp **tahliye oldun!**`, 'milestone');
    } else {
      addLog(G.age, `⛓️ Cezaevinde bir yıl daha geçti. Tahliyeye **${G.prisonYearsLeft} yıl** kaldı.`, 'bad');
    }
  }

  if (G.age === 6) { G.eduStage = 'İlkokul'; addLog(G.age, `🎒 **İlkokula** başladın.`, 'milestone'); }
  else if (G.age === 10) { G.eduStage = 'Ortaokul'; addLog(G.age, `📘 **Ortaokula** geçtin.`, 'milestone'); }
  else if (G.age === 14) { G.eduStage = 'Lise'; addLog(G.age, `🏫 **Liseye** başladın!`, 'milestone'); }
  else if (G.age === 18 && G.eduStage === 'Lise') {
    G.highSchoolGrad = true; G.eduStage = 'Lise Mezunu';
    addLog(G.age, `🎓 Liseden **${G.obpScore} OBP** ile mezun oldun!`, 'milestone');
  }

  if (!G.inPrison && G.eduStage === 'Üniversite' && G.uniYearsLeft > 0) {
    G.uniYearsLeft -= 1;
    if (G.kykSupport === 'kredi') G.loanDebt += Math.round(c.monthlyMinWage * 2.6);
    if (G.uniYearsLeft === 0) {
      const m = UNI_MAJORS.find(x => x.id === G.currentMajor);
      G.uniGrad = true; G.graduatedMajor = G.currentMajor;
      G.eduStage = `${m ? m.name : 'Üniversite'} Mezunu`;
      G.partTimeJobId = null; G.kykSupport = 'none';
      G.smart = clamp(G.smart + 8);
      unlockAchievement('uni_grad');
      addLog(G.age, `🎓 **${m ? m.name : 'Üniversite'}** bölümünden mezun oldun!`, 'milestone');
    } else {
      addLog(G.age, `📚 Üniversite eğitimine devam ediyorsun. Mezuniyete **${G.uniYearsLeft} yıl** kaldı.`);
    }
  }

  if (!G.inPrison && G.jobId) {
    G.jobExp += 1;
    const j = JOBS.find(x => x.id === G.jobId);
    if (j) G.stress = clamp(G.stress + (j.stress || 5) - 3);
  } else {
    G.stress = clamp(G.stress - 5);
  }

  if (!G.inPrison && G.sports.branchId) {
    G.fame = clamp(G.fame + (G.sports.tierIndex + 1) * 4);
    G.sports.injured = false;
    if (G.age >= 37 && G.sports.branchId !== 'esports') {
      const br = SPORTS_BRANCHES.find(b => b.id === G.sports.branchId);
      addLog(G.age, `👟 **JÜBİLE!** 37 yaşına geldiğin için aktif **${br ? br.name : 'Spor'}** kariyerini noktaladın.`, 'milestone');
      G.sports.branchId = null;
    }
  }

  if (!G.inPrison && G.syndicate.joined) {
    const rObj = SYNDICATE_RANKS.find(r => r.level === G.syndicate.rankLevel) || SYNDICATE_RANKS[0];
    const yearlyCut = Math.round(c.monthlyMinWage * rObj.cutMult * 4);
    G.dirtyMoney += yearlyCut;
    addLog(G.age, `🕶️ Sendika (${rObj.title}) operasyonlarından payına **+${fmtMoney(yearlyCut)} Kara Para** düştü.`, 'good');
  }

  if (!G.inPrison && G.dirtyMoney > c.monthlyMinWage * 15 && Math.random() < 0.28) {
    const confiscated = G.dirtyMoney;
    G.dirtyMoney = 0;
    addLog(G.age, `🚨 **MASAK / MALİ ŞUBE BASKINI!** Aklamadığın **${fmtMoney(confiscated)}** kara paraya el konuldu!`, 'bad');
    openCourtTrialModal('Kara Para Aklama & Mali Suçlar', 4);
  }

  if (G.stress >= 80 && !G.diseases.includes('burnout') && Math.random() < 0.45) {
    G.diseases.push('burnout');
    addLog(G.age, `🧠 **AŞIRI STRES (%${G.stress})!** **Tükenmişlik Sendromu & Depresyon** teşhisi konuldu.`, 'bad');
  }
  if (G.age > 35 && G.health < 75 && G.diseases.length === 0 && Math.random() < 0.16) {
    const d = pickRandom(DISEASES_DB);
    G.diseases.push(d.id);
    addLog(G.age, `🤒 **SAĞLIK UYARISI:** **${d.name}** hastalığına yakalandın!`, 'bad');
  }
  G.diseases.forEach(dId => {
    const d = DISEASES_DB.find(x => x.id === dId);
    if (d) { G.health = clamp(G.health - d.hpDrain); G.happy = clamp(G.happy - d.happyDrain); }
  });

  const fin = calculateFinances();
  if (G.age >= 18 || fin.annualNetCashflow !== 0) {
    G.money += fin.annualNetCashflow;
    if (G.loanDebt > 0 && fin.monthlyLoanPayment > 0) {
      if (G.money >= 0) {
        G.loanDebt = Math.max(0, G.loanDebt - fin.monthlyLoanPayment * 12);
        G.creditScore = clamp(G.creditScore + 35, 300, 1900);
      } else {
        G.creditScore = clamp(G.creditScore - 110, 300, 1900);
      }
    }
    addLog(G.age, `💳 ${fin.annualNetCashflow >= 0 ? `Yıllık net nakit akışın **+${fmtMoney(fin.annualNetCashflow)}** oldu.` : `Yıllık giderlerin gelirini aştı: **${fmtMoney(fin.annualNetCashflow)}**.`}`, fin.annualNetCashflow >= 0 ? 'good' : 'bad');
  }

  if (G.money > c.monthlyMinWage * 2 && c.inflation >= 0.08) {
    const erosion = Math.round(G.money * (c.inflation * 0.42));
    G.money -= erosion;
    addLog(G.age, `📉 **Enflasyon (%${Math.round(c.inflation * 100)})** nedeniyle vadesizde duran nakit paranın alım gücü **-${fmtMoney(erosion)}** eridi.`, 'bad');
  }

  let totalInvGain = 0;
  Object.keys(MARKET_ASSETS_META).forEach(k => {
    if (G.investments[k] > 0) {
      const gain = Math.round(G.investments[k] * ((G.market.lastPct[k] || 0) / 100));
      G.investments[k] = Math.max(0, G.investments[k] + gain);
      totalInvGain += gain;
    }
  });
  if (totalInvGain !== 0) {
    addLog(G.age, `📊 Yatırım portföyün bu yıl **${totalInvGain >= 0 ? '+' : ''}${fmtMoney(totalInvGain)}** değişti.`, totalInvGain >= 0 ? 'good' : 'bad');
  }

  if (G.bankSavings > 0) {
    const interest = Math.round(G.bankSavings * Math.max(0.12, c.inflation * 0.85));
    G.bankSavings += interest;
    addLog(G.age, `🏦 Vadeli mevduatına **+${fmtMoney(interest)}** faiz eklendi.`, 'good');
  }

  if (G.money < -c.monthlyMinWage * 3 && G.cars.length > 0) {
    const seizedCar = G.cars.pop();
    G.money += Math.round(seizedCar.value * 0.7);
    G.creditScore = clamp(G.creditScore - 180, 300, 1900);
    addLog(G.age, `🚨 **İCRA!** Borçların yüzünden **${seizedCar.name}** aracına haciz konuldu!`, 'bad');
  }

  G.cars.forEach(car => {
    car.cond = clamp(car.cond - randInt(4, 9), 10, 100);
    if (!car.trafficIns && Math.random() < 0.3) {
      const fine = Math.round(c.monthlyMinWage * 0.45);
      G.money -= fine;
      addLog(G.age, `🚓 **${car.name}** aracının Zorunlu Trafik Sigortası olmadığı için **${fmtMoney(fine)}** ceza kesildi!`, 'bad');
    }
  });

  G.houses.forEach(h => {
    h.value = Math.round(h.value * (1 + c.inflation * 0.85));
    h.monthlyRent = Math.round(h.monthlyRent * (1 + c.inflation * 0.8));
    if (h.isRented && h.tenantOk && Math.random() < 0.12) {
      h.tenantOk = false;
      addLog(G.age, `🏠 **Kiracı Krizi!** **${h.name}** mülkündeki kiracı kirayı ödemeyi durdurdu!`, 'bad');
    }
  });

  G.children.forEach(ch => {
    ch.age = (ch.age || 0) + 1;
    if (ch.privateSchool && ch.age < 18) {
      ch.smart = clamp(ch.smart + 5);
      ch.obp = clamp(ch.obp + 4, 50, 100);
    }
    if (ch.trustFund > 0) ch.trustFund = Math.round(ch.trustFund * 1.15);
  });

  G.relations.forEach(r => {
    if (r.alive) {
      r.age += 1;
      if (r.age > 76 && Math.random() < 0.14) {
        r.alive = false;
        G.happy = clamp(G.happy - 18);
        const inh = Math.round(c.monthlyMinWage * randInt(12, 48));
        G.money += inh;
        addLog(G.age, `🖤 ${r.role}n **${r.name}** (${r.age}) vefat etti. Sana **${fmtMoney(inh)}** miras kaldı.`, 'bad');
      }
    }
  });

  if (G.age > 65) G.health = clamp(G.health - randInt(3, 8));
  if (G.health <= 0 || (G.age > 85 && Math.random() < 0.25)) {
    G.alive = false;
    playSfx('bad');
    addLog(G.age, `⚰️ **${G.age}** yaşında hayata veda ettin. Toplam net servetin: **${fmtMoney(getNetWorth())}**.`, 'bad');
    saveGame(); renderAll(); openDeathModal();
    return;
  }

  if (!G.inPrison) triggerYearlyEvents();
  saveGame();
  renderAll();
}

/* ---------------- 8. YILLIK OLAY MOTORU ---------------- */
function triggerYearlyEvents() {
  const c = getCountry();

  if (G.age === 18 && G.highSchoolGrad && !G.uniGrad && G.eduStage !== 'Üniversite') {
    openUniversityExamModal(); return;
  }

  if (c.id === 'SA' && G.gender === 'F' && G.age === 16 && !G.partner) {
    const mehir = c.monthlyMinWage * 30;
    openEventModal({
      badge: '🇸🇦 Ülke Kültürü Olayı',
      title: 'Aileden Erken Evlilik Baskısı',
      desc: `Ailen varlıklı bir ailenin oğluyla evlenmeni istiyor. Kabul edersen ${fmtMoney(mehir)} mehir alacaksın.`,
      choices: [
        { label: `💍 Kabul Et (+${fmtMoney(mehir)} Mehir)`, action: () => { G.money += mehir; G.partner = { name: 'Salman Al-Qahtani', age: 27, love: 65, married: true, prenup: false, cheated: false }; addLog(G.age, `💍 Erken yaşta evlendin ve **${fmtMoney(mehir)}** mehir aldın.`, 'milestone'); renderAll(); } },
        { label: '📚 Reddet ve Eğitiminde Israrcı Ol', action: () => { G.obpScore = clamp(G.obpScore + 6, 50, 100); addLog(G.age, `📚 Evlilik teklifini reddedip eğitimine odaklandın.`); renderAll(); } }
      ]
    });
    return;
  }

  if (c.militaryAge && G.gender === 'M' && G.age === c.militaryAge && !G.militaryDone && G.eduStage !== 'Üniversite') {
    const choices = [{ label: '🪖 6 Ay Zorunlu Askerliğe Git', action: () => { G.militaryDone = true; G.health = clamp(G.health + 4); addLog(G.age, `🪖 Zorunlu askerlik görevini tamamlayıp terhis oldun.`, 'milestone'); renderAll(); } }];
    if (c.paidMilitaryCost > 0) {
      choices.push({ label: `💳 Bedelli Askerlik Yap (${fmtMoney(c.paidMilitaryCost)})`, action: () => {
        if (G.money >= c.paidMilitaryCost) { G.money -= c.paidMilitaryCost; addLog(G.age, `💳 **${fmtMoney(c.paidMilitaryCost)}** ödeyerek bedelli askerlik yaptın.`, 'good'); }
        else showToast('Bakiye yetersiz, kışlaya alındın!');
        G.militaryDone = true; renderAll();
      }});
    }
    openEventModal({ badge: `${c.flag} Askerlik Celbi`, title: 'Askerlik Yoklaması Geldi', desc: `${c.name} yasalarına göre askerlik çağına geldin.`, choices });
    return;
  }

  if (G.partner && G.partner.married && !G.partner.cheated && Math.random() < 0.12) {
    const detCost = Math.round(c.monthlyMinWage * 1.2);
    openEventModal({
      badge: '💔 Evlilik Krizi & Şüphe',
      title: `${G.partner.name} Son Günlerde Çok Gizemli`,
      desc: `Eşinin telefonunu sakladığını fark ettin. Özel dedektif tutarsan mahkemede kusurlu sayılmasını sağlayabilirsin.`,
      choices: [
        { label: `🕵️ Özel Dedektif Tut (${fmtMoney(detCost)})`, action: () => { if (G.money < detCost) { showToast('Para yetmedi!'); return; } G.money -= detCost; G.partner.cheated = true; addLog(G.age, `🕵️ Özel dedektif eşin **${G.partner.name}**'in seni aldattığını kanıtladı!`, 'bad'); renderAll(); } },
        { label: '🗣️ Doğrudan Yüzleş', action: () => { G.partner.love = clamp(G.partner.love - 25); addLog(G.age, `🗣️ Eşinle sert bir tartışma yaşadın.`, 'bad'); renderAll(); } }
      ]
    });
    return;
  }

  if (G.politics.officeId && Math.random() < 0.28) {
    const bribe = Math.round(c.monthlyMinWage * 35);
    openEventModal({
      badge: '🏛️ Siyasi Kulis & İhale Dosyası',
      title: 'Kapalı Kapılar Ardında Dev İhale Teklifi',
      desc: `Bir müteahhitlik grubu ihale onayı karşılığında gizli hesabına ${fmtMoney(bribe)} teklif ediyor.`,
      choices: [
        { label: `💼 Teklifi Kabul Et (+${fmtMoney(bribe)} Kara Para)`, action: () => {
          if (Math.random() < 0.65) { G.dirtyMoney += bribe; addLog(G.age, `🕶️ İhale komisyonundan **+${fmtMoney(bribe)}** kara para kasana girdi.`, 'good'); }
          else { G.politics.officeId = null; G.politics.approval = 5; addLog(G.age, `🚨 **SKANDAL!** İhale yolsuzluğu basına sızdı, Yüce Divan'a sevk edildin!`, 'bad'); openCourtTrialModal('Yüce Divan — Görevi Kötüye Kullanma', 6); }
          renderAll();
        }},
        { label: '⚖️ Reddet ve Şeffaf İhale Yap (+Halk Desteği)', action: () => { G.politics.approval = clamp(G.politics.approval + 14); G.fame = clamp(G.fame + 8); addLog(G.age, `👏 Şeffaf ihale yaptın! Halk desteğin **%${G.politics.approval}** oldu.`, 'good'); renderAll(); } }
      ]
    });
    return;
  }

  if (G.sports.branchId && Math.random() < 0.30) {
    const bonus = Math.round(c.monthlyMinWage * (G.sports.tierIndex + 1) * 5);
    openEventModal({
      badge: '🏟️ Şampiyonluk Maçı Krizi',
      title: 'Final Maçı Öncesi Kas Ağrısı',
      desc: `Sezonun en kritik final maçı öncesi ağrın var. İğneyle sahaya çıkarsan ${fmtMoney(bonus)} prim kazanabilirsin.`,
      choices: [
        { label: `🔥 İğneyle Sahaya Çık (${fmtMoney(bonus)} Prim)`, action: () => {
          if (Math.random() < 0.65) { G.money += bonus; G.sports.skill = clamp(G.sports.skill + 7); addLog(G.age, `🏆 Finalde takımını şampiyon yaptın! **+${fmtMoney(bonus)}** prim aldın.`, 'fame'); }
          else { G.sports.injured = true; G.health = clamp(G.health - 20); addLog(G.age, `🩼 Maçta bağların koptu! Ağır sakatlık geçirdin.`, 'bad'); }
          renderAll();
        }},
        { label: '🛡️ Riske Girme ve Dinlen', action: () => { G.health = clamp(G.health + 5); addLog(G.age, `🛡️ Riske girmeyip sağlığını korudun.`); renderAll(); } }
      ]
    });
    return;
  }

  if (typeof RANDOM_EVENTS_DB !== 'undefined' && Array.isArray(RANDOM_EVENTS_DB)) {
    const eligible = RANDOM_EVENTS_DB.filter(ev => {
      if (G.age < ev.minAge || G.age > ev.maxAge) return false;
      if (ev.onlyUni && G.eduStage !== 'Üniversite') return false;
      if (ev.requiresCar && G.cars.length === 0) return false;
      if (ev.requiresJob && !G.jobId) return false;
      if (ev.requiresChild && G.children.length === 0) return false;
      return true;
    });
    if (eligible.length > 0 && Math.random() < 0.60) {
      const picked = pickRandom(eligible);
      openEventModal({
        badge: picked.badge || '🎲 Yaşam Olayı',
        title: picked.title,
        desc: picked.desc,
        choices: picked.choices.map(ch => ({
          label: ch.label,
          action: () => {
            const res = ch.effect(G, c);
            if (res && res.text) {
              addLog(G.age, res.text, res.type || 'normal');
              if (res.type === 'good' || res.type === 'milestone' || res.type === 'fame') playSfx('coin');
              if (res.type === 'bad') playSfx('bad');
            }
            saveGame(); renderAll();
          }
        }))
      });
    }
  }
}

/* ---------------- 9. GÖRSEL KART, BORDRO, MİZAN & VİZE OLUŞTURUCULAR ---------------- */
function renderPayrollSlipHTML() {
  const fin = calculateFinances();
  if (fin.monthlyGrossSalary <= 0) return '';
  const c = getCountry();
  let jobTitle = 'Kurumsal Personel';
  if (G.politics.officeId) jobTitle = (POLITICS_OFFICES.find(o => o.id === G.politics.officeId) || {}).title;
  else if (G.sports.branchId) jobTitle = (SPORTS_BRANCHES.find(b => b.id === G.sports.branchId) || {}).name;
  else if (G.jobId) jobTitle = (JOBS.find(j => j.id === G.jobId) || {}).title;

  return `
    <div class="official-doc-card mb-2.5 space-y-1.5">
      <div class="flex items-center justify-between border-b border-slate-800 pb-1">
        <span class="text-[9px] font-extrabold text-emerald-400 uppercase">🧾 E-BORDRO &bull; RESMİ MAAŞ PUSULASI (${c.code})</span>
        <span class="text-[9px] font-mono-num text-slate-400">KIDEM: ${G.jobExp || 0} YIL</span>
      </div>
      <div class="text-[10px] font-bold text-white">${jobTitle}</div>
      <table class="ledger-table font-mono-num">
        <tr><td class="text-slate-400">Brüt Tahakkuk Tutarı</td><td class="text-right text-slate-200 font-bold">${fmtMoney(fin.monthlyGrossSalary)}</td></tr>
        <tr><td class="text-slate-400">SGK İşçi &amp; İşsizlik Primi (%14)</td><td class="text-right text-rose-400">-${fmtMoney(fin.sgkCut)}</td></tr>
        <tr><td class="text-slate-400">Gelir &amp; Damga Vergisi (%${Math.round(getEffectiveTaxRate() * 100)})</td><td class="text-right text-rose-400">-${fmtMoney(fin.incomeTaxCut)}</td></tr>
        <tr><td class="text-emerald-400 font-extrabold">NET ÖDENEN MAAŞ</td><td class="text-right text-emerald-400 font-extrabold">${fmtMoney(fin.monthlyNetSalary)}</td></tr>
      </table>
    </div>
  `;
}

function renderCorporateMizanHTML() {
  if (!G.businesses || G.businesses.length === 0) return '';
  const fin = calculateFinances();
  return `
    <div class="official-doc-card mb-2.5 space-y-1.5">
      <div class="flex items-center justify-between border-b border-slate-800 pb-1">
        <span class="text-[9px] font-extrabold text-amber-400 uppercase">📑 TEKDÜZEN HESAP PLANI &bull; AYLIK MİZAN &amp; GELİR TABLOSU</span>
        <span class="text-[9px] font-mono-num text-emerald-400">${G.businesses.length} ŞİRKET</span>
      </div>
      <table class="ledger-table font-mono-num">
        <thead>
          <tr class="text-slate-400"><th class="text-left">THP Hesap Kodu / Açıklama</th><th class="text-right">Aylık Tutar</th></tr>
        </thead>
        <tbody>
          <tr><td class="text-slate-300">600. Yurt İçi &amp; İhracat Brüt Satışlar</td><td class="text-right text-emerald-400">+${fmtMoney(fin.monthlyBizRevenue)}</td></tr>
          <tr><td class="text-slate-300">740. Hizmet / Filo &amp; Personel Gideri (-)</td><td class="text-right text-rose-400">-${fmtMoney(fin.monthlyBizOperatingCost)}</td></tr>
          <tr><td class="text-slate-300">691. Kurumlar Vergisi Karşılığı (-)</td><td class="text-right text-rose-400">-${fmtMoney(fin.monthlyBizTax)}</td></tr>
          <tr><td class="text-white font-extrabold">692. DÖNEM NET KÂRI (NET PROFIT)</td><td class="text-right text-emerald-400 font-extrabold">+${fmtMoney(fin.monthlyBizProfit)}</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

function renderPassportVisaStampsHTML() {
  if (!G.visas || G.visas.length === 0) return '';
  return `
    <div class="official-doc-card mb-2.5 space-y-2">
      <div class="flex items-center justify-between border-b border-slate-800 pb-1">
        <span class="text-[9px] font-extrabold text-sky-400 uppercase">🛂 PASAPORT VİZE &amp; SINIR GİRİŞ MÜHÜRLERİ</span>
        <span class="text-[9px] font-mono-num text-slate-400">${G.visas.length} MÜHÜR</span>
      </div>
      <div class="flex flex-wrap gap-2 pt-1">
        ${G.visas.map(v => {
          const cnt = getCountry(v.code);
          return `
            <div class="passport-visa-stamp">
              <div>${cnt.flag} ${cnt.code} &bull; ENTRY</div>
              <div class="text-[8px] text-slate-300">${v.type} (YAŞ ${v.age})</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderDigitalBankingHeaderHTML() {
  const c = getCountry();
  const netWorth = getNetWorth();
  let tierClass = 'card-tier-classic', tierName = 'CLASSIC DEBIT';
  if (netWorth >= c.monthlyMinWage * 100) { tierClass = 'card-tier-black'; tierName = 'OBSIDIAN VIP WORLD'; }
  else if (netWorth >= c.monthlyMinWage * 25) { tierClass = 'card-tier-gold'; tierName = 'PLATINUM PRESTIGE'; }

  const score = clamp(G.creditScore, 300, 1900);
  const dashOffset = (126 * (1 - (score - 300) / 1600)).toFixed(1);
  const scoreColor = score >= 1400 ? '#10b981' : (score >= 950 ? '#f59e0b' : '#f43f5e');
  const riskLabel = score >= 1400 ? 'Çok İyi (Düşük Risk)' : (score >= 950 ? 'Orta Riskli' : 'Yüksek Risk');

  const cashVal = Math.max(0, G.money + G.bankSavings);
  const invVal = getTotalPortfolioValue();
  const propVal = G.cars.reduce((a, x) => a + (x.value || 0), 0) + G.houses.reduce((a, x) => a + (x.value || 0), 0);
  const totalAssets = Math.max(1, cashVal + invVal + propVal);
  const pCash = Math.round((cashVal / totalAssets) * 100);
  const pInv = Math.round((invVal / totalAssets) * 100);
  const pProp = Math.max(0, 100 - pCash - pInv);

  return `
    <div class="virtual-bank-card ${tierClass} mb-2.5">
      <div class="flex items-center justify-between mb-2.5">
        <div>
          <div class="text-[9px] font-extrabold tracking-widest text-slate-300 uppercase">${c.flag} ${c.name} MERKEZ BANKACILIK</div>
          <div class="text-xs font-extrabold text-amber-300 tracking-wider">${tierName}</div>
        </div>
        <span class="text-xs font-mono-num text-slate-300">💳 NFC</span>
      </div>
      <div class="text-[11px] font-mono-num tracking-widest text-slate-200 mb-2.5">${getCharacterIBAN()}</div>
      <div class="flex items-end justify-between">
        <div>
          <div class="text-[8px] text-slate-400 uppercase">KART SAHİBİ</div>
          <div class="text-xs font-extrabold text-white uppercase">${G.firstName} ${G.lastName}</div>
        </div>
        <div class="text-right">
          <div class="text-[8px] text-slate-400 uppercase">NET SERVET</div>
          <div class="text-sm font-extrabold font-mono-num text-emerald-400">${fmtMoney(netWorth)}</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2 mb-2.5">
      <div class="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
        <div class="text-[9px] font-extrabold text-slate-400 uppercase mb-1">Findeks Kredi Notu</div>
        <svg viewBox="0 0 100 55" class="w-24 h-12 overflow-visible">
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" stroke-width="9" stroke-linecap="round"/>
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="${scoreColor}" stroke-width="9" stroke-linecap="round" stroke-dasharray="126" stroke-dashoffset="${dashOffset}"/>
          <text x="50" y="46" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="800" font-family="JetBrains Mono">${score}</text>
        </svg>
        <div class="text-[9px] font-bold" style="color:${scoreColor}">${riskLabel}</div>
      </div>
      <div class="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
        <div class="text-[9px] font-extrabold text-slate-400 uppercase">Varlık Dağılımı</div>
        <div class="h-2.5 w-full rounded-full bg-slate-950 overflow-hidden flex my-1">
          <div style="width:${pCash}%" class="bg-emerald-400"></div>
          <div style="width:${pInv}%" class="bg-sky-400"></div>
          <div style="width:${pProp}%" class="bg-amber-400"></div>
        </div>
        <div class="space-y-0.5 text-[9px] font-mono-num">
          <div class="flex justify-between"><span class="text-emerald-400">● Nakit:</span><span>%${pCash}</span></div>
          <div class="flex justify-between"><span class="text-sky-400">● Borsa/Altın:</span><span>%${pInv}</span></div>
          <div class="flex justify-between"><span class="text-amber-400">● Mülk/Araç:</span><span>%${pProp}</span></div>
        </div>
      </div>
    </div>
  `;
}

function buildStockChartSVG(assetKey) {
  const series = G.market.history[assetKey] || [100, 105, 110];
  const pct = G.market.lastPct[assetKey] || 0;
  const strokeColor = pct >= 0 ? '#10b981' : '#f43f5e';
  const gradId = 'chartGrad_' + assetKey;
  const w = 340, h = 115, padX = 12, padY = 14;
  const minVal = Math.min(...series), maxVal = Math.max(...series);
  const range = Math.max(1, maxVal - minVal);

  const points = series.map((val, idx) => {
    const x = padX + (idx / Math.max(1, series.length - 1)) * (w - padX * 2);
    const y = h - padY - ((val - minVal) / range) * (h - padY * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const polylinePoints = points.join(' ');
  const areaPoints = `${padX},${h - 4} ${polylinePoints} ${w - padX},${h - 4}`;
  const lastPt = points[points.length - 1].split(',');

  return `
    <svg viewBox="0 0 ${w} ${h}" class="w-full h-28 overflow-visible">
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.38" />
          <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0.0" />
        </linearGradient>
      </defs>
      <polygon points="${areaPoints}" fill="url(#${gradId})" />
      <polyline fill="none" stroke="${strokeColor}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" points="${polylinePoints}" />
      <circle cx="${lastPt[0]}" cy="${lastPt[1]}" r="4.5" fill="${strokeColor}" stroke="#090d16" stroke-width="2" />
    </svg>
  `;
}

function renderInteractiveBorsaView() {
  const c = getCountry();
  const meta = MARKET_ASSETS_META[selectedChartAsset] || MARKET_ASSETS_META.stock;
  const series = G.market.history[selectedChartAsset];
  const curPrice = series[series.length - 1];
  const lastPct = G.market.lastPct[selectedChartAsset] || 0;
  const isUp = lastPct >= 0;

  const invested = G.investments[selectedChartAsset] || 0;
  const basis = G.market.costBasis[selectedChartAsset] || 0;
  const profit = invested - basis;
  const profitPct = basis > 0 ? ((profit / basis) * 100).toFixed(1) : '0.0';
  const buyUnit = Math.round(c.monthlyMinWage * 2);

  return `
    <div class="grid grid-cols-4 gap-1.5 mb-2">
      ${Object.values(MARKET_ASSETS_META).map(a => {
        const active = a.key === selectedChartAsset;
        const p = G.market.lastPct[a.key] || 0;
        return `
          <button onclick="selectedChartAsset='${a.key}'; openNavSheet('finance');" class="p-2 rounded-xl border text-left transition ${active ? 'border-emerald-500 bg-emerald-500/15' : 'border-slate-800 bg-slate-900/80'}">
            <div class="text-xs font-extrabold text-white truncate">${a.icon} ${a.name.split(' ')[0]}</div>
            <div class="text-[10px] font-mono-num font-bold ${p >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${p >= 0 ? '+' : ''}${p.toFixed(1)}%</div>
          </button>`;
      }).join('')}
    </div>

    <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs font-extrabold text-white">${meta.icon} ${meta.name} <span class="text-[10px] text-slate-400 font-mono-num">(${meta.ticker})</span></div>
          <div class="text-[10px] text-slate-400">${meta.risk}</div>
        </div>
        <div class="text-right">
          <div class="text-sm font-extrabold font-mono-num text-white">${curPrice.toLocaleString('tr-TR')}</div>
          <div class="inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono-num font-extrabold ${isUp ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}">
            ${isUp ? '▲ +' : '▼ '}${lastPct.toFixed(1)}%
          </div>
        </div>
      </div>
      ${buildStockChartSVG(selectedChartAsset)}
      <div class="flex justify-between text-[10px] font-mono-num text-slate-400 border-t border-slate-800/80 pt-1.5">
        <span>Dip: <strong class="text-slate-200">${Math.min(...series).toLocaleString('tr-TR')}</strong></span>
        <span>Zirve: <strong class="text-slate-200">${Math.max(...series).toLocaleString('tr-TR')}</strong></span>
        <span>Gün İçi Hak: <strong class="text-emerald-400">${3 - (G.market.tradesThisYear || 0)}/3</strong></span>
      </div>
    </div>

    <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
      <div class="flex justify-between text-xs"><span class="text-slate-400">Yatırım Bakiyen:</span><span class="font-mono-num font-extrabold text-white">${fmtMoney(invested)}</span></div>
      <div class="flex justify-between text-[11px]"><span class="text-slate-400">Net Kâr / Zarar:</span><span class="font-mono-num font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${profit >= 0 ? '+' : ''}${fmtMoney(profit)} (${profit >= 0 ? '+' : ''}${profitPct}%)</span></div>
      <div class="grid grid-cols-3 gap-1.5 pt-1">
        <button onclick="executeChartTrade('${selectedChartAsset}', 'buy_unit', ${buyUnit})" class="py-2 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-extrabold">+ Al (${fmtMoney(buyUnit)})</button>
        <button onclick="executeChartTrade('${selectedChartAsset}', 'buy_half', 0)" class="py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">Nakit %50 Al</button>
        <button onclick="executeChartTrade('${selectedChartAsset}', 'sell_all', 0)" class="py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold">Tümünü Sat</button>
      </div>
      <button onclick="simulateDayTradeTick('${selectedChartAsset}')" class="w-full py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-extrabold">
        ⚡ Gün İçi Canlı Mum Hareketi Yakala (Hızlı Trade)
      </button>
    </div>
  `;
}

function renderCarExpertiseSVGModal(car, idx) {
  const cond = car.cond || 100;
  const hoodColor = cond >= 85 ? '#10b981' : (cond >= 60 ? '#f59e0b' : '#f43f5e');
  const roofColor = cond >= 50 ? '#10b981' : '#f59e0b';
  const trunkColor = cond >= 78 ? '#10b981' : '#f59e0b';
  const leftDoors = cond >= 70 ? '#10b981' : (cond >= 48 ? '#f59e0b' : '#f43f5e');
  const rightDoors = cond >= 90 ? '#10b981' : '#f59e0b';
  const statusText = clr => clr === '#10b981' ? 'Orijinal' : (clr === '#f59e0b' ? 'Boyalı' : 'Değişen');
  const plate = getCharacterPlate(idx);

  return `
    <div class="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-2.5 mb-2.5">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <div>
          <div class="text-[10px] font-extrabold text-emerald-400 uppercase">📋 TSE ONAYLI OTO EKSPERTİZ RAPORU</div>
          <div class="text-xs font-extrabold text-white">${car.name}</div>
        </div>
        <div class="license-plate"><span class="license-plate-blue">${plate.country}</span><span class="license-plate-num">${plate.text}</span></div>
      </div>
      <div class="grid grid-cols-2 gap-3 items-center">
        <div class="flex flex-col items-center bg-slate-900/90 p-2 rounded-xl border border-slate-800">
          <svg viewBox="0 0 120 200" class="w-20 h-32">
            <rect x="20" y="10" width="80" height="180" rx="22" fill="#0f172a" stroke="#475569" stroke-width="2"/>
            <path d="M 26 20 Q 60 12 94 20 L 90 62 L 30 62 Z" fill="${hoodColor}" fill-opacity="0.75" stroke="#090d16" stroke-width="1.5"/>
            <text x="60" y="44" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">KAPUT</text>
            <rect x="36" y="84" width="48" height="52" rx="4" fill="${roofColor}" fill-opacity="0.75" stroke="#090d16" stroke-width="1.5"/>
            <text x="60" y="113" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">TAVAN</text>
            <path d="M 30 154 L 90 154 L 92 182 Q 60 188 28 182 Z" fill="${trunkColor}" fill-opacity="0.75" stroke="#090d16" stroke-width="1.5"/>
            <text x="60" y="172" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">BAGAJ</text>
            <rect x="20" y="66" width="12" height="82" rx="3" fill="${leftDoors}" fill-opacity="0.85"/>
            <rect x="88" y="66" width="12" height="82" rx="3" fill="${rightDoors}" fill-opacity="0.85"/>
          </svg>
        </div>
        <div class="space-y-1 text-[10px]">
          <div class="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <div class="text-slate-400">Dyno Motor Performansı</div>
            <div class="text-xs font-extrabold font-mono-num text-emerald-400">%${cond} HP</div>
          </div>
          <div class="flex justify-between"><span>Ön Kaput:</span><strong class="text-white">${statusText(hoodColor)}</strong></div>
          <div class="flex justify-between"><span>Tavan:</span><strong class="text-white">${statusText(roofColor)}</strong></div>
          <div class="flex justify-between"><span>Sol Yan:</span><strong class="text-white">${statusText(leftDoors)}</strong></div>
          <div class="flex justify-between"><span>Sağ Yan:</span><strong class="text-white">${statusText(rightDoors)}</strong></div>
          <div class="flex justify-between"><span>Bagaj:</span><strong class="text-white">${statusText(trunkColor)}</strong></div>
        </div>
      </div>
    </div>
  `;
}

function renderOfficialIdentityAndDocumentsHTML() {
  const c = getCountry();
  const idNo = getCharacterNationalId();
  return `
    <div class="national-id-card space-y-2 mb-2.5">
      <div class="flex items-center justify-between border-b border-sky-500/25 pb-1.5">
        <div class="flex items-center gap-2">
          <span class="text-lg">${c.flag}</span>
          <div>
            <div class="text-[10px] font-extrabold text-sky-400 uppercase">${c.name} CUMHURİYETİ</div>
            <div class="text-[8px] text-slate-400 font-bold uppercase">ULUSAL KİMLİK KARTI / IDENTITY CARD</div>
          </div>
        </div>
        <div class="text-right font-mono-num text-[10px] text-white font-extrabold">${idNo}</div>
      </div>
      <div class="flex items-center gap-3">
        <img src="${getCurrentPortrait()}" class="w-14 h-16 rounded-xl object-cover border border-sky-400/50 bg-slate-800 shrink-0" />
        <div class="grid grid-cols-2 gap-x-3 gap-y-1 flex-1 text-[10px]">
          <div><span class="text-slate-400 text-[8px] block">SOYADI</span><strong class="text-white uppercase">${G.lastName}</strong></div>
          <div><span class="text-slate-400 text-[8px] block">ADI</span><strong class="text-white uppercase">${G.firstName}</strong></div>
          <div><span class="text-slate-400 text-[8px] block">DOĞUM YILI</span><strong class="text-slate-200 font-mono-num">${2026 - G.age} (${G.age})</strong></div>
          <div><span class="text-slate-400 text-[8px] block">KUŞAK</span><strong class="text-emerald-400">#${G.generation}</strong></div>
        </div>
      </div>
    </div>

    ${renderPassportVisaStampsHTML()}

    <div class="official-doc-card space-y-1.5 mb-2.5">
      <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
        <div>
          <div class="text-[8px] font-extrabold text-slate-400 uppercase">ADALET BAKANLIĞI &bull; E-DEVLET KAPISI</div>
          <div class="text-xs font-extrabold text-white">Barkodlu Adli Sicil Kaydı</div>
        </div>
        <div class="${G.criminalRecord ? 'official-stamp-alert' : 'official-stamp-clean'}">${G.criminalRecord ? 'SABIKALI' : 'TEMİZDİR'}</div>
      </div>
      <div class="text-[10px] text-slate-300">Yukarıda kimlik bilgileri bulunan <strong>${G.firstName} ${G.lastName}</strong> hakkında <strong>${G.criminalRecord ? 'adli sicil kaydı BULUNMAKTADIR.' : 'adli sicil kaydı BULUNMAMAKTADIR.'}</strong></div>
    </div>
  `;
}

/* ---------------- 10. ALT NAVBAR SEKMELERİ ---------------- */
function openNavSheet(tab) {
  normalizeState();
  const sheet = document.getElementById('bottomSheet');
  const title = document.getElementById('sheetTitle');
  const sub = document.getElementById('sheetSubtitle');
  const body = document.getElementById('sheetBody');
  const c = getCountry();
  sheet.classList.remove('hidden');

  if (tab === 'career') {
    if (G.inPrison) {
      title.textContent = '⛓️ Cezaevi Koğuşu & Avlu';
      sub.textContent = `Tahliyeye Kalan Süre: ${G.prisonYearsLeft} Yıl`;
      body.innerHTML = `
        <div class="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-2">
          <div class="text-xs font-extrabold text-rose-300">🚨 Cezaevindesin (${G.prisonYearsLeft} Yıl Kaldı)</div>
          <div class="grid grid-cols-1 gap-2 pt-2">
            <button onclick="prisonAction('gym')" class="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white text-left">🏋️ Avluda Ağırlık Çalış (+Sağlık & Görünüm)</button>
            <button onclick="prisonAction('library')" class="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white text-left">📚 Cezaevi Kütüphanesinde Hukuk Oku (+Zeka)</button>
            <button onclick="prisonAction('appeal')" class="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300 text-left">⚖️ İyi Hal İndirimi Dilekçesi Ver</button>
            <button onclick="prisonAction('escape')" class="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs font-bold text-rose-300 text-left">🏃 Tünel Kazıp Firar Etmeyi Dene</button>
          </div>
        </div>`;
      return;
    }

    title.textContent = '🎓 Eğitim, Bordro, Spor & Siyaset';
    sub.textContent = `${G.eduStage} • OBP: ${G.obpScore} • Sicil: ${G.criminalRecord ? 'Sabıkalı ⚠️' : 'Temiz ✓'}`;

    const percentile = G.lastExamRank ? Math.max(0.1, Math.min(99, (G.lastExamRank / 30000))).toFixed(2) : '--';
    let html = renderHeroBannerHTML('career') + renderPayrollSlipHTML() + `
      <div class="official-doc-card mb-2.5 space-y-1.5">
        <div class="flex items-center justify-between border-b border-slate-800 pb-1">
          <span class="text-[9px] font-extrabold text-sky-400 uppercase">ÖSYM &bull; ULUSAL SINAV SONUÇ BELGESİ</span>
          <span class="text-[9px] font-mono-num text-emerald-400">Aday #${getCharacterNationalId().slice(-6)}</span>
        </div>
        <div class="grid grid-cols-4 gap-1.5 text-center">
          <div class="p-1.5 rounded-lg bg-slate-950 border border-slate-800"><div class="text-[8px] text-slate-400">OBP</div><div class="text-xs font-extrabold font-mono-num text-white">${G.obpScore}</div></div>
          <div class="p-1.5 rounded-lg bg-slate-950 border border-slate-800"><div class="text-[8px] text-slate-400">YKS Puanı</div><div class="text-xs font-extrabold font-mono-num text-emerald-400">${G.lastExamScore || '-'}</div></div>
          <div class="p-1.5 rounded-lg bg-slate-950 border border-slate-800"><div class="text-[8px] text-slate-400">Sıralama</div><div class="text-xs font-extrabold font-mono-num text-amber-400">${G.lastExamRank ? '#' + G.lastExamRank.toLocaleString('tr-TR') : '-'}</div></div>
          <div class="p-1.5 rounded-lg bg-slate-950 border border-slate-800"><div class="text-[8px] text-slate-400">Dilim</div><div class="text-xs font-extrabold font-mono-num text-sky-400">%${percentile}</div></div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <button onclick="openMenuSection('sports')" class="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 text-left">
          <div class="text-xs font-extrabold text-emerald-300">⚽ Spor & E-Spor</div>
          <div class="text-[10px] text-slate-300">${G.sports.branchId ? 'Aktif Kontratlı' : 'Altyapı & Transfer'}</div>
        </button>
        <button onclick="openMenuSection('politics')" class="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/40 text-left">
          <div class="text-xs font-extrabold text-amber-300">🏛️ Siyaset & Seçim</div>
          <div class="text-[10px] text-slate-300">${G.politics.officeId ? 'Aktif Makamda' : 'Parti & Başkanlık'}</div>
        </button>
      </div>
    `;

    if (G.age >= 6 && G.age < 18) {
      html += `
        <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div class="text-xs font-extrabold text-emerald-400">📚 Okul & YKS Sınav Hazırlığı (+${G.examPrepBonus} Ek Puan)</div>
          <div class="grid grid-cols-2 gap-2">
            <button onclick="studySchoolHard()" class="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">📖 Ders Çalış (+OBP)</button>
            <button onclick="takeExamCourse()" class="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">📝 Deneme Kulübü</button>
          </div>
        </div>`;
    }

    if (G.eduStage === 'Üniversite') {
      html += `
        <div class="p-3 rounded-2xl bg-slate-900 border border-indigo-500/40 space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-xs font-extrabold text-indigo-300">🎓 Kampüs & KYK (${G.uniYearsLeft} Yıl Kaldı)</span>
            <span class="text-[10px] font-bold text-indigo-300">${G.kykSupport === 'burs' ? 'Burslu' : 'KYK Kredili'}</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button onclick="setUniLiving('kyk')" class="p-2 rounded-xl border text-xs font-bold ${G.uniLiving === 'kyk' ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-slate-800 text-slate-400'}">🛏️ KYK Yurdu</button>
            <button onclick="setUniLiving('house')" class="p-2 rounded-xl border text-xs font-bold ${G.uniLiving === 'house' ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-slate-800 text-slate-400'}">🏠 Öğrenci Evi</button>
          </div>
          <div class="space-y-1.5 pt-1">
            ${PART_TIME_JOBS.map(pt => {
              const pay = Math.round(c.monthlyMinWage * pt.mult);
              const act = G.partTimeJobId === pt.id;
              return `<div class="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"><div class="text-[11px] text-white font-semibold">${pt.icon} ${pt.title} <span class="text-emerald-400 font-mono-num">(+${fmtMoney(pay)}/ay)</span></div><button onclick="togglePartTimeJob('${pt.id}')" class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${act ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500 text-slate-950'}">${act ? 'Ayrıl' : 'Gir'}</button></div>`;
            }).join('')}
          </div>
        </div>`;
    }

    if (G.age >= 18 && G.highSchoolGrad && !G.uniGrad && G.eduStage !== 'Üniversite') {
      html += `
        <div class="p-3 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2">
          <div class="flex items-center justify-between">
            <div class="text-xs font-extrabold text-white">🎯 Üniversite Bölüm Tercihleri</div>
            <button onclick="openUniversityExamModal()" class="px-2.5 py-1 rounded-xl bg-emerald-500 text-slate-950 text-[10px] font-extrabold">Sınava Gir</button>
          </div>
          <div class="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
            ${UNI_MAJORS.map(m => {
              const canPub = G.lastExamScore >= m.minScore;
              const canPriv = G.lastExamScore >= (m.minScore - 40);
              return `<div class="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"><div><div class="text-xs font-bold text-white">${m.icon} ${m.name}</div><div class="text-[10px] text-slate-400">Taban: <strong>${m.minScore}</strong> (${m.rankText})</div></div><div class="flex gap-1 shrink-0"><button onclick="enrollUniversity('${m.id}', false)" class="px-2 py-1 rounded-lg text-[10px] font-bold ${canPub ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'}">Devlet</button><button onclick="enrollUniversity('${m.id}', true)" class="px-2 py-1 rounded-lg text-[10px] font-bold ${canPriv ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'}">Özel</button></div></div>`;
            }).join('')}
          </div>
        </div>`;
    }

    html += `
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">💼 Kurumsal İş İlanları</h4>
          ${G.jobId ? `<button onclick="quitJob()" class="text-[11px] font-bold text-rose-400">İstifa Et</button>` : ''}
        </div>
        ${JOBS.map(j => {
          const monthlyGross = getJobMonthlyGross(j);
          const isCurrent = G.jobId === j.id;
          let reqText = 'Diploma Şartı Yok';
          if (j.reqEdu === 'highschool') reqText = 'Lise Mezunu';
          if (j.reqEdu === 'uni') {
            const m = UNI_MAJORS.find(x => x.id === j.major);
            reqText = `${m ? m.name : 'Üniversite'} Mezunu`;
          }
          if (j.reqLicense) reqText += ` • ${j.reqLicense} Ehliyet`;
          if (j.minExp) reqText += ` • ${j.minExp} Yıl Deneyim`;
          const blocked = j.cleanRecord && G.criminalRecord;
          return `
            <div class="p-3 rounded-2xl bg-slate-900 border ${isCurrent ? 'border-emerald-500' : 'border-slate-800'} flex items-center justify-between gap-2">
              <div class="min-w-0">
                <div class="text-xs font-extrabold text-white truncate">${j.icon} ${j.title}</div>
                <div class="text-[10px] text-slate-400">${reqText} ${blocked ? '<span class="text-rose-400 font-bold">• Sabıka Engeli!</span>' : ''}</div>
                <div class="text-xs font-mono-num font-bold text-emerald-400 mt-0.5">Brüt: ${fmtMoney(monthlyGross)} / ay</div>
              </div>
              <button onclick="applyForJob('${j.id}')" class="px-3 py-2 rounded-xl text-xs font-extrabold shrink-0 ${isCurrent ? 'bg-emerald-500/20 text-emerald-300' : (blocked ? 'bg-rose-950 text-rose-400' : 'bg-emerald-500 text-slate-950')}">
                ${isCurrent ? 'Çalışıyor' : (blocked ? 'Sabıkalı' : 'Başvur')}
              </button>
            </div>`;
        }).join('')}
      </div>`;

    body.innerHTML = html;
    return;
  }

  if (tab === 'finance') {
    const fin = calculateFinances();
    title.textContent = `🏦 Dijital Bankacılık, Borsa & Mizan (${c.currency})`;
    sub.textContent = `Findeks: ${G.creditScore} • Portföy: ${fmtMoney(getTotalPortfolioValue())}`;

    const tabBar = `
      <div class="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-2.5">
        <button onclick="activeFinanceTab='bank'; openNavSheet('finance')" class="py-2 rounded-xl text-xs font-extrabold ${activeFinanceTab === 'bank' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}">💳 Banka & Kredi</button>
        <button onclick="activeFinanceTab='invest'; openNavSheet('finance')" class="py-2 rounded-xl text-xs font-extrabold ${activeFinanceTab === 'invest' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}">📈 Borsa & Grafik</button>
        <button onclick="activeFinanceTab='biz'; openNavSheet('finance')" class="py-2 rounded-xl text-xs font-extrabold ${activeFinanceTab === 'biz' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}">🚛 Şirket & Mizan</button>
      </div>`;

    if (activeFinanceTab === 'bank') {
      body.innerHTML = renderHeroBannerHTML('finance') + renderDigitalBankingHeaderHTML() + tabBar + `
        <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
          <div class="flex justify-between items-center mb-1"><span class="font-extrabold text-white">📊 Aylık Hesap Özeti</span><span class="text-[10px] text-emerald-400 font-bold">Vergi: %${Math.round(getEffectiveTaxRate() * 100)}</span></div>
          <div class="flex justify-between text-slate-300"><span>Net Maaş (Bordro Sonrası):</span><span class="font-mono-num text-emerald-400">+${fmtMoney(fin.monthlyNetSalary)}</span></div>
          <div class="flex justify-between text-slate-300"><span>Şirket Net Kârı & Kira Geliri:</span><span class="font-mono-num text-emerald-400">+${fmtMoney(fin.monthlyBizProfit + fin.monthlyRentIncome)}</span></div>
          <div class="flex justify-between text-slate-300"><span>Sosyal Medya Geliri:</span><span class="font-mono-num text-emerald-400">+${fmtMoney(fin.monthlySocialIncome)}</span></div>
          <div class="flex justify-between text-slate-300"><span>Yaşam, Kira & Nafaka:</span><span class="font-mono-num text-rose-400">-${fmtMoney(fin.monthlyLivingExpense)}</span></div>
          <div class="flex justify-between text-slate-300"><span>Araç Yakıt, Sigorta & Kasko:</span><span class="font-mono-num text-rose-400">-${fmtMoney(fin.monthlyCarExpense)}</span></div>
          <div class="flex justify-between text-slate-300"><span>Banka Kredi Taksiti:</span><span class="font-mono-num text-rose-400">-${fmtMoney(fin.monthlyLoanPayment)}</span></div>
          <div class="border-t border-slate-800 pt-1.5 flex justify-between font-extrabold"><span>Aylık Net Akış:</span><span class="font-mono-num ${fin.monthlyNetCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${fin.monthlyNetCashflow >= 0 ? '+' : ''}${fmtMoney(fin.monthlyNetCashflow)}</span></div>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div class="text-xs font-extrabold text-white">🏦 Vadeli Mevduat (${fmtMoney(G.bankSavings)}) & Kredi</div>
          <div class="grid grid-cols-2 gap-2">
            <button onclick="depositSavings()" class="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">Mevduata Yatır (%50)</button>
            <button onclick="withdrawSavings()" class="p-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold">Mevduatı Çek</button>
            <button onclick="takeBankLoan(12)" class="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">İhtiyaç Kredisi (+${fmtMoney(c.monthlyMinWage * 12)})</button>
            <button onclick="takeBankLoan(60)" class="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">Ticari Kredi (+${fmtMoney(c.monthlyMinWage * 60)})</button>
          </div>
          ${G.loanDebt > 0 ? `<button onclick="payOffLoan()" class="w-full py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">Kredi Borcunu Kapat (${fmtMoney(G.loanDebt)})</button>` : ''}
        </div>`;
    } else if (activeFinanceTab === 'invest') {
      body.innerHTML = renderHeroBannerHTML('finance') + tabBar + renderInteractiveBorsaView();
    } else {
      body.innerHTML = renderHeroBannerHTML('finance') + tabBar + renderCorporateMizanHTML() + `
        ${G.dirtyMoney > 0 ? `
          <div class="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-between mb-2">
            <div><div class="text-xs font-extrabold text-amber-300">🧼 Paravan Şirkette Kara Para Akla</div><div class="text-[10px] text-slate-300">Kara Para: <strong>${fmtMoney(G.dirtyMoney)}</strong></div></div>
            <button onclick="launderDirtyMoney()" class="px-3 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold">Akla</button>
          </div>` : ''}
        <div class="space-y-2.5">
          ${G.businesses.map((b, idx) => {
            const bType = BUSINESS_TYPES.find(t => t.id === b.typeId) || BUSINESS_TYPES[0];
            const fleetCost = Math.round(c.monthlyMinWage * (bType.costMinWages * 0.35));
            const empCost = Math.round(c.monthlyMinWage * 2);
            return `
              <div class="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-2">
                <div class="flex justify-between items-center"><span class="text-xs font-extrabold text-white">${bType.icon} ${bType.name}</span><span class="text-[10px] font-bold text-emerald-400">Filo: ${b.fleet} ${bType.unitName} • ${b.employees} Personel</span></div>
                <div class="grid grid-cols-3 gap-1.5 text-[10px]">
                  <button onclick="setBizStrategy(${idx}, 'cheap')" class="py-1.5 rounded-lg border font-bold ${b.strategy === 'cheap' ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-800 text-slate-400'}">Ucuz Sürüm</button>
                  <button onclick="setBizStrategy(${idx}, 'balanced')" class="py-1.5 rounded-lg border font-bold ${b.strategy === 'balanced' ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-800 text-slate-400'}">Dengeli</button>
                  <button onclick="setBizStrategy(${idx}, 'premium')" class="py-1.5 rounded-lg border font-bold ${b.strategy === 'premium' ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-800 text-slate-400'}">Premium (+%22)</button>
                </div>
                <div class="grid grid-cols-2 gap-2 pt-1">
                  <button onclick="expandBizFleet(${idx}, ${fleetCost})" class="p-2 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-extrabold">+1 ${bType.unitName} (${fmtMoney(fleetCost)})</button>
                  <button onclick="hireBizStaff(${idx}, ${empCost})" class="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[11px] font-bold">+2 Personel (${fmtMoney(empCost)})</button>
                </div>
              </div>`;
          }).join('')}
          <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">🚀 Yeni Şirket Aç</h4>
          ${BUSINESS_TYPES.map(b => {
            const cost = c.monthlyMinWage * b.costMinWages;
            const profit = Math.round(c.monthlyMinWage * b.baseProfitMult);
            return `<div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"><div><div class="text-xs font-extrabold text-white">${b.icon} ${b.name}</div><div class="text-[10px] text-slate-400">Sermaye: ${fmtMoney(cost)} • Net Kâr: <strong class="text-emerald-400">+${fmtMoney(profit)}/ay</strong></div></div><button onclick="createNewBusiness('${b.id}')" class="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold shrink-0">Kur</button></div>`;
          }).join('')}
        </div>`;
    }
    return;
  }

  if (tab === 'relations') {
    title.textContent = '❤️ Evlilik, Çocuklar & Miras';
    sub.textContent = G.partner ? `Partner: ${G.partner.name} (${G.partner.married ? 'Evli' : 'Sevgili'})` : 'Bekar';

    body.innerHTML = renderHeroBannerHTML('relations') + `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
        <div class="text-xs font-extrabold text-rose-400">💘 Romantik Hayat & Evlilik Hukuku</div>
        ${G.partner ? `
          <div class="text-xs text-white font-bold">${G.partner.name} (${G.partner.age} Yaş) • Sevgi: %${G.partner.love} ${G.partner.cheated ? '<span class="text-rose-400 font-extrabold">(Aldatma Kanıtlandı!)</span>' : ''}</div>
          <div class="grid grid-cols-2 gap-2 pt-1">
            <button onclick="datePartnerAction('gift')" class="p-2 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-bold">🎁 Hediye Al (${fmtMoney(c.monthlyMinWage * 0.3)})</button>
            ${!G.partner.married ? `
              <button onclick="datePartnerAction('marry_normal')" class="p-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold">💍 Evlen (${fmtMoney(c.monthlyMinWage * 3)})</button>
              <button onclick="datePartnerAction('marry_prenup')" class="col-span-2 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold">📜 Evlilik Sözleşmesi (Mal Ayrılığı) İle Evlen</button>
            ` : `
              <button onclick="datePartnerAction('child')" class="p-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold">👶 Çocuk Sahibi Ol</button>
              <button onclick="datePartnerAction('detective')" class="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">🕵️ Özel Dedektif Tut</button>
              <button onclick="datePartnerAction('divorce')" class="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-extrabold">⚖️ Boşanma Davası Aç</button>
            `}
          </div>
        ` : `<button onclick="findPartner()" class="w-full py-2.5 rounded-xl bg-rose-500 text-white text-xs font-extrabold">💘 Yeni Bir Partner Ara (16+ Yaş)</button>`}
      </div>

      <div class="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2.5">
        <div class="flex justify-between items-center">
          <span class="text-xs font-extrabold text-emerald-400">👨‍👩‍👧‍👦 Çocukların & Ebeveynlik (${G.children.length})</span>
          <span class="text-[10px] text-slate-400">Eğitim, Harçlık & Miras</span>
        </div>
        ${G.children.length === 0 ? `<div class="text-[11px] text-slate-400">Henüz çocuğun yok.</div>` : `
          <div class="space-y-2">
            ${G.children.map((ch, idx) => `
              <div class="p-3 rounded-xl bg-slate-950 border ${G.willChildIndex === idx ? 'border-amber-400' : 'border-slate-800'} flex items-center justify-between gap-2">
                <div>
                  <div class="text-xs font-extrabold text-white">${ch.gender === 'F' ? '👧' : '👦'} ${ch.name} (${ch.age || 0} Yaş)</div>
                  <div class="text-[10px] text-slate-400">🧠 Zeka: <strong>%${ch.smart}</strong> • 😊 Mut: <strong>%${ch.happy}</strong> • OBP: <strong>${ch.obp}</strong></div>
                  ${ch.trustFund > 0 ? `<div class="text-[10px] text-emerald-400 font-mono-num">🏦 Kumbara: ${fmtMoney(ch.trustFund)}</div>` : ''}
                </div>
                <div class="flex flex-col gap-1 shrink-0">
                  <button onclick="openChildInteractionSheet(${idx})" class="px-2.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-[10px] font-extrabold">👨‍👧 Etkileşim & Eğitim</button>
                  <button onclick="G.willChildIndex=${idx}; saveGame(); openNavSheet('relations');" class="px-2 py-1 rounded-lg text-[9px] font-bold ${G.willChildIndex === idx ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'}">${G.willChildIndex === idx ? '👑 Baş Mirasçı' : 'Mirasçı Yap'}</button>
                </div>
              </div>`).join('')}
          </div>`}
      </div>

      <div class="space-y-2">
        <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">👨‍👩‍👧 Ebeveynler</h4>
        ${G.relations.map((r, idx) => `
          <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div><div class="text-xs font-bold text-white">${r.name} <span class="text-slate-400">(${r.role} • ${r.alive ? r.age + ' Yaş' : 'Vefat'})</span></div><div class="text-[10px] text-emerald-400">İlişki: %${r.love}</div></div>
            ${r.alive ? `<button onclick="spendTimeWithFamily(${idx})" class="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-white">Vakit Geçir</button>` : ''}
          </div>`).join('')}
      </div>`;
    return;
  }

  if (tab === 'menu') {
    title.textContent = '☰ Yaşam, İmparatorluk & Kariyer Menüsü';
    sub.textContent = `Başarımlar: ${G.achievements.length}/${ACHIEVEMENTS_DB.length} • Net Servet: ${fmtMoney(getNetWorth())}`;

    body.innerHTML = `
      <div class="grid grid-cols-2 gap-2">
        <button onclick="openMenuSection('politics')" class="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/40 text-left"><div class="text-lg">🏛️</div><div class="text-xs font-extrabold text-white">Siyaset & Devlet</div><div class="text-[10px] text-slate-300">Seçim & Cumhurbaşkanlığı</div></button>
        <button onclick="openMenuSection('sports')" class="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 text-left"><div class="text-lg">⚽</div><div class="text-xs font-extrabold text-white">Spor & E-Spor</div><div class="text-[10px] text-slate-300">Futbol, Basketbol & E-Spor</div></button>
        <button onclick="openMenuSection('crime')" class="p-3 rounded-2xl bg-gradient-to-br from-rose-500/20 to-red-900/20 border border-rose-500/40 text-left"><div class="text-lg">🕶️</div><div class="text-xs font-extrabold text-white">Sendika & Yeraltı</div><div class="text-[10px] text-slate-300">Mafya, Kara Para & Soygun</div></button>
        <button onclick="openMenuSection('social')" class="p-3 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-rose-500/10 border border-fuchsia-500/40 text-left"><div class="text-lg">📱</div><div class="text-xs font-extrabold text-white">Sosyal Medya & Ün</div><div class="text-[10px] text-slate-300">${formatCompactNumber(G.social.followers)} Takipçi</div></button>
        <button onclick="openMenuSection('cars')" class="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left"><div class="text-lg">🏎️</div><div class="text-xs font-extrabold text-white">Galeri & Ekspertiz</div><div class="text-[10px] text-slate-400">Al-Sat & Sanayi (${G.cars.length} Araç)</div></button>
        <button onclick="openMenuSection('houses')" class="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left"><div class="text-lg">🏡</div><div class="text-xs font-extrabold text-white">Tapu & Kiracılar</div><div class="text-[10px] text-slate-400">Emlak & Tahliye (${G.houses.length} Ev)</div></button>
        <button onclick="openMenuSection('health')" class="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left"><div class="text-lg">🏥</div><div class="text-xs font-extrabold text-white">Hastane & Psikoloji</div><div class="text-[10px] text-slate-400">${G.diseases.length > 0 ? G.diseases.length + ' Hastalık ⚠️' : 'Sağlıklı • Stres %' + G.stress}</div></button>
        <button onclick="openMenuSection('trophies')" class="p-3 rounded-2xl bg-slate-900 border border-yellow-500/30 text-left"><div class="text-lg">🏆</div><div class="text-xs font-extrabold text-yellow-400">Kupa & Başarımlar</div><div class="text-[10px] text-slate-400">${G.achievements.length} / ${ACHIEVEMENTS_DB.length} Rozet</div></button>
        <button onclick="openMenuSection('casino')" class="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left"><div class="text-lg">🎰</div><div class="text-xs font-extrabold text-white">VIP Kumarhane</div><div class="text-[10px] text-slate-400">Blackjack, Rulet & Slot</div></button>
        <button onclick="openMenuSection('license')" class="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left"><div class="text-lg">🪪</div><div class="text-xs font-extrabold text-white">Kimlik, Vize & Sicil</div><div class="text-[10px] text-slate-400">Pasaport & e-Devlet</div></button>
      </div>
      <div class="pt-2 flex gap-2">
        <button onclick="openMenuSection('migrate')" class="flex-1 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200">✈️ Pasaport & Göç</button>
        <button onclick="resetToNewLifeScreen()" class="flex-1 py-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-xs font-bold text-rose-300">🔄 Yeni Hayat</button>
      </div>`;
  }
}

/* ---------------- 11. MENÜ ALT EKRANLARI ---------------- */
function openMenuSection(sec) {
  normalizeState();
  const sheet = document.getElementById('bottomSheet');
  const title = document.getElementById('sheetTitle');
  const sub = document.getElementById('sheetSubtitle');
  const body = document.getElementById('sheetBody');
  const c = getCountry();
  sheet.classList.remove('hidden');

  if (sec === 'politics') {
    title.textContent = `🏛️ Siyaset, Seçimler & Devlet Yönetimi`;
    sub.textContent = `Halk Desteği: %${G.politics.approval} • Makam: ${G.politics.officeId || 'Yok'}`;
    const rallyCost = Math.round(c.monthlyMinWage * 2.5);
    body.innerHTML = renderHeroBannerHTML('politics') + `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-2">
        <div class="flex justify-between"><span class="text-xs font-extrabold text-amber-300">📊 Kamuoyu Yoklaması</span><span class="text-xs font-mono-num font-bold text-emerald-400">Oy: %${G.politics.approval}</span></div>
        <div class="grid grid-cols-2 gap-2">
          <button onclick="doPoliticalRally(${rallyCost})" class="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">📢 Miting (${fmtMoney(rallyCost)})</button>
          <button onclick="doTvDebate()" class="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">📺 TV Tartışması</button>
        </div>
      </div>
      ${G.politics.officeId === 'president' ? `
        <div class="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
          <div class="text-xs font-extrabold text-emerald-300">👑 Cumhurbaşkanlığı Kararnameleri</div>
          <div class="grid grid-cols-2 gap-2">
            <button onclick="presidentialAction('lower_tax')" class="p-2 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-extrabold">📉 Vergileri %5 İndir</button>
            <button onclick="presidentialAction('raise_wage')" class="p-2 rounded-xl bg-amber-400 text-slate-950 text-[11px] font-extrabold">📈 Asgari Ücrete %15 Zam</button>
          </div>
        </div>` : ''}
      <div class="space-y-2">
        ${POLITICS_OFFICES.map(off => {
          const campCost = Math.round(c.monthlyMinWage * off.campaignMult);
          const isCur = G.politics.officeId === off.id;
          return `<div class="p-3 rounded-2xl bg-slate-900 border ${isCur ? 'border-amber-400' : 'border-slate-800'} flex items-center justify-between gap-2"><div><div class="text-xs font-extrabold text-white">${off.icon} ${off.title}</div><div class="text-[10px] text-slate-400">Min Yaş: ${off.minAge} • Hedef Oy: %${off.reqApproval} • Maaş: <strong class="text-emerald-400">${fmtMoney(c.monthlyMinWage * off.salaryMult)}/ay</strong></div><div class="text-[10px] text-amber-300">Kampanya: ${fmtMoney(campCost)}</div></div><button onclick="runForOffice('${off.id}', ${campCost})" class="px-3 py-2 rounded-xl text-xs font-extrabold ${isCur ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-400 text-slate-950'}">${isCur ? 'Makamda' : 'Aday Ol'}</button></div>`;
        }).join('')}
      </div>`;
    return;
  }

  if (sec === 'sports') {
    title.textContent = '⚽ Profesyonel Spor & E-Spor Kariyeri';
    sub.textContent = `Yetenek: %${G.sports.skill} • Durum: ${G.sports.injured ? '🩼 Sakat' : 'Hazır ✓'}`;
    const curBranch = SPORTS_BRANCHES.find(b => b.id === G.sports.branchId);
    body.innerHTML = renderHeroBannerHTML('sports') + `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-2">
        <div class="flex justify-between"><span class="text-xs font-extrabold text-white">${curBranch ? `${curBranch.icon} ${curBranch.name} (${curBranch.tiers[G.sports.tierIndex]})` : 'Kulüp Sözleşmesi Yok'}</span><span class="text-xs font-bold text-emerald-400">Yetenek: %${G.sports.skill}</span></div>
        <div class="grid grid-cols-2 gap-2">
          <button onclick="trainSportsSkill()" class="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">🏋️ Özel Antrenman Yap</button>
          <button onclick="requestTransferOffer()" class="p-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold">✈️ Üst Lige Transfer İste</button>
        </div>
      </div>
      <div class="space-y-2">
        ${SPORTS_BRANCHES.map(br => {
          const act = G.sports.branchId === br.id;
          return `<div class="p-3 rounded-2xl bg-slate-900 border ${act ? 'border-emerald-500' : 'border-slate-800'} flex items-center justify-between gap-2"><div><div class="text-xs font-extrabold text-white">${br.icon} ${br.name}</div><div class="text-[10px] text-slate-400">${br.tiers.join(' &rarr; ')}</div><div class="text-[10px] text-emerald-400">Zirve Kontrat: ${fmtMoney(c.monthlyMinWage * br.mults[2])}/ay</div></div><button onclick="joinSportsBranch('${br.id}')" class="px-3 py-2 rounded-xl text-xs font-extrabold ${act ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-500 text-slate-950'}">${act ? 'Sözleşmeli' : 'Seçmeye Gir'}</button></div>`;
        }).join('')}
      </div>`;
    return;
  }

  if (sec === 'crime') {
    const rObj = SYNDICATE_RANKS.find(r => r.level === G.syndicate.rankLevel);
    title.textContent = '🕶️ Organize Suç Sendikası & Yeraltı';
    sub.textContent = `Rütbe: ${G.syndicate.joined ? rObj.title : 'Bağımsız'} • Kara Para: ${fmtMoney(G.dirtyMoney)}`;
    body.innerHTML = renderHeroBannerHTML('crime') + `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-rose-500/40 space-y-2">
        <div class="flex justify-between"><span class="text-xs font-extrabold text-rose-400">🕶️ Yeraltı Sendikası</span><span class="text-xs font-bold text-white">${G.syndicate.joined ? rObj.title : 'Üye Değil'} (Saygınlık %${G.syndicate.respect})</span></div>
        ${!G.syndicate.joined ? `<button onclick="joinSyndicate()" class="w-full py-2.5 rounded-xl bg-rose-500 text-white text-xs font-extrabold">🩸 Sendikaya Katıl (Yıllık Haraç Payı Al)</button>` : `
          <div class="grid grid-cols-2 gap-2">
            <button onclick="syndicateAction('promote')" class="p-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold">👑 Rütbe Terfisi İste</button>
            <button onclick="syndicateAction('mole')" class="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">🕵️ Köstebek Avı</button>
          </div>
          <button onclick="activeFinanceTab='biz'; openNavSheet('finance');" class="w-full py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">🧼 Paravan Şirkette Kara Para Akla (${fmtMoney(G.dirtyMoney)})</button>`}
      </div>
      <div class="space-y-2">
        <button onclick="commitCrime('cyber')" class="w-full p-3.5 rounded-2xl bg-slate-900 border border-rose-500/30 flex items-center justify-between"><div class="text-left"><div class="text-xs font-extrabold text-white">💻 Siber Vurgun & Kripto Sızması</div><div class="text-[10px] text-slate-400">8x-22x Maaş • Risk: 3 Yıl Hapis</div></div><span class="text-xs font-bold text-rose-400">Saldır &rarr;</span></button>
        <button onclick="commitCrime('smuggle')" class="w-full p-3.5 rounded-2xl bg-slate-900 border border-rose-500/30 flex items-center justify-between"><div class="text-left"><div class="text-xs font-extrabold text-white">🚢 Gümrüksüz Kaçak Tır Sevkiyatı</div><div class="text-[10px] text-slate-400">15x-35x Maaş • Risk: 5 Yıl Hapis</div></div><span class="text-xs font-bold text-rose-400">Sevk Et &rarr;</span></button>
        <button onclick="commitCrime('heist')" class="w-full p-3.5 rounded-2xl bg-slate-900 border border-rose-500/50 flex items-center justify-between"><div class="text-left"><div class="text-xs font-extrabold text-white">🏦 Merkez Bankası Zırhlı Araç Soygunu</div><div class="text-[10px] text-slate-400">50x-90x Maaş • Risk: 10 Yıl Hapis</div></div><span class="text-xs font-bold text-rose-400">Planla &rarr;</span></button>
      </div>`;
    return;
  }

  if (sec === 'cars') {
    title.textContent = `🏎️ Oto Galeri, İlan Vitrini & Sanayi (${c.name})`;
    sub.textContent = `Garajındaki Araçlar: ${G.cars.length}`;
    const topTabs = `
      <div class="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-2">
        <button onclick="activeGarageTab='dealer'; openMenuSection('cars')" class="py-2 rounded-xl text-xs font-extrabold ${activeGarageTab === 'dealer' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}">🏪 Sıfır & 2. El İlanlar</button>
        <button onclick="activeGarageTab='mycars'; openMenuSection('cars')" class="py-2 rounded-xl text-xs font-extrabold ${activeGarageTab === 'mycars' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}">🛠️ Garaj & Ekspertiz (${G.cars.length})</button>
      </div>`;

    if (activeGarageTab === 'mycars') {
      if (G.cars.length === 0) {
        body.innerHTML = renderHeroBannerHTML('cars') + topTabs + `<div class="p-6 text-center text-xs text-slate-400">Henüz aracın yok.</div>`;
        return;
      }
      const idx = (inspectedCarIndex < G.cars.length) ? inspectedCarIndex : 0;
      const selectorBtns = G.cars.length > 1 ? `
        <div class="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
          ${G.cars.map((car, i) => {
            const p = getCharacterPlate(i);
            return `<button onclick="inspectedCarIndex=${i}; openMenuSection('cars');" class="px-2.5 py-1.5 rounded-xl border text-[10px] font-extrabold shrink-0 ${i === idx ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-800 bg-slate-900 text-slate-400'}">${car.icon} ${p.text}</button>`;
          }).join('')}
        </div>` : '';

      body.innerHTML = renderHeroBannerHTML('cars') + topTabs + selectorBtns + renderCarExpertiseSVGModal(G.cars[idx], idx) + G.cars.map((car, i) => {
        const repairCost = Math.round(c.monthlyMinWage * 1.4);
        const p = getCharacterPlate(i);
        return `
          <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div class="flex items-center justify-between">
              <div><div class="text-xs font-extrabold text-white">${car.icon} ${car.name} <span class="text-[10px] font-mono-num text-emerald-400">[${p.text}]</span></div><div class="text-[10px] text-slate-400">Kondisyon: <strong>%${car.cond}</strong> • Değer: <strong>${fmtMoney(car.value)}</strong></div></div>
              <button onclick="sellMyCar(${i})" class="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-extrabold">Sat (+${fmtMoney(car.value)})</button>
            </div>
            <div class="grid grid-cols-3 gap-1.5 text-[10px]">
              <button onclick="toggleCarPolicy(${i}, 'trafficIns')" class="py-1.5 rounded-lg border font-bold ${car.trafficIns ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-rose-500/40 text-rose-300'}">${car.trafficIns ? '✓ Trafik Sig.' : '✗ Trafik Sig.'}</button>
              <button onclick="toggleCarPolicy(${i}, 'kasko')" class="py-1.5 rounded-lg border font-bold ${car.kasko ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-slate-700 text-slate-400'}">${car.kasko ? '✓ Kasko' : '+ Kasko Yap'}</button>
              <button onclick="repairCarInSanayi(${i}, ${repairCost})" class="py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">🔧 Sanayi (${fmtMoney(repairCost)})</button>
            </div>
          </div>`;
      }).join('');
    } else {
      body.innerHTML = renderHeroBannerHTML('cars') + topTabs + CARS.map(car => {
        const zeroPrice = Math.round(c.monthlyMinWage * car.baseMinWages * c.carTaxMultiplier);
        const usedPrice = Math.round(zeroPrice * 0.55);
        const sp = getCarClassifiedSpecs(car);
        return `
          <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div class="flex items-center justify-between gap-2">
              <div class="min-w-0">
                <div class="text-xs font-extrabold text-white truncate">${car.icon} ${car.name}</div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span class="classified-tag">🛣️ ${sp.km}</span>
                  <span class="classified-tag">⛽ ${sp.fuel}</span>
                  <span class="classified-tag">🚘 ${sp.body}</span>
                  <span class="classified-tag">🪪 ${car.reqLic} Ehliyet</span>
                </div>
              </div>
              <div class="flex flex-col gap-1 shrink-0">
                <button onclick="buyCar('${car.id}', false)" class="px-2.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-[10px] font-extrabold">Sıfır (${fmtMoney(zeroPrice)})</button>
                <button onclick="buyCar('${car.id}', true)" class="px-2.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">2. El Hasarlı (${fmtMoney(usedPrice)})</button>
              </div>
            </div>
          </div>`;
      }).join('');
    }
    return;
  }

  if (sec === 'houses') {
    title.textContent = `🏡 Tapu Senedi & Emlak İlan Vitrini`;
    sub.textContent = `Tapulu Mülk: ${G.houses.length}`;
    let tapuCard = G.houses.length > 0 ? `
      <div class="tapu-card mb-2.5 space-y-1">
        <div class="flex justify-between border-b border-amber-500/25 pb-1"><span class="text-[9px] font-extrabold text-amber-400 uppercase">${c.flag} TAPU VE KADASTRO GENEL MÜDÜRLÜĞÜ</span><span class="text-[9px] font-mono-num text-amber-200">MÜLKİYET SENEDİ</span></div>
        <div class="grid grid-cols-3 gap-2 text-[10px]">
          <div><span class="text-slate-400 block text-[8px]">MALİK</span><strong class="text-white">${G.firstName} ${G.lastName}</strong></div>
          <div><span class="text-slate-400 block text-[8px]">TAŞINMAZ</span><strong class="text-emerald-400">${G.houses.length} Adet Tam Hisse</strong></div>
          <div><span class="text-slate-400 block text-[8px]">TOPLAM DEĞER</span><strong class="text-white font-mono-num">${fmtMoney(G.houses.reduce((a, x) => a + x.value, 0))}</strong></div>
        </div>
      </div>` : '';

    let myHouses = G.houses.map((h, idx) => `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2">
        <div class="flex justify-between items-center">
          <div><div class="text-xs font-extrabold text-white">${h.icon} ${h.name}</div><div class="text-[10px] text-slate-400">Değer: <strong>${fmtMoney(h.value)}</strong> • Kira: <strong class="text-emerald-400">${fmtMoney(h.monthlyRent)}/ay</strong></div></div>
          <button onclick="sellHouse(${idx})" class="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-200 text-[10px] font-bold">Sat</button>
        </div>
        <div class="flex gap-2">
          <button onclick="toggleHouseRent(${idx})" class="flex-1 py-1.5 rounded-xl text-[11px] font-extrabold ${h.isRented ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'}">${h.isRented ? (h.tenantOk ? '✓ Kirada (Ödüyor)' : '⚠️ Kiracı Ödemiyor!') : '🏠 Kendin Oturuyorsun'}</button>
          ${h.isRented && !h.tenantOk ? `<button onclick="evictBadTenant(${idx})" class="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-[11px] font-extrabold">⚖️ Tahliye Et</button>` : ''}
        </div>
      </div>`).join('');

    body.innerHTML = renderHeroBannerHTML('houses') + tapuCard + myHouses + HOUSES.map(h => {
      const price = Math.round(c.monthlyMinWage * h.baseMinWages * (c.houseMultiplier / 120));
      const rent = Math.round((price * h.rentYield) / 12);
      const sp = getHouseClassifiedSpecs(h);
      const amortYears = Math.round(1 / h.rentYield);
      return `
        <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
          <div class="min-w-0">
            <div class="text-xs font-extrabold text-white truncate">${h.icon} ${h.name}</div>
            <div class="flex flex-wrap gap-1 my-1">
              <span class="classified-tag">📐 ${sp.m2}</span>
              <span class="classified-tag">🚪 ${sp.rooms}</span>
              <span class="classified-tag">🏢 ${sp.floor}</span>
              <span class="classified-tag">⏱️ ${amortYears} Yıl Amortisman</span>
            </div>
            <div class="text-[10px] text-slate-400">Kira Getirisi: <strong class="text-emerald-400">+${fmtMoney(rent)}/ay</strong> • Fiyat: <strong class="text-white">${fmtMoney(price)}</strong></div>
          </div>
          <button onclick="buyHouse('${h.id}')" class="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold shrink-0">Satın Al</button>
        </div>`;
    }).join('');
    return;
  }

  if (sec === 'health') {
    title.textContent = '🏥 e-Nabız, Hastane & Psikoloji';
    sub.textContent = `Sağlık: %${G.health} • Stres: %${G.stress} • Görünüm: %${G.looks}`;
    const privCost = Math.round(c.monthlyMinWage * 1.1);
    const therapyCost = Math.round(c.monthlyMinWage * 0.6);
    const plasticCost = Math.round(c.monthlyMinWage * 2.5);

    const diseaseHtml = G.diseases.length > 0 ? `
      <div class="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-2">
        <div class="text-xs font-extrabold text-rose-300">🤒 Aktif Klinik Tanılar</div>
        ${G.diseases.map(dId => `<div class="text-xs text-white font-bold">• ${(DISEASES_DB.find(x => x.id === dId) || {}).name || dId}</div>`).join('')}
        <div class="grid grid-cols-2 gap-2 pt-1">
          <button onclick="treatDiseases('public', 0)" class="p-2 rounded-xl bg-slate-800 text-slate-200 text-[11px] font-bold">🏥 Devlet (Ücretsiz)</button>
          <button onclick="treatDiseases('private', ${privCost})" class="p-2 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-extrabold">💎 Özel (${fmtMoney(privCost)})</button>
        </div>
      </div>` : `<div class="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-bold">✓ Aktif bir hastalığın bulunmuyor.</div>`;

    body.innerHTML = renderHeroBannerHTML('health') + diseaseHtml + `
      <button onclick="healthAction('therapy', ${therapyCost})" class="w-full p-3.5 rounded-2xl bg-slate-900 border border-indigo-500/30 flex items-center justify-between"><div class="text-left"><div class="text-xs font-extrabold text-indigo-300">🛋️ Psikolog & Stres Terapisi</div><div class="text-[10px] text-slate-400">-35 Stres, +14 Mutluluk, Tükenmişliği İyileştirir</div></div><span class="text-xs font-bold text-indigo-300">${fmtMoney(therapyCost)}</span></button>
      <button onclick="healthAction('gym', ${Math.round(c.monthlyMinWage * 0.25)})" class="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"><div class="text-left"><div class="text-xs font-extrabold text-white">🏋️ Fitness & Spor Salonu</div><div class="text-[10px] text-slate-400">+8 Sağlık, +6 Görünüm, -12 Stres</div></div><span class="text-xs font-bold text-emerald-400">${fmtMoney(Math.round(c.monthlyMinWage * 0.25))}</span></button>
      <button onclick="healthAction('plastic', ${plasticCost})" class="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"><div class="text-left"><div class="text-xs font-extrabold text-white">✨ Estetik Operasyon</div><div class="text-[10px] text-slate-400">+22 Görünüm</div></div><span class="text-xs font-bold text-fuchsia-400">${fmtMoney(plasticCost)}</span></button>`;
    return;
  }

  if (sec === 'trophies') {
    title.textContent = '🏆 Başarım ve Kupa Vitrini';
    sub.textContent = `Açılan Rozetler: ${G.achievements.length} / ${ACHIEVEMENTS_DB.length}`;
    body.innerHTML = ACHIEVEMENTS_DB.map(ach => {
      const unlocked = G.achievements.includes(ach.id);
      return `<div class="p-3 rounded-2xl border ${unlocked ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-slate-800 bg-slate-900/50 opacity-60'} flex items-center justify-between"><div class="flex items-center gap-3"><span class="text-2xl">${ach.icon}</span><div><div class="text-xs font-extrabold text-white">${ach.title}</div><div class="text-[10px] text-slate-400">${ach.desc}</div></div></div><span class="text-[10px] font-extrabold ${unlocked ? 'text-yellow-400' : 'text-slate-500'}">${unlocked ? '✓ AÇILDI' : 'Kilitli'}</span></div>`;
    }).join('');
    return;
  }

  if (sec === 'social') {
    title.textContent = '📱 Sosyal Medya & Ünlü Olma';
    sub.textContent = `Takipçi: ${G.social.followers.toLocaleString('tr-TR')} • Şöhret: %${G.fame}`;
    const platforms = ['Instaphoto', 'TokTik', 'YouVideo', 'KickStream'];
    body.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-fuchsia-500/30 grid grid-cols-2 gap-2">
        ${platforms.map(p => {
          const joined = G.social.activePlatforms.includes(p);
          return `<button onclick="joinSocialPlatform('${p}')" class="p-2 rounded-xl border text-xs font-bold ${joined ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-slate-800 bg-slate-950 text-slate-300'}">${joined ? '✓ ' + p : '+ ' + p + ' Aç'}</button>`;
        }).join('')}
      </div>
      <div class="space-y-2">
        <button onclick="postSocialContent('viral')" class="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-left"><div><div class="text-xs font-extrabold text-white">🔥 Viral Reels / Shorts Videosu Çek</div><div class="text-[10px] text-slate-400">Keşfete düşme ve yüksek takipçi şansı</div></div><span class="text-xs font-bold text-emerald-400">Paylaş &rarr;</span></button>
        <button onclick="postSocialContent('stream')" class="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-left"><div><div class="text-xs font-extrabold text-white">🎮 Canlı Yayın Aç</div><div class="text-[10px] text-slate-400">Takipçi + anlık bağış geliri</div></div><span class="text-xs font-bold text-emerald-400">Yayın Aç &rarr;</span></button>
        <button onclick="postSocialContent('sponsor')" class="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-left"><div><div class="text-xs font-extrabold text-white">💼 Sponsorlu Marka Reklamı Al</div><div class="text-[10px] text-slate-400">En az 10.000 takipçi gerekir</div></div><span class="text-xs font-bold text-amber-400">Anlaşma &rarr;</span></button>
        <button onclick="applyForBlueTick()" class="w-full p-3 rounded-2xl bg-slate-900 border border-sky-500/30 flex items-center justify-between text-left"><div><div class="text-xs font-extrabold text-sky-400">☑️ Mavi Tik Başvurusu</div><div class="text-[10px] text-slate-400">50.000+ takipçi gerekir</div></div><span class="text-xs font-bold text-sky-400">Başvur &rarr;</span></button>
      </div>`;
    return;
  }

  if (sec === 'casino') {
    const betBase = Math.round(c.monthlyMinWage * 0.5);
    title.textContent = '🎰 VIP Kumarhane';
    sub.textContent = `Bakiye: ${fmtMoney(G.money)}`;
    body.innerHTML = `
      <div class="space-y-2.5">
        <div class="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-center justify-between"><div><div class="text-xs font-extrabold text-white">🃏 Blackjack 21</div><div class="text-[10px] text-slate-400">2x Ödeme</div></div><button onclick="playCasinoGame('blackjack', ${betBase * 2})" class="px-3 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold">Oyna (${fmtMoney(betBase * 2)})</button></div>
        <div class="p-3.5 rounded-2xl bg-slate-900 border border-rose-500/30 flex items-center justify-between"><div><div class="text-xs font-extrabold text-white">🎡 Avrupa Ruleti</div><div class="text-[10px] text-slate-400">2x Ödeme</div></div><button onclick="playCasinoGame('roulette', ${betBase * 3})" class="px-3 py-2 rounded-xl bg-rose-500 text-white text-xs font-extrabold">Oyna (${fmtMoney(betBase * 3)})</button></div>
        <div class="p-3.5 rounded-2xl bg-slate-900 border border-fuchsia-500/30 flex items-center justify-between"><div><div class="text-xs font-extrabold text-white">🍒 777 Mega Slot</div><div class="text-[10px] text-slate-400">10x Jackpot!</div></div><button onclick="playCasinoGame('slot', ${betBase})" class="px-3 py-2 rounded-xl bg-fuchsia-500 text-white text-xs font-extrabold">Çevir (${fmtMoney(betBase)})</button></div>
      </div>`;
    return;
  }

  if (sec === 'license' || sec === 'identity') {
    title.textContent = '🪪 Çipli Kimlik, Pasaport & e-Devlet';
    sub.textContent = `Adli Sicil: ${G.criminalRecord ? 'Sabıkalı ⚠️' : 'Temiz ✓'}`;
    const costB = Math.round(c.monthlyMinWage * 0.7);
    const costCE = Math.round(c.monthlyMinWage * 1.6);
    const expungeCost = Math.round(c.monthlyMinWage * 4.5);
    body.innerHTML = renderHeroBannerHTML('license') + renderOfficialIdentityAndDocumentsHTML() + `
      <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"><div><div class="text-xs font-extrabold text-white">🚗 B Sınıfı Sürücü Belgesi</div><div class="text-[10px] text-slate-400">Otomobil & Kurye</div></div><button onclick="takeDrivingLicense('B', ${costB})" class="px-3 py-2 rounded-xl text-xs font-extrabold ${G.licenses.B ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-500 text-slate-950'}">${G.licenses.B ? 'Alındı ✓' : fmtMoney(costB)}</button></div>
      <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"><div><div class="text-xs font-extrabold text-white">🚛 CE Sınıfı Ağır Vasıta (Tır) Ehliyeti</div><div class="text-[10px] text-slate-400">Uluslararası Tır Şoförlüğü</div></div><button onclick="takeDrivingLicense('CE', ${costCE})" class="px-3 py-2 rounded-xl text-xs font-extrabold ${G.licenses.CE ? 'bg-slate-800 text-emerald-400' : 'bg-amber-400 text-slate-950'}">${G.licenses.CE ? 'Alındı ✓' : fmtMoney(costCE)}</button></div>
      <div class="p-3 rounded-2xl bg-slate-900 border ${G.criminalRecord ? 'border-rose-500/40' : 'border-slate-800'} flex items-center justify-between"><div><div class="text-xs font-extrabold text-white">⚖️ Adli Sicil Sildirme</div><div class="text-[10px] text-slate-400">Memuriyet engelini kaldırır</div></div>${G.criminalRecord ? `<button onclick="clearCriminalRecord(${expungeCost})" class="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold">Sildir (${fmtMoney(expungeCost)})</button>` : `<span class="text-xs font-bold text-emerald-400">Temiz ✓</span>`}</div>
      <button onclick="G.portraitIdx = (G.portraitIdx + 1) % 3; saveGame(); renderAll(); openMenuSection('identity');" class="w-full py-2.5 rounded-2xl bg-slate-800 text-xs font-extrabold text-white">🔄 AI Portre Görünümünü Değiştir</button>`;
    return;
  }

  if (sec === 'migrate') {
    title.textContent = '✈️ Konsolosluk, Vize & Göç İdaresi';
    sub.textContent = 'Göç ettiğinde pasaportuna vize mührü basılır ve varlıkların yeni kura çevrilir';
    body.innerHTML = renderPassportVisaStampsHTML() + COUNTRIES.filter(x => x.id !== G.countryId).map(target => {
      const moveCost = Math.round(c.monthlyMinWage * 4);
      return `<div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"><div><div class="text-xs font-extrabold text-white">${target.flag} ${target.name} (${target.currency})</div><div class="text-[10px] text-slate-400">Asgari: ${target.monthlyMinWage.toLocaleString('tr-TR')} ${target.currency} • Enf: %${Math.round(target.inflation * 100)}</div></div><button onclick="migrateToCountry('${target.id}', ${moveCost})" class="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold">Vize Al &amp; Göç (${fmtMoney(moveCost)})</button></div>`;
    }).join('');
  }
}

/* ---------------- 12. ÇOCUK ETKİLEŞİM & BORSA İŞLEM FONKSİYONLARI ---------------- */
function openChildInteractionSheet(childIdx) {
  normalizeState();
  const ch = G.children[childIdx];
  if (!ch) return;
  const c = getCountry();
  const sheet = document.getElementById('bottomSheet');
  sheet.classList.remove('hidden');

  document.getElementById('sheetTitle').textContent = `👶 ${ch.name} (${ch.age || 0} Yaş)`;
  document.getElementById('sheetSubtitle').textContent = `Ebeveynlik, Eğitim & Gelecek Fonu Yönetimi`;

  const allowanceCost = Math.round(c.monthlyMinWage * 0.15);
  const tutorCost = Math.round(c.monthlyMinWage * 0.45);
  const collegeCost = Math.round(c.monthlyMinWage * 1.4);
  const fundDeposit = Math.round(c.monthlyMinWage * 2.0);

  document.getElementById('sheetBody').innerHTML = `
    <button onclick="openNavSheet('relations')" class="text-xs font-bold text-emerald-400 mb-1">&larr; İlişkiler Menüsüne Dön</button>
    <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
      <div class="flex justify-between items-center">
        <div><div class="text-sm font-extrabold text-white">${ch.gender === 'F' ? '👧' : '👦'} ${ch.name}</div><div class="text-[11px] text-slate-400">Okul: ${ch.privateSchool ? '🏫 Özel Kolej' : 'Devlet Okulu'} • OBP: <strong>${ch.obp}</strong></div></div>
        <span class="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-300 text-[10px] font-extrabold">${G.willChildIndex === childIdx ? '👑 Baş Mirasçı' : 'Mirasçı Adayı'}</span>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <div class="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center"><div class="text-[10px] text-sky-400 font-bold">🧠 Zeka</div><div class="text-xs font-extrabold font-mono-num text-white">%${ch.smart}</div></div>
        <div class="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center"><div class="text-[10px] text-amber-400 font-bold">😊 Mutluluk</div><div class="text-xs font-extrabold font-mono-num text-white">%${ch.happy}</div></div>
        <div class="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center"><div class="text-[10px] text-rose-400 font-bold">❤️ Bağlılık</div><div class="text-xs font-extrabold font-mono-num text-white">%${ch.love}</div></div>
      </div>
      <div class="p-2.5 rounded-xl bg-emerald-950/25 border border-emerald-500/30 flex justify-between items-center">
        <div><div class="text-[11px] font-extrabold text-emerald-300">🏦 Vergisiz Çocuk Kumbarası</div><div class="text-[9px] text-slate-400">Miras vergisinden muaf birikim</div></div>
        <div class="text-xs font-mono-num font-extrabold text-emerald-400">${fmtMoney(ch.trustFund)}</div>
      </div>
    </div>
    <div class="space-y-2">
      <button onclick="doChildAction(${childIdx}, 'quality_time', 0)" class="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between text-left"><div><div class="text-xs font-extrabold text-white">🎡 Birlikte Kaliteli Vakit Geçir</div><div class="text-[10px] text-slate-400">+12 Bağlılık, +10 Mutluluk (Ücretsiz)</div></div><span class="text-xs font-bold text-emerald-400">Yap &rarr;</span></button>
      <button onclick="doChildAction(${childIdx}, 'allowance', ${allowanceCost})" class="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between text-left"><div><div class="text-xs font-extrabold text-white">💵 Cep Harçlığı & Hediye Ver</div><div class="text-[10px] text-slate-400">+16 Mutluluk, +10 Bağlılık</div></div><span class="text-xs font-bold text-emerald-400">${fmtMoney(allowanceCost)}</span></button>
      <button onclick="doChildAction(${childIdx}, 'tutor', ${tutorCost})" class="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between text-left"><div><div class="text-xs font-extrabold text-white">📚 Özel Ders & Kodlama Kursu Aldır</div><div class="text-[10px] text-slate-400">+9 Zeka, +6 OBP</div></div><span class="text-xs font-bold text-sky-400">${fmtMoney(tutorCost)}</span></button>
      <button onclick="doChildAction(${childIdx}, 'college', ${collegeCost})" class="w-full p-3 rounded-2xl bg-slate-900 border ${ch.privateSchool ? 'border-emerald-500/50' : 'border-slate-800'} flex justify-between text-left"><div><div class="text-xs font-extrabold text-white">🏫 Özel Koleje Kaydettir</div><div class="text-[10px] text-slate-400">Her yıl otomatik +5 Zeka ve +4 OBP</div></div><span class="text-xs font-bold ${ch.privateSchool ? 'text-emerald-400' : 'text-amber-400'}">${ch.privateSchool ? 'Kayıtlı ✓' : fmtMoney(collegeCost)}</span></button>
      <button onclick="doChildAction(${childIdx}, 'trust_fund', ${fundDeposit})" class="w-full p-3 rounded-2xl bg-slate-900 border border-emerald-500/30 flex justify-between text-left"><div><div class="text-xs font-extrabold text-emerald-300">🏦 Çocuk Kumbarasına Para Yatır</div><div class="text-[10px] text-slate-400">Yıllık %15 büyür, %0 vergiyle devrolur</div></div><span class="text-xs font-bold text-emerald-400">+${fmtMoney(fundDeposit)}</span></button>
    </div>`;
}

function doChildAction(childIdx, action, cost) {
  const ch = G.children[childIdx];
  if (!ch) return;
  if (cost > 0 && G.money < cost) { showToast('Nakit yetersiz!'); return; }

  if (action === 'quality_time') {
    ch.love = clamp(ch.love + 12); ch.happy = clamp(ch.happy + 10); G.happy = clamp(G.happy + 6);
    addLog(G.age, `🎡 Çocuğun **${ch.name}** ile harika vakit geçirdin.`, 'good');
  } else if (action === 'allowance') {
    G.money -= cost; ch.happy = clamp(ch.happy + 16); ch.love = clamp(ch.love + 10);
    addLog(G.age, `💵 **${ch.name}**'e **${fmtMoney(cost)}** harçlık verdin.`, 'good');
  } else if (action === 'tutor') {
    G.money -= cost; ch.smart = clamp(ch.smart + 9); ch.obp = clamp(ch.obp + 6, 50, 100);
    addLog(G.age, `📚 **${ch.name}** özel ders aldı! Zekası **%${ch.smart}**, OBP **${ch.obp}** oldu.`, 'good');
  } else if (action === 'college') {
    if (ch.privateSchool) { showToast('Zaten kolejde!'); return; }
    G.money -= cost; ch.privateSchool = true; ch.smart = clamp(ch.smart + 8); ch.obp = clamp(ch.obp + 6, 50, 100);
    addLog(G.age, `🏫 **${ch.name}**'i Özel Koleje kaydettirdin!`, 'milestone');
  } else if (action === 'trust_fund') {
    G.money -= cost; ch.trustFund = (ch.trustFund || 0) + cost;
    addLog(G.age, `🏦 **${ch.name}**'in kumbarasına **+${fmtMoney(cost)}** yatırdın.`, 'good');
  }
  playSfx('coin');
  saveGame(); renderAll(); openChildInteractionSheet(childIdx);
}

function executeChartTrade(key, actionType, fixedAmt) {
  normalizeState();
  if (actionType === 'buy_unit' || actionType === 'buy_half') {
    const amt = actionType === 'buy_half' ? Math.floor(G.money * 0.5) : fixedAmt;
    if (amt <= 0 || G.money < amt) { showToast('Nakit yetersiz!'); return; }
    G.money -= amt;
    G.investments[key] = (G.investments[key] || 0) + amt;
    G.market.costBasis[key] = (G.market.costBasis[key] || 0) + amt;
    playSfx('coin');
  } else if (actionType === 'sell_all') {
    const curVal = G.investments[key] || 0;
    if (curVal <= 0) { showToast('Pozisyon yok!'); return; }
    const pnl = curVal - (G.market.costBasis[key] || 0);
    G.money += curVal;
    G.investments[key] = 0; G.market.costBasis[key] = 0;
    playSfx('coin');
    addLog(G.age, `📊 **${MARKET_ASSETS_META[key].name}** pozisyonunu **${fmtMoney(curVal)}** değerle kapattın (Net: ${pnl >= 0 ? '+' : ''}${fmtMoney(pnl)}).`, pnl >= 0 ? 'good' : 'bad');
  }
  saveGame(); renderAll(); openNavSheet('finance');
}

function simulateDayTradeTick(key) {
  normalizeState();
  if (G.market.tradesThisYear >= 3) { showToast('Bu yılki 3 hızlı trade hakkın doldu! +1 Yaş ilerle.'); return; }
  G.market.tradesThisYear += 1;
  const meta = MARKET_ASSETS_META[key];
  const pct = Number(((Math.random() * (meta.maxChange - meta.minChange) + meta.minChange) * 0.55).toFixed(1));
  const series = G.market.history[key];
  series.push(Math.max(1, Number((series[series.length - 1] * (1 + pct / 100)).toFixed(1))));
  if (series.length > 12) series.shift();
  G.market.lastPct[key] = pct;

  if ((G.investments[key] || 0) > 0) {
    G.investments[key] = Math.max(0, G.investments[key] + Math.round(G.investments[key] * (pct / 100)));
  }
  playSfx(pct >= 0 ? 'coin' : 'bad');
  showToast(`${meta.name}: ${pct >= 0 ? '+' : ''}${pct}%`);
  saveGame(); renderAll(); openNavSheet('finance');
}

/* ---------------- 13. DİĞER TÜM OYUN AKSİYONLARI ---------------- */
function doPoliticalRally(cost) {
  if (G.age < 18 || G.money < cost) { showToast('Yaş veya bakiye yetersiz!'); return; }
  G.money -= cost;
  G.politics.approval = clamp(G.politics.approval + randInt(8, 16) + Math.round(G.fame / 15));
  G.fame = clamp(G.fame + 5);
  playSfx('coin');
  addLog(G.age, `📢 Meydan mitingiyle oy desteğin **%${G.politics.approval}** oldu.`, 'good');
  saveGame(); renderAll(); openMenuSection('politics');
}

function doTvDebate() {
  if (G.age < 18) return;
  if (Math.random() < (0.4 + G.smart / 200)) {
    G.politics.approval = clamp(G.politics.approval + randInt(7, 14));
    addLog(G.age, `📺 TV tartışmasında rakibini alt ettin! Oy: **%${G.politics.approval}**.`, 'good');
  } else {
    G.politics.approval = clamp(G.politics.approval - 8);
    addLog(G.age, `📺 Canlı yayında gaf yaptın, oyun **%${G.politics.approval}** oldu.`, 'bad');
  }
  saveGame(); renderAll(); openMenuSection('politics');
}

function runForOffice(officeId, campCost) {
  const off = POLITICS_OFFICES.find(o => o.id === officeId);
  if (!off || G.age < off.minAge || G.criminalRecord || G.money < campCost) { showToast('Şartlar veya bütçe yetersiz!'); return; }
  G.money -= campCost;
  if (Math.random() < (G.politics.approval / off.reqApproval) * 0.65) {
    G.politics.officeId = off.id; G.fame = clamp(G.fame + 25);
    if (off.id === 'president') unlockAchievement('president');
    playSfx('trophy');
    addLog(G.age, `🗳️ **SEÇİM ZAFERİ!** **${off.title}** seçildin!`, 'fame');
  } else {
    playSfx('bad');
    addLog(G.age, `🗳️ **${off.title}** seçimini kaybettin.`, 'bad');
  }
  saveGame(); renderAll(); openMenuSection('politics');
}

function presidentialAction(act) {
  if (G.politics.officeId !== 'president') return;
  if (act === 'lower_tax') { G.politics.taxModifier = -0.05; G.politics.approval = clamp(G.politics.approval + 15); addLog(G.age, `👑 Gelir vergisini **%5 indirdin!**`, 'fame'); }
  else if (act === 'raise_wage') { const c = getCountry(); c.monthlyMinWage = Math.round(c.monthlyMinWage * 1.15); G.politics.approval = clamp(G.politics.approval + 12); addLog(G.age, `👑 Asgari ücrete **%15 zam** yaptın!`, 'good'); }
  saveGame(); renderAll(); openMenuSection('politics');
}

function joinSportsBranch(branchId) {
  if (G.age < 14 || G.age > 35) { showToast('14-35 yaş arası gerekir!'); return; }
  const br = SPORTS_BRANCHES.find(b => b.id === branchId);
  if (!br) return;
  G.sports.branchId = br.id; G.sports.tierIndex = 0;
  playSfx('coin');
  addLog(G.age, `${br.icon} **${br.name}** altyapısına katıldın!`, 'milestone');
  saveGame(); renderAll(); openMenuSection('sports');
}

function trainSportsSkill() {
  if (!G.sports.branchId) { showToast('Önce bir branş seç!'); return; }
  G.sports.skill = clamp(G.sports.skill + randInt(6, 12)); G.health = clamp(G.health + 4);
  playSfx('click');
  saveGame(); renderAll(); openMenuSection('sports');
}

function requestTransferOffer() {
  if (!G.sports.branchId || G.sports.tierIndex >= 2) return;
  const reqSkill = G.sports.tierIndex === 0 ? 72 : 88;
  if (G.sports.skill < reqSkill) { showToast(`En az %${reqSkill} yetenek gerekir!`); return; }
  const c = getCountry();
  const br = SPORTS_BRANCHES.find(b => b.id === G.sports.branchId);
  G.sports.tierIndex += 1;
  const signBonus = Math.round(c.monthlyMinWage * (G.sports.tierIndex * 8));
  G.money += signBonus; G.fame = clamp(G.fame + 20);
  if (G.sports.tierIndex === 2) unlockAchievement('pro_champ');
  playSfx('trophy');
  addLog(G.age, `✈️ **${br.tiers[G.sports.tierIndex]}** seviyesine transfer oldun (+${fmtMoney(signBonus)} imza parası)!`, 'fame');
  saveGame(); renderAll(); openMenuSection('sports');
}

function joinSyndicate() {
  if (G.age < 17) { showToast('17+ yaş gerekir!'); return; }
  G.syndicate.joined = true; G.syndicate.rankLevel = 1; G.syndicate.respect = 25;
  addLog(G.age, `🩸 Yeraltı Sendikasına katıldın.`, 'milestone');
  saveGame(); renderAll(); openMenuSection('crime');
}

function syndicateAction(act) {
  if (!G.syndicate.joined) return;
  if (act === 'promote') {
    if (G.syndicate.rankLevel >= 4 || G.syndicate.respect < G.syndicate.rankLevel * 30) { showToast('Saygınlık yetersiz!'); return; }
    G.syndicate.rankLevel += 1;
    const rObj = SYNDICATE_RANKS.find(r => r.level === G.syndicate.rankLevel);
    if (G.syndicate.rankLevel === 4) unlockAchievement('syndicate_boss');
    playSfx('trophy');
    addLog(G.age, `🕶️ Sendikada **${rObj.title}** rütbesine yükseldin!`, 'fame');
  } else if (act === 'mole') {
    G.syndicate.respect = clamp(G.syndicate.respect + (Math.random() < 0.6 ? 18 : -10));
  }
  saveGame(); renderAll(); openMenuSection('crime');
}

function launderDirtyMoney() {
  if (!G.dirtyMoney || G.dirtyMoney <= 0 || G.businesses.length === 0) { showToast('Kara para veya paravan şirket yok!'); return; }
  const cleanAmt = Math.round(G.dirtyMoney * 0.85);
  G.money += cleanAmt; G.dirtyMoney = 0;
  playSfx('coin');
  addLog(G.age, `🧼 Kara parayı aklayarak **+${fmtMoney(cleanAmt)}** temiz nakite çevirdin!`, 'good');
  saveGame(); renderAll(); openNavSheet('finance');
}

function treatDiseases(mode, cost) {
  if (G.diseases.length === 0 || (cost > 0 && G.money < cost)) return;
  G.money -= cost;
  if (Math.random() < (mode === 'private' ? 1.0 : 0.55)) {
    G.diseases = []; G.health = clamp(G.health + 22);
    playSfx('coin'); showToast('Tamamen iyileştin!');
  } else {
    playSfx('bad'); showToast('Tedavi sonuç vermedi.');
  }
  saveGame(); renderAll(); openMenuSection('health');
}

function findPartner() {
  if (G.age < 16) { showToast('16+ yaş gerekir!'); return; }
  const c = getCountry();
  const pool = G.gender === 'M' ? c.namesF : c.namesM;
  const pName = pickRandom(pool) + ' ' + pickRandom(c.lastNames);
  G.partner = { name: pName, age: G.age + randInt(-2, 3), love: 78, married: false, prenup: false, cheated: false };
  G.happy = clamp(G.happy + 12);
  addLog(G.age, `💘 **${pName}** ile çıkmaya başladın!`, 'good');
  saveGame(); renderAll(); openNavSheet('relations');
}

function datePartnerAction(act) {
  if (!G.partner) return;
  const c = getCountry();
  if (act === 'gift') {
    const cost = Math.round(c.monthlyMinWage * 0.3);
    if (G.money < cost) return;
    G.money -= cost; G.partner.love = clamp(G.partner.love + 15); G.happy = clamp(G.happy + 6);
  } else if (act === 'marry_normal' || act === 'marry_prenup') {
    const isPrenup = act === 'marry_prenup';
    const cost = Math.round(c.monthlyMinWage * (isPrenup ? 3.5 : 3));
    if (G.money < cost) { showToast('Bakiye yetersiz!'); return; }
    G.money -= cost; G.partner.married = true; G.partner.prenup = isPrenup;
    addLog(G.age, `💍 **${G.partner.name}** ile ${isPrenup ? 'Evlilik Sözleşmeli olarak' : ''} evlendin!`, 'milestone');
  } else if (act === 'detective') {
    const detCost = Math.round(c.monthlyMinWage * 1.2);
    if (G.money < detCost) return;
    G.money -= detCost;
    if (Math.random() < 0.35) { G.partner.cheated = true; addLog(G.age, `🕵️ Özel dedektif aldatmayı kanıtladı!`, 'good'); }
    else showToast('Sadakatsizlik bulunamadı.');
  } else if (act === 'divorce') {
    const oldP = G.partner.name;
    if (G.partner.prenup || G.partner.cheated) {
      addLog(G.age, `⚖️ **${oldP}** ile tazminatsız ve nafakasız boşandın!`, 'good');
    } else {
      const split = Math.max(0, Math.round(G.money * 0.5));
      G.money -= split; G.monthlyAlimony = Math.round(c.monthlyMinWage * 0.45);
      addLog(G.age, `💔 **ÇEKİŞMELİ BOŞANMA!** **${oldP}** servetinin yarısını (**${fmtMoney(split)}**) aldı ve aylık **${fmtMoney(G.monthlyAlimony)} nafaka** bağlandı!`, 'bad');
    }
    G.partner = null;
  } else if (act === 'child') {
    const g = Math.random() < 0.5 ? 'M' : 'F';
    const childName = pickRandom(g === 'M' ? c.namesM : c.namesF) + ' ' + G.lastName;
    G.children.push({ name: childName, gender: g, age: 0, smart: randInt(65, 88), happy: 90, love: 90, obp: 80, privateSchool: false, trustFund: 0 });
    G.happy = clamp(G.happy + 18);
    addLog(G.age, `👶 **${childName}** adında bir çocuğun dünyaya geldi!`, 'milestone');
  }
  saveGame(); renderAll(); openNavSheet('relations');
}

function studySchoolHard() {
  G.obpScore = clamp(G.obpScore + randInt(2, 4), 50, 100); G.smart = clamp(G.smart + 3);
  saveGame(); renderAll(); openNavSheet('career');
}
function takeExamCourse() {
  G.examPrepBonus += 14; G.smart = clamp(G.smart + 4);
  saveGame(); renderAll(); openNavSheet('career');
}
function openUniversityExamModal() {
  const examScore = clamp(155 + (G.obpScore * 2.1) + (G.smart * 1.1) + G.examPrepBonus + randInt(-15, 22), 160, 500);
  const rank = Math.max(450, Math.round((505 - examScore) * 1450));
  G.lastExamScore = examScore; G.lastExamRank = rank;
  openEventModal({
    badge: '📝 Ulusal Üniversite Sınav Sonucu (YKS)',
    title: `Puanın: ${examScore} • Sıralaman: #${rank.toLocaleString('tr-TR')}`,
    desc: `OBP (${G.obpScore}) ve sınav performansınla #${rank.toLocaleString('tr-TR')} oldun.`,
    choices: [
      { label: '🎓 Tercih Kılavuzunu Aç', action: () => openNavSheet('career') },
      { label: '📚 Mezuna Kal (+28 Ek Puan)', action: () => { G.examPrepBonus += 28; renderAll(); } }
    ]
  });
}
function enrollUniversity(majorId, isPrivate) {
  const m = UNI_MAJORS.find(x => x.id === majorId);
  const c = getCountry();
  if (!m) return;
  if (G.lastExamScore < (isPrivate ? m.minScore - 40 : m.minScore)) { showToast('Puanın yetersiz!'); return; }
  const fee = isPrivate ? c.uniPrivateFee : c.uniPublicFee;
  if (fee > 0 && G.money < fee) { showToast('Harç için bakiye yetersiz!'); return; }
  G.money -= fee; G.eduStage = 'Üniversite'; G.currentMajor = m.id; G.uniYearsLeft = m.years;
  G.uniLiving = 'kyk'; G.kykSupport = G.lastExamScore >= 420 ? 'burs' : 'kredi';
  addLog(G.age, `🎓 **${m.name}** bölümüne yerleştin!`, 'milestone');
  saveGame(); renderAll(); openNavSheet('career');
}
function setUniLiving(mode) { G.uniLiving = mode; saveGame(); renderAll(); openNavSheet('career'); }
function togglePartTimeJob(ptId) {
  const pt = PART_TIME_JOBS.find(x => x.id === ptId);
  if (!pt || (pt.reqLic && !G.licenses[pt.reqLic])) { showToast('Ehliyet gerekiyor!'); return; }
  G.partTimeJobId = G.partTimeJobId === ptId ? null : ptId;
  saveGame(); renderAll(); openNavSheet('career');
}
function applyForJob(jobId) {
  if (G.age < 18) { showToast('18+ yaş gerekir!'); return; }
  const j = JOBS.find(x => x.id === jobId);
  if (!j) return;
  if (j.cleanRecord && G.criminalRecord) { showToast('Adli sicil kaydın engel!'); return; }
  if (j.reqEdu === 'highschool' && !G.highSchoolGrad) { showToast('Lise diploması gerekir!'); return; }
  if (j.reqEdu === 'uni' && (!G.uniGrad || G.graduatedMajor !== j.major)) { showToast('İlgili fakülte diploması gerekir!'); return; }
  if (j.reqLicense && !G.licenses[j.reqLicense]) { showToast(`${j.reqLicense} Ehliyet gerekir!`); return; }
  if (j.minExp && G.jobExp < j.minExp) { showToast(`En az ${j.minExp} yıl deneyim gerekir!`); return; }
  G.jobId = j.id;
  unlockAchievement('first_job'); playSfx('coin');
  addLog(G.age, `💼 **${j.title}** olarak işe başladın!`, 'milestone');
  saveGame(); renderAll(); openNavSheet('career');
}
function quitJob() { G.jobId = null; saveGame(); renderAll(); openNavSheet('career'); }
function depositSavings() { if (G.money <= 0) return; const a = Math.round(G.money * 0.5); G.money -= a; G.bankSavings += a; saveGame(); renderAll(); openNavSheet('finance'); }
function withdrawSavings() { if (G.bankSavings <= 0) return; G.money += G.bankSavings; G.bankSavings = 0; saveGame(); renderAll(); openNavSheet('finance'); }
function takeBankLoan(mult) {
  if (G.age < 18 || G.creditScore < 650) { showToast('Findeks kredi notu yetersiz!'); return; }
  const amt = Math.round(getCountry().monthlyMinWage * mult);
  G.money += amt; G.loanDebt += Math.round(amt * 1.25); G.creditScore = clamp(G.creditScore - 40, 300, 1900);
  playSfx('coin'); saveGame(); renderAll(); openNavSheet('finance');
}
function payOffLoan() {
  if (G.money < G.loanDebt) { showToast('Nakit yetersiz!'); return; }
  G.money -= G.loanDebt; G.loanDebt = 0; G.creditScore = clamp(G.creditScore + 120, 300, 1900);
  saveGame(); renderAll(); openNavSheet('finance');
}
function createNewBusiness(typeId) {
  const c = getCountry();
  const bType = BUSINESS_TYPES.find(x => x.id === typeId);
  if (!bType) return;
  const cost = Math.round(c.monthlyMinWage * bType.costMinWages);
  if (G.money < cost) { showToast('Sermaye yetersiz!'); return; }
  G.money -= cost; G.businesses.push({ uid: uid(), typeId, fleet: 1, employees: 2, strategy: 'balanced' });
  playSfx('coin'); addLog(G.age, `🏢 **${bType.name}** şirketini kurdun!`, 'milestone');
  saveGame(); renderAll(); openNavSheet('finance');
}
function expandBizFleet(idx, cost) {
  const b = G.businesses[idx];
  if (!b || G.money < cost) { showToast('Bakiye yetersiz!'); return; }
  G.money -= cost; b.fleet += 1;
  if (b.fleet >= 5) unlockAchievement('fleet_king');
  playSfx('coin'); saveGame(); renderAll(); openNavSheet('finance');
}
function hireBizStaff(idx, cost) {
  const b = G.businesses[idx];
  if (!b || G.money < cost) return;
  G.money -= cost; b.employees += 2;
  saveGame(); renderAll(); openNavSheet('finance');
}
function setBizStrategy(idx, strat) { if (G.businesses[idx]) { G.businesses[idx].strategy = strat; saveGame(); renderAll(); openNavSheet('finance'); } }

function buyCar(carId, isUsedDamaged) {
  const c = getCountry();
  const car = CARS.find(x => x.id === carId);
  if (!car || !G.licenses[car.reqLic]) { showToast(`${car.reqLic} Ehliyet gerekir!`); return; }
  const zeroPrice = Math.round(c.monthlyMinWage * car.baseMinWages * c.carTaxMultiplier);
  const price = isUsedDamaged ? Math.round(zeroPrice * 0.55) : zeroPrice;
  if (G.money < price) { showToast('Bakiye yetersiz!'); return; }
  G.money -= price;
  G.cars.push({ uid: uid(), carId: car.id, name: car.name, icon: car.icon, cond: isUsedDamaged ? randInt(42, 58) : 100, repairedOnce: false, trafficIns: true, kasko: !isUsedDamaged, value: isUsedDamaged ? Math.round(zeroPrice * 0.6) : Math.round(zeroPrice * 0.92) });
  activeGarageTab = 'mycars'; inspectedCarIndex = G.cars.length - 1;
  playSfx('coin'); saveGame(); renderAll(); openMenuSection('cars');
}
function toggleCarPolicy(idx, field) { if (G.cars[idx]) { G.cars[idx][field] = !G.cars[idx][field]; saveGame(); renderAll(); openMenuSection('cars'); } }
function repairCarInSanayi(idx, cost) {
  const car = G.cars[idx];
  if (!car || car.cond >= 98 || G.money < cost) { showToast('İşlem yapılamadı!'); return; }
  const c = getCountry();
  const baseCar = CARS.find(x => x.id === car.carId);
  const zeroPrice = baseCar ? Math.round(c.monthlyMinWage * baseCar.baseMinWages * c.carTaxMultiplier) : car.value;
  G.money -= cost; car.cond = 100; car.repairedOnce = true; car.value = Math.round(zeroPrice * 0.90);
  playSfx('coin'); saveGame(); renderAll(); openMenuSection('cars');
}
function sellMyCar(idx) {
  const car = G.cars[idx];
  if (!car) return;
  G.money += car.value;
  if (car.repairedOnce) unlockAchievement('sanayi_wolf');
  G.cars.splice(idx, 1); inspectedCarIndex = 0;
  playSfx('coin'); saveGame(); renderAll(); openMenuSection('cars');
}

function buyHouse(houseId) {
  const c = getCountry();
  const h = HOUSES.find(x => x.id === houseId);
  if (!h) return;
  const price = Math.round(c.monthlyMinWage * h.baseMinWages * (c.houseMultiplier / 120));
  if (G.money < price) { showToast('Bakiye yetersiz!'); return; }
  G.money -= price;
  G.houses.push({ uid: uid(), houseId: h.id, name: h.name, icon: h.icon, value: price, monthlyRent: Math.round((price * h.rentYield) / 12), isRented: G.houses.length > 0, tenantOk: true });
  playSfx('coin'); saveGame(); renderAll(); openMenuSection('houses');
}
function toggleHouseRent(idx) { if (G.houses[idx]) { G.houses[idx].isRented = !G.houses[idx].isRented; G.houses[idx].tenantOk = true; saveGame(); renderAll(); openMenuSection('houses'); } }
function evictBadTenant(idx) {
  const h = G.houses[idx];
  const fee = Math.round(getCountry().monthlyMinWage * 0.4);
  if (!h || G.money < fee) return;
  G.money -= fee; h.tenantOk = true;
  saveGame(); renderAll(); openMenuSection('houses');
}
function sellHouse(idx) { if (G.houses[idx]) { G.money += G.houses[idx].value; G.houses.splice(idx, 1); playSfx('coin'); saveGame(); renderAll(); openMenuSection('houses'); } }

function commitCrime(type) {
  if (G.age < 16 || G.inPrison) return;
  const c = getCountry();
  let title = 'Siber Vurgun', multMin = 8, multMax = 22, years = 3, chance = 0.45 + (G.smart / 300);
  if (type === 'smuggle') { title = 'Gümrüksüz Kaçak Sevkiyat'; multMin = 15; multMax = 35; years = 5; chance = 0.42; }
  if (type === 'heist') { title = 'Merkez Bankası Zırhlı Araç Soygunu'; multMin = 50; multMax = 90; years = 10; chance = 0.28; }
  closeBottomSheet();
  if (Math.random() < chance) {
    const loot = Math.round(c.monthlyMinWage * randInt(multMin, multMax));
    G.dirtyMoney += loot;
    if (G.syndicate.joined) G.syndicate.respect = clamp(G.syndicate.respect + 15);
    playSfx('coin');
    addLog(G.age, `🕵️ **${title}** operasyonundan **+${fmtMoney(loot)} Kara Para** elde ettin!`, 'good');
    saveGame(); renderAll();
  } else {
    openCourtTrialModal(title, years);
  }
}

function openCourtTrialModal(crimeTitle, years) {
  const c = getCountry();
  const lawMid = Math.round(c.monthlyMinWage * 2);
  const lawTop = Math.round(c.monthlyMinWage * 6);
  playSfx('bad');
  openEventModal({
    badge: '🚨 Ağır Ceza Mahkemesi',
    title: `${crimeTitle} Suçlamasıyla Yargılanıyorsun!`,
    desc: `Savcı ${years} yıl hapis talep ediyor. Savunma avukatını seç:`,
    choices: [
      { label: '🏛️ Baro Avukatı (Ücretsiz • %18 Beraat)', action: () => resolveCourtTrial(crimeTitle, years, 0, 0.18) },
      { label: `⚖️ Uzman Avukat (${fmtMoney(lawMid)} • %52 Beraat)`, action: () => resolveCourtTrial(crimeTitle, years, lawMid, 0.52) },
      { label: `🎩 Ünlü Ceza Avukatı (${fmtMoney(lawTop)} • %85 Beraat)`, action: () => resolveCourtTrial(crimeTitle, years, lawTop, 0.85) }
    ]
  });
}

function resolveCourtTrial(crimeTitle, sentenceYears, lawyerCost, winProb) {
  if (lawyerCost > 0 && G.money < lawyerCost) winProb = 0.18;
  else G.money -= lawyerCost;
  if (Math.random() < winProb) {
    playSfx('coin'); addLog(G.age, `⚖️ Mahkemeden **BERAAT** ettin!`, 'good');
  } else {
    G.inPrison = true; G.prisonYearsLeft = sentenceYears; G.criminalRecord = true; G.jobId = null; G.politics.officeId = null;
    playSfx('bad'); addLog(G.age, `⛓️ **${crimeTitle}** suçundan **${sentenceYears} yıl hapis** cezası aldın!`, 'bad');
  }
  saveGame(); renderAll();
}

function prisonAction(act) {
  if (!G.inPrison) return;
  if (act === 'gym') { G.health = clamp(G.health + 8); G.looks = clamp(G.looks + 5); }
  else if (act === 'library') { G.smart = clamp(G.smart + 7); }
  else if (act === 'appeal' && Math.random() < 0.4) { G.prisonYearsLeft = Math.max(1, G.prisonYearsLeft - 1); }
  else if (act === 'escape') {
    if (Math.random() < 0.25) { G.inPrison = false; G.prisonYearsLeft = 0; addLog(G.age, `🏃 Cezaevinden **FİRAR ETTİN!**`, 'milestone'); }
    else { G.prisonYearsLeft += 2; addLog(G.age, `🚨 Firar girişimin yakalandı (+2 Yıl Ceza).`, 'bad'); }
  }
  saveGame(); renderAll(); openNavSheet('career');
}

function clearCriminalRecord(cost) { if (!G.inPrison && G.money >= cost) { G.money -= cost; G.criminalRecord = false; saveGame(); renderAll(); openMenuSection('license'); } }
function joinSocialPlatform(name) { if (G.age >= 13 && !G.social.activePlatforms.includes(name)) { G.social.activePlatforms.push(name); G.social.followers += randInt(80, 280); saveGame(); renderAll(); openMenuSection('social'); } }
function postSocialContent(type) {
  if (G.social.activePlatforms.length === 0 || G.social.postsThisYear >= 3) return;
  const c = getCountry();
  G.social.postsThisYear += 1;
  if (type === 'viral') {
    const isHit = Math.random() < (0.35 + G.looks / 250);
    const gained = isHit ? randInt(15000, 95000) : randInt(500, 3500);
    G.social.followers += gained;
    if (isHit) G.fame = clamp(G.fame + 9);
  } else if (type === 'stream') {
    G.social.followers += randInt(1500, 14000); G.money += Math.round(c.monthlyMinWage * 0.35);
  } else if (type === 'sponsor' && G.social.followers >= 10000) {
    G.money += Math.round((G.social.followers / 10000) * (c.monthlyMinWage * 0.9));
  }
  playSfx('coin'); saveGame(); renderAll(); openMenuSection('social');
}
function applyForBlueTick() { if (!G.social.verified && G.social.followers >= 50000) { G.social.verified = true; G.fame = clamp(G.fame + 20); unlockAchievement('blue_tick'); saveGame(); renderAll(); openMenuSection('social'); } }
function takeDrivingLicense(type, cost) {
  if (G.age < 18 || G.licenses[type] || G.money < cost || (type === 'CE' && !G.licenses.B)) return;
  G.money -= cost; G.licenses[type] = true; saveGame(); renderAll(); openMenuSection('license');
}
function playCasinoGame(game, bet) {
  if (G.age < 18 || G.money < bet) return;
  G.money -= bet;
  let win = 0;
  if ((game === 'blackjack' || game === 'roulette') && Math.random() < 0.48) win = bet * 2;
  if (game === 'slot' && Math.random() < 0.14) win = bet * 10;
  if (win > 0) { G.money += win; playSfx('coin'); showToast(`Kazandın! +${fmtMoney(win)}`); }
  else { playSfx('bad'); showToast(`Kaybettin: -${fmtMoney(bet)}`); }
  saveGame(); renderAll(); openMenuSection('casino');
}
function healthAction(type, cost) {
  if (G.money < cost) return;
  G.money -= cost;
  if (type === 'therapy') { G.stress = clamp(G.stress - 35); G.happy = clamp(G.happy + 14); G.diseases = G.diseases.filter(d => d !== 'burnout'); }
  else if (type === 'gym') { G.health = clamp(G.health + 8); G.looks = clamp(G.looks + 6); G.stress = clamp(G.stress - 12); }
  else if (type === 'plastic') { G.looks = clamp(G.looks + 22); }
  playSfx('coin'); saveGame(); renderAll(); openMenuSection('health');
}
function migrateToCountry(targetId, cost) {
  if (G.age < 18 || G.inPrison || G.money < cost) return;
  const oldC = getCountry();
  const newC = getCountry(targetId);
  const ratio = newC.monthlyMinWage / oldC.monthlyMinWage;
  G.money = Math.round((G.money - cost) * ratio);
  G.dirtyMoney = Math.round(G.dirtyMoney * ratio);
  G.bankSavings = Math.round(G.bankSavings * ratio);
  G.loanDebt = Math.round(G.loanDebt * ratio);
  G.monthlyAlimony = Math.round(G.monthlyAlimony * ratio);
  Object.keys(G.investments).forEach(k => { G.investments[k] = Math.round(G.investments[k] * ratio); });
  G.cars.forEach(car => { car.value = Math.round(car.value * ratio); });
  G.houses.forEach(h => { h.value = Math.round(h.value * ratio); h.monthlyRent = Math.round(h.monthlyRent * ratio); });
  G.countryId = newC.id; G.politics.officeId = null;
  G.visas.push({ code: newC.id, age: G.age, type: 'OTURUM & ÇALIŞMA VİZESİ' });
  playSfx('trophy');
  addLog(G.age, `✈️ **${oldC.name}** ülkesinden **${newC.flag} ${newC.name}** ülkesine göç ettin! Pasaportuna yeni vize mührü işlendi.`, 'milestone');
  saveGame(); renderAll(); openMenuSection('migrate');
}
function spendTimeWithFamily(idx) {
  const r = G.relations[idx];
  if (r && r.alive) { r.love = clamp(r.love + 10); G.happy = clamp(G.happy + 5); saveGame(); renderAll(); openNavSheet('relations'); }
}

function openDeathModal() {
  const netWorth = getNetWorth();
  const choices = [];
  G.children.forEach((ch, idx) => {
    const childAge = Math.max(18, ch.age || 20);
    choices.push({ label: `👑 Çocuğun ${ch.name} (${childAge} Yaş) Olarak Devam Et`, action: () => continueAsChild(idx, false) });
    if (netWorth < 0 || G.loanDebt > 0) {
      choices.push({ label: `🛡️ Reddi Miras Yap ve ${ch.name} Olarak Borçsuz Başla`, action: () => continueAsChild(idx, true) });
    }
  });
  choices.push({ label: '🔄 Sıfırdan Yeni Bir Hayata Başla', action: () => document.getElementById('startScreen').classList.remove('hidden') });
  openEventModal({
    badge: `⚰️ ${G.generation}. Kuşak Sonu`,
    title: `${G.firstName} ${G.lastName} (${G.age} Yaşında Vefat Etti)`,
    desc: `Net Servet: ${fmtMoney(netWorth)} • Başarımlar: ${G.achievements.length}/${ACHIEVEMENTS_DB.length}.`,
    choices
  });
}

function continueAsChild(childIdx, rejectInheritance) {
  const child = G.children[childIdx];
  if (!child) return;
  const oldName = `${G.firstName} ${G.lastName}`;
  const childParts = child.name.split(' ');
  const trustBonus = child.trustFund || 0;
  const inheritedMoney = (rejectInheritance ? 0 : Math.round((G.money + G.bankSavings + getTotalPortfolioValue()) * 0.9)) + trustBonus;
  const prevAch = G.achievements || [];
  const childSmart = clamp(child.smart || 75);
  const childObp = clamp(child.obp || 82, 50, 100);

  G = {
    generation: (G.generation || 1) + 1,
    firstName: childParts[0],
    lastName: childParts.slice(1).join(' ') || G.lastName,
    gender: child.gender || 'M',
    countryId: G.countryId,
    portraitIdx: randInt(0, 2),
    age: Math.max(18, child.age || 20),
    alive: true,
    health: 95, happy: clamp(child.happy || 88), smart: childSmart, looks: randInt(65, 95), fame: Math.round(G.fame * 0.35), stress: 10,
    money: inheritedMoney, dirtyMoney: 0, bankSavings: 0, loanDebt: rejectInheritance ? 0 : G.loanDebt, monthlyAlimony: 0,
    creditScore: 1200, investments: { gold: 0, forex: 0, stock: 0, crypto: 0 },
    eduStage: 'Lise Mezunu', obpScore: childObp, examPrepBonus: 15, lastExamScore: clamp(170 + childObp * 2.1 + childSmart * 1.15, 220, 495), lastExamRank: 45000,
    highSchoolGrad: true, uniGrad: false, currentMajor: null, uniYearsLeft: 0, graduatedMajor: null, uniLiving: 'kyk', kykSupport: 'none', partTimeJobId: null,
    jobId: null, jobExp: 0, licenses: { B: true, CE: false }, militaryDone: false, criminalRecord: false, inPrison: false, prisonYearsLeft: 0,
    politics: { inParty: false, officeId: null, approval: 25, taxModifier: 0 },
    sports: { branchId: null, tierIndex: 0, skill: 60, injured: false },
    syndicate: { joined: false, rankLevel: 0, respect: 10 },
    diseases: [], achievements: prevAch,
    visas: [{ code: G.countryId, age: Math.max(18, child.age || 20), type: 'MİRASÇI VATANDAŞ' }],
    social: { activePlatforms: [], followers: Math.round(G.social.followers * 0.2), verified: false, postsThisYear: 0, annualAdIncome: 0 },
    cars: rejectInheritance ? [] : G.cars,
    houses: rejectInheritance ? [] : G.houses,
    businesses: rejectInheritance ? [] : G.businesses,
    relations: [], partner: null, children: [], willChildIndex: 0, logs: []
  };

  normalizeState();
  unlockAchievement('dynasty');
  addLog(G.age, `👑 **${G.generation}. Kuşak!** Ebeveynin **${oldName}** sonrasında mirası${trustBonus > 0 ? ` ve **+${fmtMoney(trustBonus)}** vergisiz çocuk fonunu` : ''} devralarak hayata devam ediyorsun!`, 'milestone');
  saveGame(); renderAll();
}

function closeBottomSheet() { document.getElementById('bottomSheet').classList.add('hidden'); }
function openEventModal(ev) {
  const modal = document.getElementById('eventModal');
  document.getElementById('eventBadge').textContent = ev.badge || 'Olay';
  document.getElementById('eventTitle').textContent = ev.title;
  document.getElementById('eventDesc').textContent = ev.desc;
  const box = document.getElementById('eventChoices');
  box.innerHTML = '';
  ev.choices.forEach(ch => {
    const btn = document.createElement('button');
    btn.className = 'w-full p-3.5 rounded-2xl bg-slate-800/90 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/50 text-left text-xs font-extrabold text-white transition active:scale-[0.98]';
    btn.textContent = ch.label;
    btn.onclick = () => { playSfx('click'); closeEventModal(); ch.action(); saveGame(); };
    box.appendChild(btn);
  });
  modal.classList.remove('hidden');
}
function closeEventModal() { document.getElementById('eventModal').classList.add('hidden'); }
function resetToNewLifeScreen() { closeBottomSheet(); document.getElementById('startScreen').classList.remove('hidden'); }

let toastTimer = null;
function showToast(msg) {
  const box = document.getElementById('toastBox');
  const txt = document.getElementById('toastText');
  txt.textContent = msg;
  box.classList.remove('opacity-0', '-translate-y-2');
  box.classList.add('opacity-100', 'translate-y-0');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    box.classList.add('opacity-0', '-translate-y-2');
    box.classList.remove('opacity-100', 'translate-y-0');
  }, 2300);
}

window.addEventListener('DOMContentLoaded', initStartScreen);

/* ============================================================================
   FUTBOL KULÜBÜ BAŞKANLIĞI, FİKSTÜR VE CANLI MAÇ MOTORU
   ============================================================================ */

let activeClubSubTab = 'fixture'; // 'fixture' | 'squad' | 'transfer' | 'stadium' | 'media'
let selectedBrowseLeague = 'TR';

function ensureClubPresidencyState() {
  if (!G) return;
  if (!G.club) {
    G.club = {
      active: false,
      leagueId: 'TR',
      teamId: null,
      teamName: null,
      roleType: 'kongre', // 'kongre' | 'sahiplik'
      season: 1,
      week: 1,
      power: 82,
      gkPow: 80,
      defPow: 81,
      midPow: 82,
      attPow: 83,
      managerId: 'mourinho',
      tactic: '4-2-3-1 Hücum',
      ticketTier: 'balanced', // 'cheap' | 'balanced' | 'vip'
      stadiumCap: 50530,
      stadiumLevel: 1,
      academyLevel: 1,
      sponsorTier: 1,
      clubTreasury: 0,
      clubDebt: 0,
      fanTrust: 78,
      boardTrust: 80,
      inEurope: true,
      europeStage: 'Lig Aşaması',
      trophies: { league: 0, ucl: 0 },
      roster: ['p_irfan', 'p_jayden', 'p_nesyri', 'p_livakovic'],
      standings: [],
      fixtures: []
    };
  }
}

// 12 Takımlı 22 Haftalık Çift Devreli Gerçek Lig Fikstürü Üretici (Berger Algoritması)
function generateSeasonFixturesAndStandings(leagueId) {
  const lg = FOOTBALL_LEAGUES_DB[leagueId] || FOOTBALL_LEAGUES_DB.TR;
  const teams = lg.teams.map(t => Object.assign({}, t));

  G.club.standings = teams.map(t => ({
    id: t.id,
    name: t.name,
    short: t.short,
    colors: t.colors,
    power: t.id === G.club.teamId ? G.club.power : t.power,
    p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0
  }));

  const ids = teams.map(t => t.id);
  const n = ids.length; // 12
  const firstHalf = [];
  let rot = ids.slice(1);

  for (let r = 0; r < n - 1; r++) {
    const roundMatches = [];
    const cur = [ids[0], ...rot];
    for (let i = 0; i < n / 2; i++) {
      const home = (r % 2 === 0 && i === 0) ? cur[n - 1 - i] : cur[i];
      const away = (r % 2 === 0 && i === 0) ? cur[i] : cur[n - 1 - i];
      roundMatches.push({ home, away, played: false, hScore: null, aScore: null });
    }
    firstHalf.push(roundMatches);
    rot.unshift(rot.pop());
  }

  const secondHalf = firstHalf.map(round =>
    round.map(m => ({ home: m.away, away: m.home, played: false, hScore: null, aScore: null }))
  );

  G.club.fixtures = [...firstHalf, ...secondHalf];
  G.club.week = 1;
}

function sortStandingsTable() {
  G.club.standings.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const gdB = b.gf - b.ga;
    const gdA = a.gf - a.ga;
    if (gdB !== gdA) return gdB - gdA;
    return b.gf - a.gf;
  });
}

// Kongre Seçimi veya Kulüp Satın Alma İşlemi
function acquireOrElectClub(leagueId, teamId) {
  ensureClubPresidencyState();
  const c = getCountry();
  const lg = FOOTBALL_LEAGUES_DB[leagueId];
  const tm = lg ? lg.teams.find(x => x.id === teamId) : null;
  if (!tm) return;

  if (G.age < 25) {
    showToast('Kulüp başkanı olabilmek için en az 25 yaşında olmalısın!');
    return;
  }

  const isKongre = tm.model === 'kongre';
  const costMinWages = isKongre ? Math.round(tm.valueM * 0.16) : Math.round(tm.valueM * 0.75);
  const reqCost = Math.round(c.monthlyMinWage * costMinWages);

  if (G.money < reqCost) {
    showToast(`${isKongre ? 'Kongre kampanya ve kasa teminatı' : 'Kulüp %51 hisse devri'} için ${fmtMoney(reqCost)} gerekiyor!`);
    return;
  }

  if (isKongre) {
    // Kongre Seçim Modalı
    openEventModal({
      badge: `🗳️ ${tm.colors} ${tm.name} Olağanüstü Genel Kurulu`,
      title: 'Kongre Başkanlık Seçimi ve Vaatler',
      desc: `${tm.name} kongre üyeleri sandık başında! Rakip adayı geçip başkan seçilmek için kongre üyelerine en güçlü vaadini açıkla (Teminat: ${fmtMoney(reqCost)}):`,
      choices: [
        {
          label: '🌟 "Dünya Yıldızlarını ve Şampiyonluğu Getireceğim!"',
          action: () => finalizeClubTakeover(leagueId, tm, reqCost, 'kongre', 84)
        },
        {
          label: '🏟️ "Stadyumu Büyütecek ve Kulübü Borçsuz Yapacağım!"',
          action: () => finalizeClubTakeover(leagueId, tm, reqCost, 'kongre', 80)
        }
      ]
    });
  } else {
    finalizeClubTakeover(leagueId, tm, reqCost, 'sahiplik', 85);
  }
}

function finalizeClubTakeover(leagueId, tm, reqCost, mode, startTrust) {
  const c = getCountry();
  G.money -= reqCost;

  G.club.active = true;
  G.club.leagueId = leagueId;
  G.club.teamId = tm.id;
  G.club.teamName = tm.name;
  G.club.roleType = mode;
  G.club.season = 1;
  G.club.power = tm.power;
  G.club.gkPow = tm.power - 1;
  G.club.defPow = tm.power;
  G.club.midPow = tm.power;
  G.club.attPow = tm.power + 1;
  G.club.stadiumCap = tm.capacity;
  G.club.clubTreasury = Math.round(c.monthlyMinWage * (tm.valueM * 0.18));
  G.club.clubDebt = Math.round(c.monthlyMinWage * (tm.valueM * 0.12));
  G.club.fanTrust = startTrust;
  G.club.boardTrust = startTrust;
  G.club.inEurope = tm.power >= 80;
  G.club.europeStage = tm.power >= 84 ? 'UEFA Şampiyonlar Ligi' : 'UEFA Avrupa Ligi';

  generateSeasonFixturesAndStandings(leagueId);
  unlockAchievement('club_president');
  G.fame = clamp(G.fame + 28);
  playSfx('trophy');

  addLog(G.age, `🏟️ **BÜYÜK BAŞKAN!** **${tm.colors} ${tm.name}** kulübünün ${mode === 'kongre' ? 'kongrede rekor oyla yeni **Başkanı** seçildin!' : 'çoğunluk hisselerini satın alarak **Sahibi & Başkanı** oldun!'}`, 'fame');
  saveGame();
  renderAll();
  activeClubSubTab = 'fixture';
  openMenuSection('club_presidency');
}

// 1 Haftalık Maçları Hesaplama & Canlı Maç Merkezi
function playNextClubWeek(interactive = true) {
  ensureClubPresidencyState();
  if (!G.club.active) return;
  if (G.club.week > 22) {
    finishClubSeason();
    return;
  }

  const c = getCountry();
  const roundIdx = G.club.week - 1;
  const roundMatches = G.club.fixtures[roundIdx];
  if (!roundMatches) return;

  const myMatch = roundMatches.find(m => m.home === G.club.teamId || m.away === G.club.teamId);
  if (!myMatch) return;

  const isHome = myMatch.home === G.club.teamId;
  const oppId = isHome ? myMatch.away : myMatch.home;
  const myTeamRow = G.club.standings.find(t => t.id === G.club.teamId);
  const oppTeamRow = G.club.standings.find(t => t.id === oppId);
  myTeamRow.power = G.club.power;

  const mgr = FOOTBALL_MANAGERS_DB.find(x => x.id === G.club.managerId) || FOOTBALL_MANAGERS_DB[0];
  const myEffPower = G.club.power + Math.round((mgr.tac - 82) * 0.45) + (isHome ? 3 : 0);
  const oppEffPower = oppTeamRow.power + (isHome ? 0 : 3);

  // İlk Yarı Skoru Üret
  const diff = myEffPower - oppEffPower;
  let myHT = Math.max(0, Math.round(randInt(0, 2) + (diff > 5 ? 0.4 : 0) - (diff < -5 ? 0.4 : 0)));
  let oppHT = Math.max(0, Math.round(randInt(0, 2) - (diff > 5 ? 0.3 : 0) + (diff < -5 ? 0.4 : 0)));

  const isDerby = oppTeamRow.power >= 81;

  if (interactive) {
    const bonusCost = Math.round(c.monthlyMinWage * 1.6);
    const hName = isHome ? `${myTeamRow.colors} ${myTeamRow.name}` : `${oppTeamRow.colors} ${oppTeamRow.name}`;
    const aName = isHome ? `${oppTeamRow.colors} ${oppTeamRow.name}` : `${myTeamRow.colors} ${myTeamRow.name}`;
    const hHT = isHome ? myHT : oppHT;
    const aHT = isHome ? oppHT : myHT;

    openEventModal({
      badge: `${isDerby ? '🔥 DEV DERBİ • ' : ''}HAFTA ${G.club.week}/22 • İLK YARI SONUCU`,
      title: `${hName} [${hHT} - ${aHT}] ${aName}`,
      desc: `İlk 45 dakika tamamlandı. Başkan olarak devre arasında soyunma odasına veya teknik heyete nasıl bir müdahalede bulunacaksın?`,
      choices: [
        {
          label: `💰 Soyunma Odasına İn ve Galibiyet Primi Açıkla (${fmtMoney(bonusCost)})`,
          action: () => resolveWeekMatches(roundMatches, myMatch, isHome, myHT, oppHT, 'bonus', bonusCost)
        },
        {
          label: '⚡ Teknik Heyete "Tam Saha Hücum & Pres" Talimatı Ver',
          action: () => resolveWeekMatches(roundMatches, myMatch, isHome, myHT, oppHT, 'attack', 0)
        },
        {
          label: '🛡️ Teknik Direktörün Taktik Planına Güven (Dengeli)',
          action: () => resolveWeekMatches(roundMatches, myMatch, isHome, myHT, oppHT, 'steady', 0)
        }
      ]
    });
  } else {
    resolveWeekMatches(roundMatches, myMatch, isHome, myHT, oppHT, 'steady', 0);
  }
}

function resolveWeekMatches(roundMatches, myMatch, isHome, myHT, oppHT, approach, bonusCost) {
  const c = getCountry();
  const lg = FOOTBALL_LEAGUES_DB[G.club.leagueId] || FOOTBALL_LEAGUES_DB.TR;
  const myTeamRow = G.club.standings.find(t => t.id === G.club.teamId);
  const oppId = isHome ? myMatch.away : myMatch.home;
  const oppTeamRow = G.club.standings.find(t => t.id === oppId);

  let my2nd = randInt(0, 2);
  let opp2nd = randInt(0, 1);

  if (approach === 'bonus') {
    G.club.clubTreasury -= bonusCost;
    if (Math.random() < 0.72) my2nd += 1;
  } else if (approach === 'attack') {
    if (Math.random() < 0.60) my2nd += 1;
    else opp2nd += 1;
  }

  if (G.club.power > oppTeamRow.power + 4 && Math.random() < 0.5) my2nd += 1;
  if (oppTeamRow.power > G.club.power + 4 && Math.random() < 0.5) opp2nd += 1;

  const myFT = myHT + my2nd;
  const oppFT = oppHT + opp2nd;

  // Diğer tüm maçları simüle et
  roundMatches.forEach(m => {
    m.played = true;
    const hRow = G.club.standings.find(t => t.id === m.home);
    const aRow = G.club.standings.find(t => t.id === m.away);
    if (m === myMatch) {
      m.hScore = isHome ? myFT : oppFT;
      m.aScore = isHome ? oppFT : myFT;
    } else {
      const pDiff = (hRow.power + 2) - aRow.power;
      m.hScore = Math.max(0, randInt(0, 3) + (pDiff > 5 ? 1 : 0));
      m.aScore = Math.max(0, randInt(0, 2) + (pDiff < -5 ? 1 : 0));
    }
    applyMatchToStandings(hRow, aRow, m.hScore, m.aScore);
  });

  // Gişe, Sponsor ve Yayın Geliri (Ev sahibi maçlarda stadyum gişesi)
  const ticketMult = G.club.ticketTier === 'vip' ? 1.35 : (G.club.ticketTier === 'cheap' ? 0.8 : 1.0);
  const matchGateIncome = isHome ? Math.round(c.monthlyMinWage * (G.club.stadiumCap / 12000) * ticketMult * lg.uefaCoeff) : 0;
  const tvBonus = myFT > oppFT ? Math.round(c.monthlyMinWage * 1.4 * lg.uefaCoeff) : (myFT === oppFT ? Math.round(c.monthlyMinWage * 0.6 * lg.uefaCoeff) : 0);

  G.club.clubTreasury += (matchGateIncome + tvBonus);

  // Taraftar ve Yönetim Güvenoyu Güncellemesi
  if (myFT > oppFT) {
    G.club.fanTrust = clamp(G.club.fanTrust + 5);
    G.club.boardTrust = clamp(G.club.boardTrust + 4);
    playSfx('coin');
  } else if (myFT === oppFT) {
    G.club.fanTrust = clamp(G.club.fanTrust - 1);
  } else {
    G.club.fanTrust = clamp(G.club.fanTrust - 6);
    G.club.boardTrust = clamp(G.club.boardTrust - 4);
    playSfx('bad');
  }

  sortStandingsTable();
  const myRank = G.club.standings.findIndex(t => t.id === G.club.teamId) + 1;
  const resIcon = myFT > oppFT ? '🟢 GALİBİYET' : (myFT === oppFT ? '🟡 BERABERLİK' : '🔴 MAĞLUBİYET');
  addLog(G.age, `⚽ **Hafta ${G.club.week} (${resIcon}):** ${myTeamRow.name} **${myFT} - ${oppFT}** ${oppTeamRow.name} • Lig Sırası: **#${myRank}** • Gişe/Yayın: **+${fmtMoney(matchGateIncome + tvBonus)}**.`, myFT >= oppFT ? 'good' : 'bad');

  G.club.week += 1;
  saveGame();
  renderAll();
  openMenuSection('club_presidency');
}

function applyMatchToStandings(hRow, aRow, hGoals, aGoals) {
  hRow.p += 1; aRow.p += 1;
  hRow.gf += hGoals; hRow.ga += aGoals;
  aRow.gf += aGoals; aRow.ga += hGoals;
  if (hGoals > aGoals) { hRow.w += 1; hRow.pts += 3; aRow.l += 1; }
  else if (hGoals < aGoals) { aRow.w += 1; aRow.pts += 3; hRow.l += 1; }
  else { hRow.d += 1; aRow.d += 1; hRow.pts += 1; aRow.pts += 1; }
}

function simulateMultipleClubWeeks(count) {
  for (let i = 0; i < count; i++) {
    if (G.club.week > 22) break;
    playNextClubWeek(false);
  }
}

function finishClubSeason() {
  sortStandingsTable();
  const c = getCountry();
  const lg = FOOTBALL_LEAGUES_DB[G.club.leagueId] || FOOTBALL_LEAGUES_DB.TR;
  const myRank = G.club.standings.findIndex(t => t.id === G.club.teamId) + 1;
  const champ = G.club.standings[0];

  let prizeMult = Math.max(4, (14 - myRank) * 3.2) * lg.uefaCoeff;
  let uclWon = false;

  if (myRank === 1) {
    G.club.trophies.league += 1;
    prizeMult += 25 * lg.uefaCoeff;
    G.fame = clamp(G.fame + 25);
    unlockAchievement('super_lig_champ');
  }

  // Avrupa Kupası Sezon Sonu Hesabı
  if (G.club.inEurope && G.club.power >= 86 && Math.random() < 0.38) {
    uclWon = true;
    G.club.trophies.ucl += 1;
    prizeMult += 45 * lg.uefaCoeff;
    unlockAchievement('ucl_winner');
  }

  const totalPrize = Math.round(c.monthlyMinWage * prizeMult);
  G.club.clubTreasury += totalPrize;

  openEventModal({
    badge: `🏆 ${lg.flag} ${lg.name} • SEZON #${G.club.season} SONU`,
    title: myRank === 1 ? `🎉 ŞAMPİYON ${G.club.teamName.toUpperCase()}!` : `Sezonu ${myRank}. Sırada Tamamladın`,
    desc: `Lig Şampiyonu: ${champ.name} (${champ.pts} Puan). ${uclWon ? '🌍 Ayrıca AVRUPA KUPASINI KAZANDIN!' : ''} Kulüp kasasına sezon sonu yayın ve başarı ödülü olarak +${fmtMoney(totalPrize)} aktarıldı.`,
    choices: [
      {
        label: '🚀 Yeni Sezon Fikstürünü Çek ve Devam Et',
        action: () => {
          G.club.season += 1;
          G.club.inEurope = myRank <= 4;
          G.club.europeStage = myRank <= 2 ? 'UEFA Şampiyonlar Ligi' : (myRank <= 4 ? 'UEFA Avrupa Ligi' : 'Avrupa Dışı');
          generateSeasonFixturesAndStandings(G.club.leagueId);
          saveGame();
          renderAll();
          openMenuSection('club_presidency');
        }
      }
    ]
  });
}

// Kulüp Başkanlığı Ana Ekranı (5 Alt Sekmeli)
function renderClubPresidencyView() {
  ensureClubPresidencyState();
  const c = getCountry();

  // Henüz bir kulübün başkanı değilse: Lig ve Kulüp Seçim Ekranı
  if (!G.club.active) {
    const lg = FOOTBALL_LEAGUES_DB[selectedBrowseLeague] || FOOTBALL_LEAGUES_DB.TR;
    return `
      <div class="club-broadcast-card mb-3">
        <div class="text-[10px] font-extrabold text-orange-400 uppercase tracking-widest">⚽ FUTBOL KULÜBÜ BAŞKANLIĞI &amp; SAHİPLİK SİSTEMİ</div>
        <div class="text-sm font-extrabold text-white mt-0.5">Gerçek Bir Kulübün Başkanı Ol</div>
        <p class="text-[11px] text-slate-300 mt-1">Dernek statüsündeki kulüplerde (Fenerbahçe, Galatasaray, Beşiktaş, Real Madrid, Bayern vb.) <strong>Kongre Seçimine</strong> girebilir; şirket statüsündeki kulüplerde ise <strong>%51 Hisse Satın Alarak</strong> doğrudan kulüp sahibi olabilirsin.</p>
      </div>

      <!-- 5 Büyük Lig Seçici -->
      <div class="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
        ${Object.values(FOOTBALL_LEAGUES_DB).map(l => `
          <button onclick="selectedBrowseLeague='${l.id}'; openMenuSection('club_presidency');" class="px-3 py-2 rounded-xl border text-xs font-extrabold shrink-0 transition ${selectedBrowseLeague === l.id ? 'border-orange-500 bg-orange-500/20 text-white' : 'border-slate-800 bg-slate-900 text-slate-400'}">
            ${l.flag} ${l.name}
          </button>
        `).join('')}
      </div>

      <div class="space-y-2 pt-1">
        ${lg.teams.map(tm => {
          const isKongre = tm.model === 'kongre';
          const costMinWages = isKongre ? Math.round(tm.valueM * 0.16) : Math.round(tm.valueM * 0.75);
          const reqCost = Math.round(c.monthlyMinWage * costMinWages);
          return `
            <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
              <div class="min-w-0">
                <div class="text-xs font-extrabold text-white truncate">${tm.colors} ${tm.name} <span class="text-[10px] text-emerald-400 font-mono-num">(Güç: ${tm.power})</span></div>
                <div class="flex flex-wrap gap-1 my-1">
                  <span class="classified-tag">🏟️ ${tm.stadium} (${tm.capacity.toLocaleString('tr-TR')})</span>
                  <span class="classified-tag">${isKongre ? '🗳️ Kongre & Seçim Modeli' : '💼 %51 Hisse Satın Alma'}</span>
                </div>
                <div class="text-[10px] text-orange-300 font-mono-num">${isKongre ? 'Kongre Teminatı:' : 'Satın Alma Bedeli:'} <strong>${fmtMoney(reqCost)}</strong></div>
              </div>
              <button onclick="acquireOrElectClub('${lg.id}', '${tm.id}')" class="px-3 py-2 rounded-xl text-xs font-extrabold shrink-0 ${isKongre ? 'bg-orange-500 text-slate-950' : 'bg-emerald-500 text-slate-950'}">
                ${isKongre ? 'Aday Ol' : 'Satın Al'}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Aktif Başkanlık Gösterge Paneli
  const lg = FOOTBALL_LEAGUES_DB[G.club.leagueId] || FOOTBALL_LEAGUES_DB.TR;
  const myTeam = lg.teams.find(t => t.id === G.club.teamId) || lg.teams[0];
  sortStandingsTable();
  const myRank = G.club.standings.findIndex(t => t.id === G.club.teamId) + 1;

  const headerCard = `
    <div class="club-broadcast-card mb-2.5 space-y-2">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-[9px] font-extrabold text-orange-400 uppercase tracking-widest">${lg.flag} ${lg.name} &bull; SEZON #${G.club.season}</div>
          <div class="text-sm font-extrabold text-white">${myTeam.colors} ${G.club.teamName} Başkanlığı</div>
        </div>
        <div class="text-right">
          <div class="text-[9px] text-slate-400 uppercase">KULÜP KASASI</div>
          <div class="text-xs font-extrabold font-mono-num text-emerald-400">${fmtMoney(G.club.clubTreasury)}</div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-1.5 text-center pt-1">
        <div class="p-1.5 rounded-lg bg-slate-950/90 border border-slate-800">
          <div class="text-[8px] text-slate-400">LİG SIRASI</div>
          <div class="text-xs font-extrabold font-mono-num text-orange-400">#${myRank} / 12</div>
        </div>
        <div class="p-1.5 rounded-lg bg-slate-950/90 border border-slate-800">
          <div class="text-[8px] text-slate-400">KADRO GÜCÜ</div>
          <div class="text-xs font-extrabold font-mono-num text-emerald-400">${G.club.power} OVR</div>
        </div>
        <div class="p-1.5 rounded-lg bg-slate-950/90 border border-slate-800">
          <div class="text-[8px] text-slate-400">TARAFTAR</div>
          <div class="text-xs font-extrabold font-mono-num text-sky-400">%${G.club.fanTrust}</div>
        </div>
        <div class="p-1.5 rounded-lg bg-slate-950/90 border border-slate-800">
          <div class="text-[8px] text-slate-400">KUPALAR</div>
          <div class="text-xs font-extrabold font-mono-num text-yellow-400">🏆 ${G.club.trophies.league + G.club.trophies.ucl}</div>
        </div>
      </div>
    </div>

    <!-- 5 Alt Sekme Menüsü -->
    <div class="grid grid-cols-5 gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-2.5 text-[10px] font-extrabold">
      <button onclick="activeClubSubTab='fixture'; openMenuSection('club_presidency')" class="py-2 rounded-xl ${activeClubSubTab === 'fixture' ? 'bg-orange-500 text-slate-950' : 'text-slate-400'}">📊 Fikstür</button>
      <button onclick="activeClubSubTab='squad'; openMenuSection('club_presidency')" class="py-2 rounded-xl ${activeClubSubTab === 'squad' ? 'bg-orange-500 text-slate-950' : 'text-slate-400'}">🧠 Taktik</button>
      <button onclick="activeClubSubTab='transfer'; openMenuSection('club_presidency')" class="py-2 rounded-xl ${activeClubSubTab === 'transfer' ? 'bg-orange-500 text-slate-950' : 'text-slate-400'}">🔄 Transfer</button>
      <button onclick="activeClubSubTab='stadium'; openMenuSection('club_presidency')" class="py-2 rounded-xl ${activeClubSubTab === 'stadium' ? 'bg-orange-500 text-slate-950' : 'text-slate-400'}">🏟️ Stadyum</button>
      <button onclick="activeClubSubTab='media'; openMenuSection('club_presidency')" class="py-2 rounded-xl ${activeClubSubTab === 'media' ? 'bg-orange-500 text-slate-950' : 'text-slate-400'}">🎙️ Medya</button>
    </div>
  `;

  // SEKME 1: FİKSTÜR VE CANLI PUAN DURUMU PANOSU
  if (activeClubSubTab === 'fixture') {
    let nextMatchBanner = '';
    if (G.club.week <= 22) {
      const roundMatches = G.club.fixtures[G.club.week - 1] || [];
      const myMatch = roundMatches.find(m => m.home === G.club.teamId || m.away === G.club.teamId);
      if (myMatch) {
        const hTeam = G.club.standings.find(t => t.id === myMatch.home);
        const aTeam = G.club.standings.find(t => t.id === myMatch.away);
        nextMatchBanner = `
          <div class="scoreboard-box mb-3 space-y-2.5">
            <div class="flex items-center justify-between text-[10px] font-extrabold text-orange-400">
              <span>📅 HAFTA ${G.club.week} / 22 FİKSTÜRÜ</span>
              <span>🏟️ ${myMatch.home === G.club.teamId ? G.club.stadiumCap.toLocaleString('tr-TR') + ' Taraftar' : 'Deplasman'}</span>
            </div>
            <div class="flex items-center justify-between text-center py-1">
              <div class="flex-1">
                <div class="text-xs font-extrabold text-white">${hTeam.colors} ${hTeam.name}</div>
                <div class="text-[10px] text-slate-400">Güç: ${hTeam.power} • ${hTeam.pts} Puan</div>
              </div>
              <div class="px-3 py-1 rounded-xl bg-slate-900 border border-orange-500/40 text-xs font-black text-orange-400">VS</div>
              <div class="flex-1">
                <div class="text-xs font-extrabold text-white">${aTeam.colors} ${aTeam.name}</div>
                <div class="text-[10px] text-slate-400">Güç: ${aTeam.power} • ${aTeam.pts} Puan</div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button onclick="playNextClubWeek(true)" class="py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 text-xs font-extrabold">
                ▶️ Maçı Canlı Yönet
              </button>
              <button onclick="simulateMultipleClubWeeks(5)" class="py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold">
                ⏩ 5 Hafta Hızlı Simüle Et
              </button>
            </div>
          </div>
        `;
      }
    } else {
      nextMatchBanner = `
        <div class="scoreboard-box mb-3 text-center space-y-2">
          <div class="text-xs font-extrabold text-emerald-400">🏁 22 HAFTALIK LİG MARATONU TAMAMLANDI!</div>
          <button onclick="finishClubSeason()" class="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold">🏆 Sezon Ödüllerini Al &amp; Yeni Sezona Geç</button>
        </div>
      `;
    }

    const tableRows = G.club.standings.map((row, idx) => {
      const rank = idx + 1;
      const isMine = row.id === G.club.teamId;
      const zoneCls = rank <= 2 ? 'standings-zone-ucl' : (rank <= 4 ? 'standings-zone-uel' : (rank >= 11 ? 'standings-zone-rel' : ''));
      const gd = row.gf - row.ga;
      return `
        <tr class="${isMine ? 'standings-row-myclub' : ''} ${zoneCls}">
          <td class="font-mono-num text-center text-slate-400">${rank}</td>
          <td class="text-white truncate max-w-[115px]">${row.colors} ${row.name}</td>
          <td class="font-mono-num text-center">${row.p}</td>
          <td class="font-mono-num text-center text-emerald-400">${row.w}</td>
          <td class="font-mono-num text-center text-amber-300">${row.d}</td>
          <td class="font-mono-num text-center text-rose-400">${row.l}</td>
          <td class="font-mono-num text-center text-slate-300">${gd >= 0 ? '+' + gd : gd}</td>
          <td class="font-mono-num text-right font-extrabold text-white pr-2">${row.pts}</td>
        </tr>
      `;
    }).join('');

    return headerCard + nextMatchBanner + `
      <div class="official-doc-card overflow-hidden p-0">
        <div class="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <span class="text-[10px] font-extrabold text-white uppercase">${lg.flag} ${lg.name} Puan Durumu</span>
          <span class="text-[9px] text-slate-400">🟢 Şamp. Ligi &bull; 🔵 Avrupa &bull; 🔴 Küme</span>
        </div>
        <table class="standings-table">
          <thead>
            <tr><th>#</th><th class="text-left">Kulüp</th><th>O</th><th>G</th><th>B</th><th>M</th><th>AV</th><th class="text-right pr-2">P</th></tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    `;
  }

  // SEKME 2: KADRO, TAKTİK & TEKNİK DİREKTÖR
  if (activeClubSubTab === 'squad') {
    const curMgr = FOOTBALL_MANAGERS_DB.find(m => m.id === G.club.managerId) || FOOTBALL_MANAGERS_DB[0];
    const tactics = ['4-2-3-1 Hücum', '4-3-3 Gegenpress', '3-5-2 Kanat Organizasyonu', '4-1-4-1 Kontrollü Pas'];

    return headerCard + `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[10px] font-extrabold text-orange-400 uppercase">👔 MEVCUT TEKNİK DİREKTÖR</div>
            <div class="text-xs font-extrabold text-white">${curMgr.name} <span class="text-emerald-400">(${curMgr.tac} Taktik)</span></div>
            <div class="text-[10px] text-slate-400">${curMgr.style}</div>
          </div>
          <span class="px-2 py-1 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">Görevde ✓</span>
        </div>

        <div class="text-[10px] font-bold text-slate-400 pt-1">📋 Sahaya Diziliş &amp; Oyun Felsefesi:</div>
        <div class="grid grid-cols-2 gap-1.5">
          ${tactics.map(t => `
            <button onclick="G.club.tactic='${t}'; saveGame(); openMenuSection('club_presidency');" class="p-2 rounded-xl border text-[10px] font-bold ${G.club.tactic === t ? 'border-orange-500 bg-orange-500/20 text-white' : 'border-slate-800 bg-slate-950 text-slate-400'}">${t}</button>
          `).join('')}
        </div>
      </div>

      <!-- Mevki Güç Dağılımı -->
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-4 gap-2 text-center">
        <div class="p-2 rounded-xl bg-slate-950 border border-slate-800"><div class="text-[9px] text-amber-400 font-bold">🧤 KALECİ</div><div class="text-xs font-extrabold font-mono-num text-white">${G.club.gkPow}</div></div>
        <div class="p-2 rounded-xl bg-slate-950 border border-slate-800"><div class="text-[9px] text-sky-400 font-bold">🛡️ DEFANS</div><div class="text-xs font-extrabold font-mono-num text-white">${G.club.defPow}</div></div>
        <div class="p-2 rounded-xl bg-slate-950 border border-slate-800"><div class="text-[9px] text-emerald-400 font-bold">⚙️ ORTA SAHA</div><div class="text-xs font-extrabold font-mono-num text-white">${G.club.midPow}</div></div>
        <div class="p-2 rounded-xl bg-slate-950 border border-slate-800"><div class="text-[9px] text-rose-400 font-bold">🎯 HÜCUM</div><div class="text-xs font-extrabold font-mono-num text-white">${G.club.attPow}</div></div>
      </div>

      <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">👔 Teknik Direktör Değişikliği</h4>
      <div class="space-y-2">
        ${FOOTBALL_MANAGERS_DB.map(m => {
          const cost = Math.round(c.monthlyMinWage * m.wageMult * 2);
          const isCur = G.club.managerId === m.id;
          return `
            <div class="p-3 rounded-2xl bg-slate-900 border ${isCur ? 'border-orange-500' : 'border-slate-800'} flex items-center justify-between gap-2">
              <div>
                <div class="text-xs font-extrabold text-white">${m.name} <span class="text-emerald-400 font-mono-num">(Taktik: ${m.tac})</span></div>
                <div class="text-[10px] text-slate-400">${m.style} • İmza Maliyeti: ${fmtMoney(cost)}</div>
              </div>
              <button onclick="hireClubManager('${m.id}', ${cost})" class="px-3 py-1.5 rounded-xl text-[10px] font-extrabold ${isCur ? 'bg-orange-500/20 text-orange-300' : 'bg-emerald-500 text-slate-950'}">${isCur ? 'Görevde' : 'İmzala'}</button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // SEKME 3: TRANSFER PAZARI VE YILDIZ OYUNCULAR
  if (activeClubSubTab === 'transfer') {
    const sellRevenue = Math.round(c.monthlyMinWage * 14);
    return headerCard + `
      <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between mb-2">
        <div>
          <div class="text-xs font-extrabold text-white">📤 Kadrodan Oyuncu Satışı (Avrupa Teklifi)</div>
          <div class="text-[10px] text-slate-400">Kadro gücünden -1 düşer, kulüp kasasına anında +${fmtMoney(sellRevenue)} bonservis girer</div>
        </div>
        <button onclick="sellClubPlayer(${sellRevenue})" class="px-3 py-2 rounded-xl bg-amber-400 text-slate-950 text-[10px] font-extrabold shrink-0">Oyuncu Sat</button>
      </div>

      <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">🌟 Transfer Listesi (Kulüp Kasasından Ödenir)</h4>
      <div class="space-y-2">
        ${TRANSFER_PLAYERS_DB.map(pl => {
          const fee = Math.round(c.monthlyMinWage * pl.costMult);
          const owned = G.club.roster.includes(pl.id);
          return `
            <div class="p-3 rounded-2xl bg-slate-900 border ${owned ? 'border-emerald-500/50' : 'border-slate-800'} flex items-center justify-between gap-2">
              <div>
                <div class="text-xs font-extrabold text-white">⚽ ${pl.name} <span class="text-emerald-400 font-mono-num">(${pl.ovr} OVR)</span></div>
                <div class="flex gap-1 my-1">
                  <span class="classified-tag">📍 ${pl.pos}</span>
                  <span class="classified-tag">🎂 ${pl.age} Yaş</span>
                  <span class="classified-tag">💰 Bonservis: ${fmtMoney(fee)}</span>
                </div>
              </div>
              <button onclick="signTransferPlayer('${pl.id}', ${fee})" class="px-3 py-2 rounded-xl text-[10px] font-extrabold shrink-0 ${owned ? 'bg-slate-800 text-emerald-400' : 'bg-orange-500 text-slate-950'}">
                ${owned ? 'Kadroda ✓' : 'Transfer Et'}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // SEKME 4: STADYUM, BİLET, SPONSORLUK & FFP KASA YÖNETİMİ
  if (activeClubSubTab === 'stadium') {
    const stadExpandCost = Math.round(c.monthlyMinWage * 22);
    const acadCost = Math.round(c.monthlyMinWage * 10);
    const injectAmt = Math.round(c.monthlyMinWage * 10);

    return headerCard + `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
        <div class="flex justify-between items-center">
          <div>
            <div class="text-xs font-extrabold text-white">🏟️ ${myTeam.stadium}</div>
            <div class="text-[10px] text-slate-400">Kapasite: <strong>${G.club.stadiumCap.toLocaleString('tr-TR')} Kişi</strong> • Altyapı: <strong>Seviye ${G.club.academyLevel}</strong></div>
          </div>
          <span class="px-2 py-1 rounded bg-orange-500/15 text-orange-400 text-[10px] font-bold">Stadyum Lvl ${G.club.stadiumLevel}</span>
        </div>

        <div class="text-[10px] font-bold text-slate-400">🎫 Kombine &amp; Maç Günü Bilet Fiyat Politikası:</div>
        <div class="grid grid-cols-3 gap-1.5 text-[10px]">
          <button onclick="setClubTicketTier('cheap')" class="py-1.5 rounded-lg border font-bold ${G.club.ticketTier === 'cheap' ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-800 text-slate-400'}">Halk Bileti (+Taraftar)</button>
          <button onclick="setClubTicketTier('balanced')" class="py-1.5 rounded-lg border font-bold ${G.club.ticketTier === 'balanced' ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-800 text-slate-400'}">Dengeli Gişe</button>
          <button onclick="setClubTicketTier('vip')" class="py-1.5 rounded-lg border font-bold ${G.club.ticketTier === 'vip' ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-800 text-slate-400'}">VIP Loca (+%35 Gelir)</button>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-1">
          <button onclick="upgradeClubFacility('stadium', ${stadExpandCost})" class="p-2.5 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-extrabold">🏟️ +8.500 Kapasite (${fmtMoney(stadExpandCost)})</button>
          <button onclick="upgradeClubFacility('academy', ${acadCost})" class="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[11px] font-bold">🌱 Altyapı Akademisi (${fmtMoney(acadCost)})</button>
        </div>
      </div>

      <!-- Başkan Kişisel Servet <-> Kulüp Kasası Transferi -->
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-2">
        <div class="text-xs font-extrabold text-amber-300">🏦 Finansal Fair Play (FFP) &amp; Başkan Sermayesi</div>
        <div class="text-[10px] text-slate-300">Kişisel Bakiyen: <strong>${fmtMoney(G.money)}</strong> • Kulüp Kasası: <strong class="text-emerald-400">${fmtMoney(G.club.clubTreasury)}</strong></div>
        <div class="grid grid-cols-2 gap-2">
          <button onclick="transferClubFunds('inject', ${injectAmt})" class="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">📥 Cebinden Kulübe Aktar (${fmtMoney(injectAmt)})</button>
          <button onclick="transferClubFunds('withdraw', ${injectAmt})" class="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold">📤 Kulüpten Temettü Çek (${fmtMoney(injectAmt)})</button>
        </div>
      </div>
    `;
  }

  // SEKME 5: MEDYA, BASIN TOPLANTISI & TFF/MHK İLİŞKİLERİ
  return headerCard + `
    <div class="space-y-2">
      <button onclick="doClubMediaAction('referee')" class="w-full p-3.5 rounded-2xl bg-slate-900 border border-rose-500/40 flex items-center justify-between text-left">
        <div>
          <div class="text-xs font-extrabold text-white">🔥 Hakem ve Federasyon Kararlarına Sert Basın Toplantısı</div>
          <div class="text-[10px] text-slate-400">Taraftar güvenoyu coşar (+%12), ancak PFDK para cezası riski vardır</div>
        </div>
        <span class="text-xs font-bold text-rose-400">Konuş &rarr;</span>
      </button>

      <button onclick="doClubMediaAction('sponsor_gala')" class="w-full p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between text-left">
        <div>
          <div class="text-xs font-extrabold text-white">🤝 Global Forma &amp; Stadyum Sponsorluk Lansmanı</div>
          <div class="text-[10px] text-slate-400">Kulüp kasasına anında sponsorluk geliri sağlar</div>
        </div>
        <span class="text-xs font-bold text-emerald-400">İmzala &rarr;</span>
      </button>

      <button onclick="resignClubPresidency()" class="w-full py-2.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-bold mt-3">
        🚪 Kulüp Başkanlığından İstifa Et / Hisseleri Devret
      </button>
    </div>
  `;
}

// Kulüp Aksiyon Fonksiyonları
function hireClubManager(mgrId, cost) {
  if (G.club.managerId === mgrId) return;
  if (G.club.clubTreasury < cost) { showToast('Kulüp kasasında yeterli bütçe yok! Stadyum sekmesinden sermaye aktarabilirsin.'); return; }
  G.club.clubTreasury -= cost;
  G.club.managerId = mgrId;
  const m = FOOTBALL_MANAGERS_DB.find(x => x.id === mgrId);
  G.club.fanTrust = clamp(G.club.fanTrust + 8);
  playSfx('trophy');
  addLog(G.age, `👔 **${G.club.teamName}** teknik direktörlük görevine **${m.name}** getirildi!`, 'fame');
  saveGame(); renderAll(); openMenuSection('club_presidency');
}

function signTransferPlayer(playerId, fee) {
  if (G.club.roster.includes(playerId)) { showToast('Bu oyuncu zaten kadroda!'); return; }
  if (G.club.clubTreasury < fee) { showToast('Kulüp kasası bonservis için yetersiz! Cebinden kulübe sermaye aktarabilirsin.'); return; }
  const pl = TRANSFER_PLAYERS_DB.find(x => x.id === playerId);
  if (!pl) return;

  G.club.clubTreasury -= fee;
  G.club.roster.push(pl.id);
  G.club.power = clamp(G.club.power + 2, 60, 99);
  if (pl.pos.includes('KL')) G.club.gkPow = clamp(G.club.gkPow + 4, 60, 99);
  else if (pl.pos.includes('STP') || pl.pos.includes('SLB')) G.club.defPow = clamp(G.club.defPow + 3, 60, 99);
  else if (pl.pos.includes('MO') || pl.pos.includes('OOS')) G.club.midPow = clamp(G.club.midPow + 3, 60, 99);
  else G.club.attPow = clamp(G.club.attPow + 3, 60, 99);

  G.club.fanTrust = clamp(G.club.fanTrust + 10);
  playSfx('trophy');
  addLog(G.age, `🚨 **TRANSFER BOMBASI!** **${G.club.teamName}**, yıldız futbolcu **${pl.name}** (${pl.ovr} OVR) ile sözleşme imzaladı!`, 'fame');
  saveGame(); renderAll(); openMenuSection('club_presidency');
}

function sellClubPlayer(rev) {
  G.club.clubTreasury += rev;
  G.club.power = clamp(G.club.power - 1, 65, 99);
  playSfx('coin');
  addLog(G.age, `📤 Kulüp kadrosundan bir oyuncuyu Avrupa'ya satarak kasaya **+${fmtMoney(rev)}** bonservis geliri koydun.`, 'good');
  saveGame(); renderAll(); openMenuSection('club_presidency');
}

function setClubTicketTier(tier) {
  G.club.ticketTier = tier;
  if (tier === 'cheap') G.club.fanTrust = clamp(G.club.fanTrust + 6);
  if (tier === 'vip') G.club.fanTrust = clamp(G.club.fanTrust - 4);
  saveGame(); openMenuSection('club_presidency');
}

function upgradeClubFacility(type, cost) {
  if (G.club.clubTreasury < cost) { showToast('Kulüp kasası yetersiz!'); return; }
  G.club.clubTreasury -= cost;
  if (type === 'stadium') {
    G.club.stadiumCap += 8500;
    G.club.stadiumLevel += 1;
    addLog(G.age, `🏟️ Stadyum kapasitesi **${G.club.stadiumCap.toLocaleString('tr-TR')}** kişiye yükseltildi!`, 'milestone');
  } else {
    G.club.academyLevel += 1;
    G.club.power = clamp(G.club.power + 1, 60, 99);
    addLog(G.age, `🌱 Kulüp altyapı akademisi Seviye ${G.club.academyLevel} oldu (+1 Kadro Gücü).`, 'good');
  }
  playSfx('coin');
  saveGame(); renderAll(); openMenuSection('club_presidency');
}

function transferClubFunds(mode, amt) {
  if (mode === 'inject') {
    if (G.money < amt) { showToast('Kişisel nakit bakiyen yetersiz!'); return; }
    G.money -= amt;
    G.club.clubTreasury += amt;
    G.club.fanTrust = clamp(G.club.fanTrust + 7);
    playSfx('coin');
    addLog(G.age, `💳 Kişisel servetinden **${G.club.teamName}** kasasına **+${fmtMoney(amt)}** sermaye aktardın!`, 'good');
  } else {
    if (G.club.clubTreasury < amt) { showToast('Kulüp kasasında bu kadar nakit yok!'); return; }
    G.club.clubTreasury -= amt;
    G.money += amt;
    G.club.fanTrust = clamp(G.club.fanTrust - 12);
    playSfx('coin');
    addLog(G.age, `🏦 Kulüp kasasından kişisel hesabına **+${fmtMoney(amt)}** temettü/huzur hakkı çektin.`, 'normal');
  }
  saveGame(); renderAll(); openMenuSection('club_presidency');
}

function doClubMediaAction(type) {
  const c = getCountry();
  if (type === 'referee') {
    G.club.fanTrust = clamp(G.club.fanTrust + 12);
    G.fame = clamp(G.fame + 6);
    if (Math.random() < 0.45) {
      const fine = Math.round(c.monthlyMinWage * 1.2);
      G.club.clubTreasury -= fine;
      addLog(G.age, `🎙️ Sert basın açıklaman taraftarı ayağa kaldırdı (+12 Güven) ama PFDK **${fmtMoney(fine)}** para cezası kesti.`, 'fame');
    } else {
      addLog(G.age, `🎙️ Basın toplantısında kulübün haklarını savundun, taraftar desteği **%${G.club.fanTrust}** oldu!`, 'fame');
    }
  } else {
    const deal = Math.round(c.monthlyMinWage * 4.5);
    G.club.clubTreasury += deal;
    playSfx('coin');
    addLog(G.age, `🤝 Yeni sponsorluk anlaşmasıyla kulüp kasasına **+${fmtMoney(deal)}** girdi.`, 'good');
  }
  saveGame(); renderAll(); openMenuSection('club_presidency');
}

function resignClubPresidency() {
  const oldClub = G.club.teamName;
  G.club.active = false;
  G.club.teamId = null;
  addLog(G.age, `🚪 **${oldClub}** kulüp başkanlığı görevinden ayrıldın.`, 'normal');
  saveGame(); renderAll(); openMenuSection('club_presidency');
}

// Mevcut Menü ve Yaş Motoruna Çakışmasız Köprü
(function attachClubPresidencyModule() {
  if (window._clubPresidencyLoaded) return;
  window._clubPresidencyLoaded = true;

  const _origOpenNav = openNavSheet;
  openNavSheet = function (tab) {
    ensureClubPresidencyState();
    _origOpenNav(tab);
    if (tab === 'menu') {
      const body = document.getElementById('sheetBody');
      if (body && !document.getElementById('clubMenuHeroBtn')) {
        const subText = G.club.active
          ? `${G.club.teamName} Başkanı • Hafta ${G.club.week}/22 • Kasa: ${fmtMoney(G.club.clubTreasury)}`
          : 'Süper Lig, Premier Lig, La Liga, Serie A & Bundesliga';
        const heroBtn = `
          <button id="clubMenuHeroBtn" onclick="openMenuSection('club_presidency')" class="w-full p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/25 via-amber-500/15 to-emerald-500/20 border border-orange-500/50 flex items-center justify-between text-left mb-2.5 shadow-lg">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🏟️</span>
              <div>
                <div class="text-xs font-extrabold text-white">Futbol Kulübü Başkanlığı &amp; Fikstür Panosu</div>
                <div class="text-[10px] text-orange-300 font-semibold">${subText}</div>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-xl bg-orange-500 text-slate-950 text-[10px] font-extrabold shrink-0">Yönet &rarr;</span>
          </button>
        `;
        body.insertAdjacentHTML('afterbegin', heroBtn);
      }
    }
  };

  const _origOpenSec = openMenuSection;
  openMenuSection = function (sec) {
    ensureClubPresidencyState();
    if (sec === 'club_presidency') {
      const sheet = document.getElementById('bottomSheet');
      sheet.classList.remove('hidden');
      document.getElementById('sheetTitle').textContent = G.club.active ? `🏟️ ${G.club.teamName} Başkanlık Makamı` : '🏟️ Futbol Kulübü Başkanlığı & Fikstür';
      document.getElementById('sheetSubtitle').textContent = G.club.active ? `Sezon #${G.club.season} • Hafta ${G.club.week}/22 • ${G.club.europeStage}` : 'Kongre Seçimi veya Kulüp Hissesi Satın Alma';
      document.getElementById('sheetBody').innerHTML = renderClubPresidencyView();
      return;
    }
    _origOpenSec(sec);
  };
})();

/* ============================================================================
   MEGA FUTBOL MOTORU: SOKAKTAN BALLON D'OR'A & DERİN KULÜP/AVRUPA YÖNETİMİ
   ============================================================================ */

let activeProPlayerTab = 'overview'; // 'overview' | 'train' | 'transfer' | 'national'

function ensureMegaFootballState() {
  if (!G) return;
  ensureClubPresidencyState();

  // Kulüp Başkanlığı için yeni tesis, lobi, Avrupa ve altyapı alanları
  if (typeof G.club.trainingLvl !== 'number') G.club.trainingLvl = 1;
  if (typeof G.club.scoutLvl !== 'number') G.club.scoutLvl = 1;
  if (typeof G.club.medicalLvl !== 'number') G.club.medicalLvl = 1;
  if (typeof G.club.tffLobby !== 'number') G.club.tffLobby = 50;
  if (typeof G.club.ultrasMood !== 'number') G.club.ultrasMood = 80;
  if (typeof G.club.wonderkidsCount !== 'number') G.club.wonderkidsCount = 0;
  if (typeof G.club.euroRound !== 'number') G.club.euroRound = 1; // 1: Lig Aşaması, 2: Son 16, 3: Çeyrek, 4: Yarı, 5: Final, 6: Şampiyon
  if (typeof G.club.euroOpponent !== 'string') G.club.euroOpponent = 'Bayern Münih';
  if (!G.club.incomingOffer) G.club.incomingOffer = null;

  // Futbolcu Olma Kariyeri (Sokaktan Ballon d'Or'a)
  if (!G.proPlayer) {
    G.proPlayer = {
      active: false,
      position: 'OOS / 10 Numara',
      clubName: 'Sokak Akademisi',
      leagueId: 'TR',
      tier: 0, // 0: Sokak/Altyapı, 1: Ulusal Lig, 2: Avrupa Devi
      pace: 62,
      shooting: 64,
      passing: 65,
      dribbling: 66,
      physical: 60,
      ovr: 63,
      marketValueM: 0.4,
      goals: 0,
      assists: 0,
      seasonGoals: 0,
      seasonAssists: 0,
      apps: 0,
      caps: 0,
      intlGoals: 0,
      ballonDors: 0,
      goldenBoots: 0,
      injured: false,
      trainsThisYear: 0,
      matchesThisYear: 0
    };
  }
}

function recalcProPlayerOvr() {
  const p = G.proPlayer;
  p.ovr = Math.round((p.pace + p.shooting + p.passing + p.dribbling + p.physical) / 5);
  const ageFactor = G.age <= 24 ? 1.35 : (G.age <= 29 ? 1.15 : 0.75);
  p.marketValueM = Number((Math.pow(Math.max(1, p.ovr - 55), 2.15) * 0.045 * ageFactor).toFixed(1));
}

/* ============================================================================
   BÖLÜM 1: ⚽ FUTBOLCU OLMA KARİYERİ (SOKAKTAN BALLON D'OR'A)
   ============================================================================ */
function renderProFootballerCareerView() {
  ensureMegaFootballState();
  const c = getCountry();
  const p = G.proPlayer;
  recalcProPlayerOvr();

  if (!p.active) {
    return `
      <div class="fut-player-card mb-3 space-y-2">
        <div class="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">⚽ SOKAKTAN ALTIN TOP'A (BALLON D'OR)</div>
        <div class="text-sm font-extrabold text-white">Profesyonel Futbolcu Kariyerine Başla</div>
        <p class="text-[11px] text-slate-300">12 yaşından itibaren mahalle aralarında ve altyapı seçmelerinde keşfedilip A Takıma yükselebilir, 5 farklı yeteneğini geliştirerek Avrupa devlerine transfer olabilir ve <strong>Ballon d'Or</strong> kazanabilirsin!</p>
      </div>

      <div class="space-y-2">
        <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">🎯 Mevkini Seç ve Seçmelere Katıl (12-34 Yaş)</h4>
        ${[
          { pos: 'SNT / Santrafor (9 Numara)', desc: 'Yüksek bitiricilik, ceza sahası golcüsü ve Altın Ayakkabı adayı' },
          { pos: 'OOS / Oyun Kurucu (10 Numara)', desc: 'Frikik ustası, kilit paslar, uzaktan şutlar ve yüksek asist' },
          { pos: 'SLK-SĞK / Kanat Forvet (7 Numara)', desc: 'Patlayıcı hız, bire bir çalım ve içeri kat ederek gol' },
          { pos: 'MO / Dinamik Orta Saha (8 Numara)', desc: 'Çift yönlü oyun, yüksek kondisyon ve takım liderliği' }
        ].map(item => `
          <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
            <div>
              <div class="text-xs font-extrabold text-white">⚽ ${item.pos}</div>
              <div class="text-[10px] text-slate-400">${item.desc}</div>
            </div>
            <button onclick="startProFootballerCareer('${item.pos}')" class="px-3 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold shrink-0">Başla &rarr;</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Aktif Futbolcu FUT Kartı
  const monthlySalary = Math.round(c.monthlyMinWage * (p.tier === 0 ? 1.8 : (p.tier === 1 ? 10.5 : 34.0)) * (p.ovr / 70));

  const futHeader = `
    <div class="fut-player-card mb-2.5 space-y-2.5">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <div class="w-14 h-16 rounded-2xl bg-amber-400/20 border-2 border-amber-400 flex flex-col items-center justify-center shrink-0">
            <span class="text-lg font-black font-mono-num text-amber-300 leading-none">${p.ovr}</span>
            <span class="text-[8px] font-extrabold text-white uppercase mt-0.5">${p.position.split(' ')[0]}</span>
          </div>
          <div>
            <div class="text-[9px] font-extrabold text-amber-400 uppercase tracking-wider">🏟️ ${p.clubName} &bull; PİYASA DEĞERİ: €${p.marketValueM}M</div>
            <div class="text-sm font-extrabold text-white">${G.firstName} ${G.lastName}</div>
            <div class="text-[10px] text-emerald-400 font-mono-num">Kontrat Maaşı: +${fmtMoney(monthlySalary)} / ay</div>
          </div>
        </div>
        <div class="text-right">
          <span class="px-2 py-0.5 rounded bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold">🌕 ${p.ballonDors} Ballon d'Or</span>
        </div>
      </div>

      <!-- 5'li Yetenek Barı -->
      <div class="grid grid-cols-5 gap-1.5 text-center pt-1">
        <div class="p-1.5 rounded-xl bg-slate-950/90 border border-slate-800"><div class="text-[8px] text-slate-400">⚡ HIZ</div><div class="text-xs font-extrabold font-mono-num text-white">${p.pace}</div></div>
        <div class="p-1.5 rounded-xl bg-slate-950/90 border border-slate-800"><div class="text-[8px] text-slate-400">🎯 ŞUT</div><div class="text-xs font-extrabold font-mono-num text-white">${p.shooting}</div></div>
        <div class="p-1.5 rounded-xl bg-slate-950/90 border border-slate-800"><div class="text-[8px] text-slate-400">🧭 PAS</div><div class="text-xs font-extrabold font-mono-num text-white">${p.passing}</div></div>
        <div class="p-1.5 rounded-xl bg-slate-950/90 border border-slate-800"><div class="text-[8px] text-slate-400">🪄 TEKNİK</div><div class="text-xs font-extrabold font-mono-num text-white">${p.dribbling}</div></div>
        <div class="p-1.5 rounded-xl bg-slate-950/90 border border-slate-800"><div class="text-[8px] text-slate-400">💪 FİZİK</div><div class="text-xs font-extrabold font-mono-num text-white">${p.physical}</div></div>
      </div>

      <!-- İstatistik Şeridi -->
      <div class="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono-num bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
        <div><span class="text-slate-400 block text-[8px]">KARİYER MAÇ</span><strong class="text-white">${p.apps}</strong></div>
        <div><span class="text-slate-400 block text-[8px]">TOPLAM GOL</span><strong class="text-emerald-400">${p.goals} (${p.seasonGoals})</strong></div>
        <div><span class="text-slate-400 block text-[8px]">ASİST</span><strong class="text-sky-400">${p.assists} (${p.seasonAssists})</strong></div>
        <div><span class="text-slate-400 block text-[8px]">MİLLİ FORMA</span><strong class="text-amber-400">${p.caps} (${p.intlGoals}G)</strong></div>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-2.5 text-[10px] font-extrabold">
      <button onclick="activeProPlayerTab='overview'; openMenuSection('pro_footballer')" class="py-2 rounded-xl ${activeProPlayerTab === 'overview' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}">🏟️ Maç & Saha</button>
      <button onclick="activeProPlayerTab='train'; openMenuSection('pro_footballer')" class="py-2 rounded-xl ${activeProPlayerTab === 'train' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}">🏋️ Yetenek</button>
      <button onclick="activeProPlayerTab='transfer'; openMenuSection('pro_footballer')" class="py-2 rounded-xl ${activeProPlayerTab === 'transfer' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}">✈️ Transfer</button>
      <button onclick="activeProPlayerTab='national'; openMenuSection('pro_footballer')" class="py-2 rounded-xl ${activeProPlayerTab === 'national' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}">🇹🇷 Milli & Ödül</button>
    </div>
  `;

  if (activeProPlayerTab === 'overview') {
    return futHeader + `
      <div class="space-y-2">
        <div class="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-xs font-extrabold text-white">⚽ Haftanın Kritik Maçına Çık</span>
            <span class="text-[10px] font-mono-num text-emerald-400">Bu Yıl: ${p.matchesThisYear}/4 Maç</span>
          </div>
          <p class="text-[11px] text-slate-400">Sahada kritik pozisyonda kararı sen verirsin (Frikik, çalım, uzaktan şut veya kilit pas). Attığın her gol piyasa değerini ve Ballon d'Or şansını artırır!</p>
          <button onclick="playInteractivePlayerMatch()" class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-extrabold">
            ▶️ Sahaya İlk 11 Çık ve Pozisyonu Yönet
          </button>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div class="text-xs font-extrabold text-white">🌟 Saha Dışı Yaşam &amp; Sponsorluk</div>
          <div class="grid grid-cols-2 gap-2">
            <button onclick="proPlayerLifestyle('boot_deal')" class="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold">👟 Krampon Sponsorluğu Al</button>
            <button onclick="proPlayerLifestyle('nightclub')" class="p-2.5 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 text-[11px] font-bold">🍾 VIP Gece Kulübü Partisi</button>
          </div>
        </div>
      </div>
    `;
  }

  if (activeProPlayerTab === 'train') {
    const trainCost = Math.round(c.monthlyMinWage * 0.45);
    const attrs = [
      { key: 'pace', name: '⚡ Patlayıcı Sprint & Hız Antrenmanı', val: p.pace },
      { key: 'shooting', name: '🎯 Bitiricilik & Uzaktan Şut Çalışması', val: p.shooting },
      { key: 'passing', name: '🧭 Vizyon & Kilit Pas İstasyonu', val: p.passing },
      { key: 'dribbling', name: '🪄 Bire Bir Çalım & Frikik Özel İdmanı', val: p.dribbling },
      { key: 'physical', name: '💪 Core Kuvvet & Dayanıklılık Kampı', val: p.physical }
    ];
    return futHeader + `
      <div class="text-[11px] text-slate-400 mb-1">Yıllık Özel Antrenman Hakkı: <strong class="text-emerald-400">${3 - p.trainsThisYear}/3</strong></div>
      <div class="space-y-2">
        ${attrs.map(a => `
          <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-xs font-extrabold text-white">${a.name}</div>
              <div class="text-[10px] text-slate-400">Mevcut Seviye: <strong class="text-amber-400">${a.val} / 99</strong></div>
            </div>
            <button onclick="trainProPlayerAttribute('${a.key}', ${trainCost})" class="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-[10px] font-extrabold">Geliştir (${fmtMoney(trainCost)})</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (activeProPlayerTab === 'transfer') {
    const targetClubs = [
      { name: '🟡🔵 Fenerbahçe', tier: 1, reqOvr: 74, signMult: 15 },
      { name: '🟡🔴 Galatasaray', tier: 1, reqOvr: 74, signMult: 15 },
      { name: '⚫⚪ Beşiktaş', tier: 1, reqOvr: 73, signMult: 13 },
      { name: '🔴⚫ AC Milan', tier: 2, reqOvr: 81, signMult: 38 },
      { name: '🔴⚪ Arsenal', tier: 2, reqOvr: 84, signMult: 52 },
      { name: '🔵🔴 FC Barcelona', tier: 2, reqOvr: 86, signMult: 65 },
      { name: '⚪🟣 Real Madrid', tier: 2, reqOvr: 88, signMult: 80 },
      { name: '🔵⚪ Manchester City', tier: 2, reqOvr: 88, signMult: 80 }
    ];
    return futHeader + `
      <div class="space-y-2">
        <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">✈️ Menajer Transfer Teklifleri (OVR: ${p.ovr})</h4>
        ${targetClubs.map(tc => {
          const signBonus = Math.round(c.monthlyMinWage * tc.signMult);
          const canJoin = p.ovr >= tc.reqOvr;
          return `
            <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
              <div>
                <div class="text-xs font-extrabold text-white">${tc.name}</div>
                <div class="text-[10px] text-slate-400">Gereken Güç: <strong>${tc.reqOvr} OVR</strong> • İmza Parası: <strong class="text-emerald-400">+${fmtMoney(signBonus)}</strong></div>
              </div>
              <button onclick="transferProPlayerToClub('${tc.name}', ${tc.tier}, ${tc.reqOvr}, ${signBonus})" class="px-3 py-2 rounded-xl text-[10px] font-extrabold ${canJoin ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-500'}">İmzala</button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  return futHeader + `
    <div class="space-y-2.5">
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-rose-500/40 space-y-2">
        <div class="text-xs font-extrabold text-white">${c.flag} A Milli Futbol Takımı Kampı (75+ OVR)</div>
        <div class="text-[11px] text-slate-300">Milli Maç: <strong>${p.caps}</strong> • Milli Gol: <strong>${p.intlGoals}</strong></div>
        <button onclick="playNationalTeamTournament()" class="w-full py-2.5 rounded-xl bg-rose-500 text-white text-xs font-extrabold">🌍 Milli Maça / Turnuvaya Çık</button>
      </div>

      <div class="p-3.5 rounded-2xl bg-slate-900 border border-amber-400/40 space-y-2">
        <div class="text-xs font-extrabold text-amber-300">🌕 France Football Ballon d'Or Ödül Galası</div>
        <div class="text-[11px] text-slate-300">Bu sezon <strong>${p.seasonGoals} gol, ${p.seasonAssists} asist</strong> ürettin. (85+ OVR ve sezonluk 15+ gol katkısı Ballon d'Or şansı verir).</div>
        <button onclick="attendBallonDorGala()" class="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold">🏆 Paris Ballon d'Or Törenine Katıl</button>
      </div>
    </div>
  `;
}

function startProFootballerCareer(pos) {
  if (G.age < 12 || G.age > 34) { showToast('Futbolcu kariyerine başlamak için 12-34 yaş arasında olmalısın!'); return; }
  ensureMegaFootballState();
  const p = G.proPlayer;
  p.active = true;
  p.position = pos;
  p.clubName = G.countryId === 'TR' ? 'Altyapı Akademi SK' : 'Youth Academy FC';
  p.tier = 0;
  p.pace = randInt(64, 72);
  p.shooting = pos.includes('SNT') ? randInt(70, 76) : randInt(62, 70);
  p.passing = pos.includes('OOS') ? randInt(70, 76) : randInt(62, 70);
  p.dribbling = pos.includes('SLK') ? randInt(70, 76) : randInt(64, 72);
  p.physical = randInt(60, 68);
  recalcProPlayerOvr();

  G.sports.branchId = 'football';
  G.sports.tierIndex = 0;
  playSfx('trophy');
  addLog(G.age, `⚽ **FUTBOLCU KARİYERİ BAŞLADI!** Sokak futbolunda yeteneğinle keşfedildin ve **${pos}** mevkisinde akademiye katıldın (${p.ovr} OVR)!`, 'milestone');
  saveGame(); renderAll(); openMenuSection('pro_footballer');
}

function playInteractivePlayerMatch() {
  const p = G.proPlayer;
  if (p.matchesThisYear >= 4) { showToast('Bu sezonki 4 kritik maç hakkını oynadın! +1 Yaş ilerle.'); return; }
  p.matchesThisYear += 1;
  p.apps += 1;

  openEventModal({
    badge: `⚽ ${p.clubName} • DAKİKA 86 (SKOR 1-1)`,
    title: 'Ceza Sahası Önünde Topla Buluştun!',
    desc: `Rakip savunma üstüne geliyor. Yetenek puanlarına göre (Şut: ${p.shooting}, Teknik: ${p.dribbling}, Pas: ${p.passing}) nasıl bir karar vereceksin?`,
    choices: [
      {
        label: `🚀 Kalecinin Soluna Sert Plase Şut Çek (Şut: ${p.shooting})`,
        action: () => {
          if (Math.random() < (p.shooting / 115)) {
            p.goals += 2; p.seasonGoals += 2;
            p.shooting = clamp(p.shooting + 1, 40, 99);
            G.fame = clamp(G.fame + 5);
            playSfx('trophy');
            addLog(G.age, `⚽ **MAÇIN ADAMI (9.4 Reyting)!** 86. dakikada topu doksana astın, maçta **2 gol** atarak takımını sırtladın!`, 'fame');
          } else {
            addLog(G.age, `🧤 Kaleci son anda parmaklarının ucuyla kornere çeldi, maç 1-1 bitti.`, 'normal');
          }
          recalcProPlayerOvr(); saveGame(); renderAll(); openMenuSection('pro_footballer');
        }
      },
      {
        label: `🪄 İki Stoperi Çalımlayıp Kaleciyle Karşı Karşıya Kal (Teknik: ${p.dribbling})`,
        action: () => {
          if (Math.random() < (p.dribbling / 115)) {
            p.goals += 1; p.assists += 1;
            p.seasonGoals += 1; p.seasonAssists += 1;
            p.dribbling = clamp(p.dribbling + 1, 40, 99);
            playSfx('coin');
            addLog(G.age, `🪄 **RESİTAL!** İki oyuncuyu ipe dizip **1 gol ve 1 asist** ile yıldızlaştın!`, 'good');
          } else {
            addLog(G.age, `🦵 Stoper kayarak müdahale etti, pozisyonu değerlendiremedin.`, 'normal');
          }
          recalcProPlayerOvr(); saveGame(); renderAll(); openMenuSection('pro_footballer');
        }
      },
      {
        label: `🧭 Arka Direkteki Boş Arkadaşına "Al da At" Pası Ver (Pas: ${p.passing})`,
        action: () => {
          p.assists += 2; p.seasonAssists += 2;
          p.passing = clamp(p.passing + 1, 40, 99);
          playSfx('coin');
          addLog(G.age, `🎯 **MÜKEMMEL VİZYON!** İğne deliğinden geçirdiğin paslarla maçı **2 asistle** tamamladın!`, 'good');
          recalcProPlayerOvr(); saveGame(); renderAll(); openMenuSection('pro_footballer');
        }
      }
    ]
  });
}

function trainProPlayerAttribute(attrKey, cost) {
  const p = G.proPlayer;
  if (p.trainsThisYear >= 3) { showToast('Bu yılki 3 özel idman hakkın doldu!'); return; }
  if (G.money < cost) { showToast('Özel antrenör ücreti için bakiye yetersiz!'); return; }
  G.money -= cost;
  p.trainsThisYear += 1;
  p[attrKey] = clamp(p[attrKey] + randInt(2, 4), 40, 99);
  recalcProPlayerOvr();
  playSfx('coin');
  showToast(`Yetenek gelişti! Yeni OVR: ${p.ovr}`);
  saveGame(); renderAll(); openMenuSection('pro_footballer');
}

function transferProPlayerToClub(clubName, tier, reqOvr, signBonus) {
  const p = G.proPlayer;
  if (p.ovr < reqOvr) { showToast(`Bu kulüp için en az ${reqOvr} OVR gücünde olmalısın!`); return; }
  p.clubName = clubName;
  p.tier = tier;
  G.sports.branchId = 'football';
  G.sports.tierIndex = tier;
  G.money += signBonus;
  G.fame = clamp(G.fame + 18);
  if (tier === 2) unlockAchievement('pro_champ');
  playSfx('trophy');
  addLog(G.age, `✈️ **DEV TRANSFER!** **${clubName}** ile sözleşme imzaladın ve **+${fmtMoney(signBonus)}** imza parası aldın!`, 'fame');
  saveGame(); renderAll(); openMenuSection('pro_footballer');
}

function playNationalTeamTournament() {
  const p = G.proPlayer;
  if (p.ovr < 75) { showToast('A Milli Takım daveti için en az 75 OVR olmalısın!'); return; }
  const c = getCountry();
  p.caps += 4;
  const g = randInt(1, 4);
  p.intlGoals += g;
  p.goals += g;
  p.seasonGoals += g;
  const bonus = Math.round(c.monthlyMinWage * 4.5);
  G.money += bonus;
  G.fame = clamp(G.fame + 10);
  if (p.caps >= 25) unlockAchievement('national_hero');
  playSfx('trophy');
  addLog(G.age, `${c.flag} **MİLLİ FORMA GURURU!** Uluslararası turnuvada 4 maçta **${g} gol** attın ve **+${fmtMoney(bonus)}** milli prim aldın!`, 'fame');
  saveGame(); renderAll(); openMenuSection('pro_footballer');
}

function attendBallonDorGala() {
  const p = G.proPlayer;
  const c = getCountry();
  const score = p.ovr + (p.seasonGoals + p.seasonAssists) * 1.8;
  if (score >= 102) {
    p.ballonDors += 1;
    const prize = Math.round(c.monthlyMinWage * 35);
    G.money += prize;
    G.fame = 100;
    unlockAchievement('ballon_dor_winner');
    playSfx('trophy');
    addLog(G.age, `🌕 **BALLON D'OR KAZANDIN!** Paris'teki törende dünyanın en iyi futbolcusu seçildin (+${fmtMoney(prize)} sponsor ödülü)!`, 'fame');
  } else {
    showToast(`Ballon d'Or'u bu yıl kazanamadın! (85+ OVR ve sezonluk 10+ gol/asist hedefle)`);
  }
  saveGame(); renderAll(); openMenuSection('pro_footballer');
}

function proPlayerLifestyle(type) {
  const c = getCountry();
  const p = G.proPlayer;
  if (type === 'boot_deal') {
    const deal = Math.round(c.monthlyMinWage * (p.ovr / 18));
    G.money += deal;
    playSfx('coin');
    addLog(G.age, `👟 Küresel spor markasıyla krampon reklamı çekip **+${fmtMoney(deal)}** kazandın.`, 'good');
  } else {
    G.happy = clamp(G.happy + 15);
    if (Math.random() < 0.35) {
      const fine = Math.round(c.monthlyMinWage * 1.2);
      G.money -= fine;
      addLog(G.age, `📸 Gece kulübü çıkışında paparazzilere yakalandın! Kulüp yönetimi **-${fmtMoney(fine)}** disiplin cezası kesti.`, 'bad');
    } else {
      addLog(G.age, `🍾 Takım arkadaşlarınla VIP kutlama yaptın, moralin yükseldi.`, 'good');
    }
  }
  saveGame(); renderAll(); openMenuSection('pro_footballer');
}

/* ============================================================================
   BÖLÜM 2 & 3: 🏟️ DERİN KULÜP BAŞKANLIĞI, ŞAMPİYONLAR LİGİ, KÜME DÜŞME & LOBİ
   ============================================================================ */

// Küme Düşme ve Alt Ligden Yükselme (Promotion / Relegation) Motoru
function processPromotionAndRelegation() {
  sortStandingsTable();
  const lgId = G.club.leagueId;
  const lg = FOOTBALL_LEAGUES_DB[lgId];
  const secondPool = SECOND_DIVISION_TEAMS_DB[lgId];
  if (!lg || !secondPool || secondPool.length === 0) return '';

  const relegated1 = G.club.standings[G.club.standings.length - 1];
  const relegated2 = G.club.standings[G.club.standings.length - 2];

  // Alt ligden mevcut ligde olmayan 2 takım seç
  const currentIds = lg.teams.map(t => t.id);
  const candidates = secondPool.filter(t => !currentIds.includes(t.id));
  if (candidates.length === 0) return '';

  const promoted = candidates.slice(0, 2);
  let logMsg = `📉 **Küme Düşenler:** ${relegated2.name}, ${relegated1.name}`;

  promoted.forEach((pTeam, idx) => {
    const relTarget = idx === 0 ? relegated1 : relegated2;
    // Eğer oyuncunun kendi kulübü son 2'deyse düşmekten son anda kurtulur ama ağır taraftar tepkisi alır
    if (relTarget.id === G.club.teamId) {
      G.club.fanTrust = clamp(G.club.fanTrust - 25);
      return;
    }
    const replaceIdx = lg.teams.findIndex(t => t.id === relTarget.id);
    if (replaceIdx !== -1) {
      secondPool.push(lg.teams[replaceIdx]);
      lg.teams[replaceIdx] = pTeam;
    }
  });

  logMsg += ` • 📈 **Üst Lige Çıkanlar:** ${promoted.map(x => x.name).join(', ')}`;
  return logMsg;
}

// UEFA Şampiyonlar Ligi / Avrupa Kupası Maç Simülasyonu
function playEuropeanCupRound() {
  ensureMegaFootballState();
  if (!G.club.active || !G.club.inEurope) {
    showToast('Kulübün bu sezon Avrupa kupalarında yer almıyor! Ligi ilk 4 sırada bitirmelisin.');
    return;
  }
  const c = getCountry();
  const stageNames = ['Lig Aşaması', 'Son 16 Turu', 'Çeyrek Final', 'Yarı Final', 'UEFA DEV FİNALİ'];
  const curStage = stageNames[Math.min(4, G.club.euroRound - 1)];
  const opp = pickRandom(EUROPEAN_OPPONENTS_DB);
  G.club.euroOpponent = `${opp.flag} ${opp.name}`;

  const uefaWinPrize = Math.round(c.monthlyMinWage * (G.club.euroRound * 8.5));
  const diff = (G.club.power + Math.round((G.club.tffLobby - 50) * 0.05)) - opp.power;
  const myGoals = Math.max(0, randInt(0, 3) + (diff >= 0 ? 1 : 0));
  const oppGoals = Math.max(0, randInt(0, 3) + (diff < -3 ? 1 : 0));

  if (myGoals >= oppGoals) {
    G.club.clubTreasury += uefaWinPrize;
    G.club.fanTrust = clamp(G.club.fanTrust + 10);
    playSfx('trophy');

    if (G.club.euroRound >= 5) {
      G.club.trophies.ucl += 1;
      G.club.euroRound = 1;
      unlockAchievement('ucl_winner');
      addLog(G.age, `🌍🏆 **AVRUPA ŞAMPİYONU ${G.club.teamName.toUpperCase()}!** Finalde **${opp.flag} ${opp.name}** takımını **${myGoals}-${oppGoals}** devirerek Avrupa Kupasını müzeye götürdün! (+${fmtMoney(uefaWinPrize)} UEFA Ödülü)`, 'fame');
    } else {
      G.club.euroRound += 1;
      addLog(G.age, `🌍 **AVRUPA ZAFERİ (${curStage}):** **${opp.flag} ${opp.name}** karşısında **${myGoals}-${oppGoals}** kazanarak üst tura yükseldin! Kasaya **+${fmtMoney(uefaWinPrize)}** UEFA primi girdi.`, 'fame');
    }
  } else {
    const consolation = Math.round(uefaWinPrize * 0.3);
    G.club.clubTreasury += consolation;
    G.club.inEurope = false;
    G.club.euroRound = 1;
    playSfx('bad');
    addLog(G.age, `🌍 **Avrupa'ya Veda (${curStage}):** **${opp.flag} ${opp.name}** takımına **${myGoals}-${oppGoals}** mağlup olarak elendin (+${fmtMoney(consolation)} ayak bastı parası).`, 'bad');
  }
  saveGame(); renderAll(); openMenuSection('club_presidency');
}

// Altyapıdan Wonderkid Çıkarma
function promoteAcademyWonderkid() {
  ensureMegaFootballState();
  const c = getCountry();
  const cost = Math.round(c.monthlyMinWage * 3.5);
  if (G.club.clubTreasury < cost) { showToast('Scout taraması ve profesyonel lisans için kulüp kasası yetersiz!'); return; }
  G.club.clubTreasury -= cost;

  const wkName = pickRandom(WONDERKID_FIRST_NAMES) + ' ' + pickRandom(WONDERKID_LAST_NAMES);
  const wkOvr = clamp(74 + G.club.scoutLvl * 3 + randInt(0, 4), 75, 92);
  G.club.power = clamp(G.club.power + 1, 60, 99);
  G.club.attPow = clamp(G.club.attPow + 2, 60, 99);
  G.club.wonderkidsCount += 1;
  if (G.club.wonderkidsCount >= 3) unlockAchievement('wonderkid_factory');

  playSfx('trophy');
  addLog(G.age, `🌱 **WONDERKID KEŞFİ!** Altyapı akademisinden 17 yaşındaki **${wkName}** (${wkOvr} Potansiyel) A Takım kadrosuna yükseltildi!`, 'fame');
  saveGame(); renderAll(); openMenuSection('club_presidency');
}

// Taraftar Grubu (GFB, ultrAslan, Çarşı) ve TFF/MHK Lobisi Aksiyonları
function doClubPoliticsAction(actType) {
  ensureMegaFootballState();
  const c = getCountry();
  const ultrasName = ULTRAS_GROUPS_DB[G.club.teamId] || ULTRAS_GROUPS_DB.default;

  if (actType === 'ultras_meeting') {
    const cost = Math.round(c.monthlyMinWage * 2.0);
    if (G.club.clubTreasury < cost) { showToast('Koreografi ve deplasman bütçesi için kasa yetersiz!'); return; }
    G.club.clubTreasury -= cost;
    G.club.ultrasMood = clamp(G.club.ultrasMood + 18);
    G.club.fanTrust = clamp(G.club.fanTrust + 12);
    playSfx('coin');
    addLog(G.age, `🔥 **${ultrasName}** tribün liderleriyle bir araya gelip dev koreografi ve deplasman otobüslerini finanse ettin! Tribün desteği **%${G.club.ultrasMood}** oldu.`, 'good');
  } else if (actType === 'tff_lobby') {
    const lobbyCost = Math.round(c.monthlyMinWage * 5.0);
    if (G.club.clubTreasury < lobbyCost) { showToast('Kulis bütçesi yetersiz!'); return; }
    G.club.clubTreasury -= lobbyCost;
    G.club.tffLobby = clamp(G.club.tffLobby + 16);
    G.club.power = clamp(G.club.power + 1, 60, 99);
    playSfx('coin');
    addLog(G.age, `🏛️ Federasyon ve MHK koridorlarında yoğun kulis yürüttün! Kulübün kurul ağırlığı **%${G.club.tffLobby}** seviyesine çıktı.`, 'good');
  } else if (actType === 'ffp_audit') {
    const sponsorBoost = Math.round(c.monthlyMinWage * 12);
    G.club.clubTreasury += sponsorBoost;
    playSfx('coin');
    addLog(G.age, `📑 Şirketlerin üzerinden yaptığın sponsorluk ve locayla UEFA FFP denetimini başarıyla geçtin! Kasaya **+${fmtMoney(sponsorBoost)}** girdi.`, 'good');
  }
  saveGame(); renderAll(); openMenuSection('club_presidency');
}

// Serbest Oyuncu İmzalama & Gelen Astronomik Teklifi Kabul Etme
function signFreeAgentPlayer(faId, bonusCost) {
  if (G.club.roster.includes(faId)) { showToast('Bu oyuncu zaten kadroda!'); return; }
  if (G.club.clubTreasury < bonusCost) { showToast('İmza parası için kulüp kasası yetersiz!'); return; }
  const fa = FREE_AGENT_PLAYERS_DB.find(x => x.id === faId);
  if (!fa) return;

  G.club.clubTreasury -= bonusCost;
  G.club.roster.push(faId);
  G.club.power = clamp(G.club.power + 1, 60, 99);
  playSfx('trophy');
  addLog(G.age, `✍️ Bonservisi elinde olan yıldız **${fa.name}** (${fa.ovr} OVR), sadece imza parasıyla kadroya katıldı!`, 'good');
  saveGame(); renderAll(); openMenuSection('club_presidency');
}

// Mevcut Kulüp Başkanlığı Görünümünü Genişleten Hook
(function attachMegaFootballPack() {
  if (window._megaFootballPackLoaded) return;
  window._megaFootballPackLoaded = true;

  // 1. Sezon Sonuna Küme Düşme / Çıkma Ekle
  const _baseFinishClubSeason = finishClubSeason;
  finishClubSeason = function () {
    const promoMsg = processPromotionAndRelegation();
    if (promoMsg) addLog(G.age, promoMsg, 'milestone');
    G.club.euroRound = 1;
    _baseFinishClubSeason();
  };

  // 2. Yaş İlerlediğinde Futbolcu Kariyeri Maaşını ve İdman Haklarını Güncelle
  const _baseAdvanceAge = advanceAge;
  advanceAge = function () {
    ensureMegaFootballState();
    if (G && G.proPlayer && G.proPlayer.active) {
      const c = getCountry();
      const p = G.proPlayer;
      p.trainsThisYear = 0;
      p.matchesThisYear = 0;
      const annualWage = Math.round(c.monthlyMinWage * (p.tier === 0 ? 1.8 : (p.tier === 1 ? 10.5 : 34.0)) * (p.ovr / 70)) * 12;
      G.money += annualWage;
      addLog(G.age + 1, `⚽ **${p.clubName}** futbolcu kontratından yıllık **+${fmtMoney(annualWage)}** maaş ve maç başı prim kazandın.`, 'good');
    }
    _baseAdvanceAge();
  };

  // 3. Kulüp Başkanlığı Ekranına Avrupa Kupası, Taraftar Grupları, TFF Lobisi ve Serbest Transferleri Ekle
  const _baseRenderClubView = renderClubPresidencyView;
  renderClubPresidencyView = function () {
    ensureMegaFootballState();
    const baseHtml = _baseRenderClubView();
    if (!G.club.active) return baseHtml;

    const c = getCountry();
    const ultrasName = ULTRAS_GROUPS_DB[G.club.teamId] || ULTRAS_GROUPS_DB.default;
    const stageNames = ['Lig Aşaması', 'Son 16 Turu', 'Çeyrek Final', 'Yarı Final', 'UEFA DEV FİNALİ'];
    const curEuroStage = stageNames[Math.min(4, G.club.euroRound - 1)];

    // Fikstür Sekmesine UEFA Şampiyonlar Ligi Kura & Maç Kartı Ekle
    if (activeClubSubTab === 'fixture') {
      const uclCard = `
        <div class="ucl-stage-card mb-3 space-y-2">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[9px] font-extrabold text-indigo-300 uppercase tracking-widest">🌍 ${G.club.europeStage} &bull; ${curEuroStage}</div>
              <div class="text-xs font-extrabold text-white">${G.club.inEurope ? `Sıradaki Avrupa Maçı: ${G.club.teamName} vs Avrupa Devi` : 'Bu Sezon Avrupa Kupalarından Elendin'}</div>
            </div>
            <span class="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">Tur #${G.club.euroRound}/5</span>
          </div>
          ${G.club.inEurope ? `
            <button onclick="playEuropeanCupRound()" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-400 text-slate-950 text-xs font-extrabold">
              🌍 UEFA Avrupa Kupası Tur Maçını Oyna (Yüksek Euro Primi)
            </button>
          ` : ''}
        </div>
      `;
      return uclCard + baseHtml;
    }

    // Taktik Sekmesine Wonderkid Akademisi Ekle
    if (activeClubSubTab === 'squad') {
      const wkCost = Math.round(c.monthlyMinWage * 3.5);
      const wkCard = `
        <div class="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between mb-2.5">
          <div>
            <div class="text-xs font-extrabold text-emerald-300">🌱 Scout &amp; Wonderkid Akademisi (Üretilen: ${G.club.wonderkidsCount})</div>
            <div class="text-[10px] text-slate-300">Altyapıdan 17 yaşında üstün yetenekli genç yıldız çıkarıp A Takım gücünü artır</div>
          </div>
          <button onclick="promoteAcademyWonderkid()" class="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-[10px] font-extrabold shrink-0">Keşfet (${fmtMoney(wkCost)})</button>
        </div>
      `;
      return wkCard + baseHtml;
    }

    // Transfer Sekmesine Serbest (Bonservissiz) Yıldızlar Ekle
    if (activeClubSubTab === 'transfer') {
      const faHtml = `
        <div class="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-2 mb-2.5">
          <div class="text-xs font-extrabold text-indigo-300">✍️ Serbest Statüdeki (Bonservissiz) Yıldızlar</div>
          ${FREE_AGENT_PLAYERS_DB.map(fa => {
            const bonus = Math.round(c.monthlyMinWage * fa.signBonusMult);
            const has = G.club.roster.includes(fa.id);
            return `
              <div class="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div class="text-xs font-bold text-white">${fa.name} <span class="text-emerald-400">(${fa.ovr} OVR)</span></div>
                  <div class="text-[10px] text-slate-400">Mevki: ${fa.pos} • İmza Parası: ${fmtMoney(bonus)}</div>
                </div>
                <button onclick="signFreeAgentPlayer('${fa.id}', ${bonus})" class="px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold ${has ? 'bg-slate-800 text-emerald-400' : 'bg-indigo-500 text-white'}">${has ? 'Kadroda ✓' : 'İmzala'}</button>
              </div>
            `;
          }).join('')}
        </div>
      `;
      return baseHtml + faHtml;
    }

    // Medya Sekmesine Taraftar Grubu (GFB/ultrAslan/Çarşı), TFF/MHK Lobisi ve FFP Ekle
    if (activeClubSubTab === 'media') {
      const lobbyPanel = `
        <div class="ultras-banner-card mb-2.5 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-orange-400">🔥 ${ultrasName} Tribün İlişkileri</span>
            <span class="text-xs font-mono-num font-bold text-white">Sadakat: %${G.club.ultrasMood}</span>
          </div>
          <div class="text-[10px] text-slate-300">TFF/MHK Lobi Gücü: <strong>%${G.club.tffLobby}</strong> • Tribün koreografisi ve federasyon kulis faaliyetlerini buradan yönetebilirsin.</div>
          <div class="grid grid-cols-1 gap-1.5 pt-1">
            <button onclick="doClubPoliticsAction('ultras_meeting')" class="p-2.5 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold text-left">🥁 ${ultrasName} Liderleriyle Toplan &amp; Koreografi Destekle</button>
            <button onclick="doClubPoliticsAction('tff_lobby')" class="p-2.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-bold text-left">🏛️ TFF &amp; MHK Koridorlarında Hakem Lobisi Yürüt</button>
            <button onclick="doClubPoliticsAction('ffp_audit')" class="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-left">📑 UEFA Finansal Fair Play (FFP) Sponsorluk Operasyonu Yap</button>
          </div>
        </div>
      `;
      return lobbyPanel + baseHtml;
    }

    return baseHtml;
  };

  // 4. Menüye ve Spor Sekmesine "⚽ Futbolcu Kariyeri (Sokaktan Ballon d'Or'a)" Butonu Ekle
  const _prevOpenMenuSec = openMenuSection;
  openMenuSection = function (sec) {
    ensureMegaFootballState();
    if (sec === 'pro_footballer') {
      const sheet = document.getElementById('bottomSheet');
      sheet.classList.remove('hidden');
      document.getElementById('sheetTitle').textContent = '⚽ Futbolcu Kariyeri: Sokaktan Ballon d’Or’a';
      document.getElementById('sheetSubtitle').textContent = G.proPlayer.active
        ? `${G.proPlayer.clubName} • ${G.proPlayer.ovr} OVR • €${G.proPlayer.marketValueM}M Değer`
        : 'Altyapı Seçmeleri, Yetenek Ağacı, Milli Takım & Altın Top';
      document.getElementById('sheetBody').innerHTML = renderProFootballerCareerView();
      return;
    }
    _prevOpenMenuSec(sec);

    if (sec === 'sports') {
      const body = document.getElementById('sheetBody');
      if (body && !document.getElementById('proFootballerHeroBtn')) {
        const subLbl = G.proPlayer.active
          ? `${G.proPlayer.clubName} (${G.proPlayer.ovr} OVR) • ${G.proPlayer.goals} Gol / ${G.proPlayer.assists} Asist`
          : '12+ Yaş Sokak Futbolu, 5’li Yetenek Ağacı, Milli Takım & Ballon d’Or';
        const btnHtml = `
          <button id="proFootballerHeroBtn" onclick="openMenuSection('pro_footballer')" class="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-yellow-500/15 to-emerald-500/20 border border-amber-400/50 flex items-center justify-between text-left mb-3 shadow-lg">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🌕</span>
              <div>
                <div class="text-xs font-extrabold text-white">Sokaktan Ballon d’Or’a: Pro Futbolcu Kariyeri</div>
                <div class="text-[10px] text-amber-300 font-semibold">${subLbl}</div>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 text-[10px] font-extrabold shrink-0">Kariyer &rarr;</span>
          </button>
        `;
        body.insertAdjacentHTML('afterbegin', btnHtml);
      }
    }
  };
})();

/* ============================================================================
   GERÇEKÇİ FUTBOLCU KEŞİF SİSTEMİ: OKUL TAKIMI -> SCOUT -> ALTYAPI -> PRO
   ============================================================================ */

// Durum başlatıcıyı yeni Okul Takımı, Scout Radarı, Altyapı Teklifleri ve Menajer sistemiyle genişlet
function upgradeProPlayerState() {
  if (!G) return;
  if (typeof ensureMegaFootballState === 'function') ensureMegaFootballState();

  const p = G.proPlayer;
  if (!p.stage) p.stage = p.active ? (p.tier >= 1 ? 'pro_star' : 'school_team') : 'none';
  // Aşamalar: 'none' | 'street' | 'school_team' | 'u19_academy' | 'pro_reserve' | 'pro_star'
  if (typeof p.scoutRadar !== 'number') p.scoutRadar = 15;
  if (!Array.isArray(p.pendingOffers)) p.pendingOffers = [];
  if (!p.academyId) p.academyId = null;
  if (!p.agentId) p.agentId = 'family';
  if (typeof p.coachTrust !== 'number') p.coachTrust = 55;
  if (typeof p.onLoan !== 'boolean') p.onLoan = false;
}

// Gözlemci (Scout) Radarına Göre Gerçek Kulüp Altyapı Teklifi Üretici
function generateYouthScoutOffers(count = 2) {
  upgradeProPlayerState();
  const p = G.proPlayer;
  const ag = FOOTBALL_AGENTS_DB.find(a => a.id === p.agentId) || FOOTBALL_AGENTS_DB[0];
  const effectiveRadar = p.scoutRadar + ag.radarBonus;

  const pool = YOUTH_ACADEMIES_DB.filter(ac => effectiveRadar >= ac.minRadar);
  const sourcePool = pool.length > 0 ? pool : [YOUTH_ACADEMIES_DB[0], YOUTH_ACADEMIES_DB[3]];

  for (let i = 0; i < count; i++) {
    const picked = pickRandom(sourcePool);
    if (!p.pendingOffers.some(o => o.id === picked.id)) {
      p.pendingOffers.push(picked);
    }
  }
}

// Yenilenmiş Gerçekçi Futbolcu Kariyer Ekranı
renderProFootballerCareerView = function () {
  upgradeProPlayerState();
  const c = getCountry();
  const p = G.proPlayer;
  recalcProPlayerOvr();

  const stageLabels = {
    none: 'Henüz Başlamadı',
    street: '👟 Sokak & Mahalle Futbolcusu',
    school_team: '🏫 Okul Takımı & İl Turnuvası Oyuncusu',
    u19_academy: '🌱 Kulüp Altyapı Akademisi (U19 Elit Lig)',
    pro_reserve: '📋 Profesyonel A Takım (Rotasyon / Kiralık)',
    pro_star: '🌟 A Takım Yıldızı & Uluslararası Profesyonel'
  };

  // AŞAMA 0: Henüz Başlamamışsa (Sokak / Okul Takımı Seçmeleri)
  if (!p.active || p.stage === 'none') {
    return `
      <div class="fut-player-card mb-3 space-y-2">
        <div class="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">⚽ GERÇEKÇİ FUTBOLCU YOLCULUĞU</div>
        <div class="text-sm font-extrabold text-white">Okul Takımından Keşfedilip Kulüp Altyapısına Gir!</div>
        <p class="text-[11px] text-slate-300 leading-relaxed">
          Gerçek hayattaki gibi önce <strong>Okul Takımı</strong> seçmelerine katılır, okul sonrası antrenmanlara çıkar ve <strong>Okullararası Turnuvalarda</strong> oynarsın. Tribündeki kulüp gözlemcileri (Scout) seni beğendiğinde <strong>Fenerbahçe, Galatasaray, Beşiktaş, Trabzonspor veya Avrupa</strong> altyapılarından resmi teklif alırsın!
        </p>
      </div>

      <div class="space-y-2">
        <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">🎯 Mevkini Seç ve Okul / Sokak Seçmelerine Gir (7-20 Yaş)</h4>
        ${[
          { pos: 'SNT / Santrafor (9 Numara)', desc: 'Ceza sahası golcüsü, hava topları ve soğukkanlı bitiricilik' },
          { pos: 'OOS / 10 Numara Oyun Kurucu', desc: 'Kilit paslar, frikik ustası ve uzaktan sert şutlar' },
          { pos: 'SLK-SĞK / Çizgi Kanat Forvet', desc: 'Patlayıcı sprint, bire bir çalım ve orta/şut tehdidi' },
          { pos: 'MO / Merkez Orta Saha (8 Numara)', desc: 'Oyun kurulumu, yüksek kondisyon ve saha içi liderlik' }
        ].map(item => `
          <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
            <div>
              <div class="text-xs font-extrabold text-white">⚽ ${item.pos}</div>
              <div class="text-[10px] text-slate-400">${item.desc}</div>
            </div>
            <button onclick="beginGrassrootsFootball('${item.pos}')" class="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold shrink-0">Seçmeye Gir &rarr;</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Maaş / Burs Hesabı (Aşamaya Göre)
  let monthlyIncome = 0;
  if (p.stage === 'u19_academy') {
    const ac = YOUTH_ACADEMIES_DB.find(x => x.id === p.academyId);
    monthlyIncome = Math.round(c.monthlyMinWage * (ac ? ac.stipendMult : 0.45));
  } else if (p.stage === 'pro_reserve') {
    monthlyIncome = Math.round(c.monthlyMinWage * (p.onLoan ? 2.4 : 3.2) * (p.ovr / 70));
  } else if (p.stage === 'pro_star') {
    monthlyIncome = Math.round(c.monthlyMinWage * (p.tier >= 2 ? 32.0 : 11.5) * (p.ovr / 72));
  }

  const futHeader = `
    <div class="fut-player-card mb-2.5 space-y-2.5">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <div class="w-14 h-16 rounded-2xl bg-amber-400/20 border-2 border-amber-400 flex flex-col items-center justify-center shrink-0">
            <span class="text-lg font-black font-mono-num text-amber-300 leading-none">${p.ovr}</span>
            <span class="text-[8px] font-extrabold text-white uppercase mt-0.5">${p.position.split(' ')[0]}</span>
          </div>
          <div>
            <div class="text-[9px] font-extrabold text-amber-400 uppercase tracking-wider">${stageLabels[p.stage] || p.stage}</div>
            <div class="text-sm font-extrabold text-white">${G.firstName} ${G.lastName} <span class="text-xs text-slate-300 font-normal">(${p.clubName})</span></div>
            <div class="text-[10px] text-emerald-400 font-mono-num">
              ${monthlyIncome > 0 ? `Gelir: +${fmtMoney(monthlyIncome)}/ay` : 'Amatör / Okul Lisansı'} &bull; Değer: €${p.marketValueM}M
            </div>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold">🌕 ${p.ballonDors}</span>
      </div>

      <!-- Scout Radarı & Teknik Direktör Güveni Barı -->
      <div class="grid grid-cols-2 gap-2 bg-slate-950/85 p-2 rounded-xl border border-slate-800">
        <div>
          <div class="flex justify-between text-[9px] font-bold mb-0.5">
            <span class="text-sky-400">🕵️‍♂️ Kulüp Scout Radarı</span>
            <span class="font-mono-num text-white">%${clamp(p.scoutRadar)}</span>
          </div>
          <div class="stat-track"><div class="stat-fill bg-sky-400" style="width:${clamp(p.scoutRadar)}%"></div></div>
        </div>
        <div>
          <div class="flex justify-between text-[9px] font-bold mb-0.5">
            <span class="text-emerald-400">👔 Hoca Forma Güveni</span>
            <span class="font-mono-num text-white">%${clamp(p.coachTrust)}</span>
          </div>
          <div class="stat-track"><div class="stat-fill bg-emerald-400" style="width:${clamp(p.coachTrust)}%"></div></div>
        </div>
      </div>

      <!-- 5'li Yetenek Puanları -->
      <div class="grid grid-cols-5 gap-1.5 text-center">
        <div class="p-1.5 rounded-xl bg-slate-950/90 border border-slate-800"><div class="text-[8px] text-slate-400">⚡ HIZ</div><div class="text-xs font-extrabold font-mono-num text-white">${p.pace}</div></div>
        <div class="p-1.5 rounded-xl bg-slate-950/90 border border-slate-800"><div class="text-[8px] text-slate-400">🎯 ŞUT</div><div class="text-xs font-extrabold font-mono-num text-white">${p.shooting}</div></div>
        <div class="p-1.5 rounded-xl bg-slate-950/90 border border-slate-800"><div class="text-[8px] text-slate-400">🧭 PAS</div><div class="text-xs font-extrabold font-mono-num text-white">${p.passing}</div></div>
        <div class="p-1.5 rounded-xl bg-slate-950/90 border border-slate-800"><div class="text-[8px] text-slate-400">🪄 TEKNİK</div><div class="text-xs font-extrabold font-mono-num text-white">${p.dribbling}</div></div>
        <div class="p-1.5 rounded-xl bg-slate-950/90 border border-slate-800"><div class="text-[8px] text-slate-400">💪 FİZİK</div><div class="text-xs font-extrabold font-mono-num text-white">${p.physical}</div></div>
      </div>
    </div>

    <!-- 4 Alt Sekme -->
    <div class="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-2.5 text-[10px] font-extrabold">
      <button onclick="activeProPlayerTab='overview'; openMenuSection('pro_footballer')" class="py-2 rounded-xl ${activeProPlayerTab === 'overview' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}">🏟️ Kariyer &amp; Maç</button>
      <button onclick="activeProPlayerTab='train'; openMenuSection('pro_footballer')" class="py-2 rounded-xl ${activeProPlayerTab === 'train' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}">🏋️ Antrenman</button>
      <button onclick="activeProPlayerTab='transfer'; openMenuSection('pro_footballer')" class="py-2 rounded-xl ${activeProPlayerTab === 'transfer' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}">📩 Teklifler ${p.pendingOffers.length > 0 ? `(${p.pendingOffers.length})` : ''}</button>
      <button onclick="activeProPlayerTab='national'; openMenuSection('pro_footballer')" class="py-2 rounded-xl ${activeProPlayerTab === 'national' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}">🇹🇷 Milli &amp; Ödül</button>
    </div>
  `;

  // SEKME 1: AŞAMAYA GÖRE MAÇ, OKUL TURNUVASI, U19 VEYA A TAKIM SAHNESİ
  if (activeProPlayerTab === 'overview') {
    let stageBoxHtml = '';

    // 1) Okul Takımı & Sokak Aşaması
    if (p.stage === 'street' || p.stage === 'school_team') {
      stageBoxHtml = `
        <div class="p-3.5 rounded-2xl bg-slate-900 border border-sky-500/40 space-y-2.5">
          <div class="flex justify-between items-center">
            <span class="text-xs font-extrabold text-sky-400">🏫 Okul Takımı &amp; Gözlemci (Scout) Vitrini</span>
            <span class="text-[10px] font-mono-num text-slate-300">Maç Hakkı: ${4 - p.matchesThisYear}/4</span>
          </div>
          <p class="text-[11px] text-slate-300">Okul çıkışlarında antrenman yaparak ve <strong>Okullararası İl Turnuvası</strong> maçlarına çıkarak kulüp scoutlarının dikkatini çek! Radar <strong>%45+</strong> olduğunda kulüpler altyapı teklifi gönderir.</p>
          <div class="grid grid-cols-1 gap-2">
            <button onclick="doGrassrootsAction('school_train')" class="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-left">
              👟 Okul Çıkışı Takımla Çift Kale Antrenman Yap (+Yetenek &amp; +%12 Scout Radarı)
            </button>
            <button onclick="doGrassrootsAction('school_cup_match')" class="p-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-400 text-slate-950 text-xs font-extrabold text-center">
              🏆 Okullararası İl Şampiyonası Maçına Çık (Tribünde Scoutlar Var!)
            </button>
          </div>
        </div>
      `;
    }
    // 2) Kulüp Altyapı Akademisi (U19 Elit Lig) Aşaması
    else if (p.stage === 'u19_academy') {
      stageBoxHtml = `
        <div class="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-2.5">
          <div class="flex justify-between items-center">
            <span class="text-xs font-extrabold text-emerald-400">🌱 ${p.clubName} (U19 Elit Lig)</span>
            <span class="text-[10px] font-mono-num text-white">Hoca Güveni: %${p.coachTrust}</span>
          </div>
          <p class="text-[11px] text-slate-300">Altyapıda U19 maçlarında yıldızlaşıp A Takım hocasının güvenini <strong>%75+</strong> seviyesine çıkardığında (veya 68+ OVR olduğunda) <strong>Profesyonel A Takım Sözleşmesi</strong> imzalayabilirsin!</p>
          <div class="grid grid-cols-1 gap-2">
            <button onclick="doGrassrootsAction('u19_match')" class="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-extrabold">
              ⚽ U19 Elit Lig Derbisine İlk 11 Çık (+OVR &amp; +A Takım Hoca Güveni)
            </button>
            <button onclick="doGrassrootsAction('sign_first_pro')" class="p-2.5 rounded-xl ${p.ovr >= 68 || p.coachTrust >= 75 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'} text-xs font-extrabold">
              ✍️ Profesyonel A Takım Sözleşmesi İmzala (68+ OVR veya %75 Güven)
            </button>
          </div>
        </div>
      `;
    }
    // 3) Profesyonel A Takım Rotasyon / Kiralık (Loan) Aşaması
    else if (p.stage === 'pro_reserve') {
      stageBoxHtml = `
        <div class="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-2.5">
          <div class="flex justify-between items-center">
            <span class="text-xs font-extrabold text-amber-400">📋 A Takım Kadrosu ${p.onLoan ? '(Kiralık İlk 11)' : '(Genç Rotasyon)'}</span>
            <span class="text-[10px] font-mono-num text-white">Hoca Güveni: %${p.coachTrust}</span>
          </div>
          <p class="text-[11px] text-slate-300">A Takımda sonradan oyuna girerek kendini kanıtlayabilir ya da banko ilk 11 oynamak için <strong>1 sezonluğuna kiralık (Loan)</strong> giderek OVR puanını hızla patlatabilirsin!</p>
          <div class="grid grid-cols-1 gap-2">
            <button onclick="playInteractivePlayerMatch()" class="p-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-xs font-extrabold">
              ▶️ Süper Lig / Avrupa Maçında Sahaya Çık (${4 - p.matchesThisYear}/4 Hak)
            </button>
            <button onclick="doGrassrootsAction(' become_starter')" class="p-2.5 rounded-xl ${p.ovr >= 74 || p.coachTrust >= 85 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'} text-xs font-extrabold">
              🌟 Takımın Değişilmez İlk 11 Yıldızı Ol (74+ OVR veya %85 Güven)
            </button>
          </div>
        </div>
      `;
    }
    // 4) A Takım Yıldızı
    else {
      stageBoxHtml = `
        <div class="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-xs font-extrabold text-white">🌟 İlk 11 Süperstarı • Haftanın Maçı</span>
            <span class="text-[10px] font-mono-num text-emerald-400">Kalan Hak: ${4 - p.matchesThisYear}/4</span>
          </div>
          <button onclick="playInteractivePlayerMatch()" class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-extrabold">
            ▶️ Sahaya İlk 11 Çık ve Kritik Pozisyonu Yönet
          </button>
        </div>
      `;
    }

    return futHeader + stageBoxHtml + `
      ${p.pendingOffers.length > 0 ? `
        <div onclick="activeProPlayerTab='transfer'; openMenuSection('pro_footballer')" class="cursor-pointer p-3 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-between animate-pulse mt-2">
          <div class="text-xs font-extrabold text-amber-300">📩 ${p.pendingOffers.length} Kulüp Gözlemcisinden Resmi Altyapı Teklifin Var!</div>
          <span class="text-xs font-extrabold text-white">İncele &rarr;</span>
        </div>
      ` : ''}

      <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 mt-2">
        <div class="text-xs font-extrabold text-white">🌟 Saha Dışı Yaşam &amp; Sponsorluk</div>
        <div class="grid grid-cols-2 gap-2">
          <button onclick="proPlayerLifestyle('boot_deal')" class="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold">👟 Krampon Sponsorluğu</button>
          <button onclick="proPlayerLifestyle('nightclub')" class="p-2.5 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 text-[11px] font-bold">🍾 VIP Kutlama Partisi</button>
        </div>
      </div>
    `;
  }

  // SEKME 2: ANTRENMAN & BİREYSEL GELİŞİM
  if (activeProPlayerTab === 'train') {
    const trainCost = Math.round(c.monthlyMinWage * (p.stage === 'school_team' ? 0.15 : 0.45));
    const attrs = [
      { key: 'pace', name: '⚡ Patlayıcı Sprint & Çeviklik İdmanı', val: p.pace },
      { key: 'shooting', name: '🎯 Bitiricilik & Ceza Sahası Şut İdmanı', val: p.shooting },
      { key: 'passing', name: '🧭 Vizyon & Uzun Pas İstasyonu', val: p.passing },
      { key: 'dribbling', name: '🪄 Dar Alan Çalım & Frikik Çalışması', val: p.dribbling },
      { key: 'physical', name: '💪 Core Kuvvet & İkili Mücadele', val: p.physical }
    ];
    return futHeader + `
      <div class="text-[11px] text-slate-400 mb-1">Bu Yıl Kalan Özel Antrenman Hakkı: <strong class="text-emerald-400">${3 - p.trainsThisYear}/3</strong></div>
      <div class="space-y-2">
        ${attrs.map(a => `
          <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-xs font-extrabold text-white">${a.name}</div>
              <div class="text-[10px] text-slate-400">Seviye: <strong class="text-amber-400">${a.val} / 99</strong></div>
            </div>
            <button onclick="trainProPlayerAttribute('${a.key}', ${trainCost})" class="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-[10px] font-extrabold">Çalış (${fmtMoney(trainCost)})</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  // SEKME 3: SCOUT ALTYAPI TEKLİFLERİ, KİRALIK (LOAN) KULÜPLER, MENAJER VE DEV TRANSFERLER
  if (activeProPlayerTab === 'transfer') {
    const curAgent = FOOTBALL_AGENTS_DB.find(a => a.id === p.agentId) || FOOTBALL_AGENTS_DB[0];

    // 1. Gelen Altyapı Scout Teklifleri
    let scoutOffersHtml = '';
    if (p.stage === 'street' || p.stage === 'school_team') {
      scoutOffersHtml = `
        <div class="p-3.5 rounded-2xl bg-slate-900 border border-sky-500/40 space-y-2 mb-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-sky-400">🕵️‍♂️ Kulüp Gözlemcilerinden (Scout) Gelen Altyapı Teklifleri</span>
            <button onclick="requestManualScoutTrial()" class="px-2.5 py-1 rounded-lg bg-sky-500 text-slate-950 text-[10px] font-extrabold">Kulüp Seçmesine Git</button>
          </div>
          ${p.pendingOffers.length === 0 ? `<div class="text-[11px] text-slate-400">Henüz resmi teklif yok. Okul takımında maçlara çıkıp Scout Radarını (%${p.scoutRadar}) yükselt veya sağ üstten seçmelere katıl!</div>` : `
            <div class="space-y-2 pt-1">
              ${p.pendingOffers.map(ac => {
                const stip = Math.round(c.monthlyMinWage * ac.stipendMult);
                return `
                  <div class="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between gap-2">
                    <div>
                      <div class="text-xs font-extrabold text-white">${ac.flag} ${ac.name}</div>
                      <div class="text-[10px] text-slate-400">${ac.desc}</div>
                      <div class="text-[10px] text-emerald-400 font-mono-num mt-0.5">Altyapı Bursu: +${fmtMoney(stip)}/ay • Gelişim: +${ac.devBoost} OVR</div>
                    </div>
                    <button onclick="acceptYouthAcademyOffer('${ac.id}')" class="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-[10px] font-extrabold shrink-0">İmzala</button>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      `;
    }

    // 2. Kiralık (Loan) Gidilebilecek Kulüpler (U19 veya A Takım Rotasyondayken)
    let loanHtml = '';
    if (p.stage === 'u19_academy' || p.stage === 'pro_reserve') {
      loanHtml = `
        <div class="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-2 mb-3">
          <div class="text-xs font-extrabold text-amber-300">🔄 1 Yıllık Kiralık (Loan) Transfer Teklifleri (İlk 11 Garantili)</div>
          <div class="space-y-1.5">
            ${LOAN_CLUBS_DB.map((lc, idx) => `
              <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <div class="text-xs font-bold text-white">⚽ ${lc.name} <span class="text-emerald-400">(+${lc.boostOvr} OVR Gelişim)</span></div>
                  <div class="text-[10px] text-slate-400">${lc.desc}</div>
                </div>
                <button onclick="goOutOnLoan(${idx})" class="px-2.5 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-extrabold shrink-0">Kiralık Git</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 3. Menajer (Agent) Seçimi
    const agentHtml = `
      <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 mb-3">
        <div class="text-xs font-extrabold text-white">💼 Futbolcu Menajerin: <span class="text-amber-400">${curAgent.name}</span></div>
        <div class="grid grid-cols-3 gap-1.5">
          ${FOOTBALL_AGENTS_DB.map(ag => `
            <button onclick="G.proPlayer.agentId='${ag.id}'; saveGame(); openMenuSection('pro_footballer');" class="p-2 rounded-xl border text-left ${p.agentId === ag.id ? 'border-amber-400 bg-amber-400/15 text-white' : 'border-slate-800 bg-slate-950 text-slate-400'}">
              <div class="text-[10px] font-extrabold truncate">${ag.name.split(' ')[0]}</div>
              <div class="text-[9px] text-emerald-400">+%${Math.round((ag.bonusMult - 1) * 100)} İmza</div>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // 4. Profesyonel Kulüp Transfer Teklifleri
    const targetClubs = [
      { name: '🟡🔵 Fenerbahçe', tier: 1, reqOvr: 73, signMult: 15 },
      { name: '🟡🔴 Galatasaray', tier: 1, reqOvr: 73, signMult: 15 },
      { name: '⚫⚪ Beşiktaş', tier: 1, reqOvr: 72, signMult: 13 },
      { name: '🔴⚫ AC Milan', tier: 2, reqOvr: 80, signMult: 38 },
      { name: '🔴⚪ Arsenal', tier: 2, reqOvr: 83, signMult: 52 },
      { name: '🔵🔴 FC Barcelona', tier: 2, reqOvr: 85, signMult: 65 },
      { name: '⚪🟣 Real Madrid', tier: 2, reqOvr: 87, signMult: 80 },
      { name: '🔵⚪ Manchester City', tier: 2, reqOvr: 87, signMult: 80 }
    ];

    return futHeader + scoutOffersHtml + loanHtml + agentHtml + `
      <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">✈️ A Takım Bonservisli Transfer Masası</h4>
      <div class="space-y-2">
        ${targetClubs.map(tc => {
          const signBonus = Math.round(c.monthlyMinWage * tc.signMult * curAgent.bonusMult);
          const canJoin = p.ovr >= tc.reqOvr && (p.stage === 'pro_reserve' || p.stage === 'pro_star' || p.ovr >= 75);
          return `
            <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
              <div>
                <div class="text-xs font-extrabold text-white">${tc.name}</div>
                <div class="text-[10px] text-slate-400">Şart: <strong>${tc.reqOvr}+ OVR</strong> • Net İmza Parası: <strong class="text-emerald-400">+${fmtMoney(signBonus)}</strong></div>
              </div>
              <button onclick="transferProPlayerToClub('${tc.name}', ${tc.tier}, ${tc.reqOvr}, ${signBonus})" class="px-3 py-2 rounded-xl text-[10px] font-extrabold ${canJoin ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-500'}">Transfer Ol</button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // SEKME 4: MİLLİ TAKIM & BALLON D'OR
  return futHeader + `
    <div class="space-y-2.5">
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-rose-500/40 space-y-2">
        <div class="text-xs font-extrabold text-white">${c.flag} Milli Futbol Takımı (74+ OVR)</div>
        <div class="text-[11px] text-slate-300">Milli Maç: <strong>${p.caps}</strong> • Milli Gol: <strong>${p.intlGoals}</strong></div>
        <button onclick="playNationalTeamTournament()" class="w-full py-2.5 rounded-xl bg-rose-500 text-white text-xs font-extrabold">🌍 Milli Maça / Turnuvaya Çık</button>
      </div>

      <div class="p-3.5 rounded-2xl bg-slate-900 border border-amber-400/40 space-y-2">
        <div class="text-xs font-extrabold text-amber-300">🌕 France Football Ballon d'Or Ödül Galası</div>
        <div class="text-[11px] text-slate-300">Bu sezon <strong>${p.seasonGoals} gol, ${p.seasonAssists} asist</strong> ürettin.</div>
        <button onclick="attendBallonDorGala()" class="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold">🏆 Paris Ballon d'Or Törenine Katıl</button>
      </div>
    </div>
  `;
};

// Okul Takımı Başlangıç Fonksiyonu
function beginGrassrootsFootball(pos) {
  if (G.age < 7 || G.age > 22) {
    showToast('Okul takımı ve altyapı seçmeleri için 7–22 yaş arasında olmalısın!');
    return;
  }
  upgradeProPlayerState();
  const p = G.proPlayer;
  p.active = true;
  p.stage = 'school_team';
  p.position = pos;
  p.clubName = 'Okul Futbol Takımı';
  p.tier = 0;
  p.scoutRadar = 25;
  p.coachTrust = 60;
  p.pace = randInt(58, 66);
  p.shooting = pos.includes('SNT') ? randInt(64, 70) : randInt(56, 64);
  p.passing = pos.includes('OOS') ? randInt(64, 70) : randInt(56, 64);
  p.dribbling = pos.includes('SLK') ? randInt(64, 70) : randInt(58, 66);
  p.physical = randInt(55, 63);
  recalcProPlayerOvr();

  playSfx('trophy');
  addLog(G.age, `🏫 **OKUL TAKIMI SEÇMELERİ:** Beden eğitimi öğretmeninin yaptığı seçmeleri kazanarak **${pos}** mevkisinde Okul Takımı formasını giydin (${p.ovr} OVR)!`, 'milestone');
  saveGame(); renderAll(); openMenuSection('pro_footballer');
}

// Okul Takımı, U19 ve A Takıma Geçiş Aksiyonları
function doGrassrootsAction(act) {
  upgradeProPlayerState();
  const p = G.proPlayer;
  const c = getCountry();

  if (act === 'school_train') {
    if (p.trainsThisYear >= 3) { showToast('Bu yılki 3 okul idmanı hakkını tamamladın! Maça çık veya +1 Yaş ilerle.'); return; }
    p.trainsThisYear += 1;
    p.dribbling = clamp(p.dribbling + 2, 40, 99);
    p.passing = clamp(p.passing + 2, 40, 99);
    p.scoutRadar = clamp(p.scoutRadar + 12);
    recalcProPlayerOvr();
    playSfx('coin');
    addLog(G.age, `👟 Okul çıkışı takımla ekstra antrenman yaptın! Scout radarın **%${p.scoutRadar}** seviyesine yükseldi.`, 'good');
  } else if (act === 'school_cup_match') {
    if (p.matchesThisYear >= 4) { showToast('Bu sezonki 4 turnuva maçı hakkın doldu! +1 Yaş ilerle.'); return; }
    p.matchesThisYear += 1;
    p.apps += 1;
    const g = randInt(1, 3);
    p.goals += g; p.seasonGoals += g;
    p.shooting = clamp(p.shooting + 2, 40, 99);
    p.pace = clamp(p.pace + 1, 40, 99);
    p.scoutRadar = clamp(p.scoutRadar + 22);
    recalcProPlayerOvr();

    if (p.scoutRadar >= 45) {
      generateYouthScoutOffers(2);
      playSfx('trophy');
      addLog(G.age, `🕵️‍♂️ **KEŞFEDİLDİN!** Okullararası turnuva maçında **${g} gol** attın! Tribündeki kulüp gözlemcileri (Scout) sana **Resmi Altyapı Teklifi** gönderdi!`, 'fame');
      activeProPlayerTab = 'transfer';
    } else {
      playSfx('coin');
      addLog(G.age, `⚽ Okul turnuvasında **${g} gol** attın! Gözlemci radarın **%${p.scoutRadar}** oldu.`, 'good');
    }
  } else if (act === 'u19_match') {
    if (p.matchesThisYear >= 4) { showToast('Bu sezonki 4 U19 maç hakkın doldu! +1 Yaş ilerle.'); return; }
    p.matchesThisYear += 1;
    p.apps += 1;
    const g = randInt(1, 2);
    p.goals += g; p.seasonGoals += g;
    p.coachTrust = clamp(p.coachTrust + 14);
    p.shooting = clamp(p.shooting + 2, 40, 99);
    p.physical = clamp(p.physical + 2, 40, 99);
    recalcProPlayerOvr();
    playSfx('coin');
    addLog(G.age, `🌱 **U19 Elit Lig:** Maçı **${g} golle** tamamladın! A Takım hocasının sana olan güveni **%${p.coachTrust}** oldu.`, 'good');
  } else if (act === 'sign_first_pro') {
    if (p.ovr < 68 && p.coachTrust < 75) {
      showToast('A Takım profesyonel sözleşmesi için en az 68 OVR veya %75 Hoca Güveni gerekir!');
      return;
    }
    p.stage = 'pro_reserve';
    p.tier = 1;
    G.sports.branchId = 'football';
    G.sports.tierIndex = 1;
    const firstSignBonus = Math.round(c.monthlyMinWage * 6.5);
    G.money += firstSignBonus;
    G.fame = clamp(G.fame + 15);
    playSfx('trophy');
    addLog(G.age, `✍️ **İLK PROFESYONEL KONTRAT!** **${p.clubName}** seninle resmi A Takım sözleşmesi imzaladı ve **+${fmtMoney(firstSignBonus)}** imza parası ödedi!`, 'fame');
  } else if (act.trim() === 'become_starter') {
    if (p.ovr < 74 && p.coachTrust < 85) {
      showToast('Değişilmez ilk 11 yıldızı olmak için en az 74 OVR veya %85 Hoca Güveni gerekir!');
      return;
    }
    p.stage = 'pro_star';
    p.onLoan = false;
    G.fame = clamp(G.fame + 15);
    playSfx('trophy');
    addLog(G.age, `🌟 **A TAKIM İLK 11 YILDIZI!** Artık **${p.clubName}** kadrosunun değişilmez 1 numaralı yıldızısın!`, 'fame');
  }

  saveGame(); renderAll(); openMenuSection('pro_footballer');
}

function requestManualScoutTrial() {
  generateYouthScoutOffers(2);
  playSfx('coin');
  showToast('Kulüp altyapı seçmelerinde gözlemcilerin dikkatini çektin!');
  saveGame(); openMenuSection('pro_footballer');
}

function acceptYouthAcademyOffer(academyId) {
  upgradeProPlayerState();
  const ac = YOUTH_ACADEMIES_DB.find(x => x.id === academyId);
  if (!ac) return;
  const p = G.proPlayer;

  p.stage = 'u19_academy';
  p.academyId = ac.id;
  p.clubName = ac.name.replace(' Akademisi', '').replace(' Futbol', '') + ' U19';
  p.pendingOffers = [];
  p.coachTrust = 55;

  p.pace = clamp(p.pace + ac.devBoost, 40, 99);
  p.shooting = clamp(p.shooting + ac.devBoost, 40, 99);
  p.passing = clamp(p.passing + ac.devBoost, 40, 99);
  p.dribbling = clamp(p.dribbling + ac.devBoost, 40, 99);
  p.physical = clamp(p.physical + ac.devBoost, 40, 99);
  recalcProPlayerOvr();

  activeProPlayerTab = 'overview';
  playSfx('trophy');
  addLog(G.age, `${ac.flag} **ALTYAPIYA TRANSFER OLDUN!** **${ac.name}** gözlemcilerinin teklifini kabul edip kulüp tesislerine yerleştin! (+${ac.devBoost} OVR Gelişim)`, 'milestone');
  saveGame(); renderAll(); openMenuSection('pro_footballer');
}

function goOutOnLoan(loanIdx) {
  upgradeProPlayerState();
  const lc = LOAN_CLUBS_DB[loanIdx];
  if (!lc) return;
  const p = G.proPlayer;
  const c = getCountry();

  p.stage = 'pro_reserve';
  p.onLoan = true;
  p.clubName = lc.name;
  p.pace = clamp(p.pace + lc.boostOvr, 40, 99);
  p.shooting = clamp(p.shooting + lc.boostOvr, 40, 99);
  p.passing = clamp(p.passing + lc.boostOvr, 40, 99);
  p.dribbling = clamp(p.dribbling + lc.boostOvr, 40, 99);
  p.physical = clamp(p.physical + lc.boostOvr, 40, 99);
  p.coachTrust = clamp(p.coachTrust + 22);
  recalcProPlayerOvr();

  const loanWage = Math.round(c.monthlyMinWage * lc.wageMult * 4);
  G.money += loanWage;
  activeProPlayerTab = 'overview';
  playSfx('trophy');
  addLog(G.age, `🔄 **KİRALIK PATLAMA!** Düzenli ilk 11 oynamak için **${lc.name}** kadrosuna kiralandın! Banko oynayarak **+${lc.boostOvr} OVR** geliştin ve **+${fmtMoney(loanWage)}** kazandın!`, 'fame');
  saveGame(); renderAll(); openMenuSection('pro_footballer');
}

// Transfer fonksiyonunu yeni aşama sistemiyle uyumlu hale getir
transferProPlayerToClub = function (clubName, tier, reqOvr, signBonus) {
  upgradeProPlayerState();
  const p = G.proPlayer;
  if (p.ovr < reqOvr) { showToast(`Bu kulüp için en az ${reqOvr} OVR gücünde olmalısın!`); return; }
  p.clubName = clubName;
  p.tier = tier;
  p.stage = 'pro_star';
  p.onLoan = false;
  G.sports.branchId = 'football';
  G.sports.tierIndex = tier;
  G.money += signBonus;
  G.fame = clamp(G.fame + 18);
  if (tier === 2) unlockAchievement('pro_champ');
  activeProPlayerTab = 'overview';
  playSfx('trophy');
  addLog(G.age, `✈️ **DEV TRANSFER!** Menajerin aracılığıyla **${clubName}** ile sözleşme imzaladın ve **+${fmtMoney(signBonus)}** imza parası aldın!`, 'fame');
  saveGame(); renderAll(); openMenuSection('pro_footballer');
};

// Her yıl (+1 Yaş) Okul Takımı veya U19'dayken Otomatik Scout Keşif Pop-up Kontrolü
(function attachGrassrootsYearlyHook() {
  if (window._grassrootsYearlyHookLoaded) return;
  window._grassrootsYearlyHookLoaded = true;

  const _prevTriggerEvents = triggerYearlyEvents;
  triggerYearlyEvents = function () {
    upgradeProPlayerState();
    _prevTriggerEvents();

    const modal = document.getElementById('eventModal');
    if (!G || !G.alive || G.inPrison) return;
    if (modal && !modal.classList.contains('hidden')) return;

    const p = G.proPlayer;
    if (p && p.active && (p.stage === 'school_team' || p.stage === 'street') && p.scoutRadar >= 45 && Math.random() < 0.65) {
      generateYouthScoutOffers(2);
      const topOffer = p.pendingOffers[0] || YOUTH_ACADEMIES_DB[1];
      openEventModal({
        badge: `🕵️‍♂️ KULÜP ALTYAPI SCOUT RAPORU`,
        title: `${topOffer.flag} ${topOffer.name} Seni İstiyor!`,
        desc: `Okul takımıyla çıktığın maçlarda gösterdiğin performans kulüp gözlemcilerini büyüledi! ${topOffer.name} altyapı koordinatörü ailenle görüşüp seni akademiye davet etti.`,
        choices: [
          {
            label: `✍️ Teklifi Kabul Et ve ${topOffer.name} Altyapısına Katıl`,
            action: () => acceptYouthAcademyOffer(topOffer.id)
          },
          {
            label: '📋 Diğer Kulüplerin Tekliflerini de Gör',
            action: () => {
              activeProPlayerTab = 'transfer';
              openMenuSection('pro_footballer');
            }
          }
        ]
      });
    }
  };
})();

/* ============================================================================
   HD GRAFİK MOTORU (5 GÖRSEL PAKET TAM ENTEGRASYON)
   ============================================================================ */

// 1. Araç ve Emlak Vitrin Görselleri Veritabanı
const CAR_THUMBNAILS_DB = {
  scooter: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=300&q=80',
  tofas: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=300&q=80',
  doblo: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=300&q=80',
  egea: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=300&q=80',
  egea_cross: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=300&q=80',
  corolla: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=300&q=80',
  togg: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=300&q=80',
  transporter: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=300&q=80',
  passat: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=300&q=80',
  bmw320: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=300&q=80',
  volvo_fh16: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=300&q=80',
  scania_s730: 'https://images.unsplash.com/photo-1586191582056-b7f0372a3ce6?auto=format&fit=crop&w=300&q=80',
  g63: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=300&q=80',
  porsche911: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=80',
  ferrari_f8: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=300&q=80',
  maybach: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=300&q=80'
};

const HOUSE_THUMBNAILS_DB = {
  ogrenci_apart: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=300&q=80',
  studio: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=300&q=80',
  apt31: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=300&q=80',
  lojistik_depo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=300&q=80',
  villa: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=300&q=80',
  penthouse: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=80',
  mansion: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'
};

// 2. Kulüp Renklerine Göre Vektörel SVG Kulüp Kalkanı / Arması Üretici
function renderClubCrestSVG(colorsStr = '🟡🔵', shortCode = 'FK', size = 24) {
  const colorMap = {
    '🟡': '#facc15', '🔵': '#1d4ed8', '🔴': '#dc2626', '⚫': '#18181b',
    '⚪': '#f8fafc', '🟢': '#16a34a', '🟠': '#f97316', '🟣': '#7e22ce',
    '🟤': '#78350f', '🩷': '#ec4899'
  };
  const chars = Array.from(colorsStr || '');
  const c1 = colorMap[chars[0]] || '#10b981';
  const c2 = colorMap[chars[1]] || '#0f172a';
  const textCol = (c1 === '#facc15' || c1 === '#f8fafc') && (c2 === '#facc15' || c2 === '#f8fafc') ? '#090d16' : '#ffffff';
  const uidShield = 'sh_' + shortCode.replace(/[^a-zA-Z0-9]/g, '') + '_' + size;

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 36 40" class="inline-block shrink-0 align-middle mr-1">
      <defs>
        <clipPath id="${uidShield}">
          <path d="M3 4 L18 1 L33 4 L33 19 C33 29 18 37 18 38 C18 37 3 29 3 19 Z" />
        </clipPath>
      </defs>
      <g clip-path="url(#${uidShield})">
        <rect x="0" y="0" width="18" height="40" fill="${c1}" />
        <rect x="18" y="0" width="18" height="40" fill="${c2}" />
        <rect x="13" y="0" width="10" height="40" fill="${c1}" fill-opacity="0.35" />
      </g>
      <path d="M3 4 L18 1 L33 4 L33 19 C33 29 18 37 18 38 C18 37 3 29 3 19 Z" fill="none" stroke="#e2e8f0" stroke-width="2" />
      <text x="18" y="22" text-anchor="middle" fill="${textCol}" font-size="9.5" font-weight="900" font-family="Plus Jakarta Sans, sans-serif" style="paint-order:stroke; stroke:#090d16; stroke-width:2.2px;">${shortCode.slice(0, 3)}</text>
    </svg>
  `;
}

// 3. 2D Görsel Taktik Çim Saha Dizilişi (11 Oyuncu Noktası)
function render2DTacticalPitchSVG(formation = '4-2-3-1 Hücum', teamOvr = 84) {
  const layouts = {
    '4-2-3-1 Hücum': [
      [50, 88, 'KL'], [18, 70, 'SLB'], [38, 73, 'STP'], [62, 73, 'STP'], [82, 70, 'SĞB'],
      [36, 54, 'MDO'], [64, 54, 'MDO'], [20, 34, 'SLK'], [50, 36, 'OOS'], [80, 34, 'SĞK'], [50, 16, 'SNT']
    ],
    '4-3-3 Gegenpress': [
      [50, 88, 'KL'], [18, 70, 'SLB'], [38, 73, 'STP'], [62, 73, 'STP'], [82, 70, 'SĞB'],
      [50, 56, 'MDO'], [32, 43, 'MO'], [68, 43, 'MO'], [20, 22, 'SLK'], [80, 22, 'SĞK'], [50, 15, 'SNT']
    ],
    '3-5-2 Kanat Organizasyonu': [
      [50, 88, 'KL'], [28, 73, 'STP'], [50, 75, 'STP'], [72, 73, 'STP'],
      [14, 48, 'SLK'], [36, 54, 'MO'], [64, 54, 'MO'], [86, 48, 'SĞK'], [50, 36, 'OOS'], [36, 17, 'SNT'], [64, 17, 'SNT']
    ],
    '4-1-4-1 Kontrollü Pas': [
      [50, 88, 'KL'], [18, 70, 'SLB'], [38, 73, 'STP'], [62, 73, 'STP'], [82, 70, 'SĞB'],
      [50, 58, 'MDO'], [18, 40, 'SLO'], [39, 41, 'MO'], [61, 41, 'MO'], [82, 40, 'SĞO'], [50, 17, 'SNT']
    ]
  };
  const nodes = layouts[formation] || layouts['4-2-3-1 Hücum'];

  const dotsSvg = nodes.map(([x, y, pos], idx) => `
    <g>
      <circle cx="${x * 2.4}" cy="${y * 1.4}" r="8.5" fill="${idx === 0 ? '#f59e0b' : '#10b981'}" stroke="#090d16" stroke-width="2" />
      <text x="${x * 2.4}" y="${y * 1.4 + 3}" text-anchor="middle" fill="#090d16" font-size="6.5" font-weight="900" font-family="JetBrains Mono">${pos}</text>
    </g>
  `).join('');

  return `
    <div class="tactical-pitch-card mb-2.5">
      <div class="flex items-center justify-between text-[10px] font-extrabold text-emerald-100 mb-1.5 px-1">
        <span>📋 2D SAHA DİZİLİŞİ: ${formation.toUpperCase()}</span>
        <span class="font-mono-num text-amber-300">TAKIM GÜCÜ: ${teamOvr} OVR</span>
      </div>
      <svg viewBox="0 0 240 140" class="w-full h-36 rounded-xl overflow-hidden">
        <!-- Saha Çizgileri -->
        <rect x="4" y="4" width="232" height="132" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" />
        <line x1="4" y1="70" x2="236" y2="70" stroke="rgba(255,255,255,0.3)" stroke-width="1.2" />
        <circle cx="120" cy="70" r="18" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.2" />
        <rect x="68" y="4" width="104" height="24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.2" />
        <rect x="68" y="112" width="104" height="24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.2" />
        ${dotsSvg}
      </svg>
    </div>
  `;
}

// 4. Futbolcu 5'li Beşgen Radar (Örümcek Ağı) Grafiği
function renderPlayerPentagonRadarSVG(p) {
  const vals = [p.pace || 65, p.shooting || 65, p.passing || 65, p.dribbling || 65, p.physical || 65];
  const labels = ['HIZ', 'ŞUT', 'PAS', 'TEK', 'FİZ'];
  const cx = 65, cy = 62, maxR = 42;

  const getPt = (idx, ratio) => {
    const angle = (-Math.PI / 2) + (idx * 2 * Math.PI / 5);
    return [
      (cx + Math.cos(angle) * maxR * ratio).toFixed(1),
      (cy + Math.sin(angle) * maxR * ratio).toFixed(1)
    ];
  };

  const outerPoly = [0, 1, 2, 3, 4].map(i => getPt(i, 1.0).join(',')).join(' ');
  const midPoly = [0, 1, 2, 3, 4].map(i => getPt(i, 0.65).join(',')).join(' ');
  const valPoly = vals.map((v, i) => getPt(i, clamp(v, 30, 99) / 100).join(',')).join(' ');

  const axisLines = [0, 1, 2, 3, 4].map(i => {
    const [x, y] = getPt(i, 1.0);
    const [lx, ly] = getPt(i, 1.24);
    return `
      <line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(148,163,184,0.22)" stroke-width="1" />
      <text x="${lx}" y="${Number(ly) + 3}" text-anchor="middle" fill="#facc15" font-size="7.5" font-weight="800" font-family="JetBrains Mono">${labels[i]}</text>
    `;
  }).join('');

  return `
    <svg viewBox="0 0 130 122" class="w-28 h-24 shrink-0">
      <polygon points="${outerPoly}" fill="rgba(15,23,42,0.75)" stroke="rgba(148,163,184,0.3)" stroke-width="1" />
      <polygon points="${midPoly}" fill="none" stroke="rgba(148,163,184,0.18)" stroke-dasharray="2 2" stroke-width="1" />
      ${axisLines}
      <polygon points="${valPoly}" fill="rgba(250, 204, 21, 0.32)" stroke="#facc15" stroke-width="2" />
    </svg>
  `;
}

// 5. Dairesel Araç Kondisyon Halkası (Radial Progress Ring)
function renderRadialConditionRingSVG(cond = 100) {
  const c = clamp(cond, 0, 100);
  const clr = c >= 80 ? '#10b981' : (c >= 55 ? '#f59e0b' : '#f43f5e');
  const offset = (100 - c).toFixed(1);
  return `
    <svg viewBox="0 0 40 40" class="w-10 h-10 shrink-0">
      <circle cx="20" cy="20" r="15.9" fill="none" stroke="#1e293b" stroke-width="4" />
      <circle cx="20" cy="20" r="15.9" fill="none" stroke="${clr}" stroke-width="4" stroke-dasharray="100" stroke-dashoffset="${offset}" stroke-linecap="round" transform="rotate(-90 20 20)" />
      <text x="20" y="23" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="800" font-family="JetBrains Mono">%${c}</text>
    </svg>
  `;
}

// 6. Tüm Görsel Paketleri Mevcut Sisteme Bağlayan Ana Kanca
(function attachHDGraphicsPack() {
  if (window._hdGraphicsPackLoaded) return;
  window._hdGraphicsPackLoaded = true;

  let _prevStatsSnap = null;

  // A) Üst Bar Servet Sparkline Çizgisi ve Alt Bar LED Delta Rozetleri
  const _baseRenderAll = renderAll;
  renderAll = function () {
    if (G) {
      if (!Array.isArray(G.netWorthHistory)) G.netWorthHistory = [0, 0, 0, 0, 0];
      const curNw = getNetWorth();
      if (G.netWorthHistory[G.netWorthHistory.length - 1] !== curNw) {
        G.netWorthHistory.push(curNw);
        if (G.netWorthHistory.length > 8) G.netWorthHistory.shift();
      }
    }

    _baseRenderAll();
    if (!G) return;

    // 1. Üst Bakiye Yanına Mini Sparkline Ekle
    const balEl = document.getElementById('charBalance');
    if (balEl && G.netWorthHistory && G.netWorthHistory.length >= 2) {
      const hist = G.netWorthHistory;
      const minV = Math.min(...hist), maxV = Math.max(...hist);
      const rng = Math.max(1, maxV - minV);
      const pts = hist.map((v, i) => {
        const x = (i / (hist.length - 1)) * 42 + 2;
        const y = 14 - ((v - minV) / rng) * 11;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');
      const isUp = hist[hist.length - 1] >= hist[0];
      const spkColor = isUp ? '#34d399' : '#fb7185';
      const sparkSvg = `<svg viewBox="0 0 46 16" class="inline-block w-11 h-4 ml-1 align-middle"><polyline fill="none" stroke="${spkColor}" stroke-width="1.8" stroke-linecap="round" points="${pts}"/></svg>`;
      balEl.innerHTML = `${fmtMoney(G.money)} ${sparkSvg}`;
    }

    // 2. Alt 6'lı İstatistik Barlarına Anlık Değişim (+ / -) Rozeti Ekle
    const statKeys = [
      ['Health', G.health], ['Happy', G.happy], ['Smart', G.smart],
      ['Looks', G.looks], ['Fame', G.fame], ['Stress', G.stress]
    ];
    if (_prevStatsSnap) {
      statKeys.forEach(([k, val]) => {
        const diff = Math.round(val - (_prevStatsSnap[k] ?? val));
        const el = document.getElementById(`stat${k}Val`);
        if (el && diff !== 0) {
          const isGood = k === 'Stress' ? diff < 0 : diff > 0;
          const badgeCls = isGood ? 'bg-emerald-500/25 text-emerald-300' : 'bg-rose-500/25 text-rose-300';
          el.innerHTML = `${clamp(val)}<span class="stat-delta-pill ${badgeCls}">${diff > 0 ? '+' + diff : diff}</span>`;
        }
      });
    }
    _prevStatsSnap = { Health: G.health, Happy: G.happy, Smart: G.smart, Looks: G.looks, Fame: G.fame, Stress: G.stress };
  };

  // B) Günlük Akışı İçin Mikro-Widget Kartları (Skorbord & Neon Finans Rozetleri)
  const _baseRenderLogs = renderLogs;
  renderLogs = function () {
    _baseRenderLogs();
    const container = document.getElementById('logContainer');
    if (!container || !G) return;

    // 1. Para Tutarlarını (+120.000 ₺ / -45.000 ₺) Neon Rozete Dönüştür
    container.querySelectorAll('.timeline-age-block .text-xs').forEach(node => {
      let html = node.innerHTML;
      html = html.replace(/(\+[0-9.,]+\s*(?:₺|\$|€|£|﷼|د\.إ|kr|¥|₩|₽|R\$|₦))/g, '<span class="log-money-pill-pos">$1</span>');
      html = html.replace(/(-\s*[0-9.,]+\s*(?:₺|\$|€|£|﷼|د\.إ|kr|¥|₩|₽|R\$|₦))/g, '<span class="log-money-pill-neg">$1</span>');

      // 2. Hafta Maç Sonuçlarını Mini Skorbord Widget'ına Dönüştür
      const matchRegex = /Hafta\s+(\d+)\s+\((.*?)\):<\/strong>\s+(.*?)\s+<strong[^>]*>(\d+\s*-\s*\d+)<\/strong>\s+([^•]+)/i;
      const m = html.match(matchRegex);
      if (m) {
        const [, wk, resText, homeTeam, scoreStr, awayTeam] = m;
        html += `
          <div class="mini-match-widget flex items-center justify-between text-[10px]">
            <span class="font-extrabold text-white truncate max-w-[105px]">${homeTeam.trim()}</span>
            <span class="px-2.5 py-0.5 rounded-lg bg-orange-500 text-slate-950 font-mono-num font-black">${scoreStr}</span>
            <span class="font-extrabold text-white truncate max-w-[105px] text-right">${awayTeam.trim()}</span>
          </div>
        `;
      }
      node.innerHTML = html;
    });
  };

  // C) Galeri, Emlak, Kulüp Başkanlığı ve Futbolcu Sekmelerine Görsel Vitrin & SVG Grafik Enjeksiyonu
  const _baseOpenMenuSec = openMenuSection;
  openMenuSection = function (sec) {
    _baseOpenMenuSec(sec);
    const body = document.getElementById('sheetBody');
    if (!body || !G) return;

    // 1. Galeri Sekmesine Araç Fotoğrafları ve Kondisyon Halkası Ekle
    if (sec === 'cars') {
      if (activeGarageTab === 'dealer') {
        const cards = body.querySelectorAll('.p-3.rounded-2xl.bg-slate-900');
        cards.forEach((card, i) => {
          const car = CARS[i];
          if (!car) return;
          const imgUrl = CAR_THUMBNAILS_DB[car.id] || CAR_THUMBNAILS_DB.egea;
          const row = card.querySelector('.flex.items-center.justify-between');
          if (row && !card.querySelector('.showcase-thumb-wrap')) {
            row.insertAdjacentHTML('afterbegin', `
              <div class="showcase-thumb-wrap">
                <img src="${imgUrl}" alt="${car.name}" class="showcase-thumb-img" />
              </div>
            `);
          }
        });
      } else if (activeGarageTab === 'mycars' && G.cars.length > 0) {
        const myCards = body.querySelectorAll('.p-3\\.5.rounded-2xl.bg-slate-900');
        myCards.forEach((card, i) => {
          const car = G.cars[i];
          if (!car) return;
          const imgUrl = CAR_THUMBNAILS_DB[car.carId] || CAR_THUMBNAILS_DB.egea;
          const topRow = card.querySelector('.flex.items-center.justify-between');
          if (topRow && !card.querySelector('.showcase-thumb-wrap')) {
            topRow.insertAdjacentHTML('afterbegin', `
              <div class="flex items-center gap-2.5">
                <div class="showcase-thumb-wrap">
                  <img src="${imgUrl}" alt="${car.name}" class="showcase-thumb-img" />
                </div>
                ${renderRadialConditionRingSVG(car.cond)}
              </div>
            `);
          }
        });
      }
    }

    // 2. Emlak Sekmesine Mülk Fotoğrafları Ekle
    if (sec === 'houses') {
      const dealerCards = body.querySelectorAll('.p-3.rounded-2xl.bg-slate-900');
      dealerCards.forEach((card, i) => {
        const h = HOUSES[i];
        if (!h) return;
        const imgUrl = HOUSE_THUMBNAILS_DB[h.id] || HOUSE_THUMBNAILS_DB.apt31;
        if (!card.querySelector('.showcase-thumb-wrap')) {
          card.insertAdjacentHTML('afterbegin', `
            <div class="showcase-thumb-wrap mr-2">
              <img src="${imgUrl}" alt="${h.name}" class="showcase-thumb-img" />
            </div>
          `);
        }
      });
    }

    // 3. Kulüp Başkanlığına SVG Kulüp Armaları ve 2D Taktik Çim Saha Ekle
    if (sec === 'club_presidency' && G.club && G.club.active) {
      if (activeClubSubTab === 'squad') {
        const pitchHtml = render2DTacticalPitchSVG(G.club.tactic, G.club.power);
        body.insertAdjacentHTML('afterbegin', pitchHtml);
      }
      // Puan durumundaki kulüp satırlarına vektörel SVG kalkan arması ekle
      body.querySelectorAll('.standings-table tbody tr').forEach((tr, idx) => {
        const rowData = G.club.standings[idx];
        const nameCell = tr.children[1];
        if (rowData && nameCell) {
          nameCell.innerHTML = `${renderClubCrestSVG(rowData.colors, rowData.short, 18)} <span>${rowData.name}</span>`;
        }
      });
    }

    // 4. Futbolcu Kariyerine 5'li Beşgen Radar Grafiği ve 2D Saha Ekle
    if (sec === 'pro_footballer' && G.proPlayer && G.proPlayer.active) {
      const futCard = body.querySelector('.fut-player-card');
      if (futCard && !futCard.querySelector('svg')) {
        const topFlex = futCard.querySelector('.flex.items-start.justify-between');
        if (topFlex) {
          topFlex.insertAdjacentHTML('beforeend', renderPlayerPentagonRadarSVG(G.proPlayer));
        }
      }
      if (activeProPlayerTab === 'overview') {
        body.insertAdjacentHTML('beforeend', render2DTacticalPitchSVG('4-2-3-1 Hücum', G.proPlayer.ovr));
      }
    }
  };

  // D) Olay Pencerelerine (eventModal) Sinematik Görsel Başlık ve Risk/Ödül Etiketleri Ekle
  const _baseOpenEventModal = openEventModal;
  openEventModal = function (ev) {
    _baseOpenEventModal(ev);
    const modalCard = document.querySelector('#eventModal > div');
    if (!modalCard) return;

    const oldBanner = modalCard.querySelector('.modal-atmo-banner');
    if (oldBanner) oldBanner.remove();

    const textSample = ((ev.badge || '') + ' ' + (ev.title || '')).toLowerCase();
    let bannerImg = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80';
    if (/futbol|maç|derbi|turnuva|scout|altyapı|ballon|stadyum|kongre/i.test(textSample)) {
      bannerImg = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=700&q=80';
    } else if (/mahkeme|ceza|polis|masak|suç|تebligat|savcı/i.test(textSample)) {
      bannerImg = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=700&q=80';
    } else if (/sınav|yks|okul|lise|üniversite|karne/i.test(textSample)) {
      bannerImg = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=700&q=80';
    } else if (/ihale|gümrük|شirket|fatura|vergi|kredi|miras/i.test(textSample)) {
      bannerImg = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=700&q=80';
    } else if (/evlilik|düğün|eş|çocuk|aile/i.test(textSample)) {
      bannerImg = 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=700&q=80';
    }

    modalCard.insertAdjacentHTML('afterbegin', `
      <div class="modal-atmo-banner" style="background-image:url('${bannerImg}')">
        <div class="modal-atmo-overlay">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-sm">${ev.badge || 'Yaşam Olayı'}</span>
          <span class="text-[10px] font-mono-num font-bold text-slate-300">YAŞ ${G ? G.age : 0}</span>
        </div>
      </div>
    `);

    // Seçenek butonlarındaki parantez içi bilgi veya oranları sağ tarafa şık rozet olarak ayır
    const choiceBtns = document.querySelectorAll('#eventChoices button');
    choiceBtns.forEach(btn => {
      const rawTxt = btn.textContent || '';
      const parenMatch = rawTxt.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
      if (parenMatch) {
        const mainText = parenMatch[1].trim();
        const tagText = parenMatch[2].trim();
        btn.className = 'w-full p-3.5 rounded-2xl bg-slate-800/90 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/50 flex items-center justify-between gap-2 text-left text-xs font-extrabold text-white transition active:scale-[0.98]';
        btn.innerHTML = `<span>${mainText}</span><span class="px-2 py-0.5 rounded-lg bg-slate-950/90 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono-num shrink-0">${tagText}</span>`;
      }
    });
  };
})();

/* ============================================================================
   TEK MERKEZLİ FUTBOL BİRLEŞTİRME YAMASI (UNIFIED FOOTBALL & SPORTS HUB)
   ============================================================================ */

let unifiedSportsMainTab = 'player'; // 'player' | 'president' | 'other_sports'

(function unifyAllFootballSystems() {
  // 1. Eski basit "Profesyonel Futbolcu" branşını listeden kaldır (Çift görünmeyi önler)
  if (typeof SPORTS_BRANCHES !== 'undefined' && Array.isArray(SPORTS_BRANCHES)) {
    const oldFbIdx = SPORTS_BRANCHES.findIndex(b => b.id === 'football');
    if (oldFbIdx !== -1) SPORTS_BRANCHES.splice(oldFbIdx, 1);
  }

  // 2. Eski G.sports.branchId === 'football' kayıtlarını yeni G.proPlayer sistemine aktar
  function syncLegacyFootballState() {
    if (!G) return;
    if (typeof upgradeProPlayerState === 'function') upgradeProPlayerState();
    if (G.sports && G.sports.branchId === 'football') {
      G.proPlayer.active = true;
      if (!G.proPlayer.stage || G.proPlayer.stage === 'none') {
        G.proPlayer.stage = G.sports.tierIndex === 0 ? 'u19_academy' : 'pro_star';
      }
      G.sports.branchId = null; // Eski sistemin çift maaş/etiket vermesini kapat
    }
  }

  // 3. Futbolcu Aylık Maaşını / Altyapı Bursunu Doğrudan Ana Ekonomi & Bordro Motoruna Bağla
  function getUnifiedFootballerMonthlyPay() {
    if (!G || !G.proPlayer || !G.proPlayer.active) return 0;
    const c = getCountry();
    const p = G.proPlayer;
    recalcProPlayerOvr();
    if (p.stage === 'u19_academy') {
      const ac = YOUTH_ACADEMIES_DB.find(x => x.id === p.academyId);
      return Math.round(c.monthlyMinWage * (ac ? ac.stipendMult : 0.45));
    }
    if (p.stage === 'pro_reserve') {
      return Math.round(c.monthlyMinWage * (p.onLoan ? 2.4 : 3.2) * (p.ovr / 70));
    }
    if (p.stage === 'pro_star') {
      return Math.round(c.monthlyMinWage * (p.tier >= 2 ? 32.0 : 11.5) * (p.ovr / 72));
    }
    return 0; // Okul takımı / sokak aşamasında amatör lisans
  }

  const _origCalcFinances = calculateFinances;
  calculateFinances = function () {
    syncLegacyFootballState();
    const fin = _origCalcFinances();
    if (!G || G.inPrison) return fin;

    const fbPay = getUnifiedFootballerMonthlyPay();
    if (fbPay > 0) {
      const sgk = Math.round(fbPay * 0.14);
      const tax = Math.round(fbPay * getEffectiveTaxRate());
      const netFb = Math.max(0, fbPay - sgk - tax);

      fin.monthlyGrossSalary += fbPay;
      fin.sgkCut += sgk;
      fin.incomeTaxCut += tax;
      fin.monthlyTax += (sgk + tax);
      fin.monthlyNetSalary += netFb;
      fin.monthlyNetCashflow += netFb;
      fin.annualNetCashflow = fin.monthlyNetCashflow * 12;
    }
    return fin;
  };

  // 4. Üst Profil Barında (charRoleText) Futbolcu veya Başkan Unvanını Net Göster
  const _origRenderAll = renderAll;
  renderAll = function () {
    syncLegacyFootballState();
    _origRenderAll();
    if (!G || G.inPrison) return;

    const roleEl = document.getElementById('charRoleText');
    if (!roleEl) return;

    if (G.club && G.club.active && G.proPlayer && G.proPlayer.active) {
      roleEl.textContent = `⚽ ${G.proPlayer.clubName} (${G.proPlayer.ovr} OVR) & 🏟️ ${G.club.teamName} Başkanı • ${G.age} Yaş`;
    } else if (G.proPlayer && G.proPlayer.active) {
      roleEl.textContent = `⚽ ${G.proPlayer.clubName} (${G.proPlayer.ovr} OVR) • ${G.age} Yaş`;
    } else if (G.club && G.club.active) {
      roleEl.textContent = `🏟️ ${G.club.teamName} Başkanı • ${G.age} Yaş`;
    }
  };

  // 5. E-Bordro Başlığında Futbolcu Kontratını Göster
  const _origPayrollHTML = renderPayrollSlipHTML;
  renderPayrollSlipHTML = function () {
    syncLegacyFootballState();
    const html = _origPayrollHTML();
    if (G && G.proPlayer && G.proPlayer.active && getUnifiedFootballerMonthlyPay() > 0) {
      return html.replace('Kurumsal Personel', `⚽ Profesyonel Futbolcu (${G.proPlayer.clubName})`);
    }
    return html;
  };

  // 6. TEK MERKEZLİ FUTBOL VE SPOR EKRANI OLUŞTURUCU
  window.renderUnifiedFootballHub = function () {
    syncLegacyFootballState();
    const c = getCountry();
    const p = G.proPlayer;
    const cl = G.club;

    const topSwitcher = `
      <div class="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-3">
        <button onclick="unifiedSportsMainTab='player'; openMenuSection('sports')" class="py-2.5 rounded-xl text-[11px] font-extrabold transition ${unifiedSportsMainTab === 'player' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400'}">
          ⚽ Futbolcu ${p.active ? `(${p.ovr})` : ''}
        </button>
        <button onclick="unifiedSportsMainTab='president'; openMenuSection('sports')" class="py-2.5 rounded-xl text-[11px] font-extrabold transition ${unifiedSportsMainTab === 'president' ? 'bg-orange-500 text-slate-950 shadow' : 'text-slate-400'}">
          🏟️ Başkanlık ${cl.active ? '✓' : ''}
        </button>
        <button onclick="unifiedSportsMainTab='other_sports'; openMenuSection('sports')" class="py-2.5 rounded-xl text-[11px] font-extrabold transition ${unifiedSportsMainTab === 'other_sports' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'}">
          🏀 Basket / E-Spor
        </button>
      </div>
    `;

    // SEKME A: FUTBOLCU KARİYERİ (OKUL -> ALTYAPI -> U19 -> A TAKIM -> BALLON D'OR)
    if (unifiedSportsMainTab === 'player') {
      let playerHtml = renderProFootballerCareerView();

      // Aktif futbolcuysa Beşgen Radar Grafiği, 2D Saha ve Jübile butonunu ekle
      if (p.active && p.stage !== 'none') {
        const retireBtn = `
          <div class="pt-2">
            <button onclick="retireFromProFootball()" class="w-full py-2.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-bold">
              👟 Aktif Futbolculuk Kariyerini Noktala (Jübile Yap)
            </button>
          </div>
        `;
        if (activeProPlayerTab === 'overview' && typeof render2DTacticalPitchSVG === 'function') {
          playerHtml += render2DTacticalPitchSVG('4-2-3-1 Hücum', p.ovr) + retireBtn;
        } else {
          playerHtml += retireBtn;
        }
      }
      return renderHeroBannerHTML('sports') + topSwitcher + playerHtml;
    }

    // SEKME B: FUTBOL KULÜBÜ BAŞKANLIĞI & FİKSTÜR PANOSU
    if (unifiedSportsMainTab === 'president') {
      let clubHtml = renderClubPresidencyView();
      if (cl.active && activeClubSubTab === 'squad' && typeof render2DTacticalPitchSVG === 'function') {
        clubHtml = render2DTacticalPitchSVG(cl.tactic, cl.power) + clubHtml;
      }
      return renderHeroBannerHTML('sports') + topSwitcher + clubHtml;
    }

    // SEKME C: DİĞER SPOR BRANŞLARI (BASKETBOL & E-SPOR)
    const curBranch = SPORTS_BRANCHES.find(b => b.id === G.sports.branchId);
    return renderHeroBannerHTML('sports') + topSwitcher + `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-2 mb-2.5">
        <div class="flex justify-between"><span class="text-xs font-extrabold text-white">${curBranch ? `${curBranch.icon} ${curBranch.name} (${curBranch.tiers[G.sports.tierIndex]})` : 'Basketbol / E-Spor Sözleşmesi Yok'}</span><span class="text-xs font-bold text-emerald-400">Yetenek: %${G.sports.skill}</span></div>
        <div class="grid grid-cols-2 gap-2">
          <button onclick="trainSportsSkill()" class="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">🏋️ Antrenman Yap</button>
          <button onclick="requestTransferOffer()" class="p-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold">✈️ Üst Lige Transfer</button>
        </div>
      </div>
      <div class="space-y-2">
        ${SPORTS_BRANCHES.map(br => {
          const act = G.sports.branchId === br.id;
          return `<div class="p-3 rounded-2xl bg-slate-900 border ${act ? 'border-emerald-500' : 'border-slate-800'} flex items-center justify-between gap-2"><div><div class="text-xs font-extrabold text-white">${br.icon} ${br.name}</div><div class="text-[10px] text-slate-400">${br.tiers.join(' &rarr; ')}</div><div class="text-[10px] text-emerald-400">Zirve Kontrat: ${fmtMoney(c.monthlyMinWage * br.mults[2])}/ay</div></div><button onclick="joinSportsBranch('${br.id}')" class="px-3 py-2 rounded-xl text-xs font-extrabold ${act ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-500 text-slate-950'}">${act ? 'Sözleşmeli' : 'Seçmeye Gir'}</button></div>`;
        }).join('')}
      </div>
    `;
  };

  window.retireFromProFootball = function () {
    if (!G || !G.proPlayer || !G.proPlayer.active) return;
    const oldClub = G.proPlayer.clubName;
    G.proPlayer.active = false;
    G.proPlayer.stage = 'none';
    playSfx('trophy');
    addLog(G.age, `👟 **JÜBİLE!** **${oldClub}** formasıyla çıktığın son maçta taraftarların alkışları arasında futbolculuk kariyerini noktaladın. Artık **Kulüp Başkanlığına** odaklanabilirsin!`, 'milestone');
    unifiedSportsMainTab = 'president';
    saveGame(); renderAll(); openMenuSection('sports');
  };

  // 7. Tüm Futbol Çağrılarını ('sports', 'pro_footballer', 'club_presidency') Tek Merkeze Yönlendir
  const _prevOpenMenuSec = openMenuSection;
  openMenuSection = function (sec) {
    syncLegacyFootballState();
    if (sec === 'pro_footballer' || sec === 'club_presidency' || sec === 'sports') {
      if (sec === 'pro_footballer') unifiedSportsMainTab = 'player';
      if (sec === 'club_presidency') unifiedSportsMainTab = 'president';

      const sheet = document.getElementById('bottomSheet');
      const body = document.getElementById('sheetBody');
      sheet.classList.remove('hidden');

      document.getElementById('sheetTitle').textContent = '⚽ Futbol & Spor Merkezi';
      const p = G.proPlayer;
      const cl = G.club;
      document.getElementById('sheetSubtitle').textContent = p.active
        ? `Futbolcu: ${p.clubName} (${p.ovr} OVR)`
        : (cl.active ? `Başkan: ${cl.teamName} (Hafta ${cl.week}/22)` : 'Futbolcu Kariyeri, Kulüp Başkanlığı & E-Spor');

      body.innerHTML = renderUnifiedFootballHub();

      // FUT Kartına Beşgen Radar SVG ve Puan Tablosuna Kulüp Arması SVG Ekle
      if (unifiedSportsMainTab === 'player' && p.active && typeof renderPlayerPentagonRadarSVG === 'function') {
        const futCard = body.querySelector('.fut-player-card .flex.items-start.justify-between');
        if (futCard && !futCard.querySelector('svg')) {
          futCard.insertAdjacentHTML('beforeend', renderPlayerPentagonRadarSVG(p));
        }
      }
      if (unifiedSportsMainTab === 'president' && cl.active && typeof renderClubCrestSVG === 'function') {
        body.querySelectorAll('.standings-table tbody tr').forEach((tr, idx) => {
          const rowData = cl.standings[idx];
          const nameCell = tr.children[1];
          if (rowData && nameCell) {
            nameCell.innerHTML = `${renderClubCrestSVG(rowData.colors, rowData.short, 18)} <span>${rowData.name}</span>`;
          }
        });
      }
      return;
    }
    _prevOpenMenuSec(sec);
  };

  // 8. Menüdeki Çift Futbol Butonlarını Temizle ve Tek "Futbol & Spor Merkezi" Yap
  const _prevOpenNav = openNavSheet;
  openNavSheet = function (tab) {
    syncLegacyFootballState();
    _prevOpenNav(tab);
    if (tab === 'menu') {
      const duplicateHero = document.getElementById('clubMenuHeroBtn');
      if (duplicateHero) duplicateHero.remove();
    }
  };
})();

/* ============================================================================
   5'İ 1 ARADA SİSTEM BİRLEŞTİRME VE SİNERJİ PAKETİ (INTEGRATION PATCH)
   ============================================================================ */

let edevletHubTab = 'id_lic';     // 'id_lic' | 'passport' | 'portrait'
let activeJobFilter = 'suitable'; // 'suitable' | 'diploma' | 'license' | 'general'

(function attachFiveInOneIntegrationPack() {
  if (window._fiveInOneConsolidationLoaded) return;
  window._fiveInOneConsolidationLoaded = true;

  const COMMERCIAL_CAR_IDS = ['scooter', 'doblo', 'transporter', 'volvo_fh16', 'scania_s730'];

  function ensureIntegrationState() {
    if (!G) return;
    if (typeof upgradeProPlayerState === 'function') upgradeProPlayerState();
    if (typeof G.proPlayer.isLegend !== 'boolean') G.proPlayer.isLegend = false;
    if (typeof G.proPlayer.isSportingDirector !== 'boolean') G.proPlayer.isSportingDirector = false;
    if (G.proPlayer.ovr >= 78 || G.proPlayer.goals >= 35 || G.proPlayer.caps >= 15 || G.proPlayer.ballonDors >= 1) {
      G.proPlayer.isLegend = true;
    }
  }

  // ---------------------------------------------------------------------------
  // 1. E-DEVLET, KİMLİK, EHLİYET, ADLİ SİCİL VE KONSOLOSLUK/GÖÇ TEK MERKEZİ
  // ---------------------------------------------------------------------------
  window.renderUnifiedEdevletHub = function () {
    ensureIntegrationState();
    const c = getCountry();
    const costB = Math.round(c.monthlyMinWage * 0.7);
    const costCE = Math.round(c.monthlyMinWage * 1.6);
    const expungeCost = Math.round(c.monthlyMinWage * 4.5);

    const tabsHtml = `
      <div class="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-3">
        <button onclick="edevletHubTab='id_lic'; openMenuSection('license')" class="py-2 rounded-xl text-[11px] font-extrabold transition ${edevletHubTab === 'id_lic' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400'}">
          🪪 Kimlik &amp; Sicil
        </button>
        <button onclick="edevletHubTab='passport'; openMenuSection('license')" class="py-2 rounded-xl text-[11px] font-extrabold transition ${edevletHubTab === 'passport' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'}">
          🛂 Pasaport &amp; Göç
        </button>
        <button onclick="edevletHubTab='portrait'; openMenuSection('license')" class="py-2 rounded-xl text-[11px] font-extrabold transition ${edevletHubTab === 'portrait' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400'}">
          📸 Biyometrik Foto
        </button>
      </div>
    `;

    if (edevletHubTab === 'id_lic') {
      return renderHeroBannerHTML('license') + tabsHtml + renderOfficialIdentityAndDocumentsHTML() + `
        <div class="space-y-2">
          <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-xs font-extrabold text-white">🚗 B Sınıfı Sürücü Belgesi</div>
              <div class="text-[10px] text-slate-400">Otomobil, Kurye &amp; Hafif Ticari</div>
            </div>
            <button onclick="takeDrivingLicense('B', ${costB})" class="px-3 py-2 rounded-xl text-xs font-extrabold ${G.licenses.B ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-500 text-slate-950'}">
              ${G.licenses.B ? 'Alındı ✓' : fmtMoney(costB)}
            </button>
          </div>

          <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-xs font-extrabold text-white">🚛 CE Sınıfı Ağır Vasıta (Tır/Otobüs) Ehliyeti</div>
              <div class="text-[10px] text-slate-400">Uluslararası Tır, Vinç &amp; Otobüs Kaptanlığı</div>
            </div>
            <button onclick="takeDrivingLicense('CE', ${costCE})" class="px-3 py-2 rounded-xl text-xs font-extrabold ${G.licenses.CE ? 'bg-slate-800 text-emerald-400' : 'bg-amber-400 text-slate-950'}">
              ${G.licenses.CE ? 'Alındı ✓' : fmtMoney(costCE)}
            </button>
          </div>

          <div class="p-3 rounded-2xl bg-slate-900 border ${G.criminalRecord ? 'border-rose-500/40' : 'border-slate-800'} flex items-center justify-between">
            <div>
              <div class="text-xs font-extrabold text-white">⚖️ Adli Sicil &amp; Arşiv Kaydı Sildirme</div>
              <div class="text-[10px] text-slate-400">Memuriyet, pilotaj ve başkanlık engelini kaldırır</div>
            </div>
            ${G.criminalRecord
              ? `<button onclick="clearCriminalRecord(${expungeCost})" class="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold">Sildir (${fmtMoney(expungeCost)})</button>`
              : `<span class="text-xs font-bold text-emerald-400">Sicil Temiz ✓</span>`}
          </div>
        </div>
      `;
    }

    if (edevletHubTab === 'passport') {
      const moveCost = Math.round(c.monthlyMinWage * 4);
      return renderHeroBannerHTML('license') + tabsHtml + renderPassportVisaStampsHTML() + `
        <div class="space-y-2">
          <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">✈️ Konsolosluk Vize Başvurusu &amp; Ülke Göçü</h4>
          ${COUNTRIES.filter(x => x.id !== G.countryId).map(target => `
            <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
              <div>
                <div class="text-xs font-extrabold text-white">${target.flag} ${target.name} (${target.currency} ${target.code})</div>
                <div class="text-[10px] text-slate-400">Asgari: ${target.monthlyMinWage.toLocaleString('tr-TR')} ${target.currency} &bull; Vergi: %${Math.round(target.taxRate * 100)} &bull; Enf: %${Math.round(target.inflation * 100)}</div>
              </div>
              <button onclick="migrateToCountry('${target.id}', ${moveCost})" class="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-[10px] font-extrabold shrink-0">
                Vize Al (${fmtMoney(moveCost)})
              </button>
            </div>
          `).join('')}
        </div>
      `;
    }

    return renderHeroBannerHTML('license') + tabsHtml + `
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-3 text-center">
        <img src="${getCurrentPortrait()}" class="w-24 h-28 rounded-2xl object-cover border-2 border-sky-400 shadow-lg" />
        <div>
          <div class="text-xs font-extrabold text-white">${G.firstName} ${G.lastName}</div>
          <div class="text-[10px] text-slate-400">Kimlik ve pasaport üzerindeki biyometrik fotoğrafını yenile</div>
        </div>
        <button onclick="G.portraitIdx = (G.portraitIdx + 1) % 3; saveGame(); renderAll(); openMenuSection('license');" class="w-full py-2.5 rounded-xl bg-sky-500 text-slate-950 text-xs font-extrabold">
          🔄 Yeni Biyometrik Fotoğraf Çektir
        </button>
      </div>
    `;
  };

  // ---------------------------------------------------------------------------
  // 2. AKILLI FİLTRELİ İŞ İLANLARI MOTORU (BANA UYGUN / DİPLOMA / EHLİYET / GENEL)
  // ---------------------------------------------------------------------------
  function isJobQualified(j) {
    if (j.cleanRecord && G.criminalRecord) return false;
    if (j.reqEdu === 'highschool' && !G.highSchoolGrad) return false;
    if (j.reqEdu === 'uni' && (!G.uniGrad || G.graduatedMajor !== j.major)) return false;
    if (j.reqLicense && !G.licenses[j.reqLicense]) return false;
    if (j.minExp && (G.jobExp || 0) < j.minExp) return false;
    return true;
  }

  window.setJobBoardFilter = function (flt) {
    activeJobFilter = flt;
    openNavSheet('career');
  };

  function buildFilteredJobBoardHTML() {
    const suitCount = JOBS.filter(j => isJobQualified(j)).length;
    const dipCount = JOBS.filter(j => j.reqEdu === 'uni').length;
    const licCount = JOBS.filter(j => j.reqLicense || j.major === 'lojistik' || j.major === 'denizcilik' || j.major === 'havacilik').length;

    const filteredJobs = JOBS.filter(j => {
      if (activeJobFilter === 'suitable') return isJobQualified(j) || G.jobId === j.id;
      if (activeJobFilter === 'diploma') return j.reqEdu === 'uni';
      if (activeJobFilter === 'license') return Boolean(j.reqLicense || j.major === 'lojistik' || j.major === 'denizcilik' || j.major === 'havacilik');
      if (activeJobFilter === 'general') return j.reqEdu === 'none' || j.reqEdu === 'highschool';
      return true;
    });

    return `
      <div class="space-y-2" id="filteredJobBoardSection">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">💼 Filtreli Kurumsal İş İlanları</h4>
          ${G.jobId ? `<button onclick="quitJob()" class="text-[11px] font-bold text-rose-400">İstifa Et</button>` : ''}
        </div>

        <!-- 4'lü Filtre Sekmesi -->
        <div class="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-[10px] font-extrabold">
          <button onclick="setJobBoardFilter('suitable')" class="py-2 rounded-xl ${activeJobFilter === 'suitable' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}">🎯 Uygun (${suitCount})</button>
          <button onclick="setJobBoardFilter('diploma')" class="py-2 rounded-xl ${activeJobFilter === 'diploma' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}">🎓 Fakülte (${dipCount})</button>
          <button onclick="setJobBoardFilter('license')" class="py-2 rounded-xl ${activeJobFilter === 'license' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}">🚛 Lojistik (${licCount})</button>
          <button onclick="setJobBoardFilter('general')" class="py-2 rounded-xl ${activeJobFilter === 'general' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}">☕ Genel</button>
        </div>

        ${filteredJobs.length === 0 ? `
          <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
            Şu an bu filtrede şartlarını karşıladığın bir ilan yok. Diğer sekmelere göz atabilirsin.
          </div>
        ` : filteredJobs.map(j => {
          const monthlyGross = getJobMonthlyGross(j);
          const isCurrent = G.jobId === j.id;
          const qualified = isJobQualified(j);
          let reqText = 'Diploma Şartı Yok';
          if (j.reqEdu === 'highschool') reqText = 'Lise Mezunu';
          if (j.reqEdu === 'uni') {
            const m = UNI_MAJORS.find(x => x.id === j.major);
            reqText = `${m ? m.name : 'Üniversite'} Mezunu`;
          }
          if (j.reqLicense) reqText += ` • ${j.reqLicense} Ehliyet`;
          if (j.minExp) reqText += ` • ${j.minExp} Yıl Deneyim`;
          const blocked = j.cleanRecord && G.criminalRecord;

          return `
            <div class="p-3 rounded-2xl bg-slate-900 border ${isCurrent ? 'border-emerald-500' : (qualified ? 'border-slate-700' : 'border-slate-800/70 opacity-75')} flex items-center justify-between gap-2">
              <div class="min-w-0">
                <div class="text-xs font-extrabold text-white truncate">${j.icon} ${j.title} ${qualified && !isCurrent ? '<span class="text-[9px] text-emerald-400 ml-1">✓ Şartlar Uygun</span>' : ''}</div>
                <div class="text-[10px] text-slate-400">${reqText} ${blocked ? '<span class="text-rose-400 font-bold">• Sabıka Engeli!</span>' : ''}</div>
                <div class="text-xs font-mono-num font-bold text-emerald-400 mt-0.5">Brüt: ${fmtMoney(monthlyGross)} / ay</div>
              </div>
              <button onclick="applyForJob('${j.id}')" class="px-3 py-2 rounded-xl text-xs font-extrabold shrink-0 ${isCurrent ? 'bg-emerald-500/20 text-emerald-300' : (qualified ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400')}">
                ${isCurrent ? 'Çalışıyor' : (blocked ? 'Sabıkalı' : 'Başvur')}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // 3. FUTBOLCU JÜBİLESİ -> KULÜP BAŞKANLIĞI (%50 İNDİRİM) & SPORTİF DİREKTÖRLÜK
  // ---------------------------------------------------------------------------
  const _origRetirePro = window.retireFromProFootball;
  window.retireFromProFootball = function () {
    ensureIntegrationState();
    if (G.proPlayer && (G.proPlayer.ovr >= 74 || G.proPlayer.apps >= 12)) {
      G.proPlayer.isLegend = true;
    }
    if (typeof _origRetirePro === 'function') _origRetirePro();
  };

  window.becomeLegendSportingDirector = function () {
    ensureIntegrationState();
    if (!G.proPlayer.isLegend && G.proPlayer.apps < 10) {
      showToast('Sportif Direktör olmak için önce futbolcu kariyerinde tecrübe kazanmalısın!');
      return;
    }
    G.proPlayer.isSportingDirector = !G.proPlayer.isSportingDirector;
    if (G.proPlayer.isSportingDirector && G.club && G.club.active) {
      G.club.power = clamp(G.club.power + 2, 60, 99);
    }
    playSfx('trophy');
    addLog(G.age, G.proPlayer.isSportingDirector
      ? `👔 Yeşil sahalardaki tecrübenle **Sportif Direktör & Futbol Aklı** koltuğuna oturdun!`
      : `🚪 Sportif Direktörlük görevinden ayrıldın.`, 'milestone');
    saveGame(); renderAll(); openMenuSection('sports');
  };

  // Efsane Futbolcuya Kongre ve Kulüp Satın Almada %50 İndirim + %95 Taraftar Güveni
  const _origAcquireClub = acquireOrElectClub;
  acquireOrElectClub = function (leagueId, teamId) {
    ensureIntegrationState();
    const isFootballVeteran = G.proPlayer && (G.proPlayer.isLegend || G.proPlayer.apps >= 10 || G.proPlayer.ovr >= 75);
    if (!isFootballVeteran) {
      return _origAcquireClub(leagueId, teamId);
    }

    const c = getCountry();
    const lg = FOOTBALL_LEAGUES_DB[leagueId];
    const tm = lg ? lg.teams.find(x => x.id === teamId) : null;
    if (!tm) return;
    if (G.age < 22) { showToast('Efsane futbolcu kontenjanından başkanlık için en az 22 yaşında olmalısın!'); return; }

    const isKongre = tm.model === 'kongre';
    const baseMinWages = isKongre ? Math.round(tm.valueM * 0.16) : Math.round(tm.valueM * 0.75);
    const discountedCost = Math.round(c.monthlyMinWage * baseMinWages * 0.50); // %50 İndirim!

    if (G.money < discountedCost) {
      showToast(`Efsane Futbolcu %50 indirimli teminatı için ${fmtMoney(discountedCost)} gerekiyor!`);
      return;
    }

    finalizeClubTakeover(leagueId, tm, discountedCost, isKongre ? 'kongre' : 'sahiplik', 95);
    addLog(G.age, `🌟 **EFSANEDEN BAŞKANLIĞA!** Yeşil sahalardaki itibarın sayesinde **%50 indirimli teminat** ve **%95 taraftar desteğiyle** **${tm.name}** koltuğuna oturdun!`, 'fame');
    saveGame(); renderAll(); openMenuSection('sports');
  };

  // ---------------------------------------------------------------------------
  // 4. GARAJ TİCARİ ARAÇLARI & LOJİSTİK ANTREPO -> ŞİRKET FİLOSU SİNERJİSİ
  // ---------------------------------------------------------------------------
  window.assignGarageVehicleToBusiness = function (carIdx, bizIdx) {
    const car = G.cars[carIdx];
    const biz = G.businesses[bizIdx];
    if (!car || !biz) return;

    const isHeavy = car.carId === 'volvo_fh16' || car.carId === 'scania_s730';
    const fleetGain = isHeavy ? 2 : 1;
    biz.fleet += fleetGain;
    G.cars.splice(carIdx, 1);
    if (biz.fleet >= 5) unlockAchievement('fleet_king');

    playSfx('trophy');
    const bType = BUSINESS_TYPES.find(t => t.id === biz.typeId) || BUSINESS_TYPES[0];
    addLog(G.age, `🚛 **FİLO SİNERJİSİ!** Garajındaki **${car.name}** aracını **${bType.name}** şirket filona dahil ettin (+${fleetGain} ${bType.unitName}, şahsi yakıt/sigorta gideri sıfırlandı)!`, 'good');
    saveGame(); renderAll(); openNavSheet('finance');
  };

  function renderGarageFleetSynergyPanelHTML() {
    const commCars = G.cars
      .map((car, idx) => ({ car, idx }))
      .filter(item => COMMERCIAL_CAR_IDS.includes(item.car.carId));
    const hasAntrepo = G.houses.some(h => h.houseId === 'lojistik_depo');

    if (commCars.length === 0 && !hasAntrepo) return '';

    return `
      <div class="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2 mb-2.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-emerald-300">🔗 Garaj &amp; Lojistik Antrepo Sinerji Merkezi</span>
          ${hasAntrepo ? `<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold">🏭 Antrepo +%20 Kâr Aktif</span>` : ''}
        </div>
        ${hasAntrepo ? `<div class="text-[10px] text-slate-300">Tapulu <strong>Gümrük Yanı Lojistik Antrepo</strong> mülkün sayesinde tüm şirketlerinin net kârı <strong>+%20</strong> artırımlı hesaplanıyor!</div>` : ''}
        ${commCars.length > 0 && G.businesses.length > 0 ? `
          <div class="space-y-1.5 pt-1">
            <div class="text-[10px] text-amber-300 font-bold"> Garajındaki Ticari Araçları Şirket Filosuna Bağla (Ağır Tırlar +2 Filo Verir):</div>
            ${commCars.map(({ car, idx }) => `
              <div class="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                <div class="text-[11px] font-bold text-white truncate">${car.icon} ${car.name} <span class="text-slate-400">(%${car.cond})</span></div>
                <button onclick="assignGarageVehicleToBusiness(${idx}, 0)" class="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-extrabold shrink-0">
                  Filoya Kat (+${car.carId.includes('fh16') || car.carId.includes('s730') ? '2' : '1'} Filo)
                </button>
              </div>
            `).join('')}
          </div>
        ` : (commCars.length > 0 ? `<div class="text-[10px] text-slate-400">Garajında ${commCars.length} ticari araç var. Bir şirket kurduğunda bunları ücretsiz filoya katabilirsin!</div>` : '')}
      </div>
    `;
  }

  // Lojistik Antrepo +%20 Şirket Kâr Sinerjisini ve Sportif Direktör Maaşını Ana Ekonomiye Bağla
  const _prevCalcFin = calculateFinances;
  calculateFinances = function () {
    ensureIntegrationState();
    const fin = _prevCalcFin();
    if (!G || G.inPrison) return fin;
    const c = getCountry();

    // 1. Lojistik Antrepo Tapusu Varsa Şirket Kârına +%20 Sinerji Ekle
    const hasAntrepo = G.houses && G.houses.some(h => h.houseId === 'lojistik_depo');
    if (hasAntrepo && fin.monthlyBizProfit > 0) {
      const bonusProfit = Math.round(fin.monthlyBizProfit * 0.20);
      fin.monthlyBizRevenue += Math.round(bonusProfit * 1.3);
      fin.monthlyBizProfit += bonusProfit;
      fin.monthlyNetCashflow += bonusProfit;
      fin.annualNetCashflow = fin.monthlyNetCashflow * 12;
    }

    // 2. Efsane Sportif Direktör Maaşı
    if (G.proPlayer && G.proPlayer.isSportingDirector) {
      const sdPay = Math.round(c.monthlyMinWage * 6.5);
      fin.monthlyGrossSalary += sdPay;
      fin.monthlyNetSalary += Math.round(sdPay * 0.8);
      fin.monthlyNetCashflow += Math.round(sdPay * 0.8);
      fin.annualNetCashflow = fin.monthlyNetCashflow * 12;
    }
    return fin;
  };

  // ---------------------------------------------------------------------------
  // 5. SENDİKA EKRANI İÇİ DOĞRUDAN KARA PARA AKLAMA & PARAVAN ŞİRKET PANELİ
  // ---------------------------------------------------------------------------
  window.quickSetupFrontCompany = function () {
    const c = getCountry();
    const frontCost = Math.round(c.monthlyMinWage * 35);
    const totalAvailable = G.money + (G.dirtyMoney || 0);
    if (totalAvailable < frontCost) {
      showToast(`Paravan şirket için toplam ${fmtMoney(frontCost)} (Nakit veya Kara Para) gerekiyor!`);
      return;
    }
    if (G.dirtyMoney >= frontCost) {
      G.dirtyMoney -= frontCost;
    } else {
      const rem = frontCost - G.dirtyMoney;
      G.dirtyMoney = 0;
      G.money -= rem;
    }
    G.businesses.push({ uid: uid(), typeId: 'oto_servis', fleet: 1, employees: 2, strategy: 'balanced' });
    playSfx('coin');
    addLog(G.age, `🧼 **PARAVAN ŞİRKET KURULDU!** Yeraltı gelirlerini aklamak için **Oto Ekspertiz & Yıkama Servisi** açtın!`, 'milestone');
    saveGame(); renderAll(); openMenuSection('crime');
  };

  window.launderDirectlyInCrimeMenu = function () {
    if (!G.dirtyMoney || G.dirtyMoney <= 0) {
      showToast('Aklanacak kara para bulunmuyor!');
      return;
    }
    if (G.businesses.length === 0) {
      showToast('Önce aşağıdaki butonla 1 Paravan Şirket kurmalısın!');
      return;
    }
    const cleanAmt = Math.round(G.dirtyMoney * 0.85);
    G.money += cleanAmt;
    G.dirtyMoney = 0;
    playSfx('coin');
    addLog(G.age, `🧼 Sendika muhasebesi üzerinden kara parayı aklayarak **+${fmtMoney(cleanAmt)}** temiz banka bakiyesine dönüştürdün!`, 'good');
    saveGame(); renderAll(); openMenuSection('crime');
  };

  // ---------------------------------------------------------------------------
  // ANA MENÜ VE SEKME KANCALARI (HİÇBİR ÖZELLİĞİ BOZMADAN ENTEGRE EDER)
  // ---------------------------------------------------------------------------
  const _prevOpenNav = openNavSheet;
  openNavSheet = function (tab) {
    ensureIntegrationState();
    _prevOpenNav(tab);
    const body = document.getElementById('sheetBody');
    if (!body || !G) return;

    // A) Kariyer Sekmesindeki Uzun İş Listesini 4 Sekmeli Akıllı Filtre İle Değiştir
    if (tab === 'career' && !G.inPrison) {
      const headers = Array.from(body.querySelectorAll('h4'));
      const jobHeader = headers.find(h => h.textContent.includes('Kurumsal İş İlanları') || h.textContent.includes('Tam Zamanlı Meslekler'));
      if (jobHeader && jobHeader.parentElement && jobHeader.parentElement.parentElement) {
        jobHeader.parentElement.parentElement.outerHTML = buildFilteredJobBoardHTML();
      }
    }

    // B) Finans -> Şirket Sekmesine Garaj-Filo & Antrepo Sinerji Panelini Ekle
    if (tab === 'finance' && activeFinanceTab === 'biz') {
      body.insertAdjacentHTML('afterbegin', renderGarageFleetSynergyPanelHTML());
    }

    // C) Menüdeki Alt Göç Butonunu Birleşik e-Devlet & Pasaport Merkezine Bağla
    if (tab === 'menu') {
      body.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Kimlik, Vize & Sicil') || btn.textContent.includes('Kimlik, Ehliyet')) {
          btn.innerHTML = `<div class="text-lg">🛂</div><div class="text-xs font-extrabold text-white">e-Devlet &amp; Pasaport</div><div class="text-[10px] text-slate-400">Kimlik, Ehliyet, Sicil &amp; Göç</div>`;
        }
        if (btn.textContent.includes('Pasaport & Göç') || btn.textContent.includes('Ülke Göçü')) {
          btn.onclick = () => { edevletHubTab = 'passport'; openMenuSection('license'); };
        }
      });
    }
  };

  const _prevOpenMenuSec = openMenuSection;
  openMenuSection = function (sec) {
    ensureIntegrationState();

    // 1. Kimlik, Ehliyet ve Göç Çağrılarının Tamamını Tek "e-Devlet & Konsolosluk Merkezi"nde Aç
    if (sec === 'license' || sec === 'identity' || sec === 'migrate') {
      if (sec === 'identity') edevletHubTab = 'portrait';
      if (sec === 'migrate') edevletHubTab = 'passport';

      const sheet = document.getElementById('bottomSheet');
      sheet.classList.remove('hidden');
      document.getElementById('sheetTitle').textContent = '🛂 e-Devlet & Konsolosluk Merkezi';
      document.getElementById('sheetSubtitle').textContent = `Kimlik, Sürücü Belgesi, Adli Sicil & Vize İşlemleri`;
      document.getElementById('sheetBody').innerHTML = renderUnifiedEdevletHub();
      return;
    }

    _prevOpenMenuSec(sec);
    const body = document.getElementById('sheetBody');
    if (!body || !G) return;

    // 2. Sendika & Yeraltı Ekranına Doğrudan Kara Para Aklama ve Paravan Şirket Kurma Masası Ekle
    if (sec === 'crime') {
      const c = getCountry();
      const frontCost = Math.round(c.monthlyMinWage * 35);
      const masakRisk = G.dirtyMoney > c.monthlyMinWage * 15 ? 'YÜKSEK (%28 Baskın Riski!)' : 'DÜŞÜK';
      const launderCard = `
        <div class="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2 mb-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-amber-300">🧼 Yeraltı Finans &amp; Kara Para Aklama Masası</span>
            <span class="text-[10px] font-mono-num text-rose-300">MASAK Riski: ${masakRisk}</span>
          </div>
          <div class="text-[11px] text-slate-300">
            Eldeki Kara Para: <strong class="text-amber-400 font-mono-num">${fmtMoney(G.dirtyMoney || 0)}</strong> &bull;
            Paravan Şirket: <strong class="text-emerald-400">${G.businesses.length} Adet</strong>
          </div>
          <div class="grid grid-cols-2 gap-2 pt-1">
            <button onclick="launderDirectlyInCrimeMenu()" class="p-2.5 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-extrabold">
              🧼 Şimdi Akla (%85 Net)
            </button>
            <button onclick="quickSetupFrontCompany()" class="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
              🏢 Paravan Oto Yıkama Aç (${fmtMoney(frontCost)})
            </button>
          </div>
        </div>
      `;
      body.insertAdjacentHTML('beforeend', launderCard);
    }

    // 3. Futbol & Spor Merkezinde Başkanlık Sekmesine "Efsane Futbolcu %50 İndirim & Sportif Direktörlük" Ekle
    if ((sec === 'sports' || sec === 'club_presidency' || sec === 'pro_footballer') && unifiedSportsMainTab === 'president') {
      const isVeteran = G.proPlayer && (G.proPlayer.isLegend || G.proPlayer.apps >= 10 || G.proPlayer.ovr >= 75);
      const c = getCountry();
      const sdPay = Math.round(c.monthlyMinWage * 6.5);
      const legendBanner = `
        <div class="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-emerald-500/15 border border-amber-400/50 space-y-2 mb-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-amber-300">⚽ Yeşil Sahalardan Yönetime: Futbolcu Ayrıcalığı</span>
            <span class="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-extrabold">${isVeteran ? '%50 İNDİRİM AKTİF' : '10+ Maç Gerekir'}</span>
          </div>
          <div class="text-[10px] text-slate-200">
            ${isVeteran
              ? 'Futbolculuk kariyerin sayesinde tüm kulüp kongre teminatlarında ve satın almalarda <strong>%50 Efsane İndirimi</strong> ve <strong>%95 Taraftar Güveni</strong> kazanırsın!'
              : 'Futbolcu kariyerinde 10+ maça çıktığında veya 75+ OVR olduğunda kulüp başkanlığına %50 indirimle geçebilirsin.'}
          </div>
          ${isVeteran ? `
            <button onclick="becomeLegendSportingDirector()" class="w-full py-2 rounded-xl ${G.proPlayer.isSportingDirector ? 'bg-emerald-500/25 border border-emerald-500 text-emerald-300' : 'bg-amber-400 text-slate-950'} text-[11px] font-extrabold">
              ${G.proPlayer.isSportingDirector ? '✓ Sportif Direktörlük Görevindesin (+Maaş & +2 Kulüp Gücü)' : `👔 Sportif Direktör & Futbol Aklı Ol (+${fmtMoney(sdPay)}/ay)`}
            </button>
          ` : ''}
        </div>
      `;
      const topSw = body.querySelector('.grid.grid-cols-3');
      if (topSw) topSw.insertAdjacentHTML('afterend', legendBanner);
    }
  };
})();

/* ============================================================================
   GÖRSEL CİLA MOTORU + DERİN SİYASET (MECLİS/BAKANLIK) + RADYO & MEDYA STÜDYOSU
   ============================================================================ */

let activePoliticsSubTab = 'party'; // 'party' | 'parliament' | 'cabinet'
let activeMediaHubTab = 'social';   // 'social' | 'streamer' | 'empire'

function ensurePoliticsAndMediaState() {
  if (!G) return;

  // 1. Derin Siyaset Durumu
  if (!G.deepPol) {
    G.deepPol = {
      partyId: null,
      partyName: null,
      partyShort: 'BAĞ',
      isPartyLeader: false,
      delegates: 35,
      mySeats: 0,
      coalitionSeats: 0,
      coalitionPartner: null,
      ministryId: null,
      passedBills: [],
       logisticsSubsidy: 0
    };
  }

  // 2. Radyo, Medya ve Dijital Yayıncı (Streamer) Stüdyosu Durumu
  if (!G.mediaStudio) {
    G.mediaStudio = {
      streamerName: (G.firstName || 'Oyuncu') + 'Live',
      gear: [],
      liveSubs: 0,
      peakViewers: 15,
      streamsThisYear: 0,
      ownedOutlets: [],
      editorialFocus: 'ads', // 'ads' | 'politics' | 'football'
      customSportMediaName: 'Skor Ağı Dijital'
    };
  }
}

/* ---------------- BÖLÜM 1: 5'Lİ GÖRSEL CİLA VE ANİMASYON MOTORU ---------------- */
(function initVisualPolishEngine() {
  if (window._visualPolishEngineLoaded) return;
  window._visualPolishEngineLoaded = true;

  let _lastMoneyVal = null;
  let _rollingAnimFrame = null;

  function spawnFloatingMoney(diff) {
    if (!diff || Math.abs(diff) < 10) return;
    const chip = document.createElement('div');
    const isPos = diff > 0;
    chip.className = `floating-money-chip ${isPos ? 'floating-money-pos' : 'floating-money-neg'}`;
    chip.textContent = `${isPos ? '+' : ''}${fmtMoney(diff)}`;
    document.body.appendChild(chip);
    setTimeout(() => chip.remove(), 1350);
  }

  function animateRollingBalance(el, startVal, endVal, sparkHtml) {
    if (_rollingAnimFrame) cancelAnimationFrame(_rollingAnimFrame);
    const duration = 380;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const cur = Math.round(startVal + (endVal - startVal) * eased);
      el.innerHTML = `${fmtMoney(cur)} ${sparkHtml || ''}`;
      if (progress < 1) {
        _rollingAnimFrame = requestAnimationFrame(step);
      }
    }
    _rollingAnimFrame = requestAnimationFrame(step);
  }

  // RenderAll Kancası: Akıcı Bakiye Sayacı, Uçucu Para ve Portre Neon Halesi
  const _prevRenderAll = renderAll;
  renderAll = function () {
    ensurePoliticsAndMediaState();
    const prevM = _lastMoneyVal;
    _prevRenderAll();
    if (!G) return;

    // Portre Neon Halesi
    const avatar = document.getElementById('charAvatar');
    if (avatar) {
      avatar.classList.remove('avatar-halo-gold', 'avatar-halo-emerald');
      if (G.fame >= 65 || (G.politics && G.politics.officeId === 'president') || (G.club && G.club.active)) {
        avatar.classList.add('avatar-halo-gold');
      } else if (getNetWorth() >= getCountry().monthlyMinWage * 25) {
        avatar.classList.add('avatar-halo-emerald');
      }
    }

    // Akıcı Sayı Sayacı & Uçucu Para Partikülü
    const balEl = document.getElementById('charBalance');
    if (balEl) {
      const svgMatch = balEl.innerHTML.match(/<svg[\s\S]*<\/svg>/i);
      const sparkHtml = svgMatch ? svgMatch[0] : '';
      if (prevM !== null && prevM !== G.money) {
        const diff = G.money - prevM;
        spawnFloatingMoney(diff);
        animateRollingBalance(balEl, prevM, G.money, sparkHtml);
      }
      _lastMoneyVal = G.money;
    }

    // Üst Barda Bakanlık veya Parti Genel Başkanlığı Unvanı Gösterimi
    const roleEl = document.getElementById('charRoleText');
    if (roleEl && !G.inPrison && G.deepPol && G.deepPol.ministryId && (!G.politics || G.politics.officeId !== 'president')) {
      const minObj = MINISTRIES_DB.find(m => m.id === G.deepPol.ministryId);
      if (minObj) {
        roleEl.textContent = `${minObj.icon} ${minObj.title} • ${G.age} Yaş`;
      }
    }
  };

  // Alt Menüde Aktif Sekmeye Neon Işık Ekle
  const _prevOpenNav = openNavSheet;
  openNavSheet = function (tab) {
    _prevOpenNav(tab);
    const navBtns = document.querySelectorAll('#appShell > nav button');
    const tabMap = { career: 0, finance: 1, relations: 3, menu: 4 };
    navBtns.forEach((btn, idx) => {
      if (idx === 2) return; // +1 Yaş butonu
      btn.classList.toggle('nav-dock-active', tabMap[tab] === idx);
    });
  };
})();

/* ---------------- BÖLÜM 2: 🏛️ DERİN SİYASET: PARTİ, MECLİS, KOALİSYON & BAKANLIKLAR ---------------- */

// 600 Milletvekilli SVG Meclis Genel Kurulu (Hemicycle) Çizimi
function renderParliamentHemicycleSVG() {
  const dp = G.deepPol;
  const mySeats = clamp(dp.mySeats, 0, 600);
  const coalSeats = clamp(dp.coalitionSeats, 0, 600 - mySeats);
  const totalBlock = mySeats + coalSeats;

  const totalDots = 60; // Her nokta 10 milletvekilini temsil eder
  const myDots = Math.round((mySeats / 600) * totalDots);
  const coalDots = Math.round((coalSeats / 600) * totalDots);

  let dotsHtml = '';
  let dotCounter = 0;
  const rows = [
    { r: 34, count: 14 },
    { r: 48, count: 20 },
    { r: 62, count: 26 }
  ];

  rows.forEach(row => {
    for (let i = 0; i < row.count; i++) {
      const angle = Math.PI - (i / Math.max(1, row.count - 1)) * Math.PI;
      const x = (120 + Math.cos(angle) * row.r).toFixed(1);
      const y = (78 - Math.sin(angle) * row.r).toFixed(1);
      let fill = '#334155'; // Muhalefet
      if (dotCounter < myDots) fill = '#10b981'; // Senin Partin
      else if (dotCounter < myDots + coalDots) fill = '#f59e0b'; // Koalisyon Ortağı
      dotsHtml += `<circle cx="${x}" cy="${y}" r="3.6" fill="${fill}" />`;
      dotCounter++;
    }
  });

  return `
    <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 mb-2.5">
      <div class="flex items-center justify-between text-[10px] font-extrabold">
        <span class="text-amber-400 uppercase">🏛️ 600 SANDALYELİ MECLİS GENEL KURULU</span>
        <span class="font-mono-num ${totalBlock >= 301 ? 'text-emerald-400' : 'text-slate-400'}">Çoğunluk: ${totalBlock} / 301 MV</span>
      </div>
      <svg viewBox="0 0 240 88" class="w-full h-24 overflow-visible">
        ${dotsHtml}
        <rect x="102" y="68" width="36" height="12" rx="4" fill="#1e293b" stroke="#475569" stroke-width="1"/>
        <text x="120" y="77" text-anchor="middle" fill="#f8fafc" font-size="6.5" font-weight="800" font-family="JetBrains Mono">KÜRSÜ</text>
      </svg>
      <div class="flex justify-between text-[10px] font-mono-num border-t border-slate-800 pt-1.5">
        <span class="text-emerald-400">● Partin: <strong>${mySeats} MV</strong></span>
        <span class="text-amber-400">● Koalisyon: <strong>${coalSeats} MV</strong></span>
        <span class="text-slate-400">● Muhalefet: <strong>${600 - totalBlock} MV</strong></span>
      </div>
    </div>
  `;
}

function renderDeepPoliticsHubHTML() {
  ensurePoliticsAndMediaState();
  const c = getCountry();
  const dp = G.deepPol;

  const subNav = `
    <div class="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-2.5 text-[11px] font-extrabold">
      <button onclick="activePoliticsSubTab='party'; openMenuSection('politics')" class="py-2 rounded-xl ${activePoliticsSubTab === 'party' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}">🚩 Parti &amp; Seçim</button>
      <button onclick="activePoliticsSubTab='parliament'; openMenuSection('politics')" class="py-2 rounded-xl ${activePoliticsSubTab === 'parliament' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}">🏛️ Meclis (${dp.mySeats + dp.coalitionSeats})</button>
      <button onclick="activePoliticsSubTab='cabinet'; openMenuSection('politics')" class="py-2 rounded-xl ${activePoliticsSubTab === 'cabinet' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}">💼 Bakanlıklar</button>
    </div>
  `;

  // SEKME 1: PARTİ KURMA, KONGRESİ VE MAKAM SEÇİMLERİ
  if (activePoliticsSubTab === 'party') {
    const rallyCost = Math.round(c.monthlyMinWage * 2.5);
    const congressCost = Math.round(c.monthlyMinWage * 6.0);

    const partyBox = !dp.partyId ? `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-2 mb-2.5">
        <div class="text-xs font-extrabold text-amber-300">🚩 Siyasi Partiye Katıl veya Kendi Partini Kur</div>
        <div class="space-y-1.5">
          ${POLITICAL_PARTIES_DB.map(pt => `
            <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <div>
                <div class="text-xs font-extrabold text-white">${pt.name} <span class="text-amber-400">(${pt.short})</span></div>
                <div class="text-[10px] text-slate-400">${pt.desc}</div>
              </div>
              <button onclick="joinOrFoundParty('${pt.id}')" class="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-[10px] font-extrabold shrink-0">Seç</button>
            </div>
          `).join('')}
        </div>
      </div>
    ` : `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-2 mb-2.5">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[10px] font-extrabold text-amber-400 uppercase">AKTİF SİYASİ HAREKETİN</div>
            <div class="text-xs font-extrabold text-white">${dp.partyName} (${dp.partyShort})</div>
          </div>
          <span class="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-extrabold">
            ${dp.isPartyLeader ? '👑 Genel Başkan' : `Delege: %${dp.delegates}`}
          </span>
        </div>
        <div class="grid grid-cols-2 gap-2 pt-1">
          <button onclick="doPartyCongressAction(${congressCost})" class="p-2.5 rounded-xl bg-amber-400 text-slate-950 text-[11px] font-extrabold">
            ${dp.isPartyLeader ? `🗳️ Genel Seçime Gir (Meclis)` : `👑 Büyük Kongrede Genel Başkan Ol (${fmtMoney(congressCost)})`}
          </button>
          <button onclick="dpLeaveParty()" class="p-2.5 rounded-xl bg-slate-800 text-slate-300 text-[11px] font-bold">Partiden Ayrıl</button>
        </div>
      </div>
    `;

    return renderHeroBannerHTML('politics') + subNav + partyBox + `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 mb-2.5">
        <div class="flex justify-between"><span class="text-xs font-extrabold text-white">📊 Kamuoyu Seçmen Desteği</span><span class="text-xs font-mono-num font-bold text-emerald-400">Oy: %${G.politics.approval}</span></div>
        <div class="grid grid-cols-2 gap-2">
          <button onclick="doPoliticalRally(${rallyCost})" class="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">📢 İl Mitingi (${fmtMoney(rallyCost)})</button>
          <button onclick="doTvDebate()" class="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">📺 Canlı Yayın</button>
        </div>
      </div>
      <div class="space-y-2">
        ${POLITICS_OFFICES.map(off => {
          const campCost = Math.round(c.monthlyMinWage * off.campaignMult);
          const isCur = G.politics.officeId === off.id;
          return `<div class="p-3 rounded-2xl bg-slate-900 border ${isCur ? 'border-amber-400' : 'border-slate-800'} flex items-center justify-between gap-2"><div><div class="text-xs font-extrabold text-white">${off.icon} ${off.title}</div><div class="text-[10px] text-slate-400">Min Yaş: ${off.minAge} • Hedef Oy: %${off.reqApproval} • Maaş: <strong class="text-emerald-400">${fmtMoney(c.monthlyMinWage * off.salaryMult)}/ay</strong></div></div><button onclick="runForOffice('${off.id}', ${campCost})" class="px-3 py-2 rounded-xl text-xs font-extrabold ${isCur ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-400 text-slate-950'}">${isCur ? 'Makamda' : 'Aday Ol'}</button></div>`;
        }).join('')}
      </div>
    `;
  }

  // SEKME 2: 600 KOLTUKLU MECLİS, KOALİSYON PROTOKOLÜ VE YASA TASARILARI
  if (activePoliticsSubTab === 'parliament') {
    const totalSeats = dp.mySeats + dp.coalitionSeats;
    return renderHeroBannerHTML('politics') + subNav + renderParliamentHemicycleSVG() + `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-2 mb-2.5">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs font-extrabold text-white">🤝 Hükümet &amp; Koalisyon Müzakereleri</div>
            <div class="text-[10px] text-slate-400">${dp.coalitionPartner ? `Ortak: ${dp.coalitionPartner} (+${dp.coalitionSeats} MV)` : 'Yasa çıkarmak için 301 sandalye çoğunluğuna ulaşmalısın'}</div>
          </div>
          <button onclick="formParliamentCoalition()" class="px-3 py-2 rounded-xl bg-amber-400 text-slate-950 text-[10px] font-extrabold shrink-0">
            ${dp.coalitionPartner ? 'Ortağı Değiştir' : 'Koalisyon Kur'}
          </button>
        </div>
      </div>

      <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">📜 Meclis Genel Kurulu Yasa Tasarıları (301+ MV Gerekir)</h4>
      <div class="space-y-2">
        ${PARLIAMENT_BILLS_DB.map(b => {
          const passed = dp.passedBills.includes(b.id);
          return `
            <div class="p-3 rounded-2xl bg-slate-900 border ${passed ? 'border-emerald-500/50' : 'border-slate-800'} flex items-center justify-between gap-2">
              <div>
                <div class="text-xs font-extrabold text-white">${b.title}</div>
                <div class="text-[10px] text-slate-400">${b.desc}</div>
              </div>
              <button onclick="voteParliamentBill('${b.id}')" class="px-3 py-2 rounded-xl text-[10px] font-extrabold shrink-0 ${passed ? 'bg-slate-800 text-emerald-400' : (totalSeats >= 301 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500')}">
                ${passed ? 'Yasalaştı ✓' : 'Oylamaya Sun'}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // SEKME 3: BAKANLIKLAR VE KABİNE YÖNETİMİ
  return renderHeroBannerHTML('politics') + subNav + `
    <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 mb-2.5">
      💡 Koalisyon ortağı olduğunda, partin mecliste <strong>80+ sandalye</strong> kazandığında veya <strong>Cumhurbaşkanı</strong> seçildiğinde aşağıdaki bakanlık koltuklarını üstlenebilirsin!
    </div>

    <div class="space-y-2">
      ${MINISTRIES_DB.map(min => {
        const active = dp.ministryId === min.id;
        const pay = Math.round(c.monthlyMinWage * min.salaryMult);
        return `
          <div class="p-3.5 rounded-2xl bg-slate-900 border ${active ? 'border-emerald-500' : 'border-slate-800'} flex items-center justify-between gap-2">
            <div>
              <div class="text-xs font-extrabold text-white">${min.icon} ${min.title}</div>
              <div class="text-[10px] text-slate-400">${min.bonusDesc}</div>
              <div class="text-[10px] text-emerald-400 font-mono-num mt-0.5">Bakanlık Ödeneği: +${fmtMoney(pay)}/ay</div>
            </div>
            <button onclick="takeMinistryPortfolio('${min.id}')" class="px-3 py-2 rounded-xl text-[10px] font-extrabold shrink-0 ${active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-500 text-slate-950'}">
              ${active ? 'Görevde ✓' : 'Görevi Al'}
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function joinOrFoundParty(partyId) {
  if (G.age < 18) { showToast('Parti üyeliği için 18+ yaş gerekir!'); return; }
  const pt = POLITICAL_PARTIES_DB.find(x => x.id === partyId);
  if (!pt) return;
  const dp = G.deepPol;
  dp.partyId = pt.id;
  dp.partyName = pt.id === 'party_custom' ? `${G.lastName} Hareketi Partisi` : pt.name;
  dp.partyShort = pt.id === 'party_custom' ? (G.lastName.slice(0, 2).toUpperCase() + 'P') : pt.short;
  dp.isPartyLeader = pt.id === 'party_custom';
  dp.delegates = dp.isPartyLeader ? 100 : 40;
  dp.mySeats = dp.isPartyLeader ? 45 : 85;
  G.politics.inParty = true;
  if (dp.isPartyLeader) unlockAchievement('party_leader');
  playSfx('trophy');
  addLog(G.age, `🚩 **${dp.partyName} (${dp.partyShort})** çatısı altında aktif siyasete atıldın!`, 'milestone');
  saveGame(); renderAll(); openMenuSection('politics');
}

function dpLeaveParty() {
  G.deepPol.partyId = null;
  G.deepPol.isPartyLeader = false;
  G.deepPol.mySeats = 0;
  G.deepPol.coalitionSeats = 0;
  G.deepPol.ministryId = null;
  saveGame(); renderAll(); openMenuSection('politics');
}

function doPartyCongressAction(cost) {
  const dp = G.deepPol;
  if (!dp.isPartyLeader) {
    if (G.money < cost) { showToast('Delege kulisi ve kurultay bütçesi için bakiye yetersiz!'); return; }
    G.money -= cost;
    dp.isPartyLeader = true;
    dp.delegates = 100;
    dp.mySeats = Math.max(95, dp.mySeats + 50);
    G.fame = clamp(G.fame + 20);
    unlockAchievement('party_leader');
    playSfx('trophy');
    addLog(G.age, `👑 **OLAĞANÜSTÜ KURULTAY ZAFERİ!** Delegelerin oylarıyla **${dp.partyName} Genel Başkanı** seçildin!`, 'fame');
  } else {
    // Genel Seçim Simülasyonu
    const mediaBoost = (G.mediaStudio && G.mediaStudio.editorialFocus === 'politics') ? (G.mediaStudio.ownedOutlets.length * 8) : 0;
    const votePct = clamp(G.politics.approval + mediaBoost + randInt(-4, 9), 7, 58);
    dp.mySeats = Math.round((votePct / 100) * 600);
    playSfx('trophy');
    addLog(G.age, `🗳️ **GENEL SEÇİM SONUCU:** Partin **%${votePct}** oy alarak Meclis'te **${dp.mySeats} Milletvekili** çıkardı!`, 'fame');
    activePoliticsSubTab = 'parliament';
  }
  saveGame(); renderAll(); openMenuSection('politics');
}

function formParliamentCoalition() {
  const dp = G.deepPol;
  if (!dp.partyId || dp.mySeats < 20) {
    showToast('Koalisyon masası kurmak için önce partinle mecliste en az 20 vekil çıkarmalısın!');
    return;
  }
  const partners = [
    { name: 'Milliyetçi Merkez Grubu', seats: 145 },
    { name: 'Sosyal Demokrat Blok', seats: 165 },
    { name: 'Bağımsız Reformcular İttifakı', seats: 120 }
  ];
  const p = pickRandom(partners);
  dp.coalitionPartner = p.name;
  dp.coalitionSeats = p.seats;
  playSfx('coin');
  addLog(G.age, `🤝 Mecliste **${p.name}** ile hükümet koalisyonu kurdun! Toplam sandalye sayınız **${dp.mySeats + dp.coalitionSeats} MV** oldu.`, 'milestone');
  saveGame(); renderAll(); openMenuSection('politics');
}

function voteParliamentBill(billId) {
  const dp = G.deepPol;
  if (dp.passedBills.includes(billId)) return;
  if (dp.mySeats + dp.coalitionSeats < 301) {
    showToast('Yasa çıkarmak için Mecliste en az 301 sandalye çoğunluğuna (Parti + Koalisyon) ulaşmalısın!');
    return;
  }
  const bill = PARLIAMENT_BILLS_DB.find(x => x.id === billId);
  if (!bill) return;

  dp.passedBills.push(billId);
  G.politics.approval = clamp(G.politics.approval + bill.approvalGain);
  const c = getCountry();

  if (billId === 'bill_tax_cut') {
    G.politics.taxModifier = (G.politics.taxModifier || 0) - 0.04;
  } else if (billId === 'bill_logistics_hub') {
    dp.logisticsSubsidy = (dp.logisticsSubsidy || 0) + 0.18;
  } else if (billId === 'bill_football_pool' && G.club && G.club.active) {
    const grant = Math.round(c.monthlyMinWage * 25);
    G.club.clubTreasury += grant;
  } else if (billId === 'bill_youth_grant') {
    c.monthlyMinWage = Math.round(c.monthlyMinWage * 1.12);
  }

  playSfx('trophy');
  addLog(G.age, `📜 **MECLİS KARARI:** **${bill.title}** ${dp.mySeats + dp.coalitionSeats} kabul oyuyla yasalaştı ve Resmi Gazete'de yayımlandı!`, 'fame');
  saveGame(); renderAll(); openMenuSection('politics');
}

function takeMinistryPortfolio(minId) {
  const dp = G.deepPol;
  const totalSeats = dp.mySeats + dp.coalitionSeats;
  if (totalSeats < 80 && G.politics.officeId !== 'president' && !G.politics.officeId) {
    showToast('Bakanlık koltuğu için mecliste en az 80 MV olmalı veya seçilmiş bir makamda bulunmalısın!');
    return;
  }
  dp.ministryId = minId;
  const min = MINISTRIES_DB.find(x => x.id === minId);
  G.fame = clamp(G.fame + 15);

  if (minId === 'genclik_spor' && G.club && G.club.active) {
    G.club.tffLobby = clamp((G.club.tffLobby || 50) + 25);
  }
  playSfx('trophy');
  addLog(G.age, `${min.icon} **KABİNE ATAMASI:** Resmi kararname ile **${min.title}** koltuğuna atandın!`, 'fame');
  saveGame(); renderAll(); openMenuSection('politics');
}

/* ---------------- BÖLÜM 3: 📻 RADYO, MEDYA VE DİJİTAL YAYINCI (STREAMER) STÜDYOSU ---------------- */

function renderMediaAndStreamerHubHTML() {
  ensurePoliticsAndMediaState();
  const c = getCountry();
  const ms = G.mediaStudio;

  const topTabs = `
    <div class="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-3 text-[11px] font-extrabold">
      <button onclick="activeMediaHubTab='streamer'; openMenuSection('social')" class="py-2 rounded-xl ${activeMediaHubTab === 'streamer' ? 'bg-fuchsia-500 text-white shadow' : 'text-slate-400'}">🎙️ Yayıncı Odası</button>
      <button onclick="activeMediaHubTab='empire'; openMenuSection('social')" class="py-2 rounded-xl ${activeMediaHubTab === 'empire' ? 'bg-orange-500 text-slate-950 shadow' : 'text-slate-400'}">📻 Radyo &amp; Medya</button>
      <button onclick="activeMediaHubTab='social'; openMenuSection('social')" class="py-2 rounded-xl ${activeMediaHubTab === 'social' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400'}">📱 Sosyal Akış</button>
    </div>
  `;

  // SEKME 1: YAYINCI (STREAMER) & PODCAST ODASI
  if (activeMediaHubTab === 'streamer') {
    const monthlySubRev = Math.round((ms.liveSubs / 100) * (c.monthlyMinWage * 0.25));
    return topTabs + `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-fuchsia-500/40 space-y-2.5 mb-2.5">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[10px] font-extrabold text-fuchsia-400 uppercase flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span> CANLI YAYIN &amp; PODCAST STÜDYOSU
            </div>
            <div class="text-sm font-extrabold text-white">🎧 ${ms.streamerName} <span class="text-xs text-slate-400">(${ms.gear.length}/4 Ekipman)</span></div>
          </div>
          <!-- Canlı Ses Ekolayzır Barları -->
          <div class="flex items-end gap-1 h-6 px-2">
            <div class="eq-bar" style="animation-delay:0s"></div>
            <div class="eq-bar" style="animation-delay:0.2s"></div>
            <div class="eq-bar" style="animation-delay:0.4s"></div>
            <div class="eq-bar" style="animation-delay:0.1s"></div>
            <div class="eq-bar" style="animation-delay:0.3s"></div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="p-2 rounded-xl bg-slate-950 border border-slate-800">
            <div class="text-[8px] text-slate-400">ÜCRETLİ ABONE</div>
            <div class="text-xs font-extrabold font-mono-num text-fuchsia-400">${ms.liveSubs.toLocaleString('tr-TR')}</div>
          </div>
          <div class="p-2 rounded-xl bg-slate-950 border border-slate-800">
            <div class="text-[8px] text-slate-400">ANLIK İZLEYİCİ</div>
            <div class="text-xs font-extrabold font-mono-num text-white">${ms.peakViewers.toLocaleString('tr-TR')}</div>
          </div>
          <div class="p-2 rounded-xl bg-slate-950 border border-slate-800">
            <div class="text-[8px] text-slate-400">ABONE GELİRİ</div>
            <div class="text-xs font-extrabold font-mono-num text-emerald-400">+${fmtMoney(monthlySubRev)}/ay</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-1">
          <button onclick="startInteractiveLiveStream('gaming')" class="p-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white text-xs font-extrabold">
            🎮 Oyun &amp; Sohbet Yayını Aç
          </button>
          <button onclick="startInteractiveLiveStream('sports_talk')" class="p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 text-xs font-extrabold">
            ⚽ Transfer &amp; Gündem Yayını
          </button>
        </div>
      </div>

      <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">🎛️ Yayıncı Odası Donanım Yükseltmeleri</h4>
      <div class="space-y-2">
        ${STREAMER_GEAR_DB.map(g => {
          const owned = ms.gear.includes(g.id);
          const cost = Math.round(c.monthlyMinWage * g.costMult);
          return `
            <div class="p-3 rounded-2xl bg-slate-900 border ${owned ? 'border-emerald-500/50' : 'border-slate-800'} flex items-center justify-between gap-2">
              <div>
                <div class="text-xs font-extrabold text-white">${g.icon} ${g.name}</div>
                <div class="text-[10px] text-slate-400">İzleyici Çarpanı: <strong>+${g.viewBoost}%</strong> • Şöhret: <strong>+${g.fameBoost}</strong></div>
              </div>
              <button onclick="buyStreamerGear('${g.id}', ${cost})" class="px-3 py-2 rounded-xl text-[10px] font-extrabold shrink-0 ${owned ? 'bg-slate-800 text-emerald-400' : 'bg-fuchsia-500 text-white'}">
                ${owned ? 'Kurulu ✓' : fmtMoney(cost)}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // SEKME 2: RADYO İSTASYONU, SİYAH-TURUNCU DİJİTAL SPOR MEDYASI VE TV KANALI
  if (activeMediaHubTab === 'empire') {
    return topTabs + `
      <div class="media-skor-card mb-3 space-y-2">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[9px] font-extrabold text-orange-400 uppercase tracking-widest">🟠 SİYAH-TURUNCU MEDYA &amp; YAYIN GRUBU</div>
            <div class="text-sm font-extrabold text-white">${ms.customSportMediaName} Holding</div>
          </div>
          <span class="px-2 py-1 rounded bg-orange-500 text-slate-950 text-[10px] font-extrabold">${ms.ownedOutlets.length} Kuruluş</span>
        </div>
        <div class="text-[10px] text-slate-300">Medya grubunun yayın politikasını belirleyerek reklam geliri, siyasi oy desteği veya futbol kulübün için kamuoyu gücü üretebilirsin:</div>
        <div class="grid grid-cols-3 gap-1.5 text-[10px] pt-1">
          <button onclick="setMediaEditorialFocus('ads')" class="py-1.5 rounded-lg border font-bold ${ms.editorialFocus === 'ads' ? 'border-orange-500 bg-orange-500/25 text-white' : 'border-slate-800 text-slate-400'}">💰 Ticari Reklam (+%25 Gelir)</button>
          <button onclick="setMediaEditorialFocus('politics')" class="py-1.5 rounded-lg border font-bold ${ms.editorialFocus === 'politics' ? 'border-orange-500 bg-orange-500/25 text-white' : 'border-slate-800 text-slate-400'}">🏛️ Siyasi Lobi (+Oy Desteği)</button>
          <button onclick="setMediaEditorialFocus('football')" class="py-1.5 rounded-lg border font-bold ${ms.editorialFocus === 'football' ? 'border-orange-500 bg-orange-500/25 text-white' : 'border-slate-800 text-slate-400'}">⚽ Spor Kulisleri (+Taraftar/TFF)</button>
        </div>
      </div>

      <div class="space-y-2">
        ${MEDIA_OUTLETS_DB.map(out => {
          const owned = ms.ownedOutlets.includes(out.id);
          const cost = Math.round(c.monthlyMinWage * out.costMult);
          const rev = Math.round(c.monthlyMinWage * out.monthlyRevMult * (ms.editorialFocus === 'ads' ? 1.25 : 1.0));
          return `
            <div class="p-3.5 rounded-2xl bg-slate-900 border ${owned ? 'border-orange-500' : 'border-slate-800'} space-y-2">
              <div class="flex items-center justify-between gap-2">
                <div>
                  <div class="text-xs font-extrabold text-white">${out.icon} ${out.name}</div>
                  <div class="text-[10px] text-slate-400">${out.theme}</div>
                  <div class="text-[10px] text-emerald-400 font-mono-num mt-0.5">Aylık Reklam/Sponsor Geliri: <strong>+${fmtMoney(rev)}/ay</strong></div>
                </div>
                <button onclick="acquireMediaOutlet('${out.id}', ${cost})" class="px-3 py-2 rounded-xl text-[10px] font-extrabold shrink-0 ${owned ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-500 text-slate-950'}">
                  ${owned ? 'Sahibisin ✓' : `Kur (${fmtMoney(cost)})`}
                </button>
              </div>
              ${owned ? `
                <button onclick="triggerHeadlineBroadcast('${out.id}')" class="w-full py-1.5 rounded-xl bg-slate-950 border border-orange-500/40 text-orange-300 text-[10px] font-extrabold">
                  📡 Özel Manşet / Canlı Radyo Yayını Yap (+Anlık Nakit &amp; Etki)
                </button>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // SEKME 3: KLASİK SOSYAL MEDYA AKIŞI
  const platforms = ['Instaphoto', 'TokTik', 'YouVideo', 'KickStream'];
  return topTabs + `
    <div class="p-3.5 rounded-2xl bg-slate-900 border border-fuchsia-500/30 grid grid-cols-2 gap-2 mb-2.5">
      ${platforms.map(p => {
        const joined = G.social.activePlatforms.includes(p);
        return `<button onclick="joinSocialPlatform('${p}')" class="p-2 rounded-xl border text-xs font-bold ${joined ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-slate-800 bg-slate-950 text-slate-300'}">${joined ? '✓ ' + p : '+ ' + p + ' Aç'}</button>`;
      }).join('')}
    </div>
    <div class="space-y-2">
      <button onclick="postSocialContent('viral')" class="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-left"><div><div class="text-xs font-extrabold text-white">🔥 Viral Reels / Shorts Videosu Çek</div><div class="text-[10px] text-slate-400">Keşfete düşme ve yüksek takipçi şansı</div></div><span class="text-xs font-bold text-emerald-400">Paylaş &rarr;</span></button>
      <button onclick="postSocialContent('stream')" class="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-left"><div><div class="text-xs font-extrabold text-white">🎮 Hızlı Mobil Yayın Aç</div><div class="text-[10px] text-slate-400">Takipçi + anlık bağış geliri</div></div><span class="text-xs font-bold text-emerald-400">Yayın Aç &rarr;</span></button>
      <button onclick="postSocialContent('sponsor')" class="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-left"><div><div class="text-xs font-extrabold text-white">💼 Sponsorlu Marka Reklamı Al</div><div class="text-[10px] text-slate-400">En az 10.000 takipçi gerekir</div></div><span class="text-xs font-bold text-amber-400">Anlaşma &rarr;</span></button>
      <button onclick="applyForBlueTick()" class="w-full p-3 rounded-2xl bg-slate-900 border border-sky-500/30 flex items-center justify-between text-left"><div><div class="text-xs font-extrabold text-sky-400">☑️ Mavi Tik Başvurusu</div><div class="text-[10px] text-slate-400">50.000+ takipçi gerekir</div></div><span class="text-xs font-bold text-sky-400">Başvur &rarr;</span></button>
    </div>
  `;
}

function buyStreamerGear(gearId, cost) {
  const ms = G.mediaStudio;
  if (ms.gear.includes(gearId)) return;
  if (G.money < cost) { showToast('Stüdyo ekipmanı için nakit yetersiz!'); return; }
  G.money -= cost;
  ms.gear.push(gearId);
  const g = STREAMER_GEAR_DB.find(x => x.id === gearId);
  G.fame = clamp(G.fame + g.fameBoost);
  ms.peakViewers = Math.round(ms.peakViewers * (1 + g.viewBoost / 100) + 120);
  playSfx('coin');
  addLog(G.age, `🎛️ Yayıncı stüdyona **${g.name}** kurdun! Yayın kaliten ve izleyici kitlen büyüdü.`, 'good');
  saveGame(); renderAll(); openMenuSection('social');
}

function startInteractiveLiveStream(streamType) {
  const ms = G.mediaStudio;
  if (ms.streamsThisYear >= 4) { showToast('Bu yılki 4 büyük yayın maratonunu tamamladın! +1 Yaş ilerle.'); return; }
  ms.streamsThisYear += 1;

  const c = getCountry();
  const gearMult = 1 + ms.gear.length * 0.65;
  const newSubs = Math.round(randInt(180, 650) * gearMult);
  const donationMoney = Math.round(c.monthlyMinWage * 0.45 * gearMult);

  ms.liveSubs += newSubs;
  ms.peakViewers = Math.max(ms.peakViewers, Math.round(ms.liveSubs * 2.4));
  G.social.followers += newSubs * 6;
  G.money += donationMoney;
  G.fame = clamp(G.fame + 4);

  if (ms.liveSubs >= 100000 || ms.gear.length === 4) unlockAchievement('top_streamer');
  playSfx('coin');

  const topicTxt = streamType === 'sports_talk' ? 'Süper Lig ve Transfer Kulisleri' : 'Gece Maratonu Oyun & Sohbet';
  addLog(G.age, `🎙️ **CANLI YAYIN REKORU (${topicTxt}):** Yayını **${ms.peakViewers.toLocaleString('tr-TR')}** anlık izleyici takip etti! **+${newSubs} yeni abone** ve **+${fmtMoney(donationMoney)}** bağış (Donate) kazandın!`, 'fame');
  saveGame(); renderAll(); openMenuSection('social');
}

function acquireMediaOutlet(outId, cost) {
  const ms = G.mediaStudio;
  if (ms.ownedOutlets.includes(outId)) return;
  if (G.money < cost) { showToast('Medya kuruluşu sermayesi için bakiye yetersiz!'); return; }
  const out = MEDIA_OUTLETS_DB.find(x => x.id === outId);
  if (!out) return;

  G.money -= cost;
  ms.ownedOutlets.push(outId);
  G.fame = clamp(G.fame + 18);
  if (outId === 'skor_agi_media' || outId === 'national_tv') unlockAchievement('media_mogul');

  playSfx('trophy');
  addLog(G.age, `📡 **MEDYA PATRONU!** **${out.name}** kuruluşunu bünyene kattın! Artık kamuoyunu ve reklam piyasasını doğrudan yönetiyorsun.`, 'fame');
  saveGame(); renderAll(); openMenuSection('social');
}

function setMediaEditorialFocus(focus) {
  G.mediaStudio.editorialFocus = focus;
  saveGame(); renderAll(); openMenuSection('social');
}

function triggerHeadlineBroadcast(outId) {
  const c = getCountry();
  const ms = G.mediaStudio;
  const out = MEDIA_OUTLETS_DB.find(x => x.id === outId);
  if (!out) return;

  const adBonus = Math.round(c.monthlyMinWage * (out.monthlyRevMult * 0.6));
  G.money += adBonus;

  if (ms.editorialFocus === 'politics') {
    G.politics.approval = clamp(G.politics.approval + 8);
    addLog(G.age, `📺 **${out.name}** ana haber bülteninde siyasi projelerini tanıttın! Seçmen desteğin **%${G.politics.approval}** oldu (+${fmtMoney(adBonus)} reklam).`, 'fame');
  } else if (ms.editorialFocus === 'football' && G.club && G.club.active) {
    G.club.fanTrust = clamp(G.club.fanTrust + 9);
    G.club.tffLobby = clamp((G.club.tffLobby || 50) + 8);
    addLog(G.age, `🟠 **${out.name}** özel yayınıyla kulübün **${G.club.teamName}** lehine dev kamuoyu oluşturdun! (+9 Taraftar Güveni & +${fmtMoney(adBonus)} sponsor geliri).`, 'fame');
  } else {
    addLog(G.age, `📻 **${out.name}** prime-time özel reklam kuşağından **+${fmtMoney(adBonus)}** anlık gelir elde ettin!`, 'good');
  }
  playSfx('coin');
  saveGame(); renderAll(); openMenuSection('social');
}

/* ---------------- BÖLÜM 4: EKONOMİ, YAŞ VE MENÜ KANCALARI ---------------- */
(function attachPoliticsAndMediaHooks() {
  if (window._polAndMediaHooksLoaded) return;
  window._polAndMediaHooksLoaded = true;

  // 1. Bakanlık Maaşı, Yasa Teşvikleri, Yayıncı Abone Geliri ve Medya Kârlarını Aylık Ekonomiye Bağla
  const _prevCalcFin = calculateFinances;
  calculateFinances = function () {
    ensurePoliticsAndMediaState();
    const fin = _prevCalcFin();
    if (!G || G.inPrison) return fin;
    const c = getCountry();
    const dp = G.deepPol;
    const ms = G.mediaStudio;

    // A) Bakanlık Maaşı ve Maliye/Ulaştırma Bakanlığı Bonusları
    if (dp.ministryId) {
      const min = MINISTRIES_DB.find(x => x.id === dp.ministryId);
      if (min) {
        const minGross = Math.round(c.monthlyMinWage * min.salaryMult);
        const minNet = Math.round(minGross * 0.82);
        fin.monthlyGrossSalary += minGross;
        fin.monthlyNetSalary += minNet;
        fin.monthlyNetCashflow += minNet;
      }
      if (dp.ministryId === 'ulastirma' && fin.monthlyBizProfit > 0) {
        const ulastirmaBoost = Math.round(fin.monthlyBizProfit * 0.25);
        fin.monthlyBizProfit += ulastirmaBoost;
        fin.monthlyNetCashflow += ulastirmaBoost;
      }
    }

    // B) Meclis Lojistik Yasası Bonusları
    if (dp.logisticsSubsidy > 0 && fin.monthlyBizProfit > 0) {
      const lawBoost = Math.round(fin.monthlyBizProfit * dp.logisticsSubsidy);
      fin.monthlyBizProfit += lawBoost;
      fin.monthlyNetCashflow += lawBoost;
    }

    // C) Yayıncı (Streamer) Abone Geliri + Radyo/TV Medya İmparatorluğu Aylık Geliri
    let monthlyMediaIncome = Math.round((ms.liveSubs / 100) * (c.monthlyMinWage * 0.25));
    ms.ownedOutlets.forEach(outId => {
      const out = MEDIA_OUTLETS_DB.find(x => x.id === outId);
      if (out) {
        const mult = ms.editorialFocus === 'ads' ? 1.25 : 1.0;
        monthlyMediaIncome += Math.round(c.monthlyMinWage * out.monthlyRevMult * mult);
      }
    });

    if (monthlyMediaIncome > 0) {
      fin.monthlySocialIncome += monthlyMediaIncome;
      fin.monthlyNetCashflow += monthlyMediaIncome;
    }

    fin.annualNetCashflow = fin.monthlyNetCashflow * 12;
    return fin;
  };

  // 2. +1 Yaş İlerlediğinde Yıllık Yayın Hakkını Sıfırla ve Medya Etkilerini Uygula
  const _prevAdvanceAge = advanceAge;
  advanceAge = function () {
    ensurePoliticsAndMediaState();
    if (G && G.mediaStudio) {
      G.mediaStudio.streamsThisYear = 0;
      if (G.mediaStudio.ownedOutlets.length > 0) {
        if (G.mediaStudio.editorialFocus === 'politics') {
          G.politics.approval = clamp(G.politics.approval + G.mediaStudio.ownedOutlets.length * 3);
        } else if (G.mediaStudio.editorialFocus === 'football' && G.club && G.club.active) {
          G.club.fanTrust = clamp(G.club.fanTrust + G.mediaStudio.ownedOutlets.length * 4);
        }
      }
    }
    _prevAdvanceAge();
  };

  // 3. Siyaset ve Sosyal Medya/Radyo Sekmelerini Yeni Görünümlerle Aç
  const _prevOpenMenuSec = openMenuSection;
  openMenuSection = function (sec) {
    ensurePoliticsAndMediaState();

    if (sec === 'politics') {
      const sheet = document.getElementById('bottomSheet');
      sheet.classList.remove('hidden');
      document.getElementById('sheetTitle').textContent = '🏛️ Siyaset, Meclis & Bakanlıklar';
      const dp = G.deepPol;
      document.getElementById('sheetSubtitle').textContent = dp.partyId
        ? `${dp.partyShort} • Meclis: ${dp.mySeats + dp.coalitionSeats} MV • Oy: %${G.politics.approval}`
        : `Halk Desteği: %${G.politics.approval} • Parti, Meclis & Kabine`;
      document.getElementById('sheetBody').innerHTML = renderDeepPoliticsHubHTML();
      return;
    }

    if (sec === 'social' || sec === 'media_studio') {
      if (sec === 'media_studio') activeMediaHubTab = 'empire';
      const sheet = document.getElementById('bottomSheet');
      sheet.classList.remove('hidden');
      document.getElementById('sheetTitle').textContent = '🎙️ Yayıncı Stüdyosu, Radyo & Medya';
      document.getElementById('sheetSubtitle').textContent = `Abone: ${G.mediaStudio.liveSubs.toLocaleString('tr-TR')} • Medya Kuruluşu: ${G.mediaStudio.ownedOutlets.length} Adet`;
      document.getElementById('sheetBody').innerHTML = renderMediaAndStreamerHubHTML();
      return;
    }

    _prevOpenMenuSec(sec);
  };

  // 4. Ana Menüdeki Sosyal Medya Kartını "Radyo, Medya & Yayıncı Stüdyosu" Olarak Güncelle
  const _prevOpenNav = openNavSheet;
  openNavSheet = function (tab) {
    ensurePoliticsAndMediaState();
    _prevOpenNav(tab);
    if (tab === 'menu') {
      const body = document.getElementById('sheetBody');
      if (!body) return;
      body.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Sosyal Medya')) {
          btn.innerHTML = `<div class="text-lg">🎙️</div><div class="text-xs font-extrabold text-white">Medya, Radyo &amp; Streamer</div><div class="text-[10px] text-fuchsia-300">${G.mediaStudio.liveSubs.toLocaleString('tr-TR')} Abone &bull; ${G.mediaStudio.ownedOutlets.length} Kanal</div>`;
        }
        if (btn.textContent.includes('Siyaset & Devlet')) {
          btn.innerHTML = `<div class="text-lg">🏛️</div><div class="text-xs font-extrabold text-white">Meclis &amp; Bakanlıklar</div><div class="text-[10px] text-amber-300">${G.deepPol.mySeats + G.deepPol.coalitionSeats} MV &bull; Oy %${G.politics.approval}</div>`;
        }
      });
    }
  };
})();

/* ============================================================================
   5'Lİ GERÇEKÇİ KARİYER, KPSS, İK MÜLAKATI, TERFİ VE SGK HİZMET DÖKÜMÜ MOTORU
   ============================================================================ */

let careerMainSubTab = 'portal'; // 'edu_kpss' | 'portal' | 'workplace' | 'sgk_cv'

function ensureRealisticCareerState() {
  if (!G) return;
  if (!G.career) {
    G.career = {
      degreeType: null,           // 'onlisans' | 'lisans'
      associateMajor: null,       // 2 yıllık bölüm ID
      tempGradCertificate: false, // Geçici mezuniyet belgesi (Diploma basılana kadar KPSS/İş başvurusu sağlar)
      internshipDone: false,      // Zorunlu 30 iş günü staj
      certificates: [],           // Alınan mesleki sertifikalar
      cvScore: 42,                // 0 - 100 CV Gücü
      kpssScore: 0,               // En son KPSS P93/P3 puanı
      kpssYearAge: null,
      isCivilServant: false,      // 657 Devlet Memuru mu?
      publicJobId: null,
      employerName: null,         // Aktif işveren adı (SGK Hizmet Dökümü için)
      rankIndex: 0,               // 0: Uzman Yrd, 1: Cost Controller/Sorumlu, 2: Müdür, 3: Direktör/CFO
      perfScore: 55,              // 0 - 100 İşyeri Performans & Terfi Puanı
      negotiatedBonusPct: 0,      // İK Mülakatında alınan maaş pazarlığı farkı (%)
      yearsInCurrentFirm: 0,      // Kıdem tazminatı için mevcut şirketteki yıl
      accumulatedSeverance: 0,    // Biriken Kıdem Tazminatı tutarı
      sgkDays: 0,                 // Toplam 4A/4C SGK Prim Günü (Yılda 360 gün)
      sgkHistory: [],             // Barkodlu SGK Hizmet Dökümü satırları
      unemploymentYearsLeft: 0,   // İŞKUR İşsizlik maaşı kalan yıl
      unemploymentMonthlyPay: 0,
      isRetired: false,
      pensionMonthly: 0,
      overtimeThisYear: 0,
      auditDoneThisYear: 0
    };
  }
  recalcCVScore();
}

function recalcCVScore() {
  if (!G || !G.career) return;
  const cr = G.career;
  let score = 25 + Math.round((G.smart || 60) * 0.25);
  if (G.highSchoolGrad) score += 10;
  if (cr.degreeType === 'onlisans') score += 16;
  if (G.uniGrad || cr.degreeType === 'lisans') score += 24;
  if (cr.internshipDone) score += 12;
  score += Math.min(20, (G.jobExp || 0) * 3);
  cr.certificates.forEach(cId => {
    const cert = CERTIFICATES_DB.find(x => x.id === cId);
    if (cert) score += cert.cvBoost;
  });
  cr.cvScore = clamp(score, 20, 100);
}

function getActiveJobLadderInfo() {
  ensureRealisticCareerState();
  const cr = G.career;
  if (cr.isCivilServant && cr.publicJobId) {
    const pj = KPSS_PUBLIC_JOBS_DB.find(x => x.id === cr.publicJobId) || KPSS_PUBLIC_JOBS_DB[0];
    const pubRanks = ['Aday Memur (8/1)', 'Kadrolu Uzman Memur (5/2)', 'Birim Şefi (3/1)', 'Daire Başkanı / Başmüfettiş (1/4)'];
    return {
      title: `${pj.title} — ${pubRanks[clamp(cr.rankIndex, 0, 3)]}`,
      employer: pj.employer,
      rankName: pubRanks[clamp(cr.rankIndex, 0, 3)],
      isPublic: true
    };
  }

  const job = JOBS.find(j => j.id === G.jobId);
  if (!job) return null;
  const ladderKey = job.major || (job.id.includes('lojistik') || job.id.includes('tir') ? 'lojistik' : (job.id.includes('muhasebe') ? 'isletme' : 'default'));
  const ladder = CAREER_LADDERS_DB[ladderKey] || CAREER_LADDERS_DB.default;
  const rName = ladder.ranks[clamp(cr.rankIndex, 0, 3)];
  const empName = cr.employerName || ladder.employers[0];

  return {
    title: `${job.title} (${rName})`,
    employer: empName,
    rankName: rName,
    isPublic: false
  };
}

function getJobPerksInfo(job) {
  if (!job) return { mealMult: 0.14, transport: 'Servis + Yol', healthIns: 'Tamamlayıcı Sağlık', bonusText: 'Yılda 1 Maaş Prim' };
  if (job.mult >= 3.0) {
    return { mealMult: 0.22, transport: 'Şirket Aracı + Yakıt Kartı', healthIns: 'Özel Sağlık Sigortası (ÖSS)', bonusText: 'Çift Maaş İkramiye' };
  }
  if (job.mult >= 1.8) {
    return { mealMult: 0.16, transport: 'Multinet / Ticket Yemek + Yol', healthIns: 'Tamamlayıcı Sağlık Sigortası', bonusText: 'Performans Primi' };
  }
  return { mealMult: 0.12, transport: 'Yemek Kartı + Akbil/Yol', healthIns: 'SGK 4A Güvencesi', bonusText: 'Fazla Mesai Ödemeli' };
}

/* ---------------- 1. ÖN LİSANS, DGS, STAJ VE KPSS ATAMA FONKSİYONLARI ---------------- */

window.enrollAssociateDegree = function (assocId) {
  ensureRealisticCareerState();
  const am = ASSOCIATE_MAJORS_DB.find(x => x.id === assocId);
  if (!am) return;
  if (G.lastExamScore > 0 && G.lastExamScore < am.minScore - 20) {
    showToast(`Bu ön lisans programı için en az ${am.minScore - 20} TYT puanı gerekir!`);
    return;
  }
  G.eduStage = 'Üniversite';
  G.currentMajor = am.dgsTarget;
  G.uniYearsLeft = 2; // 2 Yıllık Ön Lisans!
  G.career.degreeType = 'onlisans';
  G.career.associateMajor = am.id;
  G.uniLiving = 'kyk';
  playSfx('coin');
  addLog(G.age, `🎓 **${am.name}** (2 Yıllık Ön Lisans) programına kaydoldun! Mezuniyet sonrası ister doğrudan işe/KPSS'ye girebilir, istersen DGS ile 4 yıllığa tamamlayabilirsin.`, 'milestone');
  saveGame(); renderAll(); openNavSheet('career');
};

window.doMandatoryInternship = function () {
  ensureRealisticCareerState();
  if (G.career.internshipDone) { showToast('Zorunlu stajını zaten tamamladın!'); return; }
  const c = getCountry();
  const stipend = Math.round(c.monthlyMinWage * 0.35);
  G.career.internshipDone = true;
  G.money += stipend;
  G.jobExp = (G.jobExp || 0) + 1;
  recalcCVScore();
  playSfx('trophy');
  addLog(G.age, `📋 **ZORUNLU STAJ TAMAMLANDI!** Kurumsal bir firmada 30 iş günü staj yaparak referans mektubu aldın (+1 Yıl Deneyim, +12 CV Puanı ve +${fmtMoney(stipend)} stajyer ücreti).`, 'good');
  saveGame(); renderAll(); openNavSheet('career');
};

window.applyDGSUpgrade = function () {
  ensureRealisticCareerState();
  const cr = G.career;
  if (cr.degreeType !== 'onlisans' || !G.uniGrad) {
    showToast('DGS ile 4 yıllığa tamamlamak için önce 2 yıllık Ön Lisans bölümünden mezun olmalısın!');
    return;
  }
  const assoc = ASSOCIATE_MAJORS_DB.find(x => x.id === cr.associateMajor) || ASSOCIATE_MAJORS_DB[0];
  G.eduStage = 'Üniversite';
  G.currentMajor = assoc.dgsTarget;
  G.uniYearsLeft = 2; // 3. ve 4. sınıf
  G.uniGrad = false;
  cr.degreeType = 'lisans';
  playSfx('trophy');
  addLog(G.age, `📈 **DGS (Dikey Geçiş Sınavı) Başarısı!** 2 yıllık ön lisans diplomanı 4 yıllık **Lisans** fakültesine tamamlamak üzere 3. sınıftan eğitime başladın!`, 'milestone');
  saveGame(); renderAll(); openNavSheet('career');
};

window.takeKPSSExam = function () {
  ensureRealisticCareerState();
  if (G.age < 18 || !G.highSchoolGrad) {
    showToast('KPSS sınavına girmek için en az Lise veya Ön Lisans/Lisans mezunu (ya da geçici mezuniyet belgeli) olmalısın!');
    return;
  }
  const c = getCountry();
  const fee = Math.round(c.monthlyMinWage * 0.04);
  if (G.money < fee) { showToast('ÖSYM KPSS sınav ücreti için bakiye yetersiz!'); return; }
  G.money -= fee;

  const cr = G.career;
  let kType = 'KPSS Ortaöğretim (P94)';
  if (cr.degreeType === 'onlisans') kType = 'KPSS Ön Lisans (P93)';
  else if (G.uniGrad) kType = 'KPSS Lisans (P3)';

  const score = clamp(Math.round(54 + (G.smart * 0.34) + (G.obpScore * 0.14) + randInt(-4, 8)), 58, 98);
  cr.kpssScore = score;
  cr.kpssType = kType;
  cr.kpssYearAge = G.age;

  playSfx('trophy');
  addLog(G.age, `📝 **ÖSYM ${kType} SONUCU:** Sınavdan **${score} Puan** aldın! (Geçici mezuniyet belgen veya diplomanla kamu kadrolarına tercih yapabilirsin).`, 'milestone');
  saveGame(); renderAll(); openNavSheet('career');
};

window.assignToKPSSPublicJob = function (pubId) {
  ensureRealisticCareerState();
  const cr = G.career;
  const pj = KPSS_PUBLIC_JOBS_DB.find(x => x.id === pubId);
  if (!pj) return;
  if (G.criminalRecord) { showToast('657 Devlet Memurluğu için adli sicil kaydının temiz olması şarttır!'); return; }
  if (cr.kpssScore < pj.reqKpss) {
    showToast(`Bu kadroya atanmak için en az ${pj.reqKpss} KPSS puanı gerekiyor! (Senin puanın: ${cr.kpssScore || 0})`);
    return;
  }

  G.jobId = null;
  cr.isCivilServant = true;
  cr.publicJobId = pj.id;
  cr.employerName = pj.employer;
  cr.rankIndex = 0;
  cr.yearsInCurrentFirm = 0;
  cr.perfScore = 70;
  unlockAchievement('civil_servant_657');
  playSfx('trophy');
  addLog(G.age, `🏛️ **ÖSYM KPSS MERKEZİ ATAMA SONUCU:** **${cr.kpssScore}** puanla **${pj.title}** kadrosuna asil olarak atandın! (4C Devlet Memuru Güvencesi)`, 'fame');
  careerMainSubTab = 'workplace';
  saveGame(); renderAll(); openNavSheet('career');
};

/* ---------------- 2. İK MÜLAKATI, TEKLİF MEKTUBU VE MAAŞ PAZARLIĞI ---------------- */

window.startHRJobInterview = function (jobId) {
  ensureRealisticCareerState();
  if (G.age < 18) { showToast('Tam zamanlı çalışmak için 18+ yaşında olmalısın!'); return; }
  const j = JOBS.find(x => x.id === jobId);
  if (!j) return;

  // Ön Lisans mezunları Lojistik ve İşletme/Muhasebe işlerine başvurabilsin
  const cr = G.career;
  const hasOnlisansMatch = (cr.degreeType === 'onlisans' && G.uniGrad && (j.major === 'lojistik' || j.major === 'isletme'));

  if (j.cleanRecord && G.criminalRecord) { showToast('Adli sicil kaydın bu pozisyon için engel!'); return; }
  if (j.reqEdu === 'highschool' && !G.highSchoolGrad) { showToast('Lise diploması gerekiyor!'); return; }
  if (j.reqEdu === 'uni' && !hasOnlisansMatch && (!G.uniGrad || G.graduatedMajor !== j.major)) {
    showToast('İlgili fakülte veya ön lisans mezuniyeti (Geçici Mezuniyet Belgesi / Diploma) gerekiyor!');
    return;
  }
  if (j.reqLicense && !G.licenses[j.reqLicense]) { showToast(`${j.reqLicense} Sınıfı Sürücü Belgesi gerekiyor!`); return; }
  if (j.minExp && (G.jobExp || 0) < j.minExp && !cr.internshipDone) {
    showToast(`En az ${j.minExp} yıl deneyim veya tamamlanmış Zorunlu Staj gerekiyor!`);
    return;
  }

  const ladderKey = j.major || (j.id.includes('lojistik') || j.id.includes('tir') ? 'lojistik' : (j.id.includes('muhasebe') ? 'isletme' : 'default'));
  const ladder = CAREER_LADDERS_DB[ladderKey] || CAREER_LADDERS_DB.default;
  const pickedEmployer = pickRandom(ladder.employers);
  const baseGross = getJobMonthlyGross(j);
  const perks = getJobPerksInfo(j);

  openEventModal({
    badge: `🤝 İK & DEPARTMAN MÜDÜRÜ MÜLAKATI • CV GÜCÜ: %${cr.cvScore}`,
    title: `${pickedEmployer} — ${j.title}`,
    desc: `İnsan Kaynakları Müdürü özgeçmişini (${cr.certificates.length} Sertifika, ${G.jobExp || 0} Yıl Kıdem) inceledi. Başlangıç teklifi: Aylık ${fmtMoney(baseGross)} Brüt + ${perks.transport} + ${perks.healthIns}. Mülakat masasında nasıl ilerleyeceksin?`,
    choices: [
      {
        label: `✍️ Teklifi Kabul Et ve Sözleşmeyi İmzala (${fmtMoney(baseGross)}/ay)`,
        action: () => finalizeJobHire(j, pickedEmployer, 0)
      },
      {
        label: `💼 Sertifika & Deneyimini Gösterip +%20 Maaş Pazarlığı Yap (CV %${cr.cvScore})`,
        action: () => {
          const chance = 0.35 + (cr.cvScore / 140);
          if (Math.random() < chance) {
            finalizeJobHire(j, pickedEmployer, 20);
            addLog(G.age, `🤝 **BAŞARILI MAAŞ PAZARLIĞI!** İK yönetimi sertifikalarını ve bilginizi takdir ederek başlangıç maaşına **+%20 ek zam** onayladı!`, 'good');
          } else {
            finalizeJobHire(j, pickedEmployer, 0);
            showToast('İK bütçe limitini aşamadı, standart teklifle işe başladın.');
          }
        }
      },
      {
        label: '🚪 Teklifi Reddet ve Masadan Kalk',
        action: () => openNavSheet('career')
      }
    ]
  });
};

function finalizeJobHire(job, employerName, negotiatedBonusPct) {
  ensureRealisticCareerState();
  const cr = G.career;
  cr.isCivilServant = false;
  cr.publicJobId = null;
  G.jobId = job.id;
  cr.employerName = employerName;
  cr.rankIndex = 0;
  cr.perfScore = 60;
  cr.negotiatedBonusPct = negotiatedBonusPct || 0;
  cr.yearsInCurrentFirm = 0;
  cr.accumulatedSeverance = 0;
  cr.unemploymentYearsLeft = 0;

  unlockAchievement('first_job');
  playSfx('coin');
  addLog(G.age, `💼 **İŞE GİRİŞ BİLDİRgesi (4A):** **${employerName}** bünyesinde **${job.title}** olarak göreve başladın! SGK girişin yapıldı.`, 'milestone');
  careerMainSubTab = 'workplace';
  saveGame(); renderAll(); openNavSheet('career');
}

/* ---------------- 3. İŞYERİ OPERASYONLARI, MESAİ, TERFİ VE KIDEM TAZMİNATLI FESİH ---------------- */

window.doWorkplaceAction = function (actType) {
  ensureRealisticCareerState();
  const cr = G.career;
  const c = getCountry();
  const fin = calculateFinances();

  if (!G.jobId && !cr.isCivilServant) {
    showToast('Şu an aktif olarak çalıştığın bir işyeri yok!');
    return;
  }

  if (actType === 'overtime') {
    if (cr.overtimeThisYear >= 3) { showToast('Bu yılki fazla mesai kotanı doldurdun!'); return; }
    cr.overtimeThisYear += 1;
    const otPay = Math.round(fin.monthlyNetSalary * 0.38);
    G.money += otPay;
    cr.perfScore = clamp(cr.perfScore + 8);
    G.stress = clamp((G.stress || 10) + 9);
    playSfx('coin');
    addLog(G.age, `⏱️ **FAZLA MESAİ:** Ay sonu yoğunluğunda fazla mesaiye kalarak **+${fmtMoney(otPay)}** net mesai ücreti aldın (+8 Performans).`, 'good');
  } else if (actType === 'cost_audit') {
    if (cr.auditDoneThisYear >= 2) { showToast('Bu yılki dönem sonu mutabakat ve stok denetimini zaten yaptın!'); return; }
    cr.auditDoneThisYear += 1;
    cr.perfScore = clamp(cr.perfScore + 18);
    G.smart = clamp(G.smart + 3);
    const bonus = Math.round(c.monthlyMinWage * 0.75);
    G.money += bonus;
    playSfx('coin');
    addLog(G.age, `📊 **MALİYET KONTROL & STOK MUTABAKATI:** Ay sonu fatura, mizan ve fire raporlarını kusursuz kapattın! Yönetimden **+${fmtMoney(bonus)}** başarı primi ve **+18 Terfi Puanı** aldın.`, 'good');
  } else if (actType === 'request_promotion') {
    if (cr.rankIndex >= 3) { showToast('Zaten en üst yönetici (Direktör / CFO) kademesindesin!'); return; }
    const reqPerf = 75;
    if (cr.perfScore < reqPerf) {
      showToast(`Üst kademeye terfi için en az %${reqPerf} İşyeri Performans Puanı gerekiyor! (Mevcut: %${cr.perfScore})`);
      return;
    }
    cr.rankIndex += 1;
    cr.perfScore = 55;
    const info = getActiveJobLadderInfo();
    if (cr.rankIndex >= 1) unlockAchievement('cost_master');
    playSfx('trophy');
    addLog(G.age, `🚀 **TERFİ & UNVAN YÜKSELİŞİ!** Üstün performansın sayesinde **${info ? info.rankName : 'Yönetici'}** kademesine terfi ettin! Maaş çarpanın **x${RANK_SALARY_MULTS[cr.rankIndex]}** oldu!`, 'fame');
  } else if (actType === 'severance_quit') {
    openQuitOrSeveranceModal();
    return;
  }

  saveGame(); renderAll(); openNavSheet('career');
};

function openQuitOrSeveranceModal() {
  ensureRealisticCareerState();
  const cr = G.career;
  const c = getCountry();
  const info = getActiveJobLadderInfo();
  const sevAmt = cr.accumulatedSeverance || Math.round(c.monthlyMinWage * 1.5 * Math.max(1, cr.yearsInCurrentFirm));
  const unempPay = Math.round(c.monthlyMinWage * 0.55);

  openEventModal({
    badge: `⚖️ İŞ AKDİ FESHİ & ARABULUCULUK MASASI`,
    title: `${info ? info.employer : 'İşyeri'} — İşten Ayrılma Süreci`,
    desc: `Bu şirkette ${cr.yearsInCurrentFirm} yıldır çalışıyorsun ve içeride birikmiş ${fmtMoney(sevAmt)} Kıdem & İhbar Tazminatın bulunuyor. Nasıl ayrılmak istiyorsun?`,
    choices: [
      {
        label: `🤝 İkale / Haklı Fesih ile Tazminatını Alarak Ayrıl (+${fmtMoney(sevAmt)} + İŞKUR Maaşı)`,
        action: () => {
          G.money += sevAmt;
          G.jobId = null;
          cr.isCivilServant = false;
          cr.publicJobId = null;
          cr.accumulatedSeverance = 0;
          cr.yearsInCurrentFirm = 0;
          cr.unemploymentYearsLeft = 1;
          cr.unemploymentMonthlyPay = unempPay;
          playSfx('coin');
          addLog(G.age, `🏦 **KIDEM TAZMİNATI & İŞKUR:** İş sözleşmeni haklı nedenle feshederek **+${fmtMoney(sevAmt)} Kıdem Tazminatı** aldın ve İŞKUR'dan aylık **+${fmtMoney(unempPay)} İşsizlik Ödeneği** bağlandı!`, 'good');
          saveGame(); renderAll(); openNavSheet('career');
        }
      },
      {
        label: '📄 Düz İstifa Dilekçesi Ver (Tazminat Yanar, Hemen Çıkış)',
        action: () => {
          G.jobId = null;
          cr.isCivilServant = false;
          cr.publicJobId = null;
          cr.accumulatedSeverance = 0;
          cr.yearsInCurrentFirm = 0;
          addLog(G.age, `🚪 İstifa dilekçeni verip işten ayrıldın.`, 'normal');
          saveGame(); renderAll(); openNavSheet('career');
        }
      }
    ]
  });
}

window.buyCareerCertificate = function (certId, cost) {
  ensureRealisticCareerState();
  const cr = G.career;
  if (cr.certificates.includes(certId)) return;
  if (G.money < cost) { showToast('Sertifika eğitimi için bakiye yetersiz!'); return; }
  const cert = CERTIFICATES_DB.find(x => x.id === certId);
  if (!cert) return;

  G.money -= cost;
  cr.certificates.push(certId);
  G.smart = clamp(G.smart + 4);
  recalcCVScore();
  playSfx('trophy');
  addLog(G.age, `📜 **MESLEKİ SERTİFİKA:** **${cert.name}** eğitimini başarıyla tamamlayıp sertifikanı CV'ne ekledin! (CV Gücü: %${cr.cvScore})`, 'good');
  saveGame(); renderAll(); openNavSheet('career');
};

window.claimSGKRetirement = function () {
  ensureRealisticCareerState();
  const cr = G.career;
  if (cr.isRetired) { showToast('Zaten emeklisin!'); return; }
  if (cr.sgkDays < 5400 && G.age < 58) {
    showToast(`Emeklilik için en az 5.400 SGK Prim Günü (15 Yıl Hizmet) veya 58 Yaş gerekiyor! (Mevcut: ${cr.sgkDays} Gün)`);
    return;
  }
  const c = getCountry();
  const sev = cr.accumulatedSeverance;
  cr.isRetired = true;
  cr.pensionMonthly = Math.round(c.monthlyMinWage * 1.45);
  if (sev > 0) {
    G.money += sev;
    cr.accumulatedSeverance = 0;
  }
  unlockAchievement('retired_boss');
  playSfx('trophy');
  addLog(G.age, `🏖️ **SGK EMEKLİLİĞİ ONAYLANDI!** Toplam **${cr.sgkDays} prim günü** ile emekli oldun! Birikmiş **+${fmtMoney(sev)}** kıdem tazminatın ödendi ve ömür boyu aylık **+${fmtMoney(cr.pensionMonthly)}** emekli maaşı bağlandı!`, 'fame');
  saveGame(); renderAll(); openNavSheet('career');
};

/* ---------------- 4. YENİ 4 SEKMELİ KARİYER, İŞKUR, KPSS & SGK MERKEZİ EKRANI ---------------- */

function renderRealisticCareerHubHTML() {
  ensureRealisticCareerState();
  const c = getCountry();
  const cr = G.career;
  const activeLadder = getActiveJobLadderInfo();

  const topTabs = `
    <div class="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-2.5 text-[10px] font-extrabold">
      <button onclick="careerMainSubTab='portal'; openNavSheet('career')" class="py-2 rounded-xl ${careerMainSubTab === 'portal' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'}">💼 İlan &amp; İK</button>
      <button onclick="careerMainSubTab='workplace'; openNavSheet('career')" class="py-2 rounded-xl ${careerMainSubTab === 'workplace' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400'}">📈 İşyeri ${(G.jobId || cr.isCivilServant) ? '✓' : ''}</button>
      <button onclick="careerMainSubTab='edu_kpss'; openNavSheet('career')" class="py-2 rounded-xl ${careerMainSubTab === 'edu_kpss' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400'}">🎓 Okul &amp; KPSS</button>
      <button onclick="careerMainSubTab='sgk_cv'; openNavSheet('career')" class="py-2 rounded-xl ${careerMainSubTab === 'sgk_cv' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400'}">📋 SGK &amp; CV</button>
    </div>
  `;

  // SEKME 1: İŞYERİ YÖNETİMİ, TERFİ BASAMAKLARI, MESAİ VE BORDRO
  if (careerMainSubTab === 'workplace') {
    if (!G.jobId && !cr.isCivilServant) {
      return renderHeroBannerHTML('career') + topTabs + `
        <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
          <div class="text-sm font-extrabold text-white">Şu An Aktif Bir İşyerinde Çalışmıyorsun</div>
          <p class="text-[11px] text-slate-400">
            ${cr.unemploymentYearsLeft > 0 ? `💳 İŞKUR İşsizlik Ödeneğin Aktif: Aylık <strong>+${fmtMoney(cr.unemploymentMonthlyPay)}</strong> alıyorsun.` : 'İlan & İK sekmesinden özel sektör mülakatlarına girebilir veya Okul & KPSS sekmesinden devlet memurluğuna atanabilirsin.'}
          </p>
          <button onclick="careerMainSubTab='portal'; openNavSheet('career')" class="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold">İş İlanlarına Git &rarr;</button>
        </div>
      `;
    }

    const ladderKey = (JOBS.find(j => j.id === G.jobId) || {}).major || 'isletme';
    const ladderObj = CAREER_LADDERS_DB[ladderKey] || CAREER_LADDERS_DB.default;

    return renderHeroBannerHTML('career') + topTabs + renderPayrollSlipHTML() + `
      <div class="workplace-exec-card space-y-2.5 mb-2.5">
        <div class="flex items-start justify-between">
          <div>
            <div class="text-[9px] font-extrabold text-emerald-300 uppercase tracking-widest">🏢 ${activeLadder.employer}</div>
            <div class="text-sm font-extrabold text-white">${activeLadder.title}</div>
            <div class="text-[10px] text-slate-300">Kıdem: <strong>${cr.yearsInCurrentFirm} Yıl</strong> &bull; Biriken Kıdem Tazminatı: <strong class="text-amber-300 font-mono-num">${fmtMoney(cr.accumulatedSeverance)}</strong></div>
          </div>
          <span class="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold">Kademe ${cr.rankIndex + 1}/4</span>
        </div>

        <!-- Performans & Terfi Barı -->
        <div>
          <div class="flex justify-between text-[10px] font-bold mb-1">
            <span class="text-slate-200">📈 Yıllık Performans &amp; Terfi Puanı (Hedef %75)</span>
            <span class="font-mono-num text-emerald-400">%${cr.perfScore}</span>
          </div>
          <div class="stat-track"><div class="stat-fill bg-emerald-400" style="width:${cr.perfScore}%"></div></div>
        </div>

        <!-- 4 Kademeli Kariyer Basamakları -->
        <div class="grid grid-cols-4 gap-1 text-center text-[9px] pt-1">
          ${ladderObj.ranks.map((rTitle, idx) => `
            <div class="p-1.5 rounded-lg border ${cr.rankIndex === idx ? 'border-emerald-400 bg-emerald-500/20 text-white font-extrabold' : 'border-slate-800 bg-slate-950/70 text-slate-400'}">
              <div class="truncate">${rTitle.split(' ')[0]}</div>
              <div class="text-[8px] text-amber-300 font-mono-num">x${RANK_SALARY_MULTS[idx]}</div>
            </div>
          `).join('')}
        </div>

        <div class="grid grid-cols-2 gap-2 pt-1">
          <button onclick="doWorkplaceAction('overtime')" class="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
            ⏱️ Fazla Mesaiye Kal (+Mesai Ücreti)
          </button>
          <button onclick="doWorkplaceAction('cost_audit')" class="p-2.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 text-[11px] font-bold">
            📊 Ay Sonu Maliyet / Stok Mutabakatı
          </button>
          <button onclick="doWorkplaceAction('request_promotion')" class="p-2.5 rounded-xl bg-amber-400 text-slate-950 text-[11px] font-extrabold">
            🚀 Üst Kademeye Terfi Talep Et
          </button>
          <button onclick="doWorkplaceAction('severance_quit')" class="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold">
            ⚖️ Tazminatlı Fesih / Ayrıl
          </button>
        </div>
      </div>
    `;
  }

  // SEKME 2: OKUL, 2 YILLIK ÖN LİSANS, DGS, ZORUNLU STAJ VE KPSS ATAMA ROBOTU
  if (careerMainSubTab === 'edu_kpss') {
    return renderHeroBannerHTML('career') + topTabs + `
      <!-- Zorunlu Staj & Geçici Mezuniyet Belgesi Durumu -->
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/35 space-y-2 mb-2.5">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs font-extrabold text-white">📋 Mezuniyet, Staj &amp; Diploma Durumu</div>
            <div class="text-[10px] text-slate-400">Eğitim: <strong>${G.eduStage}</strong> &bull; Staj: <strong>${cr.internshipDone ? 'Tamamlandı ✓' : 'Yapılmadı'}</strong></div>
          </div>
          ${G.uniGrad ? `<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold">📄 Geçici Mezuniyet / Diploma Onaylı</span>` : ''}
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button onclick="doMandatoryInternship()" class="p-2 rounded-xl ${cr.internshipDone ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-500 text-slate-950'} text-[11px] font-extrabold">
            ${cr.internshipDone ? '✓ Zorunlu Staj Yapıldı' : '🏢 30 Gün Zorunlu Staj Yap (+CV)'}
          </button>
          <button onclick="applyDGSUpgrade()" class="p-2 rounded-xl ${cr.degreeType === 'onlisans' && G.uniGrad ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'} text-[11px] font-extrabold">
            📈 DGS İle 4 Yıllık Lisansa Tamamla
          </button>
        </div>
      </div>

      <!-- 2 Yıllık Ön Lisans Bölümleri -->
      ${G.age >= 18 && G.highSchoolGrad && !G.uniGrad && G.eduStage !== 'Üniversite' ? `
        <div class="p-3.5 rounded-2xl bg-slate-900 border border-sky-500/35 space-y-2 mb-2.5">
          <div class="text-xs font-extrabold text-sky-400">🎓 2 Yıllık Ön Lisans (MYO) Bölümleri (Hızlı Mezuniyet &amp; KPSS P93)</div>
          <div class="space-y-1.5">
            ${ASSOCIATE_MAJORS_DB.map(am => `
              <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <div class="text-xs font-bold text-white">${am.icon} ${am.name}</div>
                  <div class="text-[10px] text-slate-400">${am.desc}</div>
                </div>
                <button onclick="enrollAssociateDegree('${am.id}')" class="px-3 py-1.5 rounded-xl bg-sky-500 text-slate-950 text-[10px] font-extrabold shrink-0">Kayıt Ol</button>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- ÖSYM KPSS Sınavı ve Kamu Atama Tercih Robotu -->
      <div class="kpss-doc-card space-y-2.5">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[10px] font-extrabold text-sky-300 uppercase">ÖSYM &bull; KPSS MERKEZİ ATAMA ROBOTU (657 MEMURLUK)</div>
            <div class="text-xs font-extrabold text-white">KPSS Puanın: <span class="text-amber-300 font-mono-num">${cr.kpssScore ? cr.kpssScore + ' (' + cr.kpssType + ')' : 'Henüz Girilmedi'}</span></div>
          </div>
          <button onclick="takeKPSSExam()" class="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-[10px] font-extrabold shrink-0">📝 KPSS'ye Gir</button>
        </div>

        <div class="space-y-1.5 pt-1">
          ${KPSS_PUBLIC_JOBS_DB.map(pj => {
            const gross = Math.round(c.monthlyMinWage * pj.mult);
            const isAssigned = cr.isCivilServant && cr.publicJobId === pj.id;
            return `
              <div class="p-2.5 rounded-xl bg-slate-950/90 border ${isAssigned ? 'border-emerald-400' : 'border-slate-800'} flex items-center justify-between gap-2">
                <div>
                  <div class="text-xs font-bold text-white">${pj.icon} ${pj.title}</div>
                  <div class="text-[10px] text-slate-400">Taban KPSS: <strong>${pj.reqKpss} Puan</strong> &bull; Maaş: <strong class="text-emerald-400">${fmtMoney(gross)}/ay</strong></div>
                </div>
                <button onclick="assignToKPSSPublicJob('${pj.id}')" class="px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold shrink-0 ${isAssigned ? 'bg-emerald-500/20 text-emerald-300' : (cr.kpssScore >= pj.reqKpss ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500')}">
                  ${isAssigned ? 'Kadrodasın ✓' : 'Tercih Yap'}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // SEKME 3: E-DEVLET 4A/4C SGK HİZMET DÖKÜMÜ, EMEKLİLİK & SERTİFİKALAR
  if (careerMainSubTab === 'sgk_cv') {
    const sgkPct = clamp(Math.round((cr.sgkDays / 5400) * 100), 0, 100);
    return renderHeroBannerHTML('career') + topTabs + `
      <!-- Barkodlu e-Devlet SGK Tescil ve Hizmet Dökümü -->
      <div class="sgk-service-card space-y-2 mb-3">
        <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <div>
            <div class="text-[9px] font-extrabold text-sky-400 uppercase">T.C. SOSYAL GÜVENLİK KURUMU &bull; E-DEVLET KAPISI</div>
            <div class="text-xs font-extrabold text-white">4A / 4C Barkodlu SGK Tescil ve Hizmet Dökümü</div>
          </div>
          <span class="px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/40 text-sky-300 text-[9px] font-mono-num font-bold">
            ${cr.sgkDays.toLocaleString('tr-TR')} GÜN
          </span>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center text-[10px]">
          <div class="p-1.5 rounded-lg bg-slate-950 border border-slate-800"><span class="text-slate-400 block text-[8px]">SİGORTA KOLU</span><strong class="text-white">${cr.isCivilServant ? '4C (Emekli Sandığı)' : '4A (SSK Uzun Vade)'}</strong></div>
          <div class="p-1.5 rounded-lg bg-slate-950 border border-slate-800"><span class="text-slate-400 block text-[8px]">TOPLAM PRİM</span><strong class="text-emerald-400 font-mono-num">${cr.sgkDays} / 5400 Gün</strong></div>
          <div class="p-1.5 rounded-lg bg-slate-950 border border-slate-800"><span class="text-slate-400 block text-[8px]">KIDEM FONU</span><strong class="text-amber-300 font-mono-num">${fmtMoney(cr.accumulatedSeverance)}</strong></div>
        </div>

        <div>
          <div class="flex justify-between text-[9px] text-slate-400 mb-0.5"><span>Emeklilik Prim Doluş Oranı</span><span class="font-mono-num">%${sgkPct}</span></div>
          <div class="stat-track"><div class="stat-fill bg-sky-400" style="width:${sgkPct}%"></div></div>
        </div>

        ${cr.sgkHistory.length > 0 ? `
          <table class="ledger-table font-mono-num mt-1">
            <thead><tr class="text-slate-400"><th class="text-left">Yıl/Yaş</th><th class="text-left">İşveren Unvanı</th><th>Gün</th><th class="text-right">PEK / Brüt</th></tr></thead>
            <tbody>
              ${cr.sgkHistory.slice(-5).reverse().map(row => `
                <tr>
                  <td class="text-slate-300">Yaş ${row.age}</td>
                  <td class="text-white truncate max-w-[125px]">${row.employer}</td>
                  <td class="text-center text-emerald-400">360</td>
                  <td class="text-right text-slate-200">${fmtMoney(row.gross)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `<div class="text-[10px] text-slate-400 italic">Henüz adınıza yatırılmış 4A/4C SGK prim günü bulunmamaktadır.</div>`}

        <button onclick="claimSGKRetirement()" class="w-full py-2 rounded-xl ${cr.isRetired ? 'bg-emerald-500/20 text-emerald-300' : 'bg-sky-500 text-slate-950'} text-xs font-extrabold">
          ${cr.isRetired ? `✓ Emekli Maaşı Alıyorsun (+${fmtMoney(cr.pensionMonthly)}/ay)` : '🏖️ Emeklilik Dilekçesi Ver & Kıdem Tazminatını Al'}
        </button>
      </div>

      <!-- CV Gücü ve Mesleki Sertifika Akademisi -->
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-white">📄 Özgeçmiş (CV) Gücün: <span class="text-emerald-400">%${cr.cvScore}</span></span>
          <span class="text-[10px] text-slate-400">${cr.certificates.length} / ${CERTIFICATES_DB.length} Sertifika</span>
        </div>
        <div class="space-y-2 pt-1">
          ${CERTIFICATES_DB.map(cert => {
            const has = cr.certificates.includes(cert.id);
            const cost = Math.round(c.monthlyMinWage * cert.costMult);
            return `
              <div class="p-2.5 rounded-xl bg-slate-950 border ${has ? 'border-emerald-500/50' : 'border-slate-800'} flex items-center justify-between gap-2">
                <div>
                  <div class="text-xs font-extrabold text-white">${cert.icon} ${cert.name}</div>
                  <div class="text-[10px] text-slate-400">${cert.desc}</div>
                  <div class="text-[10px] text-sky-400 font-bold">+${cert.cvBoost} CV Puanı &bull; +%${cert.salaryBoostPct} Maaş Avantajı</div>
                </div>
                <button onclick="buyCareerCertificate('${cert.id}', ${cost})" class="px-3 py-1.5 rounded-xl text-[10px] font-extrabold shrink-0 ${has ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-500 text-slate-950'}">
                  ${has ? 'Alındı ✓' : fmtMoney(cost)}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // SEKME 4 (VARSAYILAN): YAN HAKLI GERÇEKÇİ KARİYER PORTALI & İK MÜLAKAT İLANLARI
  return null; // Varsayılan sekmede mevcut kariyer ekranının üstüne entegre edilir
}

/* ---------------- 5. EKONOMİ, YAŞ VE MENÜ KANCALARI ---------------- */
(function attachRealisticCareerSystem() {
  if (window._realisticCareerSystemLoaded) return;
  window._realisticCareerSystemLoaded = true;

  // 1. applyForJob ve quitJob Fonksiyonlarını İK Mülakatı ve Kıdem Tazminatı Masasına Bağla
  applyForJob = function (jobId) {
    startHRJobInterview(jobId);
  };
  quitJob = function () {
    openQuitOrSeveranceModal();
  };

  // 2. Terfi Çarpanı, Sertifika Maaş Farkı, Yemek Kartı, 657 Memur Maaşı, İşsizlik ve Emekli Maaşını Ekonomiye Bağla
  const _prevCalcFin = calculateFinances;
  calculateFinances = function () {
    ensureRealisticCareerState();
    const fin = _prevCalcFin();
    if (!G || G.inPrison) return fin;

    const c = getCountry();
    const cr = G.career;
    let extraGross = 0;
    let mealSupport = 0;

    // A) Özel Sektör Terfi Kademesi + Maaş Pazarlığı + Sertifika Farkı + Yemek Kartı
    if (G.jobId) {
      const job = JOBS.find(j => j.id === G.jobId);
      if (job) {
        const baseG = getJobMonthlyGross(job);
        const rankMult = RANK_SALARY_MULTS[clamp(cr.rankIndex, 0, 3)] || 1.0;
        const certBoostPct = cr.certificates.reduce((sum, cid) => {
          const ct = CERTIFICATES_DB.find(x => x.id === cid);
          return sum + (ct ? ct.salaryBoostPct * 0.35 : 0);
        }, 0);
        const totalMult = rankMult * (1 + (cr.negotiatedBonusPct + certBoostPct) / 100);
        extraGross += Math.max(0, Math.round(baseG * (totalMult - 1)));
        mealSupport += Math.round(c.monthlyMinWage * getJobPerksInfo(job).mealMult);
      }
    }

    // B) 657 KPSS Kamu Memuru Maaşı
    if (cr.isCivilServant && cr.publicJobId) {
      const pj = KPSS_PUBLIC_JOBS_DB.find(x => x.id === cr.publicJobId);
      if (pj) {
        const rankMult = RANK_SALARY_MULTS[clamp(cr.rankIndex, 0, 3)] || 1.0;
        extraGross += Math.round(c.monthlyMinWage * pj.mult * rankMult);
        mealSupport += Math.round(c.monthlyMinWage * 0.15);
      }
    }

    const extraNet = Math.round(extraGross * 0.78) + mealSupport;
    const pensionNet = cr.isRetired ? (cr.pensionMonthly || 0) : 0;
    const unempNet = (!G.jobId && !cr.isCivilServant && cr.unemploymentYearsLeft > 0) ? (cr.unemploymentMonthlyPay || 0) : 0;

    fin.monthlyGrossSalary += extraGross;
    fin.monthlyNetSalary += (extraNet + pensionNet + unempNet);
    fin.monthlyNetCashflow += (extraNet + pensionNet + unempNet);
    fin.annualNetCashflow = fin.monthlyNetCashflow * 12;
    return fin;
  };

  // 3. Her +1 Yaşta 360 SGK Prim Günü, Kıdem Tazminatı Birikimi ve Hizmet Dökümü Kaydı
  const _prevAdvanceAge = advanceAge;
  advanceAge = function () {
    ensureRealisticCareerState();
    const cr = G.career;
    const c = getCountry();
    cr.overtimeThisYear = 0;
    cr.auditDoneThisYear = 0;

    if (G && !G.inPrison && (G.jobId || cr.isCivilServant)) {
      const fin = calculateFinances();
      const info = getActiveJobLadderInfo();
      cr.sgkDays += 360;
      cr.yearsInCurrentFirm += 1;
      cr.perfScore = clamp(cr.perfScore + randInt(5, 11));
      cr.accumulatedSeverance += Math.max(c.monthlyMinWage, fin.monthlyGrossSalary);

      cr.sgkHistory.push({
        age: G.age + 1,
        employer: info ? info.employer : 'Kurumsal A.Ş.',
        gross: fin.monthlyGrossSalary
      });
    } else if (cr.unemploymentYearsLeft > 0) {
      cr.unemploymentYearsLeft = Math.max(0, cr.unemploymentYearsLeft - 1);
    }

    _prevAdvanceAge();
  };

  // 4. Kariyer Sekmesini 4 Sekmeli Yapıya ve Yan Haklı İlan Kartlarına Dönüştür
  const _prevOpenNav = openNavSheet;
  openNavSheet = function (tab) {
    ensureRealisticCareerState();
    if (tab === 'career' && G && !G.inPrison) {
      const customHtml = renderRealisticCareerHubHTML();
      if (customHtml !== null) {
        const sheet = document.getElementById('bottomSheet');
        sheet.classList.remove('hidden');
        document.getElementById('sheetTitle').textContent = '💼 Kariyer, İŞKUR, KPSS & SGK Merkezi';
        document.getElementById('sheetSubtitle').textContent = `CV Gücü: %${G.career.cvScore} • SGK Prim: ${G.career.sgkDays} Gün • KPSS: ${G.career.kpssScore || '-'}`;
        document.getElementById('sheetBody').innerHTML = customHtml;
        return;
      }
    }

    _prevOpenNav(tab);

    // Varsayılan 'portal' sekmesindeyken üst sekmeleri ve ilan yan hak rozetlerini enjekte et
    if (tab === 'career' && G && !G.inPrison && careerMainSubTab === 'portal') {
      const body = document.getElementById('sheetBody');
      if (!body) return;

      const topTabs = `
        <div class="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-2.5 text-[10px] font-extrabold">
          <button onclick="careerMainSubTab='portal'; openNavSheet('career')" class="py-2 rounded-xl bg-emerald-500 text-slate-950 shadow">💼 İlan &amp; İK</button>
          <button onclick="careerMainSubTab='workplace'; openNavSheet('career')" class="py-2 rounded-xl text-slate-400">📈 İşyeri ${(G.jobId || G.career.isCivilServant) ? '✓' : ''}</button>
          <button onclick="careerMainSubTab='edu_kpss'; openNavSheet('career')" class="py-2 rounded-xl text-slate-400">🎓 Okul &amp; KPSS</button>
          <button onclick="careerMainSubTab='sgk_cv'; openNavSheet('career')" class="py-2 rounded-xl text-slate-400">📋 SGK &amp; CV</button>
        </div>
      `;
      const banner = body.querySelector('.sheet-hero-banner');
      if (banner) banner.insertAdjacentHTML('afterend', topTabs);
      else body.insertAdjacentHTML('afterbegin', topTabs);

      // İlan Kartlarına Yan Hak (Multinet / ÖSS / İkramiye) Rozetleri Ekle
      const jobSection = document.getElementById('filteredJobBoardSection');
      if (jobSection) {
        jobSection.querySelectorAll('.p-3.rounded-2xl.bg-slate-900').forEach(card => {
          const btn = card.querySelector('button[onclick^="applyForJob"]');
          if (!btn) return;
          const m = (btn.getAttribute('onclick') || '').match(/'([^']+)'/);
          const jobObj = m ? JOBS.find(x => x.id === m[1]) : null;
          if (jobObj && !card.querySelector('.perk-badge')) {
            const pk = getJobPerksInfo(jobObj);
            const infoBox = card.querySelector('.min-w-0');
            if (infoBox) {
              infoBox.insertAdjacentHTML('beforeend', `
                <div class="flex flex-wrap gap-1 mt-1">
                  <span class="perk-badge">🍽️ ${pk.transport}</span>
                  <span class="perk-badge">🏥 ${pk.healthIns}</span>
                  <span class="perk-badge">🎁 ${pk.bonusText}</span>
                </div>
              `);
            }
          }
        });
      }
    }
  };
})();

/* ============================================================================
   9'LU GELİŞTİRME PAKETİ MANTIK VE GRAFİK MOTORU (GAME)
   ============================================================================ */

let activeLogFilter = 'all'; // 'all' | 'finance' | 'football' | 'official'

function ensureAdvancedMechanicsState() {
  if (!G) return;
  if (typeof G.energy !== 'number') G.energy = 100;
  if (typeof G.maxEnergy !== 'number') G.maxEnergy = 100;
  if (!G.mortgageDebt) G.mortgageDebt = 0;
}

// 7. Yıllık 100 Efor / Enerji Bütçesi Kontrolü
function consumeEnergy(cost = 15) {
  ensureAdvancedMechanicsState();
  if (G.energy < cost) {
    showToast(`Bu eylem için yeterli enerjin kalmadı! (+1 Yaş ilerle veya dinlen)`);
    return false;
  }
  G.energy -= cost;
  return true;
}

// 8. TÜFE Enflasyon Endeksi & Ocak Ayı Otomatik Maaş/Asgari Ücret Zammı
function applyJanuaryInflationAndWageRaise() {
  const c = getCountry();
  const raiseRate = Math.max(0.12, c.inflation * 0.92);
  c.monthlyMinWage = Math.round(c.monthlyMinWage * (1 + raiseRate));
  addLog(G.age, `📈 **OCAK AYI ENFLASYON ZAMMI:** Ülke enflasyonu (%${Math.round(c.inflation * 100)}) oranında asgari ücrete ve maaşlara **%${Math.round(raiseRate * 100)} refah zami** yansıtıldı! Yeni asgari ücret: ${fmtMoney(c.monthlyMinWage)}/ay.`, 'milestone');
}

// 9. Tapu ve Şirket Özsermayesine Dayalı İpotekli Ticari Kredi
window.takeMortgageLoan = function (amtMult) {
  ensureAdvancedMechanicsState();
  const c = getCountry();
  const propertyVal = G.houses.reduce((a, x) => a + (x.value || 0), 0) + G.businesses.reduce((a, x) => a + (x.typeId ? 1500000 : 0), 0);
  const maxLimit = Math.max(c.monthlyMinWage * 12, propertyVal * 0.75);

  const loanAmt = Math.round(c.monthlyMinWage * amtMult);
  if (loanAmt > maxLimit) {
    showToast(`Tapulu mülk ve şirket teminatın bu kredi limitine yetmiyor! (Max Limit: ${fmtMoney(maxLimit)})`);
    return;
  }

  G.money += loanAmt;
  G.mortgageDebt = (G.mortgageDebt || 0) + Math.round(loanAmt * 1.32);
  G.creditScore = clamp(G.creditScore + 40, 300, 1900);
  playSfx('coin');
  addLog(G.age, `🏦 **İPOTEKLİ TİCARİ KREDİ:** Gayrimenkul teminatı göstererek bankadan **+${fmtMoney(loanAmt)}** ipotekli ticari kredi çektin.`, 'good');
  saveGame(); renderAll(); openNavSheet('finance');
};

(function attachAdvancedMechanicsPatch() {
  if (window._advancedMechanicsLoaded) return;
  window._advancedMechanicsLoaded = true;

  // A) Her +1 Yaşta 100 Enerji Yenilenmesi & Ocak Zammı Tetiklemesi
  const _prevAdvanceAge = advanceAge;
  advanceAge = function () {
    ensureAdvancedMechanicsState();
    G.energy = G.maxEnergy;
    applyJanuaryInflationAndWageRaise();
    _prevAdvanceAge();
  };

  // B) Çekmece İçine Sticky Mini-HUD ve Alt Menü Bildirim Rozetleri Enjeksiyonu
  const _prevOpenNav = openNavSheet;
  openNavSheet = function (tab) {
    ensureAdvancedMechanicsState();
    _prevOpenNav(tab);

    const sheetBody = document.getElementById('sheetBody');
    if (sheetBody && G) {
      const netW = getNetWorth();
      const miniHud = `
        <div class="sticky-modal-hud">
          <span class="text-emerald-400">💵 ${fmtMoney(G.money)}</span>
          <span class="text-sky-400">📊 Net: ${fmtMoney(netW)}</span>
          <span class="text-amber-400">⚡ Efor: ${G.energy}/${G.maxEnergy}</span>
        </div>
      `;
      if (!sheetBody.querySelector('.sticky-modal-hud')) {
        sheetBody.insertAdjacentHTML('afterbegin', miniHud);
      }
    }

    // Alt Menü Bildirim Rozetleri (Badge)
    const navBtns = document.querySelectorAll('#appShell > nav button');
    const badgeMap = {
      career: (G.proPlayer && G.proPlayer.pendingOffers && G.proPlayer.pendingOffers.length > 0) ? G.proPlayer.pendingOffers.length : 0,
      finance: G.mortgageDebt > 0 ? 1 : 0
    };
    navBtns.forEach((btn, idx) => {
      const keys = ['career', 'finance', 'plus', 'relations', 'menu'];
      const k = keys[idx];
      const count = badgeMap[k] || 0;
      let existing = btn.querySelector('.nav-badge-pill');
      if (count > 0) {
        if (!existing) {
          btn.insertAdjacentHTML('beforeend', `<span class="nav-badge-pill">${count}</span>`);
        }
      } else if (existing) {
        existing.remove();
      }
    });
  };

  // C) Zaman Tüneline Hızlı Filtre Çubuğu Enjeksiyonu
  const _prevRenderLogs = renderLogs;
  renderLogs = function () {
    _prevRenderLogs();
    const container = document.getElementById('logContainer');
    if (!container || !G) return;

    if (!document.getElementById('logFilterBarContainer')) {
      const filterBar = `
        <div id="logFilterBarContainer" class="log-filter-bar">
          <button onclick="setLogFilter('all')" class="log-filter-btn ${activeLogFilter === 'all' ? 'active' : ''}">Tümü</button>
          <button onclick="setLogFilter('finance')" class="log-filter-btn ${activeLogFilter === 'finance' ? 'active' : ''}">💳 Finans</button>
          <button onclick="setLogFilter('football')" class="log-filter-btn ${activeLogFilter === 'football' ? 'active' : ''}">⚽ Futbol</button>
          <button onclick="setLogFilter('official')" class="log-filter-btn ${activeLogFilter === 'official' ? 'active' : ''}">⚖️ Resmi</button>
        </div>
      `;
      container.insertAdjacentHTML('beforebegin', filterBar);
    }

    // Filtreleme mantığı
    container.querySelectorAll('.timeline-age-block').forEach(block => {
      let hasVisible = false;
      block.querySelectorAll('.space-y-2 > div').forEach(item => {
        const txt = item.textContent || '';
        let show = true;
        if (activeLogFilter === 'finance') show = /💳|🏦|📈|📉|📊|mevduat|kredi|maaş|nakit/i.test(txt);
        else if (activeLogFilter === 'football') show = /⚽|🏆|🏟️|gol|asist|maç|transfer|scout/i.test(txt);
        else if (activeLogFilter === 'official') show = /🚨|⛓️|⚖️|MAHKEME|İCRA|MASAK|tebligat|askerlik/i.test(txt);
        item.style.display = show ? 'block' : 'none';
        if (show) hasVisible = true;
      });
      block.style.display = hasVisible ? 'block' : 'none';
    });
  };

  window.setLogFilter = function (flt) {
    activeLogFilter = flt;
    renderLogs();
  };

  // D) Portre Çevresine SVG Yaşam Halkası Enjeksiyonu
  const _prevRenderAll = renderAll;
  renderAll = function () {
    _prevRenderAll();
    const avatar = document.getElementById('charAvatar');
    if (avatar && !avatar.parentElement.classList.contains('avatar-ring-container')) {
      const parent = avatar.parentElement;
      parent.classList.add('avatar-ring-container');
      const healthPct = clamp(G ? G.health : 100);
      const strokeClr = healthPct >= 70 ? '#10b981' : (healthPct >= 40 ? '#f59e0b' : '#f43f5e');
      const offset = (100 - healthPct).toFixed(1);

      parent.insertAdjacentHTML('beforeend', `
        <svg viewBox="0 0 44 44" class="avatar-ring-svg">
          <circle cx="22" cy="22" r="19" fill="none" stroke="rgba(30,41,59,0.8)" stroke-width="3.5" />
          <circle cx="22" cy="22" r="19" fill="none" stroke="${strokeClr}" stroke-width="3.5" stroke-dasharray="100" stroke-dashoffset="${offset}" stroke-linecap="round" />
        </svg>
      `);
    }
  };
})();

/* ============================================================================
   6'LI GERÇEKÇİ SİMÜLASYON MOTORU (GAME.JS TAM ENTEGRASYON)
   ============================================================================ */

function ensureSixRealismState() {
  if (!G) return;

  // 1. 2. El Oto Ekspertiz & Al-Sat Durumu
  if (!G.usedCarTrade) {
    G.usedCarTrade = {
      inventory: [], // Alınıp sanayide toplanan 2. el araçlar
      flipsCount: 0
    };
  }

  // 2. e-Devlet Askerlik Şubesi Durumu
  if (!G.military) {
    G.military = {
      status: 'exempt_age', // 'exempt_age' | 'deferred' | 'bakaya' | 'completed'
      deferUntilAge: 22,
      doneType: null,       // 'bedelli' | 'yedek_subay' | 'er'
      dischargeAge: null
    };
  }

  // 3. Kiracı Yönetimi & UYAP E-İhale Durumu
  if (!G.realEstateExtra) {
    G.realEstateExtra = {
      houseTenants: {},     // uid -> { profileId: 'memur', unpaid: false }
      wonAuctionsThisYear: 0
    };
  }

  // 4. Dost Çevresi (Kankalar) & Ortak Girişimler
  if (!G.friendsHub) {
    G.friendsHub = {
      list: CLOSE_FRIENDS_DB.map(f => ({ ...f, trust: 78, partnered: false })),
      hangoutsThisYear: 0
    };
  }

  // 5. Altın, Döviz, Vadeli Mevduat & Kredi Kartı Ekstresi
  if (!G.fxGold) {
    G.fxGold = {
      gramGold: 0,
      usdBalance: 0,
      termDeposit: 0,       // Vadeli mevduat (Yıllık %48 faiz getirisi)
      goldPriceMult: 0.14,  // 1 Gram Altın = 0.14x Asgari Ücret
      usdPriceMult: 0.0018, // 100 USD paketi üzerinden işlem
      ccLimitMult: 2.5,
      ccStatementDebt: 0,
      ccPaidThisYear: true
    };
  }

  // 6. Şirket İçi Cost Control (Maliyet/Fire Kontrolü) & İhale
  if (!G.costControl) {
    G.costControl = {
      supplierId: 'sup_mc_erp',
      wastePct: 6,          // Fire oranı (%) - düştükçe kâr artar
      auditsThisYear: 0,
      tendersThisYear: 0
    };
  }

  updateMilitaryStatusCheck();
}

function updateMilitaryStatusCheck() {
  if (!G || !G.military || G.gender === 'Kadın') return;
  const m = G.military;
  if (m.status === 'completed') return;

  if (G.age < 20) {
    m.status = 'exempt_age';
  } else if (G.eduStage === 'Üniversite' || G.eduStage === 'Lise') {
    m.status = 'deferred';
    m.deferUntilAge = Math.max(m.deferUntilAge, G.age + 2);
  } else if (G.age <= m.deferUntilAge) {
    m.status = 'deferred';
  } else {
    m.status = 'bakaya'; // Yoklama kaçağı!
  }
}

/* ============================================================================
   1. SİSTEM: 🚗 2. EL İLAN PAZARI, EKSPERTİZ RAPORU VE SANAYİ AL-SAT
   ============================================================================ */

function renderUsedCarExpertiseMarketHTML() {
  ensureSixRealismState();
  const c = getCountry();
  const inv = G.usedCarTrade.inventory;

  const myFlipBox = inv.length === 0 ? '' : `
    <div class="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2 mb-3">
      <div class="text-xs font-extrabold text-emerald-300">🔧 Sanayi &amp; Al-Sat Garajındaki Araçlar (${inv.length})</div>
      ${inv.map((item, idx) => {
        const repCost = Math.round(c.monthlyMinWage * item.repairCostMult);
        const sellVal = Math.round(c.monthlyMinWage * (item.repaired ? item.flipMult : item.baseMult * 1.05));
        return `
          <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-extrabold text-white">${item.icon} ${item.name} ${item.repaired ? '<span class="text-emerald-400">(Sanayide Toplandı ✨)</span>' : '<span class="text-amber-400">(Ekspertizli)</span>'}</div>
                <div class="text-[10px] text-slate-400">Alış: ${fmtMoney(item.boughtPrice)} &bull; Tahmini İlan Değeri: <strong class="text-emerald-400">${fmtMoney(sellVal)}</strong></div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-1.5">
              ${!item.repaired ? `
                <button onclick="repairUsedCarInSanayi(${idx}, ${repCost})" class="py-1.5 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-extrabold">
                  🔧 Sanayide Topla (${fmtMoney(repCost)})
                </button>
              ` : `
                <button onclick="keepUsedCarInPersonalGarage(${idx})" class="py-1.5 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-300 text-[10px] font-bold">
                  🚘 Şahsi Garaja Çek
                </button>
              `}
              <button onclick="sellUsedCarWithBargain(${idx}, ${sellVal})" class="py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-extrabold">
                🤝 İlana Koy &amp; Pazarlıkla Sat
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  return myFlipBox + `
    <div class="space-y-2.5">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-extrabold uppercase tracking-wider text-amber-400">🔍 2. El İlan Pazarı &amp; TSE Oto Ekspertiz Raporu</h4>
        <span class="text-[10px] text-slate-400">Al-Sat Kârı: ${G.usedCarTrade.flipsCount} Araç</span>
      </div>
      ${USED_CAR_MARKET_DB.map((uc, idx) => {
        const askPrice = Math.round(c.monthlyMinWage * uc.baseMult);
        const bargainPrice = Math.round(askPrice * 0.88);
        const tramerAmt = Math.round(c.monthlyMinWage * uc.tramerMult);
        const getCls = (st) => st === 'Orijinal' ? 'exp-orig' : (st.includes('Boya') ? 'exp-paint' : 'exp-changed');

        return `
          <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="text-xs font-extrabold text-white">${uc.icon} ${uc.name}</div>
                <div class="text-[10px] text-slate-400 italic">"${uc.sellerNote}"</div>
                <div class="text-[10px] text-rose-400 font-mono-num mt-0.5">📋 SBM Tramer Kaydı: ${tramerAmt === 0 ? 'Kayıtsız (0 ₺)' : fmtMoney(tramerAmt)}</div>
              </div>
              <div class="text-right shrink-0">
                <div class="text-xs font-mono-num font-extrabold text-emerald-400">${fmtMoney(askPrice)}</div>
                <div class="text-[9px] text-amber-300">Pazarlıklı: ${fmtMoney(bargainPrice)}</div>
              </div>
            </div>

            <!-- 5 Bölgeli Kaporta Ekspertiz Şeması -->
            <div class="grid grid-cols-5 gap-1">
              <div class="exp-part-box ${getCls(uc.parts.kaput)}">Kaput<br>${uc.parts.kaput}</div>
              <div class="exp-part-box ${getCls(uc.parts.tavan)}">Tavan<br>${uc.parts.tavan}</div>
              <div class="exp-part-box ${getCls(uc.parts.solYan)}">Sol Yan<br>${uc.parts.solYan}</div>
              <div class="exp-part-box ${getCls(uc.parts.sagYan)}">Sağ Yan<br>${uc.parts.sagYan}</div>
              <div class="exp-part-box ${getCls(uc.parts.bagaj)}">Bagaj<br>${uc.parts.bagaj}</div>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-1">
              <button onclick="buyUsedCarWithBargain(${idx}, false)" class="py-2 rounded-xl bg-slate-800 text-white text-[10px] font-bold">
                İlan Fiyatına Al (${fmtMoney(askPrice)})
              </button>
              <button onclick="buyUsedCarWithBargain(${idx}, true)" class="py-2 rounded-xl bg-amber-400 text-slate-950 text-[10px] font-extrabold">
                🤝 Sıkı Pazarlık Yap (-%12)
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

window.buyUsedCarWithBargain = function (idx, doBargain) {
  ensureSixRealismState();
  if (!G.licenses.B) { showToast('Araç alım-satımı için B Sınıfı Ehliyet gerekir!'); return; }
  const uc = USED_CAR_MARKET_DB[idx];
  if (!uc) return;
  const c = getCountry();
  const basePrice = Math.round(c.monthlyMinWage * uc.baseMult);
  let finalPrice = basePrice;

  if (doBargain) {
    if (Math.random() < 0.72) {
      finalPrice = Math.round(basePrice * 0.88);
      showToast(`Satıcı pazarlığı kabul etti! İndirimli fiyat: ${fmtMoney(finalPrice)}`);
    } else {
      showToast('Satıcı "Son fiyatım kardeşim" dedi, liste fiyatından işlem yapılıyor.');
    }
  }

  if (G.money < finalPrice) { showToast('Nakit bakiyen bu araç için yetersiz!'); return; }
  G.money -= finalPrice;
  G.usedCarTrade.inventory.push({
    ...uc,
    boughtPrice: finalPrice,
    repaired: false
  });
  playSfx('coin');
  addLog(G.age, `🚗 **2. EL OTO ALIMI:** Ekspertiz raporunu kontrol ederek **${uc.name}** aracını **${fmtMoney(finalPrice)}** bedelle satın aldın.`, 'good');
  saveGame(); renderAll(); openMenuSection('cars');
};

window.repairUsedCarInSanayi = function (invIdx, repCost) {
  const item = G.usedCarTrade.inventory[invIdx];
  if (!item || item.repaired) return;
  if (G.money < repCost) { showToast('Sanayi kaporta ve mekanik ustası için bakiye yetersiz!'); return; }
  G.money -= repCost;
  item.repaired = true;
  item.boughtPrice += repCost;
  playSfx('coin');
  addLog(G.age, `🔧 **SANAYİ REKTİFİYE & PASTA CİLA:** **${item.name}** aracının tüm kaporta, boya ve ağır bakımlarını sanayide tamamladın! Piyasa değeri fırladı.`, 'good');
  saveGame(); renderAll(); openMenuSection('cars');
};

window.keepUsedCarInPersonalGarage = function (invIdx) {
  const item = G.usedCarTrade.inventory[invIdx];
  if (!item) return;
  G.cars.push({
    uid: uid(),
    carId: 'egea_cross',
    name: item.name,
    icon: item.icon,
    value: Math.round(getCountry().monthlyMinWage * item.flipMult),
    cond: 96,
    prestige: 14,
    INS: 0.08
  });
  G.usedCarTrade.inventory.splice(invIdx, 1);
  playSfx('trophy');
  showToast(`${item.name} şahsi garajına eklendi!`);
  saveGame(); renderAll(); openMenuSection('cars');
};

window.sellUsedCarWithBargain = function (invIdx, targetVal) {
  const item = G.usedCarTrade.inventory[invIdx];
  if (!item) return;
  const highOffer = Math.round(targetVal * 1.08);
  const fastOffer = Math.round(targetVal * 0.96);

  openEventModal({
    badge: `📲 SARI SİTE İLAN MESAJLARI • ${item.name}`,
    title: 'Aracına Ciddi Bir Alıcı Çıktı!',
    desc: `Aracın toplam maliyeti (Alış + Sanayi): ${fmtMoney(item.boughtPrice)}. Noterde nakit hazır bekleyen alıcı ${fmtMoney(fastOffer)} teklif ediyor. Nasıl yanıt vereceksin?`,
    choices: [
      {
        label: `🤝 Tok Satıcı Oyna ve ${fmtMoney(highOffer)} İste (%65 Şans)`,
        action: () => {
          const soldPrice = Math.random() < 0.65 ? highOffer : fastOffer;
          const profit = soldPrice - item.boughtPrice;
          G.money += soldPrice;
          G.usedCarTrade.inventory.splice(invIdx, 1);
          G.usedCarTrade.flipsCount += 1;
          if (profit > 0) unlockAchievement('sanayi_galerici');
          playSfx('trophy');
          addLog(G.age, `💸 **NOTER ARAÇ SATIŞI:** **${item.name}** aracını **${fmtMoney(soldPrice)}** fiyata sattın! (Net Al-Sat Kârı: **+${fmtMoney(profit)}**)`, 'good');
          saveGame(); renderAll(); openMenuSection('cars');
        }
      },
      {
        label: `💵 Hemen Notere Gidip ${fmtMoney(fastOffer)} Nakite Devret`,
        action: () => {
          const profit = fastOffer - item.boughtPrice;
          G.money += fastOffer;
          G.usedCarTrade.inventory.splice(invIdx, 1);
          G.usedCarTrade.flipsCount += 1;
          if (profit > 0) unlockAchievement('sanayi_galerici');
          playSfx('coin');
          addLog(G.age, `💸 **NOTER ARAÇ SATIŞI:** **${item.name}** aracını **${fmtMoney(fastOffer)}** bedelle devrettin (Net Kâr: +${fmtMoney(profit)}).`, 'good');
          saveGame(); renderAll(); openMenuSection('cars');
        }
      }
    ]
  });
};

/* ============================================================================
   2. SİSTEM: 🪖 E-DEVLET ASKERLİK ŞUBESİ (TECİL, BEDELLİ, YEDEK SUBAY/TEĞMEN)
   ============================================================================ */

function renderMilitaryServiceBranchHTML() {
  ensureSixRealismState();
  const c = getCountry();
  const m = G.military;
  const bedelliCost = Math.round(c.monthlyMinWage * 10.5);
  const tegmenMonthly = Math.round(c.monthlyMinWage * 3.1);

  const statusLabels = {
    exempt_age: '⏳ Askerlik Çağına Girmedi (20 Yaş Altı)',
    deferred: `📄 Öğrenci / Mezun Tecilli (${m.deferUntilAge} Yaşına Kadar Tecilli)`,
    bakaya: '🚨 YOKLAMA KAÇAĞI (BAKAYA) — Kurumsal İş Başvurularında Engel!',
    completed: `🎖️ Muvazzaf Askerlik Hizmetini Tamamladı (${m.doneType === 'yedek_subay' ? 'Yedek Subay / Teğmen' : (m.doneType === 'bedelli' ? 'Bedelli Er' : 'Er/Erbaş')})`
  };

  return `
    <div class="military-doc-card space-y-2.5 mb-3">
      <div class="flex items-center justify-between border-b border-emerald-500/30 pb-2">
        <div>
          <div class="text-[9px] font-extrabold text-emerald-400 uppercase">T.C. MİLLÎ SAVUNMA BAKANLIĞI &bull; ASAL Dairesi</div>
          <div class="text-xs font-extrabold text-white">Barkodlu Askerlik Durum Belgesi</div>
        </div>
        <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono-num font-bold">MSB-${G.age}04</span>
      </div>

      <div class="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-bold ${m.status === 'bakaya' ? 'text-rose-400' : 'text-emerald-300'}">
        ${statusLabels[m.status] || statusLabels.deferred}
      </div>

      ${m.status !== 'completed' ? `
        <div class="space-y-2 pt-1">
          <button onclick="doMilitaryAction('defer')" class="w-full p-2.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-bold text-left flex justify-between items-center">
            <span>📅 Mezuniyet / Eğitim Hakkıyla 2 Yıl Tecil Ettir</span>
            <span class="text-[10px] font-extrabold">Ücretsiz</span>
          </button>

          <button onclick="doMilitaryAction('bedelli', ${bedelliCost})" class="w-full p-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold text-left flex justify-between items-center">
            <span>💳 1 Ay Bedelli Askerlik Yap (İş Kaybı Olmaz)</span>
            <span class="font-mono-num">${fmtMoney(bedelliCost)}</span>
          </button>

          <button onclick="doMilitaryAction('yedek_subay', ${tegmenMonthly})" class="w-full p-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold text-left flex justify-between items-center">
            <span>⭐ 12 Ay Yedek Subay / Astsubay (Teğmen Maaşlı + 360 SGK Günü)</span>
            <span class="font-mono-num">+${fmtMoney(tegmenMonthly * 12)}</span>
          </button>

          <button onclick="doMilitaryAction('er', 0)" class="w-full p-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold text-left flex justify-between items-center">
            <span>🪖 6 Ay Er / Erbaş Olarak Hizmeti Tamamla</span>
            <span class="text-[10px] text-emerald-400">Terhis Belgesi</span>
          </button>
        </div>
      ` : `
        <div class="text-[11px] text-slate-300">Askerlik yükümlülüğünü ${m.dischargeAge} yaşında tamamladın. Tüm kamu ve kurumsal pozisyonlarda askerlik şartın onaylıdır.</div>
      `}
    </div>
  `;
}

window.doMilitaryAction = function (act, amount) {
  ensureSixRealismState();
  const m = G.military;
  if (m.status === 'completed') { showToast('Askerlik görevini zaten tamamladın!'); return; }

  if (act === 'defer') {
    if (G.age >= 29) { showToast('29 yaş üstünde tecil hakkın doldu! Askerlik hizmetini yapmalısın.'); return; }
    m.status = 'deferred';
    m.deferUntilAge = G.age + 2;
    playSfx('coin');
    addLog(G.age, `📅 **ASKERLİK TECİLİ:** e-Devlet ASAL üzerinden askerlik yoklamanı **${m.deferUntilAge} yaşına kadar** tecil ettirdin.`, 'normal');
  } else if (act === 'bedelli') {
    if (G.money < amount) { showToast('Bedelli askerlik ücreti için banka bakiyen yetersiz!'); return; }
    G.money -= amount;
    m.status = 'completed';
    m.doneType = 'bedelli';
    m.dischargeAge = G.age;
    playSfx('trophy');
    addLog(G.age, `🪖 **BEDELLİ ASKERLİK TERHİSİ:** **-${fmtMoney(amount)}** bedelli ücretini yatırıp 28 günlük temel askerlik eğitimini tamamlayarak terhis oldun!`, 'milestone');
  } else if (act === 'yedek_subay') {
    if (!G.uniGrad && (!G.career || G.career.degreeType !== 'onlisans')) {
      showToast('Yedek Subay / Astsubay (Teğmen) olmak için Ön Lisans veya Lisans mezunu olmalısın!');
      return;
    }
    const annualPay = amount * 12;
    G.money += annualPay;
    m.status = 'completed';
    m.doneType = 'yedek_subay';
    m.dischargeAge = G.age;
    if (G.career) {
      G.career.sgkDays += 360;
      G.career.cvScore = clamp(G.career.cvScore + 12, 20, 100);
    }
    unlockAchievement('tegmen_terhis');
    playSfx('trophy');
    addLog(G.age, `⭐ **YEDEK SUBAY (TEĞMEN) TERHİSİ:** 12 ay boyunca takım komutanı olarak görev yapıp **+${fmtMoney(annualPay)}** subay maaşı ve **+360 gün 4C SGK primi** kazanarak terhis oldun!`, 'fame');
  } else if (act === 'er') {
    m.status = 'completed';
    m.doneType = 'er';
    m.dischargeAge = G.age;
    G.health = clamp(G.health + 6);
    playSfx('trophy');
    addLog(G.age, `🪖 **TERHİS BELGESİ:** 6 aylık vatani görevini başarıyla tamamlayıp tezkereni aldın!`, 'milestone');
  }

  saveGame(); renderAll(); openMenuSection('license');
};

/* ============================================================================
   3. SİSTEM: 🏠 KİRACI YÖNETİMİ, TAHLİYE DAVASI VE UYAP E-İHALE (İCRADAN SATIŞ)
   ============================================================================ */

function renderTenantAndUyapPanelHTML() {
  ensureSixRealismState();
  const c = getCountry();
  const re = G.realEstateExtra;

  // 1. Mevcut Evlerin Kiracı Profili ve Tahliye Yönetimi
  const tenantHtml = G.houses.length === 0 ? '' : `
    <div class="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-2.5 mb-3">
      <div class="text-xs font-extrabold text-emerald-300">🔑 Kiracı Profili Seçimi &amp; Tahliye / İcra Yönetimi</div>
      ${G.houses.map(h => {
        if (!re.houseTenants[h.uid]) re.houseTenants[h.uid] = { profileId: 'memur', unpaid: false };
        const tState = re.houseTenants[h.uid];
        const prof = TENANT_PROFILES_DB.find(p => p.id === tState.profileId) || TENANT_PROFILES_DB[0];
        const effRent = Math.round(h.monthlyRent * prof.rentBonusMult);

        return `
          <div class="p-2.5 rounded-xl bg-slate-950 border ${tState.unpaid ? 'border-rose-500' : 'border-slate-800'} space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-extrabold text-white">${h.icon} ${h.name}</div>
                <div class="text-[10px] ${tState.unpaid ? 'text-rose-400 font-bold' : 'text-emerald-400'}">
                  ${tState.unpaid ? '🚨 Kiracı Kirayı Taktı! (Tahliye Davası Aç)' : `Aktif Kiracı: ${prof.name} (+${fmtMoney(effRent)}/ay)`}
                </div>
              </div>
              ${tState.unpaid ? `
                <button onclick="evictBadTenant('${h.uid}')" class="px-2.5 py-1.5 rounded-lg bg-rose-500 text-white text-[10px] font-extrabold">
                  ⚖️ İcra İle Tahliye Et
                </button>
              ` : ''}
            </div>
            <div class="grid grid-cols-3 gap-1 text-[9px]">
              ${TENANT_PROFILES_DB.map(tp => `
                <button onclick="setHouseTenantProfile('${h.uid}', '${tp.id}')" class="py-1 px-1.5 rounded border font-bold ${tState.profileId === tp.id ? 'border-emerald-400 bg-emerald-500/20 text-white' : 'border-slate-800 text-slate-400'}">
                  ${tp.name.split(' ')[1]} (x${tp.rentBonusMult})
                </button>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // 2. UYAP E-İhale İcradan Kelepir Gayrimenkul ve Araç Müzayedesi
  const uyapHtml = `
    <div class="uyap-auction-card space-y-2.5 mb-3">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-[9px] font-extrabold text-indigo-300 uppercase tracking-widest">⚖️ T.C. ADALET BAKANLIĞI &bull; UYAP E-İHALE PORTALI</div>
          <div class="text-xs font-extrabold text-white">İcradan %40 İndirimli Gayrimenkul &amp; Araç Satışları</div>
        </div>
        <span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold">Canlı İhale</span>
      </div>

      <div class="space-y-2">
        ${UYAP_AUCTIONS_DB.map((au, idx) => {
          const marketVal = Math.round(c.monthlyMinWage * au.marketMult);
          const bidCost = Math.round(c.monthlyMinWage * au.bidMult);
          return `
            <div class="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2">
              <div>
                <div class="text-xs font-extrabold text-white">${au.icon} ${au.name}</div>
                <div class="text-[10px] text-slate-400">Rayiç Değer: <span class="line-through">${fmtMoney(marketVal)}</span> &bull; İhale Bedeli: <strong class="text-emerald-400">${fmtMoney(bidCost)}</strong></div>
              </div>
              <button onclick="bidOnUyapAuction(${idx}, ${bidCost}, ${marketVal})" class="px-3 py-1.5 rounded-xl bg-indigo-500 text-white text-[10px] font-extrabold shrink-0">
                🔨 Teklif Ver
              </button>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  return tenantHtml + uyapHtml;
}

window.setHouseTenantProfile = function (houseUid, profileId) {
  ensureSixRealismState();
  G.realEstateExtra.houseTenants[houseUid] = { profileId, unpaid: false };
  playSfx('coin');
  saveGame(); renderAll(); openMenuSection('houses');
};

window.evictBadTenant = function (houseUid) {
  ensureSixRealismState();
  const c = getCountry();
  const backRent = Math.round(c.monthlyMinWage * 3.2);
  G.realEstateExtra.houseTenants[houseUid] = { profileId: 'memur', unpaid: false };
  G.money += backRent;
  playSfx('trophy');
  addLog(G.age, `⚖️ **İCRA & TAHLİYE KARARI:** İcra memuru eşliğinde kiracıyı tahliye ettin ve birikmiş **+${fmtMoney(backRent)}** kira alacağını faiziyle tahsil ettin!`, 'good');
  saveGame(); renderAll(); openMenuSection('houses');
};

window.bidOnUyapAuction = function (idx, bidCost, marketVal) {
  ensureSixRealismState();
  if (G.realEstateExtra.wonAuctionsThisYear >= 2) {
    showToast('Bu yıl en fazla 2 UYAP E-İhalesine katılabilirsin!');
    return;
  }
  if (G.money < bidCost) { showToast('UYAP E-İhale teminatı ve nakit bedeli için bakiye yetersiz!'); return; }

  const au = UYAP_AUCTIONS_DB[idx];
  G.money -= bidCost;
  G.realEstateExtra.wonAuctionsThisYear += 1;

  if (Math.random() < 0.78) {
    const c = getCountry();
    if (au.type === 'house') {
      G.houses.push({
        uid: uid(),
        houseId: au.houseId,
        name: au.name.replace(' (İcradan)', '').replace(' (Bankadan)', ''),
        icon: au.icon,
        value: marketVal,
        monthlyRent: Math.round(c.monthlyMinWage * au.rentMult)
      });
    } else {
      G.cars.push({
        uid: uid(),
        carId: au.carId,
        name: au.name.replace('İcralık ', ''),
        icon: au.icon,
        value: marketVal,
        cond: 92,
        prestige: au.prestige || 15,
        INS: 0.1
      });
    }
    unlockAchievement('uyap_hunter');
    playSfx('trophy');
    addLog(G.age, `🔨 **UYAP E-İHALE ZAFERİ!** Rayiç değeri ${fmtMoney(marketVal)} olan **${au.name}** varlığını icradan **${fmtMoney(bidCost)}** bedelle satın aldın!`, 'fame');
  } else {
    G.money += bidCost; // İhaleyi başkası artırdı, teminat iade edildi
    showToast('Son saniyede başka bir yatırımcı teklifi yükseltti! Teminatın iade edildi.');
  }
  saveGame(); renderAll(); openMenuSection('houses');
};

/* ============================================================================
   4. SİSTEM: 🤝 DOST ÇEVRESİ (KANKALAR), ORTAK GİRİŞİM & KEFİLLİK
   ============================================================================ */

function renderCloseFriendsAndVenturesHTML() {
  ensureSixRealismState();
  const c = getCountry();
  const fh = G.friendsHub;
  const hangoutCost = Math.round(c.monthlyMinWage * 0.25);

  return `
    <div class="p-3.5 rounded-2xl bg-slate-900 border border-sky-500/40 space-y-2.5 mt-3">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs font-extrabold text-sky-400">🤝 Dost Çevresi (Kankalar) &amp; Ortak Girişimler</div>
          <div class="text-[10px] text-slate-400">Arkadaşlarınla sosyalleşerek stresi sıfırla veya %50-%50 ortak proje kur!</div>
        </div>
        <button onclick="hangoutWithFriends(${hangoutCost})" class="px-3 py-1.5 rounded-xl bg-sky-500 text-slate-950 text-[10px] font-extrabold shrink-0">
          ⚽ Halı Saha / Tatil (${fmtMoney(hangoutCost)})
        </button>
      </div>

      <div class="space-y-2 pt-1">
        ${fh.list.map((fr, idx) => {
          const vCost = Math.round(c.monthlyMinWage * fr.ventureCostMult);
          const vRev = Math.round(c.monthlyMinWage * fr.monthlyReturnMult);
          return `
            <div class="p-2.5 rounded-xl bg-slate-950 border ${fr.partnered ? 'border-emerald-500/50' : 'border-slate-800'} space-y-1.5">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-xs font-extrabold text-white">👤 ${fr.name} <span class="text-[10px] text-sky-400 font-normal">(${fr.role})</span></div>
                  <div class="text-[10px] text-slate-400">Ortak Proje: <strong>${fr.ventureName}</strong></div>
                  <div class="text-[10px] text-emerald-400 font-mono-num">Senin %50 Kâr Payın: +${fmtMoney(vRev)}/ay</div>
                </div>
                <button onclick="startFriendJointVenture(${idx}, ${vCost})" class="px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold shrink-0 ${fr.partnered ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-500 text-slate-950'}">
                  ${fr.partnered ? 'Ortaklık Aktif ✓' : `Ortak Ol (${fmtMoney(vCost)})`}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

window.hangoutWithFriends = function (cost) {
  ensureSixRealismState();
  if (G.friendsHub.hangoutsThisYear >= 3) { showToast('Bu yıl arkadaşlarla yeterince etkinlik yaptın!'); return; }
  if (G.money < cost) { showToast('Etkinlik için bakiye yetersiz!'); return; }
  G.money -= cost;
  G.friendsHub.hangoutsThisYear += 1;
  G.happy = clamp(G.happy + 16);
  G.stress = clamp((G.stress || 20) - 22, 0, 100);
  G.friendsHub.list.forEach(f => { f.trust = clamp(f.trust + 8); });
  playSfx('coin');
  addLog(G.age, `⚽ **DOSTLARLA BULUŞMA:** Muhammed, Çağrı ve Emin ile halı saha maçı yapıp hafta sonu kaçamağı organize ettiniz! Stresin düştü, moralin tavan yaptı.`, 'good');
  saveGame(); renderAll(); openNavSheet('relations');
};

window.startFriendJointVenture = function (idx, cost) {
  ensureSixRealismState();
  const fr = G.friendsHub.list[idx];
  if (!fr || fr.partnered) return;
  if (G.money < cost) { showToast('Ortak girişim sermayesi için bakiye yetersiz!'); return; }
  G.money -= cost;
  fr.partnered = true;
  playSfx('trophy');
  addLog(G.age, `🚀 **%50-%50 ORTAK GİRİŞİM:** Yakın dostun **${fr.name}** ile **${fr.ventureName}** projesini kurup hayata geçirdiniz!`, 'milestone');
  saveGame(); renderAll(); openNavSheet('relations');
};

/* ============================================================================
   5. SİSTEM: 🪙 GRAM ALTIN, DÖVİZ, VADELİ MEVDUAT & KREDİ KARTI EKSTRESİ
   ============================================================================ */

function renderGoldFxAndDepositPanelHTML() {
  ensureSixRealismState();
  const c = getCountry();
  const fg = G.fxGold;

  const goldUnitPrice = Math.round(c.monthlyMinWage * fg.goldPriceMult);
  const fxPackPrice = Math.round(c.monthlyMinWage * 0.5); // 1 Döviz Sepeti Paketi
  const goldTotalVal = fg.gramGold * goldUnitPrice;
  const fxTotalVal = fg.usdBalance * fxPackPrice;
  const annualInterest = Math.round(fg.termDeposit * 0.48);
  const ccMax = Math.round(c.monthlyMinWage * fg.ccLimitMult);

  return `
    <div class="fx-gold-card space-y-2.5 mb-3">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-[9px] font-extrabold text-amber-400 uppercase tracking-widest">🪙 KAPALIÇARŞI ALTIN, DÖVİZ &amp; VADELİ MEVDUAT SEPETİ</div>
          <div class="text-xs font-extrabold text-white">Enflasyon Korumalı Varlık Yönetimi</div>
        </div>
        <span class="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-mono-num font-bold">%48 Mevduat Faizi</span>
      </div>

      <div class="grid grid-cols-3 gap-1.5 text-center text-[10px]">
        <div class="p-2 rounded-xl bg-slate-950 border border-slate-800">
          <div class="text-[8px] text-amber-400">GRAM ALTIN (24K)</div>
          <div class="font-extrabold font-mono-num text-white">${fg.gramGold} Gr</div>
          <div class="text-[9px] text-emerald-400">${fmtMoney(goldTotalVal)}</div>
        </div>
        <div class="p-2 rounded-xl bg-slate-950 border border-slate-800">
          <div class="text-[8px] text-sky-400">DÖVİZ SEPETİ ($/€)</div>
          <div class="font-extrabold font-mono-num text-white">${fg.usdBalance} Lot</div>
          <div class="text-[9px] text-emerald-400">${fmtMoney(fxTotalVal)}</div>
        </div>
        <div class="p-2 rounded-xl bg-slate-950 border border-slate-800">
          <div class="text-[8px] text-emerald-400">VADELİ MEVDUAT</div>
          <div class="font-extrabold font-mono-num text-white">${fmtMoney(fg.termDeposit)}</div>
          <div class="text-[9px] text-amber-300">+${fmtMoney(Math.round(annualInterest / 12))}/ay</div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-1.5 text-[10px] font-extrabold">
        <button onclick="tradeGoldOrFx('buy_gold', ${goldUnitPrice * 5})" class="py-2 rounded-xl bg-amber-400 text-slate-950">+5 Gr Altın Al</button>
        <button onclick="tradeGoldOrFx('buy_fx', ${fxPackPrice * 2})" class="py-2 rounded-xl bg-sky-500 text-slate-950">+Döviz Al</button>
        <button onclick="tradeGoldOrFx('deposit_add', ${ c.monthlyMinWage * 2 })" class="py-2 rounded-xl bg-emerald-500 text-slate-950">+Vadeliye Yatır</button>
      </div>
      ${(fg.gramGold > 0 || fg.usdBalance > 0 || fg.termDeposit > 0) ? `
        <button onclick="tradeGoldOrFx('liquidate_all', 0)" class="w-full py-1.5 rounded-xl bg-slate-800 text-amber-300 text-[10px] font-bold">
          💱 Tüm Altın, Döviz ve Vadeli Mevduatı Nakite Çevir (+${fmtMoney(goldTotalVal + fxTotalVal + fg.termDeposit)})
        </button>
      ` : ''}
    </div>

    <!-- Kredi Kartı Ekstre & Findeks Yönetimi -->
    <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 mb-3">
      <div class="flex items-center justify-between text-xs">
        <span class="font-extrabold text-white">💳 Kredi Kartı Ekstresi: <strong class="text-rose-400 font-mono-num">${fmtMoney(fg.ccStatementDebt)}</strong></span>
        <span class="text-[10px] text-slate-400">Limit: ${fmtMoney(ccMax)}</span>
      </div>
      <div class="grid grid-cols-3 gap-1.5 text-[10px] font-extrabold">
        <button onclick="manageCreditCard('spend', ${Math.round(c.monthlyMinWage * 0.8)})" class="py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">Karttan Nakit Avans</button>
        <button onclick="manageCreditCard('pay_min', 0)" class="py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">Asgari Öde (%20)</button>
        <button onclick="manageCreditCard('pay_full', 0)" class="py-2 rounded-xl bg-emerald-500 text-slate-950">Tam Ekstre Kapat</button>
      </div>
    </div>
  `;
}

window.tradeGoldOrFx = function (act, cost) {
  ensureSixRealismState();
  const c = getCountry();
  const fg = G.fxGold;

  if (act === 'buy_gold') {
    if (G.money < cost) { showToast('5 Gram Altın almak için nakit yetersiz!'); return; }
    G.money -= cost;
    fg.gramGold += 5;
    playSfx('coin');
  } else if (act === 'buy_fx') {
    if (G.money < cost) { showToast('Döviz sepeti için nakit yetersiz!'); return; }
    G.money -= cost;
    fg.usdBalance += 2;
    playSfx('coin');
  } else if (act === 'deposit_add') {
    if (G.money < cost) { showToast('Vadeli mevduat hesabı için nakit yetersiz!'); return; }
    G.money -= cost;
    fg.termDeposit += cost;
    playSfx('coin');
  } else if (act === 'liquidate_all') {
    const goldVal = fg.gramGold * Math.round(c.monthlyMinWage * fg.goldPriceMult);
    const fxVal = fg.usdBalance * Math.round(c.monthlyMinWage * 0.5);
    const total = goldVal + fxVal + fg.termDeposit;
    G.money += total;
    fg.gramGold = 0;
    fg.usdBalance = 0;
    fg.termDeposit = 0;
    playSfx('trophy');
    addLog(G.age, `💱 Altın, döviz ve vadeli mevduat birikimlerini bozdurarak **+${fmtMoney(total)}** nakit elde ettin!`, 'good');
  }
  saveGame(); renderAll(); openNavSheet('finance');
};

window.manageCreditCard = function (act, amt) {
  ensureSixRealismState();
  const c = getCountry();
  const fg = G.fxGold;
  const maxLim = Math.round(c.monthlyMinWage * fg.ccLimitMult);

  if (act === 'spend') {
    if (fg.ccStatementDebt + amt > maxLim) { showToast('Kredi kartı kullanılabilir limitin doldu!'); return; }
    G.money += amt;
    fg.ccStatementDebt += Math.round(amt * 1.08);
    playSfx('coin');
  } else if (act === 'pay_min') {
    if (fg.ccStatementDebt <= 0) return;
    const minPay = Math.round(fg.ccStatementDebt * 0.20);
    if (G.money < minPay) { showToast('Asgari ödeme tutarı için bakiye yetersiz!'); return; }
    G.money -= minPay;
    fg.ccStatementDebt = Math.round((fg.ccStatementDebt - minPay) * 1.15);
    G.creditScore = clamp(G.creditScore + 15, 300, 1900);
    playSfx('coin');
  } else if (act === 'pay_full') {
    if (fg.ccStatementDebt <= 0) return;
    if (G.money < fg.ccStatementDebt) { showToast('Tam ekstre borcunu kapatmak için bakiye yetersiz!'); return; }
    G.money -= fg.ccStatementDebt;
    fg.ccStatementDebt = 0;
    fg.ccLimitMult = Math.min(12, fg.ccLimitMult + 0.5);
    G.creditScore = clamp(G.creditScore + 65, 300, 1900);
    playSfx('trophy');
    showToast('Ekstre tam ödendi! Findeks notun ve kart limitin yükseldi.');
  }
  saveGame(); renderAll(); openNavSheet('finance');
};

/* ============================================================================
   6. SİSTEM: 📊 ŞİRKET İÇİ COST CONTROL, TEDARİKÇİ VE İHALE MASASI
   ============================================================================ */

function renderCompanyCostControlPanelHTML() {
  ensureSixRealismState();
  if (G.businesses.length === 0) return '';
  const c = getCountry();
  const cc = G.costControl;
  const curSup = COST_CONTROL_SUPPLIERS_DB.find(s => s.id === cc.supplierId) || COST_CONTROL_SUPPLIERS_DB[1];

  return `
    <div class="cost-control-card space-y-2.5 mb-3">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-[9px] font-extrabold text-sky-400 uppercase tracking-widest">📊 COST CONTROL (MALİYET KONTROL) &amp; TEDARİK ZİNCİRİ</div>
          <div class="text-xs font-extrabold text-white">Aktif Tedarikçi: ${curSup.name}</div>
        </div>
        <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono-num font-bold">Fire: %${cc.wastePct}</span>
      </div>

      <div class="grid grid-cols-3 gap-1 text-[9.5px]">
        ${COST_CONTROL_SUPPLIERS_DB.map(sup => `
          <button onclick="selectCompanySupplier('${sup.id}')" class="p-2 rounded-xl border text-left ${cc.supplierId === sup.id ? 'border-sky-400 bg-sky-500/20 text-white font-extrabold' : 'border-slate-800 bg-slate-950 text-slate-400'}">
            <div class="truncate">${sup.name.split(' ')[0]}</div>
            <div class="text-emerald-400">-%${sup.costCutPct} Maliyet</div>
          </button>
        `).join('')}
      </div>

      <button onclick="runMaterialsCostAudit()" class="w-full py-2 rounded-xl bg-sky-500 text-slate-950 text-xs font-extrabold">
        🔍 Materials Control &amp; Stok/Fire Denetimi Yap (Fireyi Düşür &amp; Net Kârı Artır)
      </button>

      <div class="border-t border-slate-800 pt-2 space-y-1.5">
        <div class="text-[10px] font-extrabold text-amber-300 uppercase">📑 Kurumsal &amp; Uluslararası Sevkiyat İhaleleri</div>
        ${CORPORATE_TENDERS_DB.map((tnd, idx) => {
          const cost = Math.round(c.monthlyMinWage * tnd.costMult);
          const pay = Math.round(c.monthlyMinWage * tnd.payoutMult);
          return `
            <div class="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <div>
                <div class="text-[11px] font-bold text-white">${tnd.title}</div>
                <div class="text-[9.5px] text-slate-400">Operasyon Maliyeti: ${fmtMoney(cost)} &bull; İhale Hakedişi: <strong class="text-emerald-400">+${fmtMoney(pay)}</strong></div>
              </div>
              <button onclick="enterCorporateTender(${idx}, ${cost}, ${pay})" class="px-2.5 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-extrabold shrink-0">
                İhaleye Gir
              </button>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

window.selectCompanySupplier = function (supId) {
  ensureSixRealismState();
  const sup = COST_CONTROL_SUPPLIERS_DB.find(x => x.id === supId);
  if (!sup) return;
  G.costControl.supplierId = sup.id;
  G.costControl.wastePct = sup.baseWastePct;
  playSfx('coin');
  saveGame(); renderAll(); openNavSheet('finance');
};

window.runMaterialsCostAudit = function () {
  ensureSixRealismState();
  const cc = G.costControl;
  if (cc.auditsThisYear >= 2) { showToast('Bu yılki stok ve fire denetimlerini tamamladın!'); return; }
  cc.auditsThisYear += 1;
  cc.wastePct = Math.max(1, cc.wastePct - 3);
  const c = getCountry();
  const savingBonus = Math.round(c.monthlyMinWage * 1.8 * G.businesses.length);
  G.money += savingBonus;
  playSfx('trophy');
  addLog(G.age, `📊 **COST CONTROL DENETİMİ:** Tedarikçi faturalarını ve depo stoklarını denetleyerek fire oranını **%${cc.wastePct}** seviyesine indirdin! Şirket kasasına **+${fmtMoney(savingBonus)}** maliyet tasarrufu sağlandı.`, 'good');
  saveGame(); renderAll(); openNavSheet('finance');
};

window.enterCorporateTender = function (idx, cost, payout) {
  ensureSixRealismState();
  const cc = G.costControl;
  if (cc.tendersThisYear >= 2) { showToast('Bu yıl en fazla 2 büyük kurumsal ihaleye girebilirsin!'); return; }
  const tnd = CORPORATE_TENDERS_DB[idx];
  const totalFleet = G.businesses.reduce((s, b) => s + (b.fleet || 1), 0);
  if (totalFleet < tnd.reqFleet) {
    showToast(`Bu ihale için şirketlerinde toplam en az ${tnd.reqFleet} araç/filo kapasitesi olmalı!`);
    return;
  }
  if (G.money < cost) { showToast('İhale operasyon ve yakıt/hammadde maliyeti için bakiye yetersiz!'); return; }

  G.money -= cost;
  cc.tendersThisYear += 1;
  G.money += payout;
  playSfx('trophy');
  addLog(G.age, `📑 **KURUMSAL İHALE HAKEDİŞİ:** **${tnd.title}** operasyonunu zamanında teslim ederek **+${fmtMoney(payout - cost)} net ihale kârı** elde ettin!`, 'fame');
  saveGame(); renderAll(); openNavSheet('finance');
};

/* ============================================================================
   ANA EKONOMİ, YAŞ VE ARAYÜZ BAĞLANTI KANCALARI (TÜM 6 SİSTEM)
   ============================================================================ */

(function attachAllSixRealismHooks() {
  if (window._sixRealismPackLoaded) return;
  window._sixRealismPackLoaded = true;

  // 1. Bakaya (Yoklama Kaçağı) Kontrolünü İş Başvurularına Bağla
  const _prevStartInterview = window.startHRJobInterview;
  window.startHRJobInterview = function (jobId) {
    ensureSixRealismState();
    if (G.military && G.military.status === 'bakaya') {
      showToast('🚨 e-Devlet üzerinde Yoklama Kaçağı (Bakaya) görünüyorsun! Önce Askerlik Şubesinden tecil veya askerlik işlemini yapmalısın.');
      edevletHubTab = 'military';
      openMenuSection('license');
      return;
    }
    if (typeof _prevStartInterview === 'function') _prevStartInterview(jobId);
  };

  // 2. Vadeli Mevduat Faizi, Ortak Girişim Geliri, Kiracı Çarpanı ve Cost Control Kârını Ekonomiye Bağla
  const _prevCalcFin = calculateFinances;
  calculateFinances = function () {
    ensureSixRealismState();
    const fin = _prevCalcFin();
    if (!G || G.inPrison) return fin;
    const c = getCountry();

    // A) Vadeli Mevduat Aylık Faiz Geliri (%48 Yıllık = Aylık %4)
    const monthlyDepositInt = Math.round((G.fxGold.termDeposit || 0) * 0.04);

    // B) Dostlarla Kurulan %50-%50 Ortak Girişim Gelirleri
    let ventureMonthly = 0;
    G.friendsHub.list.forEach(fr => {
      if (fr.partnered) ventureMonthly += Math.round(c.monthlyMinWage * fr.monthlyReturnMult);
    });

    // C) Kiracı Profili Kira Farkı veya Ödenmeyen Kira Kesintisi
    let tenantDelta = 0;
    G.houses.forEach(h => {
      const tState = G.realEstateExtra.houseTenants[h.uid];
      if (tState) {
        if (tState.unpaid) {
          tenantDelta -= h.monthlyRent;
        } else {
          const prof = TENANT_PROFILES_DB.find(p => p.id === tState.profileId);
          if (prof && prof.rentBonusMult > 1) {
            tenantDelta += Math.round(h.monthlyRent * (prof.rentBonusMult - 1));
          }
        }
      }
    });

    // D) Şirket Cost Control (Tedarikçi Maliyet İndirimi & Düşük Fire Bonusu)
    let costControlBoost = 0;
    if (fin.monthlyBizProfit > 0 && G.costControl) {
      const sup = COST_CONTROL_SUPPLIERS_DB.find(s => s.id === G.costControl.supplierId) || COST_CONTROL_SUPPLIERS_DB[1];
      const netEfficiencyPct = Math.max(2, sup.costCutPct - G.costControl.wastePct);
      costControlBoost = Math.round(fin.monthlyBizProfit * (netEfficiencyPct / 100));
    }

    const totalExtraMonthly = monthlyDepositInt + ventureMonthly + tenantDelta + costControlBoost;
    fin.monthlyBizProfit += (ventureMonthly + costControlBoost);
    fin.monthlyRentalIncome = Math.max(0, fin.monthlyRentalIncome + tenantDelta);
    fin.monthlyNetCashflow += totalExtraMonthly;
    fin.annualNetCashflow = fin.monthlyNetCashflow * 12;
    return fin;
  };

  // 3. Net Servete Gram Altın, Döviz ve Vadeli Mevduatı Dahil Et
  const _prevGetNetWorth = getNetWorth;
  getNetWorth = function () {
    ensureSixRealismState();
    const baseNw = _prevGetNetWorth();
    if (!G || !G.fxGold) return baseNw;
    const c = getCountry();
    const goldVal = G.fxGold.gramGold * Math.round(c.monthlyMinWage * G.fxGold.goldPriceMult);
    const fxVal = G.fxGold.usdBalance * Math.round(c.monthlyMinWage * 0.5);
    return baseNw + goldVal + fxVal + (G.fxGold.termDeposit || 0) - (G.fxGold.ccStatementDebt || 0);
  };

  // 4. +1 Yaş İlerlediğinde Kiracı Riski, Askerlik Durumu ve Kefillik Olayı
  const _prevAdvanceAge = advanceAge;
  advanceAge = function () {
    ensureSixRealismState();
    G.realEstateExtra.wonAuctionsThisYear = 0;
    G.friendsHub.hangoutsThisYear = 0;
    G.costControl.auditsThisYear = 0;
    G.costControl.tendersThisYear = 0;

    // Kiracı kira takma kontrolü
    G.houses.forEach(h => {
      const tState = G.realEstateExtra.houseTenants[h.uid];
      if (tState && !tState.unpaid) {
        const prof = TENANT_PROFILES_DB.find(p => p.id === tState.profileId);
        if (prof && Math.random() < prof.defaultRisk) {
          tState.unpaid = true;
          addLog(G.age + 1, `🚨 **KİRACI KRİZİ:** **${h.name}** mülkündeki kiracı bu yıl kirayı ödemedi! Emlak menüsünden icra ve tahliye davası açabilirsin.`, 'bad');
        }
      }
    });

    _prevAdvanceAge();
    updateMilitaryStatusCheck();
  };

  // 5. e-Devlet Merkezine 4. Sekme Olarak "🪖 Askerlik Şubesi" Ekle
  const _prevEdevletHub = window.renderUnifiedEdevletHub;
  window.renderUnifiedEdevletHub = function () {
    ensureSixRealismState();
    if (edevletHubTab === 'military') {
      return renderHeroBannerHTML('license') + `
        <div class="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-3 text-[10px] font-extrabold">
          <button onclick="edevletHubTab='id_lic'; openMenuSection('license')" class="py-2 rounded-xl text-slate-400">🪪 Kimlik</button>
          <button onclick="edevletHubTab='military'; openMenuSection('license')" class="py-2 rounded-xl bg-emerald-500 text-slate-950 shadow">🪖 Askerlik</button>
          <button onclick="edevletHubTab='passport'; openMenuSection('license')" class="py-2 rounded-xl text-slate-400">🛂 Pasaport</button>
          <button onclick="edevletHubTab='portrait'; openMenuSection('license')" class="py-2 rounded-xl text-slate-400">📸 Foto</button>
        </div>
      ` + renderMilitaryServiceBranchHTML();
    }

    let html = _prevEdevletHub();
    // Mevcut 3'lü sekmeyi 4'lü (Askerlik dahil) hale getir
    html = html.replace(
      'grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-3',
      'grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-3'
    );
    html = html.replace(
      `🛂 Pasaport &amp; Göç\n        </button>`,
      `🛂 Pasaport\n        </button>\n        <button onclick="edevletHubTab='military'; openMenuSection('license')" class="py-2 rounded-xl text-[10px] font-extrabold transition text-emerald-400">🪖 Askerlik</button>`
    );
    return html;
  };

  // 6. Galeri, Emlak, Finans ve İlişkiler Menülerine Yeni Panelleri Enjekte Et
  const _prevOpenMenuSec = openMenuSection;
  openMenuSection = function (sec) {
    ensureSixRealismState();
    _prevOpenMenuSec(sec);
    const body = document.getElementById('sheetBody');
    if (!body || !G) return;

    if (sec === 'cars') {
      body.insertAdjacentHTML('beforeend', `<div class="mt-3 pt-3 border-t border-slate-800">${renderUsedCarExpertiseMarketHTML()}</div>`);
    }
    if (sec === 'houses') {
      body.insertAdjacentHTML('afterbegin', renderTenantAndUyapPanelHTML());
    }
  };

  const _prevOpenNav = openNavSheet;
  openNavSheet = function (tab) {
    ensureSixRealismState();
    _prevOpenNav(tab);
    const body = document.getElementById('sheetBody');
    if (!body || !G) return;

    if (tab === 'finance') {
      if (activeFinanceTab === 'bank' || activeFinanceTab === 'invest') {
        const subBar = body.querySelector('.grid.grid-cols-3');
        if (subBar) subBar.insertAdjacentHTML('afterend', renderGoldFxAndDepositPanelHTML());
      } else if (activeFinanceTab === 'biz') {
        const subBar = body.querySelector('.grid.grid-cols-3');
        if (subBar) subBar.insertAdjacentHTML('afterend', renderCompanyCostControlPanelHTML());
      }
    }

    if (tab === 'relations') {
      body.insertAdjacentHTML('beforeend', renderCloseFriendsAndVenturesHTML());
    }
  };
})();

/* ============================================================================
   ENFLASYON SİSTEMİ İPTALİ VE MAAŞ DENGELEME YAMASI (HOTFIX)
   ============================================================================ */
(function disableInflationAndFixSalaries() {
  // 1. Ülkelerin orijinal (sabit) baz asgari ücretlerini kilitle
  const ORIGINAL_MIN_WAGES = {
    TR: 22104,
    US: 2400,
    DE: 2150,
    GB: 2050,
    FR: 1800,
    NL: 2100,
    CH: 4200,
    NO: 32000,
    CA: 2600,
    AU: 3500,
    JP: 210000,
    KR: 2060000,
    RU: 25000,
    BR: 1500,
    SA: 4500,
    AE: 5000,
    NG: 70000
  };

  function restoreBaseMinWages() {
    if (typeof COUNTRIES !== 'undefined' && Array.isArray(COUNTRIES)) {
      COUNTRIES.forEach(c => {
        if (!c._origMinWage) {
          c._origMinWage = ORIGINAL_MIN_WAGES[c.id] || c.monthlyMinWage;
        }
        c.monthlyMinWage = c._origMinWage;
        c.inflation = 0; // Yıllık otomatik fiyat/maaş şişmesini sıfırla
      });
    }
  }

  // 2. Ocak ayı enflasyon zammı fonksiyonunu tamamen devre dışı bırak
  window.applyJanuaryInflationAndWageRaise = function () {
    restoreBaseMinWages();
  };

  // 3. Yaş ilerlerken ve finans hesaplanırken baz maaşın sabit kalmasını garanti et
  const _prevCalcFin = calculateFinances;
  calculateFinances = function () {
    restoreBaseMinWages();
    return _prevCalcFin();
  };

  // 4. Mevcut kayıtta (Save) enflasyon yüzünden şişmiş emekli/işsizlik maaşı varsa normale çek
  restoreBaseMinWages();
  if (typeof G !== 'undefined' && G && G.career) {
    const c = getCountry();
    if (G.career.pensionMonthly > c.monthlyMinWage * 3) {
      G.career.pensionMonthly = Math.round(c.monthlyMinWage * 1.45);
    }
    if (G.career.unemploymentMonthlyPay > c.monthlyMinWage * 2) {
      G.career.unemploymentMonthlyPay = Math.round(c.monthlyMinWage * 0.55);
    }
    if (G.career.accumulatedSeverance > c.monthlyMinWage * 40) {
      G.career.accumulatedSeverance = Math.round(c.monthlyMinWage * 1.8 * Math.max(1, G.career.yearsInCurrentFirm || 1));
    }
  }

  if (typeof saveGame === 'function') saveGame();
  if (typeof renderAll === 'function') renderAll();
})();

/* ============================================================================
   ENFLASYON SİSTEMİ İPTALİ VE MAAŞ DENGELEME YAMASI (SİLMEDEN EN ALTA EKLE)
   ============================================================================ */
(function disableInflationAndFixSalaries() {
  const ORIGINAL_MIN_WAGES = {
    TR: 22104, US: 2400, DE: 2150, GB: 2050, FR: 1800, NL: 2100,
    CH: 4200, NO: 32000, CA: 2600, AU: 3500, JP: 210000, KR: 2060000,
    RU: 25000, BR: 1500, SA: 4500, AE: 5000, NG: 70000
  };

  function restoreBaseMinWages() {
    if (typeof COUNTRIES !== 'undefined' && Array.isArray(COUNTRIES)) {
      COUNTRIES.forEach(c => {
        if (!c._origMinWage) c._origMinWage = ORIGINAL_MIN_WAGES[c.id] || c.monthlyMinWage;
        c.monthlyMinWage = c._origMinWage;
        c.inflation = 0;
      });
    }
  }

  // Enflasyon zammı fonksiyonunu boşalt (devre dışı bırak)
  window.applyJanuaryInflationAndWageRaise = function () {
    restoreBaseMinWages();
  };

  const _prevCalcFin = calculateFinances;
  calculateFinances = function () {
    restoreBaseMinWages();
    return _prevCalcFin();
  };

  restoreBaseMinWages();
  if (typeof saveGame === 'function') saveGame();
  if (typeof renderAll === 'function') renderAll();
})();

/* ============================================================================
   MEGA GÜNCELLEME v2.0 ANA MOTORU (6 DEV PAKET + ÇEKİRDEK ONARIM)
   ============================================================================ */

let garageSubTabV2 = 'dealer_my'; // 'dealer_my' | 'used_exp' | 'dyno_sound' | 'taxi_tuv'
let realEstateSubTabV2 = 'houses'; // 'houses' | 'land_yapsat' | 'uyap'
let selectedShotStyle = 'plase';   // 'plase' | 'power' | 'panenka'

function ensureMegaV2State() {
  if (!G) return;

  // 0. Enflasyon Şişmesini Kalıcı Olarak Kilitle (100 Binden 1 Milyona Çıkma Hatasını Önler)
  const FIXED_WAGES = {
    TR: 22104, US: 2400, DE: 2150, GB: 2050, FR: 1800, NL: 2100,
    CH: 4200, NO: 32000, CA: 2600, AU: 3500, JP: 210000, KR: 2060000,
    RU: 25000, BR: 1500, SA: 4500, AE: 5000, NG: 70000
  };
  if (typeof COUNTRIES !== 'undefined' && Array.isArray(COUNTRIES)) {
    COUNTRIES.forEach(c => {
      if (FIXED_WAGES[c.id]) c.monthlyMinWage = FIXED_WAGES[c.id];
      c.inflation = 0;
    });
  }

  // 1. Teknik Direktörlük & İddaa Durumu
  if (!G.coach) {
    G.coach = {
      licenses: [],
      activeClub: null,
      salaryMult: 0,
      tacticStyle: '4-2-3-1 Gegenpress',
      moraleBoost: 0,
      winsThisSeason: 0,
      trophies: 0
    };
  }
  if (!G.iddaa) {
    G.iddaa = {
      selectedPicks: {}, // matchIdx -> { label, odd }
      stakeMult: 0.5,
      couponsWon: 0
    };
  }

  // 2. Arsa İmarı & Kat Karşılığı Müteahhitlik (Yap-Sat)
  if (!G.yapSat) {
    G.yapSat = {
      lands: [],          // { id, name, zoned, value }
      activeProject: null // { id, name, payout }
    };
  }

  // 3. Serbest Meslek Ofisi, E-Ticaret & Vergi Yapılandırma
  if (!G.freelance) {
    G.freelance = {
      officeId: null,
      clients: 0,
      ecomStoreId: null,
      ecomStockPacks: 0,
      ecomAdLevel: 1,
      taxWriteOffActive: false,
      taxAuditPenalty: 0
    };
  }

  // 4. Garaj 2.0: Taksi Plakası, Dyno Modifiye & TÜVTÜRK/Kasko
  if (!G.garageV2) {
    G.garageV2 = {
      plates: [],         // Sahip olunan T/M/C plakalar
      carMods: {},        // carUid -> ['mod_ecu', 'mod_sound']
      carHp: {},          // carUid -> 185
      tuvturkValidUntil: G.age + 2,
      kaskoActive: false
    };
  }

  // 5. Hanedan, Düğün Altını, Çocuk CEO & Sağlık/Tatil
  if (!G.lifeV2) {
    G.lifeV2 = {
      ceoKids: [],        // Şirkete CEO/CFO atanan çocukların isimleri
      holidaysThisYear: 0,
      weddingDoneForSpouse: null
    };
  }

  if (typeof ensureRealisticCareerState === 'function') ensureRealisticCareerState();
  if (typeof ensureSixRealismState === 'function') ensureSixRealismState();
}

/* ============================================================================
   PAKET 1: ÇEKİRDEK ONARIM — 4 SEKMELİ E-DEVLET (ASKERLİK DAHİL KUSURSUZ)
   ============================================================================ */

window.renderUnifiedEdevletHub = function () {
  ensureMegaV2State();
  const c = getCountry();
  const costB = Math.round(c.monthlyMinWage * 0.7);
  const costCE = Math.round(c.monthlyMinWage * 1.6);
  const expungeCost = Math.round(c.monthlyMinWage * 4.5);

  const nav4 = `
    <div class="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-3 text-[10px] font-extrabold">
      <button onclick="edevletHubTab='id_lic'; openMenuSection('license')" class="py-2 rounded-xl ${edevletHubTab === 'id_lic' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400'}">🪪 Kimlik</button>
      <button onclick="edevletHubTab='military'; openMenuSection('license')" class="py-2 rounded-xl ${edevletHubTab === 'military' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'}">🪖 Askerlik</button>
      <button onclick="edevletHubTab='passport'; openMenuSection('license')" class="py-2 rounded-xl ${edevletHubTab === 'passport' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400'}">🛂 Pasaport</button>
      <button onclick="edevletHubTab='portrait'; openMenuSection('license')" class="py-2 rounded-xl ${edevletHubTab === 'portrait' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400'}">📸 Foto</button>
    </div>
  `;

  if (edevletHubTab === 'military') {
    return renderHeroBannerHTML('license') + nav4 + renderMilitaryServiceBranchHTML();
  }
  if (edevletHubTab === 'passport') {
    const moveCost = Math.round(c.monthlyMinWage * 4);
    return renderHeroBannerHTML('license') + nav4 + renderPassportVisaStampsHTML() + `
      <div class="space-y-2">
        <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">✈️ Konsolosluk Vize &amp; Ülke Göçü</h4>
        ${COUNTRIES.filter(x => x.id !== G.countryId).map(target => `
          <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
            <div>
              <div class="text-xs font-extrabold text-white">${target.flag} ${target.name} (${target.currency})</div>
              <div class="text-[10px] text-slate-400">Asgari: ${target.monthlyMinWage.toLocaleString('tr-TR')} ${target.currency} &bull; Vergi: %${Math.round(target.taxRate * 100)}</div>
            </div>
            <button onclick="migrateToCountry('${target.id}', ${moveCost})" class="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-[10px] font-extrabold shrink-0">Göç Et (${fmtMoney(moveCost)})</button>
          </div>
        `).join('')}
      </div>
    `;
  }
  if (edevletHubTab === 'portrait') {
    return renderHeroBannerHTML('license') + nav4 + `
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-3 text-center">
        <img src="${getCurrentPortrait()}" class="w-24 h-28 rounded-2xl object-cover border-2 border-sky-400 shadow-lg" />
        <button onclick="G.portraitIdx = (G.portraitIdx + 1) % 3; saveGame(); renderAll(); openMenuSection('license');" class="w-full py-2.5 rounded-xl bg-sky-500 text-slate-950 text-xs font-extrabold">🔄 Biyometrik Fotoğrafı Değiştir</button>
      </div>
    `;
  }

  return renderHeroBannerHTML('license') + nav4 + renderOfficialIdentityAndDocumentsHTML() + `
    <div class="space-y-2">
      <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div><div class="text-xs font-extrabold text-white">🚗 B Sınıfı Sürücü Belgesi</div><div class="text-[10px] text-slate-400">Otomobil, Kurye &amp; Hafif Ticari</div></div>
        <button onclick="takeDrivingLicense('B', ${costB})" class="px-3 py-2 rounded-xl text-xs font-extrabold ${G.licenses.B ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-500 text-slate-950'}">${G.licenses.B ? 'Alındı ✓' : fmtMoney(costB)}</button>
      </div>
      <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div><div class="text-xs font-extrabold text-white">🚛 CE Sınıfı Ağır Vasıta (Tır) Ehliyeti</div><div class="text-[10px] text-slate-400">Uluslararası Tır &amp; Otobüs Kaptanlığı</div></div>
        <button onclick="takeDrivingLicense('CE', ${costCE})" class="px-3 py-2 rounded-xl text-xs font-extrabold ${G.licenses.CE ? 'bg-slate-800 text-emerald-400' : 'bg-amber-400 text-slate-950'}">${G.licenses.CE ? 'Alındı ✓' : fmtMoney(costCE)}</button>
      </div>
      <div class="p-3 rounded-2xl bg-slate-900 border ${G.criminalRecord ? 'border-rose-500/40' : 'border-slate-800'} flex items-center justify-between">
        <div><div class="text-xs font-extrabold text-white">⚖️ Adli Sicil &amp; Arşiv Kaydı Sildirme</div><div class="text-[10px] text-slate-400">Memuriyet ve başkanlık engelini kaldırır</div></div>
        ${G.criminalRecord ? `<button onclick="clearCriminalRecord(${expungeCost})" class="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold">Sildir (${fmtMoney(expungeCost)})</button>` : `<span class="text-xs font-bold text-emerald-400">Sicil Temiz ✓</span>`}
      </div>
    </div>
  `;
};

/* ============================================================================
   PAKET 2: ULTRA FUTBOL — 6 KÖŞELİ İNTERAKTİF KALE, TEKNİK DİREKTÖR & İDDAA
   ============================================================================ */

// A) 6 Köşeli İnteraktif Kale ve Penaltı / Frikik Vuruş Sistemi
window.openInteractiveGoalShotModal = function (mode = 'player') {
  ensureMegaV2State();
  const sheet = document.getElementById('bottomSheet');
  const body = document.getElementById('sheetBody');
  sheet.classList.remove('hidden');
  document.getElementById('sheetTitle').textContent = '🥅 Kritik Pozisyon: Köşe Seç ve Vur!';
  document.getElementById('sheetSubtitle').textContent = 'Dakika 89 • Kaleci Çizgide • Falsonu ve Köşeyi Seç!';

  const corners = [
    { id: 'top_left', name: '↖️ Sol Üst 90 (Çatal)', baseChance: 0.56, rewardMult: 1.6 },
    { id: 'top_mid', name: '⬆️ Üst Ağlar (Tavan)', baseChance: 0.64, rewardMult: 1.3 },
    { id: 'top_right', name: '↗️ Sağ Üst 90 (Çatal)', baseChance: 0.58, rewardMult: 1.6 },
    { id: 'bot_left', name: '↙️ Sol Alt Köşe (Direk Dibi)', baseChance: 0.72, rewardMult: 1.2 },
    { id: 'bot_mid', name: '🎯 Orta (Panenka / Yerden)', baseChance: 0.68, rewardMult: 1.25 },
    { id: 'bot_right', name: '↘️ Sağ Alt Köşe (Direk Dibi)', baseChance: 0.72, rewardMult: 1.2 }
  ];

  body.innerHTML = `
    <div class="goal-shoot-card space-y-3">
      <div class="flex items-center justify-between text-xs">
        <span class="font-extrabold text-emerald-300">⚽ 89' KRİTİK FRİKİK / PENALTI VURUŞU</span>
        <span class="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono-num font-black text-[10px]">CANLI POZİSYON</span>
      </div>

      <!-- Vuruş Stili Seçimi -->
      <div class="grid grid-cols-3 gap-1.5 text-[10px] font-extrabold">
        <button onclick="selectedShotStyle='plase'; openInteractiveGoalShotModal('${mode}')" class="py-1.5 rounded-lg border ${selectedShotStyle === 'plase' ? 'border-amber-400 bg-amber-400/20 text-amber-300' : 'border-slate-700 bg-slate-900 text-slate-400'}">🌀 Plase (Falsolu)</button>
        <button onclick="selectedShotStyle='power'; openInteractiveGoalShotModal('${mode}')" class="py-1.5 rounded-lg border ${selectedShotStyle === 'power' ? 'border-amber-400 bg-amber-400/20 text-amber-300' : 'border-slate-700 bg-slate-900 text-slate-400'}">🚀 Sert Füze</button>
        <button onclick="selectedShotStyle='panenka'; openInteractiveGoalShotModal('${mode}')" class="py-1.5 rounded-lg border ${selectedShotStyle === 'panenka' ? 'border-amber-400 bg-amber-400/20 text-amber-300' : 'border-slate-700 bg-slate-900 text-slate-400'}">🎩 Panenka / Aşırtma</button>
      </div>

      <!-- 6 Bölgeli İnteraktif Kale Ağları -->
      <div class="goal-frame-grid">
        <div class="grid grid-cols-3 gap-2">
          ${corners.map(cn => `
            <button onclick="executeGoalCornerShot('${cn.id}', '${cn.name}', ${cn.baseChance}, ${cn.rewardMult}, '${mode}')" class="goal-corner-btn">
              <div>${cn.name}</div>
              <div class="text-[9px] text-emerald-300 font-mono-num mt-0.5">Gol Şansı: %${Math.round(cn.baseChance * 100)}</div>
            </button>
          `).join('')}
        </div>
        <div class="text-center text-[10px] font-bold text-slate-300 mt-2">🧤 Kaleci Hamle Bekliyor — Vurmak İstediğin Köşeye Dokun!</div>
      </div>
    </div>
  `;
};

window.executeGoalCornerShot = function (cornerId, cornerName, baseChance, rewardMult, mode) {
  ensureMegaV2State();
  const c = getCountry();
  const p = G.proPlayer;
  const skillBonus = (p && p.active) ? ((p.shooting - 60) * 0.005) : 0.08;
  const styleBonus = selectedShotStyle === 'plase' ? 0.06 : (selectedShotStyle === 'power' ? 0.04 : 0.02);
  const isGoal = Math.random() < clamp(baseChance + skillBonus + styleBonus, 0.35, 0.92);

  if (isGoal) {
    const matchBonus = Math.round(c.monthlyMinWage * 1.4 * rewardMult);
    G.money += matchBonus;
    G.fame = clamp(G.fame + 5);
    if (p && p.active) {
      p.goals = (p.goals || 0) + 1;
      p.scoutAttention = clamp((p.scoutAttention || 20) + 12, 0, 100);
    }
    if (G.club && G.club.active) {
      G.club.fanTrust = clamp(G.club.fanTrust + 8);
    }
    if (cornerId.includes('top')) unlockAchievement('clutch_scorer');
    playSfx('trophy');
    addLog(G.age, `⚽ **GOOOOL! 90'A TAKTI!** Topu **${cornerName}** noktasına (${selectedShotStyle.toUpperCase()}) göndererek kaleciyi çaresiz bıraktın! Stadyum yıkılıyor (**+${fmtMoney(matchBonus)} Galibiyet Primi**)!`, 'fame');
  } else {
    playSfx('bad');
    addLog(G.age, `🧤 **DİREKTEN DÖNDÜ!** **${cornerName}** köşesine gönderdiğin şutu kaleci parmaklarının ucuyla kornere çeldi!`, 'normal');
  }

  saveGame(); renderAll(); openMenuSection('sports');
};

// B) Teknik Direktörlük Kariyeri Görünümü
function renderCoachCareerTabHTML() {
  ensureMegaV2State();
  const c = getCountry();
  const ch = G.coach;

  return `
    <div class="p-3.5 rounded-2xl bg-slate-900 border border-sky-500/40 space-y-2.5 mb-3">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-[10px] font-extrabold text-sky-400 uppercase">🧥 TEKNİK DİREKTÖRLÜK &amp; TAKTİK KARİYERİ</div>
          <div class="text-sm font-extrabold text-white">${ch.activeClub ? `🏟️ ${ch.activeClub} Teknik Direktörü` : 'Kulüp Çalıştırmıyor'}</div>
        </div>
        <span class="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold">Kupa: ${ch.trophies}</span>
      </div>

      ${ch.activeClub ? `
        <div class="grid grid-cols-2 gap-2 pt-1">
          <button onclick="coachPlayMatchWithSpeech('aggressive')" class="p-2.5 rounded-xl bg-amber-400 text-slate-950 text-[11px] font-extrabold">
            🔥 Soyunma Odası Ateşleyici Konuşma &amp; Maça Çık
          </button>
          <button onclick="openInteractiveGoalShotModal('coach')" class="p-2.5 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-extrabold">
            🥅 Duran Top / Penaltı Taktik Vuruşu
          </button>
        </div>
      ` : ''}
    </div>

    <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">🎓 TFF / UEFA Antrenörlük Kursları</h4>
    <div class="space-y-2 mb-3">
      ${COACH_LICENSES_DB.map(lic => {
        const has = ch.licenses.includes(lic.id);
        const cost = Math.round(c.monthlyMinWage * lic.costMult);
        return `
          <div class="p-3 rounded-2xl bg-slate-900 border ${has ? 'border-emerald-500/50' : 'border-slate-800'} flex items-center justify-between gap-2">
            <div>
              <div class="text-xs font-extrabold text-white">${lic.name}</div>
              <div class="text-[10px] text-slate-400">${lic.desc}</div>
            </div>
            <button onclick="takeCoachLicense('${lic.id}', ${cost})" class="px-3 py-1.5 rounded-xl text-[10px] font-extrabold shrink-0 ${has ? 'bg-slate-800 text-emerald-400' : 'bg-sky-500 text-slate-950'}">
              ${has ? 'Alındı ✓' : fmtMoney(cost)}
            </button>
          </div>
        `;
      }).join('')}
    </div>

    <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">📋 Teknik Direktörlük Teklifleri</h4>
    <div class="space-y-2">
      ${COACH_JOBS_DB.map(cj => {
        const pay = Math.round(c.monthlyMinWage * cj.salaryMult);
        const isCur = ch.activeClub === cj.club;
        return `
          <div class="p-3 rounded-2xl bg-slate-900 border ${isCur ? 'border-amber-400' : 'border-slate-800'} flex items-center justify-between gap-2">
            <div>
              <div class="text-xs font-extrabold text-white">🏟️ ${cj.club}</div>
              <div class="text-[10px] text-slate-400">Şart: ${cj.reqLic.toUpperCase()} &bull; Maaş: <strong class="text-emerald-400">${fmtMoney(pay)}/ay</strong></div>
            </div>
            <button onclick="signCoachContract('${cj.id}')" class="px-3 py-1.5 rounded-xl text-[10px] font-extrabold shrink-0 ${isCur ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-400 text-slate-950'}">
              ${isCur ? 'Görevde ✓' : 'İmzala'}
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

window.takeCoachLicense = function (licId, cost) {
  ensureMegaV2State();
  if (G.coach.licenses.includes(licId)) return;
  if (G.money < cost) { showToast('UEFA Antrenörlük kursu için bakiye yetersiz!'); return; }
  G.money -= cost;
  G.coach.licenses.push(licId);
  playSfx('trophy');
  const lic = COACH_LICENSES_DB.find(x => x.id === licId);
  addLog(G.age, `🎓 **ANTRENÖRLÜK ДİPLOMASI:** Riva TFF tesislerinde **${lic.name}** eğitimini başarıyla tamamladın!`, 'milestone');
  saveGame(); renderAll(); openMenuSection('sports');
};

window.signCoachContract = function (cjId) {
  ensureMegaV2State();
  const cj = COACH_JOBS_DB.find(x => x.id === cjId);
  if (!cj) return;
  if (!G.coach.licenses.includes(cj.reqLic)) {
    showToast(`Bu kulübü çalıştırmak için önce ${cj.reqLic.toUpperCase()} lisansını almalısın!`);
    return;
  }
  G.coach.activeClub = cj.club;
  G.coach.salaryMult = cj.salaryMult;
  playSfx('trophy');
  addLog(G.age, `🧥 **YENİ TEKNİK DİREKTÖR!** **${cj.club}** yönetimiyle teknik direktörlük sözleşmesi imzaladın!`, 'fame');
  saveGame(); renderAll(); openMenuSection('sports');
};

window.coachPlayMatchWithSpeech = function () {
  ensureMegaV2State();
  const c = getCountry();
  const winBonus = Math.round(c.monthlyMinWage * 1.8);
  if (Math.random() < 0.72) {
    G.coach.winsThisSeason += 1;
    G.money += winBonus;
    G.fame = clamp(G.fame + 4);
    if (G.coach.winsThisSeason % 5 === 0) G.coach.trophies += 1;
    playSfx('trophy');
    addLog(G.age, `🧥 **TAKTİK ZAFERİ:** Soyunma odasındaki ateşleyici konuşmanla **${G.coach.activeClub}** sahadan 3-1 galip ayrıldı! (**+${fmtMoney(winBonus)} Prim**)`, 'good');
  } else {
    playSfx('bad');
    addLog(G.age, `⚽ **ZORLU DEPLASMAN:** **${G.coach.activeClub}** deplasmanda 1-1 berabere kaldı.`, 'normal');
  }
  saveGame(); renderAll(); openMenuSection('sports');
};

// C) Canlı İddaa & Spor Toto Bülteni
function renderIddaaBulletinTabHTML() {
  ensureMegaV2State();
  const c = getCountry();
  const idd = G.iddaa;
  const stakeAmt = Math.round(c.monthlyMinWage * idd.stakeMult);

  const matches = [
    { idx: 0, name: 'Sarı-Lacivert Kanaryalar vs Sarı-Kırmızı Aslanlar (Derbi)', o1: 1.95, o0: 3.40, o2: 2.65 },
    { idx: 1, name: 'Siyah-Beyaz Kartallar vs Karadeniz Fırtınası', o1: 2.10, o0: 3.25, o2: 2.45 },
    { idx: 2, name: 'Real Madrid vs Manchester City (Şampiyonlar Ligi)', o1: 2.25, o0: 3.50, o2: 2.20 }
  ];

  let totalOdd = 1.0;
  Object.values(idd.selectedPicks).forEach(pk => { totalOdd *= pk.odd; });
  const pickCount = Object.keys(idd.selectedPicks).length;
  const maxWin = pickCount > 0 ? Math.round(stakeAmt * totalOdd) : 0;

  return `
    <div class="iddaa-bulletin-card space-y-2.5">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest">🎯 HAFTALIK DERBİ &amp; AVRUPA İDDAA BÜLTENİ</div>
          <div class="text-xs font-extrabold text-white">Seçilen Maç: ${pickCount}/3 &bull; Toplam Oran: <span class="text-amber-300 font-mono-num">${pickCount > 0 ? totalOdd.toFixed(2) : '0.00'}</span></div>
        </div>
        <span class="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-extrabold">MBS 1</span>
      </div>

      <div class="space-y-2">
        ${matches.map(m => {
          const cur = idd.selectedPicks[m.idx] ? idd.selectedPicks[m.idx].label : '';
          return `
            <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div class="text-[11px] font-extrabold text-white">${m.name}</div>
              <div class="grid grid-cols-3 gap-1.5">
                <button onclick="toggleIddaaPick(${m.idx}, 'MS 1', ${m.o1})" class="iddaa-odd-btn ${cur === 'MS 1' ? 'selected' : ''}">MS 1 (${m.o1.toFixed(2)})</button>
                <button onclick="toggleIddaaPick(${m.idx}, 'MS X', ${m.o0})" class="iddaa-odd-btn ${cur === 'MS X' ? 'selected' : ''}">MS X (${m.o0.toFixed(2)})</button>
                <button onclick="toggleIddaaPick(${m.idx}, 'MS 2', ${m.o2})" class="iddaa-odd-btn ${cur === 'MS 2' ? 'selected' : ''}">MS 2 (${m.o2.toFixed(2)})</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between">
        <div class="text-[11px] text-slate-300">
          Kupon Bedeli: <strong>${fmtMoney(stakeAmt)}</strong><br>
          Olası Kazanç: <strong class="text-emerald-400 font-mono-num">${fmtMoney(maxWin)}</strong>
        </div>
        <button onclick="playIddaaCoupon(${stakeAmt}, ${maxWin}, ${pickCount})" class="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold">
          🎟️ Kuponu Oyna
        </button>
      </div>
    </div>
  `;
}

window.toggleIddaaPick = function (mIdx, label, odd) {
  ensureMegaV2State();
  if (G.iddaa.selectedPicks[mIdx] && G.iddaa.selectedPicks[mIdx].label === label) {
    delete G.iddaa.selectedPicks[mIdx];
  } else {
    G.iddaa.selectedPicks[mIdx] = { label, odd };
  }
  openMenuSection('sports');
};

window.playIddaaCoupon = function (stakeAmt, maxWin, pickCount) {
  ensureMegaV2State();
  if (pickCount === 0) { showToast('Kupon oynamak için bültenden en az 1 maç oranı seçmelisin!'); return; }
  if (G.money < stakeAmt) { showToast('Kupon bedeli için nakit bakiyen yetersiz!'); return; }
  G.money -= stakeAmt;

  const winChance = Math.max(0.24, 0.68 - (pickCount * 0.12));
  if (Math.random() < winChance) {
    G.money += maxWin;
    G.iddaa.couponsWon += 1;
    playSfx('trophy');
    addLog(G.age, `🎟️ **İDDAA KUPONU TUTTU!** 90+4'te gelen golle kuponun kazandı ve **+${fmtMoney(maxWin)}** ikramiye hesabına yattı!`, 'good');
  } else {
    playSfx('bad');
    addLog(G.age, `🎟️ **TEK MAÇTAN YATTI!** İddaa kuponun son dakika golüyle tek maçtan yattı (-${fmtMoney(stakeAmt)}).`, 'normal');
  }
  G.iddaa.selectedPicks = {};
  saveGame(); renderAll(); openMenuSection('sports');
};

/* ============================================================================
   PAKET 3: GAYRİMENKUL 2.0 — ARSA İMARI & KAT KARŞILIĞI MÜTEAHHİTLİK (YAP-SAT)
   ============================================================================ */

function renderLandAndYapSatHTML() {
  ensureMegaV2State();
  const c = getCountry();
  const ys = G.yapSat;

  const myLandsHtml = ys.lands.length === 0 ? '' : `
    <div class="p-3 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-2 mb-3">
      <div class="text-xs font-extrabold text-emerald-300">📜 Tapulu Arsa &amp; Tarla Portföyün (${ys.lands.length})</div>
      ${ys.lands.map((l, idx) => `
        <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
          <div>
            <div class="text-xs font-bold text-white">${l.icon} ${l.name} ${l.zoned ? '<span class="text-emerald-400">(İMAR GEÇTİ ✨)</span>' : '<span class="text-amber-300">(Tarla Vasıflı)</span>'}</div>
            <div class="text-[10px] text-emerald-400 font-mono-num">Güncel Rayiç: ${fmtMoney(l.value)}</div>
          </div>
          <div class="flex gap-1">
            ${!l.zoned ? `<button onclick="lobbyForLandZoning(${idx})" class="px-2 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-extrabold">🏛️ İmar Başvurusu</button>` : ''}
            <button onclick="sellLandPlot(${idx})" class="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-extrabold">Sat</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  return myLandsHtml + `
    <div class="yapsat-card space-y-2.5 mb-3">
      <div class="text-xs font-extrabold text-orange-400">🌿 Gelişen Bölgelerden Tarla / Arsa Yatırımı (İmar Piyangosu)</div>
      <div class="space-y-2">
        ${LAND_PLOTS_DB.map((lp, idx) => {
          const cost = Math.round(c.monthlyMinWage * lp.costMult);
          const zonedVal = Math.round(c.monthlyMinWage * lp.zonedMult);
          return `
            <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <div>
                <div class="text-xs font-bold text-white">${lp.icon} ${lp.name}</div>
                <div class="text-[10px] text-slate-400">${lp.desc}</div>
                <div class="text-[10px] text-emerald-400 font-mono-num">Arsa Fiyatı: ${fmtMoney(cost)} &rarr; İmarlı Değeri: <strong>${fmtMoney(zonedVal)}</strong></div>
              </div>
              <button onclick="buyLandPlot(${idx}, ${cost})" class="px-3 py-1.5 rounded-xl bg-orange-500 text-slate-950 text-[10px] font-extrabold shrink-0">Tapu Al</button>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <div class="yapsat-card space-y-2.5">
      <div class="text-xs font-extrabold text-amber-300">🏗️ Kat Karşılığı Müteahhitlik &amp; Topraktan Yap-Sat Projeleri</div>
      <div class="space-y-2">
        ${YAPSAT_PROJECTS_DB.map((pr, idx) => {
          const cost = Math.round(c.monthlyMinWage * pr.costMult);
          const payout = Math.round(c.monthlyMinWage * pr.salePayoutMult);
          return `
            <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <div>
                <div class="text-xs font-bold text-white">${pr.icon} ${pr.name}</div>
                <div class="text-[10px] text-slate-400">Şantiye Maliyeti: ${fmtMoney(cost)} &bull; Daire Satış Hasılatı: <strong class="text-emerald-400">${fmtMoney(payout)}</strong></div>
              </div>
              <button onclick="executeYapSatProject(${idx}, ${cost}, ${payout})" class="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-[10px] font-extrabold shrink-0">İnşaata Gir</button>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

window.buyLandPlot = function (idx, cost) {
  ensureMegaV2State();
  if (G.money < cost) { showToast('Arsa tapu bedeli için bakiye yetersiz!'); return; }
  const lp = LAND_PLOTS_DB[idx];
  G.money -= cost;
  G.yapSat.lands.push({ ...lp, zoned: false, value: cost });
  playSfx('coin');
  addLog(G.age, `🌿 **ARSA YATIRIMI:** **${lp.name}** parselini **${fmtMoney(cost)}** bedelle satın aldın!`, 'good');
  saveGame(); renderAll(); openMenuSection('houses');
};

window.lobbyForLandZoning = function (lIdx) {
  ensureMegaV2State();
  const land = G.yapSat.lands[lIdx];
  if (!land || land.zoned) return;
  const c = getCountry();
  const fee = Math.round(c.monthlyMinWage * 1.2);
  if (G.money < fee) { showToast('Belediye imar komisyonu harcı için bakiye yetersiz!'); return; }
  G.money -= fee;

  const mayorBonus = (G.politics && G.politics.officeId) ? 0.35 : 0;
  if (Math.random() < (land.zoneChance + mayorBonus)) {
    land.zoned = true;
    land.value = Math.round(c.monthlyMinWage * land.zonedMult);
    unlockAchievement('muteahhit_king');
    playSfx('trophy');
    addLog(G.age, `🏛️ **BELEDİYEDEN İMAR GEÇTİ!** **${land.name}** arazisine konut/ticari imar çıktı! Değeri anında **${fmtMoney(land.value)}** seviyesine fırladı!`, 'fame');
  } else {
    showToast('Bu dönem belediye meclisinden imar onayı çıkmadı, tekrar deneyebilirsin.');
  }
  saveGame(); renderAll(); openMenuSection('houses');
};

window.sellLandPlot = function (lIdx) {
  ensureMegaV2State();
  const land = G.yapSat.lands[lIdx];
  if (!land) return;
  G.money += land.value;
  G.yapSat.lands.splice(lIdx, 1);
  playSfx('coin');
  addLog(G.age, `💸 **ARSA SATIŞI:** **${land.name}** arazisini **+${fmtMoney(land.value)}** bedelle sattın!`, 'good');
  saveGame(); renderAll(); openMenuSection('houses');
};

window.executeYapSatProject = function (idx, cost, payout) {
  ensureMegaV2State();
  if (G.money < cost) { showToast('İnşaat demir/beton sermayesi için bakiye yetersiz!'); return; }
  const pr = YAPSAT_PROJECTS_DB[idx];
  G.money -= cost;
  G.money += payout;
  unlockAchievement('muteahhit_king');
  playSfx('trophy');
  addLog(G.age, `🏗️ **YAP-SAT MÜTEAHHİTLİK ZAFERİ:** **${pr.name}** projesindeki daireleri topraktan satarak **+${fmtMoney(payout - cost)} net müteahhit kârı** kazandın!`, 'fame');
  saveGame(); renderAll(); openMenuSection('houses');
};

/* ============================================================================
   PAKET 4: SERBEST MESLEK OFİSİ, E-TİCARET PAZARYERİ & VERGİ DENETİMİ
   ============================================================================ */

function renderFreelanceAndEcommerceTabHTML() {
  ensureMegaV2State();
  const c = getCountry();
  const fl = G.freelance;
  const curOff = FREELANCE_OFFICES_DB.find(o => o.id === fl.officeId);

  return `
    <div class="freelance-office-card space-y-2.5 mb-3">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-[9px] font-extrabold text-sky-400 uppercase tracking-widest">🏢 SERBEST MESLEK &amp; DANIŞMANLIK OFİSİ</div>
          <div class="text-xs font-extrabold text-white">${curOff ? `${curOff.icon} ${curOff.name}` : 'Henüz Kendi Ofisini Açmadın'}</div>
        </div>
        ${curOff ? `<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">${fl.clients}/${curOff.maxClients} Müşteri Defteri</span>` : ''}
      </div>

      ${curOff ? `
        <div class="text-[11px] text-slate-300">Aylık Müşteri Aidat Geliri: <strong class="text-emerald-400 font-mono-num">+${fmtMoney(Math.round(fl.clients * c.monthlyMinWage * curOff.perClientMult))}/ay</strong></div>
        <button onclick="findNewOfficeClients()" class="w-full py-2 rounded-xl bg-sky-500 text-slate-950 text-xs font-extrabold">
          🤝 Yeni Mükellef / Kurumsal Müşteri Bağla (+Defter Sayısı)
        </button>
      ` : `
        <div class="space-y-2">
          ${FREELANCE_OFFICES_DB.map(of => {
            const cost = Math.round(c.monthlyMinWage * of.setupMult);
            return `
              <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <div class="text-xs font-bold text-white">${of.icon} ${of.name}</div>
                  <div class="text-[10px] text-slate-400">${of.desc}</div>
                </div>
                <button onclick="openFreelanceOffice('${of.id}', ${cost})" class="px-3 py-1.5 rounded-xl bg-sky-500 text-slate-950 text-[10px] font-extrabold shrink-0">Aç (${fmtMoney(cost)})</button>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>

    <div class="freelance-office-card space-y-2.5">
      <div class="text-xs font-extrabold text-amber-300">📦 E-Ticaret Pazaryeri Mağazası (Trendyol / Amazon / Hepsiburada)</div>
      <div class="space-y-2">
        ${ECOMMERCE_CATEGORIES_DB.map((ec, idx) => {
          const stockCost = Math.round(c.monthlyMinWage * ec.stockCostMult);
          const estSale = Math.round(stockCost * ec.marginMult);
          return `
            <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <div>
                <div class="text-xs font-bold text-white">${ec.icon} ${ec.name}</div>
                <div class="text-[10px] text-slate-400">Parti Mal Alımı: ${fmtMoney(stockCost)} &bull; Pazaryeri Cirosu: <strong class="text-emerald-400">+${fmtMoney(estSale)}</strong></div>
              </div>
              <button onclick="runEcommerceBatchSale(${idx}, ${stockCost}, ${estSale})" class="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-[10px] font-extrabold shrink-0">Mal Çek &amp; Sat</button>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

window.openFreelanceOffice = function (ofId, cost) {
  ensureMegaV2State();
  const of = FREELANCE_OFFICES_DB.find(x => x.id === ofId);
  if (!of) return;
  if (of.reqCert && (!G.career || !G.career.certificates.includes(of.reqCert))) {
    showToast(`Bu müşavirlik ofisini açmak için önce SGK & CV sekmesinden ilgili uzmanlık sertifikasını almalısın!`);
    return;
  }
  if (G.money < cost) { showToast('Ofis açılışı ve demirbaşlar için bakiye yetersiz!'); return; }
  G.money -= cost;
  G.freelance.officeId = of.id;
  G.freelance.clients = 6;
  playSfx('trophy');
  addLog(G.age, `🏢 **KENDİ OFİSİNİ AÇTIN!** Vergi levhanı asarak **${of.name}** açılışını yaptın ve ilk 6 kurumsal müşterini bağladın!`, 'milestone');
  saveGame(); renderAll(); openNavSheet('career');
};

window.findNewOfficeClients = function () {
  ensureMegaV2State();
  const fl = G.freelance;
  const of = FREELANCE_OFFICES_DB.find(x => x.id === fl.officeId);
  if (!of) return;
  if (fl.clients >= of.maxClients) { showToast('Ofis maksimum müşteri kapasitesine ulaştı!'); return; }
  const gain = randInt(3, 6);
  fl.clients = Math.min(of.maxClients, fl.clients + gain);
  playSfx('coin');
  addLog(G.age, `🤝 Ofisine **+${gain} yeni kurumsal müşteri defteri** bağladın! Toplam mükellef sayın ${fl.clients} oldu.`, 'good');
  saveGame(); renderAll(); openNavSheet('career');
};

window.runEcommerceBatchSale = function (idx, stockCost, estSale) {
  ensureMegaV2State();
  if (G.money < stockCost) { showToast('Toptancıdan ürün çekmek için nakit yetersiz!'); return; }
  const ec = ECOMMERCE_CATEGORIES_DB[idx];
  G.money -= stockCost;
  const netPayout = Math.random() < ec.returnRisk ? Math.round(estSale * 0.82) : estSale;
  G.money += netPayout;
  playSfx('coin');
  addLog(G.age, `📦 **E-TİCARET KAMPANYASI:** **${ec.name}** üzerinden siparişleri kargoladın ve komisyonlar sonrası **+${fmtMoney(netPayout - stockCost)} net kâr** elde ettin!`, 'good');
  saveGame(); renderAll(); openNavSheet('career');
};

/* ============================================================================
   PAKET 5: GARAJ 2.0 — TAKSİ PLAKASI (M/T PLAKA), DYNO MODİFİYE & TÜVTÜRK
   ============================================================================ */

function renderGarageV2TabsHTML() {
  ensureMegaV2State();
  const c = getCountry();
  const gv = G.garageV2;

  if (garageSubTabV2 === 'dyno_sound') {
    return `
      <div class="dyno-garage-card space-y-2.5">
        <div class="text-xs font-extrabold text-purple-300">🔥 Sanayi ECU Yazılım, Ses Sistemi (Subwoofer/Amfi) &amp; Canlı Dyno</div>
        ${G.cars.length === 0 ? `<div class="text-xs text-slate-400">Modifiye ve ses sistemi kurmak için önce garajında en az 1 araç olmalı!</div>` : `
          <div class="text-[11px] text-white font-bold">Seçili Araç: ${G.cars[0].icon} ${G.cars[0].name} <span class="text-amber-300 font-mono-num">(${gv.carHp[G.cars[0].uid] || 130} HP)</span></div>
          <div class="space-y-2 pt-1">
            ${CAR_TUNING_PACKS_DB.map(mod => {
              const uid0 = G.cars[0].uid;
              const installed = (gv.carMods[uid0] || []).includes(mod.id);
              const cost = Math.round(c.monthlyMinWage * mod.costMult);
              return `
                <div class="p-2.5 rounded-xl bg-slate-950 border ${installed ? 'border-purple-500' : 'border-slate-800'} flex items-center justify-between gap-2">
                  <div>
                    <div class="text-xs font-bold text-white">${mod.icon} ${mod.name}</div>
                    <div class="text-[10px] text-emerald-400">+${mod.hpGain} HP Güç &bull; +%${mod.valueBoostPct} Araç Değeri</div>
                  </div>
                  <button onclick="installCarTuningMod('${uid0}', '${mod.id}', ${cost})" class="px-3 py-1.5 rounded-xl text-[10px] font-extrabold shrink-0 ${installed ? 'bg-slate-800 text-purple-300' : 'bg-purple-500 text-white'}">
                    ${installed ? 'Kurulu ✓' : fmtMoney(cost)}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  }

  if (garageSubTabV2 === 'taxi_tuv') {
    const tuvCost = Math.round(c.monthlyMinWage * 0.18);
    const kaskoCost = Math.round(c.monthlyMinWage * 0.65);
    return `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-amber-400/50 space-y-2.5 mb-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-amber-300">🚕 Ticari Taksi (T Plaka) &amp; Hat Yatırımı</span>
          <span class="taxi-plate-badge">${gv.plates.length} PLAKA</span>
        </div>
        <div class="space-y-2">
          ${COMMERCIAL_PLATES_DB.map((pl, idx) => {
            const owned = gv.plates.includes(pl.id);
            const cost = Math.round(c.monthlyMinWage * pl.costMult);
            const rent = Math.round(c.monthlyMinWage * pl.monthlyRentMult);
            return `
              <div class="p-2.5 rounded-xl bg-slate-950 border ${owned ? 'border-amber-400' : 'border-slate-800'} flex items-center justify-between gap-2">
                <div>
                  <div class="text-xs font-extrabold text-white"><span class="taxi-plate-badge mr-1">${pl.code}</span> ${pl.name}</div>
                  <div class="text-[10px] text-emerald-400 font-mono-num mt-0.5">Aylık Net Şoför Kirası: <strong>+${fmtMoney(rent)}/ay</strong></div>
                </div>
                <button onclick="buyCommercialTaxiPlate('${pl.id}', ${cost})" class="px-3 py-1.5 rounded-xl text-[10px] font-extrabold shrink-0 ${owned ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-400 text-slate-950'}">
                  ${owned ? 'Plaka Senin ✓' : fmtMoney(cost)}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <div class="text-xs font-extrabold text-white">🛠️ TÜVTÜRK Araç Muayenesi &amp; Tam Kasko</div>
        <div class="grid grid-cols-2 gap-2">
          <button onclick="doTuvturkAndKasko('tuv', ${tuvCost})" class="p-2.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 text-[10px] font-extrabold">
            📋 TÜVTÜRK Muayene (${fmtMoney(tuvCost)})
          </button>
          <button onclick="doTuvturkAndKasko('kasko', ${kaskoCost})" class="p-2.5 rounded-xl ${gv.kaskoActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-500 text-slate-950'} text-[10px] font-extrabold">
            ${gv.kaskoActive ? '🛡️ Tam Kasko Aktif ✓' : `🛡️ Kasko Yaptır (${fmtMoney(kaskoCost)})`}
          </button>
        </div>
      </div>
    `;
  }

  return '';
}

window.installCarTuningMod = function (carUid, modId, cost) {
  ensureMegaV2State();
  const gv = G.garageV2;
  if (!gv.carMods[carUid]) gv.carMods[carUid] = [];
  if (gv.carMods[carUid].includes(modId)) return;
  if (G.money < cost) { showToast('Modifiye ve ses sistemi için bakiye yetersiz!'); return; }

  const mod = CAR_TUNING_PACKS_DB.find(x => x.id === modId);
  const car = G.cars.find(c => c.uid === carUid);
  if (!mod || !car) return;

  G.money -= cost;
  gv.carMods[carUid].push(modId);
  gv.carHp[carUid] = (gv.carHp[carUid] || 130) + mod.hpGain;
  car.value = Math.round(car.value * (1 + mod.valueBoostPct / 100));
  G.happy = clamp(G.happy + 10);
  playSfx('trophy');
  addLog(G.age, `🔊 **SANAYİ DYNO & MODİFİYE:** **${car.name}** aracına **${mod.name}** uyguladın! Araç **${gv.carHp[carUid]} HP** güce ulaştı ve piyasa değeri **${fmtMoney(car.value)}** oldu!`, 'good');
  saveGame(); renderAll(); openMenuSection('cars');
};

window.buyCommercialTaxiPlate = function (plId, cost) {
  ensureMegaV2State();
  const gv = G.garageV2;
  if (gv.plates.includes(plId)) return;
  if (G.money < cost) { showToast('Ticari plaka devir bedeli için nakit yetersiz!'); return; }
  G.money -= cost;
  gv.plates.push(plId);
  unlockAchievement('taksi_agasi');
  playSfx('trophy');
  const pl = COMMERCIAL_PLATES_DB.find(x => x.id === plId);
  addLog(G.age, `🚕 **TİCARİ PLAKA YATIRIMI:** Noterden **${pl.code} (${pl.name})** plakasını satın alıp şoföre kiraladın!`, 'fame');
  saveGame(); renderAll(); openMenuSection('cars');
};

window.doTuvturkAndKasko = function (type, cost) {
  ensureMegaV2State();
  if (G.money < cost) { showToast('Bakiye yetersiz!'); return; }
  G.money -= cost;
  if (type === 'tuv') {
    G.garageV2.tuvturkValidUntil = G.age + 2;
    G.cars.forEach(c => { c.cond = clamp(c.cond + 12, 0, 100); });
    showToast('TÜVTÜRK Muayenesi kusursuz onaylandı!');
  } else {
    G.garageV2.kaskoActive = true;
    showToast('Tüm garajın Tam Kasko güvencesine alındı!');
  }
  playSfx('coin');
  saveGame(); renderAll(); openMenuSection('cars');
};

/* ============================================================================
   PAKET 6: DÜĞÜN ALTINI, ÇOCUK CEO ATAMA, MHRS vs ÖSS HASTANE & TATİL ROTALARI
   ============================================================================ */

function renderFamilyDynastyAndHolidaysHTML() {
  ensureMegaV2State();
  const c = getCountry();
  const lv = G.lifeV2;
  const adultKids = (G.children || []).filter(ch => ch.age >= 20);

  return `
    <!-- Düğün Takı Töreni & Çocukları Şirkete CEO Atama -->
    <div class="p-3.5 rounded-2xl bg-slate-900 border border-amber-400/40 space-y-2.5 mt-3">
      <div class="text-xs font-extrabold text-amber-300">👑 Hanedan Yönetimi: Düğün Takı Töreni &amp; Aile Holdingi</div>
      ${G.spouse && lv.weddingDoneForSpouse !== G.spouse.name ? `
        <button onclick="holdWeddingGoldCeremony()" class="w-full py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold">
          💍 Düğün Takı Töreni Yap (Takılan Gram Altınları Kasaya Ekle!)
        </button>
      ` : ''}

      ${adultKids.length > 0 && G.businesses.length > 0 ? `
        <div class="space-y-1.5">
          <div class="text-[10px] text-slate-300">Üniversite çağına gelen çocuklarını şirketlerine Genel Müdür (CEO/CFO) atayarak şirket kârını +%15 artır:</div>
          ${adultKids.map(kd => {
            const isCeo = lv.ceoKids.includes(kd.name);
            return `
              <div class="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span class="text-xs font-bold text-white">🎓 ${kd.name} (${kd.age} Yaş)</span>
                <button onclick="assignChildAsCompanyCEO('${kd.name}')" class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${isCeo ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-500 text-slate-950'}">
                  ${isCeo ? 'Şirkette CEO ✓' : 'Şirkete CEO Ata (+%15 Kâr)'}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      ` : `<div class="text-[10px] text-slate-400">Çocukların 20 yaşına ulaştığında onları kurduğun şirketlerin başına CEO olarak atayabilirsin.</div>`}
    </div>

    <!-- Tatil Rotaları (Şarköy, Ordu Yaylası, Antalya, Avrupa) -->
    <div class="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-2 mt-3">
      <div class="text-xs font-extrabold text-emerald-300">🏖️ Yıllık Tatil &amp; Stres Sıfırlama Rotaları</div>
      <div class="grid grid-cols-2 gap-2">
        ${HOLIDAY_ROUTES_DB.map((hl, idx) => {
          const cost = Math.round(c.monthlyMinWage * hl.costMult);
          return `
            <button onclick="goOnHolidayRoute(${idx}, ${cost})" class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-left hover:border-emerald-500/50">
              <div class="text-xs font-extrabold text-white truncate">${hl.icon} ${hl.name}</div>
              <div class="text-[9.5px] text-emerald-400">-${hl.stressCut} Stres &bull; +${hl.happyGain} Mutluluk</div>
              <div class="text-[10px] font-mono-num text-amber-300 mt-0.5">${fmtMoney(cost)}</div>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

window.holdWeddingGoldCeremony = function () {
  ensureMegaV2State();
  if (!G.spouse) return;
  const giftedGrams = randInt(35, 85);
  G.fxGold.gramGold = (G.fxGold.gramGold || 0) + giftedGrams;
  G.lifeV2.weddingDoneForSpouse = G.spouse.name;
  playSfx('trophy');
  addLog(G.age, `💍 **DÜĞÜN TAKI TÖRENİ:** Akrabalar ve dostların düğünde toplam **+${giftedGrams} Gram Altın** taktı! Altınların doğrudan Kapalıçarşı Altın Hesabına eklendi.`, 'fame');
  saveGame(); renderAll(); openNavSheet('relations');
};

window.assignChildAsCompanyCEO = function (kidName) {
  ensureMegaV2State();
  if (G.lifeV2.ceoKids.includes(kidName)) return;
  G.lifeV2.ceoKids.push(kidName);
  playSfx('trophy');
  addLog(G.age, `👔 **AİLE HOLDİNGİ:** Çocuğun **${kidName}** şirketler grubunun başına **Genel Müdür (CEO)** olarak atandı! Şirket kârlılığın +%15 arttı.`, 'milestone');
  saveGame(); renderAll(); openNavSheet('relations');
};

window.goOnHolidayRoute = function (idx, cost) {
  ensureMegaV2State();
  if (G.lifeV2.holidaysThisYear >= 2) { showToast('Bu yıl yeterince tatile çıktın!'); return; }
  if (G.money < cost) { showToast('Tatil bütçesi için bakiye yetersiz!'); return; }
  const hl = HOLIDAY_ROUTES_DB[idx];
  G.money -= cost;
  G.lifeV2.holidaysThisYear += 1;
  G.stress = clamp((G.stress || 30) - hl.stressCut, 0, 100);
  G.happy = clamp(G.happy + hl.happyGain);
  G.health = clamp(G.health + hl.healthGain);
  playSfx('trophy');
  addLog(G.age, `${hl.icon} **TATİL KEYFİ:** **${hl.name}** tatiline çıkarak tüm yılın yorgunluğunu attın (-${hl.stressCut} Stres, +${hl.happyGain} Mutluluk)!`, 'good');
  saveGame(); renderAll(); openNavSheet('relations');
};

/* ============================================================================
   ANA EKONOMİ, MENÜ VE SEKME BİRLEŞTİRME KANCALARI (TÜM 6 PAKET)
   ============================================================================ */

(function attachMegaV2MasterHooks() {
  if (window._megaV2MasterLoaded) return;
  window._megaV2MasterLoaded = true;

  // 1. Tüm Yeni Gelir Kalemlerini (Teknik Direktör, Serbest Ofis, Taksi Plakası, Çocuk CEO, Vergi Gideri) Ekonomiye Bağla
  const _prevCalcFin = calculateFinances;
  calculateFinances = function () {
    ensureMegaV2State();
    const fin = _prevCalcFin();
    if (!G || G.inPrison) return fin;
    const c = getCountry();

    // A) Teknik Direktörlük Aylık Maaşı
    if (G.coach && G.coach.activeClub && G.coach.salaryMult > 0) {
      const coachGross = Math.round(c.monthlyMinWage * G.coach.salaryMult);
      const coachNet = Math.round(coachGross * 0.80);
      fin.monthlyGrossSalary += coachGross;
      fin.monthlyNetSalary += coachNet;
      fin.monthlyNetCashflow += coachNet;
    }

    // B) Kendi Müşavirlik / Danışmanlık Ofisi Aylık Müşteri Geliri
    if (G.freelance && G.freelance.officeId && G.freelance.clients > 0) {
      const of = FREELANCE_OFFICES_DB.find(x => x.id === G.freelance.officeId);
      if (of) {
        const officeRev = Math.round(G.freelance.clients * c.monthlyMinWage * of.perClientMult);
        fin.monthlyBizProfit += officeRev;
        fin.monthlyNetCashflow += officeRev;
      }
    }

    // C) Ticari Taksi (T/M/C Plaka) Aylık Garantili Şoför Kirası
    let plateRentTotal = 0;
    if (G.garageV2 && Array.isArray(G.garageV2.plates)) {
      G.garageV2.plates.forEach(pid => {
        const pl = COMMERCIAL_PLATES_DB.find(x => x.id === pid);
        if (pl) plateRentTotal += Math.round(c.monthlyMinWage * pl.monthlyRentMult);
      });
    }
    if (plateRentTotal > 0) {
      fin.monthlyRentalIncome += plateRentTotal;
      fin.monthlyNetCashflow += plateRentTotal;
    }

    // D) Çocuk CEO Şirket Kâr Çarpanı (+%15)
    if (G.lifeV2 && G.lifeV2.ceoKids.length > 0 && fin.monthlyBizProfit > 0) {
      const ceoBonus = Math.round(fin.monthlyBizProfit * 0.15 * G.lifeV2.ceoKids.length);
      fin.monthlyBizProfit += ceoBonus;
      fin.monthlyNetCashflow += ceoBonus;
    }

    fin.annualNetCashflow = fin.monthlyNetCashflow * 12;
    return fin;
  };

  // 2. Futbol & Spor Merkezini 5 Sekmeli Yap (Futbolcu, Teknik Direktör, Başkan, İddaa, Diğer) + İnteraktif Kale Butonu
  const _prevUnifiedFb = window.renderUnifiedFootballHub;
  window.renderUnifiedFootballHub = function () {
    ensureMegaV2State();
    const p = G.proPlayer;
    const cl = G.club;

    const nav5 = `
      <div class="grid grid-cols-5 gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-3 text-[9.5px] font-extrabold">
        <button onclick="unifiedSportsMainTab='player'; openMenuSection('sports')" class="py-2 rounded-xl ${unifiedSportsMainTab === 'player' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}">⚽ Futbolcu</button>
        <button onclick="unifiedSportsMainTab='coach'; openMenuSection('sports')" class="py-2 rounded-xl ${unifiedSportsMainTab === 'coach' ? 'bg-sky-500 text-slate-950' : 'text-slate-400'}">🧥 T.Direktör</button>
        <button onclick="unifiedSportsMainTab='president'; openMenuSection('sports')" class="py-2 rounded-xl ${unifiedSportsMainTab === 'president' ? 'bg-orange-500 text-slate-950' : 'text-slate-400'}">🏟️ Başkan</button>
        <button onclick="unifiedSportsMainTab='iddaa'; openMenuSection('sports')" class="py-2 rounded-xl ${unifiedSportsMainTab === 'iddaa' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}">🎯 İddaa</button>
        <button onclick="unifiedSportsMainTab='other_sports'; openMenuSection('sports')" class="py-2 rounded-xl ${unifiedSportsMainTab === 'other_sports' ? 'bg-purple-500 text-white' : 'text-slate-400'}">🏀 Diğer</button>
      </div>
    `;

    if (unifiedSportsMainTab === 'coach') {
      return renderHeroBannerHTML('sports') + nav5 + renderCoachCareerTabHTML();
    }
    if (unifiedSportsMainTab === 'iddaa') {
      return renderHeroBannerHTML('sports') + nav5 + renderIddaaBulletinTabHTML();
    }

    let baseHtml = _prevUnifiedFb();
    // Eski 3'lü sekmeyi 5'li sekmeyle değiştir ve İnteraktif Kale butonunu ekle
    baseHtml = baseHtml.replace(/<div class="grid grid-cols-3[\s\S]*?<\/div>/, nav5);

    if (unifiedSportsMainTab === 'player' && p && p.active) {
      const shotBtn = `
        <button onclick="openInteractiveGoalShotModal('player')" class="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-400 text-slate-950 text-xs font-black shadow-lg mb-2.5">
          🥅 6 KÖŞELİ İNTERAKTİF KALE: FRİKİK &amp; PENALTI KULLAN!
        </button>
      `;
      baseHtml = baseHtml.replace(nav5, nav5 + shotBtn);
    }
    return baseHtml;
  };

  // 3. Galeri ve Emlak Ekranlarını Alt Sekmeli Mega Merkez Haline Getir
  const _prevOpenMenuSec = openMenuSection;
  openMenuSection = function (sec) {
    ensureMegaV2State();

    if (sec === 'cars') {
      _prevOpenMenuSec(sec);
      const body = document.getElementById('sheetBody');
      if (!body) return;
      const carTabs = `
        <div class="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-3 text-[10px] font-extrabold">
          <button onclick="garageSubTabV2='dealer_my'; openMenuSection('cars')" class="py-2 rounded-xl ${garageSubTabV2 === 'dealer_my' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}">🚘 Galeri &amp; 2.El</button>
          <button onclick="garageSubTabV2='dyno_sound'; openMenuSection('cars')" class="py-2 rounded-xl ${garageSubTabV2 === 'dyno_sound' ? 'bg-purple-500 text-white' : 'text-slate-400'}">🔊 Dyno &amp; Ses</button>
          <button onclick="garageSubTabV2='taxi_tuv'; openMenuSection('cars')" class="py-2 rounded-xl ${garageSubTabV2 === 'taxi_tuv' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}">🚕 Taksi Plaka</button>
        </div>
      `;
      if (garageSubTabV2 !== 'dealer_my') {
        body.innerHTML = renderHeroBannerHTML('cars') + carTabs + renderGarageV2TabsHTML();
      } else {
        body.insertAdjacentHTML('afterbegin', carTabs);
      }
      return;
    }

    if (sec === 'houses') {
      _prevOpenMenuSec(sec);
      const body = document.getElementById('sheetBody');
      if (!body) return;
      const houseTabs = `
        <div class="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-3 text-[10px] font-extrabold">
          <button onclick="realEstateSubTabV2='houses'; openMenuSection('houses')" class="py-2 rounded-xl ${realEstateSubTabV2 === 'houses' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}">🏠 Konut, Kiracı &amp; UYAP</button>
          <button onclick="realEstateSubTabV2='land_yapsat'; openMenuSection('houses')" class="py-2 rounded-xl ${realEstateSubTabV2 === 'land_yapsat' ? 'bg-orange-500 text-slate-950' : 'text-slate-400'}">🏗️ Arsa İmar &amp; Müteahhitlik</button>
        </div>
      `;
      if (realEstateSubTabV2 === 'land_yapsat') {
        body.innerHTML = renderHeroBannerHTML('houses') + houseTabs + renderLandAndYapSatHTML();
      } else {
        body.insertAdjacentHTML('afterbegin', houseTabs);
      }
      return;
    }

    // Sağlık / Hastane Sekmesine Özel Sağlık Sigortası (ÖSS) Ücretsiz Check-Up Ekle
    if (sec === 'doctor') {
      _prevOpenMenuSec(sec);
      const body = document.getElementById('sheetBody');
      if (body && G.jobId) {
        const ossCard = `
          <div class="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between mb-3">
            <div>
              <div class="text-xs font-extrabold text-emerald-300">🏥 Özel Sağlık Sigortası (ÖSS) VIP Poliçesi</div>
              <div class="text-[10px] text-slate-300">İşyeri yan hakkın sayesinde özel hastanede sıra beklemeden ücretsiz tedavi!</div>
            </div>
            <button onclick="G.health=100; G.stress=Math.max(0,(G.stress||20)-25); playSfx('trophy'); showToast('ÖSS ile ücretsiz VIP tedavi oldun!'); saveGame(); renderAll(); openMenuSection('doctor');" class="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-[10px] font-extrabold shrink-0">
              Ücretsiz VIP Tedavi
            </button>
          </div>
        `;
        body.insertAdjacentHTML('afterbegin', ossCard);
      }
      return;
    }

    _prevOpenMenuSec(sec);
  };

  // 4. Kariyer Sekmesine 5. Sekme Olarak "🏢 Ofis & E-Ticaret" ve İlişkiler Sekmesine "Tatil & Hanedan" Ekle
  const _prevOpenNav = openNavSheet;
  openNavSheet = function (tab) {
    ensureMegaV2State();

    if (tab === 'career' && careerMainSubTab === 'freelance_ecom') {
      const sheet = document.getElementById('bottomSheet');
      sheet.classList.remove('hidden');
      document.getElementById('sheetTitle').textContent = '🏢 Serbest Ofis & E-Ticaret Pazaryeri';
      document.getElementById('sheetSubtitle').textContent = 'Mali/Gümrük Müşavirliği & Trendyol/Amazon Mağazası';
      const nav5Career = `
        <div class="grid grid-cols-5 gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-2.5 text-[9.5px] font-extrabold">
          <button onclick="careerMainSubTab='portal'; openNavSheet('career')" class="py-2 rounded-xl text-slate-400">💼 İlan</button>
          <button onclick="careerMainSubTab='workplace'; openNavSheet('career')" class="py-2 rounded-xl text-slate-400">📈 İşyeri</button>
          <button onclick="careerMainSubTab='freelance_ecom'; openNavSheet('career')" class="py-2 rounded-xl bg-sky-500 text-slate-950 shadow">🏢 Ofis/E-Tic</button>
          <button onclick="careerMainSubTab='edu_kpss'; openNavSheet('career')" class="py-2 rounded-xl text-slate-400">🎓 KPSS</button>
          <button onclick="careerMainSubTab='sgk_cv'; openNavSheet('career')" class="py-2 rounded-xl text-slate-400">📋 SGK/CV</button>
        </div>
      `;
      document.getElementById('sheetBody').innerHTML = renderHeroBannerHTML('career') + nav5Career + renderFreelanceAndEcommerceTabHTML();
      return;
    }

    _prevOpenNav(tab);
    const body = document.getElementById('sheetBody');
    if (!body || !G) return;

    if (tab === 'career') {
      const old4Grid = body.querySelector('.grid.grid-cols-4');
      if (old4Grid) {
        old4Grid.className = 'grid grid-cols-5 gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-2.5 text-[9.5px] font-extrabold';
        old4Grid.insertAdjacentHTML('beforeend', `
          <button onclick="careerMainSubTab='freelance_ecom'; openNavSheet('career')" class="py-2 rounded-xl text-sky-400">🏢 Ofis/E-Tic</button>
        `);
      }
    }

    if (tab === 'relations') {
      body.insertAdjacentHTML('beforeend', renderFamilyDynastyAndHolidaysHTML());
    }
  };
})();

/* ============================================================================
   HATA AYIKLAMA MOTORU + MARKET, YİYECEK, TEMİZLİK VE FATURALAR SİSTEMİ
   ============================================================================ */

// 1. Mutfak / Beslenme Paketleri (Aylık Düzenli Gider)
const FOOD_PLANS_DB = [
  {
    id: 'food_eko',
    name: '🥖 İndirim Marketi & Öğrenci Mutfağı',
    costMult: 0.18,
    healthDelta: -3,
    happyDelta: -2,
    desc: 'Makarna, dondurulmuş gıda ve ucuz erzak. Bütçe dostudur ama sağlığı yorar.'
  },
  {
    id: 'food_std',
    name: '🍲 Standart Ev Mutfağı & Taze Pazar',
    costMult: 0.36,
    healthDelta: 4,
    happyDelta: 4,
    desc: 'Haftalık semt pazarı, kasap eti ve sıcak ev yemekleri. Dengeli yaşam.'
  },
  {
    id: 'food_gurme',
    name: '🥩 Organik Şarküteri, Balık & Gurme Mutfak',
    costMult: 0.78,
    healthDelta: 9,
    happyDelta: 10,
    desc: 'Birinci sınıf et, organik ürünler ve seçkin restoranlar. Yüksek sağlık ve mutluluk!'
  }
];

// 2. Temizlik, Deterjan & Kişisel Bakım Paketleri (Aylık Düzenli Gider)
const CLEANING_PLANS_DB = [
  {
    id: 'clean_basic',
    name: '🧹 Kendi Temizliğin & Standart Deterjan',
    costMult: 0.08,
    looksDelta: 0,
    stressDelta: 3,
    desc: 'Temel çamaşır suyu, yüzey temizleyici ve hafta sonu kendi yaptığın ev temizliği.'
  },
  {
    id: 'clean_care',
    name: '🧴 Tam Hijyen, Kozmetik & Berber/Kuaför Paketi',
    costMult: 0.22,
    looksDelta: 6,
    stressDelta: -2,
    desc: 'Kaliteli deterjanlar, yumuşatıcı, cilt bakımı, parfüm ve düzenli kuaför bakımı.'
  },
  {
    id: 'clean_vip',
    name: '✨ Haftalık Temizlikçi, Kuru Temizleme & VIP Bakım',
    costMult: 0.55,
    looksDelta: 10,
    stressDelta: -12,
    desc: 'Eve her hafta profesyonel temizlik personeli gelir, kıyafetler kuru temizlemeye gider.'
  }
];

// 3. Parayı Harcayabileceğin Anlık Market, Temizlik, Eşya & Giyim Alışverişleri
const DIRECT_SHOPPING_ITEMS_DB = [
  {
    id: 'shop_erzak',
    name: '🛒 Aylık Büyük Market & Mutfak Erzak Alışverişi',
    icon: '🛍️',
    costMult: 0.32,
    desc: 'Buzdolabını ve kileri ağzına kadar doldurur (+8 Tokluk, +5 Mutluluk, +3 Sağlık).',
    effect: () => { G.household.pantryLevel = 100; G.happy = clamp(G.happy + 5); G.health = clamp(G.health + 3); }
  },
  {
    id: 'shop_detay_temizlik',
    name: '🧼 Dip Köşe Ev Temizliği, Halı/Koltuk Yıkama & İlaçlama',
    icon: '🫧',
    costMult: 0.28,
    desc: 'Evdeki tüm halı ve koltuklar yıkanır, ev pırıl pırıl olur (%100 Hijyen, -10 Stres).',
    effect: () => { G.household.hygieneLevel = 100; G.stress = clamp((G.stress || 20) - 10, 0, 100); G.health = clamp(G.health + 4); }
  },
  {
    id: 'shop_giyim',
    name: '👔 Sezonluk Gardırop, Ayakkabı & Orijinal Parfüm Alışverişi',
    icon: '🧥',
    costMult: 0.65,
    desc: 'Baştan aşağı yeni sezon kıyafetler ve imza parfüm (+9 Görünüm, +6 Mutluluk, +2 Şöhret).',
    effect: () => { G.looks = clamp(G.looks + 9); G.happy = clamp(G.happy + 6); G.fame = clamp(G.fame + 2); }
  },
  {
    id: 'shop_robovac',
    name: '🤖 Akıllı Robot Süpürge, Dyson & Espresso Makinesi Al',
    icon: '☕',
    costMult: 1.45,
    desc: 'Evdeki temizlik yükünü azaltır, her sabah taze kahve keyfi sunar (-15 Stres, +10 Mutluluk).',
    oneTime: true,
    effect: () => { G.household.hasSmartAppliances = true; G.stress = clamp((G.stress || 20) - 15, 0, 100); G.happy = clamp(G.happy + 10); }
  },
  {
    id: 'shop_beyaz_esya',
    name: '🧊 A+++ Çift Kapılı Buzdolabı, Çamaşır Kurutma & Klima Seti',
    icon: '❄️',
    costMult: 2.80,
    desc: 'Evin tüm beyaz eşyalarını yeniler, elektrik faturasını düşürür ve yaşam kalitesini artırır.',
    oneTime: true,
    effect: () => { G.household.hasNewWhiteGoods = true; G.happy = clamp(G.happy + 14); G.health = clamp(G.health + 6); }
  },
  {
    id: 'shop_restoran',
    name: '🍽️ Boğaz / Sahil Restoranında Lüks Akşam Yemeği',
    icon: '🥂',
    costMult: 0.40,
    desc: 'Ailenle veya dostlarınla mükellef bir masa kurarsın (-12 Stres, +8 Mutluluk).',
    effect: () => { G.stress = clamp((G.stress || 20) - 12, 0, 100); G.happy = clamp(G.happy + 8); }
  }
];

function ensureHouseholdState() {
  if (!G) return;
  if (!G.household) {
    G.household = {
      foodPlanId: 'food_std',
      cleanPlanId: 'clean_basic',
      hygieneLevel: 85,        // %0 - %100 Ev ve Kişisel Hijyen
      pantryLevel: 80,         // %0 - %100 Kiler / Mutfak Doluluğu
      fiberInternetSub: true,  // 1000 Mbps Fiber İnternet + TV Paketi
      hasSmartAppliances: false,
      hasNewWhiteGoods: false,
      boughtOneTimeItems: []
    };
  }
}

function getMonthlyHouseholdCostBreakdown() {
  ensureHouseholdState();
  if (!G || G.age < 18 || G.inPrison) {
    return { foodCost: 0, cleanCost: 0, billsCost: 0, totalMonthly: 0 };
  }
  const c = getCountry();
  const hh = G.household;
  const familySizeMult = 1 + (G.spouse ? 0.45 : 0) + ((G.children ? G.children.length : 0) * 0.25);

  const foodPlan = FOOD_PLANS_DB.find(x => x.id === hh.foodPlanId) || FOOD_PLANS_DB[1];
  const cleanPlan = CLEANING_PLANS_DB.find(x => x.id === hh.cleanPlanId) || CLEANING_PLANS_DB[0];

  const foodCost = Math.round(c.monthlyMinWage * foodPlan.costMult * familySizeMult);
  const cleanCost = Math.round(c.monthlyMinWage * cleanPlan.costMult * familySizeMult);

  // Faturalar: Elektrik, Su, Doğalgaz + Fiber İnternet & Spor/Dizi Paketi
  let billsMult = 0.14 + (G.houses.length * 0.05);
  if (hh.hasNewWhiteGoods) billsMult *= 0.80; // A+++ beyaz eşya tasarrufu
  if (hh.fiberInternetSub) billsMult += 0.06;
  const billsCost = Math.round(c.monthlyMinWage * billsMult);

  return {
    foodCost,
    cleanCost,
    billsCost,
    totalMonthly: foodCost + cleanCost + billsCost
  };
}

// Market, Temizlik ve Ev Ekonomisi Paneli Oluşturucu
window.renderHouseholdAndMarketHTML = function () {
  ensureHouseholdState();
  const c = getCountry();
  const hh = G.household;
  const costs = getMonthlyHouseholdCostBreakdown();

  const hygColor = hh.hygieneLevel >= 75 ? 'bg-emerald-400' : (hh.hygieneLevel >= 45 ? 'bg-amber-400' : 'bg-rose-500');
  const panColor = hh.pantryLevel >= 75 ? 'bg-sky-400' : (hh.pantryLevel >= 45 ? 'bg-amber-400' : 'bg-rose-500');

  return `
    <div class="household-hub-card space-y-3 mb-3" id="householdMarketHub">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <div>
          <div class="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest">🛒 EV EKONOMİSİ, MUTFAK &amp; TEMİZLİK MERKEZİ</div>
          <div class="text-xs font-extrabold text-white">Aylık Toplam Ev &amp; Market Gideri: <span class="text-rose-400 font-mono-num">-${fmtMoney(costs.totalMonthly)}/ay</span></div>
        </div>
        <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono-num font-bold">
          ${1 + (G.spouse ? 1 : 0) + (G.children ? G.children.length : 0)} Kişilik Hane
        </span>
      </div>

      <!-- Aylık Kalem Özeti -->
      <div class="grid grid-cols-3 gap-1.5 text-center text-[10px]">
        <div class="p-2 rounded-xl bg-slate-950 border border-slate-800">
          <div class="text-[8px] text-slate-400">🍲 MUTFAK / GIDA</div>
          <div class="font-extrabold font-mono-num text-rose-300">-${fmtMoney(costs.foodCost)}/ay</div>
        </div>
        <div class="p-2 rounded-xl bg-slate-950 border border-slate-800">
          <div class="text-[8px] text-slate-400">🧼 TEMİZLİK / BAKIM</div>
          <div class="font-extrabold font-mono-num text-rose-300">-${fmtMoney(costs.cleanCost)}/ay</div>
        </div>
        <div class="p-2 rounded-xl bg-slate-950 border border-slate-800">
          <div class="text-[8px] text-slate-400">⚡ FATURA &amp; FİBER</div>
          <div class="font-extrabold font-mono-num text-rose-300">-${fmtMoney(costs.billsCost)}/ay</div>
        </div>
      </div>

      <!-- Ev Hijyeni ve Kiler Doluluk Göstergeleri -->
      <div class="grid grid-cols-2 gap-2">
        <div class="hygiene-meter-wrap">
          <div class="flex justify-between text-[9.5px] font-bold mb-1">
            <span class="text-slate-300">🧼 Ev &amp; Kişisel Hijyen</span>
            <span class="font-mono-num text-emerald-400">%${hh.hygieneLevel}</span>
          </div>
          <div class="stat-track"><div class="stat-fill ${hygColor}" style="width:${hh.hygieneLevel}%"></div></div>
        </div>
        <div class="hygiene-meter-wrap">
          <div class="flex justify-between text-[9.5px] font-bold mb-1">
            <span class="text-slate-300">🥫 Mutfak &amp; Erzak Kileri</span>
            <span class="font-mono-num text-sky-400">%${hh.pantryLevel}</span>
          </div>
          <div class="stat-track"><div class="stat-fill ${panColor}" style="width:${hh.pantryLevel}%"></div></div>
        </div>
      </div>

      <!-- 1. Mutfak ve Beslenme Standardı Seçimi -->
      <div class="space-y-1.5">
        <div class="text-[10px] font-extrabold text-amber-300 uppercase">🍲 Aylık Mutfak &amp; Yiyecek Standardı</div>
        ${FOOD_PLANS_DB.map(fp => {
          const active = hh.foodPlanId === fp.id;
          const mCost = Math.round(c.monthlyMinWage * fp.costMult);
          return `
            <button onclick="setHouseholdPlan('food', '${fp.id}')" class="w-full p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 ${active ? 'border-emerald-500 bg-emerald-500/15' : 'border-slate-800 bg-slate-950'}">
              <div>
                <div class="text-xs font-extrabold text-white">${fp.name} ${active ? '<span class="text-emerald-400">✓</span>' : ''}</div>
                <div class="text-[10px] text-slate-400">${fp.desc}</div>
              </div>
              <span class="text-[10px] font-mono-num font-extrabold text-amber-300 shrink-0">${fmtMoney(mCost)}/ay</span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- 2. Temizlik, Deterjan ve Kişisel Bakım Standardı -->
      <div class="space-y-1.5">
        <div class="text-[10px] font-extrabold text-sky-300 uppercase">🧼 Aylık Temizlik, Deterjan &amp; Kişisel Bakım</div>
        ${CLEANING_PLANS_DB.map(cp => {
          const active = hh.cleanPlanId === cp.id;
          const mCost = Math.round(c.monthlyMinWage * cp.costMult);
          return `
            <button onclick="setHouseholdPlan('clean', '${cp.id}')" class="w-full p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 ${active ? 'border-sky-500 bg-sky-500/15' : 'border-slate-800 bg-slate-950'}">
              <div>
                <div class="text-xs font-extrabold text-white">${cp.name} ${active ? '<span class="text-sky-400">✓</span>' : ''}</div>
                <div class="text-[10px] text-slate-400">${cp.desc}</div>
              </div>
              <span class="text-[10px] font-mono-num font-extrabold text-sky-300 shrink-0">${fmtMoney(mCost)}/ay</span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- 3. Fiber İnternet & Dijital Abonelik Şalteri -->
      <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
        <div>
          <div class="text-xs font-extrabold text-white">🌐 1000 Mbps GigaFiber İnternet &amp; Spor/Dizi Paketi</div>
          <div class="text-[10px] text-slate-400">Her yıl +5 Mutluluk ve yayıncı/ev konforu sağlar</div>
        </div>
        <button onclick="toggleHouseholdFiber()" class="px-3 py-1.5 rounded-xl text-[10px] font-extrabold ${hh.fiberInternetSub ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}">
          ${hh.fiberInternetSub ? 'Aktif ✓' : 'Kapalı'}
        </button>
      </div>
    </div>

    <!-- 4. Anlık Market, Temizlik, Giyim & Beyaz Eşya Harcama Mağazası -->
    <div class="space-y-2 mb-3">
      <h4 class="text-xs font-extrabold uppercase tracking-wider text-emerald-400">🛍️ Market, Temizlik, Giyim &amp; Ev Alışverişi (Anlık Harca)</h4>
      ${DIRECT_SHOPPING_ITEMS_DB.map(item => {
        const cost = Math.round(c.monthlyMinWage * item.costMult);
        const alreadyOwned = item.oneTime && hh.boughtOneTimeItems.includes(item.id);
        return `
          <div class="shopping-item-card flex items-center justify-between gap-2">
            <div>
              <div class="text-xs font-extrabold text-white">${item.icon} ${item.name}</div>
              <div class="text-[10px] text-slate-400">${item.desc}</div>
            </div>
            <button onclick="buyHouseholdShoppingItem('${item.id}', ${cost})" class="px-3 py-2 rounded-xl text-[10px] font-extrabold shrink-0 ${alreadyOwned ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-500 text-slate-950'}">
              ${alreadyOwned ? 'Evde Var ✓' : `Satın Al (${fmtMoney(cost)})`}
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
};

window.setHouseholdPlan = function (type, planId) {
  ensureHouseholdState();
  if (type === 'food') G.household.foodPlanId = planId;
  if (type === 'clean') G.household.cleanPlanId = planId;
  playSfx('coin');
  saveGame();
  renderAll();
  refreshCurrentHouseholdView();
};

window.toggleHouseholdFiber = function () {
  ensureHouseholdState();
  G.household.fiberInternetSub = !G.household.fiberInternetSub;
  playSfx('coin');
  saveGame();
  renderAll();
  refreshCurrentHouseholdView();
};

window.buyHouseholdShoppingItem = function (itemId, cost) {
  ensureHouseholdState();
  const hh = G.household;
  const item = DIRECT_SHOPPING_ITEMS_DB.find(x => x.id === itemId);
  if (!item) return;
  if (item.oneTime && hh.boughtOneTimeItems.includes(itemId)) {
    showToast('Bu eşyayı zaten evine satın aldın!');
    return;
  }
  if (G.money < cost) {
    showToast(`Alışveriş için nakit bakiyen yetersiz! (${fmtMoney(cost)} gerekir)`);
    return;
  }

  G.money -= cost;
  if (item.oneTime) hh.boughtOneTimeItems.push(itemId);
  if (typeof item.effect === 'function') item.effect();

  playSfx('coin');
  addLog(G.age, `${item.icon} **EV & YAŞAM ALIŞVERİŞİ:** **${item.name}** için **-${fmtMoney(cost)}** harcadın!`, 'good');
  saveGame();
  renderAll();
  refreshCurrentHouseholdView();
};

function refreshCurrentHouseholdView() {
  const title = (document.getElementById('sheetTitle') || {}).textContent || '';
  if (title.includes('Market')) {
    openMenuSection('market_expenses');
  } else {
    openNavSheet('finance');
  }
}

/* ============================================================================
   ANA HATA TEMİZLEYİCİ VE EKONOMİ ENTEGRASYON KANCASI
   ============================================================================ */

(function attachBugfixAndHouseholdEngine() {
  if (window._bugfixAndHouseholdLoaded) return;
  window._bugfixAndHouseholdLoaded = true;

  // 1. DOM Üzerindeki Kötü Görünümlü Halkayı ve Sabit Para/Efor Barını Temizleyen Yardımcı
  function cleanBrokenUIElements() {
    document.querySelectorAll('.avatar-ring-svg, .sticky-modal-hud').forEach(el => el.remove());
    const avatar = document.getElementById('charAvatar');
    if (avatar && avatar.parentElement) {
      avatar.parentElement.classList.remove('avatar-ring-container');
    }
  }

  // 2. RenderAll Kancası: Her Çizimde Bozuk Halkayı Sil
  const _prevRenderAll = renderAll;
  renderAll = function () {
    ensureHouseholdState();
    _prevRenderAll();
    cleanBrokenUIElements();
  };

  // 3. Aylık Mutfak, Temizlik ve Fatura Masraflarını Ana Ekonomiye Bağla
  const _prevCalcFin = calculateFinances;
  calculateFinances = function () {
    ensureHouseholdState();
    const fin = _prevCalcFin();
    if (!G || G.inPrison || G.age < 18) return fin;

    const hhCosts = getMonthlyHouseholdCostBreakdown();
    fin.monthlyFoodCleanBills = hhCosts.totalMonthly;
    fin.monthlyLivingCost += hhCosts.totalMonthly;
    fin.monthlyNetCashflow -= hhCosts.totalMonthly;
    fin.annualNetCashflow = fin.monthlyNetCashflow * 12;
    return fin;
  };

  // 4. +1 Yaş İlerlediğinde Beslenme, Temizlik ve Hijyen Etkilerini Uygula
  const _prevAdvanceAge = advanceAge;
  advanceAge = function () {
    ensureHouseholdState();
    if (G && G.age >= 18 && !G.inPrison) {
      const hh = G.household;
      const fp = FOOD_PLANS_DB.find(x => x.id === hh.foodPlanId) || FOOD_PLANS_DB[1];
      const cp = CLEANING_PLANS_DB.find(x => x.id === hh.cleanPlanId) || CLEANING_PLANS_DB[0];

      G.health = clamp(G.health + fp.healthDelta);
      G.happy = clamp(G.happy + fp.happyDelta + (hh.fiberInternetSub ? 4 : 0));
      G.looks = clamp(G.looks + cp.looksDelta);
      G.stress = clamp((G.stress || 20) + cp.stressDelta, 0, 100);

      // Yıllık doğal hijyen ve kiler azalması (Robot süpürge varsa hijyen düşmez)
      const hygDrop = hh.hasSmartAppliances ? 4 : (hh.cleanPlanId === 'clean_vip' ? 0 : 12);
      hh.hygieneLevel = clamp(hh.hygieneLevel - hygDrop, 20, 100);
      hh.pantryLevel = clamp(hh.pantryLevel - (hh.foodPlanId === 'food_gurme' ? 5 : 15), 20, 100);

      if (hh.hygieneLevel < 40) {
        G.health = clamp(G.health - 5);
        addLog(G.age + 1, `🧹 **HİJYEN UYARISI:** Evin temizliği ve hijyeni çok düştü (%${hh.hygieneLevel}). Market & Temizlik menüsünden detaylı temizlik yaptır!`, 'bad');
      }
    }
    _prevAdvanceAge();
    cleanBrokenUIElements();
  };

  // 5. Menüye ve Finans Sekmesine "🛒 Market, Temizlik & Faturalar" Ekranını Bağla
  const _prevOpenMenuSec = openMenuSection;
  openMenuSection = function (sec) {
    ensureHouseholdState();
    if (sec === 'market_expenses') {
      const sheet = document.getElementById('bottomSheet');
      sheet.classList.remove('hidden');
      document.getElementById('sheetTitle').textContent = '🛒 Market, Temizlik & Faturalar';
      document.getElementById('sheetSubtitle').textContent = 'Mutfak Erzak, Deterjan/Hijyen, Giyim & Beyaz Eşya';
      document.getElementById('sheetBody').innerHTML = renderHouseholdAndMarketHTML();
      cleanBrokenUIElements();
      return;
    }
    _prevOpenMenuSec(sec);
    cleanBrokenUIElements();
  };

  const _prevOpenNav = openNavSheet;
  openNavSheet = function (tab) {
    ensureHouseholdState();
    _prevOpenNav(tab);
    cleanBrokenUIElements();

    const body = document.getElementById('sheetBody');
    if (!body || !G) return;

    // Finans -> Banka sekmesine doğrudan Market & Temizlik Yönetimi ekle
    if (tab === 'finance' && activeFinanceTab === 'bank' && !document.getElementById('householdMarketHub')) {
      body.insertAdjacentHTML('beforeend', `<div class="mt-3 pt-3 border-t border-slate-800">${renderHouseholdAndMarketHTML()}</div>`);
    }

    // Ana Menüye büyük "🛒 Market, Yiyecek & Temizlik Harcamaları" kartı ekle
    if (tab === 'menu' && !document.getElementById('menuMarketQuickBtn')) {
      const grid = body.querySelector('.grid.grid-cols-2');
      if (grid) {
        grid.insertAdjacentHTML('afterbegin', `
          <button id="menuMarketQuickBtn" onclick="openMenuSection('market_expenses')" class="col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-sky-500/15 border border-emerald-500/50 text-left flex items-center justify-between">
            <div>
              <div class="text-xs font-extrabold text-emerald-300 uppercase">🛒 MARKET, MUTFAK &amp; TEMİZLİK GİDERLERİ</div>
              <div class="text-sm font-extrabold text-white">Yiyecek, Deterjan, Faturalar, Giyim &amp; Beyaz Eşya</div>
            </div>
            <span class="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold shrink-0">Harcama Yap &rarr;</span>
          </button>
        `);
      }
    }
  };

  cleanBrokenUIElements();
})();

/* ============================================================================
   GTA iFRUIT TELEFON + RPG DİYALOG SAHNESİ + AYARLANABİLİR ŞEHİR HARİTASI MOTORU
   ============================================================================ */

let activePhoneApp = 'home'; // 'home' | 'chat' | 'sarisite' | 'cepbank' | 'settings'
let _rpgTypewriterTimer = null;

function ensureGameThemeV3State() {
  if (!G) return;

  // 1. Kullanıcı Arayüz & Harita Tercihleri (Ayarlardan Açılıp Kapatılabilir!)
  if (!G.uiPrefs) {
    G.uiPrefs = {
      showCityMap: true,        // İnteraktif Şehir Haritası Açık/Kapalı
      cityMapCompact: false,    // Küçültülmüş görünüm
      rpgDialoguesEnabled: true // FIFA/RPG Karakterli Diyalog Sahnesi Açık/Kapalı
    };
  }

  // 2. GTA iFruit Telefon & WhatsChat Durumu
  if (!G.phone) {
    G.phone = {
      inbox: [],
      operator: 'TurkNet 5G'
    };
    seedInitialPhoneMessages();
  }
}

function seedInitialPhoneMessages() {
  if (!G || !G.phone) return;
  if (G.phone.inbox.length === 0) {
    const firstMsgs = IFRUIT_CHAT_TEMPLATES_DB.slice(0, 3).map(t => ({
      uid: uid(),
      tplId: t.id,
      sender: t.sender,
      avatar: t.avatar,
      role: t.role,
      text: t.text,
      costMult: t.costMult,
      rewardMult: t.rewardMult,
      happyBoost: t.happyBoost || 0,
      stressCut: t.stressCut || 0,
      replyYes: t.replyYes,
      replyNo: t.replyNo,
      answered: false,
      myReplyText: null
    }));
    G.phone.inbox.push(...firstMsgs);
  }
}

function getUnreadPhoneCount() {
  if (!G || !G.phone || !Array.isArray(G.phone.inbox)) return 0;
  return G.phone.inbox.filter(m => !m.answered).length;
}

/* ============================================================================
   1. SİSTEM: 🗺️ İNTERAKTİF ŞEHİR HARİTASI (AYARLARDAN KALDIRILIP EKLENEBİLİR)
   ============================================================================ */

window.toggleCityMapPreference = function (forceState) {
  ensureGameThemeV3State();
  if (typeof forceState === 'boolean') {
    G.uiPrefs.showCityMap = forceState;
  } else {
    G.uiPrefs.showCityMap = !G.uiPrefs.showCityMap;
  }
  playSfx('coin');
  showToast(G.uiPrefs.showCityMap ? '🗺️ İnteraktif Şehir Haritası Açıldı!' : '🗺️ Şehir Haritası Gizlendi (Ayarlardan her zaman açabilirsin).');
  saveGame();
  renderAll();
};

window.toggleRpgDialoguePreference = function () {
  ensureGameThemeV3State();
  G.uiPrefs.rpgDialoguesEnabled = !G.uiPrefs.rpgDialoguesEnabled;
  playSfx('coin');
  saveGame();
  renderAll();
};

window.clickCityMapBuilding = function (actionType, target) {
  playSfx('coin');
  if (actionType === 'nav') {
    openNavSheet(target);
  } else {
    openMenuSection(target);
  }
};

function renderInteractiveCityMapHTML() {
  ensureGameThemeV3State();

  // Eğer kullanıcı Ayarlardan Şehir Haritasını kapattıysa haritayı hiç gösterme
  if (!G.uiPrefs.showCityMap) {
    return `
      <div class="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px]">
        <span class="text-slate-400">🗺️ İnteraktif Şehir Haritası kapalı (Klasik Görünüm)</span>
        <button onclick="toggleCityMapPreference(true)" class="text-sky-400 font-extrabold hover:underline">Haritayı Aç</button>
      </div>
    `;
  }

  const badgeCounts = {
    pin_stadium: (G.club && G.club.active) ? '👑 BAŞKAN' : ((G.proPlayer && G.proPlayer.active) ? '⚽ PRO' : ''),
    pin_plaza: (G.jobId || (G.career && G.career.isCivilServant)) ? '💼 AKTİF' : '',
    pin_sanayi: G.cars && G.cars.length > 0 ? `🚘 ${G.cars.length}` : '',
    pin_residence: G.houses && G.houses.length > 0 ? `🏠 ${G.houses.length}` : '',
    pin_state: (G.deepPol && G.deepPol.mySeats > 0) ? `🏛️ ${G.deepPol.mySeats} MV` : '',
    pin_media: (G.mediaStudio && G.mediaStudio.ownedOutlets.length > 0) ? `📡 ${G.mediaStudio.ownedOutlets.length}` : '',
    pin_mall: (G.household && G.household.hygieneLevel < 50) ? '🧹 ACİL' : '',
    pin_bank_hosp: G.businesses && G.businesses.length > 0 ? `🏭 ${G.businesses.length}` : ''
  };

  return `
    <div class="city-map-wrapper" id="interactiveCityMapBox">
      <div class="flex items-center justify-between mb-2 px-1">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-sky-300">🗺️ İNTERAKTİF METROPOL HARİTASI</span>
        </div>
        <div class="flex items-center gap-1.5">
          <button onclick="openIfruitPhone('settings')" class="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[9px] font-bold">⚙️ Ayarlar</button>
          <button onclick="toggleCityMapPreference(false)" class="px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[9px] font-bold">Gizle ✕</button>
        </div>
      </div>

      <div class="city-map-grid-surface">
        <!-- Boğaz / Deniz Hattı Süsü -->
        <div class="text-[8.5px] font-extrabold text-sky-300/80 text-center mb-1.5 tracking-widest uppercase">
          〰️ MARMARA &amp; BOĞAZ HATTI • BİNAYA DOKUNARAK MEKANA GİR 〰️
        </div>

        <div class="grid grid-cols-4 gap-1.5">
          ${CITY_MAP_DISTRICTS_DB.map(b => {
            const flagTxt = badgeCounts[b.id] || '';
            return `
              <div onclick="clickCityMapBuilding('${b.actionType}', '${b.target}')" class="city-building-pin ${b.accent}">
                ${flagTxt ? `<span class="city-pin-owner-flag">${flagTxt}</span>` : ''}
                <div class="text-xl leading-none mb-1">${b.icon}</div>
                <div class="text-[9.5px] font-extrabold text-white truncate">${b.name}</div>
                <div class="text-[8px] text-slate-400 truncate">${b.sub}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ============================================================================
   2. SİSTEM: 📱 GTA iFRUIT AKILLI TELEFON VE CANLI MESAJLAŞMA (WHATSCHAT)
   ============================================================================ */

window.openIfruitPhone = function (app = 'home') {
  ensureGameThemeV3State();
  activePhoneApp = app;

  let modal = document.getElementById('ifruitPhoneOverlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ifruitPhoneOverlay';
    modal.className = 'ifruit-phone-backdrop hidden';
    document.body.appendChild(modal);
  }
  modal.classList.remove('hidden');
  renderIfruitPhoneContent();
};

window.closeIfruitPhone = function () {
  const modal = document.getElementById('ifruitPhoneOverlay');
  if (modal) modal.classList.add('hidden');
  renderAll();
};

function renderIfruitPhoneContent() {
  const modal = document.getElementById('ifruitPhoneOverlay');
  if (!modal || !G) return;

  const c = getCountry();
  const unread = getUnreadPhoneCount();

  let appBodyHtml = '';

  // UYGULAMA 1: TELEFON ANA EKRANI (APP GRID)
  if (activePhoneApp === 'home') {
    appBodyHtml = `
      <div class="p-3 space-y-3 flex-1 overflow-y-auto">
        <!-- Telefon Üst Hava Durumu & Cüzdan Widget'ı -->
        <div class="p-3 rounded-2xl bg-gradient-to-br from-sky-600/30 via-indigo-900/40 to-slate-900 border border-sky-400/30 flex items-center justify-between">
          <div>
            <div class="text-[9px] font-extrabold text-sky-300 uppercase">📍 ${c.name} • 21°C Açık</div>
            <div class="text-sm font-extrabold text-white">${G.firstName} ${G.lastName}</div>
            <div class="text-[10px] font-mono-num text-emerald-400">Cüzdan: ${fmtMoney(G.money)}</div>
          </div>
          <div class="text-2xl">📱</div>
        </div>

        <!-- Uygulama İkonları Grid -->
        <div class="grid grid-cols-3 gap-2.5 pt-1">
          <button onclick="openIfruitPhone('chat')" class="ifruit-app-icon">
            ${unread > 0 ? `<span class="ifruit-unread-badge">${unread}</span>` : ''}
            <div class="ifruit-app-icon-box bg-gradient-to-br from-emerald-400 to-green-600 text-slate-950">💬</div>
            <span class="text-[10px] font-extrabold text-white">WhatsChat</span>
          </button>

          <button onclick="openIfruitPhone('sarisite')" class="ifruit-app-icon">
            <div class="ifruit-app-icon-box bg-gradient-to-br from-amber-300 to-yellow-500 text-slate-950">🟡</div>
            <span class="text-[10px] font-extrabold text-white">SarıSite</span>
          </button>

          <button onclick="openIfruitPhone('cepbank')" class="ifruit-app-icon">
            <div class="ifruit-app-icon-box bg-gradient-to-br from-sky-400 to-blue-600 text-white">🏦</div>
            <span class="text-[10px] font-extrabold text-white">CepBank</span>
          </button>

          <button onclick="closeIfruitPhone(); openMenuSection('social')" class="ifruit-app-icon">
            <div class="ifruit-app-icon-box bg-gradient-to-br from-orange-500 to-amber-600 text-slate-950">🟠</div>
            <span class="text-[10px] font-extrabold text-white">Skor Ağı</span>
          </button>

          <button onclick="closeIfruitPhone(); openMenuSection('sports')" class="ifruit-app-icon">
            <div class="ifruit-app-icon-box bg-gradient-to-br from-emerald-500 to-teal-700 text-white">🎯</div>
            <span class="text-[10px] font-extrabold text-white">İddaa &amp; Maç</span>
          </button>

          <button onclick="openIfruitPhone('settings')" class="ifruit-app-icon">
            <div class="ifruit-app-icon-box bg-gradient-to-br from-slate-600 to-slate-800 text-white">⚙️</div>
            <span class="text-[10px] font-extrabold text-white">Ayarlar</span>
          </button>
        </div>

        <!-- Son Gelen Mesaj Önizlemesi -->
        <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
          <div class="flex items-center justify-between text-[10px] font-extrabold text-emerald-400">
            <span>💬 SON WHATSAT MESAJLARI</span>
            <button onclick="openIfruitPhone('chat')" class="underline">Tümünü Aç (${unread})</button>
          </div>
          ${G.phone.inbox.slice(0, 2).map(m => `
            <div onclick="openIfruitPhone('chat')" class="p-2 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-2 cursor-pointer">
              <span class="text-lg">${m.avatar}</span>
              <div class="min-w-0 flex-1">
                <div class="text-[10px] font-extrabold text-white truncate">${m.sender}</div>
                <div class="text-[9.5px] text-slate-400 truncate">${m.text}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // UYGULAMA 2: WHATSCHAT (CANLI MESAJLAŞMA VE TEKLİF YANITLAMA)
  else if (activePhoneApp === 'chat') {
    appBodyHtml = `
      <div class="p-3 space-y-2.5 flex-1 overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <div class="text-xs font-extrabold text-emerald-400">💬 WhatsChat Sohbetler</div>
            <div class="text-[9.5px] text-slate-400">Arkadaşların, galericiler ve iş dünyasından gelen canlı mesajlar</div>
          </div>
          <button onclick="generateNewPhoneChatMsg(); renderIfruitPhoneContent();" class="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[9.5px] font-extrabold">+ Yeni Mesaj</button>
        </div>

        ${G.phone.inbox.map((msg, idx) => {
          const costAmt = Math.round(c.monthlyMinWage * (msg.costMult || 0));
          const rewAmt = Math.round(c.monthlyMinWage * (msg.rewardMult || 0));
          return `
            <div class="p-2.5 rounded-2xl bg-slate-900/95 border ${msg.answered ? 'border-slate-800' : 'border-emerald-500/50'} space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-lg">${msg.avatar}</span>
                <div>
                  <div class="text-[11px] font-extrabold text-white">${msg.sender}</div>
                  <div class="text-[9px] text-slate-400">${msg.role}</div>
                </div>
              </div>

              <div class="chat-bubble-npc">${msg.text}</div>

              ${msg.answered ? `
                <div class="chat-bubble-me">${msg.myReplyText} ✓✓</div>
              ` : `
                <div class="space-y-1 pt-1">
                  <button onclick="replyWhatsChatMessage(${idx}, true)" class="w-full py-1.5 px-2.5 rounded-xl bg-emerald-500 text-slate-950 text-[10px] font-extrabold text-left flex items-center justify-between">
                    <span>${msg.replyYes}</span>
                    <span class="font-mono-num">${costAmt > 0 ? '-' + fmtMoney(costAmt) : 'Onayla'}</span>
                  </button>
                  <button onclick="replyWhatsChatMessage(${idx}, false)" class="w-full py-1.5 px-2.5 rounded-xl bg-slate-800 text-slate-300 text-[10px] font-bold text-left">
                    ${msg.replyNo}
                  </button>
                </div>
              `}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // UYGULAMA 3: SARI SİTE MOBİL (HIZLI AL-SAT & PAZARLIK DİYALOĞU)
  else if (activePhoneApp === 'sarisite') {
    appBodyHtml = `
      <div class="p-3 space-y-2.5 flex-1 overflow-y-auto">
        <div class="p-2.5 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-between">
          <span class="text-xs font-black">🟡 sarısite.com Mobil İlanlar</span>
          <span class="text-[9px] font-extrabold">Canlı Pazarlık</span>
        </div>
        ${(typeof USED_CAR_MARKET_DB !== 'undefined' ? USED_CAR_MARKET_DB : []).map((uc, idx) => {
          const ask = Math.round(c.monthlyMinWage * uc.baseMult);
          return `
            <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div class="flex justify-between items-center">
                <span class="text-xs font-extrabold text-white">${uc.icon} ${uc.name}</span>
                <span class="text-xs font-mono-num font-extrabold text-amber-400">${fmtMoney(ask)}</span>
              </div>
              <div class="text-[9.5px] text-slate-400">"${uc.sellerNote}"</div>
              <button onclick="closeIfruitPhone(); openRpgCarBargainScene(${idx})" class="w-full py-1.5 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-extrabold">
                💬 Satıcıyla Yüz Yüze Pazarlığa Otur (RPG Sahnesi)
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // UYGULAMA 4: CEPBANK MOBİL
  else if (activePhoneApp === 'cepbank') {
    const fin = calculateFinances();
    appBodyHtml = `
      <div class="p-3 space-y-2.5 flex-1 overflow-y-auto">
        <div class="p-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-700 text-white space-y-1">
          <div class="text-[9px] uppercase font-bold opacity-80">CEPBANK VADESİZ HESAP</div>
          <div class="text-lg font-mono-num font-black">${fmtMoney(G.money)}</div>
          <div class="text-[10px]">Aylık Net Akış: <strong>${fin.monthlyNetCashflow >= 0 ? '+' : ''}${fmtMoney(fin.monthlyNetCashflow)}/ay</strong></div>
        </div>
        <button onclick="closeIfruitPhone(); openNavSheet('finance')" class="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold">
          🏦 Tam Banka, Altın &amp; Holding Ekranını Aç
        </button>
      </div>
    `;
  }

  // UYGULAMA 5: TELEFON & OYUN AYARLARI (HARİTA VE DİYALOG AÇ/KAPAT)
  else if (activePhoneApp === 'settings') {
    appBodyHtml = `
      <div class="p-3 space-y-3 flex-1 overflow-y-auto">
        <div class="text-xs font-extrabold text-sky-400 border-b border-slate-800 pb-1.5">⚙️ Oyun Görünümü &amp; Harita Ayarları</div>

        <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
          <div>
            <div class="text-xs font-extrabold text-white">🗺️ İnteraktif Şehir Haritası</div>
            <div class="text-[10px] text-slate-400">Ana ekranda binalara tıklanan şehir haritasını gösterir veya gizler.</div>
          </div>
          <button onclick="toggleCityMapPreference(); renderIfruitPhoneContent();" class="px-3 py-2 rounded-xl text-[10px] font-extrabold shrink-0 ${G.uiPrefs.showCityMap ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}">
            ${G.uiPrefs.showCityMap ? 'AÇIK ✓' : 'KAPALI'}
          </button>
        </div>

        <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
          <div>
            <div class="text-xs font-extrabold text-white">🎭 Karakterli RPG Diyalog Sahnesi</div>
            <div class="text-[10px] text-slate-400">Olayları ve pazarlıkları FIFA/RPG tarzı karakter portresi ve daktilo konuşma balonuyla açar.</div>
          </div>
          <button onclick="toggleRpgDialoguePreference(); renderIfruitPhoneContent();" class="px-3 py-2 rounded-xl text-[10px] font-extrabold shrink-0 ${G.uiPrefs.rpgDialoguesEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}">
            ${G.uiPrefs.rpgDialoguesEnabled ? 'AÇIK ✓' : 'KAPALI'}
          </button>
        </div>
      </div>
    `;
  }

  modal.innerHTML = `
    <div class="ifruit-phone-shell">
      <!-- Üst Çentik (Dynamic Island) & Durum Çubuğu -->
      <div class="px-4 pt-2 pb-1 flex items-center justify-between text-[9.5px] font-mono-num text-slate-300">
        <span>${G.phone.operator}</span>
        <div class="ifruit-notch"><div class="ifruit-notch-cam"></div></div>
        <span>🔋 96%</span>
      </div>

      <!-- Üst Uygulama Başlığı -->
      <div class="px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between">
        ${activePhoneApp !== 'home' ? `
          <button onclick="openIfruitPhone('home')" class="text-[11px] font-extrabold text-sky-400">&larr; Ana Ekran</button>
        ` : `<span class="text-[10px] font-extrabold text-slate-400">iFruit OS 18</span>`}
        <button onclick="closeIfruitPhone()" class="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold">Kapat ✕</button>
      </div>

      ${appBodyHtml}

      <!-- Alt Home Çubuğu -->
      <div class="py-2 flex justify-center border-t border-slate-900 bg-slate-950">
        <button onclick="openIfruitPhone('home')" class="w-28 h-1.5 rounded-full bg-slate-600 hover:bg-white transition"></button>
      </div>
    </div>
  `;
}

window.replyWhatsChatMessage = function (idx, accepted) {
  ensureGameThemeV3State();
  const msg = G.phone.inbox[idx];
  if (!msg || msg.answered) return;
  const c = getCountry();
  const cost = Math.round(c.monthlyMinWage * (msg.costMult || 0));
  const reward = Math.round(c.monthlyMinWage * (msg.rewardMult || 0));

  if (accepted) {
    if (cost > 0 && G.money < cost) {
      showToast(`Bu teklifi onaylamak için ${fmtMoney(cost)} nakit gerekiyor!`);
      return;
    }
    G.money -= cost;
    G.money += reward;
    if (msg.happyBoost) G.happy = clamp(G.happy + msg.happyBoost);
    if (msg.stressCut) G.stress = clamp((G.stress || 20) - msg.stressCut, 0, 100);
    msg.answered = true;
    msg.myReplyText = msg.replyYes;
    playSfx('trophy');
    addLog(G.age, `📱 **WHATSAT ANLAŞMASI (${msg.sender}):** Mesaj üzerinden teklifi onayladın! ${reward > cost ? `(**+${fmtMoney(reward - cost)} Net Kazanç**)` : ''}`, 'good');
  } else {
    msg.answered = true;
    msg.myReplyText = msg.replyNo;
    playSfx('coin');
  }

  saveGame();
  renderAll();
  renderIfruitPhoneContent();
};

window.generateNewPhoneChatMsg = function () {
  ensureGameThemeV3State();
  const tpl = pickRandom(IFRUIT_CHAT_TEMPLATES_DB);
  G.phone.inbox.unshift({
    uid: uid(),
    tplId: tpl.id,
    sender: tpl.sender,
    avatar: tpl.avatar,
    role: tpl.role,
    text: tpl.text,
    costMult: tpl.costMult,
    rewardMult: tpl.rewardMult,
    happyBoost: tpl.happyBoost || 0,
    stressCut: tpl.stressCut || 0,
    replyYes: tpl.replyYes,
    replyNo: tpl.replyNo,
    answered: false,
    myReplyText: null
  });
  if (G.phone.inbox.length > 8) G.phone.inbox.pop();
};

/* ============================================================================
   3. SİSTEM: 🎭 KARAKTERLİ RPG DİYALOG SAHNESİ VE KONUŞMA BALONLARI
   ============================================================================ */

function detectNpcPersonaFromConfig(cfg) {
  const txt = ((cfg.badge || '') + ' ' + (cfg.title || '')).toLowerCase();
  if (/ik|mülakat|terfi|iş|şirket/.test(txt)) return RPG_NPC_PERSONAS_DB.hr_manager;
  if (/sarı site|araç|galeri|ekspertiz|noter|alıcı/.test(txt)) return RPG_NPC_PERSONAS_DB.car_dealer;
  if (/mahkeme|icra|fesih|arabulucu|hakim|vergi/.test(txt)) return RPG_NPC_PERSONAS_DB.judge_law;
  if (/futbol|kulüp|transfer|maç|scout|tff/.test(txt)) return RPG_NPC_PERSONAS_DB.football_agent;
  return RPG_NPC_PERSONAS_DB.default_npc;
}

window.openRpgCarBargainScene = function (carIdx) {
  if (typeof USED_CAR_MARKET_DB === 'undefined') return;
  const uc = USED_CAR_MARKET_DB[carIdx];
  if (!uc) return;
  const c = getCountry();
  const askPrice = Math.round(c.monthlyMinWage * uc.baseMult);
  const lowPrice = Math.round(askPrice * 0.85);

  openEventModal({
    badge: `🚗 OTO SANAYİ & NOTER PAZARLIK MASASI`,
    title: `${uc.name} — Satıcıyla Yüz Yüze Pazarlık`,
    desc: `"Bak kardeşim, ${uc.name} çiçek gibi araba. ${uc.sellerNote} İlan fiyatım ${fmtMoney(askPrice)}, ama ciddi alıcıysan noterde biraz ikram yaparım. Teklifin nedir?"`,
    choices: [
      {
        label: `🤝 "Usta nakit ${fmtMoney(lowPrice)} hazır, hemen notere gidelim!" (-%15 İndirim)`,
        action: () => buyUsedCarWithBargain(carIdx, true)
      },
      {
        label: `💵 "Uzun lafa gerek yok, ${fmtMoney(askPrice)} veriyorum, hayırlı olsun."`,
        action: () => buyUsedCarWithBargain(carIdx, false)
      },
      {
        label: `🚪 "Fiyat yüksek geldi usta, iyi satışlar." (Masadan Kalk)`,
        action: () => {}
      }
    ]
  });
};

function showRpgCharacterDialogueModal(cfg) {
  const npc = cfg.npc || detectNpcPersonaFromConfig(cfg);
  let overlay = document.getElementById('rpgDialogueOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'rpgDialogueOverlay';
    overlay.className = 'rpg-dialogue-backdrop hidden';
    document.body.appendChild(overlay);
  }
  overlay.classList.remove('hidden');

  window._currentRpgChoices = cfg.choices || [];

  overlay.innerHTML = `
    <div class="rpg-dialogue-stage">
      <!-- Üst Sahne: Senin Karakterin vs Karşı Karakter (NPC) -->
      <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
        <!-- Oyuncu Portresi -->
        <div class="flex items-center gap-2">
          <img src="${typeof getCurrentPortrait === 'function' ? getCurrentPortrait() : ''}" class="w-11 h-11 rounded-xl object-cover border-2 border-emerald-400" />
          <div>
            <div class="text-[9px] font-extrabold text-emerald-400 uppercase">SEN</div>
            <div class="text-xs font-extrabold text-white">${G.firstName}</div>
          </div>
        </div>

        <div class="px-2 py-0.5 rounded-full bg-slate-800 text-[9px] font-black text-amber-300">KARŞI KARŞIYA</div>

        <!-- NPC Portresi ve Sabır Barı -->
        <div class="flex items-center gap-2 text-right">
          <div>
            <div class="text-xs font-extrabold text-white">${npc.name}</div>
            <div class="text-[9px] text-sky-400 font-bold">${npc.role}</div>
            <div class="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-auto mt-1">
              <div class="h-full bg-amber-400" style="width:${npc.patience}%"></div>
            </div>
          </div>
          <div class="w-11 h-11 rounded-xl bg-slate-800 border-2 border-amber-400 flex items-center justify-center text-2xl shrink-0">
            ${npc.avatar}
          </div>
        </div>
      </div>

      <!-- Sahne Başlığı -->
      <div class="mt-2 flex items-center justify-between text-[10px]">
        <span class="font-extrabold text-amber-300 uppercase">${cfg.badge || '🎭 DİYALOG SAHNESİ'}</span>
        <span class="text-slate-400">Sabır: %${npc.patience} (${npc.moodText})</span>
      </div>
      <div class="text-sm font-extrabold text-white mt-0.5">${cfg.title || ''}</div>

      <!-- Daktilo Efektli Konuşma Balonu -->
      <div class="rpg-speech-box">
        <div class="text-[10px] font-extrabold text-emerald-400 mb-1">💬 ${npc.name} diyor ki:</div>
        <p id="rpgTypewriterText" class="text-xs text-slate-100 leading-relaxed font-medium"></p>
      </div>

      <!-- Diyalog Cevap Seçenekleri -->
      <div class="space-y-2">
        ${(cfg.choices || []).map((ch, idx) => `
          <button onclick="selectRpgDialogueChoice(${idx})" class="rpg-choice-btn">
            <span>💬 ${ch.label}</span>
            <span class="text-emerald-400 text-xs">&rarr;</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  // Daktilo (Typewriter) Yazı Animasyonu
  if (_rpgTypewriterTimer) clearInterval(_rpgTypewriterTimer);
  const fullText = cfg.desc || '';
  const textEl = document.getElementById('rpgTypewriterText');
  let charIdx = 0;
  _rpgTypewriterTimer = setInterval(() => {
    if (!textEl) {
      clearInterval(_rpgTypewriterTimer);
      return;
    }
    charIdx += 3;
    textEl.textContent = fullText.slice(0, charIdx);
    if (charIdx >= fullText.length) {
      clearInterval(_rpgTypewriterTimer);
    }
  }, 18);
}

window.selectRpgDialogueChoice = function (idx) {
  if (_rpgTypewriterTimer) clearInterval(_rpgTypewriterTimer);
  const overlay = document.getElementById('rpgDialogueOverlay');
  if (overlay) overlay.classList.add('hidden');

  const ch = (window._currentRpgChoices || [])[idx];
  if (ch && typeof ch.action === 'function') {
    ch.action();
  }
  saveGame();
  renderAll();
};

/* ============================================================================
   ANA ENTEGRASYON KANCALARI (HARİTA, TELEFON BUTONU, RPG DİYALOG & AYARLAR)
   ============================================================================ */

(function attachGameThemeV3Master() {
  if (window._gameThemeV3MasterLoaded) return;
  window._gameThemeV3MasterLoaded = true;

  // 1. openEventModal Kancası: RPG Diyalog Sahnesi Açıksa Karakterli Sahneyi Göster
  const _origOpenEventModal = window.openEventModal;
  window.openEventModal = function (cfg) {
    ensureGameThemeV3State();
    if (G && G.uiPrefs && G.uiPrefs.rpgDialoguesEnabled && cfg && Array.isArray(cfg.choices)) {
      showRpgCharacterDialogueModal(cfg);
      return;
    }
    if (typeof _origOpenEventModal === 'function') {
      _origOpenEventModal(cfg);
    }
  };

  // 2. RenderAll Kancası: Şehir Haritasını ve Sağ Alt iFruit Telefon Butonunu Ekrana Yerleştir
  const _prevRenderAll = renderAll;
  renderAll = function () {
    ensureGameThemeV3State();
    _prevRenderAll();
    if (!G) return;

    // A) İnteraktif Şehir Haritasını Zaman Tünelinin Üstüne Yerleştir
    const logFilterBar = document.getElementById('logFilterBarContainer');
    const logContainer = document.getElementById('logContainer');
    const anchorEl = logFilterBar || logContainer;

    if (anchorEl) {
      let mapContainer = document.getElementById('cityMapRootContainer');
      if (!mapContainer) {
        mapContainer = document.createElement('div');
        mapContainer.id = 'cityMapRootContainer';
        anchorEl.parentNode.insertBefore(mapContainer, anchorEl);
      }
      mapContainer.innerHTML = renderInteractiveCityMapHTML();
    }

    // B) Sağ Alt Yüzen GTA iFruit Telefon Butonu
    let fab = document.getElementById('ifruitFloatingBtn');
    if (!fab) {
      fab = document.createElement('button');
      fab.id = 'ifruitFloatingBtn';
      fab.className = 'ifruit-fab-btn';
      fab.setAttribute('onclick', "openIfruitPhone('home')");
      document.body.appendChild(fab);
    }
    const unread = getUnreadPhoneCount();
    fab.innerHTML = `📱${unread > 0 ? `<span class="ifruit-unread-badge">${unread}</span>` : ''}`;
  };

  // 3. +1 Yaş İlerlediğinde Telefona Yeni Canlı WhatsChat Mesajı Düşsün
  const _prevAdvanceAge = advanceAge;
  advanceAge = function () {
    ensureGameThemeV3State();
    _prevAdvanceAge();
    if (G && G.age >= 16 && !G.inPrison) {
      generateNewPhoneChatMsg();
    }
    renderAll();
  };

  // 4. Ana Menüye "⚙️ Oyun & Şehir Haritası Ayarları" Şalterini Ekle
  const _prevOpenNav = openNavSheet;
  openNavSheet = function (tab) {
    ensureGameThemeV3State();
    _prevOpenNav(tab);
    if (tab === 'menu') {
      const body = document.getElementById('sheetBody');
      if (body && !document.getElementById('menuMapSettingsBar')) {
        body.insertAdjacentHTML('afterbegin', `
          <div id="menuMapSettingsBar" class="p-3 rounded-2xl bg-slate-900 border border-sky-500/40 flex items-center justify-between gap-2 mb-3">
            <div>
              <div class="text-xs font-extrabold text-white">🗺️ İnteraktif Şehir Haritası &amp; RPG Sahnesi</div>
              <div class="text-[10px] text-slate-400">Ana ekrandaki binalara tıklanan haritayı istediğin an açıp kapatabilirsin.</div>
            </div>
            <button onclick="toggleCityMapPreference(); openNavSheet('menu');" class="px-3 py-2 rounded-xl text-[10px] font-extrabold shrink-0 ${G.uiPrefs.showCityMap ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}">
              ${G.uiPrefs.showCityMap ? 'Harita: AÇIK ✓' : 'Harita: KAPALI'}
            </button>
          </div>
        `);
      }
    }
  };

  if (typeof G !== 'undefined' && G) {
    renderAll();
  }
})();

/* ============================================================================
   AKILLI OLAY YÖNETMENİ, FUTBOL DENGELEYİCİ VE ZİNCİRLEME HİKAYE MOTORU
   ============================================================================ */

let _isInsideAdvanceAgeTurn = false;
let _realLifeEventFiredThisTurn = false;

function ensureLifeEventsDirectorState() {
  if (!G) return;
  if (!G.lifeEvents) {
    G.lifeEvents = {
      seenIds: [],          // Tekrarı önlemek için görülen olay ID'leri
      pendingChains: [],    // [{ chainId, triggerAge }] -> 1-2 yıl sonra açılacak zincirleme olaylar
      lastFootballAge: 0
    };
  }
  // İstenmeyen eski harita veya refleks kalıntıları varsa kapat
  if (G.uiPrefs) G.uiPrefs.showCityMap = false;
}

function isFootballRelatedModal(cfg) {
  if (!cfg) return false;
  const combined = `${cfg.badge || ''} ${cfg.title || ''} ${cfg.desc || ''}`.toLowerCase();
  return /futbol|maç|gol|asist|stadyum|tff|transfer|kulüp|derbi|penaltı|frikik|lig|kupa|antrenman|scout/.test(combined);
}

// Karakterin Yaşına, Mesleğine, Aracına ve Evliliğine Göre En Uygun Olayı Seçer
function pickContextualRealLifeEvent() {
  ensureLifeEventsDirectorState();
  const le = G.lifeEvents;

  // 1. ÖNCELİK: Vakti Gelmiş Zincirleme (2. Perde) Hikaye Var mı?
  const dueChainIdx = le.pendingChains.findIndex(item => G.age >= item.triggerAge);
  if (dueChainIdx !== -1) {
    const dueItem = le.pendingChains.splice(dueChainIdx, 1)[0];
    const followUp = CHAINED_EVENTS_FOLLOWUPS_DB[dueItem.chainId];
    if (followUp) return { ...followUp, id: dueItem.chainId, isFollowUp: true };
  }

  // 2. ÖNCELİK: Karakterin Durumuna Göre Havuz Oluşturma
  let pool = [];

  // A) Zincirleme hikaye başlangıçları (18+ yaş)
  if (G.age >= 18) {
    pool.push(...CHAINED_EVENTS_STARTERS_DB);
  }

  // B) İşyeri / Ofis / Ticaret olayları (Çalışıyorsa, memursa veya şirketi varsa yüksek ağırlık)
  if (G.jobId || (G.career && G.career.isCivilServant) || (G.businesses && G.businesses.length > 0) || G.age >= 20) {
    pool.push(...WORKPLACE_LIFE_EVENTS_DB);
    if (G.jobId) pool.push(...WORKPLACE_LIFE_EVENTS_DB); // Çalışanlar için işyeri olasılığını artır
  }

  // C) Aile, Akraba, Ev Sahibi ve Komşu olayları
  pool.push(...FAMILY_NEIGHBOR_EVENTS_DB);

  // D) Trafik, Araç, Sanayi ve Yolculuk olayları (Aracı veya ehliyeti varsa yüksek ağırlık)
  pool.push(...TRAFFIC_SANAYI_EVENTS_DB);
  if ((G.cars && G.cars.length > 0) || (G.licenses && G.licenses.B)) {
    pool.push(...TRAFFIC_SANAYI_EVENTS_DB);
  }

  // E) Sosyal Hayat, Fırsatlar ve Dolandırıcılık krizleri
  pool.push(...SOCIAL_SCAM_EVENTS_DB);

  // Daha önce görülmeyen olayları filtrele (Havuz biterse sıfırla)
  let unseen = pool.filter(ev => !le.seenIds.includes(ev.id));
  if (unseen.length === 0) {
    le.seenIds = [];
    unseen = pool;
  }

  const chosen = pickRandom(unseen);
  if (chosen && chosen.id && !le.seenIds.includes(chosen.id)) {
    le.seenIds.push(chosen.id);
  }
  return chosen;
}

// Seçilen Gerçek Hayat Olayını RPG Diyalog / Olay Penceresi Olarak Açar
function launchRealLifeEventModal(evTemplate, rawOpenModalFn) {
  if (!evTemplate || !G) return;
  ensureLifeEventsDirectorState();
  const c = getCountry();
  const npcObj = REAL_LIFE_NPCS_DB[evTemplate.npcKey] || REAL_LIFE_NPCS_DB.boss;

  const builtChoices = (evTemplate.choices || []).map(ch => {
    const netCost = Math.round(c.monthlyMinWage * (ch.costMult || 0));
    const netReward = Math.round(c.monthlyMinWage * (ch.rewardMult || 0));

    let costSuffix = '';
    if (netReward > netCost) costSuffix = ` (+${fmtMoney(netReward - netCost)})`;
    else if (netCost > 0) costSuffix = ` (-${fmtMoney(netCost)})`;
    else if (netCost < 0) costSuffix = ` (+${fmtMoney(Math.abs(netCost))})`;

    return {
      label: ch.label + costSuffix,
      action: () => {
        if (netCost > 0) {
          G.money = Math.max(0, G.money - netCost);
        } else if (netCost < 0) {
          G.money += Math.abs(netCost);
        }
        if (netReward > 0) {
          G.money += netReward;
        }
        if (ch.happyDelta) G.happy = clamp(G.happy + ch.happyDelta);
        if (ch.stressDelta) G.stress = clamp((G.stress || 20) + ch.stressDelta, 0, 100);
        if (ch.fameDelta) G.fame = clamp(G.fame + ch.fameDelta);
        if (ch.perfBoost && G.career) {
          G.career.perfScore = clamp((G.career.perfScore || 55) + ch.perfBoost, 0, 100);
        }

        // Eğer bu karar 1-2 yıl sonra devam edecek bir Zincirleme Hikaye başlatıyorsa kaydet!
        if (ch.scheduleChain && ch.scheduleChain.chainId) {
          G.lifeEvents.pendingChains.push({
            chainId: ch.scheduleChain.chainId,
            triggerAge: G.age + (ch.scheduleChain.delayYears || 1)
          });
        }

        if (netReward > netCost || netCost < 0) playSfx('trophy');
        else playSfx('coin');

        if (ch.logText) {
          addLog(G.age, ch.logText, (netReward > 0 || netCost < 0) ? 'good' : 'normal');
        }
        saveGame();
        renderAll();
      }
    };
  });

  rawOpenModalFn({
    npc: npcObj,
    badge: evTemplate.badge,
    title: evTemplate.title,
    desc: evTemplate.desc,
    choices: builtChoices
  });
}

/* ============================================================================
   ANA KANCALAR: FUTBOL SIKLIĞINI %15'E İNDİR VE HER +1 YAŞTA YENİ OLAY ÜRET
   ============================================================================ */

(function attachSmartLifeEventsAndFootballBalance() {
  if (window._smartLifeEventsLoaded) return;
  window._smartLifeEventsLoaded = true;

  // İstenmeyen eski harita ve refleks pencerelerini temiz tut
  document.querySelectorAll('#cityMapRootContainer, #menuMapSettingsBar, #reflexChallengeModal').forEach(el => el.remove());

  const _rawOpenEventModal = window.openEventModal;

  // 1. openEventModal Kancası: +1 Yaş Sırasında Çıkan Futbol Olaylarını %85 Oranında Gerçek Hayat Olayıyla Değiştir!
  window.openEventModal = function (cfg) {
    ensureLifeEventsDirectorState();

    if (_isInsideAdvanceAgeTurn && isFootballRelatedModal(cfg)) {
      const yearsSinceLastFb = G.age - (G.lifeEvents.lastFootballAge || 0);
      // Üst üste yıllarda futbol çıkmasını engelle ve genel şansı %15 ile sınırla
      if (yearsSinceLastFb < 2 || Math.random() > 0.15) {
        _realLifeEventFiredThisTurn = true;
        const lifeEv = pickContextualRealLifeEvent();
        launchRealLifeEventModal(lifeEv, _rawOpenEventModal);
        return;
      } else {
        G.lifeEvents.lastFootballAge = G.age;
        _realLifeEventFiredThisTurn = true;
      }
    } else if (_isInsideAdvanceAgeTurn) {
      // Eğer temel oyundan jenerik bir olay geldiyse %65 ihtimalle bizim yeni detaylı 5'li paketten bir olay göster
      if (Math.random() < 0.65 && !_realLifeEventFiredThisTurn) {
        _realLifeEventFiredThisTurn = true;
        const lifeEv = pickContextualRealLifeEvent();
        launchRealLifeEventModal(lifeEv, _rawOpenEventModal);
        return;
      }
      _realLifeEventFiredThisTurn = true;
    }

    if (typeof _rawOpenEventModal === 'function') {
      _rawOpenEventModal(cfg);
    }
  };

  // 2. advanceAge (+1 Yaş) Kancası: Her Yaş İlerlemesinde Kesin Olarak Çeşitli Bir Olay Çıkmasını Garanti Et
  const _prevAdvanceAge = advanceAge;
  advanceAge = function () {
    ensureLifeEventsDirectorState();
    _isInsideAdvanceAgeTurn = true;
    _realLifeEventFiredThisTurn = false;

    _prevAdvanceAge();

    _isInsideAdvanceAgeTurn = false;

    // Eğer o yaşta hiçbir olay penceresi açılmadıysa (veya vadesi gelen zincirleme olay varsa) hemen yeni bir gerçek hayat olayı aç!
    if (G && G.age >= 16 && !G.inPrison && !_realLifeEventFiredThisTurn) {
      const lifeEv = pickContextualRealLifeEvent();
      if (lifeEv) {
        _realLifeEventFiredThisTurn = true;
        launchRealLifeEventModal(lifeEv, _rawOpenEventModal);
      }
    }
  };
})();

/* ============================================================================
   DİNAMİK SVG KARAKTER MOTORU VE BERBER / KUAFÖR / STİL STÜDYOSU (GAME.JS)
   ============================================================================ */

let barberActiveSubTab = 'hair'; // 'hair' | 'beard_brow' | 'face_eye' | 'outfit'

function ensureCharacterAvatarState() {
  if (!G) return;
  if (!G.charLook) {
    const isFemale = G.gender === 'Kadın';
    G.charLook = {
      skinId: 'skin_wheat',
      hairStyleId: isFemale ? 'long_wave' : 'fade_crop',
      hairColorId: 'hc_darkbrown',
      beardStyleId: isFemale ? 'beard_clean' : 'beard_stubble',
      browStyleId: 'brow_natural',
      eyeColorId: 'eye_hazel',
      outfitId: 'out_tshirt',
      glassesId: 'gl_none',
      yearsSinceHaircut: 0,
      hasSkinCareGlow: false
    };
  }
}

// Karakterin Kaşı, Gözü, Saçı, Sakalı, Yaşı ve Ruh Haline Göre Gerçekçi Katmanlı SVG Üretir
function generateDynamicCharacterSVG(rawSvgOnly = false) {
  ensureCharacterAvatarState();
  const lk = G.charLook;

  const skin = CHAR_SKIN_TONES_DB.find(x => x.id === lk.skinId) || CHAR_SKIN_TONES_DB[1];
  let hairColor = CHAR_HAIR_COLORS_DB.find(x => x.id === lk.hairColorId) || CHAR_HAIR_COLORS_DB[1];
  const eyeColor = CHAR_EYE_COLORS_DB.find(x => x.id === lk.eyeColorId) || CHAR_EYE_COLORS_DB[1];
  const outfit = CHAR_OUTFITS_DB.find(x => x.id === lk.outfitId) || CHAR_OUTFITS_DB[0];

  // 48 yaş üstünde saç boyatılmadıysa doğal kırlaşma efekti
  if (G.age >= 48 && lk.yearsSinceHaircut >= 2) {
    hairColor = { hex: '#64748b', highlight: '#cbd5e1' };
  }

  // Saç 3+ yıldır kesilmediyse kabarma / dağınıklık
  const isOvergrown = lk.yearsSinceHaircut >= 3;

  // 1. KIYAFET / GÖVDE KATMANI
  let outfitSvg = '';
  if (lk.outfitId === 'out_suit') {
    outfitSvg = `
      <path d="M25,220 C28,168 58,156 100,156 C142,156 172,168 175,220 Z" fill="#0f172a"/>
      <polygon points="84,156 100,198 116,156" fill="#f8fafc"/>
      <polygon points="97,164 103,164 105,198 95,198" fill="${outfit.accent}"/>
      <path d="M72,156 L94,198 L82,220 L55,220 Z" fill="#1e293b"/>
      <path d="M128,156 L106,198 L118,220 L145,220 Z" fill="#1e293b"/>
    `;
  } else if (lk.outfitId === 'out_jersey') {
    outfitSvg = `
      <path d="M25,220 C28,168 58,156 100,156 C142,156 172,168 175,220 Z" fill="#172554"/>
      <rect x="52" y="158" width="16" height="62" fill="#facc15"/>
      <rect x="92" y="158" width="16" height="62" fill="#facc15"/>
      <rect x="132" y="158" width="16" height="62" fill="#facc15"/>
      <path d="M78,156 Q100,174 122,156" fill="none" stroke="#facc15" stroke-width="4"/>
    `;
  } else if (lk.outfitId === 'out_shirt') {
    outfitSvg = `
      <path d="M25,220 C28,168 58,156 100,156 C142,156 172,168 175,220 Z" fill="#e2e8f0"/>
      <polygon points="78,155 100,182 88,190 70,165" fill="#cbd5e1"/>
      <polygon points="122,155 100,182 112,190 130,165" fill="#cbd5e1"/>
    `;
  } else {
    outfitSvg = `
      <path d="M25,220 C28,168 58,156 100,156 C142,156 172,168 175,220 Z" fill="${outfit.primary}"/>
      <path d="M76,156 Q100,175 124,156" fill="none" stroke="${outfit.accent}" stroke-width="3.5"/>
    `;
  }

  // 2. KAŞ KATMANI
  const browStroke = lk.browStyleId === 'brow_thick' ? 5.2 : (lk.browStyleId === 'brow_thin' ? 2.4 : 3.8);
  let browSvg = `
    <path d="M62,81 Q76,75 89,80" fill="none" stroke="${hairColor.hex}" stroke-width="${browStroke}" stroke-linecap="round"/>
    <path d="M111,80 Q124,75 138,81" fill="none" stroke="${hairColor.hex}" stroke-width="${browStroke}" stroke-linecap="round"/>
  `;
  if (lk.browStyleId === 'brow_slit') {
    browSvg += `<line x1="131" y1="74" x2="128" y2="85" stroke="${skin.base}" stroke-width="2.6"/>`;
  }

  // 3. YÜZ İFADESİ (AĞIZ & DUDAK)
  const isHappy = (G.happy || 60) >= 55;
  const mouthSvg = isHappy
    ? `<path d="M86,129 Q100,139 114,129" fill="none" stroke="#8c3b32" stroke-width="3.2" stroke-linecap="round"/>
       <path d="M90,130 Q100,136 110,130 Z" fill="#ffffff" opacity="0.85"/>`
    : `<path d="M88,133 Q100,129 112,133" fill="none" stroke="#8c3b32" stroke-width="3" stroke-linecap="round"/>`;

  // 4. SAKAL VE BIYIK KATMANI
  let beardSvg = '';
  if (G.gender !== 'Kadın') {
    if (lk.beardStyleId === 'beard_stubble' || isOvergrown) {
      beardSvg = `
        <path d="M56,108 C56,138 76,153 100,153 C124,153 144,138 144,108 C140,126 124,142 100,142 C76,142 60,126 56,108 Z" fill="${hairColor.hex}" opacity="0.32"/>
        <path d="M82,124 Q100,119 118,124" fill="none" stroke="${hairColor.hex}" stroke-width="3.5" opacity="0.4" stroke-linecap="round"/>
      `;
    } else if (lk.beardStyleId === 'beard_full') {
      beardSvg = `
        <path d="M54,104 C54,142 74,158 100,158 C126,158 146,142 146,104 C140,118 130,134 116,135 L116,125 Q100,118 84,125 L84,135 C70,134 60,118 54,104 Z" fill="${hairColor.hex}"/>
        <path d="M81,123 Q100,117 119,123" fill="none" stroke="${hairColor.hex}" stroke-width="5" stroke-linecap="round"/>
      `;
    } else if (lk.beardStyleId === 'beard_goatee') {
      beardSvg = `
        <path d="M82,123 Q100,118 118,123" fill="none" stroke="${hairColor.hex}" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M84,136 Q100,158 116,136 Q108,148 100,148 Q92,148 84,136 Z" fill="${hairColor.hex}"/>
      `;
    } else if (lk.beardStyleId === 'beard_mustache') {
      beardSvg = `
        <path d="M78,124 Q90,116 100,121 Q110,116 122,124 Q110,127 100,123 Q90,127 78,124 Z" fill="${hairColor.hex}"/>
      `;
    }
  }

  // 5. SAÇ MODELİ KATMANI
  let hairBackSvg = '';
  let hairTopSvg = '';
  const hs = lk.hairStyleId;

  if (hs === 'fade_crop') {
    hairTopSvg = `
      <path d="M52,78 C50,42 72,28 100,28 C128,28 150,42 148,78 C142,60 124,52 100,52 C76,52 58,60 52,78 Z" fill="url(#hairGrad)"/>
      <path d="M62,48 Q82,38 106,46 Q124,40 136,52" fill="none" stroke="${hairColor.highlight}" stroke-width="2.5" opacity="0.6" stroke-linecap="round"/>
    `;
  } else if (hs === 'pompadour') {
    hairTopSvg = `
      <path d="M52,80 C46,36 68,16 104,18 C138,20 154,40 148,80 C140,56 120,46 96,48 C74,50 60,60 52,80 Z" fill="url(#hairGrad)"/>
      <path d="M66,34 Q100,22 132,36" fill="none" stroke="${hairColor.highlight}" stroke-width="3" opacity="0.7" stroke-linecap="round"/>
    `;
  } else if (hs === 'ceo_slick') {
    hairTopSvg = `
      <path d="M50,84 C46,44 68,26 100,26 C132,26 154,44 150,84 C144,62 128,48 100,48 C72,48 56,62 50,84 Z" fill="url(#hairGrad)"/>
      <line x1="72" y1="36" x2="82" y2="50" stroke="${skin.base}" stroke-width="1.8" opacity="0.7"/>
    `;
  } else if (hs === 'curly_perm') {
    hairTopSvg = `
      <path d="M46,82 C40,42 66,22 100,22 C134,22 160,42 154,82 C140,62 120,56 100,56 C80,56 60,62 46,82 Z" fill="url(#hairGrad)"/>
      <circle cx="66" cy="48" r="14" fill="${hairColor.hex}"/>
      <circle cx="88" cy="42" r="15" fill="${hairColor.hex}"/>
      <circle cx="112" cy="42" r="15" fill="${hairColor.hex}"/>
      <circle cx="134" cy="48" r="14" fill="${hairColor.hex}"/>
      <circle cx="76" cy="54" r="10" fill="${hairColor.highlight}" opacity="0.35"/>
      <circle cx="122" cy="54" r="10" fill="${hairColor.highlight}" opacity="0.35"/>
    `;
  } else if (hs === 'long_wave') {
    hairBackSvg = `
      <path d="M42,75 C34,115 36,155 48,175 L152,175 C164,155 166,115 158,75 Z" fill="${hairColor.hex}"/>
    `;
    hairTopSvg = `
      <path d="M46,86 C44,38 70,24 100,24 C130,24 156,38 154,86 C142,58 122,48 100,48 C78,48 58,58 46,86 Z" fill="url(#hairGrad)"/>
    `;
  } else if (hs === 'buzz_cut') {
    hairTopSvg = `
      <path d="M54,78 C54,46 74,34 100,34 C126,34 146,46 146,78 C138,60 122,52 100,52 C78,52 62,60 54,78 Z" fill="${hairColor.hex}" opacity="0.82"/>
    `;
  }

  // Eğer berber zamanı geçtiyse yanlardan çıkan dağınık saç telleri
  if (isOvergrown && hs !== 'bald_clean') {
    hairTopSvg += `
      <path d="M48,74 L38,68 L46,84 M152,74 L162,68 L154,84" fill="none" stroke="${hairColor.hex}" stroke-width="3" stroke-linecap="round"/>
    `;
  }

  // 6. GÖZLÜK KATMANI
  let glassesSvg = '';
  if (lk.glassesId === 'gl_optic') {
    glassesSvg = `
      <rect x="60" y="84" width="32" height="21" rx="6" fill="rgba(56,189,248,0.12)" stroke="#0f172a" stroke-width="3.2"/>
      <rect x="108" y="84" width="32" height="21" rx="6" fill="rgba(56,189,248,0.12)" stroke="#0f172a" stroke-width="3.2"/>
      <line x1="92" y1="93" x2="108" y2="93" stroke="#0f172a" stroke-width="3"/>
    `;
  } else if (lk.glassesId === 'gl_sun') {
    glassesSvg = `
      <rect x="58" y="83" width="35" height="23" rx="8" fill="#090d16" stroke="#eab308" stroke-width="2.5"/>
      <rect x="107" y="83" width="35" height="23" rx="8" fill="#090d16" stroke="#eab308" stroke-width="2.5"/>
      <line x1="93" y1="91" x2="107" y2="91" stroke="#eab308" stroke-width="2.5"/>
      <line x1="64" y1="87" x2="76" y2="101" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
      <line x1="113" y1="87" x2="125" y2="101" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
    `;
  }

  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
    <defs>
      <radialGradient id="bgGlow" cx="50%" cy="40%" r="65%">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#090d16"/>
      </radialGradient>
      <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${skin.base}"/>
        <stop offset="100%" stop-color="${skin.shadow}"/>
      </linearGradient>
      <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${hairColor.highlight}"/>
        <stop offset="100%" stop-color="${hairColor.hex}"/>
      </linearGradient>
    </defs>

    <!-- Stüdyo Arka Planı -->
    <rect width="200" height="220" fill="url(#bgGlow)"/>
    <circle cx="100" cy="88" r="76" fill="${outfit.accent}" opacity="0.08"/>

    ${hairBackSvg}

    <!-- Boyun ve Gölgelendirme -->
    <rect x="81" y="132" width="38" height="36" rx="10" fill="${skin.shadow}"/>

    <!-- Kıyafet -->
    ${outfitSvg}

    <!-- Kulaklar -->
    <ellipse cx="50" cy="100" rx="8" ry="13" fill="${skin.shadow}"/>
    <ellipse cx="150" cy="100" rx="8" ry="13" fill="${skin.shadow}"/>

    <!-- Yüz ve Çene Hattı -->
    <path d="M52,76 C52,44 72,34 100,34 C128,34 148,44 148,76 C148,116 130,152 100,152 C70,152 52,116 52,76 Z" fill="url(#skinGrad)"/>

    <!-- Gözler (Sklera, İris, Gözbebeği ve Canlı Işık Yansıması) -->
    <ellipse cx="76" cy="94" rx="11" ry="7" fill="#ffffff"/>
    <circle cx="76" cy="94" r="5.5" fill="${eyeColor.hex}"/>
    <circle cx="76" cy="94" r="2.6" fill="#090d16"/>
    <circle cx="78" cy="92" r="1.6" fill="#ffffff"/>

    <ellipse cx="124" cy="94" rx="11" ry="7" fill="#ffffff"/>
    <circle cx="124" cy="94" r="5.5" fill="${eyeColor.hex}"/>
    <circle cx="124" cy="94" r="2.6" fill="#090d16"/>
    <circle cx="126" cy="92" r="1.6" fill="#ffffff"/>

    <!-- Kaşlar -->
    ${browSvg}

    <!-- Burun -->
    <path d="M100,90 L97,112 Q100,115 105,112" fill="none" stroke="${skin.shadow}" stroke-width="2.6" stroke-linecap="round"/>

    <!-- Sakal / Bıyık -->
    ${beardSvg}

    <!-- Ağız / İfade -->
    ${mouthSvg}

    <!-- Gözlük -->
    ${glassesSvg}

    <!-- Saç Üst Katmanı -->
    ${hairTopSvg}
  </svg>`;

  if (rawSvgOnly) return svgMarkup;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgMarkup);
}

/* ============================================================================
   💈 BERBER, KUAFÖR & STİL STÜDYOSU EKRANI VE İŞLEMLERİ
   ============================================================================ */

window.openBarberAndSalonModal = function () {
  ensureCharacterAvatarState();
  const sheet = document.getElementById('bottomSheet');
  sheet.classList.remove('hidden');
  document.getElementById('sheetTitle').textContent = '💈 Berber, Kuaför & Stil Stüdyosu';
  document.getElementById('sheetSubtitle').textContent = `Görünüm: %${G.looks} • Son Bakım: ${G.charLook.yearsSinceHaircut} Yıl Önce`;
  document.getElementById('sheetBody').innerHTML = renderBarberAndSalonHTML();
};

function renderBarberAndSalonHTML() {
  ensureCharacterAvatarState();
  const c = getCountry();
  const lk = G.charLook;
  const skinCareCost = Math.round(c.monthlyMinWage * 0.14);

  const nav4 = `
    <div class="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-3 text-[10px] font-extrabold">
      <button onclick="barberActiveSubTab='hair'; openBarberAndSalonModal()" class="py-2 rounded-xl ${barberActiveSubTab === 'hair' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400'}">✂️ Saç &amp; Boya</button>
      <button onclick="barberActiveSubTab='beard_brow'; openBarberAndSalonModal()" class="py-2 rounded-xl ${barberActiveSubTab === 'beard_brow' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400'}">🪒 Sakal &amp; Kaş</button>
      <button onclick="barberActiveSubTab='face_eye'; openBarberAndSalonModal()" class="py-2 rounded-xl ${barberActiveSubTab === 'face_eye' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'}">👁️ Göz &amp; Cilt</button>
      <button onclick="barberActiveSubTab='outfit'; openBarberAndSalonModal()" class="py-2 rounded-xl ${barberActiveSubTab === 'outfit' ? 'bg-purple-500 text-white shadow' : 'text-slate-400'}">👔 Kombin</button>
    </div>
  `;

  // Canlı Ayna Sahnesi (Üstte Karakterin Büyük Önizlemesi)
  const mirrorBox = `
    <div class="barber-mirror-stage mb-3">
      <div class="barber-preview-frame">
        ${generateDynamicCharacterSVG(true)}
      </div>
      <div class="space-y-1.5 flex-1 min-w-0">
        <div class="text-[10px] font-extrabold text-sky-400 uppercase tracking-wider">🪞 CANLI KUAFÖR AYNASI</div>
        <div class="text-sm font-black text-white truncate">${G.firstName} ${G.lastName} (${G.age} Yaş)</div>
        <div class="text-[11px] text-slate-300">
          Karizma / Görünüm: <strong class="text-emerald-400 font-mono-num">%${G.looks}</strong>
          ${lk.yearsSinceHaircut >= 3 ? `<span class="block text-[10px] text-amber-400 font-bold">⚠️ Saç/Sakal uzadı, tıraş zamanı geldi!</span>` : `<span class="block text-[10px] text-emerald-400">✨ Saç ve sakal bakımlı görünüyor</span>`}
        </div>
        <button onclick="doFullVipGroomingPackage(${skinCareCost})" class="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950 text-[10px] font-black shadow">
          🧖‍♂️ Buharlı Cilt Bakımı &amp; Yıkama (${fmtMoney(skinCareCost)})
        </button>
      </div>
    </div>
  `;

  let tabContent = '';

  // SEKME 1: SAÇ KESİMİ VE SAÇ BOYAMA
  if (barberActiveSubTab === 'hair') {
    const dyeCost = Math.round(c.monthlyMinWage * 0.10);
    tabContent = `
      <div class="space-y-3">
        <div>
          <div class="text-xs font-extrabold text-white mb-1.5">✂️ Saç Kesimi &amp; Model Seçimi</div>
          <div class="grid grid-cols-1 gap-1.5">
            ${CHAR_HAIR_STYLES_DB.map(hs => {
              const cost = Math.round(c.monthlyMinWage * hs.costMult);
              const active = lk.hairStyleId === hs.id;
              return `
                <button onclick="applyBarberChange('hairStyleId', '${hs.id}', ${cost}, ${hs.looksBoost}, '${hs.name}')" class="style-option-btn ${active ? 'active' : ''} flex items-center justify-between">
                  <span>${hs.name} (+${hs.looksBoost} Görünüm)</span>
                  <span class="font-mono-num text-amber-300">${active ? 'Aktif Model ✓' : fmtMoney(cost)}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-white">🎨 Saç Boyama &amp; Ton Değişimi</span>
            <span class="text-[10px] font-mono-num text-amber-300">${fmtMoney(dyeCost)}</span>
          </div>
          <div class="flex flex-wrap gap-2.5 pt-1">
            ${CHAR_HAIR_COLORS_DB.map(hc => `
              <button onclick="applyBarberChange('hairColorId', '${hc.id}', ${dyeCost}, 4, '${hc.name} Saç Boyası')"
                title="${hc.name}"
                class="color-swatch-btn ${lk.hairColorId === hc.id ? 'active' : ''}"
                style="background:${hc.hex};"></button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // SEKME 2: SAKAL TIRAŞI VE KAŞ TASARIMI
  else if (barberActiveSubTab === 'beard_brow') {
    tabContent = `
      <div class="space-y-3">
        <div>
          <div class="text-xs font-extrabold text-white mb-1.5">🪒 Sakal &amp; Bıyık Tıraşı</div>
          <div class="grid grid-cols-1 gap-1.5">
            ${CHAR_BEARD_STYLES_DB.map(bs => {
              const cost = Math.round(c.monthlyMinWage * bs.costMult);
              const active = lk.beardStyleId === bs.id;
              return `
                <button onclick="applyBarberChange('beardStyleId', '${bs.id}', ${cost}, ${bs.looksBoost}, '${bs.name}')" class="style-option-btn ${active ? 'active' : ''} flex items-center justify-between">
                  <span>${bs.name} (+${bs.looksBoost} Görünüm)</span>
                  <span class="font-mono-num text-amber-300">${active ? 'Seçili ✓' : fmtMoney(cost)}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div>
          <div class="text-xs font-extrabold text-white mb-1.5">🤨 Kaş Tasarımı &amp; Ustura Çiziği</div>
          <div class="grid grid-cols-2 gap-1.5">
            ${CHAR_EYEBROW_STYLES_DB.map(br => {
              const cost = Math.round(c.monthlyMinWage * br.costMult);
              const active = lk.browStyleId === br.id;
              return `
                <button onclick="applyBarberChange('browStyleId', '${br.id}', ${cost}, 3, '${br.name}')" class="style-option-btn ${active ? 'active' : ''}">
                  <div>${br.name}</div>
                  <div class="text-[9.5px] text-amber-300 font-mono-num mt-0.5">${active ? 'Seçili ✓' : fmtMoney(cost)}</div>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // SEKME 3: GÖZ RENGİ (LENS) VE TEN TONU / BRONZLAŞMA
  else if (barberActiveSubTab === 'face_eye') {
    const lensCost = Math.round(c.monthlyMinWage * 0.08);
    tabContent = `
      <div class="space-y-3">
        <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-xs font-extrabold text-white">👁️ Göz Rengi / Numarasız Renkli Lens</span>
            <span class="text-[10px] text-emerald-400 font-mono-num">${fmtMoney(lensCost)}</span>
          </div>
          <div class="grid grid-cols-2 gap-1.5">
            ${CHAR_EYE_COLORS_DB.map(ec => `
              <button onclick="applyBarberChange('eyeColorId', '${ec.id}', ${lensCost}, 3, '${ec.name}')" class="style-option-btn ${lk.eyeColorId === ec.id ? 'active' : ''} flex items-center gap-2">
                <span class="w-4 h-4 rounded-full inline-block border border-white/40" style="background:${ec.hex}"></span>
                <span>${ec.name}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div class="text-xs font-extrabold text-white">☀️ Ten Tonu &amp; Solaryum / Bronzluk</div>
          <div class="grid grid-cols-2 gap-1.5">
            ${CHAR_SKIN_TONES_DB.map(sk => `
              <button onclick="applyBarberChange('skinId', '${sk.id}', 0, 2, '${sk.name}')" class="style-option-btn ${lk.skinId === sk.id ? 'active' : ''} flex items-center gap-2">
                <span class="w-4 h-4 rounded-full inline-block border border-white/40" style="background:${sk.base}"></span>
                <span>${sk.name}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // SEKME 4: KIYAFET KOMBİNİ VE GÖZLÜK VİTRİNİ
  else if (barberActiveSubTab === 'outfit') {
    tabContent = `
      <div class="space-y-3">
        <div>
          <div class="text-xs font-extrabold text-white mb-1.5">👔 Üst Giyim &amp; Stil Kombini</div>
          <div class="space-y-1.5">
            ${CHAR_OUTFITS_DB.map(ot => {
              const cost = Math.round(c.monthlyMinWage * ot.costMult);
              const active = lk.outfitId === ot.id;
              return `
                <button onclick="applyBarberChange('outfitId', '${ot.id}', ${cost}, 6, '${ot.name}')" class="style-option-btn ${active ? 'active' : ''} flex items-center justify-between w-full">
                  <span>${ot.name}</span>
                  <span class="font-mono-num text-amber-300">${active ? 'Üzerinde ✓' : fmtMoney(cost)}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div>
          <div class="text-xs font-extrabold text-white mb-1.5">🕶️ Gözlük &amp; Aksesuar</div>
          <div class="grid grid-cols-1 gap-1.5">
            ${CHAR_GLASSES_DB.map(gl => `
              <button onclick="applyBarberChange('glassesId', '${gl.id}', 0, 2, '${gl.name}')" class="style-option-btn ${lk.glassesId === gl.id ? 'active' : ''}">
                ${gl.name}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  return mirrorBox + nav4 + tabContent;
}

window.applyBarberChange = function (propKey, valId, cost, looksBoost, labelName) {
  ensureCharacterAvatarState();
  const lk = G.charLook;

  if (lk[propKey] === valId) {
    lk.yearsSinceHaircut = 0;
    openBarberAndSalonModal();
    return;
  }

  if (cost > 0 && G.money < cost) {
    showToast(`Berber / Kuaför işlemi için nakit yetersiz! (${fmtMoney(cost)} gerekir)`);
    return;
  }

  if (cost > 0) G.money -= cost;
  lk[propKey] = valId;
  lk.yearsSinceHaircut = 0;
  G.looks = clamp((G.looks || 60) + (looksBoost || 3), 0, 100);
  G.happy = clamp((G.happy || 60) + 4, 0, 100);

  playSfx('coin');
  addLog(G.age, `💈 **BERBER & KUAFÖR:** **${labelName}** yaptırdın! Yeni imajınla görünümün **%${G.looks}** seviyesine yükseldi.`, 'good');
  saveGame();
  renderAll();
  openBarberAndSalonModal();
};

window.doFullVipGroomingPackage = function (cost) {
  ensureCharacterAvatarState();
  if (G.money < cost) { showToast('VIP Cilt bakımı için bakiye yetersiz!'); return; }
  G.money -= cost;
  G.charLook.yearsSinceHaircut = 0;
  G.charLook.hasSkinCareGlow = true;
  G.looks = clamp(G.looks + 9);
  G.happy = clamp(G.happy + 8);
  G.stress = clamp((G.stress || 20) - 15, 0, 100);
  playSfx('trophy');
  addLog(G.age, `🧖‍♂️ **VIP BERBER & CİLT BAKIMI:** Saç-sakal kesimi, buharlı siyah maske ve yüz masajı yaptırdın! (+9 Görünüm, -15 Stres)`, 'good');
  saveGame();
  renderAll();
  openBarberAndSalonModal();
};

/* ============================================================================
   ANA ENTEGRASYON: ESKİ FOTOĞRAFI DEVRE DIŞI BIRAKIP KARAKTERİ YERLEŞTİR
   ============================================================================ */

(function attachDynamicCharacterAndBarberSystem() {
  if (window._dynamicCharAndBarberLoaded) return;
  window._dynamicCharAndBarberLoaded = true;

  // 1. Oyundaki getCurrentPortrait() Fonksiyonunu Dinamik SVG Karaktere Yönlendir!
  window.getCurrentPortrait = function () {
    return generateDynamicCharacterSVG(false);
  };

  // 2. RenderAll Kancası: Üstteki Portreyi Güncelle ve Tıklanınca Berber Açılmasını Sağla
  const _prevRenderAll = renderAll;
  renderAll = function () {
    ensureCharacterAvatarState();
    _prevRenderAll();

    const avatarImg = document.getElementById('charAvatar');
    if (avatarImg) {
      avatarImg.src = generateDynamicCharacterSVG(false);
      avatarImg.title = '💈 Berber, Kuaför & Stil Stüdyosunu Açmak İçin Tıkla!';
      avatarImg.onclick = function () {
        openBarberAndSalonModal();
      };
    }
  };

  // 3. +1 Yaş İlerlediğinde Saç/Sakalın Uzaması Mekanizması
  const _prevAdvanceAge = advanceAge;
  advanceAge = function () {
    ensureCharacterAvatarState();
    G.charLook.yearsSinceHaircut = (G.charLook.yearsSinceHaircut || 0) + 1;
    if (G.charLook.yearsSinceHaircut === 3 && G.age >= 16) {
      G.looks = clamp(G.looks - 3);
      addLog(G.age + 1, `✂️ **BAKIM ZAMANI:** Uzun süredir berbere/kuaföre gitmediğin için saç ve sakalın birbirine karıştı (-3 Görünüm). Karakterine tıklayarak tıraş olabilirsin!`, 'normal');
    }
    _prevAdvanceAge();
  };

  // 4. Ana Menüye ve iFruit Telefona "💈 Berber, Kuaför & Stil" Butonu Ekle
  const _prevOpenNav = openNavSheet;
  openNavSheet = function (tab) {
    ensureCharacterAvatarState();
    _prevOpenNav(tab);

    if (tab === 'menu') {
      const body = document.getElementById('sheetBody');
      if (body && !document.getElementById('menuBarberQuickBtn')) {
        const grid = body.querySelector('.grid.grid-cols-2');
        if (grid) {
          grid.insertAdjacentHTML('afterbegin', `
            <button id="menuBarberQuickBtn" onclick="openBarberAndSalonModal()" class="col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-sky-500/20 via-indigo-500/15 to-purple-500/20 border border-sky-400/50 text-left flex items-center justify-between mb-1">
              <div>
                <div class="text-xs font-extrabold text-sky-300 uppercase">💈 BERBER, KUAFÖR &amp; STİL STÜDYOSU</div>
                <div class="text-sm font-extrabold text-white">Saç Kesimi, Saç Boyama, Sakal, Kaş Çiziği &amp; Kombin</div>
              </div>
              <span class="px-3 py-1.5 rounded-xl bg-sky-400 text-slate-950 text-xs font-extrabold shrink-0">Aynaya Bak &rarr;</span>
            </button>
          `);
        }
      }
    }
  };

  if (typeof G !== 'undefined' && G) {
    renderAll();
  }
})();

/* ============================================================================
   VIP HD CASINO MOTORU: GATES OF OLYMPUS, SWEET BONANZA & LIVE BLACKJACK 21
   ============================================================================ */

const OLYMPUS_SYMBOLS_DB = [
  { id: 'zeus_scatter', icon: '⚡', name: 'Zeus Scatter', pay8: 3.0, pay10: 15.0, pay12: 50.0, weight: 4, isScatter: true },
  { id: 'crown', icon: '👑', name: 'Altın Kral Tacı', pay8: 5.0, pay10: 12.0, pay12: 25.0, weight: 7 },
  { id: 'hourglass', icon: '⏳', name: 'Zaman Kum Saati', pay8: 2.5, pay10: 6.0, pay12: 12.0, weight: 9 },
  { id: 'ring', icon: '💍', name: 'Yakut Yüzük', pay8: 2.0, pay10: 4.5, pay12: 9.0, weight: 10 },
  { id: 'chalice', icon: '🏆', name: 'Altın Kadeh', pay8: 1.5, pay10: 3.5, pay12: 7.0, weight: 11 },
  { id: 'gem_red', icon: '♦️', name: 'Kırmızı Elmas', pay8: 0.8, pay10: 1.8, pay12: 4.0, weight: 15 },
  { id: 'gem_purple', icon: '🔮', name: 'Mor Kristal', pay8: 0.6, pay10: 1.4, pay12: 3.0, weight: 16 },
  { id: 'gem_yellow', icon: '🌟', name: 'Sarı Mücevher', pay8: 0.5, pay10: 1.1, pay12: 2.5, weight: 17 },
  { id: 'gem_green', icon: '❇️', name: 'Yeşil Zümrüt', pay8: 0.4, pay10: 0.9, pay12: 2.0, weight: 18 },
  { id: 'gem_blue', icon: '💎', name: 'Mavi Safir', pay8: 0.3, pay10: 0.7, pay12: 1.5, weight: 19 }
];

const BONANZA_SYMBOLS_DB = [
  { id: 'lollipop', icon: '🍭', name: 'Lolipop Scatter', pay8: 3.0, pay10: 15.0, pay12: 50.0, weight: 4, isScatter: true },
  { id: 'heart_candy', icon: '❤️', name: 'Kırmızı Kalp Şeker', pay8: 5.0, pay10: 12.0, pay12: 25.0, weight: 7 },
  { id: 'purple_candy', icon: '🟪', name: 'Mor Kare Şeker', pay8: 2.5, pay10: 6.0, pay12: 12.0, weight: 9 },
  { id: 'green_candy', icon: '🟩', name: 'Yeşil Şeker', pay8: 2.0, pay10: 4.5, pay12: 9.0, weight: 10 },
  { id: 'blue_candy', icon: '🟦', name: 'Mavi Oval Şeker', pay8: 1.5, pay10: 3.2, pay12: 6.5, weight: 11 },
  { id: 'apple', icon: '🍎', name: 'Kırmızı Elma', pay8: 0.9, pay10: 1.8, pay12: 4.0, weight: 15 },
  { id: 'peach', icon: '🍑', name: 'Taze Şeftali', pay8: 0.7, pay10: 1.4, pay12: 3.0, weight: 16 },
  { id: 'watermelon', icon: '🍉', name: 'Dilim Karpuz', pay8: 0.5, pay10: 1.1, pay12: 2.5, weight: 17 },
  { id: 'grapes', icon: '🍇', name: 'Salkım Üzüm', pay8: 0.4, pay10: 0.9, pay12: 2.0, weight: 18 },
  { id: 'banana', icon: '🍌', name: 'Sarı Muz', pay8: 0.3, pay10: 0.7, pay12: 1.5, weight: 19 }
];

const MULTIPLIER_ORBS_POOL = [2, 3, 4, 5, 8, 10, 12, 15, 20, 25, 50, 100, 250, 500];

let casinoUI = {
  gameTab: 'olympus', // 'olympus' | 'bonanza' | 'blackjack'
  betMult: 0.10,      // Asgari ücrete oranlı bahis çarpanı
  doubleChance: false,
  freeSpinsLeft: 0,
  fsTotalMultiplier: 0,
  fsCumulativeWin: 0,
  grid: [],           // 30 hücrelik 6x5 dizi
  lastWinAmt: 0,
  lastWinLog: 'Spin tuşuna bas veya 100x Bonus Satın Al!',
  zeusStruck: false,
  // Blackjack Durumu
  bjDeck: [],
  bjPlayer: [],
  bjDealer: [],
  bjState: 'idle',    // 'idle' | 'playing' | 'resolved'
  bjResultText: 'Bahsini seç ve "Kartları Dağıt" butonuna bas!'
};

// Web Audio API ile Gerçekçi Slot & İskambil Ses Efektleri
function playCasinoAudio(type) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!window._casinoAudioCtx) window._casinoAudioCtx = new Ctx();
    const ctx = window._casinoAudioCtx;
    const now = ctx.currentTime;

    if (type === 'spin') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.14);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'zeus' || type === 'bigwin') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.16, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.008, now + idx * 0.08 + 0.25);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + idx * 0.08); osc.stop(now + idx * 0.08 + 0.25);
      });
    } else if (type === 'card') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.06);
    }
  } catch (e) {}
}

function getCurrentBetAmount() {
  const c = getCountry();
  const base = Math.max(100, Math.round(c.monthlyMinWage * casinoUI.betMult));
  return casinoUI.doubleChance ? Math.round(base * 1.25) : base;
}

function pickWeightedSlotSymbol(symDb, inFreeSpins) {
  // Çarpan Küresi (Zeus Orb) veya Şeker Bombası gelme ihtimali
  const multChance = inFreeSpins ? 0.085 : 0.032;
  if (Math.random() < multChance) {
    // Düşük çarpanlar daha sık, 100x-500x nadir gelir
    const r = Math.random();
    let mv = 2;
    if (r > 0.992) mv = 500;
    else if (r > 0.975) mv = 250;
    else if (r > 0.94) mv = 100;
    else if (r > 0.88) mv = 50;
    else if (r > 0.78) mv = 25;
    else if (r > 0.62) mv = 15;
    else if (r > 0.42) mv = 10;
    else if (r > 0.22) mv = 5;
    else mv = pickRandom([2, 3, 4]);

    return {
      id: 'mult_orb',
      icon: casinoUI.gameTab === 'olympus' ? '🟢' : '💣',
      name: `${mv}x Çarpan`,
      isMultiplier: true,
      multValue: mv
    };
  }

  let totalW = symDb.reduce((s, x) => s + x.weight + (x.isScatter && casinoUI.doubleChance ? 3 : 0), 0);
  let rnd = Math.random() * totalW;
  for (let s of symDb) {
    const w = s.weight + (s.isScatter && casinoUI.doubleChance ? 3 : 0);
    if (rnd < w) return { ...s };
    rnd -= w;
  }
  return { ...symDb[symDb.length - 1] };
}

function generateInitial6x5Grid() {
  const db = casinoUI.gameTab === 'olympus' ? OLYMPUS_SYMBOLS_DB : BONANZA_SYMBOLS_DB;
  const cells = [];
  for (let i = 0; i < 30; i++) {
    cells.push({ ...pickWeightedSlotSymbol(db, false), isWinning: false });
  }
  return cells;
}

/* ---------------- GATES OF OLYMPUS & SWEET BONANZA SPIN MOTORU ---------------- */

window.spinPragmaticSlot = function (isBonusBuy = false) {
  if (!G) return;
  const c = getCountry();
  const baseBet = Math.max(100, Math.round(c.monthlyMinWage * casinoUI.betMult));
  const actualBet = getCurrentBetAmount();

  // Bonus Satın Al (100x Bahis)
  if (isBonusBuy) {
    if (casinoUI.freeSpinsLeft > 0) {
      showToast('Zaten aktif Free Spin turundasın!');
      return;
    }
    const buyCost = baseBet * 100;
    if (G.money < buyCost) {
      showToast(`100x Bonus Satın Almak için ${fmtMoney(buyCost)} nakit gerekiyor!`);
      return;
    }
    G.money -= buyCost;
    casinoUI.freeSpinsLeft = casinoUI.gameTab === 'olympus' ? 15 : 10;
    casinoUI.fsTotalMultiplier = 0;
    casinoUI.fsCumulativeWin = 0;
    playCasinoAudio('zeus');
    addLog(G.age, `⚡ **BONUS SATIN ALINDI (${casinoUI.gameTab === 'olympus' ? 'Gates of Olympus' : 'Sweet Bonanza'}):** **${fmtMoney(buyCost)}** ödeyerek doğrudan Free Spin turuna girdin!`, 'normal');
  } else if (casinoUI.freeSpinsLeft <= 0) {
    if (G.money < actualBet) {
      showToast('Bahis için nakit bakiyen yetersiz!');
      return;
    }
    G.money -= actualBet;
  }

  const inFs = casinoUI.freeSpinsLeft > 0;
  if (inFs && !isBonusBuy) {
    casinoUI.freeSpinsLeft -= 1;
  }

  playCasinoAudio('spin');
  const db = casinoUI.gameTab === 'olympus' ? OLYMPUS_SYMBOLS_DB : BONANZA_SYMBOLS_DB;
  const newGrid = [];
  const counts = {};
  let scatterCount = 0;
  let screenMultipliersSum = 0;

  for (let i = 0; i < 30; i++) {
    const sym = pickWeightedSlotSymbol(db, inFs);
    if (isBonusBuy && i < 4) {
      // Bonus satın alındığında ekrana 4 Scatter düşür
      const sc = db[0];
      newGrid.push({ ...sc, isWinning: true });
      scatterCount++;
    } else {
      newGrid.push({ ...sym, isWinning: false });
      if (sym.isScatter) scatterCount++;
      else if (sym.isMultiplier) screenMultipliersSum += sym.multValue;
      else counts[sym.id] = (counts[sym.id] || 0) + 1;
    }
  }

  // Pay Anywhere Hesaplaması (Ekranda herhangi bir yerde 8+ aynı sembol!)
  let baseRawWin = 0;
  const matchedNames = [];

  Object.keys(counts).forEach(symId => {
    const cnt = counts[symId];
    if (cnt >= 8) {
      const sInfo = db.find(x => x.id === symId);
      if (sInfo) {
        let multPay = sInfo.pay8;
        if (cnt >= 12) multPay = sInfo.pay12;
        else if (cnt >= 10) multPay = sInfo.pay10;

        baseRawWin += Math.round(baseBet * multPay);
        matchedNames.push(`${cnt}x ${sInfo.icon}`);
        newGrid.forEach(cell => {
          if (cell.id === symId) cell.isWinning = true;
        });
      }
    }
  });

  // 4+ Scatter Gelirse Free Spin Tetiklemesi
  if (!isBonusBuy && scatterCount >= 4) {
    const addedFs = inFs ? 5 : (casinoUI.gameTab === 'olympus' ? 15 : 10);
    casinoUI.freeSpinsLeft += addedFs;
    baseRawWin += baseBet * 3;
    matchedNames.push(`${scatterCount}x SCATTER (+${addedFs} FS!)`);
    newGrid.forEach(cell => { if (cell.isScatter) cell.isWinning = true; });
    playCasinoAudio('zeus');
  }

  // Çarpan Hesaplaması (Gates of Olympus Toplanan Çarpan & Sweet Bonanza Bomba Çarpanı)
  let totalWin = baseRawWin;
  casinoUI.zeusStruck = false;

  if (baseRawWin > 0 && screenMultipliersSum > 0) {
    casinoUI.zeusStruck = true;
    playCasinoAudio('zeus');
    if (casinoUI.gameTab === 'olympus' && inFs) {
      casinoUI.fsTotalMultiplier += screenMultipliersSum;
      totalWin = Math.round(baseRawWin * casinoUI.fsTotalMultiplier);
    } else {
      totalWin = Math.round(baseRawWin * screenMultipliersSum);
    }
  } else if (baseRawWin > 0 && casinoUI.gameTab === 'olympus' && inFs && casinoUI.fsTotalMultiplier > 0 && screenMultipliersSum > 0) {
    totalWin = Math.round(baseRawWin * casinoUI.fsTotalMultiplier);
  }

  casinoUI.grid = newGrid;
  casinoUI.lastWinAmt = totalWin;

  if (totalWin > 0) {
    G.money += totalWin;
    if (inFs) casinoUI.fsCumulativeWin += totalWin;

    const multText = screenMultipliersSum > 0 ? ` ⚡ ÇARPAN: ${inFs && casinoUI.gameTab === 'olympus' ? casinoUI.fsTotalMultiplier : screenMultipliersSum}x!` : '';
    casinoUI.lastWinLog = `🎉 KAZANÇ: +${fmtMoney(totalWin)} (${matchedNames.join(', ')})${multText}`;

    if (totalWin >= baseBet * 15) {
      playCasinoAudio('bigwin');
      G.happy = clamp((G.happy || 60) + 10);
      addLog(G.age, `🎰 **SENSATIONAL MEGA WIN!** ${casinoUI.gameTab === 'olympus' ? 'Gates of Olympus' : 'Sweet Bonanza'} slotunda tek spinde **+${fmtMoney(totalWin)}** vurdun!`, 'fame');
    }
  } else {
    casinoUI.lastWinLog = isBonusBuy
      ? `⚡ 4 SCATTER DÜŞTÜ! Free Spin Başladı, Şimdi Spin Tuşuna Bas!`
      : `Eşleşme yok (En az 8 aynı sembol gerekli). Tekrar çevir!`;
  }

  saveGame();
  renderAll();
  renderVIPCasinoModal();
};

/* ---------------- VIP LIVE BLACKJACK 21 MOTORU ---------------- */

function createFreshBlackjackDeck() {
  const suits = [
    { s: '♠', color: 'black-suit' },
    { s: '♥', color: 'red-suit' },
    { s: '♦', color: 'red-suit' },
    { s: '♣', color: 'black-suit' }
  ];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck = [];
  for (let d = 0; d < 2; d++) {
    for (let st of suits) {
      for (let rk of ranks) {
        let val = parseInt(rk, 10);
        if (rk === 'A') val = 11;
        else if (['J', 'Q', 'K'].includes(rk)) val = 10;
        deck.push({ rank: rk, suit: st.s, color: st.color, val });
      }
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

function calcBlackjackHandTotal(hand) {
  let sum = 0;
  let aces = 0;
  hand.forEach(c => {
    sum += c.val;
    if (c.rank === 'A') aces++;
  });
  while (sum > 21 && aces > 0) {
    sum -= 10;
    aces--;
  }
  return sum;
}

window.startBlackjackHand = function () {
  if (!G) return;
  const bet = getCurrentBetAmount();
  if (G.money < bet) {
    showToast('Blackjack masası için bakiyen yetersiz!');
    return;
  }
  G.money -= bet;
  casinoUI.bjCurrentBet = bet;
  casinoUI.bjDeck = createFreshBlackjackDeck();
  casinoUI.bjPlayer = [casinoUI.bjDeck.pop(), casinoUI.bjDeck.pop()];
  casinoUI.bjDealer = [casinoUI.bjDeck.pop(), casinoUI.bjDeck.pop()];
  casinoUI.bjState = 'playing';
  playCasinoAudio('card');

  const pScore = calcBlackjackHandTotal(casinoUI.bjPlayer);
  if (pScore === 21) {
    // Doğrudan Blackjack (3:2 ödeme)
    finishBlackjackHand(true);
    return;
  }
  casinoUI.bjResultText = `El Toplamın: ${pScore} • Hamleni Seç (Kart Çek / Kal / 2x Katla)`;
  saveGame(); renderAll(); renderVIPCasinoModal();
};

window.blackjackPlayerAction = function (act) {
  if (casinoUI.bjState !== 'playing') return;
  playCasinoAudio('card');

  if (act === 'hit') {
    casinoUI.bjPlayer.push(casinoUI.bjDeck.pop());
    const pScore = calcBlackjackHandTotal(casinoUI.bjPlayer);
    if (pScore > 21) {
      casinoUI.bjState = 'resolved';
      casinoUI.bjResultText = `💥 BUST (${pScore})! 21'i geçtin, kasa kazandı (-${fmtMoney(casinoUI.bjCurrentBet)}).`;
    } else if (pScore === 21) {
      finishBlackjackHand(false);
      return;
    } else {
      casinoUI.bjResultText = `El Toplamın: ${pScore} • Kart çekmeye devam mı?`;
    }
  } else if (act === 'double') {
    if (G.money < casinoUI.bjCurrentBet) {
      showToast('Bahsi ikiye katlamak (Double) için nakit yetersiz!');
      return;
    }
    G.money -= casinoUI.bjCurrentBet;
    casinoUI.bjCurrentBet *= 2;
    casinoUI.bjPlayer.push(casinoUI.bjDeck.pop());
    const pScore = calcBlackjackHandTotal(casinoUI.bjPlayer);
    if (pScore > 21) {
      casinoUI.bjState = 'resolved';
      casinoUI.bjResultText = `💥 DOUBLE BUST (${pScore})! 21'i geçtin (-${fmtMoney(casinoUI.bjCurrentBet)}).`;
    } else {
      finishBlackjackHand(false);
      return;
    }
  } else if (act === 'stand') {
    finishBlackjackHand(false);
    return;
  }

  saveGame(); renderAll(); renderVIPCasinoModal();
};

function finishBlackjackHand(isNaturalBlackjack) {
  casinoUI.bjState = 'resolved';
  while (calcBlackjackHandTotal(casinoUI.bjDealer) < 17) {
    casinoUI.bjDealer.push(casinoUI.bjDeck.pop());
  }

  const pScore = calcBlackjackHandTotal(casinoUI.bjPlayer);
  const dScore = calcBlackjackHandTotal(casinoUI.bjDealer);
  const bet = casinoUI.bjCurrentBet;

  if (isNaturalBlackjack && dScore !== 21) {
    const win = Math.round(bet * 2.5); // 3:2 Blackjack Ödemesi
    G.money += win;
    playCasinoAudio('bigwin');
    casinoUI.bjResultText = `👑 BLACKJACK 21! Krupiyeyi ezdin: +${fmtMoney(win)} (3:2 Ödeme)!`;
    addLog(G.age, `🃏 **VIP BLACKJACK 21!** Masada kusursuz 21 yakalayarak **+${fmtMoney(win - bet)} net kazanç** aldın!`, 'good');
  } else if (dScore > 21 || pScore > dScore) {
    const win = bet * 2;
    G.money += win;
    playCasinoAudio('zeus');
    casinoUI.bjResultText = `🏆 KAZANDIN! Sen: ${pScore} vs Krupiye: ${dScore} (+${fmtMoney(win)})!`;
  } else if (pScore === dScore) {
    G.money += bet;
    casinoUI.bjResultText = `🤝 BERABERE (PUSH)! Sen: ${pScore} - Krupiye: ${dScore}. Bahsin iade edildi.`;
  } else {
    casinoUI.bjResultText = `❌ KASA KAZANDI! Krupiye: ${dScore} vs Sen: ${pScore} (-${fmtMoney(bet)}).`;
  }

  saveGame(); renderAll(); renderVIPCasinoModal();
}

/* ---------------- HD 4K CASINO ARAYÜZ ÇİZİCİSİ ---------------- */

window.openVIPCasinoModal = function (tab) {
  if (tab) casinoUI.gameTab = tab;
  if (!casinoUI.grid || casinoUI.grid.length !== 30) {
    casinoUI.grid = generateInitial6x5Grid();
  }
  renderVIPCasinoModal();
};

function renderVIPCasinoModal() {
  const sheet = document.getElementById('bottomSheet');
  if (!sheet || !G) return;
  sheet.classList.remove('hidden');

  document.getElementById('sheetTitle').textContent = '🎰 Royal VIP Casino & Live Lounge';
  document.getElementById('sheetSubtitle').textContent = `Cüzdan: ${fmtMoney(G.money)} • Gates of Olympus • Sweet Bonanza • 21`;

  const c = getCountry();
  const baseBet = Math.max(100, Math.round(c.monthlyMinWage * casinoUI.betMult));
  const actualBet = getCurrentBetAmount();
  const bonusBuyCost = baseBet * 100;

  const topTabs = `
    <div class="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-amber-400/40 mb-3 text-[10.5px] font-black">
      <button onclick="casinoUI.freeSpinsLeft=0; casinoUI.grid=[]; openVIPCasinoModal('olympus')" class="py-2 rounded-xl ${casinoUI.gameTab === 'olympus' ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow' : 'text-slate-300'}">⚡ Gates of Olympus</button>
      <button onclick="casinoUI.freeSpinsLeft=0; casinoUI.grid=[]; openVIPCasinoModal('bonanza')" class="py-2 rounded-xl ${casinoUI.gameTab === 'bonanza' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow' : 'text-slate-300'}">🍭 Sweet Bonanza</button>
      <button onclick="openVIPCasinoModal('blackjack')" class="py-2 rounded-xl ${casinoUI.gameTab === 'blackjack' ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow' : 'text-slate-300'}">🃏 Live Blackjack 21</button>
    </div>
  `;

  // Bahis Çip Seçici Çubuğu
  const chipOptions = [
    { mult: 0.05, label: 'Mini', bg: 'bg-sky-600 text-white' },
    { mult: 0.15, label: 'Standart', bg: 'bg-emerald-600 text-white' },
    { mult: 0.40, label: 'Yüksek', bg: 'bg-purple-600 text-white' },
    { mult: 1.00, label: 'VIP Balina', bg: 'bg-amber-400 text-slate-950' }
  ];

  const chipBar = `
    <div class="flex items-center justify-between gap-1.5 bg-slate-950/90 border border-slate-800 rounded-2xl p-2 mb-2.5">
      <div class="text-[10px]">
        <span class="text-slate-400 block">AKTİF BAHİS</span>
        <strong class="text-amber-300 font-mono-num text-xs">${fmtMoney(actualBet)}</strong>
      </div>
      <div class="flex gap-1">
        ${chipOptions.map(ch => `
          <button onclick="casinoUI.betMult=${ch.mult}; renderVIPCasinoModal()" class="casino-chip-btn ${ch.bg} ${casinoUI.betMult === ch.mult ? 'active' : ''}">
            ${fmtMoney(Math.round(c.monthlyMinWage * ch.mult))}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  let gameStageHtml = '';

  // 1. GATES OF OLYMPUS & 2. SWEET BONANZA SAHNESİ
  if (casinoUI.gameTab === 'olympus' || casinoUI.gameTab === 'bonanza') {
    const isOly = casinoUI.gameTab === 'olympus';
    const stageClass = isOly ? 'olympus-stage' : 'bonanza-stage';

    gameStageHtml = `
      <div class="${stageClass} ${casinoUI.zeusStruck ? 'zeus-strike-anim' : ''} space-y-2.5">
        <!-- Üst Bilgi: Zeus / Şeker Başlığı, Free Spin Sayacı ve Toplam Çarpan -->
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl ${isOly ? 'bg-amber-400/20 border-amber-400' : 'bg-pink-400/20 border-pink-400'} border-2 flex items-center justify-center text-2xl shadow">
              ${isOly ? '🧔🏼‍♂️' : '🍭'}
            </div>
            <div>
              <div class="text-xs font-black text-white uppercase tracking-wider">
                ${isOly ? 'GATES OF OLYMPUS 1000™' : 'SWEET BONANZA 1000™'}
              </div>
              <div class="text-[9.5px] font-bold ${isOly ? 'text-amber-300' : 'text-pink-200'}">
                Pay Anywhere (8+ Eşleşme) • Max 500x Çarpan
              </div>
            </div>
          </div>

          <div class="text-right">
            ${casinoUI.freeSpinsLeft > 0 ? `
              <span class="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-mono-num text-[11px] font-black animate-pulse">
                ⚡ FREE SPIN: ${casinoUI.freeSpinsLeft}
              </span>
            ` : `
              <span class="px-2 py-0.5 rounded-lg bg-slate-950/80 border border-white/20 text-[10px] font-mono-num text-emerald-300 font-bold">
                RTP 96.5%
              </span>
            `}
            ${isOly && casinoUI.fsTotalMultiplier > 0 ? `
              <div class="text-[10px] font-mono-num font-black text-sky-300 mt-0.5">TOPLAM ÇARPAN: ${casinoUI.fsTotalMultiplier}x</div>
            ` : ''}
          </div>
        </div>

        <!-- 6x5 30 Hücreli HD Slot Izgarası -->
        <div class="slot-6x5-grid">
          ${casinoUI.grid.map((cell, idx) => `
            <div class="slot-cell-hd ${cell.isWinning ? 'slot-cell-win' : ''} ${cell.isMultiplier ? 'slot-cell-mult' : ''}" style="animation-delay:${(idx % 6) * 0.03}s">
              <span class="sym-icon">${cell.icon}</span>
              ${cell.isMultiplier ? `<span class="mult-badge-text">${cell.multValue}x</span>` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Kazanç Skorbordu -->
        <div class="p-2 rounded-xl bg-slate-950/90 border ${casinoUI.lastWinAmt > 0 ? 'border-amber-400' : 'border-slate-800'} text-center">
          <div class="text-xs font-extrabold ${casinoUI.lastWinAmt > 0 ? 'text-amber-300' : 'text-slate-300'}">
            ${casinoUI.lastWinLog}
          </div>
          ${casinoUI.fsCumulativeWin > 0 ? `<div class="text-[10px] font-mono-num text-emerald-400 font-bold">Free Spin Toplam Kazanç: +${fmtMoney(casinoUI.fsCumulativeWin)}</div>` : ''}
        </div>

        <!-- Alt Kontrol Paneli: Bonus Satın Al (100x), Çifte Şans ve Dev Spin Tuşu -->
        <div class="flex items-center justify-between gap-2 pt-1">
          <button onclick="spinPragmaticSlot(true)" class="flex-1 py-2.5 px-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 text-slate-950 text-left shadow-lg">
            <div class="text-[9px] font-black uppercase">⚡ BONUS SATIN AL (FS)</div>
            <div class="text-xs font-mono-num font-black">${fmtMoney(bonusBuyCost)}</div>
          </button>

          <button onclick="spinPragmaticSlot(false)" class="spin-btn-hd" title="Çevir (Spin)">
            ↻
          </button>

          <button onclick="casinoUI.doubleChance=!casinoUI.doubleChance; renderVIPCasinoModal()" class="flex-1 py-2.5 px-2 rounded-xl border ${casinoUI.doubleChance ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300' : 'bg-slate-950/80 border-slate-700 text-slate-400'} text-right">
            <div class="text-[9px] font-black uppercase">ÇİFTE ŞANS (2X)</div>
            <div class="text-xs font-extrabold">${casinoUI.doubleChance ? 'AÇIK ✓' : 'KAPALI'}</div>
          </button>
        </div>
      </div>
    `;
  }

  // 3. VIP LIVE BLACKJACK 21 MASASI
  else if (casinoUI.gameTab === 'blackjack') {
    const pScore = calcBlackjackHandTotal(casinoUI.bjPlayer);
    const dScore = casinoUI.bjState === 'playing'
      ? (casinoUI.bjDealer[0] ? casinoUI.bjDealer[0].val : 0)
      : calcBlackjackHandTotal(casinoUI.bjDealer);

    gameStageHtml = `
      <div class="bj-table-felt space-y-4">
        <div class="flex items-center justify-between border-b border-emerald-400/25 pb-2">
          <div>
            <div class="text-[9px] font-extrabold text-amber-300 uppercase tracking-widest">🟢 EVOLUTION VIP LIVE BLACKJACK</div>
            <div class="text-xs font-extrabold text-white">Blackjack 3:2 Öder • Krupiye 17'de Kalır</div>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-mono-num text-[10px] font-black">
            Masa Bahsi: ${fmtMoney(casinoUI.bjCurrentBet || actualBet)}
          </span>
        </div>

        <!-- Krupiye Eli -->
        <div class="space-y-1.5 text-center">
          <div class="text-[10px] font-extrabold text-emerald-200 uppercase">
            🤵‍♂️ KRUPİYE ELİ ${casinoUI.bjDealer.length > 0 ? `(${casinoUI.bjState === 'playing' ? dScore + ' + ?' : dScore})` : ''}
          </div>
          <div class="flex items-center justify-center gap-2 min-h-[76px]">
            ${casinoUI.bjDealer.length === 0 ? `<div class="text-xs text-emerald-300/60 italic">Kartlar dağıtılmayı bekliyor...</div>` :
              casinoUI.bjDealer.map((card, idx) => {
                if (idx === 1 && casinoUI.bjState === 'playing') {
                  return `<div class="playing-card-hd playing-card-back">👑</div>`;
                }
                return `
                  <div class="playing-card-hd ${card.color}">
                    <div class="text-xs leading-none">${card.rank}</div>
                    <div class="text-center text-lg leading-none">${card.suit}</div>
                    <div class="text-xs leading-none text-right">${card.rank}</div>
                  </div>
                `;
              }).join('')
            }
          </div>
        </div>

        <!-- Orta Durum Bandı -->
        <div class="p-2 rounded-xl bg-slate-950/85 border border-amber-400/40 text-center text-xs font-extrabold text-amber-300">
          ${casinoUI.bjResultText}
        </div>

        <!-- Oyuncunun Eli -->
        <div class="space-y-1.5 text-center">
          <div class="text-[10px] font-extrabold text-white uppercase">
            👤 SENİN ELİN ${casinoUI.bjPlayer.length > 0 ? `(TOPLAM: ${pScore})` : ''}
          </div>
          <div class="flex items-center justify-center gap-2 min-h-[76px]">
            ${casinoUI.bjPlayer.map(card => `
              <div class="playing-card-hd ${card.color}">
                <div class="text-xs leading-none">${card.rank}</div>
                <div class="text-center text-lg leading-none">${card.suit}</div>
                <div class="text-xs leading-none text-right">${card.rank}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Blackjack Aksiyon Butonları -->
        ${casinoUI.bjState === 'playing' ? `
          <div class="grid grid-cols-3 gap-2 pt-1">
            <button onclick="blackjackPlayerAction('hit')" class="py-3 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black shadow">
              🃏 KART ÇEK (HIT)
            </button>
            <button onclick="blackjackPlayerAction('stand')" class="py-3 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shadow">
              ✋ KAL (STAND)
            </button>
            <button onclick="blackjackPlayerAction('double')" class="py-3 rounded-xl bg-sky-500 text-slate-950 text-xs font-black shadow">
              ⚡ 2X KATLA
            </button>
          </div>
        ` : `
          <button onclick="startBlackjackHand()" class="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-black shadow-lg">
            🃏 YENİ EL DAĞIT (${fmtMoney(actualBet)})
          </button>
        `}
      </div>
    `;
  }

  document.getElementById('sheetBody').innerHTML = `
    <div class="casino-hd-wrapper">
      ${topTabs}
      ${chipBar}
      ${gameStageHtml}
    </div>
  `;
}

/* ---------------- MENÜ VE CASINO SEKMESİ ENTEGRASYON KANCASI ---------------- */

(function attachVIPCasinoMasterEngine() {
  if (window._vipCasinoEngineLoaded) return;
  window._vipCasinoEngineLoaded = true;

  // 1. openMenuSection('casino') çağrıldığında eski basit ekran yerine HD VIP Casino açılsın
  const _prevOpenMenuSec = openMenuSection;
  openMenuSection = function (sec) {
    if (sec === 'casino' || sec === 'gambling') {
      openVIPCasinoModal();
      return;
    }
    _prevOpenMenuSec(sec);
  };

  // 2. Ana Menüye "🎰 VIP Royal Casino (Gates of Olympus / Sweet Bonanza / 21)" Kartı Ekle
  const _prevOpenNav = openNavSheet;
  openNavSheet = function (tab) {
    _prevOpenNav(tab);
    if (tab === 'menu') {
      const body = document.getElementById('sheetBody');
      if (body && !document.getElementById('menuVipCasinoBtn')) {
        const grid = body.querySelector('.grid.grid-cols-2');
        if (grid) {
          grid.insertAdjacentHTML('afterbegin', `
            <button id="menuVipCasinoBtn" onclick="openVIPCasinoModal('olympus')" class="col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-purple-600/20 to-pink-500/25 border border-amber-400/60 text-left flex items-center justify-between mb-1 shadow-lg">
              <div>
                <div class="text-xs font-black text-amber-300 uppercase">🎰 ROYAL VIP CASINO &amp; SLOT LOUNGE</div>
                <div class="text-sm font-extrabold text-white">Gates of Olympus • Sweet Bonanza • Live Blackjack 21</div>
              </div>
              <span class="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shrink-0">Masaya Otur &rarr;</span>
            </button>
          `);
        }
      }
    }
  };
})();

/* ============================================================================
   SİNEMATİK ANA MENÜ, 3'LÜ SAVE SLOTU VE CANLI KARAKTER OLUŞTURMA MOTORU (GAME.JS)
   ============================================================================ */

let currentSelectedSlot = 1;

// 3 Farklı Save Slotunu LocalStorage'da Yönetme
function getSlotStorageKey(slotNum) {
  return `cagatay_life_sim_save_slot_${slotNum}`;
}

function checkSaveSlotsMeta() {
  const meta = {};
  for (let s = 1; s <= 3; s++) {
    const raw = localStorage.getItem(getSlotStorageKey(s));
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        meta[s] = {
          exists: true,
          name: `${parsed.firstName} ${parsed.lastName}`,
          age: parsed.age,
          money: parsed.money,
          city: parsed.birthCity || 'İstanbul',
          job: parsed.jobId ? 'Çalışıyor' : 'Serbest'
        };
      } catch (e) {
        meta[s] = { exists: false };
      }
    } else {
      meta[s] = { exists: false };
    }
  }
  return meta;
}

// Oyunu Başlatırken Sinematik Ana Menüyü Göster (Eğer aktif oyun yüklenmediyse)
function showCinematicMainMenuIfNeeded() {
  if (window._cinematicMenuShown) return;
  // Eğer oyun zaten yüklenmiş ve G nesnesi varsa ana menüyü atla
  if (typeof G !== 'undefined' && G && G.firstName) return;

  window._cinematicMenuShown = true;
  let menuEl = document.getElementById('cinematicMainMenuRoot');
  if (!menuEl) {
    menuEl = document.createElement('div');
    menuEl.id = 'cinematicMainMenuRoot';
    menuEl.className = 'cinematic-main-menu';
    document.body.appendChild(menuEl);
  }

  const slots = checkSaveSlotsMeta();

  menuEl.innerHTML = `
    <div class="text-center space-y-3 mb-6">
      <div class="inline-block px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400 text-amber-300 font-mono-num text-xs font-black">
        ✨ ULTIMATE LIFE SIMULATOR v2.5
      </div>
      <h1 class="text-3xl font-black text-white tracking-wide">KABUS &amp; ZİRVE HAYATLAR</h1>
      <p class="text-xs text-slate-400 max-w-xs mx-auto">Kariyer, Ticaret, Aile, Casino ve Şehir Simülasyonu. Kaldığın yerden devam et veya sıfırdan efsane yarat.</p>
    </div>

    <div class="w-full max-w-450px space-y-2.5 mb-6">
      <div class="text-[10px] font-extrabold text-sky-400 uppercase tracking-widest px-1">💾 KAYIT SLOTLARI (3 FARKLI HAYAT)</div>
      ${[1, 2, 3].map(sNum => {
        const st = slots[sNum];
        return `
          <div class="save-slot-card">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400 flex items-center justify-center font-mono-num font-black text-sky-300">
                #${sNum}
              </div>
              <div>
                <div class="text-xs font-extrabold text-white">${st.exists ? st.name : 'Boş Kayıt Slotu'}</div>
                <div class="text-[10px] text-slate-400">${st.exists ? `${st.age} Yaş • ${fmtMoney(st.money)} • ${st.city}` : 'Yeni bir karakter oluştur'}</div>
              </div>
            </div>
            <div class="flex gap-1.5">
              ${st.exists ? `
                <button onclick="loadGameFromSlot(${sNum})" class="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-[10px] font-black">Yükle</button>
                <button onclick="openCharacterCreatorModal(${sNum})" class="px-2.5 py-2 rounded-xl bg-slate-800 text-amber-300 text-[10px] font-bold" title="Üzerine Yaz">🔄</button>
              ` : `
                <button onclick="openCharacterCreatorModal(${sNum})" class="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 text-[10px] font-black">Yeni Hayat</button>
              `}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

window.loadGameFromSlot = function (sNum) {
  currentSelectedSlot = sNum;
  const raw = localStorage.getItem(getSlotStorageKey(sNum));
  if (!raw) {
    openCharacterCreatorModal(sNum);
    return;
  }
  try {
    const data = JSON.parse(raw);
    window.G = data;
    const menuEl = document.getElementById('cinematicMainMenuRoot');
    if (menuEl) menuEl.remove();
    playSfx('trophy');
    saveGame();
    renderAll();
    showToast(`Slot #${sNum} yüklendi: Hoş geldin ${G.firstName}!`);
  } catch (e) {
    openCharacterCreatorModal(sNum);
  }
};

/* ============================================================================
   CANLI KARAKTER OLUŞTURMA STÜDYOSU (GÖZ, SAÇ, TEN, İSİM VE MEMLEKET)
   ============================================================================ */

let creationState = {
  slotNum: 1,
  firstName: 'Çağatay',
  lastName: 'Kılıç',
  gender: 'Erkek',
  birthCity: 'İstanbul',
  skinId: 'skin_wheat',
  hairStyleId: 'fade_crop',
  hairColorId: 'hc_darkbrown',
  beardStyleId: 'beard_stubble',
  eyeColorId: 'eye_hazel',
  outfitId: 'out_tshirt'
};

window.openCharacterCreatorModal = function (sNum) {
  currentSelectedSlot = sNum;
  creationState.slotNum = sNum;
  creationState.firstName = sNum === 1 ? 'Çağatay' : (sNum === 2 ? 'Berk' : 'Mert');
  creationState.lastName = 'Kılıç';

  let modal = document.getElementById('charCreatorModalRoot');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'charCreatorModalRoot';
    modal.className = 'char-creator-modal';
    document.body.appendChild(modal);
  }
  modal.classList.remove('hidden');
  renderCharacterCreatorContent();
};

function renderCharacterCreatorContent() {
  const modal = document.getElementById('charCreatorModalRoot');
  if (!modal) return;

  // Geçici SVG Önizlemesi Üretmek İçin Geçici G Nesnesi Oluştur
  const tempG = {
    gender: creationState.gender,
    age: 18,
    happy: 80,
    charLook: {
      skinId: creationState.skinId,
      hairStyleId: creationState.hairStyleId,
      hairColorId: creationState.hairColorId,
      beardStyleId: creationState.beardStyleId,
      browStyleId: 'brow_natural',
      eyeColorId: creationState.eyeColorId,
      outfitId: creationState.outfitId,
      glassesId: 'gl_none',
      yearsSinceHaircut: 0
    }
  };

  const previewSvgUrl = typeof generateDynamicCharacterSVG === 'function'
    ? generateDynamicCharacterSVG.call(tempG, false)
    : '';

  modal.innerHTML = `
    <div class="char-creator-box space-y-4">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <div>
          <div class="text-[9px] font-extrabold text-sky-400 uppercase">SLOT #${creationState.slotNum} • KARAKTER STÜDYOSU</div>
          <div class="text-base font-black text-white">Yeni Karakter Tasarımı</div>
        </div>
        <button onclick="document.getElementById('charCreatorModalRoot').classList.add('hidden')" class="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold">Kapat ✕</button>
      </div>

      <!-- Canlı Karakter Portre Önizlemesi -->
      <div class="flex flex-col items-center gap-2">
        <div class="creator-preview-frame">
          <img src="${previewSvgUrl}" class="w-full h-full object-cover" />
        </div>
        <div class="text-xs font-extrabold text-amber-300">${creationState.firstName} ${creationState.lastName} (18 Yaş)</div>
      </div>

      <!-- İsim ve Memleket Seçimi -->
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>
          <label class="text-[10px] text-slate-400 block mb-1">Adın</label>
          <input type="text" id="creatorInputName" value="${creationState.firstName}" oninput="creationState.firstName=this.value" class="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"/>
        </div>
        <div>
          <label class="text-[10px] text-slate-400 block mb-1">Soyadın</label>
          <input type="text" id="creatorInputSurname" value="${creationState.lastName}" oninput="creationState.lastName=this.value" class="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"/>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>
          <label class="text-[10px] text-slate-400 block mb-1">Cinsiyet</label>
          <select onchange="creationState.gender=this.value; renderCharacterCreatorContent();" class="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold">
            <option value="Erkek" ${creationState.gender === 'Erkek' ? 'selected' : ''}>Erkek</option>
            <option value="Kadın" ${creationState.gender === 'Kadın' ? 'selected' : ''}>Kadın</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] text-slate-400 block mb-1">Doğum Şehri (Memleket)</label>
          <select onchange="creationState.birthCity=this.value" class="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold">
            ${TURKEY_BIRTH_CITIES_DB.map(ct => `<option value="${ct.name}" ${creationState.birthCity === ct.name ? 'selected' : ''}>${ct.name} (${ct.region})</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Görünüm Özelleştirme Butonları -->
      <div class="space-y-2 text-[10px]">
        <div>
          <span class="text-slate-400 block mb-1">Saç Modeli</span>
          <div class="grid grid-cols-3 gap-1.5">
            ${(typeof CHAR_HAIR_STYLES_DB !== 'undefined' ? CHAR_HAIR_STYLES_DB : []).map(hs => `
              <button onclick="creationState.hairStyleId='${hs.id}'; renderCharacterCreatorContent();" class="p-1.5 rounded-lg border text-center font-bold truncate ${creationState.hairStyleId === hs.id ? 'border-sky-400 bg-sky-500/20 text-white' : 'border-slate-800 bg-slate-950 text-slate-400'}">
                ${hs.name.split(' ')[1] || hs.name}
              </button>
            `).join('')}
          </div>
        </div>

        <div>
          <span class="text-slate-400 block mb-1">Saç &amp; Göz Rengi</span>
          <div class="flex gap-2 items-center">
            ${(typeof CHAR_HAIR_COLORS_DB !== 'undefined' ? CHAR_HAIR_COLORS_DB : []).slice(0, 5).map(hc => `
              <button onclick="creationState.hairColorId='${hc.id}'; renderCharacterCreatorContent();" class="w-7 h-7 rounded-full border-2 ${creationState.hairColorId === hc.id ? 'border-white scale-110' : 'border-slate-700'}" style="background:${hc.hex}"></button>
            `).join('')}
          </div>
        </div>
      </div>

      <button onclick="finalizeAndStartNewLife()" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 text-sm font-black shadow-lg">
        🚀 Bu Karakterle Hayata Başla!
      </button>
    </div>
  `;
}

window.finalizeAndStartNewLife = function () {
  const c = getCountry();
  const cityObj = TURKEY_BIRTH_CITIES_DB.find(x => x.name === creationState.birthCity) || TURKEY_BIRTH_CITIES_DB[0];
  const startMoney = Math.round(c.monthlyMinWage * 1.8 * cityObj.bonusStartMoney);

  // Yeni Oyun Nesnesini (G) İnşa Et
  window.G = {
    firstName: creationState.firstName || 'Çağatay',
    lastName: creationState.lastName || 'Kılıç',
    gender: creationState.gender,
    age: 18,
    countryId: 'TR',
    birthCity: cityObj.name,
    money: startMoney,
    health: 95,
    happy: 80,
    looks: 75,
    fame: 10,
    stress: 20,
    creditScore: 1200,
    jobId: null,
    eduStage: 'Üniversite',
    uniGrad: false,
    licenses: { B: false, CE: false },
    criminalRecord: false,
    houses: [],
    cars: [],
    businesses: [],
    children: [],
    spouse: null,
    charLook: {
      skinId: creationState.skinId,
      hairStyleId: creationState.hairStyleId,
      hairColorId: creationState.hairColorId,
      beardStyleId: creationState.beardStyleId,
      browStyleId: 'brow_natural',
      eyeColorId: creationState.eyeColorId,
      outfitId: creationState.outfitId,
      glassesId: 'gl_none',
      yearsSinceHaircut: 0,
      hasSkinCareGlow: false
    },
    lifeEvents: { seenIds: [], pendingChains: [], lastFootballAge: 0 },
    coach: { licenses: [], activeClub: null, salaryMult: 0, trophies: 0 },
    iddaa: { selectedPicks: {}, stakeMult: 0.5, couponsWon: 0 },
    yapSat: { lands: [], activeProject: null },
    freelance: { officeId: null, clients: 0, ecomStoreId: null },
    garageV2: { plates: [], carMods: {}, carHp: {}, tuvturkValidUntil: 20, kaskoActive: false },
    lifeV2: { ceoKids: [], holidaysThisYear: 0 },
    phone: { inbox: [], operator: 'TurkNet 5G' },
    uiPrefs: { showCityMap: false, rpgDialoguesEnabled: true },
    rivals: []
  };

  const modal = document.getElementById('charCreatorModalRoot');
  if (modal) modal.classList.add('hidden');
  const menuEl = document.getElementById('cinematicMainMenuRoot');
  if (menuEl) menuEl.remove();

  playSfx('trophy');
  saveGame();
  renderAll();
  showToast(`Yeni hayatın başladı: Hoş geldin ${G.firstName}!`);
};

/* ============================================================================
   KAYIT (SAVE) SİSTEMİNİ 3 SLOTA BAĞLAMA KANCASI
   ============================================================================ */

(function attachCinematicMenuAndSlotsEngine() {
  if (window._cinematicMenuEngineLoaded) return;
  window._cinematicMenuEngineLoaded = true;

  // SaveGame fonksiyonunu aktif slot numarasına göre güncelle
  const _origSaveGame = window.saveGame;
  window.saveGame = function () {
    if (typeof _origSaveGame === 'function') _origSayv = _origSaveGame();
    if (typeof G !== 'undefined' && G && G.firstName) {
      try {
        localStorage.setItem(getSlotStorageKey(currentSelectedSlot), JSON.stringify(G));
      } catch (e) {}
    }
  };

  // Sayfa yüklendiğinde (eğer kayıtlı oyun yoksa veya manuel çağrıldıysa) sinematik menüyü göster
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(showCinematicMainMenuIfNeeded, 100);
  });

  setTimeout(showCinematicMainMenuIfNeeded, 200);
})();

/* ============================================================================
   MASTER ONARIM PAKETİ: BAŞLANGIÇ EKRANI DÜZELTMESİ, TEKİLLEŞTİRME VE
   1:1 PRAGMATIC PLAY SWEET BONANZA 1000 / GATES OF OLYMPUS 1000 MOTORU
   ============================================================================ */

// 1. ÇÖKME ÖNLEYİCİ GÜVENLİ KORUMALAR (G Henüz Yokken Çağrılan Fonksiyonlar İçin)
(function patchCoreSafetyWrappers() {
  const _rawGetCountry = typeof getCountry === 'function' ? getCountry : null;
  window.getCountry = getCountry = function () {
    if (typeof G !== 'undefined' && G && G.countryId && _rawGetCountry) {
      return _rawGetCountry();
    }
    return (typeof COUNTRIES !== 'undefined' && COUNTRIES[0])
      ? COUNTRIES[0]
      : { id: 'TR', name: 'Türkiye', flag: '🇹🇷', currency: '₺', monthlyMinWage: 22104, taxRate: 0.20, inflation: 0 };
  };

  const _rawFmtMoney = typeof fmtMoney === 'function' ? fmtMoney : null;
  window.fmtMoney = fmtMoney = function (n) {
    const val = Math.round(Number(n) || 0);
    if (typeof G !== 'undefined' && G && _rawFmtMoney) {
      try { return _rawFmtMoney(val); } catch (e) {}
    }
    return val.toLocaleString('tr-TR') + ' ₺';
  };
})();

// 2. KARAKTER SVG MOTORUNU BAŞLANGIÇ EKRANINDA ASLA ÇÖKMEYECEK ŞEKİLDE GÜNCELLE
window.generateDynamicCharacterSVG = function (rawSvgOnly = false, overrideObj = null) {
  const target = overrideObj || (typeof G !== 'undefined' && G ? G : {
    gender: (typeof creationState !== 'undefined' ? creationState.gender : 'Erkek'),
    age: 18,
    happy: 80,
    charLook: (typeof creationState !== 'undefined' ? creationState : {})
  });

  if (!target.charLook) {
    target.charLook = {
      skinId: target.skinId || 'skin_wheat',
      hairStyleId: target.hairStyleId || 'fade_crop',
      hairColorId: target.hairColorId || 'hc_darkbrown',
      beardStyleId: target.beardStyleId || 'beard_stubble',
      browStyleId: 'brow_natural',
      eyeColorId: target.eyeColorId || 'eye_hazel',
      outfitId: target.outfitId || 'out_tshirt',
      glassesId: 'gl_none',
      yearsSinceHaircut: 0
    };
  }

  const lk = target.charLook;
  const skin = (typeof CHAR_SKIN_TONES_DB !== 'undefined' && CHAR_SKIN_TONES_DB.find(x => x.id === lk.skinId)) || { base: '#eab68c', shadow: '#c98e63' };
  const hairColor = (typeof CHAR_HAIR_COLORS_DB !== 'undefined' && CHAR_HAIR_COLORS_DB.find(x => x.id === lk.hairColorId)) || { hex: '#2c1b12', highlight: '#4a3022' };
  const eyeColor = (typeof CHAR_EYE_COLORS_DB !== 'undefined' && CHAR_EYE_COLORS_DB.find(x => x.id === lk.eyeColorId)) || { hex: '#6e5227' };
  const outfit = (typeof CHAR_OUTFITS_DB !== 'undefined' && CHAR_OUTFITS_DB.find(x => x.id === lk.outfitId)) || { primary: '#1e293b', accent: '#38bdf8' };

  const hs = lk.hairStyleId || 'fade_crop';
  let hairTopSvg = `<path d="M52,78 C50,42 72,28 100,28 C128,28 150,42 148,78 C142,60 124,52 100,52 C76,52 58,60 52,78 Z" fill="${hairColor.hex}"/>`;
  if (hs === 'pompadour') {
    hairTopSvg = `<path d="M52,80 C46,36 68,16 104,18 C138,20 154,40 148,80 C140,56 120,46 96,48 C74,50 60,60 52,80 Z" fill="${hairColor.hex}"/>`;
  } else if (hs === 'curly_perm') {
    hairTopSvg = `<path d="M46,82 C40,42 66,22 100,22 C134,22 160,42 154,82 C140,62 120,56 100,56 C80,56 60,62 46,82 Z" fill="${hairColor.hex}"/><circle cx="72" cy="44" r="14" fill="${hairColor.hex}"/><circle cx="100" cy="38" r="15" fill="${hairColor.hex}"/><circle cx="128" cy="44" r="14" fill="${hairColor.hex}"/>`;
  } else if (hs === 'long_wave') {
    hairTopSvg = `<path d="M42,75 C34,115 36,155 48,175 L152,175 C164,155 166,115 158,75 Z" fill="${hairColor.hex}"/><path d="M46,86 C44,38 70,24 100,24 C130,24 156,38 154,86 C142,58 122,48 100,48 C78,48 58,58 46,86 Z" fill="${hairColor.hex}"/>`;
  } else if (hs === 'bald_clean') {
    hairTopSvg = '';
  }

  let beardSvg = '';
  if (target.gender !== 'Kadın' && lk.beardStyleId !== 'beard_clean') {
    beardSvg = `<path d="M56,108 C56,138 76,153 100,153 C124,153 144,138 144,108 C140,126 124,142 100,142 C76,142 60,126 56,108 Z" fill="${hairColor.hex}" opacity="${lk.beardStyleId === 'beard_full' ? '0.88' : '0.35'}"/><path d="M82,124 Q100,119 118,124" fill="none" stroke="${hairColor.hex}" stroke-width="4" opacity="0.65" stroke-linecap="round"/>`;
  }

  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
    <rect width="200" height="220" fill="#0f172a"/>
    <circle cx="100" cy="95" r="78" fill="${outfit.accent}" opacity="0.12"/>
    <rect x="81" y="132" width="38" height="36" rx="10" fill="${skin.shadow}"/>
    <path d="M25,220 C28,168 58,156 100,156 C142,156 172,168 175,220 Z" fill="${outfit.primary}"/>
    <path d="M76,156 Q100,175 124,156" fill="none" stroke="${outfit.accent}" stroke-width="4"/>
    <ellipse cx="50" cy="100" rx="8" ry="13" fill="${skin.shadow}"/>
    <ellipse cx="150" cy="100" rx="8" ry="13" fill="${skin.shadow}"/>
    <path d="M52,76 C52,44 72,34 100,34 C128,34 148,44 148,76 C148,116 130,152 100,152 C70,152 52,116 52,76 Z" fill="${skin.base}"/>
    <ellipse cx="76" cy="94" rx="11" ry="7" fill="#ffffff"/>
    <circle cx="76" cy="94" r="5.5" fill="${eyeColor.hex}"/>
    <circle cx="76" cy="94" r="2.6" fill="#090d16"/>
    <circle cx="78" cy="92" r="1.6" fill="#ffffff"/>
    <ellipse cx="124" cy="94" rx="11" ry="7" fill="#ffffff"/>
    <circle cx="124" cy="94" r="5.5" fill="${eyeColor.hex}"/>
    <circle cx="124" cy="94" r="2.6" fill="#090d16"/>
    <circle cx="126" cy="92" r="1.6" fill="#ffffff"/>
    <path d="M62,81 Q76,75 89,80" fill="none" stroke="${hairColor.hex}" stroke-width="3.8" stroke-linecap="round"/>
    <path d="M111,80 Q124,75 138,81" fill="none" stroke="${hairColor.hex}" stroke-width="3.8" stroke-linecap="round"/>
    <path d="M100,90 L97,112 Q100,115 105,112" fill="none" stroke="${skin.shadow}" stroke-width="2.6" stroke-linecap="round"/>
    ${beardSvg}
    <path d="M86,129 Q100,139 114,129" fill="none" stroke="#8c3b32" stroke-width="3.2" stroke-linecap="round"/>
    ${hairTopSvg}
  </svg>`;

  return rawSvgOnly ? svgMarkup : 'data:image/svg+xml;utf8,' + encodeURIComponent(svgMarkup);
};

// 3. BAŞLANGIÇ EKRANI VE KAYIT SLOTU YÜKLEME / OLUŞTURMA HATASI KESİN ÇÖZÜMÜ
function createCompleteValidGameObject(opts = {}) {
  const c = getCountry();
  const baseWage = c.monthlyMinWage || 22104;
  const fName = opts.firstName || 'Çağatay';
  const lName = opts.lastName || 'Kılıç';
  const gender = opts.gender || 'Erkek';
  const bCity = opts.birthCity || 'İstanbul';
  const startAge = typeof opts.age === 'number' ? opts.age : 18;
  const startMoney = typeof opts.money === 'number' ? opts.money : Math.round(baseWage * 2.0);

  return {
    firstName: fName,
    lastName: lName,
    gender: gender,
    age: startAge,
    countryId: 'TR',
    birthCity: bCity,
    portraitIdx: 0,
    money: startMoney,
    bankSavings: 0,
    savings: 0,
    loanDebt: 0,
    mortgageDebt: 0,
    creditScore: 1350,
    health: 95,
    happy: 85,
    smart: 78,
    intel: 78,
    looks: 78,
    fame: 10,
    stress: 15,
    energy: 100,
    maxEnergy: 100,
    eduStage: 'Üniversite',
    uniYears: 0,
    uniGrad: false,
    jobId: null,
    jobExp: 0,
    jobPerf: 70,
    inPrison: false,
    prisonYears: 0,
    criminalRecord: false,
    alive: true,
    licenses: { B: false, CE: false },
    houses: [],
    cars: [],
    businesses: [],
    stockHoldings: {},
    cryptoHoldings: {},
    stocks: {},
    crypto: {},
    spouse: null,
    lover: null,
    children: [],
    achievements: [],
    logs: [
      {
        age: startAge,
        items: [
          { text: `🌟 **YENİ HAYAT BAŞLADI:** **${fName} ${lName}** (${bCity}) olarak ${startAge} yaşında hayata adım attın! Başlangıç sermayen: **${fmtMoney(startMoney)}**.`, type: 'milestone' }
        ]
      }
    ],
    charLook: {
      skinId: opts.skinId || 'skin_wheat',
      hairStyleId: opts.hairStyleId || 'fade_crop',
      hairColorId: opts.hairColorId || 'hc_darkbrown',
      beardStyleId: opts.beardStyleId || 'beard_stubble',
      browStyleId: 'brow_natural',
      eyeColorId: opts.eyeColorId || 'eye_hazel',
      outfitId: opts.outfitId || 'out_tshirt',
      glassesId: 'gl_none',
      yearsSinceHaircut: 0,
      hasSkinCareGlow: false
    }
  };
}

function closeAllStartOverlaysAndEnterGame() {
  ['cinematicMainMenuRoot', 'charCreatorModalRoot', 'startModal', 'introModal', 'newGameModal', 'welcomeModal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('hidden');
      if (id === 'cinematicMainMenuRoot' || id === 'charCreatorModalRoot') el.remove();
    }
  });
  const shell = document.getElementById('appShell');
  if (shell) shell.classList.remove('hidden');
}

window.loadGameFromSlot = function (sNum) {
  currentSelectedSlot = sNum;
  const raw = localStorage.getItem(getSlotStorageKey(sNum));
  if (!raw) {
    openCharacterCreatorModal(sNum);
    return;
  }
  try {
    const loaded = JSON.parse(raw);
    const fallback = createCompleteValidGameObject(loaded);
    const merged = Object.assign(fallback, loaded);
    if (!Array.isArray(merged.logs) || merged.logs.length === 0) {
      merged.logs = fallback.logs;
    }
    // Hem lexical G hem window.G olarak ata!
    G = merged;
    window.G = G;

    closeAllStartOverlaysAndEnterGame();
    if (typeof saveGame === 'function') saveGame();
    if (typeof renderAll === 'function') renderAll();
    if (typeof playSfx === 'function') playSfx('trophy');
    if (typeof showToast === 'function') showToast(`Kayıt Slotu #${sNum} Yüklendi: Hoş geldin ${G.firstName}!`);
  } catch (err) {
    console.error('Slot yükleme hatası, yeni karakter ekranı açılıyor:', err);
    openCharacterCreatorModal(sNum);
  }
};

window.finalizeAndStartNewLife = function () {
  const nameInput = document.getElementById('creatorInputName');
  const surnameInput = document.getElementById('creatorInputSurname');
  if (nameInput && nameInput.value.trim()) creationState.firstName = nameInput.value.trim();
  if (surnameInput && surnameInput.value.trim()) creationState.lastName = surnameInput.value.trim();

  const newG = createCompleteValidGameObject(creationState);
  // Hem lexical G hem window.G olarak ata!
  G = newG;
  window.G = G;

  try {
    localStorage.setItem(getSlotStorageKey(currentSelectedSlot), JSON.stringify(G));
  } catch (e) {}

  closeAllStartOverlaysAndEnterGame();
  if (typeof saveGame === 'function') saveGame();
  if (typeof renderAll === 'function') renderAll();
  if (typeof playSfx === 'function') playSfx('trophy');
  if (typeof showToast === 'function') showToast(`🚀 Yeni hayatın başladı: Hoş geldin ${G.firstName}!`);
};

window.renderCharacterCreatorContent = function () {
  const modal = document.getElementById('charCreatorModalRoot');
  if (!modal) return;

  const previewSvgUrl = generateDynamicCharacterSVG(false, creationState);
  const cities = typeof TURKEY_BIRTH_CITIES_DB !== 'undefined' ? TURKEY_BIRTH_CITIES_DB : [
    { name: 'İstanbul', region: 'Marmara' }, { name: 'Ordu', region: 'Karadeniz' }, { name: 'Tekirdağ (Şarköy)', region: 'Marmara' }
  ];

  modal.innerHTML = `
    <div class="char-creator-box space-y-3.5">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <div>
          <div class="text-[9px] font-extrabold text-sky-400 uppercase">SLOT #${creationState.slotNum} • KARAKTER STÜDYOSU</div>
          <div class="text-base font-black text-white">Yeni Karakter Oluştur</div>
        </div>
        <button onclick="document.getElementById('charCreatorModalRoot').classList.add('hidden')" class="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold">Geri ✕</button>
      </div>

      <div class="flex flex-col items-center gap-1.5">
        <div class="creator-preview-frame">
          <img src="${previewSvgUrl}" class="w-full h-full object-cover" />
        </div>
        <div class="text-xs font-extrabold text-amber-300">${creationState.firstName} ${creationState.lastName} • ${creationState.birthCity}</div>
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>
          <label class="text-[10px] text-slate-400 block mb-1">Adın</label>
          <input type="text" id="creatorInputName" value="${creationState.firstName}" oninput="creationState.firstName=this.value" class="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"/>
        </div>
        <div>
          <label class="text-[10px] text-slate-400 block mb-1">Soyadın</label>
          <input type="text" id="creatorInputSurname" value="${creationState.lastName}" oninput="creationState.lastName=this.value" class="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"/>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>
          <label class="text-[10px] text-slate-400 block mb-1">Cinsiyet</label>
          <select onchange="creationState.gender=this.value; renderCharacterCreatorContent();" class="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold">
            <option value="Erkek" ${creationState.gender === 'Erkek' ? 'selected' : ''}>Erkek</option>
            <option value="Kadın" ${creationState.gender === 'Kadın' ? 'selected' : ''}>Kadın</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] text-slate-400 block mb-1">Memleket</label>
          <select onchange="creationState.birthCity=this.value; renderCharacterCreatorContent();" class="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold">
            ${cities.map(ct => `<option value="${ct.name}" ${creationState.birthCity === ct.name ? 'selected' : ''}>${ct.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="space-y-2 text-[10px]">
        <div>
          <span class="text-slate-400 block mb-1">Saç Modeli</span>
          <div class="grid grid-cols-3 gap-1.5">
            ${(typeof CHAR_HAIR_STYLES_DB !== 'undefined' ? CHAR_HAIR_STYLES_DB : []).map(hs => `
              <button type="button" onclick="creationState.hairStyleId='${hs.id}'; renderCharacterCreatorContent();" class="p-1.5 rounded-lg border text-center font-bold truncate ${creationState.hairStyleId === hs.id ? 'border-sky-400 bg-sky-500/20 text-white' : 'border-slate-800 bg-slate-950 text-slate-400'}">
                ${hs.name.replace(/^[^\s]+\s/, '')}
              </button>
            `).join('')}
          </div>
        </div>

        <div>
          <span class="text-slate-400 block mb-1">Saç Rengi</span>
          <div class="flex gap-2 items-center">
            ${(typeof CHAR_HAIR_COLORS_DB !== 'undefined' ? CHAR_HAIR_COLORS_DB : []).map(hc => `
              <button type="button" onclick="creationState.hairColorId='${hc.id}'; renderCharacterCreatorContent();" class="w-7 h-7 rounded-full border-2 ${creationState.hairColorId === hc.id ? 'border-white scale-110' : 'border-slate-700'}" style="background:${hc.hex}"></button>
            `).join('')}
          </div>
        </div>
      </div>

      <button type="button" onclick="finalizeAndStartNewLife()" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 text-sm font-black shadow-lg cursor-pointer">
        🚀 BU KARAKTERLE HAYATA BAŞLA!
      </button>
    </div>
  `;
};

/* ============================================================================
   4. FİNANS VE MENÜDEKİ ÇİFT ÖZELLİKLERİ BİRLEŞTİRME (TEKİLLEŞTİRME MOTORU)
   ============================================================================ */

// Finans sekmesindeki 2. Vadeli Mevduatı kaldırıp Altın/Döviz ve Kredi Kartını tek kutuda birleştirir
window.renderGoldFxAndDepositPanelHTML = function () {
  if (typeof ensureSixRealismState === 'function') ensureSixRealismState();
  const c = getCountry();
  const fg = G.fxGold;

  // Eğer önceki yamada fg.termDeposit içinde para kaldıysa ana banka mevduatına (G.bankSavings / G.savings) aktar
  if (fg.termDeposit && fg.termDeposit > 0) {
    if (typeof G.bankSavings === 'number') G.bankSavings += fg.termDeposit;
    else if (typeof G.savings === 'number') G.savings += fg.termDeposit;
    else G.money += fg.termDeposit;
    fg.termDeposit = 0;
  }

  const goldUnitPrice = Math.round(c.monthlyMinWage * fg.goldPriceMult);
  const fxPackPrice = Math.round(c.monthlyMinWage * 0.5);
  const goldTotalVal = fg.gramGold * goldUnitPrice;
  const fxTotalVal = fg.usdBalance * fxPackPrice;
  const ccMax = Math.round(c.monthlyMinWage * fg.ccLimitMult);

  return `
    <div id="unifiedGoldFxAndCardBox" class="fx-gold-card space-y-2.5 mb-3">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-[9px] font-extrabold text-amber-400 uppercase tracking-widest">🪙 KAPALIÇARŞI ALTIN, DÖVİZ &amp; KREDİ KARTI MERKEZİ</div>
          <div class="text-xs font-extrabold text-white">Fiziki Altın, Döviz Sepeti &amp; Findeks Ekstre</div>
        </div>
        <span class="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-mono-num font-bold">24 Ayar Has</span>
      </div>

      <div class="grid grid-cols-2 gap-2 text-center text-[10px]">
        <div class="p-2 rounded-xl bg-slate-950 border border-slate-800">
          <div class="text-[8.5px] text-amber-400 font-bold">GRAM ALTIN (24K)</div>
          <div class="font-extrabold font-mono-num text-white text-xs">${fg.gramGold} Gram</div>
          <div class="text-[9.5px] text-emerald-400">${fmtMoney(goldTotalVal)}</div>
        </div>
        <div class="p-2 rounded-xl bg-slate-950 border border-slate-800">
          <div class="text-[8.5px] text-sky-400 font-bold">DÖVİZ SEPETİ ($/€)</div>
          <div class="font-extrabold font-mono-num text-white text-xs">${fg.usdBalance} Lot</div>
          <div class="text-[9.5px] text-emerald-400">${fmtMoney(fxTotalVal)}</div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-1.5 text-[10px] font-extrabold">
        <button onclick="tradeGoldOrFx('buy_gold', ${goldUnitPrice * 5})" class="py-2 rounded-xl bg-amber-400 text-slate-950">+5 Gr Altın (${fmtMoney(goldUnitPrice * 5)})</button>
        <button onclick="tradeGoldOrFx('buy_fx', ${fxPackPrice * 2})" class="py-2 rounded-xl bg-sky-500 text-slate-950">+Döviz Al (${fmtMoney(fxPackPrice * 2)})</button>
        <button onclick="tradeGoldOrFx('liquidate_all', 0)" class="py-2 rounded-xl bg-emerald-500 text-slate-950">Nakite Bozdur</button>
      </div>

      <div class="pt-2 border-t border-slate-800/80 space-y-1.5">
        <div class="flex items-center justify-between text-[11px]">
          <span class="font-extrabold text-white">💳 Kredi Kartı Borcu: <strong class="text-rose-400 font-mono-num">${fmtMoney(fg.ccStatementDebt)}</strong></span>
          <span class="text-[10px] text-slate-400">Limit: ${fmtMoney(ccMax)}</span>
        </div>
        <div class="grid grid-cols-3 gap-1.5 text-[9.5px] font-extrabold">
          <button onclick="manageCreditCard('spend', ${Math.round(c.monthlyMinWage * 0.8)})" class="py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">Nakit Avans Çek</button>
          <button onclick="manageCreditCard('pay_min', 0)" class="py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300">Asgari Öde (%20)</button>
          <button onclick="manageCreditCard('pay_full', 0)" class="py-1.5 rounded-lg bg-emerald-500 text-slate-950">Tamamını Kapat</button>
        </div>
      </div>
    </div>
  `;
};

function deduplicateAndCleanUI() {
  const body = document.getElementById('sheetBody');
  if (!body) return;

  // 1. Finans sekmesinde birden fazla Altın/Mevduat veya Market kutusu oluştuysa fazlalıkları sil
  const goldBoxes = body.querySelectorAll('.fx-gold-card');
  if (goldBoxes.length > 1) {
    for (let i = 1; i < goldBoxes.length; i++) goldBoxes[i].remove();
  }
  const marketBoxes = body.querySelectorAll('#householdMarketHub');
  if (marketBoxes.length > 1) {
    for (let i = 1; i < marketBoxes.length; i++) marketBoxes[i].remove();
  }

  // 2. Menüde 2 tane Kumarhane (Casino) butonu varsa eski küçük olanı sil, sadece tek VIP Casino kalsın!
  const allMenuBtns = body.querySelectorAll('button');
  allMenuBtns.forEach(btn => {
    const oc = btn.getAttribute('onclick') || '';
    if (btn.id !== 'menuVipCasinoBtn' && (oc.includes("'casino'") || oc.includes("'gambling'"))) {
      btn.remove();
    }
  });
}

/* ============================================================================
   5. GERÇEK 1:1 PRAGMATIC PLAY SWEET BONANZA 1000 & GATES OF OLYMPUS 1000
      (3B ÖZEL SVG ŞEKERLER, TUMBLE PATLAMA ZİNCİRİ VE MANUEL BAHİS GİRİŞİ)
   ============================================================================ */

// Gerçek 3B Vektörel Sweet Bonanza & Gates of Olympus Sembol Çizicisi (Emoji Değil, Gerçek Grafik!)
function getPragmaticSymbolSVG(sym) {
  if (!sym) return '';

  // Çarpan Bombası (Sweet Bonanza Gökkuşağı Bombası) & Zeus Küresi
  if (sym.isMultiplier) {
    const mv = sym.multValue || 10;
    if (casinoUI.gameTab === 'bonanza') {
      return `<svg viewBox="0 0 64 64" class="w-full h-full drop-shadow">
        <defs>
          <radialGradient id="bombGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#fde047"/>
            <stop offset="35%" stop-color="#ec4899"/>
            <stop offset="70%" stop-color="#8b5cf6"/>
            <stop offset="100%" stop-color="#1d4ed8"/>
          </radialGradient>
        </defs>
        <path d="M32,12 Q42,4 48,10" fill="none" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="49" cy="10" r="4.5" fill="#fde047"/>
        <circle cx="32" cy="36" r="22" fill="url(#bombGrad)" stroke="#ffffff" stroke-width="2.5"/>
        <ellipse cx="24" cy="26" rx="6" ry="3.5" transform="rotate(-25 24 26)" fill="rgba(255,255,255,0.65)"/>
        <rect x="8" y="26" width="48" height="19" rx="6" fill="rgba(9,13,22,0.82)" stroke="#fde047" stroke-width="1.5"/>
        <text x="32" y="40" text-anchor="middle" fill="#fde047" font-family="JetBrains Mono, monospace" font-weight="900" font-size="15">${mv}x</text>
      </svg>`;
    } else {
      const orbColor = mv >= 50 ? '#ef4444' : (mv >= 15 ? '#a855f7' : (mv >= 8 ? '#3b82f6' : '#22c55e'));
      return `<svg viewBox="0 0 64 64" class="w-full h-full drop-shadow">
        <path d="M4,32 Q14,18 20,28 L20,38 Q12,42 4,32 Z" fill="#facc15"/>
        <path d="M60,32 Q50,18 44,28 L44,38 Q52,42 60,32 Z" fill="#facc15"/>
        <circle cx="32" cy="32" r="20" fill="${orbColor}" stroke="#fde047" stroke-width="3"/>
        <circle cx="25" cy="24" r="5" fill="rgba(255,255,255,0.6)"/>
        <text x="32" y="37" text-anchor="middle" fill="#ffffff" font-family="JetBrains Mono, monospace" font-weight="900" font-size="14" stroke="#090d16" stroke-width="0.8">${mv}x</text>
      </svg>`;
    }
  }

  // SWEET BONANZA ÖZEL 3B ŞEKER & MEYVE GRAFİKLERİ
  const id = sym.id;
  if (id === 'lollipop') {
    return `<svg viewBox="0 0 64 64" class="w-full h-full">
      <rect x="29" y="36" width="6" height="24" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <circle cx="32" cy="24" r="19" fill="#ec4899" stroke="#ffffff" stroke-width="3"/>
      <path d="M32,24 m0,-13 a13,13 0 1,1 -9,22 a9,9 0 1,1 13,-13 a5,5 0 1,1 -6,6" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
      <text x="32" y="59" text-anchor="middle" fill="#be185d" font-size="8.5" font-weight="900">SCATTER</text>
    </svg>`;
  }
  if (id === 'heart_candy') {
    return `<svg viewBox="0 0 64 64" class="w-full h-full">
      <path d="M32,54 C32,54 10,38 10,22 C10,13 18,8 25,8 C29,8 32,11 32,15 C32,11 35,8 39,8 C46,8 54,13 54,22 C54,38 32,54 32,54 Z" fill="#e11d48" stroke="#fecdd3" stroke-width="2.5"/>
      <path d="M17,20 C17,15 21,13 25,13" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
    </svg>`;
  }
  if (id === 'purple_candy') {
    return `<svg viewBox="0 0 64 64" class="w-full h-full">
      <rect x="12" y="12" width="40" height="40" rx="8" fill="#7e22ce" stroke="#e9d5ff" stroke-width="2.5"/>
      <rect x="19" y="19" width="26" height="26" rx="4" fill="#9333ea" stroke="#c084fc" stroke-width="1.5"/>
      <line x1="16" y1="16" x2="26" y2="16" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
  }
  if (id === 'green_candy') {
    return `<svg viewBox="0 0 64 64" class="w-full h-full">
      <polygon points="32,8 55,25 46,53 18,53 9,25" fill="#15803d" stroke="#bbf7d0" stroke-width="2.5"/>
      <polygon points="32,16 46,27 40,45 24,45 18,27" fill="#22c55e"/>
    </svg>`;
  }
  if (id === 'blue_candy') {
    return `<svg viewBox="0 0 64 64" class="w-full h-full">
      <ellipse cx="32" cy="32" rx="22" ry="15" transform="rotate(-20 32 32)" fill="#0284c7" stroke="#bae6fd" stroke-width="2.5"/>
      <ellipse cx="27" cy="27" rx="10" ry="4.5" transform="rotate(-20 27 27)" fill="rgba(255,255,255,0.65)"/>
    </svg>`;
  }
  if (id === 'apple') {
    return `<svg viewBox="0 0 64 64" class="w-full h-full">
      <path d="M32,16 Q38,8 44,12 Q39,18 32,16 Z" fill="#16a34a"/>
      <circle cx="32" cy="36" r="18" fill="#dc2626" stroke="#fca5a5" stroke-width="1.5"/>
      <ellipse cx="25" cy="29" rx="4" ry="7" transform="rotate(-20 25 29)" fill="rgba(255,255,255,0.55)"/>
    </svg>`;
  }
  if (id === 'peach') {
    return `<svg viewBox="0 0 64 64" class="w-full h-full">
      <circle cx="32" cy="35" r="18" fill="#f97316" stroke="#fed7aa" stroke-width="1.5"/>
      <path d="M32,17 C24,25 24,42 32,53" fill="none" stroke="#ea580c" stroke-width="2.5"/>
      <circle cx="24" cy="28" r="4" fill="rgba(255,255,255,0.5)"/>
    </svg>`;
  }
  if (id === 'watermelon') {
    return `<svg viewBox="0 0 64 64" class="w-full h-full">
      <path d="M10,24 A22,22 0 0,0 54,24 Z" fill="#15803d"/>
      <path d="M14,24 A18,18 0 0,0 50,24 Z" fill="#ef4444"/>
      <circle cx="26" cy="31" r="1.8" fill="#090d16"/><circle cx="32" cy="35" r="1.8" fill="#090d16"/><circle cx="38" cy="31" r="1.8" fill="#090d16"/>
    </svg>`;
  }
  if (id === 'grapes') {
    return `<svg viewBox="0 0 64 64" class="w-full h-full">
      <circle cx="24" cy="24" r="7" fill="#6d28d9"/><circle cx="36" cy="24" r="7" fill="#7c3aed"/><circle cx="44" cy="26" r="6" fill="#5b21b6"/>
      <circle cx="20" cy="34" r="7" fill="#7c3aed"/><circle cx="31" cy="34" r="7.5" fill="#8b5cf6"/><circle cx="41" cy="35" r="7" fill="#6d28d9"/>
      <circle cx="26" cy="44" r="7" fill="#6d28d9"/><circle cx="36" cy="44" r="7" fill="#7c3aed"/><circle cx="31" cy="52" r="6.5" fill="#5b21b6"/>
    </svg>`;
  }
  if (id === 'banana') {
    return `<svg viewBox="0 0 64 64" class="w-full h-full">
      <path d="M16,44 Q36,48 48,18 Q52,36 34,50 Q20,56 16,44 Z" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
    </svg>`;
  }

  // GATES OF OLYMPUS ÖZEL 3B SEMBOL GRAFİKLERİ
  if (id === 'zeus_scatter') {
    return `<svg viewBox="0 0 64 64" class="w-full h-full">
      <circle cx="32" cy="32" r="24" fill="#1e3a8a" stroke="#facc15" stroke-width="3"/>
      <polygon points="36,8 18,34 31,34 26,56 46,28 33,28" fill="#fde047" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="32" y="58" text-anchor="middle" fill="#ffffff" font-size="8.5" font-weight="900">ZEUS</text>
    </svg>`;
  }
  if (id === 'crown') {
    return `<svg viewBox="0 0 64 64" class="w-full h-full">
      <polygon points="10,46 14,20 26,32 32,14 38,32 50,20 54,46" fill="#facc15" stroke="#b45309" stroke-width="2.5"/>
      <rect x="10" y="46" width="44" height="7" rx="2" fill="#eab308"/>
      <circle cx="32" cy="38" r="4" fill="#e11d48"/><circle cx="20" cy="39" r="3" fill="#0284c7"/><circle cx="44" cy="39" r="3" fill="#0284c7"/>
    </svg>`;
  }
  if (id === 'hourglass') {
    return `<svg viewBox="0 0 64 64" class="w-full h-full">
      <rect x="16" y="10" width="32" height="5" rx="2" fill="#facc15"/>
      <rect x="16" y="49" width="32" height="5" rx="2" fill="#facc15"/>
      <polygon points="20,15 44,15 32,32 44,49 20,49 32,32" fill="#38bdf8" stroke="#eab308" stroke-width="2.5"/>
    </svg>`;
  }
  if (id === 'ring') {
    return `<svg viewBox="0 0 64 64" class="w-full h-full">
      <circle cx="32" cy="36" r="15" fill="none" stroke="#facc15" stroke-width="6"/>
      <polygon points="24,18 32,10 40,18 36,24 28,24" fill="#e11d48" stroke="#fecdd3" stroke-width="1.5"/>
    </svg>`;
  }
  if (id === 'chalice') {
    return `<svg viewBox="0 0 64 64" class="w-full h-full">
      <path d="M18,14 L46,14 C46,32 38,36 32,36 C26,36 18,32 18,14 Z" fill="#facc15" stroke="#b45309" stroke-width="2"/>
      <rect x="29" y="36" width="6" height="12" fill="#eab308"/>
      <rect x="20" y="48" width="24" height="5" rx="2" fill="#facc15"/>
    </svg>`;
  }

  // Mücevherler (Gems)
  const gemColors = {
    gem_red: ['#e11d48', '#fda4af'],
    gem_purple: ['#9333ea', '#d8b4fe'],
    gem_yellow: ['#eab308', '#fef08a'],
    gem_green: ['#16a34a', '#86efac'],
    gem_blue: ['#0284c7', '#7dd3fc']
  };
  const gc = gemColors[id] || ['#38bdf8', '#bae6fd'];
  return `<svg viewBox="0 0 64 64" class="w-full h-full">
    <polygon points="32,10 52,24 44,52 20,52 12,24" fill="${gc[0]}" stroke="${gc[1]}" stroke-width="2.5"/>
    <polygon points="32,18 43,27 38,44 26,44 21,27" fill="${gc[1]}" opacity="0.45"/>
  </svg>`;
}

// Manuel Bahis Tutarını Okuma ve Güncelleme
function getExactCasinoBet() {
  const c = getCountry();
  if (typeof casinoUI.customBetAmount !== 'number' || casinoUI.customBetAmount < 10) {
    casinoUI.customBetAmount = Math.max(500, Math.round(c.monthlyMinWage * 0.10));
  }
  return casinoUI.doubleChance ? Math.round(casinoUI.customBetAmount * 1.25) : casinoUI.customBetAmount;
}

window.setManualCasinoBet = function (val) {
  const parsed = Math.max(10, Math.round(Number(val) || 100));
  casinoUI.customBetAmount = parsed;
};

window.adjustManualCasinoBet = function (mode) {
  const cur = casinoUI.customBetAmount || 1000;
  if (mode === 'half') casinoUI.customBetAmount = Math.max(50, Math.round(cur / 2));
  else if (mode === 'double') casinoUI.customBetAmount = Math.min(Math.max(1000, G.money), cur * 2);
  else if (mode === 'max') casinoUI.customBetAmount = Math.max(100, G.money);
  else if (mode === 'plus') casinoUI.customBetAmount = cur + 1000;
  else if (mode === 'minus') casinoUI.customBetAmount = Math.max(50, cur - 1000);
  renderVIPCasinoModal();
};

// GERÇEK TUMBLE (PATLAMA VE YUKARIDAN YENİ ŞEKER DÜŞME) MOTORU
let _tumbleBusy = false;

window.spinPragmaticSlot = function (isBonusBuy = false) {
  if (!G || _tumbleBusy) return;

  const inpEl = document.getElementById('customCasinoBetInput');
  if (inpEl && Number(inpEl.value) >= 10) {
    casinoUI.customBetAmount = Math.round(Number(inpEl.value));
  }

  const baseBet = casinoUI.customBetAmount || 1000;
  const actualBet = getExactCasinoBet();

  if (isBonusBuy) {
    if (casinoUI.freeSpinsLeft > 0) {
      showToast('Zaten Free Spin turundasın!');
      return;
    }
    const buyCost = baseBet * 100;
    if (G.money < buyCost) {
      showToast(`100x Bonus Satın Almak için ${fmtMoney(buyCost)} nakit gerekiyor!`);
      return;
    }
    G.money -= buyCost;
    casinoUI.freeSpinsLeft = casinoUI.gameTab === 'olympus' ? 15 : 10;
    casinoUI.fsTotalMultiplier = 0;
    casinoUI.fsCumulativeWin = 0;
    playCasinoAudio('zeus');
  } else if (casinoUI.freeSpinsLeft <= 0) {
    if (G.money < actualBet) {
      showToast(`Bahis (${fmtMoney(actualBet)}) için nakit bakiyen yetersiz!`);
      return;
    }
    G.money -= actualBet;
  } else {
    casinoUI.freeSpinsLeft -= 1;
  }

  playCasinoAudio('spin');
  const inFs = casinoUI.freeSpinsLeft > 0 || isBonusBuy;
  const db = casinoUI.gameTab === 'olympus' ? OLYMPUS_SYMBOLS_DB : BONANZA_SYMBOLS_DB;

  // İlk 30 sembolü düşür
  const grid = [];
  for (let i = 0; i < 30; i++) {
    if (isBonusBuy && i < 4) {
      grid.push({ ...db[0], isWinning: true });
    } else {
      grid.push({ ...pickWeightedSlotSymbol(db, inFs), isWinning: false });
    }
  }

  casinoUI.grid = grid;
  casinoUI.roundRawWin = 0;
  casinoUI.tumbleCount = 0;

  if (isBonusBuy) {
    casinoUI.lastWinLog = `🍭 4 SCATTER DÜŞTÜ! ${casinoUI.freeSpinsLeft} FREE SPIN BAŞLADI — SPIN'E BAS!`;
    saveGame(); renderAll(); renderVIPCasinoModal();
    return;
  }

  evaluateAndRunTumbleStep(baseBet, inFs, db);
};

function evaluateAndRunTumbleStep(baseBet, inFs, db) {
  const counts = {};
  let scatterCount = 0;

  casinoUI.grid.forEach(cell => {
    cell.isWinning = false;
    if (cell.isScatter) scatterCount++;
    else if (!cell.isMultiplier) counts[cell.id] = (counts[cell.id] || 0) + 1;
  });

  let stepWin = 0;
  const matchedLabels = [];

  Object.keys(counts).forEach(symId => {
    const cnt = counts[symId];
    if (cnt >= 8) {
      const sInfo = db.find(x => x.id === symId);
      if (sInfo) {
        let multPay = sInfo.pay8;
        if (cnt >= 12) multPay = sInfo.pay12;
        else if (cnt >= 10) multPay = sInfo.pay10;
        const w = Math.round(baseBet * multPay);
        stepWin += w;
        matchedLabels.push(`${cnt}x ${sInfo.name}`);
        casinoUI.grid.forEach(c => { if (c.id === symId) c.isWinning = true; });
      }
    }
  });

  // Eğer 8+ eşleşme varsa: Sembolleri patlat ve yukarıdan yenilerini düşür (Gerçek Tumble!)
  if (stepWin > 0) {
    _tumbleBusy = true;
    casinoUI.tumbleCount += 1;
    casinoUI.roundRawWin += stepWin;
    casinoUI.lastWinAmt = casinoUI.roundRawWin;
    casinoUI.lastWinLog = `💥 TUMBLE #${casinoUI.tumbleCount}: +${fmtMoney(stepWin)} (${matchedLabels.join(' + ')}) — Patlıyor...`;
    playCasinoAudio('zeus');
    renderVIPCasinoModal();

    setTimeout(() => {
      // Patlayanları kaldır, kalanları aşağı kaydır ve üstten yeni sembol düşür
      for (let col = 0; col < 6; col++) {
        const survivors = [];
        for (let row = 4; row >= 0; row--) {
          const cell = casinoUI.grid[row * 6 + col];
          if (!cell.isWinning) survivors.unshift(cell);
        }
        while (survivors.length < 5) {
          survivors.unshift({ ...pickWeightedSlotSymbol(db, inFs), isWinning: false });
        }
        for (let row = 0; row < 5; row++) {
          casinoUI.grid[row * 6 + col] = survivors[row];
        }
      }
      _tumbleBusy = false;
      evaluateAndRunTumbleStep(baseBet, inFs, db);
    }, 520);
    return;
  }

  // Tumble zinciri bitti! Şimdi ekrandaki Çarpan Bombalarını / Zeus Kürelerini Topla ve Çarp!
  let bombSum = 0;
  casinoUI.grid.forEach(c => {
    if (c.isMultiplier) bombSum += (c.multValue || 0);
  });

  if (scatterCount >= 4) {
    const addFs = inFs ? 5 : (casinoUI.gameTab === 'olympus' ? 15 : 10);
    casinoUI.freeSpinsLeft += addFs;
    casinoUI.roundRawWin += baseBet * 3;
  }

  let finalSpinPayout = casinoUI.roundRawWin;
  if (finalSpinPayout > 0 && bombSum > 0) {
    if (casinoUI.gameTab === 'olympus' && inFs) {
      casinoUI.fsTotalMultiplier += bombSum;
      finalSpinPayout = Math.round(finalSpinPayout * casinoUI.fsTotalMultiplier);
    } else {
      finalSpinPayout = Math.round(finalSpinPayout * bombSum);
    }
    playCasinoAudio('bigwin');
  }

  casinoUI.lastWinAmt = finalSpinPayout;
  if (finalSpinPayout > 0) {
    G.money += finalSpinPayout;
    if (inFs) casinoUI.fsCumulativeWin += finalSpinPayout;
    casinoUI.lastWinLog = bombSum > 0
      ? `💣 SÜPER KAZANÇ: ${fmtMoney(casinoUI.roundRawWin)} x ${bombSum}x BOMBA = +${fmtMoney(finalSpinPayout)}!`
      : `🎉 TOPLAM TUR KAZANCI: +${fmtMoney(finalSpinPayout)} (${casinoUI.tumbleCount} Tumble)`;
  } else {
    casinoUI.lastWinLog = `Eşleşme yok (En az 8 aynı şeker/sembol gerekli). Tekrar çevir!`;
  }

  saveGame();
  renderAll();
  renderVIPCasinoModal();
}

// GERÇEK PRAGMATIC PLAY ARAYÜZ ÇİZİCİSİ (MANUEL BAHİS KUTULU)
window.renderVIPCasinoModal = function () {
  const sheet = document.getElementById('bottomSheet');
  if (!sheet || !G) return;
  sheet.classList.remove('hidden');

  document.getElementById('sheetTitle').textContent = '🎰 Pragmatic Play VIP Casino & 21';
  document.getElementById('sheetSubtitle').textContent = `Bakiye: ${fmtMoney(G.money)} • Sweet Bonanza 1000 • Gates of Olympus 1000`;

  const rawBet = casinoUI.customBetAmount || Math.max(500, Math.round(getCountry().monthlyMinWage * 0.10));
  casinoUI.customBetAmount = rawBet;
  const actualBet = getExactCasinoBet();
  const bonusBuyCost = rawBet * 100;

  const topTabs = `
    <div class="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-amber-400/40 mb-2.5 text-[10.5px] font-black">
      <button onclick="casinoUI.freeSpinsLeft=0; casinoUI.grid=[]; openVIPCasinoModal('bonanza')" class="py-2 rounded-xl ${casinoUI.gameTab === 'bonanza' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow' : 'text-slate-300'}">🍭 Sweet Bonanza</button>
      <button onclick="casinoUI.freeSpinsLeft=0; casinoUI.grid=[]; openVIPCasinoModal('olympus')" class="py-2 rounded-xl ${casinoUI.gameTab === 'olympus' ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow' : 'text-slate-300'}">⚡ Gates of Olympus</button>
      <button onclick="openVIPCasinoModal('blackjack')" class="py-2 rounded-xl ${casinoUI.gameTab === 'blackjack' ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow' : 'text-slate-300'}">🃏 Live Blackjack 21</button>
    </div>
  `;

  // Manuel Para / Bahis Yazma Kutusu
  const manualBetPanel = `
    <div class="pragmatic-bottom-hud mb-2.5 space-y-2">
      <div class="flex items-center justify-between gap-2">
        <div class="text-[10px]">
          <span class="text-slate-400 block font-bold">KASA BAKİYESİ (CREDIT)</span>
          <strong class="text-emerald-400 font-mono-num text-sm">${fmtMoney(G.money)}</strong>
        </div>
        <div class="flex-1 max-w-[175px]">
          <label class="text-[9px] text-amber-300 font-extrabold block text-center mb-0.5">✍️ BAHİS TUTARINI YAZ (₺)</label>
          <input id="customCasinoBetInput" type="number" min="10" step="500" value="${rawBet}"
            oninput="setManualCasinoBet(this.value)"
            onchange="renderVIPCasinoModal()"
            class="bet-manual-input" />
        </div>
      </div>

      <div class="grid grid-cols-5 gap-1 text-[10px] font-black">
        <button onclick="adjustManualCasinoBet('minus')" class="py-1.5 rounded-lg bg-slate-800 text-white">-1.000</button>
        <button onclick="adjustManualCasinoBet('half')" class="py-1.5 rounded-lg bg-slate-800 text-amber-300">1/2</button>
        <button onclick="adjustManualCasinoBet('double')" class="py-1.5 rounded-lg bg-slate-800 text-emerald-300">2X</button>
        <button onclick="adjustManualCasinoBet('plus')" class="py-1.5 rounded-lg bg-slate-800 text-white">+1.000</button>
        <button onclick="adjustManualCasinoBet('max')" class="py-1.5 rounded-lg bg-amber-400 text-slate-950">MAX BAS</button>
      </div>
    </div>
  `;

  if (casinoUI.gameTab === 'bonanza' || casinoUI.gameTab === 'olympus') {
    const isBonanza = casinoUI.gameTab === 'bonanza';
    const cabCls = isBonanza ? 'sb1000-cabinet' : 'go1000-cabinet';
    const reelCls = isBonanza ? 'sb1000-reel-frame' : 'go1000-reel-frame';
    const cellCls = isBonanza ? 'sb1000-cell' : 'go1000-cell';

    document.getElementById('sheetBody').innerHTML = `
      ${topTabs}
      ${manualBetPanel}

      <div class="${cabCls} space-y-2.5">
        <!-- Üst Pragmatic Play Kırmızı/Altın Tumble Banner -->
        <div class="pragmatic-top-banner flex items-center justify-between">
          <span>${isBonanza ? '🍭 SWEET BONANZA 1000™' : '⚡ GATES OF OLYMPUS 1000™'}</span>
          <span class="font-mono-num text-fde047">
            ${casinoUI.freeSpinsLeft > 0 ? `FREE SPINS: ${casinoUI.freeSpinsLeft}` : '8+ EŞLEŞME = TUMBLE'}
          </span>
        </div>

        <!-- 6x5 Gerçek Pragmatic Play Makara Izgarası (3B Vektörel Semboller) -->
        <div class="${reelCls}">
          ${casinoUI.grid.map((cell, idx) => `
            <div class="${cellCls} ${cell.isWinning ? 'cell-tumble-win' : ''}" style="animation-delay:${(idx % 6) * 0.025}s">
              ${getPragmaticSymbolSVG(cell)}
            </div>
          `).join('')}
        </div>

        <!-- Orta Kazanç & Tumble Duyuru Kutusu -->
        <div class="p-2 rounded-xl bg-slate-950/90 border-2 ${casinoUI.lastWinAmt > 0 ? 'border-fde047' : 'border-white/20'} text-center">
          <div class="text-xs font-black ${casinoUI.lastWinAmt > 0 ? 'text-amber-300' : 'text-white'}">
            ${casinoUI.lastWinLog}
          </div>
          ${casinoUI.fsCumulativeWin > 0 ? `<div class="text-[10px] font-mono-num text-emerald-400 font-black">TOPLAM FREE SPIN KAZANCI: +${fmtMoney(casinoUI.fsCumulativeWin)}</div>` : ''}
        </div>

        <!-- Alt Pragmatic Play Spin, Bonus Buy (100x) ve Ante Bet Barı -->
        <div class="flex items-center justify-between gap-2 pt-1">
          <button onclick="spinPragmaticSlot(true)" class="flex-1 py-2.5 px-2.5 rounded-2xl bg-gradient-to-b from-pink-500 via-rose-600 to-red-700 border-2 border-fde047 text-white text-left shadow-lg">
            <div class="text-[9px] font-black uppercase text-amber-200">🍭 SATIN AL: FREE SPINS (100x)</div>
            <div class="text-xs font-mono-num font-black">${fmtMoney(bonusBuyCost)}</div>
          </button>

          <button onclick="spinPragmaticSlot(false)" class="pragmatic-spin-btn" title="Çevir (Spin)">
            ↻
          </button>

          <button onclick="casinoUI.doubleChance=!casinoUI.doubleChance; renderVIPCasinoModal()" class="flex-1 py-2.5 px-2.5 rounded-2xl border-2 ${casinoUI.doubleChance ? 'bg-emerald-600 border-fde047 text-white' : 'bg-slate-900/90 border-white/25 text-slate-300'} text-right shadow-lg">
            <div class="text-[9px] font-black uppercase">ANTE BET (2X ŞANS)</div>
            <div class="text-xs font-black">${casinoUI.doubleChance ? 'AÇIK ✓' : 'KAPALI'}</div>
          </button>
        </div>
      </div>
    `;
    return;
  }

  // Blackjack Görünümü İçin Mevcut Blackjack Çizicisini Çalıştır (Manuel Bahisle Senkron)
  casinoUI.bjCurrentBet = actualBet;
  const pScore = calcBlackjackHandTotal(casinoUI.bjPlayer);
  const dScore = casinoUI.bjState === 'playing'
    ? (casinoUI.bjDealer[0] ? casinoUI.bjDealer[0].val : 0)
    : calcBlackjackHandTotal(casinoUI.bjDealer);

  document.getElementById('sheetBody').innerHTML = `
    ${topTabs}
    ${manualBetPanel}
    <div class="bj-table-felt space-y-4">
      <div class="flex items-center justify-between border-b border-emerald-400/25 pb-2">
        <span class="text-xs font-black text-white">🃏 VIP LIVE BLACKJACK 21</span>
        <span class="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-mono-num text-[10px] font-black">Bahis: ${fmtMoney(actualBet)}</span>
      </div>

      <div class="space-y-1.5 text-center">
        <div class="text-[10px] font-extrabold text-emerald-200">🤵‍♂️ KRUPİYE (${casinoUI.bjDealer.length > 0 ? (casinoUI.bjState === 'playing' ? dScore + ' + ?' : dScore) : 0})</div>
        <div class="flex items-center justify-center gap-2 min-h-[76px]">
          ${casinoUI.bjDealer.map((card, idx) => idx === 1 && casinoUI.bjState === 'playing'
            ? `<div class="playing-card-hd playing-card-back">👑</div>`
            : `<div class="playing-card-hd ${card.color}"><div class="text-xs">${card.rank}</div><div class="text-center text-lg">${card.suit}</div><div class="text-xs text-right">${card.rank}</div></div>`
          ).join('')}
        </div>
      </div>

      <div class="p-2 rounded-xl bg-slate-950/85 border border-amber-400/40 text-center text-xs font-extrabold text-amber-300">
        ${casinoUI.bjResultText}
      </div>

      <div class="space-y-1.5 text-center">
        <div class="text-[10px] font-extrabold text-white">👤 SENİN ELİN (${pScore})</div>
        <div class="flex items-center justify-center gap-2 min-h-[76px]">
          ${casinoUI.bjPlayer.map(card => `<div class="playing-card-hd ${card.color}"><div class="text-xs">${card.rank}</div><div class="text-center text-lg">${card.suit}</div><div class="text-xs text-right">${card.rank}</div></div>`).join('')}
        </div>
      </div>

      ${casinoUI.bjState === 'playing' ? `
        <div class="grid grid-cols-3 gap-2">
          <button onclick="blackjackPlayerAction('hit')" class="py-3 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black">🃏 KART ÇEK</button>
          <button onclick="blackjackPlayerAction('stand')" class="py-3 rounded-xl bg-amber-400 text-slate-950 text-xs font-black">✋ KAL</button>
          <button onclick="blackjackPlayerAction('double')" class="py-3 rounded-xl bg-sky-500 text-slate-950 text-xs font-black">⚡ 2X KATLA</button>
        </div>
      ` : `
        <button onclick="casinoUI.betMult = (casinoUI.customBetAmount / getCountry().monthlyMinWage); startBlackjackHand()" class="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-black shadow-lg">
          🃏 ELLERİ DAĞIT (${fmtMoney(actualBet)})
        </button>
      `}
    </div>
  `;
};

// 6. TÜM MENÜ VE FİNANS AÇILIŞLARINDA ÇİFT ÖZELLİKLERİ OTOMATİK TEMİZLE
(function attachMasterDeduplicationHook() {
  const _prevOpenNav = openNavSheet;
  window.openNavSheet = openNavSheet = function (tab) {
    _prevOpenNav(tab);
    deduplicateAndCleanUI();
  };

  const _prevOpenMenu = openMenuSection;
  window.openMenuSection = openMenuSection = function (sec) {
    _prevOpenMenu(sec);
    deduplicateAndCleanUI();
  };
})();

/* ============================================================================
   TEK PARÇA TAMAMLANMIŞ GAME.JS PAKETİ (SADECE GAME.JS EN ALTINA YAPIŞTIR)
   - Başlangıç & 3'lü Kayıt Slotu Açılmama Sorunu Çözümü
   - Çift Vadeli Mevduat ve Çift Kumarhane Birleştirmesi
   - 1:1 Pragmatic Play Sweet Bonanza 1000, Gates of Olympus 1000 & Manuel Bahis
   ============================================================================ */
(function () {
  if (window._masterGameJsPatchV3) return;
  window._masterGameJsPatchV3 = true;

  // 1. GEREKLİ STİLLERİ OTOMATİK YÜKLE (style.css'e dokunmana gerek kalmaz)
  if (!document.getElementById('pragmaticMasterAutoStyles')) {
    var st = document.createElement('style');
    st.id = 'pragmaticMasterAutoStyles';
    st.textContent = `
      #cityMapRootContainer, #menuMapSettingsBar, .avatar-ring-svg, .sticky-modal-hud { display: none !important; }
      .cinematic-main-menu { position: fixed; inset: 0; z-index: 150; background: radial-gradient(circle at 50% 25%, #0f172a 0%, #070a14 65%, #020617 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; overflow-y: auto; }
      .save-slot-card { width: 100%; max-width: 440px; background: linear-gradient(135deg, rgba(15,23,42,0.95), rgba(9,13,22,0.98)); border: 1px solid rgba(56,189,248,0.4); border-left: 4px solid #38bdf8; border-radius: 18px; padding: 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); }
      .char-creator-modal { position: fixed; inset: 0; z-index: 160; background: rgba(2,6,23,0.92); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; padding: 16px; overflow-y: auto; }
      .char-creator-box { width: 100%; max-width: 460px; background: linear-gradient(160deg, #0f172a 0%, #090d16 65%, #172554 100%); border: 2px solid rgba(56,189,248,0.55); border-radius: 26px; padding: 18px; }
      .creator-preview-frame { width: 112px; height: 124px; border-radius: 20px; border: 3px solid #38bdf8; overflow: hidden; background: #0f172a; margin: 0 auto; }
      .sb1000-cabinet { background: radial-gradient(circle at 15% 15%, rgba(255,255,255,0.45) 0%, transparent 35%), linear-gradient(180deg, #38bdf8 0%, #f472b6 48%, #ec4899 78%, #be185d 100%); border: 3px solid #fde047; border-radius: 22px; padding: 10px; box-shadow: 0 16px 40px rgba(190,24,93,0.55); }
      .sb1000-reel-frame { background: linear-gradient(180deg, rgba(255,245,250,0.96), rgba(252,231,243,0.94)); border: 4px solid #f59e0b; outline: 2px solid #ec4899; border-radius: 16px; padding: 6px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; }
      .sb1000-cell { aspect-ratio: 1/1; border-radius: 11px; background: radial-gradient(circle at 50% 35%, rgba(255,255,255,0.98), rgba(251,207,232,0.6)); border: 1px solid rgba(244,114,182,0.4); display: flex; align-items: center; justify-content: center; position: relative; padding: 3px; animation: pragmaticDrop 0.24s ease-out both; }
      .go1000-cabinet { background: radial-gradient(circle at 80% 18%, rgba(56,189,248,0.4) 0%, transparent 40%), linear-gradient(180deg, #1e1b4b 0%, #3b0764 52%, #172554 100%); border: 3px solid #facc15; border-radius: 22px; padding: 10px; box-shadow: 0 16px 40px rgba(0,0,0,0.8); }
      .go1000-reel-frame { background: linear-gradient(180deg, rgba(15,23,42,0.95), rgba(23,15,45,0.98)); border: 4px solid #eab308; outline: 2px solid #fef08a; border-radius: 16px; padding: 6px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; }
      .go1000-cell { aspect-ratio: 1/1; border-radius: 10px; background: radial-gradient(circle at 50% 35%, rgba(51,65,85,0.8), rgba(15,23,42,0.96)); border: 1px solid rgba(250,204,21,0.3); display: flex; align-items: center; justify-content: center; position: relative; padding: 3px; animation: pragmaticDrop 0.24s ease-out both; }
      @keyframes pragmaticDrop { 0% { opacity: 0; transform: translateY(-22px) scale(0.85); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
      .cell-tumble-win { background: radial-gradient(circle, #fef08a 0%, #f59e0b 75%, #b45309 100%) !important; border: 2px solid #ffffff !important; box-shadow: 0 0 18px #facc15 !important; transform: scale(1.08); z-index: 5; }
      .pragmatic-top-banner { background: linear-gradient(90deg, #b91c1c 0%, #ef4444 50%, #b91c1c 100%); border: 2px solid #fde047; border-radius: 999px; padding: 5px 14px; text-align: center; color: #ffffff; font-weight: 900; font-size: 11px; }
      .pragmatic-bottom-hud { background: rgba(9,13,22,0.94); border: 1.5px solid rgba(255,255,255,0.18); border-radius: 18px; padding: 10px; color: #ffffff; }
      .pragmatic-spin-btn { width: 62px; height: 62px; border-radius: 999px; background: radial-gradient(circle at 30% 25%, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%); border: 4px solid #facc15; box-shadow: 0 0 22px rgba(250,204,21,0.75); color: #0f172a; font-size: 26px; font-weight: 900; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
      .bet-manual-input { background: #020617; border: 1.5px solid #facc15; border-radius: 10px; color: #fde047; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 900; padding: 5px 8px; width: 100%; text-align: center; outline: none; }
      .bj-table-felt { background: radial-gradient(circle at 50% 30%, #065f46 0%, #064e3b 60%, #022c22 100%); border: 3px solid #d97706; border-radius: 22px; padding: 14px; }
      .playing-card-hd { width: 50px; height: 72px; border-radius: 9px; background: #ffffff; border: 1.5px solid #cbd5e1; box-shadow: 0 6px 14px rgba(0,0,0,0.5); display: flex; flex-direction: column; justify-content: space-between; padding: 4px 5px; font-family: 'JetBrains Mono', monospace; font-weight: 900; }
      .playing-card-hd.red-suit { color: #dc2626; }
      .playing-card-hd.black-suit { color: #0f172a; }
      .playing-card-back { background: repeating-linear-gradient(45deg, #1e3a8a 0 6px, #172554 6px 12px); border: 2px solid #facc15; display: flex; align-items: center; justify-content: center; color: #facc15; }
    `;
    document.head.appendChild(st);
  }

  // 2. G HENÜZ YOKKEN ÇÖKMEYİ ÖNLEYEN GÜVENLİ KORUMALAR
  var _rawGetCountry = window.getCountry;
  window.getCountry = function () {
    if (typeof G !== 'undefined' && G && G.countryId && typeof _rawGetCountry === 'function') {
      try { return _rawGetCountry(); } catch (e) {}
    }
    return (typeof COUNTRIES !== 'undefined' && COUNTRIES[0])
      ? COUNTRIES[0]
      : { id: 'TR', name: 'Türkiye', flag: '🇹🇷', currency: '₺', monthlyMinWage: 22104, taxRate: 0.20, inflation: 0 };
  };

  var _rawFmtMoney = window.fmtMoney;
  window.fmtMoney = function (n) {
    var val = Math.round(Number(n) || 0);
    if (typeof G !== 'undefined' && G && typeof _rawFmtMoney === 'function') {
      try { return _rawFmtMoney(val); } catch (e) {}
    }
    return val.toLocaleString('tr-TR') + ' ₺';
  };

  // 3. 3'LÜ KAYIT SLOTU VE BAŞLANGIÇ EKRANI MOTORU
  window.currentSelectedSlot = window.currentSelectedSlot || 1;
  window.creationState = window.creationState || {
    slotNum: 1, firstName: 'Çağatay', lastName: 'Kılıç', gender: 'Erkek',
    birthCity: 'İstanbul', skinId: 'skin_wheat', hairStyleId: 'fade_crop',
    hairColorId: 'hc_darkbrown', beardStyleId: 'beard_stubble', eyeColorId: 'eye_hazel', outfitId: 'out_tshirt'
  };

  window.getSlotStorageKey = function (sNum) {
    return 'cagatay_life_sim_save_slot_' + sNum;
  };

  window.checkSaveSlotsMeta = function () {
    var meta = {};
    for (var s = 1; s <= 3; s++) {
      var raw = localStorage.getItem(window.getSlotStorageKey(s));
      if (raw) {
        try {
          var p = JSON.parse(raw);
          meta[s] = { exists: true, name: (p.firstName || 'Oyuncu') + ' ' + (p.lastName || ''), age: p.age || 18, money: p.money || 0, city: p.birthCity || 'İstanbul' };
        } catch (e) { meta[s] = { exists: false }; }
      } else { meta[s] = { exists: false }; }
    }
    return meta;
  };

  window.createCompleteValidGameObject = function (opts) {
    opts = opts || {};
    var c = window.getCountry();
    var baseWage = c.monthlyMinWage || 22104;
    var startAge = typeof opts.age === 'number' ? opts.age : 18;
    var startMoney = typeof opts.money === 'number' ? opts.money : Math.round(baseWage * 2);
    var fName = opts.firstName || 'Çağatay';
    var lName = opts.lastName || 'Kılıç';
    var bCity = opts.birthCity || 'İstanbul';

    return {
      firstName: fName, lastName: lName, gender: opts.gender || 'Erkek',
      age: startAge, countryId: 'TR', birthCity: bCity, portraitIdx: 0,
      money: startMoney, bankSavings: 0, savings: 0, loanDebt: 0, mortgageDebt: 0, creditScore: 1350,
      health: 95, happy: 85, smart: 78, intel: 78, looks: 78, fame: 10, stress: 15,
      energy: 100, maxEnergy: 100, eduStage: 'Üniversite', uniYears: 0, uniGrad: false,
      jobId: null, jobExp: 0, jobPerf: 70, inPrison: false, prisonYears: 0, criminalRecord: false, alive: true,
      licenses: { B: false, CE: false }, houses: [], cars: [], businesses: [],
      stockHoldings: {}, cryptoHoldings: {}, stocks: {}, crypto: {},
      spouse: null, lover: null, children: [], achievements: [],
      logs: [{ age: startAge, items: [{ text: '🌟 **YENİ HAYAT:** **' + fName + ' ' + lName + '** (' + bCity + ') olarak hayata başladın!', type: 'milestone' }] }],
      charLook: {
        skinId: opts.skinId || 'skin_wheat', hairStyleId: opts.hairStyleId || 'fade_crop',
        hairColorId: opts.hairColorId || 'hc_darkbrown', beardStyleId: opts.beardStyleId || 'beard_stubble',
        browStyleId: 'brow_natural', eyeColorId: opts.eyeColorId || 'eye_hazel',
        outfitId: opts.outfitId || 'out_tshirt', glassesId: 'gl_none', yearsSinceHaircut: 0
      }
    };
  };

  window.closeAllStartOverlaysAndEnterGame = function () {
    ['cinematicMainMenuRoot', 'charCreatorModalRoot', 'startModal', 'introModal', 'newGameModal', 'welcomeModal'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.classList.add('hidden');
        if (id === 'cinematicMainMenuRoot' || id === 'charCreatorModalRoot') el.remove();
      }
    });
    var sh = document.getElementById('appShell');
    if (sh) sh.classList.remove('hidden');
  };

  window.loadGameFromSlot = function (sNum) {
    window.currentSelectedSlot = sNum;
    var raw = localStorage.getItem(window.getSlotStorageKey(sNum));
    if (!raw) { window.openCharacterCreatorModal(sNum); return; }
    try {
      var loaded = JSON.parse(raw);
      var fallback = window.createCompleteValidGameObject(loaded);
      var merged = Object.assign(fallback, loaded);
      if (!Array.isArray(merged.logs) || merged.logs.length === 0) merged.logs = fallback.logs;
      try { G = merged; } catch (e) {}
      window.G = merged;
      window.closeAllStartOverlaysAndEnterGame();
      if (typeof saveGame === 'function') saveGame();
      if (typeof renderAll === 'function') renderAll();
      if (typeof showToast === 'function') showToast('Slot #' + sNum + ' yüklendi!');
    } catch (err) { window.openCharacterCreatorModal(sNum); }
  };

  window.openCharacterCreatorModal = function (sNum) {
    window.currentSelectedSlot = sNum;
    window.creationState.slotNum = sNum;
    var modal = document.getElementById('charCreatorModalRoot');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'charCreatorModalRoot';
      modal.className = 'char-creator-modal';
      document.body.appendChild(modal);
    }
    modal.classList.remove('hidden');
    window.renderCharacterCreatorContent();
  };

  window.renderCharacterCreatorContent = function () {
    var modal = document.getElementById('charCreatorModalRoot');
    if (!modal) return;
    var cities = ['İstanbul', 'Ankara', 'İzmir', 'Tekirdağ (Şarköy)', 'Ordu', 'Antalya', 'Bursa'];
    var previewImg = typeof window.generateDynamicCharacterSVG === 'function' ? window.generateDynamicCharacterSVG(false, window.creationState) : '';

    modal.innerHTML = `
      <div class="char-creator-box space-y-3">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div class="text-xs font-black text-white">SLOT #${window.creationState.slotNum} • YENİ KARAKTER</div>
          <button type="button" onclick="document.getElementById('charCreatorModalRoot').classList.add('hidden')" class="px-2.5 py-1 rounded bg-slate-800 text-xs text-white">Geri ✕</button>
        </div>
        ${previewImg ? `<div class="creator-preview-frame"><img src="${previewImg}" class="w-full h-full object-cover"/></div>` : ''}
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div><label class="text-[10px] text-slate-400 block mb-1">Adın</label><input type="text" id="creatorInputName" value="${window.creationState.firstName}" oninput="window.creationState.firstName=this.value" class="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"/></div>
          <div><label class="text-[10px] text-slate-400 block mb-1">Soyadın</label><input type="text" id="creatorInputSurname" value="${window.creationState.lastName}" oninput="window.creationState.lastName=this.value" class="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"/></div>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div><label class="text-[10px] text-slate-400 block mb-1">Cinsiyet</label><select onchange="window.creationState.gender=this.value; window.renderCharacterCreatorContent();" class="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"><option value="Erkek" ${window.creationState.gender==='Erkek'?'selected':''}>Erkek</option><option value="Kadın" ${window.creationState.gender==='Kadın'?'selected':''}>Kadın</option></select></div>
          <div><label class="text-[10px] text-slate-400 block mb-1">Memleket</label><select onchange="window.creationState.birthCity=this.value" class="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold">${cities.map(function(ct){return '<option value="'+ct+'" '+(window.creationState.birthCity===ct?'selected':'')+'>'+ct+'</option>';}).join('')}</select></div>
        </div>
        <button type="button" onclick="window.finalizeAndStartNewLife()" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 text-sm font-black shadow-lg cursor-pointer">🚀 BU KARAKTERLE HAYATA BAŞLA!</button>
      </div>
    `;
  };

  window.finalizeAndStartNewLife = function () {
    var ni = document.getElementById('creatorInputName');
    var si = document.getElementById('creatorInputSurname');
    if (ni && ni.value.trim()) window.creationState.firstName = ni.value.trim();
    if (si && si.value.trim()) window.creationState.lastName = si.value.trim();

    var newG = window.createCompleteValidGameObject(window.creationState);
    try { G = newG; } catch (e) {}
    window.G = newG;
    try { localStorage.setItem(window.getSlotStorageKey(window.currentSelectedSlot), JSON.stringify(newG)); } catch (e) {}

    window.closeAllStartOverlaysAndEnterGame();
    if (typeof saveGame === 'function') saveGame();
    if (typeof renderAll === 'function') renderAll();
    if (typeof showToast === 'function') showToast('🚀 Hoş geldin ' + newG.firstName + '!');
  };

  // 4. ÇİFT ÖZELLİKLERİ (MEVDUAT & KUMARHANE) TEKİLLEŞTİRME
  window.deduplicateAndCleanUI = function () {
    var body = document.getElementById('sheetBody');
    if (!body) return;
    if (typeof G !== 'undefined' && G && G.fxGold && G.fxGold.termDeposit > 0) {
      if (typeof G.bankSavings === 'number') G.bankSavings += G.fxGold.termDeposit;
      else G.money += G.fxGold.termDeposit;
      G.fxGold.termDeposit = 0;
    }
    var goldCards = body.querySelectorAll('.fx-gold-card');
    for (var i = 1; i < goldCards.length; i++) goldCards[i].remove();
    if (goldCards[0]) {
      goldCards[0].querySelectorAll('button').forEach(function (b) {
        var oc = b.getAttribute('onclick') || '';
        if (oc.indexOf('deposit_term') !== -1 || oc.indexOf('withdraw_term') !== -1) b.remove();
      });
    }
    body.querySelectorAll('button').forEach(function (btn) {
      var oc = btn.getAttribute('onclick') || '';
      if (btn.id !== 'menuVipCasinoBtn' && (oc.indexOf("'casino'") !== -1 || oc.indexOf("'gambling'") !== -1)) {
        btn.remove();
      }
    });
  };

  // 5. PRAGMATIC PLAY 1:1 SWEET BONANZA 1000 & GATES OF OLYMPUS 1000 MOTORU
  window.OLYMPUS_SYMBOLS_DB = [
    { id: 'zeus_scatter', icon: '⚡', name: 'Zeus Scatter', pay8: 3.0, pay10: 15.0, pay12: 50.0, weight: 4, isScatter: true },
    { id: 'crown', icon: '👑', name: 'Kral Tacı', pay8: 5.0, pay10: 12.0, pay12: 25.0, weight: 7 },
    { id: 'hourglass', icon: '⏳', name: 'Kum Saati', pay8: 2.5, pay10: 6.0, pay12: 12.0, weight: 9 },
    { id: 'ring', icon: '💍', name: 'Yakut Yüzük', pay8: 2.0, pay10: 4.5, pay12: 9.0, weight: 10 },
    { id: 'chalice', icon: '🏆', name: 'Altın Kadeh', pay8: 1.5, pay10: 3.5, pay12: 7.0, weight: 11 },
    { id: 'gem_red', icon: '♦️', name: 'Kırmızı Elmas', pay8: 0.8, pay10: 1.8, pay12: 4.0, weight: 15 },
    { id: 'gem_purple', icon: '🔮', name: 'Mor Kristal', pay8: 0.6, pay10: 1.4, pay12: 3.0, weight: 16 },
    { id: 'gem_yellow', icon: '🌟', name: 'Sarı Mücevher', pay8: 0.5, pay10: 1.1, pay12: 2.5, weight: 17 },
    { id: 'gem_green', icon: '❇️', name: 'Yeşil Zümrüt', pay8: 0.4, pay10: 0.9, pay12: 2.0, weight: 18 },
    { id: 'gem_blue', icon: '💎', name: 'Mavi Safir', pay8: 0.3, pay10: 0.7, pay12: 1.5, weight: 19 }
  ];

  window.BONANZA_SYMBOLS_DB = [
    { id: 'lollipop', icon: '🍭', name: 'Lolipop Scatter', pay8: 3.0, pay10: 15.0, pay12: 50.0, weight: 4, isScatter: true },
    { id: 'heart_candy', icon: '❤️', name: 'Kırmızı Kalp Şeker', pay8: 5.0, pay10: 12.0, pay12: 25.0, weight: 7 },
    { id: 'purple_candy', icon: '🟪', name: 'Mor Kare Şeker', pay8: 2.5, pay10: 6.0, pay12: 12.0, weight: 9 },
    { id: 'green_candy', icon: '🟩', name: 'Yeşil Beşgen Şeker', pay8: 2.0, pay10: 4.5, pay12: 9.0, weight: 10 },
    { id: 'blue_candy', icon: '🟦', name: 'Mavi Oval Şeker', pay8: 1.5, pay10: 3.2, pay12: 6.5, weight: 11 },
    { id: 'apple', icon: '🍎', name: 'Kırmızı Elma', pay8: 0.9, pay10: 1.8, pay12: 4.0, weight: 15 },
    { id: 'peach', icon: '🍑', name: 'Şeftali', pay8: 0.7, pay10: 1.4, pay12: 3.0, weight: 16 },
    { id: 'watermelon', icon: '🍉', name: 'Karpuz', pay8: 0.5, pay10: 1.1, pay12: 2.5, weight: 17 },
    { id: 'grapes', icon: '🍇', name: 'Üzüm', pay8: 0.4, pay10: 0.9, pay12: 2.0, weight: 18 },
    { id: 'banana', icon: '🍌', name: 'Muz', pay8: 0.3, pay10: 0.7, pay12: 1.5, weight: 19 }
  ];

  window.casinoUI = window.casinoUI || {
    gameTab: 'bonanza', customBetAmount: 2000, doubleChance: false,
    freeSpinsLeft: 0, fsTotalMultiplier: 0, fsCumulativeWin: 0,
    grid: [], lastWinAmt: 0, lastWinLog: 'Bahsini yaz ve Spin tuşuna bas!',
    bjDeck: [], bjPlayer: [], bjDealer: [], bjState: 'idle', bjResultText: 'Bahsini yaz ve Kartları Dağıt!'
  };

  window.getPragmaticSymbolSVG = function (sym) {
    if (!sym) return '';
    if (sym.isMultiplier) {
      var mv = sym.multValue || 10;
      if (window.casinoUI.gameTab === 'bonanza') {
        return '<svg viewBox="0 0 64 64" class="w-full h-full"><defs><radialGradient id="bG" cx="35%" cy="30%" r="70%"><stop offset="0%" stop-color="#fde047"/><stop offset="40%" stop-color="#ec4899"/><stop offset="75%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#1d4ed8"/></radialGradient></defs><path d="M32,12 Q42,4 48,10" fill="none" stroke="#f59e0b" stroke-width="3.5"/><circle cx="49" cy="10" r="4.5" fill="#fde047"/><circle cx="32" cy="36" r="22" fill="url(#bG)" stroke="#fff" stroke-width="2.5"/><rect x="8" y="26" width="48" height="19" rx="6" fill="rgba(9,13,22,0.85)" stroke="#fde047" stroke-width="1.5"/><text x="32" y="40" text-anchor="middle" fill="#fde047" font-family="monospace" font-weight="900" font-size="15">' + mv + 'x</text></svg>';
      }
      var oc = mv >= 50 ? '#ef4444' : (mv >= 15 ? '#a855f7' : (mv >= 8 ? '#3b82f6' : '#22c55e'));
      return '<svg viewBox="0 0 64 64" class="w-full h-full"><circle cx="32" cy="32" r="22" fill="' + oc + '" stroke="#fde047" stroke-width="3"/><text x="32" y="37" text-anchor="middle" fill="#fff" font-family="monospace" font-weight="900" font-size="14">' + mv + 'x</text></svg>';
    }
    var id = sym.id;
    if (id === 'lollipop') return '<svg viewBox="0 0 64 64" class="w-full h-full"><rect x="29" y="36" width="6" height="24" rx="3" fill="#fff"/><circle cx="32" cy="24" r="19" fill="#ec4899" stroke="#fff" stroke-width="3"/><path d="M32,24 m0,-12 a12,12 0 1,1 -8,20 a8,8 0 1,1 12,-12" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>';
    if (id === 'heart_candy') return '<svg viewBox="0 0 64 64" class="w-full h-full"><path d="M32,54 C32,54 10,38 10,22 C10,13 18,8 25,8 C29,8 32,11 32,15 C32,11 35,8 39,8 C46,8 54,13 54,22 C54,38 32,54 32,54 Z" fill="#e11d48" stroke="#fecdd3" stroke-width="2.5"/></svg>';
    if (id === 'purple_candy') return '<svg viewBox="0 0 64 64" class="w-full h-full"><rect x="12" y="12" width="40" height="40" rx="8" fill="#7e22ce" stroke="#e9d5ff" stroke-width="2.5"/><rect x="19" y="19" width="26" height="26" rx="4" fill="#9333ea"/></svg>';
    if (id === 'green_candy') return '<svg viewBox="0 0 64 64" class="w-full h-full"><polygon points="32,8 55,25 46,53 18,53 9,25" fill="#15803d" stroke="#bbf7d0" stroke-width="2.5"/><polygon points="32,16 46,27 40,45 24,45 18,27" fill="#22c55e"/></svg>';
    if (id === 'blue_candy') return '<svg viewBox="0 0 64 64" class="w-full h-full"><ellipse cx="32" cy="32" rx="22" ry="15" transform="rotate(-20 32 32)" fill="#0284c7" stroke="#bae6fd" stroke-width="2.5"/></svg>';
    if (id === 'apple') return '<svg viewBox="0 0 64 64" class="w-full h-full"><path d="M32,16 Q38,8 44,12 Q39,18 32,16 Z" fill="#16a34a"/><circle cx="32" cy="36" r="18" fill="#dc2626" stroke="#fca5a5" stroke-width="1.5"/></svg>';
    if (id === 'peach') return '<svg viewBox="0 0 64 64" class="w-full h-full"><circle cx="32" cy="35" r="18" fill="#f97316" stroke="#fed7aa" stroke-width="1.5"/></svg>';
    if (id === 'watermelon') return '<svg viewBox="0 0 64 64" class="w-full h-full"><path d="M10,24 A22,22 0 0,0 54,24 Z" fill="#15803d"/><path d="M14,24 A18,18 0 0,0 50,24 Z" fill="#ef4444"/></svg>';
    if (id === 'grapes') return '<svg viewBox="0 0 64 64" class="w-full h-full"><circle cx="24" cy="24" r="8" fill="#6d28d9"/><circle cx="38" cy="24" r="8" fill="#7c3aed"/><circle cx="22" cy="36" r="8" fill="#7c3aed"/><circle cx="32" cy="36" r="8.5" fill="#8b5cf6"/><circle cx="42" cy="36" r="8" fill="#6d28d9"/><circle cx="32" cy="48" r="8" fill="#5b21b6"/></svg>';
    if (id === 'banana') return '<svg viewBox="0 0 64 64" class="w-full h-full"><path d="M16,44 Q36,48 48,18 Q52,36 34,50 Q20,56 16,44 Z" fill="#facc15" stroke="#ca8a04" stroke-width="2"/></svg>';
    if (id === 'zeus_scatter') return '<svg viewBox="0 0 64 64" class="w-full h-full"><circle cx="32" cy="32" r="24" fill="#1e3a8a" stroke="#facc15" stroke-width="3"/><polygon points="36,8 18,34 31,34 26,56 46,28 33,28" fill="#fde047"/></svg>';
    if (id === 'crown') return '<svg viewBox="0 0 64 64" class="w-full h-full"><polygon points="10,46 14,20 26,32 32,14 38,32 50,20 54,46" fill="#facc15" stroke="#b45309" stroke-width="2.5"/><rect x="10" y="46" width="44" height="7" rx="2" fill="#eab308"/></svg>';
    if (id === 'hourglass') return '<svg viewBox="0 0 64 64" class="w-full h-full"><polygon points="18,14 46,14 32,32 46,50 18,50 32,32" fill="#38bdf8" stroke="#eab308" stroke-width="2.5"/></svg>';
    if (id === 'ring') return '<svg viewBox="0 0 64 64" class="w-full h-full"><circle cx="32" cy="36" r="15" fill="none" stroke="#facc15" stroke-width="6"/><polygon points="24,18 32,10 40,18 36,24 28,24" fill="#e11d48"/></svg>';
    if (id === 'chalice') return '<svg viewBox="0 0 64 64" class="w-full h-full"><path d="M18,14 L46,14 C46,32 38,36 32,36 C26,36 18,32 18,14 Z" fill="#facc15" stroke="#b45309" stroke-width="2"/><rect x="29" y="36" width="6" height="12" fill="#eab308"/><rect x="20" y="48" width="24" height="5" rx="2" fill="#facc15"/></svg>';
    var gc = { gem_red: '#e11d48', gem_purple: '#9333ea', gem_yellow: '#eab308', gem_green: '#16a34a', gem_blue: '#0284c7' }[id] || '#38bdf8';
    return '<svg viewBox="0 0 64 64" class="w-full h-full"><polygon points="32,10 52,24 44,52 20,52 12,24" fill="' + gc + '" stroke="#fff" stroke-width="2"/></svg>';
  };

  window.pickWeightedSlotSymbol = function (symDb, inFs) {
    if (Math.random() < (inFs ? 0.085 : 0.032)) {
      var pool = [2, 3, 4, 5, 8, 10, 12, 15, 20, 25, 50, 100];
      var mv = pool[Math.floor(Math.random() * pool.length)];
      return { id: 'mult_orb', icon: '💣', name: mv + 'x Çarpan', isMultiplier: true, multValue: mv };
    }
    var totalW = symDb.reduce(function (s, x) { return s + x.weight; }, 0);
    var rnd = Math.random() * totalW;
    for (var i = 0; i < symDb.length; i++) {
      if (rnd < symDb[i].weight) return Object.assign({}, symDb[i]);
      rnd -= symDb[i].weight;
    }
    return Object.assign({}, symDb[symDb.length - 1]);
  };

  window.generateInitial6x5Grid = function () {
    var db = window.casinoUI.gameTab === 'olympus' ? window.OLYMPUS_SYMBOLS_DB : window.BONANZA_SYMBOLS_DB;
    var arr = [];
    for (var i = 0; i < 30; i++) arr.push(window.pickWeightedSlotSymbol(db, false));
    return arr;
  };

  window.setManualCasinoBet = function (val) {
    window.casinoUI.customBetAmount = Math.max(10, Math.round(Number(val) || 1000));
  };

  window.adjustManualCasinoBet = function (mode) {
    var cur = window.casinoUI.customBetAmount || 1000;
    if (mode === 'half') window.casinoUI.customBetAmount = Math.max(50, Math.round(cur / 2));
    else if (mode === 'double') window.casinoUI.customBetAmount = Math.min(Math.max(1000, G.money), cur * 2);
    else if (mode === 'max') window.casinoUI.customBetAmount = Math.max(100, G.money);
    else if (mode === 'plus') window.casinoUI.customBetAmount = cur + 1000;
    else if (mode === 'minus') window.casinoUI.customBetAmount = Math.max(50, cur - 1000);
    window.renderVIPCasinoModal();
  };

  window.spinPragmaticSlot = function (isBonusBuy) {
    if (!G || window._tumbleBusy) return;
    var inp = document.getElementById('customCasinoBetInput');
    if (inp && Number(inp.value) >= 10) window.casinoUI.customBetAmount = Math.round(Number(inp.value));

    var baseBet = window.casinoUI.customBetAmount || 1000;
    var actualBet = window.casinoUI.doubleChance ? Math.round(baseBet * 1.25) : baseBet;

    if (isBonusBuy) {
      var buyCost = baseBet * 100;
      if (G.money < buyCost) { if (typeof showToast === 'function') showToast('Bonus Satın Almak için ' + window.fmtMoney(buyCost) + ' gerekli!'); return; }
      G.money -= buyCost;
      window.casinoUI.freeSpinsLeft = window.casinoUI.gameTab === 'olympus' ? 15 : 10;
      window.casinoUI.fsTotalMultiplier = 0;
      window.casinoUI.fsCumulativeWin = 0;
    } else if (window.casinoUI.freeSpinsLeft <= 0) {
      if (G.money < actualBet) { if (typeof showToast === 'function') showToast('Bakiye yetersiz!'); return; }
      G.money -= actualBet;
    } else {
      window.casinoUI.freeSpinsLeft -= 1;
    }

    var inFs = window.casinoUI.freeSpinsLeft > 0 || isBonusBuy;
    var db = window.casinoUI.gameTab === 'olympus' ? window.OLYMPUS_SYMBOLS_DB : window.BONANZA_SYMBOLS_DB;
    var grid = [];
    for (var i = 0; i < 30; i++) {
      grid.push(isBonusBuy && i < 4 ? Object.assign({}, db[0], { isWinning: true }) : window.pickWeightedSlotSymbol(db, inFs));
    }
    window.casinoUI.grid = grid;
    window.casinoUI.roundRawWin = 0;
    window.casinoUI.tumbleCount = 0;

    if (isBonusBuy) {
      window.casinoUI.lastWinLog = '🍭 4 SCATTER GELDİ! ' + window.casinoUI.freeSpinsLeft + ' FREE SPIN BAŞLADI — SPIN\'E BAS!';
      if (typeof saveGame === 'function') saveGame();
      if (typeof renderAll === 'function') renderAll();
      window.renderVIPCasinoModal();
      return;
    }
    evaluateTumbleCascade(baseBet, inFs, db);
  };

  function evaluateTumbleCascade(baseBet, inFs, db) {
    var counts = {};
    var scatterCount = 0;
    window.casinoUI.grid.forEach(function (c) {
      c.isWinning = false;
      if (c.isScatter) scatterCount++;
      else if (!c.isMultiplier) counts[c.id] = (counts[c.id] || 0) + 1;
    });

    var stepWin = 0;
    var matchedNames = [];
    Object.keys(counts).forEach(function (id) {
      var cnt = counts[id];
      if (cnt >= 8) {
        var sInfo = db.find(function (x) { return x.id === id; });
        if (sInfo) {
          var mult = cnt >= 12 ? sInfo.pay12 : (cnt >= 10 ? sInfo.pay10 : sInfo.pay8);
          stepWin += Math.round(baseBet * mult);
          matchedNames.push(cnt + 'x ' + sInfo.name);
          window.casinoUI.grid.forEach(function (c) { if (c.id === id) c.isWinning = true; });
        }
      }
    });

    if (stepWin > 0) {
      window._tumbleBusy = true;
      window.casinoUI.tumbleCount += 1;
      window.casinoUI.roundRawWin += stepWin;
      window.casinoUI.lastWinAmt = window.casinoUI.roundRawWin;
      window.casinoUI.lastWinLog = '💥 TUMBLE #' + window.casinoUI.tumbleCount + ': +' + window.fmtMoney(stepWin) + ' (' + matchedNames.join(' + ') + ')';
      window.renderVIPCasinoModal();

      setTimeout(function () {
        for (var col = 0; col < 6; col++) {
          var surv = [];
          for (var row = 4; row >= 0; row--) {
            var cell = window.casinoUI.grid[row * 6 + col];
            if (!cell.isWinning) surv.unshift(cell);
          }
          while (surv.length < 5) surv.unshift(window.pickWeightedSlotSymbol(db, inFs));
          for (var r = 0; r < 5; r++) window.casinoUI.grid[r * 6 + col] = surv[r];
        }
        window._tumbleBusy = false;
        evaluateTumbleCascade(baseBet, inFs, db);
      }, 480);
      return;
    }

    var bombSum = 0;
    window.casinoUI.grid.forEach(function (c) { if (c.isMultiplier) bombSum += (c.multValue || 0); });
    if (scatterCount >= 4) {
      window.casinoUI.freeSpinsLeft += (inFs ? 5 : 10);
      window.casinoUI.roundRawWin += baseBet * 3;
    }

    var finalPay = window.casinoUI.roundRawWin;
    if (finalPay > 0 && bombSum > 0) finalPay = Math.round(finalPay * bombSum);

    window.casinoUI.lastWinAmt = finalPay;
    if (finalPay > 0) {
      G.money += finalPay;
      if (inFs) window.casinoUI.fsCumulativeWin += finalPay;
      window.casinoUI.lastWinLog = bombSum > 0
        ? '💣 SÜPER KAZANÇ: ' + window.fmtMoney(window.casinoUI.roundRawWin) + ' x ' + bombSum + 'x BOMBA = +' + window.fmtMoney(finalPay) + '!'
        : '🎉 TOPLAM KAZANÇ: +' + window.fmtMoney(finalPay) + ' (' + window.casinoUI.tumbleCount + ' Tumble)';
    } else {
      window.casinoUI.lastWinLog = 'Eşleşme yok (En az 8 aynı sembol gerekli). Tekrar çevir!';
    }
    if (typeof saveGame === 'function') saveGame();
    if (typeof renderAll === 'function') renderAll();
    window.renderVIPCasinoModal();
  }

  window.openVIPCasinoModal = function (tab) {
    if (tab) window.casinoUI.gameTab = tab;
    if (!window.casinoUI.grid || window.casinoUI.grid.length !== 30) {
      window.casinoUI.grid = window.generateInitial6x5Grid();
    }
    window.renderVIPCasinoModal();
  };

  window.renderVIPCasinoModal = function () {
    var sheet = document.getElementById('bottomSheet');
    if (!sheet || !G) return;
    sheet.classList.remove('hidden');

    document.getElementById('sheetTitle').textContent = '🎰 Pragmatic Play VIP Casino';
    document.getElementById('sheetSubtitle').textContent = 'Bakiye: ' + window.fmtMoney(G.money) + ' • Sweet Bonanza 1000 • Olympus 1000';

    var rawBet = window.casinoUI.customBetAmount || 2000;
    var bonusBuyCost = rawBet * 100;
    var isBonanza = window.casinoUI.gameTab === 'bonanza';

    document.getElementById('sheetBody').innerHTML = `
      <div class="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-amber-400/40 mb-2 text-[10.5px] font-black">
        <button onclick="window.casinoUI.freeSpinsLeft=0; window.casinoUI.grid=[]; window.openVIPCasinoModal('bonanza')" class="py-2 rounded-xl ${isBonanza ? 'bg-pink-500 text-white shadow' : 'text-slate-300'}">🍭 Sweet Bonanza 1000</button>
        <button onclick="window.casinoUI.freeSpinsLeft=0; window.casinoUI.grid=[]; window.openVIPCasinoModal('olympus')" class="py-2 rounded-xl ${!isBonanza ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-300'}">⚡ Gates of Olympus 1000</button>
      </div>

      <div class="pragmatic-bottom-hud mb-2 space-y-2">
        <div class="flex items-center justify-between gap-2">
          <div>
            <span class="text-[9px] text-slate-400 block font-bold">KASA BAKİYESİ (CREDIT)</span>
            <strong class="text-emerald-400 font-mono-num text-xs">${window.fmtMoney(G.money)}</strong>
          </div>
          <div class="flex-1 max-w-[175px]">
            <label class="text-[8.5px] text-amber-300 font-extrabold block text-center mb-0.5">✍️ BAHİS TUTARINI YAZ (₺)</label>
            <input id="customCasinoBetInput" type="number" min="10" step="500" value="${rawBet}" oninput="window.setManualCasinoBet(this.value)" class="bet-manual-input" />
          </div>
        </div>
        <div class="grid grid-cols-5 gap-1 text-[9.5px] font-black">
          <button onclick="window.adjustManualCasinoBet('minus')" class="py-1.5 rounded bg-slate-800 text-white">-1.000</button>
          <button onclick="window.adjustManualCasinoBet('half')" class="py-1.5 rounded bg-slate-800 text-amber-300">1/2</button>
          <button onclick="window.adjustManualCasinoBet('double')" class="py-1.5 rounded bg-slate-800 text-emerald-300">2X</button>
          <button onclick="window.adjustManualCasinoBet('plus')" class="py-1.5 rounded bg-slate-800 text-white">+1.000</button>
          <button onclick="window.adjustManualCasinoBet('max')" class="py-1.5 rounded bg-amber-400 text-slate-950">MAX BAS</button>
        </div>
      </div>

      <div class="${isBonanza ? 'sb1000-cabinet' : 'go1000-cabinet'} space-y-2">
        <div class="pragmatic-top-banner flex items-center justify-between">
          <span>${isBonanza ? '🍭 SWEET BONANZA 1000™' : '⚡ GATES OF OLYMPUS 1000™'}</span>
          <span class="font-mono-num">${window.casinoUI.freeSpinsLeft > 0 ? 'FREE SPINS: ' + window.casinoUI.freeSpinsLeft : '8+ EŞLEŞME = TUMBLE'}</span>
        </div>

        <div class="${isBonanza ? 'sb1000-reel-frame' : 'go1000-reel-frame'}">
          ${window.casinoUI.grid.map(function (cell, idx) {
            return '<div class="' + (isBonanza ? 'sb1000-cell' : 'go1000-cell') + ' ' + (cell.isWinning ? 'cell-tumble-win' : '') + '" style="animation-delay:' + ((idx % 6) * 0.02) + 's">' + window.getPragmaticSymbolSVG(cell) + '</div>';
          }).join('')}
        </div>

        <div class="p-2 rounded-xl bg-slate-950/90 border border-white/20 text-center text-xs font-black text-amber-300">
          ${window.casinoUI.lastWinLog}
        </div>

        <div class="flex items-center justify-between gap-2 pt-1">
          <button onclick="window.spinPragmaticSlot(true)" class="flex-1 py-2 px-2.5 rounded-xl bg-gradient-to-b from-pink-500 to-red-700 border-2 border-yellow-300 text-white text-left text-[9px] font-black shadow-lg">
            <div>🍭 BONUS SATIN AL (100x)</div>
            <div class="font-mono-num text-xs">${window.fmtMoney(bonusBuyCost)}</div>
          </button>
          <button onclick="window.spinPragmaticSlot(false)" class="pragmatic-spin-btn">↻</button>
          <button onclick="window.casinoUI.doubleChance=!window.casinoUI.doubleChance; window.renderVIPCasinoModal()" class="flex-1 py-2 px-2.5 rounded-xl border-2 ${window.casinoUI.doubleChance ? 'bg-emerald-600 border-yellow-300 text-white' : 'bg-slate-900 border-white/25 text-slate-300'} text-right text-[9px] font-black shadow-lg">
            <div>ANTE BET (2X ŞANS)</div>
            <div class="text-xs">${window.casinoUI.doubleChance ? 'AÇIK ✓' : 'KAPALI'}</div>
          </button>
        </div>
      </div>
    `;
  };

  // 6. MENÜ VE FİNANS KANCALARINI BAĞLA
  var _prevOpenNav = window.openNavSheet;
  if (typeof _prevOpenNav === 'function') {
    window.openNavSheet = openNavSheet = function (tab) {
      _prevOpenNav(tab);
      if (tab === 'menu') {
        var body = document.getElementById('sheetBody');
        if (body && !document.getElementById('menuVipCasinoBtn')) {
          var grid = body.querySelector('.grid.grid-cols-2');
          if (grid) {
            grid.insertAdjacentHTML('afterbegin', `
              <button id="menuVipCasinoBtn" onclick="window.openVIPCasinoModal('bonanza')" class="col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-pink-500/25 via-purple-600/20 to-amber-500/25 border border-amber-400/60 text-left flex items-center justify-between mb-1 shadow-lg">
                <div>
                  <div class="text-xs font-black text-amber-300 uppercase">🍭 PRAGMATIC PLAY VIP CASINO</div>
                  <div class="text-sm font-extrabold text-white">Sweet Bonanza 1000 • Gates of Olympus 1000</div>
                </div>
                <span class="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shrink-0">Oyna &rarr;</span>
              </button>
            `);
          }
        }
      }
      window.deduplicateAndCleanUI();
    };
  }

  var _prevOpenMenu = window.openMenuSection;
  if (typeof _prevOpenMenu === 'function') {
    window.openMenuSection = openMenuSection = function (sec) {
      if (sec === 'casino' || sec === 'gambling') {
        window.openVIPCasinoModal('bonanza');
        return;
      }
      _prevOpenMenu(sec);
      window.deduplicateAndCleanUI();
    };
  }
})();

/* ============================================================================
   MASTER PATCH V4: TEK GİRİŞ EKRANI, EMOJİSİZ 4K VEKTÖREL MENÜ VE HATA ONARIMI
   (SADECE GAME.JS EN ALTINA YAPIŞTIRIN)
   ============================================================================ */
(function () {
  if (window._masterPatchV4Applied) return;
  window._masterPatchV4Applied = true;

  // 1. 4K METALİK & CAM EFEKTLİ (GLASSMORPHISM) MENÜ VE ARAYÜZ STİLLERİ
  var oldStyle = document.getElementById('pragmaticMasterAutoStyles');
  if (oldStyle) oldStyle.remove();

  var st = document.createElement('style');
  st.id = 'pragmaticMasterAutoStyles';
  st.textContent = `
    /* Eski İkinci Giriş Ekranlarını ve Bozuk Barları Kesin Olarak Gizle */
    #startModal, #introModal, #newGameModal, #welcomeModal, #setupModal,
    #cityMapRootContainer, #menuMapSettingsBar, .avatar-ring-svg, .sticky-modal-hud {
      display: none !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }

    /* Tekil Sinematik Ana Giriş Ekranı */
    .cinematic-main-menu {
      position: fixed; inset: 0; z-index: 9999;
      background:
        radial-gradient(circle at 20% 20%, rgba(14, 165, 233, 0.16) 0%, transparent 45%),
        radial-gradient(circle at 80% 80%, rgba(234, 179, 8, 0.14) 0%, transparent 45%),
        linear-gradient(180deg, #060913 0%, #0b1120 55%, #020617 100%);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 20px; overflow-y: auto;
    }

    .save-slot-card {
      width: 100%; max-width: 440px;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(7, 11, 20, 0.98) 100%);
      border: 1px solid rgba(56, 189, 248, 0.32);
      border-left: 4px solid #38bdf8;
      border-radius: 18px; padding: 14px 16px;
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      box-shadow: 0 14px 34px rgba(0, 0, 0, 0.7);
      transition: transform 0.16s ease, border-color 0.16s ease;
    }
    .save-slot-card:hover { transform: translateY(-2px); border-color: #facc15; }

    .char-creator-modal {
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(2, 6, 23, 0.94); backdrop-filter: blur(14px);
      display: flex; align-items: center; justify-content: center; padding: 16px; overflow-y: auto;
    }
    .char-creator-box {
      width: 100%; max-width: 450px;
      background: linear-gradient(165deg, #0f172a 0%, #090d16 70%, #172554 100%);
      border: 1.5px solid rgba(56, 189, 248, 0.5); border-radius: 26px; padding: 20px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9);
    }
    .creator-preview-frame {
      width: 112px; height: 124px; border-radius: 20px; border: 2.5px solid #38bdf8;
      overflow: hidden; background: #0f172a; margin: 0 auto;
    }

    /* 4K BENTO MENÜ TASARIMI (EMOJİSİZ, VEKTÖREL İKONLU) */
    .hd-menu-hero-card {
      position: relative; overflow: hidden;
      border-radius: 20px; padding: 14px 16px;
      display: flex; align-items: center; justify-content: space-between; gap: 14px;
      cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.55);
    }
    .hd-menu-hero-card:active { transform: scale(0.98); }

    .hd-menu-bento-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
    }
    .hd-menu-tile {
      position: relative; overflow: hidden;
      background: linear-gradient(155deg, rgba(15, 23, 42, 0.96) 0%, rgba(9, 13, 22, 0.99) 100%);
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 18px; padding: 13px;
      display: flex; flex-direction: column; justify-content: space-between;
      min-height: 98px; text-align: left; cursor: pointer;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06);
      transition: all 0.16s ease;
    }
    .hd-menu-tile:hover {
      border-color: rgba(56, 189, 248, 0.55);
      transform: translateY(-2px);
      box-shadow: 0 12px 26px rgba(14, 165, 233, 0.18);
    }
    .hd-menu-tile:active { transform: scale(0.97); }

    .hd-icon-box {
      width: 40px; height: 40px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.25), 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    /* Pragmatic Play 1:1 Slot Stilleri */
    .sb1000-cabinet { background: radial-gradient(circle at 15% 15%, rgba(255,255,255,0.45) 0%, transparent 35%), linear-gradient(180deg, #38bdf8 0%, #f472b6 48%, #ec4899 78%, #be185d 100%); border: 3px solid #fde047; border-radius: 22px; padding: 10px; box-shadow: 0 16px 40px rgba(190,24,93,0.55); }
    .sb1000-reel-frame { background: linear-gradient(180deg, rgba(255,245,250,0.96), rgba(252,231,243,0.94)); border: 4px solid #f59e0b; outline: 2px solid #ec4899; border-radius: 16px; padding: 6px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; }
    .sb1000-cell { aspect-ratio: 1/1; border-radius: 11px; background: radial-gradient(circle at 50% 35%, rgba(255,255,255,0.98), rgba(251,207,232,0.6)); border: 1px solid rgba(244,114,182,0.4); display: flex; align-items: center; justify-content: center; position: relative; padding: 3px; animation: pragmaticDrop 0.24s ease-out both; }
    .go1000-cabinet { background: radial-gradient(circle at 80% 18%, rgba(56,189,248,0.4) 0%, transparent 40%), linear-gradient(180deg, #1e1b4b 0%, #3b0764 52%, #172554 100%); border: 3px solid #facc15; border-radius: 22px; padding: 10px; box-shadow: 0 16px 40px rgba(0,0,0,0.8); }
    .go1000-reel-frame { background: linear-gradient(180deg, rgba(15,23,42,0.95), rgba(23,15,45,0.98)); border: 4px solid #eab308; outline: 2px solid #fef08a; border-radius: 16px; padding: 6px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; }
    .go1000-cell { aspect-ratio: 1/1; border-radius: 10px; background: radial-gradient(circle at 50% 35%, rgba(51,65,85,0.8), rgba(15,23,42,0.96)); border: 1px solid rgba(250,204,21,0.3); display: flex; align-items: center; justify-content: center; position: relative; padding: 3px; animation: pragmaticDrop 0.24s ease-out both; }
    @keyframes pragmaticDrop { 0% { opacity: 0; transform: translateY(-20px) scale(0.86); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
    .cell-tumble-win { background: radial-gradient(circle, #fef08a 0%, #f59e0b 75%, #b45309 100%) !important; border: 2px solid #ffffff !important; box-shadow: 0 0 18px #facc15 !important; transform: scale(1.07); z-index: 5; }
    .pragmatic-top-banner { background: linear-gradient(90deg, #991b1b 0%, #dc2626 50%, #991b1b 100%); border: 2px solid #fde047; border-radius: 999px; padding: 5px 14px; text-align: center; color: #ffffff; font-weight: 900; font-size: 11px; letter-spacing: 0.04em; }
    .pragmatic-bottom-hud { background: rgba(9,13,22,0.95); border: 1.5px solid rgba(255,255,255,0.16); border-radius: 18px; padding: 10px; color: #ffffff; }
    .pragmatic-spin-btn { width: 62px; height: 62px; border-radius: 999px; background: radial-gradient(circle at 30% 25%, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%); border: 4px solid #facc15; box-shadow: 0 0 22px rgba(250,204,21,0.75); color: #0f172a; font-size: 26px; font-weight: 900; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
    .bet-manual-input { background: #020617; border: 1.5px solid #facc15; border-radius: 10px; color: #fde047; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 900; padding: 5px 8px; width: 100%; text-align: center; outline: none; }
  `;
  document.head.appendChild(st);

  // 2. OTOMATİK VERİ ONARICI (OYUNDAKİ TÜM UNDEFINED / NAN HATALARINI ÖNLER)
  window.healGameState = function () {
    if (typeof G === 'undefined' || !G) return;
    var c = window.getCountry();
    var minW = c.monthlyMinWage || 22104;

    if (typeof G.money !== 'number' || isNaN(G.money)) G.money = minW * 2;
    if (typeof G.bankSavings !== 'number' || isNaN(G.bankSavings)) G.bankSavings = 0;
    if (typeof G.savings !== 'number' || isNaN(G.savings)) G.savings = G.bankSavings;
    if (typeof G.loanDebt !== 'number' || isNaN(G.loanDebt)) G.loanDebt = 0;
    if (typeof G.health !== 'number' || isNaN(G.health)) G.health = 90;
    if (typeof G.happy !== 'number' || isNaN(G.happy)) G.happy = 80;
    if (typeof G.looks !== 'number' || isNaN(G.looks)) G.looks = 75;
    if (typeof G.smart !== 'number' || isNaN(G.smart)) G.smart = 75;
    if (typeof G.intel !== 'number' || isNaN(G.intel)) G.intel = G.smart;
    if (typeof G.fame !== 'number' || isNaN(G.fame)) G.fame = 10;
    if (typeof G.stress !== 'number' || isNaN(G.stress)) G.stress = 20;
    if (typeof G.energy !== 'number' || isNaN(G.energy)) G.energy = 100;
    if (typeof G.maxEnergy !== 'number' || isNaN(G.maxEnergy)) G.maxEnergy = 100;
    if (typeof G.creditScore !== 'number' || isNaN(G.creditScore)) G.creditScore = 1350;

    if (!Array.isArray(G.houses)) G.houses = [];
    if (!Array.isArray(G.cars)) G.cars = [];
    if (!Array.isArray(G.businesses)) G.businesses = [];
    if (!Array.isArray(G.children)) G.children = [];
    if (!Array.isArray(G.achievements)) G.achievements = [];
    if (!Array.isArray(G.logs) || G.logs.length === 0) {
      G.logs = [{ age: G.age || 18, items: [{ text: 'Hayat simülasyonu aktif.', type: 'milestone' }] }];
    }
    if (!G.licenses) G.licenses = { B: false, CE: false };
    if (!G.stockHoldings) G.stockHoldings = {};
    if (!G.cryptoHoldings) G.cryptoHoldings = {};
    if (!G.charLook) {
      G.charLook = {
        skinId: 'skin_wheat', hairStyleId: 'fade_crop', hairColorId: 'hc_darkbrown',
        beardStyleId: 'beard_stubble', browStyleId: 'brow_natural',
        eyeColorId: 'eye_hazel', outfitId: 'out_tshirt', glassesId: 'gl_none', yearsSinceHaircut: 0
      };
    }
    if (!G.fxGold) {
      G.fxGold = { gramGold: 0, goldPriceMult: 0.14, usdBalance: 0, termDeposit: 0, ccStatementDebt: 0, ccLimitMult: 3.5 };
    }
    // İkinci vadeli mevduatta kalan parayı ana banka mevduatına birleştir
    if (G.fxGold.termDeposit > 0) {
      G.bankSavings += G.fxGold.termDeposit;
      G.fxGold.termDeposit = 0;
    }
  };

  // 3. ÇİFT GİRİŞ EKRANI TEMİZLEYİCİ VE TEKİL 3'LÜ KAYIT SLOTU SİSTEMİ
  function purgeDuplicateStartScreens() {
    // Eski oyunun kendi başlangıç modallarını tamamen kaldır
    ['startModal', 'introModal', 'newGameModal', 'welcomeModal', 'setupModal'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.classList.add('hidden');
        el.style.display = 'none';
      }
    });

    // Eğer birden fazla cinematicMainMenuRoot oluştuysa fazlalarını sil
    var menus = document.querySelectorAll('#cinematicMainMenuRoot');
    for (var i = 1; i < menus.length; i++) menus[i].remove();
  }

  // Eğer Slot #1 boşsa ama eski oyunun kaydı varsa onu otomatik Slot #1'e aktar
  function migrateLegacySaveIfNeeded() {
    var slot1Key = window.getSlotStorageKey(1);
    if (!localStorage.getItem(slot1Key)) {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('cagatay_life_sim_save_slot_') === -1) {
          try {
            var raw = localStorage.getItem(k);
            var obj = JSON.parse(raw);
            if (obj && obj.firstName && typeof obj.money === 'number') {
              localStorage.setItem(slot1Key, raw);
              break;
            }
          } catch (e) {}
        }
      }
    }
  }

  window.openSingleStartMenu = function (forceOpen) {
    purgeDuplicateStartScreens();
    migrateLegacySaveIfNeeded();

    if (!forceOpen && typeof G !== 'undefined' && G && G.firstName && window._gameEnteredSuccessfully) {
      return;
    }

    var menuEl = document.getElementById('cinematicMainMenuRoot');
    if (!menuEl) {
      menuEl = document.createElement('div');
      menuEl.id = 'cinematicMainMenuRoot';
      menuEl.className = 'cinematic-main-menu';
      document.body.appendChild(menuEl);
    }

    var slots = window.checkSaveSlotsMeta();

    menuEl.innerHTML = `
      <div class="text-center space-y-2.5 mb-7">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/15 border border-sky-400/40 text-sky-300 font-mono-num text-[11px] font-black tracking-widest">
          EXECUTIVE EDITION • 4K ENGINE
        </div>
        <h1 class="text-3xl font-black text-white tracking-tight">ZİRVE HAYATLAR</h1>
        <p class="text-xs text-slate-400 max-w-xs mx-auto">Kariyer, Holding, Gayrimenkul ve VIP Casino Simülasyonu</p>
      </div>

      <div class="w-full max-w-[440px] space-y-3 mb-6">
        <div class="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">KAYIT PROFİLLERİ (3 BAĞIMSIZ SLOT)</div>
        ${[1, 2, 3].map(function (sNum) {
          var st = slots[sNum];
          return `
            <div class="save-slot-card">
              <div class="flex items-center gap-3.5 min-w-0">
                <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/25 to-indigo-600/25 border border-sky-400/50 flex items-center justify-center font-mono-num font-black text-sky-300 text-sm shrink-0">
                  0${sNum}
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-black text-white truncate">${st.exists ? st.name : 'Boş Kayıt Slotu'}</div>
                  <div class="text-[11px] text-slate-400 truncate">${st.exists ? (st.age + ' Yaş • ' + window.fmtMoney(st.money) + ' • ' + st.city) : 'Yeni bir karakter ve kariyer başlat'}</div>
                </div>
              </div>
              <div class="flex gap-1.5 shrink-0">
                ${st.exists ? `
                  <button type="button" onclick="window.loadGameFromSlot(${sNum})" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 text-xs font-black shadow cursor-pointer">DEVAM ET</button>
                  <button type="button" onclick="window.openCharacterCreatorModal(${sNum})" class="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-extrabold cursor-pointer" title="Sıfırdan Başlat">YENİLE</button>
                ` : `
                  <button type="button" onclick="window.openCharacterCreatorModal(${sNum})" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 text-xs font-black shadow cursor-pointer">OLUŞTUR</button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  };

  var _origLoadSlot = window.loadGameFromSlot;
  window.loadGameFromSlot = function (sNum) {
    window._gameEnteredSuccessfully = true;
    purgeDuplicateStartScreens();
    if (typeof _origLoadSlot === 'function') _origLoadSlot(sNum);
    window.healGameState();
    if (typeof renderAll === 'function') renderAll();
  };

  var _origFinalize = window.finalizeAndStartNewLife;
  window.finalizeAndStartNewLife = function () {
    window._gameEnteredSuccessfully = true;
    purgeDuplicateStartScreens();
    if (typeof _origFinalize === 'function') _origFinalize();
    window.healGameState();
    if (typeof renderAll === 'function') renderAll();
  };

  // 4. EMOJİSİZ 4K VEKTÖREL İKON KÜTÜPHANESİ (MENÜ KARTLARI İÇİN)
  function getMenuVectorSVG(type) {
    var svgs = {
      casino: '<svg viewBox="0 0 48 48" class="w-7 h-7"><defs><linearGradient id="gCas" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fde047"/><stop offset="100%" stop-color="#d97706"/></linearGradient></defs><rect x="6" y="10" width="36" height="28" rx="7" fill="url(#gCas)" stroke="#fff" stroke-width="1.8"/><rect x="10" y="15" width="8" height="18" rx="2" fill="#090d16"/><rect x="20" y="15" width="8" height="18" rx="2" fill="#090d16"/><rect x="30" y="15" width="8" height="18" rx="2" fill="#090d16"/><text x="14" y="28" text-anchor="middle" fill="#fde047" font-weight="900" font-size="11">7</text><text x="24" y="28" text-anchor="middle" fill="#f43f5e" font-weight="900" font-size="11">7</text><text x="34" y="28" text-anchor="middle" fill="#38bdf8" font-weight="900" font-size="11">7</text></svg>',
      barber: '<svg viewBox="0 0 48 48" class="w-7 h-7"><circle cx="16" cy="34" r="6" fill="none" stroke="#38bdf8" stroke-width="3"/><circle cx="32" cy="34" r="6" fill="none" stroke="#38bdf8" stroke-width="3"/><line x1="20" y1="29" x2="34" y2="10" stroke="#e2e8f0" stroke-width="3.5" stroke-linecap="round"/><line x1="28" y1="29" x2="14" y2="10" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round"/><circle cx="24" cy="22" r="2.5" fill="#facc15"/></svg>',
      houses: '<svg viewBox="0 0 48 48" class="w-6 h-6"><polygon points="24,6 6,22 12,22 12,40 36,40 36,22 42,22" fill="#10b981" stroke="#a7f3d0" stroke-width="2"/><rect x="20" y="27" width="8" height="13" rx="1.5" fill="#064e3b"/><rect x="18" y="16" width="12" height="6" rx="1" fill="#ecfdf5"/></svg>',
      cars: '<svg viewBox="0 0 48 48" class="w-6 h-6"><path d="M8,28 L14,16 L34,16 L40,28 L42,35 L6,35 Z" fill="#ef4444" stroke="#fecdd3" stroke-width="2"/><polygon points="16,19 32,19 36,27 12,27" fill="#0f172a"/><circle cx="14" cy="35" r="5" fill="#1e293b" stroke="#e2e8f0" stroke-width="2"/><circle cx="34" cy="35" r="5" fill="#1e293b" stroke="#e2e8f0" stroke-width="2"/></svg>',
      business: '<svg viewBox="0 0 48 48" class="w-6 h-6"><rect x="8" y="14" width="32" height="24" rx="4" fill="#3b82f6" stroke="#bfdbfe" stroke-width="2"/><path d="M18,14 V10 C18,8.5 19.5,7 21,7 H27 C28.5,7 30,8.5 30,10 V14" fill="none" stroke="#bfdbfe" stroke-width="2.5"/><line x1="8" y1="25" x2="40" y2="25" stroke="#1d4ed8" stroke-width="2.5"/><rect x="21" y="22" width="6" height="6" rx="1" fill="#facc15"/></svg>',
      education: '<svg viewBox="0 0 48 48" class="w-6 h-6"><polygon points="24,8 4,18 24,28 44,18" fill="#8b5cf6" stroke="#ddd6fe" stroke-width="2"/><path d="M12,22 V33 C12,37 36,37 36,33 V22" fill="#6d28d9" stroke="#ddd6fe" stroke-width="1.8"/><line x1="40" y1="20" x2="40" y2="34" stroke="#facc15" stroke-width="2.5"/></svg>',
      health: '<svg viewBox="0 0 48 48" class="w-6 h-6"><rect x="8" y="8" width="32" height="32" rx="9" fill="#059669" stroke="#a7f3d0" stroke-width="2"/><path d="M14,25 H19 L22,16 L26,33 L29,22 L32,25 H35" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      crime: '<svg viewBox="0 0 48 48" class="w-6 h-6"><rect x="10" y="20" width="28" height="20" rx="4" fill="#475569" stroke="#cbd5e1" stroke-width="2"/><path d="M16,20 V14 C16,9 32,9 32,14 V20" fill="none" stroke="#94a3b8" stroke-width="3"/><circle cx="24" cy="30" r="3" fill="#f43f5e"/></svg>',
      sports: '<svg viewBox="0 0 48 48" class="w-6 h-6"><path d="M14,10 H34 V20 C34,27 29,31 24,31 C19,31 14,27 14,20 Z" fill="#eab308" stroke="#fef08a" stroke-width="2"/><rect x="21" y="31" width="6" height="7" fill="#ca8a04"/><rect x="16" y="38" width="16" height="4" rx="1.5" fill="#facc15"/></svg>',
      shopping: '<svg viewBox="0 0 48 48" class="w-6 h-6"><polygon points="24,6 40,18 24,42 8,18" fill="#06b6d4" stroke="#cffafe" stroke-width="2"/><polygon points="24,6 32,18 24,42 16,18" fill="#22d3ee" opacity="0.6"/></svg>',
      slots: '<svg viewBox="0 0 48 48" class="w-6 h-6"><rect x="8" y="8" width="32" height="32" rx="6" fill="#0284c7" stroke="#bae6fd" stroke-width="2"/><rect x="14" y="8" width="20" height="12" fill="#e0f2fe"/><rect x="14" y="26" width="20" height="14" rx="2" fill="#0f172a"/></svg>',
      defaultIcon: '<svg viewBox="0 0 48 48" class="w-6 h-6"><rect x="8" y="8" width="14" height="14" rx="3" fill="#38bdf8"/><rect x="26" y="8" width="14" height="14" rx="3" fill="#818cf8"/><rect x="8" y="26" width="14" height="14" rx="3" fill="#34d399"/><rect x="26" y="26" width="14" height="14" rx="3" fill="#facc15"/></svg>'
    };
    return svgs[type] || svgs.defaultIcon;
  }

  // Metindeki tüm ucuz emojileri temizleyen yardımcı fonksiyon
  function stripAllEmojis(str) {
    if (!str) return '';
    return str
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function detectCategoryAppearance(onclickStr, titleStr) {
    var s = (onclickStr + ' ' + titleStr).toLowerCase();
    if (/house|emlak|konut|ev|mülk|gayrimenkul/.test(s)) {
      return { icon: 'houses', bg: 'rgba(16, 185, 129, 0.16)', border: 'rgba(16, 185, 129, 0.4)', tag: 'GAYRİMENKUL & TAPU' };
    }
    if (/car|araç|araba|galeri|garaj|oto/.test(s)) {
      return { icon: 'cars', bg: 'rgba(239, 68, 68, 0.16)', border: 'rgba(239, 68, 68, 0.4)', tag: 'OTOMOTİV & GARAJ' };
    }
    if (/busi|şirket|holding|ticaret|girişim|fabrika/.test(s)) {
      return { icon: 'business', bg: 'rgba(59, 130, 246, 0.16)', border: 'rgba(59, 130, 246, 0.4)', tag: 'KURUMSAL YATIRIM' };
    }
    if (/edu|eğitim|okul|üniversite|ehliyet|kurs|sınav/.test(s)) {
      return { icon: 'education', bg: 'rgba(139, 92, 246, 0.16)', border: 'rgba(139, 92, 246, 0.4)', tag: 'AKADEMİ & LİSANS' };
    }
    if (/heal|sağlık|hastane|doktor|estetik|spor salonu/.test(s)) {
      return { icon: 'health', bg: 'rgba(5, 150, 105, 0.16)', border: 'rgba(5, 150, 105, 0.4)', tag: 'TIP & CHECK-UP' };
    }
    if (/crim|suç|mafya|illegal|yeraltı|soygun/.test(s)) {
      return { icon: 'crime', bg: 'rgba(100, 116, 139, 0.2)', border: 'rgba(148, 163, 184, 0.4)', tag: 'YERALTI OPERASYON' };
    }
    if (/foot|futbol|kulüp|stadyum|maç|iddaa|bahis|spor/.test(s)) {
      return { icon: 'sports', bg: 'rgba(234, 179, 8, 0.16)', border: 'rgba(234, 179, 8, 0.4)', tag: 'SPOR & KULÜP' };
    }
    if (/shop|alışveriş|yaşam|tatil|lüks|aktivite/.test(s)) {
      return { icon: 'shopping', bg: 'rgba(6, 182, 212, 0.16)', border: 'rgba(6, 182, 212, 0.4)', tag: 'LÜKS & YAŞAM' };
    }
    return { icon: 'defaultIcon', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.35)', tag: 'YÖNETİM PANELİ' };
  }

  // 5. MENÜ SEKME ÇİZİCİSİ: ESKİ DANDİK EMOJİLİ MENÜYÜ 4K BENTO HUB'A DÖNÜŞTÜRÜR
  function rebuildMenuInto4KBentoHub() {
    var body = document.getElementById('sheetBody');
    if (!body || !G) return;

    // Başlığı temizle
    var titleEl = document.getElementById('sheetTitle');
    var subEl = document.getElementById('sheetSubtitle');
    if (titleEl) titleEl.textContent = 'YÖNETİM & YAŞAM MERKEZİ';
    if (subEl) subEl.textContent = G.firstName + ' ' + G.lastName + ' • Net Servet: ' + window.fmtMoney(typeof getNetWorth === 'function' ? getNetWorth() : G.money);

    // Orijinal menünün içindeki tüm butonları oku (hiçbir özellik kaybolmasın, çiftler elensin)
    var rawButtons = Array.from(body.querySelectorAll('button'));
    var seenTargets = {};
    var cleanItems = [];

    rawButtons.forEach(function (btn) {
      var oc = (btn.getAttribute('onclick') || '').trim();
      if (!oc) return;
      // Casino ve Berber butonlarını üstte özel 4K vitrin olarak çizeceğimiz için listeden ayıkla
      if (/casino|gambling|openVIPCasinoModal|openBarberAndSalonModal/.test(oc)) return;
      if (seenTargets[oc]) return;
      seenTargets[oc] = true;

      var rawLines = btn.innerText.split('\n').map(function (l) { return stripAllEmojis(l); }).filter(Boolean);
      var mainTitle = rawLines[0] || 'Bölüm';
      var subTitle = rawLines[1] || 'Detayları görüntüle ve yönet';

      cleanItems.push({
        onclick: oc.replace(/"/g, '&quot;'),
        title: mainTitle,
        sub: subTitle,
        theme: detectCategoryAppearance(oc, mainTitle)
      });
    });

    var houseCount = Array.isArray(G.houses) ? G.houses.length : 0;
    var carCount = Array.isArray(G.cars) ? G.cars.length : 0;

    body.innerHTML = `
      <div class="space-y-3 pb-4">
        <!-- Üst Özet Durum Çubuğu -->
        <div class="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 text-center">
          <div>
            <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">NAKİT BÜTÇE</div>
            <div class="text-xs font-mono-num font-black text-emerald-400 mt-0.5">${window.fmtMoney(G.money)}</div>
          </div>
          <div class="border-x border-slate-800">
            <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">GAYRİMENKUL</div>
            <div class="text-xs font-mono-num font-black text-sky-400 mt-0.5">${houseCount} Mülk</div>
          </div>
          <div>
            <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">GARAJ FİLOSU</div>
            <div class="text-xs font-mono-num font-black text-amber-400 mt-0.5">${carCount} Araç</div>
          </div>
        </div>

        <!-- 1. HERO KART: PRAGMATIC PLAY VIP CASINO & SLOT LOUNGE -->
        <div onclick="window.openVIPCasinoModal('bonanza')" class="hd-menu-hero-card" style="background: linear-gradient(135deg, #4a044e 0%, #1e1b4b 55%, #090d16 100%); border: 1.5px solid rgba(250, 204, 21, 0.55);">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="hd-icon-box" style="background: rgba(250, 204, 21, 0.18); border: 1px solid rgba(250, 204, 21, 0.5);">
              ${getMenuVectorSVG('casino')}
            </div>
            <div class="min-w-0">
              <div class="text-[9px] font-black text-amber-300 uppercase tracking-widest">PRAGMATIC PLAY LIVE LOUNGE</div>
              <div class="text-sm font-black text-white truncate">VIP Royal Casino &amp; Slot Merkezi</div>
              <div class="text-[10.5px] text-slate-300 truncate">Sweet Bonanza 1000 • Gates of Olympus 1000</div>
            </div>
          </div>
          <span class="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[10.5px] font-black shrink-0 shadow">
            GİRİŞ YAP
          </span>
        </div>

        <!-- 2. HERO KART: STİL, KUAFÖR & KARAKTER STÜDYOSU -->
        <div onclick="if(typeof openBarberAndSalonModal==='function') openBarberAndSalonModal();" class="hd-menu-hero-card" style="background: linear-gradient(135deg, #0f172a 0%, #172554 60%, #090d16 100%); border: 1.5px solid rgba(56, 189, 248, 0.45);">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="hd-icon-box" style="background: rgba(56, 189, 248, 0.18); border: 1px solid rgba(56, 189, 248, 0.5);">
              ${getMenuVectorSVG('barber')}
            </div>
            <div class="min-w-0">
              <div class="text-[9px] font-black text-sky-300 uppercase tracking-widest">KARAKTER &amp; İMAJ STÜDYOSU</div>
              <div class="text-sm font-black text-white truncate">VIP Kuaför, Sakal &amp; Kombin Tasarımı</div>
              <div class="text-[10.5px] text-slate-300 truncate">Mevcut Karizma / Görünüm: %${G.looks}</div>
            </div>
          </div>
          <span class="px-3 py-2 rounded-xl bg-sky-400 text-slate-950 text-[10.5px] font-black shrink-0 shadow">
            STÜDYO
          </span>
        </div>

        <!-- 3. BENTO KATEGORİ IZGARASI (TÜM MENÜ ÖZELLİKLERİ, EMOJİSİZ 4K VEKTÖREL) -->
        <div class="hd-menu-bento-grid">
          ${cleanItems.map(function (item) {
            return `
              <button type="button" onclick="${item.onclick}" class="hd-menu-tile">
                <div class="flex items-center justify-between w-full mb-2">
                  <div class="hd-icon-box" style="background:${item.theme.bg}; border:1px solid ${item.theme.border};">
                    ${getMenuVectorSVG(item.theme.icon)}
                  </div>
                  <span class="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wider">${item.theme.tag}</span>
                </div>
                <div>
                  <div class="text-xs font-black text-white leading-tight">${item.title}</div>
                  <div class="text-[10px] text-slate-400 mt-0.5 line-clamp-1">${item.sub}</div>
                </div>
              </button>
            `;
          }).join('')}

          <!-- 3'lü Kayıt Slotu Değiştirme Kartı -->
          <button type="button" onclick="document.getElementById('bottomSheet').classList.add('hidden'); window.openSingleStartMenu(true);" class="hd-menu-tile">
            <div class="flex items-center justify-between w-full mb-2">
              <div class="hd-icon-box" style="background:rgba(14,165,233,0.16); border:1px solid rgba(14,165,233,0.4);">
                ${getMenuVectorSVG('slots')}
              </div>
              <span class="text-[8.5px] font-extrabold text-sky-400 uppercase tracking-wider">KAYIT SİSTEMİ</span>
            </div>
            <div>
              <div class="text-xs font-black text-white leading-tight">Kayıt Slotları (Slot #${window.currentSelectedSlot})</div>
              <div class="text-[10px] text-slate-400 mt-0.5">Farklı karaktere geç veya yeni aç</div>
            </div>
          </button>
        </div>
      </div>
    `;
  }

  // 6. ANA OYUN FONKSİYONLARINI GÜVENLİ HALE GETİR VE KANCALA
  var _baseRenderAll = window.renderAll;
  if (typeof _baseRenderAll === 'function') {
    window.renderAll = renderAll = function () {
      purgeDuplicateStartScreens();
      window.healGameState();
      try { _baseRenderAll(); } catch (e) { console.error('RenderAll koruma devreye girdi:', e); }
    };
  }

  var _baseAdvanceAge = window.advanceAge;
  if (typeof _baseAdvanceAge === 'function') {
    window.advanceAge = advanceAge = function () {
      window.healGameState();
      try { _baseAdvanceAge(); } catch (e) { console.error('AdvanceAge koruma devreye girdi:', e); }
      window.healGameState();
    };
  }

  var _baseOpenNavSheet = window.openNavSheet;
  if (typeof _baseOpenNavSheet === 'function') {
    window.openNavSheet = openNavSheet = function (tab) {
      window.healGameState();
      _baseOpenNavSheet(tab);
      if (tab === 'menu') {
        rebuildMenuInto4KBentoHub();
      } else {
        window.deduplicateAndCleanUI();
      }
    };
  }

  var _baseOpenMenuSection = window.openMenuSection;
  if (typeof _baseOpenMenuSection === 'function') {
    window.openMenuSection = openMenuSection = function (sec) {
      window.healGameState();
      if (sec === 'casino' || sec === 'gambling') {
        window.openVIPCasinoModal('bonanza');
        return;
      }
      _baseOpenMenuSection(sec);
      window.deduplicateAndCleanUI();
      // Açılan alt pencerelerin başlığındaki emojileri de temizle
      var stTitle = document.getElementById('sheetTitle');
      if (stTitle) stTitle.textContent = stripAllEmojis(stTitle.textContent);
    };
  }

  // İlk açılışta eski ikinci giriş ekranını kaldır ve tekil menüyü göster
  purgeDuplicateStartScreens();
  setTimeout(function () {
    purgeDuplicateStartScreens();
    window.openSingleStartMenu(false);
  }, 60);
})();

/* ============================================================================
   MASTER EXECUTIVE OVERHAUL V5 (SADECE GAME.JS EN ALTINA YAPIŞTIRIN)
   1. Eski 2. Giriş Ekranını Tespit Edip DOM'dan Kalıcı Olarak Siler
   2. Tüm Oyundaki (HUD, Log, Kariyer, Finans, Menü, Modal) Emojileri Kazır
   3. Tüm Arayüzü 1. Sınıf Koyu Kurumsal (Executive Glass) Tasarıma Dönüştürür
   ============================================================================ */
(function () {
  if (window._masterExecutiveV5Loaded) return;
  window._masterExecutiveV5Loaded = true;

  // 1. GLOBAL EMOJİ SİLİCİ REGEX VE YARDIMCI FONKSİYONLAR
  var EMOJI_CLEAN_REGEX = /[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{200D}\u{FE0F}]/gu;

  window.stripEmojisGlobal = function (str) {
    if (typeof str !== 'string') return '';
    return str.replace(EMOJI_CLEAN_REGEX, '').replace(/\s{2,}/g, ' ').trim();
  };

  // DOM İçindeki Tüm Metin Düğümlerinden Emojileri Anında Kazır
  window.scrubAllEmojisInNode = function (root) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && EMOJI_CLEAN_REGEX.test(node.nodeValue)) {
        node.nodeValue = node.nodeValue.replace(EMOJI_CLEAN_REGEX, '').replace(/^\s+/, '');
      }
    }
  };

  // 2. 1. SINIF KURUMSAL (EXECUTIVE 4K) GLOBAL CSS TASARIMI
  var prevStyle = document.getElementById('pragmaticMasterAutoStyles');
  if (prevStyle) prevStyle.remove();

  var styleEl = document.createElement('style');
  styleEl.id = 'pragmaticMasterAutoStyles';
  styleEl.textContent = `
    /* İstenmeyen Harita ve Eski Barları Kaldır */
    #cityMapRootContainer, #menuMapSettingsBar, .avatar-ring-svg, .sticky-modal-hud {
      display: none !important;
    }

    /* Genel Oyun Zemini ve Tipografi Kalitesi */
    body, #appShell {
      background: radial-gradient(circle at 50% 0%, #0f172a 0%, #070b14 60%, #020617 100%) !important;
      color: #f8fafc !important;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
      letter-spacing: -0.01em;
    }

    /* Üst HUD ve Kartları 1. Sınıf Koyu Cam (Obsidian Glass) Yap */
    header, #topHud, .hud-card {
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(9, 13, 22, 0.98) 100%) !important;
      border-bottom: 1px solid rgba(56, 189, 248, 0.22) !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.65) !important;
    }

    /* Olay Geçmişi (Log) Kartlarını Modernize Et */
    #logContainer > div, #timeline > div, .log-entry-card {
      background: linear-gradient(145deg, rgba(15, 23, 42, 0.92) 0%, rgba(9, 13, 22, 0.96) 100%) !important;
      border: 1px solid rgba(148, 163, 184, 0.16) !important;
      border-left: 3.5px solid #38bdf8 !important;
      border-radius: 16px !important;
      box-shadow: 0 8px 22px rgba(0, 0, 0, 0.45) !important;
    }

    /* Alt Çekmece (Bottom Sheet) ve Olay Pencereleri (Event Modal) */
    #bottomSheet > div, #eventModal > div {
      background: linear-gradient(170deg, #0f172a 0%, #090d16 70%, #020617 100%) !important;
      border-top: 1.5px solid rgba(56, 189, 248, 0.35) !important;
      box-shadow: 0 -20px 60px rgba(0, 0, 0, 0.85) !important;
    }

    /* Çekmece İçindeki Tüm Standart Kartları ve Butonları Kaliteli Hale Getir */
    #sheetBody .rounded-2xl, #sheetBody .rounded-xl {
      border-color: rgba(148, 163, 184, 0.18) !important;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
    }

    #sheetBody button, #eventModal button {
      font-weight: 800 !important;
      letter-spacing: 0.01em !important;
      transition: transform 0.14s ease, filter 0.14s ease, border-color 0.14s ease !important;
    }
    #sheetBody button:active, #eventModal button:active {
      transform: scale(0.97) !important;
    }

    /* Tekil Sinematik Giriş Ekranı */
    .cinematic-main-menu {
      position: fixed; inset: 0; z-index: 99990;
      background:
        radial-gradient(circle at 20% 20%, rgba(14, 165, 233, 0.15) 0%, transparent 45%),
        radial-gradient(circle at 80% 80%, rgba(234, 179, 8, 0.12) 0%, transparent 45%),
        linear-gradient(180deg, #050811 0%, #0b1120 55%, #020617 100%);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 20px; overflow-y: auto;
    }
    .save-slot-card {
      width: 100%; max-width: 440px;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(7, 11, 20, 0.99) 100%);
      border: 1px solid rgba(56, 189, 248, 0.32); border-left: 4px solid #38bdf8;
      border-radius: 18px; padding: 15px 16px;
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      box-shadow: 0 14px 34px rgba(0, 0, 0, 0.75);
    }
    .char-creator-modal {
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(2, 6, 23, 0.95); backdrop-filter: blur(16px);
      display: flex; align-items: center; justify-content: center; padding: 16px; overflow-y: auto;
    }
    .char-creator-box {
      width: 100%; max-width: 450px;
      background: linear-gradient(165deg, #0f172a 0%, #090d16 70%, #172554 100%);
      border: 1.5px solid rgba(56, 189, 248, 0.5); border-radius: 26px; padding: 20px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.95);
    }
    .creator-preview-frame {
      width: 112px; height: 124px; border-radius: 20px; border: 2.5px solid #38bdf8;
      overflow: hidden; background: #0f172a; margin: 0 auto;
    }

    /* 4K Bento Menü Kartları */
    .hd-menu-hero-card {
      position: relative; overflow: hidden; border-radius: 20px; padding: 14px 16px;
      display: flex; align-items: center; justify-content: space-between; gap: 14px;
      cursor: pointer; box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6);
    }
    .hd-menu-bento-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .hd-menu-tile {
      background: linear-gradient(155deg, rgba(15, 23, 42, 0.96) 0%, rgba(9, 13, 22, 0.99) 100%);
      border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 18px; padding: 13px;
      display: flex; flex-direction: column; justify-content: space-between;
      min-height: 98px; text-align: left; cursor: pointer;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45);
    }
    .hd-icon-box {
      width: 40px; height: 40px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }

    /* Pragmatic Play 1:1 Slot Stilleri */
    .sb1000-cabinet { background: radial-gradient(circle at 15% 15%, rgba(255,255,255,0.45) 0%, transparent 35%), linear-gradient(180deg, #38bdf8 0%, #f472b6 48%, #ec4899 78%, #be185d 100%); border: 3px solid #fde047; border-radius: 22px; padding: 10px; box-shadow: 0 16px 40px rgba(190,24,93,0.55); }
    .sb1000-reel-frame { background: linear-gradient(180deg, rgba(255,245,250,0.96), rgba(252,231,243,0.94)); border: 4px solid #f59e0b; outline: 2px solid #ec4899; border-radius: 16px; padding: 6px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; }
    .sb1000-cell { aspect-ratio: 1/1; border-radius: 11px; background: radial-gradient(circle at 50% 35%, rgba(255,255,255,0.98), rgba(251,207,232,0.6)); border: 1px solid rgba(244,114,182,0.4); display: flex; align-items: center; justify-content: center; position: relative; padding: 3px; }
    .go1000-cabinet { background: radial-gradient(circle at 80% 18%, rgba(56,189,248,0.4) 0%, transparent 40%), linear-gradient(180deg, #1e1b4b 0%, #3b0764 52%, #172554 100%); border: 3px solid #facc15; border-radius: 22px; padding: 10px; box-shadow: 0 16px 40px rgba(0,0,0,0.8); }
    .go1000-reel-frame { background: linear-gradient(180deg, rgba(15,23,42,0.95), rgba(23,15,45,0.98)); border: 4px solid #eab308; outline: 2px solid #fef08a; border-radius: 16px; padding: 6px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; }
    .go1000-cell { aspect-ratio: 1/1; border-radius: 10px; background: radial-gradient(circle at 50% 35%, rgba(51,65,85,0.8), rgba(15,23,42,0.96)); border: 1px solid rgba(250,204,21,0.3); display: flex; align-items: center; justify-content: center; position: relative; padding: 3px; }
    .cell-tumble-win { background: radial-gradient(circle, #fef08a 0%, #f59e0b 75%, #b45309 100%) !important; border: 2px solid #ffffff !important; box-shadow: 0 0 18px #facc15 !important; transform: scale(1.07); z-index: 5; }
    .pragmatic-top-banner { background: linear-gradient(90deg, #991b1b 0%, #dc2626 50%, #991b1b 100%); border: 2px solid #fde047; border-radius: 999px; padding: 5px 14px; text-align: center; color: #ffffff; font-weight: 900; font-size: 11px; letter-spacing: 0.04em; }
    .pragmatic-bottom-hud { background: rgba(9,13,22,0.95); border: 1.5px solid rgba(255,255,255,0.16); border-radius: 18px; padding: 10px; color: #ffffff; }
    .pragmatic-spin-btn { width: 62px; height: 62px; border-radius: 999px; background: radial-gradient(circle at 30% 25%, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%); border: 4px solid #facc15; box-shadow: 0 0 22px rgba(250,204,21,0.75); color: #0f172a; font-size: 26px; font-weight: 900; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
    .bet-manual-input { background: #020617; border: 1.5px solid #facc15; border-radius: 10px; color: #fde047; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 900; padding: 5px 8px; width: 100%; text-align: center; outline: none; }
  `;
  document.head.appendChild(styleEl);

  // 3. ESKİ 2. GİRİŞ EKRANINI BULUP DOM'DAN KALICI OLARAK SİLEN AKILLI TARAYICI
  window.destroyAllLegacyStartScreens = function () {
    // A) Bilinen tüm başlangıç ekranı ID'lerini doğrudan sil
    ['startModal', 'introModal', 'newGameModal', 'welcomeModal', 'setupModal', 'startScreen', 'newLifeModal', 'birthModal', 'createModal', 'onboardingModal'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });

    // B) ID'si farklı olsa bile sayfadaki tüm fixed/modal katmanları tara;
    // içinde isim/cinsiyet/ülke inputu veya "Yeni Hayat / Hayata Başla" butonu olan eski giriş ekranını bul ve sil!
    var candidates = document.querySelectorAll('.fixed, [class*="inset-0"], [id*="Modal"], [id*="Screen"]');
    candidates.forEach(function (el) {
      if (!el || !el.parentNode) return;
      var id = el.id || '';
      if (id === 'cinematicMainMenuRoot' || id === 'charCreatorModalRoot' || id === 'appShell' || id === 'bottomSheet' || id === 'eventModal') return;

      var txt = (el.innerText || '').toLowerCase();
      var hasInputs = el.querySelectorAll('input, select').length >= 1;
      if (hasInputs && (txt.indexOf('hayat') !== -1 || txt.indexOf('başla') !== -1 || txt.indexOf('karakter') !== -1 || txt.indexOf('isim') !== -1 || txt.indexOf('adın') !== -1 || txt.indexOf('ülke') !== -1 || txt.indexOf('cinsiyet') !== -1)) {
        el.remove();
      }
    });

    // C) Eğer eski giriş ekranı #eventModal içine çizildiyse ve oyun yeni başlıyorsa onu da kapat
    var evModal = document.getElementById('eventModal');
    if (evModal && !evModal.classList.contains('hidden')) {
      var evTxt = (evModal.innerText || '').toLowerCase();
      if (evModal.querySelectorAll('input, select').length >= 1 || evTxt.indexOf('yeni hayat') !== -1 || evTxt.indexOf('karakter oluştur') !== -1) {
        evModal.classList.add('hidden');
      }
    }

    // D) Ana oyun kabuğunu (#appShell) görünür tut
    var shell = document.getElementById('appShell');
    if (shell) shell.classList.remove('hidden');
  };

  // Orijinal oyunun eski giriş ekranı açma fonksiyonlarını etkisizleştir
  ['openStartModal', 'showStartModal', 'openNewGameModal', 'showNewGameModal', 'openIntroModal', 'initStartScreen'].forEach(function (fnName) {
    if (typeof window[fnName] === 'function') {
      window[fnName] = function () { window.destroyAllLegacyStartScreens(); };
    }
  });

  // 4. ALT NAVİGASYON BARINDAKİ EMOJİLERİ SİLİP 4K VEKTÖREL İKONLARA DÖNÜŞTÜRME
  function upgradeBottomNavBarToVectors() {
    var navButtons = document.querySelectorAll('nav button, footer button, [onclick*="openNavSheet"], #ageBtn, [onclick*="advanceAge"]');
    navButtons.forEach(function (btn) {
      if (btn.dataset.vectorUpgraded === '1') return;
      var oc = (btn.getAttribute('onclick') || '') + ' ' + (btn.id || '') + ' ' + (btn.innerText || '');
      var lower = oc.toLowerCase();

      var svgIcon = '';
      var cleanLabel = '';

      if (lower.indexOf('career') !== -1 || lower.indexOf('kariyer') !== -1 || lower.indexOf('iş') !== -1) {
        cleanLabel = 'Kariyer';
        svgIcon = '<svg viewBox="0 0 24 24" class="w-5 h-5 mx-auto mb-0.5" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="2" y1="13" x2="22" y2="13"/></svg>';
      } else if (lower.indexOf('finance') !== -1 || lower.indexOf('finans') !== -1 || lower.indexOf('서vet') !== -1 || lower.indexOf('para') !== -1) {
        cleanLabel = 'Finans';
        svgIcon = '<svg viewBox="0 0 24 24" class="w-5 h-5 mx-auto mb-0.5" fill="none" stroke="#10b981" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
      } else if (lower.indexOf('advanceage') !== -1 || lower.indexOf('agebtn') !== -1 || lower.indexOf('+1') !== -1 || lower.indexOf('yaş') !== -1) {
        btn.dataset.vectorUpgraded = '1';
        btn.innerHTML = '<div class="flex flex-col items-center justify-center leading-none"><span class="text-sm font-black tracking-wider text-slate-950">+1 YAŞ</span><span class="text-[8.5px] font-extrabold text-slate-900 uppercase mt-0.5">İLERLE</span></div>';
        return;
      } else if (lower.indexOf('rel') !== -1 || lower.indexOf('ilişki') !== -1 || lower.indexOf('aile') !== -1 || lower.indexOf('sosyal') !== -1) {
        cleanLabel = 'İlişkiler';
        svgIcon = '<svg viewBox="0 0 24 24" class="w-5 h-5 mx-auto mb-0.5" fill="none" stroke="#f43f5e" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
      } else if (lower.indexOf('menu') !== -1 || lower.indexOf('menü') !== -1) {
        cleanLabel = 'Yönetim';
        svgIcon = '<svg viewBox="0 0 24 24" class="w-5 h-5 mx-auto mb-0.5" fill="none" stroke="#facc15" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>';
      }

      if (svgIcon && cleanLabel) {
        btn.dataset.vectorUpgraded = '1';
        btn.innerHTML = svgIcon + '<span class="text-[10px] font-extrabold tracking-wide text-slate-200 block">' + cleanLabel + '</span>';
      }
    });
  }

  // 5. KAYIT SLOTU YÜKLEME VE YENİ KARAKTER BAŞLATMAYI ORİJİNAL KAYIT ANAHTARIYLA EŞİTLE
  function syncWithOriginalGameStorage(gameObj) {
    try {
      // Orijinal saveGame fonksiyonunun kullandığı localStorage anahtarını bul ve oraya da yaz
      if (typeof window.saveGame === 'function') {
        var fnText = window.saveGame.toString();
        var m = fnText.match(/setItem\(\s*['"]([^'"]+)['"]/);
        if (m && m[1]) {
          localStorage.setItem(m[1], JSON.stringify(gameObj));
        }
      }
    } catch (e) {}
  }

  window.loadGameFromSlot = function (sNum) {
    window.currentSelectedSlot = sNum;
    var raw = localStorage.getItem(window.getSlotStorageKey(sNum));
    if (!raw) {
      window.openCharacterCreatorModal(sNum);
      return;
    }
    try {
      var loaded = JSON.parse(raw);
      var fallback = window.createCompleteValidGameObject(loaded);
      var merged = Object.assign(fallback, loaded);
      if (!Array.isArray(merged.logs) || merged.logs.length === 0) merged.logs = fallback.logs;

      try { G = merged; } catch (e) {}
      window.G = merged;
      window._gameEnteredSuccessfully = true;

      syncWithOriginalGameStorage(merged);
      window.closeAllStartOverlaysAndEnterGame();
      window.destroyAllLegacyStartScreens();
      if (typeof window.healGameState === 'function') window.healGameState();
      if (typeof saveGame === 'function') saveGame();
      if (typeof renderAll === 'function') renderAll();
      window.scrubAllEmojisInNode(document.body);
      upgradeBottomNavBarToVectors();
      if (typeof showToast === 'function') showToast('Kayıt Slotu 0' + sNum + ' aktif edildi.');
    } catch (err) {
      window.openCharacterCreatorModal(sNum);
    }
  };

  window.finalizeAndStartNewLife = function () {
    var ni = document.getElementById('creatorInputName');
    var si = document.getElementById('creatorInputSurname');
    if (ni && ni.value.trim()) window.creationState.firstName = ni.value.trim();
    if (si && si.value.trim()) window.creationState.lastName = si.value.trim();

    var newG = window.createCompleteValidGameObject(window.creationState);
    try { G = newG; } catch (e) {}
    window.G = newG;
    window._gameEnteredSuccessfully = true;

    try { localStorage.setItem(window.getSlotStorageKey(window.currentSelectedSlot), JSON.stringify(newG)); } catch (e) {}
    syncWithOriginalGameStorage(newG);

    window.closeAllStartOverlaysAndEnterGame();
    window.destroyAllLegacyStartScreens();
    if (typeof window.healGameState === 'function') window.healGameState();
    if (typeof saveGame === 'function') saveGame();
    if (typeof renderAll === 'function') renderAll();
    window.scrubAllEmojisInNode(document.body);
    upgradeBottomNavBarToVectors();
    if (typeof showToast === 'function') showToast('Hoş geldin ' + newG.firstName + ' ' + newG.lastName);
  };

  // 6. TÜM OYUN FONKSİYONLARINI (LOG, TOAST, MODAL, RENDER) EMOJİSİZ HALE GETİR
  var _rawAddLog = window.addLog;
  if (typeof _rawAddLog === 'function') {
    window.addLog = addLog = function (age, text, type) {
      var cleanText = window.stripEmojisGlobal(String(text || ''));
      return _rawAddLog(age, cleanText, type);
    };
  }

  var _rawShowToast = window.showToast;
  if (typeof _rawShowToast === 'function') {
    window.showToast = showToast = function (msg) {
      return _rawShowToast(window.stripEmojisGlobal(String(msg || '')));
    };
  }

  var _rawOpenEventModal = window.openEventModal;
  if (typeof _rawOpenEventModal === 'function') {
    window.openEventModal = openEventModal = function (cfg) {
      if (cfg) {
        if (cfg.badge) cfg.badge = window.stripEmojisGlobal(cfg.badge);
        if (cfg.title) cfg.title = window.stripEmojisGlobal(cfg.title);
        if (cfg.desc) cfg.desc = window.stripEmojisGlobal(cfg.desc);
        if (cfg.npc && cfg.npc.name) cfg.npc.name = window.stripEmojisGlobal(cfg.npc.name);
        if (cfg.npc && cfg.npc.avatar) cfg.npc.avatar = 'ID';
        if (Array.isArray(cfg.choices)) {
          cfg.choices.forEach(function (ch) {
            if (ch && ch.label) ch.label = window.stripEmojisGlobal(ch.label);
          });
        }
      }
      _rawOpenEventModal(cfg);
      var evEl = document.getElementById('eventModal');
      if (evEl) window.scrubAllEmojisInNode(evEl);
    };
  }

  var _prevRenderAllV5 = window.renderAll;
  if (typeof _prevRenderAllV5 === 'function') {
    window.renderAll = renderAll = function () {
      window.destroyAllLegacyStartScreens();
      if (typeof window.healGameState === 'function') window.healGameState();
      // Mevcut geçmiş loglardaki eski emojileri de temizle
      if (typeof G !== 'undefined' && G && Array.isArray(G.logs)) {
        G.logs.forEach(function (lg) {
          if (lg && Array.isArray(lg.items)) {
            lg.items.forEach(function (it) {
              if (it && typeof it.text === 'string') it.text = window.stripEmojisGlobal(it.text);
            });
          }
        });
      }
      try { _prevRenderAllV5(); } catch (e) {}
      window.destroyAllLegacyStartScreens();
      window.scrubAllEmojisInNode(document.body);
      upgradeBottomNavBarToVectors();
    };
  }

  // 7. CANLI DOM GÖZLEMCİSİ (MUTATION OBSERVER):
  // Hangi sekme açılırsa açılsın ekrana düşen her türlü emojiyi ve 2. giriş ekranını 0 sn'de temizler!
  var domObserver = new MutationObserver(function (mutations) {
    window.destroyAllLegacyStartScreens();
    mutations.forEach(function (m) {
      if (m.addedNodes && m.addedNodes.length > 0) {
        m.addedNodes.forEach(function (n) {
          if (n.nodeType === 1) window.scrubAllEmojisInNode(n);
          else if (n.nodeType === 3 && EMOJI_CLEAN_REGEX.test(n.nodeValue)) {
            n.nodeValue = n.nodeValue.replace(EMOJI_CLEAN_REGEX, '');
          }
        });
      }
    });
  });

  if (document.body) {
    domObserver.observe(document.body, { childList: true, subtree: true });
    window.destroyAllLegacyStartScreens();
    window.scrubAllEmojisInNode(document.body);
    upgradeBottomNavBarToVectors();
  }
})();

/* ============================================================================
   MASTER PATCH V6: TAM ONARIM, 0 YAŞ BAŞLANGIÇ, ANA EKRAN YILLIK GÜNLÜK,
   KAPATMA (✕) TUŞU TAMİRİ, GERÇEK KREDİ KARTI SİSTEMİ & ROYAL CASINO MENÜ
   ============================================================================ */
(function () {
  if (window._masterPatchV6Applied) return;
  window._masterPatchV6Applied = true;

  // 1. ÖNCEKİ YAMADAKİ KAPATMA (✕) TUŞUNU SİLEN HATALI FİLTREYİ DEVRE DIŞI BIRAK
  window.scrubAllEmojisInNode = function () {};
  window.stripEmojisGlobal = function (str) { return String(str || ''); };

  // 2. ROYAL CASINO (MOR / ALTIN / NEON PEMBE) MENÜ & ARAYÜZ TASARIMI
  var oldSt = document.getElementById('pragmaticMasterAutoStyles');
  if (oldSt) oldSt.remove();

  var st = document.createElement('style');
  st.id = 'pragmaticMasterAutoStyles';
  st.textContent = `
    #cityMapRootContainer, #menuMapSettingsBar, .avatar-ring-svg, .sticky-modal-hud {
      display: none !important;
    }

    /* Her Pencerede Görünür Altın Kapatma (✕ KAPAT) Butonu */
    .royal-close-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 4px !important;
      padding: 7px 13px !important;
      border-radius: 12px !important;
      background: linear-gradient(135deg, #be185d 0%, #881337 100%) !important;
      border: 1.5px solid #fde047 !important;
      color: #ffffff !important;
      font-size: 11.5px !important;
      font-weight: 900 !important;
      box-shadow: 0 4px 14px rgba(190, 24, 93, 0.5) !important;
      cursor: pointer !important;
      z-index: 50 !important;
      flex-shrink: 0 !important;
    }
    .royal-close-btn:active { transform: scale(0.94) !important; }

    /* Alt Çekmece (Bottom Sheet) Royal Casino Teması */
    #bottomSheet > div {
      background:
        radial-gradient(circle at 85% 10%, rgba(236, 72, 153, 0.18) 0%, transparent 40%),
        radial-gradient(circle at 15% 20%, rgba(250, 204, 21, 0.12) 0%, transparent 40%),
        linear-gradient(175deg, #2e1065 0%, #1e1b4b 45%, #090d16 100%) !important;
      border-top: 2.5px solid #facc15 !important;
      box-shadow: 0 -20px 60px rgba(0, 0, 0, 0.9) !important;
    }

    /* Royal Casino Menü Kartları */
    .royal-hero-card {
      position: relative; overflow: hidden;
      background: linear-gradient(135deg, #701a75 0%, #3b0764 55%, #1e1b4b 100%);
      border: 2px solid #fde047;
      border-radius: 20px; padding: 14px 16px;
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      box-shadow: 0 12px 30px rgba(112, 26, 117, 0.5), inset 0 0 20px rgba(250, 204, 21, 0.15);
      cursor: pointer; transition: transform 0.15s ease;
    }
    .royal-hero-card:active { transform: scale(0.98); }

    .royal-bento-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
    }
    .royal-menu-tile {
      position: relative; overflow: hidden;
      background: linear-gradient(150deg, rgba(74, 4, 78, 0.78) 0%, rgba(30, 27, 75, 0.92) 60%, rgba(15, 23, 42, 0.98) 100%);
      border: 1.5px solid rgba(250, 204, 21, 0.42);
      border-radius: 18px; padding: 13px;
      display: flex; flex-direction: column; justify-content: space-between;
      min-height: 96px; text-align: left; cursor: pointer;
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.15);
      transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .royal-menu-tile:hover {
      transform: translateY(-2px);
      border-color: #fde047;
      box-shadow: 0 12px 28px rgba(236, 72, 153, 0.35);
    }
    .royal-menu-tile:active { transform: scale(0.96); }

    .royal-tile-badge {
      display: inline-block;
      padding: 2px 7px; border-radius: 999px;
      background: rgba(250, 204, 21, 0.18);
      border: 1px solid rgba(250, 204, 21, 0.45);
      color: #fde047; font-size: 8.5px; font-weight: 900;
      letter-spacing: 0.04em; text-transform: uppercase;
    }

    /* Gerçekçi VIP Kredi Kartı Görseli */
    .vip-credit-card-visual {
      background:
        radial-gradient(circle at 85% 20%, rgba(250, 204, 21, 0.32) 0%, transparent 45%),
        radial-gradient(circle at 15% 85%, rgba(236, 72, 153, 0.28) 0%, transparent 45%),
        linear-gradient(135deg, #1e1b4b 0%, #3b0764 50%, #090d16 100%);
      border: 2px solid #facc15;
      border-radius: 22px; padding: 16px;
      color: #ffffff;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.75), inset 0 0 24px rgba(250, 204, 21, 0.12);
      position: relative; overflow: hidden;
    }
    .card-chip-gold {
      width: 40px; height: 30px; border-radius: 7px;
      background: linear-gradient(135deg, #fde047 0%, #ca8a04 100%);
      border: 1px solid #fef08a;
      box-shadow: inset 0 0 6px rgba(0,0,0,0.4);
    }

    /* Ana Ekran Yıllık Olay Günlüğü Kartları */
    .year-log-block {
      background: linear-gradient(145deg, rgba(30, 27, 75, 0.75) 0%, rgba(15, 23, 42, 0.94) 100%);
      border: 1px solid rgba(250, 204, 21, 0.28);
      border-left: 4px solid #facc15;
      border-radius: 16px; padding: 12px 14px;
      margin-bottom: 10px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45);
    }

    /* Giriş Ekranı ve Slot Stilleri */
    .cinematic-main-menu { position: fixed; inset: 0; z-index: 99990; background: radial-gradient(circle at 50% 20%, #3b0764 0%, #0f172a 55%, #020617 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; overflow-y: auto; }
    .save-slot-card { width: 100%; max-width: 440px; background: linear-gradient(135deg, rgba(46, 16, 101, 0.9) 0%, rgba(15, 23, 42, 0.98) 100%); border: 1.5px solid rgba(250, 204, 21, 0.45); border-left: 5px solid #facc15; border-radius: 18px; padding: 15px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 0 14px 34px rgba(0,0,0,0.75); }
    .char-creator-modal { position: fixed; inset: 0; z-index: 99999; background: rgba(2, 6, 23, 0.95); backdrop-filter: blur(16px); display: flex; align-items: center; justify-content: center; padding: 16px; overflow-y: auto; }
    .char-creator-box { width: 100%; max-width: 450px; background: linear-gradient(165deg, #3b0764 0%, #1e1b4b 55%, #090d16 100%); border: 2px solid #fde047; border-radius: 26px; padding: 20px; box-shadow: 0 25px 60px rgba(0,0,0,0.95); }
    .creator-preview-frame { width: 112px; height: 124px; border-radius: 20px; border: 2.5px solid #fde047; overflow: hidden; background: #0f172a; margin: 0 auto; }

    /* Sweet Bonanza 1000 & Gates of Olympus 1000 */
    .sb1000-cabinet { background: radial-gradient(circle at 15% 15%, rgba(255,255,255,0.45) 0%, transparent 35%), linear-gradient(180deg, #38bdf8 0%, #f472b6 48%, #ec4899 78%, #be185d 100%); border: 3px solid #fde047; border-radius: 22px; padding: 10px; }
    .sb1000-reel-frame { background: linear-gradient(180deg, rgba(255,245,250,0.96), rgba(252,231,243,0.94)); border: 4px solid #f59e0b; outline: 2px solid #ec4899; border-radius: 16px; padding: 6px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; }
    .sb1000-cell { aspect-ratio: 1/1; border-radius: 11px; background: radial-gradient(circle at 50% 35%, rgba(255,255,255,0.98), rgba(251,207,232,0.6)); border: 1px solid rgba(244,114,182,0.4); display: flex; align-items: center; justify-content: center; position: relative; padding: 3px; }
    .go1000-cabinet { background: radial-gradient(circle at 80% 18%, rgba(56,189,248,0.4) 0%, transparent 40%), linear-gradient(180deg, #1e1b4b 0%, #3b0764 52%, #172554 100%); border: 3px solid #facc15; border-radius: 22px; padding: 10px; }
    .go1000-reel-frame { background: linear-gradient(180deg, rgba(15,23,42,0.95), rgba(23,15,45,0.98)); border: 4px solid #eab308; outline: 2px solid #fef08a; border-radius: 16px; padding: 6px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; }
    .go1000-cell { aspect-ratio: 1/1; border-radius: 10px; background: radial-gradient(circle at 50% 35%, rgba(51,65,85,0.8), rgba(15,23,42,0.96)); border: 1px solid rgba(250,204,21,0.3); display: flex; align-items: center; justify-content: center; position: relative; padding: 3px; }
    .cell-tumble-win { background: radial-gradient(circle, #fef08a 0%, #f59e0b 75%, #b45309 100%) !important; border: 2px solid #ffffff !important; box-shadow: 0 0 18px #facc15 !important; transform: scale(1.07); z-index: 5; }
    .pragmatic-top-banner { background: linear-gradient(90deg, #991b1b 0%, #dc2626 50%, #991b1b 100%); border: 2px solid #fde047; border-radius: 999px; padding: 5px 14px; text-align: center; color: #ffffff; font-weight: 900; font-size: 11px; }
    .pragmatic-bottom-hud { background: rgba(9,13,22,0.95); border: 1.5px solid rgba(250,204,21,0.35); border-radius: 18px; padding: 10px; color: #ffffff; }
    .pragmatic-spin-btn { width: 62px; height: 62px; border-radius: 999px; background: radial-gradient(circle at 30% 25%, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%); border: 4px solid #facc15; box-shadow: 0 0 22px rgba(250,204,21,0.75); color: #0f172a; font-size: 26px; font-weight: 900; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
    .bet-manual-input { background: #020617; border: 1.5px solid #facc15; border-radius: 10px; color: #fde047; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 900; padding: 5px 8px; width: 100%; text-align: center; outline: none; }
  `;
  document.head.appendChild(st);

  // 3. TÜM PENCERELERDE KAPATMA (✕ KAPAT) TUŞUNU GARANTİ ALTINA ALAN FONKSİYON
  window.closeBottomSheetSafe = function () {
    var sheet = document.getElementById('bottomSheet');
    if (sheet) sheet.classList.add('hidden');
    if (typeof closeSheet === 'function') {
      try { closeSheet(); } catch (e) {}
    }
  };

  window.ensureCloseButtonsVisible = function () {
    var sheet = document.getElementById('bottomSheet');
    if (sheet) {
      // Mevcut kapatma tuşu varsa içini ve görünümünü onar
      var existingClose = sheet.querySelector('#closeSheetBtn, #sheetClose, [onclick*="closeSheet"], [onclick*="bottomSheet"]');
      if (existingClose) {
        existingClose.innerHTML = '✕ KAPAT';
        existingClose.className = 'royal-close-btn';
        existingClose.onclick = window.closeBottomSheetSafe;
      } else {
        // Yoksa başlığın sağ üstüne doğrudan yerleştir
        var titleEl = document.getElementById('sheetTitle');
        if (titleEl && titleEl.parentNode) {
          var headerRow = titleEl.parentNode.parentNode || titleEl.parentNode;
          if (!headerRow.querySelector('.royal-close-btn')) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'royal-close-btn';
            btn.innerHTML = '✕ KAPAT';
            btn.onclick = window.closeBottomSheetSafe;
            headerRow.appendChild(btn);
          }
        }
      }
    }
  };

  // 4. 0 YAŞINDAN BAŞLAYAN VE ANA EKRAN GÜNLÜĞÜ (LOGS) TAM UYUMLU OYUN NESNESİ
  window.createCompleteValidGameObject = function (opts) {
    opts = opts || {};
    var c = window.getCountry();
    var baseWage = c.monthlyMinWage || 22104;
    // Varsayılan başlangıç yaşı: 0 YAŞ (Bebeklik)!
    var startAge = typeof opts.age === 'number' ? opts.age : 0;
    var startMoney = typeof opts.money === 'number' ? opts.money : (startAge === 0 ? 0 : Math.round(baseWage * 2));
    var fName = opts.firstName || 'Çağatay';
    var lName = opts.lastName || 'Kılıç';
    var bCity = opts.birthCity || 'İstanbul';

    var birthLogText = '👶 **DÜNYAYA GELDİN:** **' + bCity + '** şehrinde **' + fName + ' ' + lName + '** adıyla hayata gözlerini açtın!';
    var familyLogText = '👨‍👩‍👦 **AİLE OCAĞI:** Ailen seni sevgiyle kucakladı. Çocukluk yılların başlıyor (+1 Yaş butonuna basarak büyü!).';

    // Hem grup (items/events) hem düz (text) şemayı aynı anda destekleyen Evrensel Log Yapısı
    var initialLogs = [
      {
        age: startAge,
        text: birthLogText,
        type: 'milestone',
        items: [
          { text: birthLogText, type: 'milestone' },
          { text: familyLogText, type: 'good' }
        ],
        events: [
          { text: birthLogText, type: 'milestone' },
          { text: familyLogText, type: 'good' }
        ]
      }
    ];

    return {
      firstName: fName, lastName: lName, gender: opts.gender || 'Erkek',
      age: startAge, countryId: 'TR', birthCity: bCity, portraitIdx: 0,
      money: startMoney, bankSavings: 0, savings: 0, loanDebt: 0, mortgageDebt: 0, creditScore: 1350,
      health: 95, happy: 90, smart: randInt(70, 92), intel: 82, looks: randInt(72, 92), fame: 0, stress: 0,
      energy: 100, maxEnergy: 100,
      eduStage: startAge < 6 ? 'Bebeklik' : (startAge < 14 ? 'İlköğretim' : (startAge < 18 ? 'Lise' : 'Üniversite')),
      uniYears: 0, uniGrad: false,
      jobId: null, jobExp: 0, jobPerf: 70, inPrison: false, prisonYears: 0, criminalRecord: false, alive: true,
      licenses: { B: false, CE: false }, houses: [], cars: [], businesses: [],
      stockHoldings: {}, cryptoHoldings: {}, stocks: {}, crypto: {},
      spouse: null, lover: null, children: [], achievements: [],
      relations: [
        { id: 'rel_mom', name: 'Anne (' + lName + ')', role: 'Anne', rel: 'Anne', type: 'parent', love: 95, relation: 95, age: 28 + startAge, alive: true },
        { id: 'rel_dad', name: 'Baba (' + lName + ')', role: 'Baba', rel: 'Baba', type: 'parent', love: 92, relation: 92, age: 31 + startAge, alive: true }
      ],
      logs: initialLogs,
      charLook: {
        skinId: opts.skinId || 'skin_wheat', hairStyleId: opts.hairStyleId || 'fade_crop',
        hairColorId: opts.hairColorId || 'hc_darkbrown', beardStyleId: opts.beardStyleId || 'beard_stubble',
        browStyleId: 'brow_natural', eyeColorId: opts.eyeColorId || 'eye_hazel',
        outfitId: opts.outfitId || 'out_tshirt', glassesId: 'gl_none', yearsSinceHaircut: 0
      },
      creditCard: {
        hasCard: true,
        tierId: 'gold',
        tierName: 'Royal Gold Card',
        limitMult: 3.5,
        debt: 0,
        bonusPoints: 250,
        lastPaidAge: startAge
      }
    };
  };

  // 5. ANA EKRANDA YILLIK YAPILANLARIN (LOGS) HER ZAMAN YAZMASINI GARANTİ EDEN MOTOR
  window.normalizeAndRepairLogs = function () {
    if (typeof G === 'undefined' || !G) return;
    if (!Array.isArray(G.logs)) G.logs = [];

    if (G.logs.length === 0) {
      var initTxt = '🌟 **' + (G.firstName || 'Oyuncu') + ' ' + (G.lastName || '') + '** (' + (G.birthCity || 'İstanbul') + ') — Hayat yolculuğun devam ediyor.';
      G.logs.push({
        age: G.age || 0,
        text: initTxt,
        type: 'milestone',
        items: [{ text: initTxt, type: 'milestone' }],
        events: [{ text: initTxt, type: 'milestone' }]
      });
    }

    // Her log kaydının hem grup (items) hem düz (text) özelliğini doldur ki orijinal renderLogs asla hata vermesin!
    G.logs.forEach(function (entry) {
      if (!entry) return;
      if (typeof entry.age !== 'number') entry.age = G.age || 0;
      if (Array.isArray(entry.items) && entry.items.length > 0 && !entry.text) {
        entry.text = entry.items.map(function (x) { return x.text || x; }).join(' • ');
        entry.type = entry.items[0].type || 'normal';
      } else if (entry.text && (!Array.isArray(entry.items) || entry.items.length === 0)) {
        entry.items = [{ text: entry.text, type: entry.type || 'normal' }];
      }
      if (!Array.isArray(entry.events)) entry.events = entry.items || [];
    });
  };

  window.renderGuaranteedMainTimeline = function () {
    if (typeof G === 'undefined' || !G) return;
    window.normalizeAndRepairLogs();

    // Ana ekrandaki log kutusunu bul
    var logBox = document.getElementById('logContainer') ||
                 document.getElementById('eventLog') ||
                 document.getElementById('timeline') ||
                 document.getElementById('logsContainer') ||
                 document.getElementById('lifeLog');

    if (!logBox) return;

    // Eğer orijinal renderAll() log kutusunu boş bıraktıysa veya bozuk çizdiyse biz çizelim!
    var currentText = (logBox.innerText || '').trim();
    if (currentText.length < 10 || logBox.children.length === 0 || logBox.dataset.royalTimeline === '1') {
      logBox.dataset.royalTimeline = '1';

      // Yaşlara göre grupla (En son yaş en üstte veya kronolojik)
      var groupedByAge = {};
      var ageOrder = [];
      G.logs.forEach(function (lg) {
        var a = typeof lg.age === 'number' ? lg.age : 0;
        if (!groupedByAge[a]) {
          groupedByAge[a] = [];
          ageOrder.push(a);
        }
        if (Array.isArray(lg.items) && lg.items.length > 0) {
          lg.items.forEach(function (it) {
            var t = typeof it === 'string' ? it : (it && it.text ? it.text : '');
            if (t && groupedByAge[a].indexOf(t) === -1) groupedByAge[a].push(t);
          });
        } else if (lg.text) {
          if (groupedByAge[a].indexOf(lg.text) === -1) groupedByAge[a].push(lg.text);
        }
      });

      // En güncel yaş en üstte görünsün
      ageOrder.sort(function (a, b) { return b - a; });

      logBox.innerHTML = ageOrder.map(function (ageNum) {
        var lines = groupedByAge[ageNum] || [];
        return `
          <div class="year-log-block">
            <div class="flex items-center justify-between border-b border-amber-400/25 pb-1.5 mb-2">
              <span class="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono-num text-[11px] font-black">
                ${ageNum} YAŞ
              </span>
              <span class="text-[10px] font-bold text-amber-300/80 uppercase tracking-wider">
                ${ageNum < 6 ? 'Bebeklik Dönemi' : (ageNum < 14 ? 'İlköğretim Yılları' : (ageNum < 18 ? 'Lise & Gençlik' : 'Yetişkinlik & Kariyer'))}
              </span>
            </div>
            <div class="space-y-1.5 text-xs text-slate-100 leading-relaxed">
              ${lines.map(function (line) {
                var formatted = String(line).replace(/\*\*([^*]+)\*\*/g, '<strong class="text-amber-300 font-extrabold">$1</strong>');
                return '<div class="flex items-start gap-2"><span class="text-amber-400 mt-0.5">▸</span><span>' + formatted + '</span></div>';
              }).join('')}
            </div>
          </div>
        `;
      }).join('');
    }
  };

  // addLog fonksiyonunu her zaman G.logs'a hatasız yazacak şekilde güçlendir
  var _prevAddLogV6 = window.addLog;
  window.addLog = addLog = function (ageOrText, maybeText, maybeType) {
    if (typeof G === 'undefined' || !G) return;
    window.normalizeAndRepairLogs();

    var ageVal = typeof ageOrText === 'number' ? ageOrText : (G.age || 0);
    var txtVal = typeof ageOrText === 'number' ? String(maybeText || '') : String(ageOrText || '');
    var typeVal = (typeof ageOrText === 'number' ? maybeType : maybeText) || 'normal';

    if (!txtVal) return;

    // Önce orijinal addLog'u dene
    var prevLen = G.logs.length;
    if (typeof _prevAddLogV6 === 'function') {
      try { _prevAddLogV6(ageVal, txtVal, typeVal); } catch (e) {}
    }

    // Aynı yaşa ait grup varsa içine de ekle, yoksa yeni yaş bloğu aç
    var existingAgeBlock = G.logs.find(function (x) { return x && x.age === ageVal; });
    if (existingAgeBlock) {
      if (!Array.isArray(existingAgeBlock.items)) existingAgeBlock.items = [];
      var alreadyIn = existingAgeBlock.items.some(function (i) { return (i.text || i) === txtVal; });
      if (!alreadyIn) {
        existingAgeBlock.items.push({ text: txtVal, type: typeVal });
        existingAgeBlock.text = existingAgeBlock.items.map(function (i) { return i.text || i; }).join(' • ');
      }
    } else if (G.logs.length === prevLen) {
      G.logs.push({
        age: ageVal,
        text: txtVal,
        type: typeVal,
        items: [{ text: txtVal, type: typeVal }],
        events: [{ text: txtVal, type: typeVal }]
      });
    }

    window.renderGuaranteedMainTimeline();
  };

  // +1 Yaş ilerlediğinde çocukluk/okul/hayat olaylarının ana ekrana yazılmasını garanti et
  var _prevAdvanceAgeV6 = window.advanceAge;
  window.advanceAge = advanceAge = function () {
    if (typeof G === 'undefined' || !G) return;
    var oldAge = G.age || 0;

    if (typeof _prevAdvanceAgeV6 === 'function') {
      try { _prevAdvanceAgeV6(); } catch (e) {}
    }
    if ((G.age || 0) === oldAge) {
      G.age = oldAge + 1;
    }

    // Eğitim kademesini yaşa göre güncelle
    if (G.age === 6) {
      G.eduStage = 'İlkokul';
      window.addLog(G.age, '🎒 **OKULA BAŞLADIN:** İlkokul 1. sınıfa başladın! Okuma yazmayı söküyorsun.', 'milestone');
    } else if (G.age === 14) {
      G.eduStage = 'Lise';
      window.addLog(G.age, '🏫 **LİSE YILLARI:** Liseye geçtin! Arkadaş çevren ve hedeflerin şekilleniyor.', 'milestone');
    } else if (G.age === 18) {
      G.eduStage = 'Üniversite / Kariyer';
      var gift = Math.round(window.getCountry().monthlyMinWage * 1.5);
      G.money = (G.money || 0) + gift;
      window.addLog(G.age, '🎓 **18 YAŞ REŞİTLİK:** Artık reşitsin! Ailen başlangıç harçlığı olarak **' + window.fmtMoney(gift) + '** verdi. Ehliyet, üniversite, iş ve kredi kartı kapıları açıldı!', 'milestone');
    }

    // O yaşta hiç günlük satırı oluşmadıysa yaşa uygun özet satırı ekle
    var hasLogForThisAge = G.logs && G.logs.some(function (x) { return x && x.age === G.age; });
    if (!hasLogForThisAge) {
      if (G.age < 6) {
        var babyLogs = [
          '🍼 Ailenle birlikte sağlıklı ve neşeli bir yıl geçirdin (+Mutluluk).',
          '🧸 İlk kelimelerini söyledin ve evin içinde koşuşturmaya başladın!',
          '🎨 Oyun parkında yeni arkadaşlar edindin, zekan gelişiyor.'
        ];
        window.addLog(G.age, babyLogs[G.age % babyLogs.length], 'good');
      } else if (G.age < 18) {
        var schoolLogs = [
          '📚 Derslerine çalıştın ve okulda başarılı bir dönem geçirdin.',
          '⚽ Okul bahçesinde arkadaşlarınla maç yaptın, enerjin tavan yaptı!',
          '🏆 Karnende takdir belgesi alarak aileni gururlandırdın!'
        ];
        window.addLog(G.age, schoolLogs[G.age % schoolLogs.length], 'good');
      } else {
        window.addLog(G.age, '📅 **' + G.age + ' yaşına** girdin. Yeni fırsatlar ve kararlar seni bekliyor.', 'normal');
      }
    }

    // Kredi kartı yıllık faiz / Findeks güncellemesi
    window.processAnnualCreditCardTurn();
    window.renderGuaranteedMainTimeline();
    if (typeof renderAll === 'function') renderAll();
  };

  // 6. GERÇEK VIP KREDİ KARTI & FİNDEKS BANKACILIK SİSTEMİ
  var CREDIT_CARD_TIERS = [
    { id: 'classic', name: 'Royal Classic Card', minFindeks: 0, limitMult: 2.0, cashbackRate: 0.02 },
    { id: 'gold', name: 'Royal Gold Card', minFindeks: 1250, limitMult: 4.5, cashbackRate: 0.04 },
    { id: 'platinum', name: 'Royal Platinum VIP', minFindeks: 1500, limitMult: 10.0, cashbackRate: 0.06 },
    { id: 'black', name: 'Royal World Black 4K', minFindeks: 1720, limitMult: 25.0, cashbackRate: 0.10 }
  ];

  window.ensureCreditCardState = function () {
    if (typeof G === 'undefined' || !G) return;
    if (!G.creditCard) {
      G.creditCard = {
        hasCard: true,
        tierId: 'gold',
        tierName: 'Royal Gold Card',
        limitMult: 4.5,
        debt: 0,
        bonusPoints: 500,
        lastPaidAge: G.age || 18
      };
    }
    // Eski fxGold içindeki kredi kartı borcunu buraya birleştir ve sıfırla
    if (G.fxGold && G.fxGold.ccStatementDebt > 0) {
      G.creditCard.debt += G.fxGold.ccStatementDebt;
      G.fxGold.ccStatementDebt = 0;
    }
  };

  window.processAnnualCreditCardTurn = function () {
    if (typeof G === 'undefined' || !G) return;
    window.ensureCreditCardState();
    var cc = G.creditCard;
    if (cc.debt > 0) {
      var interest = Math.round(cc.debt * 0.24);
      cc.debt += interest;
      G.creditScore = Math.max(600, (G.creditScore || 1350) - 35);
      window.addLog(G.age, '💳 **KREDİ KARTI EKSTRESİ:** Ödenmeyen dönem borcuna **' + window.fmtMoney(interest) + '** akdi faiz işledi. Toplam borç: **' + window.fmtMoney(cc.debt) + '**.', 'bad');
    } else if (G.age >= 18) {
      G.creditScore = Math.min(1900, (G.creditScore || 1350) + 15);
    }
  };

  window.openCreditCardCenterModal = function () {
    window.ensureCreditCardState();
    var sheet = document.getElementById('bottomSheet');
    if (!sheet) return;
    sheet.classList.remove('hidden');

    document.getElementById('sheetTitle').textContent = '💳 Royal Bank VIP Kredi Kartı Merkezi';
    document.getElementById('sheetSubtitle').textContent = 'Findeks Kredi Notu: ' + (G.creditScore || 1350) + ' / 1900 • Nakit: ' + window.fmtMoney(G.money);

    var c = window.getCountry();
    var cc = G.creditCard;
    var totalLimit = Math.round(c.monthlyMinWage * cc.limitMult);
    var availLimit = Math.max(0, totalLimit - cc.debt);
    var minPay = Math.round(cc.debt * 0.20);
    var shopAmt = Math.round(c.monthlyMinWage * 0.50);
    var cashAdvAmt = Math.round(c.monthlyMinWage * 1.0);

    document.getElementById('sheetBody').innerHTML = `
      <div class="space-y-3 pb-4">
        <!-- Gerçekçi Çipli VIP Kredi Kartı Görseli -->
        <div class="vip-credit-card-visual space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[9px] font-black text-amber-300 uppercase tracking-widest">ROYAL BANK OF TURKEY • WORLD VIP</div>
              <div class="text-sm font-black text-white">${cc.tierName}</div>
            </div>
            <div class="card-chip-gold"></div>
          </div>

          <div class="font-mono-num text-base font-black tracking-widest text-amber-200">
            5406 •••• •••• ${1000 + ((G.age || 18) * 37) % 8999}
          </div>

          <div class="grid grid-cols-3 gap-2 pt-1 border-t border-white/15 text-[10px]">
            <div>
              <span class="text-slate-400 block">KART SAHİBİ</span>
              <strong class="text-white uppercase truncate block">${G.firstName} ${G.lastName}</strong>
            </div>
            <div>
              <span class="text-slate-400 block">KULLANILABİLİR LİMİT</span>
              <strong class="text-emerald-400 font-mono-num">${window.fmtMoney(availLimit)}</strong>
            </div>
            <div class="text-right">
              <span class="text-slate-400 block">TOPLAM LİMİT</span>
              <strong class="text-amber-300 font-mono-num">${window.fmtMoney(totalLimit)}</strong>
            </div>
          </div>
        </div>

        <!-- Ekstre, Borç ve WorldPuan Özeti -->
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="p-2.5 rounded-2xl bg-slate-950/90 border border-rose-500/40">
            <div class="text-[9px] font-bold text-rose-300 uppercase">DÖNEM BORCU</div>
            <div class="text-xs font-mono-num font-black text-white mt-0.5">${window.fmtMoney(cc.debt)}</div>
          </div>
          <div class="p-2.5 rounded-2xl bg-slate-950/90 border border-amber-400/40">
            <div class="text-[9px] font-bold text-amber-300 uppercase">ASGARİ ÖDEME (%20)</div>
            <div class="text-xs font-mono-num font-black text-white mt-0.5">${window.fmtMoney(minPay)}</div>
          </div>
          <div class="p-2.5 rounded-2xl bg-slate-950/90 border border-emerald-400/40">
            <div class="text-[9px] font-bold text-emerald-300 uppercase">WORLDPUAN (ÖDÜL)</div>
            <div class="text-xs font-mono-num font-black text-emerald-400 mt-0.5">${window.fmtMoney(cc.bonusPoints)}</div>
          </div>
        </div>

        <!-- Kredi Kartı İşlem Butonları -->
        <div class="space-y-2">
          <div class="text-[10px] font-black text-amber-300 uppercase tracking-wider px-1">KART İŞLEMLERİ &amp; HARCAMA</div>
          <div class="grid grid-cols-2 gap-2">
            <button onclick="window.execCreditCardAction('shop', ${shopAmt})" class="p-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-700 border border-amber-300/50 text-left">
              <div class="text-xs font-black text-white">🛍️ VIP Alışveriş Yap</div>
              <div class="text-[10px] text-amber-200 font-mono-num">${window.fmtMoney(shopAmt)} (+Mutluluk &amp; Puan)</div>
            </button>
            <button onclick="window.execCreditCardAction('cash_advance', ${cashAdvAmt})" class="p-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-700 border border-sky-300/50 text-left">
              <div class="text-xs font-black text-white">💵 Nakit Avans Çek</div>
              <div class="text-[10px] text-sky-200 font-mono-num">+${window.fmtMoney(cashAdvAmt)} Cüzdana Geçer</div>
            </button>
          </div>

          <div class="text-[10px] font-black text-emerald-300 uppercase tracking-wider px-1 pt-1">BORÇ ÖDEME &amp; LİMİT YÜKSELTME</div>
          <div class="grid grid-cols-2 gap-2">
            <button onclick="window.execCreditCardAction('pay_full', 0)" class="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-left">
              <div class="text-xs font-black">✅ Tüm Borcu Kapat</div>
              <div class="text-[10px] font-extrabold">${window.fmtMoney(cc.debt)} (+30 Findeks Puanı)</div>
            </button>
            <button onclick="window.execCreditCardAction('pay_min', 0)" class="p-3 rounded-2xl bg-slate-900 border border-amber-400/50 text-left">
              <div class="text-xs font-black text-amber-300">⏳ Asgari Tutar Öde (%20)</div>
              <div class="text-[10px] text-slate-300 font-mono-num">${window.fmtMoney(minPay)} Öde</div>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button onclick="window.execCreditCardAction('upgrade_limit', 0)" class="p-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black">
              🚀 Kart Limitini Yükselt
            </button>
            <button onclick="window.execCreditCardAction('redeem_points', 0)" class="p-2.5 rounded-xl bg-purple-600 border border-amber-300 text-white text-xs font-black">
              🎁 Puanları Nakite Çevir
            </button>
          </div>
        </div>
      </div>
    `;
    window.ensureCloseButtonsVisible();
  };

  window.execCreditCardAction = function (act, amount) {
    window.ensureCreditCardState();
    var c = window.getCountry();
    var cc = G.creditCard;
    var totalLimit = Math.round(c.monthlyMinWage * cc.limitMult);
    var availLimit = Math.max(0, totalLimit - cc.debt);

    if (act === 'shop') {
      if (availLimit < amount) { showToast('Kart kullanılabilir limitin yetersiz!'); return; }
      cc.debt += amount;
      var earnedPts = Math.round(amount * 0.06);
      cc.bonusPoints += earnedPts;
      G.happy = Math.min(100, (G.happy || 75) + 8);
      G.looks = Math.min(100, (G.looks || 75) + 3);
      window.addLog(G.age, '💳 **KREDİ KARTI HARCAMASI:** Kartınla **' + window.fmtMoney(amount) + '** tutarında lüks alışveriş yaptın (+8 Mutluluk, +' + window.fmtMoney(earnedPts) + ' WorldPuan).', 'good');
    } else if (act === 'cash_advance') {
      if (availLimit < amount) { showToast('Nakit avans için kart limitin yetersiz!'); return; }
      var fee = Math.round(amount * 0.05);
      cc.debt += (amount + fee);
      G.money += amount;
      window.addLog(G.age, '💵 **TAKSiTLİ NAKİT AVANS:** Kredi kartından **+' + window.fmtMoney(amount) + '** nakit avans çekip cüzdanına aktardın.', 'normal');
    } else if (act === 'pay_full') {
      if (cc.debt <= 0) { showToast('Kredi kartı borcun bulunmuyor!'); return; }
      if (G.money < cc.debt) { showToast('Tüm borcu kapatmak için nakit bakiyen yetersiz!'); return; }
      var paid = cc.debt;
      G.money -= paid;
      cc.debt = 0;
      G.creditScore = Math.min(1900, (G.creditScore || 1350) + 30);
      window.addLog(G.age, '✅ **KART EKSTRESİ KAPATILDI:** **' + window.fmtMoney(paid) + '** kredi kartı borcunun tamamını ödedin! Findeks notun **' + G.creditScore + '** puana yükseldi.', 'good');
    } else if (act === 'pay_min') {
      if (cc.debt <= 0) { showToast('Kredi kartı borcun bulunmuyor!'); return; }
      var minPay = Math.max(100, Math.round(cc.debt * 0.20));
      if (G.money < minPay) { showToast('Asgari ödeme için nakit yetersiz!'); return; }
      G.money -= minPay;
      cc.debt -= minPay;
      G.creditScore = Math.min(1900, (G.creditScore || 1350) + 5);
      window.addLog(G.age, '💳 **ASGARİ ÖDEME YAPILDI:** Kredi kartı borcunun asgari tutarı olan **' + window.fmtMoney(minPay) + '** ödendi.', 'normal');
    } else if (act === 'upgrade_limit') {
      var score = G.creditScore || 1350;
      if (cc.debt > totalLimit * 0.5) {
        showToast('Limit artışı için önce mevcut kart borcunun en az yarısını kapatmalısın!');
        return;
      }
      cc.limitMult = Number((cc.limitMult * 1.6).toFixed(1));
      if (score >= 1700) cc.tierName = 'Royal World Black 4K';
      else if (score >= 1500) cc.tierName = 'Royal Platinum VIP';
      else cc.tierName = 'Royal Gold Plus Card';
      var newLim = Math.round(c.monthlyMinWage * cc.limitMult);
      window.addLog(G.age, '🚀 **KREDİ KARTI LİMİT ARTIŞI:** Banka talebini onayladı! Yeni kartın **' + cc.tierName + '**, yeni limitin **' + window.fmtMoney(newLim) + '** oldu!', 'fame');
    } else if (act === 'redeem_points') {
      if (cc.bonusPoints <= 0) { showToast('Birikmiş WorldPuan bulunmuyor!'); return; }
      var pts = cc.bonusPoints;
      G.money += pts;
      cc.bonusPoints = 0;
      showToast('🎁 +' + window.fmtMoney(pts) + ' WorldPuan cüzdanına nakit aktarıldı!');
    }

    if (typeof saveGame === 'function') saveGame();
    if (typeof renderAll === 'function') renderAll();
    window.openCreditCardCenterModal();
  };

  // 7. BEĞENDİĞİN CASINO RENKLERİYLE (MOR / ALTIN / NEON) YENİLENMİŞ YÖNETİM MENÜSÜ
  window.renderRoyalCasinoStyledMenu = function () {
    var body = document.getElementById('sheetBody');
    if (!body || !G) return;
    window.ensureCreditCardState();

    var titleEl = document.getElementById('sheetTitle');
    var subEl = document.getElementById('sheetSubtitle');
    if (titleEl) titleEl.textContent = '👑 ROYAL VIP YÖNETİM & YAŞAM MERKEZİ';
    if (subEl) subEl.textContent = G.firstName + ' ' + G.lastName + ' (' + G.age + ' Yaş) • Bakiye: ' + window.fmtMoney(G.money);

    // Orijinal menünün alt sekmelerini oku (hiçbir özellik kaybolmasın)
    var rawButtons = Array.from(body.querySelectorAll('button'));
    var seen = {};
    var menuCards = [];

    rawButtons.forEach(function (btn) {
      var oc = (btn.getAttribute('onclick') || '').trim();
      if (!oc) return;
      if (/casino|gambling|openVIPCasinoModal|openBarberAndSalonModal|openCreditCardCenterModal|openSingleStartMenu/.test(oc)) return;
      if (seen[oc]) return;
      seen[oc] = true;

      var lines = btn.innerText.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      var title = lines[0] || 'Bölüm';
      var desc = lines[1] || 'Görüntüle ve yönet';

      menuCards.push({
        onclick: oc.replace(/"/g, '&quot;'),
        title: title,
        desc: desc
      });
    });

    var c = window.getCountry();
    var ccLimit = Math.round(c.monthlyMinWage * (G.creditCard.limitMult || 4.5));

    body.innerHTML = `
      <div class="space-y-3 pb-5">
        <!-- 1. VİTRİN: PRAGMATIC PLAY VIP CASINO (SWEET BONANZA & OLYMPUS) -->
        <div onclick="window.openVIPCasinoModal('bonanza')" class="royal-hero-card">
          <div>
            <span class="royal-tile-badge">🎰 PRAGMATIC PLAY LIVE LOUNGE</span>
            <div class="text-base font-black text-white mt-1">VIP Royal Casino &amp; Slot Merkezi</div>
            <div class="text-xs text-amber-200">Sweet Bonanza 1000 • Gates of Olympus 1000 • Blackjack</div>
          </div>
          <span class="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-950 text-xs font-black shrink-0 shadow-lg">
            OYNA &rarr;
          </span>
        </div>

        <!-- 2. VİTRİN: ROYAL BANK VIP KREDİ KARTI & FİNDEKS MERKEZİ -->
        <div onclick="window.openCreditCardCenterModal()" class="royal-hero-card" style="background: linear-gradient(135deg, #1e1b4b 0%, #3b0764 55%, #831843 100%);">
          <div>
            <span class="royal-tile-badge">💳 ROYAL BANK WORLD VIP</span>
            <div class="text-base font-black text-white mt-1">Kredi Kartı, Nakit Avans &amp; Limit</div>
            <div class="text-xs text-pink-200">Kart Limitin: ${window.fmtMoney(ccLimit)} • Borç: ${window.fmtMoney(G.creditCard.debt)}</div>
          </div>
          <span class="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-black shrink-0 shadow-lg">
            KARTIM &rarr;
          </span>
        </div>

        <!-- 3. VİTRİN: KARAKTER, BERBER, KUAFÖR & STİL STÜDYOSU -->
        <div onclick="if(typeof openBarberAndSalonModal==='function') openBarberAndSalonModal();" class="royal-hero-card" style="background: linear-gradient(135deg, #311042 0%, #1e1b4b 60%, #0f172a 100%);">
          <div>
            <span class="royal-tile-badge">💈 KARAKTER &amp; STİL STÜDYOSU</span>
            <div class="text-base font-black text-white mt-1">VIP Kuaför, Saç Boyama &amp; Kombin</div>
            <div class="text-xs text-sky-200">Mevcut Karizma / Görünüm: %${G.looks}</div>
          </div>
          <span class="px-3.5 py-2.5 rounded-xl bg-sky-400 text-slate-950 text-xs font-black shrink-0 shadow-lg">
            AYNA &rarr;
          </span>
        </div>

        <!-- TÜM OYUN BÖLÜMLERİ (CASINO RENKLERİNDE ROYAL BENTO KARTLAR) -->
        <div class="royal-bento-grid">
          ${menuCards.map(function (mc) {
            return `
              <button type="button" onclick="${mc.onclick}" class="royal-menu-tile">
                <div class="flex items-center justify-between w-full mb-1.5">
                  <span class="royal-tile-badge">VIP BÖLÜM</span>
                  <span class="text-amber-300 font-black text-xs">&rarr;</span>
                </div>
                <div>
                  <div class="text-xs font-black text-white leading-snug">${mc.title}</div>
                  <div class="text-[10px] text-pink-200/80 mt-0.5 line-clamp-1">${mc.desc}</div>
                </div>
              </button>
            `;
          }).join('')}

          <!-- 0 Yaşından Yeni Karakter / Kayıt Slotu Değiştirme Kartı -->
          <button type="button" onclick="window.closeBottomSheetSafe(); window.openSingleStartMenu(true);" class="royal-menu-tile">
            <div class="flex items-center justify-between w-full mb-1.5">
              <span class="royal-tile-badge">3 KAYIT SLOTU</span>
              <span class="text-amber-300 font-black text-xs">🔄</span>
            </div>
            <div>
              <div class="text-xs font-black text-white leading-snug">Kayıt Slotları &amp; 0 Yaş Yeni Hayat</div>
              <div class="text-[10px] text-amber-200/80 mt-0.5">Aktif Slot #0${window.currentSelectedSlot || 1} • Değiştir / Sıfırla</div>
            </div>
          </button>
        </div>
      </div>
    `;
    window.ensureCloseButtonsVisible();
  };

  // 8. FİNANS SEKMESİNE GERÇEK KREDİ KARTI KUTUSUNU EKLE VE ESKİ BOZUK KARTI TEMİZLE
  var _prevOpenNavV6 = window.openNavSheet;
  window.openNavSheet = openNavSheet = function (tab) {
    if (typeof _prevOpenNavV6 === 'function') _prevOpenNavV6(tab);
    window.ensureCloseButtonsVisible();

    if (tab === 'menu') {
      window.renderRoyalCasinoStyledMenu();
    } else if (tab === 'finance') {
      window.ensureCreditCardState();
      var body = document.getElementById('sheetBody');
      if (body) {
        // Eski yarım kredi kartı satırlarını temizle, yerine tam VIP Kredi Kartı girişini koy
        var oldCcBox = document.getElementById('financeRoyalCreditCardBanner');
        if (oldCcBox) oldCcBox.remove();

        var c = window.getCountry();
        var cc = G.creditCard;
        var lim = Math.round(c.monthlyMinWage * cc.limitMult);

        body.insertAdjacentHTML('afterbegin', `
          <div id="financeRoyalCreditCardBanner" onclick="window.openCreditCardCenterModal()" class="royal-hero-card mb-3">
            <div>
              <span class="royal-tile-badge">💳 ${cc.tierName} • FİNDEKS: ${G.creditScore || 1350}</span>
              <div class="text-sm font-black text-white mt-1">VIP Kredi Kartı &amp; Nakit Avans Merkezi</div>
              <div class="text-[11px] text-amber-200">Limit: ${window.fmtMoney(lim)} • Dönem Borcu: ${window.fmtMoney(cc.debt)}</div>
            </div>
            <span class="px-3 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shrink-0">YÖNET &rarr;</span>
          </div>
        `);
      }
    }
  };

  var _prevOpenMenuSecV6 = window.openMenuSection;
  window.openMenuSection = openMenuSection = function (sec) {
    if (typeof _prevOpenMenuSecV6 === 'function') _prevOpenMenuSecV6(sec);
    window.ensureCloseButtonsVisible();
  };

  var _prevRenderAllV6 = window.renderAll;
  window.renderAll = renderAll = function () {
    if (typeof window.destroyAllLegacyStartScreens === 'function') window.destroyAllLegacyStartScreens();
    if (typeof window.healGameState === 'function') window.healGameState();
    window.normalizeAndRepairLogs();
    if (typeof _prevRenderAllV6 === 'function') {
      try { _prevRenderAllV6(); } catch (e) {}
    }
    window.renderGuaranteedMainTimeline();
    window.ensureCloseButtonsVisible();
  };

  // İlk yüklemede ana ekran günlüğünü ve kapatma tuşlarını hemen aktif et
  setTimeout(function () {
    if (typeof G !== 'undefined' && G) {
      window.ensureCreditCardState();
      window.renderGuaranteedMainTimeline();
      window.ensureCloseButtonsVisible();
    }
  }, 120);
})();

/* ============================================================================
   1. ÜST PROFİL (HUD) YENİLEYİCİ
   2. DEKONT & MANŞET TARZI YILLIK GÜNLÜK MOTORU
   3. GARAJ, EMLAK VE FİNANS SHOWROOM (VİTRİN) DÖNÜŞTÜRÜCÜSÜ
   ============================================================================ */
(function () {
  if (window._hudTimelineShowroomV7Loaded) return;
  window._hudTimelineShowroomV7Loaded = true;

  // 1. ÜST PROFİL (HUD) ALANINI DİJİTAL KİMLİK VE NEON STAT BARLARINA YÜKSELT
  window.renderExecutiveHUDPanel = function () {
    if (typeof G === 'undefined' || !G) return;

    var logBox = document.getElementById('logContainer') ||
                 document.getElementById('eventLog') ||
                 document.getElementById('timeline');
    if (!logBox || !logBox.parentNode) return;

    var hudPanel = document.getElementById('execCustomHudBanner');
    if (!hudPanel) {
      hudPanel = document.createElement('div');
      hudPanel.id = 'execCustomHudBanner';
      logBox.parentNode.insertBefore(hudPanel, logBox);
    }

    var netWorth = typeof getNetWorth === 'function' ? getNetWorth() : (G.money + (G.bankSavings || 0));
    var jobLabel = G.jobId ? 'Aktif Kariyer' : (G.eduStage || 'Serbest');
    var hVal = Math.max(0, Math.min(100, Math.round(G.health || 90)));
    var pVal = Math.max(0, Math.min(100, Math.round(G.happy || 85)));
    var sVal = Math.max(0, Math.min(100, Math.round(G.smart || G.intel || 78)));
    var lVal = Math.max(0, Math.min(100, Math.round(G.looks || 78)));

    hudPanel.innerHTML = `
      <div class="exec-hud-identity-bar">
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono-num text-[9.5px] font-black">
              ${G.age || 0} YAŞ
            </span>
            <span class="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider truncate">
              ${G.birthCity || 'İstanbul'} • ${jobLabel}
            </span>
          </div>
          <div class="text-sm font-black text-white truncate mt-0.5">
            ${G.firstName || 'Çağatay'} ${G.lastName || 'Kılıç'}
          </div>
          <div class="text-[10px] text-slate-400 font-mono-num">
            Net Servet: <strong class="text-sky-300">${window.fmtMoney(netWorth)}</strong> • Findeks: <strong class="text-amber-300">${G.creditScore || 1350}</strong>
          </div>
        </div>

        <div onclick="openNavSheet('finance')" class="exec-wallet-pill cursor-pointer shrink-0" title="Finans Merkezini Aç">
          <div class="text-[8.5px] font-black text-emerald-300 uppercase tracking-wider">NAKİT CÜZDAN</div>
          <div class="text-xs font-mono-num font-black text-white">${window.fmtMoney(G.money)}</div>
        </div>
      </div>

      <div class="exec-stat-grid mb-2.5">
        <div class="exec-stat-card">
          <div class="flex justify-between items-center text-[9.5px] font-extrabold">
            <span class="text-emerald-300">SAĞLIK</span>
            <span class="font-mono-num text-white">%${hVal}</span>
          </div>
          <div class="exec-stat-bar-track">
            <div class="exec-stat-bar-fill" style="width:${hVal}%; background:linear-gradient(90deg,#10b981,#34d399);"></div>
          </div>
        </div>

        <div class="exec-stat-card">
          <div class="flex justify-between items-center text-[9.5px] font-extrabold">
            <span class="text-amber-300">MUTLULUK</span>
            <span class="font-mono-num text-white">%${pVal}</span>
          </div>
          <div class="exec-stat-bar-track">
            <div class="exec-stat-bar-fill" style="width:${pVal}%; background:linear-gradient(90deg,#f59e0b,#fde047);"></div>
          </div>
        </div>

        <div class="exec-stat-card">
          <div class="flex justify-between items-center text-[9.5px] font-extrabold">
            <span class="text-sky-300">ZEKA</span>
            <span class="font-mono-num text-white">%${sVal}</span>
          </div>
          <div class="exec-stat-bar-track">
            <div class="exec-stat-bar-fill" style="width:${sVal}%; background:linear-gradient(90deg,#0284c7,#38bdf8);"></div>
          </div>
        </div>

        <div class="exec-stat-card">
          <div class="flex justify-between items-center text-[9.5px] font-extrabold">
            <span class="text-pink-300">KARİZMA</span>
            <span class="font-mono-num text-white">%${lVal}</span>
          </div>
          <div class="exec-stat-bar-track">
            <div class="exec-stat-bar-fill" style="width:${lVal}%; background:linear-gradient(90deg,#db2777,#f472b6);"></div>
          </div>
        </div>
      </div>
    `;
  };

  // 2. ANA EKRAN YILLIK OLAYLARINI "BANKA DEKONTU" VE "MANŞET" OLARAK ÇİZEN MOTOR
  function formatSingleLogEntryToCard(rawLine) {
    var text = String(rawLine || '').trim();
    if (!text) return '';

    var htmlFormatted = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-amber-300 font-extrabold">$1</strong>');
    var lower = text.toLowerCase();

    // A) İçinde Para Tutarı (₺) veya Finansal İşlem Geçiyorsa -> BANKA DEKONTU KARTI
    var moneyMatch = text.match(/([+-]?\s*\d[\d.,]*\s*₺)/);
    var isFinancial = moneyMatch || /maaş|kredi|borç|ekstre|faiz|avans|satın|kazanç|kira|temettü|vergi/.test(lower);

    if (isFinancial && moneyMatch) {
      var amtStr = moneyMatch[1].trim();
      var isExpense = amtStr.indexOf('-') !== -1 || /ödedin|borç|faiz|gider|ceza|vergi|kaybettin/.test(lower);
      var signPrefix = (!isExpense && amtStr.indexOf('+') === -1) ? '+' : (isExpense && amtStr.indexOf('-') === -1 ? '-' : '');

      return `
        <div class="log-dekont-card ${isExpense ? 'expense' : ''}">
          <div class="min-w-0">
            <div class="text-[8.5px] font-black uppercase tracking-widest ${isExpense ? 'text-rose-300' : 'text-emerald-300'}">
              ${isExpense ? '🧾 HESAP ÇIKIŞ DEKONTU' : '🏦 HESAP GİRİŞ DEKONTU'}
            </div>
            <div class="text-[11.5px] text-slate-100 leading-snug mt-0.5">${htmlFormatted}</div>
          </div>
          <span class="dekont-amount-badge ${isExpense ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}">
            ${signPrefix}${amtStr}
          </span>
        </div>
      `;
    }

    // B) Önemli Dönüm Noktasıysa -> MEDYA MANŞETİ KARTI
    var isHeadline = /dünyaya geldin|okula başladın|lise|reşitlik|mezun|evlendin|çocuğun|şampiyon|mega win|süper kazanç|terfi|holding|yeni hayat/.test(lower);
    if (isHeadline) {
      return `
        <div class="log-manset-card">
          <span class="manset-kicker">📰 ÖZEL MANŞET • DÖNÜM NOKTASI</span>
          <div class="text-xs text-white font-bold leading-snug">${htmlFormatted}</div>
        </div>
      `;
    }

    // C) Standart Yıllık Yaşam Kaydı
    return `
      <div class="log-standard-row">
        <span class="text-amber-400 font-black text-xs mt-0.5">◈</span>
        <div class="text-[11.5px] text-slate-200 leading-snug">${htmlFormatted}</div>
      </div>
    `;
  }

  window.renderGuaranteedMainTimeline = function () {
    if (typeof G === 'undefined' || !G) return;
    if (typeof window.normalizeAndRepairLogs === 'function') window.normalizeAndRepairLogs();
    window.renderExecutiveHUDPanel();

    var logBox = document.getElementById('logContainer') ||
                 document.getElementById('eventLog') ||
                 document.getElementById('timeline') ||
                 document.getElementById('logsContainer') ||
                 document.getElementById('lifeLog');
    if (!logBox) return;

    var groupedByAge = {};
    var ageOrder = [];
    (G.logs || []).forEach(function (lg) {
      if (!lg) return;
      var a = typeof lg.age === 'number' ? lg.age : 0;
      if (!groupedByAge[a]) {
        groupedByAge[a] = [];
        ageOrder.push(a);
      }
      if (Array.isArray(lg.items) && lg.items.length > 0) {
        lg.items.forEach(function (it) {
          var t = typeof it === 'string' ? it : (it && it.text ? it.text : '');
          if (t && groupedByAge[a].indexOf(t) === -1) groupedByAge[a].push(t);
        });
      } else if (lg.text) {
        if (groupedByAge[a].indexOf(lg.text) === -1) groupedByAge[a].push(lg.text);
      }
    });

    ageOrder.sort(function (a, b) { return b - a; });

    logBox.innerHTML = ageOrder.map(function (ageNum) {
      var lines = groupedByAge[ageNum] || [];
      var periodBadge = ageNum < 6 ? 'BEBEKLİK DÖNEMİ' : (ageNum < 14 ? 'İLKÖĞRETİM YILLARI' : (ageNum < 18 ? 'LİSE & GENÇLİK' : 'KARİYER & YETİŞKİNLİK'));

      return `
        <div class="year-log-block">
          <div class="flex items-center justify-between border-b border-amber-400/25 pb-2 mb-2.5">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-mono-num text-[11px] font-black shadow">
                ${ageNum} YAŞ RAPORU
              </span>
              <span class="text-[9.5px] font-extrabold text-amber-200/80 uppercase tracking-wider">${periodBadge}</span>
            </div>
            <span class="text-[9.5px] font-mono-num text-slate-400">${lines.length} Kayıt</span>
          </div>
          <div class="space-y-2">
            ${lines.map(formatSingleLogEntryToCard).join('')}
          </div>
        </div>
      `;
    }).join('');
  };

  // 3. GARAJ (34 TR PLAKALI OTO GALERİ) VE EMLak (TAPU SHOWROOM) DÖNÜŞTÜRÜCÜSÜ
  window.upgradeSectionToShowroom = function (secName) {
    var body = document.getElementById('sheetBody');
    if (!body || !G || !window.SHOWROOM_ASSETS_DB) return;

    var s = String(secName || '').toLowerCase();
    var isCars = /car|garage|araç|galeri|oto/.test(s);
    var isHouses = /house|real|emlak|konut|mülk|ev/.test(s);

    if (!isCars && !isHouses) return;

    // Üste Showroom Özet Banner'ı Ekle
    if (!document.getElementById('showroomTopHeroBanner')) {
      var ownedCount = isCars ? (G.cars ? G.cars.length : 0) : (G.houses ? G.houses.length : 0);
      var bannerHtml = isCars ? `
        <div id="showroomTopHeroBanner" class="showroom-header-banner flex items-center justify-between">
          <div>
            <div class="text-[9px] font-black text-sky-300 uppercase tracking-widest">🏎️ EXECUTIVE MOTORS &amp; EKSPERTİZ VİTRİNİ</div>
            <div class="text-sm font-black text-white mt-0.5">34 Plaka Özel Tescilli Araç Showroom'u</div>
            <div class="text-[10.5px] text-slate-300">Garajındaki Araç Sayısı: <strong class="text-amber-300">${ownedCount} Adet</strong></div>
          </div>
          <div class="tr-license-plate">
            <span class="tr-plate-blue">TR</span>
            <span class="tr-plate-num">34 CK 001</span>
          </div>
        </div>
      ` : `
        <div id="showroomTopHeroBanner" class="showroom-header-banner flex items-center justify-between" style="border-color:rgba(16,185,129,0.5);">
          <div>
            <div class="text-[9px] font-black text-emerald-300 uppercase tracking-widest">🏛️ T.C. TAPU &amp; GAYRİMENKUL YATIRIM VİTRİNİ</div>
            <div class="text-sm font-black text-white mt-0.5">Kira Getirili Konut, Rezidans &amp; Yalova/Boğaz Portföyü</div>
            <div class="text-[10.5px] text-slate-300">Tapulu Mülk Sayısı: <strong class="text-emerald-300">${ownedCount} Mülk</strong></div>
          </div>
          <span class="tapu-roi-badge">📜 E-TAPU ONAYLI</span>
        </div>
      `;
      body.insertAdjacentHTML('afterbegin', bannerHtml);
    }

    // Mevcut kartları bozmadan her birinin içine vektörel çizim, 34 Plaka veya Tapu rozeti yerleştir
    var cards = body.querySelectorAll('.rounded-2xl, .rounded-xl');
    var idx = 0;
    cards.forEach(function (card) {
      if (card.id === 'showroomTopHeroBanner' || card.dataset.showroomUpgraded === '1') return;
      var hasBtn = card.querySelector('button[onclick]');
      if (!hasBtn) return;

      card.dataset.showroomUpgraded = '1';
      card.classList.add('showroom-item-card');

      var cardText = card.innerText || '';
      if (isCars) {
        var cMeta = window.SHOWROOM_ASSETS_DB.getCarMeta(cardText, idx++);
        var svgCar = window.SHOWROOM_ASSETS_DB.carVectors[cMeta.type];
        card.insertAdjacentHTML('afterbegin', `
          <div class="flex items-center justify-between gap-2.5 mb-2 pb-2 border-b border-slate-800/80">
            <div class="showroom-visual-box">${svgCar}</div>
            <div class="flex-1 min-w-0">
              <span class="text-[8.5px] font-black text-sky-400 uppercase tracking-wider block">${cMeta.seg}</span>
              <span class="text-[10px] font-extrabold text-amber-300 block">${cMeta.hp}</span>
            </div>
            <div class="tr-license-plate">
              <span class="tr-plate-blue">TR</span>
              <span class="tr-plate-num">${cMeta.plate}</span>
            </div>
          </div>
        `);
      } else if (isHouses) {
        var hMeta = window.SHOWROOM_ASSETS_DB.getHouseMeta(cardText);
        var svgHouse = window.SHOWROOM_ASSETS_DB.houseVectors[hMeta.type];
        card.insertAdjacentHTML('afterbegin', `
          <div class="flex items-center justify-between gap-2.5 mb-2 pb-2 border-b border-slate-800/80">
            <div class="showroom-visual-box">${svgHouse}</div>
            <div class="flex-1 min-w-0">
              <span class="tapu-roi-badge mb-1">${hMeta.tapu}</span>
              <span class="text-[10px] text-slate-300 block">${hMeta.yieldText}</span>
            </div>
          </div>
        `);
      }
    });
  };

  // Kancaları Bağla
  var _prevOpenMenuSecV7 = window.openMenuSection;
  window.openMenuSection = openMenuSection = function (sec) {
    if (typeof _prevOpenMenuSecV7 === 'function') _prevOpenMenuSecV7(sec);
    window.upgradeSectionToShowroom(sec);
    if (typeof window.ensureCloseButtonsVisible === 'function') window.ensureCloseButtonsVisible();
  };

  var _prevRenderAllV7 = window.renderAll;
  window.renderAll = renderAll = function () {
    if (typeof _prevRenderAllV7 === 'function') {
      try { _prevRenderAllV7(); } catch (e) {}
    }
    window.renderGuaranteedMainTimeline();
  };

  setTimeout(function () {
    if (typeof G !== 'undefined' && G) {
      window.renderGuaranteedMainTimeline();
    }
  }, 150);
})();

/* ============================================================================
   TEMA ÇAKIŞMASI GİDERİCİ VE KARAKTER PORTRESİ KORUMA YAMASI (V8)
   - Çift Üst Barı (#execCustomHudBanner) Kaldırır, Orijinal Portreli HUD'ı Korur
   - Eski ve Yeni Stillerin Çakışmasını Tek Temada Birleştirir
   ============================================================================ */
(function () {
  if (window._themeUnifierV8Loaded) return;
  window._themeUnifierV8Loaded = true;

  // 1. Çakışma yaratan ikinci özel HUD fonksiyonunu devre dışı bırak ve varsa DOM'dan sil
  window.renderExecutiveHUDPanel = function () {
    var dupHud = document.getElementById('execCustomHudBanner');
    if (dupHud) dupHud.remove();
  };

  // 2. Orijinal Karakter Portresini (#charAvatar) ve Üst Profil Bilgilerini Her Render'da Güncelle
  function syncOriginalPortraitAndHeader() {
    if (typeof G === 'undefined' || !G) return;

    // İkinci HUD kalıntısı varsa temizle
    var dupHud = document.getElementById('execCustomHudBanner');
    if (dupHud) dupHud.remove();

    // Karakter Portresinin (#charAvatar) her zaman görünür ve güncel olmasını sağla
    var avatarEl = document.getElementById('charAvatar');
    if (avatarEl) {
      avatarEl.style.display = 'block';
      avatarEl.style.visibility = 'visible';
      if (typeof window.generateDynamicCharacterSVG === 'function') {
        avatarEl.src = window.generateDynamicCharacterSVG(false);
      }
      avatarEl.title = '💈 Berber, Kuaför & Stil Stüdyosunu Açmak İçin Tıkla';
      avatarEl.onclick = function () {
        if (typeof window.openBarberAndSalonModal === 'function') {
          window.openBarberAndSalonModal();
        }
      };
    }
  }

  // 3. JavaScript İçinden Basılan Eski Çakışan Stilleri Temizle, Tekil Temayı Uygula
  function unifyInjectedStyles() {
    var jsStyleEl = document.getElementById('pragmaticMasterAutoStyles');
    if (!jsStyleEl) return;

    // Aşırı parlak mor/pembe çekmece arka planını dengeli Royal Obsidian ile değiştir
    jsStyleEl.textContent = jsStyleEl.textContent.replace(
      /linear-gradient\(175deg,\s*#2e1065[^;]+!important;/g,
      'linear-gradient(175deg, #13182e 0%, #0b0f1d 60%, #050811 100%) !important;'
    );
  }

  // 4. RenderAll ve Sekme Açılışlarını Tekil Temaya Bağla
  var _prevRenderAllV8 = window.renderAll;
  window.renderAll = renderAll = function () {
    if (typeof _prevRenderAllV8 === 'function') {
      try { _prevRenderAllV8(); } catch (e) {}
    }
    syncOriginalPortraitAndHeader();
    if (typeof window.ensureCloseButtonsVisible === 'function') {
      window.ensureCloseButtonsVisible();
    }
  };

  var _prevOpenNavV8 = window.openNavSheet;
  window.openNavSheet = openNavSheet = function (tab) {
    if (typeof _prevOpenNavV8 === 'function') _prevOpenNavV8(tab);
    syncOriginalPortraitAndHeader();
    if (typeof window.ensureCloseButtonsVisible === 'function') {
      window.ensureCloseButtonsVisible();
    }
  };

  // İlk açılışta hemen senkronize et
  unifyInjectedStyles();
  syncOriginalPortraitAndHeader();
  setTimeout(syncOriginalPortraitAndHeader, 150);
})();

/* ============================================================================
   MASTER PATCH V9:
   1. FİNANS, KARİYER VE MENÜ İÇİN TEMİZ ALT SEKME (SUB-TAB) DÜZENLEYİCİ
   2. TAM ÇALIŞAN ÖSYM YKS ÜNİVERSİTE SINAVI, TERCİH, MEZUNİYET & EHLİYET SİSTEMİ
   3. SİYAH YAZI (OKUNMAMA) OTOMATİK DÜZELTİCİ
   ============================================================================ */
(function () {
  if (window._masterCleanTabsAndUniV9) return;
  window._masterCleanTabsAndUniV9 = true;

  window.uiSubTabs = {
    finance: 'bank',   // 'bank' | 'market' | 'gold'
    menu: 'vip'        // 'vip' | 'invest' | 'life'
  };

  // 1. SİYAH OKUNMAYAN YAZILARI OTOMATİK BEYAZA ÇEVİREN FONKSİYON
  window.fixUnreadableBlackTexts = function () {
    var root = document.getElementById('bottomSheet') || document.body;
    if (!root) return;
    root.querySelectorAll('[style*="color: black"], [style*="color:#000"], [style*="color: #000"], [style*="color: rgb(0, 0, 0)"]').forEach(function (el) {
      if (el.tagName !== 'BUTTON') el.style.color = '#f8fafc';
    });
  };

  // ============================================================================
  // 2. FİNANS SEKMESİ DÜZENLEYİCİ (KARMAŞAYI 3 TEMİZ SEKMEYE AYIRIR)
  // ============================================================================
  window.switchFinanceSubTab = function (sub) {
    window.uiSubTabs.finance = sub;
    window.openNavSheet('finance');
  };

  window.organizeFinanceSheetIntoTabs = function () {
    var body = document.getElementById('sheetBody');
    if (!body || !G) return;
    if (typeof window.ensureCreditCardState === 'function') window.ensureCreditCardState();

    var activeSub = window.uiSubTabs.finance || 'bank';

    // Orijinal finans kartlarını konularına göre 3 gruba ayır (hiçbir işlev kaybolmaz)
    var children = Array.from(body.children);
    var bankNodes = [];
    var marketNodes = [];
    var goldNodes = [];

    children.forEach(function (node) {
      if (!node || node.id === 'financeCleanSubTabBar' || node.id === 'financeRoyalCreditCardBanner') return;
      var txt = (node.innerText || '').toLowerCase();
      var html = (node.innerHTML || '').toLowerCase();

      if (/altın|döviz|kapalıçarşı|gram|fx|kur/.test(txt) || node.classList.contains('fx-gold-card')) {
        goldNodes.push(node);
      } else if (/borsa|hisse|kripto|coin|btc|eth|portföy|lot|temettü|stock|crypto/.test(txt + ' ' + html)) {
        marketNodes.push(node);
      } else {
        bankNodes.push(node);
      }
    });

    // Üste 3'lü Alt Sekme Barı Ekle
    var existingBar = document.getElementById('financeCleanSubTabBar');
    if (existingBar) existingBar.remove();

    var c = window.getCountry();
    var cc = G.creditCard || { tierName: 'Royal Gold Card', limitMult: 4.5, debt: 0 };
    var ccLim = Math.round(c.monthlyMinWage * (cc.limitMult || 4.5));

    var topHtml = `
      <div id="financeCleanSubTabBar" class="space-y-2.5 mb-3">
        <!-- Üst Özet Cüzdan & Net Servet Kartı -->
        <div class="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-950 border border-amber-400/35 text-center">
          <div>
            <div class="text-[9px] font-bold text-slate-400 uppercase">NAKİT CÜZDAN</div>
            <div class="text-xs font-mono-num font-black text-emerald-400 mt-0.5">${window.fmtMoney(G.money)}</div>
          </div>
          <div class="border-x border-slate-800">
            <div class="text-[9px] font-bold text-slate-400 uppercase">MEVDUAT / BİRİKİM</div>
            <div class="text-xs font-mono-num font-black text-sky-400 mt-0.5">${window.fmtMoney(G.bankSavings || G.savings || 0)}</div>
          </div>
          <div>
            <div class="text-[9px] font-bold text-slate-400 uppercase">KART BORCU</div>
            <div class="text-xs font-mono-num font-black text-rose-400 mt-0.5">${window.fmtMoney(cc.debt || 0)}</div>
          </div>
        </div>

        <!-- 3'lü Temiz Alt Sekme Çubuğu -->
        <div class="clean-subtab-bar" style="grid-template-columns: repeat(3, 1fr);">
          <button type="button" onclick="window.switchFinanceSubTab('bank')" class="clean-subtab-btn ${activeSub === 'bank' ? 'active' : ''}">
            🏦 Banka &amp; Kart
          </button>
          <button type="button" onclick="window.switchFinanceSubTab('market')" class="clean-subtab-btn ${activeSub === 'market' ? 'active' : ''}">
            📈 Borsa &amp; Kripto
          </button>
          <button type="button" onclick="window.switchFinanceSubTab('gold')" class="clean-subtab-btn ${activeSub === 'gold' ? 'active' : ''}">
            🪙 Altın &amp; Döviz
          </button>
        </div>

        ${activeSub === 'bank' ? `
          <div id="financeRoyalCreditCardBanner" onclick="window.openCreditCardCenterModal()" class="royal-hero-card">
            <div>
              <span class="royal-tile-badge">💳 ${cc.tierName} • FİNDEKS: ${G.creditScore || 1350}</span>
              <div class="text-sm font-black text-white mt-1">VIP Kredi Kartı, Nakit Avans &amp; Ekstre</div>
              <div class="text-[11px] text-amber-200">Limit: ${window.fmtMoney(ccLim)} • Borç: ${window.fmtMoney(cc.debt)}</div>
            </div>
            <span class="px-3 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shrink-0">KARTIM &rarr;</span>
          </div>
        ` : ''}
      </div>
    `;

    body.insertAdjacentHTML('afterbegin', topHtml);

    // Sadece seçili sekmenin kartlarını göster, diğerlerini gizle (kalabalığı tamamen bitirir!)
    bankNodes.forEach(function (n) { n.style.display = (activeSub === 'bank') ? '' : 'none'; });
    marketNodes.forEach(function (n) { n.style.display = (activeSub === 'market') ? '' : 'none'; });
    goldNodes.forEach(function (n) { n.style.display = (activeSub === 'gold') ? '' : 'none'; });

    // Eğer Altın & Döviz sekmesi seçiliyse ve içerik boşsa Altın/Döviz panelini çiz
    if (activeSub === 'gold' && goldNodes.length === 0 && typeof window.renderGoldFxAndDepositPanelHTML === 'function') {
      body.insertAdjacentHTML('beforeend', window.renderGoldFxAndDepositPanelHTML());
    }
  };

  // ============================================================================
  // 3. YÖNETİM MENÜSÜ DÜZENLEYİCİ (3 KATEGORİLİ TEMİZ SEKME SİSTEMİ)
  // ============================================================================
  window.switchMenuSubTab = function (sub) {
    window.uiSubTabs.menu = sub;
    window.renderRoyalCasinoStyledMenu();
  };

  window.renderRoyalCasinoStyledMenu = function () {
    var body = document.getElementById('sheetBody');
    if (!body || !G) return;
    if (typeof window.ensureCreditCardState === 'function') window.ensureCreditCardState();

    var titleEl = document.getElementById('sheetTitle');
    var subEl = document.getElementById('sheetSubtitle');
    if (titleEl) titleEl.textContent = '👑 YÖNETİM & YAŞAM MERKEZİ';
    if (subEl) subEl.textContent = G.firstName + ' ' + G.lastName + ' (' + G.age + ' Yaş) • ' + window.fmtMoney(G.money);

    // Orijinal menünün butonlarını ilk açılışta hafızaya kaydet ki sekme değiştirirken kaybolmasın
    if (!window._cachedOriginalMenuCards || window._cachedOriginalMenuCards.length === 0) {
      var rawButtons = Array.from(body.querySelectorAll('button'));
      var seen = {};
      var list = [];
      rawButtons.forEach(function (btn) {
        var oc = (btn.getAttribute('onclick') || '').trim();
        if (!oc || /casino|gambling|openVIPCasinoModal|openBarberAndSalonModal|openCreditCardCenterModal|openSingleStartMenu|switchMenuSubTab/.test(oc)) return;
        if (seen[oc]) return;
        seen[oc] = true;
        var lines = btn.innerText.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        list.push({ onclick: oc.replace(/"/g, '&quot;'), title: lines[0] || 'Bölüm', desc: lines[1] || 'Görüntüle ve yönet' });
      });
      if (list.length > 0) window._cachedOriginalMenuCards = list;
    }

    var allCards = window._cachedOriginalMenuCards || [];
    var activeTab = window.uiSubTabs.menu || 'vip';

    // Kartları 3 net kategoriye ayır
    var investCards = [];
    var lifeCards = [];
    allCards.forEach(function (c) {
      var s = (c.onclick + ' ' + c.title).toLowerCase();
      if (/house|car|busi|emlak|konut|ev|mülk|araç|araba|galeri|garaj|şirket|holding|ticaret|fabrika|yapsat/.test(s)) {
        investCards.push(c);
      } else {
        lifeCards.push(c);
      }
    });

    var c = window.getCountry();
    var ccLimit = Math.round(c.monthlyMinWage * (G.creditCard.limitMult || 4.5));

    body.innerHTML = `
      <div class="space-y-3 pb-5">
        <!-- 3'lü Menü Kategori Sekmesi -->
        <div class="clean-subtab-bar" style="grid-template-columns: repeat(3, 1fr);">
          <button type="button" onclick="window.switchMenuSubTab('vip')" class="clean-subtab-btn ${activeTab === 'vip' ? 'active' : ''}">
            👑 VIP &amp; Stil
          </button>
          <button type="button" onclick="window.switchMenuSubTab('invest')" class="clean-subtab-btn ${activeTab === 'invest' ? 'active' : ''}">
            🏠 Mülk &amp; Garaj
          </button>
          <button type="button" onclick="window.switchMenuSubTab('life')" class="clean-subtab-btn ${activeTab === 'life' ? 'active' : ''}">
            🎓 Akademi &amp; Sistem
          </button>
        </div>

        ${activeTab === 'vip' ? `
          <div class="space-y-2.5">
            <div onclick="window.openVIPCasinoModal('bonanza')" class="royal-hero-card">
              <div>
                <span class="royal-tile-badge">🎰 PRAGMATIC PLAY LIVE LOUNGE</span>
                <div class="text-base font-black text-white mt-1">VIP Royal Casino &amp; Slot Merkezi</div>
                <div class="text-xs text-amber-200">Sweet Bonanza 1000 • Gates of Olympus 1000 • 21</div>
              </div>
              <span class="px-3.5 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shrink-0">OYNA &rarr;</span>
            </div>

            <div onclick="window.openCreditCardCenterModal()" class="royal-hero-card">
              <div>
                <span class="royal-tile-badge">💳 ROYAL BANK WORLD VIP</span>
                <div class="text-base font-black text-white mt-1">VIP Kredi Kartı &amp; Nakit Avans</div>
                <div class="text-xs text-pink-200">Limit: ${window.fmtMoney(ccLimit)} • Borç: ${window.fmtMoney(G.creditCard.debt)}</div>
              </div>
              <span class="px-3.5 py-2.5 rounded-xl bg-emerald-400 text-slate-950 text-xs font-black shrink-0">KARTIM &rarr;</span>
            </div>

            <div onclick="if(typeof openBarberAndSalonModal==='function') openBarberAndSalonModal();" class="royal-hero-card">
              <div>
                <span class="royal-tile-badge">💈 KARAKTER &amp; İMAJ STÜDYOSU</span>
                <div class="text-base font-black text-white mt-1">VIP Kuaför, Sakal &amp; Kombin</div>
                <div class="text-xs text-sky-200">Mevcut Karizma / Görünüm: %${G.looks}</div>
              </div>
              <span class="px-3.5 py-2.5 rounded-xl bg-sky-400 text-slate-950 text-xs font-black shrink-0">STÜDYO &rarr;</span>
            </div>
          </div>
        ` : ''}

        ${activeTab === 'invest' ? `
          <div class="royal-bento-grid">
            ${investCards.map(function (mc) {
              return `
                <button type="button" onclick="${mc.onclick}" class="royal-menu-tile">
                  <div class="flex items-center justify-between w-full mb-1.5">
                    <span class="royal-tile-badge">YATIRIM &amp; VİTRİN</span>
                    <span class="text-amber-300 font-black text-xs">&rarr;</span>
                  </div>
                  <div>
                    <div class="text-xs font-black text-white leading-snug">${mc.title}</div>
                    <div class="text-[10px] text-slate-300 mt-0.5 line-clamp-1">${mc.desc}</div>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        ` : ''}

        ${activeTab === 'life' ? `
          <div class="space-y-2.5">
            <!-- ÖSYM YKS & Üniversite Hızlı Giriş Kartı -->
            <div onclick="window.openOSYMUniversityCenter()" class="royal-hero-card">
              <div>
                <span class="royal-tile-badge">🎓 ÖSYM YKS &amp; ÜNİVERSİTE MERKEZİ</span>
                <div class="text-base font-black text-white mt-1">Üniversite Sınavı, Tercih &amp; Ehliyet</div>
                <div class="text-xs text-sky-200">Durum: ${G.uniGrad ? ('Mezun (' + (G.uniDeptName || 'Üniversite') + ')') : (G.inUni ? (G.uniDeptName + ' - ' + G.uniYears + '. Yıl') : 'Sınava Hazır')}</div>
              </div>
              <span class="px-3.5 py-2.5 rounded-xl bg-sky-400 text-slate-950 text-xs font-black shrink-0">AKADEMİ &rarr;</span>
            </div>

            <div class="royal-bento-grid">
              ${lifeCards.map(function (mc) {
                return `
                  <button type="button" onclick="${mc.onclick}" class="royal-menu-tile">
                    <div class="flex items-center justify-between w-full mb-1.5">
                      <span class="royal-tile-badge">YAŞAM</span>
                      <span class="text-amber-300 font-black text-xs">&rarr;</span>
                    </div>
                    <div>
                      <div class="text-xs font-black text-white leading-snug">${mc.title}</div>
                      <div class="text-[10px] text-slate-300 mt-0.5 line-clamp-1">${mc.desc}</div>
                    </div>
                  </button>
                `;
              }).join('')}

              <button type="button" onclick="window.closeBottomSheetSafe(); window.openSingleStartMenu(true);" class="royal-menu-tile">
                <div class="flex items-center justify-between w-full mb-1.5">
                  <span class="royal-tile-badge">KAYIT SİSTEMİ</span>
                  <span class="text-amber-300 font-black text-xs">🔄</span>
                </div>
                <div>
                  <div class="text-xs font-black text-white leading-snug">3'lü Kayıt Slotu &amp; Yeni Karakter</div>
                  <div class="text-[10px] text-slate-300 mt-0.5">Aktif Slot #0${window.currentSelectedSlot || 1}</div>
                </div>
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
    if (typeof window.ensureCloseButtonsVisible === 'function') window.ensureCloseButtonsVisible();
  };

  // ============================================================================
  // 4. TAM ÇALIŞAN ÖSYM YKS ÜNİVERSİTE SINAVI, TERCİH, MEZUNİYET VE EHLİYET MOTORU
  // ============================================================================
  window.yksExamState = {
    inExam: false,
    qIndex: 0,
    correctCount: 0,
    lastScore: 0
  };

  window.openOSYMUniversityCenter = function () {
    if (!G) return;
    var sheet = document.getElementById('bottomSheet');
    if (sheet) sheet.classList.remove('hidden');

    document.getElementById('sheetTitle').textContent = '🎓 ÖSYM YKS, Üniversite & Ehliyet Merkezi';
    document.getElementById('sheetSubtitle').textContent = 'Zeka: %' + (G.smart || 75) + ' • Eğitim: ' + (G.uniGrad ? 'Üniversite Mezunu' : (G.inUni ? 'Üniversite Öğrencisi' : (G.eduStage || 'Lise')));

    var body = document.getElementById('sheetBody');
    if (!body) return;

    var db = window.OSYM_YKS_DB || { questions: [], departments: [] };
    var c = window.getCountry();
    var prepCost = Math.round(c.monthlyMinWage * 0.25);
    var bLicenseCost = Math.round(c.monthlyMinWage * 0.45);
    var ceLicenseCost = Math.round(c.monthlyMinWage * 0.85);
    if (!G.licenses) G.licenses = { B: false, CE: false };

    // A) Eğer Canlı YKS Sınavı Başladıysa Soruyu Göster
    if (window.yksExamState.inExam) {
      var qObj = db.questions[window.yksExamState.qIndex];
      body.innerHTML = `
        <div class="osym-exam-card space-y-3">
          <div class="flex items-center justify-between border-b border-sky-400/30 pb-2">
            <span class="px-2.5 py-0.5 rounded bg-sky-400 text-slate-950 text-[10px] font-black">
              ÖSYM YKS OTURUMU • SORU ${window.yksExamState.qIndex + 1} / ${db.questions.length}
            </span>
            <span class="text-xs font-mono-num font-bold text-amber-300">Doğru: ${window.yksExamState.correctCount}</span>
          </div>

          <div class="text-sm font-black text-white leading-relaxed py-2">
            ${qObj.q}
          </div>

          <div class="space-y-2">
            ${qObj.opts.map(function (optText, idx) {
              return `
                <button type="button" onclick="window.answerYKSQuestion(${idx})" class="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-left text-xs font-bold text-white flex items-center gap-2.5">
                  <span class="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0">${['A', 'B', 'C', 'D'][idx]}</span>
                  <span>${optText}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;
      if (typeof window.ensureCloseButtonsVisible === 'function') window.ensureCloseButtonsVisible();
      return;
    }

    // B) Normal Akademi, YKS Sonuç & Üniversite Tercih Ekranı
    var currentScore = G.yksScore || window.yksExamState.lastScore || 0;

    body.innerHTML = `
      <div class="space-y-3 pb-5">
        <!-- 1. ÖSYM YKS SINAV VE DURUM KARTI -->
        <div class="osym-exam-card space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[9.5px] font-black text-sky-300 uppercase tracking-widest">T.C. ÖSYM BAŞKANLIĞI • YKS MERKEZİ</div>
              <div class="text-sm font-black text-white mt-0.5">
                ${G.uniGrad ? ('🎓 Mezun: ' + (G.uniDeptName || 'Üniversite Diploması')) : (G.inUni ? ('📚 Öğrenci: ' + G.uniDeptName + ' (' + G.uniYears + '/' + (G.uniTotalYears || 4) + '. Yıl)') : '📝 YKS (TYT-AYT) Üniversite Sınavı')}
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-mono-num text-xs font-black">
              Puan: ${currentScore > 0 ? currentScore : 'Girmedi'}
            </span>
          </div>

          ${G.age < 17 ? `
            <div class="p-2.5 rounded-xl bg-slate-950/90 border border-amber-400/40 text-xs text-amber-200 font-bold">
              ⚠️ Üniversite sınavına (YKS) girebilmek için en az <strong>17-18 yaşında (Lise son)</strong> olmalısın. Şu anki yaşın: <strong>${G.age}</strong>.
            </div>
          ` : ''}

          ${G.inUni && !G.uniGrad ? `
            <div class="p-3 rounded-xl bg-emerald-950/50 border border-emerald-400/40 space-y-2">
              <div class="text-xs font-bold text-emerald-200">
                Şu an <strong>${G.uniDeptName}</strong> bölümünde okuyorsun (${G.uniYears} / ${G.uniTotalYears || 4}. Yıl). Her <strong>+1 Yaş</strong> ilerlediğinde sınıf atlarsın veya hemen tezini verip mezun olabilirsin:
              </div>
              <button type="button" onclick="window.advanceOrGraduateUniNow()" class="w-full py-2.5 rounded-xl bg-emerald-400 text-slate-950 text-xs font-black">
                🎓 DÖNEMİ TAMAMLA &amp; DİPLOMAYI AL
              </button>
            </div>
          ` : ''}

          <div class="grid grid-cols-2 gap-2">
            <button type="button" onclick="window.startInteractiveYKSExam()" class="p-3 rounded-xl bg-amber-400 text-slate-950 text-xs font-black text-center">
              📝 YKS Sınavına Gir (Kendin Çöz)
            </button>
            <button type="button" onclick="window.quickCalculateYKSScore()" class="p-3 rounded-xl bg-sky-400 text-slate-950 text-xs font-black text-center">
              ⚡ Hızlı YKS Sonucu Al (Zekaya Göre)
            </button>
          </div>

          <button type="button" onclick="window.takePrivateTutoring(${prepCost})" class="w-full py-2 rounded-xl bg-slate-900 border border-sky-400/40 text-xs font-bold text-white">
            📚 Özel Dershane &amp; YKS Kampına Katıl (${window.fmtMoney(prepCost)} &rarr; +10 Zeka &amp; +35 Ek Puan)
          </button>
        </div>

        <!-- 2. ÜNİVERSİTE BÖLÜM TERCİHLERİ LİSTESİ -->
        <div class="space-y-2">
          <div class="text-[10px] font-black text-amber-300 uppercase tracking-wider px-1">
            🏛️ ÖSYM ÜNİVERSİTE BÖLÜM TERCİHLERİ (YKS PUANIN: ${currentScore})
          </div>
          ${db.departments.map(function (dep) {
            var canEnroll = currentScore >= dep.minScore;
            var isThisGrad = G.uniGrad && G.uniDeptId === dep.id;
            var isThisActive = G.inUni && G.uniDeptId === dep.id;
            return `
              <div class="p-3 rounded-2xl bg-slate-950 border ${canEnroll ? 'border-emerald-400/50' : 'border-slate-800'} flex items-center justify-between gap-2.5">
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono-num text-[9.5px] font-black">Taban: ${dep.minScore} Puan</span>
                    <span class="text-[9.5px] font-bold text-sky-300">${dep.years} Yıl • ${dep.degreeType}</span>
                  </div>
                  <div class="text-xs font-black text-white mt-1">${dep.name}</div>
                  <div class="text-[10px] text-slate-300">${dep.uni} • Maaş Çarpanı: <strong>${dep.salaryBonusMult}x</strong></div>
                </div>
                <div class="shrink-0">
                  ${isThisGrad ? `
                    <span class="px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[10px] font-black block">MEZUN ✓</span>
                  ` : isThisActive ? `
                    <button type="button" onclick="window.advanceOrGraduateUniNow()" class="px-3 py-2 rounded-xl bg-emerald-400 text-slate-950 text-[10px] font-black">MEZUN OL</button>
                  ` : `
                    <button type="button" onclick="window.enrollInUniversityDept('${dep.id}')" class="px-3 py-2 rounded-xl ${canEnroll ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'} text-[10px] font-black">
                      ${canEnroll ? 'KAYIT OL' : 'PUAN YETMİYOR'}
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- 3. SÜRÜCÜ KURSU & EHLİYET MERKEZİ (B VE CE TİR EHLİYETİ) -->
        <div class="space-y-2 pt-2">
          <div class="text-[10px] font-black text-sky-300 uppercase tracking-wider px-1">
            🚗 MİLLİ EĞİTİM SÜRÜCÜ KURSU &amp; EHLİYET SINAVI
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div class="text-xs font-black text-white">🪪 B Sınıfı Otomobil Ehliyeti</div>
              <div class="text-[10px] text-slate-300">Durum: <strong class="${G.licenses.B ? 'text-emerald-400' : 'text-rose-400'}">${G.licenses.B ? 'ALINDI ✓' : 'YOK'}</strong></div>
              ${!G.licenses.B ? `
                <button type="button" onclick="window.obtainDriverLicense('B', ${bLicenseCost})" class="w-full py-2 rounded-xl bg-emerald-400 text-slate-950 text-[10.5px] font-black">
                  Sınava Gir (${window.fmtMoney(bLicenseCost)})
                </button>
              ` : ''}
            </div>
            <div class="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div class="text-xs font-black text-white">🚛 CE Sınıfı Tır &amp; Lojistik Ehliyeti</div>
              <div class="text-[10px] text-slate-300">Durum: <strong class="${G.licenses.CE ? 'text-emerald-400' : 'text-rose-400'}">${G.licenses.CE ? 'ALINDI ✓' : 'YOK'}</strong></div>
              ${!G.licenses.CE ? `
                <button type="button" onclick="window.obtainDriverLicense('CE', ${ceLicenseCost})" class="w-full py-2 rounded-xl bg-amber-400 text-slate-950 text-[10.5px] font-black">
                  Sınava Gir (${window.fmtMoney(ceLicenseCost)})
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
    if (typeof window.ensureCloseButtonsVisible === 'function') window.ensureCloseButtonsVisible();
  };

  window.startInteractiveYKSExam = function () {
    if (G.age < 17) {
      showToast('YKS sınavına girmek için en az 17 yaşında olmalısın!');
      return;
    }
    window.yksExamState.inExam = true;
    window.yksExamState.qIndex = 0;
    window.yksExamState.correctCount = 0;
    window.openOSYMUniversityCenter();
  };

  window.answerYKSQuestion = function (selectedIdx) {
    var db = window.OSYM_YKS_DB;
    var qObj = db.questions[window.yksExamState.qIndex];
    if (qObj && selectedIdx === qObj.ans) {
      window.yksExamState.correctCount += 1;
    }
    window.yksExamState.qIndex += 1;

    if (window.yksExamState.qIndex >= db.questions.length) {
      window.yksExamState.inExam = false;
      var baseFromSmart = Math.round((G.smart || 75) * 2.4);
      var bonusFromCorrect = window.yksExamState.correctCount * 68;
      var finalScore = Math.min(500, Math.max(180, 140 + baseFromSmart + bonusFromCorrect));
      window.yksExamState.lastScore = finalScore;
      G.yksScore = finalScore;
      window.addLog(G.age, '📝 **ÖSYM YKS SONUCU AÇIKLANDI:** Sınavda **' + window.yksExamState.correctCount + '/' + db.questions.length + '** doğru yaptın ve **' + finalScore + ' YKS Puanı** aldın! Şimdi bölüm tercihi yapabilirsin.', 'milestone');
      if (typeof saveGame === 'function') saveGame();
      if (typeof renderAll === 'function') renderAll();
    }
    window.openOSYMUniversityCenter();
  };

  window.quickCalculateYKSScore = function () {
    if (G.age < 17) {
      showToast('YKS sınavına girmek için en az 17 yaşında olmalısın!');
      return;
    }
    var smartVal = G.smart || G.intel || 78;
    var score = Math.min(500, Math.max(210, Math.round(165 + smartVal * 3.1 + (Math.random() * 35))));
    window.yksExamState.lastScore = score;
    G.yksScore = score;
    window.addLog(G.age, '📝 **ÖSYM YKS SONUCU:** Sınav sonucunda **' + score + ' Puan** elde ettin! Puanının yettiği fakülteye hemen kayıt olabilirsin.', 'milestone');
    if (typeof saveGame === 'function') saveGame();
    if (typeof renderAll === 'function') renderAll();
    window.openOSYMUniversityCenter();
  };

  window.takePrivateTutoring = function (cost) {
    if (G.money < cost) { showToast('Dershane ücreti için nakit bakiyen yetersiz!'); return; }
    G.money -= cost;
    G.smart = Math.min(100, (G.smart || 75) + 10);
    G.intel = G.smart;
    G.yksScore = Math.min(500, (G.yksScore || 240) + 35);
    window.yksExamState.lastScore = G.yksScore;
    window.addLog(G.age, '📚 **YKS HAZIRLIK KAMPI:** Yoğun dershane kampını tamamladın (+10 Zeka). YKS puanın **' + G.yksScore + '** seviyesine yükseldi!', 'good');
    if (typeof saveGame === 'function') saveGame();
    if (typeof renderAll === 'function') renderAll();
    window.openOSYMUniversityCenter();
  };

  window.enrollInUniversityDept = function (deptId) {
    if (G.age < 17) { showToast('Üniversiteye kayıt için en az 17-18 yaşında olmalısın!'); return; }
    var db = window.OSYM_YKS_DB;
    var dep = db.departments.find(function (d) { return d.id === deptId; });
    if (!dep) return;

    var curScore = G.yksScore || window.yksExamState.lastScore || 0;
    if (curScore < dep.minScore) {
      showToast('Bu bölüm için en az ' + dep.minScore + ' YKS puanı gerekiyor! Önce YKS sınavına gir veya dershane kampına katıl.');
      return;
    }

    G.inUni = true;
    G.uniGrad = false;
    G.uniDeptId = dep.id;
    G.uniDeptName = dep.name;
    G.uniYears = 1;
    G.uniTotalYears = dep.years;
    G.eduStage = 'Üniversite (' + dep.name + ')';

    window.addLog(G.age, '🏛️ **ÜNİVERSİTEYİ KAZANDIN:** **' + dep.uni + ' - ' + dep.name + '** bölümüne yerleştin!', 'milestone');
    showToast('🎉 Tebrikler! ' + dep.name + ' bölümüne kaydoldun!');
    if (typeof saveGame === 'function') saveGame();
    if (typeof renderAll === 'function') renderAll();
    window.openOSYMUniversityCenter();
  };

  window.advanceOrGraduateUniNow = function () {
    if (!G.inUni && !G.uniDeptName) return;
    G.inUni = false;
    G.uniGrad = true;
    G.uniYears = G.uniTotalYears || 4;
    G.eduStage = 'Üniversite Mezunu (' + (G.uniDeptName || 'Lisans') + ')';
    G.smart = Math.min(100, (G.smart || 80) + 12);
    G.intel = G.smart;

    window.addLog(G.age, '🎓 **ÜNİVERSİTE MEZUNİYETİ:** **' + (G.uniDeptName || 'Üniversite') + '** bölümünden başarıyla mezun olup diplomanı aldın! Artık tüm üst düzey mesleklere başvurabilirsin.', 'milestone');
    showToast('🎓 Diplomanı aldın! Tüm yüksek maaşlı kariyerlerin kilidi açıldı.');
    if (typeof saveGame === 'function') saveGame();
    if (typeof renderAll === 'function') renderAll();
    window.openOSYMUniversityCenter();
  };

  window.obtainDriverLicense = function (licType, cost) {
    if (G.age < 18) { showToast('Ehliyet alabilmek için 18 yaşını doldurmuş olmalısın!'); return; }
    if (G.money < cost) { showToast('Sürücü kursu harcı için nakit yetersiz!'); return; }
    if (!G.licenses) G.licenses = { B: false, CE: false };
    G.money -= cost;
    G.licenses[licType] = true;
    window.addLog(G.age, '🪪 **EHLİYET SINAVINI GEÇTİN:** Direksiyon sınavını tek seferde geçerek **' + licType + ' Sınıfı Sürücü Belgesi** aldın!', 'good');
    showToast(licType + ' Sınıfı Ehliyetin cüzdanına eklendi!');
    if (typeof saveGame === 'function') saveGame();
    if (typeof renderAll === 'function') renderAll();
    window.openOSYMUniversityCenter();
  };

  // Orijinal oyundaki bozuk üniversite / sınav fonksiyonlarının tamamını çalışan merkeze bağla!
  ['takeUniExam', 'startUniExam', 'enterUniExam', 'openUniModal', 'enrollUni', 'applyUniversity', 'studyUni', 'openEducationModal'].forEach(function (fnName) {
    window[fnName] = function () {
      window.openOSYMUniversityCenter();
    };
  });

  // +1 Yaş ilerlediğinde üniversitede okuyan oyuncunun sınıfını otomatik ilerlet ve mezun et
  var _prevAdvanceAgeV9 = window.advanceAge;
  window.advanceAge = advanceAge = function () {
    if (typeof _prevAdvanceAgeV9 === 'function') _prevAdvanceAgeV9();
    if (typeof G !== 'undefined' && G && G.inUni && !G.uniGrad) {
      G.uniYears = (G.uniYears || 1) + 1;
      var needed = G.uniTotalYears || 4;
      if (G.uniYears > needed) {
        window.advanceOrGraduateUniNow();
      } else {
        window.addLog(G.age, '📚 **ÜNİVERSİTE DÖNEMİ:** **' + (G.uniDeptName || 'Üniversite') + '** ' + G.uniYears + '. sınıfa geçtin.', 'good');
      }
    }
    window.fixUnreadableBlackTexts();
  };

  // Kariyer veya Eğitim sekmesi açıldığında en üste ÖSYM YKS & Üniversite Kartını yerleştir
  function injectUniBannerIntoCareerOrEduSheet() {
    var body = document.getElementById('sheetBody');
    if (!body || !G) return;

    // İçerideki çalışmayan eski "Üniversite Sınavı / YKS" butonlarını yakalayıp çalışan merkeze bağla
    body.querySelectorAll('button').forEach(function (btn) {
      var t = (btn.innerText || '').toLowerCase();
      var oc = (btn.getAttribute('onclick') || '').toLowerCase();
      if (/üniversite|yks|sınav|fakülte|mezun|uni/.test(t + ' ' + oc) && oc.indexOf('openosymuniversitycenter') === -1) {
        btn.setAttribute('onclick', 'window.openOSYMUniversityCenter()');
      }
    });

    if (!document.getElementById('careerTopOsymBanner')) {
      var statusText = G.uniGrad
        ? ('Mezun: ' + (G.uniDeptName || 'Lisans Diploması'))
        : (G.inUni ? (G.uniDeptName + ' (' + G.uniYears + '. Sınıf)') : ('YKS Puanı: ' + (G.yksScore || 'Girmedi')));

      body.insertAdjacentHTML('afterbegin', `
        <div id="careerTopOsymBanner" onclick="window.openOSYMUniversityCenter()" class="royal-hero-card mb-3">
          <div>
            <span class="royal-tile-badge">🎓 ÖSYM YKS &amp; DİPLOMA MERKEZİ</span>
            <div class="text-sm font-black text-white mt-1">Üniversite Sınavı (YKS), Bölüm Tercihi &amp; Ehliyet</div>
            <div class="text-[11px] text-sky-200">${statusText}</div>
          </div>
          <span class="px-3 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shrink-0">SINAV / TERCİH &rarr;</span>
        </div>
      `);
    }
  }

  // Navigasyon ve Alt Menü Kancaları
  var _prevOpenNavV9 = window.openNavSheet;
  window.openNavSheet = openNavSheet = function (tab) {
    if (typeof _prevOpenNavV9 === 'function') _prevOpenNavV9(tab);
    if (tab === 'finance') {
      window.organizeFinanceSheetIntoTabs();
    } else if (tab === 'career') {
      injectUniBannerIntoCareerOrEduSheet();
    } else if (tab === 'menu') {
      window.renderRoyalCasinoStyledMenu();
    }
    window.fixUnreadableBlackTexts();
    if (typeof window.ensureCloseButtonsVisible === 'function') window.ensureCloseButtonsVisible();
  };

  var _prevOpenMenuSecV9 = window.openMenuSection;
  window.openMenuSection = openMenuSection = function (sec) {
    var s = String(sec || '').toLowerCase();
    if (/edu|eğitim|okul|uni|yks|sınav/.test(s)) {
      window.openOSYMUniversityCenter();
      return;
    }
    if (typeof _prevOpenMenuSecV9 === 'function') _prevOpenMenuSecV9(sec);
    window.fixUnreadableBlackTexts();
    if (typeof window.ensureCloseButtonsVisible === 'function') window.ensureCloseButtonsVisible();
  };
})();

/* ============================================================================
   MASTER REALISM & CONTEXT GATEKEEPER ENGINE (V10 - GAME.JS)
   1. Ehliyetsiz/Arabasız Polis Çevirmesini, Şirketsiz Vergi Cezasını,
      Evsiz Emlak Cezasını ve Çocuk Yaşta Yetişkin Olaylarını %100 Engeller!
   2. Haksız Kesilen Cezaları Anında Cüzdana İade Eder.
   3. Her Yıl Oyuncunun Gerçek Yaş ve Varlıklarına Uygun Olay Üretir.
   ============================================================================ */
(function () {
  if (window._masterRealismGatekeeperV10) return;
  window._masterRealismGatekeeperV10 = true;

  // 1. OYUNCUNUN MEVCUT VARLIK VE İMKAN DURUMUNU OKUYAN FONKSİYON
  window.getPlayerCapabilitySnapshot = function () {
    if (typeof G === 'undefined' || !G) {
      return { age: 0, hasCar: false, hasLicenseB: false, hasBiz: false, hasHouse: false, hasJob: false, hasSpouse: false, isAdult: false };
    }
    var age = typeof G.age === 'number' ? G.age : 0;
    var hasCar = Array.isArray(G.cars) && G.cars.length > 0;
    var hasLicenseB = Boolean(G.licenses && (G.licenses.B || G.licenses.CE));
    var hasBiz = Array.isArray(G.businesses) && G.businesses.length > 0;
    var hasHouse = Array.isArray(G.houses) && G.houses.length > 0;
    var hasJob = Boolean(G.jobId);
    var hasSpouse = Boolean(G.spouse || G.lover);

    return {
      age: age,
      isBaby: age < 6,
      isChild: age >= 6 && age < 14,
      isTeen: age >= 14 && age < 18,
      isAdult: age >= 18,
      hasCar: hasCar,
      hasLicenseB: hasLicenseB,
      hasBiz: hasBiz,
      hasHouse: hasHouse,
      hasJob: hasJob,
      hasSpouse: hasSpouse
    };
  };

  // 2. BİR METNİN VEYA OLAYIN OYUNCUNUN DURUMUYLA ÇELİŞİP ÇELİŞMEDİĞİNİ DENETLEYEN DEDEKTÖR
  window.findRealismViolation = function (rawText) {
    if (!rawText || typeof G === 'undefined' || !G) return null;
    var s = String(rawText).toLowerCase();

    // Bizim kendi onaylı sistem mesajlarımızı (doğum, okul, YKS, slot, kredi kartı işlemi vb.) koru
    if (/dünyaya geldin|okula başladın|lise yılları|18 yaş reşitlik|yks|mezuniyet|ehliyet sınavını|yeni hayat/.test(s)) {
      return null;
    }

    var cap = window.getPlayerCapabilitySnapshot();

    // KURAL A: 18 YAŞINDAN KÜÇÜK (BEBEK / ÇOCUK / LİSELİ) İKEN YETİŞKİN OLAYI YASAK!
    if (!cap.isAdult) {
      if (/trafik|polis çevir|ehliyet|radar|direksiyon|araba sür|kasko|tüvtürk|muayene|şirket|vergi|maliye|sgk|iflas|ihale|fatura|ceza yedin|para cezası|icra|haciz|kredi|borsa|hisse|temettü|kumar|bahis|evlilik|boşan|eşin|maaş|terfi|işten kovul|mesai|kiracı|tapu/.test(s)) {
        return 'YAS_UYUMSUZ_YETISKIN_OLAYI';
      }
    }

    // KURAL B: ARABASI YOKKEN ARABA / TRAFİK / POLİS ÇEVİRMESİ YASAK!
    if (!cap.hasCar) {
      if (/araba sür|aracınla|direksiyon|trafik polis|polis çevir|çevirmeye|radar|hız sınırı|kırmızı ışık|egzoz|muayene|tüvtürk|kasko|trafik sigorta|otopark|lastik patla|motor arıza|şerit ihlal|alkollü araç|trafik ceza/.test(s)) {
        return 'ARABA_YOKKEN_TRAFIK_OLAYI';
      }
    }

    // KURAL C: EHLİYETİ YOKKEN "ARABA SÜRERKEN POLİS ÇEVİRMESİ" YASAK!
    if (!cap.hasLicenseB) {
      if (/araba sürerken|seyir halindeyken|direksiyon başında|hız sınırını aş|radara gir|ehliyetine el/.test(s)) {
        return 'EHLIYET_YOKKEN_SURUS_OLAYI';
      }
    }

    // KURAL D: ŞİRKETİ / İŞLETMESİ YOKKEN ŞİRKET / VERGİ / MALİYE / SGK CEZASI YASAK!
    if (!cap.hasBiz) {
      if (/şirket|işletme|fabrika|maliye|vergi denetim|vergi ceza|usulsüzlük|sgk|personel|işçi|tedarikçi|ihale|ticaret odası|zabıta|mühür|bilanço|iflas/.test(s)) {
        return 'SIRKET_YOKKEN_SIRKET_CEZASI';
      }
    }

    // KURAL E: EVİ / MÜLKÜ YOKKEN KİRACI / EMLAK VERGİSİ / AİDAT OLAYI YASAK!
    if (!cap.hasHouse) {
      if (/kiracı|emlak vergi|konut vergi|dairenin tesisat|site aidat|apartman yönet|kombi bozul|çatı akıt/.test(s)) {
        return 'EV_YOKKEN_EMLAK_OLAYI';
      }
    }

    // KURAL F: İŞİ YOKKEN PATRON / MAAŞ KESİNTİSİ / İŞTEN ATILMA OLAYI YASAK!
    if (!cap.hasJob) {
      if (/patronun|müdürün|maaş kesinti|işten kovul|işten çıkarıl|mesaiye kal|ofiste|terfi/.test(s)) {
        return 'IS_YOKKEN_KARİYER_OLAYI';
      }
    }

    // KURAL G: EŞİ / SEVGİLİSİ YOKKEN EŞ / EVLİLİK OLAYI YASAK!
    if (!cap.hasSpouse) {
      if (/eşinle|karınla|kocanla|evlilik yıldönüm|boşanma dava|kayınvalide/.test(s)) {
        return 'ES_YOKKEN_EVLILIK_OLAYI';
      }
    }

    return null;
  };

  // 3. OYUNCUNUN O ANKİ YAŞ VE İMKANLARINA %100 UYGUN GERÇEKÇİ OLAY SEÇİCİ
  window.pickRealisticEventForPlayer = function () {
    var db = window.REALISTIC_CONTEXT_EVENTS_DB || [];
    var cap = window.getPlayerCapabilitySnapshot();

    var eligible = db.filter(function (ev) {
      if (cap.age < ev.minAge || cap.age > ev.maxAge) return false;
      if (ev.reqCar && !cap.hasCar) return false;
      if (ev.reqLicenseB && !cap.hasLicenseB) return false;
      if (ev.reqNoLicenseB && cap.hasLicenseB) return false;
      if (ev.reqBiz && !cap.hasBiz) return false;
      if (ev.reqHouse && !cap.hasHouse) return false;
      if (ev.reqJob && !cap.hasJob) return false;
      if (ev.reqSpouse && !cap.hasSpouse) return false;
      return true;
    });

    // Eğer oyuncunun özel varlığı (Araba, Şirket, Ev, İş) varsa önceliği o varlığın gerçekçi olayına ver!
    var specialized = eligible.filter(function (ev) {
      return ev.reqCar || ev.reqBiz || ev.reqHouse || ev.reqJob || ev.reqNoLicenseB;
    });

    var pool = (specialized.length > 0 && Math.random() < 0.72) ? specialized : eligible;
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  // 4. GERÇEKÇİ OLAY PENCERESİ (MODAL) GÖSTERİCİ VE SEÇENEK UYGULAYICI
  window.showRealisticContextModal = function (evItem) {
    if (!evItem || !G) return;
    var modal = document.getElementById('eventModal');
    if (!modal) return;
    modal.classList.remove('hidden');

    var c = window.getCountry();
    var baseWage = c.monthlyMinWage || 22104;

    modal.innerHTML = `
      <div class="w-full max-w-md mx-auto my-auto p-5 rounded-3xl bg-slate-950 border-2 border-amber-400/70 shadow-2xl space-y-3.5">
        <div>
          <span class="event-condition-pill">
            ✓ KOŞUL DOĞRULANDI: ${evItem.conditionLabel}
          </span>
          <div class="text-base font-black text-white leading-snug">${evItem.title}</div>
          <p class="text-xs text-slate-300 leading-relaxed mt-1.5">${evItem.desc}</p>
        </div>

        <div class="space-y-2 pt-1">
          ${evItem.choices.map(function (ch, idx) {
            var moneyPreview = '';
            if (ch.eff && ch.eff.moneyMult) {
              var amt = Math.round(baseWage * Math.abs(ch.eff.moneyMult));
              moneyPreview = ch.eff.moneyMult > 0
                ? ' <span class="text-emerald-400 font-mono-num">(+' + window.fmtMoney(amt) + ')</span>'
                : ' <span class="text-rose-400 font-mono-num">(-' + window.fmtMoney(amt) + ')</span>';
            }
            return `
              <button type="button" onclick="window.resolveRealisticEventChoice('${evItem.id}', ${idx})" class="event-choice-btn-realistic">
                <span>${ch.label}${moneyPreview}</span>
                <span class="text-amber-300 font-black">&rarr;</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  };

  window.resolveRealisticEventChoice = function (evId, choiceIdx) {
    var db = window.REALISTIC_CONTEXT_EVENTS_DB || [];
    var evItem = db.find(function (x) { return x.id === evId; });
    var modal = document.getElementById('eventModal');
    if (modal) modal.classList.add('hidden');
    if (!evItem || !evItem.choices[choiceIdx] || !G) return;

    var ch = evItem.choices[choiceIdx];
    var eff = ch.eff || {};
    var c = window.getCountry();
    var baseWage = c.monthlyMinWage || 22104;

    if (eff.moneyMult) {
      var delta = Math.round(baseWage * eff.moneyMult);
      G.money = Math.max(0, (G.money || 0) + delta);
    }
    if (eff.health) G.health = Math.max(0, Math.min(100, (G.health || 85) + eff.health));
    if (eff.happy) G.happy = Math.max(0, Math.min(100, (G.happy || 80) + eff.happy));
    if (eff.smart) {
      G.smart = Math.max(0, Math.min(100, (G.smart || 75) + eff.smart));
      G.intel = G.smart;
    }
    if (eff.looks) G.looks = Math.max(0, Math.min(100, (G.looks || 75) + eff.looks));
    if (eff.creditBonus) G.creditScore = Math.min(1900, (G.creditScore || 1350) + eff.creditBonus);
    if (eff.yksBonus) G.yksScore = Math.min(500, (G.yksScore || 240) + eff.yksBonus);
    if (eff.grantLicenseB) {
      if (!G.licenses) G.licenses = { B: false, CE: false };
      G.licenses.B = true;
    }

    if (ch.log) {
      window.addLog(G.age, ch.log, 'good');
    }
    if (typeof saveGame === 'function') saveGame();
    if (typeof renderAll === 'function') renderAll();
  };

  // 5. KAPI BEKÇİSİ 1: OPENEVENTMODAL KANCASI (SAÇMA OLAY PENCERELERİNİ YAKALAR VE DEĞİŞTİRİR)
  var _prevOpenEventModalV10 = window.openEventModal;
  window.openEventModal = openEventModal = function (cfg) {
    if (!cfg || typeof G === 'undefined' || !G) return;

    var combinedText = (cfg.badge || '') + ' ' + (cfg.title || '') + ' ' + (cfg.desc || '');
    var violation = window.findRealismViolation(combinedText);

    // Eğer oyun arabasız/ehliyetsiz trafik olayı veya şirketsiz vergi cezası açmaya çalıştıysa ENGELLE!
    if (violation) {
      var replacement = window.pickRealisticEventForPlayer();
      if (replacement) {
        window.showRealisticContextModal(replacement);
      }
      return;
    }

    if (typeof _prevOpenEventModalV10 === 'function') {
      _prevOpenEventModalV10(cfg);
    }
  };

  // 6. KAPI BEKÇİSİ 2: ADDLOG VE ADVANCEAGE KANCASI (SAÇMA LOG CEZALARINI İPTAL EDER VE PARAYI İADE EDER)
  var _protectedMoneySnapshot = null;

  var _prevAddLogV10 = window.addLog;
  window.addLog = addLog = function (ageOrText, maybeText, maybeType) {
    var txtVal = typeof ageOrText === 'number' ? String(maybeText || '') : String(ageOrText || '');
    var violation = window.findRealismViolation(txtVal);

    if (violation) {
      // Eğer eski oyun bu saçma olay yüzünden oyuncunun parasını kestiyse ANINDA GERİ İADE ET!
      if (_protectedMoneySnapshot !== null && typeof G !== 'undefined' && G && G.money < _protectedMoneySnapshot) {
        G.money = _protectedMoneySnapshot;
      }
      // Saçma log satırını ana ekrana YAZMA (tamamen yut)!
      return;
    }

    // Geçerli bir log ise para snapshot'ını güncelle ve yazdır
    if (typeof G !== 'undefined' && G) {
      _protectedMoneySnapshot = G.money;
    }
    if (typeof _prevAddLogV10 === 'function') {
      return _prevAddLogV10(ageOrText, maybeText, maybeType);
    }
  };

  var _prevAdvanceAgeV10 = window.advanceAge;
  window.advanceAge = advanceAge = function () {
    if (typeof G !== 'undefined' && G) {
      _protectedMoneySnapshot = G.money;
    }

    if (typeof _prevAdvanceAgeV10 === 'function') {
      _prevAdvanceAgeV10();
    }

    _protectedMoneySnapshot = null;

    // Eğer bu yaş geçişinde ekranda açık bir olay penceresi yoksa, %55 ihtimalle yaşa ve imkanlara uygun gerçekçi olay çıkar!
    var evModal = document.getElementById('eventModal');
    var isModalOpen = evModal && !evModal.classList.contains('hidden');
    if (!isModalOpen && Math.random() < 0.55) {
      var realisticEv = window.pickRealisticEventForPlayer();
      if (realisticEv) {
        window.showRealisticContextModal(realisticEv);
      }
    }
  };
})();
