'use client';

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Job = {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: number;
  status: string;
  created_at: string;
  employer: {
    full_name: string;
  };
};

export default function Jobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState({
    location: "",
    minSalary: "",
    status: "open"
  });

  const fetchJobs = async () => {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        employer:profiles(full_name)
      `)
      .eq('status', filters.status);

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters.minSalary) {
      query = query.gte('salary', parseFloat(filters.minSalary));
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erreur lors de la récupération des offres:", error);
      return;
    }

    setJobs(data as Job[]);
  };

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Offres d'emploi</h1>
        <button
          onClick={() => router.push('/jobs/create')}
          className="bg-[#3bee5e] text-white px-4 py-2 rounded hover:bg-[#32d951] transition-colors"
        >
          Publier une offre
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="location"
            placeholder="Filtrer par lieu"
            value={filters.location}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="minSalary"
            placeholder="Salaire minimum"
            value={filters.minSalary}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          />
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="open">Offres ouvertes</option>
            <option value="closed">Offres fermées</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map(job => (
          <div key={job.id} className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
            <p className="text-gray-600 mb-4">{job.employer.full_name}</p>
            <p className="text-gray-800 mb-4 line-clamp-3">{job.description}</p>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>{job.location}</span>
              <span>{job.salary}€</span>
            </div>
            <button
              onClick={() => router.push(`/jobs/${job.id}`)}
              className="mt-4 w-full bg-[#3bee5e] text-white py-2 rounded hover:bg-[#32d951] transition-colors"
            >
              Voir les détails
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 