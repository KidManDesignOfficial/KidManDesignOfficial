/** Ek konu anlatımı dosyaları. Her dosya bir dersin eksik konularını tamamlar. */
import type { SubjectContent } from '../../types.ts';
import tytTurkce2 from './tyt-turkce-2.ts';
import tytMat2 from './tyt-mat-2.ts';
import tytGeo2 from './tyt-geo-2.ts';
import tytFen2 from './tyt-fen-2.ts';
import tytSosyal2 from './tyt-sosyal-2.ts';
import aytMat2 from './ayt-mat-2.ts';
import aytFen2 from './ayt-fen-2.ts';

export const EXTRA: SubjectContent[] = [tytTurkce2, tytMat2, tytGeo2, ...tytFen2, ...tytSosyal2, ...aytMat2, ...aytFen2];
