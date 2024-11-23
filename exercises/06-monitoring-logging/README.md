# Exercise 6: Monitoring and Logging

## Objective
Learn how to implement monitoring and logging solutions in Kubernetes using Prometheus, Grafana, and the ELK stack.

## Prerequisites
- Completed Exercises 1-5
- Docker Desktop running
- kubectl configured
- Helm installed (for deploying monitoring stacks)

## Exercises

### Exercise 6.1: Prometheus and Grafana Setup
**Objective**: Deploy and configure Prometheus and Grafana for cluster monitoring

1. Create Monitoring Namespace:
```yaml
# monitoring-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: monitoring
```

2. Deploy Prometheus using Helm:
```bash
# Add Prometheus repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

3. Create ServiceMonitor for Custom App:
```yaml
# service-monitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: app-monitor
  namespace: monitoring
spec:
  selector:
    matchLabels:
      app: my-app
  endpoints:
  - port: metrics
    interval: 15s
  namespaceSelector:
    matchNames:
    - default
```

### Exercise 6.2: Application Metrics
**Objective**: Implement custom metrics in applications

1. Create Sample App with Metrics:
```yaml
# metrics-app.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: metrics-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: metrics-app
  template:
    metadata:
      labels:
        app: metrics-app
    spec:
      containers:
      - name: metrics-app
        image: prom/prometheus
        ports:
        - containerPort: 9090
          name: metrics
---
apiVersion: v1
kind: Service
metadata:
  name: metrics-app
  labels:
    app: metrics-app
spec:
  ports:
  - port: 9090
    name: metrics
  selector:
    app: metrics-app
```

### Exercise 6.3: ELK Stack Deployment
**Objective**: Set up centralized logging with Elasticsearch, Logstash, and Kibana

1. Deploy Elasticsearch:
```yaml
# elasticsearch.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: elasticsearch
  namespace: logging
spec:
  serviceName: elasticsearch
  replicas: 1
  selector:
    matchLabels:
      app: elasticsearch
  template:
    metadata:
      labels:
        app: elasticsearch
    spec:
      containers:
      - name: elasticsearch
        image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
        env:
        - name: discovery.type
          value: single-node
        ports:
        - containerPort: 9200
          name: http
        - containerPort: 9300
          name: transport
        volumeMounts:
        - name: data
          mountPath: /usr/share/elasticsearch/data
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 10Gi
```

2. Deploy Filebeat DaemonSet:
```yaml
# filebeat.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: filebeat
  namespace: logging
spec:
  selector:
    matchLabels:
      app: filebeat
  template:
    metadata:
      labels:
        app: filebeat
    spec:
      containers:
      - name: filebeat
        image: docker.elastic.co/beats/filebeat:7.15.0
        args: [
          "-c", "/etc/filebeat.yml",
          "-e",
        ]
        volumeMounts:
        - name: config
          mountPath: /etc/filebeat.yml
          subPath: filebeat.yml
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
      volumes:
      - name: config
        configMap:
          name: filebeat-config
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
```

### Exercise 6.4: Alerts and Dashboards
**Objective**: Configure monitoring alerts and create custom dashboards

1. Create PrometheusRule:
```yaml
# alert-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: app-alerts
  namespace: monitoring
spec:
  groups:
  - name: app.rules
    rules:
    - alert: HighErrorRate
      expr: |
        sum(rate(http_requests_total{status=~"5.*"}[5m])) 
        / 
        sum(rate(http_requests_total[5m])) > 0.1
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: High HTTP error rate detected
        description: Error rate is above 10% for the last 5 minutes
```

### Exercise 6.5: Hands-on Prometheus and Grafana
**Objective**: Practical experience with monitoring setup and dashboard creation

1. Deploy a Sample Application with Metrics:
```yaml
# sample-app.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-web-app
  namespace: monitoring
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sample-web-app
  template:
    metadata:
      labels:
        app: sample-web-app
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/metrics"
    spec:
      containers:
      - name: web-app
        image: nginx:latest
        ports:
        - containerPort: 80
        - containerPort: 8080
          name: metrics
        volumeMounts:
        - name: nginx-config
          mountPath: /etc/nginx/conf.d
      - name: prometheus-exporter
        image: nginx/nginx-prometheus-exporter:0.9.0
        args:
          - -nginx.scrape-uri=http://localhost:80/stub_status
        ports:
          - containerPort: 8080
      volumes:
      - name: nginx-config
        configMap:
          name: nginx-config
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-config
  namespace: monitoring
data:
  default.conf: |
    server {
      listen 80;
      location /stub_status {
        stub_status on;
      }
    }
```

2. Create Custom Grafana Dashboard:
```json
{
  "dashboard": {
    "id": null,
    "title": "NGINX Metrics Dashboard",
    "panels": [
      {
        "title": "Active Connections",
        "type": "graph",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "nginx_up",
            "legendFormat": "Status"
          }
        ]
      },
      {
        "title": "Request Rate",
        "type": "graph",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "rate(nginx_http_requests_total[5m])",
            "legendFormat": "Requests/sec"
          }
        ]
      }
    ]
  }
}
```

### Exercise 6.6: Hands-on Logging with ELK
**Objective**: Practical experience with log collection and analysis

1. Deploy a Sample Logging Application:
```yaml
# logging-app.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: logging-app
  namespace: logging
