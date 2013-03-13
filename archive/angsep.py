from numpy import sin,cos,pi,sqrt,arctan,arctan2
def angularSeparationInDegrees(ra1,dec1,ra2,dec2):
	c = pi/180.
	r1=ra1*pi/180.
	r2=ra2*pi/180.
	d1=dec1*pi/180.
	d2=dec2*pi/180.
	d=sin((d1-d2)/2.)
	h1=d*d
	a = sin((r1 - r2)/2.)
	h2 = a * a
	h3 = h1+cos(d1) * cos(d2) * h2
	s1 = sqrt(h3)
	c1 = sqrt(1 - s1 * s1)
#	s = 2 * arctan(s1 / c1) / c
	s = 2 * arctan2(s1, c1) / c
	return s

