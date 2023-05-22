"""
V5.0_beta:  Komplette Neuprogrammierung der Potenzialberechnung
            Vorgegeben werden die Positionen des Erdsondenfeldes (beliebige Koordinaten), die Volllaststunden für Heizen und Kühlen, sowie das gewünschte Leistungsverhältnis (PHZ/PKL) auf der kalten Seite der Wärmepumpe
            Wenn keine Vorgabe der Volllaststunden vorhanden, werden die Norm_Betriebsstunden verwendet und als Leistungsverhältnis das deltaT von ungestörter Untergrundtemperatur zu den Heiz-Kühllimits
            Ergebnis bei Leistungsvorgabe:  Sondenleistung pro Laufmeter Sonde für Heizen und Kühlen, unter Einhaltung des Leistungsverhältnisses und BEtriebsstunden sowie Deckungsgrad
            Ergebnis ohne Leistungsvorgabe: Sondenleistung pro Laufmeter Sonde für Heizen und Kühlen, unter Einhaltung Normbetriebsstunden
            zusätzlich wird das Leistungspotenzial bei ausgeglichener Jahresenergiebilanz berechnet
            zusätzlich werden die Ergebnisse grafisch ausgegeben!

Calculation of g-functions using uniform heat extraction rates.

Programm zur Erstdimensionierung von Erdwärmesonden für ein Grundstück, nach Vorgabe der Positionen des Erdsondenfeldes und Optional die Leistungen und Volllaststunden für Heizen und Kühlen

beta5:  Grafikausgabe DEUTSCH
        COP und EER Vorgabe möglich - vorerst fix COP=5 und EER=0
        option für Berechnung der NORMBS
        option für Definition Sondenfeld als Rechteck oder mit Koordinaten
        Berechnung der durchschnittlichen Entfernung der nächsten Nachbarsonden, bei Vorgabe mit Koordinaten
        SA_FF ersetzt durch nBoreholes  
        Berücksichtige COP, SCOP, EER und SEER bei der Leistungsvorgabe
        
beta6:  Vorgabe der Vorlauftemperatur des Heizsystems zur Berechnung des COP (neuer parameter "T_radiator")
        Berücksichtige Steigerung der Unergrundtemperatur bei Sonden tiefer als 100 m: (neuer parameter "gradient", "GT_calc")
        deaktiviere 3D Bohrgrafik
        Berechne Steigerung der Leistung bei BALANCED mode (neuer parameter: "cover_rise")
        Enable/Disable DEBUG or RESULT print messages
        
"""

from __future__ import absolute_import, division, print_function
from multiprocessing import freeze_support

import sys
import os

import numpy as np

import pygfunction as gt
from scipy.constants import pi
import matplotlib.pyplot as plt

import base64
import io


