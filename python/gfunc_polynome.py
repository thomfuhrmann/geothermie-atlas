# -*- coding: utf-8 -*-
""" Calculation of g-functions using uniform heat extraction rates.

Dimensioning of BHE at LEVEL 1 und Level 2

"""

from __future__ import absolute_import, division, print_function
from multiprocessing import freeze_support

import sys, os

#import matplotlib.lines as mlines
#import matplotlib.pyplot as plt
import numpy as np
import math 
#from matplotlib.ticker import AutoMinorLocator

import pygfunction as gt
import re

def compute_r2(y_true, y_predicted):
    sse = sum((y_true - y_predicted)**2)
    tse = (len(y_true) - 1) * np.var(y_true, ddof=1)
    r2_score = 1 - (sse / tse)
    #return r2_score, sse, tse
    return r2_score


def main():
    # -------------------------------------------------------------------------
    # Simulation parameters
    # -------------------------------------------------------------------------


    alpha = 1.0e-6    # Ground thermal diffusivity (m2/s), needed but not relevant for ES


    # Borehole dimensions
    B = 5           	# Borehole spacing (m), recom: 5m for storage, 10m for uniform
    D = 1.0             # Borehole buried depth (m)
    H = 100.0           # Borehole length (m)
    r_b = 0.075         # Borehole radius (m)
    
    #Rb=0.071

    SAmax=1600          # maximum dimension of BHE field (BHE number)
    order=13            # polynom order, rec >=9
    
    ts = H**2/(9.*alpha)            # Bore field characteristic time
    print("ts = ", ts)
    
    #lnES=np.arange(-10,3.5,0.5)
    lnES=np.arange(-6.5,4.5,0.5)
    ES=np.exp(lnES)
    time=ES*ts
    print(lnES)
    

    #Find relative path of application for File I/O
    if getattr(sys, 'frozen', False):
        application_path = os.path.dirname(sys.argv[0])
        print("frozen")
    else:
        application_path = os.path.dirname(os.path.abspath(__file__))
    
    filePath2 = os.path.join(application_path, "gfunc_poly1600_" + str(B) + "m.txt")
    fileload = os.path.join(application_path,  "gfunc_poly1600_" + str(B) + "m.npy")
    filesave = os.path.join(application_path,  "gfunc_poly1600_" + str(B) + "m_new.npy")
    print("Pfad: ", filePath2)
    file_out = open(filePath2,'w')

    poly_2d = np.zeros((order+1, SAmax))
    #poly_2d = np.asmatrix(np.zeros((order+1, SAmax)))

    try:
        gf_load = np.load(fileload)
    #except IOError:
    except FileNotFoundError:
        gf_load=0
        print("\n!!! WARNING: Polynoms - File not accessible\n")
    else:
        print("\nPolynom File found\n")
        #print(gf_load)
    print("S O N D E N A B S T A N D =%3d m" % B)

    SA=1
    N_1_old=0
    N_2_old=0
    while SA <=SAmax:

 
        print("Sondenanzahl  =%3d" % SA)
        N_1=int(math.floor(math.sqrt(SA)))
        N_2=int(math.ceil(SA/N_1))
        print("Sondenfeld  =%3d  x%3d" % (N_1, N_2))
        boreField1 = gt.boreholes.rectangle_field(N_1, N_2, B, B, H, D, r_b)

        if SA>900:
            ix=103
        elif SA>400:
            ix=102
        elif SA>100:
            ix=101
        else:
            ix=SA

        # -------------------------------------------------------------------------
        # Evaluate g-functions for the given BHE field
        # -------------------------------------------------------------------------

        if (N_1_old==N_1 and N_2_old==N_2):
            print("same, same")
        else:
            gfunc=gt.gfunction.uniform_heat_extraction(boreField1, time, alpha, disp=True)
            gfunc=np.array(gfunc)
            poly = np.polynomial.polynomial.polyfit(lnES,gfunc, order)

        poly_2d[:,ix-1:ix] = poly.reshape(order+1,1)
        #poly_2d[:,ix] = poly.reshape(order+1,1)
        poly_val = np.polynomial.polynomial.polyval(lnES,poly)

        r_sq=compute_r2(gfunc, poly_val)
        print(r_sq)
        
        #line = ("%3d\t %3d\t %3d\t %e\t %e\t %e\t %e\t %e\t %e\t %e\t %e \n" % (SA, N_1, N_2, poly[0], poly[1], poly[2],poly[3],poly[4],poly[5],poly[6], r_sq))
        
        #print(line) 
        #file_out.write(line)
        #file_out.write(np.array2string(np.hstack([gfunc, poly_val]),separator='\t'))

        line = ("%3d\t %3d\t %3d\t %3d\t %1.13f\t" % (ix, SA, N_1, N_2,r_sq))
        file_out.write(line)
        line = np.array2string((gfunc),max_line_width=1000,separator='\t')
        line=line.replace('[','')
        line=line.replace(']','')
        file_out.write(line)
        file_out.write('\t\t')
        line = np.array2string((poly_val),max_line_width=1000,separator='\t')
        line=line.replace('[','')
        line=line.replace(']','')
        file_out.write(line)
        file_out.write('\n')

        #np.savetxt(file_out,np.column_stack((ES,(lnES),gfunc)),header=line, delimiter='\t')
        #np.savetxt(file_out,np.column_stack((ES,(lnES),gfunc)),header=line, delimiter='\t')
        #SA=SA+1
        if SA>=1600:
            SA=SA+1000
        elif SA>=900:
            SA=1600
        elif SA>=400:
            SA=900
        elif SA>=100:
            SA=400
        else:
            SA=SA+1
        N_1_old=N_1
        N_2_old=N_2

    file_out.close()
    #print(poly_2d)
    np.save(filesave,poly_2d)
    return

# Main function
if __name__ == '__main__':
    freeze_support()
    main()
    
