-- ─── ESO question: fix option text (BiDi issue with "CR") and improve explanation ──

-- Hebrew
UPDATE quiz_questions
SET
  options = jsonb_set(
    options,
    '{0}',
    to_jsonb('External Secrets Operator - מגדיר SecretStore ומשאב ExternalSecret'::text)
  ),
  explanation = E'External Secrets Operator (ESO) מסנכרן secrets מ-provider חיצוני (כמו AWS Secrets Manager) לתוך Kubernetes Secrets באופן אוטומטי.\nהערכים עצמם נשארים ב-provider - רק ההגדרות נשמרות ב-Git.\n\nשלושת המשאבים המרכזיים:\n• SecretStore - מגדיר את החיבור ל-provider החיצוני (AWS, GCP, Vault וכו׳)\n• ExternalSecret - מגדיר איזה secret למשוך ואיך למפות אותו\n• Kubernetes Secret - נוצר אוטומטית בתוך ה-Cluster על ידי ESO\n\n```yaml\napiVersion: external-secrets.io/v1beta1\nkind: ExternalSecret\nmetadata:\n  name: db-secret\nspec:\n  refreshInterval: 1h\n  secretStoreRef:\n    name: aws-secretstore\n    kind: SecretStore\n  target:\n    name: db-secret\n  data:\n  - secretKey: password\n    remoteRef:\n      key: prod/db/password\n```'
WHERE topic_id = 'security'
  AND level = 'medium'
  AND lang = 'he'
  AND q LIKE '%AWS Secrets Manager%';

-- English
UPDATE quiz_questions
SET
  options = jsonb_set(
    options,
    '{1}',
    to_jsonb('External Secrets Operator: SecretStore + ExternalSecret resources'::text)
  ),
  explanation = E'External Secrets Operator (ESO) syncs secrets from an external provider (like AWS Secrets Manager) into Kubernetes Secrets automatically.\nThe actual secret values stay in the provider - only the configuration resources are stored in Git.\n\nThree key resources:\n• SecretStore - defines the connection to the external provider (AWS, GCP, Vault, etc.)\n• ExternalSecret - defines which secret to pull and how to map it\n• Kubernetes Secret - created automatically inside the cluster by ESO\n\n```yaml\napiVersion: external-secrets.io/v1beta1\nkind: ExternalSecret\nmetadata:\n  name: db-secret\nspec:\n  refreshInterval: 1h\n  secretStoreRef:\n    name: aws-secretstore\n    kind: SecretStore\n  target:\n    name: db-secret\n  data:\n  - secretKey: password\n    remoteRef:\n      key: prod/db/password\n```'
WHERE topic_id = 'security'
  AND level = 'medium'
  AND lang = 'en'
  AND q LIKE '%AWS Secrets Manager%';
