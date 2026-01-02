from django.urls import path
from django.contrib import admin
from .views import ActiveRoomsView, AllRoomsView, InactiveRoomsView, RegisterUserView, RoomCreateView, RoomDeleteView, RoomUpdateView
from .views import RegisterUserView, LoginUserView, LogoutUserView, CheckSessionView, EditProfileView, GetProfileView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', LoginUserView.as_view(), name='login'),
    path('logout/', LogoutUserView.as_view(), name='logout'),
    path('check-session/', CheckSessionView.as_view(), name='check-session'),
    path('edit-profile/', EditProfileView.as_view(), name='edit-profile'),
    path('get-profile/', GetProfileView.as_view(), name='get-profile'),
    path('admin/', admin.site.urls),

        # Rooms
    path('rooms/all/', AllRoomsView.as_view(), name='rooms-all'),
    path('rooms/active/', ActiveRoomsView.as_view(), name='rooms-active'),
    path('rooms/inactive/', InactiveRoomsView.as_view(), name='rooms-inactive'),
    path('rooms/create/', RoomCreateView.as_view(), name='room-create'),
    path('rooms/<int:room_id>/update/', RoomUpdateView.as_view(), name='room-update'),
    path('rooms/<int:room_id>/delete/', RoomDeleteView.as_view(), name='room-delete'),

]
