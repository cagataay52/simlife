/* ============================================================================
   1. ÜLKELER, ENFLASYON VE PARA BİRİMLERİ VERİTABANI
   ============================================================================ */
const COUNTRIES = [
  {
    id: 'TR', name: 'Türkiye', flag: '🇹🇷', currency: '₺', code: 'TRY',
    monthlyMinWage: 22000, monthlyLivingCost: 14800, taxRate: 0.20, inflation: 0.32,
    carTaxMultiplier: 2.1, houseMultiplier: 140, uniPublicFee: 0, uniPrivateFee: 290000,
    militaryAge: 20, paidMilitaryCost: 240000,
    desc: 'YKS sıralaması, KYK/Burs sistemi, yüksek enflasyon (%32), ÖTV ve bedelli askerlik.',
    namesM: ['Çağatay', 'Çağrı', 'Kerem', 'Arda', 'Mert', 'Kaan', 'Emir', 'Burak', 'Efe', 'Barış'],
    namesF: ['Zeynep', 'Elif', 'Defne', 'Selin', 'Ece', 'Aslı', 'Duru', 'Melis', 'Azra', 'Yağmur'],
    lastNames: ['Kılıç', 'Yılmaz', 'Demir', 'Çelik', 'Kaya', 'Şahin', 'Yıldız', 'Öztürk', 'Aydın', 'Arslan']
  },
  {
    id: 'US', name: 'ABD', flag: '🇺🇸', currency: '$', code: 'USD',
    monthlyMinWage: 2400, monthlyLivingCost: 1750, taxRate: 0.22, inflation: 0.03,
    carTaxMultiplier: 0.9, houseMultiplier: 120, uniPublicFee: 14000, uniPrivateFee: 45000,
    militaryAge: null, paidMilitaryCost: 0,
    desc: 'Düşük enflasyon (%3), yüksek maaşlar, pahalı sağlık ve üniversite kredileri.',
    namesM: ['Liam', 'Noah', 'Ethan', 'Mason', 'Lucas', 'Logan', 'James', 'Alex'],
    namesF: ['Olivia', 'Emma', 'Sophia', 'Mia', 'Chloe', 'Harper', 'Ava', 'Lily'],
    lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Miller', 'Davis', 'Wilson', 'Anderson']
  },
  {
    id: 'DE', name: 'Almanya', flag: '🇩🇪', currency: '€', code: 'EUR',
    monthlyMinWage: 2150, monthlyLivingCost: 1400, taxRate: 0.30, inflation: 0.025,
    carTaxMultiplier: 0.95, houseMultiplier: 130, uniPublicFee: 0, uniPrivateFee: 12000,
    militaryAge: null, paidMilitaryCost: 0,
    desc: 'Ücretsiz devlet üniversiteleri, güçlü lojistik/mühendislik pazarı ve sağlam Euro ekonomisi.',
    namesM: ['Lukas', 'Leon', 'Finn', 'Jonas', 'Felix', 'Maximilian', 'Paul'],
    namesF: ['Mia', 'Hannah', 'Emilia', 'Sophia', 'Lina', 'Lea', 'Clara'],
    lastNames: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner']
  },
  {
    id: 'SA', name: 'Suudi Arabistan', flag: '🇸🇦', currency: '﷼', code: 'SAR',
    monthlyMinWage: 4500, monthlyLivingCost: 2600, taxRate: 0.0, inflation: 0.02,
    carTaxMultiplier: 0.85, houseMultiplier: 100, uniPublicFee: 0, uniPrivateFee: 42000,
    militaryAge: null, paidMilitaryCost: 0,
    desc: '%0 gelir vergisi, ucuz benzin/otomobil, geleneksel kurallar ve erken evlilik baskısı.',
    namesM: ['Mohammed', 'Fahad', 'Abdullah', 'Salman', 'Khalid', 'Omar', 'Tariq'],
    namesF: ['Fatima', 'Noor', 'Aisha', 'Layla', 'Maryam', 'Sara', 'Reem'],
    lastNames: ['Al-Saud', 'Al-Qahtani', 'Al-Otaibi', 'Al-Ghamdi', 'Al-Harbi', 'Al-Zahrani']
  },
  {
    id: 'AE', name: 'Birleşik Arap Emirlikleri', flag: '🇦🇪', currency: 'د.إ', code: 'AED',
    monthlyMinWage: 6500, monthlyLivingCost: 4200, taxRate: 0.0, inflation: 0.025,
    carTaxMultiplier: 0.8, houseMultiplier: 135, uniPublicFee: 18000, uniPrivateFee: 65000,
    militaryAge: null, paidMilitaryCost: 0,
    desc: 'Dubai lüks yaşamı, %0 gelir vergisi, vergisiz süper otomobiller ve global ticaret.',
    namesM: ['Rashid', 'Hamdan', 'Zayed', 'Saeed', 'Majid', 'Sultan'],
    namesF: ['Amna', 'Hessa', 'Latifa', 'Shamma', 'Mariam', 'Noura'],
    lastNames: ['Al-Maktoum', 'Al-Nahyan', 'Al-Mazrouei', 'Al-Suwaidi', 'Al-Nuaimi']
  },
  {
    id: 'GB', name: 'İngiltere', flag: '🇬🇧', currency: '£', code: 'GBP',
    monthlyMinWage: 1950, monthlyLivingCost: 1380, taxRate: 0.25, inflation: 0.035,
    carTaxMultiplier: 1.0, houseMultiplier: 145, uniPublicFee: 9250, uniPrivateFee: 24000,
    militaryAge: null, paidMilitaryCost: 0,
    desc: 'Güçlü Sterlin kuru, Premier Lig futbol merkezi ve ücretsiz NHS sağlık sistemi.',
    namesM: ['Oliver', 'George', 'Harry', 'Arthur', 'Charlie', 'Jack'],
    namesF: ['Amelia', 'Isla', 'Ava', 'Freya', 'Poppy', 'Charlotte'],
    lastNames: ['Taylor', 'Davies', 'Evans', 'Thomas', 'Roberts', 'Walker']
  },
  {
    id: 'NO', name: 'Norveç', flag: '🇳🇴', currency: 'kr', code: 'NOK',
    monthlyMinWage: 28000, monthlyLivingCost: 17500, taxRate: 0.34, inflation: 0.03,
    carTaxMultiplier: 1.2, houseMultiplier: 120, uniPublicFee: 0, uniPrivateFee: 95000,
    militaryAge: null, paidMilitaryCost: 0,
    desc: 'İskandinav refah devleti, ücretsiz eğitim ve yüksek yaşam kalitesi.',
    namesM: ['Jakob', 'Emil', 'Noah', 'Oliver', 'Filip', 'Henrik'],
    namesF: ['Nora', 'Emma', 'Sofie', 'Olivia', 'Ella', 'Maja'],
    lastNames: ['Hansen', 'Johansen', 'Olsen', 'Larsen', 'Andersen', 'Pedersen']
  },
  {
    id: 'JP', name: 'Japonya', flag: '🇯🇵', currency: '¥', code: 'JPY',
    monthlyMinWage: 210000, monthlyLivingCost: 145000, taxRate: 0.23, inflation: 0.02,
    carTaxMultiplier: 0.95, houseMultiplier: 135, uniPublicFee: 540000, uniPrivateFee: 1350000,
    militaryAge: null, paidMilitaryCost: 0,
    desc: 'Düşük enflasyon, yüksek teknoloji, uzun ömür ve yoğun çalışma kültürü.',
    namesM: ['Haruto', 'Ren', 'Sota', 'Yuto', 'Riku', 'Kenji'],
    namesF: ['Yui', 'Hina', 'Aoi', 'Sakura', 'Rin', 'Mio'],
    lastNames: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito']
  },
  {
    id: 'KR', name: 'Güney Kore', flag: '🇰🇷', currency: '₩', code: 'KRW',
    monthlyMinWage: 2200000, monthlyLivingCost: 1450000, taxRate: 0.22, inflation: 0.03,
    carTaxMultiplier: 1.0, houseMultiplier: 155, uniPublicFee: 4500000, uniPrivateFee: 9500000,
    militaryAge: 20, paidMilitaryCost: 0,
    desc: 'Zorlu üniversite sınavı, zorunlu askerlik, E-Spor şampiyonlukları ve fenomenlik merkezi.',
    namesM: ['Min-jun', 'Seo-jun', 'Do-yun', 'Ji-ho', 'Joon-ho'],
    namesF: ['Seo-yeon', 'Ji-woo', 'Ha-yoon', 'Min-seo', 'Soo-jin'],
    lastNames: ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang']
  },
  {
    id: 'RU', name: 'Rusya', flag: '🇷🇺', currency: '₽', code: 'RUB',
    monthlyMinWage: 45000, monthlyLivingCost: 31000, taxRate: 0.13, inflation: 0.09,
    carTaxMultiplier: 1.25, houseMultiplier: 120, uniPublicFee: 0, uniPrivateFee: 260000,
    militaryAge: 19, paidMilitaryCost: 450000,
    desc: '%13 sabit gelir vergisi, enerji/hammadde ticareti ve zorunlu askerlik.',
    namesM: ['Alexander', 'Maxim', 'Dmitry', 'Ivan', 'Artem', 'Mikhail'],
    namesF: ['Sofia', 'Anna', 'Maria', 'Victoria', 'Alisa', 'Polina'],
    lastNames: ['Ivanov', 'Smirnov', 'Kuznetsov', 'Popov', 'Sokolov', 'Lebedev']
  },
  {
    id: 'BR', name: 'Brezilya', flag: '🇧🇷', currency: 'R$', code: 'BRL',
    monthlyMinWage: 1850, monthlyLivingCost: 1350, taxRate: 0.18, inflation: 0.07,
    carTaxMultiplier: 1.35, houseMultiplier: 115, uniPublicFee: 0, uniPrivateFee: 24000,
    militaryAge: null, paidMilitaryCost: 0,
    desc: 'Futbol akademisi yetenek havuzu, renkli yaşam ve dinamik pazar.',
    namesM: ['Miguel', 'Arthur', 'Heitor', 'Gabriel', 'Lucas', 'Matheus'],
    namesF: ['Helena', 'Alice', 'Laura', 'Valentina', 'Julia', 'Isabella'],
    lastNames: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira']
  },
  {
    id: 'NG', name: 'Nijerya', flag: '🇳🇬', currency: '₦', code: 'NGN',
    monthlyMinWage: 85000, monthlyLivingCost: 65000, taxRate: 0.15, inflation: 0.26,
    carTaxMultiplier: 1.4, houseMultiplier: 105, uniPublicFee: 120000, uniPrivateFee: 950000,
    militaryAge: null, paidMilitaryCost: 0,
    desc: 'Yüksek enflasyon (%26), zorlu altyapı ama hızlı büyüyen girişimcilik fırsatları.',
    namesM: ['Chinedu', 'Emeka', 'Tunde', 'Oluwaseun', 'Ibrahim', 'Musa'],
    namesF: ['Amina', 'Ngozi', 'Chioma', 'Zainab', 'Funke', 'Adaeze'],
    lastNames: ['Okafor', 'Adeyemi', 'Balogun', 'Abubakar', 'Eze', 'Nwosu']
  }
];

