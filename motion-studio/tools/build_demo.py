#!/usr/bin/env python3
"""
Build the demo environment used to capture the real École 221 interfaces.

  python3 -I build_demo.py <uploads_dir> <demo_dir> <logo_png>

- copies the uploaded PHP pages (originals are NOT modified) into <demo_dir>/pages
- writes a config/database.php (PDO -> local MariaDB) and reconstructed sidebars
- creates the schema (inferred from the SQL found in the pages) and loads FICTIONAL data

Everything here is demo data: names, matricules, e-mails and phone numbers are invented.
"""
import os, random, re, shutil, subprocess, sys

uploads, demo, logo = sys.argv[1], sys.argv[2], sys.argv[3]
rnd = random.Random(221)

# ------------------------------------------------------------------ copy pages
pages = os.path.join(demo, "app", "pages")
os.makedirs(pages, exist_ok=True)
for d in ("config", "includes", "app/assets", "app/uploads"):
    os.makedirs(os.path.join(demo, d), exist_ok=True)
for f in sorted(os.listdir(uploads)):
    if not f.endswith(".php"):
        continue
    name = re.sub(r"^[0-9a-f]{8}-", "", f)
    shutil.copyfile(os.path.join(uploads, f), os.path.join(pages, name))
shutil.copyfile(logo, os.path.join(demo, "app", "assets", "logo-ecole221.png"))
# pages reference ../assets/ and ../uploads/ relative to /pages/ -> serve from demo root
with open(os.path.join(demo, "config", "database.php"), "w") as fh:
    fh.write("""<?php
$pdo = new PDO('mysql:unix_socket=/run/mysqld/mysqld.sock;dbname=ecole221;charset=utf8mb4', 'ecole', 'demo', [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);
""")

# ------------------------------------------------------------------ sidebars (reconstructed)
ICON = {
 "dashboard": '<path d="M3 12 12 3l9 9M5 10v10h5v-6h4v6h5V10"/>',
 "stats": '<path d="M5 21v-8M12 21V4M19 21v-12"/>',
 "etudiants": '<circle cx="9" cy="8" r="3.5"/><path d="M2 21v-1a6 6 0 0 1 12 0v1M16 4.5a3.5 3.5 0 0 1 0 7M22 21v-1a6 6 0 0 0-4-5.6"/>',
 "formateurs": '<path d="M3 3h18M4 3v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3M9 21l3-4 3 4"/>',
 "classes": '<path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M3 21h18M14 12v.01"/>',
 "filieres": '<rect x="3" y="3" width="6" height="6"/><rect x="15" y="9" width="6" height="6"/><rect x="3" y="15" width="6" height="6"/><path d="M9 6h3v12H9M12 12h3"/>',
 "niveaux": '<path d="m12 2 10 5-10 5L2 7l10-5Z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
 "matieres": '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
 "edt": '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
 "notes": '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
 "presences": '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
 "profil": '<circle cx="12" cy="7" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/>',
 "logout": '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
}
MENUS = {
 "Secretaire": [("dashboard","Tableau de bord","AccueilSecretaire.php"),("statistiques","Statistiques","statistiqueSecretaire.php"),
   ("etudiants","Étudiants","etudiantSecretaire.php"),("formateurs","Formateurs","formateurSecretaire.php"),
   ("classes","Classes","classeSecretaire.php"),("filieres","Filières","filiereSecretaire.php"),
   ("niveaux","Niveaux","niveauSecretaire.php"),("matieres","Matières","matiereSecretaire.php"),
   ("edt","Emploi du temps","edtSecretaire.php")],
 "Formateur": [("dashboard","Tableau de bord","accueilFormateur.php"),("classes","Mes classes","classeFormateur.php"),
   ("edt","Emploi du temps","edtFormateur.php"),("notes","Saisie des notes","noteFormateur.php"),
   ("presences","Présences","presenceFormateur.php"),("profil","Mon profil","mon-profil-formateur.php")],
 "Etudiant": [("dashboard","Tableau de bord","accueilEtudiant.php"),("edt","Mon planning","edtEtudiant.php"),
   ("notes","Notes & résultats","noteEtudiant.php"),("profil","Mon profil","profilEtudiant.php")],
}
ICONKEY = {"statistiques": "stats"}
for role, items in MENUS.items():
    links = ""
    for key, label, href in items:
        ic = ICON[ICONKEY.get(key, key)]
        links += f'''
      <a href="{href}" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition <?= ($active ?? '') === '{key}' ? 'bg-white text-primary shadow-sm' : 'text-white/85 hover:bg-primarydark hover:text-white' ?>">
        <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{ic}</svg> {label}
      </a>'''
    html = f'''<!-- Sidebar {role} : reconstruction (fichier d'origine non fourni) -->
<div id="overlay" class="fixed inset-0 z-30 hidden bg-black/50 lg:hidden"></div>
<aside id="sidebar" class="fixed inset-y-0 left-0 z-40 flex w-[260px] -translate-x-full flex-col bg-primary px-4 py-5 text-white transition-transform lg:translate-x-0">
  <div class="flex items-center justify-between px-1">
    <div class="flex items-center gap-3">
      <span class="flex h-11 w-10 items-center justify-center overflow-hidden rounded-lg bg-white p-1 shadow-sm"><img src="../assets/logo-ecole221.png" alt="Logo" class="h-full w-full object-contain" /></span>
      <span class="text-lg font-bold tracking-tight">École 221</span>
    </div>
    <button id="closeMenu" type="button" aria-label="Fermer le menu" class="rounded-lg p-1.5 text-white/80 hover:bg-primarydark hover:text-white lg:hidden"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
  </div>
  <nav class="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto">{links}
  </nav>
  <a href="deconnexion.php" class="mt-4 flex items-center gap-3 rounded-lg border border-white/30 px-3 py-2.5 text-sm font-medium text-white hover:bg-primarydark">
    <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{ICON["logout"]}</svg> Déconnexion
  </a>
</aside>
'''
    with open(os.path.join(demo, "includes", f"sidebar{role}.php"), "w") as fh:
        fh.write(html)

