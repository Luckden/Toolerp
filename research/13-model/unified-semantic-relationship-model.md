# Unified Semantic Relationship Model

This is the current machine-friendly model for the enterprise meta-model.

## Schema Rules

- Every concept must declare its concept_type.
- Every concept must declare its primary abstraction_layer.
- Every concept must declare its edge semantics instead of relying on implied nesting.
- Every major claim should carry a confidence marker.
- Competing interpretations should be preserved instead of averaged away.

## Node Types

- intent: mission, vision, strategy, goals
- structure: org units, capabilities, value streams, products, platforms
- governance: policy, risk, compliance, review boards, audit
- lifecycle: ALM, SDLC, DevOps, ITSM, delivery methods
- technology: applications, infrastructure, runtime, identity, observability
- vendor: GitHub, GitLab, Azure DevOps, ServiceNow, Backstage
- cognitive-control: observation, framing, abstraction, inference, design, decision interface, feedback, revision

## Edge Types

- governs
- funds
- enables
- executes
- depends_on
- cross_cuts
- lifecycle_for
- methodology_for
- constrained_by
- platform_for
- operationalizes
- automates
- audits
- secures
- monitors
- supports
- implementation_of

## Concept Card Template

```yaml
concept: example_concept
concept_type: lifecycle | governance_model | operating_model | methodology | framework | capability | architecture_domain | organizational_function | cultural_philosophy | technical_platform_abstraction | execution_process | management_discipline
abstraction_layer: strategic | governance | portfolio | product | engineering | operational | infrastructure | organizational | cross_cutting
semantic_edges:
  governs: []
  enables: []
  executes: []
  cross_cuts: []
  constrains: []
  operationalizes: []
  automates: []
  funds: []
  audits: []
  depends_on: []
  methodology_for: []
  lifecycle_for: []
  implementation_of: []
competing_interpretations: []
historical_origin: ""
vendor_distortion: []
confidence: high | medium | low
status: strongly established | industry convention | vendor convention | disputed
```

## Draft Graph

```yaml
nodes:
  - id: enterprise
    type: system
  - id: mission
    type: intent
  - id: strategy
    type: intent
  - id: operating_model
    type: structure
  - id: capability
    type: structure
  - id: value_stream
    type: structure
  - id: governance
    type: governance
  - id: devops
    type: lifecycle
  - id: sdlc
    type: lifecycle
  - id: platform_engineering
    type: technology
  - id: zero_trust
    type: governance
edges:
  - from: mission
    to: strategy
    type: informs
  - from: strategy
    to: operating_model
    type: operationalizes
  - from: operating_model
    to: capability
    type: allocates
  - from: capability
    to: value_stream
    type: enables
  - from: governance
    to: sdlc
    type: cross_cuts
  - from: governance
    to: devops
    type: cross_cuts
  - from: platform_engineering
    to: sdlc
    type: enables
  - from: platform_engineering
    to: governance
    type: automates
  - from: zero_trust
    to: enterprise
    type: cross_cuts
  - from: agile
    to: sdlc
    type: methodology_for
  - from: scrum
    to: agile
    type: implementation_of
  - from: itsm
    to: operations
    type: governs
  - from: platform_engineering
    to: devops
    type: enables
  - from: security
    to: sdlc
    type: cross_cuts
  - from: security
    to: devops
    type: cross_cuts
  - from: cognitive_system
    to: decision_interface
    type: operationalizes
  - from: decision_interface
    to: execution_system
    type: governs
  - from: execution_system
    to: revision
    type: enables
  - from: revision
    to: cognitive_system
    type: cross_cuts
  - from: timeboxing
    to: cognitive_system
    type: constrains
  - from: minimal_viable_test
    to: execution_system
    type: constrains
```

## Mermaid Diagram

```mermaid
flowchart TD
    enterprise[Enterprise]
    mission[Mission]
    strategy[Strategy]
    operating_model[Operating Model]
    capability[Capability]
    value_stream[Value Stream]
    governance[Governance]
    sdlc[SDLC]
    devops[DevOps]
    platform_engineering[Platform Engineering]
    zero_trust[Zero Trust]
    agile[Agile]
    scrum[Scrum]
    itsm[ITSM]
    operations[Operations]
    security[Security]
    cognitive_system[Cognitive System]
    decision_interface[Decision Interface]
    execution_system[Execution System]
    revision[Revision]
    timeboxing[Timeboxing]
    minimal_viable_test[Minimal Viable Test]

    mission -->|informs| strategy
    strategy -->|operationalizes| operating_model
    operating_model -->|allocates| capability
    capability -->|enables| value_stream
    governance -->|cross_cuts| sdlc
    governance -->|cross_cuts| devops
    platform_engineering -->|enables| sdlc
    platform_engineering -->|automates| governance
    zero_trust -->|cross_cuts| enterprise
    agile -->|methodology_for| sdlc
    scrum -->|implementation_of| agile
    itsm -->|governs| operations
    platform_engineering -->|enables| devops
    security -->|cross_cuts| sdlc
    security -->|cross_cuts| devops
    cognitive_system -->|operationalizes| decision_interface
    decision_interface -->|governs| execution_system
    execution_system -->|enables| revision
    revision -->|cross_cuts| cognitive_system
    timeboxing -->|constrains| cognitive_system
    minimal_viable_test -->|constrains| execution_system
```

## Cross-Domain Master Map

- [Enterprise master map](../15-master-map/enterprise-master-map.md)

## Current conclusion

- The enterprise is best modeled as a hybrid of graph and layers.
- Trees are useful for ownership or reporting views, but they are not sufficient as the master model.
- The model must preserve semantic edge types, not merely containment.
- The enterprise graph also requires a cognitive-execution loop so that model formation, decision compression, action, and revision are represented as first-class control structures.