<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251117220915 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE `order` (id INT AUTO_INCREMENT NOT NULL, user_id_id INT NOT NULL, total NUMERIC(10, 2) DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, status VARCHAR(255) DEFAULT NULL, INDEX IDX_F52993989D86650F (user_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE order_item (id INT AUTO_INCREMENT NOT NULL, order_id_id INT NOT NULL, product_id_id INT NOT NULL, product_name VARCHAR(200) NOT NULL, unit_price NUMERIC(10, 2) NOT NULL, line_total NUMERIC(10, 2) NOT NULL, quantity INT DEFAULT NULL, seller_id INT DEFAULT NULL, seller_username VARCHAR(150) DEFAULT NULL, product_shipping_fee NUMERIC(10, 2) DEFAULT NULL, product_category VARCHAR(20) DEFAULT NULL, INDEX IDX_52EA1F09FCDAEAAA (order_id_id), INDEX IDX_52EA1F09DE18E50B (product_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE `order` ADD CONSTRAINT FK_F52993989D86650F FOREIGN KEY (user_id_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE order_item ADD CONSTRAINT FK_52EA1F09FCDAEAAA FOREIGN KEY (order_id_id) REFERENCES `order` (id)');
        $this->addSql('ALTER TABLE order_item ADD CONSTRAINT FK_52EA1F09DE18E50B FOREIGN KEY (product_id_id) REFERENCES product (id)');
        $this->addSql('ALTER TABLE product CHANGE name name VARCHAR(200) DEFAULT NULL, CHANGE price price NUMERIC(10, 2) DEFAULT NULL, CHANGE shipping_fee shipping_fee NUMERIC(10, 2) DEFAULT NULL, CHANGE image_url image_url VARCHAR(255) DEFAULT NULL, CHANGE delivery_mode delivery_mode VARCHAR(255) DEFAULT NULL, CHANGE category category VARCHAR(255) DEFAULT NULL, CHANGE product_condition product_condition VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE user CHANGE roles roles JSON NOT NULL, CHANGE first_name first_name VARCHAR(20) DEFAULT NULL, CHANGE last_name last_name VARCHAR(20) DEFAULT NULL, CHANGE email email VARCHAR(255) DEFAULT NULL, CHANGE updated_at updated_at DATETIME DEFAULT NULL, CHANGE phone_number phone_number VARCHAR(10) DEFAULT NULL, CHANGE date_of_birth date_of_birth DATE DEFAULT NULL, CHANGE adress adress VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE `order` DROP FOREIGN KEY FK_F52993989D86650F');
        $this->addSql('ALTER TABLE order_item DROP FOREIGN KEY FK_52EA1F09FCDAEAAA');
        $this->addSql('ALTER TABLE order_item DROP FOREIGN KEY FK_52EA1F09DE18E50B');
        $this->addSql('DROP TABLE `order`');
        $this->addSql('DROP TABLE order_item');
        $this->addSql('ALTER TABLE user CHANGE roles roles LONGTEXT NOT NULL COLLATE `utf8mb4_bin`, CHANGE first_name first_name VARCHAR(20) DEFAULT \'NULL\', CHANGE last_name last_name VARCHAR(20) DEFAULT \'NULL\', CHANGE email email VARCHAR(255) DEFAULT \'NULL\', CHANGE updated_at updated_at DATETIME DEFAULT \'NULL\', CHANGE phone_number phone_number VARCHAR(10) DEFAULT \'NULL\', CHANGE date_of_birth date_of_birth DATE DEFAULT \'NULL\', CHANGE adress adress VARCHAR(255) DEFAULT \'NULL\'');
        $this->addSql('ALTER TABLE product CHANGE name name VARCHAR(200) DEFAULT \'NULL\', CHANGE price price NUMERIC(10, 2) DEFAULT \'NULL\', CHANGE shipping_fee shipping_fee NUMERIC(10, 2) DEFAULT \'NULL\', CHANGE image_url image_url VARCHAR(255) DEFAULT \'NULL\', CHANGE delivery_mode delivery_mode VARCHAR(255) DEFAULT \'NULL\', CHANGE category category VARCHAR(255) DEFAULT \'NULL\', CHANGE product_condition product_condition VARCHAR(255) DEFAULT \'NULL\'');
    }
}
