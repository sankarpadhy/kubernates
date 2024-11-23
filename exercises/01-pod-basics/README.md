# Exercise 1: Pod Basics

## Objective
Learn how to create, manage, and troubleshoot Kubernetes pods using Docker containers.

## Prerequisites
- Docker Desktop installed
- Basic understanding of YAML
- Terminal access

## Exercises

### Exercise 1.1: Single Container Pod
**Objective**: Create a basic nginx pod and understand pod lifecycle

1. Create a pod manifest:
```yaml
# pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
spec:
  containers:
  - name: nginx
    image: nginx:latest
    ports:
    - containerPort: 80
```

2. Apply the manifest:
```bash
kubectl apply -f pod.yaml
```

3. Verify pod status:
```bash
kubectl get pods
kubectl describe pod nginx-pod
```

4. Access the pod:
```bash
kubectl port-forward nginx-pod 8080:80
```

5. Clean up:
```bash
kubectl delete pod nginx-pod
```

### Exercise 1.2: Multi-Container Pod
**Objective**: Create a pod with multiple containers and understand container communication

1. Create a multi-container pod manifest:
```yaml
# multi-container-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-app
spec:
  containers:
  - name: nginx
    image: nginx:latest
    ports:
    - containerPort: 80
    volumeMounts:
    - name: shared-data
      mountPath: /usr/share/nginx/html
  
  - name: content-generator
    image: busybox
    command: ["/bin/sh", "-c"]
    args:
    - while true; do
        echo "<h1>Hello from Kubernetes! $(date)</h1>" > /data/index.html;
        sleep 10;
      done
    volumeMounts:
    - name: shared-data
      mountPath: /data
  
  volumes:
  - name: shared-data
    emptyDir: {}
```

2. Apply and verify:
```bash
kubectl apply -f multi-container-pod.yaml
kubectl get pods
kubectl describe pod web-app
```

3. Check container logs:
```bash
kubectl logs web-app -c nginx
kubectl logs web-app -c content-generator
```

### Exercise 1.3: Resource Management
**Objective**: Learn how to manage pod resources

1. Create a pod with resource limits:
```yaml
# resource-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-demo
spec:
  containers:
  - name: nginx
    image: nginx:latest
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
```

2. Monitor resource usage:
```bash
kubectl apply -f resource-pod.yaml
kubectl top pod resource-demo
```

### Exercise 1.4: Pod Lifecycle
**Objective**: Understand pod lifecycle and health checks

1. Create a pod with probes:
```yaml
# lifecycle-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: lifecycle-demo
spec:
  containers:
  - name: nginx
    image: nginx:latest
    livenessProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 3
      periodSeconds: 3
    readinessProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 5
```

2. Observe pod states:
```bash
kubectl apply -f lifecycle-pod.yaml
kubectl describe pod lifecycle-demo
```

## Verification Tasks

1. **Pod Creation**
- Create a pod named "custom-nginx" using nginx:alpine image
- Verify it's running
- Access it using port-forward

2. **Multi-Container Communication**
- Create a pod with nginx and redis containers
- Verify both containers are running
- Check logs of both containers

3. **Resource Management**
- Create a pod that requests 50Mi memory and limits to 100Mi
- Verify resource allocation
- Try to exceed memory limits

4. **Health Checks**
- Add liveness and readiness probes to a pod
- Intentionally make the health check fail
- Observe pod restart behavior

## Troubleshooting Guide

1. **Pod Won't Start**
- Check pod status: `kubectl describe pod <pod-name>`
- Check container logs: `kubectl logs <pod-name>`
- Verify image name and pull policy
- Check resource constraints

2. **Container Crashes**
- Check logs immediately after crash
- Look for OOM kills
- Verify health check configurations
- Check for init container failures

3. **Network Issues**
- Verify service ports
- Check network policies
- Test container connectivity
- Verify DNS resolution

## Additional Challenges

1. Create a pod with three containers sharing the same volume
2. Implement a pod with custom startup and shutdown behavior
3. Create a pod that runs a database with persistent storage
4. Implement pod anti-affinity rules
