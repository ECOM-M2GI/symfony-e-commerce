module "bootstrap" {
  source       = "./bootstrap"
  project_name = var.project_name
}

# Essentials module for persistent infrastructure (CloudWatch logs, etc.)
module "essentials" {
  source       = "./essentials"
  project_name = var.project_name
  environment  = var.environment
}

data "aws_availability_zones" "available" {
  state = "available"
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "${var.project_name}-vpc"
  cidr = "10.0.0.0/16"

  azs              = slice(data.aws_availability_zones.available.names, 0, 3)
  private_subnets  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets   = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  database_subnets = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true

  # Database subnet group for RDS
  create_database_subnet_group       = true
  create_database_subnet_route_table = true
}

module "ecr" {
  source       = "./ecr"
  project_name = var.project_name
}

module "database" {
  source               = "./database"
  environment          = var.environment
  project_name         = var.project_name
  region               = var.region
  db_subnet_group_name = module.vpc.database_subnet_group_name
  private_subnets_ids  = module.vpc.database_subnets
  vpc_id               = module.vpc.vpc_id
}

module "backend" {
  source                 = "./backend"
  environment            = var.environment
  project_name           = var.project_name
  private_subnets        = module.vpc.private_subnets
  public_subnets         = module.vpc.public_subnets
  vpc_id                 = module.vpc.vpc_id
  backend_log_group_name = module.essentials.backend_log_group_name
  region                 = var.region
  db_host                = module.database.address
  db_name                = module.database.name
  db_password_secret_arn = module.database.password_secret_arn
  db_username            = module.database.username
  db_port                = module.database.port
  db_security_group_id   = module.database.security_group_id

  depends_on            = [module.vpc, module.essentials, module.ecr, module.database, module.backend_files]
  media_bucket_name     = module.backend_files.bucket_name
  s3_cloudfront_domain  = module.backend_files.cloudfront_domain_name
  stripe_secret_key     = var.stripe_secret_key
  stripe_webhook_secret = var.stripe_webhook_secret
  frontend_address      = "https://${module.frontend.domain_name}"
}

module "backend_files" {
  source       = "./backend_files"
  project_name = var.project_name

  depends_on = [module.essentials, module.vpc]
}

# Frontend module for S3 and CloudFront
module "frontend" {
  source       = "./frontend"
  project_name = var.project_name
  environment  = var.environment

  depends_on = [module.essentials, module.vpc]
}
