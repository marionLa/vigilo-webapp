# vigilo-webapp

Ce repo est un fork de l'application web [Vigilo](https://github.com/jesuisundesdeux/vigilo-webapp) 
à titre d'expérimentation.
👉 Création d'une instance locale pour le [Collectif Cycliste de la Vallée de Munster](https://munstertransition.org/le-collectif-cycliste-de-la-valle/)
Un grand ❤️ aux développeurs [jesuisundesdeux](https://github.com/jesuisundesdeux)


## 👇 Readme original  

[![Build Status](https://travis-ci.org/jesuisundesdeux/vigilo-webapp.svg?branch=master)](https://travis-ci.org/jesuisundesdeux/vigilo-webapp)


## Let's go!

```
docker-compose up
```

et aller sur http://127.0.0.1

Touche CTRL+C pour arrêter et `docker-compose down && sudo rm -rf node_modules dist package-lock.json ` pour nettoyer.

## Comment écrire ?

### Du HTML

A priori, il n'y a qu'une seule page, qui est `src/index.html`. Celle-ci ne fait appel qu'au javascript. Le CSS est chargé par le JS.

### Du JS

Le fichier principal est `src/js/main.js`. Ce fichier fait appel au CSS et aux sous-modules JS. Tout sous-module doit être inclus dans ce fichier par l'instruction `import ./submodule.js`.

Pour importer un librairie installée via npm, il suffit d'écrire `import NOM` sans le `./`.

### Du CSS

Le fichier principal est `src/css/main.scss`. Ce fichier peut contenir du CSS classique ou du SASS.
Pour faire appel à un sous-module, utiliser l'instruction `@import './submain.scss'`
Pour inclure un CSS d'un module installé avec npm, on ajoutera un tilde : `@import "~bootswatch/dist/yeti/variables"`

## Installer un module avec npm

Pour trouver un module, on peut se rendre sur npmjs.com.

Pour l'installer `docker-compose exec webpack npm install --save leaflet`

## Changement de version

```
docker-compose exec webpack npm --no-git-tag-version version [major | minor | patch]
```

## Traduction

Le dossier [./src/i18n](./src/i18n) contient les fichiers de traduction. Ce sont des couples clé/valeur.

La mise en place de la traduction se fait soit dans du HTML, soit du JS.

### Dans du HTML

Utiliser l'attribut `data-i18n` pour indiquer la clé de traduction. Le contenu du noeud courant sera remplacé totalement par la valeur de traduction. Si seulement une partie doit être traduite, il faut recourir à une balise `<span>`.

Exemple : `<span data-i18n="zone-geo">`

Le module de traduction gère également, les dates. Il faut fournir la date (`madate.toString()`) dans un attribut `data-i18n-date`.

Pour gérer la traduction d'attribut (ex : `placeholder`), il faut ajouter un attribut `data-i18n-attr` qui, pour chaque attribut à traduire fournit la clé de traduction.

Exemple : `data-i18n-attr='{"placeholder": "filter-keyword"}'`


### Dans du JS

Il faut directement utiliser la bibliothèque de traduction :

```
import i18next from 'i18next';
var string_translated = i18next.t("issue-bug");
```
