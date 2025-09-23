# Get VPC information from passed variables instead of data source
data "aws_vpc" "this" {
  id = var.vpc_id
}

# Get subnet information
data "aws_subnets" "private" {
  filter {
    name   = "subnet-id"
    values = var.private_subnets
  }
}

data "aws_subnets" "public" {
  filter {
    name   = "subnet-id"
    values = var.public_subnets
  }
}
