import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Clock, Database, Award, Shield, Code, Zap, ArrowRight, Star, Users, Sparkles, Check, X } from 'lucide-react';
import { Logo } from '../components/Logo.tsx';

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] border border-gray-100">
      <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 transform transition-transform duration-500 hover:rotate-12">
        <Icon className="h-7 w-7 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function ProcessStep({ number, title, description }: { number: number, title: string, description: string }) {
  return (
    <div className="flex items-start space-x-4 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-blue-600">
      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function TechBadge({ text }: { text: string }) {
  return (
    <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
      {text}
    </span>
  );
}

function ComparisonStat({ 
  granteeValue, 
  granteeLabel, 
  granteeSubtext, 
  traditionalValue, 
  traditionalLabel, 
  traditionalSubtext,
  granteeLink,
  traditionalLink
}: { 
  granteeValue: string, 
  granteeLabel: string, 
  granteeSubtext: string, 
  traditionalValue: string, 
  traditionalLabel: string, 
  traditionalSubtext: string,
  granteeLink?: string,
  traditionalLink?: string
}) {
  return (
    <div className="bg-white bg-opacity-10 rounded-xl overflow-hidden backdrop-blur-sm">
      <div className="flex flex-col md:flex-row">
        {/* GranTEE Side */}
        <div className="bg-blue-600 bg-opacity-30 p-8 md:w-1/2 border-b md:border-b-0 md:border-r border-white border-opacity-10 relative">
          {/* GranTEE Label */}
          <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            GranTEE AI
          </div>
          <div className="text-5xl font-bold mb-3">{granteeValue}</div>
          <div className="text-blue-100 text-lg font-medium mb-1">
            <Check className="h-5 w-5 inline mr-2 opacity-80" />
            {granteeLabel}
          </div>
          <p className="text-blue-200 text-sm">
            {granteeSubtext}
            {granteeLink && (
              <a href={granteeLink} target="_blank" rel="noopener noreferrer" className="underline ml-1 text-blue-300 hover:text-blue-200 inline-flex items-center">
                <span className="text-xs">[Source]</span>
              </a>
            )}
          </p>
        </div>
        
        {/* Traditional Side */}
        <div className="p-8 md:w-1/2 bg-white bg-opacity-5 relative">
          {/* Traditional Label */}
          <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
            Traditional
          </div>
          <div className="text-4xl font-bold mb-3 text-red-200">{traditionalValue}</div>
          <div className="text-gray-200 text-lg font-medium mb-1">
            <X className="h-5 w-5 inline mr-2 opacity-80" />
            {traditionalLabel}
          </div>
          <p className="text-gray-300 text-sm">
            {traditionalSubtext}
            {traditionalLink && (
              <a href={traditionalLink} target="_blank" rel="noopener noreferrer" className="underline ml-1 text-blue-300 hover:text-blue-200 inline-flex items-center">
                <span className="text-xs">[Source]</span>
              </a>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Home() {
  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white opacity-10 rounded-full"></div>
          <div className="absolute top-40 -left-20 w-96 h-96 bg-blue-400 opacity-10 rounded-full"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-500 opacity-10 rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-3/5 text-center md:text-left mb-10 md:mb-0 md:pr-8">
                <div className="inline-flex items-center px-4 py-2 bg-blue-700 bg-opacity-50 rounded-full text-blue-100 text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Flare Hackathon 2025 Project</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                  Scholarship <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">GranTEE</span>
                </h1>
                
                <p className="text-xl mb-8 text-blue-100 md:pr-12">
                  The first decentralized scholarship platform powered by Trusted Execution Environment (TEE) technology
                </p>
                
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
                  <Link
                    to="/profile"
                    className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors inline-flex items-center justify-center shadow-lg hover:shadow-xl"
                  >
                    Start Your Application <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  
                  <Link
                    to="/scholarships"
                    className="bg-blue-700 bg-opacity-30 backdrop-blur-sm text-white border border-blue-400 border-opacity-30 px-8 py-4 rounded-xl font-bold hover:bg-opacity-40 transition-all inline-flex items-center justify-center"
                  >
                    Browse Scholarships
                  </Link>
                </div>
                
                <div className="mt-8 flex flex-wrap gap-2 justify-center md:justify-start">
                  <TechBadge text="Blockchain" />
                  <TechBadge text="TEE" />
                  <TechBadge text="AI Consensus" />
                  <TechBadge text="Smart Contracts" />
                  <TechBadge text="Flare Network" />
                </div>
              </div>
              
              <div className="md:w-2/5 flex justify-center">
                <div className="relative w-80 h-80">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl transform rotate-6 shadow-2xl"></div>
                  <div className="absolute inset-0 bg-white rounded-3xl overflow-hidden shadow-xl">
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 h-full">
                      <div className="border-b border-gray-200 pb-4 mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">G</div>
                          <div className="ml-4">
                            <div className="font-bold text-gray-800">GranTEE Scholarship</div>
                            <div className="text-sm text-gray-500">Smart Contract Platform</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="font-medium text-gray-800">Merit Scholarship</div>
                          <div className="text-sm text-gray-600 mt-1">$10,000 • AI-evaluated</div>
                          <div className="mt-2 bg-blue-600 h-2 rounded-full w-3/4"></div>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="font-medium text-gray-800">Need-Based Grant</div>
                          <div className="text-sm text-gray-600 mt-1">$5,000 • Secure processing</div>
                          <div className="mt-2 bg-blue-600 h-2 rounded-full w-1/2"></div>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="font-medium text-gray-800">STEM Excellence Award</div>
                          <div className="text-sm text-gray-600 mt-1">$15,000 • Transparent</div>
                          <div className="mt-2 bg-blue-600 h-2 rounded-full w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="container mx-auto px-4 py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-600 text-sm font-medium mb-4">
            <Zap className="h-4 w-4 mr-2" />
            <span>Innovative Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose GranTEE?</h2>
          <p className="text-gray-600 text-lg">Our platform combines cutting-edge blockchain technology with TEE security to create a transparent and fair scholarship system.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={Shield}
            title="Enhanced Privacy"
            description="Your data remains confidential and secure within our Trusted Execution Environment."
          />
          <FeatureCard
            icon={Brain}
            title="AI-Powered Decisions"
            description="Multiple AI agents work together to ensure fair and unbiased evaluations."
          />
          <FeatureCard
            icon={Clock}
            title="Rapid Processing"
            description="Get results in hours instead of weeks with our automated system."
          />
          <FeatureCard
            icon={Database}
            title="Blockchain Security"
            description="Immutable records and smart contracts ensure transparent fund distribution."
          />
          <FeatureCard
            icon={Code}
            title="Decentralized Control"
            description="No single entity controls the decision-making process."
          />
          <FeatureCard
            icon={Award}
            title="Merit-Based Awards"
            description="Fair evaluation based purely on merit and eligibility."
          />
        </div>
      </div>

      {/* Process Section */}
      <div id="process" className="bg-gray-50 py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-600 text-sm font-medium mb-4">
              <Star className="h-4 w-4 mr-2" />
              <span>Simple Process</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">How GranTEE Works</h2>
            <p className="text-gray-600 text-lg">Our streamlined process makes applying for scholarships easier and more secure than ever before.</p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <ProcessStep
              number={1}
              title="Application Submission"
              description="Submit your application through our blockchain-based smart contract with required details."
            />
            <ProcessStep
              number={2}
              title="Secure Processing"
              description="Your data is encrypted and processed within our Trusted Execution Environment."
            />
            <ProcessStep
              number={3}
              title="AI Consensus"
              description="Multiple AI agents evaluate your application independently to reach a fair decision."
            />
            <ProcessStep
              number={4}
              title="Fund Distribution"
              description="Approved scholarships are automatically distributed through smart contracts."
            />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div id="stats" className="bg-gradient-to-br from-blue-800 to-indigo-900 text-white py-20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-5 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-400 opacity-5 rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-10 rounded-full text-blue-100 text-sm font-medium mb-4">
              <Users className="h-4 w-4 mr-2" />
              <span>GranTEE vs. Traditional</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">The GranTEE Advantage</h2>
            <p className="text-blue-100 text-lg">See how our AI-driven platform compares to traditional scholarship processes</p>
          </div>
          
          <div className="grid md:grid-cols-1 gap-8">
            <ComparisonStat 
              granteeValue="100%" 
              granteeLabel="Transparent Process" 
              granteeSubtext="Every decision recorded on blockchain with complete visibility"
              traditionalValue="15%" 
              traditionalLabel="Decision Transparency" 
              traditionalSubtext="Traditional processes often lack visibility into decision-making criteria"
              traditionalLink="https://journals.sagepub.com/doi/full/10.1177/0002764218763577"
            />
            
            <ComparisonStat 
              granteeValue="1-2 min" 
              granteeLabel="Processing Time" 
              granteeSubtext="AI evaluation completes almost instantly"
              traditionalValue="6-8 weeks" 
              traditionalLabel="Average Wait Time" 
              traditionalSubtext="Traditional applications can take months to process"
              traditionalLink="https://scholarships360.org/scholarships/how-long-does-it-take-to-hear-back-from-scholarships/"
            />
            
            <ComparisonStat 
              granteeValue="0%" 
              granteeLabel="Human Bias" 
              granteeSubtext="AI-driven decisions eliminate unconscious biases"
              traditionalValue="62%" 
              traditionalLabel="Affected by Bias" 
              traditionalSubtext="Studies show traditional scholarship reviews are influenced by unconscious bias"
              traditionalLink="https://www.jstor.org/stable/29783059"
            />
            
            <ComparisonStat 
              granteeValue="24/7" 
              granteeLabel="Availability" 
              granteeSubtext="Apply and check status anytime, from anywhere"
              traditionalValue="Limited" 
              traditionalLabel="Office Hours" 
              traditionalSubtext="Restricted to business hours with limited support staff"
            />
            
            <ComparisonStat 
              granteeValue="Free" 
              granteeLabel="Application Fee" 
              granteeSubtext="No fees - ever. Only gas costs for blockchain transactions"
              traditionalValue="$25-$100" 
              traditionalLabel="Application Fees" 
              traditionalSubtext="Many scholarship programs charge non-refundable application fees"
              traditionalLink="https://www.usnews.com/education/best-colleges/paying-for-college/articles/2018-01-31/what-to-know-about-college-application-fee-waivers"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-opacity-10 p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Secure Your Future?</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students who have already benefited from GranTEE's fair and transparent scholarship allocation system.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/profile"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors inline-flex items-center justify-center shadow-lg"
              >
                Start Application <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/chatbot"
                className="bg-blue-700 bg-opacity-30 backdrop-blur-sm text-white border border-blue-400 border-opacity-30 px-8 py-4 rounded-xl font-bold hover:bg-opacity-40 transition-all inline-flex items-center justify-center"
              >
                Ask Our AI Assistant
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <Logo />
              <p className="mt-4 text-sm">
                Revolutionizing scholarship allocation through blockchain technology and AI consensus.
              </p>
              <div className="mt-4 text-sm bg-blue-900 bg-opacity-30 rounded-lg p-3 border border-blue-800 inline-block">
                <span className="font-semibold text-blue-400">Flare Hackathon 5</span>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#process" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#stats" className="hover:text-white transition-colors">Impact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                © 2025 GranTEE. All rights reserved. <span className="text-blue-500">Flare Hackathon Project - Tashrique & Bala</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}