/* ============================================================================
   2. EĞİTİM, MESLEKLER, SİYASET, SPOR/E-SPOR, SENDİKA VE HASTALIK VERİLERİ
   ============================================================================ */
const UNI_MAJORS = [
  { id: 'tip', name: 'Tıp Fakültesi', minScore: 465, rankText: 'İlk 15.000', years: 6, icon: '🩺' },
  { id: 'yazilim', name: 'Bilgisayar & Yazılım Müh.', minScore: 440, rankText: 'İlk 35.000', years: 4, icon: '💻' },
  { id: 'hukuk', name: 'Hukuk Fakültesi', minScore: 420, rankText: 'İlk 55.000', years: 4, icon: '⚖️' },
  { id: 'endustri', name: 'Makine & Endüstri Müh.', minScore: 400, rankText: 'İlk 85.000', years: 4, icon: '⚙️' },
  { id: 'lojistik', name: 'Uluslararası Lojistik ve Tedarik Zinciri', minScore: 360, rankText: 'İlk 160.000', years: 4, icon: '🚢' },
  { id: 'isletme', name: 'İşletme, İktisat & Siyaset Bilimi', minScore: 345, rankText: 'İlk 210.000', years: 4, icon: '📈' },
  { id: 'hemsirelik', name: 'Hemşirelik & Sağlık Bilimleri', minScore: 330, rankText: 'İlk 250.000', years: 4, icon: '🏥' },
  { id: 'egitim', name: 'Eğitim Fakültesi (Öğretmenlik)', minScore: 315, rankText: 'İlk 300.000', years: 4, icon: '📚' },
  { id: 'medya', name: 'Yeni Medya, İletişim & Sinema', minScore: 285, rankText: 'İlk 450.000', years: 4, icon: '🎬' }
];

