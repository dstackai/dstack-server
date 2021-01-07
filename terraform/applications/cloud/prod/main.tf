locals {
  stage_name = "prod"
  domain_name = "dstack.cloud"
}

module "cloud" {
  source = "../../../modules/cloud"
  prefix = local.stage_name
  domain_name = local.domain_name
  image_tag = var.image_tag
  user = var.user
  password = var.password
}