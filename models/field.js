module.exports = {
    id: 'field',
    name: 'field',
    active: true,
    label: 'Field master',
    fields: [
        {
            id: 'name', type: 'text', 
            label: 'Name', maxLength: 50,
            required: true, inMany: true,
            width: 20,
        },
        {
            id: 'type', type: 'text',
            label: 'Type',
            required: true, inMany: true,
            width: 20,
        },
        {
            id: 'lovtable', type: 'text', 
            label: 'LOV table name', maxLength: 50,
            required: true, inMany: true,
            width: 20,
        },
        {
            id: 'label', type: 'text', 
            label: 'Label', maxLength: 50,
            required: true, inMany: true,
            width: 20,
        },
        {
            id: 'required', type: 'boolean', 
            label: 'Required',
            required: true, inMany: true,
            width: 10,
        },
        {
            id: 'inMany', type: 'boolean', 
            label: 'In many',
            required: true, inMany: true,
            width: 10,
        },
    ]
};
