"""
V5.0_beta:  Komplette Neuprogrammierung der Potenzialberechnung
            Vorgegeben werden die Positionen des Erdsondenfeldes (beliebige Koordinaten), die Volllaststunden für Heizen und Kühlen, sowie das gewünschte Leistungsverhältnis (PHZ/PKL)
            Wenn keine Vorgabe der Volllaststunden vorhanden, werden die Norm_Betriebsstunden verwendet und als Leistungsverhältnis das deltaT von ungestörter Untergrundtemperatur zu den Heiz-Kühllimits
            Ergebnis bei Leistungsvorgabe:  Sondenleistung pro Laufmeter Sonde für Heizen und Kühlen, unter Einhaltung des Leistungsverhältnisses und BEtriebsstunden sowie Deckungsgrad
            Ergebnis ohne Leistungsvorgabe: Sondenleistung pro Laufmeter Sonde für Heizen und Kühlen, unter Einhaltung Normbetriebsstunden
            zusätzlich wird das Leistungspotenzial bei ausgeglichener Jahresenergiebilanz berechnet
            zusätzlich werden die Ergebnisse grafisch ausgegeben!

Calculation of g-functions using uniform heat extraction rates.

Programm zur Erstdimensionierung von Erdwärmesonden für ein Grundstück, nach Vorgabe der Positionen des Erdsondenfeldes und Optional die Leistungen und Volllaststunden für Heizen und Kühlen


"""

from __future__ import absolute_import, division, print_function
from audioop import add
from multiprocessing import freeze_support

import sys
import os

import numpy as np
import math

import pygfunction as gt
from scipy.constants import pi
import matplotlib.pyplot as plt

from hashlib import md5
from time import localtime

import base64
import io


