import { ELEMENTS } from '../data/elements.js';

export const store = {
  currentTemp: 298,
  activeCategory: null,
  searchQuery: "",
  colorMode: "category",
  selectedElement: ELEMENTS[0],
  labMode: "chemical",
  activeSlot: "A",
  slotAElement: ELEMENTS[10], // Na (Z=11)
  slotBElement: ELEMENTS[16], // Cl (Z=17)
  compareA: 26,               // Fe (Z=26)
  compareB: 79                // Au (Z=79)
};
