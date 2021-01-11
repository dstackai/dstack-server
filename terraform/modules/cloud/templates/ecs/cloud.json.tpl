[
  {
    "name": "${prefix}-cloud",
    "environment": [
        {"name": "DSTACK_USER", "value": "${user}"},
        {"name": "DSTACK_PASSWORD", "value": "${password}"},
        {"name": "DSTACK_PORT", "value": "${port}"},
        {"name": "DSTACK_INTERNAL_PORT", "value": "${container_port}"},
        {"name": "DSTACK_SSL", "value": "${ssl}"},
        {"name": "DSTACK_HOST_NAME", "value": "${host_name}"},
        {"name": "DSTACK_SMTP_HOST", "value": "${smpt_host}"},
        {"name": "DSTACK_SMTP_PORT", "value": "${smpt_port}"},
        {"name": "DSTACK_SMTP_USER", "value": "${smpt_user}"},
        {"name": "DSTACK_SMTP_PASSWORD", "value": "${smpt_password}"},
        {"name": "DSTACK_SMTP_FROM", "value": "${smpt_from}"}
    ],
    "image": "${image}",
    "cpu": ${fargate_cpu},
    "memory": ${fargate_memory},
    "networkMode": "awsvpc",
    "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/${prefix}-cloud",
          "awslogs-region": "${aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
    },
    "portMappings": [
      {
        "containerPort": ${container_port},
        "hostPort": ${container_port}
      }
    ],
    "mountPoints": [
          {
              "containerPath": "/root/.dstack",
              "sourceVolume": "${prefix}-cloud-efs-dstack"
          }
      ]
  }
]
