export const KNOWN_COMPOUNDS = {
  "1-1": { formula: "H₂", cA: 2, cB: 0, zA: 1, zB: 1, name: "Hidrogen Molekuler", type: "Ikatan Kovalen Nonpolar", geom: "Linear (180°)", desc: "Molekul diatomik paling ringan dan bahan bakar fusi bintang.", bondCategory: "covalent", structure: {
    atoms: [
      { id: "h0", z: 1, symbol: "H", x: -35, y: 0, radius: 9, lonePairs: 0 },
      { id: "h1", z: 1, symbol: "H", x: 35, y: 0, radius: 9, lonePairs: 0 }
    ],
    bonds: [
      { from: "h0", to: "h1", order: 1 }
    ],
    angles: []
  } },
  "1-6": { formula: "CH₄", cA: 4, cB: 1, zA: 1, zB: 6, name: "Metana", type: "Ikatan Kovalen Nonpolar", geom: "Tetrahedral (109.5°)", desc: "Hidrokarbon alkana paling sederhana dan komponen utama gas alam.", bondCategory: "covalent", structure: {
    atoms: [
      { id: "center", z: 6, symbol: "C", x: 0, y: 0, radius: 13, lonePairs: 0 },
      { id: "lig0", z: 1, symbol: "H", x: 0, y: -55, radius: 9, lonePairs: 0 },
      { id: "lig1", z: 1, symbol: "H", x: -52, y: 18, radius: 9, lonePairs: 0 },
      { id: "lig2", z: 1, symbol: "H", x: 52, y: 18, radius: 9, lonePairs: 0 },
      { id: "lig3", z: 1, symbol: "H", x: 0, y: 55, radius: 9, lonePairs: 0 }
    ],
    bonds: [
      { from: "center", to: "lig0", order: 1 },
      { from: "center", to: "lig1", order: 1 },
      { from: "center", to: "lig2", order: 1 },
      { from: "center", to: "lig3", order: 1 }
    ],
    angles: [
      { a: "lig0", vertex: "center", b: "lig2", label: "109.5°" }
    ]
  } },
  "1-7": { formula: "NH₃", cA: 3, cB: 1, zA: 1, zB: 7, name: "Amonia", type: "Ikatan Kovalen Polar", geom: "Piramida Trigonal (107°)", desc: "Senyawa nitrogen-hidrogen esensial untuk sintesis pupuk dan farmasi.", bondCategory: "covalent", structure: {
    atoms: [
      { id: "center", z: 7, symbol: "N", x: 0, y: -12, radius: 13, lonePairs: 1 },
      { id: "lig0", z: 1, symbol: "H", x: -50, y: 38, radius: 9, lonePairs: 0 },
      { id: "lig1", z: 1, symbol: "H", x: 0, y: 55, radius: 9, lonePairs: 0 },
      { id: "lig2", z: 1, symbol: "H", x: 50, y: 38, radius: 9, lonePairs: 0 }
    ],
    bonds: [
      { from: "center", to: "lig0", order: 1 },
      { from: "center", to: "lig1", order: 1 },
      { from: "center", to: "lig2", order: 1 }
    ],
    angles: [
      { a: "lig0", vertex: "center", b: "lig2", label: "107°" }
    ],
    dipole: { from: "center", direction: "down", deltaEN: 0.84 }
  } },
  "1-8": { formula: "H₂O", cA: 2, cB: 1, zA: 1, zB: 8, name: "Air (Dihidrogen Monoksida)", type: "Ikatan Kovalen Polar", geom: "Bentukan V / Bent (104.5°)", desc: "Pelarut universal dengan ikatan hidrogen antarmolekul yang kuat.", bondCategory: "covalent", structure: {
    atoms: [
      { id: "center", z: 8, symbol: "O", x: 0, y: -8, radius: 14, lonePairs: 2 },
      { id: "lig0", z: 1, symbol: "H", x: -48, y: 32, radius: 9, lonePairs: 0 },
      { id: "lig1", z: 1, symbol: "H", x: 48, y: 32, radius: 9, lonePairs: 0 }
    ],
    bonds: [
      { from: "lig0", to: "center", order: 1 },
      { from: "lig1", to: "center", order: 1 }
    ],
    angles: [
      { a: "lig0", vertex: "center", b: "lig1", label: "104.5°" }
    ],
    dipole: { from: "center", direction: "down", deltaEN: 1.24 }
  } },
  "1-9": { formula: "HF", cA: 1, cB: 1, zA: 1, zB: 9, name: "Hidrogen Fluorida", type: "Asam Kovalen Polar", geom: "Linear (180°)", desc: "Prekursor kimia fluorin yang mampu bereaksi langsung dengan silika kaca.", bondCategory: "covalent", structure: {
    atoms: [
      { id: "f0", z: 9, symbol: "F", x: -30, y: 0, radius: 12, lonePairs: 3 },
      { id: "h0", z: 1, symbol: "H", x: 35, y: 0, radius: 9, lonePairs: 0 }
    ],
    bonds: [
      { from: "h0", to: "f0", order: 1 }
    ],
    angles: [],
    dipole: { from: "f0", direction: "right", deltaEN: 1.78 }
  } },
  "1-17": { formula: "HCl", cA: 1, cB: 1, zA: 1, zB: 17, name: "Asam Klorida", type: "Ikatan Kovalen Polar", geom: "Linear (180°)", desc: "Terionisasi sempurna di dalam air menghasilkan asam kuat industri.", bondCategory: "covalent", structure: {
    atoms: [
      { id: "cl0", z: 17, symbol: "Cl", x: -30, y: 0, radius: 15, lonePairs: 3 },
      { id: "h0", z: 1, symbol: "H", x: 38, y: 0, radius: 9, lonePairs: 0 }
    ],
    bonds: [
      { from: "h0", to: "cl0", order: 1 }
    ],
    angles: [],
    dipole: { from: "cl0", direction: "right", deltaEN: 0.96 }
  } },
  "6-8": { formula: "CO₂", cA: 1, cB: 2, zA: 6, zB: 8, name: "Karbon Dioksida", type: "Ikatan Kovalen Rangkap", geom: "Linear Simetris (180°)", desc: "Produk oksidasi karbon dan reaktan utama siklus fotosintesis.", bondCategory: "covalent", structure: {
    atoms: [
      { id: "center", z: 6, symbol: "C", x: 0, y: 0, radius: 13, lonePairs: 0 },
      { id: "lig0", z: 8, symbol: "O", x: -55, y: 0, radius: 14, lonePairs: 2 },
      { id: "lig1", z: 8, symbol: "O", x: 55, y: 0, radius: 14, lonePairs: 2 }
    ],
    bonds: [
      { from: "lig0", to: "center", order: 2 },
      { from: "center", to: "lig1", order: 2 }
    ],
    angles: [
      { a: "lig0", vertex: "center", b: "lig1", label: "180°" }
    ]
  } },
  "6-14": { formula: "SiC", cA: 1, cB: 1, zA: 6, zB: 14, name: "Silikon Karbida", type: "Jaringan Kovalen", geom: "Tetrahedral Wurtzite", desc: "Semikonduktor daya tegangan tinggi dan keramik teknis sangat keras.", bondCategory: "covalent", structure: {
    atoms: [
      { id: "si0", z: 14, symbol: "Si", x: 0, y: -10, radius: 15, lonePairs: 0 },
      { id: "c0", z: 6, symbol: "C", x: -50, y: 35, radius: 13, lonePairs: 0 },
      { id: "c1", z: 6, symbol: "C", x: 50, y: 35, radius: 13, lonePairs: 0 },
      { id: "c2", z: 6, symbol: "C", x: 0, y: -65, radius: 13, lonePairs: 0 },
      { id: "c3", z: 6, symbol: "C", x: 0, y: 55, radius: 13, lonePairs: 0 }
    ],
    bonds: [
      { from: "si0", to: "c0", order: 1 },
      { from: "si0", to: "c1", order: 1 },
      { from: "si0", to: "c2", order: 1 },
      { from: "si0", to: "c3", order: 1 }
    ],
    angles: [
      { a: "c0", vertex: "si0", b: "c1", label: "109.5°" }
    ]
  } },
  "8-12": { formula: "MgO", cA: 1, cB: 1, zA: 12, zB: 8, name: "Magnesium Oksida", type: "Kristal Ionik", geom: "Kubik Berpusat Muka (FCC)", desc: "Mineral periklas refraktori dengan titik leleh tinggi (3125 K).", bondCategory: "ionic", structure: {
    cation: { z: 12, symbol: "Mg", charge: "2+", x: -40, y: 0, radius: 13 },
    anion: { z: 8, symbol: "O", charge: "2−", x: 40, y: 0, radius: 14 },
    electronTransfer: { from: "cation", to: "anion", count: 2 }
  } },
  "8-13": { formula: "Al₂O₃", cA: 2, cB: 3, zA: 13, zB: 8, name: "Aluminium Oksida", type: "Kristal Ionik-Kovalen", geom: "Trigonal Heksagonal", desc: "Lapisan pasivasi tahan korosi dan struktur kristal batu safir/rubi.", bondCategory: "ionic", structure: {
    cation: { z: 13, symbol: "Al", charge: "3+", x: -40, y: 0, radius: 13 },
    anion: { z: 8, symbol: "O", charge: "2−", x: 40, y: 0, radius: 14 },
    electronTransfer: { from: "cation", to: "anion", count: 3 }
  } },
  "8-14": { formula: "SiO₂", cA: 1, cB: 2, zA: 14, zB: 8, name: "Silikon Dioksida (Silika)", type: "Jaringan Kovalen 3D", geom: "Tetrahedral Kuarsa", desc: "Penyusun utama kerak kontinental Bumi, pasir kuarsa, dan serat optik.", bondCategory: "covalent", structure: {
    atoms: [
      { id: "center", z: 14, symbol: "Si", x: 0, y: 0, radius: 15, lonePairs: 0 },
      { id: "lig0", z: 8, symbol: "O", x: -55, y: -30, radius: 14, lonePairs: 2 },
      { id: "lig1", z: 8, symbol: "O", x: 55, y: -30, radius: 14, lonePairs: 2 },
      { id: "lig2", z: 8, symbol: "O", x: -55, y: 30, radius: 14, lonePairs: 2 },
      { id: "lig3", z: 8, symbol: "O", x: 55, y: 30, radius: 14, lonePairs: 2 }
    ],
    bonds: [
      { from: "center", to: "lig0", order: 1 },
      { from: "center", to: "lig1", order: 1 },
      { from: "center", to: "lig2", order: 1 },
      { from: "center", to: "lig3", order: 1 }
    ],
    angles: [
      { a: "lig0", vertex: "center", b: "lig1", label: "109.5°" }
    ]
  } },
  "8-22": { formula: "TiO₂", cA: 1, cB: 2, zA: 22, zB: 8, name: "Titanium Dioksida", type: "Oksida Logam Transisi", geom: "Tetragonal Rutile", desc: "Semikonduktor fotokatalis dan pigmen indeks bias tinggi.", bondCategory: "ionic", structure: {
    cation: { z: 22, symbol: "Ti", charge: "4+", x: -40, y: 0, radius: 14 },
    anion: { z: 8, symbol: "O", charge: "2−", x: 40, y: 0, radius: 14 },
    electronTransfer: { from: "cation", to: "anion", count: 4 }
  } },
  "8-26": { formula: "Fe₂O₃", cA: 2, cB: 3, zA: 26, zB: 8, name: "Besi(III) Oksida (Hematit)", type: "Oksida Ionik", geom: "Rombohedral Korundum", desc: "Bijih besi utama sekaligus produk oksidasi korosi besi.", bondCategory: "ionic", structure: {
    cation: { z: 26, symbol: "Fe", charge: "3+", x: -40, y: 0, radius: 14 },
    anion: { z: 8, symbol: "O", charge: "2−", x: 40, y: 0, radius: 14 },
    electronTransfer: { from: "cation", to: "anion", count: 3 }
  } },
  "11-17": { formula: "NaCl", cA: 1, cB: 1, zA: 11, zB: 17, name: "Natrium Klorida", type: "Ikatan Ionik Murni", geom: "Kisi Kubik Halit (FCC)", desc: "Garam ionik klasik hasil transfer elektron valensi 3s¹ ke 3p⁵.", bondCategory: "ionic", structure: {
    cation: { z: 11, symbol: "Na", charge: "+", x: -40, y: 0, radius: 12 },
    anion: { z: 17, symbol: "Cl", charge: "−", x: 40, y: 0, radius: 16 },
    electronTransfer: { from: "cation", to: "anion", count: 1 }
  } },
  "29-30": { formula: "CuZn", cA: 1, cB: 1, zA: 29, zB: 30, name: "Paduan Kuningan (Brass)", type: "Ikatan Logam (Alloy)", geom: "Kisi Substitusi Alfa/Beta", desc: "Paduan Tembaga-Seng dengan sifat akustik dan ketahanan aus unggul.", bondCategory: "metallic", structure: {
    ions: [
      { z: 29, symbol: "Cu", charge: "2+", x: -40, y: -30, radius: 13 },
      { z: 30, symbol: "Zn", charge: "2+", x: 40, y: -30, radius: 13 },
      { z: 29, symbol: "Cu", charge: "2+", x: -40, y: 30, radius: 13 },
      { z: 30, symbol: "Zn", charge: "2+", x: 40, y: 30, radius: 13 },
      { z: 29, symbol: "Cu", charge: "2+", x: 0, y: 0, radius: 13 }
    ],
    electronCount: 4
  } },
  "29-50": { formula: "Cu₃Sn", cA: 3, cB: 1, zA: 29, zB: 50, name: "Paduan Perunggu (Bronze)", type: "Ikatan Logam (Alloy)", geom: "Kisi Intermetalik", desc: "Paduan metalurgi bersejarah dengan ketahanan korosi air laut tinggi.", bondCategory: "metallic", structure: {
    ions: [
      { z: 29, symbol: "Cu", charge: "2+", x: -50, y: -30, radius: 13 },
      { z: 29, symbol: "Cu", charge: "2+", x: 50, y: -30, radius: 13 },
      { z: 29, symbol: "Cu", charge: "2+", x: 0, y: 35, radius: 13 },
      { z: 50, symbol: "Sn", charge: "4+", x: 0, y: -5, radius: 15 }
    ],
    electronCount: 5
  } }
};
