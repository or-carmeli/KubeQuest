-- Tag PSA restricted policy question with psa-admission for diagram
UPDATE quiz_questions SET tags = '["psa-admission"]'::jsonb
WHERE q LIKE '%PSA%restricted%allowPrivilegeEscalation%';
