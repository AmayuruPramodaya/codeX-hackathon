from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django import forms
from .models import (
    User, Province, District, DSDivision, GramaNiladhariDivision,
    Issue, IssueAttachment, IssueResponse, ResponseAttachment,
    IssueEscalation, PublicComment, Notification, SystemSettings
)


class UserAdminForm(forms.ModelForm):
    class Meta:
        model = User
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Add help text for administrative fields
        self.fields['province'].help_text = 'Select the province where this user operates'
        self.fields['district'].help_text = 'Select the district (will be filtered by province)'
        self.fields['ds_division'].help_text = 'Select the DS Division (will be filtered by district)'
        self.fields['grama_niladhari_division'].help_text = 'Select the GN Division (will be filtered by DS Division)'
        
        # Handle POST data for form submission
        if self.is_bound:
            # Get values from POST data
            province_id = self.data.get('province')
            district_id = self.data.get('district')
            ds_division_id = self.data.get('ds_division')
            
            # Update querysets based on POST data
            if province_id:
                try:
                    self.fields['district'].queryset = District.objects.filter(province_id=province_id)
                except ValueError:
                    self.fields['district'].queryset = District.objects.none()
            else:
                self.fields['district'].queryset = District.objects.none()
                
            if district_id:
                try:
                    self.fields['ds_division'].queryset = DSDivision.objects.filter(district_id=district_id)
                except ValueError:
                    self.fields['ds_division'].queryset = DSDivision.objects.none()
            else:
                self.fields['ds_division'].queryset = DSDivision.objects.none()
                
            if ds_division_id:
                try:
                    self.fields['grama_niladhari_division'].queryset = GramaNiladhariDivision.objects.filter(ds_division_id=ds_division_id)
                except ValueError:
                    self.fields['grama_niladhari_division'].queryset = GramaNiladhariDivision.objects.none()
            else:
                self.fields['grama_niladhari_division'].queryset = GramaNiladhariDivision.objects.none()
        else:
            # Initialize dropdown filtering for display
            if not self.instance.pk:
                # For new users, start with empty dependent dropdowns
                self.fields['district'].queryset = District.objects.none()
                self.fields['ds_division'].queryset = DSDivision.objects.none()
                self.fields['grama_niladhari_division'].queryset = GramaNiladhariDivision.objects.none()
            else:
                # For existing users, show all options and let JavaScript handle filtering
                self.fields['district'].queryset = District.objects.all()
                self.fields['ds_division'].queryset = DSDivision.objects.all()
                self.fields['grama_niladhari_division'].queryset = GramaNiladhariDivision.objects.all()

    def clean(self):
        cleaned_data = super().clean()
        province = cleaned_data.get('province')
        district = cleaned_data.get('district')
        ds_division = cleaned_data.get('ds_division')
        grama_niladhari_division = cleaned_data.get('grama_niladhari_division')

        # Validate district belongs to province
        if province and district:
            if district.province != province:
                raise forms.ValidationError('District must belong to the selected province.')

        # Validate DS division belongs to district
        if district and ds_division:
            if ds_division.district != district:
                raise forms.ValidationError('DS Division must belong to the selected district.')

        # Validate GN division belongs to DS division
        if ds_division and grama_niladhari_division:
            if grama_niladhari_division.ds_division != ds_division:
                raise forms.ValidationError('GN Division must belong to the selected DS Division.')

        return cleaned_data


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = UserAdminForm
    list_display = ['username', 'email', 'user_type', 'province', 'district', 'is_approved', 'is_active']
    list_filter = ['user_type', 'is_approved', 'is_active', 'province', 'district']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'national_id']
    
    class Media:
        js = ('admin/js/cascade_dropdowns.js',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Government Info', {
            'fields': ('user_type', 'phone', 'address', 'national_id', 'profile_picture')
        }),
        ('Administrative Hierarchy', {
            'fields': ('province', 'district', 'ds_division', 'grama_niladhari_division'),
            'description': 'Select the administrative hierarchy where this user will operate. Choose Province first, then District, then DS Division, and finally GN Division based on the user\'s role.'
        }),
        ('Approval', {
            'fields': ('is_approved',)
        }),
    )
    
    # Configure foreign key fields as dropdowns
    raw_id_fields = ()  # Remove raw_id_fields to show dropdowns
    autocomplete_fields = ()  # Remove autocomplete to show regular dropdowns
    
    actions = ['approve_users', 'reject_users']
    
    def approve_users(self, request, queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request, f'{updated} users approved successfully.')
    approve_users.short_description = "Approve selected users"
    
    def reject_users(self, request, queryset):
        updated = queryset.update(is_approved=False)
        self.message_user(request, f'{updated} users rejected.')
    reject_users.short_description = "Reject selected users"


