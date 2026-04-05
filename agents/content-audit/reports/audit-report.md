# KubeQuest Content Audit Report

**Date:** 2026-04-05
**Files scanned:** `src/content/topics.js`, `src/content/dailyQuestions.js`, `src/content/incidents.js`, `src/content/scenarios/cacheStampede.js`, `src/content/scenarios/cdnMisconfigured.js`, `src/content/scenarios/lbMisconfigured.js`, `src/content/scenarios/podCrashLoop.js`, `src/content/scenarios/rdsLatency.js`, `src/content/scenarios/trafficSpike.js`
**Total findings:** 18
**By severity:** high: 3, medium: 10, low: 5

## Answer Distribution

### topics.js (Hebrew)

| File / Topic Level | 0 | 1 | 2 | 3 | Total | Flags |
|---------------------|---|---|---|---|-------|-------|
| workloads/easy | 2 | 1 | 3 | 2 | 8 | |
| workloads/medium | 4 | 2 | 2 | 0 | 8 | **0=50%, 3=0%** |
| workloads/hard | 3 | 2 | 3 | 0 | 8 | **3=0%** |
| networking/easy | 1 | 0 | 5 | 2 | 8 | **2=62.5%** |
| networking/medium | 1 | 0 | 3 | 4 | 8 | **1=0%** |
| networking/hard | 3 | 0 | 3 | 2 | 8 | **1=0%** |
| cluster-ops/easy | 2 | 2 | 2 | 2 | 8 | |
| cluster-ops/medium | 2 | 2 | 2 | 2 | 8 | |
| cluster-ops/hard | 3 | 1 | 2 | 2 | 8 | |
| config/easy | 1 | 1 | 3 | 3 | 8 | |
| config/medium | 3 | 4 | 1 | 0 | 8 | **1=50%, 3=0%** |
| config/hard | 0 | 3 | 3 | 2 | 8 | **0=0%** |
| storage/easy | 1 | 0 | 5 | 2 | 8 | **2=62.5%** |
| storage/medium | 0 | 0 | 5 | 3 | 8 | **0=0%, 1=0%, 2=62.5%** |
| storage/hard | 2 | 4 | 0 | 2 | 8 | **1=50%, 2=0%** |
| troubleshooting/easy | 6 | 0 | 1 | 1 | 8 | **0=75%** |
| troubleshooting/medium | 1 | 1 | 4 | 2 | 8 | **2=50%** |
| troubleshooting/hard | 1 | 1 | 3 | 3 | 8 | |
| linux/easy | 1 | 3 | 2 | 2 | 8 | |
| linux/medium | 3 | 2 | 1 | 2 | 8 | |
| linux/hard | 3 | 2 | 1 | 2 | 8 | |
| argo/easy | 3 | 3 | 2 | 0 | 8 | **3=0%** |
| argo/medium | 4 | 3 | 1 | 0 | 8 | **0=50%, 3=0%** |
| argo/hard | 2 | 3 | 2 | 1 | 8 | |

### topics.js (English)

| File / Topic Level | 0 | 1 | 2 | 3 | Total | Flags |
|---------------------|---|---|---|---|-------|-------|
| workloads/easy En | 1 | 3 | 2 | 2 | 8 | |
| workloads/medium En | 2 | 5 | 1 | 0 | 8 | **1=62.5%, 3=0%** |
| workloads/hard En | 0 | 3 | 3 | 2 | 8 | **0=0%** |
| networking/easy En | 3 | 3 | 0 | 2 | 8 | **2=0%** |
| networking/medium En | 2 | 1 | 2 | 3 | 8 | |
| networking/hard En | 3 | 2 | 1 | 2 | 8 | |
| cluster-ops/easy En | 2 | 2 | 2 | 2 | 8 | |
| cluster-ops/medium En | 2 | 2 | 2 | 2 | 8 | |
| cluster-ops/hard En | 3 | 3 | 0 | 2 | 8 | **2=0%** |
| config/easy En | 0 | 1 | 1 | 6 | 8 | **0=0%, 3=75%** |
| config/medium En | 1 | 3 | 3 | 1 | 8 | |
| config/hard En | 0 | 6 | 1 | 1 | 8 | **0=0%, 1=75%** |
| storage/easy En | 3 | 2 | 2 | 1 | 8 | |
| storage/medium En | 0 | 2 | 3 | 3 | 8 | **0=0%** |
| storage/hard En | 1 | 7 | 0 | 0 | 8 | **1=87.5%, 2=0%, 3=0%** |
| troubleshooting/easy En | 1 | 0 | 3 | 4 | 8 | **1=0%, 3=50%** |
| troubleshooting/medium En | 3 | 2 | 1 | 2 | 8 | |
| troubleshooting/hard En | 4 | 1 | 2 | 1 | 8 | **0=50%** |
| linux/easy En | 1 | 3 | 2 | 2 | 8 | |
| linux/medium En | 3 | 2 | 1 | 2 | 8 | |
| linux/hard En | 3 | 2 | 1 | 2 | 8 | |
| argo/easy En | 3 | 3 | 2 | 0 | 8 | **3=0%** |
| argo/medium En | 4 | 3 | 1 | 0 | 8 | **0=50%, 3=0%** |
| argo/hard En | 2 | 3 | 2 | 1 | 8 | |