def add_prefix(filename):
    prefix = md5(str(localtime()).encode('utf-8')).hexdigest()
    return f"{prefix}_{filename}"


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

    filename = add_prefix('Results_unbal.png')
    filename_bal = add_prefix('Results_bal.png')
    PNGPath = os.path.abspath(os.path.join(application_path,
                                           '../client/src/images', filename))
    PNGPath_bal = os.path.abspath(os.path.join(application_path,
                                               '../client/src/images', filename_bal))

    # minimum Fluid Temperature for Heating (°C)
    Tmin = float("-1.5")
    # Maximum Fluid Temperature for Cooling (°C)
    Tmax = float("27.5")
    # operating time
    years = int("20")
    # Borehole buried depth (m)
    D = float("1")
    # Borehole radius (m)
    r_b = float("0.075")

    # Borehole spacing for unbalanced load (m)
    BB_unbal = float("10")
    # AreaFF_BB_unbal = calc_AreaFF(BB_unbal)

    # Borehole spacing for balanced load (m)
    BB_bal = float("5")
    # AreaFF_BB_bal = calc_AreaFF(BB_bal)

    # Rb = float("0.071")
    flowrate = float("0.35")

    # volumetric heat capacity of the earth (MJ/m³/K)
    cv = float("2.2")

    # parcel related input parameters
    # GstNr = int(sys.argv[1])               # property number, not needed any more
    # BT = float("12")                       # mean surface temperature °C, not needed any more
    # FF = float(sys.argv[11])               # area, not needed any more
    # mean underground temperature (°C)
    GT = float(sys.argv[3])
    # heat conductivity of the earth (W/m/K)
    lamda = float(sys.argv[4])
    # typical operational hours for heating (h/yr)
    BS_HZ_Norm = float(sys.argv[5])
    # typical operational hours for cooling (h/yr)
    BS_KL_Norm = float(sys.argv[6])
    # known operational hours for heating  (h/yr)
    BS_HZ = float(sys.argv[7])
    # known operational hours for cooling (h/yr)
    BS_KL = float(sys.argv[8])
    # known heating power of heat pump (kW)
    P_HZ = float(sys.argv[9])
    # known cooling power (of heat pump) (kW)
    P_KL = -float(sys.argv[10])
    H = float(sys.argv[12])                  # Borehole length (m)

    # GT = float("13")                        # mean underground temperature (°C)
    # # heat conductivity of the earth (W/m/K)
    # lamda = float("2")
    # # typical operational hours for heating (h/yr)
    # BS_HZ_Norm = float("1800")
    # # typical operational hours for cooling (h/yr)
    # BS_KL_Norm = float("800")
    # # known operational hours for heating  (h/yr)
    # BS_HZ = float("1000")
    # # known operational hours for cooling (h/yr)
    # BS_KL = float("2000")
    # # known heating power of heat pump (kW)
    # P_HZ = float("100")
    # # known cooling power (of heat pump) (kW)
    # P_KL = float("-100")
    # H = float("150")
    # FF = int(float("2000"))                # Freifläche WIRD NICHT MEHR BENÖTIGT, WENN KOORDINATEN VERFÜGBAR
    # Koordinatenvektor als Input - Sondenfeld ist fix vorgegeben:
    # bore_position = np.array([[0.,  1.], [5.,  1.], [10.,  2.], [2.,  5.], [5.,  5.], [10.,  5.], [0., 10.], [5., 10.], [10., 10.]])

    l = list(map(lambda x: x.strip(" []"), sys.argv[13].split(",")))
    bore_position_temp = []
    for i in range(0, len(l)-1, 2):
        bore_position_temp.append([float(l[i]), float(l[i+1])])
    bore_position = np.array(bore_position_temp)

    print('\n')
    print("=================================================================")
    # print("================ GstNr: ", GstNr, "================")

    # end of reading line from input data

    # D  I  M  E  N  S  I  O  N  I  N  G
    # calculate Values for Level 2, if heating or cooling demand available
    # if abs(P_HZ*BS_HZ) > 0 or abs(P_KL*BS_KL) > 0:
    #    Level2 = calculateL2(GstNr, GT, lamda, BS_HZ, BS_KL, P_HZ, P_KL, Tmin, Tmax, years, D, H, r_b,
    #                         BB_unbal, BB_bal, Rb, cv, gf_load_10m, gf_load_5m, polyfile)  # return P_fin,SA_min,BM,Area,SA
    # else:
    # return P_fin,SA,BM,Area,EfactorA, PFactorA, BB
    #    Level2 = np.array([0, 0, 0, 0, 0, 0, 0])

    # calculate Values for Level 3: First calculate how many BHE can be placed on the given area FF
    # SA_FF = 0

    # calculate maximum deltaT
    deltaT_HZ = GT - Tmin
    deltaT_KL = GT - Tmax  # negative

    if (abs(P_HZ*BS_HZ) > 0. or abs(P_KL*BS_KL) > 0.):
        BS_HZ_L3 = BS_HZ
        BS_KL_L3 = BS_KL
        if (P_KL > 0):
            Pfactor = P_HZ / -P_KL
        else:
            Pfactor = deltaT_HZ/-deltaT_KL
        if (BS_KL > 0):
            Efactor = Pfactor * BS_HZ / BS_KL
        else:
            Efactor = BS_HZ_Norm/BS_KL_Norm
    else:
        BS_HZ_L3 = BS_HZ_Norm
        BS_KL_L3 = BS_KL_Norm
        Pfactor = deltaT_HZ/-deltaT_KL
        Efactor = BS_HZ_Norm/BS_KL_Norm

# BB is given by coordinates of the given BHEs, BB_L3 is not used any more!
    if (Efactor > 0.9 and Efactor < 1.1):
        BB_L3 = BB_bal
    else:
        BB_L3 = BB_unbal

    SA_FF = len(bore_position)
    Efactor_bal = 1.0
    if SA_FF > 0:
        PHZ_L3, PKL_L3, image_hash = calculateL3(GT, lamda, BS_HZ_L3, BS_KL_L3, Tmin, Tmax, years,
                                                 D, H, r_b, BB_L3, cv, Pfactor, flowrate, bore_position, PNGPath)
        Pfactor = deltaT_HZ/-deltaT_KL
        BS_HZ_bal = max(BS_HZ_L3, BS_KL_L3)
        BS_KL_bal = np.floor(min(4000., BS_HZ_bal*Pfactor/Efactor_bal))
        PHZ_L3_bal, PKL_L3_bal, image_hash_bal = calculateL3(GT, lamda, BS_HZ_bal, BS_KL_bal, Tmin, Tmax,
                                                             years, D, H, r_b, BB_bal, cv, Pfactor, flowrate, bore_position, PNGPath_bal)
    else:
        PHZ_L3, PKL_L3 = 0, 0

    if (P_HZ > 0 or P_KL < 0):
        cover = min(PHZ_L3*SA_FF*H/1000./P_HZ*100.0,
                    PKL_L3*SA_FF*H/1000./P_KL*100.0)
        print(f"Coverage: {cover:.1f} %")

    else:
        cover = 0

    # returns input arguments and P2, Sondenanzahl, BM, Area, P_fin_bi,  cover
        # returns input arguments and P2, Sondenanzahl, BM, Area, P_fin_bi,  cover
    # line = sys.argv[1:12] + list(map(str, [Level2[0], Level2[1],
    #                                       Level2[2], Level2[3], Level3[1], cover]))
    line = sys.argv[1:12] + list(map(str, [PHZ_L3, PKL_L3,
                                           BS_HZ_L3, BS_KL_L3, BB_L3, cover, PHZ_L3_bal, PKL_L3_bal, BS_HZ_bal, BS_KL_bal, image_hash, image_hash_bal]))

    print(line)