const PART_TIME_JOBS = [
  { id: 'pt_barista', title: 'Kampüs Kafe Baristası (Part-Time)', mult: 0.45, icon: '☕' },
  { id: 'pt_kurye', title: 'Akşam Vardiyası Kurye (Part-Time)', mult: 0.65, reqLic: 'B', icon: '🛵' },
  { id: 'pt_stajyer', title: 'Lojistik / Ofis Stajyeri (Part-Time)', mult: 0.55, icon: '📋' }
];

const JOBS = [
  { id: 'garson', title: 'Kafe Garsonu / Barista', reqEdu: 'none', mult: 1.05, stress: 4, icon: '☕' },
  { id: 'depo', title: 'Lojistik Depo & Sevkiyat Personeli', reqEdu: 'none', mult: 1.25, stress: 6, icon: '📦' },
  { id: 'kurye', title: 'Motorlu Kurye', reqEdu: 'none', reqLicense: 'B', mult: 1.75, stress: 7, icon: '🛵' },
  { id: 'taksi', title: 'Şehir İçi Taksi / Uber Şoförü', reqEdu: 'none', reqLicense: 'B', mult: 2.0, stress: 7, icon: '🚕' },
  { id: 'tir_soforu', title: 'Uluslararası Tır Şoförü', reqEdu: 'none', reqLicense: 'CE', mult: 3.4, stress: 9, icon: '🚛' },

  { id: 'satis', title: 'Mağaza Satış Danışmanı', reqEdu: 'highschool', mult: 1.3, stress: 5, icon: '🛍️' },
  { id: 'gumruk_musavir_yrd', title: 'Gümrük Müşavir Yardımcısı', reqEdu: 'highschool', cleanRecord: true, mult: 2.1, stress: 6, icon: '🛃' },
  { id: 'polis', title: 'Polis Memuru', reqEdu: 'highschool', cleanRecord: true, mult: 2.55, stress: 10, icon: '🚓' },

  { id: 'lojistik_uzman', title: 'Lojistik ve Operasyon Uzmanı', reqEdu: 'uni', major: 'lojistik', mult: 2.5, stress: 6, icon: '🚢' },
  { id: 'tedarik_mudur', title: 'Tedarik Zinciri & Filo Müdürü', reqEdu: 'uni', major: 'lojistik', minExp: 3, mult: 4.6, stress: 8, icon: '🌐' },
  { id: 'global_lojistik_dir', title: 'Global Lojistik Direktörü (COO)', reqEdu: 'uni', major: 'lojistik', minExp: 7, mult: 8.2, stress: 10, icon: '✈️' },

  { id: 'pratisyen', title: 'Pratisyen Hekim', reqEdu: 'uni', major: 'tip', cleanRecord: true, mult: 4.2, stress: 10, icon: '🩺' },
  { id: 'cerrah', title: 'Uzman Cerrah', reqEdu: 'uni', major: 'tip', cleanRecord: true, minExp: 4, mult: 7.5, stress: 12, icon: '🫀' },
  { id: 'bashekim', title: 'Özel Hastane Başhekimi', reqEdu: 'uni', major: 'tip', cleanRecord: true, minExp: 8, mult: 12.0, stress: 10, icon: '🏥' },

  { id: 'jr_dev', title: 'Junior Yazılım Geliştirici', reqEdu: 'uni', major: 'yazilim', mult: 2.8, stress: 6, icon: '💻' },
  { id: 'sr_dev', title: 'Senior Full-Stack Mühendisi', reqEdu: 'uni', major: 'yazilim', minExp: 3, mult: 5.8, stress: 8, icon: '🖥️' },
  { id: 'cto', title: 'Teknoloji Direktörü (CTO)', reqEdu: 'uni', major: 'yazilim', minExp: 7, mult: 10.5, stress: 10, icon: '🚀' },

  { id: 'avukat', title: 'Baro Avukatı', reqEdu: 'uni', major: 'hukuk', cleanRecord: true, mult: 3.1, stress: 8, icon: '⚖️' },
  { id: 'savci', title: 'Cumhuriyet Savcısı / Hakim', reqEdu: 'uni', major: 'hukuk', cleanRecord: true, minExp: 3, mult: 5.2, stress: 11, icon: '🏛️' },
  { id: 'hukuk_ortak', title: 'Uluslararası Hukuk Bürosu Ortağı', reqEdu: 'uni', major: 'hukuk', cleanRecord: true, minExp: 7, mult: 9.8, stress: 10, icon: '💼' },

  { id: 'endustri_muh', title: 'Üretim & Planlama Mühendisi', reqEdu: 'uni', major: 'endustri', mult: 2.9, stress: 7, icon: '⚙️' },
  { id: 'fabrika_md', title: 'Fabrika Genel Müdürü', reqEdu: 'uni', major: 'endustri', minExp: 5, mult: 6.5, stress: 9, icon: '🏭' },
  { id: 'finans_analist', title: 'Yatırım Bankası Analisti', reqEdu: 'uni', major: 'isletme', cleanRecord: true, mult: 2.7, stress: 8, icon: '📊' },
  { id: 'ceo', title: 'Holding CEO’su', reqEdu: 'uni', major: 'isletme', minExp: 8, mult: 11.5, stress: 11, icon: '🏢' },
  { id: 'hemsire', title: 'Uzman Hemşire', reqEdu: 'uni', major: 'hemsirelik', cleanRecord: true, mult: 2.3, stress: 9, icon: '💉' },
  { id: 'ogretmen', title: 'Okul Öğretmeni', reqEdu: 'uni', major: 'egitim', cleanRecord: true, mult: 2.2, stress: 5, icon: '📚' },
  { id: 'medya_yonetmen', title: 'Dijital Medya & Kreatif Direktör', reqEdu: 'uni', major: 'medya', mult: 3.4, stress: 6, icon: '🎬' }
];

