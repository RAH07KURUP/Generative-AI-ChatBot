from django.urls import path
from . import views

urlpatterns = [
    path('register', views.SignupView.as_view(), name="register"),
    path('google', views.GoogleAuthView.as_view(), name='google-auth'),
    path('login', views.LoginView.as_view(), name="login")
]