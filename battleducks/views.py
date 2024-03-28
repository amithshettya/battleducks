from django.contrib.auth.decorators import login_required
from django.shortcuts import render

# Create your views here.


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

