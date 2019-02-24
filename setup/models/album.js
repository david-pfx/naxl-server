/*
  Evolutility UI Model for Albums
  https://github.com/evoluteur/evolutility-ui-react
*/

module.exports = {
	"id": "album",
	"title": "Albums",
	"name": "album",
	"namePlural": "albums",
    "icon": "cd.png",
	"titleField": "name",
	"table": "music_album",
	"fields": [
		{
			"id": "title",
			"type": "text",
			"label": "Title",
			"required": true,
			"inMany": true,
			"width": 62,
			"height": 1
		},
		{
			"id": "url",
			"type": "url",
			"label": "Amazon"
		},
		{
			"id": "artist",
			"type": "lov",
			"label": "Artist",
			"object": "artist",
			"required": true,
			"inMany": true,
			"width": 38,
			"height": 1,
			"lovtable": "music_artist",
			"lovcolumn": "name"
		},
		{
			"id": "description",
			"type": "textmultiline",
			"label": "Description",
			"maxLength": 1000,
			"inMany": false
		},
		{
			"id": "cover",
			"type": "image",
			"label": "Album Cover",
			"inMany": true,
			"width": 100
		}
	],
	"groups": [
		{
			"id": "p-album",
			"type": "panel",
			"label": "Album",
			"table": "music_album",
			"column": "album_id",
			"width": 70,
			"fields": [
				"title",
				"artist",
				"url",
				"description"
			]
		},
		{
			"id": "p-cover",
			"type": "panel",
			"label": "Cover",
			"width": 30,
			"fields": [
				"cover"
			]
		}
	],
	"collections": [
		{
			"id": "music_track",
			"table": "music_track",
			"column": "album",
			//"column": "album_id",
			"object": "track",
			"order": "name",
			"fields": [
				{
					"id": "name",
					"type": "text",
					"label": "Track",
					"inMany": true
				},
				{
					"id": "genre",
					"type": "lov",
					"label": "Genre"
				},
				{
					"id": "length",
					"type": "text",
					"label": "Length",
					"inMany": true
				}
			]
		}
	]
}