def main():
    # -------------------------------------------------------------------------
    # Simulation parameters
    # -------------------------------------------------------------------------

    # Find relative path of application for File I/O
    if getattr(sys, 'frozen', False):
        application_path = os.path.dirname(sys.argv[0])
        print("frozen")
    else:
        application_path = os.path.dirname(os.path.abspath(__file__))

    PNGPath = os.path.join(application_path, 'Results_userdefined.png')
    PNGPath_bal = os.path.join(application_path, 'Results_autobalanced.png')
    PNGPath_borefield = os.path.join(application_path, 'borefield.png')

    # Enable or Disable DEBUG print messages and RESULT print messages
    DEBUG = False
    RESULT = False

    def log(s):
        if DEBUG:
            print(s)

 # DEFINE FIXED PARAMETERS (FOR EXPERT USE)
    # Define coefficient of performance for heat pump, value "0" is direct heating or cooling
    # COP = float("5")
    # EER = float("0")

    Tmin = float("-1.5")    # minimum Fluid Temperature for Heating (°C)
    Tmax = float("28")      # Maximum Fluid Temperature for Cooling (°C)
    years = int("20")       # operating time
    D = float("1.")         # Borehole buried depth (m)
    r_b = float("0.075")    # Borehole radius (m)
    flowrate = float("0.4")  # flow rate per borehole (kg/s)
    cv = float("2.2")       # volumetric heat capacity of the earth (MJ/m³/K)
    # ground temperature gradient (K/m) for depth dependent ground temperature
    gradient = float("0.03")

    # calculate scenario for balanced load if BALANCED > 0
    BALANCED = 1

 # DEFINE SITE-DEPENDENT PARAMETERS
    # import mean surface temperature °C from map
    BT = float(sys.argv[1])
    GT = float(sys.argv[2])               # mean underground temperature °C
    # heat conductivity of the earth (W/m/K)
    lamda = float(sys.argv[3])
    # typical operational hours for heating (h/yr)
    BS_HZ_Norm = float(sys.argv[4])
    # typical operational hours for cooling (h/yr)
    BS_KL_Norm = float(sys.argv[5])
    # known operational hours for heating  (h/yr)
    BS_HZ = float(sys.argv[6])
    BS_KL = float(sys.argv[7])            # known operational hours for cooling
    P_HZ = float(sys.argv[8])             # known heating power of heat pump
    # known cooling power (of heat pump), has to be negative
    P_KL = -float(sys.argv[9])
    H = float(sys.argv[10])               # Borehole length (m)
    T_radiator = float(sys.argv[11])

    # GT          = float("11.6")             # mean underground temperature (°C)
    # lamda       = float("2.0")              # heat conductivity of the earth (W/m/K)
    # BS_HZ       = float("0")             # operational hours for heating  (h/yr)
    # BS_KL       = float("0")                # operational hours for cooling (h/yr)
    # P_HZ        = float("17")               # heating power of building (kW)
    # P_KL        = float("-11.5")            # cooling power of building, use NEGATIVE VALUES! (kW)
    # H           = float("250")               # Borehole length (m)
    # T_radiator  = float("35")               # inlet temperature of heating system (30 - 60 °C) for COP calculation

    # # option 1.1:
    # # calculate typical operation hours from BT:
    # BT         = float("11.8")      # mean surface temperature °C
    # BS_HZ_Norm = np.round(200. + 3380. * np.power(BT,-0.276),0)
    # BS_KL_Norm = np.round(max((BT-8.)*180.,0.),0)

    # # option 1.2:
    # # import typical operation hours from maps
    # BS_HZ_Norm = float(sys.argv[5])       # typical operational hours for heating (h/yr)
    # BS_KL_Norm = float(sys.argv[6])       # typical operational hours for cooling (h/yr)
    # BS_HZ_Norm  = float("1902")            # typical operational hours for heating (h/yr)
    # BS_KL_Norm  = float("1000")            # typical operational hours for cooling (h/yr)

 # DEFINE BHE Field
    # option 2.1: define rectangular field
    # if N_1 or N_2 zero, then borefiled is defined from coordinates of bore_position
    N_1 = int("0")
    # if N_1 and N_2 >0, then borefiled ignored and rectangular field is defined
    N_2 = int("0")
    # Borehole spacing for unbalanced load (m), if bore_position is ignored
    BB = float("5")

    # option 2.2: define coordinates of bore_positions, can be irregular, if ractangular field is not defined
    # bore_position=np.array([[ 0.,  0.], [ 0.,  5.], [0.,  10.], [ 5.,  0.], [ 5.,  5.]])
    l = list(map(lambda x: x.strip(" []"), sys.argv[12].split(",")))
    bore_position_temp = []
    for i in range(0, len(l) - 1, 2):
        bore_position_temp.append([float(l[i]), float(l[i + 1])])
    bore_position = np.array(bore_position_temp)

    log('\n')
    log("=================================================================")

    # calculate depth dependent underground temperature
    if (H > 100.):
        GTcalc = GT + (H-100)/2 * gradient
    else:
        GTcalc = GT
    # calculate maximum deltaT
    deltaT_HZ = GTcalc - Tmin
    deltaT_KL = GTcalc - Tmax  # negative

   # if the field is defined by retangular array N_1 x N_2
    log(f"calculate bore field")
    if (N_1 > 0 and N_2 > 0):
        if ((N_1*N_2) == 1):
            BB_L3 = (f"of infinite")
        else:
            BB_L3 = (f"of {BB} m")
        boreField = gt.boreholes.rectangle_field(N_1, N_2, BB, BB, H, D, r_b)
        bore_position = np.zeros([N_1*N_2, 2], dtype=float)
        nBoreholes = len(boreField)
        BB_mean = BB
    else:
        # for bore field with coordinates: create boreField with xy coordinates
        b = []
        for i in (range(len(bore_position))):
            b.append(gt.boreholes.Borehole(H=H, D=D, r_b=r_b,
                     x=bore_position[i, 0], y=bore_position[i, 1]))
        # remove duplicates:
        b = gt.boreholes.remove_duplicates(b, disp=DEBUG)

        nBoreholes = len(b)

        if nBoreholes > 1:
            # calculate BHE distances and direction
            np.set_printoptions(threshold=np.inf, formatter={
                                'float': '{: 0.3f}'.format})
            MATdistance = np.zeros((len(b), len(b)))
            MATquadrant = np.zeros((len(b), len(b)), dtype=int)
            NEAREST = np.tile(np.nan, (len(b), 4))
            for i in (range(len(b))):
                b1 = b[i]
                xy1 = b[i].position()
                for j in (range(len(b))):
                    b2 = b[j]
                    xy2 = b[j].position()
                    MATdistance[i, j] = b1.distance(b2)
                    XX, YY = np.subtract(xy2, xy1)
                    # caculate Direction (Quadrant)
                    if (XX > 0 and YY >= 0):
                        MATquadrant[i, j] = 1  # in 1st quadrant or pos x-axis
                    elif (XX <= 0 and YY > 0):
                        MATquadrant[i, j] = 2  # in 2nd quadrant or pos y-axis
                    elif (XX < 0 and YY <= 0):
                        MATquadrant[i, j] = 3  # in 3rd quadrant or neg x-axis
                    elif (XX >= 0 and YY < 0):
                        MATquadrant[i, j] = 4  # in 4th quadrant or neg y-axis
                    else:
                        MATquadrant[i, j] = 5  # ident
                MATdistance[i, i] = 0.  # distance b1 to themselve = zero

                # calculate nearest distance in each quadrant for all BHEs
                for k in range(4):
                    a = (MATdistance[i, :][MATquadrant[i, :] == k+1])
                    if (np.size(a) > 0):
                        NEAREST[i, k] = min(a)
            # log(MATdistance)
            # log(MATquadrant)
            # log(NEAREST)
            BB_mean = np.nanmean(NEAREST)
            BB_mean = np.round(np.nanmean(NEAREST), 1)
            log(f"mean distance to other BHEs: {BB_mean}")
        else:
            BB_mean = 0.

        boreField = b
        BB_L3 = ("given by coordinates")

    divider = nBoreholes * H

    if (T_radiator > 29. and T_radiator < 90.):
        Qc, Qe, Pel = get_COP_potential(T_radiator, -3., 1.)
        COP = Qc/Pel
        Qc, Qe, Pel = get_COP_potential(30., 18., 1.)
        EER = Qe/Pel
        log(f"COP calculation with {T_radiator:.1f} °C and -3°C: {COP:.2f}")
        log(f"EER calculation with 30 °C and 18°C: {EER:.2f}")

    # clarify heating/cooling cases
    if (BS_HZ == 0):
        P_HZ = 0.
    if (BS_KL == 0):
        P_KL = 0.
    if (P_HZ == 0):
        BS_HZ = 0.
    if (P_KL == 0):
        BS_KL = 0.

    # if defined, use given building demand
    if (abs(P_HZ*BS_HZ) > 0. or abs(P_KL*BS_KL) > 0.):
        BS_HZ_L3 = BS_HZ
        BS_KL_L3 = BS_KL

        if (COP > 0.):
            P_HZ = P_HZ * (1-1/COP)
        if (EER > 0.):
            P_KL = P_KL * (1+1/EER)

        if (P_KL == 0.):
            Pfactor = 1000.
        elif (P_HZ == 0.):
            Pfactor = 1/1000.
        else:
            Pfactor = P_HZ / -P_KL

        if (BS_HZ_L3 == 0):
            Efactor = 0.
        elif (BS_KL_L3 > 0 and Pfactor < 100.):
            Efactor = Pfactor * BS_HZ_L3 / BS_KL_L3
        else:
            Efactor, BS_KL_L3 = 1000., 0.
        case = "user"
    # if NOT defined, use typical operation hours
    else:
        BS_HZ_L3 = BS_HZ_Norm
        BS_KL_L3 = BS_KL_Norm
        Pfactor = deltaT_HZ/-deltaT_KL
        if (BS_KL_L3 > 0):
            Efactor = Pfactor * BS_HZ_L3 / BS_KL_L3
        else:
            Efactor = 1000.

        Efactor = Pfactor*BS_HZ_Norm/BS_KL_Norm
        case = "norm"

    if (Efactor > 0.9 and Efactor < 1.1):
        BALANCED = 0
        log("BALANCED MODE DEAKTIVATED")

    # predefinitions
    Efactor_bal = 1.0
    Pfactor_bal = 1.0
    PHZ_L3_bal, PKL_L3_bal = 0., 0.
    PHZ_L3, PKL_L3 = 0., 0.
    coverHZ,     coverKL,     cover_user = np.nan, np.nan, np.nan
    coverHZ_bal, coverKL_bal, cover_bal, cover_rise = np.nan, np.nan, np.nan, np.nan
    Eel_heatpump_user, Eel_chiller_user = 0., 0.
    Eel_heatpump_bal, Eel_chiller_bal = 0., 0.
    Pel_heatpump_user, Pel_chiller_user = 0., 0.
    Pel_heatpump_bal, Pel_chiller_bal = 0., 0.
    SCOP, SEER, SCOP_bal, SEER_bal = 0., 0., 0., 0.

    # if BHEs are defined, calculate POTENTIAL with user-defined or standard power ratio and operational hours
    image_hash = ""
    image_hash_bal = ""
    image_hash_borefield = ""
    if (nBoreholes > 0):
        PHZ_L3, PKL_L3, Efactor, SCOP, SEER, image_hash, image_hash_borefield = calculateL3(
            GTcalc, lamda, BS_HZ_L3, BS_KL_L3, Tmin, Tmax, years, D, H, r_b, cv, Pfactor, flowrate, boreField, PNGPath, PNGPath_borefield, T_radiator, DEBUG, RESULT)
    # if BHEs are defined, calculate POTENTIAL with automatic balanced power ratio and operational hours
    BS_HZ_bal = 0
    BS_KL_bal = 0
    if (nBoreholes > 0 and BALANCED > 0):
        Pfactor_bal = deltaT_HZ/-deltaT_KL
        if (BS_HZ_L3 >= BS_KL_L3):
            BS_HZ_bal = max(BS_HZ_L3, BS_KL_L3)
            BS_KL_bal = np.floor(min(4000., BS_HZ_bal*Pfactor_bal/Efactor_bal))
        else:
            BS_KL_bal = max(BS_HZ_L3, BS_KL_L3)
            BS_HZ_bal = np.floor(min(4000., BS_KL_bal/Pfactor_bal*Efactor_bal))
        PHZ_L3_bal, PKL_L3_bal, Efactor_bal, SCOP_bal, SEER_bal, image_hash_bal, _ = calculateL3(
            GTcalc, lamda, BS_HZ_bal, BS_KL_bal, Tmin, Tmax, years, D, H, r_b, cv, Pfactor_bal, flowrate, boreField, PNGPath_bal, "", T_radiator, DEBUG, RESULT)

    if (RESULT):
        printdemand(case, P_HZ, P_KL, BS_HZ, BS_KL,
                    COP, EER, T_radiator, GTcalc, lamda)
    if (RESULT):
        printratio(Efactor, Pfactor)

    # return user defined results:
    P_HZ_user = PHZ_L3*divider/1000.    # potential from BHEs in kW
    P_KL_user = PKL_L3*divider/1000.    # potential from BHEs in kW
    E_HZ_user = P_HZ_user * BS_HZ_L3    # potential from BHEs in kWh
    E_KL_user = P_KL_user * BS_KL_L3    # potential from BHEs in kWh
    Efactor_user = Efactor
    if (COP > 0):
        # electric power for heating kW
        Pel_heatpump_user = P_HZ_user / (COP - 1)
    if (EER > 0):
        # electric power for cooling kW
        Pel_chiller_user = P_KL_user / (EER + 1)
    if (SCOP > 0):
        # electric power for heating kWh
        Eel_heatpump_user = E_HZ_user / (SCOP - 1)
    if (SEER > 0):
        # electric power for cooling kWh
        Eel_chiller_user = E_KL_user / (SEER + 1)
    if (P_HZ > 0):
        coverHZ = 100.0 / (P_HZ*BS_HZ) * E_HZ_user    # %
    if (P_KL < 0):
        coverKL = 100.0 / (P_KL*BS_KL) * E_KL_user    # %
    if (np.isfinite(coverHZ) or np.isfinite(coverKL)):
        cover_user = np.nanmin([coverHZ, coverKL])   # %

    if (RESULT):
        printresults(case, P_HZ_user, P_KL_user, E_HZ_user, E_KL_user, cover_user, Pel_heatpump_user, Pel_chiller_user,
                     Eel_heatpump_user, Eel_chiller_user, nBoreholes, H, BB_L3, BB_mean, 0., COP, EER, SCOP, SEER)
    if (RESULT):
        printratio(Efactor_user, Pfactor)
    user_defined_results = [case, P_HZ_user, P_KL_user, E_HZ_user, E_KL_user, cover_user, Pel_heatpump_user, Pel_chiller_user, Eel_heatpump_user,
                            Eel_chiller_user, nBoreholes, H, BB_L3, BB_mean, 0., COP, EER, SCOP, SEER, Efactor_user, image_hash, image_hash_borefield, GTcalc]

    # return automatic balanced results:
    P_HZ_bal = P_KL_bal = E_HZ_bal = E_KL_bal = cover_bal = 0
    if (BALANCED > 0):
        P_HZ_bal = PHZ_L3_bal*divider/1000.
        P_KL_bal = PKL_L3_bal*divider/1000.
        E_HZ_bal = P_HZ_bal * BS_HZ_bal
        E_KL_bal = P_KL_bal * BS_KL_bal
        Efactor_bal = Efactor_bal
        if (COP > 0):
            # electric power for heating kW
            Pel_heatpump_bal = P_HZ_bal / (COP - 1)
        if (EER > 0):
            # electric power for cooling kW
            Pel_chiller_bal = P_KL_bal / (EER + 1)
        if (SCOP_bal > 0):
            # electric power for heating kW
            Eel_heatpump_bal = E_HZ_bal / (SCOP_bal - 1)
        if (SEER_bal > 0):
            # electric power for heating kW
            Eel_chiller_bal = E_KL_bal / (SEER_bal + 1)
        if (P_HZ > 0):
            coverHZ = 100.0 / (P_HZ*BS_HZ) * E_HZ_bal     # %
        if (P_KL < 0):
            coverKL = 100.0 / (P_KL*BS_KL) * E_KL_bal     # %
        if (np.isfinite(coverHZ) or np.isfinite(coverKL)):
            cover_bal = np.nanmin([coverHZ, coverKL])   # %
        if (Efactor_user < 1):  # more cooling
            cover_rise = (P_KL_bal-P_KL_user) / P_KL_user * 100.
        else:  # more cooling
            cover_rise = (P_HZ_bal-P_HZ_user) / P_HZ_user * 100.

        if (RESULT):
            printresults("AUTO-BALANCED", P_HZ_bal, P_KL_bal, E_HZ_bal, E_KL_bal, cover_bal, Pel_heatpump_bal, Pel_chiller_bal,
                         Eel_heatpump_bal, Eel_chiller_bal, nBoreholes, H, BB_L3, BB_mean, cover_rise, COP, EER, SCOP_bal, SEER_bal)
        if (RESULT):
            printratio(Efactor_bal, Pfactor_bal)

    automatic_results = [BALANCED, P_HZ_bal, P_KL_bal, E_HZ_bal, E_KL_bal, cover_bal, Pel_heatpump_bal, Pel_chiller_bal, Eel_heatpump_bal, Eel_chiller_bal,
                         nBoreholes, H, BB_L3, BB_mean, cover_rise, COP, EER, SCOP_bal, SEER_bal, Efactor_bal, image_hash_bal, BS_HZ_bal, BS_KL_bal, T_radiator]
    line = list(map(str, user_defined_results)) + \
        list(map(str, automatic_results))
    print(line)

