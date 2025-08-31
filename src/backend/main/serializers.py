from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import (
    User,
    Province,
    District,
    DSDivision,
    GramaNiladhariDivision,
    Issue,
    IssueAttachment,
    IssueResponse,
    ResponseAttachment,
    IssueEscalation,
    PublicComment,
    Notification,
    SystemSettings,
)


# TODO: Model serializers


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "user_type",
            "phone",
            "address",
            "national_id",
            "province",
            "district",
            "ds_division",
            "grama_niladhari_division",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        user = User.objects.create_user(**validated_data)

        # Only citizens are auto-approved
        if user.user_type == "citizen":
            user.is_approved = True
            user.save()

        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError("Invalid credentials")
            if not user.is_approved:
                raise serializers.ValidationError("Account not approved yet")
            attrs["user"] = user
        else:
            raise serializers.ValidationError("Username and password required")

        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "user_type",
            "phone",
            "address",
            "national_id",
            "profile_picture",
            "province",
            "district",
            "ds_division",
            "grama_niladhari_division",
            "is_approved",
            "created_at",
        ]
        read_only_fields = ["id", "username", "user_type", "is_approved", "created_at"]


class ProvinceSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        source="name_en", read_only=True
    )  # Default to English name

    class Meta:
        model = Province
        fields = ["id", "name", "name_en", "name_si", "name_ta"]


class DistrictSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        source="name_en", read_only=True
    )  # Default to English name
    province_name = serializers.CharField(source="province.name_en", read_only=True)

    class Meta:
        model = District
        fields = [
            "id",
            "name",
            "name_en",
            "name_si",
            "name_ta",
            "province",
            "province_name",
        ]


class DSDivisionSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        source="name_en", read_only=True
    )  # Default to English name
    district_name = serializers.CharField(source="district.name_en", read_only=True)
    province_name = serializers.CharField(
        source="district.province.name_en", read_only=True
    )

    class Meta:
        model = DSDivision
        fields = [
            "id",
            "name",
            "name_en",
            "name_si",
            "name_ta",
            "district",
            "district_name",
            "province_name",
        ]


class GramaNiladhariDivisionSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        source="name_en", read_only=True
    )  # Default to English name
    ds_division_name = serializers.CharField(
        source="ds_division.name_en", read_only=True
    )
    district_name = serializers.CharField(
        source="ds_division.district.name_en", read_only=True
    )
    province_name = serializers.CharField(
        source="ds_division.district.province.name_en", read_only=True
    )

    class Meta:
        model = GramaNiladhariDivision
        fields = [
            "id",
            "name",
            "name_en",
            "name_si",
            "name_ta",
            "ds_division",
            "ds_division_name",
            "district_name",
            "province_name",
        ]


class IssueAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()

    class Meta:
        model = IssueAttachment
        fields = [
            "id",
            "file",
            "file_url",
            "file_size",
            "attachment_type",
            "description",
            "uploaded_at",
        ]

    def get_file_url(self, obj):
        request = self.context.get("request")
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url if obj.file else None

    def get_file_size(self, obj):
        if obj.file:
            return obj.file.size
        return None


class ResponseAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()
    attachment_type = serializers.SerializerMethodField()

    class Meta:
        model = ResponseAttachment
        fields = [
            "id",
            "file",
            "file_url",
            "file_size",
            "attachment_type",
            "description",
            "uploaded_at",
        ]

    def get_file_url(self, obj):
        request = self.context.get("request")
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url if obj.file else None

    def get_file_size(self, obj):
        if obj.file:
            return obj.file.size
        return None

    def get_attachment_type(self, obj):
        if obj.file:
            if obj.file.name.lower().endswith(
                (".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp")
            ):
                return "image"
            elif obj.file.name.lower().endswith(
                (".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm")
            ):
                return "video"
        return "document"


class IssueResponseSerializer(serializers.ModelSerializer):
    responder_name = serializers.CharField(
        source="responder.get_full_name", read_only=True
    )
    responder_role = serializers.CharField(source="responder.user_type", read_only=True)
    status_change = serializers.CharField(source="response_type", read_only=True)
    attachments = serializers.SerializerMethodField()

    class Meta:
        model = IssueResponse
        fields = [
            "id",
            "response_type",
            "message",
            "language",
            "additional_days",
            "responder_name",
            "responder_role",
            "status_change",
            "attachments",
            "created_at",
        ]

    def get_attachments(self, obj):
        attachments = obj.attachments.all()
        return ResponseAttachmentSerializer(
            attachments, many=True, context=self.context
        ).data


class IssueEscalationSerializer(serializers.ModelSerializer):
    from_user_name = serializers.CharField(
        source="from_user.get_full_name", read_only=True
    )
    to_user_name = serializers.CharField(source="to_user.get_full_name", read_only=True)

    class Meta:
        model = IssueEscalation
        fields = [
            "id",
            "from_level",
            "to_level",
            "reason",
            "from_user_name",
            "to_user_name",
            "escalated_at",
        ]


class PublicCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="commenter_name", read_only=True)
    content = serializers.CharField(source="comment")

    class Meta:
        model = PublicComment
        fields = [
            "id",
            "author_name",
            "content",
            "language",
            "is_anonymous",
            "is_approved",
            "created_at",
        ]


class IssueListSerializer(serializers.ModelSerializer):
    reporter_name = serializers.CharField(read_only=True)
    province_name = serializers.CharField(source="province.name_en", read_only=True)
    district_name = serializers.CharField(source="district.name_en", read_only=True)
    ds_division_name = serializers.CharField(
        source="ds_division.name_en", read_only=True
    )
    gn_division_name = serializers.CharField(
        source="grama_niladhari_division.name_en", read_only=True
    )
    current_handler_name = serializers.CharField(
        source="current_handler.get_full_name", read_only=True
    )
    response_count = serializers.SerializerMethodField()
    attachments = serializers.SerializerMethodField()

    class Meta:
        model = Issue
        fields = [
            "id",
            "reference_number",
            "title",
            "description",
            "language",
            "status",
            "priority",
            "reporter_name",
            "is_anonymous",
            "province_name",
            "district_name",
            "ds_division_name",
            "gn_division_name",
            "current_handler_name",
            "current_level",
            "escalation_count",
            "response_count",
            "attachments",
            "created_at",
            "updated_at",
        ]

    def get_response_count(self, obj):
        return obj.responses.count()

    def get_attachments(self, obj):
        attachments = obj.attachments.all()
        attachment_data = []
        for attachment in attachments:
            file_type = "image"
            if attachment.file and attachment.file.name:
                if attachment.file.name.lower().endswith(
                    (".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm")
                ):
                    file_type = "video"
                elif not attachment.file.name.lower().endswith(
                    (".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp")
                ):
                    file_type = "document"

            request = self.context.get("request")
            file_url = None
            if request and attachment.file:
                file_url = request.build_absolute_uri(attachment.file.url)
            elif attachment.file:
                file_url = attachment.file.url

            attachment_data.append(
                {
                    "id": attachment.id,
                    "file_url": file_url,
                    "file_type": file_type,
                    "description": attachment.description or "",
                    "uploaded_at": attachment.uploaded_at,
                }
            )
        return attachment_data


class EscalatedIssueSerializer(serializers.ModelSerializer):
    """
    Serializer for escalated issues with additional escalation information
    """

    reporter_name = serializers.CharField(read_only=True)
    province_name = serializers.CharField(source="province.name_en", read_only=True)
    district_name = serializers.CharField(source="district.name_en", read_only=True)
    ds_division_name = serializers.CharField(
        source="ds_division.name_en", read_only=True
    )
    gn_division_name = serializers.CharField(
        source="grama_niladhari_division.name_en", read_only=True
    )
    current_handler_name = serializers.CharField(
        source="current_handler.get_full_name", read_only=True
    )
    response_count = serializers.SerializerMethodField()
    latest_escalation = serializers.SerializerMethodField()
    original_level = serializers.SerializerMethodField()

    class Meta:
        model = Issue
        fields = [
            "id",
            "reference_number",
            "title",
            "description",
            "language",
            "status",
            "priority",
            "reporter_name",
            "is_anonymous",
            "province_name",
            "district_name",
            "ds_division_name",
            "gn_division_name",
            "current_handler_name",
            "current_level",
            "escalation_count",
            "response_count",
            "latest_escalation",
            "original_level",
            "created_at",
            "updated_at",
        ]

    def get_response_count(self, obj):
        return obj.responses.count()

    def get_latest_escalation(self, obj):
        latest = obj.escalations.order_by("-escalated_at").first()
        if latest:
            return {
                "from_level": latest.from_level,
                "to_level": latest.to_level,
                "reason": latest.reason,
                "escalated_at": latest.escalated_at,
                "from_user": (
                    latest.from_user.get_full_name() if latest.from_user else None
                ),
                "to_user": latest.to_user.get_full_name() if latest.to_user else None,
            }
        return None

    def get_original_level(self, obj):
        # Get the first escalation to determine original level
        first_escalation = obj.escalations.order_by("escalated_at").first()
        if first_escalation:
            return first_escalation.from_level
        return "grama_niladhari"  # Default starting level


