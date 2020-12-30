resource "aws_security_group" "lb" {
  vpc_id = aws_vpc.main.id

  ingress {
    protocol = "tcp"
    from_port = "443"
    to_port = "443"
    cidr_blocks = [
      "0.0.0.0/0"]
  }

  ingress {
    protocol = "tcp"
    from_port = "80"
    to_port = "80"
    cidr_blocks = [
      "0.0.0.0/0"]
  }

  egress {
    protocol = "-1"
    from_port = 0
    to_port = 0
    cidr_blocks = [
      "0.0.0.0/0"]
  }
}

resource "aws_security_group" "ecs_tasks" {
  name = "${var.prefix}-cloud-ecs-tasks-security-group"
  vpc_id = aws_vpc.main.id

  ingress {
    protocol = "tcp"
    from_port = 80
    to_port = 80
    security_groups = [
      aws_security_group.lb.id]
  }

  egress {
    protocol = "-1"
    from_port = 0
    to_port = 0
    cidr_blocks = [
      "0.0.0.0/0"]
  }
}

resource "aws_security_group" "efs" {
  name = "${var.prefix}-cloud-efs-security-group"
  vpc_id = aws_vpc.main.id

  ingress {
    protocol = "tcp"
    from_port = 2049
    to_port = 2049
    security_groups = [
      aws_security_group.ecs_tasks.id]
  }
  
  egress {
    protocol = "-1"
    from_port = 0
    to_port = 0
    cidr_blocks = [
      "0.0.0.0/0"]
  }
}