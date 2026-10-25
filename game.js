/* ============================================================================
   1. WEB AUDIO SES MOTORU, ÇİFT TIKLAMA KİLİDİ VE PWA KURULUMU
   ============================================================================ */
let soundEnabled = true;
let audioCtx = null;

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
  document.addEventListener('touchend', function (e) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });

  document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(evt => {
    document.addEventListener(evt, e => e.preventDefault(), { passive: false });
  });

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
    const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = URL.createObjectURL(manifestBlob);
    document.head.appendChild(manifestLink);
  } catch (err) {}
})();

/* ============================================================================
   2. OYUN DURUMU (STATE) VE YARDIMCI FONKSİYONLAR
   ============================================================================ */
let startConfig = { countryId: 'TR', gender: 'M', portraitIdx: 0 };
let activeFinanceTab = 'bank';
let activeGarageTab = 'dealer';
let G = null;

function getCountry(id = (G ? G.countryId : startConfig.countryId)) {
  return COUNTRIES.find(c => c.id === id) || COUNTRIES[0];
}

function fmtMoney(amount, countryId) {
  const c = getCountry(countryId);
  const rounded = Math.round(amount || 0);
  return rounded.toLocaleString('tr-TR') + ' ' + c.currency;
}

function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(v)));
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

function unlockAchievement(achId) {
  if (!G || !G.achievements) return;
  if (G.achievements.includes(achId)) return;
  const ach = ACHIEVEMENTS_DB.find(x => x.id === achId);
  if (!ach) return;
  G.achievements.push(achId);
  playSfx('trophy');
  addLog(G.age, `🏆 **BAŞARIM AÇILDI: ${ach.icon} ${ach.title}** — ${ach.desc}`, 'fame');
  showToast(`🏆 Başarım: ${ach.title}!`);
}

/* ============================================================================
   3. BAŞLANGIÇ EKRANI VE ÜLKE SEÇİCİ İŞLEMLERİ
   ============================================================================ */
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
  if (g === 'M') {
    btnM.className = 'p-3 rounded-2xl border border-emerald-500 bg-emerald-500/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition';
    btnF.className = 'p-3 rounded-2xl border border-slate-800 bg-slate-900/80 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition';
  } else {
    btnF.className = 'p-3 rounded-2xl border border-emerald-500 bg-emerald-500/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition';
    btnM.className = 'p-3 rounded-2xl border border-slate-800 bg-slate-900/80 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition';
  }
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

/* ============================================================================
   4. YENİ HAYAT BAŞLATMA VE KAYIT SİSTEMİ
   ============================================================================ */
function startNewLife() {
  const c = getCountry(startConfig.countryId);
  const firstName = document.getElementById('inputFirstName').value.trim() || pickRandom(c.namesM);
  const lastName = document.getElementById('inputLastName').value.trim() || pickRandom(c.lastNames);
  const fatherName = pickRandom(c.namesM) + ' ' + lastName;
  const motherName = pickRandom(c.namesF) + ' ' + lastName;

  G = {
    generation: 1,
    firstName,
    lastName,
    gender: startConfig.gender,
    countryId: c.id,
    portraitIdx: startConfig.portraitIdx,
    age: 0,
    alive: true,

    // İstatistikler
    health: randInt(84, 100),
    happy: randInt(82, 100),
    smart: randInt(55, 92),
    looks: randInt(55, 92),
    fame: 0,
    stress: 5,

    // Ekonomi, Kara Para & Yatırım
    money: 0,
    dirtyMoney: 0,
    bankSavings: 0,
    loanDebt: 0,
    monthlyAlimony: 0,
    creditScore: 1150,
    investments: { gold: 0, forex: 0, stock: 0, crypto: 0 },

    // Eğitim & Üniversite
    eduStage: 'Bebek',
    obpScore: randInt(68, 88),
    examPrepBonus: 0,
    lastExamScore: 0,
    lastExamRank: 0,
    highSchoolGrad: false,
    uniGrad: false,
    currentMajor: null,
    uniYearsLeft: 0,
    graduatedMajor: null,
    uniLiving: 'kyk',
    kykSupport: 'none',
    partTimeJobId: null,

    // Kariyer, Ehliyet, Askerlik, Sicil & Cezaevi
    jobId: null,
    jobExp: 0,
    licenses: { B: false, CE: false },
    militaryDone: false,
    criminalRecord: false,
    inPrison: false,
    prisonYearsLeft: 0,

    // Paket 1: Siyaset
    politics: {
      inParty: false,
      officeId: null,
      approval: 20,
      taxModifier: 0
    },

    // Paket 2: Profesyonel Spor / E-Spor
    sports: {
      branchId: null,
      tierIndex: 0,
      skill: randInt(45, 70),
      injured: false
    },

    // Paket 4: Organize Suç Sendikası (Mafya)
    syndicate: {
      joined: false,
      rankLevel: 0,
      respect: 10
    },

    // Paket 5: Hastalıklar
    diseases: [],

    // Paket 6: Başarımlar
    achievements: [],

    // Sosyal Medya
    social: {
      activePlatforms: [],
      followers: 0,
      verified: false,
      postsThisYear: 0,
      annualAdIncome: 0
    },

    // Varlıklar
    cars: [],
    houses: [],
    businesses: [],

    // İlişkiler
    relations: [
      { id: 'father', name: fatherName, role: 'Baba', age: randInt(25, 38), love: randInt(75, 98), alive: true },
      { id: 'mother', name: motherName, role: 'Anne', age: randInt(23, 35), love: randInt(80, 100), alive: true }
    ],
    partner: null,
    children: [],
    willChildIndex: 0,

    logs: []
  };

  playSfx('coin');
  addLog(0, `${c.flag} **${c.name}** sınırları içinde **${firstName} ${lastName}** (1. Kuşak) olarak dünyaya geldin. Babası ${fatherName}, annesi ${motherName}.`, 'milestone');
  document.getElementById('startScreen').classList.add('hidden');
  saveGame();
  renderAll();
}

function saveGame() {
  if (!G) return;
  try {
    localStorage.setItem('8b_life_save_v6', JSON.stringify(G));
  } catch (e) {}
}

function loadSavedGame() {
  try {
    const raw = localStorage.getItem('8b_life_save_v6');
    if (!raw) return;
    G = JSON.parse(raw);
    document.getElementById('startScreen').classList.add('hidden');
    renderAll();
    showToast('Kayıtlı oyunun yüklendi!');
  } catch (e) {
    showToast('Kayıt okunamadı.');
  }
}

/* ============================================================================
   5. GELİR, GİDER, SİYASET, SPOR, NAFAKA VE FİLO HESAPLAMA MOTORU
   ============================================================================ */
function getEffectiveTaxRate() {
  const c = getCountry();
  const mod = (G && G.politics && G.politics.officeId === 'president') ? (G.politics.taxModifier || 0) : 0;
  return Math.max(0, Math.min(0.55, c.taxRate + mod));
}

