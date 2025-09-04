import { User } from '@supabase/supabase-js';

export enum UserRole {
  Client = 'client',
  Designer = 'designer',
  Admin = 'admin'
}

export interface Profile {
  id: string;
  updated_at: string;
  full_name: string;
  avatar_url: string;
  role: UserRole;
  bio?: string;
  skills?: string[];
  is_verified?: boolean;
}

export interface PortfolioItem {
  id: string;
  designer_id: string;
  image_url: string;
  title: string;
  description: string;
}

export interface Job {
  id: string;
  created_at: string;
  client_id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  required_skills: string[];
  status: 'open' | 'in_progress' | 'completed';
  client_profile?: Profile;
}

export interface Proposal {
  id: string;
  created_at: string;
  job_id: string;
  designer_id: string;
  cover_letter: string;
  proposed_price: number;
  proposed_timeline: string;
  status: 'submitted' | 'accepted' | 'rejected';
  designer_profile?: Profile;
  job?: Job;
}

export interface Message {
  id: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  job_id: string;
  content: string;
  sender_profile?: Profile;
}

// FIX: Changed AppUser to a type alias with an intersection to correctly inherit properties from Supabase User.
export type AppUser = User & {
    profile: Profile | null;
};
