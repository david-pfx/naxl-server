// Master table list (table of tables)

module.exports = {
    id: 'table',
    name: 'table',
    namePlural: 'tables',
    label: '$ Table Master',
    icon: 'table.gif',
    titleField: 'label',
    description: 'Contains an entry for every entity or values table', 
    table: 'table',
    fields: [
        {
            id: 'ident', 
            type: 'text', 
            label: 'Unique name', 
            description: 'Unique name for table', 
            maxLength: 20,
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
            id: 'label', 
            type: 'text', 
            label: 'Collection Name', 
            description: 'Displayed name for entire table', 
            maxLength: 30,
            required: true,
            width: 20, 
            inMany: true
        },
        {
            id: 'name', 
            type: 'text', 
            label: 'Item Name', 
            description: 'Displayed name for single item', 
            maxLength: 30,
            width: 20, 
            inMany: true
        },
        {
            id: 'namePlural', 
            type: 'text', 
            label: 'Items (plural) name', 
            description: 'Displayed name for multiple items', 
            maxLength: 30,
            width: 20, 
            inMany: true
        },
        {
            id: 'titleField', 
            type: 'text', 
            label: 'Title field', 
            description: 'Displayed name for editing or browsing an item', 
            maxLength: 50,
            width: 20, 
            inMany: true
        },
        {
            id: 'table', 
            type: 'text',   // s/b type entity
            label: 'Database table', 
            description: 'Name used to open table', 
            maxLength: 30,
            width: 20, 
            inMany: true
        },
        {
            id: 'icon', 
            type: 'image', 
            label: 'Icon', 
            description: 'Icon representing table', 
            width: 20, 
            inMany: true
        },
        {
            id: 'source', 
            type: 'content', 
            label: 'Source', 
            description: 'Source of data in table', 
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
        {
            id: 'searchFields', 
            type: 'json', 
            label: 'Search fields', 
            description: 'Fields for searching in table', 
            width: 40, 
            inMany: true
        },
        {
            id: 'fields', 
            type: 'json', 
            label: 'Content fields', 
            description: 'Fields for storing data', 
            width: 40, 
            inMany: false
        },
        {
            id: 'groups', 
            type: 'json', 
            label: 'Display groups', 
            description: 'Groups for displaying fields', 
            width: 40, 
            inMany: false
        },
    ],
    collections: [
        {
            id: 'fields',
            title: 'Content fields',
            table: 'field',
            column: 'table_id',
            object: 'field',
        }
    ],
};
