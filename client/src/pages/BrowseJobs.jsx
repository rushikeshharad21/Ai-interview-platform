import { useEffect, useState } from "react"
import { Search, SlidersHorizontal, AlertCircle } from "lucide-react"
import { getAllJobs } from "../lib/jobApi"
import JobCard from "../components/jobs/JobCard"
import Input from "../components/ui/Input"
import Select from "../components/ui/Select"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"

const typeFilterOptions = [
  { value: "all", label: "All types" },
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" }
]

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const fetchJobs = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getAllJobs()
      setJobs(response.data)
    } catch (err) {
      if (!err.response) {
        setError("Network error. Please check your connection and try again.")
      } else {
        setError("Could not load jobs. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.requiredSkills.some((skill) => skill.toLowerCase().includes(search.toLowerCase()))

    const matchesType = typeFilter === "all" || job.employmentType === typeFilter

    return matchesSearch && matchesType
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Browse jobs
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {loading ? "Loading positions..." : `${filteredJobs.length} open positions`}
        </p>
      </div>

      <Card className="flex flex-col sm:flex-row gap-3 p-3">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search by title or skill"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading || !!error}
            className="border-none focus:ring-0 bg-[var(--color-surface)]"
          />
        </div>
        <div className="sm:w-48">
          <Select
            icon={SlidersHorizontal}
            options={typeFilterOptions}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            disabled={loading || !!error}
            className="border-none bg-[var(--color-surface)]"
          />
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 rounded-[var(--radius-card)] bg-[var(--color-surface)] animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle size={24} className="text-[var(--color-error)]" />
          </div>
          <p className="text-[var(--color-text-secondary)] max-w-sm">{error}</p>
          <Button onClick={fetchJobs}>Try again</Button>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-[var(--color-text-secondary)]">
            {jobs.length === 0 ? "No jobs have been posted yet" : "No jobs match your search"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}