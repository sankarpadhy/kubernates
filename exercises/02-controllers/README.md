# Exercise 2: Kubernetes Controllers

## Objective
Learn how to use different Kubernetes controllers to manage pod replicas, updates, and stateful applications.

## Prerequisites
- Completed Exercise 1: Pod Basics
- Docker Desktop running
- kubectl configured

## Exercises

### Exercise 2.1: ReplicaSets
**Objective**: Understand how ReplicaSets maintain desired number of pod replicas

1. Create a ReplicaSet manifest:
```yaml
# replicaset.yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx-replicaset
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
```

2. Apply and verify:
```bash
kubectl apply -f replicaset.yaml
kubectl get rs
kubectl get pods -l app=nginx
```

3. Test self-healing:
```bash
# Delete a pod and watch ReplicaSet recreate it
kubectl delete pod <pod-name>
kubectl get pods -w
```

### Exercise 2.2: Deployments
**Objective**: Learn how to manage application deployments and updates

1. Create a Deployment:
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.19
        ports:
        - containerPort: 80
```

2. Apply and perform rolling update:
```bash
kubectl apply -f deployment.yaml
kubectl set image deployment/nginx-deployment nginx=nginx:1.20
kubectl rollout status deployment/nginx-deployment
```

3. Rollback:
```bash
kubectl rollout history deployment/nginx-deployment
kubectl rollout undo deployment/nginx-deployment
```

### Exercise 2.3: DaemonSets
**Objective**: Learn how to run pods on every node

1. Create a DaemonSet:
```yaml
# daemonset.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: monitoring-agent
spec:
  selector:
    matchLabels:
      app: monitoring-agent
  template:
    metadata:
      labels:
        app: monitoring-agent
    spec:
      containers:
      - name: agent
        image: busybox
        command: ["/bin/sh", "-c", "while true; do echo 'Monitoring node...'; sleep 30; done"]
```

2. Apply and verify:
```bash
kubectl apply -f daemonset.yaml
kubectl get ds
kubectl get pods -l app=monitoring-agent -o wide
```

### Exercise 2.4: StatefulSets
**Objective**: Understand stateful application deployment

1. Create a StatefulSet:
```yaml
# statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
spec:
  serviceName: "nginx"
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
        volumeMounts:
        - name: www
          mountPath: /usr/share/nginx/html
  volumeClaimTemplates:
  - metadata:
      name: www
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 1Gi
```

2. Create headless service:
```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx
spec:
  ports:
  - port: 80
  clusterIP: None
  selector:
    app: nginx
```

## Verification Tasks

1. **ReplicaSet Management**
- Scale ReplicaSet to 5 replicas
- Delete some pods and verify recreation
- Update pod template and observe behavior

2. **Deployment Updates**
- Perform rolling update
- Monitor update progress
- Perform rollback
- Scale deployment up and down

3. **DaemonSet Operations**
- Verify pods on all nodes
- Update DaemonSet
- Add node selector

4. **StatefulSet Handling**
- Scale StatefulSet
- Verify persistent storage
- Test pod identity preservation
- Perform ordered updates

## Troubleshooting Guide

1. **Controller Issues**
- Check controller events: `kubectl describe <controller-type> <name>`
- Verify selector matches
- Check pod template
- Monitor rollout status

2. **Update Problems**
- Check rollout history
- Verify image versions
- Check resource constraints
- Monitor pod events

3. **Storage Issues**
- Verify PVC binding
- Check storage class
- Monitor volume provisioning
- Check mount points

## Additional Challenges

1. Create a blue-green deployment strategy
2. Implement canary deployments
3. Create a StatefulSet with multiple persistent volumes
4. Implement pod disruption budgets
5. Create custom update strategies
