export const mermaidHelp = {
  title: 'Mermaid Diagram Reference',
  sections: [
    {
      heading: 'Flowchart',
      items: [
        { title: 'Direction', description: 'TD (top-down), LR (left-right), BT, RL.', code: `graph LR\n    A[Start] --> B[Process] --> C[End]` },
        { title: 'Node shapes', description: 'Rectangles, rounded, diamonds, circles.', code: `graph TD\n    A[Rectangle]\n    B(Rounded)\n    C{Diamond}\n    D((Circle))\n    A --> B --> C --> D` },
        { title: 'Labels on edges', description: 'Add text to arrows.', code: `graph LR\n    Lagos -->|sends PR| Mumbai\n    Mumbai -->|approves| Jakarta` }
      ]
    },
    {
      heading: 'Sequence Diagram',
      items: [
        {
          title: 'Participants and messages',
          description: 'Model interactions between named actors.',
          code: `sequenceDiagram\n    participant D as Diego (Mexico)\n    participant A as Amara (Nigeria)\n    D->>A: Pull-request review?\n    A-->>D: Approved ✓`
        },
        {
          title: 'Loops and alternatives',
          description: 'Control flow in sequences.',
          code: `sequenceDiagram\n    loop Daily standup\n        Priya->>Nadia: Status?\n        Nadia-->>Priya: On track\n    end`
        }
      ]
    },
    {
      heading: 'Class Diagram',
      items: [
        {
          title: 'Classes and relationships',
          description: 'UML-style class diagram.',
          code: `classDiagram\n    class Person {\n        +String name\n        +String location\n        +connect(other)\n    }\n    Person <|-- Engineer\n    Person <|-- Designer`
        }
      ]
    },
    {
      heading: 'Gantt Chart',
      items: [
        {
          title: 'Project timeline',
          description: 'Tasks with start and duration.',
          code: `gantt\n    title Q2 Roadmap\n    dateFormat YYYY-MM-DD\n    section Lagos team\n    Feature A :a1, 2024-04-01, 14d\n    section Mumbai team\n    Feature B :2024-04-08, 21d`
        }
      ]
    }
  ]
};
