import { ObjectId } from 'mongodb';

export interface Course {
  _id?: ObjectId;
  id: string; // The original string ID
  title: string;
  description: string;
  instructor: string;
  category: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  _id?: ObjectId;
  id: string; // The original string ID
  courseId: string;
  title: string;
  description: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  supabasePath?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Announcement {
  _id?: ObjectId;
  id: string; // The original string ID
  title: string;
  body: string;
  createdAt: string;
}
