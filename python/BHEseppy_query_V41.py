"""
 V32:  Unabhängig von GST Input
       ohne BB 50 m
 V40:  Zusammenfassung Unterprogramme L1+L3, mit g-funktionberechnung davor, L2 unverändert
       Polynomfiles verbessert, bis 1600 Sonden
       Iterationsbegrenzung
 V41:  Ein-Ausgabefile Error

 Calculation of g-functions using uniform heat extraction rates.

Programm zur Grobdimensionierung von Erdwärmesonden für Funktion 2 (Grundstücksabfrage)
Funktionsweise:
1) Liest Eingabefile "BHE_seppy_INPUT.txt" (tab getrennt) vom gleichen Speicherort ein, wo das Skript (.py) liegt
2) Das Eingabefile beinhaltet den Header zur Eingabe fixer Parameter gefolgt von den Eingangsdaten für die Berechnungspunkte
3) Der Header ist gekennzeichnet mit '#' als erstes Zeichen gefolgt von der ParameterID P01-P10
4) Jeder Berechnungspunkt muss folgende Infos als Input, in dieser Reihenfolge, enthalten:
    - EZNr - Punkt Nr (integer)
    - BT - Bodentemperatur (float)
    - UT - Untergrundtemperatur GT (float)
    - lamda - Wärmeleitfähgigkeit Untergrund (float)
    - BS_HZ_Norm - Norm Betreibsstunden Heizen (float)
    - BS_KL_Norm - Norm Betriebsstunden Kühlen (float)
    - BS_HZ - Gebäude Vollasstunden Heizen (float)
    - BS_KL - Gebäude Vollasstunden Kühlen (float)
    - P_HZ - Gebäude Heizlast (float)
    - P_KL - Gebäude Kühllast (float)
    - FF -  Freifläche am Grundstück (float)

    Sind die Werte BS_HZ, BS_KL, P_HZ, P_KL gleich Null, wird an dem Grundstück keine Dimensionierung auf Gebäudeebene durchgeführt
    ist die FF (Freifläche =0) wird kein Gesamtpotenzial fürs Grunstück berechnet
5) Die g-Funktionen können entweder direkt mit dem Plugin "pygfunction" berechnet werden, oder mit vorberechneten Werten für kompakte Sondenfelder.
   Die Vorberechnung wurde für einen Sondenabstand von 5 m und 10 m mit Polygonen 13ten Grades durchgeführt und den beiden nachfolgenden Files abgespeichert:
    - gfunc_poly1600_10m.npy
    - gfunc_poly1600_5m.npy
    --> d.h. wenn sich diese npy-Files im gleichen Ordner befinden wie das py-Skriptfile und im Header (#P07-#P08) ein Sondenabstand von 5 m oder 10 m vorgeben ist, so müssen
             die g-Funktionen nicht neu berechnet werden -> große Rechenzeitersparnis!
6) das Programm erkennt automatisch eine bilanzierte Vorgabe (Heizbedarf = Kühlbedarf mit Abweichung max. 3 %) und setzt den Sondenabstand entsprechend der Vorgabe im Header #P08.
7) Die Simulationsdauer ist im Header mit #P03 vorgegeben (z.b. 20 Jahre). Wenn Heizenergiebearf > Kühlenergiebedarf wird mit einer Heizsaison (Winter) begonnen mit der entsprechenden
   Dauer der Jahresbetriebssstunden aus dem Inputfile. z.b. 2000 h heizen, 2380 h natürliche Regeneration, 1000 h kühlen, 3380 h natürliche Regeneration. Diese Funktion wird für
   jedes Jahr der Lebenszeit (#P03) wiederholt. Das Ergebis ist die Leistung am Ende der Heizsaison im letzten Betriebsjahr.
   Wenn Kühlenergiebedarf > Heizenergiebearf, so wird mit der Kühlsaison (Sommer) begonnen und die mögliche Leistung im letzten Jahr am Ende der Kühlsaison als Ergebnis ausgegeben.
8) Die Ergebnisse werden im File "BHE_seppy_OUTPUT.txt" gemeinsam mit dem Inputs wieder ausgegeben. Die Ergebnisse sind:
    -  P2_spez,         spezifische Sondenleistung nach 20 Jahren Betrieb, ensprechend der Gebäudevorgaben, in W/lm
    -  Sondenanzahl 	notwendige Anzahl der Sonden
    -  BM               Bohrtiefe, in m
    -  Area             notwendige Fläche für das Sondenfeld, in m²
    -  Level3[1]        spezifische Sondenleistung nach 20 Jahren Betrieb, ensprechend der Norm_Betriebsstunden (Klimaabhängig), in W/lm
    -  cover            Deckungsbeitrag (Angebot/Bedarf) in %

"""

