import React from 'react';

export function Footer() {
  return (
    <footer className="bg-surface-container-highest dark:bg-tertiary-container text-primary dark:text-primary-fixed w-full pt-section-gap pb-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter px-margin-mobile md:px-gutter max-w-container-max mx-auto">
        <div className="col-span-2 md:col-span-1 space-y-4 mb-8 md:mb-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            <span className="font-display-lg text-title-md font-bold text-primary dark:text-primary-fixed">ShikshaSetu</span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs font-medium">
            One connected school day for parents, teachers, and campus teams.
          </p>
        </div>
        <div>
          <h4 className="font-label-sm text-label-sm uppercase tracking-wider mb-4 font-bold">Product</h4>
          <ul className="space-y-2">
            <li><a className="font-body-md text-body-md text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-primary-fixed transition-colors font-medium" href="#parents">For Parents</a></li>
            <li><a className="font-body-md text-body-md text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-primary-fixed transition-colors font-medium" href="#teachers">For Teachers</a></li>
            <li><a className="font-body-md text-body-md text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-primary-fixed transition-colors font-medium" href="#schools">For Schools</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-sm text-label-sm uppercase tracking-wider mb-4 font-bold">Company</h4>
          <ul className="space-y-2">
            <li><a className="font-body-md text-body-md text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-primary-fixed transition-colors font-medium" href="#">About Us</a></li>
            <li><a className="font-body-md text-body-md text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-primary-fixed transition-colors font-medium" href="#">Partners</a></li>
            <li><a className="font-body-md text-body-md text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-primary-fixed transition-colors font-medium" href="#">Blog</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-sm text-label-sm uppercase tracking-wider mb-4 font-bold">Access</h4>
          <ul className="space-y-2">
            <li><a className="font-body-md text-body-md text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-primary-fixed transition-colors font-medium" href="#">Watch Demo</a></li>
            <li><a className="font-body-md text-body-md text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-primary-fixed transition-colors font-medium" href="#">Get Support</a></li>
            <li><a className="font-body-md text-body-md text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-primary-fixed transition-colors font-medium" href="#">Contact Us</a></li>
          </ul>
        </div>
      </div>
      <div className="px-margin-mobile md:px-gutter max-w-container-max mx-auto mt-12 pt-8 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-body-md text-body-md text-on-surface-variant font-medium">© 2024 ShikshaSetu. All rights reserved.</p>
        <div className="flex gap-4">
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors font-medium" href="#">Privacy Policy</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors font-medium" href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
