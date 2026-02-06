import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts';
import { issuesAPI } from '../services/api';
import { 
  ExclamationTriangleIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  BuildingOfficeIcon,
  UsersIcon,
  TruckIcon,
  AcademicCapIcon,
  HeartIcon,
  SparklesIcon,
  NewspaperIcon,
  XMarkIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import mirissaImage from '../mirissa.webp';

const Home = () => {
  const { t } = useLanguage();
  const [topIssues, setTopIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(true);

  // Fetch top 3 public issues
  useEffect(() => {
    const fetchTopIssues = async () => {
      try {
        const response = await issuesAPI.getIssues({ limit: 3, ordering: '-created_at' });
        const issues = response.data.results || response.data || [];
        setTopIssues(issues.slice(0, 3));
      } catch (error) {
        console.error('Error fetching public issues:', error);
      } finally {
        setLoadingIssues(false);
      }
    };
    fetchTopIssues();
  }, []);

  const features = [
    {
      icon: ExclamationTriangleIcon,
      title: t('reportAnIssue'),
      description: t('quicklyReportIssues'),
      color: 'blue'
    },
    {
      icon: ClipboardDocumentListIcon,
      title: t('trackProgress'),
      description: t('monitorIssueProgress'),
      color: 'green'
    },
    {
      icon: UserGroupIcon,
      title: t('transparentGovernance'),
      description: t('transparentProcessDescription'),
      color: 'purple'
    },
    {
      icon: ShieldCheckIcon,
      title: t('accountabilityThroughTechnology'),
      description: t('ensureAccountability'),
      color: 'red'
    }
  ];

  const categories = [
    { icon: BuildingOfficeIcon, name: t('infrastructure'), color: 'blue' },
    { icon: MegaphoneIcon, name: t('utilities'), color: 'green' },
    { icon: TruckIcon, name: t('transportation'), color: 'yellow' },
    { icon: HeartIcon, name: t('healthcare'), color: 'red' },
    { icon: AcademicCapIcon, name: t('education'), color: 'purple' },
    { icon: GlobeAltIcon, name: t('environment'), color: 'emerald' },
    { icon: ShieldCheckIcon, name: t('publicSafety'), color: 'orange' },
    { icon: SparklesIcon, name: t('other'), color: 'gray' }
  ];

  const steps = [
    {
      number: '01',
      title: t('reportIssue'),
      description: t('reportIssueDescription'),
      icon: DocumentTextIcon
    },
    {
      number: '02',
      title: t('automaticRouting'),
      description: t('automaticRoutingDescription'),
      icon: ArrowRightIcon
    },
    {
      number: '03',
      title: t('officialResponse'),
      description: t('officialResponseDescription'),
      icon: UsersIcon
    },
    {
      number: '04',
      title: t('resolution'),
      description: t('resolutionDescription'),
      icon: CheckCircleIcon
    }
  ];

  const stats = [
    { number: '1,250+', label: t('issuesResolved') },
    { number: '98%', label: t('satisfactionRate') },
    { number: '24/7', label: t('systemAvailability') },
    { number: '15', label: t('governmentLevels') }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-[#001F54] overflow-hidden">
        {/* Large White Wave Curve - Organic flowing wave like in image */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="none">
            <path 
              fill="#ffffff" 
              d="M0,1050 C200,950 300,850 450,750 C600,650 700,580 850,700 C1000,820 1150,750 1300,550 C1450,350 1650,200 1920,100 L1920,1080 L0,1080 Z"
            ></path>
          </svg>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start min-h-[500px]">
            {/* Left Content */}
            <div className="z-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
                CivicResolve
              </h1>
              <p className="text-xl md:text-2xl text-orange-500 font-semibold mb-6">
                Resolve an Issue. Build a Better Sri Lanka.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link
                  to="/submit-issue"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-md font-semibold text-sm transition-all duration-300 inline-block text-center"
                >
                  Report Issue
                </Link>
                <Link
                  to="/public-issues"
                  className="bg-transparent border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-6 py-2.5 rounded-md font-semibold text-sm transition-all duration-300 inline-block text-center"
                >
                  View Public Issue
                </Link>
              </div>
              
              {/* Government Information Center Button */}
              <div className="max-w-sm">
                <Link to="/government-info" className="block">
                  <div className="bg-gradient-to-r from-red-900 to-red-800 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h2 className="text-lg md:text-xl font-bold leading-tight">
                          Government Information<br />Center
                        </h2>
                      </div>
                      <div className="ml-4 transform group-hover:translate-x-2 transition-transform duration-300">
                        <ArrowRightIcon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Right Content - Circular Image */}
            <div className="relative z-10 flex items-start justify-center lg:justify-end">
              <div className="relative w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96">
                {/* Decorative pink circle behind */}
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-pink-200 to-orange-200 rounded-full transform translate-x-4 translate-y-4 -z-10"></div>
                
                {/* Main circular image */}
                <div className="relative w-full h-full rounded-full overflow-hidden border-8 border-white shadow-2xl">
                  <img
                    src={mirissaImage}
                    alt="Sri Lanka Government"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Small yellow decorative circle */}
                <div className="absolute top-4 right-4 w-16 h-16 bg-yellow-400 rounded-full -z-20"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Government Information Center Description on white wave area */}
        <div className="relative z-10 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  Government Information Center
                </h3>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                  A centralized digital platform designed to provide accurate, transparent, and accessible government information and services to citizens across Sri Lanka. Access government services, submit inquiries, and stay informed about official initiatives and policies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-[#001F54]">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('features')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('systemDescription')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className={`w-16 h-16 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-8 h-8 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Public Issues Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 underline decoration-blue-600 decoration-4 underline-offset-8">
              Latest Public Issues
            </h2>
          </div>
          
          {loadingIssues ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#001F54]"></div>
            </div>
          ) : topIssues.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No public issues found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topIssues.map((issue) => (
                <Link 
                  key={issue.id} 
                  to={`/public-issues/${issue.id}`}
                  className="bg-white border-4 border-[#001F54] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 relative block"
                >
                  <div className="p-6">
                    <div className="bg-[#001F54] text-white px-4 py-2 rounded-lg inline-block mb-4">
                      <h3 className="font-bold text-lg line-clamp-1">{issue.title}</h3>
                    </div>
                    
                    <div className={`px-3 py-1 rounded inline-block text-sm font-semibold mb-4 ${
                      issue.status === 'open' ? 'bg-green-600' :
                      issue.status === 'in_progress' ? 'bg-yellow-600' :
                      issue.status === 'resolved' ? 'bg-blue-600' :
                      'bg-red-600'
                    } text-white`}>
                      {issue.status?.replace('_', ' ').toUpperCase() || 'OPEN'}
                    </div>
                    
                    {issue.attachments && issue.attachments.length > 0 ? (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">{issue.category || 'General Issue'}</p>
                        <div className="relative h-48 bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={`http://127.0.0.1:8000${issue.attachments[0].file}` || mirissaImage}
                            alt={issue.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = mirissaImage; }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">{issue.category || 'General Issue'}</p>
                        <div className="relative h-48 bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={mirissaImage}
                            alt={issue.title}
                            className="w-full h-full object-cover opacity-60"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <p className="text-orange-600 font-semibold text-sm mb-1">
                        {issue.grama_niladhari_division || issue.ds_division || issue.district || 'Location'}
                      </p>
                      <p className="text-gray-700 text-sm line-clamp-3">
                        {issue.description}
                      </p>
                    </div>
                    
                    <div className="w-full bg-[#001F54] hover:bg-blue-900 text-white py-3 rounded-lg font-semibold transition-colors text-center">
                      View Details
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('howOurSystemWorks')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('stepByStepProcess')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-[#001F54] rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{step.number}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('issueCategories')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('categoriesDescription')}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/public-issues?category=${category.name.toLowerCase()}`}
                className={`bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-${category.color}-200`}
              >
                <div className={`w-12 h-12 bg-${category.color}-100 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <category.icon className={`w-6 h-6 text-${category.color}-600`} />
                </div>
                <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Quick <span className="text-orange-500">Links</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { name: 'National Transport Commission', icon: TruckIcon },
              { name: 'Ministry of Health', icon: HeartIcon },
              { name: 'Ministry of Agriculture', icon: GlobeAltIcon },
              { name: 'Law, Justice & Public Security', icon: ShieldCheckIcon },
              { name: 'Public Administration & Governance', icon: BuildingOfficeIcon },
              { name: 'Digital & ICT Services', icon: CogIcon }
            ].map((link, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <link.icon className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">{link.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-[#001F54] to-blue-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('readyToGetStarted')}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            {t('joinThousands')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              {t('getStartedToday')}
            </Link>
            <Link
              to="/about"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#001F54] px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
            >
              {t('learnMore')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

