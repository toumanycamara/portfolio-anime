/**
 * Configuration centrale : durées, couleurs, textes, paramètres d'animation.
 * Tout ce qui est "réglable" se trouve ici (les scènes ne contiennent pas de textes en dur).
 */
import tl from './timeline.json';
import manifest from '../public/captures/manifest.json';

export const FPS = tl.fps;
export const WIDTH = tl.width;
export const HEIGHT = tl.height;
export const SEC = (s: number) => Math.round(s * FPS);
export const TOTAL_FRAMES = SEC(tl.duration);

export type SceneKey = keyof typeof tl.scenes;
export const scenes = tl.scenes;
export const sceneFrom = (k: SceneKey) => SEC(tl.scenes[k][0]);
export const sceneDur = (k: SceneKey) => SEC(tl.scenes[k][1] - tl.scenes[k][0]);
/** secondes absolues -> image locale d'une scène (ou d'un segment commençant à `startAbs`) */
export const at = (absSeconds: number, startAbs: number) => Math.round((absSeconds - startAbs) * FPS);

export const COLORS = {
  primary: '#e11d2a',
  primaryDark: '#8f1119',
  ink: '#141414',
  inkSoft: '#1f1f24',
  muted: '#5f5e5e',
  page: '#f4f4f5',
  white: '#ffffff',
  rose: '#ffdad7',
  green: '#16a34a',
};

export const FONT = "'Inter', system-ui, sans-serif";

/** Tous les textes de la vidéo (français). */
export const TEXT = {
  intro: { l1: 'Une école.', l2: 'Trois profils.', tag: 'GESTION SCOLAIRE' },
  reveal: { l1: 'Une connexion.', l2: 'Le bon espace.', chips: ['5 filières', '8 classes', '178 étudiants'], note: 'Les chiffres clés, dès l’ouverture.' },
  explore: {
    roles: [
      { n: '01', name: 'Étudiant', line: 'Son planning, ses cours du jour, ses notes.' },
      { n: '02', name: 'Formateur', line: 'Ses classes, ses effectifs, ses séances.' },
      { n: '03', name: 'Secrétaire', line: 'Toute l’école pilotée depuis un seul endroit.' },
    ],
  },
  features: {
    appel: { kicker: 'Présences', title: 'L’appel en quelques clics.', note: 'Présent, retard, absent — le taux se calcule en direct.' },
    notes: { kicker: 'Notes', title: 'Des notes justes, dès la saisie.', note: 'Valeur invalide ? L’erreur apparaît avant l’enregistrement.' },
    stats: { kicker: 'Statistiques', title: 'L’école en chiffres.' },
  },
  management: [
    { kicker: 'Étudiants', title: 'Ajouter un étudiant.', note: 'Matricule généré, erreurs signalées avant l’envoi.' },
    { kicker: 'Classes', title: 'Créer une classe.', note: 'Filière, niveau, salle et capacité.' },
    { kicker: 'Niveaux', title: 'Ajouter un niveau.', note: 'Un code, un libellé, et c’est prêt.' },
    { kicker: 'Formateurs', title: 'Ajouter un formateur.', note: 'Statut, spécialité et matières enseignées.' },
    { kicker: 'Filières', title: 'Créer une filière.', note: 'Code, responsable et description.' },
    { kicker: 'Matières', title: 'Ajouter une matière.', note: 'Coefficient, filière et niveau.' },
    { kicker: 'Modifications', title: 'Modifier en un clic.', note: 'Même principe pour classes, filières, matières et formateurs.' },
  ],
  experience: {
    kicker: 'De la saisie au résultat',
    s1: 'Le formateur saisit.',
    s2: 'L’étudiant consulte.',
    s3: 'Une erreur ? On annule.',
    note2: 'Moyenne pondérée, mention et classement.',
  },
  responsive: { l1: 'Sur ordinateur.', l2: 'Sur smartphone.', note: 'Le même espace, un menu qui s’adapte.' },
  value: [
    { big: 'Chaque rôle,\nson espace.', crop: 'roles' },
    { big: 'Matricules générés\nautomatiquement.', crop: 'matricule' },
    { big: 'Saisies validées\navant enregistrement.', crop: 'erreur' },
    { big: 'Un relevé de notes\nen un clic.', crop: 'releve' },
  ],
  outro: { signature: 'Chaque rôle, son tableau de bord.', name: 'École 221', foot: 'Interfaces et données de démonstration — chiffres fictifs.' },
};

/** Statistiques réelles lues dans la base de démonstration (voir tools/build_demo.py). */
export const STATS = {
  cards: [
    { label: 'Filières', value: 5 }, { label: 'Niveaux', value: 5 }, { label: 'Classes', value: 8 },
    { label: 'Étudiants', value: 178 }, { label: 'Garçons', value: 98, pct: '55,1%' }, { label: 'Filles', value: 80, pct: '44,9%' },
  ],
  parFiliere: [['Génie Logiciel', 82], ['Réseaux & Télécoms', 42], ['IA & Data', 22], ['Design & UX', 20], ['Cybersécurité', 12]] as [string, number][],
  parNiveau: [['Licence 1', 56], ['Licence 2', 44], ['Licence 3', 50], ['Master 1', 16], ['Master 2', 12]] as [string, number][],
};

export const AUDIO = {
  /** Musique + effets générés par tools/make_audio.py. Pour une autre musique : déposez public/audio/music.wav puis relancez `npm run audio`. */
  soundtrack: 'audio/soundtrack.wav',
  volume: 1,
};

export const CAPTURES = manifest as Record<string, { x: number; y: number; w: number; h: number }>;
