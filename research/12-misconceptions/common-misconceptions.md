# Common Misconceptions

This section restates common errors as graph-model failures.

## Misconception Nodes

### Everything is a tree

- correction: hierarchy is only one edge family among many
- confidence: high
- status: strongly established

### One model explains all behavior

- correction: enterprises require multiple views over a shared semantic graph
- confidence: high
- status: strongly established

### Vendor platform equals architecture

- correction: a platform is a partial operational abstraction, not the ontology itself
- confidence: high
- status: strongly established

### Agile replaces lifecycle

- correction: Agile modifies work coordination and feedback, not the existence of lifecycle states
- confidence: high
- status: strongly established

### Security belongs in one box

- correction: security cross-cuts governance, lifecycle, operations, and infrastructure simultaneously
- confidence: high
- status: strongly established

## Mermaid Diagram

```mermaid
flowchart TD
	one_diagram_grammar[One Diagram Grammar Applied Everywhere]
	enterprise_confusion[Enterprise Confusion]
	everything_tree[Everything Is a Tree]
	shared_graph[Shared Semantic Graph]
	one_model[One Model Explains All Behavior]
	multiple_views[Multiple Views over One Graph]
	vendor_equals_architecture[Vendor Platform Equals Architecture]
	partial_abstraction[Partial Operational Abstraction]
	agile_replaces_lifecycle[Agile Replaces Lifecycle]
	lifecycle_states[Lifecycle States Still Exist]
	security_one_box[Security Belongs in One Box]
	security_cross_cutting[Security Cross-Cuts Governance, Delivery, Operations, and Infrastructure]

	one_diagram_grammar -->|causes| enterprise_confusion
	everything_tree -->|corrected_by| shared_graph
	one_model -->|corrected_by| multiple_views
	vendor_equals_architecture -->|corrected_by| partial_abstraction
	agile_replaces_lifecycle -->|corrected_by| lifecycle_states
	security_one_box -->|corrected_by| security_cross_cutting
	shared_graph -->|reduces| enterprise_confusion
	multiple_views -->|reduces| enterprise_confusion
	partial_abstraction -->|reduces| enterprise_confusion
	lifecycle_states -->|reduces| enterprise_confusion
	security_cross_cutting -->|reduces| enterprise_confusion
```

## Reconstructed Claim

- Most enterprise confusion comes from mapping one diagram grammar onto several different relationship systems.

Related notes:

- [Areas of industry disagreement](../11-disagreement/industry-disagreement.md)
- [Vendor ecosystem mapping](../10-vendors/vendor-ecosystem.md)
- [Unified semantic relationship model](../13-model/unified-semantic-relationship-model.md)