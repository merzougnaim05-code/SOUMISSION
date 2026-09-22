export interface Materiau {
  id: string;
  designation: string;
  unite: string;
  qteMin: number;
  qteMax: number;
  prixRef: number; // السعر الوحدوي التقديري المرجعي (كامل الرسوم)
}

export interface Lot {
  id: string;
  numero: number;
  nom: string;
  materiaux: Materiau[];
}

export interface Bidder {
  id: string;
  nom: string;
  formeJuridique: string;
  rc: string;
  activite: string;
  nif: string;
  nis: string;
  rib: string;
  banque: string;
  agence: string;
  adresse: string;
  gerant: string;
}

/** عرض سعر متعهد لحصة واحدة: أسعار وحدوية لكل مادة (خارج الرسوم) */
export interface Offer {
  bidderId: string;
  lotId: string;
  prix: Record<string, number>; // مفتاحه معرف المادة
}

export interface Settings {
  wilaya: string;
  commune: string;
  institution: string;
  directeur: string;
  ordonnateur: string;
  annee: number;
  numeroAnnonce: number;
  dateAnnonce: string; // ISO
  dateDepot: string;
  heureDepot: string;
  dateOuverture: string;
  heureOuverture: string;
  delaiJours: number;
  contractFrom: string;
  contractTo: string;
  banque: string;
  agence: string;
  rib: string;
  dateSessionConseil: string;
}

export interface Committee {
  president: string;
  membres: string[];
}

/** مادة من التعليمات العامة لدفتر الشروط (قابلة للتعديل) */
export interface ArticleItem {
  id: string;
  section: 'أ' | 'ب' | 'ج' | 'د' | 'هـ' | 'و';
  titre: string;
  corps: string;
}

export interface AppState {
  settings: Settings;
  lots: Lot[];
  bidders: Bidder[];
  offers: Offer[];
  committee: Committee;
  articles: ArticleItem[];
}

/* ================== استشارة التدفئة المركزية ================== */

/** بند أشغال (Ouvrage) */
export interface Ouvrage {
  id: string;
  designation: string;
  unite: string;
  qte: number;
  prixRef: number; // السعر الوحدوي المرجعي (خارج الرسوم)
}

export interface HeatSettings {
  wilaya: string;
  commune: string;
  institution: string;
  institutionShort: string;
  directeur: string;
  annee: number;
  numeroConsultation: string; // مثال: 01/2026
  projet: string; // عنوان العملية
  domaine: string; // ميدان التأهيل
  degre: string; // الدرجة
  activite: string;
  dateAnnonce: string;
  dateDepot: string;
  heureDepot: string;
  heureOuverture: string;
  delaiPreparation: number; // أيام
  delaiRealisation: number; // أيام
  delaiValidite: number; // أيام صلاحية العروض
  fraisParticipation: number; // دج
  tva: number; // %
}

/** مقاولة متعهدة + معطيات التنقيط التقني */
export interface Entrepreneur {
  id: string;
  nom: string;
  formeJuridique: string;
  rc: string;
  nif: string;
  nis: string;
  adresse: string;
  gerant: string;
  tel: string;
  banque: string;
  agence: string;
  rib: string;
  // التنقيط التقني
  nbSpecialises: number; // عامل متخصص (05 نقاط)
  nbOuvriers: number; // عمال ورشة (نقطتان لكل عامل حد 10)
  camion: boolean; // شاحنة (13)
  soudure: boolean; // آلات التلحيم والغاز (04)
  cintrage: boolean; // معدات ثني الأنابيب (01)
  forage: boolean; // آلات الحفر (01)
  construction: boolean; // معدات البناء (01)
  delaiPropose: number; // المدة المقترحة (يوم)
}

/** عرض مالي لمقاولة: أسعار وحدوية لكل بند */
export interface HeatOffer {
  entrepreneurId: string;
  prix: Record<string, number>;
}

export interface HeatState {
  settings: HeatSettings;
  ouvrages: Ouvrage[];
  entrepreneurs: Entrepreneur[];
  offers: HeatOffer[];
  committee: Committee;
  articles: HeatArticle[];
}

export interface HeatArticle {
  id: string;
  section: 'inst' | 'ccap' | 'cpc';
  titre: string;
  corps: string;
}
