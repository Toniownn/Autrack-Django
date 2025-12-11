from django.urls import path
from .views import RegisterUserView
from .views import RegisterUserView, LoginUserView, LogoutUserView, CheckSessionView, EditProfileView, GetProfileView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', LoginUserView.as_view(), name='login'),
    path('logout/', LogoutUserView.as_view(), name='logout'),
    path('check-session/', CheckSessionView.as_view(), name='check-session'),
    path('edit-profile/', EditProfileView.as_view(), name='edit-profile'),
    path('get-profile/', GetProfileView.as_view(), name='get-profile'),
]
