function distance(vec1, vec2) {
  return Math.sqrt(
    (vec1.x - vec2.x) ** 2 +
    (vec1.y - vec2.y) ** 2 +
    (vec1.z - vec2.z) ** 2
  );
}


function getAngle(firstAminoAtoms, secondAminoAtoms) {
  const C_atom = firstAminoAtoms.find(a => a.atomName === "C");
  const CA_atom = firstAminoAtoms.find(a => a.atomName === "CA");
  const N_atom = firstAminoAtoms.find(a => a.atomName === "N");

  const point = middle(C_atom, CA_atom);
  const H_atom = extend(point, N_atom, 1);

}

function middle(p1, p2) {
  return {
    x: Math.abs(p2.x - p1.x),
    y: Math.abs(p2.y - p1.y),
    z: Math.abs(p2.z - p1.z)
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
  const ab = distance(a,b);
  const bc = distance(b,c);
  const ac = distance(c,a);

  const cos_b = (Math.pow(ab, 2) + Math.pow(bc, 2) - Math.pow(ac, 2)) / (2 * ab * bc);

  const rad_b = Math.acos(cos_b);

  return rad_b * 360;
}