from __future__ import absolute_import, division, print_function
from multiprocessing import freeze_support

import sys
import os

import numpy as np
import math

import pygfunction as gt
import re


def main():
    # -------------------------------------------------------------------------
    # Simulation parameters
    # -------------------------------------------------------------------------

    # Site dependent parameters, , standard values - will be replaced from file input
    BS_HZ = 2000.0
    BS_KL = 200.0
    P_HZ = 10.0
    P_KL = 14.5

    # Thermal properties, standard values - will be replaced from file input
    GT = 11.75      # mean ground temperature
    lamda = 2.0     # heat conductivity of the earth (W/m/K)

    # Temperature Limits, Life Time, standard values - will be replaced from file input
    Tmin = -1.5     # minimum Fluid Temperature for Heating (°C)
    Tmax = 25       # Maximum Fluid Temperature for Cooling (°C)
    years = 20        # integer

    # Borehole dimensions, standard values - will be replaced from file input
    D = 1.0         # Borehole buried depth (m)
    H = 100.0       # Borehole length (m)
    r_b = 0.075     # Borehole radius (m)
    B = 10          # Borehole spacing (m)
    Rb = 0.071

    polyfile = [0, 0]

    # Find relative path of application for File I/O
    if getattr(sys, 'frozen', False):
        application_path = os.path.dirname(sys.argv[0])
        print("frozen")
    else:
        application_path = os.path.dirname(os.path.abspath(__file__))

    fileload = os.path.join(application_path, 'gfunc_poly1600_10m.npy')
    try:
        gf_load_10m = np.load(fileload)
    # except IOError:
    except FileNotFoundError:
        gf_load_10m = 0
        print("\n!!! WARNING: Polynoms 10m - File not accessible\n")
        polyfile[1] = 0
    except:
        gf_load_10m = 0
        print("\n!!! WARNING: Polynoms 10m - File not found\n")
        polyfile[1] = 0
    else:
        print("\nPolynom File for 10 m found\n")
        polyfile[1] = 1

    fileload = os.path.join(application_path, 'gfunc_poly1600_5m.npy')
    try:
        gf_load_5m = np.load(fileload)
    # except IOError:
    except FileNotFoundError:
        gf_load_5m = 0
        print("\n!!! WARNING: Polynoms 5m - File not accessible\n")
        polyfile[0] = 0
    except:
        gf_load_5m = 0
        print("\n!!! WARNING: Polynoms 5m - File not found\n")
        polyfile[0] = 0
    else:
        print("\nPolynom File for 5 m found\n")
        polyfile[0] = 1

    # minimum Fluid Temperature for Heating (°C)
    Tmin = float("-1.5")
    # Maximum Fluid Temperature for Cooling (°C)
    Tmax = float("25")
    # operating time
    years = int("20")
    # Borehole buried depth (m)
    D = float("0")
    # Borehole length (m)
    # H = float("100")
    H = float(sys.argv[12])
    # Borehole radius (m)
    r_b = float("0.075")

    # Borehole spacing for unbalanced load (m)
    BB_unbal = float("10")
    AreaFF_BB_unbal = calc_AreaFF(BB_unbal)

    # Borehole spacing for balanced load (m)
    BB_bal = float("5")
    AreaFF_BB_bal = calc_AreaFF(BB_bal)

    Rb = float("0.071")

    # volumetric heat capacity of the earth (MJ/m³/K)
    cv = float("2.2")

    # parcel related input parameters
    GstNr = int(sys.argv[1])
    BT = float(sys.argv[2])
    GT = float(sys.argv[3])
    lamda = float(sys.argv[4])
    BS_HZ_Norm = float(sys.argv[5])
    BS_KL_Norm = float(sys.argv[6])
    BS_HZ = float(sys.argv[7])
    BS_KL = float(sys.argv[8])
    P_HZ = float(sys.argv[9])
    P_KL = float(sys.argv[10])
    FF = int(sys.argv[11])

    print('\n')
    print(
        "=================================================================")
    print("================ GstNr: ", GstNr, "================")

    # end of reading line from input data

    # D  I  M  E  N  S  I  O  N  I  N  G
    # calculate Values for Level 2, if heating or cooling demand available
    if abs(P_HZ*BS_HZ) > 0 or abs(P_KL*BS_KL) > 0:
        Level2 = calculateL2(GstNr, GT, lamda, BS_HZ, BS_KL, P_HZ, P_KL, Tmin, Tmax, years, D, H, r_b,
                             BB_unbal, BB_bal, Rb, cv, gf_load_10m, gf_load_5m, polyfile)  # return P_fin,SA_min,BM,Area,SA
    else:
        # return P_fin,SA,BM,Area,EFactorA, PFactorA, BB
        Level2 = np.array([0, 0, 0, 0, 0, 0, 0])

    # calculate Values for Level 3: First calculate how many BHE can be placed on the given area FF
    SA_FF = 0

    if Level2[0] > 0:
        BS_HZ_L3 = BS_HZ
        BS_KL_L3 = BS_KL
        EFactor = Level2[4]
        PFactor = Level2[5]
    else:
        BS_HZ_L3 = BS_HZ_Norm
        BS_KL_L3 = BS_KL_Norm
        PFactor = 1.0
        EFactor = BS_HZ_Norm/BS_KL_Norm

    if (EFactor > 0.97 and EFactor < 1.03):
        SA_FF = calc_SAFF(AreaFF_BB_bal, FF)
        BB_L3 = BB_bal
        gf_load = gf_load_5m
    else:
        SA_FF = calc_SAFF(AreaFF_BB_unbal, FF)
        BB_L3 = BB_unbal
        gf_load = gf_load_10m

    if SA_FF > 0:
        Level3 = calculateL3(GstNr, GT, lamda, BS_HZ_L3, BS_KL_L3, Tmin, Tmax,
                             years, D, H, r_b, BB_L3, Rb, cv, gf_load, SA_FF, PFactor, polyfile)
    else:
        Level3 = np.array([0, 0])

    Pot_L2 = Level2[0]*Level2[1]*H
    Pot_L3 = Level3[1]*SA_FF*H

    if Pot_L2 > 0:
        cover = int(Pot_L3/Pot_L2*100.0)
        print("Covercalc P3 P2 cover:")
        print("%f %f %f" % (Pot_L3, Pot_L2, cover))
    else:
        cover = 0

    # returns input arguments and P2, Sondenanzahl, BM, Area, P_fin_bi,  cover
    line = sys.argv[1:12] + list(map(str, [Level2[0], Level2[1],
                                           Level2[2], Level2[3], Level3[1], cover]))

    print(line)


