-- ── Add diagram tags to quiz content tables ─────────────────────────────────
-- Tags are semantic labels that indicate what concept a question covers.
-- The client uses tags to decide whether to show an architecture diagram
-- in the explanation. Only specific tags trigger a diagram; questions
-- without tags (or with non-diagram tags) show text-only explanations.
--
-- Tag taxonomy for diagram-triggering tags:
--   controller-hierarchy  — Deployment > ReplicaSet > Pods nesting
--   service-types         — LB > NodePort > ClusterIP layered chain
--   service-discovery     — Service > Endpoints > Pods routing
--   ingress-routing       — Ingress path/hostname based routing
--   ingress-vs-lb         — Ingress vs multiple LoadBalancers comparison
--   storage-binding       — PV ↔ PVC binding relationship
--   dynamic-provisioning  — StorageClass > CSI > PV provisioning flow
--   statefulset-storage   — StatefulSet ordered Pods + dedicated PVCs
--   rolling-update        — v1 → v2 gradual replacement
--   daemonset-topology    — one Pod per Node guarantee
--   taints-tolerations    — scheduling accept/reject via taints
--   topology-spread       — even Pod distribution across zones
--   rbac-binding          — Subject ↔ RoleBinding ↔ Role triangle
--   role-scope            — Role (namespace) vs ClusterRole (cluster)
--   network-policy-flow   — allow/deny traffic between Pods
--   hpa-scaling           — metrics → HPA → scale feedback loop
--   probe-comparison      — readiness vs liveness probe outcomes
--   headless-dns          — Headless Service returns individual Pod IPs
--   gitops-sync           — Git ↔ ArgoCD → Cluster flow

-- 1. Add tags column to all question tables
ALTER TABLE quiz_questions  ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE daily_questions ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE incident_steps  ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 2. Tag quiz_questions (both he and en rows share the same tag set)

-- pod-architecture
UPDATE quiz_questions SET tags = '["pod-architecture"]'::jsonb
WHERE q LIKE '%What is a Pod in Kubernetes%' OR q LIKE '%מה הוא Pod ב-Kubernetes%';

-- controller-hierarchy
UPDATE quiz_questions SET tags = '["controller-hierarchy"]'::jsonb
WHERE q LIKE '%What does a Deployment do%' OR q LIKE '%מה Deployment עושה%';

-- rolling-update (conceptual only — troubleshooting/stuck scenarios excluded)
UPDATE quiz_questions SET tags = '["rolling-update"]'::jsonb
WHERE q LIKE '%advantage of a Rolling Update%' OR q LIKE '%היתרון של Rolling Update%';

-- statefulset-storage
UPDATE quiz_questions SET tags = '["statefulset-storage"]'::jsonb
WHERE q LIKE '%difference between StatefulSet and Deployment%' OR q LIKE '%ההבדל בין StatefulSet ל-Deployment%';

UPDATE quiz_questions SET tags = '["statefulset-storage"]'::jsonb
WHERE q LIKE '%StatefulSet manage storage%' OR q LIKE '%StatefulSet מנהל storage%';

-- daemonset-topology
UPDATE quiz_questions SET tags = '["daemonset-topology"]'::jsonb
WHERE q LIKE '%DaemonSet guarantee%' OR q LIKE '%DaemonSet מבטיח%';

-- hpa-scaling
UPDATE quiz_questions SET tags = '["hpa-scaling"]'::jsonb
WHERE q LIKE '%What is HPA%' OR q LIKE '%מהו HPA%';

-- taints-tolerations
UPDATE quiz_questions SET tags = '["taints-tolerations"]'::jsonb
WHERE q LIKE '%taints and tolerations%' OR q LIKE '%taints ו-tolerations%';

-- topology-spread
UPDATE quiz_questions SET tags = '["topology-spread"]'::jsonb
WHERE q LIKE '%topologySpreadConstraints%';

-- probe-comparison
UPDATE quiz_questions SET tags = '["probe-comparison"]'::jsonb
WHERE q LIKE '%liveness probe fails%' OR q LIKE '%liveness probe נכשל%';

UPDATE quiz_questions SET tags = '["probe-comparison"]'::jsonb
WHERE q LIKE '%difference between Running and Ready%' OR q LIKE '%ההבדל בין Running ל-Ready%';

-- service-discovery
UPDATE quiz_questions SET tags = '["service-discovery"]'::jsonb
WHERE q LIKE '%Why do we need a Service%' OR q LIKE '%למה צריך Service%';

UPDATE quiz_questions SET tags = '["service-discovery"]'::jsonb
WHERE q LIKE '%Service find its Pods%' OR q LIKE '%Service מוצא%';

UPDATE quiz_questions SET tags = '["service-discovery"]'::jsonb
WHERE q LIKE '%get endpoints%' AND q LIKE '%<none>%';

-- service-types
UPDATE quiz_questions SET tags = '["service-types"]'::jsonb
WHERE q LIKE '%Service type%cloud external%' OR q LIKE '%Service מתאים לגישה חיצונית%';

-- ingress-routing
UPDATE quiz_questions SET tags = '["ingress-routing"]'::jsonb
WHERE q LIKE '%purpose of an Ingress%' OR q LIKE '%מטרת Ingress%';

UPDATE quiz_questions SET tags = '["ingress-routing"]'::jsonb
WHERE q LIKE '%path-based routing%Ingress%' OR q LIKE '%ניתוב לפי נתיב%';

UPDATE quiz_questions SET tags = '["ingress-routing"]'::jsonb
WHERE q LIKE '%Ingress route by hostname%' OR q LIKE '%ניתוב לפי hostname%';

