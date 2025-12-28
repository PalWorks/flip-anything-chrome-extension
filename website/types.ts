import React from 'react';

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}