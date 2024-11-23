# etcd in Kubernetes

## Overview
etcd is a distributed key-value store that serves as Kubernetes' primary datastore, holding all cluster data including configuration, state, and metadata.

## Key Features

1. **Distributed Storage**
   - Consistent and highly-available
   - Distributed consensus using Raft protocol
   - Strong consistency guarantees

2. **Data Management**
   - Key-value storage
   - Versioned data model
   - Watch functionality for changes

3. **Security**
   - TLS encryption
   - Client certificate authentication
   - Role-based access control

## Practical Example

```yaml
# Example etcd Configuration
apiVersion: v1
kind: Pod
metadata:
  name: etcd
  namespace: kube-system
spec:
  containers:
  - name: etcd
    image: k8s.gcr.io/etcd:3.5.0
    command:
    - etcd
    - --advertise-client-urls=https://192.168.1.10:2379
    - --cert-file=/etc/kubernetes/pki/etcd/server.crt
    - --client-cert-auth=true
    - --data-dir=/var/lib/etcd
    - --initial-advertise-peer-urls=https://192.168.1.10:2380
    - --initial-cluster=master=https://192.168.1.10:2380
    - --key-file=/etc/kubernetes/pki/etcd/server.key
    - --listen-client-urls=https://127.0.0.1:2379,https://192.168.1.10:2379
    - --listen-peer-urls=https://192.168.1.10:2380
    - --name=master
    - --trusted-ca-file=/etc/kubernetes/pki/etcd/ca.crt
    volumeMounts:
    - mountPath: /var/lib/etcd
      name: etcd-data
    - mountPath: /etc/kubernetes/pki/etcd
      name: etcd-certs
```

## Docker-based Demonstration
```bash
# Run etcd in Docker
docker run -d \
  --name etcd \
  -p 2379:2379 \
  -p 2380:2380 \
  quay.io/coreos/etcd:v3.5.0 \
  /usr/local/bin/etcd \
  --advertise-client-urls http://0.0.0.0:2379 \
  --listen-client-urls http://0.0.0.0:2379
```

## Common Operations

1. **Check etcd Health**
```bash
ETCDCTL_API=3 etcdctl endpoint health
```

2. **Backup etcd**
```bash
ETCDCTL_API=3 etcdctl snapshot save snapshot.db
```

3. **Restore from Backup**
```bash
ETCDCTL_API=3 etcdctl snapshot restore snapshot.db
```

4. **List All Keys**
```bash
ETCDCTL_API=3 etcdctl get / --prefix --keys-only
```

## Best Practices

1. **Backup and Recovery**
   - Regular automated backups
   - Verify backup integrity
   - Test restore procedures
   - Document recovery process

2. **Performance Optimization**
   - Proper resource allocation
   - Regular defragmentation
   - Monitor disk I/O
   - Use SSD storage

3. **Security**
   - Enable TLS encryption
   - Use client certificates
   - Implement RBAC
   - Regular certificate rotation

4. **High Availability**
   - Deploy odd number of nodes (3,5,7)
   - Distribute across failure domains
   - Monitor quorum health
   - Use proper networking configuration

## Monitoring

1. **Key Metrics**
   - Disk usage
   - Network latency
   - Request rates
   - Leader elections

2. **Prometheus Metrics**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: etcd-metrics
  namespace: kube-system
spec:
  ports:
  - name: metrics
    port: 2379
    targetPort: 2379
  selector:
    component: etcd
```

## Troubleshooting

1. **Common Issues**
   - Split brain
   - Network partitions
   - Disk space issues
   - Certificate problems

2. **Debug Commands**
```bash
# Check cluster status
ETCDCTL_API=3 etcdctl endpoint status

# Check member list
ETCDCTL_API=3 etcdctl member list

# Monitor operations
ETCDCTL_API=3 etcdctl watch --prefix /registry
```
