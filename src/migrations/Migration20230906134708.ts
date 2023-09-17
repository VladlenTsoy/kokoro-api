import { Migration } from '@mikro-orm/migrations';

export class Migration20230906134708 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `categories` (`id` int unsigned not null auto_increment primary key, `title` varchar(255) not null, `category_id` int null default null, `url` varchar(255) not null, `is_hide` tinyint(1) null default null, `created_at` datetime not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `client_addresses` (`id` int unsigned not null auto_increment primary key, `title` varchar(255) not null, `full_name` varchar(255) not null, `phone` varchar(255) not null, `country` varchar(255) null, `city` varchar(255) null, `address` varchar(255) null, `position` json null, `client_id` int not null, `created_at` datetime not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `clients` (`id` int unsigned not null auto_increment primary key, `phone` varchar(255) null, `full_name` varchar(255) not null, `email` varchar(255) null, `password` varchar(255) null, `source_id` int not null, `created_at` datetime not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `clients` add unique `clients_email_unique`(`email`);');

    this.addSql('create table `colors` (`id` int unsigned not null auto_increment primary key, `title` varchar(255) not null, `hex` varchar(255) not null, `is_hide` tinyint(1) null default null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `product-colors` (`id` int unsigned not null auto_increment primary key, `title` varchar(255) not null, `price` int not null, `product_id` int not null, `color_id` int not null, `status_id` int not null, `is_new` tinyint(1) null default null, `is_hide` tinyint(1) null default null, `created_at` datetime not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `products` (`id` int unsigned not null auto_increment primary key, `category_id` int not null, `created_at` datetime not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `product_properties` (`id` int unsigned not null auto_increment primary key, `title` varchar(255) not null, `description` varchar(255) not null, `is_global` tinyint(1) not null default false, `created_at` datetime not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `product_storages` (`id` int unsigned not null auto_increment primary key, `title` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `tags` (`id` int unsigned not null auto_increment primary key, `title` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');
  }

}