def prepare_times_for_gfunction_20J(Pfactor, BS_HZ, BS_KL, years, plusminus):

    # -------------------------------------------------------------------------
    # Potential
    # -------------------------------------------------------------------------
    # create array with Pfactors to multiply with gfunction values
    # plusminus = 1 for dominant heating and -1 for dominant cooling
    if plusminus > 0:
        Pfactor = 1/Pfactor

    Pfakt = np.array([1., -1., -1*Pfactor, 1*Pfactor])*plusminus
    Pfakt = np.tile(Pfakt, int(years))
    # add last heating season
    Pfakt = np.concatenate((Pfakt, np.array([1.])*plusminus), axis=0)

    # create heating cooling time array
    t_HZ = np.arange(BS_HZ/2,  8760.0*(years+1)+BS_HZ/2, 8760)
    t_HZS = np.arange(8760/2-BS_KL/2, 8760.0*(years), 8760)
    t_KL = np.arange(8760/2+BS_KL/2, 8760.0*(years), 8760)
    t_KLS = np.arange(8760-BS_HZ/2,   8760.0*(years), 8760)

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

    # print(time_sort)
    # print(time_superpos)
    # input()

    return time_superpos_sort, time_superpos_ind_rev, Pfakt, time_sort


def prepare_times_for_gfunction_2J(Pfactor, BS_HZ, BS_KL, years, plusminus):

    # create array with Pfactors to multiply with gfunction values
    # plusminus = 1 for dominant heating and -1 for dominant cooling
    if plusminus > 0:
        Pfactor = 1/Pfactor
    Pfakt = np.array([1., -1., -1/Pfactor, 1/Pfactor,
                      1., -1., -1/Pfactor])*plusminus

    # create same arrays to evaluate after end of cooling phase in second year
    time2 = np.array([BS_HZ/2,      8760/2-BS_KL/2,      8760/2+BS_KL/2, 8760-BS_HZ/2,
                      8760+BS_HZ/2, 8760+8760/2-BS_KL/2, 8760+8760/2+BS_KL/2])
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

    return time_superpos_sort, time_superpos_ind_rev, Pfakt


def plotgraf2(pngname, x1, y1, x1_label, y1_label, x2, y2, x2_label, y2_label, Tg, title1, title2, BS_HZ, BS_KL):
 # -------------------------------------------------------------------------
    # Plot hourly heat extraction rates and temperatures
    # -------------------------------------------------------------------------

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
        f"heating {max(y1):.1f} W/m / cooling {min(y1):.1f} W/m \nheating {BS_HZ} h/yr / cooling {BS_KL} h/yr")
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
        f"mean fluid temperature {min(y2[x2>1]):.1f} °C / {max(y2[x2>1]):.1f} °C")
    ax2.plot(x2, y2, label=lab, color='sienna')
    x3 = np.array([min(x2), max(x2)])
    y3 = np.array([Tg, Tg])
    ax2.plot(x3, y3, label="undisturbed mean ground temperature",
             color='slategrey', linestyle='dotted')
    ax2.legend(fontsize=8, loc='upper center')
    plt.grid(True)

    # Adjust to plot window
    plt.tight_layout()

    # fig.savefig(filename)
    # save figure to binary stream and encode it to base64 string
    binary_stream = io.BytesIO()
    fig.savefig(binary_stream, format='png', dpi=120)
    binary_stream.seek(0)
    img_hash = base64.b64encode(binary_stream.read()).decode('utf-8')

    return img_hash


