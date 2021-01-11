locals {
  stage_name = "stgn"
  domain_name = "stgn.dstack.cloud"
}

module "cloud" {
  source = "../../../modules/cloud"
  prefix = local.stage_name
  domain_name = local.domain_name
  image_tag = var.image_tag
  smpt_host = var.smpt_host
  smpt_port = var.smpt_port
  smpt_user = var.smpt_user
  smpt_password = var.smpt_password
  smpt_from = var.smpt_from
}