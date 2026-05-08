# Enterprise Master Map

This page consolidates the domain research into one cross-domain Mermaid map.

## Scope

- The map preserves graph edges instead of collapsing everything into hierarchy.
- The map focuses on cross-domain links already supported by the research pages.
- Vendor products are treated as abstraction surfaces, not as the ontology itself.

## Mermaid Diagram

```mermaid
flowchart TD
    mission[Mission]
    vision[Vision]
    strategy[Strategy]
    operating_model[Operating Model]
    business_capability[Business Capability]
    value_stream[Value Stream]
    portfolio_management[Portfolio Management]
    product_management[Product Management]
    enterprise_architecture[Enterprise Architecture]
    governance[Governance]
    security[Security]
    infrastructure[Infrastructure]
    platform_engineering[Platform Engineering]
    idp[Internal Developer Platform]
    sdlc[SDLC]
    devops[DevOps]
    itsm[ITSM]
    agile[Agile]
    cognitive_system[Cognitive System]
    decision_interface[Decision Interface]
    execution_system[Execution System]

    mission -->|informs| vision
    vision -->|constrains| strategy
    strategy -->|operationalizes| operating_model
    strategy -->|funds| portfolio_management
    strategy -->|funds| business_capability
    operating_model -->|enables| business_capability
    business_capability -->|enables| value_stream
    portfolio_management -->|funds| product_management
    product_management -->|operationalizes| value_stream
    enterprise_architecture -->|cross_cuts| operating_model
    enterprise_architecture -->|cross_cuts| product_management
    governance -->|cross_cuts| portfolio_management
    governance -->|cross_cuts| sdlc
    governance -->|cross_cuts| infrastructure
    security -->|cross_cuts| sdlc
    security -->|cross_cuts| devops
    security -->|cross_cuts| infrastructure
    platform_engineering -->|operationalizes| infrastructure
    platform_engineering -->|cross_cuts| devops
    platform_engineering -->|cross_cuts| governance
    idp -->|supports| sdlc
    idp -->|supports| governance
    idp -->|supports| infrastructure
    agile -->|cross_cuts| sdlc
    devops -->|cross_cuts| sdlc
    itsm -->|cross_cuts| devops
    cognitive_system -->|cross_cuts| strategy
    cognitive_system -->|cross_cuts| enterprise_architecture
    cognitive_system -->|operationalizes| decision_interface
    decision_interface -->|governs| execution_system
    execution_system -->|cross_cuts| sdlc
    execution_system -->|cross_cuts| itsm
```

## Cross-Domain Reading Order

1. Mission, strategy, and operating model set intent and allocation logic.
2. Capability, value stream, portfolio, and product nodes translate intent into delivery ownership and flow.
3. Architecture, governance, security, and platform nodes cross-cut delivery rather than sit beneath it.
4. SDLC, DevOps, ITSM, and Agile shape how work moves and how change is controlled.
5. The cognitive loop explains how enterprise knowledge becomes action and how action revises the model.

## Related Notes

- [Enterprise foundations](../01-foundations/enterprise-foundations.md)
- [Enterprise architecture](../02-architecture/enterprise-architecture.md)
- [Governance graph](../03-governance/governance-graph.md)
- [Portfolio, product, and program relationships](../04-portfolio-product-program/portfolio-product-program.md)
- [ALM, SDLC, and DevOps](../05-lifecycle/alm-sdlc-devops.md)
- [Agile and delivery methodologies](../06-methodologies/agile-scrum-kanban-safe.md)
- [ITSM and ITIL](../07-itsm/itsm-itil.md)
- [Platform and infrastructure](../08-platform/platform-infrastructure.md)
- [Security cross-cutting layer](../09-security/security-cross-cutting.md)
- [Unified semantic relationship model](../13-model/unified-semantic-relationship-model.md)
- [Knowledge, action, and revision loop](../14-cognitive-execution-loop/knowledge-action-loop.md)