const POLITICS_OFFICES = [
  { id: 'council', title: 'Belediye Meclis Üyesi', minAge: 21, campaignMult: 3, salaryMult: 2.2, reqApproval: 25, icon: '🏛️' },
  { id: 'mayor', title: 'Büyükşehir Belediye Başkanı', minAge: 25, campaignMult: 14, salaryMult: 5.5, reqApproval: 48, icon: '🏙️' },
  { id: 'mp', title: 'Milletvekili / Senatör', minAge: 25, campaignMult: 28, salaryMult: 7.2, reqApproval: 60, icon: '🎙️' },
  { id: 'president', title: 'Cumhurbaşkanı / Başbakan', minAge: 35, campaignMult: 85, salaryMult: 16.0, reqApproval: 76, icon: '👑' }
];

const SPORTS_BRANCHES = [
  { id: 'football', name: 'Profesyonel Futbolcu', icon: '⚽', tiers: ['Altyapı Akademisi', 'Ulusal Süper Lig', 'Avrupa Şampiyonlar Ligi Devleri'], mults: [1.5, 8.5, 28.0] },
  { id: 'basketball', name: 'Profesyonel Basketbolcu', icon: '🏀', tiers: ['Genç Takım', 'EuroLeague Kulübü', 'NBA All-Star Kontratı'], mults: [1.4, 7.5, 25.0] },
  { id: 'esports', name: 'Profesyonel E-Spor Oyuncusu', icon: '🎮', tiers: ['Yarı-Pro Takım', 'Ulusal Espor Ligi', 'Global Worlds Şampiyon Takımı'], mults: [1.2, 5.2, 16.0] }
];

const SYNDICATE_RANKS = [
  { level: 1, title: 'Sokak Ayakçısı', cutMult: 1.5 },
  { level: 2, title: 'Tahsilatçı & Koruma', cutMult: 3.8 },
  { level: 3, title: 'Bölge Sorumlusu (Sağ Kol)', cutMult: 8.5 },
  { level: 4, title: 'Yeraltı Sendika Baronu', cutMult: 22.0 }
];

const DISEASES_DB = [
  { id: 'flu', name: 'Ağır İnfluenza (Grip)', hpDrain: 4, happyDrain: 4, treatMult: 0.25 },
  { id: 'burnout', name: 'Tükenmişlik Sendromu & Depresyon', hpDrain: 3, happyDrain: 14, treatMult: 0.85, isMental: true },
  { id: 'hypertension', name: 'Yüksek Tansiyon & Kalp Ritmi', hpDrain: 8, happyDrain: 5, treatMult: 1.4 },
  { id: 'hernia', name: 'Ağır Bel & Boyun Fıtığı', hpDrain: 6, happyDrain: 8, treatMult: 1.2 }
];

const ACHIEVEMENTS_DB = [
  { id: 'first_job', title: 'Alın Teri', desc: 'İlk tam zamanlı işine girdin.', icon: '💼' },
  { id: 'uni_grad', title: 'Kep Attık!', desc: 'Üniversiteden başarıyla mezun oldun.', icon: '🎓' },
  { id: 'millionaire', title: 'Milyoner Kulübü', desc: 'Asgari ücretin 100 katı net servete ulaştın.', icon: '💎' },
  { id: 'sanayi_wolf', title: 'Sanayi Kurdu', desc: 'Hasarlı aracı sanayide toplatıp kârla sattın.', icon: '🔧' },
  { id: 'blue_tick', title: 'Mavi Tikli Fenomen', desc: 'Sosyal medyada doğrulanmış ünlü oldun.', icon: '☑️' },
  { id: 'pro_champ', title: 'Şampiyon Sporcu', desc: 'Futbol, Basketbol veya E-Sporda en üst lige çıktın.', icon: '🏆' },
  { id: 'president', title: 'Devletin Zirvesi', desc: 'Seçimleri kazanarak Cumhurbaşkanı / Başbakan oldun.', icon: '👑' },
  { id: 'syndicate_boss', title: 'Yeraltı Baronu', desc: 'Organize suç sendikasında Baron rütbesine yükseldin.', icon: '🕶️' },
  { id: 'dynasty', title: 'Hanedan Kurucusu', desc: 'Vefat ettikten sonra çocuğun olarak 2. Kuşağa geçtin.', icon: '🧬' },
  { id: 'fleet_king', title: 'Lojistik İmparatoru', desc: 'Şirket filonu 5 ve üzeri araca/ekipmana çıkardın.', icon: '🚛' }
];

const CARS = [
  { id: 'scooter', name: '125cc Kurye Motosikleti', cat: 'Ekonomik', baseMinWages: 4.5, reqLic: 'B', icon: '🛵', prestige: 3 },
  { id: 'tofas', name: '98 Klasik Sedan', cat: 'Ekonomik', baseMinWages: 11, reqLic: 'B', icon: '🚗', prestige: 5 },
  { id: 'egea', name: 'Fiat Egea Sedan 1.6 Multijet', cat: 'Binek Sıfır', baseMinWages: 38, reqLic: 'B', icon: '🚘', prestige: 15 },
  { id: 'corolla', name: 'Toyota Corolla Hybrid', cat: 'Binek Sıfır', baseMinWages: 52, reqLic: 'B', icon: '🚙', prestige: 18 },
  { id: 'togg', name: 'Togg T10X V2 Uzun Menzil', cat: 'Binek Sıfır', baseMinWages: 64, reqLic: 'B', icon: '⚡', prestige: 25 },
  { id: 'bmw320', name: 'BMW 320i M Sport', cat: 'Lüks & Spor', baseMinWages: 115, reqLic: 'B', icon: '🏎️', prestige: 38 },
  { id: 'g63', name: 'Mercedes-AMG G63', cat: 'Lüks & Spor', baseMinWages: 340, reqLic: 'B', icon: '🚙', prestige: 65 },
  { id: 'porsche911', name: 'Porsche 911 Turbo S', cat: 'Lüks & Spor', baseMinWages: 420, reqLic: 'B', icon: '🏁', prestige: 80 },
  { id: 'volvo_fh16', name: 'Volvo FH16 750 Çekici Tır', cat: 'Ticari Ağır Vasıta', baseMinWages: 180, reqLic: 'CE', icon: '🚛', prestige: 30 }
];