def gpoly(time, ts, gf_load, SA, H, r_b):
    # print("approximate gfunction from polynom")
    if SA > 900:
        ix = 103
    elif SA > 400:
        ix = 102
    elif SA > 100:
        ix = 101
    else:
        ix = SA

    # unterhalb lnES(anal) wird mit analytischer Formel für Einzelsonden approximiert
    anal = -6.5
    coeff = gf_load[:, ix-1]
    # print(coeff)
    lnES = np.log(time/ts)
    # Berechnung der gfunction mit Polynomapproximation
    gfun = np.polynomial.polynomial.polyval(lnES, coeff)
    # Polynome wurden berechnet von lnES -6.5 bis LnES = +4.0
    # Ersetze gfunction bei LnES < -6.5 mit Formel für Einzselsonden
    gfun[lnES < anal] = np.log(H/2/r_b)+0.5*lnES[lnES < anal]
    # print(gfun)
    return gfun


def calc_SAFF(AreaFF, FF):
    # calculate maximum number of BHEs on a given Area FF
    SA_FF = 0
    i = 1
    while i < len(AreaFF):
        if FF < AreaFF[1, 2]:  # wenn Freifläche FF kleiner als Minimaler Platz für Einzelsonde
            SA_FF = 0
            break
        elif FF > AreaFF[i, 2]:
            SA_FF = int(AreaFF[i, 1])
            i = i+1
        else:
            break
    print("SA_FF=", SA_FF)
    print("FF=", FF)
    return SA_FF