spec:
  replicas: 2
  selector:
    matchLabels:
      app: logging-app
  template:
    metadata:
      labels:
        app: logging-app
    spec:
      containers:
      - name: log-generator
        image: busybox
        command: ["/bin/sh", "-c"]
        args:
        - while true; do
            echo "$(date) - INFO - Sample log message $RANDOM";
            echo "$(date) - ERROR - Error message $RANDOM" >&2;
            sleep 5;
          done
```

2. Configure Filebeat to Parse Logs:
```yaml
# filebeat-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: filebeat-config
  namespace: logging
data:
  filebeat.yml: |
    filebeat.inputs:
    - type: container
      paths:
        - /var/log/containers/*.log
      processors:
        - add_kubernetes_metadata:
            host: ${NODE_NAME}
            matchers:
            - logs_path:
                logs_path: "/var/log/containers/"
    
    output.elasticsearch:
      hosts: ['elasticsearch:9200']
      index: "filebeat-%{[agent.version]}-%{+yyyy.MM.dd}"
    
    setup.kibana:
      host: "kibana:5601"
    
    setup.dashboards.enabled: true
```

### Exercise 6.7: Practical Troubleshooting
**Objective**: Hands-on experience with common troubleshooting scenarios

1. Debug Pod Startup Issues:
```bash
# Commands for Pod troubleshooting
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace> --previous  # For crashed containers
kubectl get events -n <namespace> --sort-by='.lastTimestamp'
```

2. Monitor Resource Usage:
```yaml
# resource-monitor.yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-monitor
  namespace: monitoring
spec:
  containers:
  - name: stress-test
    image: polinux/stress
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
    command: ["/bin/sh"]
    args:
    - -c
    - stress --cpu 2 --io 1 --vm 2 --vm-bytes 64M --timeout 60s
```

3. Network Connectivity Testing:
```yaml
# network-test.yaml
apiVersion: v1
kind: Pod
metadata:
  name: network-test
  namespace: monitoring
spec:
  containers:
  - name: network-test
    image: nicolaka/netshoot
    command: ["/bin/sh"]
    args:
    - -c
    - while true; do ping -c 1 kubernetes.default.svc.cluster.local; sleep 5; done
```

## Verification Tasks

1. **Prometheus Setup**
- Access Prometheus UI
- Query basic metrics
- Check target discovery
- Verify scraping configuration

2. **Grafana Configuration**
- Access Grafana dashboard
- Import basic dashboards
- Create custom panels
- Set up data sources

3. **Logging System**
- Verify log collection
- Search logs in Kibana
- Create log visualizations
- Test log aggregation

## Advanced Concepts

### 1. Custom Metrics API
```yaml
# custom-metrics.yaml
apiVersion: apiregistration.k8s.io/v1
kind: APIService
metadata:
  name: v1beta1.custom.metrics.k8s.io
spec:
  service:
    name: custom-metrics-apiserver
    namespace: monitoring
  group: custom.metrics.k8s.io
  version: v1beta1
  insecureSkipTLSVerify: true
  groupPriorityMinimum: 100
  versionPriority: 100
```

### 2. Log Processing
```yaml
# logstash-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: logstash-config
  namespace: logging
data:
  logstash.yml: |
    http.host: "0.0.0.0"
    path.config: /usr/share/logstash/pipeline
  logstash.conf: |
    input {
      beats {
        port => 5044
      }
    }
    filter {
      grok {
        match => { "message" => "%{COMBINEDAPACHELOG}" }
      }
    }
    output {
      elasticsearch {
        hosts => ["elasticsearch:9200"]
        index => "logstash-%{+YYYY.MM.dd}"
      }
    }
```

## Troubleshooting Guide

1. **Prometheus Issues**
- Check ServiceMonitor configuration
- Verify target discovery
- Review scraping errors
- Check alerting rules

2. **Logging Problems**
- Verify log shipping
- Check Elasticsearch status
- Monitor Logstash pipeline
- Debug Kibana connectivity

3. **Dashboard Issues**
- Check data source configuration
- Verify metric queries
- Test dashboard refresh
- Debug panel visualization

## Additional Challenges

1. Set up distributed tracing with Jaeger
2. Implement custom metrics exporters
3. Create advanced Grafana dashboards
4. Configure log rotation and retention
5. Implement automated alerting

## Best Practices

1. **Monitoring Strategy**
- Use meaningful metrics
- Set appropriate scrape intervals
- Implement alerting thresholds
- Create clear dashboard layouts

2. **Logging Best Practices**
- Structured logging format
- Appropriate log levels
- Log rotation policies
- Index management

3. **Resource Management**
- Monitor resource usage
- Set retention policies
- Configure storage
- Implement backup strategies

## Hands-on Practice Tasks

1. **Monitoring Setup**
- Deploy the sample web application
- Configure Prometheus to scrape metrics
- Import and customize the Grafana dashboard
- Set up alerting rules for error rates

2. **Logging Practice**
- Deploy the log generator application
- Configure Filebeat to collect logs
- Create Kibana visualizations
- Set up log alerts in Elasticsearch

3. **Troubleshooting Exercise**
- Intentionally create resource pressure
- Use monitoring tools to identify issues
- Practice log analysis for problem identification
- Implement fixes and verify solutions
