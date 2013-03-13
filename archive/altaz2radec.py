#!/usr/bin/env python
from datetime import datetime
from math import pi, sin, cos, asin, acos, floor

# altAz2RaDec

def AltAz2RaDec(Altitude,Azimuth,Latitude,Longitude,time=None):
	"""Convert Altitude/Azimuth angles in degrees to Right Ascension/Declination in degrees for an Alt/Az telescope. Adopted from Matlab."""
	deg2rad = pi/180.
	if time == None:
		time = datetime.now()
	JD = floor(365.25*(time.year + 4716.0)) + floor(30.6001*( time.month + 1.0)) + 2.0 - floor(time.year/100.0) + floor(floor(time.year/100.0 )/4.0) + time.day - 1524.5 + (time.hour + time.minute/60. + time.second/3600.)/24.
	T = (JD - 2451545)/36525	
	ThetaGMST = 67310.54841 + (876600*3600 + 8640184.812866)*T + .093104*(T**2) - 6.2e-6*(T**3)
#	z = ( ThetaGMST % (86400*(ThetaGMST/abs(ThetaGMST))/240) ) % 360
	y = 86400*(ThetaGMST/float(abs(ThetaGMST)))
	x = (ThetaGMST % y)/240.
	ThetaGMST = x % 360
	ThetaLST = ThetaGMST + Longitude;
	ThetaLST = ThetaLST % 360
	Dec = asin(sin(Altitude*deg2rad)*sin(Latitude*deg2rad) + cos(Altitude*deg2rad)*cos(Latitude*deg2rad)*cos(Azimuth*deg2rad))
	cos_RA = (sin(Altitude*deg2rad) - sin(Dec)*sin(Latitude*deg2rad))/(cos(Dec)*cos(Latitude*deg2rad))
	Dec = Dec/deg2rad
	RA = acos(cos_RA)/deg2rad
	if sin(Azimuth*deg2rad) > 0: 
		RA = 360 - RA
	RA = ThetaLST - RA
	if RA < 0:
		RA = RA + 360
	if Dec >= 0:
		Dec = abs(Dec)
	else:
		Dec = -abs(Dec)
	return RA, Dec

if __name__ == "__main__":
	print "AltAz2RaDec(50.,40.,30., 20.) = ", AltAz2RaDec(50.,40.,30., 20.)	
