from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.admin.views.decorators import staff_member_required
from datetime import timedelta

try:
    from django_filters.rest_framework import DjangoFilterBackend
except ImportError:
    # Fallback if django-filter is not available
    class DjangoFilterBackend:
        pass

from .models import (
    User, Province, District, DSDivision, GramaNiladhariDivision,
    Issue, IssueAttachment, IssueResponse, ResponseAttachment,
    IssueEscalation, PublicComment, Notification
)
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    ProvinceSerializer, DistrictSerializer, DSDivisionSerializer,
    GramaNiladhariDivisionSerializer, IssueListSerializer, IssueDetailSerializer,
    IssueCreateSerializer, IssueResponseSerializer, PublicCommentSerializer,
    NotificationSerializer, EscalatedIssueSerializer
)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner of the snippet.
        return obj.reporter_user == request.user


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        if user.user_type == 'citizen':
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserProfileSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Registration successful'
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'user': UserProfileSerializer(user).data,
                'message': 'Registration successful. Account pending approval.'
            }, status=status.HTTP_201_CREATED)


class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserProfileSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Login successful'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# Administrative division views
class ProvinceListView(generics.ListAPIView):
    queryset = Province.objects.all().order_by('name_en')
    serializer_class = ProvinceSerializer
    permission_classes = [permissions.AllowAny]


class DistrictListView(generics.ListAPIView):
    queryset = District.objects.all().order_by('name_en')
    serializer_class = DistrictSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['province']


class DSDivisionListView(generics.ListAPIView):
    queryset = DSDivision.objects.all().order_by('name_en')
    serializer_class = DSDivisionSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['district']


class GramaNiladhariDivisionListView(generics.ListAPIView):
    queryset = GramaNiladhariDivision.objects.all().order_by('name_en')
    serializer_class = GramaNiladhariDivisionSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['ds_division']


# Issue management views
class IssueListView(generics.ListAPIView):
    serializer_class = IssueListSerializer
    permission_classes = [permissions.AllowAny]  # Public can view issues
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'province', 'district', 'ds_division', 'current_level']
    search_fields = ['title', 'description', 'reference_number']
    ordering_fields = ['created_at', 'updated_at', 'priority', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Issue.objects.all()
        
        # If user is authenticated and not citizen, filter by their jurisdiction and level
        if self.request.user.is_authenticated and self.request.user.user_type != 'citizen':
            user = self.request.user
            
            if user.user_type == 'grama_niladhari':
                # GN sees only issues assigned to them or in their area and at GN level
                queryset = queryset.filter(
                    province=user.province,
                    district=user.district,
                    ds_division=user.ds_division,
                    grama_niladhari_division=user.grama_niladhari_division,
                    current_level='grama_niladhari'
                )
            elif user.user_type == 'divisional_secretary':
                # DS sees issues escalated to DS level in their division
                queryset = queryset.filter(
                    province=user.province,
                    district=user.district,
                    ds_division=user.ds_division,
                    current_level='divisional_secretary'
                )
            elif user.user_type == 'district_secretary':
                # District Secretary sees issues escalated to district level in their district
                queryset = queryset.filter(
                    province=user.province,
                    district=user.district,
                    current_level='district_secretary'
                )
            elif user.user_type == 'provincial_ministry':
                # Provincial Ministry sees issues escalated to provincial level in their province
                queryset = queryset.filter(
                    province=user.province,
                    current_level='provincial_ministry'
                )
            elif user.user_type == 'national_ministry':
                # National Ministry sees issues escalated to national level
                queryset = queryset.filter(current_level='national_ministry')
            elif user.user_type == 'prime_minister':
                # PM sees issues escalated to PM level
                queryset = queryset.filter(current_level='prime_minister')
            elif user.user_type == 'admin':
                # Admin sees all issues
                pass
        
        return queryset


class IssueDetailView(generics.RetrieveAPIView):
    queryset = Issue.objects.all()
    serializer_class = IssueDetailSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_object(self):
        # Check if we have issue_id (numeric) or reference_number (string)
        if 'issue_id' in self.kwargs:
            return get_object_or_404(self.get_queryset(), id=self.kwargs['issue_id'])
        elif 'reference_number' in self.kwargs:
            return get_object_or_404(self.get_queryset(), reference_number=self.kwargs['reference_number'])
        else:
            # Fallback to default behavior
            return super().get_object()


class IssueCreateView(generics.CreateAPIView):
    queryset = Issue.objects.all()
    serializer_class = IssueCreateSerializer
    permission_classes = [permissions.AllowAny]  # Allow anonymous submissions
    
    def create(self, request, *args, **kwargs):
        # Debug: Print request data
        print("Request data:", request.data)
        print("Request files:", request.FILES)
        
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        # Create the issue first
        issue = serializer.save()
        
        # Handle file attachments if any
        attachments = request.FILES.getlist('attachments')
        for attachment_file in attachments:
            # Determine file type
            if attachment_file.content_type.startswith('image/'):
                attachment_type = 'image'
            elif attachment_file.content_type.startswith('video/'):
                attachment_type = 'video'
            else:
                attachment_type = 'document'
            
            IssueAttachment.objects.create(
                issue=issue,
                file=attachment_file,
                attachment_type=attachment_type,
                description=f"{attachment_type.title()} attachment"
            )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class MyIssuesView(generics.ListAPIView):
    serializer_class = IssueListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'priority']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Issue.objects.filter(reporter_user=self.request.user)