def calc_AreaFF(BB):
    # calculate needed area vector with spacing BB
    # for BHE number 1 to 100, plus 400,900,1024,1600
    # AreaFF Spalte 1 = Sondenanzahl
    # AreaFF Spalte 2 = notwendige Fläche
    Rand = 2
    SAi = 1
    SA_max = 1600
    ix = 1
    ixmax = 104
    AreaFF = np.zeros((ixmax+1, 3))
    while ix <= ixmax:
        N_1 = int(math.floor(math.sqrt(SAi)))
        N_2 = int(math.ceil(SAi/N_1))
        SA_diff = N_1*N_2-SAi
        AL = (N_1-1)*BB+2*Rand
        AB = (N_2-1)*BB+2*Rand
        AreaFF[ix, 1] = SAi
        AreaFF[ix, 2] = int(AL*AB-SA_diff*BB*BB)

        ix = ix+1
        if ix == 101:
            SAi = 400
        elif ix == 102:
            SAi = 900
        elif ix == 103:
            SAi = 1600
        else:
            SAi = SAi+1
    return AreaFF


def calculateL2(GstNr, GT, lamda, BS_HZ, BS_KL, P_HZ, P_KL, Tmin, Tmax, years, D, H, r_b, BB_unbal, BB_bal, Rb, cv, gf_load_unbal, gf_load_bal, polyfile):

    iter_max = 5  # set maximum number of iterations

    print("-----------------------------------------------------------------")
    print("Level 2 processing GST.Nr.: ", GstNr)
    print("-----------------------------------------------------------------")

    alpha = lamda/cv*1.0e-6    # Ground thermal diffusivity (m2/s)

    if P_KL == 0 or BS_KL == 0:
        PFactorA = 20.0
        EFactorA = 20.0
    elif P_HZ == 0 or BS_HZ == 0:
        PFactorA = 0.05
        EFactorA = 0.05
    else:
        PFactorA = P_HZ/P_KL              # Leistungsfaktor P_HZ=P_Faktor*P_KL
        EFactorA = P_HZ*BS_HZ/P_KL/BS_KL  # Wärme-Kälte-faktor
    BS_KL = max(BS_KL, 50.0)
    BS_HZ = max(BS_HZ, 50.0)

    # delta T and Pfactor
    deltaT_HZ = GT-Tmin
    deltaT_KL = Tmax-GT
    PFactor = PFactorA
    print('deltaT_HZ=', deltaT_HZ)
    print('deltaT_KL=', deltaT_KL)
    print('Pfactor=', PFactorA)
    print('Efactor=', EFactorA)

    # prüfe ob bilanziert oder unbilanzierte Energieentnahme
    if (EFactorA > 0.97 and EFactorA < 1.03):  # Speicherbetrieb
        BB = BB_bal
        gf_load = gf_load_bal
        print('bilanzierter Betrieb, Sondenabstand=', BB)
    else:
        BB = BB_unbal
        gf_load = gf_load_unbal
        print('unbilanzierter Betrieb, Sondenabstand=', BB)

    # Define time vector.
    ts = H**2/(9.*alpha)            # Bore field characteristic time

    t_HZ = np.arange(BS_HZ, 8760.0*years+BS_HZ, 8760)
    t_HZS = np.arange(8760/2, 8760.0*years+8760/2, 8760)
    t_KL = np.arange(8760/2+BS_KL, 8760.0*years+8760/2+BS_KL, 8760)
    t_KLS = np.arange(8760, 8760.0*years+8760, 8760)

    t_KL_rev = np.arange(BS_KL, 8760.0*years+BS_KL, 8760)
    t_HZ_rev = np.arange(8760/2+BS_HZ, 8760.0*years+8760/2+BS_HZ, 8760)

    # print('time=',time)

    # -------------------------------------------------------------------------
    # Borehole fields, Estimate number of BHEs
    # -------------------------------------------------------------------------
    BT_dim = H*1.2
    P1 = 30.0
    if EFactorA >= 1:
        # SA=math.ceil(P_HZ*1000.0/P1/BT)
        SA = int(P_HZ*1000.0/P1/BT_dim+0.6)  # round up from 0.4
        print("Time function for heating power:")
        print("timeHZ  = %4d bis %4d" % (0, t_HZ[0]))
        print("timeHZS = %4d bis %4d" % (t_HZ[0], t_HZS[0]))
        print("timeKL  = %4d bis %4d" % (t_HZS[0], t_KL[0]))
        print("timeKLS = %4d bis %4d" % (t_KL[0], t_KLS[0]))
    else:
        # SA=math.ceil(P_KL*1000.0/P1/BT)
        SA = int(P_KL*1000.0/P1/BT_dim+0.6)  # round up from 0.4
        print("Time function for cooling power:")
        print("timeKL  = %4d bis %4d" % (0, t_KL_rev[0]))
        print("timeKLS = %4d bis %4d" % (t_KL_rev[0], t_HZS[0]))
        print("timeHZ  = %4d bis %4d" % (t_HZS[0], t_HZ_rev[0]))
        print("timeHZS = %4d bis %4d" % (t_HZ_rev[0], t_KLS[0]))

    # Define time vector
    t_HZ = t_HZ*3600
    t_HZS = t_HZS*3600
    t_KL = t_KL*3600
    t_KLS = t_KLS*3600
    t_KL_rev = t_KL_rev*3600
    t_HZ_rev = t_HZ_rev*3600
    time = np.concatenate(
        (t_HZ, t_HZS, t_KL, t_KLS, t_KL_rev, t_HZ_rev), axis=0)

    # -------------------------------------------------------------------------
    # Evaluate g-functions for the given BHE field
    # -------------------------------------------------------------------------
    SA = max(SA, 1)
    SA_corr = 1
    iter = 0
    while (SA_corr != 0):   # Iterative Berechnung
        iter = iter+1
        print("")
        print("Sondenanzahl  =%3d" % SA)
        N_1 = int(math.floor(math.sqrt(SA)))
        N_2 = int(math.ceil(SA/N_1))
        print("Sondenfeld  =%3d  x%3d" % (N_1, N_2))

        if ((BB == 5 and polyfile[0] == 1) or (BB == 10 and polyfile[1] == 1)):
            print("Calculate g-fuction with polynom approximation")
            gfunc = gpoly(time, ts, gf_load, SA, H, r_b)
        else:
            print("Calculate g-fuction with pygfunction")
            print(" Sondenabstand: ", BB)
            print(" Sondentiefe: ", H)
            print(" Sondenkopf: ", D)
            print(" Bohrlochradius: ", r_b)
            boreField1 = gt.boreholes.rectangle_field(
                N_1, N_2, BB, BB, H, D, r_b)
            gfunc = gt.gfunction.uniform_heat_extraction(
                boreField1, time, alpha, disp=True)
            gfunc = np.array(gfunc)
            # print(gfunc.shape)
            # print(gfunc)

        PP = calculateL2_PFin(SA, EFactorA, PFactor, gfunc,
                              P_HZ, P_KL, deltaT_HZ, deltaT_KL, years, Rb, lamda)
        # return P_fin, P2
        P_fin = PP[0]
        P2 = PP[1]
        BM = int(P2*1000.0/P_fin/SA)

        print("Es werden %3d Sonden zu je %3d m benoetigt" % (SA, BM))
        # Korrektur Anzahl Sonden, ab x.3 wird aufgerundet
        SA_new = int(P2*1000.0/P_fin/BT_dim+0.7)
        SA_corr = SA_new-SA

        if (SA_corr != 0 and SA_new > 0 and iter <= iter_max):
            SA = SA_new
            print("Iteration: ", iter, "_Korrektor Sondenanzahl: ", (SA_corr))
        else:
            SA_new = SA
            SA_corr = 0

        SA = SA_new  # set new Sondenanzahl SA for next iteration
       # err=err+1

    BM = int(P2*1000.0/P_fin/SA)
    print(" iteration fertig")

    # calculate area needed for the BHE field:
    Rand = 2
    N_1 = int(math.floor(math.sqrt(SA)))
    N_2 = int(math.ceil(SA/N_1))
    SA_diff = N_1*N_2-SA
    print("SA_diff=", SA_diff, "B=", BB)
    AL = (N_1-1)*BB+2*Rand
    AB = (N_2-1)*BB+2*Rand
    Area = int(AL*AB-SA_diff*BB*BB)
    print("BHE_Field= %3d x %3d, Area = %3d m x %3d m = %5d m²" %
          (N_1, N_2, AL, AB, Area))

    return P_fin, SA, BM, Area, EFactorA, PFactorA, BB


