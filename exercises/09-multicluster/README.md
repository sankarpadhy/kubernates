# Exercise 9: Multi-cluster Management and Federation

## Objective
Learn how to manage multiple Kubernetes clusters, implement federation, and handle cross-cluster communication.

## Prerequisites
- Completed Exercises 1-8
- Multiple Kubernetes clusters available
- kubectl configured
- kubefed CLI installed

## Exercises

### Exercise 9.1: Cluster Federation Setup
**Objective**: Set up a Kubernetes cluster federation

1. Create Federation Namespace:
```yaml
# federation-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: kube-federation-system
```

2. Install Federation Control Plane:
```bash
kubefed init federation \
  --host-cluster-context=cluster1 \
  --dns-provider=coredns \
  --dns-zone-name="example.com." \
  --api-server-service-type=NodePort
```

3. Join Clusters to Federation:
```yaml
# join-cluster.yaml
apiVersion: core.kubefed.io/v1beta1
kind: KubeFedCluster
metadata:
  name: cluster2
  namespace: kube-federation-system
spec:
  apiEndpoint: https://cluster2.example.com
  caBundle: <base64-encoded-ca>
  secretRef:
    name: cluster2-secret
```

### Exercise 9.2: Multi-cluster Resource Management
**Objective**: Manage resources across multiple clusters

1. Create Federated Deployment:
```yaml
# federated-deployment.yaml
apiVersion: types.kubefed.io/v1beta1
kind: FederatedDeployment
metadata:
  name: nginx
  namespace: test
spec:
  template:
    metadata:
      labels:
        app: nginx
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
          - image: nginx:latest
            name: nginx
  placement:
    clusters:
    - name: cluster1
    - name: cluster2
  overrides:
  - clusterName: cluster1
    clusterOverrides:
    - path: "/spec/replicas"
      value: 5
```

2. Create Federated Service:
```yaml
# federated-service.yaml
apiVersion: types.kubefed.io/v1beta1
kind: FederatedService
metadata:
  name: nginx-service
  namespace: test
spec:
  template:
    metadata:
      labels:
        app: nginx
    spec:
      ports:
      - port: 80
        targetPort: 80
      selector:
        app: nginx
  placement:
    clusters:
    - name: cluster1
    - name: cluster2
```

### Exercise 9.3: Cross-cluster Service Discovery
**Objective**: Implement service discovery across clusters

1. Create ServiceDNSRecord:
```yaml
# service-dns-record.yaml
apiVersion: multiclusterdns.kubefed.io/v1alpha1
kind: ServiceDNSRecord
metadata:
  name: nginx-service
  namespace: test
spec:
  domainRef: example.com
  recordTTL: 300
```

2. Configure DNS Policy:
```yaml
# dns-policy.yaml
apiVersion: multiclusterdns.kubefed.io/v1alpha1
kind: DNSEndpoint
metadata:
  name: nginx-service
  namespace: test
spec:
  endpoints:
  - dnsName: nginx.example.com
    recordTTL: 300
    recordType: A
    targets:
    - 192.168.1.10
    - 192.168.1.11
```

### Exercise 9.4: Multi-cluster Load Balancing
**Objective**: Implement load balancing across clusters

1. Create Global Load Balancer:
```yaml
# global-lb.yaml
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: global-gateway
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "*"
---
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: global-route
spec:
  hosts:
  - "*"
  gateways:
  - global-gateway
  http:
  - route:
    - destination:
        host: nginx-service.test.svc.cluster.local
      weight: 50
    - destination:
        host: nginx-service.test.svc.cluster2.local
      weight: 50
```

## Verification Tasks

1. **Federation Setup**
- Verify control plane
- Check cluster joining
- Test cross-cluster communication
- Monitor resource distribution

2. **Resource Management**
- Deploy federated resources
- Verify resource placement
- Test override policies
- Monitor resource status

3. **Service Discovery**
- Test DNS resolution
- Verify service endpoints
- Check cross-cluster access
- Monitor service health

## Advanced Concepts

### 1. Multi-cluster Service Mesh
```yaml
# istio-multicluster.yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  name: istio-control-plane
spec:
  profile: default
  values:
    global:
      multiCluster:
        enabled: true
      network: network1
```

### 2. Cross-cluster Secret Management
```yaml
# secret-propagation.yaml
apiVersion: types.kubefed.io/v1beta1
kind: FederatedSecret
metadata:
  name: shared-secret
  namespace: test
spec:
  template:
    data:
      key: <base64-encoded-value>
  placement:
    clusters:
    - name: cluster1
    - name: cluster2
```

## Troubleshooting Guide

1. **Federation Issues**
- Check control plane logs
- Verify cluster status
- Monitor API endpoints
- Debug resource propagation

2. **Service Discovery Problems**
- Check DNS configuration
- Verify endpoint health
- Monitor service status
- Debug routing issues

3. **Load Balancing Issues**
- Verify gateway configuration
- Check traffic distribution
- Monitor backend health
- Debug routing policies

## Additional Challenges

1. Implement disaster recovery
2. Set up cross-cluster monitoring
3. Create custom federation controllers
4. Implement global service mesh
5. Design multi-region deployment

## Best Practices

1. **Cluster Management**
- Use consistent configurations
- Implement proper monitoring
- Regular health checks
- Automated failover

2. **Resource Distribution**
- Define clear placement policies
- Use appropriate overrides
- Monitor resource usage
- Implement cost controls

3. **Network Configuration**
- Secure cross-cluster communication
- Implement proper routing
- Monitor network latency
- Use appropriate load balancing

## Security Considerations

1. **Cross-cluster Authentication**
- Use mutual TLS
- Implement proper RBAC
- Secure secret propagation
- Monitor access patterns

2. **Network Security**
- Implement network policies
- Use secure gateways
- Monitor traffic patterns
- Regular security audits

3. **Compliance**
- Data locality rules
- Security standards
- Audit requirements
- Regulatory compliance
