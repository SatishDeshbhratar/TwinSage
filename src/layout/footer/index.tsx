const FooterComponent = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Project Info */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/twin-sage-logo.svg" // Add your logo file
                alt="Twin Sage Logo"
                className="h-8 w-8"
              />
              <h3 className="text-xl font-bold">Twin Sage</h3>
            </div>
            <p className="text-slate-300 text-sm text-center md:text-left">
              Advanced profile deduplication system using AI and machine
              learning
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>
                <a href="" className="hover:text-white transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="" className="hover:text-white transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Stats */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-semibold mb-4">Project Stats</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-300">Profiles Analyzed</p>
                <p className="text-lg font-semibold">10,000+</p>
              </div>
              <div>
                <p className="text-slate-300">Accuracy Rate</p>
                <p className="text-lg font-semibold">95%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-slate-400">
              © {currentYear} Twin Sage. Amazon Hackathon Project.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a
                href="https://github.com/your-repo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a
                href=""
                className="text-slate-400 hover:text-white transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;
