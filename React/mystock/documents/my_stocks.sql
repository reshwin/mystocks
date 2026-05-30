-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: localhost    Database: my_stocks
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `tbl_product_types`
--

DROP TABLE IF EXISTS `tbl_product_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_product_types` (
  `m_id` int NOT NULL AUTO_INCREMENT,
  `m_type` varchar(45) NOT NULL,
  `m_type_sub` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`m_id`),
  UNIQUE KEY `uq_type_sub` (`m_type`,`m_type_sub`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_product_types`
--

LOCK TABLES `tbl_product_types` WRITE;
/*!40000 ALTER TABLE `tbl_product_types` DISABLE KEYS */;
INSERT INTO `tbl_product_types` VALUES (11,'Capacitor',NULL),(9,'IC','Energy Meter'),(8,'IC','Memory'),(7,'IC','Microcontroller'),(10,'Resistance','');
/*!40000 ALTER TABLE `tbl_product_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_products`
--

DROP TABLE IF EXISTS `tbl_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_products` (
  `m_id` int NOT NULL AUTO_INCREMENT,
  `m_name` varchar(45) DEFAULT NULL,
  `m_pins` int DEFAULT NULL,
  `m_rack_location` varchar(45) DEFAULT NULL,
  `m_link` varchar(355) DEFAULT NULL,
  `m_description` varchar(200) DEFAULT NULL,
  `m_id_type` int DEFAULT NULL,
  `m_min_qty` int DEFAULT '0' COMMENT 'Alert when stock below this',
  `m_unit` varchar(20) DEFAULT NULL COMMENT 'nos | pcs | meters | kg',
  `m_is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`m_id`),
  UNIQUE KEY `Name` (`m_name`),
  KEY `fk_product_type` (`m_id_type`),
  CONSTRAINT `fk_product_type` FOREIGN KEY (`m_id_type`) REFERENCES `tbl_product_types` (`m_id`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_products`
--

LOCK TABLES `tbl_products` WRITE;
/*!40000 ALTER TABLE `tbl_products` DISABLE KEYS */;
INSERT INTO `tbl_products` VALUES (1,'ADUM1201CRZ',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(2,'510 Ohm',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(3,'68nF',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(4,'ICM7555ID',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(5,'0.001 Ohm',NULL,'','','',11,0,NULL,1),(6,'1M Ohm',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(7,'ESP-12F ESP8266',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(8,'10K Ohm',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(9,'1K Ohm',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(10,'0.1uF',NULL,'','','',10,0,NULL,1),(11,'Shipping',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(12,'TRF250-500',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(13,'SMBJ3V3CA TVS Diode - Bidirectional',NULL,'6x7',NULL,NULL,NULL,0,NULL,1),(14,'HLK-PM03',NULL,'4x3',NULL,NULL,NULL,0,NULL,1),(15,'2 Pin Jumper',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(16,'OLED 0.96',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(18,'390K Ohm',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(19,'SW18020P',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(20,'GST',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(21,'W5500',NULL,'2x4',NULL,NULL,NULL,0,NULL,1),(22,'MAX3485',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(23,'MAX3232',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(24,'SM12.TCT',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(25,'120 Ohm',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(26,'SM712',NULL,'6x7',NULL,NULL,NULL,0,NULL,1),(27,'LEM HO 10-P',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(28,'Mini MP1584 DC-DC 3A',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(29,'AMC1200',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(30,'10 Ohm',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(31,'B0505S',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(32,'MMBT2222',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(33,'DC JACK-005',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(34,'SMF33A',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(35,'SMBJ33CA',NULL,'6x7',NULL,NULL,NULL,0,NULL,1),(36,'STM32G071RBT6',NULL,'4x4',NULL,NULL,NULL,0,NULL,1),(37,'SIM A7672S',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(38,'EBYTE E32-433T30D-V8',NULL,NULL,'https://robu.in/product/ebyte-e32-433t30d-v8-lora-433mhz-uart-iot/?gad_source=1&gad_campaignid=17413441824&gbraid=0AAAAADvLFWf5dEDWLuZUbhDwoLvWX7Rrm&gclid=EAIaIQobChMI7bSV-fjpkwMVBIFLBR0OkQhUEAQYASABEgI8efD_BwE',NULL,NULL,0,NULL,1),(39,'E32-900T30D-V8',NULL,NULL,'https://www.ktron.in/product/e32-900t30d-v8-module-ebyte-lora-862-915mhz',NULL,NULL,0,NULL,1),(40,'SN74LVC1G32DRLR',NULL,NULL,'https://robu.in/product/sn74lvc1g32drlr-tech-public-sot-553-logic-gates-rohs/','Used for combining Tx and Rx for monitoring',NULL,0,NULL,1),(41,'3 Pin 2.54 Female',NULL,'3x1',NULL,NULL,NULL,0,NULL,1),(42,'3 Pin 2.54 Male',NULL,'3x1',NULL,NULL,NULL,0,NULL,1),(43,'W25Q128JVFIQ',16,'5x6',NULL,NULL,NULL,0,NULL,1),(44,'W25Q128JVSSIQ',8,'5x6',NULL,NULL,NULL,0,NULL,1),(45,'SIM A7672S 4G LTE + 2G + GNSS',NULL,NULL,NULL,NULL,NULL,0,NULL,1),(46,'STM32G030K8T6',32,NULL,'https://robu.in/product/stm32g030k8t6-stmicroelectronics-stm32g030k8t6-arm-mcu-stm32-family-stm32g0-series-microcontrollers-arm-cortex-m0-32-bit-64-mhz-64-kb/','STM32G030K8T6-STMICROELECTRONICS-STM32G030K8T6-ARM MCU, STM32 Family STM32G0 Series Microcontrollers, ARM Cortex-M0+, 32 bit, 64 MHz, 64 KB',NULL,0,NULL,1),(47,'BL0942',NULL,NULL,NULL,NULL,NULL,0,NULL,1);
/*!40000 ALTER TABLE `tbl_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_purchase`
--

DROP TABLE IF EXISTS `tbl_purchase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_purchase` (
  `m_id` int NOT NULL AUTO_INCREMENT,
  `m_product_id` int DEFAULT NULL,
  `m_id_supplier` int DEFAULT NULL,
  `m_order_no` varchar(45) DEFAULT NULL,
  `m_slno` int DEFAULT NULL,
  `m_date` date DEFAULT NULL,
  `m_item` varchar(45) DEFAULT NULL,
  `m_type` varchar(45) DEFAULT NULL,
  `m_date_received` date DEFAULT NULL,
  `m_package` varchar(45) DEFAULT NULL,
  `m_pins` int DEFAULT NULL,
  `m_qty` double DEFAULT NULL,
  `m_rate` double DEFAULT NULL COMMENT 'Rate of one item',
  `m_gst` double DEFAULT NULL COMMENT 'gst for one',
  `m_amount` double DEFAULT NULL COMMENT 'amount used for calculation',
  `m_unit` varchar(45) DEFAULT NULL,
  `m_supplier_id` varchar(45) DEFAULT NULL,
  `m_courier` varchar(45) DEFAULT NULL,
  `m_tracking` varchar(45) DEFAULT NULL,
  `m_remarks` varchar(45) DEFAULT NULL,
  `m_for_project` varchar(45) DEFAULT NULL,
  `m_description` varchar(200) DEFAULT NULL,
  `m_buy_link` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`m_id`),
  UNIQUE KEY `order` (`m_id_supplier`,`m_order_no`,`m_slno`),
  KEY `fk_purchase_product` (`m_product_id`),
  CONSTRAINT `fk_purchase_product` FOREIGN KEY (`m_product_id`) REFERENCES `tbl_products` (`m_id`)
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_purchase`
--

LOCK TABLES `tbl_purchase` WRITE;
/*!40000 ALTER TABLE `tbl_purchase` DISABLE KEYS */;
INSERT INTO `tbl_purchase` VALUES (1,NULL,1,'#3150452',1,'2025-11-21','ADUM1201CRZ','IC','2025-11-21','NSOIC',8,1,254,NULL,254,NULL,'R166595','Bluedart','#90311661882',NULL,'Energy Meter','ADUM1201CRZ-Analog Devices-Digital Isolator, 2 Channels, 2.7 V, 5.5 V, NSOIC, 8 Pins, 50 Mbps ','https://robu.in/product/adum1201crz-analog-devices-digital-isolator-2-channels-2-7-v-5-5-v-nsoic-8-pins-50-mbps/'),(2,NULL,1,'#3150452',2,'2025-11-21','510 Ohm','Resistor','2025-11-21','1206',NULL,50,0.27,NULL,18.5,NULL,'R135953','Bluedart','#90311661882',NULL,'Energy Meter','RC1206FR-07510RL-YAGEO-Res Thick Film 1206 510 Ohm 1% 0.25W(1/4W) ±100ppm/°C Pad SMD T/R','https://robu.in/product/rc1206fr-07510rl-yageo-res-thick-film-1206-510-ohm-1-0-25w1-4w-%c2%b1100ppm-c-pad-smd-t-r/'),(3,NULL,1,'#3150452',3,'2025-11-21','68nF','Capacitor','2025-11-21','1206',NULL,20,0.92,NULL,27.8,NULL,'R153688','Bluedart','#90311661882',NULL,'Energy Meter','TCC1206X7R683K500DT-CCTC-SMT ceramic capacitors 1206 X7R 683K(68nF)±10% Rated voltage:50V thickness:0.85mm tape','https://robu.in/product/tcc1206x7r683k500dt-cctc-smt-ceramic-capacitors-1206-x7r-683k68nf%c2%b110-rated-voltage50v-thickness0-85mm-tape/'),(4,NULL,1,'#3150452',4,'2025-11-21','ICM7555ID','IC','2025-11-21',NULL,NULL,2,17,NULL,34,NULL,'R201460','Bluedart','#90311661882',NULL,'Energy Meter','ICM7555ID-HLF-Low-power CMOS timer IC','https://robu.in/product/icm7555id-hlf-low-power-cmos-timer-ic/'),(5,NULL,1,'#3150452',5,'2025-11-21','0.001 Ohm','Resistor','2025-11-21','2512',NULL,5,17,NULL,85,NULL,'591862','Bluedart','#90311661882',NULL,'Energy Meter','0.001 Ohm 3W Surface Mount Sense Resistor','https://robu.in/product/0-001-ohm-3w-surface-mount-sense-resistor-pack-of-3/'),(6,NULL,1,'#3150452',6,'2025-11-21','1M Ohm','Resistor','2025-11-21','1206',NULL,20,0.65,NULL,13,NULL,'574983','Bluedart','#90311661882',NULL,'Energy Meter','1M Ohm 1/4W 1206 Surface Mount Chip Resistor','https://robu.in/product/1m-ohm-1-4w-1206-surface-mount-chip-resistor-pack-of-100/'),(7,NULL,1,'#3150452',7,'2025-11-21','ESP-12F ESP8266','IC','2025-11-21',NULL,NULL,2,97,NULL,194,NULL,'18836','Bluedart','#90311661882',NULL,'Energy Meter','ESP-12F ESP8266 Wifi Wireless IoT Board Module','https://robu.in/product/latest-esp-12f-esp8266-wifi-module-ap-station-remote-serial-wireless-iot-board/'),(8,NULL,1,'#3150452',8,'2025-11-21','10K Ohm','Resistor','2025-11-21','1206',NULL,20,0.69,NULL,13.8,NULL,'574970','Bluedart','#90311661882',NULL,'Energy Meter','10k Ohm 1/4W 1206 Surface Mount Chip Resistor','https://robu.in/product/10k-ohm-1-4w-1206-surface-mount-chip-resistor-pack-of-100/'),(9,NULL,1,'#3150452',9,'2025-11-21','1K Ohm','Resistor','2025-11-21','1206',NULL,20,0.66,NULL,11,NULL,'872087','Bluedart','#90311661882',NULL,'Energy Meter','Yageo 1k Ohm 1/4W 1206 Surface Mount Chip Resistor','https://robu.in/product/yageo-1k-ohm-1-4w-1206-surface-mount-chip-resistor-pack-of-50/'),(10,NULL,1,'#3150452',10,'2025-11-21','0.1uF','Capacitor','2025-11-21','1206',NULL,20,1.66,NULL,22,NULL,'1415726','Bluedart','#90311661882',NULL,'Energy Meter','0.1uF Capacitor SMD:C 1206','https://robu.in/product/0-1uf-capacitor-smdc-1206/'),(11,NULL,1,'#3150452',11,'2025-11-21','Shipping','Shipping','2025-11-21',NULL,NULL,NULL,NULL,NULL,49,NULL,NULL,'Bluedart','#90311661882',NULL,'Energy Meter',NULL,NULL),(12,NULL,2,'#172476',1,'2025-11-21','510 Ohm','Resistor','2025-11-21','1206',NULL,100,0.67,20.16,67,NULL,'1206S4F5100T5E',NULL,'90312870970',NULL,'Energy Meter','510E 1% 1206 SMD Resistor - Royal Ohm 1206S4F5100T5E','https://evelta.com/account.php?action=view_order&order_id=172476'),(13,NULL,2,'#172476',2,'2025-11-21','Shipping','Shipping','2025-11-21',NULL,NULL,NULL,NULL,NULL,45,NULL,NULL,NULL,'90312870970',NULL,'Energy Meter',NULL,NULL),(14,NULL,3,'#143573',1,'2025-11-21','TRF250-500','Fuse','2025-11-21',NULL,NULL,5,NULL,NULL,37,NULL,'KSTF1950',NULL,NULL,NULL,'Energy Meter','TRF250-500 Resettable Fuse 250V 500mA – TH – Tyco Raychem','https://www.ktron.in/product/trf250-500-resettable-fuse-250v-500ma-th/?v=c86ee0d9d7ed'),(15,NULL,3,'#143573',2,'2025-11-21','390K Ohm','Resistor','2025-11-21','1206',NULL,80,NULL,NULL,24,NULL,'KSTR1760',NULL,NULL,NULL,'Energy Meter','Resistor 390K Ohms 1% 1/4W SMD 1206','https://www.ktron.in/product/resistor-390k-ohms-1-1-4w-smd-1206/?v=c86ee0d9d7ed'),(16,NULL,3,'#143573',3,'2025-11-21','1M Ohm','Resistor','2025-11-21',NULL,NULL,40,NULL,NULL,14,NULL,'KSTR1530',NULL,NULL,NULL,'Energy Meter','Resistor 1M Ohms 1% – 1/4W – SMD 1206','https://www.ktron.in/product/resistor-1m-ohms-1-1-4w-smd-1206/?v=c86ee0d9d7ed'),(17,NULL,3,'#143573',4,'2025-11-21','SMBJ3V3CA TVS Diode - Bidirectional','TVS','2025-11-21',NULL,NULL,5,NULL,NULL,16.8,NULL,'KSTD1124',NULL,NULL,NULL,'Energy Meter','SMBJ3V3CA TVS Diode – Bidirectional – SMB (DO-214AA)','https://www.ktron.in/product/smbj3v3ca-tvs-diode-smb-do-214aa/?v=c86ee0d9d7ed'),(18,NULL,3,'#143573',5,'2025-11-21','Shipping','Shipping','2025-11-21',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Energy Meter',NULL,NULL),(19,NULL,4,'#48271',1,'2025-11-21','OLED 0.96','Display','2025-12-08',NULL,NULL,3,131,NULL,393,NULL,NULL,NULL,NULL,NULL,'Energy Meter','0.96 Inch I2C/IIC 128x64 OLED Display Module 4 Pin - Blue Color','https://www.electropi.in/0.96-inch-i2c-iic-128x64-oled-display-module-4-pin-blue-color?search=0.96'),(20,NULL,4,'#48271',2,'2025-11-21','Shipping','Shipping','2025-12-08',NULL,NULL,NULL,49,NULL,49,NULL,NULL,NULL,NULL,NULL,'Energy Meter',NULL,NULL),(21,NULL,4,'#48271',3,'2025-11-21','GST','GST','2025-12-08',NULL,NULL,NULL,NULL,NULL,79.56,NULL,NULL,NULL,NULL,NULL,'Energy Meter',NULL,NULL),(22,NULL,3,'144432',1,'2025-12-05','SW18020P','Sensor','2025-12-08',NULL,NULL,3,NULL,NULL,18.6,NULL,NULL,'Thirupathi',NULL,NULL,'Energy Meter','Vibration Sensor SW18020P','https://www.ktron.in/product/vibration-sensor-sw18020p/?v=c86ee0d9d7ed'),(23,NULL,3,'144432',2,'2025-12-05','2 Pin Jumper','Connector','2025-12-08',NULL,NULL,35,NULL,NULL,19.95,NULL,NULL,'Thirupathi',NULL,NULL,'Energy Meter','2 Pin Short Jumper','https://www.ktron.in/product/pin-short-jumper/?v=c86ee0d9d7ed'),(24,NULL,3,'144432',3,'2025-12-05','Shipping','Shipping','2025-12-08',NULL,NULL,NULL,NULL,NULL,70.8,NULL,NULL,'Thirupathi',NULL,NULL,'Energy Meter',NULL,NULL),(25,NULL,4,'#48268',1,'2025-11-21','HLK-PM03','Power Supply','2025-11-24',NULL,NULL,2,179,73.26,358,NULL,NULL,NULL,NULL,NULL,'Energy Meter','HLK-PM03 Hi-Link - 3.3V 3W - AC to DC Power Supply Module','https://www.electropi.in/hlk-pm03-hi-link-3.3v-3w-ac-dc-power-supply-module?search=HLK-PM03'),(26,NULL,4,'#48268',2,'2025-11-21','Shipping','Shipping','2025-11-24',NULL,NULL,NULL,49,NULL,49,NULL,NULL,NULL,NULL,NULL,'Energy Meter',NULL,NULL),(27,NULL,3,'144749',1,'2025-12-09','HLK-PM03','Power Supply','2025-12-14',NULL,NULL,2,220.6,NULL,441.2,NULL,NULL,NULL,NULL,NULL,'Energy Meter','Hi Link HLK PM03 - For 3.3V 1A - AC to DC Power Supply Module','https://www.ktron.in/product/hi-link-hlk-pm03/?v=c86ee0d9d7ed'),(28,NULL,3,'144749',2,'2025-12-09','Shipping','Shipping','2025-12-14',NULL,NULL,NULL,70.8,NULL,70.8,NULL,NULL,NULL,NULL,NULL,'Energy Meter',NULL,NULL),(29,NULL,1,'3238110 ',1,'2025-01-06','W5500','Module','2025-01-09',NULL,NULL,1,360,NULL,360,NULL,NULL,NULL,NULL,NULL,'BMS','W5500 TCP / IP SPI to LAN Ethernet Interface SPI to LAN / Ethernet Converter','https://robu.in/product/w5500-tcp-ip-spi-to-lan-ethernet-interface-spi-to-lan-ethernet-converter/'),(30,NULL,1,'3238110 ',2,'2025-01-06','Jumber','Jumber','2025-01-09',NULL,NULL,1,38,NULL,38,NULL,NULL,NULL,NULL,NULL,'BMS','Male to Female Jumper Wires 40Pcs 20cm','https://robu.in/product/male-to-female-jumper-wires-40pcs-20cm/'),(31,NULL,1,'3238110 ',3,'2025-01-06','Jumber','Jumber','2025-01-09',NULL,NULL,1,58,NULL,58,NULL,NULL,NULL,NULL,NULL,'BMS','Female to Female DuPont Line 40 Pin 30cm','https://robu.in/product/female-female-dupont-line-40-pin-30cm/'),(32,NULL,1,'3238110 ',4,'2025-01-06','Shipping','Shipping','2025-01-09',NULL,NULL,1,99,NULL,99,NULL,NULL,NULL,NULL,NULL,'BMS',NULL,NULL),(35,NULL,1,'3239577 ',1,'2025-01-06','MAX3485','IC','2026-01-09',NULL,NULL,4,NULL,NULL,156,NULL,NULL,NULL,NULL,NULL,NULL,'MAX3485EBDTR-XBLW-Transceiver 10Mbps SOP-8 RS-485 / RS-422 ICs ROHS','https://robu.in/product/max3485ebdtr-xblw-transceiver-10mbps-sop-8-rs-485-rs-422-ics-rohs/'),(36,NULL,1,'3239577 ',2,'2025-01-06','MAX3232','IC','2026-01-09',NULL,NULL,2,NULL,NULL,82,NULL,NULL,NULL,NULL,NULL,NULL,'MAX3232EDTR-XBLW-250Kbps Transceiver SOP-16 RS232 ICs ROHS','https://robu.in/product/max3232edtr-xblw-250kbps-transceiver-sop-16-rs232-ics-rohs/'),(37,NULL,1,'3239577 ',3,'2025-01-06','SM12.TCT','TVS','2026-01-09',NULL,NULL,10,NULL,NULL,80,NULL,NULL,NULL,NULL,NULL,NULL,'SM12.TCT-SEMTECH-SM12.TCT-TVS Diode, SM, Bidirectional, 12 V, 19 V, SOT-23, 3 Pins','https://robu.in/product/sm12-tct-semtech-sm12-tct-tvs-diode-sm-bidirectional-12-v-19-v-sot-23-3-pins/'),(38,NULL,1,'3239577 ',4,'2025-01-06','10K Ohm','Resistor','2026-01-09',NULL,NULL,20,NULL,NULL,15,NULL,NULL,NULL,NULL,NULL,NULL,'CR1206F10K7P05-Ever Ohms Tech-250mW Thick Film Resistor 200V ±100ppm/℃ ±1% 10.7kΩ 1206 Chip Resistor - Surface Mount ROHS','https://robu.in/product/cr1206f10k7p05-ever-ohms-tech-250mw-thick-film-resistor-200v-%c2%b1100ppm-%e2%84%83-%c2%b11-10-7k%cf%89-1206-chip-resistor-surface-mount-rohs/'),(39,NULL,1,'3239577 ',5,'2025-01-06','120 Ohm','Resistor','2026-01-09',NULL,NULL,10,NULL,NULL,14.7,NULL,NULL,NULL,NULL,NULL,NULL,'CR1206F120RP05Z-Ever Ohms Tech-250mW Thick Film Resistor ±100ppm/℃ ±1% 120Ω 1206 Chip Resistor - Surface Mount ROHS','https://robu.in/product/cr1206f120rp05z-ever-ohms-tech-250mw-thick-film-resistor-%c2%b1100ppm-%e2%84%83-%c2%b11-120%cf%89-1206-chip-resistor-surface-mount-rohs/'),(40,NULL,1,'3239577 ',6,'2025-01-06','0.1uf','Capacitor','2026-01-09',NULL,NULL,20,NULL,NULL,22,NULL,NULL,NULL,NULL,NULL,NULL,'0.1uF Capacitor SMD:C 1206','https://robu.in/product/0-1uf-capacitor-smdc-1206/'),(41,NULL,1,'3239577 ',7,'2025-01-06','22uf','Capacitor','2026-01-09',NULL,NULL,5,5,NULL,15,NULL,NULL,NULL,NULL,NULL,NULL,'CS3216X5R226M160NRI-SAMWHA-16V 22uF X5R 1206 Multilayer Ceramic Capacitors MLCC - SMD/SMT ROHS','https://robu.in/product/cs3216x5r226m160nri-samwha-16v-22uf-x5r-1206-multilayer-ceramic-capacitors-mlcc-smd-smt-rohs/'),(42,NULL,1,'3239577 ',8,'2025-01-06','Shipping','Shipping','2026-01-09',NULL,NULL,1,1,NULL,99,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(43,NULL,5,'KTSGRU18271',1,'2025-01-07','ADUM1201CRZ','IC',NULL,NULL,NULL,2,89,NULL,178,NULL,NULL,NULL,NULL,NULL,NULL,'ADUM1200ARZ SOIC-8 SMD Dual-Channel Digital Isolator 2.5kV','https://kitsguru.com/products/adum1200arz-soic-8-smd-dual-channel-digital-isolator-2-5kv'),(44,NULL,5,'KTSGRU18271',2,'2025-01-07','Shipping','Shipping',NULL,NULL,NULL,1,79,NULL,79,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(45,NULL,3,'148152',1,'2026-01-26','SM712','IC','2026-04-30',NULL,NULL,10,7.95,NULL,79.5,NULL,NULL,NULL,NULL,NULL,'BMS','SM712.TCT TVS Diode SOT-23','https://www.ktron.in/product/sm712-tct-tvs-diode-semtech-sot-23/?v=c86ee0d9d7ed'),(46,NULL,3,'148152',2,'2026-01-26','HLK-PM03','Power Supply','2026-04-30',NULL,NULL,4,220.6,NULL,882.4,NULL,NULL,NULL,NULL,NULL,'BMS','Hi Link HLK PM03 - For 3.3V 1A - AC to DC Power Supply Module','https://www.ktron.in/product/hi-link-hlk-pm03/?v=c86ee0d9d7ed'),(47,NULL,3,'148152',3,'2026-01-26',NULL,'Shipping','2026-04-30',NULL,NULL,NULL,NULL,NULL,70.8,NULL,NULL,NULL,NULL,NULL,'BMS',NULL,NULL),(48,NULL,1,'3274229 ',1,'2026-01-26','W5500','Module','2026-01-28',NULL,NULL,1,400,NULL,400,NULL,NULL,NULL,NULL,NULL,NULL,'W5500 TCP / IP SPI to LAN Ethernet Interface SPI to LAN / Ethernet Converter','https://robu.in/product/w5500-tcp-ip-spi-to-lan-ethernet-interface-spi-to-lan-ethernet-converter/'),(49,NULL,1,'3274229 ',2,'2026-01-26','Shipping','Shipping','2026-01-28',NULL,NULL,1,49,NULL,49,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(51,NULL,6,'130401',1,'2026-01-28','LEM HO 10-P','Sensor',NULL,NULL,NULL,1,1587.46,NULL,1587.46,NULL,NULL,NULL,NULL,NULL,NULL,'LEM HO 10-P Current Transducer, HO-P Series, PCB, 10A, -25A to 25A, 1.35 %, Voltage Output, 5 Vdc','https://www.tanotis.com/products/lem-ho-10-p-current-transducer-ho-p-series-pcb-10a-25a-to-25a-1-35-voltage-output-5-vdc?variant=41634856403029'),(52,NULL,6,'130401',2,'2026-01-28','Shipping','Shipping',NULL,NULL,NULL,1,75,NULL,75,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(53,NULL,7,'C-20260128-01',1,'2026-01-27','LEM HO 10-P','Sensor','2026-02-01',NULL,NULL,1,1200,216,1416,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(54,NULL,1,'3282914 ',1,'2026-01-31','Mini MP1584 DC-DC 3A','Power Supply','2026-02-01',NULL,NULL,6,44,NULL,264,NULL,NULL,NULL,NULL,NULL,NULL,'Mini MP1584 DC-DC 3A Adjustable Buck Module','https://robu.in/product/mini-mp1584-dc-dc-3a-adjustable-buck-module-india/'),(55,NULL,1,'3282914 ',2,'2026-01-31','22uf','Capacitor','2026-02-01',NULL,NULL,10,21,NULL,210,NULL,NULL,NULL,NULL,NULL,NULL,'TAJB226M016RNJ-Kyocera AVX-22uF 16V 2.3Ω@100kHz ±20% CASE-B-3528-21(mm) Tantalum Capacitors ROHS','https://robu.in/product/tajb226m016rnj-kyocera-avx-22uf-16v-2-3%cf%89100khz-%c2%b120-case-b-3528-21mm-tantalum-capacitors-rohs/'),(56,NULL,1,'3282914 ',3,'2026-01-31','1uf','Capacitor','2026-02-01',NULL,NULL,20,2.74,NULL,51.4,NULL,NULL,NULL,NULL,NULL,NULL,'MP001206-YAGEO-Surface Mount Tantalum Capacitor, 1 µF, 25 V, 1206 [3216 Metric], ± 20%, 8 ohm, A','https://robu.in/product/mp001206-yageo-surface-mount-tantalum-capacitor-1-%c2%b5f-25-v-1206-3216-metric-%c2%b1-20-8-ohm-a/'),(57,NULL,1,'3282914 ',4,'2026-01-31','SMBJ5.0CA','TVS','2026-02-01',NULL,NULL,4,NULL,NULL,17.8,NULL,NULL,NULL,NULL,NULL,NULL,'SMBJ5.0CA-Slkor-65.2A 9.2V 6.4V 5V DO-214AA ESD and Surge Protection (TVS/ESD) ROHS','https://robu.in/product/smbj5-0ca-slkor-65-2a-9-2v-6-4v-5v-do-214aa-esd-and-surge-protection-tvs-esd-rohs/'),(58,NULL,1,'3282914 ',5,'2026-01-31','B0505S','Isolated Power Supply','2026-02-01',NULL,NULL,2,NULL,NULL,170,NULL,NULL,NULL,NULL,NULL,NULL,'K-CUT B0505S-1WR3 DC-DC 5 to 5V Isolated Power Module','https://robu.in/product/k-cut-b0505s/'),(59,NULL,1,'3282914 ',6,'2026-01-31','AMC1200','Voltage Isolator','2026-02-01',NULL,NULL,2,NULL,NULL,182,NULL,NULL,NULL,NULL,NULL,NULL,'AMC1200SDUBR-TEXAS INSTRUMENTS-Isolation Amplifier, 1 Amplifier, 200 µV, 4 kV, 2.7V to 5.5V, SOP, 8 Pins','https://robu.in/product/amc1200sdubr-texas-instruments-isolation-amplifier-1-amplifier-200-%c2%b5v-4-kv-2-7v-to-5-5v-sop-8-pins/'),(60,NULL,1,'3282914 ',7,'2026-01-31','10 Ohm',NULL,'2026-02-01',NULL,NULL,40,NULL,NULL,15.2,NULL,NULL,NULL,NULL,NULL,NULL,'RC1206FR-0710RL, Yageo, SMD Chip Resistor, 10 ohm, ± 1%, 250 mW, 1206 [3216 Metric], Thick Film, Precision','https://robu.in/product/rc1206fr-0710rl-yageo-smd-chip-resistor-10-ohm-%c2%b1-1-250-mw-1206-3216-metric-thick-film-precision-pack-of-10/'),(61,NULL,1,'3282914 ',8,'2026-01-31','USB to RS232',NULL,'2026-02-01',NULL,NULL,1,NULL,NULL,97,NULL,NULL,NULL,NULL,NULL,NULL,'HL-340 USB serial port (COM) USB to RS232 USB Nine Serial Line Support Windows 7-64','https://robu.in/product/hl-340-usb-serial-port-com-usb-rs232-usb-nine-serial-line-support-windows-7-64/'),(62,NULL,1,'3282914 ',9,'2026-01-31','MMBT2222','Transistor','2026-02-01',NULL,NULL,10,NULL,NULL,14.4,NULL,NULL,NULL,NULL,NULL,NULL,'MMBT2222 NPN Transistor','https://robu.in/product/mmbt2222-npn-transistor-pack-of-15/'),(63,NULL,1,'3282914 ',10,'2026-01-31','ICM7555ID','IC','2026-02-01',NULL,NULL,3,NULL,NULL,51,NULL,NULL,NULL,NULL,NULL,NULL,'ICM7555ID-HLF-Low-power CMOS timer IC','https://robu.in/product/icm7555id-hlf-low-power-cmos-timer-ic/'),(64,NULL,1,'3282914 ',11,'2026-01-31','DC JACK-005',NULL,'2026-02-01',NULL,NULL,5,NULL,NULL,15,NULL,NULL,NULL,NULL,NULL,NULL,'DC JACK-005','https://robu.in/product/dc-jack-005/'),(65,NULL,1,'3282914 ',12,'2026-01-31','SMF33A',NULL,'2026-02-01',NULL,NULL,10,NULL,NULL,23.5,NULL,NULL,NULL,NULL,NULL,NULL,'SMF33A-Slkor-3.8A 53.3V 200W 40.6V 33V SOD-123FL ESD and Surge Protection (TVS/ESD) ROHS','https://robu.in/product/smf33a-slkor-3-8a-53-3v-200w-40-6v-33v-sod-123fl-esd-and-surge-protection-tvs-esd-rohs/'),(66,NULL,1,'3282914 ',13,'2026-01-31','SMBJ33CA',NULL,'2026-02-01',NULL,NULL,10,NULL,NULL,39.2,NULL,NULL,NULL,NULL,NULL,NULL,'SMBJ33CA-Slkor-11.3A 53.3V 36.7V 33V SMB(DO-214AA) ESD and Surge Protection (TVS/ESD) ROHS','https://robu.in/product/smbj33ca-slkor-11-3a-53-3v-36-7v-33v-smbdo-214aa-esd-and-surge-protection-tvs-esd-rohs/'),(67,NULL,1,'3282914 ',14,'2026-01-31','NANOSMDC035F',NULL,'2026-02-01',NULL,NULL,5,NULL,NULL,20,NULL,NULL,NULL,NULL,NULL,NULL,'NANOSMDC035F-2-LITTELFUSE-NANOSMDC035F-2-Resettable Fuse, PPTC, 1206 (3216 Metric), PolySwitch nanoSMDC Series, 16 VDC, 350 mA, 750 mA','https://robu.in/product/nanosmdc035f-2-littelfuse-nanosmdc035f-2-resettable-fuse-pptc-1206-3216-metric-polyswitch-nanosmdc-series-16-vdc-350-ma-750-ma/'),(68,NULL,1,'3282914 ',15,'2026-01-31','Fuse 300mA',NULL,'2026-02-01',NULL,NULL,5,NULL,NULL,35,NULL,NULL,NULL,NULL,NULL,NULL,'0603L030/6XR-LUTE-6V 40A 300mA 650mA 0603 Resettable Fuse ROHS','https://robu.in/product/0603l030-6xr-lute-6v-40a-300ma-650ma-0603-resettable-rohs/'),(69,NULL,1,'3282914 ',16,'2026-01-31','Shipping',NULL,'2026-02-01',NULL,NULL,1,NULL,NULL,99,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(70,NULL,1,'3287233',1,'2026-02-02','STM32G071RBT6',NULL,'2026-02-04',NULL,NULL,1,191,NULL,191,NULL,NULL,NULL,NULL,NULL,NULL,'STM32G071RBT6-STMICROELECTRONICS-ARM MCU, STM32 Family STM32G0 Series Microcontrollers, ARM Cortex-M0+, 32 bit, 64 MHz, 128 KB','https://robu.in/product/stm32g071rbt6-stmicroelectronics-arm-mcu-stm32-family-stm32g0-series-microcontrollers-arm-cortex-m0-32-bit-64-mhz-128-kb/'),(71,NULL,1,'3287233',2,'2026-02-02','470 Ohm',NULL,'2026-02-04',NULL,NULL,70,NULL,NULL,10.5,NULL,NULL,NULL,NULL,NULL,NULL,'470 Ohm 1/8W 805 Resistor','https://robu.in/product/470-ohm-1-8w-805-resistorreel-of-5000/'),(72,NULL,1,'3287233',3,'2026-02-02','BAT54S',NULL,'2026-02-04',NULL,NULL,6,NULL,NULL,48,NULL,NULL,NULL,NULL,NULL,NULL,'BAT54S-QR-Nexperia-30V 200mA 800mV@100mA SC-90 Schottky Diodes ROHS','https://robu.in/product/bat54s-qr-nexperia-30v-200ma-800mv100ma-sc-90-schottky-diodes-rohs/'),(73,NULL,1,'3287233',4,'2026-02-02','W25Q128JVFIQ',NULL,'2026-02-04',NULL,NULL,2,NULL,NULL,276,NULL,NULL,NULL,NULL,NULL,NULL,'W25Q128JVFIQ TR-Winbond Elec-128Mbit SPI 133MHz SOIC-16-300mil NOR FLASH ROHS','https://robu.in/product/w25q128jvfiq-tr-winbond-elec-128mbit-spi-133mhz-soic-16-300mil-nor-flash-rohs/'),(74,NULL,1,'3287233',5,'2026-02-02','LED White',NULL,'2026-02-04',NULL,NULL,20,NULL,NULL,18.4,NULL,NULL,NULL,NULL,NULL,NULL,'1206 Surface Mount LED White','https://robu.in/product/1206-surface-mount-led-white-50-pcs/'),(75,NULL,1,'3287233',6,'2026-02-02','LED Yellow',NULL,'2026-02-04',NULL,NULL,15,NULL,NULL,11.4,NULL,NULL,NULL,NULL,NULL,NULL,'1206 Surface Mount LED Yellow','https://robu.in/product/1206-surface-mount-led-yellow-50pcs/'),(76,NULL,1,'3287233',7,'2026-02-02','Resistor Pack',NULL,'2026-02-04',NULL,NULL,1,NULL,NULL,116,NULL,NULL,NULL,NULL,NULL,NULL,'600 pcs. Metal Film Resistor Assorted kit - 30 Kinds','https://robu.in/product/30-different-valued-metal-film-resistor-assorted-kit-for-diy-electronic-projects-and-experiments/'),(77,NULL,1,'3287233',8,'2026-02-02','Shipping',NULL,'2026-02-04',NULL,NULL,1,NULL,NULL,99,NULL,NULL,NULL,NULL,NULL,NULL,'Shipping',NULL),(78,NULL,3,'148609',1,'2026-02-02','W25Q128JVSSIQ',NULL,'2026-04-30',NULL,NULL,2,NULL,NULL,140,NULL,NULL,NULL,NULL,NULL,NULL,'W25Q128JVSSIQ Serial Flash - 128Mbit - SOIC-8','https://www.ktron.in/product/w25q128jvssiq-serial-flash-128mbit-soic-8/?v=c86ee0d9d7ed'),(79,NULL,3,'148609',2,'2026-02-02','Shipping',NULL,'2026-04-30',NULL,NULL,1,NULL,NULL,70.8,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(82,NULL,1,'3301965',1,'2026-02-10','STWD100','IC',NULL,NULL,NULL,2,75,NULL,150,NULL,NULL,NULL,NULL,NULL,NULL,'STWD100YNXWY3F-Stmicroelectronics-WATCHDOG TIMER CIRCUIT, -40 TO 125DEG C','https://robu.in/product/stwd100ynxwy3f-stmicroelectronics-watchdog-timer-circuit-40-to-125deg-c/'),(83,NULL,1,'3301965',2,'2026-02-10','XY2500RT-2.54-XINYA-3 Pin','Connector','2026-02-12',NULL,NULL,2,13,NULL,26,NULL,NULL,NULL,NULL,NULL,NULL,'XY2500RT-2.54-XINYA-3 Pin Plug-in Terminal Block','https://robu.in/product/xy2500rt-2-54-xinya-3-pin-plug-in-terminal-block/'),(84,NULL,1,'3301965',3,'2026-02-10','XY2500FC-2.54-XINYA-3 Pin Plug-in','Connector','2026-02-12',NULL,NULL,2,31,NULL,62,NULL,NULL,NULL,NULL,NULL,NULL,'XY2500FC-2.54-XINYA-3 Pin Plug-in Terminal Block(Blue)','https://robu.in/product/xy2500fc-2-54-xinya-3-pin-plug-in-terminal-blockblue/'),(85,NULL,1,'3301965',4,'2026-02-10','Shipping','Shipping','2026-02-12',NULL,NULL,NULL,49,NULL,49,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(86,NULL,1,'3314146',1,'2026-02-17','5V/1A Power Supply','Power regulator',NULL,NULL,NULL,2,102,NULL,204,NULL,NULL,NULL,NULL,NULL,NULL,'5V/1A Voltage Stabilized Power Supply Module DC5.5-32V','https://robu.in/product/5v-1a-voltage-stabilized-power-supply-module-dc5-5-32v/'),(87,NULL,1,'3314146',2,'2026-02-17','AP2127K-3.3TRG1','Power regulator',NULL,NULL,NULL,3,10,NULL,30,NULL,NULL,NULL,NULL,NULL,NULL,'AP2127K-3.3TRG1-DIODES INC.-AP2127K-3.3TRG1-LDO Voltage Regulator, Fixed, 2.5 V to 6 V in, 170 mV drop, 3.3 V/400 mA out, SOT-25','https://robu.in/product/ap2127k-3-3trg1-diodes-inc-ap2127k-3-3trg1-ldo-voltage-regulator-fixed-2-5-v-to-6-v-in-170-mv-drop-3-3-v-400-ma-out-sot-25/'),(88,NULL,1,'3314146',3,'2026-02-17','MINISMDC050F-2-LITTELFUS','FUSE',NULL,NULL,NULL,3,10,NULL,30,NULL,NULL,NULL,NULL,NULL,NULL,'MINISMDC050F-2-LITTELFUSE-MINISMDC050F-2-Resettable Fuse, PPTC, 1812 (4532 Metric), PolySwitch miniSMDC Series, 24 VDC, 500 mA, 1 A','https://robu.in/product/minismdc050f-2-littelfuse-minismdc050f-2-resettable-fuse-pptc-1812-4532-metric-polyswitch-minismdc-series-24-vdc-500-ma-1-a/'),(89,NULL,1,'3314146',4,'2026-02-17','Shipping','Shipping',NULL,NULL,NULL,1,49,NULL,49,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(90,NULL,1,'3325877',1,'2026-02-22','MAX3232',NULL,'2026-02-25',NULL,NULL,2,41,NULL,82,NULL,NULL,NULL,NULL,NULL,NULL,'MAX3232EDTR-XBLW-250Kbps Transceiver SOP-16 RS232 ICs ROHS','https://robu.in/product/max3232edtr-xblw-250kbps-transceiver-sop-16-rs232-ics-rohs/'),(91,NULL,1,'3325877',2,'2026-02-22','MAX3485',NULL,'2026-02-25',NULL,NULL,10,14,NULL,140,NULL,NULL,NULL,NULL,NULL,NULL,'MAX3485ESA-HLF-RS485/RS422 Transceiver SOP8 IC','https://robu.in/product/1-month-warranty-829/'),(92,NULL,1,'3325877',3,'2026-02-22','STM32G071RBT6',NULL,'2026-02-25',NULL,NULL,2,191,NULL,382,NULL,NULL,NULL,NULL,NULL,NULL,'STM32G071RBT6-STMICROELECTRONICS-ARM MCU, STM32 Family STM32G0 Series Microcontrollers, ARM Cortex-M0+, 32 bit, 64 MHz, 128 KB','https://robu.in/product/stm32g071rbt6-stmicroelectronics-arm-mcu-stm32-family-stm32g0-series-microcontrollers-arm-cortex-m0-32-bit-64-mhz-128-kb/'),(93,NULL,1,'3325877',4,'2026-02-22','680',NULL,'2026-02-25',NULL,NULL,30,0.59,NULL,17.7,NULL,NULL,NULL,NULL,NULL,NULL,'680 Ohm 1/4W 1206 Surface Mount Chip Resistor','https://robu.in/product/680-ohm-1-4w-1206-surface-mount-chip-resistor-pack-of-100/'),(94,NULL,1,'3325877',5,'2026-02-22','Shipping',NULL,'2026-02-25',NULL,NULL,1,49,NULL,49,NULL,NULL,NULL,NULL,NULL,NULL,'Shipping',NULL),(95,NULL,4,'82197',1,'2026-03-30','W5500',NULL,'2026-04-30',NULL,NULL,3,355,200.52,1065,NULL,NULL,NULL,NULL,NULL,NULL,'W5500 TCP / IP SPI to LAN Ethernet Interface SPI to LAN / Ethernet Converter','https://www.electropi.in/w5500-tcp-ip-spi-to-lan-ethernet-interface-spi-to-lan-ethernet-converter?search=W5500'),(96,NULL,4,'82197',2,'2026-03-30','Shipping',NULL,NULL,NULL,NULL,1,49,NULL,49,NULL,NULL,NULL,NULL,NULL,NULL,'Shipping',NULL),(97,NULL,3,'152205',1,'2026-03-30','SIM A7672S 4G LTE + 2G + GNSS',NULL,'2026-04-30',NULL,NULL,1,1530,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'SIM A7672S 4G LTE + 2G + GNSS Development Board - With GNSS','https://www.ktron.in/product/sim-a7672s-4g-lte-2g-gnss-development-board/?v=c86ee0d9d7ed'),(98,NULL,3,'152205',2,'2026-03-30','Shipping',NULL,'2026-04-30',NULL,NULL,1,70.8,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Shipping',NULL),(99,NULL,1,'3405741',1,'2026-03-30','STM32G071RBT6',NULL,'2026-04-02',NULL,NULL,5,191,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'STM32G071RBT6-STMICROELECTRONICS-ARM MCU, STM32 Family STM32G0 Series Microcontrollers, ARM Cortex-M0+, 32 bit, 64 MHz, 128 KB','https://robu.in/product/stm32g071rbt6-stmicroelectronics-arm-mcu-stm32-family-stm32g0-series-microcontrollers-arm-cortex-m0-32-bit-64-mhz-128-kb/'),(100,NULL,1,'3405741',2,'2026-03-30','Shipping',NULL,'2026-04-02',NULL,NULL,1,49,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Shipping',NULL),(119,NULL,1,'3495272',1,'2026-05-21','STM32G030K8T6',NULL,'2026-05-25',NULL,NULL,3,99,NULL,297,NULL,NULL,NULL,NULL,NULL,NULL,'STM32G030K8T6-STMICROELECTRONICS-STM32G030K8T6-ARM MCU, STM32 Family STM32G0 Series Microcontrollers, ARM Cortex-M0+, 32 bit, 64 MHz, 64 KB','https://robu.in/my-account/view-order/3495272/'),(120,NULL,1,'3495272',2,'2026-05-21','Shipping',NULL,'2026-05-25',NULL,NULL,1,49,NULL,49,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `tbl_purchase` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_stock_movements`
--

DROP TABLE IF EXISTS `tbl_stock_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_stock_movements` (
  `m_id` int NOT NULL AUTO_INCREMENT,
  `m_product_id` int NOT NULL,
  `m_type` enum('opening','consumption','return','writeoff','transfer') NOT NULL,
  `m_direction` enum('in','out') NOT NULL,
  `m_qty` decimal(10,3) NOT NULL,
  `m_purchase_id` int DEFAULT NULL,
  `m_project` varchar(100) DEFAULT NULL,
  `m_notes` varchar(255) DEFAULT NULL,
  `m_user_id` int NOT NULL,
  `m_date` date NOT NULL,
  `m_created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`m_id`),
  KEY `fk_mov_purchase` (`m_purchase_id`),
  KEY `fk_mov_user` (`m_user_id`),
  KEY `idx_mov_product` (`m_product_id`),
  KEY `idx_mov_date` (`m_date`),
  CONSTRAINT `fk_mov_product` FOREIGN KEY (`m_product_id`) REFERENCES `tbl_products` (`m_id`),
  CONSTRAINT `fk_mov_purchase` FOREIGN KEY (`m_purchase_id`) REFERENCES `tbl_purchase` (`m_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_mov_user` FOREIGN KEY (`m_user_id`) REFERENCES `tbl_users` (`m_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_stock_movements`
--

LOCK TABLES `tbl_stock_movements` WRITE;
/*!40000 ALTER TABLE `tbl_stock_movements` DISABLE KEYS */;
INSERT INTO `tbl_stock_movements` VALUES (1,5,'opening','in',1.000,NULL,'','',4,'2026-05-30','2026-05-30 15:09:24'),(2,5,'consumption','out',2.000,NULL,'RDPMS','',4,'2026-05-30','2026-05-30 16:00:06');
/*!40000 ALTER TABLE `tbl_stock_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_suppliers`
--

DROP TABLE IF EXISTS `tbl_suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_suppliers` (
  `m_id` int NOT NULL AUTO_INCREMENT,
  `m_name` varchar(45) DEFAULT NULL,
  `m_web` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`m_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_suppliers`
--

LOCK TABLES `tbl_suppliers` WRITE;
/*!40000 ALTER TABLE `tbl_suppliers` DISABLE KEYS */;
INSERT INTO `tbl_suppliers` VALUES (1,'robu','https://robu.in/'),(2,'evelta','https://evelta.com/'),(3,'ktron','https://www.ktron.in/'),(4,'electropi','https://www.electropi.in/'),(5,'kitsguru','https://kitsguru.com/'),(6,'tanotis','https://www.tanotis.com/'),(7,'globetek','https://globetek.in/'),(8,'bonzicart','https://www.bonzicart.com'),(9,'LionCircuits','https://www.lioncircuits.com/');
/*!40000 ALTER TABLE `tbl_suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_users`
--

DROP TABLE IF EXISTS `tbl_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_users` (
  `m_id` int NOT NULL AUTO_INCREMENT,
  `m_name` varchar(100) NOT NULL,
  `m_email` varchar(150) DEFAULT NULL,
  `m_mobile` varchar(20) DEFAULT NULL,
  `m_role` varchar(50) NOT NULL,
  `m_ledger_id` int DEFAULT NULL,
  `m_avatar` varchar(255) DEFAULT NULL,
  `m_color` varchar(20) DEFAULT NULL,
  `m_is_active` tinyint(1) NOT NULL DEFAULT '1',
  `m_last_login_at` datetime DEFAULT NULL,
  `m_password_hash` varchar(255) NOT NULL,
  PRIMARY KEY (`m_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_users`
--

LOCK TABLES `tbl_users` WRITE;
/*!40000 ALTER TABLE `tbl_users` DISABLE KEYS */;
INSERT INTO `tbl_users` VALUES (4,'Eugene','anita@gmail.com','1','admin',NULL,NULL,NULL,1,'2026-05-30 16:11:26','$2a$11$HG3oHcmr394RlSatpcN4vOnjmS31eJdDZ6k2JLkSDR3E2xhUWGMOi');
/*!40000 ALTER TABLE `tbl_users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-30 17:27:00
