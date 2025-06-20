import axios from 'axios';

const API_URL_PREFIX = process.env.API_URL_PREFIX;

export const employeeLoginAPI = (data: { email: string; password: string }) => {
  console.log(`---> ${API_URL_PREFIX}/api/token/`);
  return axios.post(`${API_URL_PREFIX}/api/token/`, data);
};

export const refreshLoginTokenAPI = (data: { refresh: string }) => {
  return axios.post(`${API_URL_PREFIX}/api/token/refresh/`, data);
};

export const getUserProfileDataAPI = async (token: string) => {
  return axios.get(`${API_URL_PREFIX}/api/user/profile/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createProjectAPI = (
  data: {
    title: string;
    github_repo?: string;
    description?: string;
    employees: string[];
    clients: string[];
    channel_clients: string[];
    channel_employees: string[];
  },
  token: string
) => {
  return axios.post(
    `${API_URL_PREFIX}/api/project-management/create-project/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getAllGithubRepos = (token: string) => {
  return axios.get(
    `${API_URL_PREFIX}/api/project-management/project-github-repos/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const projectMemberAPI = (data: any, token: string) => {
  return axios.post(
    `${API_URL_PREFIX}/api/project-management/add-remove-project-member/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getAllEmployeesAPI = (token: string) => {
  return axios.get(`${API_URL_PREFIX}/api/project-management/all-employees/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getAllClientsAPI = (token: string) => {
  return axios.get(`${API_URL_PREFIX}/api/project-management/all-clients/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getAllBusinessClientsAPI = (token: string) => {
  return axios.get(
    `${API_URL_PREFIX}/api/project-management/all-business-clients/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getAllProjectsAPI = (token: string) => {
  return axios.get(`${API_URL_PREFIX}/api/project-management/projects/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getAllChatsAPI = (token: string) => {
  return axios.get(`${API_URL_PREFIX}/api/project-management/chats/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getChatMessagesAPI = (chatId: string, token: string) => {
  return axios.get(
    `${API_URL_PREFIX}/api/project-management/chat-messages/${chatId}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const updateChatGroupAPI = (
  chatId: string,
  emails: string[],

  token: string
) => {
  return axios.patch(
    `${API_URL_PREFIX}/api/project-management/chat/${chatId}/`,
    {
      emails,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const updateChatDirectPermissionAPI = (
  chatId: string,
  allowDirectChat: boolean,
  token: string
) => {
  return axios.put(
    `${API_URL_PREFIX}/api/project-management/chat/${chatId}/`,
    {
      allow_direct_chat: allowDirectChat,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const createDirectChatAPI = (
  chatId: string,
  email: string,
  token: string
) => {
  return axios.post(
    `${API_URL_PREFIX}/api/project-management/direct-chat/${chatId}/`,
    {
      email: email,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getProjectAPI = (projectId: string, token: string) => {
  return axios.get(
    `${API_URL_PREFIX}/api/project-management/get-project/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const updateProjectAPI = (id: string, token: string, data: any) => {
  return axios.put(
    `${API_URL_PREFIX}/api/project-management/update-project/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const deleteProjectAPI = (id: string, token: string) => {
  return axios.delete(
    `${API_URL_PREFIX}/api/project-management/project/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getProjectEmployeeRolesAPI = (
  projectId: string,
  token: string
) => {
  return axios.get(
    `${API_URL_PREFIX}/api/project-management/project-employee-roles/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const addRemoveProjectMemberAPI = (data: any, token: string) => {
  return axios.post(
    `${API_URL_PREFIX}/api/project-management/add-remove-project-member/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const assignProjectEmployeeRoleAPI = (data: any, token: string) => {
  return axios.post(
    `${API_URL_PREFIX}/api/project-management/assign-project-employee-role/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const uploadProjectResourceAPI = (data: any, token: string) => {
  return axios.post(
    `${API_URL_PREFIX}/api/project-management/project-resource/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

export const getProjectResourcesAPI = (projectId: string, token: string) => {
  return axios.get(
    `${API_URL_PREFIX}/api/project-management/project-resources/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const deleteProjectResourceAPI = (resourceId: string, token: string) => {
  return axios.delete(
    `${API_URL_PREFIX}/api/project-management/project-resource/${resourceId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const createProjectTaskAPI = (data: any, token: string) => {
  return axios.post(
    `${API_URL_PREFIX}/api/project-management/project-task/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getProjectAllTasksAPI = (projectId: string, token: string) => {
  return axios.get(
    `${API_URL_PREFIX}/api/project-management/project-all-tasks/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const deleteProjectTaskAPI = (taskId: string, token: string) => {
  return axios.delete(
    `${API_URL_PREFIX}/api/project-management/delete-project-task/${taskId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const updateProjectTaskAPI = (id: string, data: any, token: string) => {
  return axios.put(
    `${API_URL_PREFIX}/api/project-management/update-project-task/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const createProjectTaskStatusAPI = (data: any, token: string) => {
  return axios.post(
    `${API_URL_PREFIX}/api/project-management/project-task-status/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getProjectAttachmentsAPI = (pid: any, token: string) => {
  return axios.get(
    `${API_URL_PREFIX}/api/project-management/project-attachments/${pid}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// employee apis
export const getEmployeeAllProjectsAPI = (token: string) => {
  return axios.get(
    `${API_URL_PREFIX}/api/project-management/employee-all-projects/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getEmployeeAllProjectsWithTasksAPI = (token: string) => {
  return axios.get(
    `${API_URL_PREFIX}/api/project-management/employee-all-projects-with-tasks/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getEmployeeProjectAPI = (projectId: string, token: string) => {
  return axios.get(
    `${API_URL_PREFIX}/api/project-management/get-employee-project/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const todayCheckInCheckOutAPI = (token: string) => {
  return axios.get(
    `${API_URL_PREFIX}/api/project-management/get-today-checkin-checkout-details/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const todayCheckInAPI = (data: any, token: string) => {
  return axios.post(
    `${API_URL_PREFIX}/api/project-management/today-checkin/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const todayCheckOutAPI = (data: any, token: string) => {
  return axios.post(
    `${API_URL_PREFIX}/api/project-management/today-checkout/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getCheckInCheckOutsAPI = (token: string) => {
  return axios.get(
    `${API_URL_PREFIX}/api/project-management/checkins-checkouts/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// task documentation

export const createTaskDocumentationAPI = (data: any, token: string) => {
  return axios.post(
    `${API_URL_PREFIX}/api/project-management/project-task-documentation/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getTasksDocumentationsAPI = (token: string) => {
  return axios.get(
    `${API_URL_PREFIX}/api/project-management/all-project-task-documentations/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const updateTaskDocumentationAPI = (
  data: any,
  docId: string,
  token: string
) => {
  return axios.put(
    `${API_URL_PREFIX}/api/project-management/project-task-documentation/${docId}/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const deleteTaskDocumentationAPI = (docId: string, token: string) => {
  return axios.delete(
    `${API_URL_PREFIX}/api/project-management/project-task-documentation/${docId}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const sendEmployeeSignupInvitationAPI = (data: any, token: string) => {
  return axios.post(
    `${API_URL_PREFIX}/api/project-management/send-employee-signup-invitation/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const sendClientSignupInvitationAPI = (data: any, token: string) => {
  return axios.post(
    `${API_URL_PREFIX}/api/project-management/send-client-signup-invitation/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getProjectEmployeeTasksAPI = (
  projectId: string,
  token: string
) => {
  return axios.get(
    `${API_URL_PREFIX}/api/project-management/project-employee-tasks/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getEmployeeAttendanceAPI = (id: string, token: string) => {
  return axios.get(
    `${API_URL_PREFIX}/api/project-management/employee-attendance/${id}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const employeeAccountSignupAPI = (data: any) => {
  return axios.post(
    `${API_URL_PREFIX}/api/project-management/employee-account-signup/`,
    data
  );
};

export const clientAccountSignupAPI = (data: any) => {
  return axios.post(
    `${API_URL_PREFIX}/api/project-management/client-account-signup/`,
    data
  );
};

export const getEmployeeSignupInvitationAPI = (code: any) => {
  return axios.get(
    `${API_URL_PREFIX}/api/project-management/get-employee-signup-invitation/invitation-code=${code}`
  );
};

export const getClientSignupInvitationAPI = (code: any) => {
  return axios.get(
    `${API_URL_PREFIX}/api/project-management/get-client-signup-invitation/invitation-code=${code}`
  );
};

export const getClientAllProjectsAPI = (token: string) => {
  return axios.get(
    `${API_URL_PREFIX}/api/project-management/client-all-projects/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const inviteGuestAPI = (
  email: string,
  token: string,
  chatId: string
) => {
  return axios.patch(
    `${API_URL_PREFIX}/api/project-management/invite-guest/${chatId}/`,
    { email: email },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getUserId = (email: string) => {
  return axios.post(`${API_URL_PREFIX}/api/user/get-user-id/`, {
    email: email,
  });
};

export const getGitHubLoginURL = (token: string) => {
  return axios.get(`${API_URL_PREFIX}/api/project-management/github-login/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getGitHubTokenExchangeURL = (code: string, token: string) => {
  return axios.get(
    `${API_URL_PREFIX}/api/project-management/github-token-exchange/?code=${code}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const checkCommitTaskDocumentationAPI = (data: any, token: string) => {
  return axios.get(
    `${API_URL_PREFIX}/api/project-management/task-documentation-check-commit/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: data,
    }
  );
};
