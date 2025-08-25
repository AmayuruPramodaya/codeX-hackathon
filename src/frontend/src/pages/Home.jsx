import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ExclamationTriangleIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <svg
              className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
              fill="currentColor"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>

            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Government Issue</span>{' '}
                  <span className="block text-blue-600 xl:inline">Management System</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Report government issues efficiently and track their resolution through our transparent hierarchical system. 
                  From Grama Niladhari to Prime Minister - ensuring accountability at every level.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/submit-issue"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      Report an Issue
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/public-issues"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      View Public Issues
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-r from-blue-500 to-indigo-600 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <div className="text-center text-white">
              <ClipboardDocumentListIcon className="h-24 w-24 mx-auto mb-4" />
              <h3 className="text-2xl font-bold">Transparent Governance</h3>
              <p className="mt-2 text-lg">Accountability Through Technology</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              How Our System Works
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our comprehensive issue management system ensures your concerns reach the right authorities 
              and get resolved efficiently through a structured escalation process.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Easy Issue Reporting</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Submit issues with detailed descriptions, location information, and supporting documents. 
                  Our system automatically routes your issue to the appropriate authority level.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <UserGroupIcon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Hierarchical Processing</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Issues are processed through our 8-tier government hierarchy: from Grama Niladhari to Prime Minister, 
                  ensuring appropriate escalation when needed.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <CheckCircleIcon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Real-time Tracking</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Track the status of your issues in real-time. Get notifications when your issue moves 
                  between departments or gets resolved.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <ClipboardDocumentListIcon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Transparent Process</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  View public issues and their resolution progress. Our transparent system builds trust 
                  and accountability in government services.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Government Hierarchy Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Government Hierarchy</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              8-Tier Escalation System
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Issues are handled at the appropriate level and escalated when necessary to ensure resolution.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { level: 1, title: 'Citizen', description: 'Submit and track issues' },
                { level: 2, title: 'Grama Niladhari', description: 'Handle local community issues' },
                { level: 3, title: 'Divisional Secretary', description: 'Manage divisional matters' },
                { level: 4, title: 'District Secretary', description: 'Oversee district-wide issues' },
                { level: 5, title: 'Provincial Ministry', description: 'Handle provincial concerns' },
                { level: 6, title: 'National Ministry', description: 'Manage national policy issues' },
                { level: 7, title: 'Prime Minister', description: 'Ultimate authority for escalations' },
                { level: 8, title: 'Admin', description: 'System administration and oversight' }
              ].map((tier) => (
                <div key={tier.level} className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 text-white text-sm font-bold">
                        {tier.level}
                      </div>
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">{tier.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{tier.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to report an issue?</span>
            <span className="block">Start the process today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-200">
            Join thousands of citizens working together to improve government services through transparency and accountability.
          </p>
          <Link
            to="/register"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 sm:w-auto"
          >
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