# results for post script:

    # GTcalc
    # COP
    # EER

    # P_HZ_user
    # P_KL_user
    # E_HZ_user
    # E_KL_user
    # cover_user
    # Pel_heatpump_user
    # Pel_chiller_user
    # Eel_heatpump_user
    # Eel_chiller_user
    # Efactor_user
    # SCOP
    # SEER

    # P_HZ_bal
    # P_KL_bal
    # BS_HZ_bal
    # BS_KL_bal
    # E_HZ_bal
    # E_KL_bal
    # cover_bal
    # Pel_heatpump_bal
    # Pel_chiller_bal
    # Eel_heatpump_bal
    # Eel_chiller_bal
    # SCOP_bal
    # SEER_bal
    # cover_rise

    # BB_mean
    # nBoreholes

    # line = sys.argv[1:12] + list(map(str, [PHZ_L3, PKL_L3,...
    # log(line)


def printdemand(text, PHZ, PKL, BS_HZ, BS_KL, COP, EER, T_radiator, GTcalc, lamda):
    print(f"\n########################### Ergebnisse #######################:")
    print(f"\nGebäudeleistung {text}:")
    if (COP > 0):
        print(f"    PHZ   = {BS_HZ:.1f} h x {PHZ/(1-1/COP):.1f} kW")
    else:
        print(f"    PHZ   = {BS_HZ:.1f} h x {PHZ:.1f} kW")
    if (EER > 0):
        print(f"    PKL   = {BS_KL:.1f} h x {PKL/(1+1/EER):.1f} kW")
    else:
        print(f"    PKL   = {BS_KL:.1f} h x {PKL:.1f} kW")
    print(f"    T_Vorlauf_Heizung: {T_radiator:.1f} °C")
    print(f"Vorgabe für Erdsonden:")
    if (COP > 0):
        print(f"    COP  = {COP:.1f}")
    if (EER > 0):
        print(f"    EER  = {EER:.1f}")
    print(f"    PHZ   = {BS_HZ:.1f} h x {PHZ:.1f} kW")
    print(f"    PKL   = {BS_KL:.1f} h x {PKL:.1f} kW")
    print(f"Erdreichparameter:")
    print(f"    mean ground temperature  = {GTcalc:.1f}")
    print(f"    mean thermal conductivity= {lamda:.1f}")


