import React, { createContext, useState, useEffect, useContext } from 'react';

export const LanguageContext = createContext();

const translations = {
  en: {
    // Navigation
    home: 'Home',
    publicIssues: 'Public Issues',
    submitIssue: 'Submit Issue',
    dashboard: 'Dashboard',
    myIssues: 'My Issues',
    escalatedIssues: 'Escalated Issues',
    profile: 'Profile',
    settings: 'Settings',
    signIn: 'Sign in',
    register: 'Register',
    signOut: 'Sign out',
    
    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    edit: 'Edit',
    delete: 'Delete',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    language: 'Language',
    
    // Issue related
    issueTitle: 'Issue Title',
    description: 'Description',
    category: 'Category',
    priority: 'Priority',
    status: 'Status',
    attachments: 'Attachments',
    responses: 'Responses',
    comments: 'Comments',
    
    // Status
    pending: 'Pending',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    escalated: 'Escalated',
    closed: 'Closed',
    
    // Status Management
    updateStatus: 'Update Status',
    changeStatus: 'Change Status',
    statusUpdated: 'Status updated successfully',
    statusUpdateFailed: 'Failed to update status',
    noStatusChange: 'No status change',
    selectNewStatus: 'Select new status',
    statusChangeReason: 'Reason for status change',
    statusSelected: 'Status selected',
    
    // Location and Officers
    locationDetails: 'Location Details',
    responsibleOfficers: 'Responsible Officers',
    currentHandler: 'Current Handler',
    handlerLevel: 'Handler Level',
    
    // Priority
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
    
    // Categories
    infrastructure: 'Infrastructure',
    utilities: 'Utilities',
    transportation: 'Transportation',
    healthcare: 'Healthcare',
    education: 'Education',
    environment: 'Environment',
    publicSafety: 'Public Safety',
    other: 'Other',
    
    // Image viewer
    imageNotAvailable: 'Image not available',
    documentPreviewNotAvailable: 'Document Preview Not Available',
    downloadFile: 'Download File',
    
    // Location
    province: 'Province',
    district: 'District',
    dsDivision: 'DS Division',
    gnDivision: 'GN Division',
    address: 'Address',
    
    // Messages
    submitSuccess: 'Submitted successfully!',
    submitError: 'Failed to submit. Please try again.',
    loginSuccess: 'Login successful',
    logoutSuccess: 'Logged out successfully',
    
    // Registration & Authentication
    username: 'Username',
    email: 'Email',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone Number',
    nationalId: 'National ID',
    optional: 'Optional',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    allFieldsRequired: 'All required fields must be filled',
    invalidEmail: 'Please enter a valid email address',
    passwordMinLength: 'Password must be at least 6 characters',
    passwordsMustMatch: 'Passwords must match',
    registrationSuccess: 'Registration successful! Redirecting to login...',
    registrationFailed: 'Registration failed. Please try again.',
    alreadyHaveAccount: 'Already have an account?',
    
    // Login specific
    governmentSolutionSystem: 'Government Solution System',
    signInToAccount: 'Sign in to your account',
    enterUsername: 'Enter your username',
    enterPassword: 'Enter your password',
    usernameRequired: 'Username is required',
    passwordRequired: 'Password is required',
    loginFailed: 'Login failed. Please check your credentials.',
    
    // Profile
    editProfile: 'Edit Profile',
    personalInformation: 'Personal Information',
    accountInformation: 'Account Information',
    profilePicture: 'Profile Picture',
    notSpecified: 'Not Specified',
    memberSince: 'Member Since',
    accountStatus: 'Account Status',
    approved: 'Approved',
    profileUpdated: 'Profile updated successfully',
    profileUpdateFailed: 'Failed to update profile',
    saving: 'Saving...',
    forgotPassword: 'Forgot your password?',
    dontHaveAccount: "Don't have an account?",
    
    // Home page
    heroTitle: 'Government Issue',
    heroTitleHighlight: 'Management System',
    heroSubtitle: 'Report government issues efficiently and track their resolution through our transparent hierarchical system. From Grama Niladhari to Prime Minister - ensuring accountability at every level.',
    reportAnIssue: 'Report an Issue',
    viewPublicIssues: 'View Public Issues',
    transparentGovernance: 'Transparent Governance',
    accountabilityThroughTechnology: 'Accountability Through Technology',
    features: 'Features',
    howOurSystemWorks: 'How Our System Works',
    systemDescription: 'Our comprehensive issue management system ensures your concerns reach the right authorities and get resolved efficiently through a structured escalation process.',
    easyIssueReporting: 'Easy Issue Reporting',
    easyIssueReportingDesc: 'Submit issues with detailed descriptions, location information, and supporting documents. Our system automatically routes your issue to the appropriate authority level.',
    hierarchicalProcessing: 'Hierarchical Processing',
    hierarchicalProcessingDesc: 'Issues are processed through our 8-tier government hierarchy: from Grama Niladhari to Prime Minister, ensuring appropriate escalation when needed.',
    realTimeTracking: 'Real-time Tracking',
    realTimeTrackingDesc: 'Track the status of your issues in real-time. Get notifications when your issue moves between departments or gets resolved.',
    transparentProcess: 'Transparent Process',
    transparentProcessDesc: 'View public issues and their resolution progress. Our transparent system builds trust and accountability in government services.',
    governmentHierarchy: 'Government Hierarchy',
    tierEscalationSystem: '8-Tier Escalation System',
    hierarchyDescription: 'Issues are handled at the appropriate level and escalated when necessary to ensure resolution.',
    citizen: 'Citizen',
    citizenDesc: 'Submit and track issues',
    admin: 'Admin',
    adminDesc: 'System administration and oversight',
    gramaNiladhari: 'Grama Niladhari',
    gramaNiladhariDesc: 'Handle local community issues',
    divisionalSecretary: 'Divisional Secretary',
    divisionalSecretaryDesc: 'Manage divisional matters',
    districtSecretary: 'District Secretary',
    districtSecretaryDesc: 'Oversee district-wide issues',
    provincialMinistry: 'Provincial Ministry',
    provincialMinistryDesc: 'Handle provincial concerns',
    nationalMinistry: 'National Ministry',
    nationalMinistryDesc: 'Manage national policy issues',
    primeMinister: 'Prime Minister',
    primeMinisterDesc: 'Ultimate authority for escalations',
    
    // Additional home page content
    whyChooseOurSystem: 'Why Choose Our System?',
    systemBenefits: 'Our comprehensive issue management system ensures your concerns reach the right authorities and get resolved efficiently through a structured escalation process.',
    issueEscalation: 'Issue Escalation',
    hierarchicalSystem: 'Hierarchical System',
    hierarchicalSystemDesc: 'Issues are handled at the appropriate level and escalated when necessary to ensure resolution.',
    
    // Features and descriptions for home page
    quicklyReportIssues: 'Quickly report issues with detailed descriptions and supporting documents.',
    trackProgress: 'Track Progress',
    monitorIssueProgress: 'Monitor the progress of your issues through real-time updates and notifications.',
    transparentProcessDescription: 'View public issues and their resolution progress through our transparent system.',
    ensureAccountability: 'Ensure accountability at every level of government through technology-driven tracking.',
    
    // Process steps
    reportIssue: 'Report Issue',
    reportIssueDescription: 'Submit your issue with detailed information and supporting documents.',
    automaticRouting: 'Automatic Routing',
    automaticRoutingDescription: 'System automatically routes your issue to the appropriate government level.',
    officialResponse: 'Official Response',
    officialResponseDescription: 'Government officials review and respond to your issue promptly.',
    resolution: 'Resolution',
    resolutionDescription: 'Track the resolution progress and receive updates until completion.',
    
    // Statistics
    issuesResolved: 'Issues Resolved',
    satisfactionRate: 'Satisfaction Rate',
    systemAvailability: 'System Availability',
    governmentLevels: 'Government Levels',
    
    // Additional content
    issueCategories: 'Issue Categories',
    categoriesDescription: 'Report issues across various government service categories.',
    stepByStepProcess: 'Follow our simple step-by-step process to report and track government issues.',
    readyToGetStarted: 'Ready to Get Started?',
    joinThousands: 'Join thousands of citizens working together to improve government services.',
    getStartedToday: 'Get Started Today',
    learnMore: 'Learn More',
    
    // Call-to-Action
    readyToReport: 'Ready to report an issue?',
    startToday: 'Start the process today.',
    joinCitizens: 'Join thousands of citizens working together to improve government services through transparency and accountability.',
    getStartedNow: 'Get Started Now',
    exploreIssues: 'Explore Issues',
  },
  
  si: {
    // Navigation
    home: 'මුල් පිටුව',
    publicIssues: 'මහජන ගැටළු',
    submitIssue: 'ගැටළුවක් ඉදිරිපත් කරන්න',
    dashboard: 'උපකරණ පුවරුව',
    myIssues: 'මගේ ගැටළු',
    escalatedIssues: 'උඩු තට්ටුවට යැවූ ගැටළු',
    profile: 'පැතිකඩ',
    settings: 'සැකසුම්',
    signIn: 'පිවිසෙන්න',
    register: 'ලියාපදිංචි වන්න',
    signOut: 'පිටවන්න',
    
    // Common
    loading: 'පූරණය වෙමින්...',
    save: 'සුරකින්න',
    cancel: 'අවලංගු කරන්න',
    submit: 'ඉදිරිපත් කරන්න',
    edit: 'සංස්කරණය',
    delete: 'මකන්න',
    back: 'ආපසු',
    next: 'ඊළඟ',
    previous: 'කලින්',
    language: 'භාෂාව',
    
    // Issue related
    issueTitle: 'ගැටළුවේ මාතෘකාව',
    description: 'විස්තරය',
    category: 'වර්ගය',
    priority: 'ප්‍රමුඛතාවය',
    status: 'තත්ත්වය',
    attachments: 'ඇමුණුම්',
    responses: 'ප්‍රතිචාර',
    comments: 'අදහස්',
    
    // Status
    pending: 'බලාපොරොත්තුවෙන්',
    inProgress: 'ක්‍රියාත්මක වෙමින්',
    resolved: 'විසඳා ඇත',
    escalated: 'උඩු තට්ටුවට යවා ඇත',
    closed: 'වසා ඇත',
    
    // Status Management
    updateStatus: 'තත්ත්වය යාවත්කාලීන කරන්න',
    changeStatus: 'තත්ත්වය වෙනස් කරන්න',
    statusUpdated: 'තත්ත්වය සාර්ථකව යාවත්කාලීන කරන ලදී',
    statusUpdateFailed: 'තත්ත්වය යාවත්කාලීන කිරීම අසාර්ථක විය',
    noStatusChange: 'තත්ත්වය වෙනස් කිරීමක් නැත',
    selectNewStatus: 'නව තත්ත්වයක් තෝරන්න',
    statusChangeReason: 'තත්ත්වය වෙනස් කිරීමට හේතුව',
    statusSelected: 'තත්ත්වය තෝරා ගන්නා ලදී',
    
    // Location and Officers
    locationDetails: 'ස්ථාන විස්තර',
    responsibleOfficers: 'වගකිව යුතු නිලධාරීන්',
    currentHandler: 'වර්තමාන හසුරුවන්නා',
    handlerLevel: 'හසුරුවන්නාගේ මට්ටම',
    
    // Priority
    low: 'අඩු',
    
    // Profile
    editProfile: 'පැතිකඩ සංස්කරණය කරන්න',
    personalInformation: 'පුද්ගලික තොරතුරු',
    accountInformation: 'ගිණුම් තොරතුරු',
    profilePicture: 'පැතිකඩ පින්තූරය',
    notSpecified: 'සඳහන් කර නැත',
    memberSince: 'සාමාජිකයා වූ දිනෙන්',
    accountStatus: 'ගිණුම් තත්ත්වය',
    approved: 'අනුමත',
    profileUpdated: 'පැතිකඩ යාවත්කාලීන කරන ලදී',
    profileUpdateFailed: 'පැතිකඩ යාවත්කාලීන කිරීම අසාර්ථක විය',
    saving: 'සුරකිමින්...',
    medium: 'මධ්‍යම',
    high: 'ඉහළ',
    urgent: 'හදිසි',
    
    // Categories
    infrastructure: 'යටිතල පහසුකම්',
    utilities: 'උපයෝගිතා',
    transportation: 'ප්‍රවාහනය',
    healthcare: 'සෞඛ්‍ය සේවා',
    education: 'අධ්‍යාපනය',
    environment: 'පරිසරය',
    publicSafety: 'මහජන ආරක්ෂාව',
    other: 'වෙනත්',
    
    // Image viewer
    imageNotAvailable: 'රූපය නොමැත',
    documentPreviewNotAvailable: 'ලේඛන පෙරදසුන නොමැත',
    downloadFile: 'ගොනුව බාගන්න',
    
    // Location
    province: 'පළාත',
    district: 'දිස්ත්‍රික්කය',
    dsDivision: 'ප්‍රාදේශීය ලේකම් කොට්ඨාසය',
    gnDivision: 'ග්‍රාම නිලධාරී කොට්ඨාසය',
    address: 'ලිපිනය',
    
    // Messages
    submitSuccess: 'සාර්ථකව ඉදිරිපත් කරන ලදී!',
    submitError: 'ඉදිරිපත් කිරීම අසාර්ථක විය. කරුණාකර නැවත උත්සාහ කරන්න.',
    loginSuccess: 'සාර්ථකව පිවිසුණි',
    logoutSuccess: 'සාර්ථකව පිටව ගියේය',
    
    // Registration & Authentication
    username: 'පරිශීලක නාමය',
    email: 'විද්‍යුත් තැපෑල',
    firstName: 'මුල් නම',
    lastName: 'අවසන් නම',
    phone: 'දුරකථන අංකය',
    nationalId: 'ජාතික හැඳුනුම්පත',
    optional: 'අතිරේක',
    password: 'මුරපදය',
    confirmPassword: 'මුරපදය තහවුරු කරන්න',
    allFieldsRequired: 'සියලුම අවශ්‍ය ක්ෂේත්‍ර පුරණය කළ යුතුය',
    invalidEmail: 'කරුණාකර වලංගු විද්‍යුත් තැපැල් ලිපිනයක් ඇතුළත් කරන්න',
    passwordMinLength: 'මුරපදය අවම වශයෙන් අක්ෂර 6ක් විය යුතුය',
    passwordsMustMatch: 'මුරපද ගැලපිය යුතුය',
    registrationSuccess: 'ලියාපදිංචිය සාර්ථකයි! පිවිසීමට යොමු කරමින්...',
    registrationFailed: 'ලියාපදිංචිය අසාර්ථක විය. කරුණාකර නැවත උත්සාහ කරන්න.',
    alreadyHaveAccount: 'දැනටමත් ගිණුමක් තිබේද?',
    
    // Login specific
    governmentSolutionSystem: 'රජයේ විසඳුම් පද්ධතිය',
    signInToAccount: 'ඔබේ ගිණුමට පිවිසෙන්න',
    enterUsername: 'ඔබේ පරිශීලක නාමය ඇතුළත් කරන්න',
    enterPassword: 'ඔබේ මුරපදය ඇතුළත් කරන්න',
    usernameRequired: 'පරිශීලක නාමය අවශ්‍ය වේ',
    passwordRequired: 'මුරපදය අවශ්‍ය වේ',
    loginFailed: 'පිවිසීම අසාර්ථක විය. කරුණාකර ඔබේ අක්තපත්‍ර පරීක්ෂා කරන්න.',
    forgotPassword: 'ඔබේ මුරපදය අමතකද?',
    dontHaveAccount: 'ගිණුමක් නොමැතිද?',
    
    // Home page
    heroTitle: 'රජයේ ගැටළු',
    heroTitleHighlight: 'කළමනාකරණ පද්ධතිය',
    heroSubtitle: 'රජයේ ගැටළු කාර්යක්ෂමව වාර්තා කර ඒවායේ විසඳුම් අපගේ විනිවිදභාවය සහිත ධූරාවලි පද්ධතිය හරහා ගොඩ නගා ගන්න. ග්‍රාම නිලධාරීගේ සිට අගමැතිවරයා දක්වා - සෑම මට්ටමකදීම වගකීම සහතික කරමින්.',
    reportAnIssue: 'ගැටළුවක් වාර්තා කරන්න',
    viewPublicIssues: 'මහජන ගැටළු බලන්න',
    transparentGovernance: 'විනිවිදභාවයෙන් යුත් පාලනය',
    accountabilityThroughTechnology: 'තාක්ෂණය හරහා වගකීම',
    features: 'විශේෂාංග',
    howOurSystemWorks: 'අපගේ පද්ධතිය ක්‍රියා කරන ආකාරය',
    systemDescription: 'අපගේ සම්පූර්ණ ගැටළු කළමනාකරණ පද්ධතිය ඔබගේ ගැටළු නිසි බලධාරීන් වෙත ළඟා වන ලෙස සහ ව්‍යුහගත උපරිම ක්‍රමයක් හරහා කාර්යක්ෂමව විසඳන ලෙස සහතික කරයි.',
    easyIssueReporting: 'පහසු ගැටළු වාර්තාකරණය',
    easyIssueReportingDesc: 'විස්තරාත්මක විස්තර, ස්ථාන තොරතුරු සහ ආධාරක ලේඛන සමඟ ගැටළු ඉදිරිපත් කරන්න. අපගේ පද්ධතිය ස්වයංක්‍රීයව ඔබේ ගැටළුව සුදුසු බලධාරී මට්ටමට යොමු කරයි.',
    hierarchicalProcessing: 'ධූරාවලි සැකසුම්',
    hierarchicalProcessingDesc: 'ගැටළු අපගේ 8-මට්ටම් රජයේ ධූරාවලිය හරහා සකසනු ලැබේ: ග්‍රාම නිලධාරීගේ සිට අගමැතිවරයා දක්වා, අවශ්‍ය විට සුදුසු උපරිම කිරීම සහතික කරමින්.',
    realTimeTracking: 'තථ්‍ය කාලීන ලුහුබැඳීම',
    realTimeTrackingDesc: 'ඔබේ ගැටළුවල තත්ත්වය තථ්‍ය කාලීනව ලුහුබඳින්න. ඔබේ ගැටළුව දෙපාර්තමේන්තු අතර ගමන් කරන විට හෝ විසඳන විට දැනුම්දීම් ලබා ගන්න.',
    transparentProcess: 'විනිවිදභාවයෙන් යුත් ක්‍රියාදාමය',
    transparentProcessDesc: 'මහජන ගැටළු සහ ඒවායේ විසඳුම් ප්‍රගතිය බලන්න. අපගේ විනිවිදභාවයෙන් යුත් පද්ධතිය රජයේ සේවාවන්හි විශ්වාසය සහ වගකීම ගොඩනගයි.',
    governmentHierarchy: 'රජයේ ධූරාවලිය',
    tierEscalationSystem: '8-මට්ටම් උපරිම පද්ධතිය',
    hierarchyDescription: 'ගැටළු සුදුසු මට්ටමේ හසුරුවනු ලබන අතර විසඳුම සහතික කිරීම සඳහා අවශ්‍ය විට උපරිම කරනු ලැබේ.',
    citizen: 'පුරවැසියා',
    citizenDesc: 'ගැටළු ඉදිරිපත් කර ලුහුබඳින්න',
    admin: 'පරිපාලක',
    adminDesc: 'පද්ධති පරිපාලනය සහ අධීක්ෂණය',
    gramaNiladhari: 'ග්‍රාම නිලධාරි',
    gramaNiladhariDesc: 'ප්‍රාදේශීය ප්‍රජා ගැටළු හසුරුවන්න',
    divisionalSecretary: 'ප්‍රාදේශීය ලේකම්',
    divisionalSecretaryDesc: 'ප්‍රාදේශීය කරුණු කළමනාකරණය කරන්න',
    districtSecretary: 'දිස්ත්‍රික් ලේකම්',
    districtSecretaryDesc: 'දිස්ත්‍රික් පුරා ගැටළු අධීක්ෂණය කරන්න',
    provincialMinistry: 'පළාත් අමාත්‍යාංශය',
    provincialMinistryDesc: 'පළාත් ගැටළු හසුරුවන්න',
    nationalMinistry: 'ජාතික අමාත්‍යාංශය',
    nationalMinistryDesc: 'ජාතික ප්‍රතිපත්ති ගැටළු කළමනාකරණය කරන්න',
    primeMinister: 'අගමැති',
    primeMinisterDesc: 'උපරිම කිරීම් සඳහා අවසාන බලධාරිය',
    
    // Features and descriptions for home page
    quicklyReportIssues: 'විස්තරාත්මක විස්තර සහ ආධාරක ලේඛන සමඟ ගැටළු ඉක්මනින් වාර්තා කරන්න.',
    trackProgress: 'ප්‍රගතිය ලුහුබඳින්න',
    monitorIssueProgress: 'තථ්‍ය කාලීන යාවත්කාලීන කිරීම් සහ දැනුම්දීම් හරහා ඔබේ ගැටළුවල ප්‍රගතිය නිරීක්ෂණය කරන්න.',
    transparentProcessDescription: 'අපගේ විනිවිදභාවයෙන් යුත් පද්ධතිය හරහා මහජන ගැටළු සහ ඒවායේ විසඳුම් ප්‍රගතිය බලන්න.',
    ensureAccountability: 'තාක්ෂණය මගින් ගමන් කරන ලුහුබැඳීම හරහා රජයේ සෑම මට්ටමකම වගකීම සහතික කරන්න.',
    
    // Process steps
    reportIssue: 'ගැටළුව වාර්තා කරන්න',
    reportIssueDescription: 'විස්තරාත්මක තොරතුරු සහ ආධාරක ලේඛන සමඟ ඔබේ ගැටළුව ඉදිරිපත් කරන්න.',
    automaticRouting: 'ස්වයංක්‍රීය මාර්ගගත කිරීම',
    automaticRoutingDescription: 'පද්ධතිය ස්වයංක්‍රීයව ඔබේ ගැටළුව සුදුසු රජයේ මට්ටමට යොමු කරයි.',
    officialResponse: 'නිල ප්‍රතිචාරය',
    officialResponseDescription: 'රජයේ නිලධාරීන් ඔබේ ගැටළුව සමාලෝචනය කර ඉක්මනින් ප්‍රතිචාර දක්වයි.',
    resolution: 'විසඳුම',
    resolutionDescription: 'විසඳුම් ප්‍රගතිය ලුහුබඳින්න සහ සම්පූර්ණ වන තුරු යාවත්කාලීන කිරීම් ලබා ගන්න.',
    
    // Statistics
    issuesResolved: 'විසඳූ ගැටළු',
    satisfactionRate: 'තෘප්තිමත් වීමේ අනුපාතය',
    systemAvailability: 'පද්ධති ලබා ගත හැකි බව',
    governmentLevels: 'රජයේ මට්ටම්',
    
    // Additional content
    issueCategories: 'ගැටළු කාණ්ඩ',
    categoriesDescription: 'විවිධ රජයේ සේවා කාණ්ඩ හරහා ගැටළු වාර්තා කරන්න.',
    stepByStepProcess: 'රජයේ ගැටළු වාර්තා කිරීම සහ ලුහුබැඳීම සඳහා අපගේ සරල පියවර අනුගමනය කරන්න.',
    readyToGetStarted: 'ආරම්භ කිරීමට සූදානම්ද?',
    joinThousands: 'රජයේ සේවා වැඩිදියුණු කිරීම සඳහා එකට වැඩ කරන දහස් ගණන් පුරවැසියන් සමඟ එකතු වන්න.',
    getStartedToday: 'අද ආරම්භ කරන්න',
    learnMore: 'වැඩිදුර ඉගෙන ගන්න',
    
    // Additional home page content
    whyChooseOurSystem: 'අපගේ පද්ධතිය තෝරන්නේ ඇයි?',
    systemBenefits: 'අපගේ සම්පූර්ණ ගැටළු කළමනාකරණ පද්ධතිය ඔබගේ ගැටළු නිසි බලධාරීන් වෙත ළඟා වන ලෙස සහ ව්‍යුහගත උපරිම ක්‍රමයක් හරහා කාර්යක්ෂමව විසඳන ලෙස සහතික කරයි.',
    issueEscalation: 'ගැටළු උපරිම කිරීම',
    hierarchicalSystem: 'ධූරාවලි පද්ධතිය',
    hierarchicalSystemDesc: 'ගැටළු සුදුසු මට්ටමේ හසුරුවනු ලබන අතර විසඳුම සහතික කිරීම සඳහා අවශ්‍ය විට උපරිම කරනු ලැබේ.',
    
    // Call-to-Action
    readyToReport: 'ගැටළුවක් වාර්තා කිරීමට සූදානම්ද?',
    startToday: 'අදම ආරම්භ කරන්න.',
    joinCitizens: 'විනිවිදභාවය සහ වගකීම හරහා රජයේ සේවා වැඩිදියුණු කිරීම සඳහා එකට වැඩ කරන දහස් ගණන් පුරවැසියන් සමඟ එකතු වන්න.',
    getStartedNow: 'දැන් ආරම්භ කරන්න',
    exploreIssues: 'ගැටළු ගවේෂණය කරන්න',
  },
  
  ta: {
    // Navigation
    home: 'முகப்பு',
    publicIssues: 'பொது பிரச்சினைகள்',
    submitIssue: 'பிரச்சினையை சமர்ப்பிக்கவும்',
    dashboard: 'கண்காணிப்பு பலகை',
    myIssues: 'என் பிரச்சினைகள்',
    escalatedIssues: 'உயர்த்தப்பட்ட பிரச்சினைகள்',
    profile: 'சுயவிவரம்',
    settings: 'அமைப்புகள்',
    signIn: 'உள்நுழைக',
    register: 'பதிவு செய்க',
    signOut: 'வெளியேறு',
    
    // Common
    loading: 'ஏற்றுகிறது...',
    save: 'சேமிக்கவும்',
    cancel: 'ரத்து செய்க',
    submit: 'சமர்ப்பிக்கவும்',
    edit: 'திருத்து',
    delete: 'நீக்கு',
    back: 'பின்னால்',
    next: 'அடுத்து',
    previous: 'முந்தைய',
    language: 'மொழி',
    
    // Issue related
    issueTitle: 'பிரச்சினை தலைப்பு',
    description: 'விளக்கம்',
    category: 'வகை',
    priority: 'முன்னுரிமை',
    status: 'நிலை',
    attachments: 'இணைப்புகள்',
    responses: 'பதில்கள்',
    comments: 'கருத்துகள்',
    
    // Status
    pending: 'நிலுவையில்',
    inProgress: 'செயல்பாட்டில்',
    resolved: 'தீர்க்கப்பட்டது',
    escalated: 'உயர்த்தப்பட்டது',
    closed: 'மூடப்பட்டது',
    
    // Status Management
    updateStatus: 'நிலையை புதுப்பிக்கவும்',
    changeStatus: 'நிலையை மாற்றவும்',
    statusUpdated: 'நிலை வெற்றிகரமாக புதுப்பிக்கப்பட்டது',
    statusUpdateFailed: 'நிலையை புதுப்பிக்க தோல்வி',
    noStatusChange: 'நிலை மாற்றம் இல்லை',
    selectNewStatus: 'புதிய நிலையை தேர்ந்தெடுக்கவும்',
    statusChangeReason: 'நிலை மாற்றத்திற்கான காரணம்',
    statusSelected: 'நிலை தேர்ந்தெடுக்கப்பட்டது',
    
    // Location and Officers
    locationDetails: 'இடம் விவரங்கள்',
    responsibleOfficers: 'பொறுப்பு அதிகாரிகள்',
    currentHandler: 'தற்போதைய கையாளுபவர்',
    handlerLevel: 'கையாளுபவர் நிலை',
    
    // Priority
    low: 'குறைந்த',
    medium: 'நடுத்தர',
    high: 'உயர்ந்த',
    urgent: 'அவசர',
    
    // Categories
    infrastructure: 'உள்கட்டமைப்பு',
    utilities: 'பயன்பாடுகள்',
    transportation: 'போக்குவரத்து',
    healthcare: 'சுகாதார சேவை',
    education: 'கல்வி',
    environment: 'சுற்றுச்சூழல்',
    publicSafety: 'பொது பாதுகாப்பு',
    other: 'மற்றவை',
    
    // Image viewer
    imageNotAvailable: 'படம் கிடைக்கவில்லை',
    documentPreviewNotAvailable: 'ஆவண முன்னோட்டம் கிடைக்கவில்லை',
    downloadFile: 'கோப்பை பதிவிறக்கம் செய்க',
    
    // Location
    province: 'மாகாணம்',
    district: 'மாவட்டம்',
    dsDivision: 'பிரிவு செயலாளர் பிரிவு',
    gnDivision: 'கிராம அதிகாரி பிரிவு',
    address: 'முகவரி',
    
    // Messages
    submitSuccess: 'வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!',
    submitError: 'சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    loginSuccess: 'வெற்றிகரமாக உள்நுழைந்தீர்கள்',
    logoutSuccess: 'வெற்றிகரமாக வெளியேறியுள்ளீர்கள்',
    
    // Registration & Authentication
    username: 'பயனர் பெயர்',
    email: 'மின்னஞ்சல்',
    firstName: 'முதல் பெயர்',
    lastName: 'கடைசி பெயர்',
    phone: 'தொலைபேசி எண்',
    nationalId: 'தேசிய அடையாள எண்',
    optional: 'விருப்பமானது',
    password: 'கடவுச்சொல்',
    confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    allFieldsRequired: 'அனைத்து தேவையான புலங்களும் நிரப்பப்பட வேண்டும்',
    invalidEmail: 'செல்லுபடியாகும் மின்னஞ்சல் முகவரியை உள்ளிடவும்',
    passwordMinLength: 'கடவுச்சொல் குறைந்தது 6 எழுத்துகளாக இருக்க வேண்டும்',
    passwordsMustMatch: 'கடவுச்சொற்கள் பொருந்த வேண்டும்',
    registrationSuccess: 'பதிவு வெற்றிகரமாக முடிந்தது! உள்நுழைவிற்கு திருப்பி விடுகிறது...',
    registrationFailed: 'பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.',
    alreadyHaveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
    
    // Login specific
    governmentSolutionSystem: 'அரசு தீர்வு அமைப்பு',
    signInToAccount: 'உங்கள் கணக்கில் உள்நுழையவும்',
    enterUsername: 'உங்கள் பயனர் பெயரை உள்ளிடவும்',
    enterPassword: 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்',
    usernameRequired: 'பயனர் பெயர் தேவை',
    passwordRequired: 'கடவுச்சொல் தேவை',
    loginFailed: 'உள்நுழைவு தோல்வியடைந்தது. உங்கள் சான்றுகளை சரிபார்க்கவும்.',
    
    // Profile
    editProfile: 'சுயவிவரத்தை திருத்தவும்',
    personalInformation: 'தனிப்பட்ட தகவல்',
    accountInformation: 'கணக்கு தகவல்',
    profilePicture: 'சுயவிவர படம்',
    notSpecified: 'குறிப்பிடப்படவில்லை',
    memberSince: 'உறுப்பினராக உள்ள காலம்',
    accountStatus: 'கணக்கு நிலை',
    approved: 'அங்கீகரிக்கப்பட்டது',
    profileUpdated: 'சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது',
    profileUpdateFailed: 'சுயவிவரம் புதுப்பிக்க தோல்வி',
    saving: 'சேமிக்கிறது...',
    forgotPassword: 'உங்கள் கடவுச்சொல்லை மறந்துவிட்டீர்களா?',
    dontHaveAccount: 'கணக்கு இல்லையா?',
    
    // Home page
    heroTitle: 'அரசு பிரச்சினை',
    heroTitleHighlight: 'மேலாண்மை அமைப்பு',
    heroSubtitle: 'அரசு பிரச்சினைகளை திறமையாக அறிக்கை செய்து அவற்றின் தீர்வை எங்கள் வெளிப்படையான படிநிலை அமைப்பு மூலம் கண்காணிக்கவும். கிராம அதிகாரியிலிருந்து பிரதமர் வரை - ஒவ்வொரு மட்டத்திலும் பொறுப்புக்கூறலை உறுதி செய்கிறது.',
    reportAnIssue: 'பிரச்சினையை அறிக்கை செய்க',
    viewPublicIssues: 'பொது பிரச்சினைகளைப் பார்க்கவும்',
    transparentGovernance: 'வெளிப்படையான ஆட்சி',
    accountabilityThroughTechnology: 'தொழில்நுட்பத்தின் மூலம் பொறுப்புக்கூறல்',
    features: 'அம்சங்கள்',
    howOurSystemWorks: 'எங்கள் அமைப்பு எவ்வாறு செயல்படுகிறது',
    systemDescription: 'எங்கள் விரிவான பிரச்சினை மேலாண்மை அமைப்பு உங்கள் கவலைகள் சரியான அதிகாரிகளை அடையும் மற்றும் கட்டமைக்கப்பட்ட அதிகரிப்பு செயல்முறை மூலம் திறமையாக தீர்க்கப்படும் என்பதை உறுதி செய்கிறது.',
    easyIssueReporting: 'எளிதான பிரச்சினை அறிக்கையிடல்',
    easyIssueReportingDesc: 'விரிவான விளக்கங்கள், இடத் தகவல் மற்றும் ஆதரவு ஆவணங்களுடன் பிரச்சினைகளை சமர்ப்பிக்கவும். எங்கள் அமைப்பு தானாகவே உங்கள் பிரச்சினையை பொருத்தமான அதிகாரி மட்டத்திற்கு அனுப்புகிறது.',
    hierarchicalProcessing: 'படிநிலை செயலாக்கம்',
    hierarchicalProcessingDesc: 'பிரச்சினைகள் எங்கள் 8-நிலை அரசு படிநிலை மூலம் செயலாக்கப்படுகின்றன: கிராம அதிகாரியிலிருந்து பிரதமர் வரை, தேவைப்படும் போது பொருத்தமான அதிகரிப்பை உறுதி செய்கிறது.',
    realTimeTracking: 'நேரடி கண்காணிப்பு',
    realTimeTrackingDesc: 'உங்கள் பிரச்சினைகளின் நிலையை நேரடியாக கண்காணிக்கவும். உங்கள் பிரச்சினை துறைகளுக்கு இடையே நகரும் போது அல்லது தீர்க்கப்படும் போது அறிவிப்புகளைப் பெறுங்கள்.',
    transparentProcess: 'வெளிப்படையான செயல்முறை',
    transparentProcessDesc: 'பொது பிரச்சினைகள் மற்றும் அவற்றின் தீர்வு முன்னேற்றத்தைப் பார்க்கவும். எங்கள் வெளிப்படையான அமைப்பு அரசு சேவைகளில் நம்பிக்கை மற்றும் பொறுப்புக்கூறலை உருவாக்குகிறது.',
    governmentHierarchy: 'அரசு படிநிலை',
    tierEscalationSystem: '8-நிலை அதிகரிப்பு அமைப்பு',
    hierarchyDescription: 'பிரச்சினைகள் பொருத்தமான மட்டத்தில் கையாளப்படுகின்றன மற்றும் தீர்வை உறுதி செய்ய தேவைப்படும் போது அதிகரிக்கப்படுகின்றன.',
    citizen: 'குடிமகன்',
    citizenDesc: 'பிரச்சினைகளை சமர்ப்பித்து கண்காணிக்கவும்',
    admin: 'நிர்வாகி',
    adminDesc: 'அமைப்பு நிர்வாகம் மற்றும் மேற்பார்வை',
    gramaNiladhari: 'கிராம அதிகாரி',
    gramaNiladhariDesc: 'உள்ளூர் சமூக பிரச்சினைகளை கையாளுங்கள்',
    divisionalSecretary: 'பிரிவு செயலாளர்',
    divisionalSecretaryDesc: 'பிரிவு விஷயங்களை நிர்வகிக்கவும்',
    districtSecretary: 'மாவட்ட செயலாளர்',
    districtSecretaryDesc: 'மாவட்ட அளவிலான பிரச்சினைகளை மேற்பார்வையிடுங்கள்',
    provincialMinistry: 'மாகாண அமைச்சகம்',
    provincialMinistryDesc: 'மாகாண கவலைகளை கையாளுங்கள்',
    nationalMinistry: 'தேசிய அமைச்சகம்',
    nationalMinistryDesc: 'தேசிய கொள்கை பிரச்சினைகளை நிர்வகிக்கவும்',
    primeMinister: 'பிரதமர்',
    primeMinisterDesc: 'அதிகரிப்புகளுக்கான இறுதி அதிகாரம்',
    
    // Features and descriptions for home page
    quicklyReportIssues: 'விரிவான விளக்கங்கள் மற்றும் ஆதரவு ஆவணங்களுடன் பிரச்சினைகளை விரைவாக அறிக்கை செய்யுங்கள்.',
    trackProgress: 'முன்னேற்றத்தை கண்காணிக்கவும்',
    monitorIssueProgress: 'நிகழ்நேர புதுப்பிப்புகள் மற்றும் அறிவிப்புகள் மூலம் உங்கள் பிரச்சினைகளின் முன்னேற்றத்தை கண்காணிக்கவும்.',
    transparentProcessDescription: 'எங்கள் வெளிப்படையான அமைப்பு மூலம் பொது பிரச்சினைகள் மற்றும் அவற்றின் தீர்வு முன்னேற்றத்தைப் பார்க்கவும்.',
    ensureAccountability: 'தொழில்நுட்ப-உந்துதல் கண்காணிப்பு மூலம் அரசாங்கத்தின் ஒவ்வொரு மட்டத்திலும் பொறுப்புக்கூறலை உறுதிப்படுத்துங்கள்.',
    
    // Process steps
    reportIssue: 'பிரச்சினையை அறிக்கை செய்யுங்கள்',
    reportIssueDescription: 'விரிவான தகவல் மற்றும் ஆதரவு ஆவணங்களுடன் உங்கள் பிரச்சினையை சமர்ப்பிக்கவும்.',
    automaticRouting: 'தானியங்கி வழிசெலுத்தல்',
    automaticRoutingDescription: 'அமைப்பு தானாகவே உங்கள் பிரச்சினையை பொருத்தமான அரசாங்க மட்டத்திற்கு அனுப்புகிறது.',
    officialResponse: 'அதிகாரப்பூர்வ பதில்',
    officialResponseDescription: 'அரசு அதிகாரிகள் உங்கள் பிரச்சினையை மதிப்பாய்வு செய்து உடனடியாக பதிலளிக்கிறார்கள்.',
    resolution: 'தீர்வு',
    resolutionDescription: 'தீர்வு முன்னேற்றத்தை கண்காணித்து முடிக்கும் வரை புதுப்பிப்புகளைப் பெறுங்கள்.',
    
    // Statistics
    issuesResolved: 'தீர்க்கப்பட்ட பிரச்சினைகள்',
    satisfactionRate: 'திருப்தி விகிதம்',
    systemAvailability: 'அமைப்பு கிடைக்கும் தன்மை',
    governmentLevels: 'அரசாங்க மட்டங்கள்',
    
    // Additional content
    issueCategories: 'பிரச்சினை வகைகள்',
    categoriesDescription: 'பல்வேறு அரசு சேவை வகைகளில் பிரச்சினைகளை அறிக்கை செய்யுங்கள்.',
    stepByStepProcess: 'அரசு பிரச்சினைகளை அறிக்கை செய்ய மற்றும் கண்காணிக்க எங்கள் எளிய படிப்படியான செயல்முறையைப் பின்பற்றவும்.',
    readyToGetStarted: 'தொடங்க தயாரா?',
    joinThousands: 'அரசு சேவைகளை மேம்படுத்த ஒன்றாக வேலை செய்யும் ஆயிரக்கணக்கான குடிமக்களுடன் சேருங்கள்.',
    getStartedToday: 'இன்றே தொடங்குங்கள்',
    learnMore: 'மேலும் அறிக',
    
    // Additional home page content
    whyChooseOurSystem: 'எங்கள் அமைப்பை ஏன் தேர்வு செய்ய வேண்டும்?',
    systemBenefits: 'எங்கள் விரிவான பிரச்சினை மேலாண்மை அமைப்பு உங்கள் கவலைகள் சரியான அதிகாரிகளை அடையும் மற்றும் கட்டமைக்கப்பட்ட அதிகரிப்பு செயல்முறை மூலம் திறமையாக தீர்க்கப்படும் என்பதை உறுதி செய்கிறது.',
    issueEscalation: 'பிரச்சினை அதிகரிப்பு',
    hierarchicalSystem: 'படிநிலை அமைப்பு',
    hierarchicalSystemDesc: 'பிரச்சினைகள் பொருத்தமான மட்டத்தில் கையாளப்படுகின்றன மற்றும் தீர்வை உறுதி செய்ய தேவைப்படும் போது அதிகரிக்கப்படுகின்றன.',
    
    // Call-to-Action
    readyToReport: 'பிரச்சினையை அறிக்கை செய்ய தயாரா?',
    startToday: 'இன்றே தொடங்குங்கள்.',
    joinCitizens: 'வெளிப்படைத்தன்மை மற்றும் பொறுப்புக்கூறல் மூலம் அரசு சேவைகளை மேம்படுத்த ஒன்றாக வேலை செய்யும் ஆயிரக்கணக்கான குடிமக்களுடன் சேருங்கள்.',
    getStartedNow: 'இப்போது தொடங்குங்கள்',
    exploreIssues: 'பிரச்சினைகளை ஆராயுங்கள்',
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    languages: [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
      { code: 'ta', name: 'தமிழ்', flag: '🇱🇰' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
