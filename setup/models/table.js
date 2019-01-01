module.exports = {
    id: 'table',
    name: 'table',
    namePlural: 'tables',
    label: 'Master table',
    icon: 'table.gif',
    titleField: 'label',
    description: 'Contains an entry for every entity or values table', 
    fields: [
        {
            id: 'label', 
            type: 'text', 
            label: 'Label', 
            description: 'Displayed name for entire table', 
            maxLength: 50,
            required: true,
            width: 20, 
            inMany: true
        },
        {
            id: 'name', 
            type: 'text', 
            label: 'Name', 
            description: 'Displayed name for single item', 
            maxLength: 50,
            required: true,
            width: 20, 
            inMany: true
        },
        {
            id: 'namePlural', 
            type: 'text', 
            label: 'Plural name', 
            description: 'Displayed name for multiple items', 
            maxLength: 50,
            required: true,
            width: 20, 
            inMany: true
        },
        {
            id: 'kind', 
            type: 'lov',
            label: 'Kind',
            description: 'Kind of table, entity or values', 
            required: true, 
            width: 20, 
            inMany: true,
            list: [
                {id: 1, text: "Entity"},
                {id: 2, text: "List"},
                {id: 3, text: "Child"},
            ], 
        },
        {
            id: 'titleField', 
            type: 'text', 
            label: 'Title field', 
            description: 'Displayed name for editing or browsing an item', 
            maxLength: 50,
            required: true,
            width: 20, 
            inMany: true
        },
        {
            id: 'icon', 
            type: 'text', 
            label: 'Icon', 
            description: 'File name for icon representing table', 
            maxLength: 50,
            required: true,
            width: 20, 
            inMany: true
        },
        {
            id: 'table', 
            type: 'text',   // s/b type entity
            label: 'Table', 
            description: 'Name used to open table', 
            maxLength: 50,
            required: true, 
            width: 20, 
            inMany: true
        },
        {
            id: 'description', 
            type: 'textmultiline', 
            label: 'Description', 
            description: 'Text describing purpose of table', 
            width: 40, 
            inMany: true
        },
    ]
};