def printratio(Efactor, Pfactor):
    if (Efactor > 1/1000. and Efactor < 1000.):
        print(f"    energy ratio HZ/KL = {Efactor:.3f}")
    if (Pfactor > 1/1000. and Pfactor < 1000.):
        print(f"    power  ratio HZ/KL = {Pfactor:.3f}")


def printresults(text, PHZ, PKL, EHZ, EKL, cover, P_heatpump, P_chiller, E_heatpump, E_chiller, nBoreholes, H, BB_L3, BB_mean, cover_rise, COP, EER, SCOP, SEER):
    if (np.isfinite(cover)):
        covert = (f"{cover:.1f} %")
    else:
        covert = ("not defined")

    print(
        f"\nRESULTS {text} for {nBoreholes} BHEs with {H} m depth and average spacing {BB_mean} {BB_L3}:")
    print(
        f"    heat extraction power from BHE                   = {PHZ:.1f} kW")
    print(
        f"    + electr. power of heat pump (COP = {COP:.1f})         = {P_heatpump:.1f} kW")
    print(
        f"    = heating power for building                     = {PHZ+P_heatpump:.1f} kW")
    print(
        f"    yearly heat extraction from BHE                  = {EHZ/1000.:.1f} MWh/a")
    print(
        f"    + electr. energy of heat pump (SCOP = {SCOP:.1f})       = {E_heatpump/1000.:.1f} MWh/a")
    print(
        f"    = yearly heating energy for building             = {(EHZ+E_heatpump)/1000.:.1f} MWh/a")
    print("\n")
    print(
        f"    heat injection power to BHE                      = {PKL:.1f} kW")
    print(
        f"    - electr. power of heat pump (EER = {EER:.1f})         = {P_chiller:.1f} kW")
    print(
        f"    = cooling power for building                     = {PKL-P_chiller:.1f} kW")
    print(
        f"    yearly heat injection to BHE                     = {EKL/1000.:.1f} MWh/a")
    print(
        f"    - electr. energy of heat pump (SEER = {SEER:.1f})       = {E_chiller/1000.:.1f} MWh/a")
    print(
        f"    = yearly cooling energy for building             = {(EKL-E_chiller)/1000.:.1f} MWh/a")
    print("\n")
    print(f"    Coverage from BHEs                               = {covert}")
    if (cover_rise > 0):
        print(f"    {cover_rise:.1f} % more energy use @ balanced mode")


