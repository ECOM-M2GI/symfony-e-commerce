terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.12.0"
    }
  }

  backend "s3" {
    bucket         = "ebey-tf"
    key            = "global/infa.tfstate"
    region         = "eu-north-1"
    dynamodb_table = "tf-locks"
    encrypt        = true
  }
}
