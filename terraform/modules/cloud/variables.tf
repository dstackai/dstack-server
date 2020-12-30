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

variable "fargate_cpu" {
  default = "1024"
}

variable "fargate_memory" {
  default = "2048"
}

variable "domain_name" {}