@admin.register(Province)
class ProvinceAdmin(admin.ModelAdmin):
    list_display = ['name_en', 'name_si', 'name_ta', 'created_at']
    search_fields = ['name_en', 'name_si', 'name_ta']


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ['name_en', 'name_si', 'name_ta', 'province', 'created_at']
    list_filter = ['province']
    search_fields = ['name_en', 'name_si', 'name_ta']


@admin.register(DSDivision)
class DSDivisionAdmin(admin.ModelAdmin):
    list_display = ['name_en', 'name_si', 'name_ta', 'district', 'created_at']
    list_filter = ['district__province', 'district']
    search_fields = ['name_en', 'name_si', 'name_ta']


@admin.register(GramaNiladhariDivision)
class GramaNiladhariDivisionAdmin(admin.ModelAdmin):
    list_display = ['name_en', 'name_si', 'name_ta', 'ds_division', 'created_at']
    list_filter = ['ds_division__district__province', 'ds_division__district', 'ds_division']
    search_fields = ['name_en', 'name_si', 'name_ta']


class IssueAttachmentInline(admin.TabularInline):
    model = IssueAttachment
    extra = 0


class IssueResponseInline(admin.TabularInline):
    model = IssueResponse
    extra = 0
    readonly_fields = ['created_at']


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = [
        'reference_number', 'title', 'status', 'priority', 'current_level',
        'reporter_name', 'province', 'district', 'created_at'
    ]
    list_filter = [
        'status', 'priority', 'current_level', 'language', 'is_anonymous',
        'province', 'district', 'created_at'
    ]
    search_fields = ['reference_number', 'title', 'description', 'reporter_name']
    readonly_fields = ['reference_number', 'created_at', 'updated_at']
    
    inlines = [IssueAttachmentInline, IssueResponseInline]
    
    fieldsets = (
        ('Issue Information', {
            'fields': ('reference_number', 'title', 'description', 'language', 'priority')
        }),
        ('Reporter Information', {
            'fields': ('reporter_user', 'reporter_name', 'reporter_phone', 'reporter_address', 
                      'reporter_national_id', 'is_anonymous')
        }),
        ('Location', {
            'fields': ('province', 'district', 'ds_division', 'grama_niladhari_division')
        }),
        ('Management', {
            'fields': ('status', 'current_handler', 'current_level', 'escalation_count',
                      'next_escalation_date', 'pending_extension_count')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'resolved_at')
        }),
    )


@admin.register(IssueResponse)
class IssueResponseAdmin(admin.ModelAdmin):
    list_display = ['issue', 'responder', 'response_type', 'created_at']
    list_filter = ['response_type', 'language', 'created_at']
    search_fields = ['issue__reference_number', 'message']
    readonly_fields = ['created_at']


@admin.register(IssueEscalation)
class IssueEscalationAdmin(admin.ModelAdmin):
    list_display = ['issue', 'from_level', 'to_level', 'from_user', 'to_user', 'escalated_at']
    list_filter = ['from_level', 'to_level', 'escalated_at']
    search_fields = ['issue__reference_number', 'reason']
    readonly_fields = ['escalated_at']


@admin.register(PublicComment)
class PublicCommentAdmin(admin.ModelAdmin):
    list_display = ['issue', 'commenter_name', 'is_anonymous', 'is_approved', 'created_at']
    list_filter = ['is_anonymous', 'is_approved', 'language', 'created_at']
    search_fields = ['issue__reference_number', 'comment', 'commenter_name']
    readonly_fields = ['created_at']
    
    actions = ['approve_comments', 'reject_comments']
    
    def approve_comments(self, request, queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request, f'{updated} comments approved successfully.')
    approve_comments.short_description = "Approve selected comments"
    
    def reject_comments(self, request, queryset):
        updated = queryset.update(is_approved=False)
        self.message_user(request, f'{updated} comments rejected.')
    reject_comments.short_description = "Reject selected comments"


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['user__username', 'title', 'message']
    readonly_fields = ['created_at']


@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = ['key', 'value', 'description', 'updated_at']
    search_fields = ['key', 'description']
    readonly_fields = ['updated_at']