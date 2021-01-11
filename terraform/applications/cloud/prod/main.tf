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
  smtp_host = var.smtp_host
  smtp_port = var.smtp_port
  smtp_user = var.smtp_user
  smtp_password = var.smtp_password
  smtp_from = var.smtp_from
}