#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const exts = ['.js', '.jsx', '.css', '.html', '.md', '.txt'];

const replacements = {
  'Â·': '·',
  'Â©': '©',
  'â€”': '—',
  'â€“': '–',
  'â€™': '’',
  'â€œ': '“',
  'â€�': '”',
  'â€¢': '•',
  'â€¦': '…',
  'â€º': '›',
  'â€˜': '‘',
  '\uFFFD': '',
};

function walk(dir){
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for(const entry of list){
    const p = path.join(dir, entry.name);
    if(entry.isDirectory()){ 
      if(['node_modules','.git','dist'].includes(entry.name)) continue;
      walk(p);
    } else {
      if(exts.includes(path.extname(entry.name))){
        fixFile(p);
      }
    }
  }
}

function fixFile(file){
  let s = fs.readFileSync(file, 'utf8');
  let out = s;
  for(const [bad, good] of Object.entries(replacements)){
    if(out.indexOf(bad) !== -1){
      out = out.split(bad).join(good);
    }
  }
  if(out !== s){
    fs.copyFileSync(file, file + '.bak');
    fs.writeFileSync(file, out, 'utf8');
    console.log('Fixed:', path.relative(root, file));
  }
}

console.log('Scanning for encoding artifacts and applying conservative fixes...');
walk(root);
console.log('Done. Backups have .bak appended to each changed file. Review changes and commit if OK.');