def calculateL3(T_g, lamda, BS_HZ, BS_KL, Tmin, Tmax, years, D, H, r_b, cv, Pfactor, m_flow_borehole, boreField, PNGPath, pngname2, T_radiator, DEBUG, RESULT):
    def log(s):
        if DEBUG:
            print(s)

    if (BS_HZ == 0):
        Efactor = 0.
    elif (BS_KL > 0 and Pfactor < 1000.):
        Efactor = Pfactor * BS_HZ / BS_KL
    else:
        Efactor, BS_KL = 1000., 0.

    # Simulation parameters
    dt = 1.*3600.                  # Time step (s) for hourly simulation

    # Pipe dimensions
    r_out = 0.016      # Pipe outer radius (m)
    r_in = 0.014       # Pipe inner radius (m)
    D_s = 0.04         # Shank spacing (m)
    epsilon = 1.0e-6    # Pipe roughness (m)

    # Pipe positions
    # Double U-tube [(x_in1, y_in1), (x_in2, y_in2),
    #                (x_out1, y_out1), (x_out2, y_out2)]
    pos = [(-D_s, 0.), (0., -D_s), (D_s, 0.), (0., D_s)]

    # Ground properties
    cv = 2.2            # vol heat capacity of earth (MJ/m³/K)
    alpha = lamda / cv * 1e-6     # Ground thermal diffusivity (m2/s)

    # Grout properties
    k_g = 2.0           # Grout thermal conductivity (W/m.K)

    # Pipe properties
    k_p = 0.35           # Pipe thermal conductivity (W/m.K)

    # The fluid is propylene-glycol (20 %) at 20 degC

    # ‘Water’ - Complete water solution
    # ‘MEG’ - Ethylene glycol mixed with water
    # ‘MPG’ - Propylene glycol mixed with water
    # ‘MEA’ - Ethanol mixed with water
    # ‘MMA’ - Methanol mixed with water

    # fluid = gt.media.Fluid('MEA', 30.)
    mix = 'MEA'
    percent = 12
    log(f" fluid type: {mix}")

    fluid = gt.media.Fluid(mix, percent)
    cp_f = fluid.cp     # Fluid specific isobaric heat capacity (J/kg.K)
    rho_f = fluid.rho   # Fluid density (kg/m3)
    mu_f = fluid.mu     # Fluid dynamic viscosity (kg/m.s)
    k_f = fluid.k       # Fluid thermal conductivity (W/m.K)
    log(fluid)

    # g-Function calculation options
    options = {'nSegments': 8, 'disp': DEBUG}

    # -------------------------------------------------------------------------
    # Initialize bore field and pipe models
    # -------------------------------------------------------------------------

    nBoreholes = len(boreField)
    divider = nBoreholes * H

    # Total fluid mass flow rate (kg/s)
    m_flow_network = m_flow_borehole*nBoreholes

    # Pipe thermal resistance
    log(f"calculate pipe resistance")
    R_p = gt.pipes.conduction_thermal_resistance_circular_pipe(
        r_in, r_out, k_p)

    # Fluid to inner pipe wall thermal resistance (Double U-tube in parallel)
    m_flow_pipe = m_flow_borehole/2
    h_f = gt.pipes.convective_heat_transfer_coefficient_circular_pipe(
        m_flow_pipe, r_in, mu_f, rho_f, k_f, cp_f, epsilon)
    R_f = 1.0/(h_f*2*pi*r_in)
    R_f_p = R_f+R_p
    log(f" Rf {R_f:.3f} + Rp {R_p:.3f} = {R_f+R_p:.3f}  m.K/W")

    # Double U-tube (parallel), same for all boreholes in the bore field
    log(f"define U-tubes")
    UTubes = []
    for borehole in boreField:
        UTube = gt.pipes.MultipleUTube(
            pos, r_in, r_out, borehole, lamda, k_g, R_f_p, nPipes=2, config='parallel')
        UTubes.append(UTube)

    image_hash_borefield = ""
    if (len(pngname2) > 0):
        image_hash_borefield = plotborefield(boreField, pngname2, RESULT)
    # Build a network object from the list of UTubes
    log(f"building pipe network")
    network = gt.networks.Network(
        boreField, UTubes, m_flow_network=m_flow_network, cp_f=cp_f)

    # -------------------------------------------------------------------------
    # Calculate g-function for hourly Simulation
    # -------------------------------------------------------------------------

    if (Efactor >= 1):  # more heating than cooling
        BS_first = BS_HZ
        BS_second = BS_KL
    else:  # more cooling than heating
        BS_first = BS_KL
        BS_second = BS_HZ

    tmax = ((years)*8760. + BS_first/2) * 3600.     # Maximum time (s)
    x1 = BS_first/2
    x5 = 8760/2-BS_second/2
    x6 = 8760/2+BS_second/2
    x10 = 8760-BS_first/2
    x11 = 8760.

    xout = int(3*8760/2+BS_second/2)-1

    Nt = int(np.floor(tmax/dt))  # Number of time steps
    time = dt * np.arange(1, Nt+1)

    # Load aggregation scheme
    log("Load Aggregation Scheme")
    LoadAgg = gt.load_aggregation.ClaessonJaved(dt, tmax)
    # Get time values needed for g-function evaluation
    time_req = LoadAgg.get_times_for_simulation()
    # Calculate g-function
    log(f"calculate g-function")
    gFunc = gt.gfunction.gFunction(
        network, alpha, time_req, boundary_condition='MIFT', options=options)

    # Initialize load aggregation scheme
    LoadAgg.initialize(gFunc.gFunc/(2*pi*lamda))

    # -------------------------------------------------------------------------
    # Potential
    # -------------------------------------------------------------------------

    # Evaluate the effective bore field thermal resistance (m.K/W)
    R_bmf = gt.networks.network_thermal_resistance(
        network, m_flow_network, cp_f)
    log(f" Rbmf = {R_bmf:5.3f} m.K/W (effective internal resistance)")

    # calculate maximum deltaT
    deltaT_HZ = T_g - Tmin
    deltaT_KL = T_g - Tmax  # negative

    if (round(Efactor, 2) < 1):  # more cooling than heating: Beginn with cooling period
        log(" cooling dominant")
        # calculate Resistance of Earth with g-functions after cooling period, year 2
        time_superpos_sort, time_superpos_ind_rev, Pfakt = prepare_times_for_gfunction_2J(
            Pfactor, Efactor, BS_HZ, BS_KL, years)
        # gfun2 = gt.gfunction.gFunction(network, alpha, time=time_superpos_sort*3600., boundary_condition='MIFT',options=options)
        gfun3 = np.interp(time_superpos_sort*3600., time_req, gFunc.gFunc)
        # gfun3 = np.array(gfun2.gFunc)
        gfun3_unsort = gfun3[time_superpos_ind_rev]
        product = np.multiply(gfun3_unsort, Pfakt)
        R_g_2J = abs(sum(product)/(2*pi*lamda))
        log(f" Rg = {R_g_2J:5.3f} m.K/W")

        # calculate Resistance of Earth with g-functions after first heating period, year 21
        time_superpos_sort, time_superpos_ind_rev, Pfakt, time_sort = prepare_times_for_gfunction_20J(
            Pfactor, Efactor, BS_HZ, BS_KL, years)
        # gfun2 = gt.gfunction.gFunction(network, alpha, time=time_superpos_sort*3600., boundary_condition='MIFT',options=options)
        gfun3 = np.interp(time_superpos_sort*3600., time_req, gFunc.gFunc)
        # gfun3 = np.array(gfun2.gFunc)
        gfun3_unsort = gfun3[time_superpos_ind_rev]
        product = np.multiply(gfun3_unsort, Pfakt)
        R_g = abs(sum(product)/(2*pi*lamda))
        log(f" Rg = {R_g:5.3f} m.K/W")

        # calculate maximum power from Heating and Cooling in respect to given Pfactor
        PKL = deltaT_KL / (R_g+R_bmf)
        PHZ = -PKL * Pfactor
        PHZ2 = deltaT_HZ / (R_g_2J+R_bmf)

        if (abs(PHZ2) < abs(PHZ)):
            log(
                f" Heizlimit im Jahr 2 überschritten, reduziere Heizleistung um Faktor: {PHZ2/PHZ:.3f} !")
            log(f" Pot PHZ precalc   = {PHZ:6.2f} W/m")
            PHZ = PHZ2
            PKL = -PHZ2/Pfactor
        else:
            log(f" Pot PHZ2 precalc   = {PHZ2:6.2f} W/m")
        Tf_mean_max = T_g - (R_g+R_bmf)*PKL
        Tf_mean_min = T_g - (R_g_2J+R_bmf)*PHZ

        Tb_pot_HZ = R_bmf * PHZ + Tf_mean_min
        Tb_pot_KL = R_bmf * PKL + Tf_mean_max

    else:  # more heating than cooling: Beginn with heating period
        log(" heating dominant")
        # calculate Resistance of Earth with g-functions after cooling period, year 2
        time_superpos_sort, time_superpos_ind_rev, Pfakt = prepare_times_for_gfunction_2J(
            Pfactor, Efactor, BS_HZ, BS_KL, years)
        # gfun2 = gt.gfunction.gFunction(network, alpha, time=time_superpos_sort*3600., boundary_condition='MIFT',options=options)
        gfun3 = np.interp(time_superpos_sort*3600., time_req, gFunc.gFunc)
        # gfun3 = np.array(gfun2.gFunc)
        gfun3_unsort = gfun3[time_superpos_ind_rev]
        product = np.multiply(gfun3_unsort, Pfakt)
        R_g_2J = abs(sum(product)/(2*pi*lamda))
        log(f" Rg_2J = {R_g_2J:5.3f} m.K/W")

        # calculate Resistance of Earth with g-functions after first heating period, year 21
        time_superpos_sort, time_superpos_ind_rev, Pfakt, time_sort = prepare_times_for_gfunction_20J(
            Pfactor, Efactor, BS_HZ, BS_KL, years)
        # gfun2 = gt.gfunction.gFunction(network, alpha, time=time_superpos_sort*3600., boundary_condition='MIFT',options=options)
        # gfun3 = np.array(gfun2.gFunc)
        gfun3 = np.interp(time_superpos_sort*3600., time_req, gFunc.gFunc)
        gfun3_unsort = gfun3[time_superpos_ind_rev]
        product = np.multiply(gfun3_unsort, Pfakt)
        R_g = abs(sum(product)/(2*pi*lamda))
        log(f" Rg_20J = {R_g:5.3f} m.K/W")

        # calculate maximum power from Heating and Cooling in respect to given Pfactor
        PHZ = deltaT_HZ / (R_g+R_bmf)
        PKL = -PHZ / Pfactor
        PKL2 = deltaT_KL / (R_g_2J+R_bmf)

        if (abs(PKL2) < abs(PKL)):
            log(
                f" Kühllimit im Jahr 2 überschritten, reduziere Heizleistung um Faktor: {PKL2/PKL:.3f} !")
            log(f" Pot PHZ precalc   = {PHZ:6.2f} W/m")
            PKL = PKL2
            PHZ = -PKL2*Pfactor

        Tf_mean_max = T_g - (R_g_2J+R_bmf)*PKL
        Tf_mean_min = T_g - (R_g+R_bmf)*PHZ

        Tb_pot_HZ = R_bmf * PHZ + Tf_mean_min
        Tb_pot_KL = R_bmf * PKL + Tf_mean_max

    log(f" deltaT_HZ = {deltaT_HZ:6.2f} K")
    log(f" deltaT_KL = {deltaT_KL:6.2f} K")
    log(f" Efaktor   = {Efactor:6.4f} ")
    log(f" Pfaktor   = {Pfactor:6.4f} ")

    log("\nresults from potential calculations:")
    log(f" Pot          PHZ   = {PHZ:6.2f} W/m")
    log(f" Pot          PKL   = {PKL:6.2f} W/m")
    log(f" Pot          Tbmin = {Tb_pot_HZ:6.2f} °C")
    log(f" Pot          Tbmax = {Tb_pot_KL:6.2f} °C")
    log(f" Pot    Tf_mean_min = {Tf_mean_min:6.2f} °C")
    log(f" Pot    Tf_mean_max = {Tf_mean_max:6.2f} °C")

    # -------------------------------------------------------------------------
    # hourly Simulation
    # -------------------------------------------------------------------------

    # Evaluate heat extraction rate
    P_tot = np.zeros(Nt)

    T_b = np.zeros(Nt)
    # Tf_in = np.zeros(Nt)
    # Tf_out = np.zeros(Nt)
    Tf_m_sim = np.zeros(Nt)
    # Tf_m_sim2= np.zeros(Nt)
    COP_h = np.tile(np.nan, Nt)
    EER_h = np.tile(np.nan, Nt)
    SEER, SCOP = 0., 0.

    for i, (t) in enumerate(time):
        # Increment time step by (1)
        # log(t/3600)
        hh = t/3600.
        xx = hh-np.floor(hh/8760.)*8760  # Stunde im Jahr

        LoadAgg.next_time_step(t)

        if xx <= x1:
            if (Efactor < 1):
                P_tot[i] = PKL
            else:
                P_tot[i] = PHZ
        elif xx <= x5:
            P_tot[i] = 0.
        elif xx <= x6:
            if (Efactor < 1):
                P_tot[i] = PHZ
            else:
                P_tot[i] = PKL
        elif xx <= x10:
            P_tot[i] = 0.
        elif xx <= x11:
            if (Efactor < 1):
                P_tot[i] = PKL
            else:
                P_tot[i] = PHZ
        else:
            log(f"WARNING at time {t/3600.}")
            P_tot[i] = 0.0

        # Apply current load (in watts per meter of borehole)
        LoadAgg.set_current_load(P_tot[i])

        # calculate borehole and fluid temperatures
        # Evaluate borehole wall temperature
        deltaT_b = LoadAgg.temporal_superposition()
        T_b[i] = T_g - deltaT_b

        Tf_m_sim[i] = T_b[i]-P_tot[i]*R_bmf

        if (PHZ > 0. and P_tot[i] == PHZ):
            Qc, Qe, Pel = get_COP_potential(T_radiator, Tf_m_sim[i]-1.5, 1.)
            COP_h[i] = Qc/Pel
        if (PKL < 0. and P_tot[i] == PKL):
            if (Tf_m_sim[i] > 19.5):
                # Qc, Qe, Pel = get_COP_potential(30., 19.5 , 1.)
                # EER_h[i] = Qe/Pel
                EER_h[i] = 6.9
            else:
                EER_h[i] = 20.

        # Evaluate inlet fluid temperature (all boreholes are the same)
        # Tf_in[i] = network.get_network_inlet_temperature(P_tot[i]*divider, T_b[i], m_flow_network, cp_f, nSegments=1)

        # Evaluate outlet fluid temperature
        # Tf_out[i] = network.get_network_outlet_temperature(Tf_in[i],  T_b[i], m_flow_network, cp_f, nSegments=1)
        # Tf_m_sim2[i]=(Tf_in[i]+Tf_out[i])/2

    last = T_b.size-1

    Tm1 = min(Tf_m_sim[last], Tf_m_sim[xout])
    Tm2 = max(Tf_m_sim[last], Tf_m_sim[xout])
    Tb1 = min(T_b[last], T_b[xout])
    Tb2 = max(T_b[last], T_b[xout])
    if (np.any(np.isfinite(COP_h))):
        SCOP = np.nanmean(COP_h)
    if (np.any(np.isfinite(EER_h))):
        SEER = np.nanmean(EER_h)
    # np.savetxt(PNGPath+".txt",COP_h)

    log("\nresults from hourly simulation run:")
    log(f" Sim          Tbmin = {Tb1:6.2f} °C")
    log(f" Sim          Tbmax = {Tb2:6.2f} °C")
    log(f" Sim    Tf_mean_min = {Tm1:6.2f} °C")
    log(f" Sim    Tf_mean_max = {Tm2:6.2f} °C")
    log(f" Sim           SCOP = {SCOP:6.1f}")
    log(f" Sim           SEER = {SEER:6.1f}")

    # -------------------------------------------------------------------------
    # Plot hourly heat extraction rates and temperatures
    # -------------------------------------------------------------------------
    # plotgraf2(PNGPath,time/3600./24./365.,P_tot,"Betriebszeit [Jahre]","spezifische Sondenleistung [W/lm]",time/3600./24./365.,Tf_m_sim,"Betriebszeit [Jahre]","Temperatur [°C]", T_g, "Leistung pro Bohrmeter (Heizen = positiv, Kühlen/Regeneration = negativ)","Entwicklung der mittleren Fluidtemperatur der Sonden (Mittelwert Vor- und Rücklauf)", BS_HZ, BS_KL, RESULT)
    image_hash = plotgraf2(PNGPath, time/3600./24./365., P_tot, "Betriebszeit [Jahre]", "spezifische Sondenleistung [W/lm]", time/3600./24./365., Tf_m_sim, "Betriebszeit [Jahre]", "Temperatur [°C]",
                           T_g, "Leistung pro Bohrmeter (Heizen = positiv, Kühlen/Regeneration = negativ)", "Entwicklung der mittleren Fluidtemperatur der Sonden (Mittelwert Vor- und Rücklauf)", BS_HZ, BS_KL, RESULT)

    return PHZ, PKL, Efactor, SCOP, SEER, image_hash, image_hash_borefield


