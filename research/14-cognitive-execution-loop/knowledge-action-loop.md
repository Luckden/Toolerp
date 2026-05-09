# Knowledge, Action, and Revision Loop

This page models the thinking-doing system as a recursive enterprise control loop rather than as a linear lifecycle.

## Structural Separation

The model separates two coupled systems and one bridge artifact.

### Cognitive System

- concept_type: operating model
- abstraction_layer: cross-cutting layer, strategic layer, engineering layer
- semantic_role: uncertainty reduction, problem ontology formation, model construction, and decision compression
- confidence: high
- status: strongly established

### Execution System

- concept_type: operating model
- abstraction_layer: engineering layer, operational layer
- semantic_role: empirical testing, implementation, deployment, and measurement against expectation
- confidence: high
- status: strongly established

### Decision Interface

- concept_type: execution process
- abstraction_layer: cross-cutting layer
- semantic_role: translation artifact that moves a cognitive model into executable form
- confidence: high
- status: industry convention

## Cognitive System Subnodes

The subnodes below are an explanatory decomposition of the cognitive system.
For cross-page linking, the canonical external edges should attach to `cognitive_system`, `execution_system`, and `decision_interface` unless finer-grained control is explicitly required.

### Observation

- concept_type: execution process
- abstraction_layer: cross-cutting layer
- semantic_role: intake of signals, anomalies, facts, and constraints

### Framing

- concept_type: execution process
- abstraction_layer: strategic layer, cross-cutting layer
- semantic_role: problem boundary setting and ontology clarification

### Abstraction

- concept_type: execution process
- abstraction_layer: strategic layer, engineering layer
- semantic_role: representation building for causal, structural, or semantic models

### Inference

- concept_type: execution process
- abstraction_layer: strategic layer, engineering layer
- semantic_role: reasoning from models to implications and decision options

### Design

- concept_type: execution process
- abstraction_layer: engineering layer, product layer
- semantic_role: candidate intervention design before implementation

## Execution System Subnodes

### Planning

- concept_type: execution process
- abstraction_layer: engineering layer, operational layer
- semantic_role: smallest meaningful test definition

### Building

- concept_type: execution process
- abstraction_layer: engineering layer
- semantic_role: implementation of the selected intervention

### Testing

- concept_type: execution process
- abstraction_layer: engineering layer, operational layer
- semantic_role: validation against explicit prediction

### Deployment

- concept_type: execution process
- abstraction_layer: operational layer
- semantic_role: real-world execution under live conditions

### Measurement

- concept_type: capability
- abstraction_layer: operational layer, cross-cutting layer
- semantic_role: feedback capture and comparison to predicted outcomes

## Bridge Artifact

The Decision Interface is the only valid bridge between thinking and doing.

### Required Fields

- hypothesis
- prediction
- confidence_level
- test_design
- falsification_or_validation_rule
- cost_of_being_wrong
- reversibility_class

## Semantic Edges

### Core loop

- observation -> enables -> framing
- framing -> operationalizes -> abstraction
- abstraction -> enables -> inference
- inference -> enables -> design
- design -> operationalizes -> decision_interface
- decision_interface -> governs -> planning
- planning -> enables -> building
- building -> enables -> testing
- testing -> enables -> deployment
- deployment -> enables -> measurement
- measurement -> enables -> revision
- revision -> cross_cuts -> cognitive_system

### Control edges

- timeboxing -> constrains -> cognitive_system
- minimal_viable_test -> constrains -> execution_system
- reversibility_classification -> governs -> decision_interface
- error_accounting -> audits -> loop_performance

### Enterprise edges

- cognitive_system -> cross_cuts -> strategy
- cognitive_system -> cross_cuts -> architecture
- execution_system -> cross_cuts -> SDLC
- execution_system -> cross_cuts -> operations
- decision_interface -> supports -> governance evidence
- decision_interface -> supports -> product decision making

## Competing Interpretations

- Academic convention: the loop is often framed as inquiry, rational deliberation, or epistemic revision.
- Practitioner convention: the loop is framed as experiment design, delivery iteration, and learning loops.
- Vendor distortion: tools often collapse thinking artifacts and execution artifacts into the same work-item abstraction.
- Method conflict: some frameworks imply direct thinking-to-doing transition and omit the bridge artifact entirely.

