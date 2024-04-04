import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

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
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    "type": "shoot_duck",
                    "cell_x": cell_x,
                    "cell_y": cell_y,
                    "sender_channel_name": self.channel_name
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

            # Send message to WebSocket
            self.send(text_data=json.dumps({"eventType": "shoot", "cell_x": cell_x, "cell_y": cell_y}))


    def send_error(self, error_message):
        self.send(text_data=json.dumps({'error': error_message}))