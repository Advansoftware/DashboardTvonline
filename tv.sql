-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: 09-Ago-2018 às 12:21
-- Versão do servidor: 10.1.29-MariaDB
-- PHP Version: 7.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tv`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `canais`
--

CREATE TABLE `canais` (
  `id` int(11) NOT NULL,
  `nome` varchar(200) NOT NULL,
  `logo` varchar(200) NOT NULL,
  `link` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Extraindo dados da tabela `canais`
--

INSERT INTO `canais` (`id`, `nome`, `logo`, `link`) VALUES
(1, 'Yeeah!', 'https://i.imgur.com/rvbIfDo.png', 'http://stmv2.srvstm.com/yeeahteen/yeeahteen/playlist.m3u8'),
(2, 'TV ACRITICA - RECORD AM', 'http://i.imgur.com/5UeQAk9.png', 'https://slbps-sambatech.akamaized.net/live/3256%2C7930%2C679f501d2054fc8514ea1fc28fe5f167%3Bbase64np%3BS52I5Up2XHDMC-c%21/amlst%3AS51w_Fc9WXHTS2s2/chunklist_b2146304.m3u8');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `canais`
--
ALTER TABLE `canais`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `canais`
--
ALTER TABLE `canais`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
