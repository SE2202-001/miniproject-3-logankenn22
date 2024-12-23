// Global variables
let jobs = []; // Original jobs data
let filteredJobs = []; // Filtered jobs

// Handle file upload and JSON parsing
document.getElementById("jsonFileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file || !file.name.endsWith(".json")) {
    alert("Please upload a valid JSON file.");
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      if (!Array.isArray(data) || data.length === 0) {
        alert("The JSON file is empty or not in the expected format.");
        return;
      }

      jobs = data.map((job) => new Job(job)); // Map JSON data to Job instances
      filteredJobs = [...jobs]; // Initialize filteredJobs with all jobs
      populateFilters(jobs); // Populate dropdown filters dynamically
      renderJobs(filteredJobs); // Display all jobs initially
    } catch (error) {
      alert("Failed to parse JSON: " + error.message);
    }
  };

  reader.onerror = () => {
    alert("Error reading the file. Please try again.");
  };

  reader.readAsText(file);
});

// Job class to encapsulate job details and formatting
class Job {
  constructor({
    "Job No": jobNo = "N/A",
    Title = "N/A",
    "Job Page Link": jobPageLink = "#",
    Posted = "N/A",
    Type = "N/A",
    Level = "N/A",
    "Estimated Time": estimatedTime = "N/A",
    Skill = "N/A",
    Detail = "N/A",
  }) {
    this.jobNo = jobNo;
    this.title = Title;
    this.jobPageLink = jobPageLink;
    this.posted = this.parsePostedTime(Posted); // Store as a normalized time format (minutes ago)
    this.type = Type;
    this.level = Level;
    this.estimatedTime = estimatedTime;
    this.skill = Skill;
    this.detail = Detail;
  }

  // Convert "X minutes/hours/days ago" into a unified time format (minutes)
  parsePostedTime(posted) {
    const [value, unit] = posted.split(" ");
    const timeValue = parseInt(value, 10);

    if (unit.includes("minute")) return timeValue;
    if (unit.includes("hour")) return timeValue * 60;
    if (unit.includes("day")) return timeValue * 1440; // 1 day = 1440 minutes

    return Infinity; // For invalid or unknown formats
  }

  // Format the normalized time back into a human-readable string
  getFormattedPostedTime() {
    const now = new Date();
    const postedDate = new Date(now.getTime() - this.posted * 60 * 1000);
    return postedDate.toLocaleString();
  }
}

// Populate dropdown filters dynamically
function populateFilters(jobs) {
  const levels = [...new Set(jobs.map((job) => job.level))];
  const types = [...new Set(jobs.map((job) => job.type))];
  const skills = [...new Set(jobs.map((job) => job.skill))];

  populateDropdown("filterLevel", levels);
  populateDropdown("filterType", types);
  populateDropdown("filterSkill", skills);
}

// Helper to populate a dropdown with options
function populateDropdown(dropdownId, items) {
  const dropdown = document.getElementById(dropdownId);
  dropdown.innerHTML = '<option value="All">All</option>'; // Reset dropdown
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    dropdown.appendChild(option);
  });
}

// Handle filtering logic
document.getElementById("filterBtn").addEventListener("click", () => {
  const selectedLevel = document.getElementById("filterLevel").value;
  const selectedType = document.getElementById("filterType").value;
  const selectedSkill = document.getElementById("filterSkill").value;

  // Apply filters to the original jobs array
  filteredJobs = jobs
    .filter((job) => selectedLevel === "All" || job.level === selectedLevel)
    .filter((job) => selectedType === "All" || job.type === selectedType)
    .filter((job) => selectedSkill === "All" || job.skill === selectedSkill);

  renderJobs(filteredJobs);
});

// Render job list dynamically
function renderJobs(jobsToRender) {
  const jobList = document.getElementById("jobList");
  jobList.innerHTML = ""; // Clear the current job list

  if (jobsToRender.length === 0) {
    renderEmptyState(jobList);
    return;
  }

  jobsToRender.forEach((job) => {
    const listItem = document.createElement("li");
    listItem.className = "job-item";

    // Add job details, including a link to the job page
    listItem.innerHTML = `
      <strong>${job.title}</strong> - ${job.type} (${job.level})<br>
      <em>Posted:</em> ${job.getFormattedPostedTime()}<br>
      <a href="${job.jobPageLink}" target="_blank">View Job</a>
    `;

    // Attach click event to show job details in the modal
    listItem.addEventListener("click", () => showJobDetails(job));

    jobList.appendChild(listItem);
  });
}

// Render an empty state when no jobs are available
function renderEmptyState(container) {
  container.innerHTML = "<p>No jobs available matching your criteria.</p>";
}

// Show job details in a modal
function showJobDetails(job) {
  const modal = document.getElementById("jobModal");
  const overlay = document.getElementById("modalOverlay");

  document.getElementById("modalTitle").textContent = job.title;
  document.getElementById("modalDetails").innerHTML = `
    <p><strong>Job No:</strong> ${job.jobNo}</p>
    <p><strong>Type:</strong> ${job.type}</p>
    <p><strong>Level:</strong> ${job.level}</p>
    <p><strong>Estimated Time:</strong> ${job.estimatedTime}</p>
    <p><strong>Skill:</strong> ${job.skill}</p>
    <p><strong>Details:</strong> ${job.detail}</p>
    <p><strong>Posted:</strong> ${job.getFormattedPostedTime()}</p>
    <p><a href="${job.jobPageLink}" target="_blank">View Job Page</a></p>
  `;

  modal.style.display = "block";
  overlay.style.display = "block";

  overlay.onclick = closeModal;
  document.getElementById("closeModalBtn").onclick = closeModal;
}

// Close the job details modal
function closeModal() {
  document.getElementById("jobModal").style.display = "none";
  document.getElementById("modalOverlay").style.display = "none";
}

// Handle sorting logic
document.getElementById("sortBtn").addEventListener("click", () => {
  const sortBy = document.getElementById("sortBy").value;

  // Sort the currently filtered jobs
  if (sortBy === "Title (A-Z)") {
    filteredJobs.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "Title (Z-A)") {
    filteredJobs.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sortBy === "Posted Time (Newest First)") {
    filteredJobs.sort((a, b) => a.posted - b.posted); // Newest first
  } else if (sortBy === "Posted Time (Oldest First)") {
    filteredJobs.sort((a, b) => b.posted - a.posted); // Oldest first
  }

  renderJobs(filteredJobs); // Render the sorted jobs
});
