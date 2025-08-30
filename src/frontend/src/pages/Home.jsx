import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ExclamationTriangleIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  GlobeAltIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import mirissaImage from '../mirissa.webp';

const Home = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: ExclamationTriangleIcon,
      title: t('easyIssueReporting'),
      description: t('easyIssueReportingDesc'),
      color: 'from-red-500 to-red-600'
    },
    {
      icon: UserGroupIcon,
      title: t('hierarchicalProcessing'),
      description: t('hierarchicalProcessingDesc'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: ChartBarIcon,
      title: t('realTimeTracking'),
      description: t('realTimeTrackingDesc'),
      color: 'from-green-500 to-green-600'
    },
    {
      icon: ClipboardDocumentListIcon,
      title: t('transparentProcess'),
      description: t('transparentProcessDesc'),
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const hierarchyTiers = [
    { level: 1, title: t('citizen'), description: t('citizenDesc'), color: 'bg-emerald-500' },
    { level: 2, title: t('gramaNiladhari'), description: t('gramaNiladhariDesc'), color: 'bg-blue-500' },
    { level: 3, title: t('divisionalSecretary'), description: t('divisionalSecretaryDesc'), color: 'bg-indigo-500' },
    { level: 4, title: t('districtSecretary'), description: t('districtSecretaryDesc'), color: 'bg-purple-500' },
    { level: 5, title: t('provincialMinistry'), description: t('provincialMinistryDesc'), color: 'bg-pink-500' },
    { level: 6, title: t('nationalMinistry'), description: t('nationalMinistryDesc'), color: 'bg-red-500' },
    { level: 7, title: t('primeMinister'), description: t('primeMinisterDesc'), color: 'bg-orange-500' },
    { level: 8, title: t('admin'), description: t('adminDesc'), color: 'bg-slate-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={mirissaImage} 
            alt="Mirissa Beach - Beautiful Sri Lankan coastline representing transparency and progress"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-800/60 to-slate-900/80"></div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center min-h-screen py-20">
            <div className="w-full lg:w-1/2">
              <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl border border-white">
                <div className="fade-in-up">
                  <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-sm">
                    <span className="block">{t('heroTitle')}</span>
                    <span className="block gradient-text-primary">{t('heroTitleHighlight')}</span>
                  </h1>
                  <p className="mt-6 text-lg text-slate-700 sm:text-xl lg:text-2xl leading-relaxed font-medium">
                    {t('heroSubtitle')}
                  </p>
                  <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4">
                    <Link
                      to="/submit-issue"
                      className="group flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {t('reportAnIssue')}
                      <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                    <Link
                      to="/public-issues"
                      className="flex items-center justify-center px-8 py-4 border-2 border-slate-300 text-lg font-semibold rounded-xl text-slate-800 bg-white hover:bg-slate-50 transition-all duration-300 hover:shadow-lg"
                    >
                      {t('viewPublicIssues')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side content */}
            <div className="hidden lg:flex lg:w-1/2 lg:justify-center lg:items-center lg:pl-16">
              <div className="text-center text-white fade-in-up">
                <div className="relative mb-8">
                  <GlobeAltIcon className="h-32 w-32 mx-auto opacity-90 drop-shadow-lg" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl"></div>
                </div>
                <h3 className="text-4xl font-bold mb-4 drop-shadow-lg">{t('transparentGovernance')}</h3>
                <p className="text-2xl text-slate-100 drop-shadow-md">{t('accountabilityThroughTechnology')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center fade-in-up">
            <h2 className="text-base text-slate-600 font-semibold tracking-wide uppercase">{t('features')}</h2>
            <p className="mt-2 text-4xl leading-10 font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              {t('whyChooseOurSystem')}
            </p>
            <p className="mt-6 max-w-3xl text-xl text-slate-600 lg:mx-auto leading-relaxed">
              {t('systemBenefits')}
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group relative bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 glass-effect fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-white/80 rounded-2xl"></div>
                  <div className="relative">
                    <div className={`inline-flex items-center justify-center p-4 bg-gradient-to-r ${feature.color} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-8 w-8 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-slate-700 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
                 
      {/* Government Hierarchy Section */}
      <div className="py-20 bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center fade-in-up">
            <h2 className="text-base text-slate-600 font-semibold tracking-wide uppercase">{t('issueEscalation')}</h2>
            <p className="mt-2 text-4xl leading-10 font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              {t('hierarchicalSystem')}
            </p>
            <p className="mt-6 max-w-3xl text-xl text-slate-600 mx-auto leading-relaxed">
              {t('hierarchicalSystemDesc')}
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {hierarchyTiers.map((tier, index) => (
                <div
                  key={tier.level}
                  className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 glass-effect fade-in-up overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-slate-50/90"></div>
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`inline-flex items-center justify-center w-10 h-10 ${tier.color} text-white rounded-full font-bold text-lg group-hover:scale-110 transition-transform duration-300`}>
                        {tier.level}
                      </div>
                      {index < hierarchyTiers.length - 1 && (
                        <ArrowRightIcon className="h-5 w-5 text-slate-400 hidden lg:block" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">
                      {tier.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {tier.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Call-to-Action Section */}
      <div className="relative py-20 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 fade-in-up">
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
            <span className="block">{t('readyToReport')}</span>
            <span className="block gradient-text-accent">{t('startToday')}</span>
          </h2>
          <p className="mt-6 text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed">
            {t('joinCitizens')}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-slate-900 bg-white hover:bg-slate-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {t('getStartedNow')}
              <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              to="/public-issues"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-white border-2 border-white/30 hover:border-white/50 hover:bg-white/10 transition-all duration-300"
            >
              {t('exploreIssues')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
