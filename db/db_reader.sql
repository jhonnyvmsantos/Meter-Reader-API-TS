CREATE DATABASE db_meter;
# DROP DATABASE db_meter;
USE db_meter;

CREATE TABLE tbl_measure (
	measure_uuid VARCHAR(100) PRIMARY KEY,
    image LONGBLOB,
    costumer_code VARCHAR(100),
    measure_datetime DATETIME DEFAULT NOW(),
    measure_type VARCHAR(5),
    measure_value INT,
    has_confirmed BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(2083)
);