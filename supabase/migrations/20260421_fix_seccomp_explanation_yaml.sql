-- ─── seccomp question: update explanation to use fenced YAML code block ──

-- Hebrew
UPDATE quiz_questions
SET explanation = E'seccomp (Secure Computing) מגביל אילו system calls קונטיינר יכול לבצע.\n\nלמה זה חשוב?\nב-Linux יש 300+ syscalls, אבל קונטיינר ממוצע צריך רק חלק קטן מהם. חסימת השאר מצמצמת את ה-attack surface.\n\nאיך מגדירים:\n\n```yaml\nsecurityContext:\n  seccompProfile:\n    type: RuntimeDefault\n```\n\nRuntimeDefault מפעיל פרופיל בסיסי שחוסם syscalls מסוכנים כמו reboot או mount.'
WHERE topic_id = 'security'
  AND level = 'medium'
  AND lang = 'he'
  AND q LIKE '%seccomp%';

-- English
UPDATE quiz_questions
SET explanation = E'seccomp (Secure Computing) restricts which system calls a container can make.\n\nWhy does it matter?\nLinux has 300+ syscalls, but an average container only needs a small subset. Blocking the rest reduces the attack surface.\n\nHow to configure:\n\n```yaml\nsecurityContext:\n  seccompProfile:\n    type: RuntimeDefault\n```\n\nRuntimeDefault applies a baseline profile that blocks dangerous syscalls like reboot or mount.'
WHERE topic_id = 'security'
  AND level = 'medium'
  AND lang = 'en'
  AND q LIKE '%seccomp%';
