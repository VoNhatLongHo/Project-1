CREATE DATABASE SchoolDB

use schooldb

CREATE TABLE DULIEUMAU
    (id int IDENTITY (1,1),  
    The_geom geometry,   
	Name nvarchar(50) )

INSERT INTO DULIEUMAU (The_geom, Name) VALUES (geometry::STGeomFromText('POINT(105.772175 10.030212)', 0), N'Cổng A - ĐHCT')
INSERT INTO DULIEUMAU (The_geom, Name) VALUES (geometry::STGeomFromText('POINT(105.773492 10.031844)', 0), N'Sở GDĐT Cần Thơ')
INSERT INTO DULIEUMAU (The_geom, Name) VALUES (geometry::STGeomFromText('LINESTRING(105.771002 10.031173,105.772172 10.030222)', 0), N'Đường cổng A')
INSERT INTO DULIEUMAU (The_geom, Name) VALUES (geometry::STGeomFromText('POLYGON((105.76913 10.031537,105.768696 10.030972,105.76905 10.030644,105.769538 10.031204,105.76913 10.031537))', 0), N'Khoa CNTT - TT')

DELETE FROM DULIEUMAU WHERE id>=5

SELECT * FROM DULIEUMAU


SELECT *, The_geom.STGeometryType() spatialType from dulieumau

SELECT id, The_geom.STAsText() wkt, Name  FROM DULIEUMAU

SELECT name, the_geom.STAsText() Wkt,
ROUND(geography::STGeomFromText(the_geom.STAsText(),4326).STDistance(
	  geography::STGeomFromText('POINT(105.77503681182863 10.033502751433389)', 4326)), 2) as dis_met FROM dulieumau