export const csvHelp = {
  title: 'CSV Format Reference',
  sections: [
    {
      heading: 'Basic Format',
      items: [
        {
          title: 'Header Row + Data',
          description: 'First row is the header; each subsequent row is a record.',
          code: `Name,City,Country\nAmara Okafor,Lagos,Nigeria\nKenji Watanabe,Osaka,Japan\nCatalina Ruiz,Bogotá,Colombia`
        },
        {
          title: 'Quoted Fields',
          description: 'Wrap fields in double-quotes if they contain commas, newlines, or quotes.',
          code: `Name,Note\n"Okafor, Amara","Senior engineer; leads the platform team"\n"Nguyen, Thien","Quote: ""ship it"""`
        }
      ]
    },
    {
      heading: 'Delimiters',
      items: [
        { title: 'Comma (,)', description: 'Standard CSV.', code: `City,Country\nNairobi,Kenya\nMumbai,India` },
        { title: 'Semicolon (;)', description: 'Common in European locales.', code: `City;Country\nBogotá;Colombia\nAmman;Jordan` },
        { title: 'Tab (TSV)', description: 'Tab-separated values.', code: "City\tCountry\nAddis Ababa\tEthiopia\nSeoul\tSouth Korea" },
        { title: 'Pipe (|)', description: 'Alternative delimiter.', code: `City|Country\nJakarta|Indonesia\nLagos|Nigeria` }
      ]
    },
    {
      heading: 'Special Cases',
      items: [
        {
          title: 'Embedded Quotes',
          description: 'Escape a quote inside a quoted field by doubling it.',
          code: `Title,Quote\nBook,"She said, ""Hello!"""`
        },
        {
          title: 'Empty Fields',
          description: 'Adjacent delimiters produce empty values.',
          code: `First,Middle,Last\nAmara,,Okafor\nSoo-Jin,,Park`
        },
        {
          title: 'Numeric Data',
          description: 'Pure-number columns get statistical analysis automatically.',
          code: `Product,Units,Price\nWax print fabric,120,8.50\nKente cloth,45,22.00\nBatik sarong,80,14.75`
        }
      ]
    },
    {
      heading: 'Statistics Panel',
      items: [
        {
          title: 'Numeric Columns',
          description: 'Shows min, max, mean, median, and sum.',
          code: `Score,Grade\n88,B+\n94,A\n76,C+\n91,A-`
        },
        {
          title: 'Text Columns',
          description: 'Shows unique-value count and most-common value.',
          code: `Region,Office\nAfrica,Lagos\nAsia,Mumbai\nAfrica,Nairobi\nAsia,Seoul`
        }
      ]
    }
  ]
};
