[
  {
    "name": "${prefix}-cloud",
    "environment": [
        {"name": "DSTACK_USER", "value": "foo"},
        {"name": "DSTACK_PASSWORD", "value": "bar"},
        {"name": "DSTACK_PORT", "value": "${container_port}"}
    ],
    "image": "${image_name}",
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
    ]
  }
]
