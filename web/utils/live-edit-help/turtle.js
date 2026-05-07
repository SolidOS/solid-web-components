export const turtleHelp = {
  title: 'Turtle RDF Reference',
  sections: [
    {
      heading: 'Prefixes',
      items: [
        {
          title: 'Declare Namespaces',
          description: 'Bind short prefixes to long URI namespaces.',
          code: `@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n@prefix foaf: <http://xmlns.com/foaf/0.1/> .\n@prefix :     <http://example.org/> .`
        }
      ]
    },
    {
      heading: 'Triples',
      items: [
        {
          title: 'Subject · Predicate · Object',
          description: 'Each statement has three parts ending with a period.',
          code: `:amara foaf:name "Amara Okafor" .\n:amara foaf:knows :kenji .`
        },
        {
          title: 'Type shortcut',
          description: '`a` is shorthand for `rdf:type`.',
          code: `:amara a foaf:Person .`
        },
        {
          title: 'Multiple predicates (;)',
          description: 'Semicolons share the same subject.',
          code: `:amara a foaf:Person ;\n    foaf:name "Amara Okafor" ;\n    foaf:location "Lagos, Nigeria" .`
        },
        {
          title: 'Multiple objects (,)',
          description: 'Commas share subject and predicate.',
          code: `:amara foaf:knows :kenji, :priya, :layla .`
        }
      ]
    },
    {
      heading: 'Literals',
      items: [
        {
          title: 'Plain string',
          description: 'Text in double quotes.',
          code: `:amara foaf:name "Amara Okafor" .`
        },
        {
          title: 'Language tag',
          description: 'Attach a BCP-47 language code.',
          code: `:amara rdfs:label "Amara Okafor"@en .\n:amara rdfs:label "アマラ・オカフォー"@ja .`
        },
        {
          title: 'Typed literal',
          description: 'Attach an XSD datatype.',
          code: `:amara foaf:age "31"^^xsd:integer .\n:amara schema:birthDate "1993-04-12"^^xsd:date .`
        }
      ]
    },
    {
      heading: 'Common Vocabularies',
      items: [
        {
          title: 'FOAF',
          description: 'Describing people and social links.',
          code: `@prefix foaf: <http://xmlns.com/foaf/0.1/> .\n\n:kenji a foaf:Person ;\n    foaf:name "Kenji Watanabe" ;\n    foaf:mbox <mailto:kenji@example.org> ;\n    foaf:knows :priya .`
        },
        {
          title: 'Schema.org',
          description: 'Rich metadata for people, places, events.',
          code: `@prefix schema: <https://schema.org/> .\n\n:layla a schema:Person ;\n    schema:name "Layla Al-Hassan" ;\n    schema:jobTitle "Data Scientist" ;\n    schema:addressLocality "Amman" ;\n    schema:addressCountry "JO" .`
        }
      ]
    },
    {
      heading: 'Blank Nodes',
      items: [
        {
          title: 'Anonymous resources',
          description: 'Resources without a URI, using [ ] syntax.',
          code: `:abebe foaf:knows [\n    a foaf:Person ;\n    foaf:name "Yewande Adebayo"\n] .`
        }
      ]
    }
  ]
};
