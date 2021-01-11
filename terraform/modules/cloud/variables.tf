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

variable "smtp_host" {
  default = ""
}

variable "smtp_port" {
  default = ""
}

variable "smtp_user" {
  default = ""
}

variable "smtp_password" {
  default = ""
}

variable "smtp_from" {
  default = ""
}

variable "fargate_cpu" {
  default = "1024"
}

variable "fargate_memory" {
  default = "2048"
}

variable "domain_name" {}