import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.shortcuts import render, redirect, get_object_or_404
from battleducks.models import Game, Player, InGameDuck, Duck
from django.contrib.auth.models import User

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"game_{self.room_name}"

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, **kwargs):
        if 'text_data' not in kwargs:
            self.send_error('you must send text_data')
            return

        try:
            data = json.loads(kwargs['text_data'])
        except json.JSONDecoder:
            self.send_error('invalid JSON sent to server')
            return

        if 'action' not in data:
            self.send_error('action property not sent in JSON')
            return

        action = data['action']

        if action == 'shoot':
            cell_x = data["cell_x"]
            cell_y = data["cell_y"]
            shooter_user_id = int(data['user_id'])

            room_name = self.room_group_name.split('_')[1]
            shot = self.shooting_by(room_name, shooter_user_id, cell_x, cell_y)
            if self.check_game_winner(room_name, shooter_user_id):
                room_name = room_name.upper()
                game = get_object_or_404(Game, room_code=room_name)
                
                if game.player1.id == shooter_user_id:
                    user = game.player1
                else:
                    user = game.player2

                name = user.first_name + " " + user.last_name
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        "type": "announcement",
                        "winner": name,
                        "sender_channel_name": self.channel_name,
                    }
                )
                return

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    "type": "shoot_duck",
                    "cell_x": cell_x,
                    "cell_y": cell_y,
                    "hit": "yes" if shot else "no",
                    "sender_channel_name": self.channel_name,
                }
            )
            return

        if action == 'chat':
            message = data["message"]
            user_first_name= data["user_first_name"]
            user_last_name = data["user_last_name"]
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name, {"type": "chat_message", "message": message, "user_first_name": user_first_name, "user_last_name": user_last_name}
            )
            return

        self.send_error(f'Invalid action property: "{action}"')


    # # Receive message from room group
    def chat_message(self, event):
        message = event["message"]
        user_first_name = event["user_first_name"]
        user_last_name = event["user_last_name"]
        # Send message to WebSocket
        self.send(text_data=json.dumps({"eventType": "chat", "message": message, "user_first_name": user_first_name, "user_last_name": user_last_name}))

    def shoot_duck(self, event):
        # send to everyone else than the sender
        if self.channel_name != event['sender_channel_name']:
            cell_x = event["cell_x"]
            cell_y = event["cell_y"]
            hit = event["hit"]

            # Send message to WebSocket
            self.send(text_data=json.dumps({"eventType": "shoot", "cell_x": cell_x, "cell_y": cell_y, "hit": hit}))
    
    def announcement(self, event):
        # Send message to WebSocket
        self.send(text_data=json.dumps({"eventType": "announcement", "winner": event["winner"]}))


    def send_error(self, error_message):
        self.send(text_data=json.dumps({'error': error_message}))
    
    def shooting_by(self, room_name, user_id, x, y):
        room_name = room_name.upper()
        game = get_object_or_404(Game, room_code=room_name)
        
        if game.player1.id == user_id:
            opponent = game.player2
        else:
            opponent = game.player1

        ducks = InGameDuck.objects.filter(game=game, owner=opponent)

        for duck in ducks:
            orientation = duck.orientation
            x_ref = duck.x
            y_ref = duck.y

            if orientation == InGameDuck.DuckOrientation.NORTH or InGameDuck.DuckOrientation.SOUTH:
                height, width = duck.duck.height, duck.duck.width
            else:
                height, width = duck.duck.width, duck.duck.height
            
            if x_ref <= x < x_ref+width and y_ref <= y < y_ref+height:
                duck.status = InGameDuck.DuckStatus.DEAD
                duck.save()
                return True
        
        return False
    
    def check_game_winner(self, room_name, user_id):
        room_name = room_name.upper()
        game = get_object_or_404(Game, room_code=room_name)

        # If the game is already over, there's no need to check here.
        if game.game_phase == Game.GamePhase.END:
            return True
        
        if game.player1.id == user_id:
            winner = Player.objects.get(user=game.player1)
            opponent = game.player2
        else:
            winner = Player.objects.get(user=game.player2)
            opponent = game.player1


        ducks = InGameDuck.objects.filter(game=game, owner=opponent)
        print([duck.status == InGameDuck.DuckStatus.DEAD for duck in ducks])
        all_dead = all(duck.status == InGameDuck.DuckStatus.DEAD for duck in ducks)

        # If all ducks are dead, the winner has actually won, update game state and player scores
        if all_dead:
            game.game_phase = Game.GamePhase.END
            winner.wins += 1
            opponent = Player.objects.get(user=opponent)
            opponent.losses += 1
            game.save()
            winner.save()
            opponent.save()

        return all_dead