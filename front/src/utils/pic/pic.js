import checkDisulphideBonded from "./checkDisulphideBonded";
import checkIonicBonded from "./checkIonicBonded";
import checkArArBonded from "./checkArArBonded";
import checkArCationBonded from "./checkArCationBonded";
import checkArSulphurBonded from "./checkArSulphurBonded";
import checkHydrogenBonded from "../checkHydrogenBonded";
import checkHydrophobicBonded from "./checkHydrophobicBonded";

export default function pic(chain) {
  chain = Object.values(chain);

  const aminoAcidPairs = [];

  const groupedPairs = {};

  for (let i = 0; i < chain.length - 1; i++) {
    for (let j = i + 1; j < chain.length; j++) {

      const firstAminoAtoms = chain[i];
      const secondAminoAtoms = chain[j];
      const firstAminoId = chain[i][0].aminoAcidId;
      const secondAminoId = chain[j][0].aminoAcidId;

      [checkHydrophobicBonded, checkDisulphideBonded, checkIonicBonded, checkArArBonded, checkArCationBonded, checkArSulphurBonded].forEach(check => {
        const areBonded = check(firstAminoAtoms, secondAminoAtoms);
        if(areBonded) {
          aminoAcidPairs.push([firstAminoId, secondAminoId]);
          groupedPairs[check.name] ?
            groupedPairs[check.name].push([firstAminoId, secondAminoId]) :
            groupedPairs[check.name] = [[firstAminoId, secondAminoId]];
        }
      });

      const hydrogenBondsCount = checkHydrogenBonded(firstAminoAtoms, secondAminoAtoms);
      if (hydrogenBondsCount) {
        for(let i = 0; i < hydrogenBondsCount; i++) {
          aminoAcidPairs.push([firstAminoId, secondAminoId]);
          groupedPairs.hydrogenBonded ?
            groupedPairs.hydrogenBonded.push([firstAminoId, secondAminoId]) :
            groupedPairs.hydrogenBonded = [[firstAminoId, secondAminoId]];
        }
      }

    }
  }

  console.log('hbonded', groupedPairs.hydrogenBonded);
  return aminoAcidPairs;
}







