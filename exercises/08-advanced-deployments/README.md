# Exercise 8: Advanced Deployment Strategies

## Objective
Learn how to implement advanced deployment strategies including Blue-Green, Canary, and A/B testing deployments in Kubernetes.

## Prerequisites
- Completed Exercises 1-7
- Docker Desktop running
- kubectl configured
- Ingress controller installed

## Exercises

### Exercise 8.1: Blue-Green Deployment
**Objective**: Implement zero-downtime deployments using Blue-Green strategy

1. Create Blue Deployment:
```yaml
# blue-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-blue
  labels:
    version: blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
      version: blue
  template:
    metadata:
      labels:
        app: my-app
        version: blue
    spec:
      containers:
      - name: nginx
        image: nginx:1.19
        ports:
        - containerPort: 80
```

2. Create Green Deployment:
```yaml
# green-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-green
  labels:
    version: green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
      version: green
  template:
    metadata:
      labels:
        app: my-app
        version: green
    spec:
      containers:
      - name: nginx
        image: nginx:1.20
        ports:
        - containerPort: 80
```

3. Create Service:
```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: app-service
spec:
  selector:
    app: my-app
    version: blue  # Switch to green for cutover
  ports:
  - port: 80
    targetPort: 80
```

### Exercise 8.2: Canary Deployment
**Objective**: Implement gradual rollout using Canary deployments

1. Create Stable Deployment:
```yaml
# stable-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-stable
spec:
  replicas: 9
  selector:
    matchLabels:
      app: my-app
      version: stable
  template:
    metadata:
      labels:
        app: my-app
        version: stable
    spec:
      containers:
      - name: nginx
        image: nginx:1.19
```

2. Create Canary Deployment:
```yaml
# canary-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-canary
spec:
  replicas: 1  # 10% of traffic
  selector:
    matchLabels:
      app: my-app
      version: canary
  template:
    metadata:
      labels:
        app: my-app
        version: canary
    spec:
      containers:
      - name: nginx
        image: nginx:1.20
```

3. Create Ingress for Traffic Split:
```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "10"
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app-service
            port:
              number: 80
```

### Exercise 8.3: A/B Testing
**Objective**: Implement A/B testing for feature testing

1. Create A and B Deployments:
```yaml
# ab-deployments.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-a
spec:
  replicas: 2
  selector:
    matchLabels:
      app: my-app
      version: a
  template:
    metadata:
      labels:
        app: my-app
        version: a
    spec:
      containers:
      - name: app
        image: my-app:feature-a
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-b
spec:
  replicas: 2
  selector:
    matchLabels:
      app: my-app
      version: b
  template:
    metadata:
      labels:
        app: my-app
        version: b
    spec:
      containers:
      - name: app
        image: my-app:feature-b
```

2. Create Services with Cookie-Based Routing:
```yaml
# ab-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ab-ingress
  annotations:
    nginx.ingress.kubernetes.io/affinity: "cookie"
    nginx.ingress.kubernetes.io/session-cookie-name: "route"
    nginx.ingress.kubernetes.io/configuration-snippet: |
      if ($cookie_experiment = "A") {
        set $proxy_upstream_name "app-a";
      }
      if ($cookie_experiment = "B") {
        set $proxy_upstream_name "app-b";
      }
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app-service
            port:
              number: 80
```

### Exercise 8.4: Progressive Delivery with Flagger
**Objective**: Implement automated canary releases

1. Install Flagger:
```yaml
# flagger-deployment.yaml
apiVersion: helm.fluxcd.io/v1
kind: HelmRelease
metadata:
  name: flagger
  namespace: istio-system
spec:
  releaseName: flagger
  chart:
    repository: https://flagger.app
    name: flagger
    version: 1.x.x
  values:
    metricsServer: http://prometheus:9090
    slack:
      url: https://hooks.slack.com/services/YOUR-WEBHOOK-URL
      channel: general
      user: flagger
```

2. Create Canary Custom Resource:
```yaml
# canary-release.yaml
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: app-canary
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app
  service:
    port: 80
  analysis:
    interval: 1m
    threshold: 10
    maxWeight: 50
    stepWeight: 5
    metrics:
    - name: request-success-rate
      threshold: 99
      interval: 1m
    - name: request-duration
      threshold: 500
      interval: 1m
```

## Verification Tasks

1. **Blue-Green Deployment**
- Test blue environment
- Verify green deployment
- Practice quick rollback
- Monitor service switching

2. **Canary Testing**
- Monitor traffic split
- Test gradual rollout
- Verify metrics collection
- Practice rollback procedures

3. **A/B Testing**
- Verify cookie-based routing
- Monitor user segments
- Collect test metrics
- Analyze feature impact

## Advanced Concepts

### 1. Traffic Mirroring
```yaml
# mirror-virtualservice.yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: app-mirror
spec:
  hosts:
  - myapp.example.com
  http:
  - route:
    - destination:
        host: app-stable
      weight: 100
    mirror:
      host: app-canary
    mirror_percent: 10
```

### 2. Custom Metrics for Progressive Delivery
```yaml
# custom-metric-template.yaml
apiVersion: flagger.app/v1beta1
kind: MetricTemplate
metadata:
  name: custom-metric
spec:
  provider:
    type: prometheus
    address: http://prometheus.monitoring:9090
  query: |
    sum(rate(http_requests_total{
      kubernetes_namespace="{{ namespace }}",
      kubernetes_pod_name=~"{{ target }}-[0-9a-zA-Z]+(-[0-9a-zA-Z]+)"
    }[1m])) / sum(rate(http_requests_total{
      kubernetes_namespace="{{ namespace }}"
    }[1m])) * 100
```

## Troubleshooting Guide

1. **Deployment Issues**
- Check deployment status
- Verify service selectors
- Monitor pod health
- Review ingress configuration

2. **Traffic Routing Problems**
- Verify ingress rules
- Check service configuration
- Monitor traffic distribution
- Debug routing issues

3. **Metric Collection**
- Verify metric endpoints
- Check prometheus scraping
- Debug metric queries
- Monitor alert conditions

## Additional Challenges

1. Implement feature flags
2. Create custom metrics for canary analysis
3. Set up automated rollbacks
4. Implement traffic mirroring
5. Create custom deployment strategies

## Best Practices

1. **Deployment Strategy**
- Use meaningful health checks
- Implement proper monitoring
- Plan rollback procedures
- Test in staging first

2. **Traffic Management**
- Monitor error rates
- Implement circuit breakers
- Use proper timeouts
- Configure retries

3. **Testing and Validation**
- Automated testing
- Performance monitoring
- User experience tracking
- Business metrics collection
