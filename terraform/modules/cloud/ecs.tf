resource "aws_ecs_cluster" "main" {
  name = "${var.prefix}-cloud-cluster"
}

data "template_file" "main" {
  template = file("${path.module}/templates/ecs/cloud.json.tpl")

  vars = {
    prefix = var.prefix
    image_name = var.image_name
    container_port = var.container_port
    fargate_cpu = var.fargate_cpu
    fargate_memory = var.fargate_memory
    aws_region = data.aws_region.current.name
  }
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
}

resource "aws_ecs_service" "main" {
  name = "${var.prefix}-cloud-service"
  cluster = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count = 1
  launch_type = "FARGATE"

  network_configuration {
    security_groups = [
      aws_security_group.ecs_tasks.id]
    subnets = aws_subnet.private.*.id
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.main.id
    container_name = "${var.prefix}-cloud"
    container_port = var.container_port
  }

  depends_on = [
    aws_alb_listener.main,
    aws_iam_role_policy_attachment.ecs_task_execution_role,
    aws_iam_role.ecs_task_execution_role]
}

