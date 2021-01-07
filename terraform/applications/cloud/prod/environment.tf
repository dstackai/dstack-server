terraform {
  backend "s3" {
    bucket = "dstack-cloud-prod"
    key = "cloud.tfstate"
    profile = "dstack"
    region = "eu-west-1"
  }
}

provider "aws" {
  region = "eu-west-1"
  profile = "dstack"
  version = "~> 2.0"
}