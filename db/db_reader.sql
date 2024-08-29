CREATE DATABASE db_reader;
# DROP DATABASE db_reader;
USE db_reader;

CREATE TABLE tbl_costumer (
	costumer_code VARCHAR(100) PRIMARY KEY,
    costumer_name VARCHAR(50)
);

CREATE TABLE tbl_measure (
	measure_uuid VARCHAR(100) PRIMARY KEY,
    image LONGBLOB,
    costumer_code VARCHAR(100),
    measure_datetime DATETIME DEFAULT NOW(),
    measure_type VARCHAR(5),
    measure_value INT,
    has_confirmed BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(2083),
	CONSTRAINT tbl_measure_costumer_code_fk FOREIGN KEY (costumer_code)
    REFERENCES tbl_costumer (costumer_code)
);

INSERT INTO tbl_costumer (costumer_code, costumer_name) VALUES ("7ec25ca3-d504-4bea-8bf3-db29e667ed18", "Ronaldo F"),
("f10d2989-869e-4da3-acb4-b3cc137d8a80", "Criastiano R"), ("a95ba0f5-5a88-4890-af6c-f2190740acb4", "Luciano H");
#INSERT INTO tbl_measure (measure_uuid, image, costumer_code, measure_datetime, measure_type, measure_value, has_confirmed, image_url)
#VALUE ();

SELECT *
FROM tbl_measure AS a
INNER JOIN tbl_costumer AS b ON b.costumer_code = a.costumer_code;