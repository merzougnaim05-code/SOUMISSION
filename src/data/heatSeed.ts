import type {Entrepreneur, HeatState, Ouvrage} from '../types';
import {defaultHeatArticles} from './heatArticles';

let seq = 0;
function o(designation: string, unite: string, qte: number, prixRef: number): Ouvrage {
  seq += 1;
  return {id: `o${seq}`, designation, unite, qte, prixRef};
}

const OUVRAGES: Ouvrage[] = [
  o('Depose chaudières existantes et F/P chaudière acier capacité entre (230000-260000) kcal/h y compris bruleur a gaz adaptable au chaudière, raccordement, et toutes sujétions de bonne exécution.', 'Uté', 2, 400000),
  o('F/P vase d’expansion capacité 200L et toutes sujétion de bonne exécution.', 'U', 2, 70000),
  o('F/P électropompes accélérateurs grand débit 80/90 avec protection moteur intégré et automatique parasonde isothermique, avec filtre a tamis, clapet anti-retour y compris toute sujétion de bonne mise en œuvre.', 'U', 2, 250000),
  o('F/P soupape de sécurité 03 bars avec Mano.', 'U', 3, 3000),
  o('F/P manomètre hydrometer.', 'U', 3, 3000),
  o('F/P purgeur automatique.', 'U', 3, 3000),
  o('F/P vanne d’isolement Ø 50/60', 'U', 4, 6000),
  o('F/P vanne d’isolement Ø 80', 'U', 4, 6000),
];

export function newEntrepreneur(id: string): Entrepreneur {
  return {
    id,
    nom: '',
    formeJuridique: 'شركة ذ.م.م',
    rc: '',
    nif: '',
    nis: '',
    adresse: '',
    gerant: '',
    tel: '',
    banque: '',
    agence: '',
    rib: '',
    nbSpecialises: 0,
    nbOuvriers: 0,
    camion: false,
    soudure: false,
    cintrage: false,
    forage: false,
    construction: false,
    delaiPropose: 30,
  };
}

export function defaultHeatState(): HeatState {
  return {
    settings: {
      wilaya: 'باتنة',
      commune: 'وادي الماء',
      institution: 'ثانوية الشهداء الإخوة عبد الرحمان سعيد عامر يوسف (ثانوية وادي الماء سابقاً)',
      institutionShort: 'ثانوية الشهداء الإخوة عبد الرحمان سعيد عامر يوسف',
      directeur: 'نية باديس',
      annee: new Date().getFullYear(),
      numeroConsultation: '01/2026',
      projet: 'أشغال التدفئة المركزية ولواحقها',
      domaine: 'الترصيص الصحي والتدفئة',
      degre: 'أولى (01) فما فوق',
      activite: 'رئيسي أو ثانوي',
      dateAnnonce: '',
      dateDepot: '',
      heureDepot: '10:00',
      heureOuverture: '10:30',
      delaiPreparation: 8,
      delaiRealisation: 30,
      delaiValidite: 98,
      fraisParticipation: 3000,
      tva: 19,
    },
    ouvrages: OUVRAGES,
    entrepreneurs: [],
    offers: [],
    committee: {president: '', membres: ['', '', '', '']},
    articles: defaultHeatArticles(),
  };
}
