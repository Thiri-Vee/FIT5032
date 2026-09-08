// Get all registered users from localStorage
// Get registered users and create a default admin account
export const getUsers = () => {
  const storedUsers = localStorage.getItem('emitrailUsers')
  const users = storedUsers ? JSON.parse(storedUsers) : []

  const adminExists = users.some((user) => user.email === 'admin@emitrail.com')

  // Add a default admin account if it does not exist
  if (!adminExists) {
    users.push({
      id: 'admin-1',
      name: 'Emitrail Admin',
      email: 'admin@emitrail.com',
      password: 'admin123',
      role: 'admin',
    })

    localStorage.setItem('emitrailUsers', JSON.stringify(users))
  }

  return users
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
