export const jsonldHelp = {
  title: 'JSON-LD Reference',
  sections: [
    {
      heading: 'Core Keywords',
      items: [
        {
          title: '@context',
          description: 'Maps short keys to full URIs.',
          code: `{\n  "@context": {\n    "name": "http://xmlns.com/foaf/0.1/name",\n    "Person": "http://xmlns.com/foaf/0.1/Person"\n  }\n}`
        },
        {
          title: '@id and @type',
          description: 'Identify the resource and its RDF type.',
          code: `{\n  "@id": "http://example.org/people/abebe",\n  "@type": "foaf:Person",\n  "name": "Abebe Girma"\n}`
        },
        {
          title: '@graph',
          description: 'Array of multiple resources in one document.',
          code: `{\n  "@context": {"name": "foaf:name"},\n  "@graph": [\n    {"@id": ":catalina", "name": "Catalina Ruiz"},\n    {"@id": ":soo-jin",  "name": "Soo-Jin Park"}\n  ]\n}`
        }
      ]
    },
    {
      heading: 'Linking Resources',
      items: [
        {
          title: 'Object reference',
          description: 'Link to another resource by @id.',
          code: `{\n  "@id": ":catalina",\n  "knows": {"@id": ":soo-jin"}\n}`
        },
        {
          title: 'Array of references',
          description: 'Multiple values with @type: @id in context.',
          code: `{\n  "@context": {\n    "knows": {"@id":"foaf:knows","@type":"@id"}\n  },\n  "@id": ":nadia",\n  "knows": [":catalina", ":layla"]\n}`
        }
      ]
    },
    {
      heading: 'Typed Values',
      items: [
        {
          title: 'Language-tagged strings',
          description: 'Use @language in a value object.',
          code: `{\n  "name": {"@value": "Kenji Watanabe", "@language": "en"},\n  "altName": {"@value": "渡辺健二", "@language": "ja"}\n}`
        },
        {
          title: 'Typed literals',
          description: 'Attach an XSD type to a value.',
          code: `{\n  "age": {"@value": "29", "@type": "xsd:integer"},\n  "joined": {"@value": "2021-03-15", "@type": "xsd:date"}\n}`
        }
      ]
    }
  ]
};
