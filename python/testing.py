import json

import cherrypy

from python.game.enums import Direction, Tile
from python.game.Game import Game
from python.game.Snake import Snake

PUBLIC_ENUMS = {
    'Direction': Direction,
    'Tile': Tile,
}


class EnumEncoder(json.JSONEncoder):
    def default(self, obj):
        if type(obj) in PUBLIC_ENUMS.values():
            return obj.value
        return json.JSONEncoder.default(self, obj)


import cherrypy_cors

game = Game()


class BattlesnakeGame(object):
    @cherrypy.expose
    @cherrypy.tools.json_out()
    def index(self):
        cherrypy_cors.preflight(allowed_methods=['GET', 'POST'])
        if cherrypy.request.method == "OPTIONS":
            return {}
        game.snakes.append(Snake("1"))
        game.snakes.append(Snake("2"))
        game.create_initial_board_state()
        game.display()
        return {
            "board": json.loads(json.dumps(game.board, cls=EnumEncoder))
        }

    @cherrypy.expose
    @cherrypy.tools.json_out()
    def next(self):
        if cherrypy.request.method == "OPTIONS":
            return {}
        cherrypy_cors.preflight(allowed_methods=['GET', 'POST'])
        game.create_next_board_state({"1": Direction.UP, "2": Direction.LEFT})
        game.display()
        return {
            "board": json.loads(json.dumps(game.board, cls=EnumEncoder))
        }


if __name__ == "__main__":
    server = BattlesnakeGame()
    cherrypy_cors.install()
    cherrypy.config.update({
        'server.socket_host': '127.0.0.1',
        'server.socket_port': 8080,
        'cors.expose.on': True,
        'autoreload.on': False
    })

    cherrypy.quickstart(server)
