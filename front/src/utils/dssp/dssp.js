import range from "../range";
import distance from "../distance";
import getAbbreviationForAA from "../getAbbreviationForAA";
import coordinatesForHBonds from "./coordinatesForHBonds";

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

    const residue_i_plus_3 = chain[+residueId + 3];

    if (!residue_i || !residue_i_plus_4) continue;

    const O_N_distance = get_O_N_distance(residue_i, residue_i_plus_4);

    const H_atom = getH_Atom(residue_i_plus_3, residue_i, residue_i_plus_4);
    const C_atom = residue_i.find(atom => atom.atomName === "C");
    const N_atom = residue_i_plus_4.find(atom => atom.atomName === "N");
    const O_atom = residue_i.find(atom => atom.atomName === "O");

    const ON = distance(O_atom, N_atom);
    const CH = distance(C_atom, H_atom);
    const CN = distance(C_atom, N_atom);
    const OH = distance(O_atom, H_atom);

    const bonded = areBonded(ON, OH, CH, CN);

    debugger;

    if (bonded) {
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

  const O_atom = firstAminoAtoms.find(atom => atom.atomName === "O");
  const N_atom = secondAminoAtoms.find(atom => atom.atomName === "N");

  const bothFound = O_atom && N_atom;

  return bothFound ? distance(O_atom, N_atom) : null;

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

function getH_Atom(residue_i_plus_3, residue_i, residue_i_plus_4) {
  const C_atom = residue_i_plus_3.find(a => a.atomName === "C");
  const CA_atom = residue_i_plus_4.find(a => a.atomName === "CA");
  const N_atom = residue_i_plus_4.find(a => a.atomName === "N");
  const point = middle(C_atom, CA_atom);
  return extend(point, N_atom, 1);
}

function getN_H_O_angle(residue_i_plus_3, residue_i, residue_i_plus_4) {
  const id = residue_i[0].aminoAcidId;
  const C_atom = residue_i_plus_3.find(a => a.atomName === "C");
  const CA_atom = residue_i_plus_4.find(a => a.atomName === "CA");
  const N_atom = residue_i_plus_4.find(a => a.atomName === "N");
  const O_atom = residue_i.find(a => a.atomName === "O");

  const point = middle(C_atom, CA_atom);
  const H_atom = extend(point, N_atom, 1);
  return getAngle(O_atom, N_atom, H_atom);
}

function middle(p1, p2) {
  return {
    x: ((p2.x + p1.x) / 2),
    y: ((p2.y + p1.y) / 2),
    z: ((p2.z + p1.z) / 2)
  }
}

function extend(p1, p2, value) {
  const result = {};
  const dist = distance(p1, p2);
  const percent = value / dist;
  result.x = p2.x + percent * (p2.x - p1.x);
  result.y = p2.y + percent * (p2.y - p1.y);
  result.z = p2.z + percent * (p2.z - p1.z);
  return result;
}

function getAngle(a, b, c) {
  const ab = distance(a, b);
  const bc = distance(b, c);
  const ac = distance(c, a);

  const cos_b = (Math.pow(ab, 2) + Math.pow(bc, 2) - Math.pow(ac, 2)) / (2 * ab * bc);

  const rad_b = Math.acos(cos_b);

  return rad_b * 180 / Math.PI;
}

function areBonded(ON, OH, CH, CN) {
  const e = 1.60217662E-19;
  const q1 = 0.42 * e;
  const q2 = 0.2 * e;
  const E = q1 * q2 *(1/ON + 1/CH - 1/OH - 1/CN) * 332;
  console.log(E);
  return E < -0.5;
}