class EscalatedIssuesView(generics.ListAPIView):
    """
    View for government officials (especially GN users) to see issues 
    they originally handled that have been escalated to higher levels.
    """
    serializer_class = EscalatedIssueSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'current_level']
    ordering_fields = ['created_at', 'updated_at', 'escalated_at']
    ordering = ['-updated_at']

    def get_queryset(self):
        user = self.request.user
        
        # Only government officials can view escalated issues
        if user.user_type == 'citizen':
            return Issue.objects.none()
        
        # Find issues that were escalated FROM this user's level in their jurisdiction
        escalated_issues = Issue.objects.filter(
            escalations__from_user=user,
            province=user.province,
            district=user.district,
            ds_division=user.ds_division
        ).distinct()
        
        # Also include issues escalated from their jurisdiction level even if not specifically from them
        # This is useful for officials who might have taken over from colleagues
        if user.user_type == 'grama_niladhari':
            # For GN users, show issues escalated from their GN division
            jurisdiction_escalated = Issue.objects.filter(
                escalations__from_level='grama_niladhari',
                grama_niladhari_division=user.grama_niladhari_division,
                escalation_count__gt=0
            ).distinct()
        elif user.user_type == 'divisional_secretary':
            # For DS users, show issues escalated from their DS division
            jurisdiction_escalated = Issue.objects.filter(
                escalations__from_level='divisional_secretary',
                ds_division=user.ds_division,
                escalation_count__gt=0
            ).distinct()
        else:
            # For higher levels, show issues escalated from their jurisdiction
            jurisdiction_escalated = Issue.objects.filter(
                escalations__from_level__in=['district_secretary', 'provincial_ministry', 'national_ministry'],
                province=user.province,
                district=user.district,
                escalation_count__gt=0
            ).distinct()
        
        # Combine both querysets
        return (escalated_issues | jurisdiction_escalated).distinct()


class IssueResponseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, issue_id):
        issue = get_object_or_404(Issue, id=issue_id)
        user = request.user
        
        # Debug logging
        print(f"Request data: {request.data}")
        print(f"Request files: {request.FILES}")
        
        # Check if user has permission to respond to this issue
        if not self.can_respond_to_issue(user, issue):
            return Response(
                {'error': 'You do not have permission to respond to this issue'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = IssueResponseSerializer(data=request.data)
        if serializer.is_valid():
            response = serializer.save(issue=issue, responder=user)
            
            # Handle file attachments if any
            attachments = request.FILES.getlist('attachments')
            for attachment_file in attachments:
                ResponseAttachment.objects.create(
                    response=response,
                    file=attachment_file
                )
            
            # Handle different response types
            if response.response_type == 'resolved':
                issue.status = 'resolved'
                issue.resolved_at = timezone.now()
                issue.current_handler = user
                issue.next_escalation_date = None  # Stop escalation timer
                issue.save()
            elif response.response_type == 'pending':
                issue.status = 'pending'
                if response.additional_days:
                    issue.next_escalation_date = timezone.now() + timedelta(days=response.additional_days)
                    issue.pending_extension_count += 1
                else:
                    # Reset escalation timer for normal pending responses
                    escalation_days = 7 if user.user_type in ['national_ministry', 'prime_minister'] else 3
                    issue.next_escalation_date = timezone.now() + timedelta(days=escalation_days)
                issue.save()
            elif response.response_type == 'escalate':
                self.escalate_issue(issue, user)
            elif response.response_type == 'response':
                # For regular responses, reset the escalation timer
                issue.status = 'in_progress'
                escalation_days = 7 if user.user_type in ['national_ministry', 'prime_minister'] else 3
                issue.next_escalation_date = timezone.now() + timedelta(days=escalation_days)
                issue.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def can_respond_to_issue(self, user, issue):
        """Check if user can respond to the issue based on their role, jurisdiction, and issue level"""
        if user.user_type == 'admin':
            return True
        
        # Check if the issue is at the user's level
        if issue.current_level != user.user_type:
            return False
        
        # Check jurisdiction match - compare ForeignKey objects directly
        jurisdiction_match = (
            user.province == issue.province and
            user.district == issue.district
        )
        
        if user.user_type == 'grama_niladhari':
            return (jurisdiction_match and 
                   user.ds_division == issue.ds_division and
                   user.grama_niladhari_division == issue.grama_niladhari_division)
        elif user.user_type == 'divisional_secretary':
            return jurisdiction_match and user.ds_division == issue.ds_division
        elif user.user_type == 'district_secretary':
            return jurisdiction_match
        elif user.user_type == 'provincial_ministry':
            return user.province == issue.province
        elif user.user_type in ['national_ministry', 'prime_minister']:
            return True
        
        return False

    def escalate_issue(self, issue, from_user):
        """Escalate issue to next level"""
        escalation_hierarchy = {
            'grama_niladhari': 'divisional_secretary',
            'divisional_secretary': 'district_secretary',
            'district_secretary': 'provincial_ministry',
            'provincial_ministry': 'national_ministry',
            'national_ministry': 'prime_minister'
        }
        
        current_level = issue.current_level
        next_level = escalation_hierarchy.get(current_level)
        
        if next_level:
            # Find appropriate user at next level
            next_users = User.objects.filter(
                user_type=next_level,
                is_approved=True
            )
            
            # Filter by jurisdiction for lower levels
            if next_level in ['divisional_secretary', 'district_secretary', 'provincial_ministry']:
                if next_level == 'divisional_secretary':
                    next_users = next_users.filter(
                        province=issue.province,
                        district=issue.district,
                        ds_division=issue.ds_division
                    )
                elif next_level == 'district_secretary':
                    next_users = next_users.filter(
                        province=issue.province,
                        district=issue.district
                    )
                elif next_level == 'provincial_ministry':
                    next_users = next_users.filter(province=issue.province)
            
            next_user = next_users.first()
            
            if next_user:
                # Create escalation record
                IssueEscalation.objects.create(
                    issue=issue,
                    from_user=from_user,
                    to_user=next_user,
                    from_level=current_level,
                    to_level=next_level,
                    reason=f"Escalated from {current_level}"
                )
                
                # Update issue
                issue.current_handler = next_user
                issue.current_level = next_level
                issue.escalation_count += 1
                issue.status = 'escalated'
                issue.next_escalation_date = timezone.now() + timedelta(days=3)
                issue.save()


class PublicCommentView(generics.CreateAPIView):
    serializer_class = PublicCommentSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        issue_id = self.kwargs.get('issue_id')
        issue = get_object_or_404(Issue, id=issue_id)
        
        # Set commenter info
        if self.request.user.is_authenticated:
            serializer.save(
                issue=issue,
                commenter=self.request.user,
                commenter_name=self.request.user.get_full_name() or self.request.user.username
            )
        else:
            serializer.save(issue=issue, is_anonymous=True)


class IssueResponseListView(generics.ListAPIView):
    serializer_class = IssueResponseSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        issue_id = self.kwargs.get('issue_id')
        return IssueResponse.objects.filter(issue_id=issue_id).order_by('-created_at')


class IssueCommentsListView(generics.ListAPIView):
    serializer_class = PublicCommentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        issue_id = self.kwargs.get('issue_id')
        return PublicComment.objects.filter(issue_id=issue_id).order_by('created_at')


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        if user.user_type == 'citizen':
            # Stats for citizens
            my_issues = Issue.objects.filter(reporter_user=user)
            stats = {
                'total_issues': my_issues.count(),
                'pending_issues': my_issues.filter(status__in=['pending', 'in_progress']).count(),
                'resolved_issues': my_issues.filter(status__in=['resolved', 'closed']).count(),
                'my_issues': my_issues.count(),
                'escalated_issues': my_issues.filter(status='escalated').count(),
                'active_users': user.__class__.objects.filter(is_active=True).count(),
            }
        else:
            # Stats for government officials
            queryset = self.get_jurisdiction_queryset(user)
            my_assigned = queryset.filter(current_handler=user) if user.user_type != 'admin' else Issue.objects.all()
            stats = {
                'total_issues': queryset.count(),
                'pending_issues': queryset.filter(status__in=['pending', 'in_progress']).count(),
                'resolved_issues': queryset.filter(status__in=['resolved', 'closed']).count(),
                'my_issues': my_assigned.count(),
                'escalated_issues': queryset.filter(status='escalated').count(),
                'active_users': user.__class__.objects.filter(is_active=True).count(),
            }
        
        return Response(stats)

    def get_jurisdiction_queryset(self, user):
        """Get issues based on user's jurisdiction"""
        queryset = Issue.objects.all()
        
        if user.user_type == 'grama_niladhari' and user.grama_niladhari_division:
            queryset = queryset.filter(
                province=user.province,
                district=user.district,
                ds_division=user.ds_division,
                grama_niladhari_division=user.grama_niladhari_division
            )
        elif user.user_type == 'divisional_secretary' and user.ds_division:
            queryset = queryset.filter(
                province=user.province,
                district=user.district,
                ds_division=user.ds_division
            )
        elif user.user_type == 'district_secretary' and user.district:
            queryset = queryset.filter(
                province=user.province,
                district=user.district
            )
        elif user.user_type == 'provincial_ministry' and user.province:
            queryset = queryset.filter(province=user.province)
        
        return queryset


class DashboardRecentIssuesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        if user.user_type == 'citizen':
            # Recent issues for citizens - their own issues
            queryset = Issue.objects.filter(reporter_user=user)
        else:
            # Recent issues for government officials - their jurisdiction
            queryset = self.get_jurisdiction_queryset(user)
        
        # Get the 5 most recent issues
        recent_issues = queryset.order_by('-created_at')[:5]
        serializer = IssueListSerializer(recent_issues, many=True)
        return Response(serializer.data)

    def get_jurisdiction_queryset(self, user):
        """Get issues based on user's jurisdiction and hierarchical level"""
        queryset = Issue.objects.all()
        
        if user.user_type == 'grama_niladhari' and user.grama_niladhari_division:
            queryset = queryset.filter(
                province=user.province,
                district=user.district,
                ds_division=user.ds_division,
                grama_niladhari_division=user.grama_niladhari_division,
                current_level='grama_niladhari'
            )
        elif user.user_type == 'divisional_secretary' and user.ds_division:
            queryset = queryset.filter(
                province=user.province,
                district=user.district,
                ds_division=user.ds_division,
                current_level='divisional_secretary'
            )
        elif user.user_type == 'district_secretary' and user.district:
            queryset = queryset.filter(
                province=user.province,
                district=user.district,
                current_level='district_secretary'
            )
        elif user.user_type == 'provincial_ministry' and user.province:
            queryset = queryset.filter(
                province=user.province,
                current_level='provincial_ministry'
            )
        elif user.user_type == 'national_ministry':
            queryset = queryset.filter(current_level='national_ministry')
        elif user.user_type == 'prime_minister':
            queryset = queryset.filter(current_level='prime_minister')
            queryset = queryset.filter(province=user.province)
        
        return queryset


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_administrative_divisions(request):
    """Search for administrative divisions"""
    query = request.GET.get('q', '')
    division_type = request.GET.get('type', 'all')  # province, district, ds_division, gn_division, all
    
    results = []
    
    if len(query) >= 2:  # Minimum 2 characters for search
        if division_type in ['province', 'all']:
            provinces = Province.objects.filter(
                Q(name_en__icontains=query) |
                Q(name_si__icontains=query) |
                Q(name_ta__icontains=query)
            )[:5]
            for province in provinces:
                results.append({
                    'type': 'province',
                    'id': province.id,
                    'name_en': province.name_en,
                    'name_si': province.name_si,
                    'name_ta': province.name_ta
                })
        
        if division_type in ['district', 'all']:
            districts = District.objects.filter(
                Q(name_en__icontains=query) |
                Q(name_si__icontains=query) |
                Q(name_ta__icontains=query)
            ).select_related('province')[:5]
            for district in districts:
                results.append({
                    'type': 'district',
                    'id': district.id,
                    'name_en': district.name_en,
                    'name_si': district.name_si,
                    'name_ta': district.name_ta,
                    'province': district.province.name_en
                })
        
        if division_type in ['ds_division', 'all']:
            ds_divisions = DSDivision.objects.filter(
                Q(name_en__icontains=query) |
                Q(name_si__icontains=query) |
                Q(name_ta__icontains=query)
            ).select_related('district__province')[:5]
            for ds_div in ds_divisions:
                results.append({
                    'type': 'ds_division',
                    'id': ds_div.id,
                    'name_en': ds_div.name_en,
                    'name_si': ds_div.name_si,
                    'name_ta': ds_div.name_ta,
                    'district': ds_div.district.name_en,
                    'province': ds_div.district.province.name_en
                })
        
        if division_type in ['gn_division', 'all']:
            gn_divisions = GramaNiladhariDivision.objects.filter(
                Q(name_en__icontains=query) |
                Q(name_si__icontains=query) |
                Q(name_ta__icontains=query)
            ).select_related('ds_division__district__province')[:5]
            for gn_div in gn_divisions:
                results.append({
                    'type': 'gn_division',
                    'id': gn_div.id,
                    'name_en': gn_div.name_en,
                    'name_si': gn_div.name_si,
                    'name_ta': gn_div.name_ta,
                    'ds_division': gn_div.ds_division.name_en,
                    'district': gn_div.ds_division.district.name_en,
                    'province': gn_div.ds_division.district.province.name_en
                })
    
    return Response(results)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_issue_attachment(request, issue_id):
    """Upload attachment to an issue"""
    try:
        issue = Issue.objects.get(id=issue_id)
        
        # Check permission - only issue reporter or assigned handler can upload
        if not (request.user == issue.reporter_user or request.user == issue.current_handler):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        file = request.FILES.get('file')
        attachment_type = request.data.get('attachment_type', 'image')
        description = request.data.get('description', '')
        
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        attachment = IssueAttachment.objects.create(
            issue=issue,
            file=file,
            attachment_type=attachment_type,
            description=description
        )
        
        return Response({
            'id': attachment.id,
            'file': attachment.file.url,
            'attachment_type': attachment.attachment_type,
            'description': attachment.description,
            'uploaded_at': attachment.uploaded_at
        }, status=status.HTTP_201_CREATED)
        
    except Issue.DoesNotExist:
        return Response({'error': 'Issue not found'}, status=status.HTTP_404_NOT_FOUND)


from django.contrib.admin.views.decorators import staff_member_required
from django.views.decorators.csrf import csrf_exempt

@staff_member_required
@csrf_exempt
def cascade_filter_view(request):
    """AJAX endpoint for cascading dropdown filtering in admin"""
    print(f"Cascade filter called with: {request.GET}")  # Debug print
    
    if request.method == 'GET':
        target = request.GET.get('target')
        
        if target == 'district':
            province_id = request.GET.get('province')
            if province_id:
                districts = District.objects.filter(province_id=province_id).order_by('name_en')
                data = [{'id': d.id, 'name': d.name_en} for d in districts]
                print(f"Returning districts: {data}")  # Debug print
                return JsonResponse(data, safe=False)
                
        elif target == 'ds_division':
            district_id = request.GET.get('district')
            if district_id:
                ds_divisions = DSDivision.objects.filter(district_id=district_id).order_by('name_en')
                data = [{'id': d.id, 'name': d.name_en} for d in ds_divisions]
                print(f"Returning DS divisions: {data}")  # Debug print
                return JsonResponse(data, safe=False)
                
        elif target == 'grama_niladhari_division':
            ds_division_id = request.GET.get('ds_division')
            if ds_division_id:
                gn_divisions = GramaNiladhariDivision.objects.filter(ds_division_id=ds_division_id).order_by('name_en')
                data = [{'id': d.id, 'name': d.name_en} for d in gn_divisions]
                print(f"Returning GN divisions: {data}")  # Debug print
                return JsonResponse(data, safe=False)
    
    print("No matching target or invalid request")  # Debug print
    return JsonResponse([], safe=False)