resource "aws_alb" "main" {
  name = "${var.prefix}-cloud-load-balancer"
  subnets = aws_subnet.public.*.id
  security_groups = [
    aws_security_group.lb.id]
  depends_on = [
    aws_subnet.public]
}

resource "aws_alb_target_group" "main" {
  name = "${var.prefix}-cloud-target-group"
  port = 80
  protocol = "HTTP"
  vpc_id = aws_vpc.main.id
  target_type = "ip"

  health_check {
    healthy_threshold = "3"
    interval = "30"
    protocol = "HTTP"
    matcher = "200"
    timeout = "3"
    path = "/"
    unhealthy_threshold = "2"
  }
}

data "aws_acm_certificate" "main" {
  domain = var.domain_name
  statuses = [
    "ISSUED"]
  most_recent = true
}

resource "aws_alb_listener" "main" {
  load_balancer_arn = aws_alb.main.id
  port = "443"
  protocol = "HTTPS"
  ssl_policy = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn = data.aws_acm_certificate.main.arn

  default_action {
    target_group_arn = aws_alb_target_group.main.id
    type = "forward"
  }

  depends_on = [
    aws_alb.main]
}

resource "aws_lb_listener" "main_http_https" {
  load_balancer_arn = aws_alb.main.id
  port = "80"
  protocol = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port = "443"
      protocol = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

data "aws_route53_zone" "zone_main" {
  name = "${var.domain_name}."
}

resource "aws_route53_record" "main" {
  zone_id = data.aws_route53_zone.zone_main.id
  name = var.domain_name
  type = "A"

  alias {
    name = aws_alb.main.dns_name
    zone_id = aws_alb.main.zone_id
    evaluate_target_health = true
  }
}




