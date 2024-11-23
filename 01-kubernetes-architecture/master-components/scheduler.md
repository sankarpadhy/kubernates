# Kubernetes Scheduler

## Overview
The Kubernetes Scheduler is responsible for assigning newly created pods to nodes in the cluster based on resource requirements, hardware/software/policy constraints, affinity/anti-affinity specifications, and other factors.

## Key Functions

1. **Pod Scheduling**
   - Node selection
   - Resource availability checking
   - Constraint validation

2. **Scheduling Policies**
   - Priority
   - Preemption
   - Node affinity/anti-affinity
   - Pod affinity/anti-affinity

3. **Resource Management**
   - CPU and memory allocation
   - Storage requirements
   - Network resources

## Practical Example

```yaml
# Example Scheduler Configuration
apiVersion: v1
kind: Pod
metadata:
  name: kube-scheduler
  namespace: kube-system
spec:
  containers:
  - name: kube-scheduler
    image: k8s.gcr.io/kube-scheduler:v1.23.0
    command:
    - kube-scheduler
    - --authentication-kubeconfig=/etc/kubernetes/scheduler.conf
    - --authorization-kubeconfig=/etc/kubernetes/scheduler.conf
    - --bind-address=127.0.0.1
    - --kubeconfig=/etc/kubernetes/scheduler.conf
    - --leader-elect=true
    livenessProbe:
      httpGet:
        path: /healthz
        port: 10259
```

## Scheduling Examples

### Pod with Node Affinity
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-with-node-affinity
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/e2e-az-name
            operator: In
            values:
            - e2e-az1
            - e2e-az2
  containers:
  - name: nginx
    image: nginx:latest
```

### Pod with Resource Requirements
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-pod
spec:
  containers:
  - name: app
    image: nginx
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
```

## Common Operations

1. **Check Scheduler Status**
```bash
kubectl get componentstatuses | grep scheduler
```

2. **View Scheduler Logs**
```bash
kubectl logs -n kube-system kube-scheduler-<node-name>
```

3. **Check Pod Scheduling Status**
```bash
kubectl describe pod <pod-name>
```

## Best Practices
1. Configure appropriate resource requests and limits
2. Use node affinity rules effectively
3. Implement proper pod priority classes
4. Monitor scheduler performance
5. Use taints and tolerations when needed

## Troubleshooting
1. **Common Issues**
   - Pod in Pending state
   - Resource constraints
   - Node affinity rules not met
   - Taint/toleration conflicts

2. **Debugging Commands**
```bash
# Get scheduler events
kubectl get events --sort-by=.metadata.creationTimestamp

# Check node capacity and allocatable resources
kubectl describe node <node-name>
```
