module.exports = {
    id: 'table',
    active: true,
    label: 'Master table',
    fields: [
        {
            id: 'name', type: 'text', 
            label: 'Name', maxLength: 50,
            required: true, inMany: true
        },
        {
            id: 'kind', type: 'lov',   // s/b type entity
            label: 'Kind',
            lovtable: 'table_kind',
            required: true, inMany: true,
            list: [
                {id: 1, text: "Entity"},
                {id: 2, text: "List"},
                {id: 3, text: "Child"},
            ], 
        },
        {
            id: 'table', type: 'text',   // s/b type entity
            label: 'Table', maxLength: 50,
            required: true, inMany: true
        },
        {
            id: 'description', type: 'textmultiline', 
            label: 'Description', inMany: true
        },
    ]
};
