#!/usr/bin/python
print "Content-Type: text/plain\n"
from datetime import datetime
import cgi
import urllib2
import cgitb
cgitb.enable()
from altaz2radec import AltAz2RaDec
import MySQLdb as mdb
from angsep import angularSeparationInDegrees as ang

sep_limit = 25.0
fov=25
limag=8.0

form = cgi.FieldStorage()
name = form.getfirst('name')
lon = int(form.getfirst('lon'))
lat = int(form.getfirst('lat'))
year = int(form.getfirst('year'))
month = int(form.getfirst('month'))
day = int(form.getfirst('day'))
hour = int(form.getfirst('hour'))
minute = int(form.getfirst('minute'))
date = datetime(year, month, day, hour, minute)
second = 0
ns = form.getfirst('ns')
action = form.getfirst('action')
if ns == "South":
		lat=-lat

ra, dec = AltAz2RaDec(90,0,lon, lat, time=date)
#print "Your input has been accepted, %s at lon = %s and lat = %s"%(name, lon, lat)
#print "Converted into %s, %s"%(ra, dec)
#print "Datum = ", date
str = "http://www.fourmilab.ch/cgi-bin/Yourtel?date=1&utc=%s%%2F%s%%2F%s+%s%%3A%s%%3A%s&lon=%s&lat=%s&ns=%s&fov=%s&coords=&moonp=&deep=&deepm=5.0&consto=&constn=&consts=&constb=&limag=%2.1f&starn=&starnm=3.0&starb=&flip=&imgsize=512&dynimg=y"%(year,month, day, hour, minute, second, ra, dec, ns, fov,limag)

con = mdb.connect('localhost', 'yourspaceuser', 'hovnokleslo', 'yourspace')
with con:
        cur = con.cursor()
        cur.execute("CREATE TABLE IF NOT EXISTS users (Id INT key auto_increment, Name VARCHAR(25) UNIQUE, Birthday DATETIME, Longitude FLOAT, Latitude FLOAT, RA FLOAT, Decl FLOAT)")
        insert = "INSERT IGNORE INTO users (Name, Birthday, Longitude, Latitude, RA, Decl) values ('%s','%s',%f,%f,%f,%f)"%(name,date,lon,lat,ra,dec)

	insert_update = "INSERT INTO users (Name, Birthday, Longitude, Latitude, RA, Decl) VALUES ('%s','%s',%f,%f,%f,%f) ON DUPLICATE KEY UPDATE Birthday = '%s', Longitude = %f, Latitude = %f, RA = %f, Decl = %f"%(name,date,lon,lat,ra,dec, date,lon,lat,ra,dec)
        cur.execute(insert_update)
#        cur.execute("SELECT * FROM users")
#       rows = cur.fetchall()
#        for row in rows:
#                print row

if action=="img":
	img = urllib2.urlopen(str)
	img_content = img.read()
	img.close()
	print img_content
else:
	with con:
		cur = con.cursor(mdb.cursors.DictCursor)
		cur.execute("SELECT * FROM users order by Name asc")
		rows = cur.fetchall()
		c = 0
		numrows = int(cur.rowcount)
		print "%-12s %-19s %-5s %-5s %-5s %-5s %-5s Status"%('Name','Birthday','Long','Lat','RA','Dec','Sep')
		for row in rows:
			sep = ang( row['RA'], row['Decl'], ra, dec)
			print "%-12s %.19s %5.1f %5.1f %5.1f %5.1f %5.1f"%(row['Name'], row['Birthday'], row['Longitude'], row['Latitude'],row['RA'], row['Decl'], sep),
			if row['Name'] == name:
				print "(yourself)"
				continue
			if sep < sep_limit:
				c = c+1
				print "(in your space!)"
			else:
				print
		print "%i out of %i other users in your space (sep. limit = %.1f)"%(c, numrows-1, sep_limit)

#http://www.fourmilab.ch/cgi-bin/Yourtel?date=1&utc=1998%2F02%2F14+20%3A55%3A01&lon=20&lat=40&ns=North&fov=45&coords=&moonp=&deep=&deepm=5.0&consto=&constn=&consts=&constb=&limag=6.0&starn=&starnm=3.0&starb=&flip=&imgsize=512&dynimg=y
