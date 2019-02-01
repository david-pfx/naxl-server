// Master field list (table of fields)

// Child of table

module.exports = {
    id: 'field',
    name: 'field',
    namePlural: 'fields',
    active: true,
    label: 'Field master',
    table: 'field',
    fields: [
        {
            id: 'name', type: 'text', 
            label: 'Unique name', maxLength: 50,
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
            id: 'type', type: 'text',
            label: 'Type',
            required: true, inMany: true,
            width: 20,
        },
        {
            id: 'lovtable', type: 'text', 
            label: 'LOV table name', maxLength: 50,
            inMany: true,
            width: 20,
        },
        {
            id: 'required', type: 'boolean', 
            label: 'Required',
            inMany: true,
            width: 10,
        },
        {
            id: 'inMany', type: 'boolean', 
            label: 'In many',
            inMany: true,
            width: 10,
        },
		{
			id: "table_id", type: "lov",
			entity: "table",
			lovtable: "table",
			label: "Table",
			inMany: true,
            width: 10,
		},
    ]
};
