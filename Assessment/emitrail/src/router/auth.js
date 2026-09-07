// Get all registered users from localStorage
export const getUsers = () => {
  const users = localStorage.getItem('emitrailUsers')

  return users ? JSON.parse(users) : []
}

// Save all users into localStorage
export const saveUsers = (users) => {
  localStorage.setItem('emitrailUsers', JSON.stringify(users))
}

// Register a new user
export const registerUser = (name, email, password) => {
  const users = getUsers()

  const existingUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase())

  if (existingUser) {
    return {
      success: false,
      message: 'An account with this email already exists.',
    }
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    role: 'user',
  }

  users.push(newUser)
  saveUsers(users)

  return {
    success: true,
    message: 'Account created successfully.',
  }
}

// Login an existing user
export const loginUser = (email, password) => {
  const users = getUsers()

  const user = users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password,
  )

  if (!user) {
    return {
      success: false,
      message: 'Invalid email or password.',
    }
  }

  localStorage.setItem('emitrailCurrentUser', JSON.stringify(user))

  return {
    success: true,
    user,
  }
}

// Get the currently logged-in user
export const getCurrentUser = () => {
  const user = localStorage.getItem('emitrailCurrentUser')

  return user ? JSON.parse(user) : null
}

// Logout the current user
export const logoutUser = () => {
  localStorage.removeItem('emitrailCurrentUser')
}