-- ingress-vs-lb
UPDATE quiz_questions SET tags = '["ingress-vs-lb"]'::jsonb
WHERE q LIKE '%advantage of Ingress over LoadBalancer%' OR q LIKE '%יתרון של Ingress על פני LoadBalancer%';

-- network-policy-flow
UPDATE quiz_questions SET tags = '["network-policy-flow"]'::jsonb
WHERE q LIKE '%What is a NetworkPolicy%' OR q LIKE '%מה NetworkPolicy ב-Kubernetes%';

-- headless-dns (quiz_questions if present)
UPDATE quiz_questions SET tags = '["headless-dns"]'::jsonb
WHERE q LIKE '%Headless Service%' AND q LIKE '%clusterIP%';

-- rbac-binding
UPDATE quiz_questions SET tags = '["rbac-binding"]'::jsonb
WHERE q LIKE '%What is a RoleBinding%' OR q LIKE '%מהו RoleBinding%';

-- role-scope
UPDATE quiz_questions SET tags = '["role-scope"]'::jsonb
WHERE q LIKE '%difference between Role and ClusterRole%' OR q LIKE '%ההבדל בין Role ל-ClusterRole%';

-- storage-binding
UPDATE quiz_questions SET tags = '["storage-binding"]'::jsonb
WHERE q LIKE '%difference between PV and PVC%' OR q LIKE '%ההבדל בין PV ל-PVC%';

UPDATE quiz_questions SET tags = '["storage-binding"]'::jsonb
WHERE q LIKE '%PV and PVC bind%' OR q LIKE '%PV ו-PVC מתחברים%';

UPDATE quiz_questions SET tags = '["storage-binding"]'::jsonb
WHERE q LIKE '%Multi-Attach error%';

-- gitops-sync (ArgoCD topics)
UPDATE quiz_questions SET tags = '["gitops-sync"]'::jsonb
WHERE q LIKE '%Synced%Healthy%ArgoCD%' OR q LIKE '%Synced ל-Healthy ב-ArgoCD%';

UPDATE quiz_questions SET tags = '["gitops-sync"]'::jsonb
WHERE q LIKE '%auto-sync%self-heal%' OR q LIKE '%auto-sync ו-self-heal%';


-- 3. Tag daily_questions (rolling-update excluded — all daily are troubleshooting)

UPDATE daily_questions SET tags = '["service-discovery"]'::jsonb
WHERE q LIKE '%get endpoints%' AND q LIKE '%<none>%';

UPDATE daily_questions SET tags = '["ingress-routing"]'::jsonb
WHERE q LIKE '%Ingress%DNS resolves%' OR q LIKE '%Ingress מוגדר ו-DNS%';

UPDATE daily_questions SET tags = '["network-policy-flow"]'::jsonb
WHERE q LIKE '%NetworkPolicy was applied%' OR q LIKE '%NetworkPolicy הוחל%';

UPDATE daily_questions SET tags = '["service-types"]'::jsonb
WHERE q LIKE '%LoadBalancer%Pending%' OR q LIKE '%EXTERNAL-IP%pending%';

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE q LIKE '%Multi-Attach error%';

UPDATE daily_questions SET tags = '["headless-dns"]'::jsonb
WHERE q LIKE '%Headless Service%' AND q LIKE '%clusterIP%';

UPDATE daily_questions SET tags = '["probe-comparison"]'::jsonb
WHERE q LIKE '%difference between Running and Ready%' OR q LIKE '%ההבדל בין Running ל-Ready%';


-- 4. Tag incident_steps

UPDATE incident_steps SET tags = '["network-policy-flow"]'::jsonb
WHERE prompt LIKE '%deny-all-ingress%' OR prompt_he LIKE '%deny-all-ingress%';

UPDATE incident_steps SET tags = '["service-discovery"]'::jsonb
WHERE prompt LIKE '%get endpoints%' AND prompt LIKE '%<none>%';


-- 5. Update RPCs to include tags in their return types

-- quiz questions
DROP FUNCTION IF EXISTS get_quiz_questions(TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION get_quiz_questions(p_topic TEXT, p_level TEXT, p_lang TEXT)
RETURNS TABLE(id INT, q TEXT, options JSONB, tags JSONB)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT id, q, options, tags
  FROM quiz_questions
  WHERE topic_id = p_topic AND level = p_level AND lang = p_lang;
$$;

-- mixed questions
DROP FUNCTION IF EXISTS get_mixed_questions(TEXT, INT);
CREATE OR REPLACE FUNCTION get_mixed_questions(p_lang TEXT, p_limit INT DEFAULT 10)
RETURNS TABLE(id INT, q TEXT, options JSONB, level TEXT, tags JSONB)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT id, q, options, level, tags
  FROM quiz_questions
  WHERE lang = p_lang
  ORDER BY random()
  LIMIT LEAST(GREATEST(p_limit, 1), 50);
$$;

-- daily questions
DROP FUNCTION IF EXISTS get_daily_questions(TEXT, INT);
CREATE OR REPLACE FUNCTION get_daily_questions(p_lang TEXT, p_limit INT DEFAULT 10)
RETURNS TABLE(id INT, q TEXT, options JSONB, tags JSONB)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT id, q, options, tags
  FROM daily_questions
  WHERE lang = p_lang
  ORDER BY id
  LIMIT p_limit;
$$;

-- incident steps
DROP FUNCTION IF EXISTS get_incident_steps(TEXT);
CREATE OR REPLACE FUNCTION get_incident_steps(p_incident_id TEXT)
RETURNS TABLE(id INT, step_order SMALLINT, prompt TEXT, prompt_he TEXT, options JSONB, options_he JSONB, tags JSONB)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT id, step_order, prompt, prompt_he, options, options_he, tags
  FROM incident_steps
  WHERE incident_id = p_incident_id
  ORDER BY step_order;
$$;
