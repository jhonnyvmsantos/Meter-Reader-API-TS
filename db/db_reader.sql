CREATE DATABASE db_reader;
# DROP DATABASE db_reader;
USE db_reader;

CREATE TABLE tbl_type_measure (
	type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(5)
);

CREATE TABLE tbl_costumer (
	costumer_code VARCHAR(100) PRIMARY KEY,
    costumer_name VARCHAR(50)
);

CREATE TABLE tbl_measure (
	measure_uuid VARCHAR(100) PRIMARY KEY,
    image LONGBLOB,
    costumer_code VARCHAR(100),
    measure_datetime DATETIME,
    measure_type INT,
    measure_value INT,
    has_confirmed BOOLEAN,
    image_url VARCHAR(2083)
);

INSERT INTO tbl_type_measure (type_name) VALUES ("WATER"), ("GAS");