### dailyQuestions.js

| Language | 0 | 1 | 2 | 3 | Total | Flags |
|----------|---|---|---|---|-------|-------|
| Hebrew | 39 | 41 | 38 | 38 | 156 | Balanced |
| English | 36 | 41 | 37 | 37 | 151 | Balanced |

### incidents.js

| Incident ID | 0 | 1 | 2 | 3 | Total | Flags |
|-------------|---|---|---|---|-------|-------|
| crashloop-config | 4 | 1 | 0 | 0 | 5 | **0=80%, 2=0%, 3=0%** |
| imagepull-auth | 2 | 3 | 0 | 0 | 5 | **2=0%, 3=0%** |
| oom-killed | 2 | 3 | 0 | 1 | 6 | **2=0%** |
| service-no-endpoints | 3 | 3 | 0 | 0 | 6 | **2=0%, 3=0%** |
| dns-coredns | 4 | 3 | 0 | 0 | 7 | **2=0%, 3=0%** |
| networkpolicy-block | 4 | 2 | 1 | 0 | 7 | **3=0%** |

Note: Incidents have only 5-7 steps each, so imbalance in small groups is expected. The combined total across all 36 steps is [19, 15, 1, 1], which is a systemic bias toward indices 0 and 1.

## Cross-Language Consistency

### dailyQuestions.js -- Question count mismatch

Hebrew has 156 questions, English has 151. Starting from approximately Q83, the Hebrew and English questions are offset/misaligned. This means questions at the same array index test different concepts in each language. Five questions exist only in Hebrew with no English translation.

### topics.js

No cross-language mismatches found in correct answer meaning. All question pairs have semantically matching correct answers despite shuffled option indices (by design).

### incidents.js

No cross-language mismatches found. All incident steps have semantically matching correct answers between English and Hebrew options.

## Summary

The audit found 18 issues across the content files. The most significant findings are: (1) dailyQuestions.js has 5 more Hebrew questions than English (156 vs 151), causing misalignment from Q83 onward; (2) several answer distribution imbalances in topics.js, most notably storage/hard En where index 1 is the correct answer for 7 of 8 questions (87.5%), config/easy En where index 3 is correct for 6 of 8 (75%), and config/hard En where index 1 is correct for 6 of 8 (75%); (3) a handful of fairness issues where the correct option is notably longer than distractors.

## High severity findings

### Finding 1

**File:** `src/content/dailyQuestions.js`
**Question/Step:** N/A (file-level issue)
**Severity:** high
**Category:** cross_language_consistency
**Confidence:** high

**Problem:**
Hebrew has 156 daily questions but English has only 151. From approximately Q83 onward, the He and En arrays are misaligned -- questions at the same index test different concepts. Five Hebrew questions have no English equivalent.

**Suggested fix:**
> Identify the 5 extra Hebrew questions (likely inserted around index 83-90) and either add matching English translations or remove them from the Hebrew array to restore parity.

### Finding 2

**File:** `src/content/topics.js`
**Question/Step:** "storage/hard" English questions
**Severity:** high
**Category:** answer_distribution
**Confidence:** high

**Original text:**
> storage/hard En: answer index distribution [1,7,0,0] -- 87.5% of answers are index 1

**Problem:**
In the English storage/hard level, 7 out of 8 questions have answer index 1. A test-taker could guess index 1 every time and get 87.5% correct without any knowledge.

**Suggested fix:**
> Shuffle the option order for several storage/hard English questions to distribute correct answers more evenly across indices 0-3.

### Finding 3