class IssueDetailSerializer(serializers.ModelSerializer):
    reporter_name = serializers.CharField(read_only=True)
    province_name = serializers.CharField(source="province.name_en", read_only=True)
    district_name = serializers.CharField(source="district.name_en", read_only=True)
    ds_division_name = serializers.CharField(
        source="ds_division.name_en", read_only=True
    )
    gn_division_name = serializers.CharField(
        source="grama_niladhari_division.name_en", read_only=True
    )
    current_handler_name = serializers.CharField(
        source="current_handler.get_full_name", read_only=True
    )
    attachments = serializers.SerializerMethodField()
    responses = IssueResponseSerializer(many=True, read_only=True)
    escalations = IssueEscalationSerializer(many=True, read_only=True)
    public_comments = PublicCommentSerializer(many=True, read_only=True)

    class Meta:
        model = Issue
        fields = [
            "id",
            "reference_number",
            "title",
            "description",
            "language",
            "status",
            "priority",
            "reporter_name",
            "reporter_phone",
            "reporter_address",
            "is_anonymous",
            "province_name",
            "district_name",
            "ds_division_name",
            "gn_division_name",
            "current_handler_name",
            "current_level",
            "escalation_count",
            "next_escalation_date",
            "pending_extension_count",
            "attachments",
            "responses",
            "escalations",
            "public_comments",
            "created_at",
            "updated_at",
            "resolved_at",
        ]

    def get_attachments(self, obj):
        attachments = obj.attachments.all()
        return IssueAttachmentSerializer(
            attachments, many=True, context=self.context
        ).data


class IssueCreateSerializer(serializers.ModelSerializer):
    # For anonymous submissions
    anonymous_name = serializers.CharField(required=False, allow_blank=True)
    anonymous_phone = serializers.CharField(required=False, allow_blank=True)
    anonymous_address = serializers.CharField(required=False, allow_blank=True)
    anonymous_id = serializers.CharField(required=False, allow_blank=True)

    # Support both field names for backward compatibility
    gn_division = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Issue
        fields = [
            "title",
            "description",
            "category",
            "language",
            "priority",
            "province",
            "district",
            "ds_division",
            "gn_division",
            "address",
            "is_anonymous",
            "anonymous_name",
            "anonymous_phone",
            "anonymous_address",
            "anonymous_id",
        ]

    def create(self, validated_data):
        request = self.context.get("request")

        # Handle gn_division field mapping
        gn_division = validated_data.pop("gn_division", None)
        if gn_division:
            validated_data["grama_niladhari_division_id"] = gn_division

        # Set reporter information based on submission type
        if validated_data.get("is_anonymous", False):
            # For anonymous submissions, use provided anonymous data
            validated_data["reporter_name"] = validated_data.pop("anonymous_name", "")
            validated_data["reporter_phone"] = validated_data.pop("anonymous_phone", "")
            validated_data["reporter_address"] = validated_data.pop(
                "anonymous_address", ""
            )
            validated_data["reporter_national_id"] = validated_data.pop(
                "anonymous_id", ""
            )
        else:
            # For logged-in users, use their profile data
            if request and request.user.is_authenticated:
                validated_data["reporter_user"] = request.user
                validated_data["reporter_name"] = (
                    request.user.get_full_name() or request.user.username
                )
                validated_data["reporter_phone"] = request.user.phone or ""
                validated_data["reporter_address"] = request.user.address or ""
                validated_data["reporter_national_id"] = request.user.national_id or ""
            else:
                # Guest submission - ensure reporter_name is provided
                if not validated_data.get("reporter_name"):
                    validated_data["reporter_name"] = validated_data.pop(
                        "anonymous_name", "Anonymous User"
                    )
                validated_data["reporter_phone"] = validated_data.pop(
                    "anonymous_phone", ""
                )
                validated_data["reporter_address"] = validated_data.pop(
                    "anonymous_address", ""
                )
                validated_data["reporter_national_id"] = validated_data.pop(
                    "anonymous_id", ""
                )

        # Clean up any remaining anonymous fields
        validated_data.pop("anonymous_name", None)
        validated_data.pop("anonymous_phone", None)
        validated_data.pop("anonymous_address", None)
        validated_data.pop("anonymous_id", None)

        # Ensure reporter_name is always set
        if not validated_data.get("reporter_name"):
            validated_data["reporter_name"] = "Anonymous User"

        print("Final validated_data:", validated_data)  # Debug

        issue = Issue.objects.create(**validated_data)

        # Auto-assign to appropriate Grama Niladhari if GN division is provided
        if issue.grama_niladhari_division:
            from django.db.models import Q

            gn_users = User.objects.filter(
                user_type="grama_niladhari",
                is_approved=True,
                province=issue.province,
                district=issue.district,
                ds_division=issue.ds_division,
                grama_niladhari_division=issue.grama_niladhari_division,
            )

            if gn_users.exists():
                issue.current_handler = gn_users.first()
                issue.save()

        return issue


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "notification_type",
            "title",
            "message",
            "issue",
            "is_read",
            "created_at",
        ]


class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = ["id", "key", "value", "description", "updated_at"]
