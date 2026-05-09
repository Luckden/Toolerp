# Platform and Infrastructure

This page separates dependency substrate from platform abstraction.

## Ontology Nodes

### Infrastructure

- concept_type: technical platform abstraction
- abstraction_layer: infrastructure layer
- semantic_role: compute, network, storage, runtime, and environmental dependency substrate
- confidence: high
- status: strongly established

### Platform Engineering

- concept_type: operating model
- abstraction_layer: cross-cutting layer, infrastructure layer, engineering layer
- semantic_role: internal platform product and operating model that standardizes delivery paths and self-service capabilities
- confidence: high
- status: strongly established

### Internal Developer Platform

- concept_type: technical platform abstraction
- abstraction_layer: cross-cutting layer, infrastructure layer, engineering layer
- semantic_role: abstraction layer that unifies developer workflows, golden paths, controls, and tooling
- confidence: high
- status: industry convention

## Semantic Edges

- infrastructure -> depends_on -> cloud, hardware, runtime, network
- platform_engineering -> enables -> developer self-service
- platform_engineering -> operationalizes -> standardization and paved roads
- platform_engineering -> operationalizes -> internal developer platform
- internal_developer_platform -> supports -> SDLC
- internal_developer_platform -> supports -> governance automation
- internal_developer_platform -> supports -> infrastructure abstraction
- platform_engineering -> cross_cuts -> DevOps
- platform_engineering -> cross_cuts -> governance

## Competing Interpretations

- Practitioner convention: platform engineering is both a product discipline and an operating model.
- Vendor convention: cloud platforms often rebrand infrastructure services as a platform layer.
- Academic and community convention: internal developer platforms are socio-technical abstractions, not just tooling stacks.

## Historical Evolution

- Infrastructure began as the base dependency layer for compute and connectivity.
- Cloud computing abstracted infrastructure provisioning.
- Platform engineering emerged to reduce cognitive load and standardize delivery across teams.
- Internal developer portals and platforms emerged to unify catalogs, templates, docs, and service ownership.

## Vendor Abstraction Distortion

- Backstage presents itself as a developer portal framework, but functionally it often becomes the front door to an internal platform graph.
- Cloud vendors blur runtime, infrastructure, identity, and policy into one platform surface.
- This can make platform engineering appear to be a tool installation when it is actually an organizational and operational design choice.

## Graph Fragment

```yaml
nodes:
  - id: infrastructure
    concept_type: technical_platform_abstraction
    layer: infrastructure
  - id: platform_engineering
    concept_type: operating_model
    layer: cross_cutting
  - id: idp
    concept_type: technical_platform_abstraction
    layer: cross_cutting
edges:
  - from: platform_engineering
    to: idp
    type: operationalizes
  - from: idp
    to: sdlc
    type: supports
  - from: idp
    to: governance
    type: supports
  - from: idp
    to: infrastructure
    type: supports
```

## Mermaid Diagram

```mermaid
flowchart TD
  infrastructure[Infrastructure]
  platform_engineering[Platform Engineering]
  idp[Internal Developer Platform]
  cloud[Cloud]
  hardware[Hardware]
  runtime[Runtime]
  network[Network]
  sdlc[SDLC]
  governance[Governance]
  infrastructure_abstraction[Infrastructure Abstraction]
  developer_self_service[Developer Self-Service]
  standardization[Paved Roads and Standardization]
  devops[DevOps]

  infrastructure -->|depends_on| cloud
  infrastructure -->|depends_on| hardware
  infrastructure -->|depends_on| runtime
  infrastructure -->|depends_on| network
  platform_engineering -->|enables| developer_self_service
  platform_engineering -->|operationalizes| standardization
  idp -->|supports| sdlc
  idp -->|supports| governance
  idp -->|supports| infrastructure_abstraction
  platform_engineering -->|cross_cuts| devops
  platform_engineering -->|cross_cuts| governance
  platform_engineering -->|operationalizes| idp
  idp -->|supports| infrastructure
```

## Reconstructed Claim

- Infrastructure is the dependency substrate.
- Platform engineering is the operating model that turns infrastructure into a usable internal platform surface.
- Internal developer platforms are the cross-cutting delivery interface over infrastructure, controls, and workflow.

Related notes:

- [Portfolio, product, and program relationships](../04-portfolio-product-program/portfolio-product-program.md)
- [Vendor ecosystem mapping](../10-vendors/vendor-ecosystem.md)
- [Enterprise master map](../15-master-map/enterprise-master-map.md)