from rest_framework import permissions


class PostOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, post):
        return super().has_permission(request, view) and request.user == post.user
    

class CommentOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, comment):
        return super().has_permission(request, view) and request.user == comment.user