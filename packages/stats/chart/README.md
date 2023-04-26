#### Note

* by default we use nginx ingress controller.
* if you want to use the ingress, you need to install the ingress controller.

#### 1. Deploying the TFGrid Chart and set host domain_name

```bash
    helm install <helm_name> ./tfgrid-stats/ --values ./tfgrid-stats/values.yaml --set ingress.hosts[0].host=<domain_name>
```

#### 2. Test it, and check the results

```bash
    curl -X GET http://<domain_name>/
```

#### 3. Using traefik ingress controller

```yaml 
    # Make sure traefik is installed.
    # Just replace the annotations with:
    annotations:
      kubernetes.io/ingress.class: traefik
```

#### 4. Deploying with nginx ingress and https

```bash 
    helm install <helm_name> ./tfgrid-stats/ --values ./tfgrid-stats/values.yaml --set ingress.hosts[0].host=<domain_name> --set ingress.tls[0].hosts[0]=<domain_name> --set ingress.tls[0].secretName=<secret_name>
```
