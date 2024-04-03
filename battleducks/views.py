from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.http import HttpResponse
from django.utils import timezone
from django.utils.crypto import get_random_string
from battleducks.models import Game

import json

# Create your views here.
ALLOWED_ROOM_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
ROOM_CODE_LENGTH = 4

@login_required
def index(request):
    ed = request.user.social_auth.get(provider='google-oauth2').extra_data
    profile_pic = ed['picture']
    return render(request, "battleducks/index.html", {'extra_data': ed, 'profile_pic': profile_pic})

def login(request):
    return render(request, "battleducks/login.html")

@login_required
def room(request, room_name):
    return render(request, "battleducks/room.html", {"room_name": room_name})

@login_required
def duck_placement(request, room_name, user_id):
    context = {
        "room_name": room_name,
        "user_id": user_id, 
    }
    return render(request, "battleducks/duck_placement.html", context)

@login_required
def create_room(request):
    if request.method != 'POST':
        return _my_json_error_response("You must use a POST request for this operation", status=405)

    invalid_code = True
    while (invalid_code):
        room_code = get_random_string(length=ROOM_CODE_LENGTH, allowed_chars=ALLOWED_ROOM_CHARS)
        invalid_code = Game.objects.filter(room_code = room_code).exists()

    # Create new Game
    game = Game(
        player1 = request.user,
        room_code = room_code,
        creation_time = timezone.now()
    )
    game.save()

    my_response = {'room_code': room_code}
    response_json = json.dumps(my_response)

    return HttpResponse(response_json, content_type='application/json')

def _my_json_error_response(message, status=200):
    # You can create your JSON by constructing the string representation yourself (or just use json.dumps)
    response_json = '{"error": "' + message + '"}'
    return HttpResponse(response_json, content_type='application/json', status=status)