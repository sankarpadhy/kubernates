# Exercise 5: Kubernetes Security

## Objective
Learn how to implement security best practices in Kubernetes, including RBAC, security contexts, and pod security policies.

## Prerequisites
- Completed Exercises 1-4
- Docker Desktop running
- kubectl configured

## Exercises

### Exercise 5.1: Role-Based Access Control (RBAC)
**Objective**: Understand and implement RBAC for access control

1. Create a ServiceAccount:
```yaml
# service-account.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-service-account
  namespace: default
```

2. Create Role and RoleBinding:
```yaml
# role.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: default
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "watch", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: default
subjects:
- kind: ServiceAccount
  name: app-service-account
  namespace: default
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

### Exercise 5.2: Security Contexts
**Objective**: Learn how to set security contexts for pods and containers

1. Create Pod with Security Context:
```yaml
# secure-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000
  containers:
  - name: secure-container
    image: nginx
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
        add:
        - NET_BIND_SERVICE
```

### Exercise 5.3: Network Policies
**Objective**: Implement network security using Network Policies

1. Create Default Deny Policy:
```yaml
# default-deny.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

2. Create Allowed Traffic Policy:
```yaml
# allow-traffic.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-backend
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080
```

### Exercise 5.4: Pod Security Standards
**Objective**: Implement Pod Security Standards

1. Create Namespace with Security Standards:
```yaml
# secure-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: secure-ns
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

2. Create Compliant Pod:
```yaml
# compliant-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: compliant-pod
  namespace: secure-ns
spec:
  securityContext:
    runAsNonRoot: true
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: nginx
    securityContext:
      allowPrivilegeEscalation: false
      capabilities:
        drop:
        - ALL
```

## Verification Tasks

1. **RBAC Testing**
- Verify ServiceAccount permissions
- Test role bindings
- Check access to resources
- Validate authorization

2. **Security Context Verification**
- Test user/group permissions
- Verify filesystem restrictions
- Check capability restrictions
- Test privilege escalation prevention

3. **Network Policy Testing**
- Verify default deny policy
- Test allowed connections
- Verify blocked connections
- Monitor policy effects

## Advanced Concepts

### 1. Certificate Management
```yaml
# certificate.yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: app-tls
spec:
  secretName: app-tls-secret
  duration: 2160h
  renewBefore: 360h
  subject:
    organizations:
    - Example Corp
  commonName: example.com
  isCA: false
  privateKey:
    algorithm: RSA
    encoding: PKCS1
    size: 2048
  usages:
    - server auth
    - client auth
  dnsNames:
  - example.com
  - www.example.com
```

### 2. External Authentication
```yaml
# oauth2-proxy.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: oauth2-proxy
spec:
  replicas: 1
  selector:
    matchLabels:
      app: oauth2-proxy
  template:
    metadata:
      labels:
        app: oauth2-proxy
    spec:
      containers:
      - name: oauth2-proxy
        image: quay.io/oauth2-proxy/oauth2-proxy
        args:
        - --provider=github
        - --email-domain=*
        - --upstream=file:///dev/null
        - --http-address=0.0.0.0:4180
        env:
        - name: OAUTH2_PROXY_CLIENT_ID
          valueFrom:
            secretKeyRef:
              name: oauth2-proxy-secrets
              key: client-id
        - name: OAUTH2_PROXY_CLIENT_SECRET
          valueFrom:
            secretKeyRef:
              name: oauth2-proxy-secrets
              key: client-secret
```

## Troubleshooting Guide

1. **RBAC Issues**
- Check role definitions
- Verify binding subjects
- Test authentication
- Monitor audit logs

2. **Security Context Problems**
- Verify user/group IDs
- Check filesystem permissions
- Test container capabilities
- Monitor security events

3. **Network Security Issues**
- Check policy syntax
- Verify label selectors
- Test network connectivity
- Monitor policy logs

## Additional Challenges

1. Implement mutual TLS authentication
2. Set up OAuth2 authentication
3. Create custom admission controllers
4. Implement security scanning
5. Set up audit logging

## Best Practices

1. **Principle of Least Privilege**
- Use minimal RBAC permissions
- Restrict container capabilities
- Implement network policies
- Use read-only root filesystem

2. **Container Security**
- Use minimal base images
- Scan for vulnerabilities
- Sign container images
- Use image pull policies

3. **Network Security**
- Implement network segmentation
- Use TLS everywhere
- Control egress traffic
- Monitor network activity
