# Exercise 3: Services and Networking

## Objective
Learn how to expose applications using different service types and understand Kubernetes networking concepts.

## Prerequisites
- Completed Exercise 1 and 2
- Docker Desktop running
- kubectl configured

## Exercises

### Exercise 3.1: ClusterIP Services
**Objective**: Understand internal service discovery and load balancing

1. Create a deployment and ClusterIP service:
```yaml
# clusterip-demo.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
```

2. Test service discovery:
```bash
kubectl apply -f clusterip-demo.yaml
kubectl run test-pod --image=busybox -it --rm -- wget -qO- http://web-service
```

### Exercise 3.2: NodePort Services
**Objective**: Learn how to expose services externally through node ports

1. Create NodePort service:
```yaml
# nodeport-demo.yaml
apiVersion: v1
kind: Service
metadata:
  name: web-nodeport
spec:
  type: NodePort
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30080
```

2. Access service:
```bash
kubectl apply -f nodeport-demo.yaml
curl http://localhost:30080
```

### Exercise 3.3: LoadBalancer Services
**Objective**: Understand external load balancing

1. Create LoadBalancer service:
```yaml
# loadbalancer-demo.yaml
apiVersion: v1
kind: Service
metadata:
  name: web-lb
spec:
  type: LoadBalancer
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
```

2. Test external access:
```bash
kubectl apply -f loadbalancer-demo.yaml
kubectl get svc web-lb
```

### Exercise 3.4: Network Policies
**Objective**: Implement network security using Network Policies

1. Create a Network Policy:
```yaml
# network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-policy
spec:
  podSelector:
    matchLabels:
      app: web
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: frontend
    ports:
    - protocol: TCP
      port: 80
  egress:
  - to:
    - podSelector:
        matchLabels:
          role: backend
    ports:
    - protocol: TCP
      port: 5432
```

## Verification Tasks

1. **Service Discovery**
- Create multiple pods
- Test internal DNS resolution
- Verify load balancing
- Test service endpoints

2. **External Access**
- Access NodePort service
- Test LoadBalancer service
- Verify port mappings
- Check service status

3. **Network Policies**
- Test allowed connections
- Verify blocked connections
- Test namespace policies
- Monitor policy effects

## Advanced Networking Concepts

### 1. DNS in Kubernetes
```yaml
# dns-example.yaml
apiVersion: v1
kind: Pod
metadata:
  name: dns-test
spec:
  containers:
  - name: dns-test
    image: busybox
    command:
      - sleep
      - "3600"
```

Test DNS:
```bash
kubectl exec -it dns-test -- nslookup web-service
```

### 2. Service Topology
```yaml
# topology-aware-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: topology-service
spec:
  selector:
    app: web
  ports:
  - port: 80
  topologyKeys:
    - "kubernetes.io/hostname"
    - "topology.kubernetes.io/zone"
    - "*"
```

### 3. Ingress Configuration
```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
spec:
  rules:
  - host: web.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
```

## Troubleshooting Guide

1. **Service Issues**
- Check service endpoints
- Verify selector labels
- Test pod connectivity
- Check service ports

2. **Network Policy Problems**
- Verify policy syntax
- Check label selectors
- Test connectivity
- Monitor policy logs

3. **DNS Issues**
- Check CoreDNS pods
- Verify DNS configuration
- Test name resolution
- Check DNS service

## Additional Challenges

1. Create a multi-tier application with different service types
2. Implement cross-namespace communication
3. Set up an Ingress controller with SSL termination
4. Create topology-aware service routing
5. Implement service mesh concepts
