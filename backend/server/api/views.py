from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .forms import RegisterForm, LoginForm, EditProfileForm
from .models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django import forms

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
