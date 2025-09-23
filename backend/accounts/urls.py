from django.urls import path

from .actions.login import login
from .actions.logout import logout
from .actions.register import register

urlpatterns = [
    path("register/", register, name="register"),
    path("login/", login, name="login"),
    path("logout/", logout, name="logout"),
]