def calculateL3(T_g, lamda, BS_HZ, BS_KL, Tmin, Tmax, years, D, H, r_b, BB, cv, Pfactor, m_flow_borehole, bore_position, PNGPath):

    Efactor = Pfactor * BS_HZ / BS_KL

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
    alpha = 1.0e-6      # Ground thermal diffusivity (m2/s)

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
    percent = 20
    print(f" fluid type: {mix}")

    fluid = gt.media.Fluid(mix, percent)
    cp_f = fluid.cp     # Fluid specific isobaric heat capacity (J/kg.K)
    rho_f = fluid.rho   # Fluid density (kg/m3)
    mu_f = fluid.mu     # Fluid dynamic viscosity (kg/m.s)
    k_f = fluid.k       # Fluid thermal conductivity (W/m.K)
    print(fluid)

    # g-Function calculation options
    options = {'nSegments': 8, 'disp': True}

    # -------------------------------------------------------------------------
    # Initialize bore field and pipe models
    # -------------------------------------------------------------------------

    # The field is a retangular array
    print(f"calculate bore field")
    # boreField = gt.boreholes.rectangle_field(N_1, N_2, B, B, H, D, r_b)
    # bore_position = np.zeros([N_1*N_2, 2], dtype=float)

    # for testing bore field with coordinates: save coordinates from rectangular field into xy vector
    # for boreNr in range(len(boreField)):
    #    xy = boreField[boreNr].position()
    #   bore_position[boreNr] = [xy[0],xy[1]]
    # print(bore_position)

    # for testing bore field with coordinates: create boreField with xy coordinates
    b = []
    for i in (range(len(bore_position))):
        b.append(gt.boreholes.Borehole(H=H, D=D, r_b=r_b,
                 x=bore_position[i, 0], y=bore_position[i, 1]))
    # print(b)
    boreField = b
    nBoreholes = len(boreField)
    divider = nBoreholes * H

    # Total fluid mass flow rate (kg/s)
    m_flow_network = m_flow_borehole*nBoreholes

    # Pipe thermal resistance
    print(f"calculate pipe resistance")
    R_p = gt.pipes.conduction_thermal_resistance_circular_pipe(
        r_in, r_out, k_p)

    # Fluid to inner pipe wall thermal resistance (Double U-tube in parallel)
    m_flow_pipe = m_flow_borehole/2
    h_f = gt.pipes.convective_heat_transfer_coefficient_circular_pipe(
        m_flow_pipe, r_in, mu_f, rho_f, k_f, cp_f, epsilon)
    R_f = 1.0/(h_f*2*pi*r_in)
    R_f_p = R_f+R_p
    print(f" Rf {R_f:.3f} + Rp {R_p:.3f} = {R_f+R_p:.3f}  m.K/W")

    # Double U-tube (parallel), same for all boreholes in the bore field
    print(f"define U-tubes")
    UTubes = []
    for borehole in boreField:
        UTube = gt.pipes.MultipleUTube(
            pos, r_in, r_out, borehole, lamda, k_g, R_f_p, nPipes=2, config='parallel')
        UTubes.append(UTube)
    # Build a network object from the list of UTubes
    print(f"building pipe network")
    network = gt.networks.Network(
        boreField, UTubes, m_flow_network=m_flow_network, cp_f=cp_f)

    # -------------------------------------------------------------------------
    # Calculate g-function for hourly Simulation
    # -------------------------------------------------------------------------

    if (Efactor < 1):  # more cooling than heating
        tmax = ((years)*8760. + BS_KL/2) * 3600.     # Maximum time (s)
        x1 = BS_KL/2
        x5 = 8760/2-BS_HZ/2
        x6 = 8760/2+BS_HZ/2
        x10 = 8760-BS_KL/2
        x11 = 8760.
    else:
        tmax = ((years)*8760. + BS_HZ/2) * 3600.     # Maximum time (s)
        x1 = BS_HZ/2
        x5 = 8760/2-BS_KL/2
        x6 = 8760/2+BS_KL/2
        x10 = 8760-BS_HZ/2
        x11 = 8760.

    Nt = int(np.floor(tmax/dt))  # Number of time steps
    time = dt * np.arange(1, Nt+1)

    # Load aggregation scheme
    print("Load Aggregation Scheme")
    LoadAgg = gt.load_aggregation.ClaessonJaved(dt, tmax)
    # Get time values needed for g-function evaluation
    time_req = LoadAgg.get_times_for_simulation()
    # Calculate g-function
    print(f"calculate g-function")
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
    print(f" Rbmf = {R_bmf:5.3f} m.K/W (effective internal resistance)")

    # calculate maximum deltaT
    deltaT_HZ = T_g - Tmin
    deltaT_KL = T_g - Tmax  # negative

    if (round(Efactor, 2) < 1):  # more cooling than heating: Beginn with cooling period
        print(" cooling dominant")
        # calculate Resistance of Earth with g-functions after cooling period, year 2
        time_superpos_sort, time_superpos_ind_rev, Pfakt = prepare_times_for_gfunction_2J(
            Pfactor, BS_KL, BS_HZ, years, -1)
        # gfun2 = gt.gfunction.gFunction(network, alpha, time=time_superpos_sort*3600., boundary_condition='MIFT',options=options)
        gfun3 = np.interp(time_superpos_sort*3600., time_req, gFunc.gFunc)
        # gfun3 = np.array(gfun2.gFunc)
        gfun3_unsort = gfun3[time_superpos_ind_rev]
        product = np.multiply(gfun3_unsort, Pfakt)
        R_g_2J = abs(sum(product)/(2*pi*lamda))
        print(f" Rg = {R_g_2J:5.3f} m.K/W")

        # calculate Resistance of Earth with g-functions after first heating period, year 21
        time_superpos_sort, time_superpos_ind_rev, Pfakt, time_sort = prepare_times_for_gfunction_20J(
            Pfactor, BS_KL, BS_HZ, years, -1)
        # gfun2 = gt.gfunction.gFunction(network, alpha, time=time_superpos_sort*3600., boundary_condition='MIFT',options=options)
        gfun3 = np.interp(time_superpos_sort*3600., time_req, gFunc.gFunc)
        # gfun3 = np.array(gfun2.gFunc)
        gfun3_unsort = gfun3[time_superpos_ind_rev]
        product = np.multiply(gfun3_unsort, Pfakt)
        R_g = abs(sum(product)/(2*pi*lamda))
        print(f" Rg = {R_g:5.3f} m.K/W")

        # calculate maximum power from Heating and Cooling in respect to given Pfactor

        PKL = deltaT_KL / (R_g+R_bmf)
        PHZ = -PKL * Pfactor
        Tf_mean_max = T_g - deltaT_KL
        Tf_mean_min = T_g - (R_g_2J+R_bmf)*PHZ

        if (Tf_mean_min < Tmin):
            print(f" Heizlimit überschritten: {Tf_mean_min:.2f} °C!")
            P_reduce = deltaT_HZ/(T_g-Tf_mean_min)
            print(f" reduce PKL and PHZ by faktor {P_reduce:.3f}")
            deltaT_KL = deltaT_KL * P_reduce
            PKL = deltaT_KL / (R_g+R_bmf)
            PHZ = -PKL * Pfactor
            Tf_mean_min = T_g - (R_g_2J+R_bmf)*PHZ
            Tf_mean_max = T_g - deltaT_KL
        else:
            print(f" Vorgabe Kühlenergieüberschuss: Limit = Kühlen!")

        Tb_pot_HZ = R_bmf * PHZ + Tf_mean_min
        Tb_pot_KL = R_bmf * PKL + Tf_mean_max

    else:  # more heating than cooling: Beginn with heating period
        print(" heating dominant")
        # calculate Resistance of Earth with g-functions after cooling period, year 2
        time_superpos_sort, time_superpos_ind_rev, Pfakt = prepare_times_for_gfunction_2J(
            Pfactor, BS_HZ, BS_KL, years, 1)
        # gfun2 = gt.gfunction.gFunction(network, alpha, time=time_superpos_sort*3600., boundary_condition='MIFT',options=options)
        gfun3 = np.interp(time_superpos_sort*3600., time_req, gFunc.gFunc)
        # gfun3 = np.array(gfun2.gFunc)
        gfun3_unsort = gfun3[time_superpos_ind_rev]
        product = np.multiply(gfun3_unsort, Pfakt)
        R_g_2J = abs(sum(product)/(2*pi*lamda))
        print(f" Rg_2J = {R_g_2J:5.3f} m.K/W")

        # calculate Resistance of Earth with g-functions after first heating period, year 21
        time_superpos_sort, time_superpos_ind_rev, Pfakt, time_sort = prepare_times_for_gfunction_20J(
            Pfactor, BS_HZ, BS_KL, years, 1)
        # gfun2 = gt.gfunction.gFunction(network, alpha, time=time_superpos_sort*3600., boundary_condition='MIFT',options=options)
        # gfun3 = np.array(gfun2.gFunc)
        gfun3 = np.interp(time_superpos_sort*3600., time_req, gFunc.gFunc)
        gfun3_unsort = gfun3[time_superpos_ind_rev]
        product = np.multiply(gfun3_unsort, Pfakt)
        R_g = abs(sum(product)/(2*pi*lamda))
        print(f" Rg_20J = {R_g:5.3f} m.K/W")

        # calculate maximum power from Heating and Cooling in respect to given Pfactor
        PHZ = deltaT_HZ / (R_g+R_bmf)
        PKL = -PHZ / Pfactor
        Tf_mean_max = T_g + (R_g_2J+R_bmf)*PHZ
        Tf_mean_min = T_g - deltaT_HZ

        if (Tf_mean_max > Tmax):
            print(f" Kühllimit überschritten: {Tf_mean_max:.2f} °C!")
            P_reduce = deltaT_KL/(T_g-Tf_mean_max)
            print(f" reduce PKL and PHZ by faktor {P_reduce:.2f}")
            deltaT_HZ = deltaT_HZ * P_reduce
            PHZ = deltaT_HZ / (R_g+R_bmf)
            PKL = -PHZ / Pfactor
            Tf_mean_max = T_g + (R_g_2J+R_bmf)*PHZ
            Tf_mean_min = T_g - deltaT_HZ
        else:
            print(f" Vorgabe Heizenergieüberschuss: Limit = Heizen!")

        Tb_pot_HZ = R_bmf * PHZ + Tf_mean_min
        Tb_pot_KL = R_bmf * PKL + Tf_mean_max

    print(f"         Pot PHZ   = {PHZ:6.2f} W/m")
    print(f"         Pot PKL   = {PKL:6.2f} W/m")
    print(f"         deltaT_HZ = {deltaT_HZ:6.2f} K")
    print(f"         deltaT_KL = {deltaT_KL:6.2f} K")
    print(f"         Pot Tbmin = {Tb_pot_HZ:6.2f} °C")
    print(f"         Pot Tbmax = {Tb_pot_KL:6.2f} °C")
    print(f"   Pot Tf_mean_min = {Tf_mean_min:6.2f} °C")
    print(f"   Pot Tf_mean_max = {Tf_mean_max:6.2f} °C")

    # -------------------------------------------------------------------------
    # hourly Simulation
    # -------------------------------------------------------------------------

    # Evaluate heat extraction rate
    P_tot = np.zeros(Nt)

    T_b = np.zeros(Nt)
    Tf_in = np.zeros(Nt)
    Tf_out = np.zeros(Nt)
    Tf_m_sim = np.zeros(Nt)
    Tf_m_sim2 = np.zeros(Nt)

    for i, (t) in enumerate(time):
        # Increment time step by (1)
        # print(t/3600)
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
            print(f"WARNING at time {t/3600.}")
            P_tot[i] = 0.0

        # Apply current load (in watts per meter of borehole)
        LoadAgg.set_current_load(P_tot[i])

        # calculate borehole and fluid temperatures
        # Evaluate borehole wall temperature
        deltaT_b = LoadAgg.temporal_superposition()
        T_b[i] = T_g - deltaT_b

        Tf_m_sim[i] = T_b[i]-P_tot[i]*R_bmf

        # Evaluate inlet fluid temperature (all boreholes are the same)
        # Tf_in[i] = network.get_network_inlet_temperature(P_tot[i]*divider, T_b[i], m_flow_network, cp_f, nSegments=1)

        # Evaluate outlet fluid temperature
        # Tf_out[i] = network.get_network_outlet_temperature(Tf_in[i],  T_b[i], m_flow_network, cp_f, nSegments=1)
        # Tf_m_sim2[i]=(Tf_in[i]+Tf_out[i])/2

    last = T_b.size-1
    print(f" Sim Tb = {T_b[last]:6.2f}")
    print(f" Sim Tm = {Tf_m_sim[last]:6.2f}")

    # -------------------------------------------------------------------------
    # Plot hourly heat extraction rates and temperatures
    # -------------------------------------------------------------------------
    image_hash = plotgraf2(PNGPath, time/3600./24./365., P_tot, "time [years]", "specific heat extraction rate [W/lm]", time/3600./24./365., Tf_m_sim, "time [years]", "temperature [°C]",
                           T_g, "Power Input per bore meter (heating = positive, cooling negative)", "Development of mean fluid temperatures over time (average of inlet and outlet)", BS_HZ, BS_KL)
    # plotgraf1("C:/Users/fucmar/ownCloud/Gel_Sep/pyg/ZFS_03.png",tt/24./365.,gFunc.gFunc,"time [years]","gfunction",[0.],[0.], "gfunction for defined BHE field")

    return PHZ, PKL, image_hash


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