def prepare_times_for_gfunction_20J(Pfactor, Efactor, BS_HZ, BS_KL, years):

    # -------------------------------------------------------------------------
    # Potential
    # -------------------------------------------------------------------------
    # create array with Pfactors to multiply with gfunction values
    if Efactor >= 1:

        Pfakt = np.array([1., -1., -1/Pfactor, 1/Pfactor])
        Pfakt = np.tile(Pfakt, int(years))
        # add last heating season
        Pfakt = np.concatenate((Pfakt, np.array([1.])), axis=0)

        BS_first = BS_HZ
        BS_second = BS_KL
    else:
        Pfakt = np.array([-1., 1., Pfactor, -Pfactor])
        Pfakt = np.tile(Pfakt, int(years))
        # add last cooling season
        Pfakt = np.concatenate((Pfakt, np.array([-1.])), axis=0)

        BS_first = BS_KL
        BS_second = BS_HZ

    # create heating cooling time array
    t_HZ = np.arange(BS_first/2,  8760.0*(years+1)+BS_first/2, 8760)
    t_HZS = np.arange(8760/2-BS_second/2, 8760.0*(years), 8760)
    t_KL = np.arange(8760/2+BS_second/2, 8760.0*(years), 8760)
    t_KLS = np.arange(8760-BS_first/2,   8760.0*(years), 8760)

    time2 = np.concatenate((t_HZ, t_HZS, t_KL, t_KLS), axis=0)
    # index array for sorting in increasing time order
    time_sort_ind = time2.argsort()
    # sort in increasing time order
    time_sort = time2[time_sort_ind]

    # add zero value at beginning
    time_superpos = np.concatenate([[0.], time_sort])

    Len = time2.size                                      # length of arrays
    # get highest value = time point to evaluate power potential
    Last = time_sort[Len-1]

    # prepare time points for g-function
    time_superpos = Last-time_superpos
    # remove last zero entry
    time_superpos = time_superpos[0:time_superpos.size-1]

    # index array for sorting in increasing time order
    time_superpos_ind = time_superpos.argsort()
    # index array for sorting in decreasing time order
    time_superpos_ind_rev = time_superpos_ind.argsort()
    time_superpos_sort = time_superpos[time_superpos_ind]

    # log(time_sort)
    # log(time_superpos)
    # log(Pfakt)
    # input()

    return time_superpos_sort, time_superpos_ind_rev, Pfakt, time_sort


