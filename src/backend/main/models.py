from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta
from django.db import models
import pyotp
import random
import string

# TODO: Create project models


class Province(models.Model):
    name_en = models.CharField(max_length=100)
    name_si = models.CharField(max_length=100)
    name_ta = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name_en


class District(models.Model):
    name_en = models.CharField(max_length=100)
    name_si = models.CharField(max_length=100)
    name_ta = models.CharField(max_length=100)
    province = models.ForeignKey(Province, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name_en} - {self.province.name_en}"


class DSDivision(models.Model):
    name_en = models.CharField(max_length=100)
    name_si = models.CharField(max_length=100)
    name_ta = models.CharField(max_length=100)
    district = models.ForeignKey(District, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name_en} - {self.district.name_en}"


class GramaNiladhariDivision(models.Model):
    name_en = models.CharField(max_length=100)
    name_si = models.CharField(max_length=100)
    name_ta = models.CharField(max_length=100)
    ds_division = models.ForeignKey(DSDivision, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name_en} - {self.ds_division.name_en}"


class User(AbstractUser):
    USER_TYPES = (
        ("admin", "Admin"),
        ("citizen", "Citizen"),
        ("prime_minister", "Prime Minister"),
        ("grama_niladhari", "Grama Niladhari"),
        ("national_ministry", "National Ministry"),
        ("district_secretary", "District Secretary"),
        ("provincial_ministry", "Provincial Ministry"),
        ("divisional_secretary", "Divisional Secretary"),
    )

    user_type = models.CharField(max_length=20, choices=USER_TYPES, default="citizen")
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(
        upload_to="profile_pics/", blank=True, null=True
    )
    national_id = models.CharField(max_length=12, blank=True, null=True, unique=True)

    # Administrative hierarchy fields as ForeignKeys for proper dropdowns
    province = models.ForeignKey(
        Province, on_delete=models.SET_NULL, blank=True, null=True
    )
    district = models.ForeignKey(
        District, on_delete=models.SET_NULL, blank=True, null=True
    )
    ds_division = models.ForeignKey(
        DSDivision, on_delete=models.SET_NULL, blank=True, null=True
    )
    grama_niladhari_division = models.ForeignKey(
        GramaNiladhariDivision, on_delete=models.SET_NULL, blank=True, null=True
    )

    # Registration approval (for non-citizen users)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Convert empty string national_id to None to avoid unique constraint issues
        if self.national_id == '':
            self.national_id = None
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.user_type})"


class Issue(models.Model):
    ISSUE_STATUS = (
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("resolved", "Resolved"),
        ("escalated", "Escalated"),
        ("closed", "Closed"),
    )

    PRIORITY_LEVELS = (
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("urgent", "Urgent"),
    )

    CATEGORY_CHOICES = (
        ("infrastructure", "Infrastructure"),
        ("utilities", "Utilities"),
        ("transportation", "Transportation"),
        ("healthcare", "Healthcare"),
        ("education", "Education"),
        ("environment", "Environment"),
        ("public_safety", "Public Safety"),
        ("other", "Other"),
    )

    LANGUAGE_CHOICES = (
        ("en", "English"),
        ("si", "Sinhala"),
        ("ta", "Tamil"),
    )

    # Reporter information (can be anonymous)
    reporter_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="reported_issues",
    )
    reporter_name = models.CharField(
        max_length=200,
        help_text="Name of the person reporting (required for anonymous)",
    )
    reporter_phone = models.CharField(max_length=15, blank=True, null=True)
    reporter_address = models.TextField(blank=True, null=True)
    reporter_national_id = models.CharField(max_length=12, blank=True, null=True)
    is_anonymous = models.BooleanField(default=False)

    # Issue details
    title = models.CharField(max_length=300)
    description = models.TextField()
    category = models.CharField(
        max_length=20, choices=CATEGORY_CHOICES, default="other"
    )
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default="en")

    # Location information
    province = models.ForeignKey(Province, on_delete=models.CASCADE)
    district = models.ForeignKey(District, on_delete=models.CASCADE)
    ds_division = models.ForeignKey(DSDivision, on_delete=models.CASCADE)
    grama_niladhari_division = models.ForeignKey(
        GramaNiladhariDivision, on_delete=models.CASCADE, null=True, blank=True
    )
    address = models.TextField(
        blank=True, null=True, help_text="Specific address or location details"
    )
    ds_division = models.ForeignKey(DSDivision, on_delete=models.CASCADE)
    grama_niladhari_division = models.ForeignKey(
        GramaNiladhariDivision, on_delete=models.CASCADE
    )

    # Issue management
    status = models.CharField(max_length=20, choices=ISSUE_STATUS, default="pending")
    priority = models.CharField(
        max_length=10, choices=PRIORITY_LEVELS, default="medium"
    )
    current_handler = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="handling_issues",
    )
    current_level = models.CharField(max_length=20, default="grama_niladhari")

    # Escalation tracking
    escalation_count = models.IntegerField(default=0)
    next_escalation_date = models.DateTimeField(null=True, blank=True)
    pending_extension_count = models.IntegerField(default=0)
    max_pending_extensions = models.IntegerField(default=2)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    # Reference number
    reference_number = models.CharField(max_length=20, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.reference_number:
            import uuid

            self.reference_number = (
                f"GS{timezone.now().year}{str(uuid.uuid4().hex[:8]).upper()}"
            )

        if not self.next_escalation_date and self.status == "pending":
            self.next_escalation_date = timezone.now() + timedelta(days=3)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.reference_number} - {self.title[:50]}"

    class Meta:
        ordering = ["-created_at"]


