import { erf } from "mathjs";

function cdfNormal(x, mean, standardDeviation) {
  return (1 + erf((x - mean) / (Math.sqrt(2) * standardDeviation))) / 2;
}

function errorFunction(x) {
  return cdfNormal(x, 0, Math.sqrt(1 / 2)) - cdfNormal(-x, 0, Math.sqrt(1 / 2));
}

const LT = 20;
const ΔT = 5;
const rf = 0.75;
const TLOWBOUND = 5;
const THIGHBOUND = 18;
const cvA = 2.4;
const λOB = 1.2;
const λBott = 2;
const cvB = 2;
const r0 = 0.3;

const alpha = λBott / cvB / 1000000;
const x = 10;
const t = 10;
const theta = 1 - errorFunction(x / 2 / Math.sqrt(alpha * t * 365 * 24 * 3600));

const flux = (λBott * (1 - theta)) / x;
const cvW = 4.1;
const Limit = 20.0;
const min_flurabstand = 3.0;
const max_absenkung = 5.0;
const min_absenkung = 1 / 3;
const sichardt_faktor = 3000;
const max_brunnenabstand = 250;

export const compute = ({
  brunnenabstand,
  flurabstand,
  gw_macht,
  gwt_min,
  gwt_max,
  kf,
  gst_flaeche,
  E_HZ,
  E_KL,
  P_HZ,
  P_KL,
  COP_WP,
}) => {
  let LST = 9.5;

  let BS_HZ = 0;
  if (E_HZ * P_HZ > 0) {
    BS_HZ = (1000 * E_HZ) / P_HZ;
  }

  let BS_KL = 0;
  if (E_KL * P_KL > 0) {
    BS_KL = (1000 * E_KL) / P_KL;
  }

  let BS_norm_HZ = (200 + 3380 * Math.pow(LST, -0.276)).toFixed(1);

  let BS_norm_KL = 0;
  if (LST >= 8) {
    BS_norm_KL = Math.round((LST - 8) * 180);
  }

  let ΔTHEAT = Math.max(gwt_min - TLOWBOUND, 0);

  let ΔTCOOL = Math.max(THIGHBOUND - gwt_max, 0);

  let ΔTBAL = Math.min(ΔTHEAT, ΔTCOOL);

  let Estorage = (cvA * Math.max(gw_macht, 0)) / 3.6;

  let SZeff = 0;
  if (gw_macht > 0) {
    SZeff = Math.min(gw_macht, Limit);
  }

  let Eunderground = Math.min((flux * 8760) / 1000, Estorage);

  let Esurface = Math.min(
    Math.max(
      ((λOB / (Math.max(flurabstand, min_flurabstand) + SZeff / 4)) * 4380) /
        1000,
      Eunderground
    ),
    Estorage
  );

  let s = 0;
  if (gw_macht * kf > 0) {
    s = Math.min(
      brunnenabstand / 2 / sichardt_faktor / Math.sqrt(kf),
      gw_macht * min_absenkung,
      max_absenkung
    );
  }

  let BA = Math.min(brunnenabstand, max_brunnenabstand);

  let HZzuKL = 1000;
  if (BS_HZ + BS_KL > 0) {
    if (BS_KL > 0) {
      HZzuKL = BS_HZ / BS_KL;
    }
  } else {
    if (BS_norm_KL > 0) {
      HZzuKL = BS_norm_HZ / BS_norm_KL;
    }
  }

  let EHEAT = (Estorage / LT + Esurface + Eunderground) * ΔTHEAT * rf;

  let ECOOL = (Estorage / LT + Esurface + Eunderground) * ΔTCOOL * rf;

  let EBAL = Estorage * ΔTBAL * rf;

  let EBI;
  if (HZzuKL < 1) {
    EBI = ECOOL + (EBAL - ECOOL) * HZzuKL;
  } else {
    EBI = EHEAT + (EBAL - EHEAT) / HZzuKL;
  }

  let QPEAK =
    ((Math.PI * kf * s * (2 * SZeff - s)) / Math.log(BA / 2 / r0)) * 1000;

  let PPEAK = Math.min(ΔTBAL, ΔT) * QPEAK * cvW;

  let Deck_GW = -1;
  if (E_HZ * P_HZ + E_KL * P_KL > 0) {
    if (P_HZ >= P_KL) {
      Deck_GW = (PPEAK / (P_HZ * (1 - 1 / COP_WP))) * 100;
    } else {
      Deck_GW = (PPEAK / P_KL) * 100;
    }
  }

  let Fahne = -1;
  if (E_HZ + E_KL > 0) {
    if (E_HZ >= E_KL) {
      Fahne = (100 / EBI) * ((E_HZ * 1000 * (1 - 1 / COP_WP)) / gst_flaeche);
    } else {
      Fahne = (E_KL * 1000) / gst_flaeche;
    }
  }

  return [
    EHEAT.toFixed(1),
    ECOOL.toFixed(1),
    EBAL.toFixed(1),
    EBI.toFixed(1),
    QPEAK.toFixed(1),
    PPEAK.toFixed(1),
    Deck_GW.toFixed(0),
    Fahne.toFixed(1),
  ];
};