## Historical Evolution

- Scientific inquiry contributed observation, hypothesis, falsification, and revision logic.
- Military and operational command systems contributed fast orient-decide-act control loops.
- Product and software delivery systems contributed experimentation, MVP, and incremental rollout disciplines.
- Modern developer platforms blurred the distinction between reasoning artifact, ticket, design, and execution object.

## Philosophical Mapping

- epistemology -> model building and uncertainty reduction
- praxeology -> execution and intervention
- falsificationism -> test design and revision triggers
- bounded rationality -> timeboxing and satisficing under uncertainty

## Deep Structural Claim

- The system is not linear thinking -> doing.
- The system is oscillatory: thinking for compression, doing for expansion, thinking for correction.
- High-performing enterprises institutionalize this oscillation with explicit control points.

## Graph Fragment

```yaml
nodes:
  - id: cognitive_system
    concept_type: operating_model
    layer: cross_cutting
  - id: execution_system
    concept_type: operating_model
    layer: operational
  - id: decision_interface
    concept_type: execution_process
    layer: cross_cutting
  - id: timeboxing
    concept_type: governance_model
    layer: governance
  - id: minimal_viable_test
    concept_type: execution_process
    layer: engineering
edges:
  - from: cognitive_system
    to: decision_interface
    type: operationalizes
  - from: decision_interface
    to: execution_system
    type: governs
  - from: execution_system
    to: cognitive_system
    type: enables
  - from: timeboxing
    to: cognitive_system
    type: constrains
  - from: minimal_viable_test
    to: execution_system
    type: constrains
```

  ## Mermaid Diagram

  ```mermaid
  flowchart LR
    subgraph cognitive[Cognitive System]
      observation[Observation]
      framing[Framing]
      abstraction[Abstraction]
      inference[Inference]
      design[Design]
    end

    decision_interface[Decision Interface]

    subgraph execution[Execution System]
      planning[Planning]
      building[Building]
      testing[Testing]
      deployment[Deployment]
      measurement[Measurement]
      revision[Revision]
    end

    timeboxing[Timeboxing]
    minimal_viable_test[Minimal Viable Test]
    strategy[Strategy]
    architecture[Architecture]
    sdlc[SDLC]
    operations[Operations]
    governance_evidence[Governance Evidence]
    product_decision_making[Product Decision Making]

    observation -->|enables| framing
    framing -->|operationalizes| abstraction
    abstraction -->|enables| inference
    inference -->|enables| design
    design -->|operationalizes| decision_interface
    decision_interface -->|governs| planning
    planning -->|enables| building
    building -->|enables| testing
    testing -->|enables| deployment
    deployment -->|enables| measurement
    measurement -->|enables| revision
    revision -->|cross_cuts| observation
    timeboxing -->|constrains| framing
    minimal_viable_test -->|constrains| planning
    observation -->|cross_cuts| strategy
    inference -->|cross_cuts| architecture
    planning -->|cross_cuts| sdlc
    deployment -->|cross_cuts| operations
    decision_interface -->|supports| governance_evidence
    decision_interface -->|supports| product_decision_making
  ```

## Confidence and Ambiguity

- Strong claim: thinking and doing should be modeled as coupled but separate systems.
- Strong claim: a bridge artifact is needed to prevent blind execution and endless theorizing.
- Medium-confidence claim: the Decision Interface should be treated as the single permitted translation boundary.
- Disputed claim: different disciplines prefer different loop names and control granularity, even when the structure is equivalent.

## Operational Encoding

- research_note -> operationalizes -> hypothesis block
- design_doc -> implementation_of -> decision interface
- task -> implementation_of -> minimal viable test
- result_log -> implementation_of -> observation and measurement
- review -> implementation_of -> revision

## Reconstructed Claim

- Enterprises do not just need lifecycle and governance graphs.
- They also need a cognitive-execution control loop that governs how knowledge becomes action and how action revises knowledge.
- This loop is universal enough to bridge science, software delivery, product organizations, and operational command systems.

Related notes:

- [Unified semantic relationship model](../13-model/unified-semantic-relationship-model.md)
- [ALM, SDLC, and DevOps](../05-lifecycle/alm-sdlc-devops.md)
- [Enterprise master map](../15-master-map/enterprise-master-map.md)