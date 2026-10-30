import axios from "axios";

const trainingApi = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, ""),
  timeout: 20000,
});

trainingApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

trainingApi.interceptors.response.use(
  (response) => response,
  (error) => {
    error.userMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Request failed.";
    return Promise.reject(error);
  }
);

// Accept an Axios config, a path for GET, or a method and path pair.
export async function trainingRequest(configOrMethod, pathOrConfig, data, extraConfig = {}) {
  let config;
  if (configOrMethod && typeof configOrMethod === "object") {
    config = { ...configOrMethod };
  } else if (typeof configOrMethod === "string" && configOrMethod.startsWith("/")) {
    config = { method: "GET", url: configOrMethod };
    if (pathOrConfig && typeof pathOrConfig === "object") config = { ...config, ...pathOrConfig };
  } else {
    config = { ...extraConfig, method: configOrMethod, url: pathOrConfig, data };
  }
  if (config.body !== undefined && config.data === undefined) {
    config.data = config.body;
    delete config.body;
  }
  const response = await trainingApi.request(config);
  return response.data;
}

export const trainingGet = (url, params = {}, config = {}) => trainingRequest({ ...config, method: "GET", url, params });
export const trainingPost = (url, data = {}, config = {}) => trainingRequest({ ...config, method: "POST", url, data });
export const trainingPut = (url, data = {}, config = {}) => trainingRequest({ ...config, method: "PUT", url, data });
export const trainingPatch = (url, data = {}, config = {}) => trainingRequest({ ...config, method: "PATCH", url, data });
export const trainingDelete = (url, config = {}) => trainingRequest({ ...config, method: "DELETE", url });

export const getTrainingDashboard = () => trainingGet("/training/dashboard");

export const instituteService = {
  getProfile: () => trainingGet("/training/institute/profile"),
  updateProfile: (payload) => trainingPut("/training/institute/profile", payload),
};

export const courseService = {
  list: (params = {}) => trainingGet("/training/courses", params),
  details: (id) => trainingGet(`/training/courses/${encodeURIComponent(id)}`),
  create: (payload, config) => trainingPost("/training/courses", payload, config),
  update: (id, payload, config) => trainingPut(`/training/courses/${encodeURIComponent(id)}`, payload, config),
  remove: (id) => trainingDelete(`/training/courses/${encodeURIComponent(id)}`),
};
export const courseCatalogService = { list: (params = {}) => trainingGet("/training/catalog/courses", params) };
export const curriculumService = {
  list: (courseId) => trainingGet(`/training/courses/${encodeURIComponent(courseId)}/curriculum`),
  create: (courseId, payload) => trainingPost(`/training/courses/${encodeURIComponent(courseId)}/curriculum`, payload),
  update: (courseId, itemId, payload) => trainingPut(`/training/courses/${encodeURIComponent(courseId)}/curriculum/${encodeURIComponent(itemId)}`, payload),
};
export const batchService = {
  list: (params = {}) => trainingGet("/training/batches", params),
  create: (payload, config) => trainingPost("/training/batches", payload, config),
  update: (id, payload, config) => trainingPut(`/training/batches/${encodeURIComponent(id)}`, payload, config),
};
export const instructorService = {
  list: (params = {}) => trainingGet("/training/instructors", params),
  create: (payload, config) => trainingPost("/training/instructors", payload, config),
  update: (id, payload, config) => trainingPut(`/training/instructors/${encodeURIComponent(id)}`, payload, config),
};
export const enrollmentService = {
  list: (params) => trainingGet("/training/enrollments", params),
  request: (payload) => trainingPost("/training/enrollments", payload),
  updateStatus: (id, status) => trainingPatch(`/training/enrollments/${encodeURIComponent(id)}/status`, { status }),
};
export const invoiceService = {
  list: (params = {}) => trainingGet("/training/invoices", params),
  create: (payload, config) => trainingPost("/training/invoices", payload, config),
};
export const certificateService = {
  list: (params) => trainingGet("/training/certificates", params),
  issue: (payload) => trainingPost("/training/certificates/issue", payload),
  verify: (code) => trainingGet(`/training/certificates/verify/${encodeURIComponent(code)}`),
};
export const reviewService = {
  list: (params = {}) => trainingGet("/training/reviews", params),
  updateStatus: (id, status) => trainingPatch(`/training/reviews/${encodeURIComponent(id)}`, { status }),
  remove: (id) => trainingDelete(`/training/reviews/${encodeURIComponent(id)}`),
};

// Compatibility aliases only for routes implemented by the backend.
export const trainingProfileApi = {
  get: instituteService.getProfile,
  update: instituteService.updateProfile,
};
export const trainingCoursesApi = courseService;
export const trainingCurriculumApi = curriculumService;
export const trainingCourseReviewsApi = reviewService;
export const trainingApplicationsApi = {
  list: (params = {}) => trainingGet("/training/applications", params),
  updateStatus: (id, status) => trainingPatch(`/training/applications/${encodeURIComponent(id)}/status`, { status }),
};
export const trainingStudentsApi = { list: (params = {}) => trainingGet("/training/students", params) };
export const trainingBatchesApi = batchService;
export const trainingInstructorsApi = instructorService;
export const trainingCertificatesApi = certificateService;
export const trainingCertificateVerificationApi = {
  verify: (params = {}) => params.code ? certificateService.verify(params.code) : trainingGet("/training/certificates"),
  issue: certificateService.issue,
};
export const trainingPaymentsApi = { list: (params = {}) => trainingGet("/training/payments", params) };
export const trainingFeesApi = { list: (params = {}) => trainingGet("/training/fees", params) };
export const trainingInvoicesApi = invoiceService;
export const trainingSettingsApi = { get: instituteService.getProfile, update: instituteService.updateProfile };

export default trainingApi;
