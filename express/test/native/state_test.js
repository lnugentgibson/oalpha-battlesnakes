const {
  expect
} = require('chai');

const lib = require("../../snakes/native.js");
let { NState } = lib;

describe('NState', function() {
  describe('case 1', function() {
    var input = {
      "game": {
        "id": "0e1dda42-5a0d-4345-9b8b-5769c2f5a2d0",
        "ruleset": {
          "name": "standard",
          "version": "v1.0.17"
        },
        "timeout": 500
      },
      "turn": 0,
      "board": {
        "height": 11,
        "width": 11,
        "snakes": [{
            "id": "gs_CTx6bkkMKG8xXhxKmrJRKPBB",
            "name": "jörmungandr",
            "latency": "",
            "health": 100,
            "body": [{
                "x": 1,
                "y": 1
              },
              {
                "x": 1,
                "y": 1
              },
              {
                "x": 1,
                "y": 1
              }
            ],
            "head": {
              "x": 1,
              "y": 1
            },
            "length": 3,
            "shout": ""
          },
          {
            "id": "gs_xSMJKFD69SjMW6Qhv84r8Xm8",
            "name": "Medusa",
            "latency": "",
            "health": 100,
            "body": [{
                "x": 9,
                "y": 5
              },
              {
                "x": 9,
                "y": 5
              },
              {
                "x": 9,
                "y": 5
              }
            ],
            "head": {
              "x": 9,
              "y": 5
            },
            "length": 3,
            "shout": ""
          }
        ],
        "food": [{
            "x": 0,
            "y": 0
          },
          {
            "x": 8,
            "y": 4
          },
          {
            "x": 5,
            "y": 5
          }
        ],
        "hazards": []
      },
      "you": {
        "id": "gs_xSMJKFD69SjMW6Qhv84r8Xm8",
        "name": "Medusa",
        "latency": "",
        "health": 100,
        "body": [{
            "x": 9,
            "y": 5
          },
          {
            "x": 9,
            "y": 5
          },
          {
            "x": 9,
            "y": 5
          }
        ],
        "head": {
          "x": 9,
          "y": 5
        },
        "length": 3,
        "shout": ""
      }
    };
    var state;
    var json;
    beforeEach(function() {
      state = new NState(input);
      json = state.toJSON();
    });
    it('should have the correct id', function() {
      expect(json.id).to.equal(input.game.id);
    });
    it('should have the correct turn', function() {
      expect(json.turn).to.equal(input.turn);
    });
    it('should have the correct width', function() {
      expect(json.board.width).to.equal(input.board.width);
    });
    it('should have the correct height', function() {
      expect(json.board.height).to.equal(input.board.height);
    });
    it('should have the correct amount of food', function() {
      expect(json.board.food.length).to.equal(input.board.food.length);
      expect(Object.keys(json.board.foodIndex).length).to.equal(input.board.food.length);
    });
    it('should have food in the correct places', function() {
      input.board.food.forEach((f, i) => {
        var index = f.y * input.board.width + f.x;
        expect(json.board.food[i].x).to.equal(f.x);
        expect(json.board.food[i].y).to.equal(f.y);
        expect(json.board.foodIndex[index]).to.equal(1);
      });
    });
    it('should have the correct number of hazards', function() {
      expect(json.board.hazards.length).to.equal(input.board.hazards.length);
      expect(Object.keys(json.board.hazardIndex).length).to.equal(input.board.hazards.length);
    });
    it('should have hazards in the correct places', function() {
      input.board.hazards.forEach((h, i) => {
        var index = h.y * input.board.width + h.x;
        expect(json.board.hazards[i].x).to.equal(h.x);
        expect(json.board.hazards[i].y).to.equal(h.y);
        expect(json.board.hazardIndex[index]).to.equal(1);
      });
    });
    it('should have the correct number of snakes', function() {
      expect(json.board.snakes.length).to.equal(input.board.snakes.length);
    });

    function testSnake(expected, you, i) {
      var actual;
      beforeEach(function() {
        actual = you ? json.you : json.board.snakes[i];
      });
      it('should have the correct id', function() {
        expect(actual.id).to.equal(expected.id);
      });
      it('should have the correct name', function() {
        expect(actual.name).to.equal(expected.name);
      });
      it('should have the correct health', function() {
        expect(actual.health).to.equal(expected.health);
      });
      it('should have the correct body length', function() {
        expect(actual.body.length).to.equal(expected.body.length);
      });
      it('should have hazards in the correct places', function() {
        expected.body.forEach((s, i) => {
          var index = s.y * input.board.width + s.x;
          expect(actual.body[i].x).to.equal(s.x);
          expect(actual.body[i].y).to.equal(s.y);
          expect(actual.bodyIndex[index]).to.equal(1);
        });
      });
    }
    input.board.snakes.forEach((snake, i) => {
      describe('snake-' + i, function() {
        testSnake(snake, false, i);
      });
    });
    describe('you', function() {
      testSnake(input.you, true, -1);
    });
  });
  describe('case 2', function() {
    var input = {
      "game": {
        "id": "00ae5eff-5a6a-4f95-843a-bbc74868029b",
        "ruleset": {
          "name": "royale",
          "version": "v1.0.17"
        },
        "timeout": 600
      },
      "turn": 27,
      "board": {
        "height": 11,
        "width": 11,
        "snakes": [{
            "id": "gs_twWqvB4xKmhMYWjCXpg6PDCf",
            "name": "Kevin Durcant",
            "latency": "37",
            "health": 95,
            "body": [{
                "x": 7,
                "y": 4
              },
              {
                "x": 7,
                "y": 5
              },
              {
                "x": 8,
                "y": 5
              },
              {
                "x": 9,
                "y": 5
              },
              {
                "x": 10,
                "y": 5
              },
              {
                "x": 10,
                "y": 4
              }
            ],
            "head": {
              "x": 7,
              "y": 4
            },
            "length": 6,
            "shout": "You can't guard me!"
          },
          {
            "id": "gs_KrwyGS9mcddvkxjWyCMBGDHc",
            "name": "Medusa",
            "latency": "50",
            "health": 75,
            "body": [{
                "x": 8,
                "y": 1
              },
              {
                "x": 7,
                "y": 1
              },
              {
                "x": 7,
                "y": 2
              },
              {
                "x": 8,
                "y": 2
              }
            ],
            "head": {
              "x": 8,
              "y": 1
            },
            "length": 4,
            "shout": "searching for food!"
          },
          {
            "id": "gs_wkhTfqKTGCMfHPDBtgT3dvMB",
            "name": "Living Knot",
            "latency": "191",
            "health": 69,
            "body": [{
                "x": 0,
                "y": 9
              },
              {
                "x": 0,
                "y": 10
              },
              {
                "x": 1,
                "y": 10
              },
              {
                "x": 2,
                "y": 10
              },
              {
                "x": 3,
                "y": 10
              },
              {
                "x": 4,
                "y": 10
              },
              {
                "x": 4,
                "y": 9
              }
            ],
            "head": {
              "x": 0,
              "y": 9
            },
            "length": 7,
            "shout": ""
          },
          {
            "id": "gs_F6WR7PDwCxjxV3SpCf9gqfh6",
            "name": "Becca Lyria",
            "latency": "22",
            "health": 77,
            "body": [{
                "x": 6,
                "y": 5
              },
              {
                "x": 6,
                "y": 6
              },
              {
                "x": 7,
                "y": 6
              },
              {
                "x": 7,
                "y": 7
              }
            ],
            "head": {
              "x": 6,
              "y": 5
            },
            "length": 4,
            "shout": ""
          }
        ],
        "food": [{
            "x": 1,
            "y": 4
          },
          {
            "x": 8,
            "y": 0
          }
        ],
        "hazards": [{
            "x": 0,
            "y": 0
          },
          {
            "x": 0,
            "y": 1
          },
          {
            "x": 0,
            "y": 2
          },
          {
            "x": 0,
            "y": 3
          },
          {
            "x": 0,
            "y": 4
          },
          {
            "x": 0,
            "y": 5
          },
          {
            "x": 0,
            "y": 6
          },
          {
            "x": 0,
            "y": 7
          },
          {
            "x": 0,
            "y": 8
          },
          {
            "x": 0,
            "y": 9
          },
          {
            "x": 0,
            "y": 10
          }
        ]
      },
      "you": {
        "id": "gs_KrwyGS9mcddvkxjWyCMBGDHc",
        "name": "Medusa",
        "latency": "50",
        "health": 75,
        "body": [{
            "x": 8,
            "y": 1
          },
          {
            "x": 7,
            "y": 1
          },
          {
            "x": 7,
            "y": 2
          },
          {
            "x": 8,
            "y": 2
          }
        ],
        "head": {
          "x": 8,
          "y": 1
        },
        "length": 4,
        "shout": "searching for food!"
      }
    };
    var state;
    var json;
    beforeEach(function() {
      state = new NState(input);
      json = state.toJSON();
    });
    it('should have the correct id', function() {
      expect(json.id).to.equal(input.game.id);
    });
    it('should have the correct turn', function() {
      expect(json.turn).to.equal(input.turn);
    });
    it('should have the correct width', function() {
      expect(json.board.width).to.equal(input.board.width);
    });
    it('should have the correct height', function() {
      expect(json.board.height).to.equal(input.board.height);
    });
    it('should have the correct amount of food', function() {
      expect(json.board.food.length).to.equal(input.board.food.length);
      expect(Object.keys(json.board.foodIndex).length).to.equal(input.board.food.length);
    });
    it('should have food in the correct places', function() {
      input.board.food.forEach((f, i) => {
        var index = f.y * input.board.width + f.x;
        expect(json.board.food[i].x).to.equal(f.x);
        expect(json.board.food[i].y).to.equal(f.y);
        expect(json.board.foodIndex[index]).to.equal(1);
      });
    });
    it('should have the correct number of hazards', function() {
      expect(json.board.hazards.length).to.equal(input.board.hazards.length);
      expect(Object.keys(json.board.hazardIndex).length).to.equal(input.board.hazards.length);
    });
    it('should have hazards in the correct places', function() {
      input.board.hazards.forEach((h, i) => {
        var index = h.y * input.board.width + h.x;
        expect(json.board.hazards[i].x).to.equal(h.x);
        expect(json.board.hazards[i].y).to.equal(h.y);
        expect(json.board.hazardIndex[index]).to.equal(1);
      });
    });
    it('should have the correct number of snakes', function() {
      expect(json.board.snakes.length).to.equal(input.board.snakes.length);
    });

    function testSnake(expected, you, i) {
      var actual;
      beforeEach(function() {
        actual = you ? json.you : json.board.snakes[i];
      });
      it('should have the correct id', function() {
        expect(actual.id).to.equal(expected.id);
      });
      it('should have the correct name', function() {
        expect(actual.name).to.equal(expected.name);
      });
      it('should have the correct health', function() {
        expect(actual.health).to.equal(expected.health);
      });
      it('should have the correct body length', function() {
        expect(actual.body.length).to.equal(expected.body.length);
      });
      it('should have hazards in the correct places', function() {
        expected.body.forEach((s, i) => {
          var index = s.y * input.board.width + s.x;
          expect(actual.body[i].x).to.equal(s.x);
          expect(actual.body[i].y).to.equal(s.y);
          expect(actual.bodyIndex[index]).to.equal(1);
        });
      });
    }
    input.board.snakes.forEach((snake, i) => {
      describe('snake-' + i, function() {
        testSnake(snake, false, i);
      });
    });
    describe('you', function() {
      testSnake(input.you, true, -1);
    });
  });
});
