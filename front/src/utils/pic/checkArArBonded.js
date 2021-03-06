import {ARYL_AMINO_ACIDS, centerOfAromaticRingOf} from "./common";
import distance from "../distance";

export default function checkArArBonded(firstAminoAtoms, secondAminoAtoms) {
  const firstAminoName = firstAminoAtoms[0].aminoAcidName;
  const secondAminoName = secondAminoAtoms[0].aminoAcidName;
  if (!ARYL_AMINO_ACIDS.includes(firstAminoName) || !ARYL_AMINO_ACIDS.includes(secondAminoName)) return false;
  const firstCenter = centerOfAromaticRingOf(firstAminoAtoms);
  const secondCenter = centerOfAromaticRingOf(secondAminoAtoms);
  return distance(firstCenter, secondCenter) > 3.5 && distance(firstCenter, secondCenter) < 7;
}