function getJobMonthlyGross(job) {
  const c = getCountry();
  const expMultiplier = 1 + (G.jobExp || 0) * 0.06;
  return Math.round(c.monthlyMinWage * job.mult * expMultiplier);
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

  const effTax = getEffectiveTaxRate();
  const monthlyTax = Math.round(monthlyGrossSalary * effTax);
  const monthlyNetSalary = monthlyGrossSalary - monthlyTax + monthlyStudentIncome;

  let monthlyBizProfit = 0;
  G.businesses.forEach(b => {
    const bType = BUSINESS_TYPES.find(t => t.id === b.typeId);
    if (bType) {
      const fleetMult = 1 + (b.fleet - 1) * 0.42 + (b.employees - 2) * 0.15;
      const stratMult = b.strategy === 'premium' ? 1.22 : (b.strategy === 'cheap' ? 0.88 : 1.0);
      monthlyBizProfit += Math.round(c.monthlyMinWage * bType.baseProfitMult * fleetMult * stratMult);
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
      monthlyLivingExpense = G.uniLiving === 'kyk'
        ? Math.round(c.monthlyMinWage * 0.25)
        : Math.round(c.monthlyMinWage * 0.68);
    } else {
      monthlyLivingExpense = hasOwnHomeToLive
        ? Math.round(c.monthlyLivingCost * 0.45)
        : c.monthlyLivingCost;
    }
    monthlyLivingExpense += G.children.length * Math.round(c.monthlyMinWage * 0.18);
    monthlyLivingExpense += (G.monthlyAlimony || 0);
  }

  let monthlyCarExpense = 0;
  G.cars.forEach(car => {
    let rate = 0.08;
    if (car.trafficIns) rate += 0.025;
    if (car.kasko) rate += 0.055;
    monthlyCarExpense += Math.round(c.monthlyMinWage * rate);
  });

  let monthlyLoanPayment = 0;
  if (G.loanDebt > 0) {
    monthlyLoanPayment = Math.min(G.loanDebt, Math.round(G.loanDebt * 0.035) + Math.round(c.monthlyMinWage * 0.12));
  }

  const totalExpenses = monthlyLivingExpense + monthlyCarExpense + monthlyLoanPayment;
  const monthlyNetCashflow = monthlyNetSalary + monthlyBizProfit + monthlyRentIncome + monthlySocialIncome - totalExpenses;

  return {
    monthlyGrossSalary,
    monthlyTax,
    monthlyNetSalary,
    monthlyBizProfit,
    monthlyRentIncome,
    monthlySocialIncome,
    monthlyLivingExpense,
    monthlyCarExpense,
    monthlyLoanPayment,
    monthlyNetCashflow,
    annualNetCashflow: monthlyNetCashflow * 12
  };
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

/* ============================================================================
   6. ARAYÜZ GÜNCELLEME (RENDER)
   ============================================================================ */
function getCurrentPortrait() {
  const gSet = PORTRAITS[G.gender] || PORTRAITS.M;
  if (G.age <= 3) return gSet.baby[0];
  if (G.age <= 13) return gSet.child[0];
  if (G.age <= 34) return gSet.young[G.portraitIdx % gSet.young.length];
  if (G.age <= 64) return gSet.adult[G.portraitIdx % gSet.adult.length];
  return gSet.old[0];
}

function renderAll() {
  if (!G) return;
  const c = getCountry();
  const fin = calculateFinances();

  if (getNetWorth() >= c.monthlyMinWage * 100) unlockAchievement('millionaire');

  document.getElementById('charAvatar').src = getCurrentPortrait();
  document.getElementById('charCountryFlag').textContent = c.flag;
  document.getElementById('charName').textContent = `${G.firstName} ${G.lastName}`;
  document.getElementById('verifiedBadge').classList.toggle('hidden', !G.social.verified);
  document.getElementById('prisonBadge').classList.toggle('hidden', !G.inPrison);
  document.getElementById('sickBadge').classList.toggle('hidden', !G.diseases || G.diseases.length === 0);
  document.getElementById('genBadge').textContent = `Kuşak #${G.generation || 1}`;

  let roleLabel = G.eduStage;
  if (G.inPrison) {
    roleLabel = `Mahkum (${G.prisonYearsLeft} Yıl Kaldı)`;
  } else if (G.politics && G.politics.officeId) {
    const off = POLITICS_OFFICES.find(o => o.id === G.politics.officeId);
    if (off) roleLabel = `${off.icon} ${off.title}`;
  } else if (G.sports && G.sports.branchId) {
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
  document.getElementById('charBalance').className =
    `text-sm font-extrabold font-mono-num ${G.money >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;

  const sign = fin.monthlyNetCashflow >= 0 ? '+' : '';
  document.getElementById('charCashflow').textContent = `Aylık: ${sign}${fmtMoney(fin.monthlyNetCashflow)}`;
  document.getElementById('charCashflow').className =
    `text-[10px] font-mono-num ${fin.monthlyNetCashflow >= 0 ? 'text-emerald-400/90' : 'text-rose-400'}`;

  updateStatBar('Health', G.health);
  updateStatBar('Happy', G.happy);
  updateStatBar('Smart', G.smart);
  updateStatBar('Looks', G.looks);
  updateStatBar('Fame', G.fame);
  updateStatBar('Stress', G.stress || 0);

  const navIcon = document.getElementById('navCareerIcon');
  const navLabel = document.getElementById('navCareerLabel');
  if (G.inPrison) {
    navIcon.textContent = '⛓️'; navLabel.textContent = 'Cezaevi';
  } else if (G.age < 18 || G.eduStage === 'Üniversite') {
    navIcon.textContent = '🎓'; navLabel.textContent = 'Okul / İş';
  } else {
    navIcon.textContent = '💼'; navLabel.textContent = 'Kariyer';
  }

  renderLogs();
}

function updateStatBar(name, val) {
  const clamped = clamp(val);
  document.getElementById(`stat${name}Val`).textContent = `${clamped}`;
  document.getElementById(`stat${name}Bar`).style.width = `${clamped}%`;
}

function formatCompactNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'B';
  return String(n);
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
  container.innerHTML = G.logs.map(group => {
    const itemsHtml = group.items.map(item => {
      let borderColor = 'border-slate-800 bg-slate-900/60';
      if (item.type === 'milestone') borderColor = 'border-emerald-500/30 bg-emerald-950/20';
      if (item.type === 'good') borderColor = 'border-teal-500/30 bg-teal-950/20';
      if (item.type === 'bad') borderColor = 'border-rose-500/30 bg-rose-950/20';
      if (item.type === 'fame') borderColor = 'border-amber-500/30 bg-amber-950/20';
      const formatted = item.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
      return `<div class="p-2.5 rounded-xl border ${borderColor} text-xs text-slate-300 leading-relaxed">${formatted}</div>`;
    }).join('');

    return `
      <div class="space-y-1.5">
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/90 text-[11px] font-extrabold text-emerald-400">
          <span>Yaş ${group.age}</span>
        </div>
        <div class="space-y-1.5 pl-1">${itemsHtml}</div>
      </div>
    `;
  }).join('');
  container.scrollTop = container.scrollHeight;
}

/* ============================================================================
   7. +1 YAŞ İLERLEME MOTORU (6 PAKET ENTEGRE)
   ============================================================================ */
function advanceAge() {
  if (!G || !G.alive) {
    openDeathModal();
    return;
  }

  G.age += 1;
  G.social.postsThisYear = 0;
  const c = getCountry();

  // 1) Cezaevi Kontrolü
  if (G.inPrison) {
    G.prisonYearsLeft -= 1;
    G.happy = clamp(G.happy - 6);
    if (G.prisonYearsLeft <= 0) {
      G.inPrison = false;
      G.prisonYearsLeft = 0;
      addLog(G.age, `🔓 Cezanı tamamlayıp **tahliye oldun!**`, 'milestone');
    } else {
      addLog(G.age, `⛓️ Cezaevinde bir yıl daha geçti. Tahliyeye **${G.prisonYearsLeft} yıl** kaldı.`, 'bad');
    }
  }

  // 2) Eğitim Kademeleri
  if (G.age === 6) {
    G.eduStage = 'İlkokul';
    addLog(G.age, `🎒 **İlkokula** başladın.`, 'milestone');
  } else if (G.age === 10) {
    G.eduStage = 'Ortaokul';
    addLog(G.age, `📘 **Ortaokula** geçtin.`, 'milestone');
  } else if (G.age === 14) {
    G.eduStage = 'Lise';
    addLog(G.age, `🏫 **Liseye** başladın! Artık dilersen **Spor / E-Spor Akademisi** seçmelerine de katılabilirsin.`, 'milestone');
  } else if (G.age === 18 && G.eduStage === 'Lise') {
    G.highSchoolGrad = true;
    G.eduStage = 'Lise Mezunu';
    addLog(G.age, `🎓 Liseden **${G.obpScore} OBP** ile mezun oldun!`, 'milestone');
  }

  // Üniversite ilerlemesi
  if (!G.inPrison && G.eduStage === 'Üniversite' && G.uniYearsLeft > 0) {
    G.uniYearsLeft -= 1;
    if (G.kykSupport === 'kredi') G.loanDebt += Math.round(c.monthlyMinWage * 2.6);
    if (G.uniYearsLeft === 0) {
      const m = UNI_MAJORS.find(x => x.id === G.currentMajor);
      G.uniGrad = true;
      G.graduatedMajor = G.currentMajor;
      G.eduStage = `${m ? m.name : 'Üniversite'} Mezunu`;
      G.partTimeJobId = null;
      G.kykSupport = 'none';
      G.smart = clamp(G.smart + 8);
      unlockAchievement('uni_grad');
      addLog(G.age, `🎓 **${m ? m.name : 'Üniversite'}** bölümünden mezun oldun!`, 'milestone');
    } else {
      addLog(G.age, `📚 Üniversite eğitimine devam ediyorsun. Mezuniyete **${G.uniYearsLeft} yıl** kaldı.`);
    }
  }

  // 3) İş, Spor Emekliliği, Stres ve Hastalık Kontrolü
  if (!G.inPrison && G.jobId) {
    G.jobExp += 1;
    const j = JOBS.find(x => x.id === G.jobId);
    if (j) G.stress = clamp((G.stress || 0) + (j.stress || 5) - 3);
  } else {
    G.stress = clamp((G.stress || 0) - 5);
  }

  // Profesyonel Sporcu Yaş & Performans Döngüsü
  if (!G.inPrison && G.sports && G.sports.branchId) {
    G.fame = clamp(G.fame + (G.sports.tierIndex + 1) * 4);
    G.sports.injured = false;
    if (G.age >= 37 && G.sports.branchId !== 'esports') {
      const br = SPORTS_BRANCHES.find(b => b.id === G.sports.branchId);
      addLog(G.age, `👟 **JÜBİLE!** 37 yaşına geldiğin için aktif **${br ? br.name : 'Spor'}** kariyerini noktaladın.`, 'milestone');
      G.sports.branchId = null;
    }
  }

  // Organize Suç Sendikası Yıllık Haraç Payı & MASAK Kontrolü
  if (!G.inPrison && G.syndicate && G.syndicate.joined) {
    const rObj = SYNDICATE_RANKS.find(r => r.level === G.syndicate.rankLevel) || SYNDICATE_RANKS[0];
    const yearlyCut = Math.round(c.monthlyMinWage * rObj.cutMult * 4);
    G.dirtyMoney = (G.dirtyMoney || 0) + yearlyCut;
    addLog(G.age, `🕶️ Sendika (${rObj.title}) operasyonlarından payına **+${fmtMoney(yearlyCut)} Kara Para** düştü.`, 'good');
  }

  // MASAK / Mali Şube Kara Para Baskını Riski
  if (!G.inPrison && G.dirtyMoney > c.monthlyMinWage * 15 && Math.random() < 0.28) {
    const confiscated = G.dirtyMoney;
    G.dirtyMoney = 0;
    addLog(G.age, `🚨 **MASAK / MALİ ŞUBE OPERASYONU!** Aklamadığın **${fmtMoney(confiscated)}** kara paranın izi sürüldü ve tamamına el konuldu!`, 'bad');
    openCourtTrialModal('Kara Para Aklama & Mali Suçlar', 4);
  }

  // Yüksek Stres -> Hastalık Tetiklemesi
  if (G.stress >= 80 && (!G.diseases || !G.diseases.includes('burnout')) && Math.random() < 0.45) {
    G.diseases.push('burnout');
    addLog(G.age, `🧠 **AŞIRI STRES (%${G.stress})!** Yoğun tempo yüzünden **Tükenmişlik Sendromu & Depresyon** teşhisi konuldu. Hastaneden psikoterapi almalısın!`, 'bad');
  }
  if (G.age > 35 && G.health < 75 && G.diseases.length === 0 && Math.random() < 0.16) {
    const d = pickRandom(DISEASES_DB);
    G.diseases.push(d.id);
    addLog(G.age, `🤒 **SAĞLIK UYARISI:** Kendini halsiz hissettin ve **${d.name}** hastalığına yakalandın!`, 'bad');
  }

  // Aktif Hastalıkların Etkisi
  if (G.diseases && G.diseases.length > 0) {
    G.diseases.forEach(dId => {
      const d = DISEASES_DB.find(x => x.id === dId);
      if (d) {
        G.health = clamp(G.health - d.hpDrain);
        G.happy = clamp(G.happy - d.happyDrain);
      }
    });
  }

  // 4) Yıllık Nakit Akışı & Findeks
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
    const netText = fin.annualNetCashflow >= 0
      ? `Yıllık net nakit akışın **+${fmtMoney(fin.annualNetCashflow)}** oldu.`
      : `Yıllık giderlerin gelirini aştı: **${fmtMoney(fin.annualNetCashflow)}**.`;
    addLog(G.age, `💳 ${netText}`, fin.annualNetCashflow >= 0 ? 'good' : 'bad');
  }

  // 5) Enflasyon ve Yatırım Sepeti Getirileri
  if (G.money > c.monthlyMinWage * 2 && c.inflation >= 0.08) {
    const erosion = Math.round(G.money * (c.inflation * 0.42));
    G.money -= erosion;
    addLog(G.age, `📉 **Enflasyon (%${Math.round(c.inflation * 100)})** nedeniyle vadesizde duran nakit paranın alım gücü **-${fmtMoney(erosion)}** eridi.`, 'bad');
  }

  const inv = G.investments;
  let totalInvGain = 0;
  if (inv.gold > 0) { const g = Math.round(inv.gold * (c.inflation + randInt(2, 12) / 100)); inv.gold += g; totalInvGain += g; }
  if (inv.forex > 0) { const f = Math.round(inv.forex * (c.inflation + randInt(0, 8) / 100)); inv.forex += f; totalInvGain += f; }
  if (inv.stock > 0) { const s = Math.round(inv.stock * (c.inflation + randInt(-12, 28) / 100)); inv.stock = Math.max(0, inv.stock + s); totalInvGain += s; }
  if (inv.crypto > 0) { const cr = Math.round(inv.crypto * (randInt(-38, 75) / 100)); inv.crypto = Math.max(0, inv.crypto + cr); totalInvGain += cr; }
  if (totalInvGain !== 0) {
    addLog(G.age, `📊 Yatırım portföyün bu yıl **${totalInvGain >= 0 ? '+' : ''}${fmtMoney(totalInvGain)}** değişti.`, totalInvGain >= 0 ? 'good' : 'bad');
  }

  if (G.bankSavings > 0) {
    const interest = Math.round(G.bankSavings * Math.max(0.12, c.inflation * 0.85));
    G.bankSavings += interest;
    addLog(G.age, `🏦 Vadeli mevduatına **+${fmtMoney(interest)}** faiz eklendi.`, 'good');
  }

  // 6) İcra, Araç Kasko & Emlak Kiracı Kontrolleri
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

  // 7) Çocuklar ve Aile Yaşlanması
  G.children.forEach(ch => { ch.age = (ch.age || 0) + 1; });
  G.relations.forEach(r => {
    if (r.alive) {
      r.age += 1;
      if (r.age > 76 && Math.random() < 0.14) {
        r.alive = false;
        G.happy = clamp(G.happy - 18);
        const inheritance = Math.round(c.monthlyMinWage * randInt(12, 48));
        G.money += inheritance;
        addLog(G.age, `🖤 ${r.role}n **${r.name}** (${r.age}) vefat etti. Sana **${fmtMoney(inheritance)}** miras kaldı.`, 'bad');
      }
    }
  });

  // 8) Yaşlılık & Ölüm
  if (G.age > 65) G.health = clamp(G.health - randInt(3, 8));
  if (G.health <= 0 || (G.age > 85 && Math.random() < 0.25)) {
    G.alive = false;
    playSfx('bad');
    addLog(G.age, `⚰️ **${G.age}** yaşında hayata veda ettin. Toplam net servetin: **${fmtMoney(getNetWorth())}**.`, 'bad');
    saveGame();
    renderAll();
    openDeathModal();
    return;
  }

  if (!G.inPrison) triggerYearlyEvents();
  saveGame();
  renderAll();
}

/* ============================================================================
   8. YILLIK İNTERAKTİF OLAYLAR (MESLEK, SİYASET, SPOR, ALDATMA, SINAV)
   ============================================================================ */
function triggerYearlyEvents() {
  const c = getCountry();

  // 1) 18 Yaş YKS
  if (G.age === 18 && G.highSchoolGrad && !G.uniGrad && G.eduStage !== 'Üniversite') {
    openUniversityExamModal();
    return;
  }

  // 2) Suudi Arabistan Erken Evlilik Baskısı
  if (c.id === 'SA' && G.gender === 'F' && G.age === 16 && !G.partner) {
    const mehir = c.monthlyMinWage * 30;
    openEventModal({
      badge: '🇸🇦 Ülke Kültürü Olayı',
      title: 'Aileden Erken Evlilik Baskısı',
      desc: `Ailen, Riyad'da varlıklı bir ailenin oğluyla evlenmeni istiyor. Kabul edersen ${fmtMoney(mehir)} mehir alacaksın.`,
      choices: [
        {
          label: `💍 Kabul Et (+${fmtMoney(mehir)} Mehir)`,
          action: () => {
            G.money += mehir;
            G.partner = { name: 'Salman Al-Qahtani', age: 27, love: 65, married: true, prenup: false, cheated: false };
            addLog(G.age, `💍 Erken yaşta evlendin ve **${fmtMoney(mehir)}** mehir aldın.`, 'milestone');
            renderAll();
          }
        },
        {
          label: '📚 Reddet ve Eğitiminde Israrcı Ol',
          action: () => {
            G.obpScore = clamp(G.obpScore + 6, 50, 100);
            addLog(G.age, `📚 Evlilik teklifini reddedip eğitimine odaklandın.`);
            renderAll();
          }
        }
      ]
    });
    return;
  }

  // 3) Askerlik Celbi
  if (c.militaryAge && G.gender === 'M' && G.age === c.militaryAge && !G.militaryDone && G.eduStage !== 'Üniversite') {
    const choices = [
      {
        label: '🪖 6 Ay Zorunlu Askerliğe Git',
        action: () => {
          G.militaryDone = true;
          G.health = clamp(G.health + 4);
          addLog(G.age, `🪖 Zorunlu askerlik görevini tamamlayıp terhis oldun.`, 'milestone');
          renderAll();
        }
      }
    ];
    if (c.paidMilitaryCost > 0) {
      choices.push({
        label: `💳 Bedelli Askerlik Yap (${fmtMoney(c.paidMilitaryCost)})`,
        action: () => {
          if (G.money >= c.paidMilitaryCost) {
            G.money -= c.paidMilitaryCost;
            addLog(G.age, `💳 **${fmtMoney(c.paidMilitaryCost)}** ödeyerek bedelli askerlik yaptın.`, 'good');
          } else {
            showToast('Bakiye yetersiz, kışlaya alındın!');
          }
          G.militaryDone = true;
          renderAll();
        }
      });
    }
    openEventModal({
      badge: `${c.flag} Askerlik Celbi`,
      title: 'Askerlik Yoklaması Geldi',
      desc: `${c.name} yasalarına göre askerlik çağına geldin.`,
      choices
    });
    return;
  }

  // 4) PAKET 3: Partner Aldatma Şüphesi Olayı
  if (G.partner && G.partner.married && !G.partner.cheated && Math.random() < 0.14) {
    const detCost = Math.round(c.monthlyMinWage * 1.2);
    openEventModal({
      badge: '💔 Evlilik Krizi & Şüphe',
      title: `${G.partner.name} Son Günlerde Çok Gizemli`,
      desc: `Eşinin telefonunu sakladığını ve eve geç geldiğini fark ettin. Özel dedektif tutarsan mahkemede kusurlu sayılmasını sağlayıp nafaka/mal paylaşımından kurtulabilirsin.`,
      choices: [
        {
          label: `🕵️ Özel Dedektif Tut (${fmtMoney(detCost)})`,
          action: () => {
            if (G.money < detCost) { showToast('Dedektif için paran yetmedi!'); return; }
            G.money -= detCost;
            G.partner.cheated = true;
            addLog(G.age, `🕵️ Özel dedektif eşin **${G.partner.name}**'in seni aldattığını fotoğraflarla kanıtladı! Artık İlişki menüsünden tek kuruş kaptırmadan boşanabilirsin.`, 'bad');
            renderAll();
          }
        },
        {
          label: '🗣️ Doğrudan Yüzleş',
          action: () => {
            G.partner.love = clamp(G.partner.love - 25);
            G.happy = clamp(G.happy - 12);
            addLog(G.age, `🗣️ Eşinle sert bir tartışma yaşadın ama elinde mahkeme kanıtı yok.`, 'bad');
            renderAll();
          }
        }
      ]
    });
    return;
  }

  // 5) PAKET 1: Siyaset / İhale & Yüce Divan Olayı
  if (G.politics && G.politics.officeId && Math.random() < 0.35) {
    const bribe = Math.round(c.monthlyMinWage * 35);
    openEventModal({
      badge: '🏛️ Siyasi Kulis & İhale Dosyası',
      title: 'Kapalı Kapılar Ardında Dev İhale Teklifi',
      desc: `Büyük bir müteahhitlik grubu, imar/ihale onayı karşılığında gizli hesabına ${fmtMoney(bribe)} aktarmayı teklif ediyor. Yakalanırsan Yüce Divan'da yargılanırsın!`,
      choices: [
        {
          label: `💼 Teklifi Kabul Et (+${fmtMoney(bribe)} Kara Para)`,
          action: () => {
            if (Math.random() < 0.65) {
              G.dirtyMoney += bribe;
              addLog(G.age, `🕶️ İhale komisyonundan **+${fmtMoney(bribe)}** kara para kasana girdi.`, 'good');
            } else {
              G.politics.officeId = null;
              G.politics.approval = 5;
              addLog(G.age, `🚨 **SKANDAL PATLADI!** İhale yolsuzluğu basına sızdı, görevden alındın ve Yüce Divan'a sevk edildin!`, 'bad');
              openCourtTrialModal('Yüce Divan — Görevi Kötüye Kullanma', 6);
            }
            renderAll();
          }
        },
        {
          label: '⚖️ Reddet ve Şeffaf İhale Yap (+Halk Desteği)',
          action: () => {
            G.politics.approval = clamp(G.politics.approval + 14);
            G.fame = clamp(G.fame + 8);
            addLog(G.age, `👏 Rüşvet teklifini reddedip şeffaf ihale yaptın! Halk desteğin **%${G.politics.approval}** seviyesine yükseldi.`, 'good');
            renderAll();
          }
        }
      ]
    });
    return;
  }

  // 6) PAKET 2: Profesyonel Spor / Final Maçı & Sakatlık Olayı
  if (G.sports && G.sports.branchId && Math.random() < 0.38) {
    const bonus = Math.round(c.monthlyMinWage * (G.sports.tierIndex + 1) * 5);
    openEventModal({
      badge: '🏟️ Şampiyonluk Maçı Krizi',
      title: 'Final Maçı Öncesi Hafif Kas Ağrısı',
      desc: `Sezonun en kritik final maçı öncesi ağrın var. İğneyle sahaya çıkarsan şampiyonluk primi (${fmtMoney(bonus)}) kazanabilirsin ama ağır sakatlık riski var.`,
      choices: [
        {
          label: `🔥 İğneyle Sahaya Çık (Şampiyonluk Primi: ${fmtMoney(bonus)})`,
          action: () => {
            if (Math.random() < 0.65) {
              G.money += bonus;
              G.sports.skill = clamp(G.sports.skill + 7);
              G.fame = clamp(G.fame + 10);
              addLog(G.age, `🏆 Finalde yıldızlaştın ve takımını şampiyon yaptın! **+${fmtMoney(bonus)}** prim aldın.`, 'fame');
            } else {
              G.sports.injured = true;
              G.health = clamp(G.health - 20);
              addLog(G.age, `🩼 Maçın 20. dakikasında bağların koptu! Ağır sakatlık geçirdin.`, 'bad');
            }
            renderAll();
          }
        },
        {
          label: '🛡️ Riske Girme ve Dinlen',
          action: () => {
            G.health = clamp(G.health + 5);
            addLog(G.age, `🛡️ Final maçında riske girmeyip sağlığını korudun.`);
            renderAll();
          }
        }
      ]
    });
    return;
  }

  // 7) PAKET 5: Mesleklere Özel Yıllık İnteraktif Olaylar
  if (G.jobId && Math.random() < 0.32) {
    const reward = Math.round(c.monthlyMinWage * 3.5);
    openEventModal({
      badge: '💼 Mesleki Kriz & Karar',
      title: 'Kritik Operasyon ve Mesai Sorumluluğu',
      desc: `Çalıştığın kurumda herkesin çekindiği çok kritik bir dosya/operasyon sana geldi. Başarırsan terfi primi (${fmtMoney(reward)}) alacaksın.`,
      choices: [
        {
          label: `🚀 Sorumluluğu Üstlen (+${fmtMoney(reward)} Prim, +Stres)`,
          action: () => {
            G.stress = clamp((G.stress || 0) + 14);
            if (Math.random() < (0.45 + G.smart / 200)) {
              G.money += reward;
              G.jobExp += 1;
              addLog(G.age, `🌟 Mesleki krizi ustalıkla çözdün! **+${fmtMoney(reward)}** başarı primi ve kıdem aldın.`, 'good');
            } else {
              addLog(G.age, `😓 Operasyonda aksilikler yaşandı, üstlerinden uyarı aldın.`, 'bad');
            }
            renderAll();
          }
        },
        {
          label: '🧘‍♂️ Standart Prosedürü Uygula (Stressiz)',
          action: () => {
            G.stress = clamp((G.stress || 0) - 5);
            addLog(G.age, `📋 İşinde riske girmeden sakin bir yıl geçirdin.`);
            renderAll();
          }
        }
      ]
    });
  }
}

