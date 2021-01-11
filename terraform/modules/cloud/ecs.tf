resource "aws_ecs_cluster" "main" {
  name = "${var.prefix}-cloud-cluster"
}

data "template_file" "main" {
  template = file("${path.module}/templates/ecs/cloud.json.tpl")

  vars = {
    prefix = var.prefix
    image = "${var.image_name}:${var.image_tag}"
    user = var.user
    password = var.password
    port = "443"
    container_port = "80"
    ssl = "true"
    host_name = var.domain_name
    fargate_cpu = var.fargate_cpu
    fargate_memory = var.fargate_memory
    aws_region = data.aws_region.current.name
    smtp_host = var.smpt_host
    smtp_port = var.smpt_port
    smpt_user = var.smpt_user
    smpt_password = var.smpt_password
    smpt_from = var.smpt_from
  }
}

resource "aws_efs_file_system" "main" {
  creation_token = "${var.prefix}-cloud-efs"

}

resource "aws_efs_mount_target" "mount" {
  count = length(aws_subnet.private.*.id)
  file_system_id = aws_efs_file_system.main.id
  subnet_id = element(aws_subnet.private.*.id, count.index)
  security_groups = [
    aws_security_group.efs.id]
}

resource "aws_ecs_task_definition" "main" {
  family = "${var.prefix}-cloud-task"
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  network_mode = "awsvpc"
  requires_compatibilities = [
    "FARGATE"]
  cpu = var.fargate_cpu
  memory = var.fargate_memory
  container_definitions = data.template_file.main.rendered

  volume {
    name = "${var.prefix}-cloud-efs-dstack"
    efs_volume_configuration {
      file_system_id = aws_efs_file_system.main.id
      root_directory = "/"
    }
  }
}

resource "aws_ecs_service" "main" {
  name = "${var.prefix}-cloud-service"
  cluster = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count = 1
  launch_type = "FARGATE"

  platform_version = "1.4.0"

  network_configuration {
    security_groups = [
      aws_security_group.ecs_tasks.id]
    subnets = aws_subnet.private.*.id
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.main.id
    container_name = "${var.prefix}-cloud"
    container_port = "80"
  }

  depends_on = [
    aws_alb_listener.main,
    aws_iam_role_policy_attachment.ecs_task_execution_role,
    aws_iam_role.ecs_task_execution_role,
    aws_efs_file_system.main,
    aws_efs_mount_target.mount]
}

