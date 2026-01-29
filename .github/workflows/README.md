# GitHub Actions Workflows

## Build and Push Dashboard to ECR

This workflow builds the Next.js dashboard Docker image and pushes it to AWS ECR.

### Triggers

- **Push to main branch**: Automatically builds and pushes on every commit to main
- **Manual trigger**: Can be triggered manually from GitHub Actions UI

### Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

1. **AWS_ACCESS_KEY_ID**: AWS access key with ECR push permissions
   ```
   Repository Settings → Secrets and variables → Actions → New repository secret
   ```

2. **AWS_SECRET_ACCESS_KEY**: AWS secret access key
   ```
   Repository Settings → Secrets and variables → Actions → New repository secret
   ```

### ECR Repository

The workflow pushes to: `126730103313.dkr.ecr.ap-south-1.amazonaws.com/peekit/dashboard`

### Image Tags

Each build creates two tags:
- `<git-sha>`: Short git commit SHA (e.g., `a1b2c3d`)
- `latest`: Always points to the most recent build

### Local Build and Test

To build the Docker image locally:

```bash
# Build the image
docker build -t dashboard:local .

# Run locally
docker run -p 3000:3000 dashboard:local

# Test
curl http://localhost:3000
```

### Manual Push to ECR

To manually push to ECR:

```bash
# Login to ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 126730103313.dkr.ecr.ap-south-1.amazonaws.com

# Build and tag
docker build -t 126730103313.dkr.ecr.ap-south-1.amazonaws.com/peekit/dashboard:manual .

# Push
docker push 126730103313.dkr.ecr.ap-south-1.amazonaws.com/peekit/dashboard:manual
```

### Troubleshooting

**Build fails with "module not found":**
- Check that all dependencies are in `package.json`
- Verify `bun.lock` is committed to the repository

**ECR push fails with authentication error:**
- Verify GitHub secrets are set correctly
- Check IAM permissions for the AWS access key

**Docker build is slow:**
- GitHub Actions runners have limited resources
- Consider using Docker layer caching (can be added to workflow)

### Deployment

After the image is pushed to ECR, deploy to EKS:

```bash
# Update Kubernetes deployment with new image
kubectl set image deployment/dashboard dashboard=126730103313.dkr.ecr.ap-south-1.amazonaws.com/peekit/dashboard:<git-sha>

# Or apply the full deployment manifest
kubectl apply -f k8s/dashboard-deployment.yaml
```