**File:** `src/content/topics.js`
**Question/Step:** "config/easy" and "config/hard" English questions
**Severity:** high
**Category:** answer_distribution
**Confidence:** high

**Original text:**
> config/easy En: [0,1,1,6] -- 75% of answers are index 3
> config/hard En: [0,6,1,1] -- 75% of answers are index 1

**Problem:**
In config/easy English, 6 of 8 answers are index 3 (75%). In config/hard English, 6 of 8 answers are index 1 (75%). Both are severely imbalanced.

**Suggested fix:**
> Shuffle option order in several questions from each group to distribute correct answers more evenly.

## Medium severity findings

### Finding 4

**File:** `src/content/topics.js`
**Question/Step:** "troubleshooting/easy" Hebrew questions
**Severity:** medium
**Category:** answer_distribution
**Confidence:** high

**Original text:**
> troubleshooting/easy He: [6,0,1,1] -- 75% of answers are index 0

**Problem:**
6 of 8 Hebrew troubleshooting/easy questions have answer index 0.

**Suggested fix:**
> Shuffle option order in several questions to reduce concentration on index 0.

### Finding 5

**File:** `src/content/topics.js`
**Question/Step:** "networking/easy" Hebrew questions
**Severity:** medium
**Category:** answer_distribution
**Confidence:** high

**Original text:**
> networking/easy He: [1,0,5,2] -- 62.5% of answers are index 2

**Problem:**
5 of 8 Hebrew networking/easy questions have answer index 2.

**Suggested fix:**
> Shuffle option order in several questions to distribute answers more evenly.

### Finding 6

**File:** `src/content/topics.js`
**Question/Step:** "storage/easy" and "storage/medium" Hebrew questions
**Severity:** medium
**Category:** answer_distribution
**Confidence:** high

**Original text:**
> storage/easy He: [1,0,5,2] -- 62.5% on index 2
> storage/medium He: [0,0,5,3] -- 62.5% on index 2, 0% on indices 0 and 1

**Problem:**
Storage easy and medium Hebrew levels have heavy concentration on index 2.

**Suggested fix:**
> Shuffle option order in several questions to distribute more evenly.

### Finding 7

**File:** `src/content/topics.js`
**Question/Step:** "workloads/medium" Hebrew and English
**Severity:** medium
**Category:** answer_distribution
**Confidence:** high

**Original text:**
> workloads/medium He: [4,2,2,0] -- 50% on index 0, 0% on index 3
> workloads/medium En: [2,5,1,0] -- 62.5% on index 1, 0% on index 3

**Problem:**
Both languages have no answer at index 3, and one dominant index.

**Suggested fix:**
> Shuffle option order in several questions.

### Finding 8

**File:** `src/content/topics.js`
**Question/Step:** "argo/medium" Hebrew and English
**Severity:** medium
**Category:** answer_distribution
**Confidence:** high

**Original text:**
> argo/medium He: [4,3,1,0] -- 50% on index 0, 0% on index 3
> argo/medium En: [4,3,1,0] -- same

**Problem:**
ArgoCD medium questions never use index 3 as the correct answer in either language.

**Suggested fix:**
> Shuffle option order in several questions.

### Finding 9

**File:** `src/content/topics.js`
**Question/Step:** linux/medium Q4: "A production server writes logs to a 2GB file"
**Severity:** medium
**Category:** fairness
**Confidence:** high

**Measurements (fairness only):**
> Correct option length: 68 chars | Distractor avg: 30 chars | Ratio: 2.29x | Gap to 2nd longest: +35 chars

**Problem:**
The correct answer is 2.29x longer than the average distractor and 35 chars longer than the second-longest option, making it guessable by length alone in both He and En.

**Suggested fix:**
> Shorten the correct answer or pad distractors with similarly specific (but incorrect) grep/awk command snippets so all options look equally detailed.

### Finding 10

**File:** `src/content/topics.js`
**Question/Step:** networking/hard En Q7: "A Pod cannot reach the internet..."
**Severity:** medium
**Category:** fairness
**Confidence:** high

**Measurements (fairness only):**
> Correct option length: 70 chars | Distractor avg: 41 chars | Ratio: 1.71x | Gap to 2nd longest: +27 chars

**Problem:**
The correct option is 1.71x longer than the average distractor and 27 chars longer than the second-longest, making it guessable by length.

**Suggested fix:**
> Shorten the correct option or pad distractors with specific (but wrong) ipBlock/CIDR details.

### Finding 11

