# Kubernetes Architecture

This section covers the core components of Kubernetes architecture using Docker to demonstrate the concepts.

## Components Overview

### Master Node Components
1. **API Server**: The front-end interface to the Kubernetes control plane
2. **Controller Manager**: Manages various controllers that handle node operations
3. **Scheduler**: Assigns pods to nodes
4. **etcd**: Distributed key-value store for cluster data

### Worker Node Components
1. **Kubelet**: Ensures containers are running in a pod
2. **Kube-proxy**: Manages network rules
3. **Container Runtime**: Runs containers (Docker/containerd)

## Practical Exercises

### 1. Simulating API Server
```bash
# Run a simple API server simulation using Docker
docker run -d -p 8080:8080 --name api-server nginx
```

### 2. Understanding etcd
```bash
# Run etcd in Docker
docker run -d --name etcd \
  -p 2379:2379 \
  -p 2380:2380 \
  quay.io/coreos/etcd:latest
```

### 3. Component Interaction
See the `component-interaction.yaml` file for a demonstration of how components communicate.

## Files in this Directory

- `api-server-demo/`: Simple API server demonstration
- `etcd-demo/`: etcd usage examples
- `component-interaction.yaml`: Example showing component communication
- `architecture-diagram.png`: Visual representation of Kubernetes architecture