# ------------------------------------------------------------------ fictional data
def q(s):
    return "NULL" if s is None else "'" + str(s).replace("\\", "\\\\").replace("'", "\\'") + "'"

pwd = subprocess.run(["php", "-r", 'echo password_hash("demo1234", PASSWORD_DEFAULT);'],
                     capture_output=True, text=True, check=True).stdout.strip()

filieres = [
 (1,"GL","Génie Logiciel","Dr. Cheikh Mbaye","Conception, développement et maintenance d'applications modernes."),
 (2,"RT","Réseaux & Télécoms","Dr. Awa Cissé","Architecture réseaux, systèmes et infrastructures de communication."),
 (3,"IAD","IA & Data","Pr. Ousmane Kane","Science des données, apprentissage automatique et statistiques."),
 (4,"DUX","Design & UX","Mme Dieynaba Fall","Conception d'interfaces, prototypage et expérience utilisateur."),
 (5,"CYB","Cybersécurité","M. Modou Sarr","Protection des systèmes, cryptographie et tests d'intrusion."),
]
niveaux = [(1,"L1","Licence 1"),(2,"L2","Licence 2"),(3,"L3","Licence 3"),(4,"M1","Master 1"),(5,"M2","Master 2")]
# id, nom, filiere, niveau, salle, capacite, effectif
classes = [
 (1,"L3 Génie Logiciel",1,3,"A1",40,28),(2,"L2 Génie Logiciel",1,2,"A2",40,24),(3,"L1 Génie Logiciel",1,1,"A3",45,30),
 (4,"L3 IA & Data",3,3,"B1",35,22),(5,"M1 Réseaux & Télécoms",2,4,"B2",30,16),(6,"L2 Design & UX",4,2,"C1",30,20),
 (7,"M2 Cybersécurité",5,5,"C2",25,12),(8,"L1 Réseaux & Télécoms",2,1,"B3",40,26),
]
ANNEE = "2026-2027"
formateurs = [
 (1,"Seck","Ibrahima","M","Algorithmique & IA","Actif"),(2,"Cissé","Awa","F","Réseaux & Systèmes","Actif"),
 (3,"Mbaye","Cheikh","M","Génie logiciel","Actif"),(4,"Kane","Ousmane","M","Data Science","Conge"),
 (5,"Fall","Dieynaba","F","Design UX","Actif"),(6,"Sarr","Modou","M","Cybersécurité","Actif"),
 (7,"Ba","Khady","F","Bases de données","Inactif"),
]
# id, code, nom, coef, filiere, niveau
matieres = [
 (1,"ALGO3","Algorithmique avancée",4,1,3),(2,"BD3","Bases de données",3,1,3),(3,"WEB3","Développement Web",4,1,3),
 (4,"POO3","Programmation orientée objet",3,1,3),(5,"UML3","Génie logiciel & UML",2,1,3),(6,"ANG3","Anglais technique",1,1,3),
 (7,"ALGO2","Algorithmique",4,1,2),(8,"SYS2","Systèmes d'exploitation",3,1,2),
 (9,"ML3","Machine Learning",4,3,3),(10,"STAT3","Statistiques",3,3,3),
 (11,"RSX1","Architecture réseaux",4,2,4),(12,"SEC1","Sécurité réseaux",3,2,4),
 (13,"UX2","Design d'interface",4,4,2),(14,"FIG2","Prototypage Figma",3,4,2),
 (15,"CRY2","Cryptographie",4,5,5),(16,"PEN2","Tests d'intrusion",3,5,5),
 (17,"INF1","Initiation à l'algorithmique",3,1,1),(18,"MAT1","Mathématiques",3,1,1),
 (19,"ELC1","Électronique",3,2,1),(20,"RES1","Réseaux de base",3,2,1),
]
enseigner = {1:[1,4,7,9],3:[3,5,8],2:[6,11,12,19,20],4:[10],5:[13,14],6:[15,16],7:[2,17,18]}
J = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"]
S1,S2,S3 = ("08:00","10:00"),("10:15","12:15"),("14:00","16:00")
# classe, jour, créneau, matière, formateur
seances = [
 (1,"Lundi",S1,1,1),(1,"Lundi",S2,2,7),(1,"Mardi",S1,5,3),(1,"Mercredi",S2,4,1),(1,"Jeudi",S1,3,3),
 (1,"Jeudi",S2,6,2),(1,"Jeudi",S3,2,7),(1,"Vendredi",S1,3,3),(1,"Vendredi",S2,4,1),(1,"Samedi",("09:00","12:00"),1,1),
 (2,"Mardi",S1,7,1),(2,"Mercredi",S1,8,3),(4,"Jeudi",S3,9,1),(4,"Lundi",S2,10,4),
 (5,"Lundi",S1,11,2),(5,"Mardi",S2,12,2),(6,"Mercredi",S1,13,5),(6,"Jeudi",S2,14,5),
 (7,"Lundi",S3,15,6),(7,"Vendredi",S1,16,6),(3,"Mardi",S2,17,7),(3,"Jeudi",S1,18,7),
 (8,"Mercredi",S3,19,2),(8,"Vendredi",S2,20,2),
]
PRE_F = ["Aminata","Fatou","Mariama","Khady","Ndeye","Sokhna","Rokhaya","Aïssatou","Coumba","Mame","Dieynaba","Astou","Bineta","Codou","Yacine","Sophie"]
PRE_M = ["Moussa","Cheikh","Ibrahima","Abdoulaye","Mamadou","Ousmane","Pape","Modou","Babacar","Samba","Lamine","Alioune","Souleymane","Assane","Omar","Malick"]
NOMS = ["Diop","Ndiaye","Fall","Sow","Ba","Diallo","Gueye","Sarr","Faye","Mbaye","Thiam","Seck","Cissé","Kane","Niang","Sy","Diouf","Sène","Tall","Bâ","Lô","Ndao","Samb","Wade","Dione","Badji","Mendy","Coly"]
QUART = ["Sicap Liberté 4","Parcelles Assainies U15","Médina rue 11","Ouakam","Mermoz","Yoff Village","Grand Yoff","Pikine Icotaf","Guédiawaye","Fann Résidence","Liberté 6","Thiaroye","Keur Massar","HLM 5"]

