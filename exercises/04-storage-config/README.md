# Exercise 4: Storage and Configuration Management

## Objective
Learn how to manage persistent storage and application configuration in Kubernetes.

## Prerequisites
- Completed Exercises 1-3
- Docker Desktop running
- kubectl configured

## Exercises

### Exercise 4.1: ConfigMaps
**Objective**: Learn how to manage application configuration using ConfigMaps

1. Create a ConfigMap:
```yaml
# app-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  app.properties: |
    environment=development
    log.level=debug
    api.endpoint=http://api.example.com
  config.json: |
    {
      "database": {
        "host": "db.example.com",
        "port": 5432
      }
    }
```

2. Use ConfigMap in Pod:
```yaml
# configmap-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: config-pod
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "while true; do echo 'Reading config...'; cat /etc/config/app.properties; sleep 30; done"]
    volumeMounts:
    - name: config-volume
      mountPath: /etc/config
  volumes:
  - name: config-volume
    configMap:
      name: app-config
```

### Exercise 4.2: Secrets
**Objective**: Understand secure configuration management using Secrets

1. Create a Secret:
```yaml
# app-secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
stringData:
  db-password: supersecret
  api-key: abc123xyz789
```

2. Use Secret in Pod:
```yaml
# secret-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-pod
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "echo $DB_PASSWORD && sleep 3600"]
    env:
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: app-secrets
          key: db-password
```

### Exercise 4.3: Persistent Volumes
**Objective**: Learn how to manage persistent storage

1. Create PersistentVolume:
```yaml
# persistent-volume.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: data-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /data/pv001
```

2. Create PersistentVolumeClaim:
```yaml
# persistent-volume-claim.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

3. Use PVC in Pod:
```yaml
# pvc-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: pvc-pod
spec:
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - name: data-volume
      mountPath: /usr/share/nginx/html
  volumes:
  - name: data-volume
    persistentVolumeClaim:
      claimName: data-pvc
```

### Exercise 4.4: Storage Classes
**Objective**: Understand dynamic volume provisioning

1. Create StorageClass:
```yaml
# storage-class.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-storage
provisioner: k8s.io/minikube-hostpath
parameters:
  type: ssd
```

2. Use StorageClass in PVC:
```yaml
# dynamic-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: dynamic-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: fast-storage
  resources:
    requests:
      storage: 1Gi
```

## Verification Tasks

1. **ConfigMap Management**
- Create and update ConfigMaps
- Mount ConfigMap as volume
- Use ConfigMap as environment variables
- Test configuration updates

2. **Secret Handling**
- Create Secrets using kubectl
- Mount Secrets as files
- Use Secrets in environment variables
- Rotate Secret values

3. **Storage Operations**
- Create and bind PVs and PVCs
- Test data persistence
- Resize volumes
- Backup and restore data

## Advanced Concepts

### 1. ConfigMap Auto-reload
```yaml
# auto-reload-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: auto-reload
  annotations:
    configmap.reloader.stakater.com/reload: "app-config"
spec:
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - name: config
      mountPath: /etc/nginx/conf.d
  volumes:
  - name: config
    configMap:
      name: app-config
```

### 2. Encrypted Secrets
```yaml
# encrypted-secret.yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: encrypted-secret
spec:
  encryptedData:
    api-key: AgBy8hCK8...
```

### 3. Volume Snapshots
```yaml
# volume-snapshot.yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: data-snapshot
spec:
  volumeSnapshotClassName: csi-hostpath-snapclass
  source:
    persistentVolumeClaimName: data-pvc
```

## Troubleshooting Guide

1. **ConfigMap Issues**
- Check ConfigMap data
- Verify volume mounts
- Check pod events
- Test configuration loading

2. **Secret Problems**
- Verify Secret creation
- Check Secret mounting
- Monitor pod events
- Test Secret access

3. **Storage Issues**
- Check PV/PVC binding
- Verify storage provisioner
- Monitor volume events
- Check storage capacity

## Additional Challenges

1. Implement automatic Secret rotation
2. Create a dynamic volume provisioner
3. Set up encrypted storage
4. Implement backup solutions
5. Create storage quotas and limits
