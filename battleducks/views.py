from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.db.models import F
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, Http404, JsonResponse, HttpResponseNotAllowed
from django.urls import reverse
from django.utils import timezone
from django.utils.crypto import get_random_string
from battleducks.models import Game, Player, InGameDuck, Duck

import json

# Create your views here.
ALLOWED_ROOM_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
ROOM_CODE_LENGTH = 4

# DEBUG, this is for testing. Setting this value bypasses player syncronization
BYPASS_PLAYER_WAIT = False


@login_required
def index(request):
    context = get_user_info(request)
    return render(request, "battleducks/index.html", context)

def login(request):
    return render(request, "battleducks/login.html")

@login_required
def room(request, room_name):
    # Check that room exists
    room_name = room_name.upper()
    game = get_object_or_404(Game, room_code=room_name)
    context = {
        "room_name": room_name,
        "user_id": request.user.id, 
    }

    if game.game_phase == Game.GamePhase.LOBBY:
        # If the player is not in game
        if (
            BYPASS_PLAYER_WAIT or 
            request.user != game.player1 and request.user != game.player2
        ):
            # game is full
            if game.player2 != None:
                raise PermissionDenied()

            # this is the second player
            game.player2 = request.user
            game.save()
        
        return render(request, "battleducks/wait.html", {"state": "LOBBY", "room_code": room_name})

    if game.game_phase == Game.GamePhase.PLACEMENT:
        if didUserPlaceDucks(request.user, game):
            return render(request, "battleducks/wait.html", {"state": "PLACEMENT"})
        
        return render(request, "battleducks/place_ducks.html", context)
        
    
    if game.game_phase == Game.GamePhase.GUESS:
        return render(request, "battleducks/room.html", context)
    
    return HttpResponse('Game Over!')

def get_game_state(request, room_name):
    if request.method != 'GET':
        return Http404("Use get request get game state")
    
    room_name = room_name.upper()
    game = get_object_or_404(Game, room_code=room_name)

    if request.user != game.player1 and request.user != game.player2:
        raise PermissionDenied()

    # update game state
    if game.game_phase ==  Game.GamePhase.LOBBY:
        if (
            BYPASS_PLAYER_WAIT or 
            game.player2 != None 
        ):
            game.game_phase = Game.GamePhase.PLACEMENT
            game.save()
    elif game.game_phase == Game.GamePhase.PLACEMENT:
        if (
            (BYPASS_PLAYER_WAIT and (didUserPlaceDucks(game.player1, game) or didUserPlaceDucks(game.player2, game)))
            or (didUserPlaceDucks(game.player1, game) and didUserPlaceDucks(game.player2, game))
        ):
            game.game_phase = Game.GamePhase.GUESS
            game.save()
    
    # return game state
    if game.game_phase == Game.GamePhase.LOBBY:
        state = 'LOBBY'
    elif game.game_phase == Game.GamePhase.PLACEMENT:
        state = 'PLACEMENT'
    elif game.game_phase == Game.GamePhase.GUESS:
        state = 'GUESS'
    else:
        state = 'END'

    return JsonResponse({'state': state})

def save_ducks(request, room_name):
    room_name = room_name.upper()
    game = get_object_or_404(Game, room_code=room_name)
    if request.user != game.player1 and request.user != game.player2:
        raise PermissionDenied()
    
    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])
    
    if didUserPlaceDucks(request.user, game):
        return  HttpResponse("Ducks are already stored", status=200)

    ducks_info = json.loads(request.body)

    for size, duck_info in ducks_info.items():
        height, width = get_size(size)
        duck, _ = Duck.objects.get_or_create(
            name=size,
            defaults={
                'height': height,
                'width': width
            },
        )
        InGameDuck.objects.update_or_create(
            game=game,
            duck=duck,
            owner=request.user,
            defaults={
                'orientation': getOrientationCode(duck_info['orientation']),
                'x': duck_info['x'],
                'y': duck_info['y']
            }
        )

    return HttpResponse("Ducks are stored", status=200)
    
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

@login_required
def get_own_ducks(request, room_name):
    if request.method != 'GET':
        return _my_json_error_response("You must use a GET request for this operation", status=404)
    
    room_name = room_name.upper()
    game = get_object_or_404(Game, room_code=room_name)

    if request.user != game.player1 and request.user != game.player2:
        raise PermissionDenied()
    
    ducks = InGameDuck.objects.filter(game=game, owner=request.user)

    response_data = []
    for duck in ducks:
        my_item = {
            'size': duck.duck.name,
            'orientation': convertOrientation(duck.orientation),
            'original_orientation': duck.orientation,
            'x': duck.x,
            'y': duck.y,
            'width': duck.duck.width,
            'height': duck.duck.height
        }
        response_data.append(my_item)

    response_json = json.dumps(response_data)
    return HttpResponse(response_json, content_type='application/json')

def _my_json_error_response(message, status=200):
    # You can create your JSON by constructing the string representation yourself (or just use json.dumps)
    response_json = '{"error": "' + message + '"}'
    return HttpResponse(response_json, content_type='application/json', status=status)

@login_required
def leaderboard(request):
    user_info = get_user_info(request)
    players = Player.objects.all().annotate(score=F('wins') - F('losses')).order_by('-score')
    context = {
        'extra_data': user_info['extra_data'],
        'profile_pic': user_info['profile_pic'],
        'players': players
    }
    return render(request, 'battleducks/leaderboard.html', context)


def get_user_info(request):
    ed = request.user.social_auth.get(provider='google-oauth2').extra_data
    profile_pic = ed['picture']
    return {'extra_data': ed, 'profile_pic': profile_pic}

def didUserPlaceDucks(user, game):
    # Assume you have a related field or method to check the placement of ducks.
    # This example checks if there are any InGameDuck entries for the user with a defined position (x and y not -1).
    return InGameDuck.objects.filter(owner=user, game=game, x__gte=0, y__gte=0).exists()


def get_size(size_name):
    DUCK_SIZES = {
        'normal': {
            'length': 2,
            'width': 1,
        },
        'chubby': {
            'length': 2,
            'width': 2,
        },
        'long': {
            'length': 6,
            'width': 2,
        },
        'wide': {
            'length': 6,
            'width': 4,
        },
        'very-long': {
            'length': 8,
            'width': 2,
        },
    }

    size = DUCK_SIZES.get(size_name, None)
    if size is None:
        return -1, -1

    return size['length'], size['width']

def getOrientationCode(orientation):
    orientation = orientation.upper() 
    if orientation == "NORTH":
        return InGameDuck.DuckOrientation.NORTH
    elif orientation == "EAST":
        return InGameDuck.DuckOrientation.EAST
    elif orientation == "SOUTH":
        return InGameDuck.DuckOrientation.SOUTH
    elif orientation == "WEST":
        return InGameDuck.DuckOrientation.WEST
    else:
        raise ValueError("Invalid orientation")
    
def convertOrientation(orientation):
    if orientation == InGameDuck.DuckOrientation.NORTH:
        return "scaleY(1)"
    elif orientation == InGameDuck.DuckOrientation.EAST:
        return "scaleX(1)"
    elif orientation == InGameDuck.DuckOrientation.SOUTH:
        return "scaleY(-1)"
    elif orientation == InGameDuck.DuckOrientation.WEST:
        return "scaleX(-1)"
    else:
        raise ValueError("Invalid saved orientation.")