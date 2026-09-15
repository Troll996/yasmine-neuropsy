# 🧠 NeuroAssist IA — Secrétaire de Rédaction Neuropsychologique

Application web professionnelle pour aider la neuropsychologue clinicienne à rédiger, reformuler, structurer et harmoniser ses comptes rendus d'évaluation.

---

## 💡 Fonctionnalités principales

- **Règles cliniques strictes embarquées** : Respect absolu des observations (aucune invention), nuances (parfois, fréquemment, rapporte...), distinction des sources.
- **Convertisseur & interpréteur de scores** : Intégration directe de la grille de cotation (Notes Standard : $\le 6$ Inférieur, 7 Fragile, 8 Moyenne basse, 9–11 Moyenne, 12–13 Moyenne haute, $\ge 14$ Supérieur).
- **Apprentissage du style modèle** : Possibilité de coller un compte rendu modèle pour que l'IA imite votre écriture.
- **Actions rapides en 1 clic** : Templates pour Anamnèse, Observations, Tableau de Scores, Conclusion, Reformulation.
- **Bouton Copier** : Copiez en un clic le texte généré dans votre traitement de texte.
- **Sécurisé** : Clé API enregistrée localement dans votre navigateur ou via variable d'environnement Vercel.

---

## 🚀 Étape 1 : Tester localement sur votre ordinateur

Pour utiliser l'application tout de suite sur votre ordinateur :

1. Allez dans le dossier `c:\Users\pc\Desktop\Yasmine`
2. Double-cliquez sur le fichier `index.html` pour l'ouvrir dans votre navigateur web (Chrome, Edge, Firefox).
3. Votre clé API est déjà pré-configurée ! Vous pouvez commencer à saisir vos notes cliniques.

---

## 🌐 Étape 2 : Publier sur GitHub & Héberger gratuitement sur Vercel

Pour avoir votre propre lien web accessible de n'importe où (sur PC, Mac ou tablette) :

### A. Publier sur GitHub (en 3 minutes)
1. Allez sur [github.com](https://github.com) et connectez-vous (ou créez un compte gratuit).
2. Cliquez sur le bouton **"New"** (Nouveau dépôt).
3. Nommez-le `yasmine-neuropsy` et cliquez sur **"Create repository"**.
4. Dans le dossier `c:\Users\pc\Desktop\Yasmine`, ouvrez un terminal PowerShell et exécutez ces 4 commandes :
   ```bash
   git init
   git add .
   git commit -m "Initialisation NeuroAssist IA"
   git branch -M main
   git remote add origin https://github.com/votre-nom-utilisateur/yasmine-neuropsy.git
   git push -u origin main
   ```

### B. Héberger sur Vercel (Gratuit & Rapide)
1. Rendez-vous sur [vercel.com](https://vercel.com) et connectez-vous avec votre compte **GitHub**.
2. Cliquez sur **"Add New..."** > **"Project"**.
3. Sélectionnez le dépôt `yasmine-neuropsy`.
4. Dans la section **Environment Variables**, ajoutez :
   - **NAME** : `ANTHROPIC_API_KEY`
   - **VALUE** : `votre_cle_api_anthropic`
5. Cliquez sur **"Deploy"**.

En 30 secondes, Vercel vous donnera votre adresse web personnalisée (ex: `https://yasmine-neuropsy.vercel.app`) ! 🎉

---

## ⚙️ Structure des fichiers du projet

```
yasmine/
├── index.html       # Interface utilisateur principale
├── style.css        # Design médical premium & mode sombre
├── app.js           # Logique applicative & Prompt système complet
├── api/
│   └── chat.js      # Fonction serveur Vercel pour l'API Anthropic
├── vercel.json      # Configuration Vercel
├── .gitignore       # Fichiers ignorés par Git
└── README.md        # Ce guide d'utilisation et déploiement
```
"# yasmine-neuropsy" 