const HOUSES = [
  { id: 'studio', name: '1+1 Şehir İçi Stüdyo Daire', baseMinWages: 85, rentYield: 0.06, icon: '🏢', happy: 8 },
  { id: 'apt31', name: '3+1 Güvenlikli Site Dairesi', baseMinWages: 175, rentYield: 0.055, icon: '🏘️', happy: 15 },
  { id: 'villa', name: 'Müstakil Havuzlu Villa', baseMinWages: 480, rentYield: 0.05, icon: '🏡', happy: 28 },
  { id: 'mansion', name: 'Boğaz / Deniz Manzaralı Yalı', baseMinWages: 1450, rentYield: 0.045, icon: '🏰', happy: 45 }
];

const BUSINESS_TYPES = [
  { id: 'cafe', name: '3. Nesil Kahve & Kruvasan Dükkanı', costMinWages: 35, baseProfitMult: 2.2, unitName: 'Şube Ekipmanı', icon: '☕' },
  { id: 'eticaret', name: 'E-Ticaret & Dropshipping Deposu', costMinWages: 55, baseProfitMult: 3.6, unitName: 'Kargo Bandı', icon: '📦' },
  { id: 'lojistik_filo', name: 'Uluslararası Lojistik & Tır Filosu', costMinWages: 160, baseProfitMult: 9.5, unitName: 'Çekici Tır', icon: '🚢' },
  { id: 'tech_startup', name: 'Yapay Zeka & SaaS Teknoloji Şirketi', costMinWages: 240, baseProfitMult: 15.0, unitName: 'Sunucu Kümesi', icon: '🤖' }
];

const PORTRAITS = {
  M: {
    baby: ['https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=300&q=80'],
    child: ['https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=300&q=80'],
    young: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'
    ],
    adult: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80'
    ],
    old: ['https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=300&q=80']
  },
  F: {
    baby: ['https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=300&q=80'],
    child: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=300&q=80'],
    young: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80'
    ],
    adult: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80'
    ],
    old: ['https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&q=80']
  }
};

/* ============================================================================
   GENİŞLETME PAKETİ V1 — YENİ BÖLÜMLER, MESLEKLER, ARAÇLAR VE OLAY HAVUZU
   ============================================================================ */

// 1. Yeni Üniversite Bölümleri
UNI_MAJORS.push(
  { id: 'havacilik', name: 'Sivil Havacılık & Pilotaj', minScore: 455, rankText: 'İlk 22.000', years: 4, icon: '✈️' },
  { id: 'denizcilik', name: 'Deniz Ulaştırma & Gemi İşletme Müh.', minScore: 390, rankText: 'İlk 95.000', years: 4, icon: '⚓' },
  { id: 'mimarlik', name: 'Mimarlık & Şehir Planlama', minScore: 410, rankText: 'İlk 70.000', years: 4, icon: '📐' }
);

// 2. Yeni Part-Time Öğrenci İşleri
PART_TIME_JOBS.push(
  { id: 'pt_kutuphane', title: 'Üniversite Kütüphane Asistanı (Part-Time)', mult: 0.40, icon: '📚' },
  { id: 'pt_oto_yikama', title: 'Hafta Sonu Oto Yıkama & Detailing (Part-Time)', mult: 0.58, icon: '🧽' }
);

// 3. Yeni Tam Zamanlı Meslekler
JOBS.push(
  // Ehliyet & Zanaat Odaklı
  { id: 'sanayi_usta', title: 'Oto Sanayi Motor & Kaporta Ustası', reqEdu: 'none', mult: 2.35, stress: 7, icon: '🔧' },
  { id: 'otobus_kaptan', title: 'Şehirlerarası Otobüs Kaptanı', reqEdu: 'highschool', reqLicense: 'CE', mult: 2.85, stress: 9, icon: '🚌' },
  { id: 'vinc_op', title: 'Liman Konteyner Vinç Operatörü', reqEdu: 'highschool', reqLicense: 'CE', mult: 3.10, stress: 8, icon: '🏗️' },

  // Lojistik & Gümrük Uzmanlığı
  { id: 'gumruk_sef', title: 'Gümrük Operasyon & Mevzuat Şefi', reqEdu: 'uni', major: 'lojistik', minExp: 2, cleanRecord: true, mult: 3.8, stress: 8, icon: '🛃' },
  { id: 'liman_mudur', title: 'Uluslararası Konteyner Liman Müdürü', reqEdu: 'uni', major: 'lojistik', minExp: 5, cleanRecord: true, mult: 6.4, stress: 9, icon: '🚢' },

  // Denizcilik
  { id: 'gemi_zabit', title: 'Uzakyol Vardiya Zabiti', reqEdu: 'uni', major: 'denizcilik', mult: 4.5, stress: 8, icon: '🛳️' },
  { id: 'gemi_kaptan', title: 'Uzakyol Süvari (Gemi Kaptanı)', reqEdu: 'uni', major: 'denizcilik', minExp: 5, mult: 9.2, stress: 10, icon: '⚓' },

  // Havacılık & Pilotaj
  { id: 'first_officer', title: 'Havayolu Yardımcı Pilotu (First Officer)', reqEdu: 'uni', major: 'havacilik', cleanRecord: true, mult: 6.5, stress: 9, icon: '🛫' },
  { id: 'kaptan_pilot', title: 'Kıdemli Kaptan Pilot', reqEdu: 'uni', major: 'havacilik', minExp: 5, cleanRecord: true, mult: 13.5, stress: 11, icon: '👨‍✈️' },

  // Mimarlık & Siber Güvenlik
  { id: 'santiye_mimar', title: 'Proje & Şantiye Mimarı', reqEdu: 'uni', major: 'mimarlik', mult: 3.0, stress: 7, icon: '📐' },
  { id: 'bas_mimar', title: 'Baş Mimar & Kentsel Dönüşüm Müteahhidi', reqEdu: 'uni', major: 'mimarlik', minExp: 5, mult: 7.8, stress: 9, icon: '🏙️' },
  { id: 'siber_uzman', title: 'Siber Güvenlik & Beyaz Şapkalı Hacker', reqEdu: 'uni', major: 'yazilim', minExp: 2, cleanRecord: true, mult: 4.9, stress: 8, icon: '🛡️' }
);

