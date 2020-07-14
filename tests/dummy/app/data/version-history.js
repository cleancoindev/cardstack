

import {
  PIA_MIDINA,
  FRANCESCO_MIDINA,
  JOEL_KAPLAN,
  MARIAH_SOLIS,
  IAN_ADAMS,
  JENNY_SPARKS,
  SOPHIA_LANAGAN,
  HELEN_GELLAR,
  ARTHUR_DOYLE
} from './profiles';

const MUSICAL_WORK = {
  "type": "card",
  "component": "cards/musical-work-embedded",
  "value": {
    "artist": "Pia Midina",
    "artist_id": "pia-midina",
    "composer": "Miles Ponia",
    "composer_id": "miles-ponia",
    "copyright_notice": "© 2020 RealTunes Publishing",
    "iswc": "T-030248890-1",
    "publisher": "RealTunes Publishing",
    "title": "The leaves are changing color",
    "type": "musical-work",
    "verifi_id": "0x1b8932b7c27d6ca5d8bd3201fa7c28071221165dc2f1b4528c22e2809d8923ba",
    "version_type": "Original work"
  }
};

export default [
  {
    "id": "the-leaves-are-changing-color",
    "title": "The Leaves Are Changing Color",
    "versions": [
      {
        "id": 1,
        "record_id": "the-leaves-are-changing-color",
        "published": "2020-01-16T13:30:00",
        "description": "Recorded",
        "card_model": {
          "id": "the-leaves-are-changing-color",
          "song_title": "Leaves Are Changing Color",
          "artist": "Pia Midina",
          "verifi_id": "0x9b2138a6c17e6da2d9cd3303fe7b26079231184ac2f1b6537a11e2301b74ca26",
          "fields": {
            "title": "Leaves Are Changing Color",
            "version_type": "Recording",
            "artists": {
              "type": "collection",
              "component": "cards/artist",
              "value": [ PIA_MIDINA ]
            },
            "genre": ["Alternative", "Dream Pop"],
            "album_art": null,
            "label": "Bunny Records",
            "copyright_notice": "℗ 2020 Bunny Records",
            "parental_advisory": "No",
            "musical_work": MUSICAL_WORK,
            "isrc": "US-S1Z-20-05001",
            "year": "2020",
            "length": "3:23"
          }
        }
      },
      {
        "id": 2,
        "published": "2020-02-17T05:15:00",
        "record_id": "the-leaves-are-changing-color",
        "description": "2020 release confirmed",
        "card_model": {
          "id": "the-leaves-are-changing-color",
          "song_title": "Leaves Are Changing Color",
          "artist": "Pia Midina",
          "verifi_id": "0x9b2138a6c17e6da2d9cd3303fe7b26079231184ac2f1b6537a11e2301b74ca26",
          "fields": {
            "title": "Leaves Are Changing Color",
            "version_type": "Recording",
            "artists": {
              "type": "collection",
              "component": "cards/artist",
              "value": [
                PIA_MIDINA,
                JENNY_SPARKS
              ]
            },
            "genre": ["Alternative", "Dream Pop"],
            "album_art": null,
            "release_date": "2020",
            "label": "Bunny Records",
            "copyright_notice": "℗ 2020 Bunny Records",
            "parental_advisory": "No",
            "musical_work": MUSICAL_WORK,
            "isrc": "US-S1Z-20-05001",
            "year": "2020",
            "length": "3:23"
          }
        }
      },
      {
        "id": 3,
        "published": "2020-02-21T11:14:00",
        "record_id": "the-leaves-are-changing-color",
        "description": "Updated based on credible rumor",
        "card_model": {
          "id": "the-leaves-are-changing-color",
          "song_title": "Fall Is Back",
          "artist": "Pia Midina",
          "verifi_id": "0x9b2138a6c17e6da2d9cd3303fe7b26079231184ac2f1b6537a11e2301b74ca26",
          "cover_art": "media-registry/old-album-art.png",
          "cover_art_thumb": "media-registry/old-album-art.png",
          "cover_art_medium": "media-registry/old-album-art.png",
          "cover_art_large": "media-registry/old-album-art.png",
          "fields": {
            "title": "Fall Is Back",
            "version_type": "Recording",
            "artists": {
              "type": "collection",
              "component": "cards/artist",
              "value": [
                PIA_MIDINA,
                JENNY_SPARKS,
                ARTHUR_DOYLE
              ]
            },
            "genre": ["Alternative", "Dream Pop"],
            "album_art": "media-registry/old-album-art.png",
            "release_date": "2020",
            "label": "Bunny Records",
            "copyright_notice": "℗ 2020 Bunny Records",
            "parental_advisory": "No",
            "musical_work": MUSICAL_WORK,
            "isrc": "US-S1Z-20-05001",
            "year": "2020",
            "length": "3:23"
          }
        }
      },
      {
        "id": 4,
        "published": "2020-02-25T13:06:00",
        "record_id": "the-leaves-are-changing-color",
        "description": "Official announcement",
        "card_model": {
          "id": "the-leaves-are-changing-color",
          "song_title": "The Leaves Are Changing Color",
          "artist": "Pia Midina",
          "verifi_id": "0x9b2138a6c17e6da2d9cd3303fe7b26079231184ac2f1b6537a11e2301b74ca26",
          "cover_art": "media-registry/covers/Autumn-Leaves.jpg",
          "cover_art_thumb": "media-registry/covers/thumb/Autumn-Leaves.jpg",
          "cover_art_medium": "media-registry/covers/medium/Autumn-Leaves.jpg",
          "cover_art_large": "media-registry/covers/large/Autumn-Leaves.jpg",
          "fields": {
            "title": "The Leaves Are Changing Color",
            "version_type": "Recording",
            "artists": {
              "type": "collection",
              "component": "cards/artist",
              "value": [
                PIA_MIDINA,
                JENNY_SPARKS
              ]
            },
            "genre": ["Alternative", "Dream Pop"],
            "album_art": "media-registry/covers/medium/Autumn-Leaves.jpg",
            "release_date": "2020",
            "label": "Bunny Records",
            "copyright_notice": "℗ 2020 Bunny Records",
            "parental_advisory": "No",
            "musical_work": MUSICAL_WORK,
            "isrc": "US-S1Z-20-05001",
            "year": "2020",
            "length": "3:23"
          }
        }
      },
      {
        "id": 5,
        "published": "2020-04-16T10:22:00",
        "record_id": "the-leaves-are-changing-color",
        "description": "Retail stores’ sales figures released",
        "card_model": {
          "id": "the-leaves-are-changing-color",
          "song_title": "The Leaves Are Changing Color",
          "artist": "Pia Midina",
          "verifi_id": "0x9b2138a6c17e6da2d9cd3303fe7b26079231184ac2f1b6537a11e2301b74ca26",
          "cover_art": "media-registry/covers/Autumn-Leaves.jpg",
          "cover_art_thumb": "media-registry/covers/thumb/Autumn-Leaves.jpg",
          "cover_art_medium": "media-registry/covers/medium/Autumn-Leaves.jpg",
          "cover_art_large": "media-registry/covers/large/Autumn-Leaves.jpg",
          "fields": {
            "title": "The Leaves Are Changing Color",
            "version_type": "Recording",
            "artists": {
              "type": "collection",
              "component": "cards/artist",
              "value": [
                PIA_MIDINA,
                JENNY_SPARKS,
                SOPHIA_LANAGAN,
                HELEN_GELLAR
              ]
            },
            "genre": ["Alternative", "Dream Pop"],
            "sales": {
              "type": "card",
              "value": {
                "type": "revenue-data",
                "fields": [
                  {
                    "title": "United States",
                    "value": "$117M"
                  },
                  {
                    "title": "International",
                    "value": "$250M"
                  },
                  {
                    "title": "Total",
                    "value": "$367M"
                  }
                ]
              }
            },
            "album_art": "media-registry/covers/medium/Autumn-Leaves.jpg",
            "release_date": {
              "type": "collection",
              "value": [{
                "type": "schedule",
                "id": "release_date",
                "title": "Release Date",
                "description": "March 2, 2020"
              }]
            },
            "label": "Bunny Records",
            "copyright_notice": "℗ 2020 Bunny Records",
            "parental_advisory": "No",
            "musical_work": MUSICAL_WORK,
            "isrc": "US-S1Z-20-05001",
            "year": "2020",
            "length": "3:23"
          }
        }
      },
      {
        "id": 6,
        "published": "2020-05-04T19:32:00",
        "record_id": "the-leaves-are-changing-color",
        "description": "Digital download available worldwide",
        "card_model": {
          "id": "the-leaves-are-changing-color",
          "song_title": "The Leaves Are Changing Color",
          "artist": "Pia Midina",
          "verifi_id": "0x9b2138a6c17e6da2d9cd3303fe7b26079231184ac2f1b6537a11e2301b74ca26",
          "cover_art": "media-registry/covers/Autumn-Leaves.jpg",
          "cover_art_thumb": "media-registry/covers/thumb/Autumn-Leaves.jpg",
          "cover_art_medium": "media-registry/covers/medium/Autumn-Leaves.jpg",
          "cover_art_large": "media-registry/covers/large/Autumn-Leaves.jpg",
          "fields": {
            "title": "The Leaves Are Changing Color",
            "alternate_title": "Colorful Leaves",
            "version_type": "Recording",
            "artists": {
              "type": "collection",
              "component": "cards/artist",
              "value": [
                PIA_MIDINA,
                FRANCESCO_MIDINA,
                JOEL_KAPLAN,
                MARIAH_SOLIS,
                IAN_ADAMS,
                JENNY_SPARKS,
                SOPHIA_LANAGAN,
                HELEN_GELLAR
              ]
            },
            "genre": ["Alternative", "Dream Pop"],
            "sales": {
              "type": "card",
              "value": {
                "type": "revenue-data",
                "fields": [
                  {
                    "title": "United States",
                    "value": "$118M"
                  },
                  {
                    "title": "International",
                    "value": "$251M"
                  },
                  {
                    "title": "Total",
                    "value": "$369M"
                  }
                ]
              }
            },
            "album_art": "media-registry/covers/medium/Autumn-Leaves.jpg",
            "release_date": {
              "type": "collection",
              "value": [
                {
                  "type": "schedule",
                  "id": "release_date",
                  "title": "Release Date",
                  "description": "March 2, 2020"
                },
                {
                  "type": "schedule",
                  "id": "digital_download",
                  "title": "Digital Download",
                  "description": "May 4, 2020"
                }
              ]
            },
            "label": "Bunny Records",
            "copyright_notice": "℗ 2020 Bunny Records",
            "parental_advisory": "No",
            "musical_work": MUSICAL_WORK,
            "isrc": "US-S1Z-20-05001",
            "year": "2020",
            "length": "3:23"
          }
        }
      }
    ]
  }
]
