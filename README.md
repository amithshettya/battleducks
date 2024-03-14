# s24_team_7
Repository for s24_team_7



You need to install some additional Python packages (in addition to Django),
which are not used in the other course examples.
These packages are listed in `requirements.txt`.  The easiest way to do this is with a
new virtual environment.
```
   python3 -m venv venv .
   <activate the virtual environment>
   python -m pip install -U pip
   python -m pip install -r requirements.txt
```

Then run the demo in the usual way:
```
   python manage.py makemigrations
   python manage.py migrate
   python manage.py runserver
```

Connect to `localhost:8000`.