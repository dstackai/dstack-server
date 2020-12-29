resource "aws_cloudwatch_log_group" "main" {
  name = "/ecs/${var.prefix}-cloud"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_stream" "main" {
  name = "${var.prefix}-cloud-log-stream"
  log_group_name = aws_cloudwatch_log_group.main.name
}

