# Kubernetes Admission Policies

This document covers two layers of container image policy enforcement used in KubeQuest:

1. **CI enforcement** (shift-left) — Kyverno CLI validates manifests in the PR gate before merge
2. **Runtime admission** (cluster-side) — Kyverno or OPA Gatekeeper validates at deploy time

## CI Enforcement (already active)

The CI workflow runs `kyverno apply` against all manifests in `k8s/` using the policies in `k8s/policies/`. This catches violations before they reach the cluster.

Policies enforced in CI:

| Policy | What it checks |
|--------|---------------|
| `require-trusted-registries` | Images must come from `ghcr.io/or-carmeli/` |
| `disallow-latest-tag` | No `:latest` tag — use pinned tags or digests |
| `require-resource-limits` | CPU and memory limits must be set |

## Runtime Admission (Kyverno)

To enforce the same policies at admission time, install Kyverno in your cluster and apply the policies:

```bash
# Install Kyverno
helm repo add kyverno https://kyverno.github.io/kyverno/
helm install kyverno kyverno/kyverno -n kyverno --create-namespace

# Apply the policies (same files used in CI)
kubectl apply -f k8s/policies/
```

The policies use `validationFailureAction: Enforce`, so the API server will reject non-compliant resources.

## Runtime Admission (OPA Gatekeeper alternative)

If you prefer OPA Gatekeeper over Kyverno:

```bash
# Install Gatekeeper
kubectl apply -f https://raw.githubusercontent.com/open-policy-agent/gatekeeper/v3.17.1/deploy/gatekeeper.yaml
```

### Trusted registries constraint

```yaml
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8strustedregistries
spec:
  crd:
    spec:
      names:
        kind: K8sTrustedRegistries
      validation:
        openAPIV3Schema:
          type: object
          properties:
            registries:
              type: array
              items:
                type: string
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8strustedregistries
        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          not startswith(container.image, input.parameters.registries[_])
          msg := sprintf("Image '%v' is not from a trusted registry", [container.image])
        }
---
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sTrustedRegistries
metadata:
  name: require-ghcr
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
    namespaces: ["kubequest"]
  parameters:
    registries:
      - "ghcr.io/or-carmeli/"
```

## Cosign Image Verification (runtime)

To verify Cosign signatures at admission time, add a Kyverno `verifyImages` policy:

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: verify-cosign-signature
spec:
  validationFailureAction: Enforce
  webhookTimeoutSeconds: 30
  rules:
    - name: verify-signature
      match:
        any:
          - resources:
              kinds:
                - Pod
              namespaces:
                - kubequest
      verifyImages:
        - imageReferences:
            - "ghcr.io/or-carmeli/kubequest*"
          attestors:
            - entries:
                - keyless:
                    issuer: "https://token.actions.githubusercontent.com"
                    subject: "https://github.com/or-carmeli/KubeQuest/*"
                    rekor:
                      url: "https://rekor.sigstore.dev"
```

This ensures only images signed by this project's GitHub Actions workflow are admitted. It uses keyless verification — matching the same OIDC issuer and identity used during `cosign sign` in the publish pipeline.

## CI vs Runtime — when each layer matters

| Layer | Catches | Misses |
|-------|---------|--------|
| CI (Kyverno CLI) | Policy violations in committed manifests | Helm template issues, runtime mutations, manual `kubectl apply` |
| Runtime (admission webhook) | All resources at deploy time, including Helm, operators, manual edits | Nothing — last line of defense |

Both layers should enforce the same rules. The CI policies in `k8s/policies/` are the single source of truth — apply them to your cluster for runtime enforcement.