/* ============================================================================
   9. ALT NAVBAR SEKMELERİ (OKUL/İŞ/SPOR/SİYASET, FİNANS, İLİŞKİ, MENÜ)
   ============================================================================ */
function openNavSheet(tab) {
  const sheet = document.getElementById('bottomSheet');
  const title = document.getElementById('sheetTitle');
  const sub = document.getElementById('sheetSubtitle');
  const body = document.getElementById('sheetBody');
  const c = getCountry();
  sheet.classList.remove('hidden');

  // ---------------- 1. OKUL / İŞ / SPOR / SİYASET SEKMESİ ----------------
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
        </div>
      `;
      return;
    }

    title.textContent = '🎓 Eğitim, Meslek, Spor & Siyaset';
    sub.textContent = `${G.eduStage} • OBP: ${G.obpScore} • Sicil: ${G.criminalRecord ? 'Sabıkalı ⚠️' : 'Temiz ✓'}`;

    let html = `
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
        <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div class="text-xs font-extrabold text-emerald-400">📚 Okul & YKS Sınav Hazırlığı</div>
          <div class="text-[11px] text-slate-300">OBP: <strong>${G.obpScore}/100</strong> • Ek Sınav Hazırlığı: <strong>+${G.examPrepBonus} Puan</strong></div>
          <div class="grid grid-cols-2 gap-2 pt-1">
            <button onclick="studySchoolHard()" class="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">📖 Ders Çalış (+OBP)</button>
            <button onclick="takeExamCourse()" class="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">📝 Deneme Kulübü</button>
          </div>
        </div>
      `;
    }

    if (G.eduStage === 'Üniversite') {
      html += `
        <div class="p-3.5 rounded-2xl bg-slate-900 border border-indigo-500/40 space-y-2">
          <div class="flex items-center justify-between">
            <div class="text-xs font-extrabold text-indigo-300">🎓 Kampüs & KYK Yaşamı (${G.uniYearsLeft} Yıl Kaldı)</div>
            <span class="px-2 py-0.5 rounded bg-indigo-500/20 text-[10px] font-bold text-indigo-300">${G.kykSupport === 'burs' ? 'Burslu' : 'KYK Kredili'}</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button onclick="setUniLiving('kyk')" class="p-2 rounded-xl border text-xs font-bold ${G.uniLiving === 'kyk' ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-slate-800 bg-slate-950 text-slate-400'}">🛏️ KYK Yurdu</button>
            <button onclick="setUniLiving('house')" class="p-2 rounded-xl border text-xs font-bold ${G.uniLiving === 'house' ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-slate-800 bg-slate-950 text-slate-400'}">🏠 Öğrenci Evi</button>
          </div>
          <div class="space-y-1.5 pt-1">
            ${PART_TIME_JOBS.map(pt => {
              const pay = Math.round(c.monthlyMinWage * pt.mult);
              const active = G.partTimeJobId === pt.id;
              return `
                <div class="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div class="text-[11px] text-white font-semibold">${pt.icon} ${pt.title} <span class="text-emerald-400 font-mono-num">(+${fmtMoney(pay)}/ay)</span></div>
                  <button onclick="togglePartTimeJob('${pt.id}')" class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${active ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500 text-slate-950'}">${active ? 'Ayrıl' : 'Gir'}</button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    if (G.age >= 18 && G.highSchoolGrad && !G.uniGrad && G.eduStage !== 'Üniversite') {
      html += `
        <div class="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2.5">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs font-extrabold text-white">🎯 Üniversite Bölüm Tercihleri</div>
              <div class="text-[11px] text-slate-400">YKS Puanın: <strong class="text-emerald-400">${G.lastExamScore}</strong></div>
            </div>
            <button onclick="openUniversityExamModal()" class="px-2.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-extrabold">Sınava Tekrar Gir</button>
          </div>
          <div class="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            ${UNI_MAJORS.map(m => {
              const canPublic = G.lastExamScore >= m.minScore;
              const canPrivate = G.lastExamScore >= (m.minScore - 40);
              return `
                <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <div class="text-xs font-bold text-white">${m.icon} ${m.name}</div>
                    <div class="text-[10px] text-slate-400">Taban: <strong>${m.minScore}</strong> (${m.rankText})</div>
                  </div>
                  <div class="flex gap-1 shrink-0">
                    <button onclick="enrollUniversity('${m.id}', false)" class="px-2 py-1 rounded-lg text-[10px] font-bold ${canPublic ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'}">Devlet</button>
                    <button onclick="enrollUniversity('${m.id}', true)" class="px-2 py-1 rounded-lg text-[10px] font-bold ${canPrivate ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' : 'bg-slate-800 text-slate-500'}">Özel</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    html += `
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">💼 Tam Zamanlı Meslekler</h4>
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
          const recordBlocked = j.cleanRecord && G.criminalRecord;

          return `
            <div class="p-3 rounded-2xl bg-slate-900/90 border ${isCurrent ? 'border-emerald-500' : 'border-slate-800'} flex items-center justify-between gap-2">
              <div class="min-w-0">
                <div class="text-xs font-extrabold text-white truncate">${j.icon} ${j.title}</div>
                <div class="text-[10px] text-slate-400">${reqText} ${recordBlocked ? '<span class="text-rose-400 font-bold">• Sabıka Engeli!</span>' : ''}</div>
                <div class="text-xs font-mono-num font-bold text-emerald-400 mt-0.5">${fmtMoney(monthlyGross)} / ay</div>
              </div>
              <button onclick="applyForJob('${j.id}')" class="px-3 py-2 rounded-xl text-xs font-extrabold shrink-0 ${isCurrent ? 'bg-emerald-500/20 text-emerald-300' : (recordBlocked ? 'bg-rose-950 text-rose-400' : 'bg-emerald-500 text-slate-950')}">
                ${isCurrent ? 'Çalışıyor' : (recordBlocked ? 'Sabıkalı' : 'Başvur')}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    body.innerHTML = html;
    return;
  }

  // ---------------- 2. FİNANS (BANKA, BORSA/DÖVİZ, ŞİRKET & KARA PARA AKLAMA) ----------------
  if (tab === 'finance') {
    const fin = calculateFinances();
    title.textContent = `🏦 Finans, Borsa & Şirket (${c.currency})`;
    sub.textContent = `Findeks: ${G.creditScore} • Kara Para: ${fmtMoney(G.dirtyMoney || 0)}`;

    const tabBar = `
      <div class="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-2">
        <button onclick="activeFinanceTab='bank'; openNavSheet('finance')" class="py-2 rounded-xl text-xs font-extrabold ${activeFinanceTab === 'bank' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}">💳 Banka & Kredi</button>
        <button onclick="activeFinanceTab='invest'; openNavSheet('finance')" class="py-2 rounded-xl text-xs font-extrabold ${activeFinanceTab === 'invest' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}">📈 Borsa & Döviz</button>
        <button onclick="activeFinanceTab='biz'; openNavSheet('finance')" class="py-2 rounded-xl text-xs font-extrabold ${activeFinanceTab === 'biz' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}">🚛 Şirket & Filo</button>
      </div>
    `;

    if (activeFinanceTab === 'bank') {
      body.innerHTML = tabBar + `
        <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
          <div class="flex justify-between items-center mb-1">
            <span class="font-extrabold text-white">📊 Aylık Gelir & Gider</span>
            <span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">Vergi: %${Math.round(getEffectiveTaxRate() * 100)}</span>
          </div>
          <div class="flex justify-between text-slate-300"><span>Net Maaş / Spor / Makam:</span><span class="font-mono-num text-emerald-400">+${fmtMoney(fin.monthlyNetSalary)}</span></div>
          <div class="flex justify-between text-slate-300"><span>Şirket Filosu & Kira Geliri:</span><span class="font-mono-num text-emerald-400">+${fmtMoney(fin.monthlyBizProfit + fin.monthlyRentIncome)}</span></div>
          <div class="flex justify-between text-slate-300"><span>Sosyal Medya Geliri:</span><span class="font-mono-num text-emerald-400">+${fmtMoney(fin.monthlySocialIncome)}</span></div>
          <div class="flex justify-between text-slate-300"><span>Yaşam, Kira & Nafaka (${fmtMoney(G.monthlyAlimony || 0)}):</span><span class="font-mono-num text-rose-400">-${fmtMoney(fin.monthlyLivingExpense)}</span></div>
          <div class="flex justify-between text-slate-300"><span>Araç Yakıt, Sigorta & Kasko:</span><span class="font-mono-num text-rose-400">-${fmtMoney(fin.monthlyCarExpense)}</span></div>
          <div class="flex justify-between text-slate-300"><span>Banka Kredi Taksiti:</span><span class="font-mono-num text-rose-400">-${fmtMoney(fin.monthlyLoanPayment)}</span></div>
          <div class="border-t border-slate-800 pt-1.5 flex justify-between font-extrabold">
            <span>Aylık Net Akış:</span>
            <span class="font-mono-num ${fin.monthlyNetCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${fin.monthlyNetCashflow >= 0 ? '+' : ''}${fmtMoney(fin.monthlyNetCashflow)}</span>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div class="text-xs font-extrabold text-white">🏦 Vadeli Mevduat & Kredi</div>
          <div class="text-[10px] text-slate-400">Mevduat: <strong>${fmtMoney(G.bankSavings)}</strong> • Borç: <strong class="text-rose-400">${fmtMoney(G.loanDebt)}</strong></div>
          <div class="grid grid-cols-2 gap-2">
            <button onclick="depositSavings()" class="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">Mevduata Yatır (%50)</button>
            <button onclick="withdrawSavings()" class="p-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold">Mevduatı Çek</button>
            <button onclick="takeBankLoan(12)" class="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">İhtiyaç Kredisi (+${fmtMoney(c.monthlyMinWage * 12)})</button>
            <button onclick="takeBankLoan(60)" class="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">Ticari Kredi (+${fmtMoney(c.monthlyMinWage * 60)})</button>
          </div>
          ${G.loanDebt > 0 ? `<button onclick="payOffLoan()" class="w-full py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">Kredi Borcunu Kapat (${fmtMoney(G.loanDebt)})</button>` : ''}
        </div>
      `;
    } else if (activeFinanceTab === 'invest') {
      const unitAmt = c.monthlyMinWage * 2;
      const assets = [
        { key: 'gold', name: '🪙 Gram Altın (Enflasyon Korumalı)', desc: 'Düşük risk, güvenli liman' },
        { key: 'forex', name: '💵 Döviz Sepeti ($ USD / € EUR)', desc: 'Kur artışına karşı koruma' },
        { key: 'stock', name: '📈 Borsa Teknoloji Hissesi', desc: 'Temettü ve büyüme potansiyeli' },
        { key: 'crypto', name: '⚡ Kripto Sepeti (BTC / AI Coin)', desc: 'Yüksek volatilite (-%38 / +%75)' }
      ];
      body.innerHTML = tabBar + `
        <div class="space-y-2">
          ${assets.map(a => `
            <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
              <div>
                <div class="text-xs font-extrabold text-white">${a.name}</div>
                <div class="text-[10px] text-slate-400">${a.desc}</div>
                <div class="text-xs font-mono-num font-bold text-emerald-400 mt-0.5">Yatırımın: ${fmtMoney(G.investments[a.key] || 0)}</div>
              </div>
              <div class="flex flex-col gap-1 shrink-0">
                <button onclick="tradeInvestment('${a.key}', 'buy', ${unitAmt})" class="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-extrabold">+ Al (${fmtMoney(unitAmt)})</button>
                <button onclick="tradeInvestment('${a.key}', 'sell', 0)" class="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-[10px] font-bold">Tümünü Sat</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      body.innerHTML = tabBar + `
        ${G.dirtyMoney > 0 ? `
          <div class="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-between mb-2">
            <div>
              <div class="text-xs font-extrabold text-amber-300">🧼 Paravan Şirkette Kara Para Aklama</div>
              <div class="text-[10px] text-slate-300">Eldeki Kara Para: <strong>${fmtMoney(G.dirtyMoney)}</strong> (%15 komisyonla temiz nakite çevrilir)</div>
            </div>
            <button onclick="launderDirtyMoney()" class="px-3 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold shrink-0">Akla</button>
          </div>
        ` : ''}

        <div class="space-y-2.5">
          ${G.businesses.map((b, idx) => {
            const bType = BUSINESS_TYPES.find(t => t.id === b.typeId);
            const fleetCost = Math.round(c.monthlyMinWage * (bType.costMinWages * 0.35));
            const empCost = Math.round(c.monthlyMinWage * 2);
            return `
              <div class="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-2">
                <div class="flex items-center justify-between">
                  <div class="text-xs font-extrabold text-white">${bType.icon} ${bType.name}</div>
                  <span class="text-[10px] font-bold text-emerald-400">Filo: ${b.fleet} ${bType.unitName} • ${b.employees} Personel</span>
                </div>
                <div class="grid grid-cols-3 gap-1.5 text-[10px]">
                  <button onclick="setBizStrategy(${idx}, 'cheap')" class="py-1.5 rounded-lg border font-bold ${b.strategy === 'cheap' ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-800 text-slate-400'}">Ucuz Sürüm</button>
                  <button onclick="setBizStrategy(${idx}, 'balanced')" class="py-1.5 rounded-lg border font-bold ${b.strategy === 'balanced' ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-800 text-slate-400'}">Dengeli</button>
                  <button onclick="setBizStrategy(${idx}, 'premium')" class="py-1.5 rounded-lg border font-bold ${b.strategy === 'premium' ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-800 text-slate-400'}">Premium (+%22)</button>
                </div>
                <div class="grid grid-cols-2 gap-2 pt-1">
                  <button onclick="expandBizFleet(${idx}, ${fleetCost})" class="p-2 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-extrabold">+1 ${bType.unitName} (${fmtMoney(fleetCost)})</button>
                  <button onclick="hireBizStaff(${idx}, ${empCost})" class="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[11px] font-bold">+2 Personel (${fmtMoney(empCost)})</button>
                </div>
              </div>
            `;
          }).join('')}

          <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">🚀 Yeni Şirket Aç</h4>
          ${BUSINESS_TYPES.map(b => {
            const cost = c.monthlyMinWage * b.costMinWages;
            const monthlyProfit = Math.round(c.monthlyMinWage * b.baseProfitMult);
            return `
              <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <div class="text-xs font-extrabold text-white">${b.icon} ${b.name}</div>
                  <div class="text-[10px] text-slate-400">Sermaye: ${fmtMoney(cost)} • Kâr: <strong class="text-emerald-400">+${fmtMoney(monthlyProfit)}/ay</strong></div>
                </div>
                <button onclick="createNewBusiness('${b.id}')" class="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold shrink-0">Kur</button>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
    return;
  }

  // ---------------- 3. İLİŞKİ (EVLİLİK SÖZLEŞMESİ, ÖZEL DEDEKTİF, BOŞANMA/NAFAKA, MİRAS) ----------------
  if (tab === 'relations') {
    title.textContent = '❤️ Evlilik, Sözleşme, Nafaka & Miras';
    sub.textContent = G.partner ? `Partner: ${G.partner.name} (${G.partner.married ? (G.partner.prenup ? 'Evli • Sözleşmeli' : 'Evli • Sözleşmesiz') : 'Sevgili'})` : 'Bekar';

    body.innerHTML = `
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
        ` : `
          <button onclick="findPartner()" class="w-full py-2.5 rounded-xl bg-rose-500 text-white text-xs font-extrabold">💘 Yeni Bir Partner Ara (16+ Yaş)</button>
        `}
      </div>

      <div class="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-2">
        <div class="text-xs font-extrabold text-amber-400">📜 Vasiyetname & Mirasçı Çocuklar</div>
        ${G.children.length === 0 ? `<div class="text-[11px] text-slate-400">Henüz çocuğun yok. Vefat ettiğinde çocuğun olarak devam etmek için çocuk sahibi olmalısın.</div>` : `
          <div class="space-y-1.5">
            ${G.children.map((ch, idx) => `
              <div class="p-2.5 rounded-xl bg-slate-950 border ${G.willChildIndex === idx ? 'border-amber-400' : 'border-slate-800'} flex items-center justify-between">
                <div class="text-xs font-bold text-white">👶 ${ch.name} (${ch.age || 1} Yaş)</div>
                <button onclick="G.willChildIndex=${idx}; saveGame(); openNavSheet('relations');" class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${G.willChildIndex === idx ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'}">
                  ${G.willChildIndex === idx ? '👑 Baş Mirasçı' : 'Mirasçı Yap'}
                </button>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <div class="space-y-2">
        <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">👨‍👩‍👧 Ebeveynler</h4>
        ${G.relations.map((r, idx) => `
          <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-xs font-bold text-white">${r.name} <span class="text-slate-400">(${r.role} • ${r.alive ? r.age + ' Yaş' : 'Vefat'})</span></div>
              <div class="text-[10px] text-emerald-400">İlişki: %${r.love}</div>
            </div>
            ${r.alive ? `<button onclick="spendTimeWithFamily(${idx})" class="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-white">Vakit Geçir</button>` : ''}
          </div>
        `).join('')}
      </div>
    `;
    return;
  }

  // ---------------- 4. MENÜ (TÜM 6 PAKET MERKEZİ) ----------------
  if (tab === 'menu') {
    title.textContent = '☰ Yaşam, İmparatorluk & Kariyer Menüsü';
    sub.textContent = `Başarımlar: ${G.achievements.length}/${ACHIEVEMENTS_DB.length} • Net Servet: ${fmtMoney(getNetWorth())}`;

    body.innerHTML = `
      <div class="grid grid-cols-2 gap-2">
        <button onclick="openMenuSection('politics')" class="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/40 text-left space-y-0.5">
          <div class="text-lg">🏛️</div>
          <div class="text-xs font-extrabold text-white">Siyaset & Devlet</div>
          <div class="text-[10px] text-slate-300">Seçimler & Cumhurbaşkanlığı</div>
        </button>

        <button onclick="openMenuSection('sports')" class="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 text-left space-y-0.5">
          <div class="text-lg">⚽</div>
          <div class="text-xs font-extrabold text-white">Spor & E-Spor</div>
          <div class="text-[10px] text-slate-300">Futbol, Basketbol & E-Spor</div>
        </button>

        <button onclick="openMenuSection('crime')" class="p-3 rounded-2xl bg-gradient-to-br from-rose-500/20 to-red-900/20 border border-rose-500/40 text-left space-y-0.5">
          <div class="text-lg">🕶️</div>
          <div class="text-xs font-extrabold text-white">Sendika & Yeraltı</div>
          <div class="text-[10px] text-slate-300">Mafya, Kara Para & Soygun</div>
        </button>

        <button onclick="openMenuSection('social')" class="p-3 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-rose-500/10 border border-fuchsia-500/40 text-left space-y-0.5">
          <div class="text-lg">📱</div>
          <div class="text-xs font-extrabold text-white">Sosyal Medya & Ün</div>
          <div class="text-[10px] text-slate-300">${formatCompactNumber(G.social.followers)} Takipçi</div>
        </button>

        <button onclick="openMenuSection('cars')" class="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-0.5">
          <div class="text-lg">🏎️</div>
          <div class="text-xs font-extrabold text-white">Galeri & Sanayi</div>
          <div class="text-[10px] text-slate-400">Sıfır, 2. El Al-Sat & Kasko</div>
        </button>

        <button onclick="openMenuSection('houses')" class="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-0.5">
          <div class="text-lg">🏡</div>
          <div class="text-xs font-extrabold text-white">Emlak & Kiracılar</div>
          <div class="text-[10px] text-slate-400">Tapu & Tahliye (${G.houses.length} Ev)</div>
        </button>

        <button onclick="openMenuSection('health')" class="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-0.5">
          <div class="text-lg">🏥</div>
          <div class="text-xs font-extrabold text-white">Hastane & Psikoloji</div>
          <div class="text-[10px] text-slate-400">${G.diseases.length > 0 ? G.diseases.length + ' Aktif Hastalık ⚠️' : 'Sağlıklı • Stres %' + G.stress}</div>
        </button>

        <button onclick="openMenuSection('trophies')" class="p-3 rounded-2xl bg-slate-900 border border-yellow-500/30 text-left space-y-0.5">
          <div class="text-lg">🏆</div>
          <div class="text-xs font-extrabold text-yellow-400">Kupa & Başarımlar</div>
          <div class="text-[10px] text-slate-400">${G.achievements.length} / ${ACHIEVEMENTS_DB.length} Rozet Açıldı</div>
        </button>

        <button onclick="openMenuSection('casino')" class="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-0.5">
          <div class="text-lg">🎰</div>
          <div class="text-xs font-extrabold text-white">VIP Kumarhane</div>
          <div class="text-[10px] text-slate-400">Blackjack, Rulet & Slot</div>
        </button>

        <button onclick="openMenuSection('license')" class="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-0.5">
          <div class="text-lg">🪪</div>
          <div class="text-xs font-extrabold text-white">Ehliyet & Sicil</div>
          <div class="text-[10px] text-slate-400">B/CE Ehliyet & Sabıka Sildir</div>
        </button>
      </div>

      <div class="pt-2 flex gap-2">
        <button onclick="openMenuSection('migrate')" class="flex-1 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200">✈️ Ülke Göçü</button>
        <button onclick="resetToNewLifeScreen()" class="flex-1 py-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-xs font-bold text-rose-300">🔄 Yeni Hayat</button>
      </div>
    `;
  }
}

/* ============================================================================
   10. ALT MENÜ EKRANLARI (6 PAKET DETAYLARI)
   ============================================================================ */
function openMenuSection(sec) {
  const sheet = document.getElementById('bottomSheet');
  const title = document.getElementById('sheetTitle');
  const sub = document.getElementById('sheetSubtitle');
  const body = document.getElementById('sheetBody');
  const c = getCountry();
  sheet.classList.remove('hidden');

  if (sec === 'politics') {
    title.textContent = `🏛️ Siyaset, Seçimler & Devlet Yönetimi`;
    sub.textContent = `Halk Desteği (Oy Oranı): %${G.politics.approval} • Makam: ${G.politics.officeId || 'Yok'}`;

    const rallyCost = Math.round(c.monthlyMinWage * 2.5);
    body.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-amber-300">📊 Kamuoyu Yoklaması & Kampanya</span>
          <span class="text-xs font-mono-num font-bold text-emerald-400">Oy Desteği: %${G.politics.approval}</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button onclick="doPoliticalRally(${rallyCost})" class="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">📢 Meydan Mitingi (${fmtMoney(rallyCost)})</button>
          <button onclick="doTvDebate()" class="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">📺 Canlı Yayın Tartışması</button>
        </div>
      </div>

      ${G.politics.officeId === 'president' ? `
        <div class="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
          <div class="text-xs font-extrabold text-emerald-300">👑 Cumhurbaşkanlığı Kararnameleri (${c.name})</div>
          <div class="grid grid-cols-2 gap-2">
            <button onclick="presidentialAction('lower_tax')" class="p-2 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-extrabold">📉 Vergileri %5 İndir (+Halk Desteği)</button>
            <button onclick="presidentialAction('raise_wage')" class="p-2 rounded-xl bg-amber-400 text-slate-950 text-[11px] font-extrabold">📈 Asgari Ücrete %15 Zam Yap</button>
          </div>
        </div>
      ` : ''}

      <div class="space-y-2">
        <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">🗳️ Seçimlere Aday Ol</h4>
        ${POLITICS_OFFICES.map(off => {
          const campCost = Math.round(c.monthlyMinWage * off.campaignMult);
          const isCurrent = G.politics.officeId === off.id;
          return `
            <div class="p-3 rounded-2xl bg-slate-900 border ${isCurrent ? 'border-amber-400' : 'border-slate-800'} flex items-center justify-between gap-2">
              <div>
                <div class="text-xs font-extrabold text-white">${off.icon} ${off.title}</div>
                <div class="text-[10px] text-slate-400">Min Yaş: ${off.minAge} • Hedef Destek: %${off.reqApproval} • Maaş: <strong class="text-emerald-400">${fmtMoney(c.monthlyMinWage * off.salaryMult)}/ay</strong></div>
                <div class="text-[10px] text-amber-300">Seçim Kampanya Bütçesi: ${fmtMoney(campCost)}</div>
              </div>
              <button onclick="runForOffice('${off.id}', ${campCost})" class="px-3 py-2 rounded-xl text-xs font-extrabold shrink-0 ${isCurrent ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-400 text-slate-950'}">
                ${isCurrent ? 'Makamda' : 'Aday Ol'}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
    return;
  }

  if (sec === 'sports') {
    title.textContent = '⚽ Profesyonel Spor & E-Spor Kariyeri';
    sub.textContent = `Yetenek Puanı: %${G.sports.skill} • Durum: ${G.sports.injured ? '🩼 Sakat' : 'Hazır ✓'}`;

    const curBranch = SPORTS_BRANCHES.find(b => b.id === G.sports.branchId);
    body.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-white">${curBranch ? `${curBranch.icon} ${curBranch.name} (${curBranch.tiers[G.sports.tierIndex]})` : 'Henüz Bir Kulüple Sözleşmen Yok'}</span>
          <span class="text-xs font-bold text-emerald-400">Yetenek: %${G.sports.skill}</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button onclick="trainSportsSkill()" class="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">🏋️ Özel Antrenman Yap (+Yetenek)</button>
          <button onclick="requestTransferOffer()" class="p-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold">✈️ Üst Lige Transfer İste</button>
        </div>
      </div>

      <div class="space-y-2">
        <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">🏆 Branş Seçmeleri (14-35 Yaş)</h4>
        ${SPORTS_BRANCHES.map(br => {
          const active = G.sports.branchId === br.id;
          return `
            <div class="p-3 rounded-2xl bg-slate-900 border ${active ? 'border-emerald-500' : 'border-slate-800'} flex items-center justify-between gap-2">
              <div>
                <div class="text-xs font-extrabold text-white">${br.icon} ${br.name}</div>
                <div class="text-[10px] text-slate-400">Altyapı &rarr; ${br.tiers[1]} &rarr; ${br.tiers[2]}</div>
                <div class="text-[10px] text-emerald-400">Zirve Kontrat: ${fmtMoney(c.monthlyMinWage * br.mults[2])}/ay</div>
              </div>
              <button onclick="joinSportsBranch('${br.id}')" class="px-3 py-2 rounded-xl text-xs font-extrabold shrink-0 ${active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-500 text-slate-950'}">
                ${active ? 'Sözleşmeli' : 'Seçmeye Gir'}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
    return;
  }

  if (sec === 'crime') {
    const rObj = SYNDICATE_RANKS.find(r => r.level === G.syndicate.rankLevel);
    title.textContent = '🕶️ Organize Suç Sendikası & Yeraltı';
    sub.textContent = `Rütbe: ${G.syndicate.joined ? rObj.title : 'Bağımsız'} • Saygınlık: %${G.syndicate.respect} • Kara Para: ${fmtMoney(G.dirtyMoney)}`;

    body.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-rose-500/40 space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="text-xs font-extrabold text-rose-400">🕶️ Yeraltı Sendikası (Mafya Hiyerarşisi)</div>
          <span class="text-[11px] font-bold text-white">${G.syndicate.joined ? rObj.title : 'Üye Değil'}</span>
        </div>
        ${!G.syndicate.joined ? `
          <button onclick="joinSyndicate()" class="w-full py-2.5 rounded-xl bg-rose-500 text-white text-xs font-extrabold">🩸 Sendikaya Katıl (Yıllık Haraç Payı Al)</button>
        ` : `
          <div class="grid grid-cols-2 gap-2">
            <button onclick="syndicateAction('promote')" class="p-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold">👑 Rütbe Terfisi İste</button>
            <button onclick="syndicateAction('mole')" class="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">🕵️ Köstebek Avı Başlat</button>
          </div>
          <button onclick="openNavSheet('finance'); activeFinanceTab='biz'; openNavSheet('finance');" class="w-full py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
            🧼 Paravan Şirkette Kara Para Akla (${fmtMoney(G.dirtyMoney)})
          </button>
        `}
      </div>

      <div class="space-y-2">
        <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">💣 Operasyonlar (Kara Para Üretir)</h4>
        <button onclick="commitCrime('cyber')" class="w-full p-3.5 rounded-2xl bg-slate-900 border border-rose-500/30 flex items-center justify-between">
          <div class="text-left"><div class="text-xs font-extrabold text-white">💻 Siber Vurgun & Kripto Cüzdan Sızması</div><div class="text-[10px] text-slate-400">Kazanç: 8x-22x Maaş • Ceza Riski: 3 Yıl Hapis</div></div>
          <span class="text-xs font-bold text-rose-400">Saldır &rarr;</span>
        </button>
        <button onclick="commitCrime('smuggle')" class="w-full p-3.5 rounded-2xl bg-slate-900 border border-rose-500/30 flex items-center justify-between">
          <div class="text-left"><div class="text-xs font-extrabold text-white">🚢 Gümrüksüz Kaçak Tır Sevkiyatı</div><div class="text-[10px] text-slate-400">Kazanç: 15x-35x Maaş • Ceza Riski: 5 Yıl Hapis</div></div>
          <span class="text-xs font-bold text-rose-400">Sevk Et &rarr;</span>
        </button>
        <button onclick="commitCrime('heist')" class="w-full p-3.5 rounded-2xl bg-slate-900 border border-rose-500/50 flex items-center justify-between">
          <div class="text-left"><div class="text-xs font-extrabold text-white">🏦 Merkez Bankası Zırhlı Araç Soygunu</div><div class="text-[10px] text-slate-400">Kazanç: 50x-90x Maaş • Ceza Riski: 10 Yıl Hapis</div></div>
          <span class="text-xs font-bold text-rose-400">Planla &rarr;</span>
        </button>
      </div>
    `;
    return;
  }

  if (sec === 'health') {
    title.textContent = '🏥 Hastane, Psikoloji & Estetik';
    sub.textContent = `Sağlık: %${G.health} • Stres: %${G.stress} • Görünüm: %${G.looks}`;
    const privCost = Math.round(c.monthlyMinWage * 1.1);
    const therapyCost = Math.round(c.monthlyMinWage * 0.6);
    const plasticCost = Math.round(c.monthlyMinWage * 2.5);

    let diseaseHtml = '';
    if (G.diseases && G.diseases.length > 0) {
      diseaseHtml = `
        <div class="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-2">
          <div class="text-xs font-extrabold text-rose-300">🤒 Teşhis Edilen Aktif Hastalıkların</div>
          ${G.diseases.map(dId => {
            const d = DISEASES_DB.find(x => x.id === dId);
            return `<div class="text-xs text-white font-bold">• ${d ? d.name : dId}</div>`;
          }).join('')}
          <div class="grid grid-cols-2 gap-2 pt-1">
            <button onclick="treatDiseases('public', 0)" class="p-2 rounded-xl bg-slate-800 text-slate-200 text-[11px] font-bold">🏥 Devlet Hastanesi (Ücretsiz • %55 Şans)</button>
            <button onclick="treatDiseases('private', ${privCost})" class="p-2 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-extrabold">💎 Özel Hastane (${fmtMoney(privCost)} • %100)</button>
          </div>
        </div>
      `;
    } else {
      diseaseHtml = `<div class="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-bold">✓ Şu an teşhis edilmiş aktif bir hastalığın bulunmuyor.</div>`;
    }

    body.innerHTML = diseaseHtml + `
      <button onclick="healthAction('therapy', ${therapyCost})" class="w-full p-3.5 rounded-2xl bg-slate-900 border border-indigo-500/30 flex items-center justify-between">
        <div class="text-left"><div class="text-xs font-extrabold text-indigo-300">🛋️ Psikolog & Stres Terapisi</div><div class="text-[10px] text-slate-400">-35 Stres, +14 Mutluluk, Tükenmişlik Sendromunu İyileştirir</div></div>
        <span class="text-xs font-bold text-indigo-300">${fmtMoney(therapyCost)}</span>
      </button>
      <button onclick="healthAction('gym', ${Math.round(c.monthlyMinWage * 0.25)})" class="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div class="text-left"><div class="text-xs font-extrabold text-white">🏋️ Fitness & Spor Salonu</div><div class="text-[10px] text-slate-400">+8 Sağlık, +6 Görünüm, -12 Stres</div></div>
        <span class="text-xs font-bold text-emerald-400">${fmtMoney(Math.round(c.monthlyMinWage * 0.25))}</span>
      </button>
      <button onclick="healthAction('plastic', ${plasticCost})" class="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div class="text-left"><div class="text-xs font-extrabold text-white">✨ Estetik Operasyon</div><div class="text-[10px] text-slate-400">+22 Görünüm</div></div>
        <span class="text-xs font-bold text-fuchsia-400">${fmtMoney(plasticCost)}</span>
      </button>
    `;
    return;
  }

  if (sec === 'trophies') {
    title.textContent = '🏆 Başarım ve Kupa Vitrini';
    sub.textContent = `Açılan Rozetler: ${G.achievements.length} / ${ACHIEVEMENTS_DB.length}`;
    body.innerHTML = ACHIEVEMENTS_DB.map(ach => {
      const unlocked = G.achievements.includes(ach.id);
      return `
        <div class="p-3 rounded-2xl border ${unlocked ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-slate-800 bg-slate-900/50 opacity-60'} flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">${ach.icon}</span>
            <div>
              <div class="text-xs font-extrabold text-white">${ach.title}</div>
              <div class="text-[10px] text-slate-400">${ach.desc}</div>
            </div>
          </div>
          <span class="text-[10px] font-extrabold ${unlocked ? 'text-yellow-400' : 'text-slate-500'}">${unlocked ? '✓ KAZANILDI' : 'Kilitli'}</span>
        </div>
      `;
    }).join('');
    return;
  }

  if (sec === 'social') {
    title.textContent = '📱 Sosyal Medya & Ünlü Olma';
    sub.textContent = `Takipçi: ${G.social.followers.toLocaleString('tr-TR')} • Şöhret: %${G.fame} • Yıllık Gelir: ${fmtMoney(G.social.annualAdIncome)}`;
    const platforms = ['Instaphoto', 'TokTik', 'YouVideo', 'KickStream'];
    body.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-fuchsia-500/30 space-y-2">
        <div class="grid grid-cols-2 gap-2">
          ${platforms.map(p => {
            const joined = G.social.activePlatforms.includes(p);
            return `<button onclick="joinSocialPlatform('${p}')" class="p-2 rounded-xl border text-xs font-bold ${joined ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-slate-800 bg-slate-950 text-slate-300'}">${joined ? '✓ ' + p : '+ ' + p + ' Aç'}</button>`;
          }).join('')}
        </div>
      </div>
      <div class="space-y-2">
        <button onclick="postSocialContent('viral')" class="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-left">
          <div><div class="text-xs font-extrabold text-white">🔥 Viral Reels / Shorts Videosu Çek</div><div class="text-[10px] text-slate-400">Keşfete düşme ve yüksek takipçi şansı</div></div>
          <span class="text-xs font-bold text-emerald-400">Paylaş &rarr;</span>
        </button>
        <button onclick="postSocialContent('stream')" class="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-left">
          <div><div class="text-xs font-extrabold text-white">🎮 Canlı Yayın Aç</div><div class="text-[10px] text-slate-400">Takipçi + anlık bağış geliri</div></div>
          <span class="text-xs font-bold text-emerald-400">Yayın Aç &rarr;</span>
        </button>
        <button onclick="postSocialContent('sponsor')" class="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-left">
          <div><div class="text-xs font-extrabold text-white">💼 Sponsorlu Marka Reklamı Al</div><div class="text-[10px] text-slate-400">En az 10.000 takipçi gerekir</div></div>
          <span class="text-xs font-bold text-amber-400">Anlaşma &rarr;</span>
        </button>
        <button onclick="applyForBlueTick()" class="w-full p-3 rounded-2xl bg-slate-900 border border-sky-500/30 flex items-center justify-between text-left">
          <div><div class="text-xs font-extrabold text-sky-400">☑️ Mavi Tik Başvurusu</div><div class="text-[10px] text-slate-400">50.000+ takipçi gerekir • Gelirleri %35 artırır</div></div>
          <span class="text-xs font-bold text-sky-400">Başvur &rarr;</span>
        </button>
      </div>
    `;
    return;
  }

  if (sec === 'cars') {
    title.textContent = `🏎️ Oto Galeri, Sanayi & Garaj (${c.name})`;
    sub.textContent = `Garajındaki Araçlar: ${G.cars.length}`;
    const topTabs = `
      <div class="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-2">
        <button onclick="activeGarageTab='dealer'; openMenuSection('cars')" class="py-2 rounded-xl text-xs font-extrabold ${activeGarageTab === 'dealer' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}">🏪 Sıfır & 2. El Galeri</button>
        <button onclick="activeGarageTab='mycars'; openMenuSection('cars')" class="py-2 rounded-xl text-xs font-extrabold ${activeGarageTab === 'mycars' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}">🛠️ Garajım & Sanayi (${G.cars.length})</button>
      </div>
    `;

    if (activeGarageTab === 'mycars') {
      if (G.cars.length === 0) {
        body.innerHTML = topTabs + `<div class="p-6 text-center text-xs text-slate-400">Henüz aracın yok.</div>`;
        return;
      }
      body.innerHTML = topTabs + G.cars.map((car, idx) => {
        const repairCost = Math.round(c.monthlyMinWage * 1.4);
        return `
          <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-extrabold text-white">${car.icon} ${car.name}</div>
                <div class="text-[10px] text-slate-400">Kondisyon: <strong>%${car.cond}</strong> • Değer: <strong>${fmtMoney(car.value)}</strong></div>
              </div>
              <button onclick="sellMyCar(${idx})" class="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-extrabold">Sat (+${fmtMoney(car.value)})</button>
            </div>
            <div class="grid grid-cols-3 gap-1.5 text-[10px]">
              <button onclick="toggleCarPolicy(${idx}, 'trafficIns')" class="py-1.5 rounded-lg border font-bold ${car.trafficIns ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-rose-500/40 text-rose-300'}">${car.trafficIns ? '✓ Trafik Sig.' : '✗ Trafik Sig.'}</button>
              <button onclick="toggleCarPolicy(${idx}, 'kasko')" class="py-1.5 rounded-lg border font-bold ${car.kasko ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-slate-700 text-slate-400'}">${car.kasko ? '✓ Kasko' : '+ Kasko Yap'}</button>
              <button onclick="repairCarInSanayi(${idx}, ${repairCost})" class="py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">🔧 Sanayi (${fmtMoney(repairCost)})</button>
            </div>
          </div>
        `;
      }).join('');
    } else {
      body.innerHTML = topTabs + CARS.map(car => {
        const zeroPrice = Math.round(c.monthlyMinWage * car.baseMinWages * c.carTaxMultiplier);
        const usedPrice = Math.round(zeroPrice * 0.55);
        return `
          <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
            <div>
              <div class="text-xs font-extrabold text-white">${car.icon} ${car.name}</div>
              <div class="text-[10px] text-slate-400">Ehliyet: ${car.reqLic} • Sıfır: <strong class="text-emerald-400">${fmtMoney(zeroPrice)}</strong></div>
              <div class="text-[10px] text-amber-300">2. El Hasarlı: ${fmtMoney(usedPrice)}</div>
            </div>
            <div class="flex flex-col gap-1 shrink-0">
              <button onclick="buyCar('${car.id}', false)" class="px-2.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-[10px] font-extrabold">Sıfır Al</button>
              <button onclick="buyCar('${car.id}', true)" class="px-2.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">2. El Hasarlı</button>
            </div>
          </div>
        `;
      }).join('');
    }
    return;
  }

  if (sec === 'houses') {
    title.textContent = `🏡 Emlak Ofisi & Kiracılar`;
    sub.textContent = `Tapulu Mülk: ${G.houses.length}`;
    let myHousesHtml = G.houses.map((h, idx) => `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs font-extrabold text-white">${h.icon} ${h.name}</div>
            <div class="text-[10px] text-slate-400">Değeri: <strong>${fmtMoney(h.value)}</strong> • Kira: <strong class="text-emerald-400">${fmtMoney(h.monthlyRent)}/ay</strong></div>
          </div>
          <button onclick="sellHouse(${idx})" class="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-200 text-[10px] font-bold">Sat</button>
        </div>
        <div class="flex items-center justify-between gap-2">
          <button onclick="toggleHouseRent(${idx})" class="flex-1 py-1.5 rounded-xl text-[11px] font-extrabold ${h.isRented ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'}">
            ${h.isRented ? (h.tenantOk ? '✓ Kirada (Ödüyor)' : '⚠️ Kiracı Ödemiyor!') : '🏠 Kendin Oturuyorsun'}
          </button>
          ${h.isRented && !h.tenantOk ? `<button onclick="evictBadTenant(${idx})" class="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-[11px] font-extrabold">⚖️ Tahliye Et</button>` : ''}
        </div>
      </div>
    `).join('');

    body.innerHTML = myHousesHtml + HOUSES.map(h => {
      const price = Math.round(c.monthlyMinWage * h.baseMinWages * (c.houseMultiplier / 120));
      const monthlyRent = Math.round((price * h.rentYield) / 12);
      return `
        <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
          <div>
            <div class="text-xs font-extrabold text-white">${h.icon} ${h.name}</div>
            <div class="text-[10px] text-slate-400">Kira Getirisi: <strong class="text-emerald-400">+${fmtMoney(monthlyRent)}/ay</strong> • Fiyat: <strong>${fmtMoney(price)}</strong></div>
          </div>
          <button onclick="buyHouse('${h.id}')" class="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold shrink-0">Satın Al</button>
        </div>
      `;
    }).join('');
    return;
  }

  if (sec === 'casino') {
    const betBase = Math.round(c.monthlyMinWage * 0.5);
    title.textContent = '🎰 VIP Kumarhane';
    sub.textContent = `Bakiye: ${fmtMoney(G.money)}`;
    body.innerHTML = `
      <div class="space-y-2.5">
        <div class="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-center justify-between">
          <div><div class="text-xs font-extrabold text-white">🃏 Blackjack 21</div><div class="text-[10px] text-slate-400">2x Ödeme</div></div>
          <button onclick="playCasinoGame('blackjack', ${betBase * 2})" class="px-3 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold">Oyna (${fmtMoney(betBase * 2)})</button>
        </div>
        <div class="p-3.5 rounded-2xl bg-slate-900 border border-rose-500/30 flex items-center justify-between">
          <div><div class="text-xs font-extrabold text-white">🎡 Avrupa Ruleti</div><div class="text-[10px] text-slate-400">2x Ödeme</div></div>
          <button onclick="playCasinoGame('roulette', ${betBase * 3})" class="px-3 py-2 rounded-xl bg-rose-500 text-white text-xs font-extrabold">Oyna (${fmtMoney(betBase * 3)})</button>
        </div>
        <div class="p-3.5 rounded-2xl bg-slate-900 border border-fuchsia-500/30 flex items-center justify-between">
          <div><div class="text-xs font-extrabold text-white">🍒 777 Mega Slot</div><div class="text-[10px] text-slate-400">10x Jackpot!</div></div>
          <button onclick="playCasinoGame('slot', ${betBase})" class="px-3 py-2 rounded-xl bg-fuchsia-500 text-white text-xs font-extrabold">Çevir (${fmtMoney(betBase)})</button>
        </div>
      </div>
    `;
    return;
  }

  if (sec === 'license') {
    title.textContent = '🪪 Ehliyet Kursu & Adli Sicil';
    sub.textContent = `Adli Sicil: ${G.criminalRecord ? 'Sabıkalı ⚠️' : 'Temiz ✓'}`;
    const costB = Math.round(c.monthlyMinWage * 0.7);
    const costCE = Math.round(c.monthlyMinWage * 1.6);
    const expungeCost = Math.round(c.monthlyMinWage * 4.5);
    body.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div><div class="text-xs font-extrabold text-white">🚗 B Sınıfı Ehliyet</div><div class="text-[10px] text-slate-400">Otomobil & Kurye</div></div>
        <button onclick="takeDrivingLicense('B', ${costB})" class="px-3 py-2 rounded-xl text-xs font-extrabold ${G.licenses.B ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-500 text-slate-950'}">${G.licenses.B ? 'Alındı ✓' : fmtMoney(costB)}</button>
      </div>
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div><div class="text-xs font-extrabold text-white">🚛 CE Sınıfı Ağır Vasıta (Tır) Ehliyeti</div><div class="text-[10px] text-slate-400">Uluslararası Tır Şoförlüğü</div></div>
        <button onclick="takeDrivingLicense('CE', ${costCE})" class="px-3 py-2 rounded-xl text-xs font-extrabold ${G.licenses.CE ? 'bg-slate-800 text-emerald-400' : 'bg-amber-400 text-slate-950'}">${G.licenses.CE ? 'Alındı ✓' : fmtMoney(costCE)}</button>
      </div>
      <div class="p-3.5 rounded-2xl bg-slate-900 border ${G.criminalRecord ? 'border-rose-500/40' : 'border-slate-800'} flex items-center justify-between">
        <div><div class="text-xs font-extrabold text-white">⚖️ Adli Sicil Sildirme</div><div class="text-[10px] text-slate-400">Memuriyet engelini kaldırır</div></div>
        ${G.criminalRecord ? `<button onclick="clearCriminalRecord(${expungeCost})" class="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold">Sildir (${fmtMoney(expungeCost)})</button>` : `<span class="text-xs font-bold text-emerald-400">Temiz ✓</span>`}
      </div>
    `;
    return;
  }

  if (sec === 'migrate') {
    title.textContent = '✈️ Başka Ülkeye Göç Et';
    sub.textContent = 'Tüm varlıkların yeni ülkenin para birimine dönüştürülür';
    body.innerHTML = COUNTRIES.filter(x => x.id !== G.countryId).map(target => {
      const moveCost = Math.round(c.monthlyMinWage * 4);
      return `
        <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div class="text-xs font-extrabold text-white">${target.flag} ${target.name} (${target.currency})</div>
            <div class="text-[10px] text-slate-400">Asgari: ${target.monthlyMinWage.toLocaleString('tr-TR')} ${target.currency} • Enf: %${Math.round(target.inflation * 100)}</div>
          </div>
          <button onclick="migrateToCountry('${target.id}', ${moveCost})" class="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold">Göç Et (${fmtMoney(moveCost)})</button>
        </div>
      `;
    }).join('');
    return;
  }

  if (sec === 'identity') {
    title.textContent = '📸 AI Portre Stüdyosu';
    sub.textContent = 'Karakterinin portresini değiştir';
    body.innerHTML = `
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-3">
        <img src="${getCurrentPortrait()}" class="w-24 h-24 rounded-3xl object-cover border-2 border-emerald-500" />
        <button onclick="G.portraitIdx = (G.portraitIdx + 1) % 3; saveGame(); renderAll(); openMenuSection('identity');" class="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold">🔄 Yeni AI Portre Oluştur</button>
      </div>
    `;
  }
}

/* ============================================================================
   11. AKSİYON VE SİMÜLASYON FONKSİYONLARI
   ============================================================================ */
function doPoliticalRally(cost) {
  if (G.age < 18) { showToast('18+ yaş gerekir!'); return; }
  if (G.money < cost) { showToast('Miting bütçesi için bakiye yetersiz!'); return; }
  G.money -= cost;
  const boost = randInt(8, 16) + Math.round(G.fame / 15);
  G.politics.approval = clamp(G.politics.approval + boost);
  G.fame = clamp(G.fame + 5);
  playSfx('coin');
  addLog(G.age, `📢 Dev meydan mitingi düzenledin! Oy desteğin **%${G.politics.approval}** seviyesine yükseldi.`, 'good');
  saveGame(); renderAll(); openMenuSection('politics');
}

function doTvDebate() {
  if (G.age < 18) { showToast('18+ yaş gerekir!'); return; }
  if (Math.random() < (0.4 + G.smart / 200)) {
    const boost = randInt(7, 14);
    G.politics.approval = clamp(G.politics.approval + boost);
    addLog(G.age, `📺 Canlı yayın tartışmasında rakibini istatistiklerle köşeye sıkıştırdın! Oy desteğin **%${G.politics.approval}** oldu.`, 'good');
  } else {
    G.politics.approval = clamp(G.politics.approval - 8);
    addLog(G.age, `📺 Canlı yayında gaf yaptın, oy desteğin **%${G.politics.approval}** seviyesine geriledi.`, 'bad');
  }
  saveGame(); renderAll(); openMenuSection('politics');
}

function runForOffice(officeId, campCost) {
  const off = POLITICS_OFFICES.find(o => o.id === officeId);
  if (!off) return;
  if (G.age < off.minAge) { showToast(`Bu makam için en az ${off.minAge} yaşında olmalısın!`); return; }
  if (G.criminalRecord) { showToast('Adli sicil kaydın varken seçim kurulundan veto yedin!'); return; }
  if (G.money < campCost) { showToast('Kampanya bütçesi yetersiz!'); return; }

  G.money -= campCost;
  const chance = (G.politics.approval / off.reqApproval) * 0.65;
  if (Math.random() < chance) {
    G.politics.officeId = off.id;
    G.fame = clamp(G.fame + 25);
    if (off.id === 'president') unlockAchievement('president');
    playSfx('trophy');
    addLog(G.age, `🗳️ **SEÇİM ZAFERİ!** Sandıktan birinci çıkarak **${off.title}** seçildin!`, 'fame');
    showToast(`Tebrikler! ${off.title} seçildin!`);
  } else {
    playSfx('bad');
    addLog(G.age, `🗳️ **${off.title}** seçimini az farkla kaybettin. Halk desteğini (%${G.politics.approval}) artırmalısın.`, 'bad');
    showToast('Seçimi kaybettin!');
  }
  saveGame(); renderAll(); openMenuSection('politics');
}

function presidentialAction(act) {
  if (G.politics.officeId !== 'president') return;
  if (act === 'lower_tax') {
    G.politics.taxModifier = -0.05;
    G.politics.approval = clamp(G.politics.approval + 15);
    addLog(G.age, `👑 Cumhurbaşkanlığı kararnamesiyle gelir vergisini **%5 indirdin!** Halk desteğin coştu.`, 'fame');
  } else if (act === 'raise_wage') {
    const c = getCountry();
    c.monthlyMinWage = Math.round(c.monthlyMinWage * 1.15);
    G.politics.approval = clamp(G.politics.approval + 12);
    addLog(G.age, `👑 Ülkedeki asgari ücrete **%15 refah zammı** yaptın!`, 'good');
  }
  saveGame(); renderAll(); openMenuSection('politics');
}

function joinSportsBranch(branchId) {
  if (G.age < 14 || G.age > 35) { showToast('Spor seçmeleri için 14-35 yaş arasında olmalısın!'); return; }
  const br = SPORTS_BRANCHES.find(b => b.id === branchId);
  if (!br) return;
  G.sports.branchId = br.id;
  G.sports.tierIndex = 0;
  playSfx('coin');
  addLog(G.age, `${br.icon} **${br.name}** seçmelerini kazanıp **${br.tiers[0]}** kadrosuna katıldın!`, 'milestone');
  saveGame(); renderAll(); openMenuSection('sports');
}

function trainSportsSkill() {
  if (!G.sports.branchId) { showToast('Önce aşağıdan bir branş seçmesine katıl!'); return; }
  G.sports.skill = clamp(G.sports.skill + randInt(6, 12));
  G.health = clamp(G.health + 4);
  playSfx('click');
  addLog(G.age, `🏋️ Yoğun antrenmanlarla spor yeteneğini **%${G.sports.skill}** seviyesine çıkardın.`, 'good');
  saveGame(); renderAll(); openMenuSection('sports');
}

function requestTransferOffer() {
  if (!G.sports.branchId) { showToast('Aktif bir kulübün yok!'); return; }
  const br = SPORTS_BRANCHES.find(b => b.id === G.sports.branchId);
  if (G.sports.tierIndex >= 2) { showToast('Zaten dünyanın en üst ligindesin!'); return; }
  const reqSkill = G.sports.tierIndex === 0 ? 72 : 88;
  if (G.sports.skill < reqSkill) {
    showToast(`Üst lige transfer için yeteneğin en az %${reqSkill} olmalı! (Mevcut: %${G.sports.skill})`);
    return;
  }
  const c = getCountry();
  G.sports.tierIndex += 1;
  const signBonus = Math.round(c.monthlyMinWage * (G.sports.tierIndex * 8));
  G.money += signBonus;
  G.fame = clamp(G.fame + 20);
  if (G.sports.tierIndex === 2) unlockAchievement('pro_champ');
  playSfx('trophy');
  addLog(G.age, `✈️ **DEV TRANSFER!** **${br.tiers[G.sports.tierIndex]}** seviyesine transfer oldun ve **+${fmtMoney(signBonus)}** imza parası aldın!`, 'fame');
  saveGame(); renderAll(); openMenuSection('sports');
}

function joinSyndicate() {
  if (G.age < 17) { showToast('17+ yaş gerekir!'); return; }
  G.syndicate.joined = true;
  G.syndicate.rankLevel = 1;
  G.syndicate.respect = 25;
  addLog(G.age, `🩸 Yeraltı Sendikasına **Sokak Ayakçısı** olarak katıldın.`, 'milestone');
  saveGame(); renderAll(); openMenuSection('crime');
}

function syndicateAction(act) {
  if (!G.syndicate.joined) return;
  if (act === 'promote') {
    if (G.syndicate.rankLevel >= 4) { showToast('Zaten Sendika Baronusun!'); return; }
    if (G.syndicate.respect < G.syndicate.rankLevel * 30) {
      showToast(`Terfi için saygınlığın en az %${G.syndicate.rankLevel * 30} olmalı! Suç operasyonlarıyla saygınlık kazan.`);
      return;
    }
    G.syndicate.rankLevel += 1;
    const rObj = SYNDICATE_RANKS.find(r => r.level === G.syndicate.rankLevel);
    if (G.syndicate.rankLevel === 4) unlockAchievement('syndicate_boss');
    playSfx('trophy');
    addLog(G.age, `🕶️ Sendika içinde **${rObj.title}** rütbesine yükseldin!`, 'fame');
  } else if (act === 'mole') {
    if (Math.random() < (0.5 + G.smart / 200)) {
      G.syndicate.respect = clamp(G.syndicate.respect + 18);
      addLog(G.age, `🕵️ Sendika içindeki polis muhbirini (köstebeği) yakalattın! Saygınlığın **%${G.syndicate.respect}** oldu.`, 'good');
    } else {
      G.syndicate.respect = clamp(G.syndicate.respect - 10);
      addLog(G.age, `🕵️ Yanlış kişiyi suçladın, sendika içinde gerginlik çıktı.`, 'bad');
    }
  }
  saveGame(); renderAll(); openMenuSection('crime');
}

function launderDirtyMoney() {
  if (!G.dirtyMoney || G.dirtyMoney <= 0) { showToast('Aklanacak kara para yok!'); return; }
  if (G.businesses.length === 0) {
    showToast('Kara para aklamak için önce en az 1 paravan Şirket kurmalısın!');
    return;
  }
  const cleanAmt = Math.round(G.dirtyMoney * 0.85);
  G.money += cleanAmt;
  G.dirtyMoney = 0;
  playSfx('coin');
  addLog(G.age, `🧼 Şirketlerin üzerinden kara parayı aklayarak **+${fmtMoney(cleanAmt)}** temiz banka bakiyesine dönüştürdün!`, 'good');
  saveGame(); renderAll(); openNavSheet('finance');
}

function treatDiseases(mode, cost) {
  if (!G.diseases || G.diseases.length === 0) return;
  if (cost > 0 && G.money < cost) { showToast('Özel hastane için bakiye yetersiz!'); return; }
  G.money -= cost;
  const chance = mode === 'private' ? 1.0 : 0.55;
  if (Math.random() < chance) {
    G.diseases = [];
    G.health = clamp(G.health + 22);
    playSfx('coin');
    addLog(G.age, `🏥 Tedavin başarılı geçti ve tüm hastalıklarından kurtuldun!`, 'good');
    showToast('Tamamen iyileştin!');
  } else {
    playSfx('bad');
    addLog(G.age, `🏥 Devlet hastanesindeki tedavi tam sonuç vermedi, şikayetlerin devam ediyor.`, 'bad');
    showToast('Tedavi sonuç vermedi.');
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
    if (G.money < cost) { showToast('Bakiye yetersiz!'); return; }
    G.money -= cost;
    G.partner.love = clamp(G.partner.love + 15);
    G.happy = clamp(G.happy + 6);
  } else if (act === 'marry_normal') {
    const cost = Math.round(c.monthlyMinWage * 3);
    if (G.money < cost) { showToast('Düğün masrafı için bakiye yetersiz!'); return; }
    G.money -= cost;
    G.partner.married = true;
    G.partner.prenup = false;
    G.happy = clamp(G.happy + 20);
    addLog(G.age, `💍 **${G.partner.name}** ile evlilik sözleşmesi olmadan evlendin!`, 'milestone');
  } else if (act === 'marry_prenup') {
    const cost = Math.round(c.monthlyMinWage * 3.5);
    if (G.money < cost) { showToast('Düğün ve noter sözleşmesi için bakiye yetersiz!'); return; }
    G.money -= cost;
    G.partner.married = true;
    G.partner.prenup = true;
    G.partner.love = clamp(G.partner.love - 10);
    addLog(G.age, `📜 **${G.partner.name}** ile noter onaylı **Evlilik Sözleşmesi (Mal Ayrılığı)** imzalayarak evlendin!`, 'milestone');
  } else if (act === 'detective') {
    const detCost = Math.round(c.monthlyMinWage * 1.2);
    if (G.money < detCost) { showToast('Dedektif ücreti yetersiz!'); return; }
    G.money -= detCost;
    if (Math.random() < 0.35) {
      G.partner.cheated = true;
      addLog(G.age, `🕵️ Özel dedektif eşin **${G.partner.name}**'in gizli buluşmalarını kanıtladı! Artık tazminatsız ve nafakasız boşanabilirsin.`, 'good');
    } else {
      addLog(G.age, `🕵️ Özel dedektif eşini takip etti ancak herhangi bir sadakatsizlik bulamadı.`);
    }
  } else if (act === 'divorce') {
    const oldPartner = G.partner.name;
    if (G.partner.prenup || G.partner.cheated) {
      addLog(G.age, `⚖️ **${oldPartner}** ile boşandın! ${G.partner.prenup ? 'Evlilik sözleşmen' : 'Dedektifin aldatma kanıtları'} sayesinde mal varlığını korudun ve nafaka ödemiyorsun!`, 'good');
    } else {
      const split = Math.max(0, Math.round(G.money * 0.5));
      G.money -= split;
      G.monthlyAlimony = Math.round(c.monthlyMinWage * 0.45);
      addLog(G.age, `💔 **ÇEKİŞMELİ BOŞANMA!** Evlilik sözleşmen olmadığı için **${oldPartner}** nakit servetinin yarısını (**${fmtMoney(split)}**) aldı ve mahkeme aylık **${fmtMoney(G.monthlyAlimony)} nafaka** bağladı!`, 'bad');
    }
    G.partner = null;
  } else if (act === 'child') {
    const childGender = Math.random() < 0.5 ? 'M' : 'F';
    const childName = pickRandom(childGender === 'M' ? c.namesM : c.namesF) + ' ' + G.lastName;
    G.children.push({ name: childName, gender: childGender, age: 0 });
    G.happy = clamp(G.happy + 18);
    addLog(G.age, `👶 **${childName}** adında bir çocuğun dünyaya geldi!`, 'milestone');
  }
  saveGame(); renderAll(); openNavSheet('relations');
}

function studySchoolHard() {
  G.obpScore = clamp(G.obpScore + randInt(2, 4), 50, 100);
  G.smart = clamp(G.smart + 3);
  addLog(G.age, `📖 Ders çalışarak OBP ortalamanı **${G.obpScore}** puanına yükselttin.`, 'good');
  saveGame(); renderAll(); openNavSheet('career');
}

function takeExamCourse() {
  G.examPrepBonus += 14;
  G.smart = clamp(G.smart + 4);
  addLog(G.age, `📝 Deneme kulübüne katıldın (+${G.examPrepBonus} Ek Puan).`, 'good');
  saveGame(); renderAll(); openNavSheet('career');
}

function openUniversityExamModal() {
  const rawScore = 155 + (G.obpScore * 2.1) + (G.smart * 1.1) + G.examPrepBonus + randInt(-15, 22);
  const examScore = clamp(rawScore, 160, 500);
  const rank = Math.max(450, Math.round((505 - examScore) * 1450));
  G.lastExamScore = examScore;
  G.lastExamRank = rank;

  openEventModal({
    badge: '📝 Ulusal Üniversite Sınav Sonucu (YKS)',
    title: `Puanın: ${examScore} • Sıralaman: #${rank.toLocaleString('tr-TR')}`,
    desc: `OBP ortalaman (${G.obpScore}) ve sınav performansınla sıralamada #${rank.toLocaleString('tr-TR')} oldun.`,
    choices: [
      { label: '🎓 Tercih Kılavuzunu Aç (Bölüm Seç)', action: () => openNavSheet('career') },
      { label: '📚 Mezuna Kal (+28 Ek Puan)', action: () => { G.examPrepBonus += 28; renderAll(); } }
    ]
  });
}

function enrollUniversity(majorId, isPrivate) {
  const m = UNI_MAJORS.find(x => x.id === majorId);
  const c = getCountry();
  if (!m) return;
  const scoreNeeded = isPrivate ? (m.minScore - 40) : m.minScore;
  if (G.lastExamScore < scoreNeeded) { showToast(`Puanın yetersiz! Gereken: ${scoreNeeded}`); return; }
  const fee = isPrivate ? c.uniPrivateFee : c.uniPublicFee;
  if (fee > 0 && G.money < fee) { showToast('Üniversite harcı için bakiye yetersiz!'); return; }

  G.money -= fee;
  G.eduStage = 'Üniversite';
  G.currentMajor = m.id;
  G.uniYearsLeft = m.years;
  G.uniLiving = 'kyk';
  G.kykSupport = G.lastExamScore >= 420 ? 'burs' : 'kredi';
  addLog(G.age, `🎓 **${m.name}** bölümüne yerleştin!`, 'milestone');
  saveGame(); renderAll(); openNavSheet('career');
}

function setUniLiving(mode) {
  G.uniLiving = mode;
  saveGame(); renderAll(); openNavSheet('career');
}

function togglePartTimeJob(ptId) {
  const pt = PART_TIME_JOBS.find(x => x.id === ptId);
  if (!pt) return;
  if (pt.reqLic && !G.licenses[pt.reqLic]) { showToast(`${pt.reqLic} Ehliyet gerekiyor!`); return; }
  G.partTimeJobId = G.partTimeJobId === ptId ? null : ptId;
  saveGame(); renderAll(); openNavSheet('career');
}

function applyForJob(jobId) {
  if (G.age < 18) { showToast('En az 18 yaşında olmalısın!'); return; }
  const j = JOBS.find(x => x.id === jobId);
  if (!j) return;
  if (j.cleanRecord && G.criminalRecord) { showToast('Sabıka kaydın bu işe girmene engel!'); return; }
  if (j.reqEdu === 'highschool' && !G.highSchoolGrad) { showToast('Lise diploması gerekiyor!'); return; }
  if (j.reqEdu === 'uni' && (!G.uniGrad || G.graduatedMajor !== j.major)) { showToast('İlgili fakülte diploması gerekiyor!'); return; }
  if (j.reqLicense && !G.licenses[j.reqLicense]) { showToast(`${j.reqLicense} Ehliyet gerekiyor!`); return; }
  if (j.minExp && G.jobExp < j.minExp) { showToast(`En az ${j.minExp} yıl deneyim gerekiyor!`); return; }

  G.jobId = j.id;
  unlockAchievement('first_job');
  playSfx('coin');
  addLog(G.age, `💼 **${j.title}** olarak işe başladın!`, 'milestone');
  saveGame(); renderAll(); openNavSheet('career');
}

function quitJob() {
  G.jobId = null;
  saveGame(); renderAll(); openNavSheet('career');
}

function depositSavings() {
  if (G.money <= 0) return;
  const amt = Math.round(G.money * 0.5);
  G.money -= amt; G.bankSavings += amt;
  saveGame(); renderAll(); openNavSheet('finance');
}

function withdrawSavings() {
  if (G.bankSavings <= 0) return;
  G.money += G.bankSavings; G.bankSavings = 0;
  saveGame(); renderAll(); openNavSheet('finance');
}

function takeBankLoan(mult) {
  if (G.age < 18 || G.creditScore < 650) { showToast('Yaş veya Findeks kredi notu yetersiz!'); return; }
  const c = getCountry();
  const amount = Math.round(c.monthlyMinWage * mult);
  G.money += amount;
  G.loanDebt += Math.round(amount * 1.25);
  G.creditScore = clamp(G.creditScore - 40, 300, 1900);
  playSfx('coin');
  saveGame(); renderAll(); openNavSheet('finance');
}

function payOffLoan() {
  if (G.money < G.loanDebt) { showToast('Nakit yetersiz!'); return; }
  G.money -= G.loanDebt; G.loanDebt = 0;
  G.creditScore = clamp(G.creditScore + 120, 300, 1900);
  saveGame(); renderAll(); openNavSheet('finance');
}

function tradeInvestment(key, mode, amount) {
  if (mode === 'buy') {
    if (G.money < amount) { showToast('Nakit yetersiz!'); return; }
    G.money -= amount;
    G.investments[key] = (G.investments[key] || 0) + amount;
  } else {
    const val = G.investments[key] || 0;
    if (val <= 0) return;
    G.money += val;
    G.investments[key] = 0;
  }
  playSfx('coin');
  saveGame(); renderAll(); openNavSheet('finance');
}

function createNewBusiness(typeId) {
  const c = getCountry();
  const bType = BUSINESS_TYPES.find(x => x.id === typeId);
  if (!bType) return;
  const cost = Math.round(c.monthlyMinWage * bType.costMinWages);
  if (G.money < cost) { showToast('Sermaye yetersiz!'); return; }
  G.money -= cost;
  G.businesses.push({ uid: uid(), typeId, fleet: 1, employees: 2, strategy: 'balanced' });
  playSfx('coin');
  addLog(G.age, `🏢 **${bType.name}** şirketini kurdun!`, 'milestone');
  saveGame(); renderAll(); openNavSheet('finance');
}

function expandBizFleet(idx, cost) {
  const b = G.businesses[idx];
  if (!b || G.money < cost) { showToast('Bakiye yetersiz!'); return; }
  G.money -= cost;
  b.fleet += 1;
  if (b.fleet >= 5) unlockAchievement('fleet_king');
  playSfx('coin');
  saveGame(); renderAll(); openNavSheet('finance');
}

function hireBizStaff(idx, cost) {
  const b = G.businesses[idx];
  if (!b || G.money < cost) return;
  G.money -= cost;
  b.employees += 2;
  saveGame(); renderAll(); openNavSheet('finance');
}

function setBizStrategy(idx, strat) {
  if (!G.businesses[idx]) return;
  G.businesses[idx].strategy = strat;
  saveGame(); renderAll(); openNavSheet('finance');
}

function buyCar(carId, isUsedDamaged) {
  const c = getCountry();
  const car = CARS.find(x => x.id === carId);
  if (!car || !G.licenses[car.reqLic]) { showToast(`${car.reqLic} Ehliyet gerekir!`); return; }
  const zeroPrice = Math.round(c.monthlyMinWage * car.baseMinWages * c.carTaxMultiplier);
  const price = isUsedDamaged ? Math.round(zeroPrice * 0.55) : zeroPrice;
  if (G.money < price) { showToast('Bakiye yetersiz!'); return; }

  G.money -= price;
  G.cars.push({
    uid: uid(),
    carId: car.id,
    name: car.name,
    icon: car.icon,
    cond: isUsedDamaged ? randInt(42, 58) : 100,
    repairedOnce: false,
    trafficIns: true,
    kasko: !isUsedDamaged,
    value: isUsedDamaged ? Math.round(zeroPrice * 0.6) : Math.round(zeroPrice * 0.92)
  });
  activeGarageTab = 'mycars';
  playSfx('coin');
  saveGame(); renderAll(); openMenuSection('cars');
}

function toggleCarPolicy(idx, field) {
  const car = G.cars[idx];
  if (!car) return;
  car[field] = !car[field];
  saveGame(); renderAll(); openMenuSection('cars');
}

function repairCarInSanayi(idx, cost) {
  const car = G.cars[idx];
  if (!car || car.cond >= 98 || G.money < cost) { showToast('İşlem yapılamadı!'); return; }
  const c = getCountry();
  const baseCar = CARS.find(x => x.id === car.carId);
  const zeroPrice = baseCar ? Math.round(c.monthlyMinWage * baseCar.baseMinWages * c.carTaxMultiplier) : car.value;
  G.money -= cost;
  car.cond = 100;
  car.repairedOnce = true;
  car.value = Math.round(zeroPrice * 0.90);
  playSfx('coin');
  saveGame(); renderAll(); openMenuSection('cars');
}

function sellMyCar(idx) {
  const car = G.cars[idx];
  if (!car) return;
  G.money += car.value;
  if (car.repairedOnce) unlockAchievement('sanayi_wolf');
  G.cars.splice(idx, 1);
  playSfx('coin');
  saveGame(); renderAll(); openMenuSection('cars');
}

function buyHouse(houseId) {
  const c = getCountry();
  const h = HOUSES.find(x => x.id === houseId);
  if (!h) return;
  const price = Math.round(c.monthlyMinWage * h.baseMinWages * (c.houseMultiplier / 120));
  if (G.money < price) { showToast('Bakiye yetersiz!'); return; }
  const monthlyRent = Math.round((price * h.rentYield) / 12);
  G.money -= price;
  G.houses.push({ uid: uid(), houseId: h.id, name: h.name, icon: h.icon, value: price, monthlyRent, isRented: G.houses.length > 0, tenantOk: true });
  playSfx('coin');
  saveGame(); renderAll(); openMenuSection('houses');
}

function toggleHouseRent(idx) {
  const h = G.houses[idx];
  if (!h) return;
  h.isRented = !h.isRented; h.tenantOk = true;
  saveGame(); renderAll(); openMenuSection('houses');
}

function evictBadTenant(idx) {
  const h = G.houses[idx];
  if (!h) return;
  const c = getCountry();
  const fee = Math.round(c.monthlyMinWage * 0.4);
  if (G.money < fee) return;
  G.money -= fee; h.tenantOk = true;
  saveGame(); renderAll(); openMenuSection('houses');
}

function sellHouse(idx) {
  const h = G.houses[idx];
  if (!h) return;
  G.money += h.value;
  G.houses.splice(idx, 1);
  playSfx('coin');
  saveGame(); renderAll(); openMenuSection('houses');
}

function commitCrime(type) {
  if (G.age < 16 || G.inPrison) return;
  const c = getCountry();
  let title = 'Siber Vurgun', multMin = 8, multMax = 22, years = 3, chance = 0.45 + (G.smart / 300);
  if (type === 'smuggle') { title = 'Gümrüksüz Kaçak Sevkiyat'; multMin = 15, multMax = 35, years = 5, chance = 0.42; }
  if (type === 'heist') { title = 'Merkez Bankası Zırhlı Araç Soygunu'; multMin = 50, multMax = 90, years = 10, chance = 0.28; }

  closeBottomSheet();
  if (Math.random() < chance) {
    const loot = Math.round(c.monthlyMinWage * randInt(multMin, multMax));
    G.dirtyMoney = (G.dirtyMoney || 0) + loot;
    if (G.syndicate.joined) G.syndicate.respect = clamp(G.syndicate.respect + 15);
    playSfx('coin');
    addLog(G.age, `🕵️ **${title}** operasyonundan **+${fmtMoney(loot)} Kara Para** elde ettin! (Finans > Şirket sekmesinden aklayabilirsin).`, 'good');
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
    playSfx('coin');
    addLog(G.age, `⚖️ Mahkemeden **BERAAT** ettin!`, 'good');
  } else {
    G.inPrison = true;
    G.prisonYearsLeft = sentenceYears;
    G.criminalRecord = true;
    G.jobId = null;
    G.politics.officeId = null;
    playSfx('bad');
    addLog(G.age, `⛓️ **${crimeTitle}** suçundan **${sentenceYears} yıl hapis** cezası aldın!`, 'bad');
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

function clearCriminalRecord(cost) {
  if (G.inPrison || G.money < cost) return;
  G.money -= cost; G.criminalRecord = false;
  saveGame(); renderAll(); openMenuSection('license');
}

function joinSocialPlatform(name) {
  if (G.age < 13) return;
  if (!G.social.activePlatforms.includes(name)) {
    G.social.activePlatforms.push(name);
    G.social.followers += randInt(80, 280);
    saveGame(); renderAll(); openMenuSection('social');
  }
}

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
    G.social.followers += randInt(1500, 14000);
    G.money += Math.round(c.monthlyMinWage * 0.35);
  } else if (type === 'sponsor' && G.social.followers >= 10000) {
    G.money += Math.round((G.social.followers / 10000) * (c.monthlyMinWage * 0.9));
  }
  playSfx('coin');
  saveGame(); renderAll(); openMenuSection('social');
}

function applyForBlueTick() {
  if (G.social.verified || G.social.followers < 50000) return;
  G.social.verified = true;
  G.fame = clamp(G.fame + 20);
  unlockAchievement('blue_tick');
  saveGame(); renderAll(); openMenuSection('social');
}

function takeDrivingLicense(type, cost) {
  if (G.age < 18 || G.licenses[type] || G.money < cost) return;
  if (type === 'CE' && !G.licenses.B) return;
  G.money -= cost; G.licenses[type] = true;
  saveGame(); renderAll(); openMenuSection('license');
}

function playCasinoGame(game, bet) {
  if (G.age < 18 || G.money < bet) return;
  G.money -= bet;
  let win = 0;
  if (game === 'blackjack' && Math.random() < 0.48) win = bet * 2;
  if (game === 'roulette' && Math.random() < 0.48) win = bet * 2;
  if (game === 'slot' && Math.random() < 0.14) win = bet * 10;
  if (win > 0) { G.money += win; playSfx('coin'); showToast(`Kazandın! +${fmtMoney(win)}`); }
  else { playSfx('bad'); showToast(`Kaybettin: -${fmtMoney(bet)}`); }
  saveGame(); renderAll(); openMenuSection('casino');
}

function healthAction(type, cost) {
  if (G.money < cost) return;
  G.money -= cost;
  if (type === 'therapy') {
    G.stress = clamp((G.stress || 0) - 35);
    G.happy = clamp(G.happy + 14);
    G.diseases = (G.diseases || []).filter(d => d !== 'burnout');
  } else if (type === 'gym') {
    G.health = clamp(G.health + 8); G.looks = clamp(G.looks + 6); G.stress = clamp((G.stress || 0) - 12);
  } else if (type === 'plastic') {
    G.looks = clamp(G.looks + 22);
  }
  playSfx('coin');
  saveGame(); renderAll(); openMenuSection('health');
}

function migrateToCountry(targetId, cost) {
  if (G.age < 18 || G.inPrison || G.money < cost) return;
  const oldC = getCountry();
  const newC = getCountry(targetId);
  const ratio = newC.monthlyMinWage / oldC.monthlyMinWage;

  G.money = Math.round((G.money - cost) * ratio);
  G.dirtyMoney = Math.round((G.dirtyMoney || 0) * ratio);
  G.bankSavings = Math.round(G.bankSavings * ratio);
  G.loanDebt = Math.round(G.loanDebt * ratio);
  G.monthlyAlimony = Math.round((G.monthlyAlimony || 0) * ratio);
  Object.keys(G.investments).forEach(k => { G.investments[k] = Math.round(G.investments[k] * ratio); });
  G.cars.forEach(car => { car.value = Math.round(car.value * ratio); });
  G.houses.forEach(h => { h.value = Math.round(h.value * ratio); h.monthlyRent = Math.round(h.monthlyRent * ratio); });
  G.countryId = newC.id;
  G.politics.officeId = null;

  addLog(G.age, `✈️ **${oldC.name}** ülkesinden **${newC.flag} ${newC.name}** ülkesine göç ettin!`, 'milestone');
  saveGame(); renderAll(); closeBottomSheet();
}

function spendTimeWithFamily(idx) {
  const r = G.relations[idx];
  if (!r || !r.alive) return;
  r.love = clamp(r.love + 10); G.happy = clamp(G.happy + 5);
  saveGame(); renderAll(); openNavSheet('relations');
}

function openDeathModal() {
  const netWorth = getNetWorth();
  const choices = [];
  if (G.children && G.children.length > 0) {
    G.children.forEach((ch, idx) => {
      const childAge = Math.max(18, ch.age || 20);
      choices.push({
        label: `👑 Çocuğun ${ch.name} (${childAge} Yaş) Olarak Devam Et (Mirası Devral)`,
        action: () => continueAsChild(idx, false)
      });
      if (netWorth < 0 || G.loanDebt > 0) {
        choices.push({
          label: `🛡️ Reddi Miras Yap ve ${ch.name} Olarak Borçsuz Devam Et`,
          action: () => continueAsChild(idx, true)
        });
      }
    });
  }
  choices.push({
    label: '🔄 Sıfırdan Yeni Bir Hayata Başla',
    action: () => document.getElementById('startScreen').classList.remove('hidden')
  });

  openEventModal({
    badge: `⚰️ ${G.generation}. Kuşak Sonu`,
    title: `${G.firstName} ${G.lastName} (${G.age} Yaşında Vefat Etti)`,
    desc: `Net Servet: ${fmtMoney(netWorth)} • Açılan Başarım: ${G.achievements.length}/${ACHIEVEMENTS_DB.length}.`,
    choices
  });
}

function continueAsChild(childIdx, rejectInheritance) {
  const child = G.children[childIdx];
  if (!child) return;
  const oldName = `${G.firstName} ${G.lastName}`;
  const childParts = child.name.split(' ');
  const inheritedMoney = rejectInheritance ? 0 : Math.round((G.money + G.bankSavings + getTotalPortfolioValue()) * 0.9);
  const prevAch = G.achievements || [];

  G = {
    generation: (G.generation || 1) + 1,
    firstName: childParts[0],
    lastName: childParts.slice(1).join(' ') || G.lastName,
    gender: child.gender || 'M',
    countryId: G.countryId,
    portraitIdx: randInt(0, 2),
    age: Math.max(18, child.age || 20),
    alive: true,
    health: 95, happy: 88, smart: randInt(68, 95), looks: randInt(65, 95), fame: Math.round(G.fame * 0.35), stress: 10,
    money: inheritedMoney, dirtyMoney: 0, bankSavings: 0, loanDebt: rejectInheritance ? 0 : G.loanDebt, monthlyAlimony: 0,
    creditScore: 1200, investments: { gold: 0, forex: 0, stock: 0, crypto: 0 },
    eduStage: 'Lise Mezunu', obpScore: 84, examPrepBonus: 15, lastExamScore: 390, lastExamRank: 65000,
    highSchoolGrad: true, uniGrad: false, currentMajor: null, uniYearsLeft: 0, graduatedMajor: null, uniLiving: 'kyk', kykSupport: 'none', partTimeJobId: null,
    jobId: null, jobExp: 0, licenses: { B: true, CE: false }, militaryDone: false, criminalRecord: false, inPrison: false, prisonYearsLeft: 0,
    politics: { inParty: false, officeId: null, approval: 25, taxModifier: 0 },
    sports: { branchId: null, tierIndex: 0, skill: 60, injured: false },
    syndicate: { joined: false, rankLevel: 0, respect: 10 },
    diseases: [], achievements: prevAch,
    social: { activePlatforms: [], followers: Math.round(G.social.followers * 0.2), verified: false, postsThisYear: 0, annualAdIncome: 0 },
    cars: rejectInheritance ? [] : G.cars,
    houses: rejectInheritance ? [] : G.houses,
    businesses: rejectInheritance ? [] : G.businesses,
    relations: [], partner: null, children: [], willChildIndex: 0, logs: []
  };

  unlockAchievement('dynasty');
  addLog(G.age, `👑 **${G.generation}. Kuşak!** Ebeveynin **${oldName}** sonrasında mirası devralarak hayata devam ediyorsun!`, 'milestone');
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
   GENİŞLETME PAKETİ V1 — OTOMATİK OLAY VE BAŞARIM KÖPRÜSÜ
   ============================================================================ */
(function attachExpansionPackV1() {
  // 1. Yeni Başarımları (Pilot, Deniz Kurdu, Emlak Baronu) Her Render'da Kontrol Et
  const _origRenderAll = renderAll;
  renderAll = function () {
    if (G) {
      if (G.jobId === 'kaptan_pilot') unlockAchievement('captain_sky');
      if (G.jobId === 'gemi_kaptan' || (G.businesses && G.businesses.some(b => b.typeId === 'deniz_acente'))) {
        unlockAchievement('sea_wolf');
      }
      if (G.houses && G.houses.length >= 5) unlockAchievement('real_estate_mogul');
    }
    _origRenderAll();
  };

  // 2. RANDOM_EVENTS_DB Havuzunu Yıllık Olay Motoruna Bağla
  const _origTriggerYearlyEvents = triggerYearlyEvents;
  triggerYearlyEvents = function () {
    _origTriggerYearlyEvents();

    // Eğer o yıl YKS, Askerlik vb. zorunlu bir modal zaten açıldıysa üstüne açma
    const modal = document.getElementById('eventModal');
    if (!G || !G.alive || G.inPrison) return;
    if (modal && !modal.classList.contains('hidden')) return;
    if (typeof RANDOM_EVENTS_DB === 'undefined' || !Array.isArray(RANDOM_EVENTS_DB)) return;

    // Karakterin yaşına ve şartlarına uyan olayları filtrele
    const eligibleEvents = RANDOM_EVENTS_DB.filter(ev => {
      if (G.age < ev.minAge || G.age > ev.maxAge) return false;
      if (ev.onlyUni && G.eduStage !== 'Üniversite') return false;
      if (ev.requiresCar && (!G.cars || G.cars.length === 0)) return false;
      if (ev.requiresJob && !G.jobId) return false;
      return true;
    });

    // %65 ihtimalle havuzdan rastgele bir olay seç ve göster
    if (eligibleEvents.length > 0 && Math.random() < 0.65) {
      const picked = pickRandom(eligibleEvents);
      const c = getCountry();

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
            saveGame();
            renderAll();
          }
        }))
      });
    }
  };
})();
