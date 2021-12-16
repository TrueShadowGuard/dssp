import parsePdb from "./utils/parsePdb";
import dssp from "./utils/dssp/dssp";
import downloadString from "./utils/downloadString";

export default async function getDsspResults(pdbFile, pdbId, need) {
  const pdbText = await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.readAsText(pdbFile);
    fr.onloadend = e => {
      resolve(fr.result);
    }
  });
  const chains = parsePdb(pdbText);
  const ourDssp = dssp(chains.A);
  const theirDssp = await getTheirDssp(pdbId);
  const theirDsspParsed = parseTheirDssp(theirDssp);
  const ourDsspWithDifference = getDifference(theirDsspParsed, ourDssp)
  need.our && downloadString(ourDssp.join("\n"), 'dssp', pdbFile.name + '_our');
  need.their && downloadString(theirDsspParsed.join("\n"), 'dssp', pdbFile.name + '_their');
  need.diff && downloadString(ourDsspWithDifference.join("\n"), 'dssp', pdbFile.name + '_diff');
}

async function getTheirDssp(pdbId) {
  const result = await fetch(`/getTheirDssp?pdbId=${pdbId}`);
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
  for (let i = 0; i < ourDsspWithDifference.length; i++) {
    const [,,ourStructure] = ourDssp[i];
    const [,,theirStructure] = theirDssp[i];
    if(ourStructure !== theirStructure) {
      ourDsspWithDifference[i].push(theirStructure);
    }
  }
  return ourDsspWithDifference;
}
