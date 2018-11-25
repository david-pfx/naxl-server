module.exports = {
    id: 'field',
    active: true,
    label: 'Field master',
    fields: [
        {
            id: 'name', type: 'text', 
            label: 'Name', maxLength: 50,
            required: true, inMany: true
        },
        {
            id: 'type', type: 'text',
            label: 'Type',
            required: true, inMany: true,
        },
        // {
        //     id: 'type', type: 'lov', lovtable: 'field_type',
        //     label: 'Type',
        //     required: true, inMany: true,
        //     list: [
        //         { id: 1, text: 'text' },
        //         { id: 2, text: 'textmultiline' },
        //         { id: 3, text: 'boolean' },
        //         { id: 4, text: 'integer' },
        //         { id: 5, text: 'decimal' },
        //         { id: 6, text: 'money' },
        //         { id: 7, text: 'date' },
        //         { id: 8, text: 'datetime' },
        //         { id: 9, text: 'time' },
        //         { id: 10, text: 'lov' },
        //         { id: 11, text: 'list' },
        //         { id: 12, text: 'html' },
        //         { id: 13, text:'formula' },
        //         { id: 14, text: 'email' },
        //         { id: 15, text: 'image' },
        //         { id: 16, text: 'url' },
        //         { id: 17, text: 'color' },
        //         { id: 18, text: 'hidden' },
        //         { id: 19, text: 'json' },
        //     ]
        // },
        {
            id: 'lovtable', type: 'text', 
            label: 'LOV table name', maxLength: 50,
            required: true, inMany: true
        },
        {
            id: 'label', type: 'text', 
            label: 'Label', maxLength: 50,
            required: true, inMany: true
        },
        {
            id: 'required', type: 'boolean', 
            label: 'Required',
            required: true, inMany: true
        },
        {
            id: 'inMany', type: 'boolean', 
            label: 'In many',
            required: true, inMany: true
        },
    ]
};
