locals {
  stage_name = "stgn"
  domain_name = "stgn.dstack.cloud"
}

module "cloud" {
  source = "../../../modules/cloud"
  prefix = local.stage_name
  domain_name = local.domain_name
}