def prepare_times_for_gfunction_2J(Pfactor, Efactor, BS_HZ, BS_KL, years):

    # create array with Pfactors to multiply with gfunction values
    # plusminus = 1 for dominant heating and -1 for dominant cooling
    if Efactor >= 1:
        Pfakt = np.array([Pfactor, -Pfactor, -1., 1.,
                          Pfactor, -Pfactor, -1.])
        BS_first = BS_HZ
        BS_second = BS_KL

    else:
        Pfakt = np.array([-1/Pfactor, 1/Pfactor, 1., -1.,
                          -1/Pfactor, 1/Pfactor, 1.])
        BS_first = BS_KL
        BS_second = BS_HZ
    # create same arrays to evaluate after end of heating phase in second year
    time2 = np.array([BS_first/2,      8760/2-BS_second/2,      8760/2+BS_second/2, 8760-BS_first/2,
                      8760+BS_first/2, 8760+8760/2-BS_second/2, 8760+8760/2+BS_second/2])

    # index array for sorting in increasing time order
    time_sort_ind = time2.argsort()
    # sort in increasing time order
    time_sort = time2[time_sort_ind]

    time_superpos = np.concatenate([[0.], time_sort])
    Len = time_sort.size                                      # length of arrays
    Last = time_sort[Len-1]
    time_superpos = Last - time_superpos
    time_superpos = time_superpos[0:time_superpos.size-1]

    time_superpos_ind = time_superpos.argsort()
    time_superpos_ind_rev = time_superpos_ind.argsort()
    time_superpos_sort = time_superpos[time_superpos_ind]

    # log(time_sort)
    # log(time_superpos)
    # log(Pfakt)
    # input()

    return time_superpos_sort, time_superpos_ind_rev, Pfakt