// 4. Yeni Araçlar (Ticari, Makam, Çekici Tır ve Süper Lüks)
CARS.push(
  { id: 'doblo', name: 'Fiat Doblo Combi 1.6 Multijet', cat: 'Ekonomik & Ticari', baseMinWages: 28, reqLic: 'B', icon: '🚐', prestige: 10 },
  { id: 'egea_cross', name: 'Fiat Egea Cross Lounge (Özel Panjur Paket)', cat: 'Binek Sıfır', baseMinWages: 44, reqLic: 'B', icon: '🚗', prestige: 17 },
  { id: 'transporter', name: 'VW Transporter VIP Özel Yapım', cat: 'Ticari & VIP', baseMinWages: 76, reqLic: 'B', icon: '🚐', prestige: 28 },
  { id: 'passat', name: 'Volkswagen Passat 2.0 TDI Elegance', cat: 'Binek & Makam', baseMinWages: 88, reqLic: 'B', icon: '🚘', prestige: 34 },
  { id: 'scania_s730', name: 'Scania S730 V8 Uzun Yol Çekici Tır', cat: 'Ticari Ağır Vasıta', baseMinWages: 210, reqLic: 'CE', icon: '🚛', prestige: 36 },
  { id: 'ferrari_f8', name: 'Ferrari F8 Tributo', cat: 'Süper Lüks', baseMinWages: 540, reqLic: 'B', icon: '🏎️', prestige: 90 },
  { id: 'maybach', name: 'Mercedes-Maybach S680 Makam Aracı', cat: 'Ultra Lüks', baseMinWages: 620, reqLic: 'B', icon: '🎩', prestige: 95 }
);

// 5. Yeni Emlaklar
HOUSES.push(
  { id: 'ogrenci_apart', name: 'Üniversite Yakını 1+0 Yatırımlık Apart', baseMinWages: 60, rentYield: 0.072, icon: '🏬', happy: 6 },
  { id: 'lojistik_depo', name: 'Gümrük Yanı Kiralık Lojistik Antrepo', baseMinWages: 320, rentYield: 0.068, icon: '🏭', happy: 18 },
  { id: 'penthouse', name: 'Rezidans 40. Kat Penthouse', baseMinWages: 790, rentYield: 0.048, icon: '🌆', happy: 36 }
);

// 6. Yeni Şirket & Filo Türleri
BUSINESS_TYPES.push(
  { id: 'oto_servis', name: 'Oto Ekspertiz, Kaporta & Bakım Servisi', costMinWages: 45, baseProfitMult: 3.1, unitName: 'Servis Lifti', icon: '🔧' },
  { id: 'otobus_firma', name: 'Şehirlerarası Otobüs & Turizm Firması', costMinWages: 135, baseProfitMult: 7.8, unitName: 'Yolcu Otobüsü', icon: '🚌' },
  { id: 'deniz_acente', name: 'Uluslararası Konteyner & Gemi Acentesi', costMinWages: 310, baseProfitMult: 19.5, unitName: 'Kargo Gemisi', icon: '🛳️' }
);

// 7. Yeni Başarımlar (Kupalar)
ACHIEVEMENTS_DB.push(
  { id: 'captain_sky', title: 'Gökyüzü Hakimi', desc: 'Kıdemli Kaptan Pilot unvanına ulaştın.', icon: '👨‍✈️' },
  { id: 'sea_wolf', title: 'Denizlerin Kurdu', desc: 'Uzakyol Gemi Kaptanı veya Gemi Acentesi sahibi oldun.', icon: '⚓' },
  { id: 'real_estate_mogul', title: 'Emlak Baronu', desc: 'Aynı anda 5 veya daha fazla gayrimenkule sahip oldun.', icon: '🏰' }
);

