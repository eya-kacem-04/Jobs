import { describe, it, expect } from 'vitest';
import { translations } from '../src/i18n/translations';
import { TUNISIAN_GOVERNORATES, ACADEMIC_SECTIONS } from '../src/constants/tunisiaData';

describe('Internationalization & Tunisian Data Integrity', () => {
  it('contains translations for both French and Arabic', () => {
    expect(translations.fr).toBeDefined();
    expect(translations.ar).toBeDefined();
  });

  it('verifies that French and Arabic dictionaries have identical key coverage', () => {
    const frKeys = Object.keys(translations.fr).sort();
    const arKeys = Object.keys(translations.ar).sort();

    const missingInAr = frKeys.filter(k => !arKeys.includes(k));
    const missingInFr = arKeys.filter(k => !frKeys.includes(k));

    expect(missingInAr).toEqual([]);
    expect(missingInFr).toEqual([]);
  });

  it('verifies all 24 Tunisian governorates are defined with both French and Arabic names', () => {
    expect(TUNISIAN_GOVERNORATES.length).toBe(24);
    for (const gov of TUNISIAN_GOVERNORATES) {
      expect(gov.nameFr).toBeTruthy();
      expect(gov.nameAr).toBeTruthy();
      expect(gov.id).toBeTruthy();
    }
  });

  it('verifies all academic sections have both French and Arabic labels', () => {
    expect(ACADEMIC_SECTIONS.length).toBeGreaterThanOrEqual(15);
    for (const sec of ACADEMIC_SECTIONS) {
      expect(sec.labelFr).toBeTruthy();
      expect(sec.labelAr).toBeTruthy();
      expect(sec.key).toBeTruthy();
    }
  });
});
