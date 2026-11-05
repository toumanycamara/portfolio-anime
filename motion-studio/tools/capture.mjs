// Captures AUTHENTIQUES des interfaces d'École 221.
// Les vraies pages PHP tournent (php -S + MariaDB, données fictives) ; on se connecte par le vrai
// formulaire, on clique les vrais boutons, on enregistre des images + la position des cibles de clic.
//
//   DEMO=<dossier demo> node tools/capture.mjs
//
import { chromium } from 'playwright-core';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DEMO = process.env.DEMO;
const BASE = 'http://127.0.0.1:8221/pages/';
const OUT = path.resolve('public/captures');
fs.mkdirSync(OUT, { recursive: true });

// --- Tailwind : on compile le CSS exactement comme le ferait le CDN (mêmes classes, même config)
execSync(`DEMO=${DEMO} npx tailwindcss -c tools/tailwind.config.cjs -i tools/tw-in.css -o ${OUT}/../_tw.css --minify`, { stdio: 'inherit' });
const TW_CSS = fs.readFileSync(path.join(OUT, '..', '_tw.css'), 'utf8');

const AVATAR = (seed) => {
  const hues = { '47': '#c2410c', '12': '#2563eb' };
  const c = hues[seed] || '#475569';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="${c}"/><circle cx="64" cy="50" r="22" fill="#ffffffcc"/><path d="M20 128c0-26 20-44 44-44s44 18 44 44z" fill="#ffffffcc"/></svg>`;
};

const browser = await chromium.launch({
  executablePath: fs.readdirSync('/opt/pw-browsers').filter((d) => d.startsWith('chromium-')).map((d) => `/opt/pw-browsers/${d}/chrome-linux/chrome`)[0],
  args: ['--no-sandbox'],
});

const manifest = {};

async function newPage({ mobile = false } = {}) {
  const ctx = await browser.newContext(
    mobile
      ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'fr-FR', timezoneId: 'Africa/Dakar' }
      : { viewport: { width: 1440, height: 810 }, deviceScaleFactor: 2, locale: 'fr-FR', timezoneId: 'Africa/Dakar' },
  );
  await ctx.route('**/cdn.tailwindcss.com/**', (r) =>
    r.fulfill({
      contentType: 'application/javascript',
      body: `window.tailwind={};(function(){var s=document.createElement('style');s.textContent=${JSON.stringify(TW_CSS)};document.head.appendChild(s);})();`,
    }),
  );
  await ctx.route('**/fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: '' }));
  await ctx.route('**/fonts.gstatic.com/**', (r) => r.abort());
  await ctx.route('**/images.unsplash.com/**', (r) => r.abort());
  await ctx.route('**/i.pravatar.cc/**', (r) => {
    const m = /img=(\d+)/.exec(r.request().url());
    r.fulfill({ contentType: 'image/svg+xml', body: AVATAR(m ? m[1] : '0') });
  });
  const page = await ctx.newPage();
  return page;
}

const go = async (page, file, qs = '') => {
  await page.goto(BASE + file + qs, { waitUntil: 'load' });
  await page.waitForTimeout(350);
};
const snap = async (page, name) => {
  await page.screenshot({ path: path.join(OUT, name + '.png') });
  console.log('  ✓', name);
};
const mark = async (page, key, locator) => {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const b = await el.boundingBox();
  if (b) manifest[key] = { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2), w: Math.round(b.width), h: Math.round(b.height) };
};
async function login(page, email, role) {
  await go(page, 'loginEcole221.php');
  await snap(page, `login-${role}-vide`);
  await page.locator('button.js-role', { hasText: role === 'etudiant' ? 'Étudiant' : role === 'formateur' ? 'Formateur' : 'Secrétaire' }).click();
  await page.locator('#login').fill(email);
  await page.locator('#pwd').fill('demo1234');
  await page.locator('#togglePwd').click();
  await page.waitForTimeout(200);
  await mark(page, `login-${role}-submit`, 'button[type=submit]');
  await mark(page, `login-${role}-email`, '#login');
  await mark(page, `login-${role}-pwd`, '#pwd');
  await mark(page, `login-${role}-role`, `button.js-role[data-role="${role === 'secretaire' ? 'admin' : role}"]`);
  await snap(page, `login-${role}-rempli`);
  await Promise.all([page.waitForNavigation(), page.locator('button[type=submit]').click()]);
  await page.waitForTimeout(500);
}

// ================================================================= SECRÉTAIRE
{
  console.log('Secrétaire');
  const p = await newPage();
  await login(p, 'demo.secretaire@ecole221.sn', 'secretaire');
  await snap(p, 'sec-dashboard');
  await go(p, 'statistiqueSecretaire.php'); await snap(p, 'sec-stats');

  await go(p, 'etudiantSecretaire.php'); await snap(p, 'sec-etudiants');
  await mark(p, 'sec-etu-add', '#btnAdd'); await mark(p, 'sec-etu-search', 'input[name=q]');
  await mark(p, 'sec-etu-row', 'tbody tr[data-id]');
  await p.locator('input[name=q]').fill('awa'); await p.keyboard.press('Enter'); await p.waitForTimeout(500); await snap(p, 'sec-etudiants-recherche');
  await go(p, 'etudiantSecretaire.php');
  await p.locator('#btnAdd').click(); await p.waitForTimeout(500); await snap(p, 'sec-etudiant-drawer');
  await p.locator('#e-nom').fill('D1op'); await p.locator('#e-prenom').fill('Mame Diarra');
  await p.locator('#e-tel').fill('77 5'); await p.locator('#e-classe').selectOption({ index: 1 });
  await mark(p, 'sec-etu-save', 'button[form=etudiantForm]'); await mark(p, 'sec-etu-nom', '#e-nom');
  await p.waitForTimeout(200); await snap(p, 'sec-etudiant-drawer-rempli');
  await Promise.all([p.waitForNavigation(), p.locator('button[form=etudiantForm]').click()]);
  await p.waitForTimeout(500); await snap(p, 'sec-etudiant-drawer-erreurs');
  await p.locator('#e-nom').fill('Diop'); await p.locator('#e-tel').fill('+221 77 512 34 90');
  await p.locator('#e-email').fill('mame.diarra.diop@ecole221.sn'); await p.waitForTimeout(150);
  await snap(p, 'sec-etudiant-drawer-corrige');
  await Promise.all([p.waitForNavigation(), p.locator('button[form=etudiantForm]').click()]);
  await p.waitForTimeout(500); await snap(p, 'sec-etudiant-ajoute');
  await go(p, 'detailsEtudiantSecretaire.php', '?id=1'); await snap(p, 'sec-etudiant-fiche');

  await go(p, 'formateurSecretaire.php'); await snap(p, 'sec-formateurs');
  await mark(p, 'sec-for-row', 'tbody tr[data-id]');
  await p.locator('tbody tr[data-id] .js-edit').first().click(); await p.waitForTimeout(500); await snap(p, 'sec-formateur-drawer');
  await go(p, 'detailsFormateurSecretaire.php', '?id=1'); await snap(p, 'sec-formateur-fiche');

  await go(p, 'classeSecretaire.php'); await snap(p, 'sec-classes');
  await mark(p, 'sec-cla-add', '#btnAdd');
  await go(p, 'detailsClasseSecretaire.php', '?id=1'); await snap(p, 'sec-classe-details');
  await go(p, 'filiereSecretaire.php'); await snap(p, 'sec-filieres');
  await go(p, 'matiereSecretaire.php'); await snap(p, 'sec-matieres');

  // Niveaux : ajout -> suppression -> « Annuler »
  await go(p, 'niveauSecretaire.php'); await snap(p, 'sec-niveaux');
  await mark(p, 'sec-niv-add', '#btnAdd');
  await p.locator('#btnAdd').click(); await p.waitForTimeout(500);
  await p.locator('#n-code').fill('d1'); await p.locator('#n-libelle').fill('Doctorat 1'); await p.waitForTimeout(150);
  await mark(p, 'sec-niv-save', 'button[form=niveauForm]');
  await snap(p, 'sec-niveau-drawer');
  await Promise.all([p.waitForNavigation(), p.locator('button[form=niveauForm]').click()]);
  await p.waitForTimeout(450); await snap(p, 'sec-niveau-ajoute');
  await p.waitForTimeout(3600);
  const last = p.locator('article.group').last();
  await last.hover(); await mark(p, 'sec-niv-del', last.locator('.js-delete'));
  await last.locator('.js-delete').click(); await p.waitForTimeout(250); await snap(p, 'sec-niveau-modale');
  await mark(p, 'sec-niv-confirm', '#confirmDelete');
  await Promise.all([p.waitForNavigation(), p.locator('#confirmDelete').click()]);
  await p.waitForTimeout(450); await snap(p, 'sec-niveau-supprime-annuler');
  await mark(p, 'sec-niv-undo', '.js-action');
  await p.locator('.js-action').click(); await p.waitForTimeout(700); await snap(p, 'sec-niveau-restaure');
  // suppression impossible (niveau utilisé)
  await go(p, 'niveauSecretaire.php');
  await p.locator('article.group').first().hover(); await p.locator('article.group .js-delete').first().click(); await p.waitForTimeout(200);
  await Promise.all([p.waitForNavigation(), p.locator('#confirmDelete').click()]);
  await p.waitForTimeout(450); await snap(p, 'sec-niveau-impossible');

  // Emploi du temps : affecter un cours
  await go(p, 'edtSecretaire.php', '?classe=1'); await snap(p, 'sec-edt');
  await mark(p, 'sec-edt-assign', '#btnAjouter');
  const cell = p.locator('.js-add').first();
  await mark(p, 'sec-edt-cell', cell);
  await cell.click(); await p.waitForTimeout(500); await snap(p, 'sec-edt-drawer');
  await p.locator('#fMatiere').selectOption({ label: 'Algorithmique avancée' });
  await p.locator('#fFormateur').selectOption({ index: 1 }); await p.locator('#fSalle').fill('Salle A1');
  await p.locator('#fDebut').fill('14:00'); await p.locator('#fFin').fill('13:00'); await p.waitForTimeout(150);
  await p.locator('#btnEnregistrer').click(); await p.waitForTimeout(300); await snap(p, 'sec-edt-erreur-heures');
  await p.locator('#fFin').fill('16:00'); await p.waitForTimeout(150);
  await mark(p, 'sec-edt-save', '#btnEnregistrer'); await snap(p, 'sec-edt-drawer-rempli');
  await Promise.all([p.waitForNavigation(), p.locator('#btnEnregistrer').click()]);
  await p.waitForTimeout(450); await snap(p, 'sec-edt-affecte');
  await p.context().close();
}

// ================================================================= FORMATEUR
{
  console.log('Formateur');
  const p = await newPage();
  await login(p, 'demo.formateur@ecole221.sn', 'formateur');
  await snap(p, 'for-dashboard');
  await go(p, 'classeFormateur.php'); await snap(p, 'for-classes');
  await go(p, 'detailsClasseFormateur.php', '?id=1'); await snap(p, 'for-classe-details');
  await go(p, 'edtFormateur.php'); await snap(p, 'for-edt');

  await go(p, 'noteFormateur.php', '?classe=1&matiere=1&type=TP'); await snap(p, 'for-notes-vide');
  await mark(p, 'for-notes-save', 'button[form=noteForm]');
  const inputs = p.locator('.js-note');
  await mark(p, 'for-notes-first', inputs.first());
  const vals = ['15,5', '12', '9,75', '14', '17', '11,5', '13', '16'];
  for (let i = 0; i < vals.length; i++) { await inputs.nth(i).fill(vals[i]); await p.waitForTimeout(60); }
  await inputs.nth(3).fill('25'); await p.waitForTimeout(250); await snap(p, 'for-notes-erreur');
  await inputs.nth(3).fill('14'); await p.waitForTimeout(250); await snap(p, 'for-notes-saisies');
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(250); await snap(p, 'for-notes-bas');
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(150);
  await Promise.all([p.waitForNavigation(), p.locator('button[form=noteForm]').click()]);
  await p.waitForTimeout(450); await snap(p, 'for-notes-enregistrees');

  await go(p, 'presenceFormateur.php', '?seance=1&date=2026-11-02'); await snap(p, 'for-presences');
  await mark(p, 'for-pres-validate', 'button[form=appelForm]');
  const sel = p.locator('.js-statut');
  await mark(p, 'for-pres-sel', sel.nth(2));
  await sel.nth(2).selectOption('Retard'); await sel.nth(5).selectOption('Absent'); await sel.nth(8).selectOption('Retard');
  await p.locator('.js-heure').nth(2).fill('08:20'); await p.locator('.js-heure').nth(8).fill('08:35'); await p.waitForTimeout(200);
  await snap(p, 'for-presences-modifiees');
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(250); await snap(p, 'for-presences-bas');
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(150);
  await Promise.all([p.waitForNavigation(), p.locator('button[form=appelForm]').click()]);
  await p.waitForTimeout(450); await snap(p, 'for-presences-validees');
  await go(p, 'mon-profil-formateur.php'); await snap(p, 'for-profil');
  await p.locator('[data-tab=activite]').click(); await p.waitForTimeout(250); await snap(p, 'for-profil-activite');
  await p.context().close();
}

// ================================================================= ÉTUDIANT
{
  console.log('Étudiant');
  const p = await newPage();
  await login(p, 'demo.etudiant@ecole221.sn', 'etudiant');
  await snap(p, 'etu-dashboard');
  await mark(p, 'etu-planning-btn', 'a[href="edtEtudiant.php"]');
  await go(p, 'edtEtudiant.php'); await snap(p, 'etu-edt');
  await go(p, 'noteEtudiant.php'); await snap(p, 'etu-notes');
  await mark(p, 'etu-notes-filtre', '#filtreMatiere'); await mark(p, 'etu-notes-dl', '#btnTelecharger');
  await p.locator('#filtreMatiere').selectOption({ index: 1 }); await p.waitForTimeout(250); await snap(p, 'etu-notes-filtre');
  await go(p, 'profilEtudiant.php'); await snap(p, 'etu-profil');
  await p.locator('[data-tab=parcours]').click(); await p.waitForTimeout(250); await snap(p, 'etu-profil-parcours');
  await p.context().close();
}

// ================================================================= MOBILE
{
  console.log('Mobile');
  const m = await newPage({ mobile: true });
  await go(m, 'loginEcole221.php'); await snap(m, 'mob-login');
  await m.locator('#login').fill('demo.etudiant@ecole221.sn'); await m.locator('#pwd').fill('demo1234');
  await Promise.all([m.waitForNavigation(), m.locator('button[type=submit]').click()]);
  await m.waitForTimeout(500); await snap(m, 'mob-dashboard');
  await mark(m, 'mob-burger', '#openMenu');
  await m.locator('#openMenu').click(); await m.waitForTimeout(500); await snap(m, 'mob-menu');
  await m.locator('#overlay').click({ position: { x: 350, y: 400 } }); await m.waitForTimeout(400);
  await go(m, 'noteEtudiant.php'); await snap(m, 'mob-notes');
  await go(m, 'edtEtudiant.php'); await snap(m, 'mob-edt');
  await m.context().close();
}

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
await browser.close();
console.log('Terminé :', Object.keys(manifest).length, 'cibles de clic enregistrées.');
