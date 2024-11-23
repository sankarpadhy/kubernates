# Kubernetes Hands-on Exercises

This directory contains practical exercises to help you master Kubernetes concepts through hands-on practice. Each exercise builds upon previous knowledge and includes comprehensive examples and solutions.

## Learning Path Structure

### Foundation Exercises (Week 1)

#### Exercise 1: Pod Basics
- Single container pods
- Multi-container pods
- Pod lifecycle management
- Resource requests and limits
- Health checks and probes

#### Exercise 2: Controllers
- ReplicaSets for high availability
- Deployments for updates
- DaemonSets for cluster services
- StatefulSets for stateful applications
- Job and CronJob for batch processing

#### Exercise 3: Services & Networking
- Service types and use cases
- ClusterIP for internal communication
- NodePort for external access
- LoadBalancer for cloud integration
- Ingress for HTTP routing

#### Exercise 4: Storage & Configuration
- ConfigMaps for configuration
- Secrets for sensitive data
- Persistent Volumes setup
- Storage Classes usage
- Dynamic provisioning

### Advanced Exercises (Week 2)

#### Exercise 5: Security
- Role-Based Access Control (RBAC)
- Service Accounts
- Network Policies
- Pod Security Policies
- Security Context

#### Exercise 6: Monitoring & Logging
- Prometheus setup
- Grafana dashboards
- ELK stack deployment
- Custom metrics
- Alert management

#### Exercise 7: Scaling & High Availability
- Horizontal Pod Autoscaling
- Vertical Pod Autoscaling
- Cluster Autoscaling
- Pod Disruption Budgets
- Node Affinity rules

#### Exercise 8: Advanced Deployments
- Blue-Green deployments
- Canary releases
- Rolling updates
- A/B testing
- Feature flags

#### Exercise 9: Multi-cluster Management
- Federation setup
- Multi-cluster services
- Cross-cluster communication
- Disaster recovery
- Global load balancing

## Exercise Format

Each exercise follows a consistent structure:

### 1. Learning Objectives
- Clear goals and outcomes
- Required knowledge
- Time estimation

### 2. Prerequisites
- Required tools
- Environment setup
- Previous exercises

### 3. Step-by-Step Guide
- Detailed instructions
- Code examples
- Expected output
- Validation steps

### 4. Hands-on Tasks
- Practical exercises
- Real-world scenarios
- Challenge problems
- Solution examples

### 5. Troubleshooting
- Common issues
- Debug techniques
- Best practices
- FAQs

### 6. Further Learning
- Advanced topics
- Related concepts
- External resources
- Next steps

## Getting Started

1. **Environment Setup**
```bash
# Verify Docker installation
docker version

# Verify kubectl installation
kubectl version

# Create practice namespace
kubectl create namespace practice
```

2. **Exercise Navigation**
- Start with Exercise 1
- Complete all tasks in order
- Verify understanding with tests
- Clean up resources after completion

3. **Resource Management**
```bash
# Create resources
kubectl apply -f <filename.yaml>

# Verify status
kubectl get <resource-type>

# Clean up
kubectl delete -f <filename.yaml>
```

## Best Practices

1. **Resource Organization**
   - Use consistent naming
   - Apply proper labels
   - Organize by namespace
   - Clean up after exercises

2. **Learning Approach**
   - Read documentation first
   - Follow examples carefully
   - Experiment with variations
   - Document learnings

3. **Troubleshooting**
   - Check logs thoroughly
   - Use describe command
   - Verify configurations
   - Test connectivity

## Additional Resources

### Documentation
- [Kubernetes Docs](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

### Tools
- [k9s](https://k9scli.io/) - Terminal UI
- [Lens](https://k8slens.dev/) - Kubernetes IDE
- [kubectx](https://github.com/ahmetb/kubectx) - Context switching

### Community
- [Kubernetes Slack](https://kubernetes.slack.com)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/kubernetes)

## Support

If you encounter any issues:
1. Check the exercise's troubleshooting section
2. Review the FAQ
3. Search existing issues
4. Ask in community channels

Happy Learning! 