class IssueAttachment(models.Model):
    ATTACHMENT_TYPES = (
        ("image", "Image"),
        ("video", "Video"),
        ("document", "Document"),
    )

    issue = models.ForeignKey(
        Issue, on_delete=models.CASCADE, related_name="attachments"
    )
    file = models.FileField(upload_to="issue_attachments/")
    attachment_type = models.CharField(max_length=10, choices=ATTACHMENT_TYPES)
    description = models.CharField(max_length=200, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.issue.reference_number} - {self.attachment_type}"


class IssueResponse(models.Model):
    RESPONSE_TYPES = (
        ("response", "Response"),
        ("pending", "Mark as Pending"),
        ("resolved", "Mark as Resolved"),
        ("escalate", "Escalate"),
    )

    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name="responses")
    responder = models.ForeignKey(User, on_delete=models.CASCADE)
    response_type = models.CharField(max_length=10, choices=RESPONSE_TYPES)
    message = models.TextField()
    language = models.CharField(
        max_length=2, choices=Issue.LANGUAGE_CHOICES, default="en"
    )

    # For pending responses - additional time requested
    additional_days = models.IntegerField(
        null=True, blank=True, help_text="Additional days requested for pending"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.issue.reference_number} - {self.response_type} by {self.responder.username}"

    class Meta:
        ordering = ["-created_at"]


class ResponseAttachment(models.Model):
    response = models.ForeignKey(
        IssueResponse, on_delete=models.CASCADE, related_name="attachments"
    )
    file = models.FileField(upload_to="response_attachments/")
    description = models.CharField(max_length=200, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Response {self.response.id} - Attachment"


class IssueEscalation(models.Model):
    issue = models.ForeignKey(
        Issue, on_delete=models.CASCADE, related_name="escalations"
    )
    from_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="escalated_from",
        null=True,
        blank=True,
    )
    to_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="escalated_to",
        null=True,
        blank=True,
    )
    from_level = models.CharField(max_length=20)
    to_level = models.CharField(max_length=20)
    reason = models.TextField()
    escalated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.issue.reference_number} - {self.from_level} to {self.to_level}"

    class Meta:
        ordering = ["-escalated_at"]


class PublicComment(models.Model):
    issue = models.ForeignKey(
        Issue, on_delete=models.CASCADE, related_name="public_comments"
    )
    commenter = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    commenter_name = models.CharField(
        max_length=200, help_text="Name for anonymous comments"
    )
    comment = models.TextField()
    language = models.CharField(
        max_length=2, choices=Issue.LANGUAGE_CHOICES, default="en"
    )
    is_anonymous = models.BooleanField(default=False)
    is_approved = models.BooleanField(
        default=False
    )  # Comments need approval before showing
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment on {self.issue.reference_number} by {self.commenter_name}"

    class Meta:
        ordering = ["-created_at"]


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ("new_issue", "New Issue"),
        ("issue_response", "Issue Response"),
        ("issue_escalated", "Issue Escalated"),
        ("issue_resolved", "Issue Resolved"),
        ("reminder", "Reminder"),
    )

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"

    class Meta:
        ordering = ["-created_at"]


class SystemSettings(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.CharField(max_length=300, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.key}: {self.value[:50]}"


class GoogleAuthUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='google_auth')
    google_id = models.CharField(max_length=100, unique=True)
    google_email = models.EmailField()
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - Google Auth"


class OTPVerification(models.Model):
    OTP_TYPES = (
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('google_auth', 'Google Authenticator'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otp_verifications')
    otp_type = models.CharField(max_length=20, choices=OTP_TYPES)
    otp_code = models.CharField(max_length=6)
    secret_key = models.CharField(max_length=32, blank=True, null=True)  # For TOTP
    is_verified = models.BooleanField(default=False)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if not self.otp_code:
            if self.otp_type == 'google_auth':
                # Generate TOTP secret
                self.secret_key = pyotp.random_base32()
                totp = pyotp.TOTP(self.secret_key)
                self.otp_code = totp.now()
            else:
                # Generate 6-digit OTP for email/SMS
                self.otp_code = ''.join(random.choices(string.digits, k=6))
        
        if not self.expires_at:
            if self.otp_type == 'google_auth':
                self.expires_at = timezone.now() + timedelta(minutes=5)  # TOTP expires in 5 minutes
            else:
                self.expires_at = timezone.now() + timedelta(minutes=10)  # Email/SMS OTP expires in 10 minutes
        
        super().save(*args, **kwargs)
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def verify_otp(self, provided_otp):
        if self.is_expired() or self.is_used:
            return False
        
        if self.otp_type == 'google_auth':
            totp = pyotp.TOTP(self.secret_key)
            is_valid = totp.verify(provided_otp)
        else:
            is_valid = self.otp_code == provided_otp
        
        if is_valid:
            self.is_verified = True
            self.is_used = True
            self.save()
        
        return is_valid
    
    def get_qr_code_url(self):
        """Generate QR code URL for Google Authenticator"""
        if self.otp_type == 'google_auth' and self.secret_key:
            totp_uri = pyotp.totp.TOTP(self.secret_key).provisioning_uri(
                name=self.user.email,
                issuer_name="GovSol"
            )
            return totp_uri
        return None
    
    def __str__(self):
        return f"{self.user.username} - {self.otp_type} OTP"
    
    class Meta:
        ordering = ['-created_at']


class LoginAttempt(models.Model):
    email = models.EmailField()
    google_id = models.CharField(max_length=100, blank=True, null=True)
    ip_address = models.GenericIPAddressField()
    is_successful = models.BooleanField(default=False)
    otp_verified = models.BooleanField(default=False)
    attempt_time = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.email} - {self.attempt_time}"
    
    class Meta:
        ordering = ['-attempt_time']
