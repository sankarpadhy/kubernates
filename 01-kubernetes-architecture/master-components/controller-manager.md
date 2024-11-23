# Kubernetes Controller Manager

## Overview
The Controller Manager is responsible for running controllers that regulate the state of the cluster. It ensures that the cluster's actual state matches the desired state.

## Key Controllers

1. **Node Controller**
   - Monitors node health
   - Manages node lifecycle
   - Handles node failures

2. **Replication Controller**
   - Maintains correct number of pods
   - Handles pod scaling
   - Ensures pod availability

3. **Endpoints Controller**
   - Populates the Endpoints object
   - Links Services and Pods
   - Updates service endpoints

4. **Service Account & Token Controllers**
   - Manages service accounts
   - Creates API tokens
   - Handles authentication tokens

## Practical Example

```yaml
# Example Controller Manager Configuration
apiVersion: v1
kind: Pod
metadata:
  name: kube-controller-manager
  namespace: kube-system
spec:
  containers:
  - name: kube-controller-manager
    image: k8s.gcr.io/kube-controller-manager:v1.23.0
    command:
    - kube-controller-manager
    - --allocate-node-cidrs=true
    - --authentication-kubeconfig=/etc/kubernetes/controller-manager.conf
    - --authorization-kubeconfig=/etc/kubernetes/controller-manager.conf
    - --bind-address=127.0.0.1
    - --client-ca-file=/etc/kubernetes/pki/ca.crt
    - --cluster-signing-cert-file=/etc/kubernetes/pki/ca.crt
    livenessProbe:
      httpGet:
        path: /healthz
        port: 10257
```

## Docker-based Demonstration
```bash
# Simulate controller behavior
docker run -d --name controller-demo \
  -e CONTROLLER_TYPE=replication \
  -v $(pwd)/config:/etc/kubernetes \
  nginx:latest
```

## Common Operations

1. **Check Controller Manager Status**
```bash
kubectl get componentstatuses
```

2. **View Controller Manager Logs**
```bash
kubectl logs -n kube-system kube-controller-manager-<node-name>
```

## Controller Examples

### ReplicaSet Controller
```yaml
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
```

## Best Practices
1. Configure appropriate leader election settings
2. Set proper resource limits
3. Monitor controller performance
4. Use appropriate logging levels
5. Implement proper security configurations
