import React from 'react';

interface PageProps {
  title?: string;
}

export const Page: React.FC<PageProps> = ({ title = 'Pages in Storybook' }) => {
  return (
    <article className="p-6">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-gray-600">
        This is an example page component rendered in Storybook.
      </p>
    </article>
  );
};
