-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS singareport;

-- 连接到新创建的数据库
\c singareport;

-- 创建扩展（如果需要）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 确保数据库编码正确
ALTER DATABASE singareport SET client_encoding = 'UTF8'; 