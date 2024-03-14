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
            cell = data["cell"]
            print("SHOOT " + cell)
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name, {"type": "shoot_duck", "cell": cell}
            )
            return

        if action == 'chat':
            message = data["message"]
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name, {"type": "chat_message", "message": message}
            )
            return

        self.send_error(f'Invalid action property: "{action}"')


    # # Receive message from room group
    def chat_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        self.send(text_data=json.dumps({"eventType": "chat", "message": message}))

    def shoot_duck(self, event):
        cell = event["cell"]

        # Send message to WebSocket
        self.send(text_data=json.dumps({"eventType": "shoot", "cell": cell}))


    def send_error(self, error_message):
        self.send(text_data=json.dumps({'error': error_message}))