// authService.js — API placeholder for authentication endpoints

export const loginUser = async (email, role) => {
  // TODO: Replace with real API call
  return { success: true, email, role };
};

export const signupUser = async (formData) => {
  // TODO: Replace with real API call
  return { success: true, ...formData };
};

export const logoutUser = async () => {
  return { success: true };
};
