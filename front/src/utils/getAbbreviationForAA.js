const dict = {
  "GLY": "G",
  "LEU": "L",
  "TYR": "Y",
  "SER": "S",
  "GLU": "E",
  "GLN": "Q",
  "ASP": "D",
  "ASN": "N",
  "PHE": "F",
  "ALA": "A",
  "LYS": "K",
  "ARG": "R",
  "HIS": "H",
  "CYS": "C",
  "VAL": "V",
  "PRO": "P",
  "HYP": "hP",
  "TRP": "W",
  "ILE": "I",
  "MET": "M",
  "THR": "T",
  "HYL": "hK"
}

export default function getAbbreviationForAA(aminoAcidName) {
  return dict[aminoAcidName];
}
