/*
  Evolutility UI Model for Test List
  https://github.com/evoluteur/evolutility-ui-react
*/
var lov = [
	{
		"id": 1,
		"text": "Vanilla"
	},
	{
		"id": 2,
		"text": "Chocolate"
	},
	{
		"id": 3,
		"text": "Strawberry"
	},
	{
		"id": 4,
		"text": "Green Tea"
	},
	{
		"id": 5,
		"text": "Lemon Cookie"
	}
]
var fields = [
	{
		"id": "name",
		"type": "text",
		"label": "Title",
		"required": true,
		"inMany": true,
		"width": 100,
		"help": "Name of the object"
	},
	{
		"id": "text",
		"type": "text",
		"label": "Text",
		"inMany": true,
		"width": 50
	},
	{
		"id": "textmultiline",
		"type": "textmultiline",
		"label": "Text multiline",
		"width": 50,
		"height": 3
	},
	{
		"id": "lov",
		"type": "lov",
		"label": "List of Values",
		"required": true,
		"list": lov,
		"inMany": true,
		"width": 100
	},
	{
		"id": "parent",
		"type": "lov",
		"label": "Parent",
		"object": "test",
		"required": true,
		"inMany": true,
		"width": 100,
		"help": "LOV "
	},
	{
		"id": "lovlc",
		"type": "lov",
		"label": "Lemon Cookie",
		"list": lov,
		"defaultValue": 5,
		"width": 100,
		"help": "List of Values with \"Lemon Cookie\" as default value."
	},
	{
		"id": "date",
		"type": "date",
		"label": "Date",
		"required": true,
		"inMany": true,
		"width": 100
	},
	{
		"id": "datetime",
		"type": "datetime",
		"label": "Date-Time",
		"inMany": true,
		"width": 100,
		"help": "Date and time as a single field (not implemented yet)."
	},
	{
		"id": "time",
		"type": "time",
		"label": "Time",
		"inMany": true,
		"width": 100,
		"help": "Time field (not implemented yet)."
	},
	{
		"id": "integer",
		"type": "integer",
		"label": "Integer",
		"required": true,
		"inMany": true,
		"width": 100
	},
	{
		"id": "decimal",
		"type": "decimal",
		"label": "Decimal",
		"width": 100
	},
	{
		"id": "money",
		"type": "money",
		"label": "Money",
		"width": 100
	},
	{
		"id": "boolean",
		"type": "boolean",
		"label": "Boolean",
		"inMany": true,
		"width": 100
	},
	{
		"id": "email",
		"type": "email",
		"label": "email",
		"inMany": true,
		"width": 50
	},
	{
		"id": "url",
		"type": "url",
		"label": "url",
		"width": 50
	},
	{
		"id": "document",
		"type": "document",
		"label": "Document",
		"width": 100
	},
	{
		"id": "image",
		"type": "image",
		"label": "Image",
		"inMany": true,
		"width": 100
	},
	{
		"id": "content",
		"type": "content",
		"label": "Content",
		"inMany": true,
	}
]

module.exports = {
	"id": "test",
	"label": "Test Data",
	"name": "test",
	"namePlural": "tests",
	"icon": "test.gif",
	"titleField": "name",
	"fields": fields,
	"groups": [
		{
			"id": "ptxt",
			"type": "panel",
			"label": "Text",
			"width": 62,
			"fields": [
				"name",
				"text",
				"textmultiline",
				"email",
				"url"
			]
		},
		{
			"id": "plist",
			"type": "panel",
			"label": "List of Values",
			"width": 38,
			"fields": [
				"parent",
				"lov",
				"lovlc"
			]
		},
		{
			"id": "pnum",
			"type": "panel",
			"label": "Numbers",
			"width": 31,
			"fields": [
				"integer",
				"decimal",
				"money",
				"boolean"
			]
		},
		{
			"id": "pdate",
			"type": "panel",
			"label": "Date & Time",
			"width": 31,
			"fields": [
				"date",
				"datetime",
				"time"
			]
		},
		{
			"id": "ppix",
			"type": "panel",
			"label": "Image & Document",
			"width": 38,
			"fields": [
				"image",
				"document"
			]
		}
	],
	"collections": [
		{
			"id": "children",
			"title": "Children",
			"object": "test",
			"fields": fields.slice(0, 3)
		}
	]
}