def calculateL2_PFin(SA, EFactorA, PFactor, gfunc, P_HZ, P_KL, deltaT_HZ, deltaT_KL, years, Rb, lamda):
    # sum g-factor of 1st Phase of every year
    A = np.sum(gfunc[0:years])
    # sum g-factor of 2nd Phase of every year, except last year
    B = np.sum(gfunc[years:years*2-1])
    # sum g-factor of 3rd Phase of every year, except last year
    C = np.sum(gfunc[years*2:years*3-1])
    # sum g-factor of 4th Phase of every year, except last year
    D = np.sum(gfunc[years*3:years*4-1])

    # sum g-factor of 1st Phase of every year, cooling first
    A2 = np.sum(gfunc[years*4:years*5])
    # sum g-factor of 3rd Phase of every year, except last year
    C2 = np.sum(gfunc[years*5:years*6-1])

    print("           Jahr2 / Jahr %3d" % (years))

    if EFactorA < 0.1:
        # calculate total g-factor for cooling only
        gf_tot4_20J = -A2+D
        gf_tot4_2J = -gfunc[years*4]-gfunc[years*4+1]+gfunc[years*3]
        P_Kl_20J = deltaT_KL/(-Rb+gf_tot4_20J/2/(math.pi)/lamda)
        P_Kl_2J = deltaT_KL/(-Rb+gf_tot4_2J/2/(math.pi)/lamda)
        print("P_KL    = %6.1f / %6.1f W/lfm" % (P_Kl_2J, P_Kl_20J))
        P_finKl = min(abs(P_Kl_20J), abs(P_Kl_2J))
        BM_HZ = 0
        BM_KL = int(P_KL*1000.0/P_finKl/SA)
    elif EFactorA <= 10:
        # calculate total g-factor for heating first, then cooling
        gf_tot1_20J = A+B/PFactor-C/PFactor-D
        gf_tot1_2J = gfunc[0]+gfunc[1]+gfunc[years] / \
            PFactor-gfunc[years*2]/PFactor-gfunc[years*3]
        P_HzKl_20J = deltaT_HZ/(Rb+gf_tot1_20J/2/(math.pi)/lamda)
        P_HzKl_2J = deltaT_HZ/(Rb+gf_tot1_2J/2/(math.pi)/lamda)
        print("P_HZ+KL = %6.1f / %6.1f W/lfm" % (P_HzKl_2J, P_HzKl_20J))
        # calculate total g-factor for cooling first, then heating
        gf_tot3_20J = -A2-B*PFactor+C2*PFactor+D
        gf_tot3_2J = -gfunc[years*4]-gfunc[years*4+1] - \
            gfunc[years]*PFactor+gfunc[years*5]*PFactor+gfunc[years*3]
        P_KlHz_20J = deltaT_KL/(-Rb+gf_tot3_20J/2/(math.pi)/lamda)
        P_KlHz_2J = deltaT_KL/(-Rb+gf_tot3_2J/2/(math.pi)/lamda)
        print("P_KL+HZ = %6.1f / %6.1f W/lfm" % (P_KlHz_2J, P_KlHz_20J))
        P_finHz = min(abs(P_HzKl_20J), abs(P_HzKl_2J))
        P_finKl = min(abs(P_KlHz_20J), abs(P_KlHz_2J))
        BM_HZ = int(P_HZ*1000.0/P_finHz/SA)
        BM_KL = int(P_KL*1000.0/P_finKl/SA)
    else:
        # calculate total g-factor for heating only
        gf_tot2_20J = A-D
        gf_tot2_2J = gfunc[0]+gfunc[1]-gfunc[years*3]
        P_Hz_20J = deltaT_HZ/(Rb+gf_tot2_20J/2/(math.pi)/lamda)
        P_Hz_2J = deltaT_HZ/(Rb+gf_tot2_2J/2/(math.pi)/lamda)
        print("P_HZ    = %6.1f / %6.1f W/lfm" % (P_Hz_2J, P_Hz_20J))
        P_finHz = min(abs(P_Hz_20J), abs(P_Hz_2J))
        BM_HZ = int(P_HZ*1000.0/P_finHz/SA)
        BM_KL = 0

    BM = max(BM_HZ, BM_KL)
    print("BMH=%3d BMK=%3d BM=%3d" % (BM_HZ, BM_KL, BM))

    if BM == BM_HZ:
        P2 = P_HZ
        P_fin = P_finHz
    else:
        P2 = P_KL
        P_fin = P_finKl

    print("P_fin= %6.1f W/lfm" % (P_fin))

    return P_fin, P2


