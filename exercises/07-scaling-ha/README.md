# Exercise 7: Scaling and High Availability

## Objective
Learn how to implement scaling strategies and ensure high availability in Kubernetes deployments.

## Prerequisites
- Completed Exercises 1-6
- Docker Desktop running
- kubectl configured
- Metrics Server installed

## Exercises

### Exercise 7.1: Horizontal Pod Autoscaling
**Objective**: Implement automatic scaling based on resource utilization

1. Deploy Metrics Server (if not installed):
```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

2. Create Sample Application with HPA:
```yaml
# sample-app.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: php-apache
spec:
  selector:
    matchLabels:
      run: php-apache
  template:
    metadata:
      labels:
        run: php-apache
    spec:
      containers:
      - name: php-apache
        image: k8s.gcr.io/hpa-example
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: 500m
          requests:
            cpu: 200m
---
apiVersion: v1
kind: Service
metadata:
  name: php-apache
spec:
  ports:
  - port: 80
  selector:
    run: php-apache
```

3. Create HPA:
```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: php-apache
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: php-apache
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
```

### Exercise 7.2: Vertical Pod Autoscaling
**Objective**: Implement automatic resource adjustment

1. Deploy VPA:
```yaml
# vpa.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: app-vpa
spec:
  targetRef:
    apiVersion: "apps/v1"
    kind: Deployment
    name: sample-app
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: '*'
      minAllowed:
        cpu: 100m
        memory: 50Mi
      maxAllowed:
        cpu: 1
        memory: 500Mi
      controlledResources: ["cpu", "memory"]
```

### Exercise 7.3: Pod Disruption Budgets
**Objective**: Ensure application availability during voluntary disruptions

1. Create PDB:
```yaml
# pdb.yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: app-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: critical-app
```

2. Create High-Availability Deployment:
```yaml
# ha-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: critical-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: critical-app
  template:
    metadata:
      labels:
        app: critical-app
    spec:
      topologySpreadConstraints:
      - maxSkew: 1
        topologyKey: kubernetes.io/hostname
        whenUnsatisfiable: DoNotSchedule
        labelSelector:
          matchLabels:
            app: critical-app
      containers:
      - name: app
        image: nginx
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
```

### Exercise 7.4: Node Affinity and Anti-Affinity
**Objective**: Control pod placement for high availability

1. Label Nodes:
```bash
kubectl label nodes <node-name> zone=zone1
```

2. Create Deployment with Node Affinity:
```yaml
# node-affinity.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ha-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ha-app
  template:
    metadata:
      labels:
        app: ha-app
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: zone
                operator: In
                values:
                - zone1
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - ha-app
            topologyKey: "kubernetes.io/hostname"
      containers:
      - name: app
        image: nginx
```

## Verification Tasks

1. **HPA Testing**
- Generate load on application
- Monitor scaling events
- Verify pod distribution
- Test scale down behavior

2. **VPA Verification**
- Monitor resource recommendations
- Check resource adjustments
- Test different workloads
- Verify container limits

3. **High Availability**
- Test node failures
- Verify pod distribution
- Check PDB effectiveness
- Monitor failover behavior

## Advanced Concepts

### 1. Custom Metrics Scaling
```yaml
# custom-metrics-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: custom-metrics-app
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: custom-app
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Pods
    pods:
      metric:
        name: packets-per-second
      target:
        type: AverageValue
        averageValue: 1k
```

### 2. Cluster Autoscaling
```yaml
# cluster-autoscaler.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cluster-autoscaler
  template:
    metadata:
      labels:
        app: cluster-autoscaler
    spec:
      containers:
      - name: cluster-autoscaler
        image: k8s.gcr.io/autoscaling/cluster-autoscaler:v1.21.0
        command:
        - ./cluster-autoscaler
        - --cloud-provider=aws
        - --nodes=2:10:eks-nodegroup
```

## Troubleshooting Guide

1. **Scaling Issues**
- Check metrics availability
- Verify resource requests
- Monitor scaling events
- Debug HPA configuration

2. **High Availability Problems**
- Check node status
- Verify pod distribution
- Monitor system events
- Test failover scenarios

3. **Resource Management**
- Monitor resource usage
- Check quota limits
- Verify scheduling decisions
- Debug resource constraints

## Additional Challenges

1. Implement custom metrics scaling
2. Set up cluster autoscaling
3. Create advanced pod topology spread
4. Implement cross-zone HA
5. Design disaster recovery plans

## Best Practices

1. **Scaling Strategy**
- Set appropriate thresholds
- Use resource requests/limits
- Implement gradual scaling
- Monitor scaling behavior

2. **High Availability**
- Use pod anti-affinity
- Implement PDBs
- Distribute across zones
- Regular failover testing

3. **Resource Management**
- Monitor resource usage
- Set appropriate quotas
- Use resource limits
- Implement cost optimization
