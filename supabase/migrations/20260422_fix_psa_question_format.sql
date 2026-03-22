-- ─── PSA restricted question: re-apply formatting fix with broader WHERE ──
-- Previous migration 20260411 may not have matched; this uses a broader WHERE.

-- Hebrew
UPDATE quiz_questions
SET
  q = E'ה-Deployment נדחה על ידי PSA עם policy מסוג restricted.\n\n```\nError from server (Forbidden):\nPod violates PodSecurity "restricted:latest":\n  allowPrivilegeEscalation != false\n```\n\nאיזה securityContext צריך להגדיר ל-container כדי לעמוד במדיניות?',
  options = '["```yaml\nsecurityContext:\n  privileged: true\n  runAsUser: 0\n  capabilities:\n    add:\n      - NET_ADMIN\n```","```yaml\nsecurityContext:\n  allowPrivilegeEscalation: false\n  runAsNonRoot: true\n  seccompProfile:\n    type: RuntimeDefault\n```","```yaml\nsecurityContext:\n  readOnlyRootFilesystem: true\n  runAsUser: 1000\n```","```yaml\nsecurityContext:\n  capabilities:\n    drop:\n      - ALL\n  runAsGroup: 1000\n  privileged: false\n```"]'::jsonb,
  answer = 1,
  explanation = E'PSA (Pod Security Admission) הוא מנגנון built-in ב-Kubernetes שאוכף מדיניות אבטחה על Pods ברמת ה-Namespace.\n\nרמת restricted דורשת שלוש הגדרות חובה:\n• allowPrivilegeEscalation: false - חוסם הסלמת הרשאות דרך setuid/setgid\n• runAsNonRoot: true - מונע הרצה כ-root (UID 0)\n• seccompProfile: RuntimeDefault - אוכף סינון syscall בסיסי\n\n```yaml\nsecurityContext:\n  allowPrivilegeEscalation: false\n  runAsNonRoot: true\n  seccompProfile:\n    type: RuntimeDefault\n```\n\nאפשרות א מגדירה privileged: true - ההפך מ-restricted.\nאפשרות ג חסרה allowPrivilegeEscalation ו-seccompProfile.\nאפשרות ד חסרה runAsNonRoot ו-seccompProfile.'
WHERE topic_id = 'security'
  AND level = 'hard'
  AND lang = 'he'
  AND q LIKE '%allowPrivilegeEscalation%';

-- English
UPDATE quiz_questions
SET
  q = E'A Deployment is rejected by PSA with a restricted policy.\n\n```\nError from server (Forbidden):\nPod violates PodSecurity "restricted:latest":\n  allowPrivilegeEscalation != false\n```\n\nWhich securityContext must you set on the container to comply?',
  options = '["```yaml\nsecurityContext:\n  privileged: true\n  runAsUser: 0\n  capabilities:\n    add:\n      - NET_ADMIN\n```","```yaml\nsecurityContext:\n  allowPrivilegeEscalation: false\n  runAsNonRoot: true\n  seccompProfile:\n    type: RuntimeDefault\n```","```yaml\nsecurityContext:\n  readOnlyRootFilesystem: true\n  runAsUser: 1000\n```","```yaml\nsecurityContext:\n  capabilities:\n    drop:\n      - ALL\n  runAsGroup: 1000\n  privileged: false\n```"]'::jsonb,
  answer = 1,
  explanation = E'PSA (Pod Security Admission) is a built-in Kubernetes mechanism that enforces security policies on Pods at the Namespace level.\n\nThe restricted level requires all three:\n• allowPrivilegeEscalation: false - blocks privilege escalation via setuid/setgid\n• runAsNonRoot: true - prevents running as root (UID 0)\n• seccompProfile: RuntimeDefault - enforces basic syscall filtering\n\n```yaml\nsecurityContext:\n  allowPrivilegeEscalation: false\n  runAsNonRoot: true\n  seccompProfile:\n    type: RuntimeDefault\n```\n\nOption A sets privileged: true - the opposite of restricted.\nOption C is missing allowPrivilegeEscalation and seccompProfile.\nOption D is missing runAsNonRoot and seccompProfile.'
WHERE topic_id = 'security'
  AND level = 'hard'
  AND lang = 'en'
  AND q LIKE '%allowPrivilegeEscalation%';