**File:** `src/content/topics.js`
**Question/Step:** troubleshooting/hard He Q0: "After Deployment, new Pods CrashLoopBackOff"
**Severity:** medium
**Category:** fairness
**Confidence:** medium

**Measurements (fairness only):**
> Correct option length: 66 chars | Distractor avg: 39 chars | Ratio: 1.71x | Gap to 2nd longest: +17 chars

**Problem:**
Correct answer is 1.71x longer than average distractor.

**Suggested fix:**
> Pad distractors with specific kubectl command details or shorten the correct answer.

### Finding 12

**File:** `src/content/incidents.js`
**Question/Step:** networkpolicy-block Step 3 He: "Label Mismatch Confirmed"
**Severity:** medium
**Category:** fairness
**Confidence:** medium

**Measurements (fairness only):**
> Correct option length (He): 146 chars | Distractor avg: 103 chars | Ratio: 1.41x | Gap to 2nd longest: +38 chars

**Problem:**
The correct Hebrew option is 38 chars longer than the second-longest option, making it guessable by length.

**Suggested fix:**
> Either shorten the correct option or add similarly detailed (but wrong) kubectl patch commands to the distractors.

### Finding 13

**File:** `src/content/incidents.js`
**Question/Step:** All incidents combined
**Severity:** medium
**Category:** answer_distribution
**Confidence:** medium

**Original text:**
> Combined across all 36 incident steps: [19, 15, 1, 1] -- indices 2 and 3 are used only 5.6% of the time

**Problem:**
Incident steps overwhelmingly use answer indices 0 and 1 (94.4% combined). Indices 2 and 3 are almost never the correct answer.

**Suggested fix:**
> Shuffle option order in several incident steps to use all four indices more evenly.

## Low severity findings

### Finding 14

**File:** `src/content/topics.js`
**Question/Step:** troubleshooting/medium Q0: "Pod crashes and Kubernetes restarts it"
**Severity:** low
**Category:** fairness
**Confidence:** medium

**Measurements (fairness only):**
> Correct option length: 16 chars | Distractor avg: 11 chars | Ratio: 1.50x | Gap to 2nd longest: +4 chars

**Problem:**
CrashLoopBackOff (16 chars) is the longest option at 1.50x, but the absolute gap is only 4 chars so the practical impact is low.

**Suggested fix:**
> No fix needed -- flag for manual review.

### Finding 15

**File:** `src/content/topics.js`
**Question/Step:** config/medium He Q2: "What is a ServiceAccount"
**Severity:** low
**Category:** fairness
**Confidence:** low

**Measurements (fairness only):**
> Correct option length: 56 chars | Distractor avg: 40 chars | Ratio: 1.41x | Gap to 2nd longest: +11 chars

**Problem:**
Correct option is 1.41x the average distractor length but gap is only 11 chars. Marginal.

**Suggested fix:**
> No fix needed -- flag for manual review.

### Finding 16

**File:** `src/content/topics.js`
**Question/Step:** linux/easy Q2: "Which command shows service logs"
**Severity:** low
**Category:** fairness
**Confidence:** medium

**Measurements (fairness only):**
> Correct option length: 43 chars | Distractor avg: 29 chars | Ratio: 1.50x | Gap to 2nd longest: not longest

**Problem:**
Correct answer is 1.5x the average but is not the longest option.

**Suggested fix:**
> No fix needed -- flag for manual review.

### Finding 17

**File:** `src/content/topics.js`
**Question/Step:** argo/easy He Q4: "Team wants to rollback"
**Severity:** low
**Category:** fairness
**Confidence:** low

**Measurements (fairness only):**
> Correct option length: 53 chars | Distractor avg: 35 chars | Ratio: 1.53x | Gap to 2nd longest: not longest

**Problem:**
Correct is 1.53x the average distractor but is not the longest option overall.

**Suggested fix:**
> No fix needed -- flag for manual review.

### Finding 18

**File:** `src/content/dailyQuestions.js`
**Question/Step:** Multiple questions (Q19, Q24, Q32, Q56, Q57, Q72, Q92, Q98, Q103, Q119, Q122, etc.)
**Severity:** low
**Category:** fairness
**Confidence:** low

**Problem:**
About 20 daily questions in Hebrew and 15 in English have correct answers that are 1.4x-1.6x the average distractor length. Most gaps are under 20 chars, so the practical guessability impact is low.

**Suggested fix:**
> No fix needed -- flag for manual review on a per-question basis. Consider padding distractors with more specific details when updating these questions.
