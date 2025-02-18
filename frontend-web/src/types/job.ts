interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  location: string;
  salary: number;
  status: string;
  created_at: string;
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