-- Neop Website Starter - MySQL init
ALTER DATABASE neop_strapi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON neop_strapi.* TO 'strapi'@'%';
FLUSH PRIVILEGES;
