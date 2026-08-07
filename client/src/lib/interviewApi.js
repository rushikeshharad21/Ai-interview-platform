import api from "./api.js";

export const getMyInterviewsAsCandidate = async () => {
  const response = await api.get("/interviews/candidate/my");
  return response.data;
};

export const getMyInterviewsAsRecruiter = async () => {
  const response = await api.get("/interviews/recruiter/my");
  return response.data;
};

export const getInterviewById = async (interviewId) => {
  const response = await api.get(`/interviews/${interviewId}`);
  return response.data;
};

export const scheduleInterview = async (payload) => {
  const response = await api.post("/interviews", payload);
  return response.data;
};

export const updateInterviewStatus = async (interviewId, status) => {
  const response = await api.patch(`/interviews/${interviewId}/status`, { status });
  return response.data;
};

export const generateQuestions = async (interviewId) => {
  const response = await api.post(`/interviews/${interviewId}/generate-questions`);
  return response.data;
};

export const updateQuestions = async (interviewId, questions) => {
  const response = await api.patch(`/interviews/${interviewId}/questions`, { questions });
  return response.data;
};

export const saveEmotionSample = async (interviewId, questionIndex, questionText, emotion) => {
  const response = await api.post(`/interviews/${interviewId}/emotions`, {
    questionIndex,
    questionText,
    emotion,
  });
  return response.data;
};

export const saveTranscript = async (interviewId, questionIndex, questionText, transcript) => {
  const response = await api.post(`/interviews/${interviewId}/transcript`, {
    questionIndex,
    questionText,
    transcript,
  });
  return response.data;
};