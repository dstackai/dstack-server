variable "prefix" {
}

variable "az_count" {
  default = "2"
}

variable "image_name" {
  default = "dstackai/dstack"
}

variable "image_tag" {
}

variable "user" {
  default = "foo"
}

variable "password" {
  default = "bar"
}

variable "smpt_host" {
  default = ""
}

variable "smpt_port" {
  default = ""
}

variable "smpt_user" {
  default = ""
}

variable "smpt_password" {
  default = ""
}

variable "smpt_from" {
  default = ""
}

variable "fargate_cpu" {
  default = "1024"
}

variable "fargate_memory" {
  default = "2048"
}

variable "domain_name" {}