// 8. Genişletilmiş Rastgele Olay Havuzu (RANDOM_EVENTS_DB)
const RANDOM_EVENTS_DB = [
  // ÇOCUKLUK VE OKUL YILLARI (7 - 17 YAŞ)
  {
    id: 'school_tournament',
    minAge: 8, maxAge: 14,
    badge: '⚽ Okul Turnuvası',
    title: 'Sınıflararası Maçta Son Dakika Penaltısı',
    desc: 'Okul bahçesindeki turnuvada maç 1-1 ve son dakikada penaltı kazandınız. Topun başına kim geçecek?',
    choices: [
      {
        label: '🔥 Sorumluluğu Al ve Köşeye Vur',
        effect: (G, c) => {
          if (Math.random() < 0.65) {
            G.happy = clamp(G.happy + 12);
            G.sports.skill = clamp((G.sports.skill || 50) + 6);
            return { text: '⚽ Topu doksana astın! Tüm okul seni omuzlarında taşıdı.', type: 'good' };
          } else {
            G.happy = clamp(G.happy - 8);
            return { text: '🥅 Top direkten döndü, maçı penaltılardabettiniz.', type: 'bad' };
          }
        }
      },
      {
        label: '🤝 Takımın En İyi Oyuncusuna Bırak',
        effect: (G, c) => {
          G.happy = clamp(G.happy + 6);
          return { text: '🤝 Arkadaşın golü attı, centilmenliğinle takdir topladın.', type: 'good' };
        }
      }
    ]
  },
  {
    id: 'highschool_cheat_sheet',
    minAge: 14, maxAge: 17,
    badge: '🏫 Lise Koridorları',
    title: 'Zorlu Matematik Sınavı Öncesi Fırsat',
    desc: 'Sınıfın en çalışkan öğrencisi sınav öncesi sana çalışma notlarını vermeyi teklif ediyor ama karşılığında kantinden bir hafta tost ısmarlamanı istiyor.',
    choices: [
      {
        label: '🥪 Kabul Et ve Notlara Çalış (+OBP)',
        effect: (G, c) => {
          G.obpScore = clamp(G.obpScore + 4, 50, 100);
          G.smart = clamp(G.smart + 4);
          return { text: `📘 Özel notlar sayesinde sınavdan 95 aldın! OBP puanın **${G.obpScore}** oldu.`, type: 'good' };
        }
      },
      {
        label: '💪 Kendi Başımın Çaresine Bakarım',
        effect: (G, c) => {
          const gain = Math.random() < 0.5 ? 2 : -2;
          G.obpScore = clamp(G.obpScore + gain, 50, 100);
          return { text: `✏️ Kendi bilginle sınava girdin. OBP: **${G.obpScore}**.`, type: 'normal' };
        }
      }
    ]
  },

  // ÜNİVERSİTE VE GENÇLİK YILLARI (18 - 25 YAŞ)
  {
    id: 'intercity_bus_trip',
    minAge: 18, maxAge: 26,
    badge: '🚌 Şehirlerarası Otobüs Yolculuğu',
    title: 'Otogarda Gece Seferi Rötarı',
    desc: 'Gece otobüsüyle şehir dışına çıkarken otobüs perona 2 saat geç yanaştı ve koltuğunun başkasına da satıldığını gördün!',
    choices: [
      {
        label: '🎫 Yazıhaneye Gidip VIP Koltuk + İade Talep Et',
        effect: (G, c) => {
          const refund = Math.round(c.monthlyMinWage * 0.12);
          G.money += refund;
          G.happy = clamp(G.happy + 6);
          return { text: `🚌 Hakkını aradın! Seni bir sonraki 2+1 VIP otobüse aldılar ve **+${fmtMoney(refund)}** bilet iadesi yaptılar.`, type: 'good' };
        }
      },
      {
        label: '😤 Muavinle Tartış',
        effect: (G, c) => {
          G.stress = clamp((G.stress || 0) + 10);
          G.happy = clamp(G.happy - 6);
          return { text: '😤 Otogarda sinirlerin gerildi, arka dörtlüde sıkışık bir yolculuk yaptın.', type: 'bad' };
        }
      },
      {
        label: '🎧 Kulaklığı Takıp Boş Koltuğa Geç',
        effect: (G, c) => {
          G.stress = clamp((G.stress || 0) - 4);
          return { text: '🎧 Hiç stres yapmadan boş bir cam kenarına geçip yol boyu müzik dinledin.', type: 'normal' };
        }
      }
    ]
  },
  {
    id: 'erasmus_opportunity',
    minAge: 19, maxAge: 24,
    onlyUni: true,
    badge: '🌍 Üniversite & Erasmus',
    title: 'Yurt Dışı Staj ve Değişim Programı',
    desc: 'Bölüm başkanlığı Avrupa’da 1 dönemlik değişim ve lojistik/teknoloji stajı için başvuru açtı. Katılım için cep harçlığı gerekiyor.',
    choices: [
      {
        label: '✈️ Başvur ve Git (+Zeka, +Ün, +Deneyim)',
        effect: (G, c) => {
          const cost = Math.round(c.monthlyMinWage * 0.8);
          if (G.money < cost) return { text: '💸 Cep harçlığın yetmediği için programa katılamadın.', type: 'bad' };
          G.money -= cost;
          G.smart = clamp(G.smart + 9);
          G.happy = clamp(G.happy + 14);
          G.jobExp += 1;
          return { text: '🌍 Yurt dışı stajında yabancı dilini geliştirdin ve +1 yıl iş deneyimi kazandın!', type: 'milestone' };
        }
      },
      {
        label: '🏠 Ülkede Kalıp Derslere Odaklan',
        effect: (G, c) => {
          G.smart = clamp(G.smart + 3);
          return { text: '📚 Dönemi kendi kampüsünde sakin şekilde tamamladın.', type: 'normal' };
        }
      }
    ]
  },

  // YETİŞKİN, TRAFİK, SANAYİ VE TİCARET OLAYLARI (20 - 65 YAŞ)
  {
    id: 'traffic_fender_bender',
    minAge: 19, maxAge: 65,
    requiresCar: true,
    badge: '🚘 Trafik & Kaza Tutanağı',
    title: 'Kavşakta Arkadan Çarpma Vakası',
    desc: 'Yoğun trafikte arkandaki sürücü dalgınlıkla tamponuna çarptı. Sürücü "Sigortam bozulmasın, tutanak tutmayalım sana elden nakit vereyim" diyor.',
    choices: [
      {
        label: '💵 Elden Nakit Al ve Sanayide Tanıdığa Yaptır',
        effect: (G, c) => {
          const cash = Math.round(c.monthlyMinWage * 0.9);
          const fix = Math.round(c.monthlyMinWage * 0.45);
          G.money += (cash - fix);
          return { text: `🔧 Sürücüden **${fmtMoney(cash)}** aldın, sanayide tanıdık ustaya **${fmtMoney(fix)}** verip tamponu boyattın. Cebine net **+${fmtMoney(cash - fix)}** kaldı!`, type: 'good' };
        }
      },
      {
        label: '📝 Resmi Kaza Tutanağı Tut (Yetkili Servis)',
        effect: (G, c) => {
          return { text: '📝 Kaza tutanağını tuttunuz, karşı tarafın trafik sigortası yetkili serviste aracını orijinal parçayla onardı.', type: 'good' };
        }
      }
    ]
  },
  {
    id: 'customs_container_crisis',
    minAge: 21, maxAge: 62,
    badge: '🚢 Gümrük & Lojistik Fırsatı',
    title: 'Limanda Sahipsiz Kalan İthalat Konteyneri',
    desc: 'Gümrük antreposunda bekleyen elektronik ve tekstil dolu bir konteyner ihale yoluyla satışa çıkarıldı. İçinden servet de çıkabilir, arızalı ürün de!',
    choices: [
      {
        label: '📦 İhaleye Gir ve Konteyneri Satın Al (1.8x Maaş)',
        effect: (G, c) => {
          const cost = Math.round(c.monthlyMinWage * 1.8);
          if (G.money < cost) return { text: '💸 İhale teminatı için nakitin yetmedi.', type: 'bad' };
          G.money -= cost;
          if (Math.random() < 0.6) {
            const revenue = Math.round(cost * 2.8);
            G.money += revenue;
            return { text: `🚢 Konteynerin içinden sıfır kutulu ürünler çıktı! Toptancılara satıp **+${fmtMoney(revenue)}** ciro yaptın!`, type: 'good' };
          } else {
            const salvage = Math.round(cost * 0.4);
            G.money += salvage;
            return { text: `📉 Ürünlerin çoğu nemden zarar görmüş çıktı. Hurda fiyatına **${fmtMoney(salvage)}** kurtarabildin.`, type: 'bad' };
          }
        }
      },
      {
        label: '🛑 İhaleye Girmeden Uzaktan İzle',
        effect: (G, c) => {
          return { text: '🛑 Kapalı kutu konteyner riskine girmedin.', type: 'normal' };
        }
      }
    ]
  },
  {
    id: 'scam_call_alert',
    minAge: 20, maxAge: 75,
    badge: '📱 Siber Dolandırıcılık Girişimi',
    title: 'Kendini Savcı / Bankacı Tanıtan Şüpheli Arama',
    desc: 'Telefonda kendini üst düzey yetkili olarak tanıtan biri, hesabının terör/suç örgütlerince ele geçirildiğini söyleyip doğrulama kodunu istiyor!',
    choices: [
      {
        label: '🧠 Oyuna Gelme ve Siber Suçlara İhbar Et',
        effect: (G, c) => {
          const reward = Math.round(c.monthlyMinWage * 0.5);
          G.money += reward;
          G.smart = clamp(G.smart + 3);
          return { text: `🚓 Dolandırıcıları oyalayıp polise yakalattın! Emniyetten **+${fmtMoney(reward)}** ihbar ödülü aldın.`, type: 'good' };
        }
      },
      {
        label: '😰 Panik Yapıp Kodu Söyle',
        effect: (G, c) => {
          const stolen = Math.max(0, Math.round(G.money * 0.35));
          G.money -= stolen;
          G.happy = clamp(G.happy - 18);
          return { text: `🚨 Dolandırıcılara kodu verdin! Hesabından **-${fmtMoney(stolen)}** çekildi.`, type: 'bad' };
        }
      }
    ]
  },
  {
    id: 'relative_loan_request',
    minAge: 22, maxAge: 65,
    badge: '👨‍👩‍👦 Akraba Krizi',
    title: 'Uzak Akrabadan "Çok Acil" Borç İsteği',
    desc: 'Yıllardır aramayan bir kuzenin "Çok sağlam bir ticaret var, 1 aya iki katıyla ödeyeceğim" diyerek senden borç istiyor.',
    choices: [
      {
        label: '💸 Borç Ver (1.2x Asgari Ücret)',
        effect: (G, c) => {
          const loan = Math.round(c.monthlyMinWage * 1.2);
          if (G.money < loan) return { text: '💸 Verecek nakitin olmadığını söyledin.', type: 'normal' };
          G.money -= loan;
          if (Math.random() < 0.3) {
            const back = Math.round(loan * 1.5);
            G.money += back;
            return { text: `🤝 Şaşırtıcı şekilde kuzenin sözünü tuttu ve **+${fmtMoney(back)}** olarak geri ödedi!`, type: 'good' };
          } else {
            return { text: `📵 Kuzenin parayı aldıktan sonra telefon numarasını değiştirdi! **-${fmtMoney(loan)}** gitti.`, type: 'bad' };
          }
        }
      },
      {
        label: '🙅‍♂️ "Ben de Kredi Ödüyorum" Deyip Reddet',
        effect: (G, c) => {
          return { text: '🛡️ Politik bir bahaneyle paranı cebinde tuttun.', type: 'good' };
        }
      }
    ]
  },
  {
    id: 'museum_historical_find',
    minAge: 18, maxAge: 70,
    badge: '🏛️ Kültür & Doğa Gezisi',
    title: 'Tarihi Ören Yeri Yakınında Sikke Buldun',
    desc: 'Hafta sonu gezisinde toprağın yüzeyinde parlayan antik dönemden kalma bir kese gümüş sikke fark ettin!',
    choices: [
      {
        label: '🏛️ Müze Müdürlüğüne Teslim Et (Yasal Ödül)',
        effect: (G, c) => {
          const bonus = Math.round(c.monthlyMinWage * 2.5);
          G.money += bonus;
          G.fame = clamp(G.fame + 8);
          return { text: `🏛️ Eserleri müzeye teslim ettin! Kültür Bakanlığı sana **+${fmtMoney(bonus)}** ikramiye verdi ve gazetelere çıktın.`, type: 'fame' };
        }
      },
      {
        label: '🕶️ Karaborsada Koleksiyoncuya Satmayı Dene (Riskli)',
        effect: (G, c) => {
          if (Math.random() < 0.45) {
            const blackMoney = Math.round(c.monthlyMinWage * 6.5);
            G.dirtyMoney = (G.dirtyMoney || 0) + blackMoney;
            return { text: `🕶️ Antikaları gizlice satıp **+${fmtMoney(blackMoney)} Kara Para** elde ettin.`, type: 'good' };
          } else {
            const fine = Math.round(c.monthlyMinWage * 3.0);
            G.money -= fine;
            G.criminalRecord = true;
            return { text: `🚨 Alıcı sivil jandarma çıktı! Tarihi eser kaçakçılığından **-${fmtMoney(fine)}** ceza yedin ve sicilin bozuldu.`, type: 'bad' };
          }
        }
      }
    ]
  },
  {
    id: 'headhunter_offer',
    minAge: 23, maxAge: 58,
    requiresJob: true,
    badge: '💼 Kariyer & Transfer',
    title: 'Rakip Şirketten Transfer Teklifi',
    desc: 'Sektördeki başarını duyan rakip bir firma, mevcut işinden ayrılıp kendilerine geçmen için imza primi teklif ediyor.',
    choices: [
      {
        label: '✍️ Teklifi Kabul Et (+İmza Primi & Kıdem)',
        effect: (G, c) => {
          const bonus = Math.round(c.monthlyMinWage * 3.0);
          G.money += bonus;
          G.jobExp += 2;
          return { text: `🚀 Rakip şirkete transfer olarak **+${fmtMoney(bonus)}** imza parası ve +2 yıl kıdem kazandın!`, type: 'milestone' };
        }
      },
      {
        label: '🏢 Mevcut Şirketinle Maaş Pazarlığı Yap',
        effect: (G, c) => {
          const raiseBonus = Math.round(c.monthlyMinWage * 1.6);
          G.money += raiseBonus;
          G.happy = clamp(G.happy + 6);
          return { text: `🤝 Şirketin seni kaybetmemek için **+${fmtMoney(raiseBonus)}** sadakat primi ödedi.`, type: 'good' };
        }
      }
    ]
  }
];