def calculateL3(GstNr, GT, lamda, BS_HZ, BS_KL, Tmin, Tmax, years, D, H, r_b, BB, Rb, cv, gf_load, SA_FF, PFactor, polyfile):

    print("-----------------------------------------------------------------")
    print("LEVEL 3 processing GST.Nr.: ", GstNr)
    print("-----------------------------------------------------------------")
    alpha = lamda/cv*1.0e-6    # Ground thermal diffusivity (m2/s)
    print("alpha= ", alpha)

    BS_KL = max(BS_KL, 50.0)
    BS_HZ = max(BS_HZ, 50.0)

    # delta T and Pfactor
    deltaT_HZ = GT-Tmin
    deltaT_KL = Tmax-GT
    # PFactor = deltaT_HZ / deltaT_KL
    # PFactor=1.0
    EFactorA = PFactor*BS_HZ/BS_KL

    print('GT=', GT)
    print('deltaT_HZ=', deltaT_HZ)
    print('deltaT_KL=', deltaT_KL)
    print('BS_HZ=', BS_HZ)
    print('BS_KL=', BS_KL)
    print('lamda=', lamda)

    # input("Press Enter to continue...")

    # Define time vector.
    ts = H**2/(9.*alpha)            # Bore field characteristic time

    t_HZ = np.arange(BS_HZ, 8760.0*years+BS_HZ, 8760)
    t_HZS = np.arange(8760/2, 8760.0*years+8760/2, 8760)
    t_KL = np.arange(8760/2+BS_KL, 8760.0*years+8760/2+BS_KL, 8760)
    t_KLS = np.arange(8760, 8760.0*years+8760, 8760)

    t_KL_rev = np.arange(BS_KL, 8760.0*years+BS_KL, 8760)
    t_HZ_rev = np.arange(8760/2+BS_HZ, 8760.0*years+8760/2+BS_HZ, 8760)

    t_HZ = t_HZ*3600
    t_HZS = t_HZS*3600
    t_KL = t_KL*3600
    t_KLS = t_KLS*3600
    t_KL_rev = t_KL_rev*3600
    t_HZ_rev = t_HZ_rev*3600
    time = np.concatenate(
        (t_HZ, t_HZS, t_KL, t_KLS, t_KL_rev, t_HZ_rev), axis=0)

    SA = min(SA_FF, 1600)
    print("Sondenanzahl  =%3d" % SA)
    N_1 = int(math.floor(math.sqrt(SA)))
    N_2 = int(math.ceil(SA/N_1))
    print("Sondenfeld  =%3d  x%3d" % (N_1, N_2))

    if ((BB == 5 and polyfile[0] == 1) or (BB == 10 and polyfile[1] == 1)):
        print("Calculate g-fuction with polynom approximation")
        gfunc = gpoly(time, ts, gf_load, SA, H, r_b)
    else:
        # input("TEST ... Press Enter to continue...")
        print("Calculate g-fuction with pygfunction")
        print(" Sondenabstand: ", BB)
        print(" Sondentiefe: ", H)
        print(" Sondenkopf: ", D)
        print(" Bohrlochradius: ", r_b)
        boreField1 = gt.boreholes.rectangle_field(N_1, N_2, BB, BB, H, D, r_b)
        gfunc = gt.gfunction.uniform_heat_extraction(
            boreField1, time, alpha, disp=True)
        gfunc = np.array(gfunc)

    # sum g-factor of 2nd Phase (natural recover) of every year, except last year
    B = np.sum(gfunc[years:years*2-1])
    # sum g-factor of 4th Phase (natural recover)of every year, except last year
    D = np.sum(gfunc[years*3:years*4-1])

    print("           Jahr2 / Jahr %3d" % (years))

    if EFactorA < 1:
        # sum g-factor of 1st Phase of every year, cooling first
        A2 = np.sum(gfunc[years*4:years*5])
        # sum g-factor of 3rd Phase of every year, except last year
        C2 = np.sum(gfunc[years*5:years*6-1])
        # calculate total g-factor for cooling first, then heating
        gf_tot3_20J = -A2-B*PFactor+C2*PFactor+D
        gf_tot3_2J = -gfunc[years*4]-gfunc[years*4+1] - \
            gfunc[years]*PFactor+gfunc[years*5]*PFactor+gfunc[years*3]
        print("gf=", gf_tot3_20J)
        P_KlHz_20J = deltaT_KL/(-Rb+gf_tot3_20J/2/(math.pi)/lamda)
        P_KlHz_2J = deltaT_KL/(-Rb+gf_tot3_2J/2/(math.pi)/lamda)
        print("P_KL+HZ = %6.1f / %6.1f W/lfm" % (P_KlHz_2J, P_KlHz_20J))
        P_fin_bivalent = min(abs(P_KlHz_20J), abs(P_KlHz_2J))

        # calculate total g-factor for cooling only
        gf_tot4_20J = -A2+D
        gf_tot4_2J = -gfunc[years*4]-gfunc[years*4+1]+gfunc[years*3]
        P_Kl_20J = deltaT_KL/(-Rb+gf_tot4_20J/2/(math.pi)/lamda)
        P_Kl_2J = deltaT_KL/(-Rb+gf_tot4_2J/2/(math.pi)/lamda)
        print("gf=", gf_tot4_20J)
        print("P_KL    = %6.1f / %6.1f W/lfm" % (P_Kl_2J, P_Kl_20J))
        P_fin_univalent = min(abs(P_Kl_20J), abs(P_Kl_2J))

    else:
        # sum g-factor of 1st Phase of every year, heating first
        A = np.sum(gfunc[0:years])
        # sum g-factor of 3rd Phase of every year, except last year
        C = np.sum(gfunc[years*2:years*3-1])

        # calculate total g-factor for heating first, then cooling
        gf_tot1_20J = A+B/PFactor-C/PFactor-D
        gf_tot1_2J = gfunc[0]+gfunc[1]+gfunc[years] / \
            PFactor-gfunc[years*2]/PFactor-gfunc[years*3]
        P_HzKl_20J = deltaT_HZ/(Rb+gf_tot1_20J/2/(math.pi)/lamda)
        P_HzKl_2J = deltaT_HZ/(Rb+gf_tot1_2J/2/(math.pi)/lamda)
        print("gf=", gf_tot1_20J)
        print("P_HZ+KL = %6.1f / %6.1f W/lfm" % (P_HzKl_2J, P_HzKl_20J))
        P_fin_bivalent = min(abs(P_HzKl_20J), abs(P_HzKl_2J))

        # calculate total g-factor for heating only
        gf_tot2_20J = A-D
        gf_tot2_2J = gfunc[0]+gfunc[1]-gfunc[years*3]
        P_Hz_20J = deltaT_HZ/(Rb+gf_tot2_20J/2/(math.pi)/lamda)
        P_Hz_2J = deltaT_HZ/(Rb+gf_tot2_2J/2/(math.pi)/lamda)
        print("gf=", gf_tot2_20J)
        print("P_HZ    = %6.1f / %6.1f W/lfm" % (P_Hz_2J, P_Hz_20J))
        P_fin_univalent = min(abs(P_Hz_20J), abs(P_Hz_2J))

    return P_fin_univalent, P_fin_bivalent


# Main function
if __name__ == '__main__':
    freeze_support()

    main()
