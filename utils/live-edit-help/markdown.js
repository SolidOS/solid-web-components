export const markdownHelp = {
  title: 'Markdown Reference',
  sections: [
    {
      heading: 'Text Formatting',
      items: [
        { title: 'Emphasis', description: 'Italic, bold, or bold-italic text.', code: `*italic*  _also italic_\n**bold**  __also bold__\n***bold italic***` },
        { title: 'Inline Code', description: 'Short code spans.', code: 'Use `const x = 5;` inline.' },
        { title: 'Strikethrough', description: 'Cross out text.', code: '~~removed~~' }
      ]
    },
    {
      heading: 'Headings',
      items: [
        { title: 'ATX Style', description: '# symbols set heading level 1–6.', code: `# Heading 1\n## Heading 2\n### Heading 3` }
      ]
    },
    {
      heading: 'Lists',
      items: [
        { title: 'Unordered', description: '-, *, or + as bullet markers.', code: `- Amara Okafor — Lagos\n- Priya Sharma — Mumbai\n- Nadia Bintang — Jakarta` },
        { title: 'Ordered', description: 'Numbers followed by a period.', code: `1. First priority\n2. Second priority\n3. Third priority` },
        { title: 'Nested', description: 'Indent with two or four spaces.', code: `- Africa\n  - Nigeria\n  - Kenya\n- Asia\n  - India\n  - Japan` }
      ]
    },
    {
      heading: 'Links & Images',
      items: [
        { title: 'Link', description: 'Text in brackets, URL in parentheses.', code: `[Visit Example](https://example.com)` },
        { title: 'Image', description: 'Like a link but prefixed with !', code: `![Alt text](https://example.com/photo.png)` }
      ]
    },
    {
      heading: 'Blocks',
      items: [
        { title: 'Code Block', description: 'Fence with triple backticks, optionally with language.', code: '```python\nprint("مرحبا بالعالم")  # Arabic: Hello World\n```' },
        { title: 'Blockquote', description: 'Prefix lines with >.', code: `> "We are the ones we have been waiting for."\n> — June Jordan` },
        { title: 'Horizontal Rule', description: 'Three or more dashes on their own line.', code: `---` }
      ]
    },
    {
      heading: 'Tables',
      items: [
        {
          title: 'GFM Table',
          description: 'Pipes separate columns; the second row sets alignment.',
          code: `| Name | City | Role |\n|------|------|------|\n| Layla Al-Hassan | Amman | Data Scientist |\n| Thien Nguyen | Ho Chi Minh City | Engineer |`
        }
      ]
    }
  ]
};
