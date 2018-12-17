module.exports = {
    id: 'lov',
    name: 'value',
    namePlural: 'values',
    label: 'List of Values',
    icon: 'lov.gif',
    titleField: 'text',
    description: 'Contains an entry for every entity or values table', 
    fields: [
        {
            id: 'id', 
            type: 'integer', 
            label: 'Code', 
            description: 'Integer code to be replaced by text', 
            required: true,
            width: 25, 
            inMany: true
        },
        {
          id: 'text', 
          type: 'text', 
          label: 'Text', 
          description: 'Expansion text', 
          required: true,
          width: 50, 
          inMany: true
      },
      {
        id: 'icon', 
        type: 'text', 
        label: 'Icon', 
        description: 'Icon for expansion text', 
        required: true,
        width: 25, 
        inMany: true
    }
]
};
