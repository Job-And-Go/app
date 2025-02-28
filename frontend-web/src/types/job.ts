interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  location: string;
  salary: number;
  is_open: boolean;
  created_at: string;
  employer: {
    id: string;
    full_name: string;
  };
  max_applications: number | null;
  accepted_applications: number;
}

interface Application {
  id: string;
  job_id: string;
  student_id: string;
  status: string;
  created_at: string;
}

interface Message {
  id: string;
  application_id: string;
  sender_id: string;
  content: string;
  created_at: string;
} 