etudiants = []  # id, matricule, nom, prenom, sexe, dn, email, tel, adresse, classe
used_mail = set()
def mk_email(pre, nom):
    base = (pre + "." + nom).lower()
    base = (base.replace("é","e").replace("è","e").replace("ï","i").replace("â","a").replace("ô","o")
                .replace("ç","c").replace("î","i").replace(" ",""))
    e, i = base + "@ecole221.sn", 2
    while e in used_mail:
        e, i = f"{base}{i}@ecole221.sn", i + 1
    used_mail.add(e)
    return e
eid = 0
for (cid, *_rest, eff) in classes:
    for k in range(eff):
        eid += 1
        if eid == 1:
            pre, nom, sx = "Awa", "Thiam", "F"
        else:
            sx = "F" if rnd.random() < 0.46 else "M"
            pre = rnd.choice(PRE_F if sx == "F" else PRE_M); nom = rnd.choice(NOMS)
        dn = f"{rnd.randint(1998,2007)}-{rnd.randint(1,12):02d}-{rnd.randint(1,28):02d}"
        tel = "+221 %s %03d %02d %02d" % (rnd.choice(["77","78","76","70"]), rnd.randint(100,999), rnd.randint(10,99), rnd.randint(10,99))
        etudiants.append((eid, f"221-SN-2026-{eid:04d}", nom, pre, sx, dn, mk_email(pre, nom), tel, rnd.choice(QUART), cid))

