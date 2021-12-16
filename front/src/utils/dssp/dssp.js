import range from "../range";
import distance from "../distance";
import getAbbreviationForAA from "../getAbbreviationForAA";

export default function dssp(chain) {
  let spiralResidues = getSpiralResidues(chain);

  const dsspResult = Object.values(chain).map(residue => {
    const residueId = residue[0].aminoAcidId;
    const residueName = residue[0].aminoAcidName;
    if (spiralResidues[residueId]?.isOverlapped) {
      return [residueId, getAbbreviationForAA(residueName), "H"]
    } else {
      return [residueId, getAbbreviationForAA(residueName), " "]
    }
  });
  return dsspResult;
}

function getSpiralResidues(chain) {
  let residuesOfSpiral = {};
  for (let residueId in chain) {
    const residue_i = chain[residueId];

    const residue_i_plus_4 = chain[+residueId + 4];

    if (!residue_i || !residue_i_plus_4) continue;

    const distance_to_i_plus_4 = get_O_N_distance(residue_i, residue_i_plus_4);

    if(distance_to_i_plus_4 === null) continue;

    if (distance_to_i_plus_4 < 3.5
    ) {
      const start = +residueId + 1;
      const frameResidues = [];
      const frame = new AlphaSpiralFrame(frameResidues);
      for (let id of range(4, start)) {
        if (residuesOfSpiral[id]) {
          residuesOfSpiral[id].addFrame(frame);
        } else {
          residuesOfSpiral[id] = new ResidueOfAlphaSpiral(id);
          residuesOfSpiral[id].addFrame(frame);
        }
        frameResidues.push(residuesOfSpiral[id]);
      }
    }
  }

  return residuesOfSpiral;
}


function get_O_N_distance(firstAminoAtoms, secondAminoAtoms) {

  for (let firstAtom of firstAminoAtoms) {
    for (let secondAtom of secondAminoAtoms) {

      const name1 = firstAtom.atomName;
      const name2 = secondAtom.atomName;

      if (name1 === "O" && name2 === "N") {
        return distance(firstAtom, secondAtom);
      }

    }
  }

  return null;
}

class AlphaSpiralFrame {
  constructor(frameResidues) {
    this.frameResidues = frameResidues;
  }
}

class ResidueOfAlphaSpiral {
  frames = new Set();
  isOverlapped = false;

  constructor(id) {
    this.id = id;
  }

  addFrame(frame) {
    this.frames.add(frame);
    if (this.frames.size > 1) {
      this.frames.forEach(frame => frame.frameResidues.forEach(r => r.isOverlapped = true));
    }
  }
}

