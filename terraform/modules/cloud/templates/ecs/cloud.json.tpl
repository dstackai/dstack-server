[
  {
    "name": "${prefix}-cloud",
    "environment": [
        {"name": "DSTACK_USER", "value": "${user}"},
        {"name": "DSTACK_PASSWORD", "value": "${password}"},
        {"name": "DSTACK_PORT", "value": "${port}"},
        {"name": "DSTACK_INTERNAL_PORT", "value": "${container_port}"},
        {"name": "DSTACK_SSL", "value": "${ssl}"},
        {"name": "DSTACK_HOST_NAME", "value": "${host_name}"}
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
