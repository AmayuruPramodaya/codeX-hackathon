import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts';
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
  SparklesIcon
} from '@heroicons/react/24/outline';
import mirissaImage from '../mirissa.webp';

const Home = () => {
  const { t } = useLanguage();

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
        <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
          <div className="absolute inset-0">
            <img
          src={mirissaImage}
          alt="Sri Lanka Government"
          className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-indigo-900/60"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            {t('heroTitle')} <br />
            <span className="text-yellow-400">{t('heroTitleHighlight')}</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/submit-issue"
              className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              {t('reportAnIssue')}
            </Link>
            <Link
              to="/public-issues"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
            >
              {t('viewPublicIssues')}
            </Link>
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
                <div className="text-3xl md:text-4xl font-bold text-blue-900">{stat.number}</div>
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

      {/* How It Works Section */}
      <div className="py-20 bg-white">
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
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-900">{step.number}</span>
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

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 py-20">
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
              className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              {t('getStartedToday')}
            </Link>
            <Link
              to="/about"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
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

