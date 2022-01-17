import parsePdb from "./utils/parsePdb";
import dssp from "./utils/dssp/dssp";
import downloadString from "./utils/downloadString";

export default async function getDsspResults(pdbFile, need) {
  const pdbText = await readFile(pdbFile);
  const chains = parsePdb(pdbText);

  const ourDssp = dssp(chains.A);

  const theirDssp = (need.their || need.diff) && await getTheirDssp(pdbFile);
  const theirDsspParsed = (need.their || need.diff) && parseTheirDssp(theirDssp);
  const ourDsspWithDifference = need.diff && getDifference(theirDsspParsed, ourDssp);

  need.our && downloadString(ourDssp.join("\n"), 'dssp', pdbFile.name + '_our');
  need.their && downloadString(theirDsspParsed.join("\n"), 'dssp', pdbFile.name + '_their');
  need.diff && downloadString(ourDsspWithDifference.join("\n"), 'dssp', pdbFile.name + '_diff');
}

async function getTheirDssp(pdbFile) {
  const form = new FormData();
  form.append('file', pdbFile);
  const result = await fetch(`/getTheirDssp`, {
    method: 'POST',
    body: form,
  });
  return await result.text();
}

function parseTheirDssp(dssp) {
  return dssp.split('\n').slice(28).map(row => {
    const residueId = row.slice(0, 5).trim();
    const aminoAcidAbbreviation = row.slice(13, 14).trim();
    const structure = (row.slice(16, 17) === 'H') ? 'H' : ' '
    return [residueId, aminoAcidAbbreviation, structure]
  });
}

function getDifference(theirDssp, ourDssp) {
  const ourDsspWithDifference = [...ourDssp];
  let mismatches = 0;
  let reduntant = 0;
  let missing = 0;
  for (let i = 0; i < ourDsspWithDifference.length; i++) {
    const [, , ourStructure] = ourDssp[i];
    const [, , theirStructure] = theirDssp[i];
    ourDsspWithDifference[i].push(theirStructure);
    if (ourStructure !== theirStructure) {
      if (theirStructure === " ") reduntant++;
      else missing++;
      mismatches++;
    }
  }
  ourDsspWithDifference.unshift("Match all: " + (100 - (mismatches / ourDssp.length * 100)));
  ourDsspWithDifference.unshift("Redundant: " + reduntant);
  ourDsspWithDifference.unshift("Missing: " + missing);
  return ourDsspWithDifference;
}

async function readFile(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.readAsText(file);
    fr.onloadend = e => {
      resolve(fr.result);
    }
  });
}
