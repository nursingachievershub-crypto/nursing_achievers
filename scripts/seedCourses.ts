// Script to seed the database with the default demo courses as real courses
import axios from 'axios';

const defaultCourses = [
  {
    title: "ACHIEVERS'S PRIME: NORCET11",
    price: 10000,
    originalPrice: 13000,
    rating: 4.8,
    reviews: 1240,
    lectures: 42,
    hours: 18,
    level: 'All Levels',
    badge: 'BESTSELLER',
    badgeColor: '#f59e0b',
    description: 'Complete NORCET11 preparation with mock tests, notes & live sessions.',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #2563eb 100%)',
    accentColor: '#93c5fd',
  },
  {
    title: 'ACHIEVERS HUB: NORCET 11',
    price: 13000,
    originalPrice: 13000,
    rating: 4.7,
    reviews: 890,
    lectures: 36,
    hours: 14,
    level: 'Beginner',
    badge: 'HOT & NEW',
    badgeColor: '#ef4444',
    description: 'Master nursing fundamentals with detailed video lectures and study material.',
    gradient: 'linear-gradient(135deg, #1a0533 0%, #4c1d95 55%, #7c3aed 100%)',
    accentColor: '#c4b5fd',
  },
  {
    title: 'MEDICAL SURGICAL NURSING',
    price: 8000,
    originalPrice: 11000,
    rating: 4.6,
    reviews: 670,
    lectures: 28,
    hours: 12,
    level: 'Intermediate',
    badge: 'TOP RATED',
    badgeColor: '#059669',
    description: 'In-depth coverage of medical surgical nursing concepts for competitive exams.',
    gradient: 'linear-gradient(135deg, #042f2e 0%, #065f46 55%, #059669 100%)',
    accentColor: '#6ee7b7',
  },
];

async function seedCourses() {
  for (const course of defaultCourses) {
    try {
      const res = await axios.post('https://nursing-achievers.onrender.com/api/courses', course);
      console.log('Created:', res.data.title);
    } catch (err) {
      // TypeScript-safe error handling for Axios errors
      if (axios.isAxiosError(err)) {
        console.error('Error creating course:', course.title, err.response?.data || err.message);
      } else if (err instanceof Error) {
        console.error('Error creating course:', course.title, err.message);
      } else {
        console.error('Error creating course:', course.title, err);
      }
    }
  }
}

seedCourses();
