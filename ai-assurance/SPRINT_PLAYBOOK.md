# DΩP Agent Assurance Sprint v0.1

**Status:** Founding-method MVP  
**Commercial offer:** A$2,500 founding price for one agent/workflow  
**Purpose:** Convert a self-assessed AI deployment into a repeatable, evidence-backed readiness review.

## Outcome

The customer should leave able to answer:

1. What can this agent actually do?
2. What can it access?
3. What stops it exceeding intended authority?
4. Can accountable humans see, understand and stop consequential actions?
5. How quickly would the organisation detect, contain and communicate an incident?
6. What must be fixed before the system is expanded?

This is an assurance/readiness assessment. It is not certification, legal advice, penetration testing or a guarantee of safety.

---

## Scope

One deployed or pre-deployment AI agent, copilot or automated workflow.

Typical examples:
- customer-service agent;
- sales/outreach agent;
- finance or accounts assistant;
- research/browsing agent;
- internal operations agent;
- coding/deployment agent;
- HR/recruitment assistant;
- workflow automation with model-directed tool use.

Out of scope unless separately agreed:
- penetration testing;
- source-code audit;
- regulatory legal opinion;
- model-weight evaluation;
- red-team campaigns against production infrastructure;
- formal certification.

---

## Customer journey

### 0. Free Agent Exposure Check
Customer completes the browser-local self-assessment.

Capture only when the customer chooses to contact DΩP:
- score;
- deployment posture;
- six dimension scores;
- three priority fixes;
- system/agent name;
- organisation;
- contact details.

### 1. Qualification
15-minute fit screen.

Proceed when:
- the organisation is using, piloting or procuring an agentic system;
- the agent has meaningful data/tool/action access;
- a business owner or technical owner can participate;
- there is a decision to deploy, expand or remediate.

Do not oversell low-consequence use cases. If the agent has no meaningful permissions or sensitive access, recommend the free check and lightweight controls rather than a paid Sprint.

### 2. Evidence request
Ask for evidence before the review where available:
- agent purpose and owner;
- architecture or workflow diagram;
- tool/API list;
- identity and credential model;
- data categories accessed;
- permission/role configuration;
- outbound network policy;
- human approval points;
- logging/monitoring screenshots or samples;
- incident-response process;
- vendor/model details and relevant contracts/policies;
- prior incidents or unexpected behaviours.

Never request secrets, raw passwords, API keys or unnecessary personal information.

### 3. 60–90 minute review
Walk through the system from task initiation to external effect.

Use:
**Signal → Implications → Strategy → Execution**

Evidence confidence must be recorded separately from the DΩP judgement.

### 4. Analysis
Assess six dimensions:

1. Permission Control
2. Data Control
3. Boundary Strength
4. Human Authority
5. Observability
6. Incident Readiness

Also record:
- agent authority level;
- maximum credible consequence;
- current deployment state;
- unresolved assumptions;
- evidence confidence;
- control dependencies;
- third-party dependencies.

### 5. Deliverables
Customer receives:
- one-page executive view;
- Permission Envelope;
- Human Authority test;
- exposure/control matrix;
- top remediation priorities;
- Control Debt narrative;
- incident-readiness/AIAL analysis where timestamps exist;
- Assurance Receipt;
- deployment recommendation;
- retest criteria.

### 6. Retest
After remediation, verify the high-priority controls.

The retest asks whether the control exists **and works**.

---

# Permission Envelope

Document the maximum technically available authority, not the intended prompt behaviour.

## Identity
- unique agent identity?
- shared human/service account?
- credential lifetime?
- revocation path?

## Tools
- which tools are callable?
- which write?
- which create external effects?

## Data
- public;
- internal;
- confidential;
- personal;
- financial;
- health/sensitive;
- secrets/credentials.

## Network
- open internet?
- allow-list?
- private networks?
- external third parties?

## Action classes
- draft;
- send;
- publish;
- modify;
- delete;
- purchase;
- refund;
- transfer;
- approve;
- deploy;
- execute code;
- create credentials;
- change permissions.

## Limits
Record hard technical limits, not policy statements.

Examples:
- spend <= A$250;
- email <= 50 recipients without approval;
- no production deployment;
- no delete permission;
- no access outside allow-listed domains.

