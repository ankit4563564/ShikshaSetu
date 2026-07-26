import React from 'react';
import { SchoolGPTSection } from './SchoolGPTSection';
import { ParentSection } from './ParentSection';
import { TeacherSection } from './TeacherSection';

export function PlatformSection() {
  return (
    <section className="py-section-gap bg-textured" id="features">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
        <div className="text-center mb-16 space-y-4">
          <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase font-bold">Next-Gen Platform Capabilities</span>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Powered by <span className="text-primary font-bold">SchoolGPT AI</span> &amp;<br />Live Telemetry
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface max-w-2xl mx-auto">
            ShikshaSetu powers school administrators, teachers, parents, and students in one unified intelligent ecosystem.
          </p>
        </div>
        <div className="space-y-8">
          <SchoolGPTSection />
          <ParentSection />
          <TeacherSection />
        </div>
      </div>
    </section>
  );
}