# --- notes : classe -> matières (via filière+niveau)
cls = {c[0]: c for c in classes}
def mats_of(cid):
    c = cls[cid]
    return [m for m in matieres if m[4] == c[2] and m[5] == c[3]]
def wavg(vals_by_mat, coefs):
    sn = sc = 0
    for m, v in vals_by_mat.items():
        sn += (sum(v) / len(v)) * coefs[m]; sc += coefs[m]
    return sn / sc if sc else 0
coefs = {m[0]: m[3] for m in matieres}
notes = {}   # (etu, mat, type) -> val
def r25(x): return max(0, min(20, round(x * 4) / 4))
for e in etudiants:
    base = rnd.gauss(12.4, 2.2)
    for m in mats_of(e[9]):
        notes[(e[0], m[0], "CC")] = r25(base + rnd.gauss(0, 1.6))
        notes[(e[0], m[0], "Examen")] = r25(base + rnd.gauss(0, 1.9))
        if m[0] == 4:  # POO3 a un TP
            notes[(e[0], m[0], "TP")] = r25(base + rnd.gauss(0.5, 1.4))
# ALGO3 : pas de TP (saisi pendant la capture) ; rang démo = 3e
c1 = [e[0] for e in etudiants if e[9] == 1]
def avg_of(eid_):
    vm = {}
    for (e_, m_, t_), v in notes.items():
        if e_ == eid_: vm.setdefault(m_, []).append(v)
    return wavg(vm, coefs)
for (e_, m_, t_) in list(notes):
    if e_ == 1: notes[(e_, m_, t_)] = r25(notes[(e_, m_, t_)] + 2.6)
others = sorted([x for x in c1 if x != 1], key=avg_of, reverse=True)
while sum(avg_of(x) > avg_of(1) for x in c1 if x != 1) > 2:
    for k in [k for k in notes if k[0] == 1]:
        notes[k] = r25(notes[k] + 0.25)
for top, bump in zip(others[:2], (0.9, 0.5)):
    while avg_of(top) < avg_of(1) + bump:
        for k in [k for k in notes if k[0] == top]:
            notes[k] = r25(notes[k] + 0.25)
for x in others[2:]:
    while avg_of(x) > avg_of(1) - 0.3:
        for k in [k for k in notes if k[0] == x]:
            notes[k] = r25(notes[k] - 0.25)

# --- présences : séance 1 (L3 GL, ALGO3, lundi) le 2026-11-02
presence = []
for x in c1:
    st = rnd.choices(["Present", "Retard", "Absent"], [80, 12, 8])[0]
    if x == 1: st = "Present"
    h = None if st == "Absent" else ("08:00" if st == "Present" else "08:" + rnd.choice(["12", "17", "25"]))
    obs = {"Retard": "Transport", "Absent": "Justifié"}.get(st) if rnd.random() < 0.7 else None
    presence.append((x, 1, "2026-11-02", st, h, obs))

