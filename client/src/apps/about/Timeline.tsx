'use client';

import React from 'react';

interface Cert {
  name: string;
  badge: string;
}

interface Milestone {
  year: string;
  title: string;
  description: string;
  certs?: Cert[];
}

const milestones: Milestone[] = [
  {
    year: '2018',
    title: 'Started Engineering Program',
    description: 'Began studies in computer engineering focusing on software development.',
  },
  {
    year: '2021',
    title: 'Cloud Certification',
    description: 'Achieved professional cloud certification and led migration project.',
    certs: [
      {
        name: 'AWS Certified Cloud Practitioner',
        badge: 'https://img.shields.io/badge/AWS-Cloud%20Practitioner-orange',
      },
    ],
  },
  {
    year: '2024',
    title: 'Senior Developer',
    description: 'Promoted to senior developer leading a small team.',
  },
];

const skills = [
  { name: 'React', level: 5 },
  { name: 'Node.js', level: 4 },
  { name: 'TypeScript', level: 4 },
  { name: 'GraphQL', level: 3 },
  { name: 'AWS', level: 4 },
];

export default function Timeline() {
  return (
    <div className="timeline p-4 print:p-0">
      <ol className="relative border-l border-gray-200 print:border-black">
        {milestones.map((item) => (
          <li key={item.year} className="mb-10 ml-4">
            <div className="absolute w-3 h-3 bg-primary-500 rounded-full -left-1.5 border border-white print:border-black" />
            <time className="mb-1 text-sm leading-none text-gray-400 print:text-black">{item.year}</time>
            <h3 className="text-lg font-semibold text-gray-900 print:text-black">{item.title}</h3>
            <p className="mb-4 text-base font-normal text-gray-500 print:text-black">{item.description}</p>
            {item.certs && (
              <div className="flex gap-2 flex-wrap">
                {item.certs.map((cert) => (
                  <img key={cert.name} src={cert.badge} alt={cert.name} className="h-8 w-auto print:h-6" />
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>
      <section className="mt-8">
        <h3 className="text-lg font-semibold mb-2 print:text-black">Skill Heatmap</h3>
        <div className="grid grid-cols-5 gap-4">
          {skills.map((skill) => (
            <div key={skill.name} className="text-center">
              <div
                className="w-8 h-8 mx-auto rounded-sm bg-primary-500"
                style={{ opacity: skill.level / 5 }}
              />
              <div className="text-xs mt-1 text-gray-700 print:text-black">{skill.name}</div>
            </div>
          ))}
        </div>
      </section>
      <style
        dangerouslySetInnerHTML={{
          __html: `@media print {\n  .timeline {\n    font-size: 12px;\n    width: 100%;\n  }\n  li {\n    page-break-inside: avoid;\n    break-inside: avoid;\n  }\n}`,
        }}
      />
    </div>
  );
}
