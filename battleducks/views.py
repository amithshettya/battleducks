from django.contrib.auth.decorators import login_required
from django.shortcuts import render

# Create your views here.

@login_required
def index(request):
    ed = request.user.social_auth.get(provider='google-oauth2').extra_data
    return render(request, "battleducks/index.html", {"extra_data": ed})

def login(request):
    return render(request, "battleducks/login.html")