---

# Human Authority Test

Meaningful human oversight requires all five.

## 1. Visibility
Can the responsible human see what the agent is proposing and doing?

## 2. Comprehension
Is the information understandable enough to support a decision?

## 3. Time
Does the human have time to intervene before consequence?

## 4. Authority
Is the human authorised to block, reverse or escalate?

## 5. Intervention
Is there a practical, tested mechanism that actually stops or revokes the system?

If one or more are absent, flag potential **Human Theatre**.

---

# Observability

Minimum evidence:
- actor identity;
- timestamp;
- proposed action;
- executed action;
- target/resource;
- tool/API used;
- policy decision;
- result;
- human approval/intervention;
- error/denial;
- escalation event.

High-value behavioural tripwires:
- repeated denials;
- tactic switching;
- scope expansion;
- privilege escalation attempts;
- unusual outbound destinations;
- rapid repeated actions;
- unexpected data access;
- actions inconsistent with business purpose.

---

# Incident readiness

Named roles should exist for:
- technical containment;
- business owner;
- security;
- privacy/legal where relevant;
- external communication/notification;
- vendor escalation.

Test:
- stop/revoke mechanism;
- evidence preservation;
- containment;
- investigation;
- customer/partner notification;
- regulator notification where applicable;
- third-party dependency escalation;
- post-incident review.

---

# AI Incident Awareness Latency (AIAL)

DΩP operational concept.

Track:
- T0 consequential agent action;
- T1 internal detection;
- T2 verification;
- T3 affected-party notification;
- T4 containment;
- T5 remediation;
- T6 external/regulatory disclosure where relevant.

Core measure:
**AIAL = T3 - T0**

Also report:
- Detection latency = T1 - T0
- Notification latency = T3 - T1

Do not compare AIAL across incidents without considering severity, consequence, scope and reversibility.

---

# Scoring principles

Scores are DΩP analytical judgements, not probabilities.

Keep:
- evidence confidence separate from risk/readiness;
- measured facts separate from inference;
- developer/vendor claims separate from independent evidence.

## Suggested readiness bands

**85–100 · Strong baseline / verify controls**
Proceed only after high-consequence controls are evidenced.

**70–84 · Deploy with controls**
Deployment may proceed within a constrained permission envelope after material gaps are remediated.

**50–69 · Do not expand yet**
Keep authority and scope narrow until weak dimensions improve.

**0–49 · Do not deploy yet**
Use sandbox/draft-only operation until baseline control exists.

These are internal DΩP decision-support bands, not external standards.

---

# Deployment recommendation

Use one of:

- **Deployable after verification**
- **Deploy with controls**
- **Do not expand yet**
- **Do not deploy yet**

Every recommendation must include:
- evidence relied on;
- assumptions;
- unresolved issues;
- top three controls;
- retest condition.

---

# Assurance Receipt

The receipt is a compact institutional-memory artefact.

Minimum fields:
- receipt ID;
- methodology version;
- organisation;
- agent/workflow;
- business owner;
- technical owner;
- assessment date;
- purpose;
- model/provider;
- connected systems;
- permission envelope summary;
- prohibited actions;
- human approvals;
- logging state;
- stop/revocation state;
- incident owner;
- readiness scores;
- deployment recommendation;
- priority remediation;
- evidence confidence;
- unresolved assumptions;
- next review/retest date.

Never label the receipt a certification unless an independently governed certification scheme is later established.

---

# Customer-success verification

A Sprint is successful only if the customer can answer:

1. What is our biggest agent-control risk?
2. What are the first three things we must fix?
3. Who owns those fixes?
4. What evidence will show that each fix works?
5. What can the agent do after remediation that it should not be allowed to do today?

---

# Commercial expansion

After the founding Sprint, offer recurring assurance only when there is genuine change worth monitoring:
- new agents;
- new tools;
- new permissions;
- model/provider changes;
- new sensitive data;
- new external integrations;
- incidents;
- significant control changes.

Recurring product direction:
**DΩP Assurance Monitor**
- inventory;
- permission drift;
- control drift;
- incident timeline;
- Human Authority;
- evidence ledger;
- retest reminders;
- executive Assurance Receipt history.

Build software from observed customer repetition, not speculation.
