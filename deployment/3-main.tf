terraform {
  backend "s3" {
    bucket = "besocial-app-terraform-state" # Your unique AWS S3 bucket
    # create a sub-folder called develop
    key     = "develop/besocialapp.tfstate"
    region  = "eu-central-1" # Your AWS region
    encrypt = true
  }
}

locals {
  prefix = "${var.prefix}-${terraform.workspace}"

  common_tags = {
    Environment = terraform.workspace
    Project     = var.project
    ManagedBy   = "Terraform"
    Owner       = "Baziluc Marian" # Your fullname
  }
}