# ------------------------------------------------------------------ SQL
sql = []
sql.append("DROP DATABASE IF EXISTS ecole221; CREATE DATABASE ecole221 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; USE ecole221;")
sql.append("""
CREATE TABLE filiere (id_filiere INT PRIMARY KEY AUTO_INCREMENT, code_filiere VARCHAR(10) UNIQUE, nom_filiere VARCHAR(100), responsable VARCHAR(100), description TEXT);
CREATE TABLE niveau (id_niveau INT PRIMARY KEY AUTO_INCREMENT, code_niveau VARCHAR(5) UNIQUE, libelle_niveau VARCHAR(50));
CREATE TABLE classe (id_classe INT PRIMARY KEY AUTO_INCREMENT, nom_classe VARCHAR(60), id_filiere INT, id_niveau INT, salle VARCHAR(20), capacite INT, annee_academique VARCHAR(20),
  FOREIGN KEY (id_filiere) REFERENCES filiere(id_filiere), FOREIGN KEY (id_niveau) REFERENCES niveau(id_niveau));
CREATE TABLE etudiant (id_etudiant INT PRIMARY KEY AUTO_INCREMENT, matricule VARCHAR(30) UNIQUE, nom VARCHAR(60), prenom VARCHAR(60), sexe CHAR(1), date_naissance DATE NULL,
  email VARCHAR(100) UNIQUE NULL, telephone VARCHAR(30) NULL, adresse VARCHAR(150) NULL, photo VARCHAR(200) NULL, id_classe INT NULL, FOREIGN KEY (id_classe) REFERENCES classe(id_classe));
CREATE TABLE formateur (id_formateur INT PRIMARY KEY AUTO_INCREMENT, matricule_formateur VARCHAR(30) UNIQUE, nom VARCHAR(60), prenom VARCHAR(60), sexe CHAR(1),
  email VARCHAR(100) UNIQUE NULL, telephone VARCHAR(30) NULL, specialite VARCHAR(100) NULL, photo VARCHAR(200) NULL, statut ENUM('Actif','Conge','Inactif') DEFAULT 'Actif');
CREATE TABLE matiere (id_matiere INT PRIMARY KEY AUTO_INCREMENT, code_matiere VARCHAR(20) UNIQUE, nom_matiere VARCHAR(100), coefficient INT DEFAULT 1, id_filiere INT NULL, id_niveau INT NULL,
  FOREIGN KEY (id_filiere) REFERENCES filiere(id_filiere), FOREIGN KEY (id_niveau) REFERENCES niveau(id_niveau));
CREATE TABLE enseigner (id_formateur INT, id_matiere INT, PRIMARY KEY (id_formateur, id_matiere), FOREIGN KEY (id_formateur) REFERENCES formateur(id_formateur), FOREIGN KEY (id_matiere) REFERENCES matiere(id_matiere));
CREATE TABLE seance (id_seance INT PRIMARY KEY AUTO_INCREMENT, jour VARCHAR(12), heure_debut TIME, heure_fin TIME, salle VARCHAR(30), id_matiere INT, id_formateur INT, id_classe INT,
  FOREIGN KEY (id_matiere) REFERENCES matiere(id_matiere), FOREIGN KEY (id_formateur) REFERENCES formateur(id_formateur), FOREIGN KEY (id_classe) REFERENCES classe(id_classe));
CREATE TABLE note (id_note INT PRIMARY KEY AUTO_INCREMENT, type_eval VARCHAR(10), valeur DECIMAL(5,2), date_eval DATE, publie TINYINT DEFAULT 0, id_etudiant INT, id_matiere INT, id_formateur INT NULL,
  FOREIGN KEY (id_etudiant) REFERENCES etudiant(id_etudiant), FOREIGN KEY (id_matiere) REFERENCES matiere(id_matiere));
CREATE TABLE presence (id_presence INT PRIMARY KEY AUTO_INCREMENT, date_presence DATE, statut VARCHAR(10), heure_arrivee TIME NULL, observation VARCHAR(150) NULL, id_etudiant INT, id_seance INT,
  FOREIGN KEY (id_etudiant) REFERENCES etudiant(id_etudiant), FOREIGN KEY (id_seance) REFERENCES seance(id_seance));
CREATE TABLE utilisateur (id_utilisateur INT PRIMARY KEY AUTO_INCREMENT, login VARCHAR(100) UNIQUE, nom VARCHAR(60), prenom VARCHAR(60), mot_de_passe VARCHAR(255), role VARCHAR(20),
  id_etudiant INT NULL, id_formateur INT NULL, actif TINYINT DEFAULT 1);
""")
def fmt(v):
    if v is None: return "NULL"
    if isinstance(v, (int, float)): return str(v)
    return q(v)
