/* ============================================================================
   1 IN 8 BILLION ULTIMATE — BİRLEŞTİRİLMİŞ VERİTABANI (data.js)
   ============================================================================ */

const COUNTRIES = [
  { id: 'TR', name: 'Türkiye', flag: '🇹🇷', currency: '₺', code: 'TRY', monthlyMinWage: 22000, monthlyLivingCost: 14800, taxRate: 0.20, inflation: 0.32, carTaxMultiplier: 2.1, houseMultiplier: 140, uniPublicFee: 0, uniPrivateFee: 290000, militaryAge: 20, paidMilitaryCost: 240000, desc: 'YKS sıralaması, KYK/Burs sistemi, yüksek enflasyon (%32), ÖTV ve bedelli askerlik.', namesM: ['Çağatay', 'Çağrı', 'Kerem', 'Arda', 'Mert', 'Kaan', 'Emir', 'Burak', 'Efe', 'Barış'], namesF: ['Zeynep', 'Elif', 'Defne', 'Selin', 'Ece', 'Aslı', 'Duru', 'Melis', 'Azra', 'Yağmur'], lastNames: ['Kılıç', 'Yılmaz', 'Demir', 'Çelik', 'Kaya', 'Şahin', 'Yıldız', 'Öztürk', 'Aydın', 'Arslan'] },
  { id: 'US', name: 'ABD', flag: '🇺🇸', currency: '$', code: 'USD', monthlyMinWage: 2400, monthlyLivingCost: 1750, taxRate: 0.22, inflation: 0.03, carTaxMultiplier: 0.9, houseMultiplier: 120, uniPublicFee: 14000, uniPrivateFee: 45000, militaryAge: null, paidMilitaryCost: 0, desc: 'Düşük enflasyon (%3), yüksek maaşlar, pahalı sağlık ve üniversite kredileri.', namesM: ['Liam', 'Noah', 'Ethan', 'Mason', 'Lucas', 'Logan', 'James', 'Alex'], namesF: ['Olivia', 'Emma', 'Sophia', 'Mia', 'Chloe', 'Harper', 'Ava', 'Lily'], lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Miller', 'Davis', 'Wilson', 'Anderson'] },
  { id: 'DE', name: 'Almanya', flag: '🇩🇪', currency: '€', code: 'EUR', monthlyMinWage: 2150, monthlyLivingCost: 1400, taxRate: 0.30, inflation: 0.025, carTaxMultiplier: 0.95, houseMultiplier: 130, uniPublicFee: 0, uniPrivateFee: 12000, militaryAge: null, paidMilitaryCost: 0, desc: 'Ücretsiz devlet üniversiteleri, güçlü lojistik/mühendislik pazarı ve sağlam Euro ekonomisi.', namesM: ['Lukas', 'Leon', 'Finn', 'Jonas', 'Felix', 'Maximilian', 'Paul'], namesF: ['Mia', 'Hannah', 'Emilia', 'Sophia', 'Lina', 'Lea', 'Clara'], lastNames: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner'] },
  { id: 'SA', name: 'Suudi Arabistan', flag: '🇸🇦', currency: '﷼', code: 'SAR', monthlyMinWage: 4500, monthlyLivingCost: 2600, taxRate: 0.0, inflation: 0.02, carTaxMultiplier: 0.85, houseMultiplier: 100, uniPublicFee: 0, uniPrivateFee: 42000, militaryAge: null, paidMilitaryCost: 0, desc: '%0 gelir vergisi, ucuz benzin/otomobil, geleneksel kurallar ve erken evlilik baskısı.', namesM: ['Mohammed', 'Fahad', 'Abdullah', 'Salman', 'Khalid', 'Omar', 'Tariq'], namesF: ['Fatima', 'Noor', 'Aisha', 'Layla', 'Maryam', 'Sara', 'Reem'], lastNames: ['Al-Saud', 'Al-Qahtani', 'Al-Otaibi', 'Al-Ghamdi', 'Al-Harbi', 'Al-Zahrani'] },
  { id: 'AE', name: 'Birleşik Arap Emirlikleri', flag: '🇦🇪', currency: 'د.إ', code: 'AED', monthlyMinWage: 6500, monthlyLivingCost: 4200, taxRate: 0.0, inflation: 0.025, carTaxMultiplier: 0.8, houseMultiplier: 135, uniPublicFee: 18000, uniPrivateFee: 65000, militaryAge: null, paidMilitaryCost: 0, desc: 'Dubai lüks yaşamı, %0 gelir vergisi, vergisiz süper otomobiller ve global ticaret.', namesM: ['Rashid', 'Hamdan', 'Zayed', 'Saeed', 'Majid', 'Sultan'], namesF: ['Amna', 'Hessa', 'Latifa', 'Shamma', 'Mariam', 'Noura'], lastNames: ['Al-Maktoum', 'Al-Nahyan', 'Al-Mazrouei', 'Al-Suwaidi', 'Al-Nuaimi'] },
  { id: 'GB', name: 'İngiltere', flag: '🇬🇧', currency: '£', code: 'GBP', monthlyMinWage: 1950, monthlyLivingCost: 1380, taxRate: 0.25, inflation: 0.035, carTaxMultiplier: 1.0, houseMultiplier: 145, uniPublicFee: 9250, uniPrivateFee: 24000, militaryAge: null, paidMilitaryCost: 0, desc: 'Güçlü Sterlin kuru, Premier Lig futbol merkezi ve ücretsiz NHS sağlık sistemi.', namesM: ['Oliver', 'George', 'Harry', 'Arthur', 'Charlie', 'Jack'], namesF: ['Amelia', 'Isla', 'Ava', 'Freya', 'Poppy', 'Charlotte'], lastNames: ['Taylor', 'Davies', 'Evans', 'Thomas', 'Roberts', 'Walker'] },
  { id: 'NO', name: 'Norveç', flag: '🇳🇴', currency: 'kr', code: 'NOK', monthlyMinWage: 28000, monthlyLivingCost: 17500, taxRate: 0.34, inflation: 0.03, carTaxMultiplier: 1.2, houseMultiplier: 120, uniPublicFee: 0, uniPrivateFee: 95000, militaryAge: null, paidMilitaryCost: 0, desc: 'İskandinav refah devleti, ücretsiz eğitim ve yüksek yaşam kalitesi.', namesM: ['Jakob', 'Emil', 'Noah', 'Oliver', 'Filip', 'Henrik'], namesF: ['Nora', 'Emma', 'Sofie', 'Olivia', 'Ella', 'Maja'], lastNames: ['Hansen', 'Johansen', 'Olsen', 'Larsen', 'Andersen', 'Pedersen'] },
  { id: 'JP', name: 'Japonya', flag: '🇯🇵', currency: '¥', code: 'JPY', monthlyMinWage: 210000, monthlyLivingCost: 145000, taxRate: 0.23, inflation: 0.02, carTaxMultiplier: 0.95, houseMultiplier: 135, uniPublicFee: 540000, uniPrivateFee: 1350000, militaryAge: null, paidMilitaryCost: 0, desc: 'Düşük enflasyon, yüksek teknoloji, uzun ömür ve yoğun çalışma kültürü.', namesM: ['Haruto', 'Ren', 'Sota', 'Yuto', 'Riku', 'Kenji'], namesF: ['Yui', 'Hina', 'Aoi', 'Sakura', 'Rin', 'Mio'], lastNames: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito'] },
  { id: 'KR', name: 'Güney Kore', flag: '🇰🇷', currency: '₩', code: 'KRW', monthlyMinWage: 2200000, monthlyLivingCost: 1450000, taxRate: 0.22, inflation: 0.03, carTaxMultiplier: 1.0, houseMultiplier: 155, uniPublicFee: 4500000, uniPrivateFee: 9500000, militaryAge: 20, paidMilitaryCost: 0, desc: 'Zorlu üniversite sınavı, zorunlu askerlik, E-Spor şampiyonlukları ve fenomenlik merkezi.', namesM: ['Min-jun', 'Seo-jun', 'Do-yun', 'Ji-ho', 'Joon-ho'], namesF: ['Seo-yeon', 'Ji-woo', 'Ha-yoon', 'Min-seo', 'Soo-jin'], lastNames: ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang'] },
  { id: 'RU', name: 'Rusya', flag: '🇷🇺', currency: '₽', code: 'RUB', monthlyMinWage: 45000, monthlyLivingCost: 31000, taxRate: 0.13, inflation: 0.09, carTaxMultiplier: 1.25, houseMultiplier: 120, uniPublicFee: 0, uniPrivateFee: 260000, militaryAge: 19, paidMilitaryCost: 450000, desc: '%13 sabit gelir vergisi, enerji/hammadde ticareti ve zorunlu askerlik.', namesM: ['Alexander', 'Maxim', 'Dmitry', 'Ivan', 'Artem', 'Mikhail'], namesF: ['Sofia', 'Anna', 'Maria', 'Victoria', 'Alisa', 'Polina'], lastNames: ['Ivanov', 'Smirnov', 'Kuznetsov', 'Popov', 'Sokolov', 'Lebedev'] },
  { id: 'BR', name: 'Brezilya', flag: '🇧🇷', currency: 'R$', code: 'BRL', monthlyMinWage: 1850, monthlyLivingCost: 1350, taxRate: 0.18, inflation: 0.07, carTaxMultiplier: 1.35, houseMultiplier: 115, uniPublicFee: 0, uniPrivateFee: 24000, militaryAge: null, paidMilitaryCost: 0, desc: 'Futbol akademisi yetenek havuzu, renkli yaşam ve dinamik pazar.', namesM: ['Miguel', 'Arthur', 'Heitor', 'Gabriel', 'Lucas', 'Matheus'], namesF: ['Helena', 'Alice', 'Laura', 'Valentina', 'Julia', 'Isabella'], lastNames: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira'] },
  { id: 'NG', name: 'Nijerya', flag: '🇳🇬', currency: '₦', code: 'NGN', monthlyMinWage: 85000, monthlyLivingCost: 65000, taxRate: 0.15, inflation: 0.26, carTaxMultiplier: 1.4, houseMultiplier: 105, uniPublicFee: 120000, uniPrivateFee: 950000, militaryAge: null, paidMilitaryCost: 0, desc: 'Yüksek enflasyon (%26), zorlu altyapı ama hızlı büyüyen girişimcilik fırsatları.', namesM: ['Chinedu', 'Emeka', 'Tunde', 'Oluwaseun', 'Ibrahim', 'Musa'], namesF: ['Amina', 'Ngozi', 'Chioma', 'Zainab', 'Funke', 'Adaeze'], lastNames: ['Okafor', 'Adeyemi', 'Balogun', 'Abubakar', 'Eze', 'Nwosu'] }
];

const UNI_MAJORS = [
  { id: 'tip', name: 'Tıp Fakültesi', minScore: 465, rankText: 'İlk 15.000', years: 6, icon: '🩺' },
  { id: 'havacilik', name: 'Sivil Havacılık & Pilotaj', minScore: 455, rankText: 'İlk 22.000', years: 4, icon: '✈️' },
  { id: 'yazilim', name: 'Bilgisayar & Yazılım Müh.', minScore: 440, rankText: 'İlk 35.000', years: 4, icon: '💻' },
  { id: 'hukuk', name: 'Hukuk Fakültesi', minScore: 420, rankText: 'İlk 55.000', years: 4, icon: '⚖️' },
  { id: 'mimarlik', name: 'Mimarlık & Şehir Planlama', minScore: 410, rankText: 'İlk 70.000', years: 4, icon: '📐' },
  { id: 'endustri', name: 'Makine & Endüstri Müh.', minScore: 400, rankText: 'İlk 85.000', years: 4, icon: '⚙️' },
  { id: 'denizcilik', name: 'Deniz Ulaştırma & Gemi İşletme Müh.', minScore: 390, rankText: 'İlk 95.000', years: 4, icon: '⚓' },
  { id: 'lojistik', name: 'Uluslararası Lojistik ve Tedarik Zinciri', minScore: 360, rankText: 'İlk 160.000', years: 4, icon: '🚢' },
  { id: 'isletme', name: 'İşletme, İktisat & Siyaset Bilimi', minScore: 345, rankText: 'İlk 210.000', years: 4, icon: '📈' },
  { id: 'hemsirelik', name: 'Hemşirelik & Sağlık Bilimleri', minScore: 330, rankText: 'İlk 250.000', years: 4, icon: '🏥' },
  { id: 'egitim', name: 'Eğitim Fakültesi (Öğretmenlik)', minScore: 315, rankText: 'İlk 300.000', years: 4, icon: '📚' },
  { id: 'medya', name: 'Yeni Medya, İletişim & Sinema', minScore: 285, rankText: 'İlk 450.000', years: 4, icon: '🎬' }
];

const PART_TIME_JOBS = [
  { id: 'pt_kutuphane', title: 'Üniversite Kütüphane Asistanı (Part-Time)', mult: 0.40, icon: '📚' },
  { id: 'pt_barista', title: 'Kampüs Kafe Baristası (Part-Time)', mult: 0.45, icon: '☕' },
  { id: 'pt_stajyer', title: 'Lojistik / Ofis Stajyeri (Part-Time)', mult: 0.55, icon: '📋' },
  { id: 'pt_oto_yikama', title: 'Hafta Sonu Oto Detailing (Part-Time)', mult: 0.58, icon: '🧽' },
  { id: 'pt_kurye', title: 'Akşam Vardiyası Kurye (Part-Time)', mult: 0.65, reqLic: 'B', icon: '🛵' }
];

const JOBS = [
  { id: 'garson', title: 'Kafe Garsonu / Barista', reqEdu: 'none', mult: 1.05, stress: 4, icon: '☕' },
  { id: 'depo', title: 'Lojistik Depo & Sevkiyat Personeli', reqEdu: 'none', mult: 1.25, stress: 6, icon: '📦' },
  { id: 'kurye', title: 'Motorlu Kurye', reqEdu: 'none', reqLicense: 'B', mult: 1.75, stress: 7, icon: '🛵' },
  { id: 'taksi', title: 'Şehir İçi Taksi / Uber Şoförü', reqEdu: 'none', reqLicense: 'B', mult: 2.0, stress: 7, icon: '🚕' },
  { id: 'sanayi_usta', title: 'Oto Sanayi Motor & Kaporta Ustası', reqEdu: 'none', mult: 2.35, stress: 7, icon: '🔧' },
  { id: 'tir_soforu', title: 'Uluslararası Tır Şoförü', reqEdu: 'none', reqLicense: 'CE', mult: 3.4, stress: 9, icon: '🚛' },

  { id: 'satis', title: 'Mağaza Satış Danışmanı', reqEdu: 'highschool', mult: 1.3, stress: 5, icon: '🛍️' },
  { id: 'gumruk_musavir_yrd', title: 'Gümrük Müşavir Yardımcısı', reqEdu: 'highschool', cleanRecord: true, mult: 2.1, stress: 6, icon: '🛃' },
  { id: 'polis', title: 'Polis Memuru', reqEdu: 'highschool', cleanRecord: true, mult: 2.55, stress: 10, icon: '🚓' },
  { id: 'otobus_kaptan', title: 'Şehirlerarası Otobüs Kaptanı', reqEdu: 'highschool', reqLicense: 'CE', mult: 2.85, stress: 9, icon: '🚌' },
  { id: 'vinc_op', title: 'Liman Konteyner Vinç Operatörü', reqEdu: 'highschool', reqLicense: 'CE', mult: 3.10, stress: 8, icon: '🏗️' },

  { id: 'lojistik_uzman', title: 'Lojistik ve Operasyon Uzmanı', reqEdu: 'uni', major: 'lojistik', mult: 2.5, stress: 6, icon: '🚢' },
  { id: 'gumruk_sef', title: 'Gümrük Operasyon & Mevzuat Şefi', reqEdu: 'uni', major: 'lojistik', minExp: 2, cleanRecord: true, mult: 3.8, stress: 8, icon: '🛃' },
  { id: 'tedarik_mudur', title: 'Tedarik Zinciri & Filo Müdürü', reqEdu: 'uni', major: 'lojistik', minExp: 3, mult: 4.6, stress: 8, icon: '🌐' },
  { id: 'liman_mudur', title: 'Uluslararası Konteyner Liman Müdürü', reqEdu: 'uni', major: 'lojistik', minExp: 5, cleanRecord: true, mult: 6.4, stress: 9, icon: '🚢' },
  { id: 'global_lojistik_dir', title: 'Global Lojistik Direktörü (COO)', reqEdu: 'uni', major: 'lojistik', minExp: 7, mult: 8.2, stress: 10, icon: '✈️' },

  { id: 'pratisyen', title: 'Pratisyen Hekim', reqEdu: 'uni', major: 'tip', cleanRecord: true, mult: 4.2, stress: 10, icon: '🩺' },
  { id: 'cerrah', title: 'Uzman Cerrah', reqEdu: 'uni', major: 'tip', cleanRecord: true, minExp: 4, mult: 7.5, stress: 12, icon: '🫀' },
  { id: 'bashekim', title: 'Özel Hastane Başhekimi', reqEdu: 'uni', major: 'tip', cleanRecord: true, minExp: 8, mult: 12.0, stress: 10, icon: '🏥' },

  { id: 'jr_dev', title: 'Junior Yazılım Geliştirici', reqEdu: 'uni', major: 'yazilim', mult: 2.8, stress: 6, icon: '💻' },
  { id: 'siber_uzman', title: 'Siber Güvenlik & Beyaz Şapkalı Hacker', reqEdu: 'uni', major: 'yazilim', minExp: 2, cleanRecord: true, mult: 4.9, stress: 8, icon: '🛡️' },
  { id: 'sr_dev', title: 'Senior Full-Stack Mühendisi', reqEdu: 'uni', major: 'yazilim', minExp: 3, mult: 5.8, stress: 8, icon: '🖥️' },
  { id: 'cto', title: 'Teknoloji Direktörü (CTO)', reqEdu: 'uni', major: 'yazilim', minExp: 7, mult: 10.5, stress: 10, icon: '🚀' },

  { id: 'avukat', title: 'Baro Avukatı', reqEdu: 'uni', major: 'hukuk', cleanRecord: true, mult: 3.1, stress: 8, icon: '⚖️' },
  { id: 'savci', title: 'Cumhuriyet Savcısı / Hakim', reqEdu: 'uni', major: 'hukuk', cleanRecord: true, minExp: 3, mult: 5.2, stress: 11, icon: '🏛️' },
  { id: 'hukuk_ortak', title: 'Uluslararası Hukuk Bürosu Ortağı', reqEdu: 'uni', major: 'hukuk', cleanRecord: true, minExp: 7, mult: 9.8, stress: 10, icon: '💼' },

  { id: 'gemi_zabit', title: 'Uzakyol Vardiya Zabiti', reqEdu: 'uni', major: 'denizcilik', mult: 4.5, stress: 8, icon: '🛳️' },
  { id: 'gemi_kaptan', title: 'Uzakyol Süvari (Gemi Kaptanı)', reqEdu: 'uni', major: 'denizcilik', minExp: 5, mult: 9.2, stress: 10, icon: '⚓' },
  { id: 'first_officer', title: 'Havayolu Yardımcı Pilotu (First Officer)', reqEdu: 'uni', major: 'havacilik', cleanRecord: true, mult: 6.5, stress: 9, icon: '🛫' },
  { id: 'kaptan_pilot', title: 'Kıdemli Kaptan Pilot', reqEdu: 'uni', major: 'havacilik', minExp: 5, cleanRecord: true, mult: 13.5, stress: 11, icon: '👨‍✈️' },
  { id: 'santiye_mimar', title: 'Proje & Şantiye Mimarı', reqEdu: 'uni', major: 'mimarlik', mult: 3.0, stress: 7, icon: '📐' },
  { id: 'bas_mimar', title: 'Baş Mimar & Kentsel Dönüşüm Müteahhidi', reqEdu: 'uni', major: 'mimarlik', minExp: 5, mult: 7.8, stress: 9, icon: '🏙️' },

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
  { id: 'fleet_king', title: 'Lojistik İmparatoru', desc: 'Şirket filonu 5 ve üzeri araca/ekipmana çıkardın.', icon: '🚛' },
  { id: 'captain_sky', title: 'Gökyüzü Hakimi', desc: 'Kıdemli Kaptan Pilot unvanına ulaştın.', icon: '👨‍✈️' },
  { id: 'sea_wolf', title: 'Denizlerin Kurdu', desc: 'Uzakyol Gemi Kaptanı veya Gemi Acentesi sahibi oldun.', icon: '⚓' },
  { id: 'real_estate_mogul', title: 'Emlak Baronu', desc: 'Aynı anda 5 veya daha fazla gayrimenkule sahip oldun.', icon: '🏰' },
  { id: 'wolf_of_borsa', title: 'Borsa Kurdu', desc: 'Yatırım portföyünü asgari ücretin 40 katına çıkardın.', icon: '📊' },
  { id: 'super_parent', title: 'Örnek Ebeveyn', desc: 'Çocuğunun zeka ve mutluluğunu %90 üzerine taşıdın.', icon: '👨‍👧‍👦' }
];

const CARS = [
  { id: 'scooter', name: '125cc Kurye Motosikleti', cat: 'Ekonomik', baseMinWages: 4.5, reqLic: 'B', icon: '🛵', prestige: 3 },
  { id: 'tofas', name: '98 Klasik Sedan', cat: 'Ekonomik', baseMinWages: 11, reqLic: 'B', icon: '🚗', prestige: 5 },
  { id: 'doblo', name: 'Fiat Doblo Combi 1.6 Multijet', cat: 'Ekonomik & Ticari', baseMinWages: 28, reqLic: 'B', icon: '🚐', prestige: 10 },
  { id: 'egea', name: 'Fiat Egea Sedan 1.6 Multijet', cat: 'Binek Sıfır', baseMinWages: 38, reqLic: 'B', icon: '🚘', prestige: 15 },
  { id: 'egea_cross', name: 'Fiat Egea Cross Lounge (Özel Panjur)', cat: 'Binek Sıfır', baseMinWages: 44, reqLic: 'B', icon: '🚗', prestige: 17 },
  { id: 'corolla', name: 'Toyota Corolla Hybrid', cat: 'Binek Sıfır', baseMinWages: 52, reqLic: 'B', icon: '🚙', prestige: 18 },
  { id: 'togg', name: 'Togg T10X V2 Uzun Menzil', cat: 'Binek Sıfır', baseMinWages: 64, reqLic: 'B', icon: '⚡', prestige: 25 },
  { id: 'transporter', name: 'VW Transporter VIP Özel Yapım', cat: 'Ticari & VIP', baseMinWages: 76, reqLic: 'B', icon: '🚐', prestige: 28 },
  { id: 'passat', name: 'Volkswagen Passat 2.0 TDI Elegance', cat: 'Binek & Makam', baseMinWages: 88, reqLic: 'B', icon: '🚘', prestige: 34 },
  { id: 'bmw320', name: 'BMW 320i M Sport', cat: 'Lüks & Spor', baseMinWages: 115, reqLic: 'B', icon: '🏎️', prestige: 38 },
  { id: 'volvo_fh16', name: 'Volvo FH16 750 Çekici Tır', cat: 'Ticari Ağır Vasıta', baseMinWages: 180, reqLic: 'CE', icon: '🚛', prestige: 30 },
  { id: 'scania_s730', name: 'Scania S730 V8 Uzun Yol Çekici Tır', cat: 'Ticari Ağır Vasıta', baseMinWages: 210, reqLic: 'CE', icon: '🚛', prestige: 36 },
  { id: 'g63', name: 'Mercedes-AMG G63', cat: 'Lüks & Spor', baseMinWages: 340, reqLic: 'B', icon: '🚙', prestige: 65 },
  { id: 'porsche911', name: 'Porsche 911 Turbo S', cat: 'Lüks & Spor', baseMinWages: 420, reqLic: 'B', icon: '🏁', prestige: 80 },
  { id: 'ferrari_f8', name: 'Ferrari F8 Tributo', cat: 'Süper Lüks', baseMinWages: 540, reqLic: 'B', icon: '🏎️', prestige: 90 },
  { id: 'maybach', name: 'Mercedes-Maybach S680 Makam Aracı', cat: 'Ultra Lüks', baseMinWages: 620, reqLic: 'B', icon: '🎩', prestige: 95 }
];

const HOUSES = [
  { id: 'ogrenci_apart', name: 'Üniversite Yakını 1+0 Yatırımlık Apart', baseMinWages: 60, rentYield: 0.072, icon: '🏬', happy: 6 },
  { id: 'studio', name: '1+1 Şehir İçi Stüdyo Daire', baseMinWages: 85, rentYield: 0.06, icon: '🏢', happy: 8 },
  { id: 'apt31', name: '3+1 Güvenlikli Site Dairesi', baseMinWages: 175, rentYield: 0.055, icon: '🏘️', happy: 15 },
  { id: 'lojistik_depo', name: 'Gümrük Yanı Kiralık Lojistik Antrepo', baseMinWages: 320, rentYield: 0.068, icon: '🏭', happy: 18 },
  { id: 'villa', name: 'Müstakil Havuzlu Villa', baseMinWages: 480, rentYield: 0.05, icon: '🏡', happy: 28 },
  { id: 'penthouse', name: 'Rezidans 40. Kat Penthouse', baseMinWages: 790, rentYield: 0.048, icon: '🌆', happy: 36 },
  { id: 'mansion', name: 'Boğaz / Deniz Manzaralı Yalı', baseMinWages: 1450, rentYield: 0.045, icon: '🏰', happy: 45 }
];

const BUSINESS_TYPES = [
  { id: 'cafe', name: '3. Nesil Kahve & Kruvasan Dükkanı', costMinWages: 35, baseProfitMult: 2.2, unitName: 'Şube Ekipmanı', icon: '☕' },
  { id: 'oto_servis', name: 'Oto Ekspertiz, Kaporta & Bakım Servisi', costMinWages: 45, baseProfitMult: 3.1, unitName: 'Servis Lifti', icon: '🔧' },
  { id: 'eticaret', name: 'E-Ticaret & Dropshipping Deposu', costMinWages: 55, baseProfitMult: 3.6, unitName: 'Kargo Bandı', icon: '📦' },
  { id: 'otobus_firma', name: 'Şehirlerarası Otobüs & Turizm Firması', costMinWages: 135, baseProfitMult: 7.8, unitName: 'Yolcu Otobüsü', icon: '🚌' },
  { id: 'lojistik_filo', name: 'Uluslararası Lojistik & Tır Filosu', costMinWages: 160, baseProfitMult: 9.5, unitName: 'Çekici Tır', icon: '🚢' },
  { id: 'tech_startup', name: 'Yapay Zeka & SaaS Teknoloji Şirketi', costMinWages: 240, baseProfitMult: 15.0, unitName: 'Sunucu Kümesi', icon: '🤖' },
  { id: 'deniz_acente', name: 'Uluslararası Konteyner & Gemi Acentesi', costMinWages: 310, baseProfitMult: 19.5, unitName: 'Kargo Gemisi', icon: '🛳️' }
];

const MARKET_ASSETS_META = {
  gold: { key: 'gold', name: 'Gram Altın', ticker: 'XAU/TRY', icon: '🪙', risk: 'Düşük Risk • Enflasyon Korumalı', basePrice: 2850, minChange: 2, maxChange: 15 },
  forex: { key: 'forex', name: 'Döviz Sepeti ($/€)', ticker: 'FX/BASKET', icon: '💵', risk: 'Düşük Risk • Kur Koruması', basePrice: 36.5, minChange: 0, maxChange: 10 },
  stock: { key: 'stock', name: 'Teknoloji & Holding Endeksi', ticker: 'TECH100', icon: '📈', risk: 'Orta Risk • Temettü & Büyüme', basePrice: 9400, minChange: -14, maxChange: 32 },
  crypto: { key: 'crypto', name: 'Kripto & AI Token Sepeti', ticker: 'BTC/AI', icon: '⚡', risk: 'Yüksek Risk • Yüksek Volatilite', basePrice: 68500, minChange: -40, maxChange: 80 }
};

const SHEET_BANNERS = {
  career: { img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', tag: 'ULUSAL KARİYER & AKADEMİ PORTALI', title: 'ÖSYM Sınav Sonuçları & Kurumsal İş İlanları' },
  finance: { img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80', tag: 'DİJİTAL BANKACILIK & VARLIK YÖNETİMİ', title: 'Sanal Kart, Findeks Raporu & Canlı Borsa' },
  relations: { img: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80', tag: 'NÜFUS & AİLE KÜTÜĞÜ', title: 'Evlilik Hukuku, Çocuklar & Veraset' },
  cars: { img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', tag: 'OTOMOTİV İLAN & EKSPERTİZ MERKEZİ', title: 'Sıfır/2. El Galeri & Sanayi Kaporta Raporu' },
  houses: { img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', tag: 'TAPU VE KADASTRO & EMLAK İLANLARI', title: 'Gayrimenkul Tapuları & Kira Kontratları' },
  license: { img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80', tag: 'E-DEVLET KAPISI & NÜFUS MÜDÜRLÜĞÜ', title: 'Çipli Kimlik, Sürücü Belgesi & Adli Sicil' },
  crime: { img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80', tag: 'YERALTI SENDİKASI & İSTİHBARAT DOSYASI', title: 'Kayıt Dışı Operasyonlar & Kara Para' },
  politics: { img: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80', tag: 'YÜKSEK SEÇİM KURULU & PARLAMENTO', title: 'Kamuoyu Yoklaması, Miting & Kararnameler' },
  sports: { img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80', tag: 'ULUSLARARASI SPOR FEDERASYONU', title: 'Profesyonel Lig Kontratları & Transfer' },
  health: { img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80', tag: 'SAĞLIK BAKANLIĞI E-NABIZ SİSTEMİ', title: 'Klinik Tanılar, Psikoloji & Check-Up' }
};

const PORTRAITS = {
  M: {
    baby: ['https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=300&q=80'],
    child: ['https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=300&q=80'],
    young: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'],
    adult: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80'],
    old: ['https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=300&q=80']
  },
  F: {
    baby: ['https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=300&q=80'],
    child: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=300&q=80'],
    young: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80'],
    adult: ['https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80'],
    old: ['https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&q=80']
  }
};

const RANDOM_EVENTS_DB = [
  { id: 'school_tournament', minAge: 8, maxAge: 14, badge: '⚽ Okul Turnuvası', title: 'Sınıflararası Maçta Son Dakika Penaltısı', desc: 'Okul bahçesindeki turnuvada maç 1-1 ve son dakikada penaltı kazandınız.', choices: [
    { label: '🔥 Sorumluluğu Al ve Köşeye Vur', effect: (G, c) => { if (Math.random() < 0.65) { G.happy = Math.min(100, G.happy + 12); G.sports.skill = Math.min(100, (G.sports.skill || 50) + 6); return { text: '⚽ Topu doksana astın! Tüm okul seni omuzlarında taşıdı.', type: 'good' }; } G.happy = Math.max(0, G.happy - 8); return { text: '🥅 Top direkten döndü, maçı kaybettiniz.', type: 'bad' }; } },
    { label: '🤝 Takımın En İyisine Bırak', effect: (G, c) => { G.happy = Math.min(100, G.happy + 6); return { text: '🤝 Arkadaşın golü attı, centilmenliğinle takdir topladın.', type: 'good' }; } }
  ]},
  { id: 'highschool_cheat_sheet', minAge: 14, maxAge: 17, badge: '🏫 Lise Koridorları', title: 'Zorlu Sınav Öncesi Çalışma Notları', desc: 'Sınıf birincisi sana özel sınav özetlerini vermeyi teklif ediyor.', choices: [
    { label: '📘 Özetleri Al ve Gece Çalış (+OBP)', effect: (G, c) => { G.obpScore = Math.min(100, G.obpScore + 4); G.smart = Math.min(100, G.smart + 4); return { text: `📘 Özel notlar sayesinde sınavdan 95 aldın! OBP: **${G.obpScore}**.`, type: 'good' }; } },
    { label: '💪 Kendi Bilgime Güvenirim', effect: (G, c) => { return { text: `✏️ Kendi bilginle sınava girdin. OBP: **${G.obpScore}**.`, type: 'normal' }; } }
  ]},
  { id: 'intercity_bus_trip', minAge: 18, maxAge: 28, badge: '🚌 Şehirlerarası Otobüs Yolculuğu', title: 'Otogarda Gece Seferi ve Çifte Koltuk Krizi', desc: 'Otobüs perona geç yanaştı ve senin cam kenarı koltuğunun başkasına da satıldığını gördün!', choices: [
    { label: '🎫 Yazıhaneden VIP Koltuk + İade Al', effect: (G, c) => { const ref = Math.round(c.monthlyMinWage * 0.12); G.money += ref; G.happy = Math.min(100, G.happy + 6); return { text: `🚌 Seni 2+1 VIP otobüse aldılar ve **+${ref.toLocaleString('tr-TR')} ${c.currency}** iade yaptılar.`, type: 'good' }; } },
    { label: '🎧 Boş Koltuğa Geçip Müzik Dinle', effect: (G, c) => { G.stress = Math.max(0, (G.stress || 0) - 5); return { text: '🎧 Hiç stres yapmadan yol boyu müzik dinledin.', type: 'normal' }; } }
  ]},
  { id: 'erasmus_opportunity', minAge: 19, maxAge: 24, onlyUni: true, badge: '🌍 Üniversite & Erasmus', title: 'Yurt Dışı Staj ve Değişim Programı', desc: 'Bölüm başkanlığı Avrupa’da 1 dönemlik lojistik ve teknoloji stajı için başvuru açtı.', choices: [
    { label: '✈️ Başvur ve Git (+Zeka & Deneyim)', effect: (G, c) => { const cost = Math.round(c.monthlyMinWage * 0.8); if (G.money < cost) return { text: '💸 Cep harçlığın yetmediği için katılamadın.', type: 'bad' }; G.money -= cost; G.smart = Math.min(100, G.smart + 9); G.jobExp += 1; return { text: '🌍 Yurt dışı stajında yabancı dilini geliştirdin ve +1 yıl iş deneyimi kazandın!', type: 'milestone' }; } },
    { label: '🏠 Ülkede Kalıp Derslere Odaklan', effect: (G, c) => { G.smart = Math.min(100, G.smart + 3); return { text: '📚 Dönemi kendi kampüsünde tamamladın.', type: 'normal' }; } }
  ]},
  { id: 'traffic_fender_bender', minAge: 19, maxAge: 65, requiresCar: true, badge: '🚘 Trafik & Kaza Tutanağı', title: 'Kavşakta Arkadan Çarpma Vakası', desc: 'Yoğun trafikte arkandaki sürücü tamponuna çarptı ve "Tutanak tutmayalım, elden nakit vereyim" diyor.', choices: [
    { label: '💵 Elden Nakit Al ve Sanayide Yaptır', effect: (G, c) => { const net = Math.round(c.monthlyMinWage * 0.45); G.money += net; return { text: `🔧 Tanıdık ustada tamponu boyattın, cebine net **+${net.toLocaleString('tr-TR')} ${c.currency}** kaldı!`, type: 'good' }; } },
    { label: '📝 Resmi Kaza Tutanağı Tut', effect: (G, c) => { return { text: '📝 Tutanak tutuldu, karşı tarafın sigortası yetkili serviste aracını onardı.', type: 'good' }; } }
  ]},
  { id: 'customs_container_crisis', minAge: 21, maxAge: 62, badge: '🚢 Gümrük & Lojistik İhalesi', title: 'Limanda Sahipsiz Kalan İthalat Konteyneri', desc: 'Gümrük antreposunda bekleyen elektronik ve tekstil dolu bir konteyner ihale ile satışa çıkarıldı.', choices: [
    { label: '📦 İhaleye Gir ve Satın Al (1.8x Maaş)', effect: (G, c) => { const cost = Math.round(c.monthlyMinWage * 1.8); if (G.money < cost) return { text: '💸 İhale teminatı için nakitin yetmedi.', type: 'bad' }; G.money -= cost; if (Math.random() < 0.6) { const rev = Math.round(cost * 2.8); G.money += rev; return { text: `🚢 Konteynerden sıfır ürünler çıktı! Toptancılara satıp **+${rev.toLocaleString('tr-TR')} ${c.currency}** kazandın!`, type: 'good' }; } const salv = Math.round(cost * 0.4); G.money += salv; return { text: `📉 Ürünlerin çoğu nemden hasarlı çıktı, zararına sattın.`, type: 'bad' }; } },
    { label: '🛑 Risk Alma', effect: (G, c) => ({ text: '🛑 Kapalı kutu konteyner riskine girmedin.', type: 'normal' }) }
  ]},
  { id: 'scam_call_alert', minAge: 20, maxAge: 75, badge: '📱 Siber Dolandırıcılık', title: 'Kendini Savcı / Bankacı Tanıtan Şüpheli Arama', desc: 'Telefondaki kişi hesabının terör örgütlerince ele geçirildiğini söyleyip doğrulama kodunu istiyor!', choices: [
    { label: '🧠 Oyuna Gelme ve Polise İhbar Et', effect: (G, c) => { const rew = Math.round(c.monthlyMinWage * 0.5); G.money += rew; return { text: `🚓 Dolandırıcıları yakalattın ve **+${rew.toLocaleString('tr-TR')} ${c.currency}** ödül aldın!`, type: 'good' }; } },
    { label: '😰 Panik Yapıp Kodu Söyle', effect: (G, c) => { const loss = Math.max(0, Math.round(G.money * 0.35)); G.money -= loss; return { text: `🚨 Hesabından **-${loss.toLocaleString('tr-TR')} ${c.currency}** çekildi!`, type: 'bad' }; } }
  ]},
  { id: 'headhunter_offer', minAge: 23, maxAge: 58, requiresJob: true, badge: '💼 Kariyer & Transfer', title: 'Rakip Şirketten Transfer Teklifi', desc: 'Sektördeki başarını duyan rakip bir firma, kendilerine geçmen için imza primi teklif ediyor.', choices: [
    { label: '✍️ Teklifi Kabul Et (+İmza Primi & Kıdem)', effect: (G, c) => { const b = Math.round(c.monthlyMinWage * 3.0); G.money += b; G.jobExp += 2; return { text: `🚀 Rakip şirkete geçerek **+${b.toLocaleString('tr-TR')} ${c.currency}** imza parası aldın!`, type: 'milestone' }; } },
    { label: '🏢 Mevcut Şirketinle Maaş Pazarlığı Yap', effect: (G, c) => { const b = Math.round(c.monthlyMinWage * 1.6); G.money += b; return { text: `🤝 Şirketin seni tutmak için **+${b.toLocaleString('tr-TR')} ${c.currency}** sadakat primi ödedi.`, type: 'good' }; } }
  ]},
  { id: 'child_wants_console', minAge: 22, maxAge: 65, requiresChild: true, badge: '🎮 Çocuk & Aile İsteği', title: 'Çocuğun Son Model Oyun Konsolu İstiyor', desc: 'Çocuğun karne hediyesi olarak yeni nesil oyun konsolu ve RGB kulaklık istiyor.', choices: [
    { label: '🎁 Hemen Satın Al (0.6x Maaş)', effect: (G, c) => { const cost = Math.round(c.monthlyMinWage * 0.6); if (G.money < cost) return { text: '💸 Bütçen yetmediği için alamadın.', type: 'bad' }; G.money -= cost; G.children.forEach(ch => { ch.happy = Math.min(100, (ch.happy || 75) + 18); ch.love = Math.min(100, (ch.love || 75) + 14); }); return { text: `🎮 Çocuğuna konsol ve kulaklık aldın! Mutluluktan havalara uçtu.`, type: 'good' }; } },
    { label: '📚 "Önce Takdir Belgesi Getir" De (+Zeka)', effect: (G, c) => { G.children.forEach(ch => { ch.smart = Math.min(100, (ch.smart || 70) + 6); ch.obp = Math.min(100, (ch.obp || 75) + 4); }); return { text: '📚 Şartlı sözün çocuğunu hırslandırdı, derslerine daha sıkı sarıldı!', type: 'good' }; } }
  ]}
];

/* ============================================================================
   GERÇEK LİGLER, TAKIMLAR, TEKNİK DİREKTÖRLER VE TRANSFER VERİTABANI
   ============================================================================ */

const FOOTBALL_LEAGUES_DB = {
  TR: {
    id: 'TR', name: 'Trendyol Süper Lig', flag: '🇹🇷', uefaCoeff: 1.0,
    teams: [
      { id: 'fb', name: 'Fenerbahçe', short: 'FB', power: 88, valueM: 245, stadium: 'Ülker Stadyumu', capacity: 50530, model: 'kongre', colors: '🟡🔵' },
      { id: 'gs', name: 'Galatasaray', short: 'GS', power: 87, valueM: 240, stadium: 'RAMS Park', capacity: 52600, model: 'kongre', colors: '🟡🔴' },
      { id: 'bjk', name: 'Beşiktaş', short: 'BJK', power: 84, valueM: 165, stadium: 'Tüpraş Stadyumu', capacity: 42590, model: 'kongre', colors: '⚫⚪' },
      { id: 'ts', name: 'Trabzonspor', short: 'TS', power: 81, valueM: 115, stadium: 'Papara Park', capacity: 40780, model: 'kongre', colors: '🔴🔵' },
      { id: 'ibfk', name: 'Başakşehir', short: 'İBFK', power: 78, valueM: 68, stadium: 'Fatih Terim Stadı', capacity: 17150, model: 'sahiplik', colors: '🟠🔵' },
      { id: 'sam', name: 'Samsunspor', short: 'SAM', power: 77, valueM: 54, stadium: 'Samsun 19 Mayıs', capacity: 33919, model: 'sahiplik', colors: '🔴⚪' },
      { id: 'goz', name: 'Göztepe', short: 'GÖZ', power: 76, valueM: 52, stadium: 'Gürsel Aksel Stadı', capacity: 20040, model: 'sahiplik', colors: '🟡🔴' },
      { id: 'eyp', name: 'Eyüpspor', short: 'EYP', power: 75, valueM: 42, stadium: 'R.T. Erdoğan Stadı', capacity: 14230, model: 'kongre', colors: '🟣🟡' },
      { id: 'kon', name: 'Konyaspor', short: 'KON', power: 73, valueM: 36, stadium: 'Konya Büyükşehir', capacity: 42000, model: 'kongre', colors: '🟢⚪' },
      { id: 'siv', name: 'Sivasspor', short: 'SİV', power: 73, valueM: 34, stadium: 'BG Grup 4 Eylül', capacity: 27530, model: 'kongre', colors: '🔴⚪' },
      { id: 'ant', name: 'Antalyaspor', short: 'ANT', power: 72, valueM: 33, stadium: 'Corendon Park', capacity: 32530, model: 'kongre', colors: '🔴⚪' },
      { id: 'riz', name: 'Çaykur Rizespor', short: 'RİZ', power: 72, valueM: 32, stadium: 'Çaykur Didi Stadı', capacity: 15330, model: 'kongre', colors: '🟢🔵' }
    ]
  },
  GB: {
    id: 'GB', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', uefaCoeff: 2.4,
    teams: [
      { id: 'mci', name: 'Manchester City', short: 'MCI', power: 94, valueM: 1150, stadium: 'Etihad Stadium', capacity: 53400, model: 'sahiplik', colors: '🔵⚪' },
      { id: 'ars', name: 'Arsenal', short: 'ARS', power: 91, valueM: 980, stadium: 'Emirates Stadium', capacity: 60700, model: 'sahiplik', colors: '🔴⚪' },
      { id: 'liv', name: 'Liverpool', short: 'LIV', power: 91, valueM: 960, stadium: 'Anfield', capacity: 61270, model: 'sahiplik', colors: '🔴⚪' },
      { id: 'che', name: 'Chelsea', short: 'CHE', power: 86, valueM: 850, stadium: 'Stamford Bridge', capacity: 40340, model: 'sahiplik', colors: '🔵⚪' },
      { id: 'mun', name: 'Manchester United', short: 'MUN', power: 85, valueM: 890, stadium: 'Old Trafford', capacity: 74310, model: 'sahiplik', colors: '🔴⚫' },
      { id: 'tot', name: 'Tottenham', short: 'TOT', power: 84, valueM: 760, stadium: 'Tottenham Hotspur', capacity: 62850, model: 'sahiplik', colors: '⚪🔵' },
      { id: 'new', name: 'Newcastle United', short: 'NEW', power: 84, valueM: 640, stadium: 'St James Park', capacity: 52300, model: 'sahiplik', colors: '⚫⚪' },
      { id: 'avl', name: 'Aston Villa', short: 'AVL', power: 83, valueM: 580, stadium: 'Villa Park', capacity: 42650, model: 'sahiplik', colors: '🟣🔵' },
      { id: 'bha', name: 'Brighton', short: 'BHA', power: 80, valueM: 460, stadium: 'Amex Stadium', capacity: 31800, model: 'sahiplik', colors: '🔵⚪' },
      { id: 'whu', name: 'West Ham United', short: 'WHU', power: 79, valueM: 440, stadium: 'London Stadium', capacity: 62500, model: 'sahiplik', colors: '🟣🔵' },
      { id: 'eve', name: 'Everton', short: 'EVE', power: 76, valueM: 350, stadium: 'Goodison Park', capacity: 39570, model: 'sahiplik', colors: '🔵⚪' },
      { id: 'ful', name: 'Fulham', short: 'FUL', power: 76, valueM: 330, stadium: 'Craven Cottage', capacity: 25700, model: 'sahiplik', colors: '⚪⚫' }
    ]
  },
  ES: {
    id: 'ES', name: 'La Liga EA Sports', flag: '🇪🇸', uefaCoeff: 2.0,
    teams: [
      { id: 'rma', name: 'Real Madrid', short: 'RMA', power: 95, valueM: 1200, stadium: 'Santiago Bernabéu', capacity: 81040, model: 'kongre', colors: '⚪🟣' },
      { id: 'bar', name: 'FC Barcelona', short: 'BAR', power: 91, valueM: 980, stadium: 'Spotify Camp Nou', capacity: 99350, model: 'kongre', colors: '🔵🔴' },
      { id: 'atm', name: 'Atlético Madrid', short: 'ATM', power: 87, valueM: 620, stadium: 'Riyadh Air Metropolitano', capacity: 70460, model: 'sahiplik', colors: '🔴⚪' },
      { id: 'ath', name: 'Athletic Bilbao', short: 'ATH', power: 83, valueM: 380, stadium: 'San Mamés', capacity: 53280, model: 'kongre', colors: '🔴⚪' },
      { id: 'rso', name: 'Real Sociedad', short: 'RSO', power: 82, valueM: 390, stadium: 'Reale Arena', capacity: 39500, model: 'sahiplik', colors: '🔵⚪' },
      { id: 'vil', name: 'Villarreal', short: 'VIL', power: 80, valueM: 290, stadium: 'Estadio de la Cerámica', capacity: 23000, model: 'sahiplik', colors: '🟡🔵' },
      { id: 'bet', name: 'Real Betis', short: 'BET', power: 79, valueM: 260, stadium: 'Benito Villamarín', capacity: 60720, model: 'sahiplik', colors: '🟢⚪' },
      { id: 'gir', name: 'Girona FC', short: 'GIR', power: 79, valueM: 240, stadium: 'Montilivi', capacity: 14620, model: 'sahiplik', colors: '🔴⚪' },
      { id: 'sev', name: 'Sevilla FC', short: 'SEV', power: 78, valueM: 230, stadium: 'Ramón Sánchez Pizjuán', capacity: 43880, model: 'sahiplik', colors: '⚪🔴' },
      { id: 'val', name: 'Valencia CF', short: 'VAL', power: 76, valueM: 210, stadium: 'Mestalla', capacity: 49430, model: 'sahiplik', colors: '⚪⚫' },
      { id: 'cel', name: 'Celta Vigo', short: 'CEL', power: 75, valueM: 150, stadium: 'Balaídos', capacity: 29000, model: 'sahiplik', colors: '🔵⚪' },
      { id: 'osa', name: 'Osasuna', short: 'OSA', power: 75, valueM: 135, stadium: 'El Sadar', capacity: 23570, model: 'kongre', colors: '🔴🔵' }
    ]
  },
  IT: {
    id: 'IT', name: 'Serie A Enilive', flag: '🇮🇹', uefaCoeff: 1.8,
    teams: [
      { id: 'int', name: 'Inter Milan', short: 'INT', power: 91, valueM: 780, stadium: 'Giuseppe Meazza', capacity: 75810, model: 'sahiplik', colors: '🔵⚫' },
      { id: 'mil', name: 'AC Milan', short: 'MIL', power: 87, valueM: 660, stadium: 'San Siro', capacity: 75810, model: 'sahiplik', colors: '🔴⚫' },
      { id: 'juv', name: 'Juventus', short: 'JUV', power: 87, valueM: 690, stadium: 'Allianz Stadium', capacity: 41500, model: 'sahiplik', colors: '⚫⚪' },
      { id: 'nap', name: 'Napoli', short: 'NAP', power: 86, valueM: 560, stadium: 'Diego Armando Maradona', capacity: 54720, model: 'sahiplik', colors: '🔵⚪' },
      { id: 'ata', name: 'Atalanta', short: 'ATA', power: 85, valueM: 480, stadium: 'Gewiss Stadium', capacity: 24950, model: 'sahiplik', colors: '🔵⚫' },
      { id: 'rom', name: 'AS Roma', short: 'ROM', power: 83, valueM: 410, stadium: 'Stadio Olimpico', capacity: 70630, model: 'sahiplik', colors: '🟡🔴' },
      { id: 'laz', name: 'Lazio', short: 'LAZ', power: 82, valueM: 340, stadium: 'Stadio Olimpico', capacity: 70630, model: 'sahiplik', colors: '🔵⚪' },
      { id: 'fio', name: 'Fiorentina', short: 'FIO', power: 80, valueM: 290, stadium: 'Artemio Franchi', capacity: 43140, model: 'sahiplik', colors: '🟣⚪' },
      { id: 'bol', name: 'Bologna', short: 'BOL', power: 78, valueM: 250, stadium: 'Renato Dall’Ara', capacity: 36460, model: 'sahiplik', colors: '🔴🔵' },
      { id: 'tor', name: 'Torino', short: 'TOR', power: 77, valueM: 200, stadium: 'Olimpico Grande Torino', capacity: 28170, model: 'sahiplik', colors: '🟤⚪' },
      { id: 'com', name: 'Como 1907', short: 'COM', power: 75, valueM: 160, stadium: 'Giuseppe Sinigaglia', capacity: 13600, model: 'sahiplik', colors: '🔵⚪' },
      { id: 'udi', name: 'Udinese', short: 'UDI', power: 75, valueM: 150, stadium: 'Bluenergy Stadium', capacity: 25140, model: 'sahiplik', colors: '⚫⚪' }
    ]
  },
  DE: {
    id: 'DE', name: 'Bundesliga', flag: '🇩🇪', uefaCoeff: 1.9,
    teams: [
      { id: 'bay', name: 'Bayern Münih', short: 'BAY', power: 93, valueM: 1050, stadium: 'Allianz Arena', capacity: 75020, model: 'kongre', colors: '🔴⚪' },
      { id: 'b04', name: 'Bayer Leverkusen', short: 'B04', power: 89, valueM: 680, stadium: 'BayArena', capacity: 30210, model: 'sahiplik', colors: '🔴⚫' },
      { id: 'bvb', name: 'Borussia Dortmund', short: 'BVB', power: 87, valueM: 610, stadium: 'Signal Iduna Park', capacity: 81365, model: 'kongre', colors: '🟡⚫' },
      { id: 'rbl', name: 'RB Leipzig', short: 'RBL', power: 85, valueM: 540, stadium: 'Red Bull Arena', capacity: 47060, model: 'sahiplik', colors: '🔴⚪' },
      { id: 'vfb', name: 'VfB Stuttgart', short: 'VFB', power: 82, valueM: 340, stadium: 'MHPArena', capacity: 60050, model: 'kongre', colors: '⚪🔴' },
      { id: 'sge', name: 'Eintracht Frankfurt', short: 'SGE', power: 81, valueM: 320, stadium: 'Deutsche Bank Park', capacity: 58000, model: 'kongre', colors: '🔴⚫' },
      { id: 'wol', name: 'VfL Wolfsburg', short: 'WOL', power: 78, valueM: 240, stadium: 'Volkswagen Arena', capacity: 30000, model: 'sahiplik', colors: '🟢⚪' },
      { id: 'scf', name: 'SC Freiburg', short: 'SCF', power: 78, valueM: 220, stadium: 'Europa-Park Stadion', capacity: 34700, model: 'kongre', colors: '🔴⚫' },
      { id: 'svw', name: 'Werder Bremen', short: 'SVW', power: 76, valueM: 175, stadium: 'Weserstadion', capacity: 42100, model: 'kongre', colors: '🟢⚪' },
      { id: 'tsg', name: 'Hoffenheim', short: 'TSG', power: 76, valueM: 170, stadium: 'PreZero Arena', capacity: 30150, model: 'sahiplik', colors: '🔵⚪' },
      { id: 'fca', name: 'FC Augsburg', short: 'FCA', power: 74, valueM: 130, stadium: 'WWK Arena', capacity: 30660, model: 'kongre', colors: '🔴🟢' },
      { id: 'm05', name: 'Mainz 05', short: 'M05', power: 74, valueM: 135, stadium: 'Mewa Arena', capacity: 33305, model: 'kongre', colors: '🔴⚪' }
    ]
  }
};

const FOOTBALL_MANAGERS_DB = [
  { id: 'mourinho', name: 'José Mourinho', tac: 91, wageMult: 3.5, style: '4-2-3-1 • Büyük Maç & Kupa Ustası' },
  { id: 'guardiola', name: 'Pep Guardiola', tac: 95, wageMult: 5.5, style: '4-3-3 • Tiki-Taka & Topa Sahip Olma' },
  { id: 'ancelotti', name: 'Carlo Ancelotti', tac: 94, wageMult: 5.0, style: '4-3-1-2 • Şampiyonlar Ligi Efsanesi' },
  { id: 'klopp', name: 'Jürgen Klopp', tac: 93, wageMult: 4.8, style: '4-3-3 • Gegenpress & Yüksek Tempo' },
  { id: 'xabi', name: 'Xabi Alonso', tac: 90, wageMult: 3.2, style: '3-4-2-1 • Modern Dinamik Hücum' },
  { id: 'okan', name: 'Okan Buruk', tac: 85, wageMult: 1.8, style: '4-2-3-1 • Önde Baskı & Hızlı Geçiş' },
  { id: 'ismail', name: 'İsmail Kartal', tac: 84, wageMult: 1.4, style: '4-2-3-1 • Dengeli & Yüksek Puan Ort.' },
  { id: 'terim', name: 'Fatih Terim', tac: 85, wageMult: 2.1, style: '4-1-4-1 • Yüksek Motivasyon & Hücum' },
  { id: 'sergen', name: 'Sergen Yalçın', tac: 83, wageMult: 1.5, style: '4-2-3-1 • Yaratıcı Oyun & Analiz' },
  { id: 'arda_t', name: 'Arda Turan', tac: 81, wageMult: 1.1, style: '4-3-3 • Genç & Modern Taktisyen' }
];

const TRANSFER_PLAYERS_DB = [
  { id: 'p_arda', name: 'Arda Güler', pos: 'OOS/SĞK', age: 21, ovr: 87, costMult: 42, wageMult: 2.2 },
  { id: 'p_kenan', name: 'Kenan Yıldız', pos: 'SLK/FV', age: 21, ovr: 85, costMult: 36, wageMult: 1.9 },
  { id: 'p_ferdi', name: 'Ferdi Kadıoğlu', pos: 'SLB/SĞB', age: 26, ovr: 85, costMult: 34, wageMult: 1.8 },
  { id: 'p_hakan', name: 'Hakan Çalhanoğlu', pos: 'MO/MDO', age: 32, ovr: 88, costMult: 38, wageMult: 2.5 },
  { id: 'p_irfan', name: 'İrfan Can Kahveci', pos: 'SĞK/OOS', age: 30, ovr: 83, costMult: 16, wageMult: 1.3 },
  { id: 'p_jayden', name: 'Jayden Oosterwolde', pos: 'STP/SLB', age: 25, ovr: 82, costMult: 18, wageMult: 1.2 },
  { id: 'p_nesyri', name: 'Youssef En-Nesyri', pos: 'SNT', age: 29, ovr: 84, costMult: 22, wageMult: 1.6 },
  { id: 'p_amrabat', name: 'Sofyan Amrabat', pos: 'MDO', age: 29, ovr: 83, costMult: 18, wageMult: 1.4 },
  { id: 'p_osimhen', name: 'Victor Osimhen', pos: 'SNT', age: 27, ovr: 90, costMult: 65, wageMult: 3.4 },
  { id: 'p_rafa', name: 'Rafa Silva', pos: 'OOS/SS', age: 32, ovr: 84, costMult: 18, wageMult: 1.7 },
  { id: 'p_semih', name: 'Semih Kılıçsoy', pos: 'SNT/SLK', age: 20, ovr: 81, costMult: 19, wageMult: 1.0 },
  { id: 'p_baris', name: 'Barış Alper Yılmaz', pos: 'SĞK/SLK', age: 26, ovr: 82, costMult: 20, wageMult: 1.2 },
  { id: 'p_livakovic', name: 'Dominik Livaković', pos: 'KL', age: 31, ovr: 84, costMult: 15, wageMult: 1.3 },
  { id: 'p_haaland', name: 'Erling Haaland', pos: 'SNT', age: 26, ovr: 93, costMult: 115, wageMult: 5.2 },
  { id: 'p_mbappe', name: 'Kylian Mbappé', pos: 'SNT/SLK', age: 27, ovr: 93, costMult: 120, wageMult: 5.5 },
  { id: 'p_yamal', name: 'Lamine Yamal', pos: 'SĞK', age: 19, ovr: 90, costMult: 95, wageMult: 3.8 },
  { id: 'p_bellingham', name: 'Jude Bellingham', pos: 'OOS/MO', age: 23, ovr: 91, costMult: 105, wageMult: 4.5 },
  { id: 'p_gyokeres', name: 'Viktor Gyökeres', pos: 'SNT', age: 28, ovr: 88, costMult: 55, wageMult: 2.6 }
];

ACHIEVEMENTS_DB.push(
  { id: 'club_president', title: 'Büyük Başkan', desc: 'Bir futbol kulübünün başkanı veya sahibi oldun.', icon: '🏟️' },
  { id: 'super_lig_champ', title: 'Lig Şampiyonu Başkan', desc: 'Başkanı olduğun kulübü lig şampiyonluğuna taşıdın.', icon: '🏆' },
  { id: 'ucl_winner', title: 'Avrupa Fatihi Başkan', desc: 'Kulübünle UEFA Şampiyonlar Ligi kupasını kazandın!', icon: '🌍' }
);

/* ============================================================================
   MEGA FUTBOL VERİTABANI: ALT LİG, AVRUPA DEVLERİ, TARAFTAR & WONDERKID HAVUZU
   ============================================================================ */

// 1. Küme Düşme / Çıkma İçin Alt Lig Takımları
const SECOND_DIVISION_TEAMS_DB = {
  TR: [
    { id: 'koc', name: 'Kocaelispor', short: 'KOC', power: 74, valueM: 35, stadium: 'Yıldız Entegre Kocaeli', capacity: 34712, model: 'kongre', colors: '🟢⚫' },
    { id: 'fkg', name: 'Fatih Karagümrük', short: 'FKG', power: 73, valueM: 32, stadium: 'Atatürk Olimpiyat', capacity: 74750, model: 'sahiplik', colors: '🔴⚫' },
    { id: 'gen', name: 'Gençlerbirliği', short: 'GEN', power: 72, valueM: 30, stadium: 'Eryaman Stadyumu', capacity: 20560, model: 'kongre', colors: '🔴⚫' },
    { id: 'ank', name: 'MKE Ankaragücü', short: 'ANK', power: 74, valueM: 34, stadium: 'Eryaman Stadyumu', capacity: 20560, model: 'kongre', colors: '🟡🔵' }
  ],
  GB: [
    { id: 'lee', name: 'Leeds United', short: 'LEE', power: 78, valueM: 310, stadium: 'Elland Road', capacity: 37608, model: 'sahiplik', colors: '⚪🟡' },
    { id: 'bur', name: 'Burnley FC', short: 'BUR', power: 76, valueM: 280, stadium: 'Turf Moor', capacity: 21944, model: 'sahiplik', colors: '🟣🔵' }
  ],
  ES: [
    { id: 'esp', name: 'Espanyol', short: 'ESP', power: 76, valueM: 140, stadium: 'RCDE Stadium', capacity: 40000, model: 'sahiplik', colors: '🔵⚪' },
    { id: 'vld', name: 'Real Valladolid', short: 'VLD', power: 74, valueM: 120, stadium: 'José Zorrilla', capacity: 27618, model: 'sahiplik', colors: '🟣⚪' }
  ],
  IT: [
    { id: 'par', name: 'Parma Calcio', short: 'PAR', power: 76, valueM: 165, stadium: 'Ennio Tardini', capacity: 22352, model: 'sahiplik', colors: '🟡🔵' },
    { id: 'pal', name: 'Palermo FC', short: 'PAL', power: 75, valueM: 145, stadium: 'Renzo Barbera', capacity: 36365, model: 'sahiplik', colors: '🩷⚫' }
  ],
  DE: [
    { id: 'kol', name: '1. FC Köln', short: 'KÖL', power: 76, valueM: 185, stadium: 'RheinEnergieStadion', capacity: 50000, model: 'kongre', colors: '🔴⚪' },
    { id: 'hsv', name: 'Hamburger SV', short: 'HSV', power: 76, valueM: 175, stadium: 'Volksparkstadion', capacity: 57000, model: 'kongre', colors: '🔵⚪' }
  ]
};

// 2. Kulüplere Özel Gerçek Taraftar Grupları
const ULTRAS_GROUPS_DB = {
  fb: 'Genç Fenerbahçeliler (GFB)',
  gs: 'ultrAslan',
  bjk: 'Çarşı',
  ts: 'Vira & Gurbetçi Gençler',
  goz: 'Yalı',
  sam: 'Şirinler',
  rma: 'Grada Fans RMCF',
  bar: 'Boixos Nois',
  bvb: 'The Yellow Wall (Südtribüne)',
  int: 'Curva Nord 69',
  mil: 'Curva Sud Milano',
  nap: 'Curva A & B Ultras',
  default: 'Kale Arkası Ultras Grubu'
};

// 3. UEFA Şampiyonlar Ligi / Avrupa Ligi Rakipleri
const EUROPEAN_OPPONENTS_DB = [
  { name: 'Real Madrid', flag: '🇪🇸', power: 95 },
  { name: 'Manchester City', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', power: 94 },
  { name: 'Bayern Münih', flag: '🇩🇪', power: 93 },
  { name: 'Paris Saint-Germain', flag: '🇫🇷', power: 91 },
  { name: 'Inter Milan', flag: '🇮🇹', power: 91 },
  { name: 'Arsenal', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', power: 90 },
  { name: 'Liverpool', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', power: 91 },
  { name: 'Bayer Leverkusen', flag: '🇩🇪', power: 89 },
  { name: 'Sporting CP', flag: '🇵🇹', power: 85 },
  { name: 'Benfica', flag: '🇵🇹', power: 84 },
  { name: 'Ajax', flag: '🇳🇱', power: 82 },
  { name: 'Olympiacos', flag: '🇬🇷', power: 80 }
];

// 4. Serbest Statüdeki (Bonservissiz) Yıldızlar
const FREE_AGENT_PLAYERS_DB = [
  { id: 'fa_degea', name: 'David de Gea (Serbest)', pos: 'KL', age: 34, ovr: 84, signBonusMult: 5.5 },
  { id: 'fa_rabiot', name: 'Adrien Rabiot (Serbest)', pos: 'MO', age: 30, ovr: 84, signBonusMult: 6.5 },
  { id: 'fa_depay', name: 'Memphis Depay (Serbest)', pos: 'SNT/SLK', age: 31, ovr: 83, signBonusMult: 5.0 },
  { id: 'fa_hummels', name: 'Mats Hummels (Serbest)', pos: 'STP', age: 35, ovr: 83, signBonusMult: 4.2 },
  { id: 'fa_martial', name: 'Anthony Martial (Serbest)', pos: 'SNT', age: 29, ovr: 81, signBonusMult: 4.0 }
];

const WONDERKID_FIRST_NAMES = ['Arda', 'Semih', 'Kenan', 'Can', 'Emirhan', 'Efe', 'Yusuf', 'Mustafa', 'Poyraz', 'Yiğit'];
const WONDERKID_LAST_NAMES = ['Yıldırım', 'Demirbag', 'Akman', 'Sarı', 'Vural', 'Güneş', 'Soylu', 'K석', 'Karaman', 'Uzun'];

ACHIEVEMENTS_DB.push(
  { id: 'ballon_dor_winner', title: 'Altın Top (Ballon d’Or)', desc: 'Futbolcu kariyerinde dünyanın en iyi oyuncusu seçildin!', icon: '🌕' },
  { id: 'national_hero', title: 'Milli Kahraman', desc: 'A Milli Takım formasıyla 25 maç barajını geçtin.', icon: '🇹🇷' },
  { id: 'wonderkid_factory', title: 'Wonderkid Fabrikası', desc: 'Kulüp altyapısından 3 genç yeteneği A takıma çıkardın.', icon: '🌱' }
);

/* ============================================================================
   GERÇEKÇİ ALTYAPI AKADEMİLERİ, KİRALIK KULÜPLER, MENAJERLER VE YENİ YILLIK OLAYLAR
   ============================================================================ */

// 1. Kulüp Altyapı Akademileri (Scout Teklifleri İçin)
const YOUTH_ACADEMIES_DB = [
  { id: 'aca_altinordu', name: 'Altınordu Futbol Akademisi', country: 'TR', flag: '🇹🇷', minRadar: 35, devBoost: 4, stipendMult: 0.35, desc: 'Öz kaynak düzeni, genç yaşta yüksek gelişim ve Avrupa vitrini.' },
  { id: 'aca_fb', name: 'Fenerbahçe Dereağzı Lefter Küçükandonyadis Akademisi', country: 'TR', flag: '🟡🔵', minRadar: 50, devBoost: 5, stipendMult: 0.55, desc: 'Yüksek prestij, elit tesisler ve A Takım yıldızlarıyla idman şansı.' },
  { id: 'aca_gs', name: 'Galatasaray Florya Metin Oktay Akademisi', country: 'TR', flag: '🟡🔴', minRadar: 50, devBoost: 5, stipendMult: 0.55, desc: 'Şampiyonluk kültürü, UEFA Gençlik Ligi vitrini ve güçlü altyapı.' },
  { id: 'aca_bjk', name: 'Beşiktaş Fulya Özlüce Akademisi', country: 'TR', flag: '⚫⚪', minRadar: 48, devBoost: 5, stipendMult: 0.50, desc: 'Gençlere A Takımda doğrudan forma şansı veren kolej havası.' },
  { id: 'aca_ts', name: 'Trabzonspor Özkan Sümer Futbol Akademisi', country: 'TR', flag: '🔴🔵', minRadar: 45, devBoost: 4, stipendMult: 0.45, desc: 'Karadeniz fırtınası, yüksek fizik güç ve A Takıma hızlı geçiş.' },
  { id: 'aca_ajax', name: 'Ajax De Toekomst Academy', country: 'EU', flag: '🇳🇱', minRadar: 75, devBoost: 7, stipendMult: 1.10, desc: 'Dünyanın en ünlü futbolcu fabrikası. Üstün teknik ve pas eğitimi.' },
  { id: 'aca_lamasia', name: 'FC Barcelona La Masia', country: 'EU', flag: '🇪🇸', minRadar: 82, devBoost: 8, stipendMult: 1.35, desc: 'Tiki-taka felsefesi ve dünya futbolunun zirvesine doğrudan bilet.' },
  { id: 'aca_castilla', name: 'Real Madrid La Fábrica (Valdebebas)', country: 'EU', flag: '🇪🇸', minRadar: 82, devBoost: 8, stipendMult: 1.40, desc: 'Galácticos disiplini, elit kondisyon ve dev piyasa değeri.' }
];

// 2. Tecrübe Kazanmak İçin Kiralık (Loan) Gidilebilecek Kulüpler
const LOAN_CLUBS_DB = [
  { name: 'Samsunspor (Kiralık)', boostOvr: 4, wageMult: 2.2, desc: 'Süper Ligde 34 maç banko ilk 11 garantisi.' },
  { name: 'Göztepe (Kiralık)', boostOvr: 4, wageMult: 2.1, desc: 'Ateşli taraftar önünde gelişim ve hücum futbolu.' },
  { name: 'Eyüpspor (Kiralık)', boostOvr: 3, wageMult: 2.0, desc: 'Modern taktik eğitim ve yüksek süre.' },
  { name: 'Kocaelispor (Kiralık)', boostOvr: 3, wageMult: 1.7, desc: 'Şampiyonluk yarışında sorumluluk alma fırsatı.' },
  { name: 'Westerlo / Hull City (Avrupa Kiralık)', boostOvr: 5, wageMult: 3.0, desc: 'Avrupa temposuna uyum ve yabancı gözlemci vitrini.' }
];

// 3. Futbolcu Menajerleri (Agent)
const FOOTBALL_AGENTS_DB = [
  { id: 'family', name: 'Aile Üyesi / Ağabey Menajer', cutPct: 3, radarBonus: 0, bonusMult: 1.0, desc: 'Komisyonu çok düşüktür (%3) ancak Avrupa devleriyle bağlantısı zayıftır.' },
  { id: 'national', name: 'Ulusal Lisanslı Menajer', cutPct: 8, radarBonus: 12, bonusMult: 1.25, desc: 'Süper Lig kulüpleriyle yakın ilişki, +%25 daha yüksek imza parası.' },
  { id: 'super_agent', name: 'FIFA Süper Menajer (Mendes / Raiola Ekolü)', cutPct: 12, radarBonus: 28, bonusMult: 1.65, desc: 'Avrupa devlerinin kapısını açar, imza parasını +%65 katlar!' }
];

// 4. Her Yaş Dönemi İçin Zenginleştirilmiş Yıllık Olaylar
if (typeof RANDOM_EVENTS_DB !== 'undefined') {
  RANDOM_EVENTS_DB.push(
    // ÇOCUKLUK & İLKOKUL/ORTAOKUL (6 - 14 YAŞ)
    {
      id: 'neighborhood_window_break',
      minAge: 7, maxAge: 12,
      badge: '⚽ Mahalle Maçı Krizi',
      title: 'Röveşata Çekerken Huysuz Komşunun Camı Kırıldı!',
      desc: 'Mahallede iki taş arası maç yaparken çektiğin sert şut alt kat komşusunun salon camını indirdi. Herkes kaçmaya başladı!',
      choices: [
        {
          label: '🙋‍♂️ Kaçma ve Özür Dileyip Harçlığınla Öde',
          effect: (G, c) => {
            G.happy = clamp(G.happy + 8);
            if (G.proPlayer) G.proPlayer.shooting = clamp((G.proPlayer.shooting || 60) + 2, 40, 99);
            return { text: '🤝 Dürüstlüğün komşunun çok hoşuna gitti, seni affetti ve şut gücün mahallede efsane oldu!', type: 'good' };
          }
        },
        {
          label: '🏃 Тоpu Koltuğunun Altına Alıp Hızla Kaç (+Hız)',
          effect: (G, c) => {
            if (G.proPlayer) G.proPlayer.pace = clamp((G.proPlayer.pace || 60) + 3, 40, 99);
            return { text: '🏃 Sokak aralarından rüzgar gibi kaçtın! Sprint hızın gelişti.', type: 'normal' };
          }
        }
      ]
    },
    {
      id: 'pe_teacher_notice',
      minAge: 9, maxAge: 14,
      badge: '👟 Beden Eğitimi Dersi',
      title: 'Beden Eğitimi Öğretmeni Seni Yanına Çağırdı',
      desc: 'Beden eğitimi dersindeki çift kale maçta attığın çalımlar ve hırsın öğretmenin dikkatini çekti. Seni okulun futbol takımına davet ediyor!',
      choices: [
        {
          label: '⚽ Hemen Okul Takımına Katıl (+Scout Radarı & Yetenek)',
          effect: (G, c) => {
            if (typeof ensureMegaFootballState === 'function') ensureMegaFootballState();
            if (G.proPlayer && !G.proPlayer.active) {
              G.proPlayer.active = true;
              G.proPlayer.stage = 'school_team';
              G.proPlayer.clubName = 'Okul Futbol Takımı';
            }
            if (G.proPlayer) {
              G.proPlayer.scoutRadar = clamp((G.proPlayer.scoutRadar || 10) + 22);
              G.proPlayer.dribbling = clamp((G.proPlayer.dribbling || 62) + 3, 40, 99);
            }
            G.happy = clamp(G.happy + 14);
            return { text: '👕 **Okul Takımı** formasını sırtına geçirdin! Artık ilçe turnuvalarında kulüp gözlemcilerinin (Scout) radarına girebilirsin.', type: 'milestone' };
          }
        },
        {
          label: '📚 "Ben Sadece Derslerime Odaklanacağım" De (+OBP)',
          effect: (G, c) => {
            G.obpScore = clamp(G.obpScore + 4, 50, 100);
            G.smart = clamp(G.smart + 4);
            return { text: '📚 Futbol yerine sınavlara odaklandın, okul notların yükseldi.', type: 'normal' };
          }
        }
      ]
    },
    {
      id: 'report_card_day',
      minAge: 8, maxAge: 16,
      badge: '📄 Karne Günü Heyecanı',
      title: 'Okulda Karne Dağıtım Töreni',
      desc: 'Dönem sona erdi ve karneni eve götürdün. Ailen notlarına ve okul başarısına bakıyor.',
      choices: [
        {
          label: '🏆 Karneyi Gösterip Babandan Harçlık İste',
          effect: (G, c) => {
            const gift = Math.round(c.monthlyMinWage * (G.obpScore >= 80 ? 0.25 : 0.08));
            G.money += gift;
            G.happy = clamp(G.happy + 10);
            return { text: `🎁 Ailen karne hediyesi olarak sana **+${fmtMoney(gift)}** harçlık verdi!`, type: 'good' };
          }
        },
        {
          label: '👟 "Bana Yeni Krampon Alın" De (+Futbol Gelişimi)',
          effect: (G, c) => {
            if (G.proPlayer) {
              G.proPlayer.shooting = clamp((G.proPlayer.shooting || 60) + 3, 40, 99);
              G.proPlayer.scoutRadar = clamp((G.proPlayer.scoutRadar || 0) + 10);
            }
            G.happy = clamp(G.happy + 12);
            return { text: '👟 Ailen sana yepyeni dişli krampon aldı! Sahadaki özgüvenin katlandı.', type: 'good' };
          }
        }
      ]
    },

    // GENÇLİK & LİSE YILLARI (13 - 18 YAŞ)
    {
      id: 'school_cup_scouts_in_stands',
      minAge: 12, maxAge: 17,
      badge: '🕵️‍♂️ Tribünde Kulüp Gözlemcileri (Scout)',
      title: 'Okullararası İl Şampiyonası Finalinde Gözlemciler Var!',
      desc: 'Lise/Ortaokul turnuvasının final maçındasın. Tribünde Süper Lig kulüplerinin altyapı hocaları ellerinde not defterleriyle maçı izliyor!',
      choices: [
        {
          label: '🔥 Bireysel Yeteneğini Konuştur ve Şov Yap',
          effect: (G, c) => {
            if (typeof ensureMegaFootballState === 'function') ensureMegaFootballState();
            if (Math.random() < 0.72) {
              if (G.proPlayer) {
                G.proPlayer.active = true;
                if (G.proPlayer.stage === 'none' || G.proPlayer.stage === 'street') G.proPlayer.stage = 'school_team';
                G.proPlayer.scoutRadar = clamp((G.proPlayer.scoutRadar || 20) + 35);
                G.proPlayer.goals += 2;
                G.proPlayer.seasonGoals += 2;
              }
              if (typeof generateYouthScoutOffers === 'function') generateYouthScoutOffers(2);
              return { text: '🌟 **MUHTEŞEM PERFORMANS!** Finalde 2 gol attın, tribündeki altyapı gözlemcileri adını listenin en başına yazdı! (Futbolcu Kariyeri menüsünden gelen altyapı tekliflerini incele!)', type: 'fame' };
            } else {
              return { text: '😓 Çok çalım denediğin için birkaç top ezdin ama mücadelen alkış aldı.', type: 'normal' };
            }
          }
        },
        {
          label: '🧠 Takım Oyunu Oyna ve Pas Dağıt',
          effect: (G, c) => {
            if (G.proPlayer) {
              G.proPlayer.scoutRadar = clamp((G.proPlayer.scoutRadar || 20) + 20);
              G.proPlayer.passing = clamp((G.proPlayer.passing || 62) + 3, 40, 99);
            }
            if (typeof generateYouthScoutOffers === 'function') generateYouthScoutOffers(1);
            return { text: '🧭 Oyun zekanla gözlemcilerden tam not aldın ve kulüplerden altyapı daveti geldi!', type: 'good' };
          }
        }
      ]
    },
    {
      id: 'internet_cafe_tournament',
      minAge: 13, maxAge: 19,
      badge: '🎧 İnternet Kafe Turnuvası',
      title: 'Mahalle İnternet Kafesinde Ödüllü Turnuva',
      desc: 'Arkadaşlarınla hafta sonu düzenlenen FIFA & CS turnuvasına katıldınız. Birinciye nakit ödül var.',
      choices: [
        {
          label: '🎮 Turnuvaya Katıl ve Kupayı Zorla',
          effect: (G, c) => {
            const prize = Math.round(c.monthlyMinWage * 0.35);
            G.money += prize;
            G.happy = clamp(G.happy + 12);
            return { text: `🏆 Finalde rakiplerini ezip geçtin ve **+${fmtMoney(prize)}** turnuva ödülünü kazandın!`, type: 'good' };
          }
        },
        {
          label: '🏋️ Antrenmana Gitmeyi Tercih Et (+Fizik)',
          effect: (G, c) => {
            G.health = clamp(G.health + 6);
            if (G.proPlayer) G.proPlayer.physical = clamp((G.proPlayer.physical || 60) + 3, 40, 99);
            return { text: '💪 Arkadaşların kafedeyken sen sahada ekstra kondisyon çalıştın!', type: 'good' };
          }
        }
      ]
    },

    // ÜNİVERSİTE VE GENÇ YETİŞKİNLİK (18 - 27 YAŞ)
    {
      id: 'roommate_bill_crisis',
      minAge: 18, maxAge: 25,
      onlyUni: true,
      badge: '🏠 Öğrenci Evi & Yurt Gündemi',
      title: 'Ev/Oda Arkadaşın Faturaları Ödemeden Memlekete Gitti',
      desc: 'Kış ortasında doğalgaz ve internet faturası birikti ancak oda arkadaşın kendi payını bırakmadan memlekete tatile gitti.',
      choices: [
        {
          label: '💳 Mecburen Kendi Cebinden Kapat (0.25x Maaş)',
          effect: (G, c) => {
            const bill = Math.round(c.monthlyMinWage * 0.25);
            G.money -= bill;
            return { text: `🧾 Kesinti olmasın diye **-${fmtMoney(bill)}** faturayı tek başına ödedin.`, type: 'bad' };
          }
        },
        {
          label: '📞 Ailesini Arayıp Parayı İste',
          effect: (G, c) => {
            G.happy = clamp(G.happy + 4);
            return { text: '📲 Arkadaşın mahcup olup payını IBAN hesabına gönderdi, zarardan kurtuldun!', type: 'good' };
          }
        }
      ]
    },

    // YETİŞKİN, İŞ, AİLE VE GÜNLÜK HAYAT (22 - 70 YAŞ)
    {
      id: 'wedding_gold_ceremony',
      minAge: 22, maxAge: 60,
      badge: '💍 Düğün & Takı Merasimi',
      title: 'Yakın Arkadaşının Düğününde Takı Sırası',
      desc: 'Çocukluk arkadaşın evleniyor ve anonsçu mikrofonu eline aldı. Bütün salon kimin ne takacağına bakıyor!',
      choices: [
        {
          label: '🪙 Tam Altın Tak ve Anons Ettir (0.9x Maaş • +Ün)',
          effect: (G, c) => {
            const cost = Math.round(c.monthlyMinWage * 0.9);
            if (G.money < cost) return { text: '💸 Paran yetmediği için zarfa sessizce nakit koydun.', type: 'normal' };
            G.money -= cost;
            G.fame = clamp(G.fame + 7);
            G.happy = clamp(G.happy + 10);
            return { text: `🎤 Anonsçu adını mikrofondan haykırdı! Bütün salon alkışladı (-${fmtMoney(cost)}).`, type: 'fame' };
          }
        },
        {
          label: '✉️ Zarfa 200’lük Banknot Koyup Hızlıca Geç (0.15x Maaş)',
          effect: (G, c) => {
            const cost = Math.round(c.monthlyMinWage * 0.15);
            G.money -= cost;
            return { text: `✉️ Ekonomik bir takıyla düğün görevini tamamladın (-${fmtMoney(cost)}).`, type: 'normal' };
          }
        }
      ]
    },
    {
      id: 'village_land_inheritance',
      minAge: 25, maxAge: 68,
      badge: '🌾 Tapu & Miras Kulisleri',
      title: 'Memleketteki Hisseli Köy Arsasından Otoyol Geçiyor!',
      desc: 'Dedenden kalan ve yıllardır unutulan memleketteki tarlanın yanından yeni otoyol projesi geçeceği söylentisi yayıldı. Bir emlakçı hemen nakit teklif ediyor.',
      choices: [
        {
          label: '💵 Hemen Emlakçıya Sat (3.5x Maaş Garanti Nakit)',
          effect: (G, c) => {
            const cash = Math.round(c.monthlyMinWage * 3.5);
            G.money += cash;
            return { text: `📜 Hisseni emlakçıya devredip anında **+${fmtMoney(cash)}** nakit aldın!`, type: 'good' };
          }
        },
        {
          label: '🏗️ Bekle ve İmar / Kamulaştırma Çıkmasını Um',
          effect: (G, c) => {
            if (Math.random() < 0.55) {
              const bigPay = Math.round(c.monthlyMinWage * 8.5);
              G.money += bigPay;
              return { text: `🎰 **İMAR PİYANGOSU!** Otoyol kavşağı tam tarlanın yanından geçti, müteahhitten **+${fmtMoney(bigPay)}** aldın!`, type: 'milestone' };
            } else {
              return { text: '📉 Proje güzergahı değişti, tarla eski değerinde kaldı.', type: 'normal' };
            }
          }
        }
      ]
    },
    {
      id: 'parking_spot_dispute',
      minAge: 21, maxAge: 65,
      requiresCar: true,
      badge: '🅿️ Apartman & Otopark Krizi',
      title: 'Komşun Senin Park Yerine Dubayla El Koydu',
      desc: 'Akşam işten yorgun argın döndüğünde apartmanın önündeki her zaman park ettiğin yere yan bina sakinlerinin duba koyduğunu gördün.',
      choices: [
        {
          label: '🚓 Zabıtaya ve Trafik Polisine Bildir (Resmi Çözüm)',
          effect: (G, c) => {
            G.happy = clamp(G.happy + 8);
            return { text: '🚓 Ekipler gelip izinsiz dubaları kaldırdı ve komşuya idari para cezası kesti!', type: 'good' };
          }
        },
        {
          label: '😤 Dubayı Fırlatıp Aracı Sıfır Yanaştır',
          effect: (G, c) => {
            G.stress = clamp((G.stress || 0) + 12);
            if (G.cars[0]) G.cars[0].cond = clamp(G.cars[0].cond - 6, 10, 100);
            return { text: '🔑 Gece birisi aracının kapısını anahtarla çizmiş! Kondisyon düştü.', type: 'bad' };
          }
        }
      ]
    },
    {
      id: 'accounting_invoice_audit',
      minAge: 22, maxAge: 62,
      requiresJob: true,
      badge: '🧾 Maliye & Fatura Denetimi',
      title: 'Ay Sonu KDV ve Fatura Mutabakatında Büyük Fark Yakaladın',
      desc: 'Şirketin ay sonu muhasebe ve tedarikçi faturalarını kontrol ederken mükerrer kesilmiş yüksek tutarlı bir fatura fark ettin.',
      choices: [
        {
          label: '📊 Raporlayıp Şirketi Zarardan Kurtar (+Terfi Primi)',
          effect: (G, c) => {
            const bonus = Math.round(c.monthlyMinWage * 2.2);
            G.money += bonus;
            G.jobExp += 1;
            return { text: `👏 Dikkatli kontrolün şirketi büyük bir vergi/maliyet zararından kurtardı! Yönetim sana **+${fmtMoney(bonus)}** prim verdi.`, type: 'good' };
          }
        },
        {
          label: '🤫 Tedarikçiyle Anlaşıp Komisyon Al (+Kara Para)',
          effect: (G, c) => {
            const cut = Math.round(c.monthlyMinWage * 4.5);
            G.dirtyMoney = (G.dirtyMoney || 0) + cut;
            return { text: `🕶️ Fatura farkını sessizce kapatıp tedarikçiden **+${fmtMoney(cut)} Kara Para** komisyon aldın.`, type: 'normal' };
          }
        }
      ]
    }
  );
}

/* ============================================================================
   DERİN SİYASET (MECLİS, BAKANLIKLAR, YASALAR) & RADYO / STREAMER VERİTABANI
   ============================================================================ */

// 1. Siyasi Partiler ve İdeolojik Bloklar
const POLITICAL_PARTIES_DB = [
  { id: 'party_refah', name: 'Ulusal Kalkınma & Refah Partisi', short: 'UKP', color: '#f59e0b', desc: 'Ekonomik büyüme, lojistik teşvikler ve güçlü sanayi odaklı merkez parti.' },
  { id: 'party_sosyal', name: 'Demokratik Halk & Adalet Partisi', short: 'DHP', color: '#ef4444', desc: 'Sosyal devlet, yüksek asgari ücret ve eğitim/sağlık reformu odaklı parti.' },
  { id: 'party_vizyon', name: 'Gelecek & Teknoloji İttifakı', short: 'GTİ', color: '#38bdf8', desc: 'Dijital ekonomi, düşük vergi, gençlik ve serbest piyasa odaklı yenilikçi parti.' },
  { id: 'party_custom', name: 'Kendi Siyasi Partini Kur', short: 'YKP', color: '#10b981', desc: 'Tüzüğünü ve kadrosunu bizzat belirlediğin bağımsız siyasi hareket.' }
];

// 2. Kabine ve Bakanlık Koltukları
const MINISTRIES_DB = [
  {
    id: 'maliye',
    title: 'Hazine ve Maliye Bakanlığı',
    icon: '🏦',
    bonusDesc: 'Vergi oranlarını %4 düşürür, borsa/mevduat gelirlerini +%15 artırır.',
    salaryMult: 11.5
  },
  {
    id: 'ulastirma',
    title: 'Ulaştırma ve Altyapı Bakanlığı',
    icon: '🚛',
    bonusDesc: 'Lojistik, tır filosu ve denizcilik şirketlerinin aylık net kârını +%25 artırır.',
    salaryMult: 11.0
  },
  {
    id: 'icisler',
    title: 'İçişleri ve Adalet Bakanlığı',
    icon: '🛡️',
    bonusDesc: 'MASAK/mali denetim riskini sıfırlar, siyasi otoriteyi ve halk desteğini korur.',
    salaryMult: 11.0
  },
  {
    id: 'genclik_spor',
    title: 'Gençlik ve Spor Bakanlığı',
    icon: '🏟️',
    bonusDesc: 'Kulüp kasasına yıllık stadyum hibesi verir ve TFF/MHK lobi gücünü +%25 artırır.',
    salaryMult: 10.5
  }
];

// 3. Meclis Genel Kurulunda Oylanacak Yasa Tasarıları
const PARLIAMENT_BILLS_DB = [
  {
    id: 'bill_tax_cut',
    title: 'Kurumlar ve Gelir Vergisi İndirim Paketi',
    desc: 'Ülkedeki gelir vergisini %4 düşürür ve şirket sahiplerinin net kârını artırır.',
    reqSeats: 301,
    approvalGain: 10
  },
  {
    id: 'bill_logistics_hub',
    title: 'Uluslararası Lojistik ve Gümrük Muafiyet Yasası',
    desc: 'Tüm şirketlerinin aylık cirosunu +%18 kalıcı olarak büyütür.',
    reqSeats: 301,
    approvalGain: 8
  },
  {
    id: 'bill_football_pool',
    title: 'Futbol Yayın Havuzu ve Stadyum Teşvik Yasası',
    desc: 'Başkanı olduğun kulübün kasasına anında devlet yayın teşviki aktarır.',
    reqSeats: 301,
    approvalGain: 12
  },
  {
    id: 'bill_youth_grant',
    title: 'Üniversite Gençlik Bursu ve Asgari Ücret Refah Yasası',
    desc: 'Ülke asgari ücretini %12 artırır ve halk desteğini zirveye taşır.',
    reqSeats: 301,
    approvalGain: 18
  }
];

// 4. Yayıncı (Streamer) & Podcast Stüdyosu Ekipmanları
const STREAMER_GEAR_DB = [
  { id: 'mic', name: 'Shure SM7B Mikrofon & GoXLR Ses Mikseri', icon: '🎙️', costMult: 1.5, viewBoost: 25, fameBoost: 4 },
  { id: 'cam', name: 'Sony 4K Sinema Kamerası & Elgato Key Light', icon: '📷', costMult: 2.8, viewBoost: 45, fameBoost: 6 },
  { id: 'pc', name: 'Çift PC Custom Sıvı Soğutmalı Yayın Sistemi', icon: '🖥️', costMult: 5.5, viewBoost: 80, fameBoost: 8 },
  { id: 'room', name: 'Akustik Ses Yalıtımı & RGB Stüdyo Dekoru', icon: '🎧', costMult: 8.0, viewBoost: 130, fameBoost: 12 }
];

// 5. Radyo, Dijital Spor Medyası ve TV Kanalı Yatırımları
const MEDIA_OUTLETS_DB = [
  {
    id: 'podcast_show',
    name: 'Dijital Podcast & Talk Show Stüdyosu',
    icon: '🎙️',
    costMult: 12,
    monthlyRevMult: 2.4,
    influence: 8,
    theme: 'Her hafta ünlü konuklarla gündem programı.'
  },
  {
    id: 'fm_radio',
    name: 'Ulusal FM Radyo İstasyonu (Radyo Frekansı)',
    icon: '📻',
    costMult: 38,
    monthlyRevMult: 7.5,
    influence: 18,
    theme: '7/24 müzik, sabah şovu ve canlı trafik/reklam kuşağı.'
  },
  {
    id: 'skor_agi_media',
    name: 'Dijital Spor Medyası Ağı (Siyah-Turuncu Konsept)',
    icon: '🟠',
    costMult: 55,
    monthlyRevMult: 12.0,
    influence: 28,
    theme: 'Son dakika transfer kulisleri, özel maç grafikleri ve milyonluk etkileşim!'
  },
  {
    id: 'national_tv',
    name: 'Ulusal Haber & Spor Televizyon Kanalı',
    icon: '📺',
    costMult: 140,
    monthlyRevMult: 32.0,
    influence: 50,
    theme: 'Ülke gündemini, seçim anketlerini ve spor kamuoyunu doğrudan belirleyen medya devi.'
  }
];

ACHIEVEMENTS_DB.push(
  { id: 'party_leader', title: 'Parti Genel Başkanı', desc: 'Bir siyasi partinin genel başkanı seçildin ve meclise girdin.', icon: '🏛️' },
  { id: 'top_streamer', title: 'Yılın Yayıncısı', desc: 'Canlı yayınlarda 100.000 abone ve tam donanımlı stüdyoya ulaştın.', icon: '🎙️' },
  { id: 'media_mogul', title: 'Medya İmparatoru', desc: 'Dijital Spor Medyası veya Ulusal TV Kanalı sahibi oldun.', icon: '📺' }
);
