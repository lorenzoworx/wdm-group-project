// export const checkValidData = (name,email, Password) => {

//     const isNameValid = /^[a-zA-Z\s]+$/.test(name);
//     const isEmailValid = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
//     const isPasswordValid = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(Password);
//     if (!isEmailValid) return "Email ID is not valid";
//     if (!isPasswordValid) return "Password is not valid";
//     if(!isNameValid) return "Enter valid name";
//     return null;
// }

export const checkValidData = (name, email, password) => {
  // If `name` is not provided we assume this is a login check (not signup).
  // Login should only require a valid email and a non-empty password.
  const isLogin = !name;
  const isNameValid = name ? /^[a-zA-Z\s]+$/.test(name) : true; // only validate if name is provided
  const isEmailValid = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
  const isPasswordValid = isLogin
    ? Boolean(password && password.length > 0)
    : /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password);

  if (!isEmailValid) return "Email ID is not valid";
  if (!isPasswordValid) return isLogin ? "Please enter your password" : "Password is not valid";
  if (!isNameValid) return "Enter valid name";
  return null;
};
