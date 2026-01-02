from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .forms import RegisterForm, LoginForm, EditProfileForm
from .models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django import forms
from django.views import View
from django.http import JsonResponse
import json
from django.db import connection

class RegisterUserView(APIView):
    def post(self, request):
        form = RegisterForm(request.data)

        if form.is_valid():
            user = form.save()
            return Response(
                {"message": "User registered successfully!", "username": user.username},
                status=status.HTTP_201_CREATED,
            )

        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class LoginUserView(APIView):
    def post(self, request):
        form = LoginForm(request.data)
        if form.is_valid():
            user = form.user
            # Save session
            request.session['username'] = user.username
            request.session.save()
            return Response(
                {"message": f"Welcome {user.first_name}!",
                 "username": user.username,
                 "role": user.type},
                status=status.HTTP_200_OK,
            )

        errors = [str(err) for err_list in form.errors.values() for err in err_list]
        return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

    
class LogoutUserView(APIView):
    def post(self, request):
        # Clear the session
        request.session.flush()
        return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)


class CheckSessionView(APIView):
    def get(self, request):
        username = request.session.get("username")
        role = request.session.get("role")
        if username:
            return Response({"username": username, "role": role}, status=200)
        return Response({"username": None, "role": None}, status=200)

@method_decorator(csrf_exempt, name='dispatch')
class EditProfileView(APIView):
    def post(self, request):
        username = request.session.get("username")
        if not username:
            return Response(
                {"error": "You are not logged in."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        form = EditProfileForm(request.data, username=username)
        if form.is_valid():
            try:
                user = form.save()
                return Response(
                    {"message": "Profile updated successfully!"},
                    status=status.HTTP_200_OK,
                )
            except forms.ValidationError as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)
        
@method_decorator(csrf_exempt, name='dispatch')
class GetProfileView(APIView):
    def get(self, request):
        username = request.session.get("username")
        if not username:
            return Response({"error": "Not logged in"}, status=401)

        try:
            user = User.objects.get(username=username)
            return Response({
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "middle_name": user.middle_name,
                "type": user.type,
            }, status=200)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

# -------------------------
# Room Views
# -------------------------

class RoomListView(View):
    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM vw_rooms")
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]
            rooms = [dict(zip(columns, row)) for row in rows]
        return JsonResponse({'rooms': rooms})

class AllRoomsView(View):
    """All rooms, regardless of is_active"""
    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM vw_rooms_all")
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]
            rooms = [dict(zip(columns, row)) for row in rows]
        return JsonResponse({'rooms': rooms})
    
class ActiveRoomsView(View):
    """Only active rooms"""
    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM vw_rooms_active")
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]
            rooms = [dict(zip(columns, row)) for row in rows]
        return JsonResponse({'rooms': rooms})

class InactiveRoomsView(View):
    """Only inactive rooms"""
    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM vw_rooms_inactive")
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]
            rooms = [dict(zip(columns, row)) for row in rows]
        return JsonResponse({'rooms': rooms})


# -------------------------
# Room CRUD
# -------------------------

@method_decorator(csrf_exempt, name='dispatch')
class RoomCreateView(View):
    def post(self, request):
        data = json.loads(request.body)
        room_no = data.get('room_no')
        image = data.get('image', '')
        name = data.get('name')
        department = data.get('department')
        status = data.get('status', True)

        with connection.cursor() as cursor:
            cursor.callproc('sp_create_room', [room_no, image, name, department, status])
        return JsonResponse({'status': 'success', 'message': 'Room created'})

@method_decorator(csrf_exempt, name='dispatch')
class RoomUpdateView(View):
    def put(self, request, room_id):
        data = json.loads(request.body)
        room_no = data.get('room_no')
        image = data.get('image', '')
        name = data.get('name')
        department = data.get('department')
        status = data.get('status', True)  # default True if not sent

        with connection.cursor() as cursor:
            cursor.callproc('sp_update_room', [room_id, room_no, image, name, department, status])
        return JsonResponse({'status': 'success', 'message': 'Room updated'})

@method_decorator(csrf_exempt, name='dispatch')
class RoomDeleteView(View):
    """Hard delete a room using stored procedure sp_delete_room_hard"""
    def delete(self, request, room_id):
        try:
            with connection.cursor() as cursor:
                cursor.callproc('sp_delete_room_hard', [room_id])
            return JsonResponse({'status': 'success', 'message': 'Room deleted permanently'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