def plotborefield(boreField, pngname, RESULT):
    # Configure figure and axes
    if (RESULT):
        print(f"create plot {pngname}")
    fig = gt.boreholes.visualize_field(
        boreField, viewTop=True, view3D=False, labels=True)  # , showTilt=True)

    # save figure to binary stream and convert to base 64 string
    binary_stream = io.BytesIO()
    fig.savefig(binary_stream, format='png', dpi=120)
    binary_stream.seek(0)
    img_hash = base64.b64encode(binary_stream.read()).decode('utf-8')
    return img_hash


def plotgraf2(pngname, x1, y1, x1_label, y1_label, x2, y2, x2_label, y2_label, Tg, title1, title2, BS_HZ, BS_KL, RESULT):
 # -------------------------------------------------------------------------
    # Plot hourly heat extraction rates and temperatures
    # -------------------------------------------------------------------------
    if (RESULT):
        print(f"create plot {pngname}")
    xmin = np.floor(min(x1))
    xmax = np.ceil(max(x1))
    xticks_major = np.arange(xmin+1, xmax)
    xticks_minor = np.arange(xmin+1, xmax, 0.5)

    # Configure figure and axes
    plt.rc('figure')
    fig = gt.utilities._initialize_figure()
    # fig.suptitle(title, fontsize=8)
    ax1 = fig.add_subplot(211)
    # Axis labels
    ax1.set_xlabel(x1_label, fontsize=8)
    ax1.set_ylabel(y1_label, fontsize=8)
    ax1.set_title(title1, fontsize=9)
    ax1.set_xlim([xmin, xmax])
    # Specify tick label size
    ax1.set_xticks(xticks_minor, minor=True)
    ax1.set_xticks(xticks_major)

    # gt.utilities._format_axes(ax1)
#
    # Plot heat extraction rates
    lab = (
        f"Heizen {max(y1):.1f} W/m / Kühlen {min(y1):.1f} W/m \nHeizen {BS_HZ} h/a / Kühlen {BS_KL} h/a")
    ax1.plot(x1, y1, label=lab, color='teal')
    ax1.legend(fontsize=8, loc='lower center')

    ax2 = fig.add_subplot(212)
    # Axis labels
    ax2.set_xlabel(x2_label, fontsize=8)
    ax2.set_ylabel(y2_label, fontsize=8)
    ax2.set_title(title2, fontsize=9)
    ax2.set_xlim([xmin, xmax])
    ax2.set_xticks(xticks_major)
    ax2.set_xticks(xticks_minor, minor=True)
    # gt.utilities._format_axes(ax2)

    # Plot temperatures
    lab = (
        f"mittlere Sondenfluidtemperatur {min(y2[x2>1]):.1f} °C / {max(y2[x2>1]):.1f} °C")
    ax2.plot(x2, y2, label=lab, color='sienna')
    x3 = np.array([min(x2), max(x2)])
    y3 = np.array([Tg, Tg])
    ax2.plot(x3, y3, label="ungestörte Untergrundtemperatur",
             color='slategrey', linestyle='dotted')
    ax2.legend(fontsize=8, loc='upper center')
    plt.grid(True)

    # Adjust to plot window
    plt.tight_layout()
    # fig.savefig(pngname)

    # save figure to binary stream and encode it to base64 string
    binary_stream = io.BytesIO()
    fig.savefig(binary_stream, format='png', dpi=120)
    binary_stream.seek(0)
    img_hash = base64.b64encode(binary_stream.read()).decode('utf-8')
    return img_hash


def get_COP_potential(T_sink_high, T_Source_low, P_SOW35):
    # polynomial fit from measurement data project Geofit and ZWEIFELDSPEICHER
    # Autor: Michael Lauermann (AIT 2015, 2022)
    # Qc = Q_heat condenser[kW]
    # Qe = Q_cool evaporator[kW]
    # Pel= electric power [kW]
    # a, b, c = linear coefficients
    # for delta T of heat sink = 5K, 10K and 15K
    # general formula: ( a + b * T_source_low + c * T_sink_high ) * P_SO-W35 / 44.14

    def hpfunc(a, b, c, T_source_low, T_sink_high):
        result = (a + b * T_source_low + c * T_sink_high)
        return result

    Qc_a_10K = 49.761136
    Qc_b_10K = 1.265924
    Qc_c_10K = -0.058782
    Qe_a_10K = 52.002178
    Qe_b_10K = 1.298574
    Qe_c_10K = -0.358732
    Pel_a_10K = -1.016948
    Pel_b_10K = 0.078546
    Pel_c_10K = 0.300213

    Qc = hpfunc(Qc_a_10K, Qc_b_10K, Qc_c_10K, T_Source_low,
                T_sink_high) * P_SOW35 / 44.14
    Qe = hpfunc(Qe_a_10K, Qe_b_10K, Qe_c_10K, T_Source_low,
                T_sink_high) * P_SOW35 / 44.14
    Pel = hpfunc(Pel_a_10K, Pel_b_10K, Pel_c_10K,
                 T_Source_low, T_sink_high) * P_SOW35 / 44.14
    # COP = Qc / Pel
    # EER = Qe / Pel

    return Qc, Qe, Pel


# Main function
if __name__ == '__main__':
    freeze_support()
    import time as t
    seconds = t.time()

    main()
    seconds = t.time()-seconds
    minutes = int(seconds/60)
    hours = int(minutes/60)
    sec = seconds-minutes*60-hours*3600
    # print(f"Total Running Time hhhh:mm:ss: {hours:04d}:{minutes:02d}:{sec:2.2f}")