def ins(t, cols, rows):
    sql.append(f"INSERT INTO {t} ({cols}) VALUES " + ",".join("(" + ",".join(fmt(v) for v in r) + ")" for r in rows) + ";")
ins("filiere", "id_filiere,code_filiere,nom_filiere,responsable,description", filieres)
ins("niveau", "id_niveau,code_niveau,libelle_niveau", niveaux)
ins("classe", "id_classe,nom_classe,id_filiere,id_niveau,salle,capacite,annee_academique", [(c[0], c[1], c[2], c[3], c[4], c[5], ANNEE) for c in classes])
ins("etudiant", "id_etudiant,matricule,nom,prenom,sexe,date_naissance,email,telephone,adresse,id_classe", etudiants)
ftel = lambda: "+221 77 %03d %02d %02d" % (rnd.randint(100, 999), rnd.randint(10, 99), rnd.randint(10, 99))
fmail = lambda p, n: (p + "." + n).lower().replace("é", "e").replace("è", "e") + "@ecole221.sn"
ins("formateur", "id_formateur,matricule_formateur,nom,prenom,sexe,email,telephone,specialite,statut",
    [(f[0], f"FORM-2026-{f[0]:03d}", f[1], f[2], f[3], fmail(f[2], f[1]), ftel(), f[4], f[5]) for f in formateurs])
ins("matiere", "id_matiere,code_matiere,nom_matiere,coefficient,id_filiere,id_niveau", matieres)
ins("enseigner", "id_formateur,id_matiere", [(f, m) for f, ms in enseigner.items() for m in ms])
ins("seance", "id_seance,jour,heure_debut,heure_fin,salle,id_matiere,id_formateur,id_classe",
    [(i + 1, s[1], s[2][0], s[2][1], cls[s[0]][4], s[3], s[4], s[0]) for i, s in enumerate(seances)])
ins("note", "type_eval,valeur,date_eval,publie,id_etudiant,id_matiere,id_formateur",
    [(t, v, "2026-10-20", 1, e, m, 1) for (e, m, t), v in notes.items()])
ins("presence", "id_etudiant,id_seance,date_presence,statut,heure_arrivee,observation", presence)
ins("utilisateur", "login,nom,prenom,mot_de_passe,role,id_etudiant,id_formateur",
    [("demo.secretaire@ecole221.sn", "Sy", "Mariama", pwd, "secretaire", None, None),
     ("demo.formateur@ecole221.sn", "Seck", "Ibrahima", pwd, "formateur", None, 1),
     ("demo.etudiant@ecole221.sn", "Thiam", "Awa", pwd, "etudiant", 1, None)])
sql.append("DROP USER IF EXISTS 'ecole'@'localhost'; CREATE USER 'ecole'@'localhost' IDENTIFIED BY 'demo'; GRANT ALL ON ecole221.* TO 'ecole'@'localhost'; FLUSH PRIVILEGES;")

out = os.path.join(demo, "seed.sql")
with open(out, "w") as fh:
    fh.write("\n".join(sql))
subprocess.run(f"mysql -uroot < '{out}'", shell=True, check=True)
print("OK demo:", len(etudiants), "étudiants,", len(notes), "notes, rang démo calculé")
c1_avgs = sorted([avg_of(x) for x in c1], reverse=True)
print("moyenne démo %.2f, rang %d/%d" % (avg_of(1), 1 + sum(a > avg_of(1) for a in c1_avgs), len(c1)))
